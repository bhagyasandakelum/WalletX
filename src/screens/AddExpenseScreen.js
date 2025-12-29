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

    const expense = {
      id: Date.now(),
      title: expenseTitle,
      amount: Number(expenseAmount),
      date: new Date(),
      accountId: selectedAccount.id,
    };

    setExpenses(prev => [expense, ...prev]);

    setAccounts(prev =>
      prev.map(acc =>
        acc.id === selectedAccount.id
          ? { ...acc, balance: acc.balance - expense.amount }
          : acc
      )
    );

    setExpenseTitle('');
    setExpenseAmount('');
    setShowAddExpense(false);
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

        {/* THEME RADIO TOGGLE */}
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
      <Pressable
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => setShowAccounts(!showAccounts)}
      >
        <Text style={{ color: theme.sub }}>{selectedAccount.name}</Text>
        <Text style={[styles.balance, { color: theme.text }]}>
          ${selectedAccount.balance}
        </Text>

        {showAccounts &&
          accounts.map(acc => (
            <Pressable
              key={acc.id}
              style={styles.accountItem}
              onPress={() => {
                setSelectedAccount(acc);
                setShowAccounts(false);
              }}
            >
              <Text>{acc.name}</Text>
              <Text>${acc.balance}</Text>
            </Pressable>
          ))}
      </Pressable>

      {/* ---------- EXPENSE LIST ---------- */}
      <FlatList
        data={filteredExpenses}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
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
            <Pressable style={styles.primaryBtn} onPress={addAccount}>
              <Text style={styles.btnText}>Add</Text>
            </Pressable>
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
            <Pressable style={styles.primaryBtn} onPress={addExpense}>
              <Text style={styles.btnText}>Add</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ---------- FOOTER ---------- */}
      <View style={styles.footer}>
        <Text style={[styles.footerItem, styles.footerActive]}>🏠</Text>
        <Text
          style={styles.footerItem}
          onPress={() => navigation.navigate('Stats')}
        >
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: { fontSize: 22, fontWeight: '700' },

  themeSwitch: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },

  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  themeActive: {
    backgroundColor: '#e5e7eb',
  },

  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
  },

  balance: { fontSize: 26, fontWeight: '700', marginTop: 4 },

  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  expense: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },

  category: { fontSize: 16, fontWeight: '600' },

  amount: { fontWeight: '800', color: '#ef4444' },

  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    gap: 10,
  },

  fab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },

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

  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  primaryBtn: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  btnText: { color: '#fff', fontWeight: '700' },
});
