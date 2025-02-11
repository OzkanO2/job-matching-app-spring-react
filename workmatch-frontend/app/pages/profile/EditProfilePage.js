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
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                const token = await AsyncStorage.getItem('userToken');

                const bearerToken = `Bearer ${token}`;

                const response = await axios.get(`http://localhost:8080/users/${storedUsername}`, {
                    headers: {
                        Authorization: bearerToken,
                    },
                });

                setUsername(response.data.username);
                setEmail(response.data.email);
                setUserInfo(response.data);
            } catch (error) {
                console.error('Failed to load user info:', error);
                Alert.alert('Failed to load user info');
            }
        };

        loadUserData();
    }, []);


   const handleSave = async () => {
       try {
           const token = await AsyncStorage.getItem('userToken');
           const bearerToken = `${token}`;

           console.log('Bearer Token Sent in EditProfilePage:', bearerToken);

           const response = await axios.put(
               'http://localhost:8080/users/updateUsername',
               {
                   oldUsername: userInfo.username,
                   newUsername: username,
               },
               {
                   headers: {
                       Authorization: bearerToken,
                   },
               }
           );

           const newToken = response.data.token;
           await AsyncStorage.setItem('userToken', `Bearer ${newToken}`);

           await AsyncStorage.setItem('username', username);

           Alert.alert('Profile updated successfully');
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
