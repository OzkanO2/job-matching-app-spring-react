import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { BASE_URL } from '../../../constants/api';

const MyOffersPage = () => {
    const navigation = useNavigation();
    const [userType, setUserType] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [jobOffers, setJobOffers] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
      const connectNotificationWebSocket = async () => {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const socket = new SockJS(`${BASE_URL}/ws`);
        const stomp = Stomp.over(socket);
        stomp.debug = null;

        stomp.connect({}, () => {
          stomp.subscribe(`/topic/notifications/${userId}`, (message) => {
            const msg = JSON.parse(message.body);
            console.log('Notification reçue dans CompanyHomePage !', msg);
            const senderId = msg.senderId;

            if (senderId !== userId) {
              setUnreadCount(1); // juste pour forcer l’affichage de la bulle

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
            const type = await AsyncStorage.getItem('userType');
            const id = await AsyncStorage.getItem('userId');
            console.log("UserType:", type);
            console.log("Company ID récupéré:", id);
            setUserType(type);
            setCompanyId(id);
        };

        fetchUserData();
    }, []);

    useFocusEffect(
      useCallback(() => {
        if (companyId && userType === 'COMPANY') {
          fetchJobOffers();
        }
      }, [companyId, userType])
    );


    const fetchJobOffers = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            console.log("Envoi de la requête Axios avec companyId:", companyId);
            const response = await axios.get(`${BASE_URL}/joboffers/company/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Réponse reçue:", response.data);
            setJobOffers(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des offres :", error);
        }
    };

    const handleDeleteOffer = async (offerId) => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            await axios.delete(`${BASE_URL}/joboffers/${offerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setJobOffers(prev => prev.filter((offer) => offer._id !== offerId));
        } catch (error) {
            console.error("Erreur lors de la suppression de l'offre :", error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>

              <TouchableOpacity style={[styles.navButton, { backgroundColor: '#3b82f6' }]} onPress={() => navigation.navigate('ProfilePage')}>
                <Text style={styles.navButtonText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.navButton, { backgroundColor: '#60a5fa' }]} onPress={() => navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')}>
                <Text style={styles.navButtonText}>Main Menu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => {
                    setUnreadCount(0); // on cache la pastille
                    navigation.navigate("ChatPage");
                  }}

                >
                  <Text style={styles.buttonText}>Chat</Text>
                  {unreadCount > 0 && (
                    <View style={styles.dot} />
                  )}


                </TouchableOpacity>


              <TouchableOpacity style={[styles.navButton, { backgroundColor: '#bfdbfe' }]} onPress={() => navigation.navigate('MyOffersPage')}>
                <Text style={styles.navButtonText}>My Offers</Text>
              </TouchableOpacity>

              {userType === 'COMPANY' && (
                <TouchableOpacity style={[styles.navButton, { backgroundColor: '#dbeafe' }]} onPress={() => navigation.navigate('LikedCandidatesPage')}>
                  <Text style={styles.navButtonText}>Liked Candidates</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: '#4ade80' }]}
              onPress={() => navigation.navigate('CreateOfferPage')}
            >
              <Text style={styles.navButtonText}>➕ Nouvelle offre</Text>
            </TouchableOpacity>


            <Text style={styles.title}>Mes Offres d'Emploi</Text>

            <FlatList
                data={jobOffers}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.jobOfferContainer}>
                      <TouchableOpacity
                        style={styles.jobOfferItem}
                        onPress={() => navigation.navigate("JobOfferDetails", { offer: item })}
                      >
                        <Text style={styles.jobTitle}>{item.title}</Text>
                        <Text style={styles.jobLocation}>{item.location}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editOfferButton}
                        onPress={() => navigation.navigate("EditOfferPage", { offer: item })}
                      >
                        <Text style={styles.buttonText}>Modifier</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.viewCandidatesButton}
                        onPress={() => navigation.navigate("CompanyRedirectedPage", { selectedOffer: item })}
                      >
                        <Text style={styles.buttonText}>Voir les candidats</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                            styles.deleteButton,
                            jobOffers.length === 1 && { opacity: 0.5 } // grisé si une seule offre
                          ]}
                        disabled={jobOffers.length === 1} // désactive le bouton si une seule offre



                        onPress={async () => {
                            if (jobOffers.length === 1) {
                                  alert("Vous ne pouvez pas supprimer votre dernière offre.");
                                  return;
                                }

                          try {
                            const token = await AsyncStorage.getItem("userToken");
                            await axios.delete(`${BASE_URL}/joboffers/${item._id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            setJobOffers(prev => prev.filter(o => o._id !== item._id));
                          } catch (err) {
                            console.error("Erreur suppression offre :", err);
                          }
                        }}
                      >
                        <Text style={styles.buttonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>

                )}
                ListEmptyComponent={() => <Text style={styles.noDataText}>Aucune offre disponible</Text>}
            />

        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 10,
  },
  topButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    paddingVertical: 10,
    textAlign: "center",
  },
  jobOfferContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  jobOfferItem: {
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  editOfferButton: {
    backgroundColor: "#facc15",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  viewCandidatesButton: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "bold",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#cbd5e1",
    marginTop: 30,
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  navButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
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

deleteButton: {
  backgroundColor: "#ef4444",
  padding: 10,
  borderRadius: 8,
  alignItems: "center",
  marginTop: 8,
},
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

    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    chatButton: {
      position: 'relative',
      backgroundColor: '#3b82f6',
      padding: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
});

export default MyOffersPage;
