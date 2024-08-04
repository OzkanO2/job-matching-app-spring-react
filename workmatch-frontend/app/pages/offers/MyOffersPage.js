import React from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MyOffersPage = () => {
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
                 <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                 <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
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

export default MyOffersPage;
