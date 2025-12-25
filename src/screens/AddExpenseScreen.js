import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

export default function AddExpenseScreen() {
  const [activeTab, setActiveTab] = useState('ACCOUNTS');

  const [accounts, setAccounts] = useState([
    { id: '1', name: 'Cash Wallet', balance: '5000', colors: ['#ff7a18', '#ffb347'] },
    { id: '2', name: 'Bank Account', balance: '25000', colors: ['#36d1dc', '#5b86e5'] },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  const openAddModal = () => {
    setEditingAccount(null);
    setName('');
    setBalance('');
    setModalVisible(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setName(account.name);
    setBalance(account.balance);
    setModalVisible(true);
  };

  const saveAccount = () => {
    if (editingAccount) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === editingAccount.id
            ? { ...acc, name, balance }
            : acc
        )
      );
    } else {
      setAccounts((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name,
          balance,
          colors: ['#8e2de2', '#4a00e0'],
        },
      ]);
    }
    setModalVisible(false);
  };

  return (
    <LinearGradient colors={['#000', '#1a1a1a']} style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['ACCOUNTS', 'BUDGET'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Accounts */}
      {activeTab === 'ACCOUNTS' && (
        <>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <LinearGradient colors={item.colors} style={styles.accountCard}>
                  <Text style={styles.accountName}>{item.name}</Text>
                  <Text style={styles.accountBalance}>Rs. {item.balance}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />

          {/* Add Account Button */}
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add Account</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Budget Placeholder */}
      {activeTab === 'BUDGET' && (
        <View style={styles.center}>
          <Text style={{ color: '#aaa' }}>Budget section coming soon</Text>
        </View>
      )}

      {/* Add/Edit Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingAccount ? 'Edit Account' : 'Add Account'}
            </Text>

            <TextInput
              placeholder="Account Name"
              placeholderTextColor="#888"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Amount"
              placeholderTextColor="#888"
              style={styles.input}
              keyboardType="numeric"
              value={balance}
              onChangeText={setBalance}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveAccount}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  tabContainer: {
    flexDirection: 'row',
    marginTop: 50,
    marginHorizontal: 16,
    backgroundColor: '#111',
    borderRadius: 12,
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { backgroundColor: '#222', borderRadius: 12 },
  tabText: { color: '#fff', fontWeight: '600' },

  accountCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  accountName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  accountBalance: { color: '#fff', marginTop: 8 },

  addButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#222',
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { color: '#fff', fontSize: 18, marginBottom: 16 },

  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#4a00e0',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: { color: '#fff', fontWeight: '600' },
  cancelText: { color: '#aaa', textAlign: 'center', marginTop: 12 },
});
