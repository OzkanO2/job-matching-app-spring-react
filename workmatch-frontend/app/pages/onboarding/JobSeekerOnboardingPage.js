import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, CheckBox } from 'react-native';

const JobSeekerOnboardingPage = ({ navigation, route }) => {
  const [skills, setSkills] = useState([]);
  const allSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C#', 'Ruby', 'Swift'];

  const handleSkillChange = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleSubmit = () => {
    const { userInfo } = route.params;
    const updatedUserInfo = { ...userInfo, skills };
    // Save updatedUserInfo to AsyncStorage or send it to the backend
    navigation.navigate('Home', { userInfo: updatedUserInfo });
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
