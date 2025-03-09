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
      if (!userInfo.id) {
        console.error("❌ Erreur : userInfo.id est undefined !");
        alert("User ID is missing. Please try again.");
        return;
      }

      // 🔹 Mettre à jour les skills
      await axios.put(`http://localhost:8080/users/${userInfo.id}/skills`, skills, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}`,
        },
      });

      console.log("✅ Skills updated successfully!");

      // ✅ 🔹 Stocker `userType` dans AsyncStorage pour éviter qu'il soit perdu
      await AsyncStorage.setItem('userType', userInfo.userType);
      await AsyncStorage.setItem('userId', userInfo.id);

      // ✅ 🔹 Redirection correcte
      if (userInfo.userType === 'INDIVIDUAL') {
        navigation.navigate('IndividualHome', { userInfo });
      } else if (userInfo.userType === 'COMPANY') {
        navigation.navigate('CompanyHome', { userInfo });
      }

    } catch (error) {
      console.error('❌ Failed to update skills:', error);
      alert('Failed to update skills. Please try again.');
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
