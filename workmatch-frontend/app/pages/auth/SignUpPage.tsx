import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
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
      <Text>Sign Up Page</Text>
      <Text>Select User Type:</Text>
      <Button title="Individual" onPress={() => setUserType('INDIVIDUAL')} color={userType === 'INDIVIDUAL' ? 'blue' : 'gray'} />
      <Button title="Company" onPress={() => setUserType('COMPANY')} color={userType === 'COMPANY' ? 'blue' : 'gray'} />

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
              style={[styles.input, !isEmailPrefixValid && styles.inputError]}
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

      {userType !== '' && <Button title="Sign Up" onPress={handleSignUp} />}
      <Button title="Go to Sign In" onPress={() => navigation.navigate('SignIn')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    width: '100%',
    paddingHorizontal: 8,
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
    width: '100%',
  },
  picker: {
    height: 40,
    width: 150,
    marginLeft: 10,
  },
});
