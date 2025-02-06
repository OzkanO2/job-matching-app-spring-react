import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ChatPage = () => {
    const navigation = useNavigation();
    const [userType, setUserType] = useState('');
    const [userId, setUserId] = useState(null);
    const [conversations, setConversations] = useState([]); // ✅ Ajoute le state des conversations

    useEffect(() => {
        const fetchUserType = async () => {
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);
        };

        const fetchConversations = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const storedUserId = await AsyncStorage.getItem('userId');

                if (!token || !storedUserId) {
                    console.error("❌ Token ou UserId manquant !");
                    return;
                }

                setUserId(storedUserId);

                const response = await axios.get(`http://localhost:8080/api/conversations/${storedUserId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setConversations(response.data);
                console.log("✅ Conversations chargées :", response.data);
            } catch (error) {
                console.error("❌ Erreur lors du chargement des conversations :", error);
            }
        };

        fetchUserType();
        fetchConversations();

        navigation.setOptions({
            headerLeft: null,
        });
    }, [navigation]);

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
            <Text style={styles.header}>Chat</Text>
            {conversations && conversations.length > 0 ? (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item._id} // ✅ Ajoute une clé unique pour chaque conversation
                    renderItem={({ item }) => (
                        <View style={styles.chatItem}>
                            <Text>{item.user1Id} ↔ {item.user2Id}</Text>
                        </View>
                    )}
                />
            ) : (
                <Text>Aucune conversation trouvée.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    chatItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default ChatPage;
