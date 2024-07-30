import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import axios from 'axios';

export default function SignUpPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/signup', { username, email, password });
      // Handle success response
      console.log('Sign up successful', response.data);
    } catch (error) {
      // Handle error response
      console.error('Sign up failed', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Sign Up Page</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Go to Sign In" onPress={() => navigation.navigate('SignIn')} />
    </View>
  );
}
