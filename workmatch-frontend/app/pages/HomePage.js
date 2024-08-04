import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, Image, ScrollView  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import JobSwiper from '../../components/JobSwiper';

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
            axios.get('http://localhost:8080/adzuna/fetch')
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

//    const handleSwipeRight = (job) => {
//        axios.post('http://localhost:8080/job-offers/save', job)
//            .then(response => console.log('Job saved:', response.data))
//            .catch(error => console.error(error));
//    };

    if (isLoading) {
            return <Text>Loading...</Text>;
        }

    if (error) {
        return <Text>Error: {error.message}</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate('Home')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
            </View>
            <View style={styles.content}>
                           <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.photo} />
                           <Text style={styles.infoText}>INFO (offre emploi ou du chercheur d ) </Text>

                       </View>
            <View style={styles.rawDataContainer}>
                <Text style={styles.rawDataTitle}>Raw Data from API:</Text>
                <Text style={styles.rawDataText}>{JSON.stringify(jobOffers, null, 2)}</Text>
            </View>
            <View style={styles.bottomButtons}>
                <Button title="Non" onPress={() => {  }} />
                <Button title="Oui" onPress={() => {  }} />
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    bottomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    footer: {
        justifyContent: 'flex-end',
        marginBottom: 36,
        alignItems: 'center',
    },
});

export default HomePage;
