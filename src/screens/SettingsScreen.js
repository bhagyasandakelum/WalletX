import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Pressable, Alert } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Footer from '../components/Footer';

export default function SettingsScreen() {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

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
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>

                    <View style={styles.row}>
                        <View>
                            <Text style={styles.label}>Dark Mode</Text>
                            <Text style={styles.subLabel}>Enable dark theme</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: '#e5e7eb', true: '#00D09C' }}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View>
                            <Text style={styles.label}>Notifications</Text>
                            <Text style={styles.subLabel}>Daily reminders</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: '#e5e7eb', true: '#00D09C' }}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>

                    <Pressable style={styles.rowButton} onPress={handleReset}>
                        <Text style={[styles.label, { color: '#ef4444' }]}>Reset All Data</Text>
                    </Pressable>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Version</Text>
                        <Text style={styles.value}>1.0.0</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Developer</Text>
                        <Text style={styles.value}>zeroaxill</Text>
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
