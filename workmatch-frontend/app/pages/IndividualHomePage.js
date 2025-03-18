import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';

const IndividualHomePage = () => {
    const navigation = useNavigation();
    const [jobOffers, setJobOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [userType, setUserType] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            setUserId(storedUserId);
            console.log("👤 ID utilisateur récupéré :", storedUserId);
        };

        const fetchJobOffers = async () => {
            try {
                setIsLoading(true);
                const token = await AsyncStorage.getItem('userToken');
                const swiperId = await AsyncStorage.getItem("userId");

                if (!token || !swiperId) {
                    console.error("❌ Token ou swiperId manquant !");
                    setIsLoading(false);
                    return;
                }

                console.log("📡 Récupération des offres d'emploi filtrées...");

                // 🔹 1. Récupère toutes les offres
                const response = await axios.get(`http://localhost:8080/joboffers/user/${swiperId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const allJobOffers = response.data;
                console.log("📋 Toutes les offres récupérées :", allJobOffers);

                // 🔹 2. Récupère toutes les offres déjà swipées
                const swipedResponse = await axios.get(`http://localhost:8080/api/swiped/${swiperId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const swipedData = swipedResponse.data;
                console.log("🛑 Offres déjà swipées :", swipedData);

                // 🔹 3. Transforme les IDs en String pour assurer la compatibilité
                const swipedIds = new Set(swipedData.map(item => item.swipedId.toString()));
                console.log("🛑 Swiped IDs Set :", swipedIds);

                // 🔹 4. Filtrage des offres déjà swipées
                const filteredJobOffers = allJobOffers.filter(offer => !swipedIds.has(offer._id.toString()));

                console.log("✅ Liste des offres après filtrage :", filteredJobOffers);

                // 🔹 5. Garde uniquement les offres uniques
                const uniqueJobOffers = filteredJobOffers.reduce((acc, offer) => {
                    if (!acc.some(o => o._id === offer._id)) acc.push(offer);
                    return acc;
                }, []);

                console.log("📜 IDs des offres uniques après filtrage :", uniqueJobOffers.map(o => o._id));

                // 🔹 5. Récupérer les entreprises qui ont déjà swipé l'utilisateur à gauche (hors redirection)
                const blockedByCompanies = new Set();
                for (const offer of uniqueJobOffers) {
                    const companyId = offer.companyId || offer.company?.id;
                    if (!companyId) continue;

                    try {
const companySwipeResponse = await axios.get(
            `http://localhost:8080/api/swiped/checkCompanySwipe?companyId=${companyId}&userId=${swiperId}&jobOfferId=${offer._id}`, // ✅ Ajout du jobOfferId
            { headers: { Authorization: `Bearer ${token}` } }
        );
                        if (companySwipeResponse.data.exists) {
                            console.log(`❌ Offre ${offer._id} bloquée : L'entreprise ${companyId} a déjà swipé ce user sur CETTE offre.`);
                            blockedByCompanies.add(offer._id.toString());
                        }
                    } catch (error) {
                        console.error(`⚠️ Erreur lors de la vérification des swipes de la company ${companyId}:`, error);
                    }
                }

                // 🔹 6. Appliquer le filtre final avant de mettre à jour jobOffers
                const finalJobOffers = uniqueJobOffers.filter(offer => !blockedByCompanies.has(offer._id.toString()));

                console.log("✅ Liste finale des offres après filtre entreprise :", finalJobOffers);

                // 🔹 7. Mise à jour du state (on garde uniquement les offres non bloquées)
                setJobOffers(finalJobOffers);
            } catch (error) {
                console.error('❌ Error fetching job offers:', error);
            } finally {
                setIsLoading(false);
            }
        };


        fetchUserData();
        fetchJobOffers();
    }, []);


    const handleSwipeRight = async (index) => {
        const swipedJobOffer = jobOffers[index];

        if (!swipedJobOffer) {
            console.error("❌ Aucun job offer trouvé pour cet index.");
            return;
        }

        console.log("🟢 Job Offer sélectionnée:", swipedJobOffer);

        const swipedId = swipedJobOffer._id;
        const companyId = swipedJobOffer.companyId || swipedJobOffer.company?.id;
        const swiperId = await AsyncStorage.getItem("userId");

        if (!swiperId || !swipedId || !companyId) {
            console.error("❌ swiperId, swipedId ou companyId est manquant !");
            console.log("📌 swiperId:", swiperId);
            console.log("📌 swipedId:", swipedId);
            console.log("📌 companyId:", companyId);
            return;
        }

        console.log("✅ swiperId envoyé :", swiperId);
        console.log("✅ swipedId envoyé :", swipedId);
        console.log("✅ companyId envoyé :", companyId);

        const direction = "right";

        try {
            const token = await AsyncStorage.getItem('userToken');

            console.log("🔑 Token utilisé pour la requête :", token);
            console.log("📡 Données envoyées à /api/matches/swipe/individual :", {
                swiperId,
                swipedId,
                companyId
            });

            const response = await axios.post(
                "http://localhost:8080/api/matches/swipe/individual",
                { swiperId, swipedId, companyId },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

            await axios.post(
                "http://localhost:8080/api/swiped/save",
                { swiperId, swipedId, direction },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );
            const matchResponse = await axios.post(
                "http://localhost:8080/api/matches/match",
                { swiperId, swipedId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("🟢 Réponse match :", matchResponse.data);

            console.log("✅ Réponse serveur :", response.data);
        } catch (error) {
            console.error('❌ Erreur lors du swipe:', error);
        }
    };


    const handleSwipeLeft = async (index) => {
        const swipedJobOffer = jobOffers[index];

        if (!swipedJobOffer) {
            console.error("❌ Aucun job offer trouvé pour cet index.");
            return;
        }

        console.log("🔴 Job Offer ignorée:", swipedJobOffer);

        const swipedId = swipedJobOffer._id;
        const companyId = swipedJobOffer.companyId?.toString();
        const swiperId = await AsyncStorage.getItem("userId");

        if (!swiperId || !swipedId || !companyId) {
            console.error("❌ swiperId, swipedId ou companyId est manquant !");
            console.log("📌 swiperId:", swiperId);
            console.log("📌 swipedId:", swipedId);
            console.log("📌 companyId:", companyId);
            return;
        }

        console.log("✅ swiperId envoyé :", swiperId);
        console.log("✅ swipedId envoyé :", swipedId);
        console.log("✅ companyId envoyé :", companyId);

        const direction = "left";

        try {
            const token = await AsyncStorage.getItem('userToken');

            console.log("🔑 Token utilisé pour la requête :", token);

            await axios.post(
                "http://localhost:8080/api/swiped/save",
                { swiperId, swipedId, direction },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

            const matchResponse = await axios.post(
                "http://localhost:8080/api/matches/match",
                { swiperId, swipedId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("✅ Swipe à gauche enregistré avec succès !");
        } catch (error) {
            console.error('❌ Erreur lors du swipe gauche:', error);
        }
    };


    return (
         <View style={styles.container}>
             <View style={styles.topButtons}>
                 <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                 <Button title="Main Menu" onPress={() => navigation.navigate('IndividualHome')} />
                 <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                 <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
             </View>

             <View style={styles.swiperContainer}>
                 {isLoading ? (
                     <Text>Loading...</Text>
                 ) : jobOffers.length === 0 ? (
                     <Text style={styles.noOffers}>Aucune offre disponible</Text>
                 ) : (
                     <Swiper
                         key={jobOffers.length}
                         cards={jobOffers}
                         renderCard={(offer) => (
                             <View key={offer._id} style={styles.card}>
                                 <Text style={styles.cardTitle}>{offer.title || "Titre indisponible"}</Text>
                                 <Text style={styles.cardDescription}>
                                     {offer.description
                                         ? offer.description.length > 150
                                             ? `${offer.description.slice(0, 150)}...`
                                             : offer.description
                                         : "Description indisponible"}
                                 </Text>
                             </View>
                         )}
                         onSwipedRight={(cardIndex) => handleSwipeRight(cardIndex)}
                         onSwipedLeft={(cardIndex) => handleSwipeLeft(cardIndex)}
                         cardIndex={0}
                         backgroundColor={'#f3f3f3'}
                         stackSize={Math.min(jobOffers.length, 3)}
                         infinite={false}
                     />
                 )}
             </View>
         </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 20,
        marginBottom: 10,
        zIndex: 1,
    },
    swiperContainer: {
        flex: 1,
        marginTop: 10,
    },
    card: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 20,
        marginHorizontal: 10,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
    },
    cardDescription: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
    },
});

export default IndividualHomePage;
