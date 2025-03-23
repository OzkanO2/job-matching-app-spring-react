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
import IndividualHomePage from '../pages/IndividualHomePage';
import CompanyHomePage from '../pages/homepages/CompanyHomePage';
import CompanyRedirectedPage from '../pages/homepages/CompanyRedirectedPage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LikedPage from '../pages/liked/LikedPage';
import ChatRoom from '../pages/chat/ChatRoom';
import JobOfferDetails from '../pages/offers/JobOfferDetails';
import EditOfferPage from '../pages/offers/EditOfferPage';
import ChangePasswordPage from '../pages/profile/ChangePasswordPage';

const Stack = createStackNavigator();

function MainStackNavigator() {
  const [initialRoute, setInitialRoute] = React.useState('SignIn');

  React.useEffect(() => {
    const determineInitialRoute = async () => {
      const userType = await AsyncStorage.getItem('userType');
      const isLoggedIn = await AsyncStorage.getItem('userToken');

      console.log("🔍 userType récupéré :", userType);

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
          name="CompanyRedirectedPage"
          component={CompanyRedirectedPage}
          options={{
            title: 'Home Redirected',
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
        name="ChangePasswordPage"
        component={ChangePasswordPage}
        options={{
          headerLeft: () => null,
          title: 'Change Password',
        }}
      />
      <Stack.Screen
        name="EditProfilePage"
        component={EditProfilePage}
        options={{
          headerLeft: () => null,
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
        name="EditOfferPage"
        component={EditOfferPage}
        options={{
          headerLeft: () => null,
          title: "Edit offer",
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
        name="JobSeekerOnboardingPage"
        component={JobSeekerOnboardingPage}
        options={{
          headerLeft: () => null,
          title: 'Job Seeker Onboarding',
        }}
      />
      <Stack.Screen
        name="CompanyOnboardingPage"
        component={CompanyOnboardingPage}
        options={{
          headerLeft: () => null,
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
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoom}
        options={{
          headerLeft: () => null,
          title: 'Chat Room',
        }}
      />
      <Stack.Screen
          name="JobOfferDetails"
          component={JobOfferDetails}
          options={{
            headerLeft: () => null,
            title: 'Job Offer Details',
          }}
        />
    </Stack.Navigator>
  );
}

export default MainStackNavigator;
