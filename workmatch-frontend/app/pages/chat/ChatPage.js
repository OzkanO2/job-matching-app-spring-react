import React, { useEffect, useState } from 'react';
import { Button, View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ChatPage = () => {
    const navigation = useNavigation();
    const [userType, setUserType] = useState('');
    const [userId, setUserId] = useState('');
    const [conversations, setConversations] = useState([]); // 🔹 Stocker les conversations

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
                const response = await axios.get(`http://localhost:8080/api/matches/conversations/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                let formattedConversations = response.data.map(conv => ({
                    conversationId: conv.id,
                    receiverId: conv.user1Id === id ? conv.user2Id : conv.user1Id, // Trouver l'autre utilisateur
                    username: null // Sera remplacé après récupération des usernames
                }));

                // 🔥 Récupérer les usernames correspondants
                const receiverIds = formattedConversations.map(conv => conv.receiverId);
                const usersResponse = await axios.post("http://localhost:8080/users/getUsernames", { userIds: receiverIds });

                const userMap = usersResponse.data; // { "67a0cb49dce20987f4326745": "juju", ... }

                // Associer les usernames aux conversations
                formattedConversations = formattedConversations.map(conv => ({
                    ...conv,
                    username: userMap[conv.receiverId] || "Utilisateur inconnu"
                }));

                setConversations(formattedConversations);
            } catch (error) {
                console.error("❌ Erreur chargement des conversations :", error);
            }
        };

        fetchConversations();
    }, []);

    return (
        <View style={styles.container}>
            {/* ✅ Boutons en haut */}
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
            </View>

            {/* ✅ Titre Conversations */}
            <Text style={styles.title}>💬 Conversations</Text>

            {/* ✅ Liste des conversations */}
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.conversationId}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.conversationItem}
                        onPress={() => navigation.navigate("ChatRoom", {
                            conversationId: item.conversationId,
                            username: item.username
                        })}
                    >
                        <Text style={styles.username}>{item.username}</Text>
                    </TouchableOpacity>
                )}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 10,
    },
    topButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        padding: 10,
    },
    conversationItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        backgroundColor: "#fff",
    },
    username: {
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default ChatPage;
