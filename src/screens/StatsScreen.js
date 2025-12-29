import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { G, Circle } from 'react-native-svg';

/* ---------------- MOCK SHARED DATA ---------------- */
/* (Later you can move this to Context or store) */

const ACCOUNTS = [
  { id: 1, name: 'Cash', balance: 1200 },
  { id: 2, name: 'Bank', balance: 5000 },
];

const EXPENSES = [
  { id: 1, title: 'Food', amount: 300, date: new Date(), accountId: 1 },
  { id: 2, title: 'Transport', amount: 150, date: new Date(), accountId: 1 },
  { id: 3, title: 'Shopping', amount: 600, date: new Date(), accountId: 2 },
];

/* ---------------- CHART CONSTANTS ---------------- */

const RADIUS = 80;
const STROKE = 22;
const COLORS = ['#67e8f9', '#38bdf8', '#0ea5e9', '#0284c7'];

export default function StatsScreen() {
  const navigation = useNavigation();

  const [selectedAccount, setSelectedAccount] = useState(ACCOUNTS[0]);
  const [showAccounts, setShowAccounts] = useState(false);
  const [range, setRange] = useState('DAY');

  /* ---------------- FILTER EXPENSES ---------------- */

  const filteredExpenses = useMemo(() => {
    return EXPENSES.filter(e => e.accountId === selectedAccount.id);
  }, [selectedAccount]);

  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  /* ---------------- PIE CALC ---------------- */

  let cumulativeAngle = 0;

  const slices = filteredExpenses.map((item, index) => {
    const percent = item.amount / total;
    const angle = percent * 360;
    const slice = {
      angle,
      color: COLORS[index % COLORS.length],
      label: item.title,
      value: percent,
      startAngle: cumulativeAngle,
    };
    cumulativeAngle += angle;
    return slice;
  });

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.container}>
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <Text style={styles.title}>WalletX</Text>
      </View>

      {/* ---------- ACCOUNT CARD ---------- */}
      <Pressable
        style={styles.card}
        onPress={() => setShowAccounts(!showAccounts)}
      >
        <Text style={styles.sub}>Local balance</Text>
        <Text style={styles.balance}>${selectedAccount.balance}</Text>
        <Text style={styles.arrow}>⌄</Text>

        {showAccounts && (
          <View style={styles.dropdown}>
            {ACCOUNTS.filter(a => a.id !== selectedAccount.id).map(acc => (
              <Pressable
                key={acc.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedAccount(acc);
                  setShowAccounts(false);
                }}
              >
                <Text style={styles.dropdownText}>{acc.name}</Text>
                <Text>${acc.balance}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </Pressable>

      {/* ---------- RANGE FILTER ---------- */}
      <View style={styles.rangeRow}>
        {['DAY', 'WEEK', 'MONTH', 'YEAR'].map(r => (
          <Pressable key={r} onPress={() => setRange(r)}>
            <Text style={[styles.rangeBtn, range === r && styles.rangeActive]}>
              {r}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ---------- DONUT CHART ---------- */}
      <View style={styles.chartWrap}>
        <Svg width={200} height={200}>
          <G rotation="-90" origin="100, 100">
            {slices.map((slice, index) => (
              <Circle
                key={index}
                cx="100"
                cy="100"
                r={RADIUS}
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeDasharray={`${slice.angle * 2.5} ${360 * 2.5}`}
                strokeDashoffset={slice.startAngle * -2.5}
                fill="none"
              />
            ))}
          </G>
        </Svg>

        <View style={styles.center}>
          <Text style={styles.total}>${total}</Text>
          <Text style={styles.centerSub}>Total</Text>
        </View>
      </View>

      {/* ---------- FOOTER ---------- */}
      <View style={styles.footer}>
        <Text
          style={styles.footerItem}
          onPress={() => navigation.navigate('AddExpense')}
        >
          🏠
        </Text>
        <Text style={[styles.footerItem, styles.footerActive]}>📊</Text>
        <Text style={styles.footerItem}>⚙️</Text>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },

  header: { alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '700' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
  },

  sub: { color: '#64748b' },
  balance: { fontSize: 26, fontWeight: '700', marginTop: 4 },
  arrow: { position: 'absolute', right: 16, top: 20, fontSize: 18 },

  dropdown: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },

  dropdownItem: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dropdownText: { fontWeight: '600' },

  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },

  rangeBtn: { color: '#64748b', fontWeight: '600' },
  rangeActive: { color: '#0f172a', fontWeight: '800' },

  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  center: {
    position: 'absolute',
    alignItems: 'center',
  },

  total: { fontSize: 22, fontWeight: '800' },
  centerSub: { fontSize: 12, color: '#64748b' },

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
