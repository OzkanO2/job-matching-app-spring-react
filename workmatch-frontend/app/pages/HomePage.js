import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomePage = () => {
    const navigation = useNavigation();
    const [jobOffers, setJobOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userType, setUserType] = useState('');

    useEffect(() => {
        const fetchUserType = async () => {
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);
        };

        fetchUserType();

        navigation.setOptions({
            headerLeft: null,
        });

        console.log("Fetching job offers from backend...");

        // Fetch job offers from backend
        axios.get('http://localhost:8080/job-offers', {
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

    const navigateToOffersPage = () => {
        if (userType === 'INDIVIDUAL') {
            navigation.navigate('MyJobMatchesPage');
        } else if (userType === 'COMPANY') {
            navigation.navigate('MyCompanyOffersPage');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate('Home')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={navigateToOffersPage} />
            </View>
            <View style={styles.content}>
                <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.photo} />
                <Text style={styles.infoText}>Job Offers</Text>
                {isLoading ? (
                    <Text>Loading...</Text>
                ) : error ? (
                    <Text>Error loading job offers</Text>
                ) : jobOffers.length > 0 ? (
                    jobOffers.map((job, index) => (
                        <View key={index} style={styles.jobCard}>
                            <Text>{job.info}</Text>
                            <Text>Company: {job.company}</Text>
                            <Text>Location: {job.location}</Text>
                            <Text>Description: {job.description}</Text>
                            <Text>Salary: {job.salaryMin} - {job.salaryMax}</Text>
                            <Text>Certification: {job.companyCertified ? 'Certified' : 'Not Certified'}</Text>
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
