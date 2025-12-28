// src/components/Footer.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={styles.footer}>
      <Text
        style={[
          styles.footerItem,
          route.name === 'AddExpense' && styles.footerActive,
        ]}
        onPress={() => navigation.navigate('AddExpense')}
      >
        🏠
      </Text>

      <Text
        style={[
          styles.footerItem,
          route.name === 'Stats' && styles.footerActive,
        ]}
        onPress={() => navigation.navigate('Stats')}
      >
        📊
      </Text>

      <Text style={styles.footerItem}>⚙️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },

  footerItem: { fontSize: 22 },

  footerActive: { fontWeight: '800' },
});
