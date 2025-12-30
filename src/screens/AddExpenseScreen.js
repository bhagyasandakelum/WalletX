import React, { useState, useMemo } from 'react';
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
import { useNavigation } from '@react-navigation/native';

export default function AddExpenseScreen() {
  const navigation = useNavigation();

  /* ---------------- STATE ---------------- */
  const [themeMode, setThemeMode] = useState('light');
  const [showAccounts, setShowAccounts] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Cash', balance: 1200 },
    { id: 2, name: 'Bank', balance: 5000 },
  ]);

  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);

  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Food', amount: 300, date: new Date(), accountId: 1 },
    { id: 2, title: 'Transport', amount: 150, date: new Date(), accountId: 1 },
  ]);

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

  /* ---------------- HELPERS ---------------- */
  const addAccount = () => {
    if (!newAccountName || !newAccountBalance) return;

    const account = {
      id: Date.now(),
      name: newAccountName,
      balance: Number(newAccountBalance),
    };

    setAccounts(prev => [...prev, account]);
    setSelectedAccount(account);
    setNewAccountName('');
    setNewAccountBalance('');
    setShowAddAccount(false);
  };

  const addExpense = () => {
    if (!expenseTitle || !expenseAmount) return;

    const amount = Number(expenseAmount);

    const expense = {
      id: Date.now(),
      title: expenseTitle,
      amount,
      date: new Date(),
      accountId: selectedAccount.id,
    };

    setExpenses(prev => [expense, ...prev]);

    // ✅ Always deduct — balance can go negative
    setAccounts(prev =>
      prev.map(acc =>
        acc.id === selectedAccount.id
          ? { ...acc, balance: acc.balance - amount }
          : acc
      )
    );

    setExpenseTitle('');
    setExpenseAmount('');
    setShowAddExpense(false);
  };

  const deleteAccount = acc => {
    Alert.alert(
      'Delete Account',
      'If deleted, all expenses will be lost. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAccounts(prev => prev.filter(a => a.id !== acc.id));
            setExpenses(prev => prev.filter(e => e.accountId !== acc.id));
            setSelectedAccount(accounts[0]);
            setShowAccounts(false);
          },
        },
      ]
    );
  };

  const filteredExpenses = useMemo(
    () => expenses.filter(e => e.accountId === selectedAccount.id),
    [expenses, selectedAccount]
  );

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
          <Text style={{ color: theme.sub }}>{selectedAccount.name}</Text>
          <Text style={[styles.balance, { color: theme.text }]}>
            ${selectedAccount.balance}
          </Text>
        </Pressable>

        <Pressable
          style={styles.deleteBtn}
          onPress={() => deleteAccount(selectedAccount)}
        >
          <Text style={styles.deleteText}>🗑️</Text>
        </Pressable>

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
        data={filteredExpenses}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 10 }}
        renderItem={({ item }) => (
          <View style={[styles.expense, { backgroundColor: theme.card }]}>
            <View>
              <Text style={[styles.category, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text style={{ color: theme.sub }}>
                {item.date.toDateString()}
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
          onPress={() => setShowAddExpense(true)}
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
              <Pressable style={styles.primaryBtn} onPress={addAccount}>
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
              <Pressable style={styles.primaryBtn} onPress={addExpense}>
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