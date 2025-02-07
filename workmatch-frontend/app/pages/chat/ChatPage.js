import React, { useEffect, useState } from 'react';
import { Button, View, Text, TextInput, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const ChatPage = () => {
    const navigation = useNavigation();
    const [userId, setUserId] = useState(null);
    const [userType, setUserType] = useState('');
    const [newMessage, setNewMessage] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);

    // ✅ Récupération des infos utilisateur
    useEffect(() => {
        const fetchUserData = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            const storedUserType = await AsyncStorage.getItem('userType');
            setUserId(storedUserId);
            setUserType(storedUserType);
        };
        fetchUserData();
    }, []);

    // ✅ Récupération des conversations
    useEffect(() => {
        if (!userId) return;

        const fetchConversations = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                const response = await axios.get(`http://localhost:8080/api/matches/conversations/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("✅ Conversations récupérées :", response.data);
                setConversations(response.data);
            } catch (error) {
                console.error("❌ Erreur chargement des conversations :", error);
            }
        };

        fetchConversations();
    }, [userId]);

    // ✅ WebSocket pour la réception des messages
    useEffect(() => {
        if (!userId) return;

        const socket = new SockJS("http://localhost:8080/ws");
        const stomp = Stomp.over(socket);

        stomp.connect({}, () => {
            console.log("✅ Connecté au WebSocket");

            stomp.subscribe("/topic/messages", (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages((prev) => [...prev, receivedMessage]);
            });

            setStompClient(stomp);
        });

        return () => {
            if (stomp) stomp.disconnect();
        };
    }, [userId]);

    // ✅ Fonction d'envoi des messages
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const message = {
            senderId: userId,
            content: newMessage,
        };

        if (stompClient) {
            stompClient.send("/app/sendMessage", {}, JSON.stringify(message));
        }

        setNewMessage("");
    };

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
                {userType === 'COMPANY' && (
                    <Button title="Liked Candidates" onPress={() => navigation.navigate('LikedPage')} />
                )}
            </View>

            {/* ✅ Liste des conversations */}
            <Text style={styles.title}>💬 Conversations</Text>
            <FlatList
                data={conversations}
                keyExtractor={(item, index) => (item._id ? item._id.toString() : index.toString())}
                renderItem={({ item }) => {
                    const otherUser = item.user1Id === userId ? item.user2Id : item.user1Id;
                    return (
                        <TouchableOpacity
                            style={styles.conversationItem}
                            onPress={() => navigation.navigate("ChatRoom", {
                                conversationId: item._id,
                                username: otherUser
                            })}
                        >
                            <Text style={styles.username}>{otherUser}</Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* ✅ Contenu du chat */}
            <ScrollView contentContainerStyle={styles.chatContainer}>
                <FlatList
                    data={messages}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Text style={item.senderId === userId ? styles.sentMessage : styles.receivedMessage}>
                            {item.content}
                        </Text>
                    )}
                />
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Écrire un message..."
                />
                <Button title="Envoyer" onPress={sendMessage} />
            </ScrollView>
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
    },
    chatContainer: {
        flexGrow: 1,
        justifyContent: "flex-end",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    sentMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#007AFF",
        color: "#fff",
        padding: 8,
        borderRadius: 10,
        marginBottom: 5,
        maxWidth: "80%",
    },
    receivedMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#E5E5EA",
        padding: 8,
        borderRadius: 10,
        marginBottom: 5,
        maxWidth: "80%",
    },
});

export default ChatPage;
