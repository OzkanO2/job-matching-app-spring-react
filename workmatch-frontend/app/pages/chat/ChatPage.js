import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatPage = () => {
    const navigation = useNavigation();
    const [userType, setUserType] = useState('');

    // ✅ Déclare `fetchUserType` AVANT de l'utiliser dans `useEffect`
    const fetchUserType = async () => {
        const type = await AsyncStorage.getItem('userType');
        setUserType(type);
    };

    useEffect(() => {
        fetchUserType();

        navigation.setOptions({
            headerLeft: null,
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />

                {/* ✅ Bouton affiché uniquement pour COMPANY */}
                {userType === 'COMPANY' && (
                    <Button title="Liked Candidates" onPress={() => navigation.navigate('LikedPage')} />
                )}
            </View>
            <Text>Bienvenue sur la page de chat</Text>
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
});

export default ChatPage;
