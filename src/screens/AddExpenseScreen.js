import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';

/* ---------------- CONSTANTS ---------------- */
const FILTERS = ['24h', 'Week', 'Year'];

const lightTheme = {
  bg: '#f4f4f4',
  card: '#ffffff',
  text: '#000',
  sub: '#777',
};

const darkTheme = {
  bg: '#000',
  card: '#121212',
  text: '#fff',
  sub: '#aaa',
};

export default function App() {
  /* ---------------- THEME ---------------- */
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;

  /* ---------------- DATA ---------------- */
  const [accounts, setAccounts] = useState([
    { id: '1', name: 'Local balance', balance: 149868 },
    { id: '2', name: 'Savings', balance: 54724 },
  ]);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [showAccounts, setShowAccounts] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('24h');

  /* ---------------- MODALS ---------------- */
  const [addAccountModal, setAddAccountModal] = useState(false);
  const [addExpenseModal, setAddExpenseModal] = useState(false);

  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [amount, setAmount] = useState('');

  /* ---------------- HELPERS ---------------- */
  const filteredExpenses = useMemo(() => {
    const now = new Date();

    return expenses
      .filter(e => e.accountId === selectedAccount?.id)
      .filter(e => {
        const diff = (now - new Date(e.date)) / (1000 * 60 * 60 * 24);
        if (filter === '24h') return diff <= 1;
        if (filter === 'Week') return diff <= 7;
        return diff <= 365;
      })
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, filter, selectedAccount]);

  /* ---------------- ACTIONS ---------------- */
  const addAccount = () => {
    if (!accName || !accBalance) return;

    const acc = {
      id: Date.now().toString(),
      name: accName,
      balance: Number(accBalance),
    };

    setAccounts([...accounts, acc]);
    setSelectedAccount(acc);
    setAddAccountModal(false);
    setAccName('');
    setAccBalance('');
  };

  const addExpense = () => {
    if (!amount) return;

    const expense = {
      id: Date.now().toString(),
      accountId: selectedAccount.id,
      amount: Number(amount),
      date: new Date(),
    };

    setExpenses([expense, ...expenses]);

    setAccounts(accounts.map(a =>
      a.id === selectedAccount.id
        ? { ...a, balance: a.balance - Number(amount) }
        : a
    ));

    setAmount('');
    setAddExpenseModal(false);
  };

  const deleteAccount = (acc) => {
    Alert.alert(
      'Delete account?',
      'If deleted, all data will be lost.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAccounts(accounts.filter(a => a.id !== acc.id));
            setExpenses(expenses.filter(e => e.accountId !== acc.id));
            setSelectedAccount(accounts[0] || null);
          },
        },
      ]
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>WalletX</Text>

        {/* THEME SWITCH */}
        <View style={styles.switchWrap}>
          <Pressable
            style={[
              styles.switchBtn,
              !darkMode && styles.switchActive,
            ]}
            onPress={() => setDarkMode(false)}
          >
            <Text>🌞</Text>
          </Pressable>

          <Pressable
            style={[
              styles.switchBtn,
              darkMode && styles.switchActive,
            ]}
            onPress={() => setDarkMode(true)}
          >
            <Text>🌙</Text>
          </Pressable>
        </View>
      </View>

      {/* ACCOUNT CARD */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={{ color: theme.sub }}>{selectedAccount?.name}</Text>
        <Text style={[styles.balance, { color: theme.text }]}>
          ${selectedAccount?.balance}
        </Text>

        <Pressable onPress={() => setShowAccounts(!showAccounts)}>
          <Text style={{ fontSize: 20, color: theme.text }}>⌄</Text>
        </Pressable>

        {/* DROPDOWN */}
        {showAccounts && (
          <View style={[styles.dropdown, { backgroundColor: theme.card }]}>
            {accounts.map(acc => (
              <Pressable
                key={acc.id}
                onPress={() => {
                  setSelectedAccount(acc);
                  setShowAccounts(false);
                }}
                onLongPress={() => deleteAccount(acc)}
                style={[
                  styles.dropdownItem,
                  acc.id === selectedAccount?.id && styles.dropdownActive,
                ]}
              >
                <Text style={{ color: theme.text }}>
                  {acc.name}
                </Text>
                <Text style={{ color: theme.sub }}>
                  ${acc.balance}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* SORT */}
      <View style={styles.filterRow}>
        <Text style={{ color: theme.sub }}>Sort by</Text>
        <View style={{ flexDirection: 'row' }}>
          {FILTERS.map(f => (
            <Pressable key={f} onPress={() => setFilter(f)}>
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f ? theme.text : theme.sub },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* EXPENSES */}
      <FlatList
        data={filteredExpenses}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 160 }}
        renderItem={({ item }) => (
          <View style={[styles.expense, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text }}>
              -${item.amount}
            </Text>
            <Text style={{ color: theme.sub }}>
              {item.date.toDateString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: theme.sub, textAlign: 'center', marginTop: 30 }}>
            No expenses
          </Text>
        }
      />

      {/* FLOATING BUTTONS */}
      <Pressable
        style={[styles.fab, { backgroundColor: 'green', right: 90 }]}
        onPress={() => setAddAccountModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Pressable
        style={[styles.fab, { backgroundColor: 'red' }]}
        onPress={() => setAddExpenseModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* FOOTER */}
      <View style={[styles.footer, { backgroundColor: theme.card }]}>
        <Text style={styles.footerActive}>💳</Text>
        <Text style={styles.footerIcon}>📊</Text>
        <Text style={styles.footerIcon}>🧭</Text>
        <Text style={styles.footerIcon}>🔔</Text>
        <Text style={styles.footerIcon}>⚙️</Text>
      </View>

      {/* MODALS */}
      <Modal visible={addAccountModal} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add Account</Text>
          <TextInput placeholder="Name" style={styles.input} value={accName} onChangeText={setAccName} />
          <TextInput placeholder="Balance" keyboardType="numeric" style={styles.input} value={accBalance} onChangeText={setAccBalance} />
          <Pressable style={styles.submit} onPress={addAccount}>
            <Text style={styles.submitText}>Save</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal visible={addExpenseModal} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add Expense</Text>
          <TextInput placeholder="Amount" keyboardType="numeric" style={styles.input} value={amount} onChangeText={setAmount} />
          <Pressable style={styles.submit} onPress={addExpense}>
            <Text style={styles.submitText}>Add</Text>
          </Pressable>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: { fontSize: 22, fontWeight: '700' },

  switchWrap: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    borderRadius: 20,
  },
  switchBtn: {
    padding: 6,
    width: 40,
    alignItems: 'center',
  },
  switchActive: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },

  card: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  balance: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 8,
  },

  dropdown: {
    marginTop: 10,
    borderRadius: 12,
    elevation: 6,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: '#333',
  },
  dropdownActive: {
    backgroundColor: '#222',
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  filterText: {
    marginLeft: 14,
    fontWeight: '600',
  },

  expense: {
    margin: 16,
    padding: 16,
    borderRadius: 14,
  },

  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#fff', fontSize: 26 },

  footer: {
    position: 'absolute',
    bottom: 0,
    height: 64,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footerIcon: { fontSize: 22, color: '#777' },
  footerActive: { fontSize: 24, fontWeight: '700' },

  modal: {
    marginTop: 200,
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  submit: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '600' },
});
