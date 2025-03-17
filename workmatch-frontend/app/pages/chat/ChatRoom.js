import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { ActivityIndicator } from 'react-native';

const ChatRoom = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { conversationId, username } = route.params;

    const [newMessage, setNewMessage] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userId, setUserId] = useState(null);
    const [receiverId, setReceiverId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [matchInfo, setMatchInfo] = useState(null);
    const {matchedUserId, matchedUserName } = route.params;

    useEffect(() => {
        const fetchMatchInfo = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (!storedUserId || !matchedUserId) return;

                const token = await AsyncStorage.getItem('userToken');
                const response = await axios.get(
                    `http://localhost:8080/api/matches/reason/${storedUserId}/${matchedUserId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setMatchInfo(response.data);
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des raisons du match :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatchInfo();
    }, [matchedUserId]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem("userId");
                const storedReceiverId = route.params.username;

                console.log("userId:", storedUserId);
                console.log("receiverId:", storedReceiverId);

                setUserId(storedUserId);
                setReceiverId(storedReceiverId);
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des identifiants :", error);
            }
        };

        fetchUserData();
    }, [route.params]);



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
        const socket = new SockJS("http://localhost:8080/ws", null, {
            transports: ["websocket", "xhr-streaming", "xhr-polling"],
            withCredentials: false,
        });

        const stomp = Stomp.over(socket);
        stomp.debug = null;

        stomp.connect({}, () => {
            console.log("✅ Connecté au WebSocket");

            stomp.subscribe(`/topic/messages/${conversationId}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                console.log("📩 Message reçu en WebSocket :", receivedMessage);
                setMessages((prev) => [...prev, receivedMessage]);
            });

            setStompClient(stomp);
        }, (error) => {
            console.error("❌ Erreur connexion WebSocket :", error);
        });

        return () => {
            if (stomp) stomp.disconnect();
        };
    }, [conversationId]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !userId || !receiverId) {
            console.error("❌ Impossible d'envoyer le message : userId ou receiverId manquant.");
            return;
        }

        const message = {
            conversationId,
            senderId: userId,
            receiverId: receiverId,
            content: newMessage,
        };

        console.log("📩 Message envoyé via WebSocket :", message);

        if (stompClient && stompClient.connected) {
            stompClient.send(`/app/send/${conversationId}`, {}, JSON.stringify(message));
            console.log("✅ Message envoyé via WebSocket");
        } else {
            console.error("❌ WebSocket non connecté !");
        }

        setNewMessage("");
    };


    return (
        <View style={styles.container}>
            <Button title="Retour" onPress={() => navigation.goBack()} />

            <Text style={styles.header}>Conversation avec {username}</Text>
<Text>💬 Chat avec {matchedUserName}</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <View>
                    <Text>📌 Pourquoi l'entreprise a liké ?</Text>
                    <Text>{matchInfo?.companyReason || "Non disponible"}</Text>

                    <Text>📌 Pourquoi le candidat a liké ?</Text>
                    <Text>{matchInfo?.individualReason || "Non disponible"}</Text>
                </View>
            )}
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
        textAlign: "center",
        backgroundColor: "#007AFF",
        color: "#fff",
        borderRadius: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: "#fff",
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
