import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, TextInput,TouchableOpacity , Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../constants/api';
import { useFocusEffect } from '@react-navigation/native';

const EditProfilePage = () => {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [userInfo, setUserInfo] = useState({});
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [userType, setUserType] = useState(''); // ← AJOUTE CELUI-CI

    const validateInputs = () => {
      let isValid = true;

      if (!username || username.trim().length < 3) {
        setUsernameError('Le nom d’utilisateur doit contenir au moins 3 caractères.');
        isValid = false;
      } else {
        setUsernameError('');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setEmailError('Adresse email invalide.');
        isValid = false;
      } else {
        setEmailError('');
      }

      return isValid;
    };


    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                const token = await AsyncStorage.getItem('userToken');

                const bearerToken = `Bearer ${token}`;

                const response = await axios.get(`${BASE_URL}/users/${storedUsername}`, {
                    headers: {
                        Authorization: bearerToken,
                    },
                });

                setUsername(response.data.username);
                setEmail(response.data.email);
                setUserInfo(response.data);
            } catch (error) {
                console.error('Failed to load user info:', error);
                Alert.alert('Failed to load user info');
            }
        };

        loadUserData();
    }, []);


    useFocusEffect(
      React.useCallback(() => {
        const fetchUserTypeAndInfo = async () => {
          const type = await AsyncStorage.getItem('userType');
          setUserType(type);

          const token = await AsyncStorage.getItem('userToken');
          const username = await AsyncStorage.getItem('username');
          const userId = await AsyncStorage.getItem('userId');

          if (!token || !username || !userId) {
            console.error('Token, username ou userId manquant');
            return;
          }

          const bearerToken = `${token}`;

          try {
            const userResponse = await axios.get(`${BASE_URL}/users/${username}`, {
              headers: { Authorization: bearerToken },
            });

            const userData = userResponse.data;
            setUserInfo(userData);

            const jobSearcherRes = await axios.get(`${BASE_URL}/jobsearchers/${userId}`, {
              headers: { Authorization: bearerToken }
            });

            const jobSearcher = jobSearcherRes.data;

            if (jobSearcher.salaryMin) setSalaryMin(jobSearcher.salaryMin);
            if (jobSearcher.salaryMax) setSalaryMax(jobSearcher.salaryMax);

            if (jobSearcher.skills && Array.isArray(jobSearcher.skills)) {
              const formatted = {};
              const skillsArr = [];

              jobSearcher.skills.forEach(skill => {
                if (skill.name) {
                  formatted[skill.name] = skill.experience || 1;
                  skillsArr.push({ name: skill.name, experience: skill.experience || 1 });
                }
              });

              setSkills(formatted);
              setSkillsList(skillsArr);
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
            console.error("Erreur lors de la récupération des données utilisateur :", error);
          }
        };

        fetchUserTypeAndInfo();
      }, [])
    );
   const handleSave = async () => {
       if (!validateInputs()) return; // ← ne continue pas si erreur

       try {
           const token = await AsyncStorage.getItem('userToken');
           const bearerToken = `${token}`;

           console.log('Bearer Token Sent in EditProfilePage:', bearerToken);

           const response = await axios.put(
               `${BASE_URL}/users/updateUsername`,
               {
                   oldUsername: userInfo.username,
                   newUsername: username,
                   newEmail: email,
               },
               {
                   headers: {
                       Authorization: bearerToken,
                   },
               }
           );

           const newToken = response.data.token;
           await AsyncStorage.setItem('userToken', `Bearer ${newToken}`);
           await AsyncStorage.setItem('username', username);

           Alert.alert('Profile updated successfully');
           navigation.goBack();
       } catch (error) {
           console.error('An error occurred:', error);
           Alert.alert('Failed to update profile');
       }
   };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Username</Text>
            <TextInput
                value={username}
                onChangeText={(text) => {
                    setUsername(text);
                    if (text.trim().length >= 3) setUsernameError('');
                  }}
                style={[styles.input, usernameError ? styles.inputError : null]}
            />
            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

            <Text style={styles.label}>Email</Text>

            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(text)) setEmailError('');
              }}
              style={[styles.input, emailError ? styles.inputError : null]}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChangePasswordPage')}>
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>⬅ Back</Text>
            </TouchableOpacity>

        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 24,
        justifyContent: 'center',
    },
    label: {
        fontSize: 15,
        color: '#ffffff',
        marginBottom: 6,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#1e293b',
        color: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        marginBottom: 14,
    },
    buttonGroup: {
        marginTop: 20,
        gap: 10,
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    inputError: {
      borderColor: 'red',
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginBottom: 8,
    },

});

export default EditProfilePage;
