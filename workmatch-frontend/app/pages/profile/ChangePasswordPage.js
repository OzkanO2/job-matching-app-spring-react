import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';

const ChangePasswordPage = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("❌ Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const username = await AsyncStorage.getItem('username');

      const response = await axios.post('http://localhost:8080/users/change-password', {
        username,
        currentPassword,
        newPassword,
      }, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        Alert.alert("✅ Mot de passe modifié avec succès");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      Alert.alert("❌ Échec du changement de mot de passe");
    }
  };

  return (
    <View style={styles.container}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>

      <Text style={styles.label}>Mot de passe actuel :</Text>
      <TextInput
        secureTextEntry
        style={styles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <Text style={styles.label}>Nouveau mot de passe :</Text>
      <TextInput
        secureTextEntry
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <Text style={styles.label}>Confirmer le nouveau mot de passe :</Text>
      <TextInput
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Changer le mot de passe" onPress={handleChangePassword} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
  },
});

export default ChangePasswordPage;
