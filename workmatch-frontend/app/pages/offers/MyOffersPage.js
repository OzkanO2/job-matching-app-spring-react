import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const MyOffersPage = () => {
    const navigation = useNavigation();
    const [userType, setUserType] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [jobOffers, setJobOffers] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            const type = await AsyncStorage.getItem('userType');
            const id = await AsyncStorage.getItem('userId'); // Normalement, c'est l'ID de la company
            console.log("🔍 UserType:", type);
            console.log("🔍 Company ID récupéré:", id);
            setUserType(type);
            setCompanyId(id);
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (companyId && userType === 'COMPANY') {
            fetchJobOffers();
        }
    }, [companyId, userType]);

    const fetchJobOffers = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            console.log("📡 Envoi de la requête Axios avec companyId:", companyId);
            const response = await axios.get(`http://localhost:8080/joboffers/company/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("✅ Réponse reçue:", response.data);
            setJobOffers(response.data);
        } catch (error) {
            console.error("❌ Erreur lors du chargement des offres :", error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button title="Profile" onPress={() => navigation.navigate('ProfilePage')} />
                <Button title="Main Menu" onPress={() => navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')} />
                <Button title="Chat" onPress={() => navigation.navigate('ChatPage')} />
                <Button title="My Offers" onPress={() => navigation.navigate('MyOffersPage')} />
                {userType === 'COMPANY' && (
                    <Button title="Liked Candidates" onPress={() => navigation.navigate('LikedPage')} />
                )}
            </View>

            <Text style={styles.title}>📌 Mes Offres d'Emploi</Text>

            <FlatList
                data={jobOffers}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.jobOfferContainer}>
                        <TouchableOpacity
                            style={styles.jobOfferItem}
                            onPress={() => navigation.navigate("JobOfferDetails", { offer: item })}
                        >
                            <Text style={styles.jobTitle}>{item.title}</Text>
                            <Text style={styles.jobLocation}>{item.location}</Text>
                        </TouchableOpacity>

                        {/* ✅ Séparation du bouton */}
                        <TouchableOpacity
                            style={styles.viewCandidatesButton}
                            onPress={() => navigation.navigate("CompanyHomePage", { selectedOffer: item })}
                        >
                            <Text style={styles.buttonText}>Voir les candidats</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={() => <Text style={styles.noDataText}>⚠️ Aucune offre disponible</Text>}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 10,
    },
    topButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        padding: 10,
    },
    jobOfferItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        backgroundColor: "#fff",
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    jobLocation: {
        fontSize: 14,
        color: "#666",
    },
    noDataText: {
        textAlign: "center",
        fontSize: 16,
        color: "#888",
        marginTop: 20,
    },
});

export default MyOffersPage;
