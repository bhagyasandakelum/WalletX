import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
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
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
];

export default function AddExpenseScreen() {
  const [accounts, setAccounts] = useState([
    { id: '1', name: 'Cash', balance: 5000, colors: ['#ff7a18', '#ffb347'] },
    { id: '2', name: 'Bank', balance: 25000, colors: ['#36d1dc', '#5b86e5'] },
  ]);

  const [expenses, setExpenses] = useState([]);

  const [addAccountModal, setAddAccountModal] = useState(false);
  const [addExpenseModal, setAddExpenseModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState(null);

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);

  /* ---------- ACCOUNT HANDLERS ---------- */

  const addAccount = () => {
    if (!name.trim()) {
      Alert.alert('Please enter account name');
      return;
    }
    if (!balance || isNaN(balance)) {
      Alert.alert('Please enter valid initial balance');
      return;
    }
    setAccounts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: name.trim(),
        balance: Number(balance),
        colors: ['#8e2de2', '#4a00e0'],
      },
    ]);
    setName('');
    setBalance('');
    setAddAccountModal(false);
  };

  const confirmDeleteAccount = (account) => {
    Alert.alert(
      'Delete Account',
      'If you delete this account, all related expenses will be permanently lost. This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: () => {
            setAccounts((prev) => prev.filter((acc) => acc.id !== account.id));
            setExpenses((prev) => prev.filter((exp) => exp.accountId !== account.id));
            if (selectedAccount?.id === account.id) {
              setSelectedAccount(null);
              setHistoryModal(false);
            }
          },
        },
      ]
    );
  };

  /* ---------- EXPENSE HANDLERS ---------- */

  const addExpense = () => {
    if (!selectedAccount) {
      Alert.alert('Please select an account');
      return;
    }
    if (!category) {
      Alert.alert('Please select a category');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert('Please enter a valid amount');
      return;
    }
    if (Number(amount) > selectedAccount.balance) {
      Alert.alert('Insufficient balance in selected account');
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      accountId: selectedAccount.id,
      amount: Number(amount),
      category,
      date: new Date().toISOString().split('T')[0],
    };

    setExpenses((prev) => [...prev, newExpense]);

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === selectedAccount.id
          ? { ...acc, balance: acc.balance - Number(amount) }
          : acc
      )
    );

    setAmount('');
    setCategory(null);
    setAddExpenseModal(false);
  };

  const deleteExpense = (expenseId) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const expenseToDelete = expenses.find((e) => e.id === expenseId);
            if (expenseToDelete) {
              setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
              // Refund amount back to account balance
              setAccounts((prev) =>
                prev.map((acc) =>
                  acc.id === expenseToDelete.accountId
                    ? { ...acc, balance: acc.balance + expenseToDelete.amount }
                    : acc
                )
              );
            }
          },
        },
      ]
    );
  };

  /* ---------- CHART DATA ---------- */

  const getChartData = () => {
    if (!selectedAccount) return [];

    const data = {};
    expenses
      .filter((e) => e.accountId === selectedAccount.id)
      .forEach((e) => {
        data[e.category] = (data[e.category] || 0) + e.amount;
      });

    const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#8e44ad'];

    return Object.keys(data).map((key, index) => ({
      name: key,
      amount: data[key],
      color: colors[index % colors.length],
      legendFontColor: '#fff',
      legendFontSize: 14,
    }));
  };

  return (
    <LinearGradient colors={['#000', '#1a1a1a']} style={styles.container}>
      {/* Accounts List */}
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedAccount({ ...item }); // clone to prevent issues
                  setHistoryModal(true);
                }}
                style={{ flex: 1 }}
              >
                <LinearGradient colors={item.colors} style={styles.innerCard}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.balance}>Rs. {item.balance}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => confirmDeleteAccount(item)} style={styles.deleteBtn}>
                <Text style={styles.delete}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Floating Buttons */}
      <TouchableOpacity
        style={styles.fabLeft}
        onPress={() => setAddAccountModal(true)}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fabRight}
        onPress={() => {
          if (accounts.length === 0) {
            Alert.alert('Please add an account first');
            return;
          }
          setSelectedAccount(accounts[0]); // default to first account on open
          setCategory(null);
          setAmount('');
          setAddExpenseModal(true);
        }}
      >
        <Text style={styles.fabText}>₹</Text>
      </TouchableOpacity>

      {/* ---------------- MODALS ---------------- */}

      {/* Add Account */}
      <Modal transparent visible={addAccountModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Account</Text>
            <TextInput
              style={styles.input}
              placeholder="Account Name"
              placeholderTextColor="#777"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Initial Balance"
              placeholderTextColor="#777"
              keyboardType="numeric"
              value={balance}
              onChangeText={setBalance}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={addAccount}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddAccountModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Expense */}
      <Modal transparent visible={addExpenseModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Expense</Text>

            <Text style={styles.label}>Select Account</Text>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => setSelectedAccount(acc)}
                style={[
                  styles.selector,
                  selectedAccount?.id === acc.id && styles.selected,
                ]}
              >
                <Text style={{ color: selectedAccount?.id === acc.id ? '#fff' : '#aaa' }}>
                  {acc.name} (Rs. {acc.balance})
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.label}>Select Category</Text>
            <View style={styles.categoryWrap}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat} onPress={() => setCategory(cat)}>
                  <Text
                    style={[
                      styles.category,
                      category === cat && styles.selected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor="#777"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={addExpense}>
              <Text style={styles.saveText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddExpenseModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Expense History */}
      <Modal transparent visible={historyModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>History - {selectedAccount?.name}</Text>

            {getChartData().length > 0 && (
              <PieChart
                data={getChartData()}
                width={screenWidth - 60}
                height={220}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="10"
                chartConfig={{
                  backgroundGradientFrom: '#000',
                  backgroundGradientTo: '#1a1a1a',
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                style={{ marginVertical: 12, borderRadius: 16 }}
              />
            )}

            <ScrollView style={{ maxHeight: 220 }}>
              {expenses
                .filter((e) => e.accountId === selectedAccount?.id)
                .map((e) => (
                  <View key={e.id} style={styles.expenseRow}>
                    <Text style={styles.history}>
                      {e.date} • {e.category} • Rs. {e.amount}
                    </Text>
                    <TouchableOpacity onPress={() => deleteExpense(e.id)}>
                      <Text style={styles.deleteExpense}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

              {expenses.filter((e) => e.accountId === selectedAccount?.id).length === 0 && (
                <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 20 }}>
                  No expenses yet.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity onPress={() => setHistoryModal(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1 },

  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
  },

  innerCard: {
    padding: 20,
    borderRadius: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  balance: {
    color: '#fff',
    marginTop: 6,
  },

  deleteBtn: {
    paddingHorizontal: 16,
  },

  delete: {
    fontSize: 22,
    color: '#ff4d4d',
  },

  fabLeft: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    backgroundColor: '#333',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  fabRight: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4a00e0',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },

  modalBox: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '700',
  },

  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  saveBtn: {
    backgroundColor: '#4a00e0',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  cancelBtn: {
    marginTop: 10,
    alignItems: 'center',
  },

  cancelText: {
    color: '#aaa',
    fontSize: 16,
  },

  selector: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },

  selected: {
    backgroundColor: '#4a00e0',
    borderColor: '#4a00e0',
  },

  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },

  category: {
    color: '#aaa',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },

  label: {
    color: '#ddd',
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },

  history: {
    color: '#ddd',
    fontSize: 16,
  },

  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },

  deleteExpense: {
    color: '#ff4d4d',
    fontSize: 20,
    paddingHorizontal: 8,
  },

  closeBtn: {
    marginTop: 20,
    alignItems: 'center',
  },

  closeText: {
    color: '#aaa',
    fontSize: 16,
  },
});
