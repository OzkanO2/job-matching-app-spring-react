import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import axios from 'axios';

const JobSwiper = () => {
    const [jobOffers, setJobOffers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/joboffers');
                setJobOffers(response.data);
            } catch (error) {
                console.error('Error fetching job offers:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <View style={styles.container}>
            {jobOffers.length > 0 ? (
                <Swiper
                    cards={jobOffers}
                    renderCard={(card) => (
                        <View style={styles.card}>
                            <Text style={styles.text}>{card.info}</Text>
                        </View>
                    )}
                    onSwiped={(cardIndex) => { console.log(cardIndex); }}
                    onSwipedAll={() => { console.log('All cards swiped'); }}
                    cardIndex={0}
                    backgroundColor={'#4FD0E9'}
                    stackSize={3}
                />
            ) : (
                <Text>Loading...</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        flex: 1,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E8E8E8',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    text: {
        textAlign: 'center',
        fontSize: 20,
        backgroundColor: 'transparent',
    },
});

export default JobSwiper;
