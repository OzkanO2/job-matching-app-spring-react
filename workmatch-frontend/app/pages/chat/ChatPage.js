import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../../constants/api';

const ChatPage = ({ route }) => {
    const navigation = useNavigation();
    const [userType, setUserType] = useState('');
    const [userId, setUserId] = useState('');
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserType = async () => {
            const type = await AsyncStorage.getItem('userType');
            const id = await AsyncStorage.getItem('userId');
            setUserType(type);
            setUserId(id);
        };

        fetchUserType();
    }, []);

    useEffect(() => {
      const resetUnreadCount = async () => {
        await AsyncStorage.setItem('unreadMessageCount', '0');
      };

      const unsubscribe = navigation.addListener('focus', () => {
        resetUnreadCount();
      });

      return unsubscribe;
    }, [navigation]);

    useFocusEffect(
      useCallback(() => {
        const loadUnreadByConversation = async () => {
          const stored = await AsyncStorage.getItem('unreadByConversation');
          const unreadMap = stored ? JSON.parse(stored) : {};

          setConversations(prev =>
            prev.map(conv => ({
              ...conv,
              unread: unreadMap[conv.conversationId] || 0
            }))
          );
        };

        loadUnreadByConversation();
      }, [])
    );
    useEffect(() => {
      let stomp = null;
      let socket = null;

      const connectSocket = async () => {
        const userId = await AsyncStorage.getItem("userId");

        socket = new SockJS('${BASE_URL}/ws');
        stomp = Stomp.over(socket);
        stomp.debug = null;

        stomp.connect({}, () => {
          console.log("WebSocket ChatPage connecté");

          stomp.subscribe(`/topic/notifications/${userId}`, async (message) => {
            const msg = JSON.parse(message.body);
            const conversationId = msg.conversationId;

            console.log("Notification reçue pour conversation :", conversationId);

            // Mettre à jour unreadByConversation
            const unreadRaw = await AsyncStorage.getItem("unreadByConversation");
            const unreadMap = unreadRaw ? JSON.parse(unreadRaw) : {};
            unreadMap[conversationId] = (unreadMap[conversationId] || 0) + 1;
            await AsyncStorage.setItem("unreadByConversation", JSON.stringify(unreadMap));

            // Mettre à jour le total global
            const total = Object.values(unreadMap).reduce((acc, val) => acc + val, 0);
            await AsyncStorage.setItem("unreadMessageCount", total.toString());

            // Mettre à jour visuellement
            setConversations(prev =>
              prev.map(conv =>
                conv.conversationId === conversationId
                  ? { ...conv, unread: unreadMap[conversationId] }
                  : conv
              )
            );
          });
        });
      };

      connectSocket();

      return () => {
        if (stomp) stomp.disconnect();
        if (socket) socket.close();
      };
    }, []);

    useEffect(() => {
      const fetchConversations = async () => {
        try {
          const token = await AsyncStorage.getItem("userToken");
          const id = await AsyncStorage.getItem("userId");
          setLoading(true);

          const response = await axios.get(`${BASE_URL}/api/matches/conversations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          let formattedConversations = response.data.map(conv => ({
            conversationId: conv.id,
            receiverId: conv.user1Id === id ? conv.user2Id : conv.user1Id,
            username: null,
          }));

          const receiverIds = formattedConversations.map(conv => conv.receiverId);
          const usersResponse = await axios.post('${BASE_URL}/users/getUsernames', {
            userIds: receiverIds
          });
          const userMap = usersResponse.data;

          const unreadMapRaw = await AsyncStorage.getItem('unreadByConversation');
          const unreadMap = unreadMapRaw ? JSON.parse(unreadMapRaw) : {};

          formattedConversations = formattedConversations.map(conv => ({
            ...conv,
            username: userMap[conv.receiverId] || "Utilisateur inconnu",
            unread: unreadMap[conv.conversationId] || 0
          }));

          setConversations(formattedConversations);

        } catch (error) {
          console.error("Erreur chargement des conversations :", error);
        } finally {
          setLoading(false);
        }
      };

      fetchConversations();
    }, []);
const handleDeleteConversation = async (conversationId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    await axios.delete(`${BASE_URL}/api/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setConversations(prev => prev.filter(c => c.conversationId !== conversationId));
  } catch (error) {
    console.error("Erreur suppression conversation :", error);
  }
};


    useEffect(() => {
      const loadUnreadByConversation = async () => {
        try {
          const stored = await AsyncStorage.getItem('unreadByConversation');
          const unreadMap = stored ? JSON.parse(stored) : {};

          setConversations(prev =>
            prev.map(conv => ({
              ...conv,
              unread: unreadMap[conv.conversationId] || 0
            }))
          );
        } catch (error) {
          console.error('Erreur chargement des unreadByConversation :', error);
        }
      };

      const unsubscribe = navigation.addListener('focus', () => {
        loadUnreadByConversation();
      });

      return unsubscribe;
    }, [navigation]);


    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: '#3b82f6' }]}
                onPress={() => navigation.navigate('ProfilePage')}
              >
                <Text style={styles.navButtonText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: '#60a5fa' }]}
                onPress={() =>
                  navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')
                }
              >
                <Text style={styles.navButtonText}>Main Menu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: '#93c5fd' }]}
                onPress={() => navigation.navigate('ChatPage')}
              >
                <Text style={styles.navButtonText}>Chat</Text>
              </TouchableOpacity>

              {userType === 'INDIVIDUAL' && (
                <TouchableOpacity
                  style={[styles.navButton, { backgroundColor: '#bfdbfe' }]}
                  onPress={() => navigation.navigate('LikedOffersPage')}
                >
                  <Text style={styles.navButtonText}>Liked Offers</Text>
                </TouchableOpacity>
              )}

              {userType === 'COMPANY' && (
                <>
                  <TouchableOpacity
                    style={[styles.navButton, { backgroundColor: '#bfdbfe' }]}
                    onPress={() => navigation.navigate('MyOffersPage')}
                  >
                    <Text style={styles.navButtonText}>My Offers</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.navButton, { backgroundColor: '#dbeafe' }]}
                    onPress={() => navigation.navigate('LikedCandidatesPage')}
                  >
                    <Text style={styles.navButtonText}>Liked Candidates</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <Text style={styles.title}>💬 Conversations</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.conversationId}
                    renderItem={({ item }) => (
                      <View style={styles.conversationItem}>
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => navigation.navigate("ChatRoom", {
                            conversationId: item.conversationId,
                            matchedUserId: item.receiverId,
                            matchedUserName: item.username
                          })}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                              style={{ flex: 1 }}
                              onPress={() => navigation.navigate("ChatRoom", {
                                conversationId: item.conversationId,
                                matchedUserId: item.receiverId,
                                matchedUserName: item.username
                              })}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.username}>{item.username}</Text>
                                {item.unread > 0 && <View style={styles.dot} />}
                              </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => handleDeleteConversation(item.conversationId)}
                            >
                              <Text style={styles.deleteText}>🗑️</Text>
                            </TouchableOpacity>
                          </View>

                        </TouchableOpacity>
                      </View>
                    )}
                />
            )}
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
        justifyContent: "space-around",
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
        padding: 10,
        textAlign: "center",
    },
conversationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#475569",
    backgroundColor: "#1e293b",
    marginBottom: 6,
    borderRadius: 10,
},
    username: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ffffff",
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
      marginHorizontal: 5,
      marginBottom: 10,
    },
    navButtonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
deleteButton: {
  padding: 10,
  backgroundColor: "#dc2626",
  borderRadius: 8,
  marginLeft: 10,
  alignSelf: "center",
},
deleteText: {
  color: "white",
  fontWeight: "bold",
},
badge: {
  backgroundColor: 'red',
  borderRadius: 10,
  marginLeft: 8,
  paddingHorizontal: 6,
  paddingVertical: 2,
  justifyContent: 'center',
  alignItems: 'center',
},
badgeText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 10,
},
dot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: 'red',
  marginLeft: 8,
},



});

export default ChatPage;
