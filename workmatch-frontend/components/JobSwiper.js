import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSwipeable } from 'react-swipeable';

const JobSwiper = ({ jobs, onSwipeLeft, onSwipeRight }) => {
    return (
        <View style={styles.swipeContainer}>
            {jobs.map((job, index) => (
                <View key={index} style={styles.jobCard}>
                    <Text style={styles.jobTitle}>{job.info}</Text>
                    <Text>Swipe left to ignore, right to save</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    swipeContainer: {
        flex: 1,
        alignItems: 'center',
    },
    jobCard: {
        width: 300,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default JobSwiper;
