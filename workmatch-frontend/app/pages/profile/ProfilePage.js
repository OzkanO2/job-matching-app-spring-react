import React, { useEffect, useState } from 'react';
import { Image, Button, View, Text, StyleSheet, ScrollView,TextInput,Alert,TouchableOpacity}from 'react-native';// ✅ AJOUTE CECI } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckBox } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import SockJS from 'sockjs-client';

const ProfilePage = () => {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(null);
    const [userType, setUserType] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [tempSelectedCategories, setTempSelectedCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [skills, setSkills] = useState({});
    const [skillsSuccess, setSkillsSuccess] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [isRemotePreferred, setIsRemotePreferred] = useState(false);
    const [remoteSuccess, setRemoteSuccess] = useState(false);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [locationDropdowns, setLocationDropdowns] = useState(1);
    const [locationSuccess, setLocationSuccess] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [employmentType, setEmploymentType] = useState('');
    const [employmentTypeSuccess, setEmploymentTypeSuccess] = useState(false);
    const [salaryMin, setSalaryMin] = useState(30000);
    const [salaryMax, setSalaryMax] = useState(60000);

    useEffect(() => {
      const connectNotificationWebSocket = async () => {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const stomp = Stomp.over(socket);
        stomp.debug = null;

        stomp.connect({}, () => {
          stomp.subscribe(`/topic/notifications/${userId}`, async (message) => {
            const msg = JSON.parse(message.body);
            console.log('Notification reçue dans CompanyHomePage !', msg);

            const conversationId = msg.conversationId;
            if (!conversationId) return;

            try {
              const stored = await AsyncStorage.getItem('unreadByConversation');
              const unreadMap = stored ? JSON.parse(stored) : {};

              unreadMap[conversationId] = (unreadMap[conversationId] || 0) + 1;

              await AsyncStorage.setItem('unreadByConversation', JSON.stringify(unreadMap));
            } catch (error) {
              console.error("Erreur de stockage des unreadByConversation :", error);
            }

            const senderId = msg.senderId;

            if (senderId !== userId) {
              setUnreadCount(1); // juste pour forcer l’affichage de la bulle

              // Et incrémenter par conversation :
              AsyncStorage.getItem('unreadByConversation').then((raw) => {
                const map = raw ? JSON.parse(raw) : {};
                const convId = msg.conversationId;

                map[convId] = (map[convId] || 0) + 1;
                AsyncStorage.setItem('unreadByConversation', JSON.stringify(map));
              });
            }

          });
        });

      };

      connectNotificationWebSocket();
    }, []);

    useEffect(() => {
      const loadUnreadCount = async () => {
        const storedCount = await AsyncStorage.getItem('unreadMessageCount');
        if (storedCount !== null) {
          setUnreadCount(parseInt(storedCount, 10));
        }
      };

      loadUnreadCount();
    }, []);

    const addLocationDropdown = () => {
      setLocationDropdowns(prev => prev + 1);
    };

    const handleLocationChange = (index, value) => {
      const updated = [...selectedLocations];
      updated[index] = value;
      setSelectedLocations(updated);
    };

    const availableSkills = [
      "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Next.js",
      "Node.js", "Express.js", "Spring Boot", "Django", "Flask", "Ruby on Rails", "PHP", "Laravel",
      "Java", "Python", "C#", "C++", "Go", "Rust", "Kotlin", "Swift", "Ruby",
      "Docker", "Kubernetes", "CI/CD", "Jenkins", "GitLab CI", "Terraform", "Ansible", "AWS", "Azure", "GCP",
      "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "Keras", "PyTorch", "Matplotlib", "Seaborn",
      "CloudFormation", "AWS Lambda", "S3", "EC2", "Cloud Functions", "Firestore",
      "Cybersecurity", "Penetration Testing", "Network Security", "OWASP", "SIEM", "Firewall",
      "SQL", "Power BI", "Excel", "Data Analysis", "Tableau", "UML", "Agile", "Scrum",
      "Git", "GitHub", "Bitbucket", "VS Code", "JIRA", "Postman", "Figma", "Notion"
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
          remote: isRemotePreferred,
          employmentType,
  salaryMin,
  salaryMax
        };
        console.log("Payload envoyé :", updatedData);

        await axios.put(`http://localhost:8080/jobsearchers/${userId}/updateUser`, updatedData, {
          headers
        });

        setSkillsSuccess(true);
        setLocationSuccess(true);
        setRemoteSuccess(true);

        setTimeout(() => {
          setSkillsSuccess(false);
          setLocationSuccess(false);
          setRemoteSuccess(false);
        }, 3000);

      } catch (err) {
        console.error("Erreur globale d'enregistrement :", err);
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
    const categories = [
      "Développement Web",
      "Ingénieur DevOps",
      "Business Developer",
      "Software Developer",
      "Data Science",
      "Marketing",
      "Finance",
      "Cybersecurity",
      "Support IT",
      "Cloud Computing",
      "Solution Architect",
      "Business Analyst",
      "AI/ML",
      "Other"
    ];


    const savePreferencesToBackend = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userId = await AsyncStorage.getItem('userId');

            console.log("Envoi des préférences à l'API...");
            console.log("UserID :", userId);
            console.log("Catégories enregistrées :", tempSelectedCategories);

            const response = await axios.put(
                `http://localhost:8080/users/${userId}/preferences`,
                { preferredCategories: tempSelectedCategories },
                {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                }
            );

            console.log("Réponse API :", response.data);

            setSelectedCategories([...tempSelectedCategories]);
            alert("Vos préférences ont été enregistrées avec succès !");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des préférences :", error);
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
        console.error("Erreur enregistrement localisation :", err);
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
        setTimeout(() => setRemoteSuccess(false), 3000);

      } catch (err) {
        console.error("Erreur télétravail:", err);
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
                    console.error("No token or userId found");
                    return;
                }

                console.log("Récupération des préférences utilisateur...");

                const response = await axios.get(`http://localhost:8080/users/id/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userData = response.data;
                console.log("Données utilisateur récupérées :", userData);

                if (userData.preferredCategories) {
                    console.log("Préférences chargées :", userData.preferredCategories);
                    setSelectedCategories(userData.preferredCategories);
                    setTempSelectedCategories(userData.preferredCategories);
                } else {
                    console.warn("Aucune préférence trouvée en base.");
                }

                setIsLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des préférences :", error);
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
              throw new Error('Token, username ou userId manquant');
            }

            const bearerToken = `${token}`;

            const userResponse = await axios.get(`http://localhost:8080/users/${username}`, {
              headers: {
                Authorization: bearerToken,
              },
            });

            const userData = userResponse.data;
            setUserInfo(userData);
            console.log("Infos User:", userData);

            try {
              const jobSearcherRes = await axios.get(`http://localhost:8080/jobsearchers/${userId}`, {
                headers: { Authorization: bearerToken }
              });
              const jobSearcher = jobSearcherRes.data;

                if (jobSearcher.salaryMin) {
                  setSalaryMin(jobSearcher.salaryMin);
                }
                if (jobSearcher.salaryMax) {
                  setSalaryMax(jobSearcher.salaryMax);
                }

              console.log("Compétences reçues depuis JobSearcher:", jobSearcher.skills);

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

                  if (typeof jobSearcher.remote === 'boolean') {
                    setIsRemotePreferred(jobSearcher.remote);
                  }
                    if (jobSearcher.employmentType) {
                      setEmploymentType(jobSearcher.employmentType);
                    }

            } catch (error) {
              console.error("Erreur lors de la récupération des compétences JobSearcher:", error);
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

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => {
              setUnreadCount(0); // on cache la pastille
              navigation.navigate("ChatPage");
            }}
          >
            <Text style={styles.buttonText}>Chat</Text>
            {unreadCount > 0 && (
              <View style={styles.dot} />
            )}

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
              <Text style={styles.sectionTitle}>Offres recherchées</Text>
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
              <Text style={styles.sectionTitle}>Modifier mes compétences</Text>

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
              <Text style={styles.sectionTitle}> Localisation préférée</Text>

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
              <Text style={styles.sectionTitle}>Télétravail accepté ?</Text>

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
                <Text style={styles.sectionTitle}>Quel type de contrat cherches-tu ?</Text>
                <View style={styles.contractContainer}>
                  {["full_time", "part_time", "internship", "freelance"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.contractButton,
                        employmentType === type && styles.contractSelected,
                      ]}
                      onPress={() => setEmploymentType(type)}
                    >
                      <Text
                        style={[
                          styles.contractText,
                          employmentType === type && styles.contractTextSelected,
                        ]}
                      >
                        {type.replace("_", " ").toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {employmentTypeSuccess && (
                  <Text style={{ color: "green", marginTop: 6 }}>✅ Contrat préféré enregistré !</Text>
                )}
              </View>
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.sectionTitle}>Salaire souhaité</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
                    <View>
                      <Text style={styles.defaultText}>Minimum :</Text>
                      <View style={styles.experienceContainer}>
                        <TouchableOpacity onPress={() => setSalaryMin((prev) => Math.max(0, prev - 1000))}>
                          <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
                        </TouchableOpacity>
                        <Text style={styles.experienceValue}>{salaryMin} €</Text>
                        <TouchableOpacity onPress={() => setSalaryMin((prev) => prev + 1000)}>
                          <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View>
                      <Text style={styles.defaultText}>Maximum :</Text>
                      <View style={styles.experienceContainer}>
                        <TouchableOpacity onPress={() => setSalaryMax((prev) => Math.max(0, prev - 1000))}>
                          <Ionicons name="remove-circle-outline" size={24} color="#6c757d" />
                        </TouchableOpacity>
                        <Text style={styles.experienceValue}>{salaryMax} €</Text>
                        <TouchableOpacity onPress={() => setSalaryMax((prev) => prev + 1000)}>
                          <Ionicons name="add-circle-outline" size={24} color="#6c757d" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
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
  backgroundColor: '#0f172a',
},
scrollContainer: {
  paddingBottom: 100,
  paddingHorizontal: 10,
  backgroundColor: '#0f172a',
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
chatButton: {
  position: 'relative',
  backgroundColor: '#3b82f6',
  padding: 14,
  borderRadius: 10,
  alignItems: 'center',
},
badge: {
  position: 'absolute',
  top: -5,
  right: -10,
  backgroundColor: 'red',
  borderRadius: 10,
  paddingHorizontal: 6,
  paddingVertical: 2,
},
badgeText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 10,
},
dot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: 'red',
  position: 'absolute',
  top: -5,
  right: -10,
},
contractButton: {
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderWidth: 2,
  borderColor: '#3b82f6',
  borderRadius: 8,
  margin: 4,
  backgroundColor: '#1e293b',
},
contractSelected: {
  backgroundColor: '#3b82f6',
},
contractText: {
  fontSize: 12,
  color: '#3b82f6',
  fontWeight: 'bold',
},
contractTextSelected: {
  color: 'white',
},
contractContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginBottom: 10,
},

});

export default ProfilePage;
