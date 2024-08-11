import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignInPage from '../pages/auth/SignInPage'; // Page de connexion
import SignUpPage from '../pages/auth/SignUpPage'; // Page d'inscription
import HomePage from '../pages/HomePage'; // Page d'accueil
import ProtectedPage from '../pages/ProtectedPage';
import ProfilePage from '../pages/profile/ProfilePage';
import EditProfilePage from '../pages/profile/EditProfilePage';
import SettingsPage from '../pages/settings/SettingsPage';
import ChatPage from '../pages/chat/ChatPage';
import MyOffersPage from '../pages/offers/MyOffersPage';
import OnboardingPage from '../pages/onboarding/OnboardingPage';
import JobSeekerOnboardingPage from '../pages/onboarding/JobSeekerOnboardingPage';
import CompanyOnboardingPage from '../pages/onboarding/CompanyOnboardingPage';
import MyJobMatchesPage from '../pages/offers/MyJobMatchesPage'; // Nouvelle page pour les utilisateurs INDIVIDUAL
import MyCompanyOffersPage from '../pages/offers/MyCompanyOffersPage'; // Nouvelle page pour les utilisateurs COMPANY

const Stack = createStackNavigator();

function MainStackNavigator() {
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
const [userType, setUserType] = React.useState(null);

   React.useEffect(() => {
          const fetchUserType = async () => {
              try {
                  const storedUserType = await AsyncStorage.getItem('userType');
                  setUserType(storedUserType);
              } catch (error) {
                  console.error('Failed to fetch user type:', error);
              }
          };

          fetchUserType();
      }, []);

  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen name="SignIn" component={SignInPage} />
      <Stack.Screen name="SignUp" component={SignUpPage} />
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Settings" component={SettingsPage} />
      <Stack.Screen name="JobSeekerOnboarding" component={JobSeekerOnboardingPage} />
      <Stack.Screen name="OnboardingPage" component={OnboardingPage} />
      <Stack.Screen name="ChatPage" component={ChatPage} />
      <Stack.Screen name="ProfilePage" component={ProfilePage} />
      <Stack.Screen name="EditProfilePage" component={EditProfilePage} />
      <Stack.Screen name="CompanyOnboarding" component={CompanyOnboardingPage} />
      <Stack.Screen name="Protected" component={ProtectedPage} />
      {userType === 'INDIVIDUAL' ? (
            <Stack.Screen name="MyOffersPage" component={MyJobMatchesPage} />
        ) : (
            <Stack.Screen name="MyOffersPage" component={MyCompanyOffersPage} />
        )}
    </Stack.Navigator>
  );
}
export default MainStackNavigator;