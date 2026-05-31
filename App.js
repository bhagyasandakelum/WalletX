import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';

import { initDB } from './src/database/db';
import { WalletProvider } from './src/context/WalletContext';
import { getSetting } from './src/services/expenseService';

import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import CustomSplashScreen from './src/screens/SplashScreen'; // Renamed for a clearer distinction
import NotificationsScreen from './src/screens/NotificationsScreen';

// Prevent native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleUnlock = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({ 
        promptMessage: "Unlock WalletX to continue",
        cancelLabel: "Cancel",
        disableDeviceFallback: false 
      });
      if (result.success) {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.warn("Unlock error:", e);
    }
  };

  useEffect(() => {
    async function prepare() {
      try {
        // Run DB init and artificial delay in parallel
        await Promise.all([
          initDB(),
          new Promise(resolve => setTimeout(resolve, 3000))
        ]);

        try {
          const lockEnabled = await getSetting('appLock');

          if (lockEnabled === 'true') {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (hasHardware) {
              const isEnrolled = await LocalAuthentication.isEnrolledAsync();
              if (isEnrolled) {
                setIsAuthenticated(false);
                const result = await LocalAuthentication.authenticateAsync({ 
                  promptMessage: "Unlock WalletX to continue",
                  cancelLabel: "Cancel",
                  disableDeviceFallback: false 
                });
                if (result.success) {
                  setIsAuthenticated(true);
                }
              }
            }
          }
        } catch (authError) {
          console.warn("Auth error:", authError);
        }
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

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <LockScreen onUnlock={handleUnlock} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <WalletProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="Budget" component={BudgetScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </WalletProvider>
    </SafeAreaProvider>
  );
}

const LockScreen = ({ onUnlock }) => {
  return (
    <LinearGradient colors={['#1f2937', '#111827']} style={lockStyles.container}>
      <View style={lockStyles.content}>
        <Text style={lockStyles.emoji}>🔒</Text>
        <Text style={lockStyles.title}>WalletX Locked</Text>
        <Text style={lockStyles.subtitle}>Authentication required to access your wallet</Text>
        
        <Pressable style={lockStyles.button} onPress={onUnlock}>
          <Text style={lockStyles.buttonText}>Unlock App</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

const lockStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 280,
  },
  button: {
    backgroundColor: '#00D09C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
