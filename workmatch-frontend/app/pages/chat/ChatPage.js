import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
        const fetchConversations = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                const id = await AsyncStorage.getItem("userId");
                setLoading(true);

                const response = await axios.get(`http://localhost:8080/api/matches/conversations/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                let formattedConversations = response.data.map(conv => ({
                    conversationId: conv.id,
                    receiverId: conv.user1Id === id ? conv.user2Id : conv.user1Id,
                    username: null
                }));

                const receiverIds = formattedConversations.map(conv => conv.receiverId);
                const usersResponse = await axios.post("http://localhost:8080/users/getUsernames", { userIds: receiverIds });

                const userMap = usersResponse.data;

                formattedConversations = formattedConversations.map(conv => ({
                    ...conv,
                    username: userMap[conv.receiverId] || "Utilisateur inconnu"
                }));

                setConversations(formattedConversations);
            } catch (error) {
                console.error("❌ Erreur chargement des conversations :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
              <TouchableOpacity style={[styles.navButton, { backgroundColor: '#3b82f6' }]} onPress={() => navigation.navigate('ProfilePage')}>
                <Text style={styles.navButtonText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.navButton, { backgroundColor: '#60a5fa' }]} onPress={() => navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')}>
                <Text style={styles.navButtonText}>Main Menu</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.navButton, { backgroundColor: '#93c5fd' }]} onPress={() => navigation.navigate('ChatPage')}>
                <Text style={styles.navButtonText}>Chat</Text>
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
                          <Text style={styles.username}>{item.username}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={async () => {
                            try {
                              const token = await AsyncStorage.getItem("userToken");
                              await axios.delete(`http://localhost:8080/api/conversations/${item.conversationId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                              });

                              setConversations(prev =>
                                prev.filter(c => c.conversationId !== item.conversationId)
                              );
                            } catch (err) {
                              console.error("❌ Erreur suppression conversation :", err);
                            }
                          }}
                        >
                          <Text style={styles.deleteText}>🗑️</Text>
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
        backgroundColor: "#0f172a", // ancien : "#f9f9f9"
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
        color: "#ffffff", // 👈 texte blanc
        padding: 10,
        textAlign: "center",
    },
conversationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#475569", // ligne douce gris bleuté
    backgroundColor: "#1e293b", // fond carte sombre
    marginBottom: 6,
    borderRadius: 10,
},
    username: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ffffff", // 👈 texte blanc
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
  backgroundColor: "#dc2626", // rouge
  borderRadius: 8,
  marginLeft: 10,
  alignSelf: "center",
},
deleteText: {
  color: "white",
  fontWeight: "bold",
},

});

export default ChatPage;
