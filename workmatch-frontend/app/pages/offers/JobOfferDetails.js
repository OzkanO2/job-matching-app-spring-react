import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const JobOfferDetails = ({ route, navigation }) => {
    const { offer } = route.params;

    return (
        <View style={styles.container}>
            <Button title="⬅ Retour" onPress={() => navigation.navigate('MyOffersPage')} />

            <Text style={styles.title}>{offer.title}</Text>
            <Text style={styles.description}>{offer.description}</Text>
            <Text style={styles.detail}>📍 Lieu : {offer.location}</Text>
            <Text style={styles.detail}>💰 Salaire : {offer.salaryMin} - {offer.salaryMax} €</Text>
            <Text style={styles.detail}>🔗 <a href={offer.url}>Voir l'offre</a></Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        marginBottom: 10,
    },
    detail: {
        fontSize: 14,
        marginBottom: 5,
    }
});

export default JobOfferDetails;
