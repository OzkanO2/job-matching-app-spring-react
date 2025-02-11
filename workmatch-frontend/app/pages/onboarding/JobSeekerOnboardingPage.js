import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, CheckBox } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JobSeekerOnboardingPage = ({ navigation, route }) => {
  const { userInfo } = route.params;
  const [skills, setSkills] = useState([]);
  const allSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C#', 'Ruby', 'Swift'];

  const handleSkillChange = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleSubmit = async () => {
     try {
       const updatedUserInfo = { ...userInfo, skills };

       const response = await axios.post('http://localhost:8080/users/login', {
         username: userInfo.username,
         password: userInfo.password,
       });

       const token = response.data.token;
       if (token) {
         await AsyncStorage.setItem('userToken', `Bearer ${token}`);
         await AsyncStorage.setItem('username', userInfo.username);

         navigation.navigate('Home', { userInfo: updatedUserInfo });
       } else {
         alert('Login failed');
       }
     } catch (error) {
       console.error('Login failed:', error);
     }
   };

  return (
    <View style={styles.container}>
      <Text>Select your skills:</Text>
      {allSkills.map((skill) => (
        <View key={skill} style={styles.checkboxContainer}>
          <CheckBox value={skills.includes(skill)} onValueChange={() => handleSkillChange(skill)} />
          <Text>{skill}</Text>
        </View>
      ))}
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default JobSeekerOnboardingPage;
