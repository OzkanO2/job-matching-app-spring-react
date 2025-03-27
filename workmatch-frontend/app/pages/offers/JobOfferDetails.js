import React from 'react';
import { View, Text, StyleSheet, Button ,Linking , TouchableOpacity} from 'react-native';

const JobOfferDetails = ({ route, navigation }) => {
    const { offer } = route.params;

    return (
        <View style={styles.container}>
            <Button title="⬅ Retour" onPress={() => navigation.navigate('MyOffersPage')} />

            <Text style={styles.title}>{offer.title}</Text>
            <Text style={styles.description}>{offer.description}</Text>
            <Text style={styles.detail}>📍 Lieu : {offer.location}</Text>
            <Text style={styles.detail}>💰 Salaire : {offer.salaryMin} - {offer.salaryMax} €</Text>
<TouchableOpacity onPress={() => Linking.openURL(offer.url)}>
  <Text style={styles.link}>🔗 Voir l'offre</Text>
</TouchableOpacity>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 20,
    },
    backButton: {
        marginBottom: 20,
        alignSelf: 'flex-start',
        backgroundColor: '#1e3a8a',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    backButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#cbd5e1',
        marginBottom: 16,
        lineHeight: 22,
    },
    detail: {
        fontSize: 15,
        color: '#cbd5e1',
        marginBottom: 10,
    },
    link: {
        color: '#ffffff', // ← blanc maintenant
        fontWeight: 'bold',
        marginTop: 20,
        fontSize: 15,
        textAlign: 'center',
    },

});

export default JobOfferDetails;
