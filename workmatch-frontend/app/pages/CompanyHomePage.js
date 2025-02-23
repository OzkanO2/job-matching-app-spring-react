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
    const { selectedOffer } = route.params || {};
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
            const swiperId = await AsyncStorage.getItem("userId");
            if (!token || !swiperId) {
                console.error("❌ Token ou swiperId manquant !");
                return;
            }

            console.log("📡 Chargement des candidats pour :", jobOffer.title);

            // ✅ 1️⃣ Récupérer tous les candidats correspondant à l'offre
            const response = await axios.get(`http://localhost:8080/jobsearchers/matching?jobOfferId=${jobOffer._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let candidates = response.data;
            console.log("✅ Candidats correspondants avant filtrage :", candidates);

            // ✅ 2️⃣ Récupérer les job searchers déjà swipés
            let swipedIds = new Set();
            try {
                const swipedResponse = await axios.get(`http://localhost:8080/api/swiped/${swiperId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                swipedIds = new Set(swipedResponse.data.map(item => item.swipedId));
                console.log("❌ Liste des candidats déjà swipés :", [...swipedIds]);

            } catch (error) {
                console.error("⚠️ Erreur lors de la récupération des swipes, on continue sans filtrage :", error);
            }

            // ✅ 3️⃣ Filtrer les candidats déjà swipés
candidates = candidates.filter(candidate => !swipedIds.has(candidate.id));

            // ✅ 4️⃣ Récupérer les likes pour cette offre
            let likedUsers = [];
            try {
                const likesResponse = await axios.get(`http://localhost:8080/likes?swipedId=${jobOffer._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                likedUsers = likesResponse.data.map(like => like.swiperId.toString().trim());
                console.log("💖 Liste des likes normalisée :", likedUsers);

            } catch (error) {
                console.error("⚠️ Erreur lors de la récupération des likes, on continue sans eux :", error);
            }

            // ✅ 5️⃣ Ajouter une propriété `hasLikedOffer` et trier la liste
            candidates = candidates.map(candidate => {
                const userIdString = candidate.userId ? candidate.userId.toString().trim() : "";
                const hasLiked = likedUsers.includes(userIdString);

                return {
                    ...candidate,
                    hasLikedOffer: hasLiked
                };
            });

            // ✅ 6️⃣ Trier la liste : Ceux qui ont liké d'abord
            candidates.sort((a, b) => b.hasLikedOffer - a.hasLikedOffer);

            console.log("📌 Liste finale des candidats après tri :", candidates);

            // ✅ 7️⃣ Mettre à jour l'état avec la liste triée
            setMatchingJobSearchers([...candidates]);
            console.log("✅ Candidats après tri :", candidates);

        } catch (error) {
            console.error("❌ Erreur lors du chargement des candidats :", error);
        } finally {
            setIsLoading(false);
        }
    };



const fetchJobSearchers = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const swiperId = await AsyncStorage.getItem("userId");
            if (!token || !swiperId) {
                console.error("❌ Token ou swiperId manquant !");
                return;
            }

            console.log("🔑 JWT Token récupéré :", token);

            const response = await axios.get('http://localhost:8080/jobsearchers', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allJobSearchers = response.data;

            const swipedResponse = await axios.get(`http://localhost:8080/api/swiped/${swiperId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const swipedData = swipedResponse.data;
            const swipedIds = new Set(swipedData.map(item => item.swipedId));

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
        const direction = "right";

        try {
            const token = await AsyncStorage.getItem('userToken');
            const checkSwipe = await axios.get(`http://localhost:8080/api/swiped/check?swiperId=${swiperId}&swipedId=${swipedId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (checkSwipe.data.exists) {
                console.log("🟡 Swipe déjà enregistré, pas besoin d'ajouter.");
                return;
            }
            const response = await axios.post(
                "http://localhost:8080/api/matches/swipe/company",
                { swiperId, swipedId },
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
            await fetchMatchingCandidates(selectedOffer);

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
            console.log("✅ Swipe à gauche enregistré avec succès !");
            await fetchMatchingCandidates(selectedOffer);

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

                    {selectedOffer && selectedOffer.title && (
                        <Text style={styles.offerTitle}>🔍 Candidats pour : {selectedOffer.title}</Text>
                    )}

                    <View style={styles.swiperContainer}>
                        {isLoading ? (
                            <Text>Loading...</Text>
                        ) : (
                            <Swiper
                                cards={selectedOffer ? matchingJobSearchers : jobSearchers}
                                renderCard={(jobSearcher) => (
                                    jobSearcher ? (
                                        <View style={styles.card}>
                                            {jobSearcher.hasLikedOffer ? (
                                                <Text style={styles.likedText}>💖 Cet utilisateur a liké {selectedOffer?.title} !</Text>
                                            ) : (
                                                <Text style={styles.notLikedText}>🤝 Pas encore liké cette offre</Text>
                                            )}
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
                                onSwipedLeft={(cardIndex) => handleSwipeLeft(cardIndex)}
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
    likedText: {
        color: "green",
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 5,
    },notLikedText: {
          color: "gray",
          fontWeight: "bold",
          fontSize: 14,
          marginBottom: 5,
      },


});
export default CompanyHomePage;