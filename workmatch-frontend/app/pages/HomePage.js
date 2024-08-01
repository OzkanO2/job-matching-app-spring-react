import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomePage({ navigation }) {
  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigation.navigate('SignIn');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to Home Page</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
      <Button title="Go to Protected Page" onPress={() => navigation.navigate('Protected')} />
    </View>
  );
}
