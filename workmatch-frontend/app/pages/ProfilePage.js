import React from 'react';
import { Button, View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProfilePage = () => {
    const navigation = useNavigation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: null,
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate('Home')} />
                <Button title="Chat" onPress={() => {}} />
                <Button title="Mes Offres" onPress={() => {}} />
            </View>
            <View style={styles.content}>
                <Image source={{ uri: 'https://example.com/photo.jpg' }} style={styles.photo} />
                <Text style={styles.infoText}>User Info</Text>
                <Button title="EDIT" onPress={() => navigation.navigate('EditProfilePage')} />
                <Button title="SETTINGS" onPress={() => {}} />
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
