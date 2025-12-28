import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AddExpenseScreen() {
  const navigation = useNavigation();

  /* ---------------- STATE ---------------- */
  const [themeMode, setThemeMode] = useState('light');
  const [showAccounts, setShowAccounts] = useState(false);
  const [sortBy, setSortBy] = useState('time');

  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Cash', balance: 1200 },
    { id: 2, name: 'Bank', balance: 5000 },
  ]);

  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      title: 'Food',
      amount: 300,
      date: new Date(),
      accountId: 1,
    },
    {
      id: 2,
      title: 'Transport',
      amount: 150,
      date: new Date(),
      accountId: 1,
    },
  ]);

  /* ---------------- THEME ---------------- */
  const theme =
    themeMode === 'dark'
      ? {
          bg: '#0f172a',
          card: '#1e293b',
          text: '#f8fafc',
          sub: '#94a3b8',
        }
      : {
          bg: '#f8fafc',
          card: '#ffffff',
          text: '#0f172a',
          sub: '#64748b',
        };

  /* ---------------- HELPERS ---------------- */
  const deleteAccount = acc => {
    setAccounts(prev => prev.filter(a => a.id !== acc.id));
    if (selectedAccount.id === acc.id && accounts.length > 1) {
      setSelectedAccount(accounts.find(a => a.id !== acc.id));
    }
  };

  const sortedExpenses = useMemo(() => {
    const list = expenses.filter(e => e.accountId === selectedAccount.id);
    if (sortBy === 'amount') {
      return [...list].sort((a, b) => b.amount - a.amount);
    }
    return [...list].sort((a, b) => b.date - a.date);
  }, [expenses, selectedAccount, sortBy]);

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>WalletX</Text>

        {/* THEME RADIO TOGGLE */}
        <View style={styles.themeToggle}>
          <Text style={{ color: theme.sub }}>🌙</Text>
          <Switch
            value={themeMode === 'light'}
            onValueChange={() =>
              setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'))
            }
          />
          <Text style={{ color: theme.sub }}>☀️</Text>
        </View>
      </View>

      {/* ---------- ACCOUNT CARD ---------- */}
      <Pressable
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => setShowAccounts(!showAccounts)}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={{ color: theme.sub }}>{selectedAccount.name}</Text>
            <Text style={[styles.balance, { color: theme.text }]}>
              ${selectedAccount.balance}
            </Text>
          </View>

          <Pressable onPress={() => deleteAccount(selectedAccount)}>
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </Pressable>
        </View>

        {showAccounts && (
          <View style={styles.dropdown}>
            {accounts
              .filter(a => a.id !== selectedAccount.id)
              .map(acc => (
                <Pressable
                  key={acc.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedAccount(acc);
                    setShowAccounts(false);
                  }}
                >
                  <Text>{acc.name}</Text>
                  <Text>${acc.balance}</Text>
                </Pressable>
              ))}
          </View>
        )}
      </Pressable>

      {/* ---------- SORT BUTTONS ---------- */}
      {/* You can add sort buttons here */}

      {/* ---------- EXPENSE LIST ---------- */}
      <FlatList
        data={sortedExpenses}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => (
          <View style={[styles.expense, { backgroundColor: theme.card }]}>
            <View style={styles.expenseRow}>
              <Text style={styles.category}>{item.title}</Text>
              <Text style={styles.amount}>-${item.amount}</Text>
            </View>
            <Text style={styles.date}>{item.date.toDateString()}</Text>
          </View>
        )}
      />

      {/* ---------- FLOATING BUTTONS ---------- */}
      <View style={styles.fabContainer}>
        <Pressable style={[styles.fab, { backgroundColor: 'green' }]}>
          <Text style={styles.fabText}>＋ Account</Text>
        </Pressable>

        <Pressable style={[styles.fab, { backgroundColor: 'red' }]}>
          <Text style={styles.fabText}>＋ Expense</Text>
        </Pressable>
      </View>

      {/* ---------- FOOTER ---------- */}
      <View style={styles.footer}>
        <Text
          style={[styles.footerItem, styles.footerActive]}
          onPress={() => navigation.navigate('AddExpense')}
        >
          🏠
        </Text>

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

  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  balance: { fontSize: 26, fontWeight: '700' },

  dropdown: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },

  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  sortRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 16,
  },

  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },

  sortActive: {
    backgroundColor: '#38bdf8',
    color: 'white',
    fontWeight: '700',
  },

  expense: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  category: { fontWeight: '600' },

  amount: { fontWeight: '700' },

  date: { fontSize: 12, color: '#64748b', marginTop: 4 },

  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    gap: 10,
  },

  fab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
  },

  fabText: { color: 'white', fontWeight: '700' },

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
});
