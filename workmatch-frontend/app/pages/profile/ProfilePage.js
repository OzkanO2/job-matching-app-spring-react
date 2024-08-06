import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfilePage = () => {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => null,
        });

        const fetchUserInfo = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const username = await AsyncStorage.getItem('username');
                if (!token || !username) {
                    throw new Error('No token found');
                }

                const response = await axios.get(`http://localhost:8080/users/${username}`, {
                    headers: {
                        Authorization: token,
                    },
                });
                setUserInfo(response.data);
            } catch (error) {
                console.error("Failed to load user info:", error);
            }
        };

        fetchUserInfo();
    }, []);

    if (!userInfo) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate('Home')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
            </View>
            <View style={styles.content}>
                <Image source={{ uri: 'https://example.com/photo.jpg' }} style={styles.photo} />
                <Text style={styles.infoText}>User Info</Text>
                <Text>{userInfo.username}</Text>
                <Text>{userInfo.email}</Text>
                <Text>{userInfo.userType}</Text>
                <Button title="EDIT" onPress={() => navigation.navigate('EditProfilePage')} />
                <Button title="SETTINGS" onPress={() => navigation.navigate('Settings')} />
            </View>
            <View style={styles.footer}>
                <Button title="SIGN OUT" onPress={() => navigation.navigate('SignIn')} />
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
