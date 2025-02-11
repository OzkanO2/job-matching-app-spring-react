import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Swiper from 'react-native-deck-swiper';

const JobSwiper = ({ jobs = [], onSwipeLeft, onSwipeRight }) => {

  if (!Array.isArray(jobs) || jobs.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noJobsText}>No job offers available</Text>
      </View>
    );
  }

  return (
    <Swiper
      cards={jobs}
      renderCard={(job) => (
        <View style={styles.jobCard}>
          <Text style={styles.title}>{job?.title || "No Title"}</Text>
          <Text style={styles.company}>{job?.company?.name || "No Company"}</Text>
          <Text style={styles.description}>
            {job?.description || "No Description"}
          </Text>
        </View>
      )}
      onSwipedLeft={(index) => onSwipeLeft && onSwipeLeft(jobs[index]?.id)}
      onSwipedRight={(index) => onSwipeRight && onSwipeRight(jobs[index]?.id)}
      stackSize={3}
      backgroundColor="white"
      disableTopSwipe
      disableBottomSwipe
    />

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobCard: {
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
  company: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  noJobsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});

export default JobSwiper;
