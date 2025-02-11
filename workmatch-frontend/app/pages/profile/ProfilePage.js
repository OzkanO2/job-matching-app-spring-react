import React, { useEffect, useState } from 'react';
import { Image, Button, View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Correction de l'import d'AsyncStorage
import { CheckBox } from 'react-native-elements';

const ProfilePage = () => {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(null);
    const [userType, setUserType] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [tempSelectedCategories, setTempSelectedCategories] = useState([]);  // 🔹 Stocke les choix temporaires
    const [isLoading, setIsLoading] = useState(true);

    const categories = ["Développement Web", "Ingénieur DevOps", "Business Developer", "Software Developer", "Data Science", "Marketing", "Finance"];

    const savePreferencesToBackend = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userId = await AsyncStorage.getItem('userId');

            console.log("📡 Envoi des préférences à l'API...");
            console.log("👤 UserID :", userId);
            console.log("📂 Catégories enregistrées :", tempSelectedCategories);

            const response = await axios.put(
                `http://localhost:8080/users/${userId}/preferences`,
                { preferredCategories: tempSelectedCategories },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

            console.log("✅ Réponse API :", response.data);

            setSelectedCategories([...tempSelectedCategories]);
            alert("Vos préférences ont été enregistrées avec succès !");
        } catch (error) {
            console.error("❌ Erreur lors de la sauvegarde des préférences :", error);
        }
    };


    useEffect(() => {
        const fetchUserData = async () => {
            const storedCategories = await AsyncStorage.getItem('selectedCategories');
            if (storedCategories) {
                setSelectedCategories(JSON.parse(storedCategories));
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchUserPreferences = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const userId = await AsyncStorage.getItem('userId');

                if (!token || !userId) {
                    console.error("❌ No token or userId found");
                    return;
                }

                console.log("📡 Récupération des préférences utilisateur...");

                const response = await axios.get(`http://localhost:8080/users/id/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userData = response.data;
                console.log("✅ Données utilisateur récupérées :", userData);

                if (userData.preferredCategories) {
                    console.log("🎯 Préférences chargées :", userData.preferredCategories);
                    setSelectedCategories(userData.preferredCategories); // ✅ Mise à jour correcte
                    setTempSelectedCategories(userData.preferredCategories);
                } else {
                    console.warn("⚠️ Aucune préférence trouvée en base.");
                }

                setIsLoading(false);
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des préférences :", error);
                setIsLoading(false);
            }
        };


        fetchUserPreferences();
    }, [navigation]);


    useEffect(() => {

        const fetchUserType = async () => {
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);
        };

        fetchUserType();
        const fetchUserInfo = async () => {
            const token = await AsyncStorage.getItem('userToken');
            const username = await AsyncStorage.getItem('username');
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);

            console.log('Token récupéré:', token);
            console.log('Nom d\'utilisateur récupéré:', username);

            if (!token || !username) {
                throw new Error('No token or username found');
            }

            const bearerToken = `${token}`;
            const response = await axios.get(`http://localhost:8080/users/${username}`, {
                headers: {
                    Authorization: bearerToken,
                },
            });

            setUserInfo(response.data);
        };

        fetchUserInfo();
    }, [navigation]);

    const toggleCategory = (category) => {
        let updatedCategories = [...tempSelectedCategories];

        if (updatedCategories.includes(category)) {
            updatedCategories = updatedCategories.filter(item => item !== category);
        } else {
            updatedCategories.push(category);
        }

        setTempSelectedCategories(updatedCategories);
        setSelectedCategories(updatedCategories);
    };


    const handleSignOut = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('userType');
            navigation.navigate('SignIn');
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    const navigateToOffersPage = () => {
        if (userType === 'INDIVIDUAL') {
            navigation.navigate('MyJobMatchesPage');
        } else if (userType === 'COMPANY') {
            navigation.navigate('MyCompanyOffersPage');
        }
    };

    if (!userInfo) {
        return <Text>Loading...</Text>;
    }

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
            {userType === 'INDIVIDUAL' && (
                <View style={styles.categorySection}>
                    <Text style={styles.sectionTitle}>🔎 Offres recherchées</Text>
                    <View style={styles.categoriesContainer}>
                        {categories.map((category) => (
                            <CheckBox
                                key={category}
                                title={category}
                                checked={selectedCategories.includes(category)}
                                onPress={() => toggleCategory(category)}
                                containerStyle={styles.checkboxContainer}
                                textStyle={styles.checkboxText}
                                checkedColor="#4CAF50"
                            />
                        ))}
                    </View>
                    <Button title="Enregistrer les préférences" onPress={savePreferencesToBackend} />
                </View>
            )}

            <View style={styles.content}>
                <Image source={{ uri: 'https://example.com/photo.jpg' }} style={styles.photo} />
                <Text style={styles.infoText}>User Info</Text>
                <Text>{userInfo.username}</Text>
                <Text>{userInfo.email}</Text>
                <Text>{userInfo.userType}</Text>
                <Text>Certification: {userInfo.companyCertified ? 'Certified' : 'Not Certified'}</Text>

                <Button title="EDIT" onPress={() => navigation.navigate('EditProfilePage')} />
                <Button title="SETTINGS" onPress={() => navigation.navigate('Settings')} />
            </View>
            <View style={styles.footer}>
                <Button title="SIGN OUT" onPress={handleSignOut} />
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
    categorySection: {
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
        categoryBox: {
            backgroundColor: '#f0f0f0',
            padding: 10,
            borderRadius: 8,
            margin: 5,
    },
    categorySelected: {
        backgroundColor: '#4CAF50',
    },
    categoryText: {
        fontSize: 14,
        color: '#000',
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
