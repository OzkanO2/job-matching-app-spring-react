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

                // 🔹 Vérifier et récupérer le username du match
                const formattedConversations = response.data.map((conv, index) => ({
                    conversationId: conv._id || `temp_${index}`, // 🔥 Evite les erreurs undefined
                    username: conv.user1Id === id ? conv.user2Id : conv.user1Id, // 🔥 Récupérer l'autre utilisateur
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
                keyExtractor={(item, index) => item.conversationId.toString()} // 🔥 Correction ici
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
