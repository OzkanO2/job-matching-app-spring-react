import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CompanyOnboardingPage = ({ navigation, route }) => {
  const { userInfo } = route.params;

   const handleSubmit = async () => {
      try {
        const response = await axios.post('http://localhost:8080/users/login', {
          username: userInfo.username,
          password: userInfo.password,
        });

        const token = response.data.token;
        if (token) {
          await AsyncStorage.setItem('userToken', `Bearer ${token}`);
          await AsyncStorage.setItem('username', userInfo.username);

          navigation.navigate('Home', { userInfo });
        } else {
          alert('Login failed');
        }
      } catch (error) {
        console.error('Login failed:', error);
      }
    };

 return (
    <View style={styles.container}>
      <Text>Welcome, {userInfo.username}! Complete your company profile.</Text>
      <Button title="Submit" onPress={handleSubmit} />
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

export default CompanyOnboardingPage;
