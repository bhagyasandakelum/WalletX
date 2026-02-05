import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { G, Circle } from 'react-native-svg';
import { useWallet } from '../context/WalletContext';

import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/Card';
import Footer from '../components/Footer';

/* ---------------- CHART CONSTANTS ---------------- */

const RADIUS = 80;
const STROKE = 22;
const COLORS = ['#67e8f9', '#38bdf8', '#0ea5e9', '#0284c7'];

export default function StatsScreen() {
  const navigation = useNavigation();
  const {
    accounts,
    selectedAccount,
    expenses,
    setSelectedAccount
  } = useWallet();

  /* ---------------- STATE ---------------- */
  const [showAccounts, setShowAccounts] = useState(false);
  const [range, setRange] = useState('DAY');

  /* ---------------- CALCULATIONS ---------------- */

  const expensesToShow = useMemo(() => {
    // If no expenses or no dates, return empty
    if (!expenses || expenses.length === 0) return [];

    const now = new Date();
    return expenses.filter(e => {
      // e.date should be a Date object from Context
      const d = e.date;
      if (!(d instanceof Date) || isNaN(d)) return false;

      if (range === 'DAY') {
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (range === 'WEEK') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return d >= oneWeekAgo;
      }
      if (range === 'MONTH') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (range === 'YEAR') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [expenses, range]);

  const total = expensesToShow.reduce((sum, e) => sum + e.amount, 0);

  let cumulativeAngle = 0;

  const slices = expensesToShow.map((item, index) => {
    const percent = total === 0 ? 0 : item.amount / total;
    const angle = percent * 360;
    const slice = {
      angle,
      color: COLORS[index % COLORS.length],
      startAngle: cumulativeAngle,
    };
    cumulativeAngle += angle;
    return slice;
  });

  /* ---------------- UI ---------------- */

  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Overview</Text>
          <Text style={styles.headerSub}>Spending Analysis</Text>
        </View>
        <Pressable style={styles.profileBtn}>
          <Text style={styles.profileIcon}>📊</Text>
        </Pressable>
      </View>

      {/* FILTER TABS */}
      <View style={styles.rangeContainer}>
        {['DAY', 'WEEK', 'MONTH', 'YEAR'].map(r => (
          <Pressable
            key={r}
            onPress={() => setRange(r)}
            style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
          >
            <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>
              {r}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ACCOUNT CARD */}
      <Pressable onPress={() => setShowAccounts(!showAccounts)}>
        <Card style={styles.accountCard}>
          <View style={styles.row}>
            <Text style={styles.accountLabel}>Selected Account</Text>
            <Text style={styles.arrow}>▼</Text>
          </View>
          <Text style={styles.accountName}>
            {selectedAccount ? selectedAccount.name : 'No Account'}
          </Text>

          {showAccounts && (
            <View style={styles.accountDropdown}>
              {accounts.map(acc => (
                <Pressable
                  key={acc.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedAccount(acc);
                    setShowAccounts(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{acc.name}</Text>
                  <Text style={styles.dropdownItemBalance}>${acc.balance.toFixed(2)}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Card>
      </Pressable>

      {/* CHART SECTION */}
      <View style={styles.chartContainer}>
        <View style={styles.chartWrap}>
          <Svg width={240} height={240}>
            <G rotation="-90" origin="120, 120">
              {slices.length > 0 ? slices.map((slice, index) => (
                <Circle
                  key={index}
                  cx="120"
                  cy="120"
                  r={RADIUS}
                  stroke={slice.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${slice.angle * 2.5} ${360 * 2.5}`}
                  strokeDashoffset={slice.startAngle * -2.5}
                  fill="none"
                  strokeLinecap="round"
                />
              )) : (
                <Circle
                  cx="120" cy="120" r={RADIUS} stroke="#e5e7eb" strokeWidth={STROKE} fill="none"
                />
              )}
            </G>
          </Svg>

          <View style={styles.center}>
            <Text style={styles.totalLabel}>Spent</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* FOOTER */}
      <Footer />

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  profileIcon: { fontSize: 20 },

  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  rangeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rangeBtnActive: {
    backgroundColor: '#111827',
  },
  rangeText: {
    fontWeight: '600',
    color: '#6b7280',
    fontSize: 12,
  },
  rangeTextActive: {
    color: '#fff',
  },

  accountCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  accountLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  arrow: { fontSize: 12, color: '#9ca3af' },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  accountDropdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownItemBalance: {
    color: '#6b7280',
  },

  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  chartWrap: {
    position: 'relative',
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
});