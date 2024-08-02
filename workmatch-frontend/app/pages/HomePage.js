import React from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { useNavigation, StackActions } from '@react-navigation/native';

const HomePage = () => {
    const navigation = useNavigation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: null,
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text>Welcome to Home Page</Text>
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        justifyContent: 'flex-end',
        marginBottom: 36,
    },
});

export default HomePage;
