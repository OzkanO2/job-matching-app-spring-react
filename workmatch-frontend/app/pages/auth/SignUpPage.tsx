import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function SignUpPage({ navigation }) {
  const [userType, setUserType] = useState(''); // "INDIVIDUAL" ou "COMPANY"
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [uniqueNumber, setUniqueNumber] = useState(''); // SIRET ou autre identifiant unique

  const validateInput = () => {
    if (username.length < 4) {
      Alert.alert('Invalid Username', 'Username must be at least 4 characters long.');
      return false;
    }
    if (password.length < 4) {
      Alert.alert('Invalid Password', 'Password must be at least 4 characters long.');
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }
    // Validation spécifique aux entreprises
    if (userType === 'COMPANY' && uniqueNumber.length < 8) {
      Alert.alert('Invalid SIRET', 'Company Unique Number must be at least 8 characters long.');
      return false;
    }
    return true;
  };

  const handleSignUp = () => {
    if (!validateInput()) {
      return;
    }

    const userData = {
      username,
      email,
      password,
      userType,
      companyName: userType === 'COMPANY' ? companyName : null,
      uniqueNumber: userType === 'COMPANY' ? uniqueNumber : null,
    };

    axios.post('http://localhost:8080/users/register', userData)
      .then(response => {
        if (response.status === 201) {
          Alert.alert('Success', 'User registered successfully');
          const userInfo = response.data;
          if (userType === 'INDIVIDUAL') {
            navigation.navigate('JobSeekerOnboardingPage', { userInfo });
          } else {
            navigation.navigate('CompanyOnboardingPage', { userInfo });
          }
        } else {
          Alert.alert('Error', 'Registration failed');
        }
      })
      .catch(error => {
        if (error.response && error.response.status === 409) {
          Alert.alert('Conflict', error.response.data);
        } else {
          Alert.alert('Error', 'An error occurred. Please try again.');
        }
      });
  };

  return (
    <View style={styles.container}>
      <Text>Sign Up Page</Text>
      <Text>Select User Type:</Text>
      <Button title="Individual" onPress={() => setUserType('INDIVIDUAL')} color={userType === 'INDIVIDUAL' ? 'blue' : 'gray'} />
      <Button title="Company" onPress={() => setUserType('COMPANY')} color={userType === 'COMPANY' ? 'blue' : 'gray'} />

      {userType !== '' && (
        <>
          <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        </>
      )}

      {userType === 'COMPANY' && (
        <>
          <TextInput placeholder="Company Name" value={companyName} onChangeText={setCompanyName} style={styles.input} />
          <TextInput placeholder="Company Unique Number (SIRET)" value={uniqueNumber} onChangeText={setUniqueNumber} style={styles.input} />
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
});
