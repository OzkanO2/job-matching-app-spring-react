import React, { useEffect, useState } from 'react';
import { Image, Button, View, Text, StyleSheet, ScrollView,TextInput,Alert,TouchableOpacity}from 'react-native';// ✅ AJOUTE CECI } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Correction de l'import d'AsyncStorage
import { CheckBox } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; // 🔹 ajoute ça en haut si ce n’est pas déjà fait

const ProfilePage = () => {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(null);
    const [userType, setUserType] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [tempSelectedCategories, setTempSelectedCategories] = useState([]);  // 🔹 Stocke les choix temporaires
    const [isLoading, setIsLoading] = useState(true);
    const [skills, setSkills] = useState({});
    const [skillsSuccess, setSkillsSuccess] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [isRemotePreferred, setIsRemotePreferred] = useState(false);
    const [remoteSuccess, setRemoteSuccess] = useState(false);

    const availableSkills = [
      "JavaScript", "React", "Node.js", "Python", "Java",
      "C#", "Ruby", "Swift"
    ];

    const toggleSkill = (skillName) => {
      setSkills((prev) => {
        const newSkills = { ...prev };
        if (newSkills[skillName]) {
          delete newSkills[skillName];
        } else {
          newSkills[skillName] = 1;
        }
        return newSkills;
      });
    };

    const changeExperience = (skillName, amount) => {
      setSkills((prev) => ({
        ...prev,
        [skillName]: Math.max(1, (prev[skillName] || 1) + amount)
      }));
    };
    const saveSkillsToBackend = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');
        const formattedSkills = Object.keys(skills); // ← just the skill names

        await axios.put(`http://localhost:8080/jobsearchers/${userId}/updateUser`, {
          skills: Object.entries(skills).map(([name, experience]) => ({ name, experience }))
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });


        setSkillsSuccess(true);
        setTimeout(() => setSkillsSuccess(false), 3000);

      } catch (err) {
        console.error("Erreur mise à jour skills", err);
      }
    };
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

