import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Pressable, Alert } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Footer from '../components/Footer';

import { useWallet } from '../context/WalletContext';

export default function SettingsScreen() {
    const { isDarkMode, setIsDarkMode } = useWallet();
    const [notifications, setNotifications] = useState(true);

    const themeColors = isDarkMode ? {
        bg: '#1f2937',
        text: '#f9fafb',
        subText: '#9ca3af',
        cardBg: '#374151',
        border: '#4b5563'
    } : {
        bg: '#f3f4f6',
        text: '#111827',
        subText: '#6b7280',
        cardBg: '#ffffff',
        border: '#f3f4f6'
    };

    const handleReset = () => {
        Alert.alert(
            "Reset App",
            "Are you sure you want to reset all data? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => Alert.alert("Reset", "Data reset functionality to be implemented.")
                }
            ]
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={[styles.section, { backgroundColor: themeColors.cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>General</Text>

                    <View style={styles.row}>
                        <View>
                            <Text style={[styles.label, { color: themeColors.text }]}>Dark Mode</Text>
                            <Text style={[styles.subLabel, { color: themeColors.subText }]}>Enable dark theme</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={setIsDarkMode}
                            trackColor={{ false: '#e5e7eb', true: '#00D09C' }}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

                    <View style={styles.row}>
                        <View>
                            <Text style={[styles.label, { color: themeColors.text }]}>Notifications</Text>
                            <Text style={[styles.subLabel, { color: themeColors.subText }]}>Daily reminders</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: '#e5e7eb', true: '#00D09C' }}
                        />
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: themeColors.cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>Data</Text>

                    <Pressable style={styles.rowButton} onPress={handleReset}>
                        <Text style={[styles.label, { color: '#ef4444' }]}>Reset All Data</Text>
                    </Pressable>
                </View>

                <View style={[styles.section, { backgroundColor: themeColors.cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>About</Text>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: themeColors.text }]}>Version</Text>
                        <Text style={[styles.value, { color: themeColors.subText }]}>1.0.1</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: themeColors.text }]}>Developer</Text>
                        <Text style={[styles.value, { color: themeColors.subText }]}>zeroaxill</Text>
                    </View>
                </View>

            </ScrollView>

            <Footer />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9ca3af',
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    rowButton: {
        paddingVertical: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    subLabel: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
    },
    value: {
        fontSize: 16,
        color: '#6b7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 12,
    }
});
