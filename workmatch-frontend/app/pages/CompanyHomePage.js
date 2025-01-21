import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CompanyHomePage = () => {
    const navigation = useNavigation();
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const response = await axios.get('http://localhost:8080/candidates', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCandidates(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching candidates:', error);
            }
        };

        fetchCandidates();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
            </View>
            <Text style={styles.title}>Candidates</Text>
            {isLoading ? (
                <Text>Loading...</Text>
            ) : (
                candidates.map((candidate, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.cardTitle}>{candidate.name}</Text>
                        <Text>{candidate.skills}</Text>
                    </View>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    topButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: { padding: 10, marginVertical: 5, backgroundColor: '#f9f9f9', borderRadius: 5 },
    cardTitle: { fontWeight: 'bold' },
});

export default CompanyHomePage;
