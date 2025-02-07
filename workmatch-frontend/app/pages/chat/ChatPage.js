import React, { useEffect, useState } from 'react';
import { Button, View, Text, TextInput, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { useRoute } from '@react-navigation/native';

const ChatPage = () => {
    const route = useRoute();
    const { conversationId, userId } = route.params || {};
    const navigation = useNavigation();
    const [userType, setUserType] = useState('');

    const [newMessage, setNewMessage] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchUserType = async () => {
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);
        };
        fetchUserType();

        const socket = new SockJS("http://localhost:8080/ws");
        const stomp = Stomp.over(socket);

        stomp.connect({}, () => {
            console.log("✅ Connecté au WebSocket");
            console.log("Conversation ID:", conversationId);
            console.log("User ID:", userId);
            stomp.subscribe("/topic/messages", (message) => {
                const receivedMessage = JSON.parse(message.body);
                if (receivedMessage.conversationId === conversationId) {
                    setMessages((prev) => [...prev, receivedMessage]);
                }
            });

            setStompClient(stomp);
        });

        return () => {
            if (stomp) stomp.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                const response = await axios.get(`http://localhost:8080/api/chat/${conversationId}/messages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages(response.data);
            } catch (error) {
                console.error("❌ Erreur chargement messages :", error);
            }
        };

        fetchMessages();
    }, [conversationId]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const message = {
            conversationId,
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
                {/* ✅ Bouton affiché uniquement pour COMPANY */}
                {userType === 'COMPANY' && (
                    <Button title="Liked Candidates" onPress={() => navigation.navigate('LikedPage')} />
                )}
            </View>
            {/* ✅ Contenu du Chat dans un ScrollView */}
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
