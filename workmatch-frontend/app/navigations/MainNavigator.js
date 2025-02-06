import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignInPage from '../pages/auth/SignInPage';
import SignUpPage from '../pages/auth/SignUpPage';
import ProfilePage from '../pages/profile/ProfilePage';
import EditProfilePage from '../pages/profile/EditProfilePage';
import SettingsPage from '../pages/settings/SettingsPage';
import ChatPage from '../pages/chat/ChatPage';
import MyOffersPage from '../pages/offers/MyOffersPage';
import JobSeekerOnboardingPage from '../pages/onboarding/JobSeekerOnboardingPage';
import CompanyOnboardingPage from '../pages/onboarding/CompanyOnboardingPage';
import MyJobMatchesPage from '../pages/offers/MyJobMatchesPage';
import MyCompanyOffersPage from '../pages/offers/MyCompanyOffersPage';
import IndividualHomePage from '../pages/IndividualHomePage';
import CompanyHomePage from '../pages/CompanyHomePage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LikedPage from '../pages/liked/LikedPage'; // ✅ Ajout de LikedPage

const Stack = createStackNavigator();

function MainStackNavigator() {
  const [initialRoute, setInitialRoute] = React.useState('SignIn');

  React.useEffect(() => {
    const determineInitialRoute = async () => {
      const userType = await AsyncStorage.getItem('userType');
      const isLoggedIn = await AsyncStorage.getItem('userToken');
      if (isLoggedIn) {
        if (userType === 'INDIVIDUAL') {
          setInitialRoute('IndividualHome');
        } else if (userType === 'COMPANY') {
          setInitialRoute('CompanyHome');
        }
      } else {
        setInitialRoute('SignIn');
      }
    };

    determineInitialRoute();
  }, []);

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="SignIn"
        component={SignInPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IndividualHome"
        component={IndividualHomePage}
        options={{
          title: 'Home',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="CompanyHome"
        component={CompanyHomePage}
        options={{
          title: 'Home',
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={{
          headerLeft: () => null,
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="EditProfilePage"
        component={EditProfilePage}
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen
        name="SettingsPage"
        component={SettingsPage}
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="ChatPage"
        component={ChatPage}
        options={{
          headerLeft: () => null,
          title: 'Chat',
        }}
      />
      <Stack.Screen
        name="MyOffersPage"
        component={MyOffersPage}
        options={{
          headerLeft: () => null,
          title: 'My Offers',
        }}
      />
      <Stack.Screen
        name="MyJobMatchesPage"
        component={MyJobMatchesPage}
        options={{
          title: 'Job Matches',
        }}
      />
      <Stack.Screen
        name="MyCompanyOffersPage"
        component={MyCompanyOffersPage}
        options={{
          title: 'Company Offers',
        }}
      />
      <Stack.Screen
        name="JobSeekerOnboardingPage"
        component={JobSeekerOnboardingPage}
        options={{
          title: 'Job Seeker Onboarding',
        }}
      />
      <Stack.Screen
        name="CompanyOnboardingPage"
        component={CompanyOnboardingPage}
        options={{
          title: 'Company Onboarding',
        }}
      />
      <Stack.Screen
        name="LikedPage"
        component={LikedPage}
        options={{
          headerLeft: () => null,
          title: 'LikedPage',
        }}
      />
    </Stack.Navigator>
  );
}

export default MainStackNavigator;
