import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyCompanyOffersPage = () => {
    const navigation = useNavigation();
    const [offers, setOffers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOffersAndMatches = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const username = await AsyncStorage.getItem('username');

                if (!token || !username) {
                    throw new Error('No token or username found');
                }

                const bearerToken = `${token}`;

                // Fetch offers
                const offersResponse = await axios.get(`http://localhost:8080/job-offers/company/${username}`, {
                    headers: {
                        Authorization: bearerToken,
                    },
                });

                // Fetch matches
                const matchesResponse = await axios.get(`http://localhost:8080/matches/company/${username}`, {
                    headers: {
                        Authorization: bearerToken,
                    },
                });

                setOffers(offersResponse.data);
                setMatches(matchesResponse.data);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load offers and matches:", error);
                setError(error);
                setIsLoading(false);
            }
        };

        fetchOffersAndMatches();

        navigation.setOptions({
            headerLeft: null,
        });
    }, [navigation]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate('Home')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyCompanyOffersPage')} />
            </View>
            <View style={styles.content}>
                <Text style={styles.infoText}>My Company Offers</Text>
                {isLoading ? (
                    <Text>Loading...</Text>
                ) : error ? (
                    <Text>Error loading offers and matches</Text>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Created Job Offers</Text>
                        {offers.length > 0 ? (
                            offers.map((offer, index) => (
                                <View key={index} style={styles.offerCard}>
                                    <Text>Job: {offer.info}</Text>
                                    <Text>Location: {offer.location}</Text>
                                    <Text>Salary: {offer.salaryMin} - {offer.salaryMax}</Text>
                                </View>
                            ))
                        ) : (
                            <Text>No job offers found</Text>
                        )}

                        <Text style={styles.sectionTitle}>Matches</Text>
                        {matches.length > 0 ? (
                            matches.map((match, index) => (
                                <View key={index} style={styles.matchCard}>
                                    <Text>User: {match.matchedUsers.map(user => user.username).join(', ')}</Text>
                                    <Text>Job: {match.jobOffer.info}</Text>
                                </View>
                            ))
                        ) : (
                            <Text>No matches found</Text>
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 10,
    },
    offerCard: {
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
    },
    matchCard: {
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#f0f0f0',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
    },
});

export default MyCompanyOffersPage;
