import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const OnboardingPage = ({ navigation, route }) => {
  const { userInfo } = route.params;

  return (
    <View style={styles.container}>
      <Text>Are you a Job Seeker or a Company?</Text>
      <Button title="Job Seeker" onPress={() => navigation.navigate('JobSeekerOnboarding', { userInfo })} />
      <Button title="Company" onPress={() => navigation.navigate('CompanyOnboarding', { userInfo })} />
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
