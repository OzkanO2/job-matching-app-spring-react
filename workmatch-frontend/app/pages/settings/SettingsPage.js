import React from 'react';
import { Button, View, Text, StyleSheet,TouchableOpacity  } from 'react-native';
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
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>⬅ Retour</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SignIn')}>
                        <Text style={styles.actionText}>🚪 Logout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={() => {}}>
                        <Text style={styles.actionText}>🗑️ Supprimer le compte</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
                        <Text style={styles.actionText}>⏸️ Faire une pause</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#334155',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    actionsContainer: {
        marginTop: 40,
        gap: 14,
    },
    actionButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    dangerButton: {
        backgroundColor: '#ef4444',
    },
    actionText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});


export default SettingsPage;
