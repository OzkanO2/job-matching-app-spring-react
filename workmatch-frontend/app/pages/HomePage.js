import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomePage = () => {
    const [userType, setUserType] = useState('');
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const userTypeFromStorage = await AsyncStorage.getItem('userType');
                setUserType(userTypeFromStorage);

                const endpoint = userTypeFromStorage === 'COMPANY' ? '/candidates' : '/joboffers';
                const response = await axios.get(`http://localhost:8080${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <View style={styles.container}>
            {/* Boutons du haut */}
            <View style={styles.topButtons}>
                <Button title="PROFILE" onPress={() => console.log('Navigate to Profile')} />
                <Button title="CHAT" onPress={() => console.log('Navigate to Chat')} />
                <Button title="MY OFFERS" onPress={() => console.log('Navigate to My Offers')} />
            </View>

            {/* En-tête */}
            <Text style={styles.headerText}>{userType === 'COMPANY' ? 'Candidates' : 'Job Offers'}</Text>

            {/* Contenu principal */}
            <ScrollView contentContainerStyle={styles.content}>
                {isLoading ? (
                    <Text>Loading...</Text>
                ) : (
                    data.map((item, index) => (
                        <View key={index} style={styles.card}>
                            <Text style={styles.cardTitle}>{item.title || item.name}</Text>
                            <Text style={styles.cardDescription}>
                                {item.description?.slice(0, 200) || 'No description available'}...
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginTop: 20,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    content: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
    },
    cardDescription: {
        color: '#555',
    },
});

export default HomePage;
