import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';

const EditOfferPage = ({ route, navigation }) => {
  const { offer } = route.params;
  const [title, setTitle] = useState(offer.title);
  const [description, setDescription] = useState(offer.description);

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(
        `http://localhost:8080/joboffers/${offer._id}`,
        { title, description },
        { headers: { Authorization: token } }
      );

      if (response.status === 200) {
        Alert.alert("✅ Mise à jour réussie");
        navigation.goBack();
      }
    } catch (error) {
      console.error("❌ Erreur de mise à jour :", error);
      Alert.alert("Erreur", "Impossible de mettre à jour l’offre.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#007bff" />
              <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>

      <Text style={styles.label}>Titre de l'offre :</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />

      <Text style={styles.label}>Description :</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 100 }]}
        multiline
      />

      <Button title="Mettre à jour l'offre" onPress={handleUpdate} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backText: {
    marginLeft: 5,
    color: '#007bff',
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
  },
});

export default EditOfferPage;
