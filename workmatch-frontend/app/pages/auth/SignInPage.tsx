import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignInPage({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async () => {
        try {
            const response = await axios.post('http://localhost:8080/users/login', { username, password });
            const token = response.data.token;
            if (token) {
                await AsyncStorage.setItem('userToken', `Bearer ${token}`);
                await AsyncStorage.setItem('username', username); // Stocker le nom d'utilisateur
                navigation.navigate('Home');
            } else {
                Alert.alert('Invalid credentials');
            }
        } catch (error) {
            console.error('An error occurred:', error);
            Alert.alert('An error occurred. Please try again.');
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
