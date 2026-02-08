import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { initDB } from './src/database/db';
import { WalletProvider } from './src/context/WalletContext';

import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CustomSplashScreen from './src/screens/SplashScreen'; // Renamed to avoid clearer distinction

// Prevent native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Run DB init and artificial delay in parallel
        await Promise.all([
          initDB(),
          new Promise(resolve => setTimeout(resolve, 3000))
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // Hide native splash screen immediately when component mounts
    // This allows our custom animated splash screen to be visible
    const hideNativeSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideNativeSplash();
  }, []);

  if (!appIsReady) {
    return (
      <SafeAreaProvider>
        <CustomSplashScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <WalletProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </WalletProvider>
    </SafeAreaProvider>
  );
}

