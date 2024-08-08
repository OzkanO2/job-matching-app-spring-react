import React from 'react';
import { View, Text, Button, StyleSheet, Alert} from 'react-native';
import axios from 'axios';
const OnboardingPage = ({ navigation, route }) => {
  const { userInfo } = route.params;

  const handleJobSeeker = () => {
    const updatedUserInfo = { ...userInfo, userType: 'INDIVIDUAL' };
    // Envoyez updatedUserInfo au backend
    axios.post('http://localhost:8080/users/updateUserType', updatedUserInfo)
      .then(response => {
        if (response.status === 200) {
          navigation.navigate('Home', { userInfo: response.data });
        } else {
          Alert.alert('Error', 'Update failed');
        }
      })
      .catch(error => {
        Alert.alert('Error', 'An error occurred. Please try again.');
      });
  };

  const handleCompany = () => {
    const updatedUserInfo = { ...userInfo, userType: 'COMPANY' };
    // Envoyez updatedUserInfo au backend
    axios.post('http://localhost:8080/users/updateUserType', updatedUserInfo)
      .then(response => {
        if (response.status === 200) {
          navigation.navigate('Home', { userInfo: response.data });
        } else {
          Alert.alert('Error', 'Update failed');
        }
      })
      .catch(error => {
        Alert.alert('Error', 'An error occurred. Please try again.');
      });
  };

  return (
    <View style={styles.container}>
      <Text>Are you a Job Seeker or a Company?</Text>
      <Button title="Job Seeker" onPress={handleJobSeeker} />
      <Button title="Company" onPress={handleCompany} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingPage;
