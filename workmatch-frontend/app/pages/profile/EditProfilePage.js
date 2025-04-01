import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, TextInput,TouchableOpacity , Alert } from 'react-native';
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

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChangePasswordPage')}>
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>⬅ Back</Text>
            </TouchableOpacity>

        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 24,
        justifyContent: 'center',
    },
    label: {
        fontSize: 15,
        color: '#ffffff',
        marginBottom: 6,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#1e293b',
        color: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        marginBottom: 14,
    },
    buttonGroup: {
        marginTop: 20,
        gap: 10,
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default EditProfilePage;
