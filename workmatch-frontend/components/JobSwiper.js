import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Swiper from 'react-native-deck-swiper';

const JobSwiper = ({ jobs, onSwipeLeft, onSwipeRight }) => {
  return (
    <View style={styles.container}>
      <Swiper
        cards={jobs}
        renderCard={(job) => (
          <View style={styles.card}>
            <Text style={styles.title}>{job.title}</Text>
            <Text style={styles.description}>{job.description}</Text>
          </View>
        )}
        onSwipedLeft={(cardIndex) => onSwipeLeft(jobs[cardIndex].id)}
        onSwipedRight={(cardIndex) => onSwipeRight(jobs[cardIndex].id)}
        cardIndex={0}
        backgroundColor="#f0f0f0"
        stackSize={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default JobSwiper;
