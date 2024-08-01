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
const handleSignIn = async () => {
    try {
      const response = await axios.post('http://localhost:8080/users/login', { username, password });
      if (response.data.token) {
        const token = response.data.token;
        // Stocker le token dans AsyncStorage
        await AsyncStorage.setItem('token', token);
        navigation.navigate('Home');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    }
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
