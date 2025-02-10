import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';
import { useRoute } from '@react-navigation/native';

const CompanyHomePage = () => {
    const navigation = useNavigation();
    const [jobSearchers, setJobSearchers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState('');
    const [conversations, setConversations] = useState([]);
    const route = useRoute();
    const { selectedOffer } = route.params || {};  // ✅ Récupère l'offre sélectionnée
    const [matchingJobSearchers, setMatchingJobSearchers] = useState([]);

    useEffect(() => {
        if (selectedOffer) {
            fetchMatchingCandidates(selectedOffer);
        } else {
            fetchJobSearchers();
        }
    }, [selectedOffer]);


    const fetchMatchingCandidates = async (jobOffer) => {
        if (!jobOffer || !jobOffer._id) {
            console.error("❌ Erreur : jobOffer ou son ID est invalide !");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("userToken");
            console.log("📡 Chargement des candidats pour :", jobOffer.title);

            const response = await axios.get(`http://localhost:8080/jobsearchers/matching?jobOfferId=${jobOffer._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMatchingJobSearchers(response.data);
            console.log("✅ Candidats correspondants :", response.data);
        } catch (error) {
            console.error("❌ Erreur lors du chargement des candidats :", error);
        } finally {
            setIsLoading(false);
        }
    };


    /*useEffect(() => {
        if (selectedOffer && selectedOffer._id) {
            console.log("✅ selectedOffer détecté :", selectedOffer);
            fetchMatchingCandidates(selectedOffer);
        } else {
            console.warn("⚠️ Aucun selectedOffer ou ID invalide !");
        }
    }, [selectedOffer]);
*/

const fetchJobSearchers = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const swiperId = await AsyncStorage.getItem("userId");
            if (!token || !swiperId) {
                console.error("❌ Token ou swiperId manquant !");
                return;
            }

            console.log("🔑 JWT Token récupéré :", token);

            // 1️⃣ Récupération de tous les job searchers
            const response = await axios.get('http://localhost:8080/jobsearchers', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allJobSearchers = response.data;

            // 2️⃣ Récupération des swipedCards pour cet utilisateur
            const swipedResponse = await axios.get(`http://localhost:8080/api/swiped/${swiperId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const swipedData = swipedResponse.data;
            const swipedIds = new Set(swipedData.map(item => item.swipedId));

            // 3️⃣ Filtrer les job searchers en excluant ceux déjà swipés
            const filteredJobSearchers = allJobSearchers.filter(jobSearcher => !swipedIds.has(jobSearcher.id));

            setJobSearchers(filteredJobSearchers);
            console.log("✅ Liste des job searchers après filtrage :", filteredJobSearchers);
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des job searchers:', error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        const fetchUserType = async () => {
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);
        };

        fetchUserType();
    }, []);

    const handleSwipeRight = async (index) => {
        const swipedJobSearcher = selectedOffer ? matchingJobSearchers[index] : jobSearchers[index];

        //const swipedJobSearcher = jobSearchers[index];
        if (!swipedJobSearcher) {
            console.error("❌ Aucun job searcher trouvé pour cet index.");
            return;
        }

        const swipedId = swipedJobSearcher.id;
        const swiperId = await AsyncStorage.getItem("userId");

        if (!swiperId || !swipedId) {
            console.error("❌ swiperId ou swipedId est manquant !");
            return;
        }

        console.log("✅ swiperId envoyé :", swiperId);
        console.log("✅ swipedId envoyé :", swipedId);
        const direction = "right"; // ✅ Ajout de la direction

        try {
            const token = await AsyncStorage.getItem('userToken');
            // 🔍 Vérifier si ce swiperId a déjà swipé ce swipedId
            const checkSwipe = await axios.get(`http://localhost:8080/api/swiped/check?swiperId=${swiperId}&swipedId=${swipedId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (checkSwipe.data.exists) {
                console.log("🟡 Swipe déjà enregistré, pas besoin d'ajouter.");
                return;
            }
            // Enregistrer le like/match pour les swipes à droite (company)
            const response = await axios.post(
                "http://localhost:8080/api/matches/swipe/company",
                { swiperId, swipedId },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );
            // Enregistrer tous les swipes (droite et gauche) dans `swipedCard`
            await axios.post(
                "http://localhost:8080/api/swiped/save",
                { swiperId, swipedId, direction }, // ✅ Envoie les IDs + la direction (right/left)
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
            await fetchMatchingCandidates(selectedOffer); // Recharge après un swipe

        } catch (error) {
            console.error('❌ Erreur lors du swipe:', error);
        }
    };

    const handleSwipeLeft = async (index) => {
        const swipedJobSearcher = jobSearchers[index];
        if (!swipedJobSearcher) {
            console.error("❌ Aucun job searcher trouvé pour cet index.");
            return;
        }
        console.log("🔴 Job Seeker ignoré:", swipedJobSearcher);
        const swipedId = swipedJobSearcher.id;
        const swiperId = await AsyncStorage.getItem("userId");
        if (!swiperId || !swipedId) {
            console.error("❌ swiperId ou swipedId est manquant !");
            return;
        }
        console.log("✅ swiperId envoyé :", swiperId);
        console.log("✅ swipedId envoyé :", swipedId);
        const direction = "left"; // ✅ Indique que c'est un swipe à gauche
        try {
            const token = await AsyncStorage.getItem('userToken');
            console.log("🔑 Token utilisé pour la requête :", token);
            // Enregistrer tous les swipes (droite et gauche) dans `swipedCard`
            await axios.post(
                "http://localhost:8080/api/swiped/save",
                { swiperId, swipedId, direction }, // ✅ Envoie les IDs + la direction "left"
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );
            console.log("✅ Swipe à gauche enregistré avec succès !");
            await fetchMatchingCandidates(selectedOffer); // Recharge après un swipe

        } catch (error) {
            console.error('❌ Erreur lors du swipe gauche:', error);
        }
    };

    return (
        <View style={styles.container}>
                    <View style={styles.topButtons}>
                        <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                        <Button title="Main Menu" onPress={() => navigation.navigate('CompanyHome')} />
                        <Button title={`Chat ${conversations.length > 0 ? `(${conversations.length})` : ''}`} onPress={() => navigation.navigate('ChatPage')} />
                        <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
                        {userType === 'COMPANY' && <Button title="Liked Candidates" onPress={() => navigation.navigate('LikedPage')} />}
                    </View>

                    {/* ✅ Afficher le titre uniquement si `selectedOffer` existe */}
                    {selectedOffer && selectedOffer.title && (
                        <Text style={styles.offerTitle}>🔍 Candidats pour : {selectedOffer.title}</Text>
                    )}

                    <View style={styles.swiperContainer}>
                        {isLoading ? (
                            <Text>Loading...</Text>
                        ) : (
                            <Swiper
                                cards={selectedOffer ? matchingJobSearchers : jobSearchers} // ✅ Affiche les candidats correspondants ou tous les candidats
                                renderCard={(jobSearcher) => (
                                    jobSearcher ? (
                                        <View style={styles.card}>
                                            <Text style={styles.cardTitle}>{jobSearcher.name || 'No name provided'}</Text>
                                            <Text>📍 Localisation : {jobSearcher.locations?.join(", ") || "Unknown"}</Text>
                                            <Text>💻 Compétences :
                                                {jobSearcher.skills?.map(skill => `${skill.name} (${skill.experience} ans)`).join(", ") || "Unknown"}
                                            </Text>
                                        </View>
                                    ) : (
                                        <View style={styles.card}>
                                            <Text style={styles.cardTitle}>No candidates available</Text>
                                        </View>
                                    )
                                )}
                                onSwipedRight={(cardIndex) => handleSwipeRight(cardIndex)}
                                cardIndex={0}
                                stackSize={3}
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
        padding: 10,
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    swiperContainer: {
        flex: 1,
        marginTop: 20,
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
export default CompanyHomePage;