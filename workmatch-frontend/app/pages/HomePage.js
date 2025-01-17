import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JobSwiper from '../../components/JobSwiper';
import 'react-native-gesture-handler';


const HomePage = () => {
    const navigation = useNavigation();
    const [jobOffers, setJobOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userType, setUserType] = useState('');

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/joboffers');
                setJobOffers(response.data);
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
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate('Home')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
            </View>
            <Text style={styles.infoText}>INFO (offre emploi ou du chercheur d'emploi)</Text>
            <View style={styles.swiperContainer}>
                {isLoading ? (
                    <Text style={{ textAlign: 'center' }}>Loading...</Text>
                ) : jobOffers.length > 0 ? (
                    <JobSwiper
                        jobs={jobOffers}
                        onSwipeLeft={(jobId) => console.log(`Ignored job ID: ${jobId}`)}
                        onSwipeRight={(jobId) => console.log(`Saved job ID: ${jobId}`)}
                    />
                ) : (
                    <Text style={{ textAlign: 'center' }}>No job offers available</Text>
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
    },
    infoText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
    },
    swiperContainer: {
        flex: 1,
        marginTop: 20,
        paddingHorizontal: 10,
    },
});

export default HomePage;
