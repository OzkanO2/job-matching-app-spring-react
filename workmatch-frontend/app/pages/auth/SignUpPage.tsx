import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpPage({ navigation }) {
  const [userType, setUserType] = useState(''); // "INDIVIDUAL" ou "COMPANY"
  const [username, setUsername] = useState('');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [emailDomain, setEmailDomain] = useState('gmail.com'); // Domaine par défaut
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [uniqueNumber, setUniqueNumber] = useState(''); // SIRET ou autre identifiant unique
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
      const response = await axios.get(`http://localhost:8080/users/checkUsername/${username}`);
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
      const response = await axios.post('http://localhost:8080/users/register', userData);

      if (response.status === 201) {
        Alert.alert('Success', 'User registered successfully');
        const userInfo = response.data;

        console.log("🟢 User registered:", userInfo);

        // 🔹 Auto-login après inscription
        const loginResponse = await axios.post('http://localhost:8080/users/login', {
          username: userInfo.username, // ✅ Correction: Utilisation de username
          password: password, // 🔥 On utilise le mot de passe saisi à l'inscription
        });

        console.log("🟢 Auto-login successful:", loginResponse.data);

        const token = loginResponse.data.token;
        if (token) {
          await AsyncStorage.setItem('userToken', `Bearer ${token}`);
          await AsyncStorage.setItem('username', userInfo.username);
          await AsyncStorage.setItem('userType', userInfo.userType); // ✅ très important

          // 🔹 Rediriger directement vers la page des compétences après l'inscription
        if (userInfo.userType === 'COMPANY') {
              console.log("➡️ Redirection vers CompanyOnboardingPage");

          navigation.navigate('CompanyOnboardingPage', { userInfo });
        } else {
              console.log("➡️ Redirection vers JobSeekerOnboardingPage");

          navigation.navigate('JobSeekerOnboardingPage', { userInfo });
        }

        } else {
          Alert.alert('Error', 'Login failed after registration.');
        }
      } else {
        Alert.alert('Error', 'Registration failed');
      }
    } catch (error) {
      console.error('🔴 Sign-up or login failed:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formBox}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Create Account ✍️</Text>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, userType === 'INDIVIDUAL' && styles.typeButtonActive]}
            onPress={() => setUserType('INDIVIDUAL')}
          >
            <Text style={[styles.typeText, userType === 'INDIVIDUAL' && styles.typeTextActive]}>Individual</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, userType === 'COMPANY' && styles.typeButtonActive]}
            onPress={() => setUserType('COMPANY')}
          >
            <Text style={[styles.typeText, userType === 'COMPANY' && styles.typeTextActive]}>Company</Text>
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
              style={[styles.input, !isUsernameValid && styles.inputError]}
            />
            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

            <View style={styles.emailContainer}>
              <TextInput
                placeholder="Email Prefix"
                value={emailPrefix}
                onChangeText={(text) => validateEmailPrefix(text)}
                style={[styles.input, { flex: 1 }, !isEmailPrefixValid && styles.inputError]}
              />
              <Picker
                selectedValue={emailDomain}
                style={styles.picker}
                onValueChange={(itemValue) => setEmailDomain(itemValue)}
              >
                {allowedDomains.map((domain) => (
                  <Picker.Item key={domain} label={`@${domain}`} value={domain} />
                ))}
              </Picker>
            </View>
            {emailPrefixError ? <Text style={styles.errorText}>{emailPrefixError}</Text> : null}

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
              secureTextEntry
              style={[styles.input, !isPasswordValid && styles.inputError]}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </>
        )}

        {userType !== '' && (
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, { backgroundColor: '#1abc9c' }]} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.buttonText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    padding: 16,
  },
  formBox: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 30,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  picker: {
    height: 45,
    width: 150,
    marginLeft: 10,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#3498db',
  },
  typeText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  typeTextActive: {
    color: 'white',
  },

});
