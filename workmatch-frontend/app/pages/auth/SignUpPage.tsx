import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpPage({ navigation }) {
  const [userType, setUserType] = useState('');
  const [username, setUsername] = useState('');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [emailDomain, setEmailDomain] = useState('gmail.com');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [uniqueNumber, setUniqueNumber] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailPrefixValid, setIsEmailPrefixValid] = useState(true);
  const [emailPrefixError, setEmailPrefixError] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [passwordError, setPasswordError] = useState('');

  const allowedDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'protonmail.com'];

  // Vérification du username en backend
  const checkUsernameAvailability = async (username) => {
    if (username.length < 4) {
      setUsernameError('Username must be at least 4 characters long.');
      setIsUsernameValid(false);
      return false;
    }

    try {
      const response = await axios.get(`process.env.REACT_APP_BACKEND_URL/users/checkUsername/${username}`);
      if (response.status === 200) {
        setUsernameError('');
        setIsUsernameValid(true);
        return true;
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setUsernameError('This username is already taken. Please choose another.');
        setIsUsernameValid(false);
      } else {
        setUsernameError('Error checking username availability.');
        setIsUsernameValid(false);
      }
      return false;
    }
  };

  // Vérification du préfixe de l'email
  const validateEmailPrefix = (prefix) => {
    setEmailPrefix(prefix);

    if (!/^[a-zA-Z0-9]+$/.test(prefix)) {
      setEmailPrefixError('Only letters and numbers are allowed.');
      setIsEmailPrefixValid(false);
      return false;
    }

    if (!/[0-9]/.test(prefix) || prefix.replace(/[^a-zA-Z]/g, '').length < 4) {
      setEmailPrefixError('Must contain at least 4 letters and 1 number.');
      setIsEmailPrefixValid(false);
      return false;
    }

    setEmailPrefixError('');
    setIsEmailPrefixValid(true);
    return true;
  };
    const validatePassword = (pwd) => {
      if (pwd.length < 4) {
        setPasswordError('Password must be at least 4 characters.');
        setIsPasswordValid(false);
        return false;
      }
      setPasswordError('');
      setIsPasswordValid(true);
      return true;
    };

  const validateEmail = () => {
    if (!validateEmailPrefix(emailPrefix)) return false;
    setEmailError('');
    return true;
  };

  const handleSignUp = async () => {
    if (!(await validateEmail())) {
      return;
    }
    if (!(await validateEmail()) || !validatePassword(password)) {
        return;
      }
    const userData = {
      username,
      email: `${emailPrefix}@${emailDomain}`,
      password,
      userType,
    };

    try {
      const response = await axios.post('process.env.REACT_APP_BACKEND_URL/users/register', userData);

      if (response.status === 201) {
        Alert.alert('Success', 'User registered successfully');
        const userInfo = response.data;

        console.log("User registered:", userInfo);

        //Auto-login après inscription
        const loginResponse = await axios.post('process.env.REACT_APP_BACKEND_URL/users/login', {
          username: userInfo.username,
          password: password,
        });

        console.log("Auto-login successful:", loginResponse.data);

        const token = loginResponse.data.token;
        if (token) {
          await AsyncStorage.setItem('userToken', `Bearer ${token}`);
          await AsyncStorage.setItem('username', userInfo.username);
          await AsyncStorage.setItem('userType', userInfo.userType);

        //Rediriger directement vers la page des compétences après l'inscription
        if (userInfo.userType === 'COMPANY') {
              console.log("Redirection vers CompanyOnboardingPage");

          navigation.navigate('CompanyOnboardingPage', { userInfo });
        } else {
              console.log("Redirection vers JobSeekerOnboardingPage");

          navigation.navigate('JobSeekerOnboardingPage', { userInfo });
        }

        } else {
          Alert.alert('Error', 'Login failed after registration.');
        }
      } else {
        Alert.alert('Error', 'Registration failed');
      }
    } catch (error) {
      console.error('Sign-up or login failed:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create your account</Text>

        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === 'INDIVIDUAL' && styles.userTypeActive]}
            onPress={() => setUserType('INDIVIDUAL')}
          >
            <Text style={[styles.userTypeText, userType === 'INDIVIDUAL' && styles.userTypeTextActive]}>Individual</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.userTypeButton, userType === 'COMPANY' && styles.userTypeActive]}
            onPress={() => setUserType('COMPANY')}
          >
            <Text style={[styles.userTypeText, userType === 'COMPANY' && styles.userTypeTextActive]}>Company</Text>
          </TouchableOpacity>
        </View>

        {userType !== '' && (
          <>
            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                checkUsernameAvailability(text);
              }}
              placeholderTextColor="#888"
              style={[styles.input, !isUsernameValid && styles.inputError]}
            />
            {usernameError && <Text style={styles.errorText}>{usernameError}</Text>}

            <View style={styles.emailRow}>
              <TextInput
                placeholder="Email Prefix"
                value={emailPrefix}
                onChangeText={(text) => validateEmailPrefix(text)}
                placeholderTextColor="#888"
                style={[styles.input, { flex: 1 }, !isEmailPrefixValid && styles.inputError]}
              />
              <Picker
                selectedValue={emailDomain}
                style={styles.picker}
                dropdownIconColor="white"
                onValueChange={(itemValue) => setEmailDomain(itemValue)}
              >
                {allowedDomains.map((domain) => (
                  <Picker.Item key={domain} label={`@${domain}`} value={domain} />
                ))}
              </Picker>
            </View>
            {emailPrefixError && <Text style={styles.errorText}>{emailPrefixError}</Text>}

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
              placeholderTextColor="#888"
              secureTextEntry
              style={[styles.input, !isPasswordValid && styles.inputError]}
            />
            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.altButton} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.altButtonText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    color: '#f8fafc',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#f1f5f9',
    marginBottom: 12,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    marginBottom: 10,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#334155',
    borderRadius: 10,
    height: 45,
    width: 140,
    color: 'white',
  },
  signupButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#f0fdfa',
    fontWeight: 'bold',
    fontSize: 16,
  },
  altButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  altButtonText: {
    color: '#60a5fa',
    fontSize: 14,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userTypeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  userTypeActive: {
    backgroundColor: '#3b82f6',
  },
  userTypeText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  userTypeTextActive: {
    color: '#ffffff',
  },
});
