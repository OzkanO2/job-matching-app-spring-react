import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const LikedCandidateDetailsPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { candidate } = route.params;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{candidate.name}</Text>

      <Text style={styles.label}>Email :</Text>
      <Text style={styles.info}>{candidate.email || 'Non spécifié'}</Text>

      <Text style={styles.label}>Salaire minimum souhaité :</Text>
      <Text style={styles.info}>
        {candidate.salaryMin ? `${candidate.salaryMin} €` : 'Non spécifié'}
      </Text>

      <Text style={styles.label}>Compétences :</Text>
      <Text style={styles.info}>
        {candidate.skills?.map(skill => `${skill.name} (${skill.experience} ans)`).join(', ') || 'Non spécifié'}
      </Text>

      <Text style={styles.label}>Localisations :</Text>
      <Text style={styles.info}>{candidate.locations?.join(', ') || 'Non spécifié'}</Text>

      <Text style={styles.label}>Télétravail :</Text>
      <Text style={styles.info}>{candidate.remote ? "Oui" : "Non"}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  backButton: {
    backgroundColor: '#1e3a8a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: { color: 'white', fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 16 },
  label: { color: '#93c5fd', marginTop: 12, fontWeight: 'bold' },
  info: { color: '#fff', marginBottom: 8 },
});

export default LikedCandidateDetailsPage;
