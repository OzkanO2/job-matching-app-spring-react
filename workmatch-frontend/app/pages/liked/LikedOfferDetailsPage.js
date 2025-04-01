import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const LikedOfferDetailsPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { offer } = route.params;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{offer.title}</Text>
      <Text style={styles.label}>Description :</Text>
      <Text style={styles.description}>{offer.description}</Text>

      <Text style={styles.label}>Ville :</Text>
      <Text style={styles.info}>{offer.locations?.join(', ') || 'Non spécifié'}</Text>

      <Text style={styles.label}>Type de contrat :</Text>
      <Text style={styles.info}>{offer.employmentType || 'Non spécifié'}</Text>

      <Text style={styles.label}>Salaire :</Text>
      <Text style={styles.info}>{offer.salaryMin}€ - {offer.salaryMax}€</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    padding: 16,
    flex: 1,
  },
  backButton: {
    marginBottom: 10,
    backgroundColor: '#1e3a8a',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    color: '#93c5fd',
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  description: {
    color: '#ffffff',
    lineHeight: 22,
  },
  info: {
    color: '#ffffff',
  },
});

export default LikedOfferDetailsPage;
