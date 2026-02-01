import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  getAccounts,
  addAccount as addAccountService,
  deleteAccount as deleteAccountService,
  addExpense as addExpenseService,
  getExpensesByAccount,
} from '../services/expenseService';

export default function AddExpenseScreen() {
  const navigation = useNavigation();

  /* ---------------- STATE ---------------- */
  const [themeMode, setThemeMode] = useState('light');
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

  /* ---------------- THEME ---------------- */
  const theme =
    themeMode === 'dark'
      ? {
        bg: '#0b1220',
        card: '#111827',
        text: '#f9fafb',
        sub: '#9ca3af',
        border: '#1f2937',
      }
      : {
        bg: '#f1f5f9',
        card: '#ffffff',
        text: '#0f172a',
        sub: '#64748b',
        border: '#e5e7eb',
      };

  /* ---------------- DATA LOADING ---------------- */
  const loadAccounts = useCallback(async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
      // Auto-select first account if none selected or if selected was deleted
      if (data.length > 0) {
        // If we have a selected account, check if it still exists
        if (selectedAccount) {
          const stillExists = data.find(a => a.id === selectedAccount.id);
          if (stillExists) {
            setSelectedAccount(stillExists); // Update balance
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
      // SQLite returns strings for dates usually, we need to parse them for display if we use Date methods
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


  /* ---------------- HELPERS ---------------- */
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
      await loadAccounts(); // Update balance
      await loadExpenses(); // Update list
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
      'If deleted, all expenses will be lost. Unrecoverable.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccountService(acc.id);
              await loadAccounts();
              setShowAccounts(false);
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Could not delete account');
            }
          },
        },
      ]
    );
  };


  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>WalletX</Text>

        <View style={[styles.themeSwitch, { borderColor: theme.border }]}>
          <Pressable
            style={[
              styles.themeOption,
              themeMode === 'light' && styles.themeActive,
            ]}
            onPress={() => setThemeMode('light')}
          >
            <Text>☀️</Text>
          </Pressable>

          <Pressable
            style={[
              styles.themeOption,
              themeMode === 'dark' && styles.themeActive,
            ]}
            onPress={() => setThemeMode('dark')}
          >
            <Text>🌙</Text>
          </Pressable>
        </View>
      </View>

      {/* ---------- ACCOUNT CARD ---------- */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Pressable onPress={() => setShowAccounts(!showAccounts)}>
          <Text style={{ color: theme.sub }}>{selectedAccount ? selectedAccount.name : 'No Account'}</Text>
          <Text style={[styles.balance, { color: theme.text }]}>
            ${selectedAccount ? selectedAccount.balance : '0.00'}
          </Text>
        </Pressable>

        {selectedAccount && (
          <Pressable
            style={styles.deleteBtn}
            onPress={() => handleDeleteAccount(selectedAccount)}
          >
            <Text style={styles.deleteText}>🗑️</Text>
          </Pressable>
        )}

        {showAccounts && (
          <View style={[styles.dropdown, { borderColor: theme.border }]}>
            {accounts.map(acc => (
              <Pressable
                key={acc.id}
                style={[styles.dropdownItem, { backgroundColor: theme.bg }]}
                onPress={() => {
                  setSelectedAccount(acc);
                  setShowAccounts(false);
                }}
              >
                <Text style={{ fontWeight: '700' }}>{acc.name}</Text>
                <Text>${acc.balance}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ---------- EXPENSE LIST ---------- */}
      <FlatList
        data={expenses}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 10 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: theme.sub }}>No expenses found</Text>}
        renderItem={({ item }) => (
          <View style={[styles.expense, { backgroundColor: theme.card }]}>
            <View>
              <Text style={[styles.category, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text style={{ color: theme.sub }}>
                {item.date ? item.date.toDateString() : ''}
              </Text>
            </View>
            <Text style={styles.amount}>-${item.amount}</Text>
          </View>
        )}
      />

      {/* ---------- FLOAT BUTTONS ---------- */}
      <View style={styles.fabContainer}>
        <Pressable
          style={[styles.fab, { backgroundColor: '#22c55e' }]}
          onPress={() => setShowAddAccount(true)}
        >
          <Text style={styles.fabText}>＋ Account</Text>
        </Pressable>

        <Pressable
          style={[styles.fab, { backgroundColor: '#ef4444' }]}
          onPress={() => selectedAccount ? setShowAddExpense(true) : Alert.alert('Error', 'Please create an account first')}
        >
          <Text style={styles.fabText}>＋ Expense</Text>
        </Pressable>
      </View>

      {/* ---------- ADD ACCOUNT MODAL ---------- */}
      <Modal visible={showAddAccount} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Account</Text>
            <TextInput
              placeholder="Account Name"
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
            <View style={styles.modalRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddAccount(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={handleAddAccount}>
                <Text style={styles.btnText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- ADD EXPENSE MODAL ---------- */}
      <Modal visible={showAddExpense} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TextInput
              placeholder="Title"
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
            <View style={styles.modalRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddExpense(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={handleAddExpense}>
                <Text style={styles.btnText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- FOOTER ---------- */}
      <View style={styles.footer}>
        <Text style={[styles.footerItem, styles.footerActive]}>🏠</Text>
        <Text style={styles.footerItem} onPress={() => navigation.navigate('Stats')}>
          📊
        </Text>
        <Text style={styles.footerItem}>⚙️</Text>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },

  themeSwitch: { flexDirection: 'row', borderWidth: 1, borderRadius: 20 },
  themeOption: { paddingHorizontal: 12, paddingVertical: 6 },
  themeActive: { backgroundColor: '#e5e7eb' },

  card: { marginTop: 20, padding: 16, borderRadius: 18, position: 'relative' },
  balance: { fontSize: 26, fontWeight: '700', marginTop: 4 },

  deleteBtn: { position: 'absolute', right: 16, top: 16 },
  deleteText: { fontSize: 18 },

  dropdown: { marginTop: 12, borderTopWidth: 1 },
  dropdownItem: {
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  expense: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  category: { fontSize: 16, fontWeight: '600' },
  amount: { fontWeight: '800', color: '#ef4444' },

  fabContainer: { position: 'absolute', bottom: 80, right: 16, gap: 10 },
  fab: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24 },
  fabText: { color: '#fff', fontWeight: '700' },

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

  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '85%',
  },

  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, marginBottom: 10 },

  modalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { padding: 12 },
  primaryBtn: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 10,
    paddingHorizontal: 20,
  },

  btnText: { color: '#fff', fontWeight: '700' },
});