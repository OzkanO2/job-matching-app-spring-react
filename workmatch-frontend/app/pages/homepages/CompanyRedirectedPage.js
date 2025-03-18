import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';
import { useRoute } from '@react-navigation/native';

const CompanyRedirectedPage = () => {
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
            fetchMatchingCandidatesForCompany();
        }
    }, [selectedOffer]);


    useEffect(() => {
        console.log("🆕 Mise à jour des candidats après swipe :", matchingJobSearchers);
    }, [matchingJobSearchers]);

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

            const response = await axios.get(`http://localhost:8080/api/swiped/filteredJobSearchers/${swiperId}/${jobOffer._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let candidates = response.data;
            console.log("✅ Candidats avant filtrage :", candidates.map(c => c.userId));

            // ✅ 2. Récupérer les swipes à gauche POUR CETTE OFFRE (isFromRedirection = true)
            let swipedIdsForOffer = new Set();
            try {
                const swipedResponse = await axios.get(`http://localhost:8080/api/swiped/${swiperId}/${jobOffer._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                swipedIdsForOffer = new Set(
                    swipedResponse.data
                        .filter(item => item.direction === "left" && item.isFromRedirection === true)
                        .map(item => item.swipedId.toString().trim())
                );

                console.log("❌ Swipes à gauche pour CETTE OFFRE :", [...swipedIdsForOffer]);

            } catch (error) {
                console.error("⚠️ Erreur lors de la récupération des swipes pour cette offre :", error);
            }

            // ✅ 3. Récupérer les swipes à gauche GLOBALEMENT (hors redirection)
            let globallySwipedLeft = new Set();
            try {
                const swipedGlobalResponse = await axios.get(`http://localhost:8080/api/swiped/${swiperId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                globallySwipedLeft = new Set(
                    swipedGlobalResponse.data
                        .filter(item =>
                            item.direction === "left" &&
                            item.isFromRedirection === false &&
                            (!item.offerId || item.offerId === "")
                        )
                        .map(item => item.swipedId.toString().trim())
                );

                console.log("❌ Swipes à gauche GLOBAUX :", [...globallySwipedLeft]);

            } catch (error) {
                console.error("⚠️ Erreur lors de la récupération des swipes globaux :", error);
            }

            // ✅ 4. Filtrer les candidats
            candidates = candidates.filter(candidate => {
                const candidateId = candidate.userId?.toString() || candidate.id?.toString();
                const isSwipedForOffer = swipedIdsForOffer.has(candidateId);
                const isSwipedGlobally = globallySwipedLeft.has(candidateId);

                if (isSwipedForOffer || isSwipedGlobally) {
                    console.log(`❌ Exclusion de ${candidate.name} (ID: ${candidateId}) - Swipé à gauche`);
                } else {
                    console.log(`✅ Conservation de ${candidate.name} (ID: ${candidateId})`);
                }

                return !isSwipedForOffer && !isSwipedGlobally;
            });

            console.log("✅ Liste finale des candidats après filtrage :", candidates.map(c => c.userId));

            setMatchingJobSearchers([...candidates]);

        } catch (error) {
            console.error("❌ Erreur lors du chargement des candidats :", error);
        } finally {
            setIsLoading(false);
        }
    };


const fetchMatchingCandidatesForCompany = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const companyId = await AsyncStorage.getItem("userId");

        if (!token || !companyId) {
            console.error("❌ Token ou companyId manquant !");
            return;
        }

        console.log("📡 Chargement des candidats pour l'entreprise...");

        // ✅ Récupérer la liste des candidats
        const response = await axios.get(`http://localhost:8080/jobsearchers/matching/company?companyId=${companyId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        let allJobSearchers = response.data;
        console.log("✅ Candidats triés par score :", allJobSearchers);

        // ✅ Récupérer les candidats déjà swipés de manière globale (hors redirection)
        let swipedIds = new Set();
        try {
            const swipedResponse = await axios.get(`http://localhost:8080/api/swiped/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // ✅ Ne filtrer QUE les swipes "left" qui ne viennent PAS d'une redirection
            swipedIds = new Set(
                swipedResponse.data
                    .filter(item => item.direction === "left" && item.isFromRedirection === false)
                    .map(item => item.swipedId.toString().trim())
            );

            console.log("❌ Liste des candidats globalement swipés à gauche (hors redirection) :", [...swipedIds]);

        } catch (error) {
            console.error("⚠️ Erreur lors de la récupération des swipes :", error);
        }

        // ✅ Filtrer les candidats déjà swipés dans l'affichage général
        allJobSearchers = allJobSearchers.filter(candidate => {
            const candidateId = candidate.userId?.toString() || candidate.id?.toString();
            const isSwipedGlobally = swipedIds.has(candidateId);

            if (isSwipedGlobally) {
                console.log(`❌ Exclusion de ${candidate.name} (ID: ${candidateId}) - Swipé à gauche globalement`);
            } else {
                console.log(`✅ Conservation de ${candidate.name} (ID: ${candidateId})`);
            }

            return !isSwipedGlobally;
        });

        console.log("✅ Liste finale des candidats après filtrage :", allJobSearchers.map(c => c.userId?.toString() || c.id?.toString()));

        setJobSearchers(allJobSearchers);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des job searchers:', error);
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

        const swipedId = swipedJobSearcher.userId;
        const swiperId = await AsyncStorage.getItem("userId");
        const jobOfferId = selectedOffer ? selectedOffer._id : null; // Récupérer l'ID de l'offre si sélectionnée
        const isFromRedirection = !!selectedOffer; // ✅ True si on swipe depuis une redirection

        if (!swiperId || !swipedId) {
            console.error("❌ swiperId ou swipedId est manquant !");
            return;
        }

        console.log("✅ swiperId envoyé :", swiperId);
        console.log("✅ swipedId envoyé :", swipedId);
        console.log("✅ jobOfferId envoyé :", jobOfferId);
        console.log("✅ isFromRedirection :", isFromRedirection);
        const direction = "right";

        try {
            const token = await AsyncStorage.getItem('userToken');
            const checkSwipe = await axios.get(`http://localhost:8080/api/swiped/check`, {
                params: {
                    swiperId,
                    swipedId,
                    direction,
                    jobOfferId: jobOfferId || "",  // Assurer que c'est une string valide
                    isFromRedirection
                },
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
                { swiperId, swipedId, direction, jobOfferId, isFromRedirection },
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

            setMatchingJobSearchers(prevState => prevState.filter((_, i) => i !== index));


        } catch (error) {
            console.error('❌ Erreur lors du swipe:', error);
        }
    };

     const handleSwipeLeft = async (index) => {
         const swipedJobSearcher = selectedOffer ? matchingJobSearchers[index] : jobSearchers[index];

         if (!swipedJobSearcher) {
             console.error("❌ Aucun job searcher trouvé pour cet index.");
             return;
         }

         console.log("🔴 Job Seeker ignoré:", swipedJobSearcher);
         const swipedId = swipedJobSearcher.userId;
         const swiperId = await AsyncStorage.getItem("userId");
         const jobOfferId = selectedOffer ? selectedOffer._id : null; // Récupérer l'ID de l'offre si sélectionnée
         const isFromRedirection = !!selectedOffer; // ✅ True si on swipe depuis une redirection

         if (!swiperId || !swipedId) {
             console.error("❌ swiperId ou swipedId est manquant !");
             return;
         }

         console.log("✅ swiperId envoyé :", swiperId);
         console.log("✅ swipedId envoyé :", swipedId);
         console.log("✅ jobOfferId envoyé :", jobOfferId);
         const direction = "left";
         console.log("✅ isFromRedirection :", isFromRedirection);

         try {
             const token = await AsyncStorage.getItem('userToken');
             console.log("🔑 Token utilisé pour la requête :", token);

             await axios.post(
                 "http://localhost:8080/api/swiped/save",
                 { swiperId, swipedId, direction, jobOfferId, isFromRedirection }, // Envoi du jobOfferId
                 {
                     headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                 }
             );

             console.log("✅ Swipe à gauche enregistré avec succès !");

             setMatchingJobSearchers(prevState => prevState.filter((_, i) => i !== index));


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
key={matchingJobSearchers.map(c => c.userId).join(",")}
                                cards={selectedOffer ? matchingJobSearchers : jobSearchers}
                                renderCard={(jobSearcher) => (
                                    jobSearcher ? (
                                        <View style={styles.card}>
                                            {jobSearcher.hasLikedOffer && (
                                                <Text style={styles.likedText}>💖 Cet utilisateur a liké une offre de l'entreprise !</Text>
                                            )}

                                            <Text style={styles.cardTitle}>{jobSearcher.name || 'No name provided'}</Text>
                                            <Text>📍 Localisation : {jobSearcher.locations?.join(", ") || "Unknown"}</Text>
                                            <Text>💻 Compétences :
                                                {jobSearcher.skills?.map(skill => `${skill.name} (${skill.experience} ans)`).join(", ") || "Unknown"}
                                            </Text>

                                            {/* ✅ Affichage conditionnel du score avec arrondi à 2 chiffres */}
                                            {selectedOffer ? (
                                                <Text>🎯 Score de matching (offre sélectionnée) :
                                                    {jobSearcher.matchingScore !== undefined ? jobSearcher.matchingScore.toFixed(2) + "%" : "N/A"}
                                                </Text>
                                            ) : (
                                                <Text>🎯 Score de matching (toutes offres) :
                                                    {jobSearcher.matchingScore !== undefined ? jobSearcher.matchingScore.toFixed(2) + "%" : "N/A"}
                                                </Text>
                                            )}
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
export default CompanyRedirectedPage;