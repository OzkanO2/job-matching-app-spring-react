import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LikedPage = () => {
    const navigation = useNavigation();
    const [likedCandidates, setLikedCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState('');

    const fetchUserType = async () => {
        const type = await AsyncStorage.getItem('userType');
        setUserType(type);
    };

    useEffect(() => {
        const fetchLikedCandidates = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const companyId = await AsyncStorage.getItem('userId');

                if (!token || !companyId) {
                    console.error("❌ Token ou userId manquant !");
                    return;
                }

                console.log("📌 Récupération des candidats likés pour :", companyId);

                const response = await axios.get(`http://localhost:8080/api/likes/company/${companyId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setLikedCandidates(response.data);
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des candidats likés :", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLikedCandidates();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
                <Button title="Liked Candidates" onPress={() => navigation.navigate('LikedPage')} />

            </View>

            {isLoading ? (
                <Text style={styles.loadingText}>Chargement...</Text>
            ) : likedCandidates.length > 0 ? (
                <FlatList
                    data={likedCandidates}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.info}>📍 {item.location || "Non précisé"}</Text>
                            <Text style={styles.info}>💼 {item.skills ? item.skills.join(', ') : "Aucune compétence listée"}</Text>
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.noCandidates}>Aucun candidat liké.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
    },
    noCandidates: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 3,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    info: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
});

export default LikedPage;
