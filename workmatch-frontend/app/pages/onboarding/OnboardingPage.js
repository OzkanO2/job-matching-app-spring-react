import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingPage = ({ navigation, route }) => {
  const { userInfo } = route.params;

  const handleUserTypeSelection = async (userType) => {
    const updatedUserInfo = { ...userInfo, userType };

    try {
      // Envoyer updatedUserInfo au backend
      const updateResponse = await axios.post('http://localhost:8080/users/updateUserType', updatedUserInfo);

      if (updateResponse.status === 200) {
        // Connexion automatique après la mise à jour du type d'utilisateur
        const loginResponse = await axios.post('http://localhost:8080/users/login', {
          username: updatedUserInfo.username,
          password: updatedUserInfo.password,
        });

        const token = loginResponse.data.token;
        if (token) {
          await AsyncStorage.setItem('userToken', `Bearer ${token}`);
          await AsyncStorage.setItem('username', updatedUserInfo.username);

          // Rediriger vers la page d'accueil avec les informations utilisateur
          navigation.navigate('Home', { userInfo: updatedUserInfo });
        } else {
          Alert.alert('Login failed');
        }
      } else {
        Alert.alert('Error', 'Update failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Are you a Job Seeker or a Company?</Text>
      <Button title="Job Seeker" onPress={() => handleUserTypeSelection('INDIVIDUAL')} />
      <Button title="Company" onPress={() => handleUserTypeSelection('COMPANY')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingPage;
