import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function SignUpPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateInput = () => {
    if (username.length < 4) {
      Alert.alert('Invalid Username', 'Username must be at least 4 characters long.');
      return false;
    }
    if (password.length < 4) {
      Alert.alert('Invalid Password', 'Password must be at least 4 characters long.');
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSignUp = () => {
    if (!validateInput()) {
      return;
    }

    axios.post('http://localhost:8080/users/register', { username, email, password })
      .then(response => {
        if (response.status === 201) {
          Alert.alert('Success', 'User registered successfully');
          const userInfo = { username, email, password };
          navigation.navigate('OnboardingPage', { userInfo });
        } else {
          Alert.alert('Error', 'Registration failed');
        }
      })
      .catch(error => {
        if (error.response && error.response.status === 409) {
          Alert.alert('Conflict', error.response.data);
        } else {
          Alert.alert('Error', 'An error occurred. Please try again.');
        }
      });
  };

  return (
    <View style={styles.container}>
      <Text>Sign Up Page</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Go to Sign In" onPress={() => navigation.navigate('SignIn')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    width: '100%',
    paddingHorizontal: 8,
  },
});
