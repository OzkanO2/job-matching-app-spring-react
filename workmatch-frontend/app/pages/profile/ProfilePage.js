import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfilePage = () => {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(null);
    const [userType, setUserType] = useState('');

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = await AsyncStorage.getItem('userToken');
            const username = await AsyncStorage.getItem('username');
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);

            console.log('Token récupéré:', token);
            console.log('Nom d\'utilisateur récupéré:', username);

            if (!token || !username) {
                throw new Error('No token or username found');
            }

            const bearerToken = `${token}`;
            const response = await axios.get(`http://localhost:8080/users/${username}`, {
                headers: {
                    Authorization: bearerToken,
                },
            });

            setUserInfo(response.data);
        };

        fetchUserInfo();
    }, [navigation]);

    const handleSignOut = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('userType');
            navigation.navigate('SignIn');
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    const navigateToOffersPage = () => {
        if (userType === 'INDIVIDUAL') {
            navigation.navigate('MyJobMatchesPage');
        } else if (userType === 'COMPANY') {
            navigation.navigate('MyCompanyOffersPage');
        }
    };

    if (!userInfo) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
            </View>
            <View style={styles.content}>
                <Image source={{ uri: 'https://example.com/photo.jpg' }} style={styles.photo} />
                <Text style={styles.infoText}>User Info</Text>
                <Text>{userInfo.username}</Text>
                <Text>{userInfo.email}</Text>
                <Text>{userInfo.userType}</Text>
                <Text>Certification: {userInfo.companyCertified ? 'Certified' : 'Not Certified'}</Text>
                <Button title="EDIT" onPress={() => navigation.navigate('EditProfilePage')} />
                <Button title="SETTINGS" onPress={() => navigation.navigate('Settings')} />
            </View>
            <View style={styles.footer}>
                <Button title="SIGN OUT" onPress={handleSignOut} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    infoText: {
        textAlign: 'center',
        marginBottom: 20,
    },
    footer: {
        justifyContent: 'flex-end',
        marginBottom: 36,
        alignItems: 'center',
    },
});

export default ProfilePage;
