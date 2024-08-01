import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignInPage from '../pages/SignInPage'; // Page de connexion
import SignUpPage from '../pages/SignUpPage'; // Page d'inscription
import HomePage from '../pages/HomePage'; // Page d'accueil
import ProtectedPage from '../pages/ProtectedPage';

const Stack = createStackNavigator();

function MainStackNavigator() {
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="SignIn" component={SignInPage} />
      <Stack.Screen name="SignUp" component={SignUpPage} />
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Protected" component={ProtectedPage} />
    </Stack.Navigator>
  );
}
export default MainStackNavigator;