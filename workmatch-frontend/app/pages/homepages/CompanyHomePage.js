import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';
import { useRoute } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

const CompanyHomePage = () => {
    const navigation = useNavigation();
    const [jobSearchers, setJobSearchers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState('');
    const [conversations, setConversations] = useState([]);
    const route = useRoute();
    const { selectedOffer } = route.params || {};
    const [matchingJobSearchers, setMatchingJobSearchers] = useState([]);
    const [disableSwipe, setDisableSwipe] = useState(false);

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
        const swiperId = await AsyncStorage.getItem("userId"); // ID de l'entreprise qui swipe
        if (!token || !swiperId) {
            console.error("❌ Token ou swiperId manquant !");
            return;
        }

        console.log("📡 Chargement des candidats pour :", jobOffer.title);
console.log("🔍 Format des swipedIds récupérés :", swipedResponse.data.map(s => ({
        swiperId: s.swiperId,
        swipedId: s.swipedId,
        jobOfferId: s.jobOfferId,
        isFromRedirection: s.isFromRedirection
    })));

        // ✅ Récupérer tous les candidats correspondant à l'offre
        const response = await axios.get(`http://localhost:8080/jobsearchers/matching?jobOfferId=${jobOffer._id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        let candidates = response.data;
        console.log("✅ Candidats correspondants avant filtrage :", candidates.map(c => ({
            name: c.name,
            userId: c.userId?.toString(),
            id: c.id?.toString()
        })));

        // ✅ Récupérer les job searchers déjà swipés à gauche par cette entreprise pour CETTE offre
        let swipedIdsForOffer = new Set();
        try {
            const swipedResponse = await axios.get(`http://localhost:8080/api/swiped/${swiperId}/${jobOffer._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    console.log("📌 Swipes récupérés (JSON brut) :", swipedResponse.data);

            // 🔥 Filtrer SEULEMENT les swipes à gauche qui proviennent d'une redirection
            swipedIdsForOffer = new Set(
                swipedResponse.data
                    .filter(item => item.direction === "left" && item.isFromRedirection === true)
                    .map(item => item.swipedId.toString().trim())
            );

            console.log("❌ Liste des candidats déjà swipés à gauche dans la redirection pour cette offre :", [...swipedIdsForOffer]);

        } catch (error) {
            console.error("⚠️ Erreur lors de la récupération des swipes :", error);
        }

        console.log("✅ Liste complète des candidats avant filtrage :", candidates.map(c => c.userId?.toString() || c.id?.toString()));
        console.log("❌ Liste des candidats déjà swipés (normalisée) :", [...swipedIdsForOffer]);

        // ✅ Filtrage des candidats déjà swipés pour CETTE offre dans la redirection
        candidates = candidates.filter(candidate => {
            const candidateId = candidate.userId?.toString() || candidate.id?.toString();
            const isSwipedForOffer = swipedIdsForOffer.has(candidateId);

            if (isSwipedForOffer) {
                console.log(`❌ Exclusion de ${candidate.name} (ID: ${candidateId}) - Swipé à gauche dans la redirection pour cette offre`);
            } else {
                console.log(`✅ Conservation de ${candidate.name} (ID: ${candidateId})`);
            }

            return !isSwipedForOffer;
        });

        console.log("✅ Liste finale des candidats après filtrage :", candidates.map(c => c.userId?.toString() || c.id?.toString()));

        // ✅ Récupérer les utilisateurs ayant liké cette offre
        let likedUsers = [];
        try {
            const likesResponse = await axios.get(`http://localhost:8080/likes?swipedId=${jobOffer._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            likedUsers = likesResponse.data.map(like => like.swiperId.toString().trim());
            console.log("💖 Liste des likes normalisée :", likedUsers);

        } catch (error) {
            console.error("⚠️ Erreur lors de la récupération des likes :", error);
        }

        // ✅ Ajouter une propriété `hasLikedOffer` et corriger `matchingScore`
        candidates = candidates.map(candidate => ({
            ...candidate,
            hasLikedOffer: likedUsers.includes(candidate.userId ? candidate.userId.toString().trim() : ""),
            matchingScore: isNaN(candidate.matchingScore) || candidate.matchingScore === null
                ? 0
                : Math.round(candidate.matchingScore * 100) / 100
        }));

        // ✅ Trier les candidats : Ceux qui ont liké d'abord, puis ceux avec le meilleur score
        candidates.sort((a, b) =>
            (b.hasLikedOffer - a.hasLikedOffer) || (b.matchingScore - a.matchingScore)
        );

        candidates.forEach(c => console.log(`✅ Score final après traitement : ${c.name} - ${c.matchingScore}%`));

        console.log("📌 Liste finale des candidats après tri :", candidates);

        // ✅ Mise à jour de l'état avec la nouvelle liste
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

        // ✅ Récupérer les candidats déjà swipés de manière globale (sans offre spécifique)
        let swipedIds = new Set();
        try {
            const swipedResponse = await axios.get(`http://localhost:8080/api/swiped/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // 🔥 Vérification des swipes récupérés
            console.log("📌 Swipes récupérés :", swipedResponse.data);

            // ✅ CORRECTION ICI : Filtrer uniquement les swipes à gauche avec jobOfferId vide et isFromRedirection=false
            swipedIds = new Set(
                    swipedResponse.data
                        .filter(item =>
                            item.isFromRedirection === false &&  // 📌 Swipe fait depuis l'affichage normal
                            (!item.jobOfferId || item.jobOfferId.trim() === "") // 📌 Sans jobOfferId
                        )
                        .map(item => item.swipedId.toString().trim())
                );


            console.log("❌ Liste des candidats déjà swipés selon les critères :", [...swipedIds]);

        } catch (error) {
            console.error("⚠️ Erreur lors de la récupération des swipes :", error);
        }
        let swipeStats = {};
        try {
            const swipeStatsResponse = await axios.get(`http://localhost:8080/api/swiped/company/swipes/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            swipeStats = swipeStatsResponse.data;
            console.log("📊 Swipes des candidats pour les offres de l'entreprise :", swipeStats);

        } catch (error) {
            console.error("⚠️ Erreur lors de la récupération des statistiques de swipes :", error);
        }
        console.log("✅ Liste complète des job searchers AVANT filtrage :", allJobSearchers.map(c => ({
            name: c.name,
            userId: c.userId?.toString(),
            id: c.id?.toString()
        })));

        console.log("❌ Liste des candidats swipés globalement à gauche :", [...swipedIds]);

        allJobSearchers = allJobSearchers.map(candidate => {
            const candidateId = candidate.userId?.toString() || candidate.id?.toString();
            const swipeData = swipeStats[candidateId] || { left: 0, right: 0 };

            return {
                ...candidate,
                swipesLeft: swipeData.left || 0,
                swipesRight: swipeData.right || 0
            };
        });

        // ✅ FILTRAGE ICI
        allJobSearchers = allJobSearchers.filter(candidate => {
          const candidateId = candidate.userId?.toString() || candidate.id?.toString();
          return !swipedIds.has(candidateId);
        });

        setJobSearchers([...allJobSearchers]);


    } catch (error) {
        console.error('❌ Erreur lors de la récupération des job searchers:', error);
    } finally {
        setIsLoading(false);
    }
};

const fetchJobSearchers = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const companyId = await AsyncStorage.getItem("userId");

        if (!token || !companyId) {
            console.error("❌ Token ou companyId manquant !");
            return;
        }

        console.log("📡 Récupération des candidats non swipés dans l'entrée normale...");

        // ✅ 1. Récupérer tous les job searchers disponibles
        const response = await axios.get(`http://localhost:8080/api/jobsearchers/all`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        let allJobSearchers = response.data;
        console.log("✅ Liste complète des job searchers :", allJobSearchers);

        // ✅ 2. Récupérer les swipedCards avec les critères spécifiés
        const swipedResponse = await axios.get(`http://localhost:8080/api/swiped/${companyId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ 3. Extraire uniquement les swipedIds qui respectent les critères
        const swipedIds = new Set(
            swipedResponse.data
                .filter(item => item.offerId === "" && item.isFromRedirection === false)
                .map(item => item.swipedId)
        );

        console.log("❌ Liste des candidats déjà swipés selon les critères :", [...swipedIds]);

        // ✅ 4. Filtrer la liste pour exclure ces candidats
        // ✅ Vérifier si l'élément existe bien dans swipedIds avant de filtrer
        allJobSearchers = allJobSearchers.filter(jobSearcher => {
            const jobSearcherId = jobSearcher.userId?.toString() || jobSearcher.id?.toString();
            console.log(`🔍 Vérification de ${jobSearcherId}, est-il dans swipedIds ?`, swipedIds.has(jobSearcherId));
            return !swipedIds.has(jobSearcherId);
        });


        console.log("✅ Liste finale après suppression des swipes :", allJobSearchers);

        // ✅ 5. Mise à jour de l'état avec la liste filtrée
        setJobSearchers(allJobSearchers);

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
    if (disableSwipe) return; // Bloquer les swipes si une requête est en cours
    setDisableSwipe(true); // Désactiver temporairement le swipe

    const swipedJobSearcher = selectedOffer ? matchingJobSearchers[index] : jobSearchers[index];

    if (!swipedJobSearcher) {
        console.error("❌ Aucun job searcher trouvé pour cet index.");
        setDisableSwipe(false);
        return;
    }

    const swipedId = swipedJobSearcher.userId;
    const swiperId = await AsyncStorage.getItem("userId");
    const offerId = selectedOffer ? selectedOffer._id : "";
    const isFromRedirection = false;
    const direction = "right";

    if (!swiperId || !swipedId) {
        console.error("❌ swiperId ou swipedId est manquant !");
        setDisableSwipe(false);
        return;
    }

    console.log("✅ Enregistrement d'un swipe à droite pour :", swipedId);

    try {
        const token = await AsyncStorage.getItem('userToken');

        // ✅ Vérifier si le swipe existe déjà
        const checkSwipe = await axios.get(`http://localhost:8080/api/swiped/check`, {
            params: { swiperId, swipedId, direction, offerId, isFromRedirection },
            headers: { Authorization: `Bearer ${token}` },
        });

        if (checkSwipe.data.exists) {
            console.log("🟡 Swipe déjà enregistré, pas besoin d'ajouter.");
            setDisableSwipe(false);
            return;
        }

        // ✅ Enregistrer le swipe (like)
        await axios.post(
            "http://localhost:8080/api/swiped/save",
            { swiperId, swipedId, direction, offerId, isFromRedirection },
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );

        console.log("✅ Swipe enregistré avec succès.");

        // ✅ Enregistrer le like SEULEMENT après confirmation du swipe
        await axios.post(
            "http://localhost:8080/likes/like",
            { swiperId, swipedId, companyId: swiperId, offerId, isFromRedirection },
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );

        console.log("💖 Like enregistré avec succès.");

        // ✅ Mise à jour de la liste après suppression de la carte swipée
        setMatchingJobSearchers(prevState => {
            const updatedList = prevState.filter((_, i) => i !== index);
            console.log("🔄 Mise à jour des candidats après suppression :", updatedList);
            return updatedList;
        });

        // 🔥 Ajouter un délai pour éviter un bug d'affichage
        setTimeout(() => {
            setMatchingJobSearchers(prevState => prevState.filter((_, i) => i !== index));
            setDisableSwipe(false);
        }, 100); // Délai court pour laisser le Swiper compléter son animation


    } catch (error) {
        console.error('❌ Erreur lors du swipe:', error);
        setDisableSwipe(false); // Réactiver le swipe en cas d'erreur
    }
};
const handleSwipeLeft = async (index) => {
    if (disableSwipe) return;
    setDisableSwipe(true);

    const swipedJobSearcher = selectedOffer ? matchingJobSearchers[index] : jobSearchers[index];

    if (!swipedJobSearcher) {
        console.error("❌ Aucun job searcher trouvé pour cet index.");
        setDisableSwipe(false);
        return;
    }

    console.log("🔴 Job Seeker ignoré:", swipedJobSearcher);

    const swipedId = swipedJobSearcher.userId;
    const swiperId = await AsyncStorage.getItem("userId");
    const jobOfferId = "";
    const isFromRedirection = false;
    const direction = "left";

    if (!swiperId || !swipedId) {
        console.error("❌ swiperId ou swipedId est manquant !");
        setDisableSwipe(false);
        return;
    }

    try {
        const token = await AsyncStorage.getItem('userToken');

        // ✅ Vérifier si le swipe EXACTEMENT IDENTIQUE existe déjà
        const checkSwipe = await axios.get(`http://localhost:8080/api/swiped/check`, {
            params: { swiperId, swipedId, direction, jobOfferId, isFromRedirection },
            headers: { Authorization: `Bearer ${token}` },
        });

        if (checkSwipe.data.exists) {
            console.log("🟡 Swipe déjà enregistré, pas besoin d'ajouter.");
            setDisableSwipe(false);
            return;
        }

        // ✅ Enregistrer le swipe (ignore)
        await axios.post(
            "http://localhost:8080/api/swiped/save",
            { swiperId, swipedId, direction, jobOfferId, isFromRedirection },
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );

        console.log("✅ Swipe à gauche enregistré avec succès !");

        // ✅ Mise à jour locale pour supprimer la carte
        setMatchingJobSearchers(prevState => {
            const updatedList = prevState.filter((_, i) => i !== index);
            console.log("🔄 Mise à jour des candidats après suppression :", updatedList);
            return updatedList;
        });

        setTimeout(() => {
            setMatchingJobSearchers(prevState => prevState.filter((_, i) => i !== index));
            setDisableSwipe(false);
        }, 100); // Délai court pour laisser le Swiper compléter son animation


    } catch (error) {
        console.error('❌ Erreur lors du swipe gauche:', error);
        setDisableSwipe(false);
    }
};

    return (
        <View style={styles.container}>
                    <View style={styles.topButtons}>
                      <TouchableOpacity style={[styles.navButton, { backgroundColor: '#3b82f6' }]} onPress={() => navigation.navigate('ProfilePage')}>
                        <Text style={styles.navButtonText}>Profile</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[styles.navButton, { backgroundColor: '#60a5fa' }]} onPress={() => navigation.navigate('CompanyHome')}>
                        <Text style={styles.navButtonText}>Main Menu</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[styles.navButton, { backgroundColor: '#93c5fd' }]} onPress={() => navigation.navigate('ChatPage')}>
                        <Text style={styles.navButtonText}>
                          Chat {conversations.length > 0 ? `(${conversations.length})` : ''}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[styles.navButton, { backgroundColor: '#bfdbfe' }]} onPress={() => navigation.navigate('MyOffersPage')}>
                        <Text style={styles.navButtonText}>My Offers</Text>
                      </TouchableOpacity>

                      {userType === 'COMPANY' && (
                        <TouchableOpacity style={[styles.navButton, { backgroundColor: '#dbeafe' }]} onPress={() => navigation.navigate('LikedPage')}>
                          <Text style={styles.navButtonText}>Liked Candidates</Text>
                        </TouchableOpacity>
                      )}
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
                                                <Text style={styles.likedText}>💖 Cet utilisateur a liké une offre !</Text>
                                            )}
                                            <Text style={styles.cardTitle}>{jobSearcher.name || 'No name provided'}</Text>
                                            <Text style={styles.cardDescription}>📍 {jobSearcher.locations?.join(", ") || "Localisation inconnue"}</Text>
                                            <Text style={styles.cardDescription}>
                                                💻 {jobSearcher.skills?.map(skill => `${skill.name} (${skill.experience} ans)`).join(", ") || "Aucune compétence"}
                                            </Text>
                                            <Text style={styles.cardDescription}>
                                                🎯 Matching : {jobSearcher.matchingScore?.toFixed(2) || 0}%
                                            </Text>
                                            <Text style={styles.cardDescription}>👈 Swipes à gauche : {jobSearcher.swipesLeft}</Text>
                                            <Text style={styles.cardDescription}>👉 Swipes à droite : {jobSearcher.swipesRight}</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.card}>
                                            <Text style={styles.cardTitle}>Aucun candidat disponible</Text>
                                        </View>
                                    )
                                )}


                                onSwipedRight={(cardIndex) => !disableSwipe && handleSwipeRight(cardIndex)}
                                onSwipedLeft={(cardIndex) => !disableSwipe && handleSwipeLeft(cardIndex)}

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
      backgroundColor: '#1e3a8a', // un joli bleu futuriste
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
      backgroundColor: '#334155', // gris bleuté foncé
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
    navButtonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center',
    },

cardTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: 12,
  textAlign: 'center',
},
    cardDescription: {
      fontSize: 14,
      color: '#ffffff',
      textAlign: 'center',
      lineHeight: 20,
    },
});

export default CompanyHomePage;