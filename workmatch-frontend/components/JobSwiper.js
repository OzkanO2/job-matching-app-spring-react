import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Swiper from 'react-native-deck-swiper';

const JobSwiper = ({ jobOffers }) => {
    return (
        <Swiper
            cards={jobOffers}
            renderCard={(card) => (
                <View style={styles.card}>
                    <Text>{card.title}</Text>
                    <Text>{card.description}</Text>
                </View>
            )}
            onSwiped={(cardIndex) => { console.log(cardIndex); }}
            onSwipedAll={() => { console.log('All swiped!'); }}
            cardIndex={0}
            backgroundColor={'#4FD0E9'}
            stackSize={3}
        />
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E8E8E8',
        marginVertical: 10,
    },
});

export default JobSwiper;
