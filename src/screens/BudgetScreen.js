import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Footer from '../components/Footer';
import ExpenseItem from '../components/ExpenseItem';
import AppButton from '../components/AppButton';
import { useWallet } from '../context/WalletContext';
import { deleteExpense as deleteExpenseService } from '../services/expenseService';

export default function BudgetScreen() {
    const { isDarkMode, expenses, weeklyBudget, updateWeeklyBudget, reloadData } = useWallet();
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [budgetInput, setBudgetInput] = useState('');

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

    // Calculate current week range
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    const weekString = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;

    // Filter this week's expenses
    const thisWeekExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= startOfWeek;
    });

    const thisWeekTotal = thisWeekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetValue = weeklyBudget || 0;
    const progress = budgetValue > 0 ? Math.min(thisWeekTotal / budgetValue, 1) : 0;
    const leftAmount = budgetValue > 0 ? Math.max(budgetValue - thisWeekTotal, 0) : 0;

    const handleSaveBudget = async () => {
        if (!budgetInput || isNaN(Number(budgetInput))) {
            return;
        }
        await updateWeeklyBudget(budgetInput);
        setShowBudgetModal(false);
        setBudgetInput('');
    };

    const handleDeleteExpense = async (id) => {
        try {
            await deleteExpenseService(id);
            await reloadData();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>Weekly Budget</Text>
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 0, flex: 1 }}>
                
                <View style={[styles.card, { backgroundColor: themeColors.cardBg }]}>
                    <Text style={[styles.weekText, { color: themeColors.subText }]}>{weekString}</Text>
                    
                    {budgetValue > 0 ? (
                        <>
                            <View style={styles.budgetStatsRow}>
                                <View>
                                    <Text style={[styles.statLabel, { color: themeColors.subText }]}>Spent</Text>
                                    <Text style={[styles.statValue, { color: themeColors.text }]}>රු {thisWeekTotal.toFixed(2)}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.statLabel, { color: themeColors.subText }]}>Left</Text>
                                    <Text style={[styles.statValue, { color: progress > 0.9 ? '#ef4444' : '#00D09C' }]}>රු {leftAmount.toFixed(2)}</Text>
                                </View>
                            </View>

                            <View style={[styles.progressBarBg, { backgroundColor: themeColors.border }]}>
                                <View style={[
                                    styles.progressBarFill, 
                                    { 
                                        width: `${progress * 100}%`,
                                        backgroundColor: progress > 0.9 ? '#ef4444' : progress > 0.7 ? '#f59e0b' : '#00D09C'
                                    }
                                ]} />
                            </View>
                            <Pressable style={styles.editButton} onPress={() => { setBudgetInput(budgetValue.toString()); setShowBudgetModal(true); }}>
                                <Text style={styles.editButtonText}>Edit Budget</Text>
                            </Pressable>
                        </>
                    ) : (
                        <View style={{ alignItems: 'center', marginVertical: 20 }}>
                            <Text style={{ color: themeColors.subText, marginBottom: 16 }}>No budget set for this week.</Text>
                            <AppButton title="Set Weekly Budget" onPress={() => setShowBudgetModal(true)} color={['#00D09C', '#00dfa8']} />
                        </View>
                    )}
                </View>

                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>This Week's Expenses</Text>
                
                <FlatList
                    data={thisWeekExpenses}
                    keyExtractor={item => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 140 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ color: themeColors.subText }}>No expenses this week yet.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <ExpenseItem item={item} onDelete={handleDeleteExpense} />
                    )}
                />
            </View>

            <Footer />

            <Modal visible={showBudgetModal} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: themeColors.cardBg }]}>
                            <Text style={[styles.modalHeader, { color: themeColors.text }]}>Set Weekly Budget</Text>
                            <TextInput
                                placeholder="Amount (e.g. 5000)"
                                placeholderTextColor={themeColors.subText}
                                style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.bg, borderColor: themeColors.border }]}
                                keyboardType="numeric"
                                value={budgetInput}
                                onChangeText={setBudgetInput}
                            />
                            <View style={styles.modalButtons}>
                                <Pressable style={[styles.cancelButton, { borderColor: themeColors.border }]} onPress={() => setShowBudgetModal(false)}>
                                    <Text style={[styles.cancelText, { color: themeColors.text }]}>Cancel</Text>
                                </Pressable>
                                <Pressable style={[styles.saveButton, { backgroundColor: '#00D09C' }]} onPress={handleSaveBudget}>
                                    <Text style={styles.saveButtonText}>Save Budget</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: '800' },
    card: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },
    weekText: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' },
    budgetStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    statLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    statValue: { fontSize: 24, fontWeight: '800' },
    progressBarBg: { height: 12, borderRadius: 6, width: '100%', overflow: 'hidden', marginBottom: 16 },
    progressBarFill: { height: '100%', borderRadius: 6 },
    editButton: { alignSelf: 'center', marginTop: 8 },
    editButtonText: { color: '#00D09C', fontWeight: '600', fontSize: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, paddingHorizontal: 4 },
    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalHeader: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
    input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20 },
    modalButtons: { flexDirection: 'row', gap: 12 },
    cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
    cancelText: { fontWeight: '600' },
    saveButton: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});
