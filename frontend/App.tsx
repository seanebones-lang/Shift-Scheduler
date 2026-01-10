import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isOnboarded, setIsOnboarded] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    checkOnboarded();
  }, []);

  const checkOnboarded = async () => {
    const onboarded = await AsyncStorage.getItem('onboarded');
    setIsOnboarded(!!onboarded);
  };

  if (isOnboarded === null) {
    return null; // Loading
  }

  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isOnboarded ? (
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
          ) : (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
