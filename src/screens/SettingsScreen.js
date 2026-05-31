import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Pressable, Alert, Share, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Footer from '../components/Footer';

import { useWallet } from '../context/WalletContext';
import { resetAllData, getAccounts, getAllExpenses, getSetting, setSetting } from '../services/expenseService';

export default function SettingsScreen() {
    const { isDarkMode, setIsDarkMode, reloadData } = useWallet();
    const [notifications, setNotifications] = useState(true);
    const [appLock, setAppLock] = useState(false);
    const [docModalVisible, setDocModalVisible] = useState(false);
    const [docModalType, setDocModalType] = useState('privacy'); // 'privacy' | 'terms'

    const openDoc = (type) => {
        setDocModalType(type);
        setDocModalVisible(true);
    };

    useEffect(() => {
        const loadAppLockSetting = async () => {
            try {
                const val = await getSetting('appLock');
                setAppLock(val === 'true');
            } catch (err) {
                console.error("Failed to load appLock setting", err);
            }
        };
        loadAppLockSetting();
    }, []);

    const handleToggleAppLock = async (value) => {
        try {
            setAppLock(value);
            await setSetting('appLock', value ? 'true' : 'false');
        } catch (err) {
            console.error("Failed to save appLock setting", err);
        }
    };

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
                    onPress: async () => {
                        try {
                            await resetAllData();
                            await reloadData();
                            Alert.alert("Success", "All data has been reset.");
                        } catch (error) {
                            Alert.alert("Error", "Could not reset data.");
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    const handleExportData = async () => {
        try {
            const accounts = await getAccounts();
            const expenses = await getAllExpenses();
            const data = JSON.stringify({ accounts, expenses }, null, 2);
            await Share.share({
                message: data,
                title: 'WalletX Backup Data'
            });
        } catch (error) {
            Alert.alert("Error", "Could not export data.");
            console.error(error);
        }
    };

    const DocModal = () => {
        const isPrivacy = docModalType === 'privacy';
        const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
        const dateStr = 'Last updated: May 31, 2026';

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={docModalVisible}
                onRequestClose={() => setDocModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setDocModalVisible(false)}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                    >
                        <Pressable style={[styles.modalContainer, { backgroundColor: themeColors.cardBg }]} onPress={(e) => e.stopPropagation()}>
                            <View style={[styles.modalPill, { backgroundColor: themeColors.border }]} />
                            
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: themeColors.text }]}>{title}</Text>
                                <Pressable style={styles.closeIconBtn} onPress={() => setDocModalVisible(false)}>
                                    <Text style={[styles.closeIconText, { color: themeColors.subText }]}>✕</Text>
                                </Pressable>
                            </View>

                            <Text style={[styles.modalDate, { color: themeColors.subText }]}>{dateStr}</Text>

                            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                                {isPrivacy ? (
                                    <View>
                                        <Text style={[styles.modalSectionTitle, { color: themeColors.text }]}>1. Overview</Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            WalletX is a private, offline-first personal finance application. All personal transaction-related records are stored strictly on your device using a local secure SQLite database. We do not transmit or store your personal financial data on remote servers.
                                        </Text>

                                        <Text style={[styles.modalSectionTitle, { color: themeColors.text }]}>2. Information We Collect</Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            • **User Provided Data:** Any accounts, category lists, budgets, or expense entries you create are stored entirely locally on your device.
                                        </Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            • **Biometric Details:** If you enable App Lock, WalletX interacts with native hardware biometrics (Fingerprint / Face ID). We never access or store your biometric credentials; authentication is handled safely by the Android OS.
                                        </Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            • **Diagnostics:** We may gather aggregate, anonymized diagnostics and app stability telemetry to troubleshoot bugs and crash reports.
                                        </Text>

                                        <Text style={[styles.modalSectionTitle, { color: themeColors.text }]}>3. Data Retention and Deletion</Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            Because all data is stored on your local device, you maintain full authority. You can completely erase your local records at any time by pressing "Reset All Data" in this screen. Erasing your data in the app permanently wipes the local SQLite tables.
                                        </Text>

                                        <Text style={[styles.modalSectionTitle, { color: themeColors.text }]}>4. Children's Privacy</Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            We do not knowingly solicit or collect information from children under the age of 13.
                                        </Text>

                                        <Text style={[styles.modalSectionTitle, { color: themeColors.text }]}>5. Contact Us</Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            For security inquiries or questions, contact us via email at zeroaxillsolution@gmail.com.
                                        </Text>
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={[styles.modalSectionTitle, { color: themeColors.text }]}>1. Acceptance of Terms</Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            By downloading or using WalletX, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please delete and discontinue using the app.
                                        </Text>

                                        <Text style={[styles.modalSectionTitle, { color: themeColors.text }]}>2. Financial Information & Advice</Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            WalletX is a budget-tracking tool designed to help you organize your finances. The application is provided "as is" and does not constitute professional investment, tax, or financial advice.
                                        </Text>

                                        <Text style={[styles.modalSectionTitle, { color: themeColors.text }]}>3. Data Protection and Backups</Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            Your financial records are saved on your physical device. We are not liable for data loss arising from physical device damage, theft, OS updates, or software failure. We encourage you to run routine, manual data backups using our "Export Data" button.
                                        </Text>

                                        <Text style={[styles.modalSectionTitle, { color: themeColors.text }]}>4. License & Ownership</Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            We grant you a personal, non-transferable, non-exclusive, revocable license to use the app for personal, non-commercial purposes in compliance with these terms.
                                        </Text>

                                        <Text style={[styles.modalSectionTitle, { color: themeColors.text }]}>5. Contact Us</Text>
                                        <Text style={[styles.modalText, { color: themeColors.subText }]}>
                                            For terms questions, email zeroaxillsolution@gmail.com.
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>

                            <View style={[styles.modalFooter, { borderTopColor: themeColors.border }]}>
                                <Pressable style={styles.modalCloseBtn} onPress={() => setDocModalVisible(false)}>
                                    <Text style={styles.modalCloseBtnText}>Got It</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
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
                    <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>Security</Text>

                    <View style={styles.row}>
                        <View>
                            <Text style={[styles.label, { color: themeColors.text }]}>App Lock</Text>
                            <Text style={[styles.subLabel, { color: themeColors.subText }]}>Require authentication to open</Text>
                        </View>
                        <Switch
                            value={appLock}
                            onValueChange={handleToggleAppLock}
                            trackColor={{ false: '#e5e7eb', true: '#00D09C' }}
                        />
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: themeColors.cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>Data</Text>

                    <Pressable style={styles.rowButton} onPress={handleExportData}>
                        <Text style={[styles.label, { color: themeColors.text }]}>Export Data (JSON)</Text>
                    </Pressable>
                    <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                    <Pressable style={styles.rowButton} onPress={handleReset}>
                        <Text style={[styles.label, { color: '#ef4444' }]}>Reset All Data</Text>
                    </Pressable>
                </View>

                <View style={[styles.section, { backgroundColor: themeColors.cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>About</Text>
                    
                    <Pressable style={styles.rowButton} onPress={() => openDoc('privacy')}>
                        <Text style={[styles.label, { color: themeColors.text }]}>Privacy Policy</Text>
                    </Pressable>
                    <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                    <Pressable style={styles.rowButton} onPress={() => openDoc('terms')}>
                        <Text style={[styles.label, { color: themeColors.text }]}>Terms of Service</Text>
                    </Pressable>
                    <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
                    
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
            <DocModal />
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: '85%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    },
    modalPill: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
    },
    closeIconBtn: {
        padding: 6,
        borderRadius: 12,
    },
    closeIconText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalDate: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 20,
    },
    modalBody: {
        flex: 1,
        marginBottom: 20,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 18,
        marginBottom: 8,
    },
    modalText: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12,
    },
    modalFooter: {
        paddingTop: 16,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    modalCloseBtn: {
        backgroundColor: '#00D09C',
        width: '100%',
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#00D09C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    modalCloseBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    }
});
