import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import OnboardingScreen from './src/screens/OnboardingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import StaffScreen from './src/screens/StaffScreen';
import ForecastScreen from './src/screens/ForecastScreen';
import OptimizeScreen from './src/screens/OptimizeScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isOnboarded, setIsOnboarded] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    checkOnboarded();
  }, []);

  const checkOnboarded = async () => {
    try {
      const onboarded = await AsyncStorage.getItem('onboarded');
      setIsOnboarded(!!onboarded);
    } catch (e) {
      console.error('Onboarding check error:', e);
      setIsOnboarded(true);
    }
  };

  if (isOnboarded === null) {
    return null;
  }

  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#6200ee' },
            headerTintColor: '#fff',
            contentStyle: { backgroundColor: '#f5f5f5' },
          }}
        >
          {isOnboarded ? (
            <>
              <Stack.Screen 
                name="Dashboard" 
                component={DashboardScreen} 
                options={{ title: 'ShiftAI Dashboard' }} 
              />
              <Stack.Screen 
                name="Staff" 
                component={StaffScreen} 
                options={{ title: 'Staff Management' }} 
              />
              <Stack.Screen 
                name="Forecast" 
                component={ForecastScreen} 
                options={{ title: 'Demand Forecast' }} 
              />
              <Stack.Screen 
                name="Optimize" 
                component={OptimizeScreen} 
                options={{ title: 'Optimize Shifts' }} 
              />
              <Stack.Screen 
                name="Schedule" 
                component={ScheduleScreen} 
                options={{ title: 'Schedule Calendar' }} 
              />
            </>
          ) : (
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen} 
              options={{ headerShown: false }} 
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
