import React, { useState } from 'react';
import { View,TouchableOpacity, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignInPage({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async () => {
        try {
            const response = await axios.post('http://localhost:8080/users/login', { username, password });
            const token = response.data.token;
            const userType = response.data.userType;
            const userId = response.data.userId;

            if (token && userId) {
                await AsyncStorage.setItem('userToken', `Bearer ${token}`);
                await AsyncStorage.setItem('userId', userId);
                await AsyncStorage.setItem('username', username);
                await AsyncStorage.setItem('userType', userType);

                console.log("✅ Identifiants stockés avec succès !");
                navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome');
            } else {
                Alert.alert('Invalid credentials');
            }
        } catch (error) {
            console.error('❌ An error occurred:', error);
            Alert.alert('An error occurred. Please try again.');
        }
    };

    return (
      <View style={styles.container}>
        <View style={styles.formBox}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Welcome Back 👋</Text>

          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { backgroundColor: '#1abc9c' }]} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.buttonText}>Go to Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa', // Couleur de fond agréable
    padding: 16,
  },
formBox: {
  width: '90%',
  maxWidth: 400,
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 5,
  marginBottom: 30
}
,input: {
   height: 45,
   borderColor: '#ccc',
   borderWidth: 1,
   borderRadius: 10,
   marginBottom: 15,
   paddingHorizontal: 12,
   fontSize: 16,
   backgroundColor: '#fafafa',
 }
,button: {
   backgroundColor: '#3498db',
   borderRadius: 10,
   paddingVertical: 12,
   paddingHorizontal: 20,
   marginVertical: 6,
   width: '100%',
   alignItems: 'center',
 },
 buttonText: {
   color: 'white',
   fontWeight: 'bold',
   fontSize: 16,
 }
, typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#3498db',
  },
  typeText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  typeTextActive: {
    color: 'white',
  }
,
});