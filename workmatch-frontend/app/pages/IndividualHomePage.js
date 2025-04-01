import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
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
            console.log("ID utilisateur récupéré :", storedUserId);
        };

        const fetchJobOffers = async () => {
            try {
                setIsLoading(true);
                const token = await AsyncStorage.getItem('userToken');
                const swiperId = await AsyncStorage.getItem("userId");

                if (!token || !swiperId) {
                    console.error("Token ou swiperId manquant !");
                    setIsLoading(false);
                    return;
                }

                console.log("📡 Récupération des offres d'emploi filtrées...");

                //Récupère toutes les offres
                const response = await axios.get(`http://localhost:8080/joboffers/user/${swiperId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const allJobOffers = response.data;
                console.log("Toutes les offres récupérées :", allJobOffers);

                //Récupère toutes les offres déjà swipées
                const swipedResponse = await axios.get(`http://localhost:8080/api/swiped/${swiperId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const swipedData = swipedResponse.data;
                console.log("Offres déjà swipées :", swipedData);

                //Transforme les IDs en String pour assurer la compatibilité
                const swipedIds = new Set(swipedData.map(item => item.swipedId.toString()));
                console.log("Swiped IDs Set :", swipedIds);

                //Filtrage des offres déjà swipées
                const filteredJobOffers = allJobOffers.filter(offer => !swipedIds.has(offer._id.toString()));

                console.log("✅ Liste des offres après filtrage :", filteredJobOffers);

                //Garde uniquement les offres uniques
                const uniqueJobOffers = filteredJobOffers.reduce((acc, offer) => {
                    if (!acc.some(o => o._id === offer._id)) acc.push(offer);
                    return acc;
                }, []);

                console.log("IDs des offres uniques après filtrage :", uniqueJobOffers.map(o => o._id));

                //Récupérer les entreprises qui ont déjà swipé l'utilisateur à gauche sur une offre spécifique
                const blockedByCompaniesForSpecificOffers = new Set();
                for (const offer of uniqueJobOffers) {
                    const companyId = offer.companyId?.toString() || offer.company?.id?.toString();
                    if (!companyId) continue;

                    try {
                        const companySwipeResponse = await axios.get(
                            `http://localhost:8080/api/swiped/checkCompanySwipe?companyId=${companyId}&userId=${swiperId}&jobOfferId=${offer._id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (companySwipeResponse.data.exists) {
                            console.log(` Offre ${offer._id} bloquée : L'entreprise ${companyId} a déjà swipé ce user sur CETTE offre.`);
                            blockedByCompaniesForSpecificOffers.add(offer._id.toString());
                        }
                    } catch (error) {
                        console.error(`Erreur lors de la vérification des swipes de la company ${companyId}:`, error);
                    }
                }

                //Récupérer les entreprises qui ont swipé l'utilisateur à gauche DANS LA PAGE NORMALE
                const blockedByCompaniesForAllOffers = new Set();
                for (const offer of uniqueJobOffers) {
                const companyId = offer.companyId?.toString() || offer.company?.id?.toString();
                    if (!companyId) continue;

                    try {
                        const companySwipeResponse = await axios.get(
                            `http://localhost:8080/api/swiped/checkCompanySwipeNormal?companyId=${companyId}&userId=${swiperId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (companySwipeResponse.data.exists) {
                            console.log(` Toutes les offres de l'entreprise ${companyId} sont bloquées car elle a déjà swipé ce user.`);
                            blockedByCompaniesForAllOffers.add(companyId);
                        }
                    } catch (error) {
                        console.error(`Erreur lors de la vérification des swipes normaux de la company ${companyId}:`, error);
                    }
                }

                //Appliquer le filtre final avant de setter jobOffers
                const finalJobOffers = uniqueJobOffers.filter(
                    offer => !blockedByCompaniesForSpecificOffers.has(offer._id.toString()) &&
                             !blockedByCompaniesForAllOffers.has(offer.companyId)
                );

                console.log("Liste finale des offres après TOUS les filtres :", finalJobOffers);

                //Mise à jour du state (on garde uniquement les offres non bloquées)
                setJobOffers(finalJobOffers);

            } catch (error) {
                console.error(' Error fetching job offers:', error);
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
            console.error("Aucun job offer trouvé pour cet index.");
            return;
        }

        console.log("🟢 Job Offer sélectionnée:", swipedJobOffer);

        const swipedId = swipedJobOffer._id;
        const swiperId = await AsyncStorage.getItem("userId");
        const companyId = swipedJobOffer.companyId?.$oid || swipedJobOffer.companyId || swipedJobOffer.company?.id;

        if (!swiperId || !swipedId || !companyId) {
            console.error(" swiperId, swipedId ou companyId est manquant !");
            console.log(" swiperId:", swiperId);
            console.log(" swipedId:", swipedId);
            console.log(" companyId:", companyId);
            return;
        }

        console.log("swiperId envoyé :", swiperId);
        console.log("swipedId envoyé :", swipedId);
        console.log("companyId envoyé :", companyId);

        const direction = "right";

        try {
            const token = await AsyncStorage.getItem('userToken');

            console.log("Token utilisé pour la requête :", token);
            console.log("Données envoyées à /api/matches/swipe/individual :", {
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

            console.log(" Réponse match :", matchResponse.data);

            console.log(" Réponse serveur :", response.data);
        } catch (error) {
            console.error('Erreur lors du swipe:', error);
        }
    };


    const handleSwipeLeft = async (index) => {
        const swipedJobOffer = jobOffers[index];

        if (!swipedJobOffer) {
            console.error("Aucun job offer trouvé pour cet index.");
            return;
        }

        console.log(" Job Offer ignorée:", swipedJobOffer);

        const swipedId = swipedJobOffer._id;
        const companyId = swipedJobOffer.companyId?.toString();
        const swiperId = await AsyncStorage.getItem("userId");

        if (!swiperId || !swipedId || !companyId) {
            console.error(" swiperId, swipedId ou companyId est manquant !");
            console.log(" swiperId:", swiperId);
            console.log(" swipedId:", swipedId);
            console.log(" companyId:", companyId);
            return;
        }

        console.log("swiperId envoyé :", swiperId);
        console.log("swipedId envoyé :", swipedId);
        console.log("companyId envoyé :", companyId);

        const direction = "left";

        try {
            const token = await AsyncStorage.getItem('userToken');

            console.log(" Token utilisé pour la requête :", token);

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

            console.log(" Swipe à gauche enregistré avec succès !");
        } catch (error) {
            console.error(' Erreur lors du swipe gauche:', error);
        }
    };


    return (
         <View style={styles.container}>
             <View style={styles.topButtons}>
               <TouchableOpacity style={[styles.navButton, { backgroundColor: '#3b82f6' }]} onPress={() => navigation.navigate('ProfilePage')}>
                 <Text style={styles.navButtonText}>Profile</Text>
               </TouchableOpacity>

               <TouchableOpacity style={[styles.navButton, { backgroundColor: '#60a5fa' }]} onPress={() => navigation.navigate('IndividualHome')}>
                 <Text style={styles.navButtonText}>Main Menu</Text>
               </TouchableOpacity>

               <TouchableOpacity style={[styles.navButton, { backgroundColor: '#93c5fd' }]} onPress={() => navigation.navigate('ChatPage')}>
                 <Text style={styles.navButtonText}>Chat</Text>
               </TouchableOpacity>

               <TouchableOpacity style={[styles.navButton, { backgroundColor: '#bfdbfe' }]} onPress={() => navigation.navigate('LikedOffersPage')}>
                 <Text style={styles.navButtonText}>Liked Offers</Text>
               </TouchableOpacity>

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
                         backgroundColor={'#0f172a'}
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
        backgroundColor: '#0f172a',
    },
    topButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 20,
    },
    navButton: {
      backgroundColor: '#1e3a8a',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    swiperContainer: {
        flex: 1,
        marginTop: 10,
    },
    card: {
      height: 440,
      backgroundColor: '#334155',
      borderRadius: 20,
      padding: 24,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 10,
      borderWidth: 1,
      borderColor: '#475569',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 12,
      textAlign: 'center',
    },
    text1: {
      color: '#ffffff',
    },
    cardDescription: {
      fontSize: 14,
      color: '#ffffff',
      textAlign: 'center',
      lineHeight: 20,
    },
    noOffers: {
      color: '#ffffff',
      textAlign: 'center',
      fontSize: 16,
      marginTop: 20,
    },

});

export default IndividualHomePage;
