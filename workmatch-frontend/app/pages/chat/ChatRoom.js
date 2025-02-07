import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const ChatRoom = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { conversationId, username } = route.params; // 🔹 Récupère le match sélectionné

    const [newMessage, setNewMessage] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);

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

    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws");
        const stomp = Stomp.over(socket);

        stomp.connect({}, () => {
            console.log("✅ Connecté au WebSocket");
            stomp.subscribe(`/topic/messages/${conversationId}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages((prev) => [...prev, receivedMessage]);
            });

            setStompClient(stomp);
        });

        return () => {
            if (stomp) stomp.disconnect();
        };
    }, [conversationId]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const message = {
            conversationId,
            content: newMessage,
        };

        if (stompClient) {
            stompClient.send(`/app/sendMessage/${conversationId}`, {}, JSON.stringify(message));
        }

        setNewMessage("");
    };

    return (
        <View style={styles.container}>
            <Button title="Retour" onPress={() => navigation.goBack()} />

            <Text style={styles.header}>Conversation avec {username}</Text>

            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <Text style={item.senderId === username ? styles.sentMessage : styles.receivedMessage}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 10,
    },
    header: {
        fontSize: 18,
        fontWeight: "bold",
        padding: 10,
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

export default ChatRoom;
