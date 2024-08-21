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
            try {
                const storedUserType = await AsyncStorage.getItem('userType');
                console.log('Retrieved userType:', storedUserType);
                setUserType(storedUserType);
            } catch (error) {
                console.error("Failed to fetch userType:", error);
            }
        };

        fetchUserType();

        navigation.setOptions({
            headerLeft: null,
        });

        console.log("Fetching job offers from backend...");

        // Fonction pour récupérer des offres pour un domaine spécifique
        const fetchDomainJobs = async (domain, maxResults) => {
            const response = await axios.get('http://localhost:8080/adzuna/fetch', {
                params: {
                    country: 'us',
                    what: domain,
                    results_per_page: maxResults
                }
            });
            return response.data;
        };

        const fetchAllJobs = async () => {
            try {
                // Récupérer 200 jobs pour chaque domaine
                const itJobs = await fetchDomainJobs('software developer', 200);
                const marketingJobs = await fetchDomainJobs('marketing', 200);
                const financeJobs = await fetchDomainJobs('finance', 200);
                const healthcareJobs = await fetchDomainJobs('healthcare', 200);
                const salesJobs = await fetchDomainJobs('sales', 200);

                // Combiner les résultats
                const allJobs = [...itJobs, ...marketingJobs, ...financeJobs, ...healthcareJobs, ...salesJobs];

                setJobOffers(allJobs);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching job offers:", error);
                setError(error);
                setIsLoading(false);
            }
        };

        fetchAllJobs();
    }, [navigation]);

    const navigateToOffersPage = () => {
        console.log("Navigating to offers page, userType:", userType);
        if (userType === 'INDIVIDUAL') {
            console.log("Navigating to MyJobMatchesPage");
            navigation.navigate('MyJobMatchesPage');
        } else if (userType === 'COMPANY') {
            console.log("Navigating to MyCompanyOffersPage");
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
                <Text style={styles.infoText}>INFO (offre emploi ou du chercheur d'emploi)</Text>
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
