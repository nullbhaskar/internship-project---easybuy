import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_THEME, REPLICA_THEME } from './ReplicaTheme';
import { AdminLineChart, ReplicaLineChart } from './ReplicaCharts';

import { AdminOrder } from '../adminTypes';

export interface AdminDashboardProps {
  productsCount: number;
  ordersCount: number;
  clientsCount: number;
  totalRevenue: number;
  onManageProducts: () => void;
  orders?: AdminOrder[];
  weeklyRevenueData?: number[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  productsCount,
  ordersCount,
  clientsCount,
  totalRevenue,
  onManageProducts,
  orders = [],
}) => {
  const [timeFilter, setTimeFilter] = useState<'Monthly' | 'Weekly' | 'Today'>('Weekly');

  // Calculate revenue data based on active timeFilter ('Monthly' | 'Weekly' | 'Today')
  const revenueChartData = React.useMemo(() => {
    const sums = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    orders.forEach(o => {
      if ((o.status || '').toLowerCase() === 'cancelled') return;
      const date = o.createdAt ? new Date(o.createdAt) : new Date();
      const time = date.getTime();

      if (timeFilter === 'Today' && time < startOfDay) return;
      if (timeFilter === 'Weekly' && time < startOfWeek.getTime()) return;
      if (timeFilter === 'Monthly' && time < startOfMonth) return;

      const dayIdx = date.getDay(); // 0: Sun to 6: Sat
      const amt = typeof o.totalAmount === 'number' ? o.totalAmount : parseFloat(String(o.totalAmount).replace(/[^0-9.]/g, '')) || 0;
      sums[dayIdx] += amt;
    });

    return sums;
  }, [orders, timeFilter]);

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' }}
          style={styles.avatar}
        />
      </View>

      {/* ── 2x2 KPI GRID ── */}
      <View style={styles.kpiGrid}>
        {/* Stat 1: Total Products (Dark Obsidian Card) */}
        <View style={[styles.kpiCard, styles.kpiDarkCard]}>
          <Text style={styles.kpiValueDark}>{productsCount || 180}</Text>
          <Text style={styles.kpiLabelDark}>Total Products</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressPctDark}>0%</Text>
            <View style={styles.progressTrackDark}>
              <View style={[styles.progressFillDark, { width: '30%' }]} />
            </View>
            <Text style={styles.progressPctDark}>30%</Text>
          </View>
        </View>

        {/* Stat 2: Total Orders */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{ordersCount || 210}</Text>
          <Text style={styles.kpiLabel}>Total Orders</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressPct}>0%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFillBlue, { width: '70%' }]} />
            </View>
            <Text style={styles.progressPct}>70%</Text>
          </View>
        </View>

        {/* Stat 3: Total Clients */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{clientsCount}</Text>
          <Text style={styles.kpiLabel}>Total Clients</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressPct}>0%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFillGrey, { width: '70%' }]} />
            </View>
            <Text style={styles.progressPct}>70%</Text>
          </View>
        </View>

        {/* Stat 4: Revenue */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
          <Text style={styles.kpiLabel}>Revenue</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressPct}>0%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFillPink, { width: '70%' }]} />
            </View>
            <Text style={styles.progressPct}>70%</Text>
          </View>
        </View>
      </View>

      {/* ── REVENUE LINE CHART CARD ── */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Revenue</Text>
          <View style={styles.pillTabsContainer}>
            {(['Monthly', 'Weekly', 'Today'] as const).map((tab) => {
              const active = timeFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setTimeFilter(tab)}
                  style={[styles.pillTab, active && styles.pillTabActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillTabTxt, active && styles.pillTabTxtActive]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ReplicaLineChart revenueData={revenueChartData} timeFilter={timeFilter} />
      </View>

      {/* ── QUICK ACTION CATALOG BAR ── */}
      <TouchableOpacity style={styles.manageBar} onPress={onManageProducts} activeOpacity={0.85}>
        <View style={styles.manageBarLeft}>
          <View style={styles.manageIconBox}>
            <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.manageTitle}>Manage Catalog & Inventory</Text>
            <Text style={styles.manageSub}>{productsCount} Products loaded in database</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#0F172A" />
      </TouchableOpacity>
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: REPLICA_THEME.cardBg,
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  kpiDarkCard: {
    backgroundColor: REPLICA_THEME.darkCardBg,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: REPLICA_THEME.textDark,
  },
  kpiValueDark: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: REPLICA_THEME.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  kpiLabelDark: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressPct: {
    fontSize: 9,
    fontWeight: '700',
    color: REPLICA_THEME.textMuted,
  },
  progressPctDark: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  progressTrack: {
    flex: 1,
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressTrackDark: {
    flex: 1,
    height: 7,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFillDark: {
    height: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  progressFillBlue: {
    height: '100%',
    backgroundColor: REPLICA_THEME.accentBlue,
    borderRadius: 4,
  },
  progressFillGrey: {
    height: '100%',
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
  },
  progressFillPink: {
    height: '100%',
    backgroundColor: REPLICA_THEME.accentPink,
    borderRadius: 4,
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
  manageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  manageBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  manageIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: ADMIN_THEME.textDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: ADMIN_THEME.textDark,
  },
  manageSub: {
    fontSize: 11,
    color: ADMIN_THEME.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
});

export const ReplicaDashboard = AdminDashboard;
