import React from 'react';
import { Button, View, Text, StyleSheet, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EditProfilePage = () => {
    const navigation = useNavigation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Button title="BACK" onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.photos}>
                <Text>PHOTOS</Text>
                <Image source={{ uri: 'https://example.com/photo1.jpg' }} style={styles.photo} />
                <Image source={{ uri: 'https://example.com/photo2.jpg' }} style={styles.photo} />
                <Image source={{ uri: 'https://example.com/photo3.jpg' }} style={styles.photo} />
            </View>
            <View style={styles.bio}>
                <Text>BIO</Text>
                <TextInput placeholder="Your bio here..." style={styles.input} />
                <TextInput placeholder="Other info..." style={styles.input} />
                <TextInput placeholder="More info..." style={styles.input} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 10,
    },
    header: {
        marginTop: 40,
        alignItems: 'center',
    },
    photos: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    photo: {
        width: 60,
        height: 60,
    },
    bio: {
        flex: 1,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
    },
});

export default EditProfilePage;
