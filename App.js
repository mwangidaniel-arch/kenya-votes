import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ElectionProvider } from './src/context/ElectionContext';

import HomeScreen from './src/screens/HomeScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import BallotScreen from './src/screens/BallotScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import AdminPinScreen from './src/screens/AdminPinScreen';
import AdminScreen from './src/screens/AdminScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ElectionProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: '#1565C0', elevation: 0, shadowOpacity: 0 },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: { fontWeight: '600', fontSize: 16 },
              cardStyle: { backgroundColor: '#F5F6FA' },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Kenya Elections 2024' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Voter Registration' }} />
            <Stack.Screen name="Verify" component={VerifyScreen} options={{ title: 'Voter Verification' }} />
            <Stack.Screen name="Ballot" component={BallotScreen} options={{ title: 'Official Ballot', headerLeft: null }} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ title: 'Vote Confirmed', headerLeft: null }} />
            <Stack.Screen name="AdminPin" component={AdminPinScreen} options={{ title: 'Admin Login' }} />
            <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Dashboard', headerLeft: null }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ElectionProvider>
    </GestureHandlerRootView>
  );
}
