import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';
import { useRoute } from '@react-navigation/native';
import SockJS from 'sockjs-client';
import { BASE_URL } from '../../../constants/api';

const CompanyRedirectedPage = () => {
    const navigation = useNavigation();
    const [jobSearchers, setJobSearchers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState('');
    const [conversations, setConversations] = useState([]);
    const route = useRoute();
    const { selectedOffer } = route.params || {};
    const [matchingJobSearchers, setMatchingJobSearchers] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
      const connectWebSocket = async () => {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const socket = new SockJS(`${BASE_URL}/ws`);
        const stomp = Stomp.over(socket);
        stomp.debug = null;

        stomp.connect({}, () => {
          stomp.subscribe(`/topic/notifications/${userId}`, (message) => {
            const msg = JSON.parse(message.body);
            console.log('Notification reçue (CompanyRedirectedPage) :', msg);
            const senderId = msg.senderId;

            if (senderId !== userId) {
              setUnreadCount(1);

              // Et incrémenter par conversation :
              AsyncStorage.getItem('unreadByConversation').then((raw) => {
                const map = raw ? JSON.parse(raw) : {};
                const convId = msg.conversationId;

                map[convId] = (map[convId] || 0) + 1;
                AsyncStorage.setItem('unreadByConversation', JSON.stringify(map));
              });
            }

          });
        });
      };

      connectWebSocket();
    }, []);
    useEffect(() => {
      const loadUnreadCount = async () => {
        const storedCount = await AsyncStorage.getItem('unreadMessageCount');
        if (storedCount !== null) {
          setUnreadCount(parseInt(storedCount, 10));
        }
      };

      loadUnreadCount();
    }, []);

    useEffect(() => {
        if (selectedOffer) {
            fetchMatchingCandidates(selectedOffer);
        } else {
            fetchMatchingCandidatesForCompany();
        }
    }, [selectedOffer]);

    useEffect(() => {
        console.log("Mise à jour des candidats après swipe :", matchingJobSearchers);
    }, [matchingJobSearchers]);

    const fetchMatchingCandidates = async (jobOffer) => {
        if (!jobOffer || !jobOffer._id) {
            console.error("Erreur : jobOffer ou son ID est invalide !");
            return;
        }
        try {
            const token = await AsyncStorage.getItem("userToken");
            const swiperId = await AsyncStorage.getItem("userId");
            const companyId = await AsyncStorage.getItem("userId");

            if (!token || !swiperId) {
                console.error("Token ou swiperId manquant !");
                return;
            }

            console.log("Chargement des candidats pour :", jobOffer.title);

            const response = await axios.get(`${BASE_URL}/api/swiped/filteredJobSearchers/${swiperId}/${jobOffer._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let candidates = response.data;
            console.log("Candidats avant filtrage :", candidates.map(c => c.userId));

            const scoreResponse = await axios.get(`${BASE_URL}/jobsearchers/matching?jobOfferId=${jobOffer._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let candidatesWithScores = scoreResponse.data;

            candidates = candidates.map(candidate => {
                const matchingCandidate = candidatesWithScores.find(c => c.userId === candidate.userId);
                return {
                    ...candidate,
                    matchingScore: matchingCandidate ? matchingCandidate.matchingScore : 0
                };
            });

            console.log("Candidats après ajout des scores :", candidates.map(c => ({
                name: c.name,
                score: c.matchingScore
            })));

            candidates.sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0));

            //Récupérer les swipes des candidats pour les offres du company
            let candidateSwipeData = {};

            try {
                const swipesResponse = await axios.get(`${BASE_URL}/api/swiped/company/swipes/${companyId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                candidateSwipeData = swipesResponse.data || {};
                console.log("Swipes des candidats pour les offres de l'entreprise :", candidateSwipeData);
            } catch (error) {
                console.error("Erreur lors de la récupération des swipes par candidat :", error);
            }

            //Ajouter les swipes des candidats aux données
            candidates = candidates.map(candidate => {
                const candidateId = candidate.userId?.toString() || candidate.id?.toString();
                return {
                    ...candidate,
                    swipeLeftCount: candidateSwipeData[candidateId]?.left || 0,
                    swipeRightCount: candidateSwipeData[candidateId]?.right || 0
                };
            });

            console.log("Données finales des candidats après ajout des swipes :", candidates.map(c => ({
                name: c.name,
                leftSwipes: c.swipeLeftCount,
                rightSwipes: c.swipeRightCount
            })));


            //Récupérer les swipes à gauche POUR CETTE OFFRE (isFromRedirection = true)
            let swipedIdsForOffer = new Set();
            try {
                const swipedResponse = await axios.get(`${BASE_URL}/api/swiped/${swiperId}/${jobOffer._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                swipedIdsForOffer = new Set(
                  swipedResponse.data
                    .filter(item => item.isFromRedirection === true)
                    .map(item => item.swipedId.toString().trim())
                );

                console.log("Swipes à gauche pour CETTE OFFRE :", [...swipedIdsForOffer]);

            } catch (error) {
                console.error("Erreur lors de la récupération des swipes pour cette offre :", error);
            }

            //Récupérer les swipes à gauche GLOBALEMENT (hors redirection)
            let globallySwipedLeft = new Set();
            try {
                const swipedGlobalResponse = await axios.get(`${BASE_URL}/api/swiped/${swiperId}`, {
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

                console.log("Swipes à gauche GLOBAUX :", [...globallySwipedLeft]);

            } catch (error) {
                console.error("Erreur lors de la récupération des swipes globaux :", error);
            }

            //Filtrer les candidats
            candidates = candidates.filter(candidate => {
                const candidateId = candidate.userId?.toString() || candidate.id?.toString();
                const isSwipedForOffer = swipedIdsForOffer.has(candidateId);
                const isSwipedGlobally = globallySwipedLeft.has(candidateId);

                const hasValidScore = candidate.matchingScore > 0;

                if (isSwipedForOffer || isSwipedGlobally) {
                    console.log(`Exclusion de ${candidate.name} (ID: ${candidateId}) - Swipé à gauche`);
                } else {
                    console.log(`Conservation de ${candidate.name} (ID: ${candidateId})`);
                }

                return !isSwipedForOffer && !isSwipedGlobally && hasValidScore;
            });

            console.log("Liste finale des candidats après filtrage :", candidates.map(c => c.userId));

            setMatchingJobSearchers([...candidates]);

        } catch (error) {
            console.error("Erreur lors du chargement des candidats :", error);
        } finally {
            setIsLoading(false);
        }
    };


    const fetchMatchingCandidatesForCompany = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const companyId = await AsyncStorage.getItem("userId");

            if (!token || !companyId) {
                console.error("Token ou companyId manquant !");
                return;
            }

            console.log("Chargement des candidats pour l'entreprise...");

            //Récupérer la liste des candidats
            const response = await axios.get(`${BASE_URL}/jobsearchers/matching/company?companyId=${companyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let allJobSearchers = response.data;
            console.log("Candidats triés par score :", allJobSearchers);

            //Récupérer les candidats déjà swipés de manière globale (hors redirection)
            let swipedIds = new Set();
            try {
                const swipedResponse = await axios.get(`${BASE_URL}/api/swiped/${companyId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                //Ne filtrer QUE les swipes "left" qui ne viennent PAS d'une redirection
                swipedIds = new Set(
                    swipedResponse.data
                        .filter(item => item.direction === "left" && item.isFromRedirection === false)
                        .map(item => item.swipedId.toString().trim())
                );

                console.log("Liste des candidats globalement swipés à gauche (hors redirection) :", [...swipedIds]);

            } catch (error) {
                console.error("Erreur lors de la récupération des swipes :", error);
            }

            //Filtrer les candidats déjà swipés dans l'affichage général
            allJobSearchers = allJobSearchers.filter(candidate => {
                const candidateId = candidate.userId?.toString() || candidate.id?.toString();
                const isSwipedGlobally = swipedIds.has(candidateId);

                if (isSwipedGlobally) {
                    console.log(`Exclusion de ${candidate.name} (ID: ${candidateId}) - Swipé à gauche globalement`);
                } else {
                    console.log(`Conservation de ${candidate.name} (ID: ${candidateId})`);
                }

                return !isSwipedGlobally;
            });

            console.log("Liste finale des candidats après filtrage :", allJobSearchers.map(c => c.userId?.toString() || c.id?.toString()));

            setJobSearchers(allJobSearchers);
        } catch (error) {
            console.error('Erreur lors de la récupération des job searchers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchJobSearchers = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const swiperId = await AsyncStorage.getItem("userId");
            if (!token || !swiperId) {
                console.error("Token ou swiperId manquant !");
                return;
            }

            console.log("JWT Token récupéré :", token);

            const response = await axios.get(`${BASE_URL}/jobsearchers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allJobSearchers = response.data;

            const swipedResponse = await axios.get(`${BASE_URL}/api/swiped/${swiperId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const swipedData = swipedResponse.data;
            const swipedIds = new Set(swipedData.map(item => item.swipedId));

            const filteredJobSearchers = allJobSearchers.filter(jobSearcher => !swipedIds.has(jobSearcher.id));

            setJobSearchers(filteredJobSearchers);
            console.log("Liste des job searchers après filtrage :", filteredJobSearchers);
        } catch (error) {
            console.error('Erreur lors de la récupération des job searchers:', error);
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
            console.error("Aucun job searcher trouvé pour cet index.");
            return;
        }

        const swipedId = swipedJobSearcher.userId;
        const swiperId = await AsyncStorage.getItem("userId");
        const jobOfferId = selectedOffer ? selectedOffer._id : null;
        const isFromRedirection = !!selectedOffer;

        if (!swiperId || !swipedId) {
            console.error("swiperId ou swipedId est manquant !");
            return;
        }

        console.log("swiperId envoyé :", swiperId);
        console.log("swipedId envoyé :", swipedId);
        console.log("jobOfferId envoyé :", jobOfferId);
        console.log("isFromRedirection :", isFromRedirection);
        const direction = "right";

        try {
            const token = await AsyncStorage.getItem('userToken');
            const checkSwipe = await axios.get(`${BASE_URL}/api/swiped/check`, {
                params: {
                    swiperId,
                    swipedId,
                    direction,
                    jobOfferId: jobOfferId || "",
                    isFromRedirection
                },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (checkSwipe.data.exists) {
                console.log("Swipe déjà enregistré, pas besoin d'ajouter.");
                return;
            }

            const response = await axios.post(
                `${BASE_URL}/api/matches/swipe/company`,
                { swiperId, swipedId },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

            await axios.post(
                `${BASE_URL}/api/swiped/save`,
                { swiperId, swipedId, direction, jobOfferId, isFromRedirection },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

            const matchResponse = await axios.post(
                `${BASE_URL}/api/matches/match`,
                { swiperId, swipedId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Réponse match :", matchResponse.data);
            console.log("Réponse serveur :", response.data);

            setMatchingJobSearchers(prevState => prevState.filter((_, i) => i !== index));

        } catch (error) {
            console.error('Erreur lors du swipe:', error);
        }
    };

     const handleSwipeLeft = async (index) => {
         const swipedJobSearcher = selectedOffer ? matchingJobSearchers[index] : jobSearchers[index];

         if (!swipedJobSearcher) {
             console.error("Aucun job searcher trouvé pour cet index.");
             return;
         }

         console.log("Job Seeker ignoré:", swipedJobSearcher);
         const swipedId = swipedJobSearcher.userId;
         const swiperId = await AsyncStorage.getItem("userId");
         const jobOfferId = selectedOffer ? selectedOffer._id : null;
         const isFromRedirection = !!selectedOffer;

         if (!swiperId || !swipedId) {
             console.error("swiperId ou swipedId est manquant !");
             return;
         }

         const direction = "left";

         console.log("swiperId envoyé :", swiperId);
         console.log("swipedId envoyé :", swipedId);
         console.log("jobOfferId envoyé :", jobOfferId);
         console.log("isFromRedirection :", isFromRedirection);

         try {
             const token = await AsyncStorage.getItem('userToken');
             console.log("Token utilisé pour la requête :", token);

             await axios.post(
                 `${BASE_URL}/api/swiped/save`,
                 { swiperId, swipedId, direction, jobOfferId, isFromRedirection },
                 {
                     headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                 }
             );

             console.log("Swipe à gauche enregistré avec succès !");

             setMatchingJobSearchers(prevState => prevState.filter((_, i) => i !== index));

         } catch (error) {
             console.error('Erreur lors du swipe gauche:', error);
         }
     };

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
              <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ProfilePage')}>
                <Text style={styles.navButtonText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('CompanyHome')}>
                <Text style={styles.navButtonText}>Main Menu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: '#93c5fd', position: 'relative' }]}
                onPress={() => {
                  setUnreadCount(0);
                  navigation.navigate("ChatPage");
                }}

              >
                <Text style={styles.navButtonText}>Chat</Text>
                {unreadCount > 0 && (
                  <View style={styles.dot} />
                )}

              </TouchableOpacity>

              <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MyOffersPage')}>
                <Text style={styles.navButtonText}>My Offers</Text>
              </TouchableOpacity>
              {userType === 'COMPANY' && (
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('LikedPage')}>
                  <Text style={styles.navButtonText}>Liked Candidates</Text>
                </TouchableOpacity>
              )}
            </View>

            {selectedOffer && selectedOffer.title && (
                <Text style={styles.offerTitle}>Candidats pour : {selectedOffer.title}</Text>
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
                                        <Text style={styles.likedText}>Cet utilisateur a liké une offre de l'entreprise !</Text>
                                    )}

                                    <Text style={styles.cardTitle}>{jobSearcher.name || 'No name provided'}</Text>
                                    <Text style={styles.cardText}>Localisation : {jobSearcher.locations?.join(", ") || "Unknown"}</Text>
                                    <Text style={styles.cardText}>Compétences :
                                        {jobSearcher.skills?.map(skill => `${skill.name} (${skill.experience} ans)`).join(", ") || "Unknown"}
                                    </Text>

                                    {selectedOffer ? (
                                        <Text style={styles.cardText}>Score de matching (offre sélectionnée) :
                                            {jobSearcher.matchingScore !== undefined ? jobSearcher.matchingScore.toFixed(2) + "%" : "N/A"}
                                        </Text>
                                    ) : (
                                        <Text style={styles.cardText}>Score de matching (toutes offres) :
                                            {jobSearcher.matchingScore !== undefined ? jobSearcher.matchingScore.toFixed(2) + "%" : "N/A"}
                                        </Text>
                                    )}
                                    <Text style={styles.cardText}>Swipes sur vos offres: {jobSearcher.swipeRightCount} 👍 | {jobSearcher.swipeLeftCount} 👎</Text>

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
    backgroundColor: '#0f172a',
    padding: 10,
  },
  topButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
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
    margin: 4,
  },badge: {
      position: 'absolute',
      top: -5,
      right: -10,
      backgroundColor: 'red',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    badgeText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 10,
    },

  navButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  swiperContainer: {
    flex: 1,
    marginTop: 20,
  },
  card: {
    width: 320,
    maxWidth: '90%',
    minHeight: 420,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
  cardDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 6,
  },
  likedText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  notLikedText: {
    color: 'gray',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
dot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: 'red',
  position: 'absolute',
  top: -5,
  right: -10,
},

cardText: {
  fontSize: 14,
  color: '#cbd5e1',
  textAlign: 'center',
  marginBottom: 6,
  lineHeight: 20,
},
  offerTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginVertical: 10,
  },
});

export default CompanyRedirectedPage;