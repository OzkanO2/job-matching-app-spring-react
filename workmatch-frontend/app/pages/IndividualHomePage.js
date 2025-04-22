import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useRef } from 'react';
import { BASE_URL } from '../../constants/api'; // adapte le chemin selon la profondeur

const IndividualHomePage = () => {
    const navigation = useNavigation();
    const [jobOffers, setJobOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [userType, setUserType] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMoreOffers, setHasMoreOffers] = useState(true);
    const [swipedCount, setSwipedCount] = useState(0);
    const swiperIndexRef = useRef(0);
    const fetchJobOffers = async (page = 0) => {
        try {
            setIsFetchingMore(true);
            setIsLoading(true);

            const token = await AsyncStorage.getItem('userToken');
            const swiperId = await AsyncStorage.getItem("userId");

            if (!token || !swiperId) {
                console.error("Token ou swiperId manquant !");
                setIsLoading(false);
                return;
            }

            console.log("Récupération des offres d'emploi filtrées...");

            const response = await axios.get(
                `${BASE_URL}/joboffers/user/${swiperId}?page=${page}&size=10`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const allJobOffers = response.data;

            if (allJobOffers.length === 0) {
                setHasMoreOffers(false); // fin de pagination
                return;
            }

            // 🟢 Ajouter ici la vraie requête vers les offres déjà swipées
            const swipedResponse = await axios.get(
                `${BASE_URL}/api/swiped/${swiperId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const swipedData = swipedResponse.data;
            const swipedIds = new Set(swipedData.map(item => item.swipedId.toString()));

            const filteredJobOffers = allJobOffers.filter(
                offer => !swipedIds.has(offer._id.toString())
            );

            console.log("Liste des offres après filtrage :", filteredJobOffers);

            // Garde uniquement les offres uniques
            const uniqueJobOffers = filteredJobOffers.reduce((acc, offer) => {
                if (!acc.some(o => o._id === offer._id)) acc.push(offer);
                return acc;
            }, []);

            console.log("IDs des offres uniques après filtrage :", uniqueJobOffers.map(o => o._id));

            const blockedByCompaniesForSpecificOffers = new Set();
            const blockedByCompaniesForAllOffers = new Set();

            for (const offer of uniqueJobOffers) {
                const companyId = offer.companyId?.toString() || offer.company?.id?.toString();
                if (!companyId) continue;

                try {
                    const [specificRes, normalRes] = await Promise.all([
                        axios.get(
                            `${BASE_URL}/api/swiped/checkCompanySwipe?companyId=${companyId}&userId=${swiperId}&jobOfferId=${offer._id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        ),
                        axios.get(
                            `${BASE_URL}/api/swiped/checkCompanySwipeNormal?companyId=${companyId}&userId=${swiperId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        ),
                    ]);

                    if (specificRes.data.exists) {
                        blockedByCompaniesForSpecificOffers.add(offer._id.toString());
                    }

                    if (normalRes.data.exists) {
                        blockedByCompaniesForAllOffers.add(companyId);
                    }
                } catch (error) {
                    console.error("Erreur lors du filtre entreprise:", error);
                }
            }

            const finalJobOffers = uniqueJobOffers.filter(
                offer =>
                    !blockedByCompaniesForSpecificOffers.has(offer._id.toString()) &&
                    !blockedByCompaniesForAllOffers.has(offer.companyId)
            );

            console.log("Liste finale des offres après TOUS les filtres :", finalJobOffers);

            if (finalJobOffers.length === 0) {
                setHasMoreOffers(false);
                return;
            }

            setJobOffers(prev => [...prev, ...finalJobOffers]);
            setCurrentPage(page);

        } catch (error) {
            console.error(' Error fetching job offers:', error);
        } finally {
            setIsFetchingMore(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
      const connectWebSocket = async () => {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('userToken');
        const rawToken = token?.replace("Bearer ", "");

        if (!userId || !rawToken) return;

        const socket = new SockJS(`${BASE_URL}/ws?token=${rawToken}`);
        const stomp = Stomp.over(socket);
        stomp.debug = null;

        stomp.connect({}, () => {
          stomp.subscribe(`/topic/messages/${userId}`, (message) => {
            const msg = JSON.parse(message.body);
            console.log("📩 Nouveau message reçu :", msg);
            setUnreadCount((prev) => prev + 1);
          });
        });
      };

      connectWebSocket();
    }, []);

    useEffect(() => {
      const connectNotificationWebSocket = async () => {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('userToken');
        const rawToken = token?.replace("Bearer ", "");

        if (!userId || !rawToken) return;

        const socket = new SockJS(`${BASE_URL}/ws?token=${rawToken}`); // ← ajoute cette ligne
        const stomp = Stomp.over(socket); // ← ajoute cette ligne
        stomp.debug = null;

        stomp.connect({}, () => {
          stomp.subscribe(`/topic/notifications/${userId}`, (message) => {
            const msg = JSON.parse(message.body);
            console.log('Notification reçue !', msg);

            if (msg.type === "match") {
              setUnreadCount((prev) => prev + 1);

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

      connectNotificationWebSocket();
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
      const fetchUserData = async () => {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);
        console.log("ID utilisateur récupéré :", storedUserId);
      };

      fetchUserData();
      fetchJobOffers(0); // juste ça ici
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
                `${BASE_URL}/api/matches/swipe/individual`,
                { swiperId, swipedId, companyId },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

            await axios.post(
                `${BASE_URL}/api/swiped/save`,
                { swiperId, swipedId, direction },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );
            const matchResponse = await axios.post(
                `${BASE_URL}/api/matches/match`,
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
                `${BASE_URL}/api/swiped/save`,
                { swiperId, swipedId, direction },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

            const matchResponse = await axios.post(
                `${BASE_URL}/api/matches/match`,
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

               <TouchableOpacity style={styles.chatButton}
               onPress={() => {
                 setUnreadCount(0);
                 navigation.navigate("ChatPage");
               }}
>
                 <Text style={styles.buttonText}>Chat</Text>
                 {unreadCount > 0 && (
                   <View style={styles.dot} />
                 )}

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
                       cards={jobOffers}
                       renderCard={(offer) => {
                         if (!offer || !offer.title) {
                           return (
                             <View style={styles.card}>
                               <Text style={styles.cardTitle}>Aucune autre offre</Text>
                               <Text style={styles.cardDescription}>Vous avez terminé cette catégorie.</Text>
                             </View>
                           );
                         }

                         return (
                           <View key={offer._id} style={styles.card}>
                             <Text style={styles.cardTitle}>{offer.title}</Text>
                             <Text style={styles.cardDate}>
                               {offer.createdAt ? `Créée le ${new Date(offer.createdAt).toLocaleDateString('fr-FR')}` : ''}
                             </Text>

                             <Text style={styles.cardDescription}>
                                     {offer.description || "Description indisponible"}
                                   </Text>
                           </View>
                         );
                       }}

                       onSwiped={(cardIndex) => {
                         swiperIndexRef.current = cardIndex + 1; // met à jour l'index courant

                         const remainingCards = jobOffers.length - (cardIndex + 1);

                         if (remainingCards <= 2 && hasMoreOffers && !isFetchingMore) {
                           setTimeout(() => {
                             fetchJobOffers(currentPage + 1);
                           }, 300); // petit délai pour ne pas perturber le swipe
                         }
                       }}
                       onSwipedRight={(cardIndex) => handleSwipeRight(cardIndex)}
                       onSwipedLeft={(cardIndex) => handleSwipeLeft(cardIndex)}
                       cardIndex={swiperIndexRef.current} // ici on gère nous-même la position
                       backgroundColor={'#0f172a'}
                       stackSize={3}
                     />
                 )}
             </View>
         </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
      title: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
      chatButton: {
        position: 'relative',
        backgroundColor: '#3b82f6',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
      },
      buttonText: { color: 'white', fontWeight: 'bold' },
      badge: {
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
    topButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 20,
    },cardDate: {
        fontSize: 12,
        color: '#cbd5e1',
        marginBottom: 8,
        textAlign: 'center',
      }
,
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
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'red',
      position: 'absolute',
      top: -5,
      right: -10,
    },
});

export default IndividualHomePage;
