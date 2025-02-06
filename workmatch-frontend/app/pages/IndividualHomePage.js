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

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            setUserId(storedUserId);
            console.log("👤 ID utilisateur récupéré :", storedUserId);
        };

        const fetchJobOffers = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const swiperId = await AsyncStorage.getItem("userId"); // L'ID de l'utilisateur Individual

                if (!token || !swiperId) {
                    console.error("❌ Token ou swiperId manquant !");
                    return;
                }

                console.log("🔑 JWT Token récupéré :", token);

                // 📌 Récupération de toutes les offres d'emploi
                const response = await axios.get('http://localhost:8080/joboffers', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const allJobOffers = response.data;

                // 📌 Récupération des swipes déjà effectués par cet utilisateur
                const swipedResponse = await axios.get(`http://localhost:8080/api/swiped/${swiperId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const swipedData = swipedResponse.data; // Liste des swipes (right & left)
                const swipedIds = new Set(swipedData.map(item => item.swipedId)); // Stocker les IDs swipés

                // 🔥 Filtrer les offres en excluant celles déjà swipées
                const filteredJobOffers = allJobOffers.filter(offer => !swipedIds.has(offer._id));

                setJobOffers(filteredJobOffers); // Met à jour l'état avec la liste filtrée

                // 🖥️ Console.log : Affiche la liste après filtrage
                console.log("✅ Liste des offres affichées après filtrage :", filteredJobOffers);

            } catch (error) {
                console.error('❌ Error fetching job offers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchConversations = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const storedUserId = await AsyncStorage.getItem('userId');

                if (!token || !storedUserId) {
                    console.error("❌ Token ou UserId manquant !");
                    return;
                }

                setUserId(storedUserId);

                const response = await axios.get(`http://localhost:8080/api/conversations/${storedUserId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setConversations(response.data);
                console.log("✅ Conversations chargées :", response.data);
            } catch (error) {
                console.error("❌ Erreur lors du chargement des conversations :", error);
            }
        };

        fetchUserData();
        fetchJobOffers();
        fetchConversations(); // ✅ Ajoute cet appel pour éviter l'erreur

    }, []);


    const handleSwipeRight = async (index) => {
        const swipedJobOffer = jobOffers[index];

        if (!swipedJobOffer) {
            console.error("❌ Aucun job offer trouvé pour cet index.");
            return;
        }

        console.log("🟢 Job Offer sélectionnée:", swipedJobOffer);

        const swipedId = swipedJobOffer._id;  // ✅ Vérifie bien que "_id" est utilisé
        const companyId = swipedJobOffer.companyId || swipedJobOffer.company?.id;  // ✅ Récupère bien le companyId
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

        const direction = "right"; // ✅ Ajout de la direction

        try {
            const token = await AsyncStorage.getItem('userToken');

            console.log("🔑 Token utilisé pour la requête :", token);

            const response = await axios.post(
                "http://localhost:8080/api/matches/swipe/individual",
                { swiperId, swipedId, companyId },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

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
            fetchConversations();
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

        const swipedId = swipedJobOffer._id;  // ✅ Vérifie bien que "_id" est utilisé
        const companyId = swipedJobOffer.companyId || swipedJobOffer.company?.id;  // ✅ Récupère bien le companyId
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

            // ✅ Vérifier si un match est confirmé
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
                <Button
                    title={`Chat ${conversations.length > 0 ? `(${conversations.length})` : ''}`}
                    onPress={() => navigation.navigate('ChatPage')}
                />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
            </View>

            <View style={styles.swiperContainer}>
                {isLoading ? (
                    <Text>Loading...</Text>
                ) : (
                    <Swiper
                        cards={jobOffers}
                        renderCard={(offer) => (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{offer.title}</Text>
                                <Text style={styles.cardDescription}>
                                    {offer.description.length > 150 ? `${offer.description.slice(0, 150)}...` : offer.description}
                                </Text>
                            </View>
                        )}
                        onSwipedRight={(cardIndex) => handleSwipeRight(cardIndex)}
                        onSwipedLeft={(cardIndex) => handleSwipeLeft(cardIndex)}
                        cardIndex={0}
                        backgroundColor={'#f3f3f3'}
                        stackSize={3}
                        infinite
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
