import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfilePage = () => {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const loadUserData = async () => {
            const storedUsername = await AsyncStorage.getItem('username');
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`http://localhost:8080/users/${storedUsername}`, {
                headers: {
                    Authorization: token,
                },
            });
            setUsername(response.data.username);
            setEmail(response.data.email);
            setUserInfo(response.data);
        };
        loadUserData();
    }, []);

    const handleSave = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.put(
                `http://localhost:8080/users/${userInfo.username}`, // userInfo.username est l'ancien nom d'utilisateur
                {
                    username: username,
                    email: email,
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );
            Alert.alert('Profile updated successfully');
            // Mettre à jour le stockage local si le nom d'utilisateur a changé
            await AsyncStorage.setItem('username', username);
            navigation.goBack();
        } catch (error) {
            console.error('An error occurred:', error);
            Alert.alert('Failed to update profile');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Username</Text>
            <TextInput
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <Button title="Save" onPress={handleSave} />
            <Button title="BACK" onPress={() => navigation.goBack()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        marginBottom: 12,
    },
});

export default EditProfilePage;
