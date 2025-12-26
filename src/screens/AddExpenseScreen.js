import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const CATEGORIES = [
  'Food',
  'Transport',
  'Bills',
  'Entertainment',
  'Shopping',
  'Health',
  'Other',
];

export default function AddExpense() {
  const [accounts, setAccounts] = useState([
    { id: '1', name: 'Cash', balance: 5000 },
  ]);
  const [expenses, setExpenses] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');

  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState(CATEGORIES[0]);

  /* ---------------- ACCOUNT ---------------- */

  const addAccount = () => {
    if (!accName || !accBalance) return;

    const newAcc = {
      id: Date.now().toString(),
      name: accName,
      balance: Number(accBalance),
    };

    setAccounts([...accounts, newAcc]);
    setSelectedAccount(newAcc);
    setAccName('');
    setAccBalance('');
    setShowAddAccount(false);
  };

  const deleteAccount = (id) => {
    Alert.alert(
      'Delete Account?',
      "If deleted, you can't recover it.\nAll data will be lost.",
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAccounts(accounts.filter(a => a.id !== id));
            setExpenses(expenses.filter(e => e.accountId !== id));
            setSelectedAccount(accounts[0] || null);
          },
        },
      ]
    );
  };

  /* ---------------- EXPENSE ---------------- */

  const addExpense = () => {
    if (!expAmount) return;

    const newExpense = {
      id: Date.now().toString(),
      accountId: selectedAccount.id,
      amount: Number(expAmount),
      category: expCategory,
    };

    setExpenses([...expenses, newExpense]);

    setAccounts(accounts.map(acc =>
      acc.id === selectedAccount.id
        ? { ...acc, balance: acc.balance - Number(expAmount) }
        : acc
    ));

    setExpAmount('');
    setShowAddExpense(false);
  };

  /* ---------------- PIE CHART ---------------- */

  const getPieData = () => {
    if (!selectedAccount) return [];

    const accExpenses = expenses.filter(
      e => e.accountId === selectedAccount.id
    );

    const spent = accExpenses.reduce((s, e) => s + e.amount, 0);
    const total = spent + selectedAccount.balance;

    const sums = {};
    accExpenses.forEach(e => {
      sums[e.category] = (sums[e.category] || 0) + e.amount;
    });

    const colors = ['#ff7675', '#74b9ff', '#ffeaa7', '#55efc4', '#a29bfe'];

    return Object.keys(sums).map((cat, i) => ({
      name: cat,
      percentage: (sums[cat] / total) * 100,
      color: colors[i % colors.length],
      legendFontColor: '#fff',
      legendFontSize: 13,
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView>

        {/* ACCOUNTS */}
        <FlatList
          data={accounts}
          horizontal
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedAccount(item)}
              onLongPress={() => deleteAccount(item.id)}
            >
              <LinearGradient
                colors={['#000', '#1c1c1c']}
                style={[
                  styles.accountCard,
                  selectedAccount?.id === item.id && styles.activeCard,
                ]}
              >
                <Text style={styles.accName}>{item.name}</Text>
                <Text style={styles.accBalance}>Rs {item.balance}</Text>
              </LinearGradient>
            </Pressable>
          )}
        />

        {/* PIE CHART */}
        {getPieData().length > 0 && (
          <View style={styles.chartBox}>
            <Text style={styles.chartTitle}>
              Budget Usage – {selectedAccount?.name}
            </Text>
            <PieChart
              data={getPieData()}
              width={screenWidth - 32}
              height={220}
              accessor="percentage"
              backgroundColor="transparent"
              paddingLeft="15"
              chartConfig={{
                color: () => '#fff',
                labelColor: () => '#fff',
              }}
            />
          </View>
        )}
      </ScrollView>

      {/* FABs */}
      <Pressable style={styles.fabLeft} onPress={() => setShowAddAccount(true)}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      <Pressable style={styles.fabRight} onPress={() => setShowAddExpense(true)}>
        <Text style={styles.fabText}>₹</Text>
      </Pressable>

      {/* ADD ACCOUNT */}
      <Modal visible={showAddAccount} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add Account</Text>

          <TextInput
            placeholder="Account Name"
            placeholderTextColor="#999"
            style={styles.input}
            value={accName}
            onChangeText={setAccName}
          />

          <TextInput
            placeholder="Initial Balance"
            placeholderTextColor="#999"
            keyboardType="numeric"
            style={styles.input}
            value={accBalance}
            onChangeText={setAccBalance}
          />

          <View style={styles.modalBtnRow}>
            <Pressable style={styles.cancelBtn} onPress={() => setShowAddAccount(false)}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.submitBtn} onPress={addAccount}>
              <Text style={styles.btnText}>Add</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ADD EXPENSE */}
      <Modal visible={showAddExpense} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add Expense</Text>

          <TextInput
            placeholder="Amount"
            placeholderTextColor="#999"
            keyboardType="numeric"
            style={styles.input}
            value={expAmount}
            onChangeText={setExpAmount}
          />

          <FlatList
            data={CATEGORIES}
            horizontal
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setExpCategory(item)}
                style={[
                  styles.categoryChip,
                  expCategory === item && styles.activeChip,
                ]}
              >
                <Text style={styles.chipText}>{item}</Text>
              </Pressable>
            )}
          />

          <View style={styles.modalBtnRow}>
            <Pressable style={styles.cancelBtn} onPress={() => setShowAddExpense(false)}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.submitBtn} onPress={addExpense}>
              <Text style={styles.btnText}>Add</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  accountCard: {
    width: screenWidth - 40,
    margin: 10,
    padding: 22,
    borderRadius: 18,
  },
  activeCard: { borderWidth: 1.5, borderColor: '#fff' },
  accName: { color: '#fff', fontSize: 20, fontWeight: '600' },
  accBalance: { color: '#bbb', marginTop: 10 },

  chartBox: {
    margin: 16,
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 12,
  },
  chartTitle: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 8,
  },

  fabLeft: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabRight: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontSize: 26 },

  modal: {
    marginTop: 140,
    margin: 20,
    padding: 24,
    backgroundColor: '#111',
    borderRadius: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },

  input: {
    backgroundColor: '#1c1c1c',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    color: '#fff',
  },

  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  submitBtn: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 14,
  },
  cancelBtn: {
    backgroundColor: '#555',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 14,
  },
  btnText: { color: '#fff', fontWeight: '600' },

  categoryChip: {
    backgroundColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
  },
  activeChip: { backgroundColor: '#2ecc71' },
  chipText: { color: '#fff' },
});
