import React from 'react';
import { useEffect } from 'react';
import { initDB } from './src/database/db';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddExpenseScreen from './src/screens/AddExpenseScreen';
import StatsScreen from './src/screens/StatsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    initDB().catch(err=> console.log(err));
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AddExpense"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
