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
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [locationDropdowns, setLocationDropdowns] = useState(1); // au moins 1 visible
    const [locationSuccess, setLocationSuccess] = useState(false);

    const addLocationDropdown = () => {
      setLocationDropdowns(prev => prev + 1);
    };

    const handleLocationChange = (index, value) => {
      const updated = [...selectedLocations];
      updated[index] = value;
      setSelectedLocations(updated);
    };

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

    const removeLocationAtIndex = (index) => {
      const updated = [...selectedLocations];
      updated.splice(index, 1);
      setSelectedLocations(updated);
    };
const saveAllPreferencesToBackend = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userId');

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const updatedData = {
      skills: Object.entries(skills).map(([name, experience]) => ({ name, experience })),
      locations: selectedLocations.filter(loc => loc !== ""),
      remote: isRemotePreferred
    };
    console.log("📦 Payload envoyé :", updatedData);

    // 2. Un seul PUT avec tout en une fois
    await axios.put(`http://localhost:8080/jobsearchers/${userId}/updateUser`, updatedData, {
      headers
    });

    // ✅ Success message
    setSkillsSuccess(true);
    setLocationSuccess(true);
    setRemoteSuccess(true);

    setTimeout(() => {
      setSkillsSuccess(false);
      setLocationSuccess(false);
      setRemoteSuccess(false);
    }, 3000);

  } catch (err) {
    console.error("❌ Erreur globale d'enregistrement :", err);
  }
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
      locations: selectedLocations.filter(loc => loc !== "") // retire les vides
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setLocationSuccess(true);
    setTimeout(() => setLocationSuccess(false), 3000);
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
                }
                if (jobSearcher.locations && Array.isArray(jobSearcher.locations)) {
                    setSelectedLocations(jobSearcher.locations);
                  }

                  // ✅ ICI tu ajoutes :
                  if (typeof jobSearcher.remote === 'boolean') {
                    setIsRemotePreferred(jobSearcher.remote);
                  }

            } catch (error) {
              console.error("❌ Erreur lors de la récupération des compétences JobSearcher:", error);
            }
          };

        fetchUserType();
        fetchUserInfo();
    }, [navigation]);

    const updateLocationAtIndex = (index, newValue) => {
      const updated = [...selectedLocations];
      updated[index] = newValue;
      setSelectedLocations(updated);
    };
    const addNewLocation = () => {
      setSelectedLocations([...selectedLocations, ""]);
    };

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
          <TouchableOpacity style={[styles.navButton, { backgroundColor: '#3b82f6' }]} onPress={() => navigation.navigate('ProfilePage')}>
            <Text style={styles.navButtonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navButton, { backgroundColor: '#60a5fa' }]} onPress={() => navigation.navigate(userType === 'INDIVIDUAL' ? 'IndividualHome' : 'CompanyHome')}>
            <Text style={styles.navButtonText}>Main Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navButton, { backgroundColor: '#93c5fd' }]} onPress={() => navigation.navigate('ChatPage')}>
            <Text style={styles.navButtonText}>Chat</Text>
          </TouchableOpacity>

          {userType === 'INDIVIDUAL' && (
            <TouchableOpacity style={[styles.navButton, { backgroundColor: '#dbeafe' }]} onPress={() => navigation.navigate('LikedOffersPage')}>
              <Text style={styles.navButtonText}>Liked Offers</Text>
            </TouchableOpacity>
          )}

          {userType === 'COMPANY' && (
            <>

              <TouchableOpacity style={[styles.navButton, { backgroundColor: '#c7d2fe' }]} onPress={() => navigation.navigate('MyOffersPage')}>
                <Text style={styles.navButtonText}>My Offers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: '#dbeafe' }]}
                onPress={() => navigation.navigate('LikedCandidatesPage')}
              >
                <Text style={styles.navButtonText}>Liked Candidates</Text>
              </TouchableOpacity>

            </>
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

            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>📍 Localisation préférée</Text>

              {selectedLocations.map((loc, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Picker
                    selectedValue={loc}
                    onValueChange={(value) => updateLocationAtIndex(index, value)}
                    style={{ flex: 1, height: 50 }}
                  >
                    <Picker.Item label="Sélectionner une ville" value="" />
                    <Picker.Item label="Paris" value="Paris" />
                    <Picker.Item label="Lyon" value="Lyon" />
                    <Picker.Item label="Marseille" value="Marseille" />
                    <Picker.Item label="Bruxelles" value="Bruxelles" />
                    <Picker.Item label="Liège" value="Liège" />
                  </Picker>

                  <TouchableOpacity onPress={() => removeLocationAtIndex(index)} style={{ marginLeft: 10 }}>
                    <Ionicons name="trash-outline" size={24} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              ))}


              <TouchableOpacity onPress={addNewLocation} style={{ marginBottom: 10 }}>
                <Text style={{ color: '#007bff', textAlign: 'center' }}>+ Ajouter une localisation</Text>
              </TouchableOpacity>

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
<View style={{ marginTop: 20 }}>
  <Button title="💾 Enregistrer mes préférences" onPress={saveAllPreferencesToBackend} />
  {(skillsSuccess || remoteSuccess || locationSuccess) && (
    <Text style={{ color: 'green', marginTop: 6 }}>
      ✅ Préférences mises à jour avec succès !
    </Text>
  )}
</View>

            </View>
          </>
        )}

        <View style={styles.content}>
          <Image source={{ uri: 'https://example.com/photo.jpg' }} style={styles.photo} />
          <Text style={styles.defaultText}>{userInfo.username ?? "Nom indisponible"}</Text>

          <Text style={styles.defaultText}>{userInfo.email}</Text>
          <Text style={styles.defaultText}>{userInfo.userType}</Text>
          <Text style={styles.defaultText}>Certification: {userInfo.companyCertified ? 'Certified' : 'Not Certified'}</Text>

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
      backgroundColor: '#0f172a',
    },
    topButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
      marginTop: 20,
      marginBottom: 20,
    },
    categorySection: {
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#ffffff',
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
        color: '#ffffff',
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
        color: '#ffffff',
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
      color: '#ffffff',
    },
    defaultText: {
      color: '#ffffff',
    }
,
scroll: {
  flex: 1,
  backgroundColor: '#0f172a', // Ajoute cette ligne si absente
},
scrollContainer: {
  paddingBottom: 100,
  paddingHorizontal: 10,
  backgroundColor: '#0f172a', // Ajoute cette ligne si absente
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
navButton: {
  backgroundColor: '#1e3a8a',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 3,
},
navButtonText: {
  color: '#ffffff',
  fontWeight: 'bold',
  textAlign: 'center',
},

});

export default ProfilePage;
