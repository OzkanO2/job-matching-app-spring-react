import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const HomePage = () => {
    const navigation = useNavigation();
    const [jobOffers, setJobOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        navigation.setOptions({
            headerLeft: null,
        });

        console.log("Fetching job offers from backend...");

        // Fetch job offers from backend
        axios.get('http://localhost:8080/adzuna/fetch', {
            params: {
                country: 'us',
                what: 'software developer'
            }
        })
            .then(response => {
                console.log('Job offers fetched:', response.data);
                setJobOffers(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching job offers:", error);
                setError(error);
                setIsLoading(false);
            });
    }, [navigation]);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate('Home')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
            </View>
            <View style={styles.content}>
                <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.photo} />
                <Text style={styles.infoText}>INFO (offre emploi ou du chercheur d'emploi) </Text>
                {jobOffers.length > 0 ? (
                    jobOffers.map((job, index) => (
                        <View key={index} style={styles.jobCard}>
                            <Text>{job.info}</Text>
                        </View>
                    ))
                ) : (
                    <Text>No job offers available</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
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
    photo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    infoText: {
        textAlign: 'center',
        marginBottom: 20,
    },
    jobCard: {
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
    },
});

export default HomePage;
