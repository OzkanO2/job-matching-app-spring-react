import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignInPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

//   const handleSignIn = () => {
//     axios.post('http://localhost:8080/users/login', { username, password })
//       .then(response => {
//         if (response.data.message === 'Login successful') {
//           const token = response.data.token;
//           // Stocker le token dans AsyncStorage ou dans un état global
//           navigation.navigate('Home');
//         } else {
//           alert('Invalid credentials');
//         }
//       })
//       .catch(error => {
//         console.error(error);
//         alert('An error occurred. Please try again.');
//       });
//   };
const handleSignIn = () => {
    console.log('Attempting to sign1 in with:', { username, password }); // Affiche les données de connexion

    axios.post('http://localhost:8080/users/login', { username, password })
        .then(response => {
            console.log('Server response:', response.data); // Affiche la réponse du serveur
            const token = response.data.token;
            if (token) {
                const token = response.data.token;
                console.log('Token received:', token); // Affiche le token reçu
                // Stocker le token dans AsyncStorage ou dans un état global
                navigation.navigate('Home');
            } else {
                alert('Invalid credentials');
            }
        })
        .catch(error => {
            console.error('An error occurred:', error); // Affiche les erreurs
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request data:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            alert('An error occurred1. Please try again.');
        });
};




  return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Sign In</Text>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12 }}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12 }}
        />
        <Button title="Sign In" onPress={handleSignIn} />
        <Button title="Go to Sign Up" onPress={() => navigation.navigate('SignUp')} />
      </View>
    );
}
