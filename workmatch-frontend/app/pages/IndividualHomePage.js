import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';

const IndividualHomePage = () => {
    const navigation = useNavigation();
    const [jobOffers, setJobOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobOffers = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const response = await axios.get('http://localhost:8080/joboffers', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setJobOffers(response.data);
            } catch (error) {
                console.error('Error fetching job offers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobOffers();
    }, []);

    const handleSwipeRight = (index) => {
        console.log(`Liked job offer: ${jobOffers[index]?.title}`);
    };

    const handleSwipeLeft = (index) => {
        console.log(`Ignored job offer: ${jobOffers[index]?.title}`);
    };

    return (
        <View style={styles.container}>
            {/* Boutons de navigation en haut */}
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate('IndividualHome')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
            </View>

            {/* Suppression de l'en-tête "Job Offers" */}
            {/* <Text style={styles.title}>Job Offers</Text> */}

            {/* Swiping Cards */}
            <View style={styles.swiperContainer}>
                {isLoading ? (
                    <Text>Loading...</Text>
                ) : (
                    <Swiper
                        cards={jobOffers}
                        renderCard={(offer) => (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{offer.title}</Text>
                                <Text style={styles.cardDescription}>
                                    {offer.description.length > 150
                                        ? `${offer.description.slice(0, 150)}...`
                                        : offer.description}
                                </Text>
                            </View>
                        )}
                        onSwipedRight={(cardIndex) => handleSwipeRight(cardIndex)}
                        onSwipedLeft={(cardIndex) => handleSwipeLeft(cardIndex)}
                        cardIndex={0}
                        backgroundColor={'#f3f3f3'}
                        stackSize={3}
                        infinite
                    />
                )}
            </View>
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
        paddingHorizontal: 10,
        marginTop: 20,
        marginBottom: 10, // Ajout pour séparer les boutons des cartes
        zIndex: 1, // S'assurer que les boutons restent visibles
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    swiperContainer: {
        flex: 1, // S'assurer que le Swiper prend tout l'espace restant
        marginTop: 10,
    },
    card: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 20,
        marginHorizontal: 10,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
    },
    cardDescription: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
    },
});

export default IndividualHomePage;