const saveLocationToBackend = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userId');

    await axios.put(`http://localhost:8080/jobsearchers/${userId}/updateUser`, {
      locations: selectedLocation ? [selectedLocation] : []
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    Alert.alert("✅ Localisation enregistrée !");
  } catch (err) {
    console.error("❌ Erreur enregistrement localisation :", err);
  }
};
const saveRemoteToBackend = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userId');

    await axios.put(`http://localhost:8080/jobsearchers/${userId}/updateUser`, {
      remote: isRemotePreferred
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setRemoteSuccess(true);
    setTimeout(() => setRemoteSuccess(false), 3000); // ✅ Reset après 3 sec

  } catch (err) {
    console.error("❌ Erreur télétravail:", err);
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

        const fetchUserInfo = async () => {
            const token = await AsyncStorage.getItem('userToken');
            const username = await AsyncStorage.getItem('username');
            const userId = await AsyncStorage.getItem('userId');
            const type = await AsyncStorage.getItem('userType');
            setUserType(type);

            console.log('Token récupéré:', token);
            console.log("Nom d'utilisateur récupéré:", username);

            if (!token || !username || !userId) {
              throw new Error('❌ Token, username ou userId manquant');
            }

            const bearerToken = `${token}`;

            // 🔹 Récupération des données User
            const userResponse = await axios.get(`http://localhost:8080/users/${username}`, {
              headers: {
                Authorization: bearerToken,
              },
            });

            const userData = userResponse.data;
            setUserInfo(userData);
            console.log("📥 Infos User:", userData);

            // 🔹 Récupération des compétences depuis JobSearcher
            try {
              const jobSearcherRes = await axios.get(`http://localhost:8080/jobsearchers/${userId}`, {
                headers: { Authorization: bearerToken }
              });

              const jobSearcher = jobSearcherRes.data;
              console.log("🎓 Compétences reçues depuis JobSearcher:", jobSearcher.skills);

              if (jobSearcher.skills && Array.isArray(jobSearcher.skills)) {
                const formatted = {};
                jobSearcher.skills.forEach(skill => {
                  if (skill.name) {
                    formatted[skill.name] = skill.experience || 1;
                  }
                });
                setSkills(formatted);
              } else {
                console.warn("⚠️ Aucune compétence trouvée dans JobSearcher.");
              }
            } catch (error) {
              console.error("❌ Erreur lors de la récupération des compétences JobSearcher:", error);
            }
          };

        fetchUserType();
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
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scroll}>
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
          <>
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

            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>🛠️ Modifier mes compétences</Text>

              {availableSkills.map((skill) => (
                <View key={skill} style={{ alignItems: 'center', marginVertical: 8 }}>
                  <TouchableOpacity
                    onPress={() => toggleSkill(skill)}
                    style={[styles.skillButton, skills[skill] && styles.selectedSkill]}
                  >
                    <Text style={[styles.skillText, skills[skill] && styles.selectedSkillText]}>
                      {skill}
                    </Text>
                  </TouchableOpacity>

                  {skills[skill] && (
                    <View style={styles.experienceContainer}>
                      <TouchableOpacity onPress={() => changeExperience(skill, -1)}>
                        <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
                      </TouchableOpacity>
                      <Text style={styles.experienceValue}>{skills[skill]} ans</Text>
                      <TouchableOpacity onPress={() => changeExperience(skill, 1)}>
                        <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              <Button title="Modifier mes skills" onPress={saveSkillsToBackend} />
              {skillsSuccess && (
                <Text style={{ color: 'green', marginTop: 6 }}>
                  ✅ Compétences modifiées avec succès !
                </Text>
              )}
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>📍 Localisation préférée</Text>

              <Picker
                selectedValue={selectedLocation}
                onValueChange={(itemValue) => setSelectedLocation(itemValue)}
                style={{ height: 50, width: '100%', borderColor: '#007bff', borderWidth: 1 }}
              >
                <Picker.Item label="Sélectionner une ville" value="" />
                <Picker.Item label="Paris" value="Paris" />
                <Picker.Item label="Lyon" value="Lyon" />
                <Picker.Item label="Marseille" value="Marseille" />
                <Picker.Item label="Bruxelles" value="Bruxelles" />
                <Picker.Item label="Liège" value="Liège" />
              </Picker>

              <Button title="Enregistrer la localisation" onPress={saveLocationToBackend} />
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>🏠 Télétravail accepté ?</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <TouchableOpacity
                  style={[styles.toggleButton, isRemotePreferred && styles.toggleButtonSelected]}
                  onPress={() => setIsRemotePreferred(true)}
                >
                  <Text style={isRemotePreferred ? styles.toggleTextSelected : styles.toggleText}>Oui</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleButton, !isRemotePreferred && styles.toggleButtonSelected]}
                  onPress={() => setIsRemotePreferred(false)}
                >
                  <Text style={!isRemotePreferred ? styles.toggleTextSelected : styles.toggleText}>Non</Text>
                </TouchableOpacity>
              </View>

              <Button title="Enregistrer le choix télétravail" onPress={saveRemoteToBackend} />

                {remoteSuccess && (
                  <Text style={{ color: 'green', marginTop: 6 }}>
                    ✅ Télétravail enregistré avec succès !
                  </Text>
                )}

            </View>
          </>
        )}

        <View style={styles.content}>
          <Image source={{ uri: 'https://example.com/photo.jpg' }} style={styles.photo} />
          <Text style={styles.infoText}>{userInfo.username ?? "Nom indisponible"}</Text>
          <Text>{userInfo.username}</Text>
          <Text>{userInfo.email}</Text>
          <Text>{userInfo.userType}</Text>
          <Text>Certification: {userInfo.companyCertified ? 'Certified' : 'Not Certified'}</Text>

          <Button title="EDIT" onPress={() => navigation.navigate('EditProfilePage')} />
          <Button title="SETTINGS" onPress={() => navigation.navigate('SettingsPage')} />
        </View>

        <View style={styles.footer}>
          <Button title="SIGN OUT" onPress={handleSignOut} />
        </View>
      </ScrollView>
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
    skillButton: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderWidth: 2,
      borderColor: '#007bff',
      borderRadius: 8,
      backgroundColor: 'white',
      marginBottom: 4,
    },
    selectedSkill: {
      backgroundColor: '#007bff',
    },
    skillText: {
      fontSize: 13,
      color: '#007bff',
    },
    selectedSkillText: {
      fontSize: 13,
      color: 'white',
      fontWeight: 'bold',
    },
    experienceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    experienceValue: {
      fontSize: 13,
      fontWeight: 'bold',
      marginHorizontal: 6,
    },
scroll: {
  flex: 1,
},
scrollContainer: {
  paddingBottom: 100,
  paddingHorizontal: 10,
},
bottomActions: {
  padding: 10,
  borderTopWidth: 1,
  borderColor: '#ddd',
  backgroundColor: '#fff',
  gap: 10,
},
toggleButton: {
  padding: 10,
  marginHorizontal: 10,
  borderWidth: 2,
  borderColor: '#007bff',
  borderRadius: 8,
  width: 80,
  alignItems: 'center',
},
toggleButtonSelected: {
  backgroundColor: '#007bff',
},
toggleText: {
  color: '#007bff',
  fontWeight: 'bold',
},
toggleTextSelected: {
  color: 'white',
  fontWeight: 'bold',
},

});

export default ProfilePage;
