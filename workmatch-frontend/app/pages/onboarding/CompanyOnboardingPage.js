import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const CompanyOnboardingPage = ({ navigation, route }) => {
  const { userInfo } = route.params;

  const handleSubmit = () => {
    // Save updatedUserInfo to AsyncStorage or send it to the backend
    navigation.navigate('Home', { userInfo });
  };

  return (
    <View style={styles.container}>
      <Text>Welcome, {userInfo.username}! Complete your company profile.</Text>
      {/* Add form elements for additional company information if needed */}
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
});

export default CompanyOnboardingPage;
