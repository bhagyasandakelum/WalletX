import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWallet } from '../context/WalletContext';

export default function Footer() {
    const navigation = useNavigation();
    const route = useRoute();
    const currentRoute = route.name;
    const insets = useSafeAreaInsets();

    const wallet = useWallet();
    const notifications = wallet ? wallet.notifications : [];
    const hasUnread = notifications.some(n => !n.read);

    return (
        <View style={[styles.footer, { bottom: Math.max(insets.bottom + 10, 20) }]}>
            <Pressable
                style={styles.footerItem}
                onPress={() => navigation.navigate('Home')}
            >
                <Feather name="home" size={22} color={(currentRoute === 'Home' || currentRoute === 'AddExpense') ? '#00D09C' : '#9ca3af'} style={styles.footerIcon} />
                <Text style={[styles.footerText, (currentRoute === 'Home' || currentRoute === 'AddExpense') && styles.footerTextActive]}>Home</Text>
            </Pressable>

            <Pressable
                style={styles.footerItem}
                onPress={() => navigation.navigate('Stats')}
            >
                <Feather name="pie-chart" size={22} color={currentRoute === 'Stats' ? '#00D09C' : '#9ca3af'} style={styles.footerIcon} />
                <Text style={[styles.footerText, currentRoute === 'Stats' && styles.footerTextActive]}>Stats</Text>
            </Pressable>

            <Pressable
                style={styles.footerItem}
                onPress={() => navigation.navigate('Budget')}
            >
                <Feather name="target" size={22} color={currentRoute === 'Budget' ? '#00D09C' : '#9ca3af'} style={styles.footerIcon} />
                <Text style={[styles.footerText, currentRoute === 'Budget' && styles.footerTextActive]}>Budget</Text>
            </Pressable>

            <Pressable
                style={styles.footerItem}
                onPress={() => navigation.navigate('Notifications')}
            >
                <View style={styles.iconWrapper}>
                    <Feather name="bell" size={22} color={currentRoute === 'Notifications' ? '#00D09C' : '#9ca3af'} style={styles.footerIcon} />
                    {hasUnread && <View testID="unread-badge" style={styles.badgeDot} />}
                </View>
                <Text style={[styles.footerText, currentRoute === 'Notifications' && styles.footerTextActive]}>Insights</Text>
            </Pressable>

            <Pressable
                style={styles.footerItem}
                onPress={() => navigation.navigate('Settings')}
            >
                <Feather name="settings" size={22} color={currentRoute === 'Settings' ? '#00D09C' : '#9ca3af'} style={styles.footerIcon} />
                <Text style={[styles.footerText, currentRoute === 'Settings' && styles.footerTextActive]}>Settings</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    footerItem: {
        alignItems: 'center',
    },
    footerIcon: {
        marginBottom: 4,
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
    iconWrapper: {
        position: 'relative',
    },
    badgeDot: {
        position: 'absolute',
        top: -1,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
});
