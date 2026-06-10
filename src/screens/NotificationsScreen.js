import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Footer from '../components/Footer';
import { Feather } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';

export default function NotificationsScreen() {
    const { 
        isDarkMode, 
        notifications = [], 
        triggerInsightGeneration, 
        markNotificationAsRead, 
        clearAllNotifications 
    } = useWallet();

    const [selectedNotification, setSelectedNotification] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);

    const themeColors = isDarkMode ? {
        bg: '#1f2937',
        text: '#f9fafb',
        subText: '#9ca3af',
        cardBg: '#374151',
        border: '#4b5563',
        unreadBg: '#2d3748',
    } : {
        bg: '#f3f4f6',
        text: '#111827',
        subText: '#6b7280',
        cardBg: '#ffffff',
        border: '#f3f4f6',
        unreadBg: '#eef2f6',
    };

    const handleSelectNotification = (item) => {
        markNotificationAsRead(item.id);
        setSelectedNotification(item);
        setDetailVisible(true);
    };

    const handleTriggerInsights = async () => {
        await triggerInsightGeneration();
    };

    const formatTime = (isoString) => {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            return `${diffDays}d ago`;
        } catch (e) {
            return '';
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'alert': return '#ef4444';
            case 'forecast': return '#f59e0b';
            case 'tip': return '#10b981';
            default: return '#3b82f6';
        }
    };

    const renderItem = ({ item }) => {
        const isUnread = !item.read;
        const iconColor = getIconColor(item.type);

        return (
            <Pressable 
                style={[
                    styles.card, 
                    { 
                        backgroundColor: isUnread ? themeColors.unreadBg : themeColors.cardBg,
                        borderColor: isUnread ? '#00D09C' : themeColors.border,
                        borderLeftWidth: isUnread ? 4 : 1
                    }
                ]} 
                onPress={() => handleSelectNotification(item)}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                        <Feather name={item.icon || 'bell'} size={20} color={iconColor} />
                    </View>
                    <View style={styles.cardMain}>
                        <View style={styles.titleRow}>
                            <Text 
                                style={[
                                    styles.cardTitle, 
                                    { color: themeColors.text, fontWeight: isUnread ? '700' : '600' }
                                ]}
                                numberOfLines={1}
                            >
                                {item.title}
                            </Text>
                            {isUnread && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={[styles.cardDesc, { color: themeColors.subText }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.cardFooter}>
                    <View style={[styles.badge, { backgroundColor: `${iconColor}15` }]}>
                        <Text style={[styles.badgeText, { color: iconColor }]}>{item.badge || 'Insight'}</Text>
                    </View>
                    <Text style={[styles.timeText, { color: themeColors.subText }]}>{formatTime(item.date)}</Text>
                </View>
            </Pressable>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, { color: themeColors.text }]}>Insights & Alerts</Text>
                    <Text style={[styles.headerSubtitle, { color: themeColors.subText }]}>Smart Financial Analytics</Text>
                </View>
            </View>

            <View style={{ flex: 1, paddingHorizontal: 20 }}>
                {notifications.length > 0 && (
                    <View style={styles.listHeader}>
                        <Text style={[styles.listHeaderCount, { color: themeColors.subText }]}>
                            {notifications.filter(n => !n.read).length} Unread Insights
                        </Text>
                        <Pressable onPress={clearAllNotifications}>
                            <Text style={styles.clearAllBtn}>Clear All</Text>
                        </Pressable>
                    </View>
                )}

                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconBg}>
                                <Feather name="pocket" size={48} color="#9ca3af" />
                            </View>
                            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No Financial Insights Yet</Text>
                            <Text style={[styles.emptyDesc, { color: themeColors.subText }]}>
                                Add transactions and set a budget to start receiving automated financial insights and smart alerts!
                            </Text>
                        </View>
                    }
                />
            </View>

            <Footer />

            {/* Bottom-Sheet Details Modal */}
            <Modal visible={detailVisible} transparent animationType="slide">
                <Pressable style={styles.modalOverlay} onPress={() => setDetailVisible(false)}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                    >
                        <Pressable style={[styles.modalContent, { backgroundColor: themeColors.cardBg }]} onPress={(e) => e.stopPropagation()}>
                            <View style={[styles.modalPill, { backgroundColor: themeColors.border }]} />
                            
                            {selectedNotification && (
                                <View>
                                    <View style={styles.modalHeaderRow}>
                                        <View style={[
                                            styles.modalBadge, 
                                            { backgroundColor: `${getIconColor(selectedNotification.type)}15` }
                                        ]}>
                                            <Text style={[
                                                styles.modalBadgeText, 
                                                { color: getIconColor(selectedNotification.type) }
                                            ]}>
                                                {selectedNotification.badge || 'Insight'}
                                            </Text>
                                        </View>
                                        <Pressable style={styles.modalCloseIcon} onPress={() => setDetailVisible(false)}>
                                            <Feather name="x" size={20} color={themeColors.subText} />
                                        </Pressable>
                                    </View>

                                    <View style={styles.modalBodyRow}>
                                        <View style={[
                                            styles.modalIconContainer, 
                                            { backgroundColor: `${getIconColor(selectedNotification.type)}15` }
                                        ]}>
                                            <Feather 
                                                name={selectedNotification.icon || 'bell'} 
                                                size={24} 
                                                color={getIconColor(selectedNotification.type)} 
                                            />
                                        </View>
                                        <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                                            {selectedNotification.title}
                                        </Text>
                                    </View>

                                    <Text style={[styles.modalTime, { color: themeColors.subText }]}>
                                        Generated {formatTime(selectedNotification.date)}
                                    </Text>

                                    <ScrollView style={styles.modalDescScroll} showsVerticalScrollIndicator={false}>
                                        <Text style={[styles.modalDescription, { color: themeColors.subText }]}>
                                            {selectedNotification.description}
                                        </Text>
                                    </ScrollView>

                                    <View style={[styles.modalFooter, { borderTopColor: themeColors.border }]}>
                                        <Pressable style={styles.modalOkBtn} onPress={() => setDetailVisible(false)}>
                                            <Text style={styles.modalOkText}>Got It</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: 2,
        letterSpacing: 0.5,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 5,
    },
    listHeaderCount: {
        fontSize: 13,
        fontWeight: '600',
    },
    clearAllBtn: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '600',
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardMain: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 15,
        flex: 1,
        paddingRight: 10,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00D09C',
    },
    cardDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.03)',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    timeText: {
        fontSize: 11,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: 20,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyDesc: {
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
        maxWidth: 280,
    },
    // Bottom Sheet styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
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
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    modalBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    modalCloseIcon: {
        padding: 4,
    },
    modalBodyRow: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        flex: 1,
        lineHeight: 24,
    },
    modalTime: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 20,
        marginLeft: 64,
    },
    modalDescScroll: {
        maxHeight: 220,
        marginBottom: 20,
    },
    modalDescription: {
        fontSize: 14,
        lineHeight: 22,
    },
    modalFooter: {
        paddingTop: 16,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    modalOkBtn: {
        backgroundColor: '#00D09C',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#00D09C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
    },
    modalOkText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
