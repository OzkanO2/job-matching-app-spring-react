import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyOffersPage = () => {
    const navigation = useNavigation();
    const [userType, setUserType] = useState('');

    useEffect(() => {
        const fetchUserType = async () => {
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);
        };

        fetchUserType();

        navigation.setOptions({
            headerLeft: null,
        });
    }, [navigation]);

    const navigateToOffersPage = () => {
        if (userType === 'INDIVIDUAL') {
            navigation.navigate('MyJobMatchesPage');
        } else if (userType === 'COMPANY') {
            navigation.navigate('MyCompanyOffersPage');
        }
    };

    return (
        <View style={styles.container}>
             <View style={styles.topButtons}>
                 <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                 <Button title="Main Menu" onPress={() => navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')} />
                 <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                 <Button title="My Offers" onPress={navigateToOffersPage} />
                 {/* ✅ Bouton affiché uniquement pour COMPANY */}
                 {userType === 'COMPANY' && (
                     <Button title="Liked Candidates" onPress={() => navigation.navigate('LikedPage')} />
                 )}
             </View>
            <View style={styles.content}>
                <Text style={styles.infoText}>LISTE OFFRE D'EMPLOIS</Text>
                <Text>1</Text>
                <Text>2</Text>
                <Text>3</Text>
                <Text>4</Text>
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
    infoText: {
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default MyOffersPage;
