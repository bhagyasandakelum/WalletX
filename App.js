import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initDB } from './src/database/db';
import { WalletProvider } from './src/context/WalletContext';

import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SplashScreen from './src/screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Run DB init and a minimum timer in parallel
    Promise.all([
      initDB(),
      new Promise(resolve => setTimeout(resolve, 3000)) // Show splash for at least 3 seconds
    ])
      .then(() => setReady(true))
      .catch(err => console.log('Initialization error:', err));
  }, []);

  if (!ready) {
    return <SplashScreen />;
  }

  return (
    <WalletProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Stats" component={StatsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </WalletProvider>
  );
}

