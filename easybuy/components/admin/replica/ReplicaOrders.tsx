import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_THEME, REPLICA_THEME } from './ReplicaTheme';
import { AdminBarChart, ReplicaBarChart } from './ReplicaCharts';
import { AdminOrder } from '../adminTypes';

export interface AdminOrdersProps {
  orders: AdminOrder[];
  onUpdateStatus: (orderId: string, status: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onUpdateStatus }) => {
  const [chartTime, setChartTime] = useState<'Monthly' | 'Weekly' | 'Today'>('Weekly');
  const [listTime, setListTime] = useState<'Monthly' | 'Weekly' | 'Today'>('Weekly');

  const handleOpenOptions = () => {
    Alert.alert(
      'Order Options',
      'Filter orders by:',
      [
        { text: 'Set Today', onPress: () => { setChartTime('Today'); setListTime('Today'); } },
        { text: 'Set Weekly', onPress: () => { setChartTime('Weekly'); setListTime('Weekly'); } },
        { text: 'Set Monthly', onPress: () => { setChartTime('Monthly'); setListTime('Monthly'); } },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Dynamically compute orders bar chart dates (last 4 dates from orders or recent dates)
  const barChartDates = React.useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};

    // Initialize last 4 days
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[label] = { total: 0, completed: 0 };
    }

    orders.forEach(ord => {
      const date = ord.createdAt ? new Date(ord.createdAt) : new Date();
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!map[label]) {
        map[label] = { total: 0, completed: 0 };
      }
      map[label].total += 1;
      const status = (ord.status || '').toLowerCase();
      if (status === 'delivered' || status === 'confirmed' || status === 'shipped') {
        map[label].completed += 1;
      }
    });

    const entries = Object.entries(map)
      .slice(-4)
      .map(([label, val]) => ({
        label,
        black: val.total,
        pink: val.completed,
      }));

    return entries;
  }, [orders]);

  // Default fallback order list matching database structure
  const defaultOrderList = [
    { id: 'o1', initials: 'US', name: 'User', date: 'Aug 17, 2026', amount: '₹4,218', status: 'Cancelled' },
    { id: 'o2', initials: 'CU', name: 'Customer', date: 'Aug 17, 2026', amount: '₹3,019', status: 'Cancelled' },
    { id: 'o3', initials: 'CU', name: 'Customer', date: 'Aug 13, 2026', amount: '₹198', status: 'Delivered' },
    { id: 'o4', initials: 'CU', name: 'Customer', date: 'Aug 13, 2026', amount: '₹23,999', status: 'Cancelled' },
  ];

  const filteredListOrders = React.useMemo(() => {
    const list = orders.length > 0 ? orders : defaultOrderList as any;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return list.filter((ord: any) => {
      if (!ord.createdAt) return true;
      const time = new Date(ord.createdAt).getTime();
      if (listTime === 'Today') return time >= startOfDay;
      if (listTime === 'Weekly') return time >= startOfWeek.getTime();
      if (listTime === 'Monthly') return time >= startOfMonth;
      return true;
    });
  }, [orders, listTime]);

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Orders</Text>
        <TouchableOpacity style={styles.iconCircle} onPress={handleOpenOptions} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* ── ORDERS BAR CHART CARD ── */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Orders</Text>
          <View style={styles.pillTabsContainer}>
            {(['Monthly', 'Weekly', 'Today'] as const).map((tab) => {
              const active = chartTime === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setChartTime(tab)}
                  style={[styles.pillTab, active && styles.pillTabActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillTabTxt, active && styles.pillTabTxtActive]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ReplicaBarChart datesData={barChartDates} />
      </View>

      {/* ── ORDER LIST CARD ── */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Order List</Text>
          <View style={styles.pillTabsContainer}>
            {(['Monthly', 'Weekly', 'Today'] as const).map((tab) => {
              const active = listTime === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setListTime(tab)}
                  style={[styles.pillTab, active && styles.pillTabActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillTabTxt, active && styles.pillTabTxtActive]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.orderList}>
          {filteredListOrders.map((ord: any) => {
            const name = ord.userName || ord.shippingAddress?.fullName || ord.name || 'Customer';
            const initials = ord.initials || name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'CU';
            const amt = ord.amount || (ord.totalAmount ? `₹${ord.totalAmount}` : '+$12.00');
            const status = ord.status || 'New Order';

            return (
              <View key={ord.id} style={styles.orderRow}>
                <View style={styles.avatarInitials}>
                  <Text style={styles.initialsTxt}>{initials}</Text>
                </View>

                <View style={styles.orderInfo}>
                  <Text style={styles.orderName}>{name}</Text>
                  <Text style={styles.orderDate}>{ord.date || (ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Aug 21, 2024')}</Text>
                </View>

                <Text style={styles.orderAmt}>{amt}</Text>

                <TouchableOpacity
                  style={styles.statusBadge}
                  onPress={() => {
                    const nextStatus = status === 'Delivered' ? 'confirmed' : 'delivered';
                    if (ord.id && onUpdateStatus) onUpdateStatus(ord.id, nextStatus);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.statusBadgeTxt}>{status}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: REPLICA_THEME.textDark,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCard: {
    backgroundColor: REPLICA_THEME.cardBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: REPLICA_THEME.textDark,
  },
  pillTabsContainer: {
    flexDirection: 'row',
    backgroundColor: REPLICA_THEME.pillInactiveBg,
    borderRadius: 8,
    padding: 2,
  },
  pillTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillTabActive: {
    backgroundColor: REPLICA_THEME.pillActiveBg,
  },
  pillTabTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: REPLICA_THEME.pillInactiveText,
  },
  pillTabTxtActive: {
    color: REPLICA_THEME.pillActiveText,
  },
  orderList: {
    gap: 12,
    marginTop: 4,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  avatarInitials: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  initialsTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderInfo: {
    flex: 1,
    marginLeft: 10,
  },
  orderName: {
    fontSize: 13,
    fontWeight: '800',
    color: ADMIN_THEME.textDark,
  },
  orderDate: {
    fontSize: 10.5,
    color: ADMIN_THEME.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  orderAmt: {
    fontSize: 13,
    fontWeight: '800',
    color: ADMIN_THEME.textDark,
    marginRight: 10,
  },
  statusBadge: {
    backgroundColor: ADMIN_THEME.badgeNewOrderBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeTxt: {
    color: ADMIN_THEME.badgeNewOrderText,
    fontSize: 10,
    fontWeight: '800',
  },
});

export const ReplicaOrders = AdminOrders;
