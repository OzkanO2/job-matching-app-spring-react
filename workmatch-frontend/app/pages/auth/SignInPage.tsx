import React, { useState } from 'react';
import { View,TouchableOpacity, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignInPage({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async () => {
        try {
            const response = await axios.post('process.env.REACT_APP_BACKEND_URL/users/login', { username, password });
            const token = response.data.token;
            const userType = response.data.userType;
            const userId = response.data.userId;

            if (token && userId) {
                await AsyncStorage.setItem('userToken', `Bearer ${token}`);
                await AsyncStorage.setItem('userId', userId);
                await AsyncStorage.setItem('username', username);
                await AsyncStorage.setItem('userType', userType);

                console.log("Identifiants stockés avec succès !");
                navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome');
            } else {
                Alert.alert('Invalid credentials');
            }
        } catch (error) {
            console.error('An error occurred:', error);
            Alert.alert('An error occurred. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>

            <TextInput
              placeholder="Username"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity style={styles.signinButton} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    marginBottom: 14,
    paddingHorizontal: 12,
    color: '#f1f5f9',
  },
  signinButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupButton: {
    alignItems: 'center',
  },
  signupText: {
    color: '#38bdf8',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
