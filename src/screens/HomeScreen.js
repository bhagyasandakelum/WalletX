import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ScrollView, // Added for category list
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWallet } from '../context/WalletContext';

import {
  addAccount as addAccountService,
  deleteAccount as deleteAccountService,
  updateAccount as updateAccountService,
  addExpense as addExpenseService,
  deleteExpense as deleteExpenseService,
} from '../services/expenseService';

import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/Card';
import AppButton from '../components/AppButton';
import ExpenseItem from '../components/ExpenseItem';
import Footer from '../components/Footer';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Others'];

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    accounts,
    selectedAccount,
    expenses,
    setSelectedAccount,
    reloadData
  } = useWallet();

  /* ---------------- STATE ---------------- */
  const [showAccounts, setShowAccounts] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  /* ---------------- FORM STATE ---------------- */
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Others'); // Default category

  /* ---------------- HANDLERS ---------------- */
  const handleSaveAccount = async () => {
    if (!newAccountName || !newAccountBalance) return;
    try {
      if (isEditing && selectedAccount) {
        await updateAccountService(selectedAccount.id, newAccountName, Number(newAccountBalance));
      } else {
        await addAccountService(newAccountName, Number(newAccountBalance));
      }
      await reloadData();
      setNewAccountName('');
      setNewAccountBalance('');
      setShowAddAccount(false);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not save account');
    }
  };

  const openEditAccount = () => {
    if (!selectedAccount) return;
    setNewAccountName(selectedAccount.name);
    setNewAccountBalance(selectedAccount.balance.toString());
    setIsEditing(true);
    setShowAddAccount(true);
  };

  const openAddAccount = () => {
    setNewAccountName('');
    setNewAccountBalance('');
    setIsEditing(false);
    setShowAddAccount(true);
  };

  const handleAddExpense = async () => {
    if (!expenseTitle || !expenseAmount || !selectedAccount) return;
    try {
      await addExpenseService(expenseTitle, Number(expenseAmount), expenseCategory, selectedAccount.id);
      await reloadData();
      setExpenseTitle('');
      setExpenseAmount('');
      setExpenseCategory('Others');
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
              await reloadData();
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
      await reloadData();
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.appName}>WalletX</Text>
        </View>
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
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Pressable
                style={styles.deleteAccountBtn}
                onPress={openEditAccount}
                hitSlop={20}
              >
                <Text style={styles.trashIcon}>✏️</Text>
              </Pressable>
              <Pressable
                style={styles.deleteAccountBtn}
                onPress={() => handleDeleteAccount(selectedAccount)}
                hitSlop={20}
              >
                <Text style={styles.trashIcon}>🗑️</Text>
              </Pressable>
            </View>
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
              onPress={() => { setShowAccounts(false); openAddAccount(); }}
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
        contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 16 }}
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

      {/* FOOTER */}
      <Footer />

      {/* FABs */}
      <View style={[styles.fabContainer, { bottom: 100 + insets.bottom }]}>
        <AppButton
          title="+ Expense"
          onPress={() => selectedAccount ? setShowAddExpense(true) : Alert.alert('Error', 'Please create an account first')}
          style={styles.fab}
          color={['#00d09c', '#00dfa8']}
        />
      </View>

      {/* ADD ACCOUNT MODAL */}
      <Modal visible={showAddAccount} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>{isEditing ? 'Edit Account' : 'New Account'}</Text>
              <TextInput
                placeholder="Account Name (e.g., Bank)"
                style={styles.input}
                value={newAccountName}
                onChangeText={setNewAccountName}
              />
              <TextInput
                placeholder="Balance"
                style={styles.input}
                keyboardType="numeric"
                value={newAccountBalance}
                onChangeText={setNewAccountBalance}
              />
              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelButton} onPress={() => setShowAddAccount(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <AppButton
                  title={isEditing ? 'Save Changes' : 'Create Account'}
                  onPress={handleSaveAccount}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ADD EXPENSE MODAL */}
      <Modal visible={showAddExpense} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
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

              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES.map(cat => (
                  <Pressable
                    key={cat}
                    onPress={() => setExpenseCategory(cat)}
                    style={[
                      styles.categoryChip,
                      expenseCategory === cat && styles.categoryChipActive
                    ]}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      expenseCategory === cat && styles.categoryChipTextActive
                    ]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelButton} onPress={() => setShowAddExpense(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <AppButton title="Add Expense" onPress={handleAddExpense} style={{ flex: 1 }} color={['#ef4444', '#f87171']} />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper >
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center', // Centered
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  // Profile styles removed/hidden if needed, but keeping style cleanup

  accountCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align center vertically
    marginBottom: 10,
  },
  accountSelector: {
    flex: 1, // Take available width
    marginRight: 10,
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
    // bottom position handled inline
    alignSelf: 'center',
    zIndex: 10,
  },
  fab: {
    width: 160,
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
    // paddingBottom handled inline
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

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 20,
    maxHeight: 50,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#00D09C',
  },
  categoryChipText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#00D09C',
    fontWeight: '600',
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