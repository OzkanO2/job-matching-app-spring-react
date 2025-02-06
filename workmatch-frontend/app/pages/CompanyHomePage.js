import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';

const CompanyHomePage = () => {
    const navigation = useNavigation();
    const [jobSearchers, setJobSearchers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState('');

    useEffect(() => {
        const fetchUserType = async () => {
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);
        };

        fetchUserType();
        const fetchJobSearchers = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    console.error("❌ Aucun token trouvé !");
                }
                console.log("🔑 JWT Token récupéré :", token);
                const response = await axios.get('http://localhost:8080/jobsearchers', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setJobSearchers(response.data);
            } catch (error) {
                console.error('Error fetching job searchers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobSearchers();
    }, []);

    const handleSwipeRight = async (index) => {
        const swipedJobSearcher = jobSearchers[index];

        if (!swipedJobSearcher) {
            console.error("❌ Aucun job searcher trouvé pour cet index.");
            return;
        }

        const swipedId = swipedJobSearcher.id;
        const swiperId = await AsyncStorage.getItem("userId");

        if (!swiperId || !swipedId) {
            console.error("❌ swiperId ou swipedId est manquant !");
            return;
        }

        console.log("✅ swiperId envoyé :", swiperId);
        console.log("✅ swipedId envoyé :", swipedId);

        const direction = "right"; // ✅ Ajout de la direction

        try {
            const token = await AsyncStorage.getItem('userToken');

            // Enregistrer le like/match pour les swipes à droite (company)
            const response = await axios.post(
                "http://localhost:8080/api/matches/swipe/company",
                { swiperId, swipedId },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

            // Enregistrer tous les swipes (droite et gauche) dans `swipedCard`
            await axios.post(
                "http://localhost:8080/api/swiped/save",
                { swiperId, swipedId, direction }, // ✅ Envoie les IDs + la direction (right/left)
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

            console.log("✅ Réponse serveur :", response.data);
        } catch (error) {
            console.error('❌ Erreur lors du swipe:', error);
        }

    };


    const handleSwipeLeft = (index) => {
        console.log(`Ignored: ${jobSearchers[index]?.name}`);
    };

    return (
        <View style={styles.container}>
            {/* Boutons de navigation en haut */}
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate('CompanyHome')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
                {/* ✅ Bouton affiché uniquement pour COMPANY */}
                {userType === 'COMPANY' && (
                    <Button title="Liked Candidates" onPress={() => navigation.navigate('LikedPage')} />
                )}
            </View>

            {/* Swiping Cards */}
            <View style={styles.swiperContainer}>
                {isLoading ? (
                    <Text>Loading...</Text>
                ) : (
                    <Swiper
                        cards={jobSearchers}
                        renderCard={(jobSearcher) => (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{jobSearcher.name || 'No name provided'}</Text>
                                <Text style={styles.cardDescription}>
                                    Skills: {jobSearcher.skills ? jobSearcher.skills.join(', ') : 'No skills listed'}
                                </Text>
                                <Text>Experience: {jobSearcher.experience || 'No experience provided'}</Text>
                                <Text>Location: {jobSearcher.location || 'No location provided'}</Text>
                            </View>
                        )}

                        onSwipedRight={(cardIndex) => handleSwipeRight(cardIndex)}
                        onSwipedLeft={(cardIndex) => handleSwipeLeft(cardIndex)}
                        cardIndex={0}
                        stackSize={3}
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
        padding: 10,
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    swiperContainer: {
        flex: 1,
        marginTop: 20,
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

export default CompanyHomePage;
