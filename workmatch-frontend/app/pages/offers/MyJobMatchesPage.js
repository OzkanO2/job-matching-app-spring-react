import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyJobMatchesPage = () => {
    const navigation = useNavigation();
    const [matches, setMatches] = useState([]);
    const [likes, setLikes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatchesAndLikes = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const username = await AsyncStorage.getItem('username');

                if (!token || !username) {
                    throw new Error('No token or username found');
                }

                const bearerToken = `${token}`;

                // Fetch matches
                const matchesResponse = await axios.get(`http://localhost:8080/matches/user/${username}`, {
                    headers: {
                        Authorization: bearerToken,
                    },
                });

                // Fetch likes
                const likesResponse = await axios.get(`http://localhost:8080/likes/user/${username}`, {
                    headers: {
                        Authorization: bearerToken,
                    },
                });

                setMatches(matchesResponse.data);
                setLikes(likesResponse.data);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load matches and likes:", error);
                setError(error);
                setIsLoading(false);
            }
        };

        fetchMatchesAndLikes();

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
                <Button title="My Offers" onPress={() => navigation.navigate('MyJobMatchesPage')} />
            </View>
            <View style={styles.content}>
                <Text style={styles.infoText}>My Matches</Text>
                {isLoading ? (
                    <Text>Loading...</Text>
                ) : error ? (
                    <Text>Error loading matches and likes</Text>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Matched Jobs</Text>
                        {matches.length > 0 ? (
                            matches.map((match, index) => (
                                <View key={index} style={styles.matchCard}>
                                    <Text>Job: {match.jobOffer.info}</Text>
                                    <Text>Company: {match.jobOffer.company}</Text>
                                    <Text>Location: {match.jobOffer.location}</Text>
                                </View>
                            ))
                        ) : (
                            <Text>No matches found</Text>
                        )}

                        <Text style={styles.sectionTitle}>Liked Jobs</Text>
                        {likes.length > 0 ? (
                            likes.map((like, index) => (
                                <View key={index} style={styles.likeCard}>
                                    <Text>Job: {like.offerId}</Text>
                                </View>
                            ))
                        ) : (
                            <Text>No liked jobs found</Text>
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
    matchCard: {
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
    },
    likeCard: {
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#f0f0f0',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
    },
});

export default MyJobMatchesPage;
