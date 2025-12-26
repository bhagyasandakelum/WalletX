import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

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

export default function AddExpenseScreen() {
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

  /* ------------------ ACCOUNT ACTIONS ------------------ */

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
        { text: 'No' },
        {
          text: 'Yes',
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

  /* ------------------ EXPENSE ACTIONS ------------------ */

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

  /* ------------------ PIE CHART DATA ------------------ */

  const getPieData = () => {
    if (!selectedAccount) return [];

    const accExpenses = expenses.filter(
      e => e.accountId === selectedAccount.id
    );

    const totalSpent = accExpenses.reduce((s, e) => s + e.amount, 0);
    const totalBudget = totalSpent + selectedAccount.balance;

    const sums = {};
    accExpenses.forEach(e => {
      sums[e.category] = (sums[e.category] || 0) + e.amount;
    });

    const colors = [
      '#ff7675',
      '#74b9ff',
      '#ffeaa7',
      '#55efc4',
      '#a29bfe',
      '#fd79a8',
      '#fab1a0',
    ];

    return Object.keys(sums).map((cat, i) => ({
      name: cat,
      percentage: (sums[cat] / totalBudget) * 100,
      color: colors[i % colors.length],
      legendFontColor: '#fff',
      legendFontSize: 13,
    }));
  };

  /* ------------------ RENDER ------------------ */

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ACCOUNTS */}
        <FlatList
          data={accounts}
          horizontal
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedAccount(item)}
              onLongPress={() => deleteAccount(item.id)}
            >
              <LinearGradient
                colors={['#000', '#222']}
                style={[
                  styles.accountCard,
                  selectedAccount?.id === item.id && styles.activeCard,
                ]}
              >
                <Text style={styles.accName}>{item.name}</Text>
                <Text style={styles.accBalance}>Rs {item.balance}</Text>
              </LinearGradient>
            </TouchableOpacity>
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
              hasLegend
            />
          </View>
        )}

        {/* EXPENSE HISTORY */}
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => setShowHistory(true)}
        >
          <Text style={styles.historyText}>View Expense History</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FLOATING BUTTONS */}
      <TouchableOpacity
        style={styles.fabLeft}
        onPress={() => setShowAddAccount(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fabRight}
        onPress={() => setShowAddExpense(true)}
      >
        <Text style={styles.fabText}>₹</Text>
      </TouchableOpacity>

      {/* ADD ACCOUNT MODAL */}
      <Modal visible={showAddAccount} transparent animationType="slide">
        <View style={styles.modal}>
          <TextInput placeholder="Account Name" onChangeText={setAccName} />
          <TextInput
            placeholder="Balance"
            keyboardType="numeric"
            onChangeText={setAccBalance}
          />
          <TouchableOpacity onPress={addAccount}>
            <Text>Add Account</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ADD EXPENSE MODAL */}
      <Modal visible={showAddExpense} transparent animationType="slide">
        <View style={styles.modal}>
          <TextInput
            placeholder="Amount"
            keyboardType="numeric"
            onChangeText={setExpAmount}
          />
          <FlatList
            data={CATEGORIES}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setExpCategory(item)}>
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={addExpense}>
            <Text>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* HISTORY MODAL */}
      <Modal visible={showHistory} animationType="slide">
        <FlatList
          data={expenses.filter(e => e.accountId === selectedAccount?.id)}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.expRow}>
              <Text>{item.category}</Text>
              <Text>Rs {item.amount}</Text>
            </View>
          )}
        />
        <TouchableOpacity onPress={() => setShowHistory(false)}>
          <Text style={{ textAlign: 'center', margin: 20 }}>Close</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  accountCard: {
    width: screenWidth - 40,
    margin: 10,
    padding: 20,
    borderRadius: 18,
  },
  activeCard: { borderWidth: 2, borderColor: '#fff' },
  accName: { color: '#fff', fontSize: 20 },
  accBalance: { color: '#ccc', marginTop: 10 },

  chartBox: {
    margin: 16,
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 10,
  },
  chartTitle: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },

  fabLeft: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabRight: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#fff', fontSize: 24 },

  modal: {
    marginTop: 200,
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },

  historyBtn: {
    margin: 20,
    padding: 12,
    backgroundColor: '#222',
    borderRadius: 10,
  },
  historyText: { color: '#fff', textAlign: 'center' },

  expRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
});
