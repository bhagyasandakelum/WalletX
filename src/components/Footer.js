import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Footer() {
    const navigation = useNavigation();
    const route = useRoute();
    const currentRoute = route.name;
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
            <Pressable
                style={styles.footerItem}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={[styles.footerIcon, (currentRoute === 'Home' || currentRoute === 'AddExpense') && styles.footerActive]}>🏠</Text>
                <Text style={[styles.footerText, (currentRoute === 'Home' || currentRoute === 'AddExpense') && styles.footerTextActive]}>Home</Text>
            </Pressable>

            <Pressable
                style={styles.footerItem}
                onPress={() => navigation.navigate('Stats')}
            >
                <Text style={[styles.footerIcon, currentRoute === 'Stats' && styles.footerActive]}>📊</Text>
                <Text style={[styles.footerText, currentRoute === 'Stats' && styles.footerTextActive]}>Stats</Text>
            </Pressable>

            <Pressable
                style={styles.footerItem}
                onPress={() => navigation.navigate('Settings')}
            >
                <Text style={[styles.footerIcon, currentRoute === 'Settings' && styles.footerActive]}>⚙️</Text>
                <Text style={[styles.footerText, currentRoute === 'Settings' && styles.footerTextActive]}>Settings</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        // Height is removed to accommodate dynamic padding
        paddingTop: 10,
    },
    footerItem: {
        alignItems: 'center',
    },
    footerIcon: {
        fontSize: 24,
        marginBottom: 2,
        color: '#9ca3af' // Default color
    },
    footerText: {
        fontSize: 10,
        color: '#9ca3af',
        fontWeight: '600'
    },
    footerActive: {
        color: '#00D09C',
    },
    footerTextActive: {
        color: '#00D09C',
    },
});
