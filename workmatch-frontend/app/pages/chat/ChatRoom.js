import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { ActivityIndicator } from 'react-native';
import { TouchableOpacity } from 'react-native';

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

                if (!storedUserId || !matchedUserId) {
                    console.warn("⚠️ [fetchMatchInfo] userId ou matchedUserId manquant !");
                    return;
                }

                const token = await AsyncStorage.getItem('userToken');

                // 🔄 Mettre les IDs dans l'ordre lexicographique
                const [id1, id2] = [storedUserId, matchedUserId].sort();

                console.log("📡 [fetchMatchInfo] Récupération des raisons du match entre", id1, "et", id2);

                const response = await axios.get(
                    `http://localhost:8080/api/matches/reason/${id1}/${id2}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log("✅ [fetchMatchInfo] Données reçues :", response.data);
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
                const storedReceiverId = route.params.matchedUserId;

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

        {/* Bouton retour stylé */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>⬅️ Retour</Text>
        </TouchableOpacity>

        {/* Titre */}
        <Text style={styles.header}>Conversation avec {username}</Text>
        <Text style={{ color: "#ffffff", textAlign: 'center', marginBottom: 10 }}>
          💬 Chat avec {matchedUserName}
        </Text>

        {/* Raison du match */}
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : (
          <View style={styles.matchInfo}>
            <Text style={styles.matchLabel}>📌 Pourquoi l'entreprise a liké ?</Text>
            <Text style={styles.matchText}>{matchInfo?.companyReason || "Non disponible"}</Text>

            <Text style={styles.matchLabel}>📌 Pourquoi le candidat a liké ?</Text>
            <Text style={styles.matchText}>{matchInfo?.individualReason || "Non disponible"}</Text>
          </View>
        )}

        {/* Liste des messages */}
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={item.senderId === userId ? styles.sentMessage : styles.receivedMessage}>
              {item.content}
            </Text>
          )}
        />

        {/* Champ de texte */}
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Écrire un message..."
          placeholderTextColor="#94a3b8"
        />

        {/* Bouton envoyer stylé */}
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>📤 Envoyer</Text>
        </TouchableOpacity>
      </View>
    );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // fond sombre
    padding: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 12,
    textAlign: "center",
    backgroundColor: "#2563eb", // bleu intense
    color: "#ffffff",
    borderRadius: 12,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#475569",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 10,
    color: "#ffffff",
    marginTop: 10,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: "75%",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#334155",
    color: "#ffffff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: "75%",
  },
  matchInfo: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#1e293b",
    borderRadius: 10,
  },
  matchLabel: {
    color: "#93c5fd",
    fontWeight: "bold",
    marginBottom: 4,
  },
  matchText: {
    color: "#ffffff",
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  sendButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ChatRoom;
