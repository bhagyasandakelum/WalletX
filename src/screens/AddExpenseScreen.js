import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur'; // Assuming we might want to use it later, but stick to View for now if package not installed. Actually I checked and didn't see expo-blur. I'll stick to styling.

import {
  getAccounts,
  addAccount as addAccountService,
  deleteAccount as deleteAccountService,
  addExpense as addExpenseService,
  deleteExpense as deleteExpenseService,
  getExpensesByAccount,
} from '../services/expenseService';

import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/Card';
import AppButton from '../components/AppButton';
import ExpenseItem from '../components/ExpenseItem';

export default function AddExpenseScreen() {
  const navigation = useNavigation();

  /* ---------------- STATE ---------------- */
  const [showAccounts, setShowAccounts] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Data from DB
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  /* ---------------- FORM STATE ---------------- */
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  /* ---------------- DATA LOADING ---------------- */
  const loadAccounts = useCallback(async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
      if (data.length > 0) {
        if (selectedAccount) {
          const stillExists = data.find(a => a.id === selectedAccount.id);
          if (stillExists) {
            setSelectedAccount(stillExists);
            return;
          }
        }
        setSelectedAccount(data[0]);
      } else {
        setSelectedAccount(null);
      }
    } catch (e) {
      console.error('Failed to load accounts', e);
    }
  }, [selectedAccount]);

  const loadExpenses = useCallback(async () => {
    if (!selectedAccount) {
      setExpenses([]);
      return;
    }
    try {
      const data = await getExpensesByAccount(selectedAccount.id);
      const parsed = data.map(e => ({
        ...e,
        date: new Date(e.date)
      }));
      setExpenses(parsed);
    } catch (e) {
      console.error('Failed to load expenses', e);
    }
  }, [selectedAccount]);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  useEffect(() => {
    loadExpenses();
  }, [selectedAccount, loadExpenses]);

  /* ---------------- HANDLERS ---------------- */
  const handleAddAccount = async () => {
    if (!newAccountName || !newAccountBalance) return;
    try {
      await addAccountService(newAccountName, Number(newAccountBalance));
      await loadAccounts();
      setNewAccountName('');
      setNewAccountBalance('');
      setShowAddAccount(false);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not add account');
    }
  };

  const handleAddExpense = async () => {
    if (!expenseTitle || !expenseAmount || !selectedAccount) return;
    try {
      await addExpenseService(expenseTitle, Number(expenseAmount), selectedAccount.id);
      await loadAccounts();
      await loadExpenses();
      setExpenseTitle('');
      setExpenseAmount('');
      setShowAddExpense(false);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not add expense');
    }
  };

  const handleDeleteAccount = (acc) => {
    Alert.alert(
      'Delete Account',
      'This will delete the account and ALL associated expenses permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccountService(acc.id);
              setSelectedAccount(null);
              await loadAccounts();
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Could not delete account');
            }
          },
        },
      ]
    );
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpenseService(id);
      await loadAccounts(); // Balance changes on delete
      await loadExpenses();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not delete expense');
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.appName}>WalletX</Text>
        </View>
        <Pressable onPress={() => { }} style={styles.profileBtn}>
          <Text style={styles.profileIcon}>👤</Text>
        </Pressable>
      </View>

      {/* ACCOUNT SECTION */}
      <Card style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <Pressable onPress={() => setShowAccounts(!showAccounts)} style={styles.accountSelector}>
            <Text style={styles.accountLabel}>Current Balance</Text>
            <View style={styles.accountNameRow}>
              <Text style={styles.accountName}>
                {selectedAccount ? selectedAccount.name : 'No Account'}
              </Text>
              <Text style={styles.arrow}>▼</Text>
            </View>
          </Pressable>
          {selectedAccount && (
            <Pressable style={styles.deleteAccountBtn} onPress={() => handleDeleteAccount(selectedAccount)}>
              <Text style={styles.trashIcon}>🗑️</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.balance}>
          ${selectedAccount ? selectedAccount.balance.toFixed(2) : '0.00'}
        </Text>

        {showAccounts && (
          <View style={styles.accountDropdown}>
            <Text style={styles.dropdownTitle}>Switch Account</Text>
            {accounts.map(acc => (
              <Pressable
                key={acc.id}
                style={[styles.dropdownItem, acc.id === selectedAccount?.id && styles.dropdownItemActive]}
                onPress={() => {
                  setSelectedAccount(acc);
                  setShowAccounts(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{acc.name}</Text>
                <Text style={styles.dropdownItemBalance}>${acc.balance.toFixed(2)}</Text>
              </Pressable>
            ))}
            <AppButton
              title="+ New Account"
              onPress={() => { setShowAccounts(false); setShowAddAccount(true); }}
              style={{ marginTop: 10 }}
              color={['#3b82f6', '#2563eb']}
            />
          </View>
        )}
      </Card>

      {/* EXPENSES HEADER */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Pressable onPress={() => navigation.navigate('Stats')}>
          <Text style={styles.seeAll}>Stats ➔</Text>
        </Pressable>
      </View>

      {/* EXPENSE LIST */}
      <FlatList
        data={expenses}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No expenses yet.</Text>
            <Text style={styles.emptySub}>Add one to get started!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ExpenseItem item={item} onDelete={handleDeleteExpense} />
        )}
      />

      {/* FABs */}
      <View style={styles.fabContainer}>
        <AppButton
          title="+ Expense"
          onPress={() => selectedAccount ? setShowAddExpense(true) : Alert.alert('Error', 'Please create an account first')}
          style={styles.fab}
          color={['#00d09c', '#00dfa8']}
        />
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Pressable style={styles.footerItem}>
          <Text style={[styles.footerIcon, styles.footerActive]}>🏠</Text>
          <Text style={[styles.footerText, styles.footerTextActive]}>Home</Text>
        </Pressable>
        <Pressable style={styles.footerItem} onPress={() => navigation.navigate('Stats')}>
          <Text style={styles.footerIcon}>📊</Text>
          <Text style={styles.footerText}>Stats</Text>
        </Pressable>
        <Pressable style={styles.footerItem}>
          <Text style={styles.footerIcon}>⚙️</Text>
          <Text style={styles.footerText}>Settings</Text>
        </Pressable>
      </View>

      {/* ADD ACCOUNT MODAL */}
      <Modal visible={showAddAccount} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>New Account</Text>
            <TextInput
              placeholder="Account Name (e.g., Bank)"
              style={styles.input}
              value={newAccountName}
              onChangeText={setNewAccountName}
            />
            <TextInput
              placeholder="Initial Balance"
              style={styles.input}
              keyboardType="numeric"
              value={newAccountBalance}
              onChangeText={setNewAccountBalance}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setShowAddAccount(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <AppButton title="Create Account" onPress={handleAddAccount} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD EXPENSE MODAL */}
      <Modal visible={showAddExpense} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>New Expense</Text>
            <TextInput
              placeholder="What did you buy?"
              style={styles.input}
              value={expenseTitle}
              onChangeText={setExpenseTitle}
            />
            <TextInput
              placeholder="Amount"
              style={styles.input}
              keyboardType="numeric"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setShowAddExpense(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <AppButton title="Add Expense" onPress={handleAddExpense} style={{ flex: 1 }} color={['#ef4444', '#f87171']} />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  profileIcon: { fontSize: 20 },

  accountCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  accountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  arrow: { fontSize: 12, color: '#9ca3af' },
  deleteAccountBtn: {
    padding: 8,
  },
  trashIcon: { fontSize: 16 },
  balance: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    marginTop: 10,
  },

  accountDropdown: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  dropdownTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
    fontWeight: '600',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  dropdownItemActive: {
    backgroundColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  dropdownItemBalance: {
    fontSize: 16,
    color: '#6b7280',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAll: {
    color: '#00D09C',
    fontWeight: '600',
  },

  emptyState: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySub: {
    color: '#9ca3af',
    marginTop: 4,
  },

  fabContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  fab: {
    width: 160,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingBottom: 10,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerIcon: { fontSize: 24, marginBottom: 2 },
  footerText: { fontSize: 10, color: '#9ca3af', fontWeight: '600' },
  footerActive: {
    color: '#00D09C',
  },
  footerTextActive: {
    color: '#00D09C',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelText: {
    fontWeight: '600',
    color: '#374151',
  },
});