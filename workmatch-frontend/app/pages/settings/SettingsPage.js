import React from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SettingsPage = () => {
    const navigation = useNavigation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: null,
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Button title="BACK" onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.actionsContainer}>
                <Button title="LOGOUT" onPress={() => navigation.navigate('SignIn')} />
                <Button title="DELETE ACCOUNT" onPress={() => {}} />
                <Button title="FAIRE UNE PAUSE" onPress={() => {}} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    settingsContainer: {
        marginTop: 20,
    },
    settingText: {
        fontSize: 18,
        marginBottom: 10,
    },
    actionsContainer: {
        marginTop: 20,
    },
});

export default SettingsPage;
