import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../../constants/api';

const ChangePasswordPage = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');

  const validatePasswords = () => {
    let valid = true;

    if (newPassword.length !== 4) {
      setNewPasswordError("Le mot de passe doit contenir exactement 4 caractères.");
      valid = false;
    } else {
      setNewPasswordError('');
    }

    if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas.");
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    return valid;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const username = await AsyncStorage.getItem('username');

      const response = await axios.post(`${BASE_URL}/users/change-password`, {
        username,
        currentPassword,
        newPassword,
      }, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        Alert.alert("Mot de passe modifié avec succès");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setCurrentPasswordError("Le mot de passe actuel est incorrect.");
        setNewPasswordError('');
        setConfirmPasswordError('');

        // Facultatif : pour attirer l’attention
        Alert.alert("Erreur", "Le mot de passe actuel que vous avez indiqué est incorrect.");
}
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: '#007bff', marginBottom: 12 }}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Mot de passe actuel :</Text>
      <TextInput
        secureTextEntry
        style={[styles.input, currentPasswordError ? styles.inputError : null]}
        value={currentPassword}
        onChangeText={(text) => {
          setCurrentPassword(text);
          setCurrentPasswordError('');
        }}
      />
      {currentPasswordError ? <Text style={styles.error}>{currentPasswordError}</Text> : null}


      <Text style={styles.label}>Nouveau mot de passe :</Text>
      <TextInput
        secureTextEntry
        style={[styles.input, newPasswordError ? styles.inputError : null]}
        value={newPassword}
        onChangeText={(text) => {
          setNewPassword(text);

          // Validation immédiate
          if (text.length !== 4) {
            setNewPasswordError("Le mot de passe doit contenir exactement 4 caractères.");
          } else {
            setNewPasswordError('');
          }

          // Met à jour aussi l'erreur de confirmation s'il est déjà rempli
          if (confirmPassword && text !== confirmPassword) {
            setConfirmPasswordError("Les mots de passe ne correspondent pas.");
          } else {
            setConfirmPasswordError('');
          }
        }}
      />
      {newPasswordError ? <Text style={styles.error}>{newPasswordError}</Text> : null}

      <Text style={styles.label}>Confirmer le nouveau mot de passe :</Text>
      <TextInput
        secureTextEntry
        style={[styles.input, confirmPasswordError ? styles.inputError : null]}
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);

          // Validation immédiate
          if (text !== newPassword) {
            setConfirmPasswordError("Les mots de passe ne correspondent pas.");
          } else {
            setConfirmPasswordError('');
          }
        }}
      />
      {confirmPasswordError ? <Text style={styles.error}>{confirmPasswordError}</Text> : null}

      <Button title="CHANGER LE MOT DE PASSE" onPress={handleChangePassword} />
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
    marginBottom: 6,
  },
  error: {
    color: 'red',
    marginBottom: 6,
    fontSize: 12,
  },inputError: {
      borderColor: 'red',
    },

});

export default ChangePasswordPage;
