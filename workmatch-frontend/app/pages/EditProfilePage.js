import React from 'react';
import { Button, View, Text, StyleSheet, TextInput, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EditProfilePage = () => {
    const navigation = useNavigation();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Button title="BACK" onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.content}>
                <Text>PHOTOS</Text>
                <View style={styles.photos}>
                    <Image source={{ uri: 'https://example.com/photo1.jpg' }} style={styles.photo} />
                    <Image source={{ uri: 'https://example.com/photo2.jpg' }} style={styles.photo} />
                    <Image source={{ uri: 'https://example.com/photo3.jpg' }} style={styles.photo} />
                </View>
                <Text style={styles.bio}>BIO</Text>
                <TextInput style={styles.input} placeholder="Your bio here..." multiline />
                <TextInput style={styles.input} placeholder="Other info..." multiline />
                <TextInput style={styles.input} placeholder="More info..." multiline />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    header: {
        marginBottom: 20,
    },
    content: {
        flex: 1,
    },
    photos: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    photo: {
        width: 100,
        height: 100,
    },
    bio: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
});

export default EditProfilePage;
