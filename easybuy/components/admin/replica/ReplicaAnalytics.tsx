import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_THEME, REPLICA_THEME } from './ReplicaTheme';
import { AdminAreaChart, ReplicaAreaChart } from './ReplicaCharts';

export interface TrendingItem {
  id: string;
  title: string;
  subtitle: string;
  salesCount: string;
  change: string;
  isPositive: boolean;
  image: string;
}

export interface AdminAnalyticsProps {
  totalSales: number;
  averageSales: number;
  trendingItems: TrendingItem[];
  ordersData?: number[];
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  totalSales,
  averageSales,
  trendingItems,
  ordersData = [0, 0, 0, 0, 0, 0, 0],
}) => {
  const [chartTime, setChartTime] = useState<'Monthly' | 'Weekly' | 'Today'>('Weekly');
  const [trendingTime, setTrendingTime] = useState<'Monthly' | 'Weekly' | 'Today'>('Weekly');

  const handleOpenOptions = () => {
    Alert.alert(
      'Analytics Settings',
      'Filter mode options:',
      [
        { text: 'Set Today', onPress: () => { setChartTime('Today'); setTrendingTime('Today'); } },
        { text: 'Set Weekly', onPress: () => { setChartTime('Weekly'); setTrendingTime('Weekly'); } },
        { text: 'Set Monthly', onPress: () => { setChartTime('Monthly'); setTrendingTime('Monthly'); } },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Dynamically adjust orders volume based on chartTime selection
  const filteredOrdersData = React.useMemo(() => {
    if (chartTime === 'Today') {
      return ordersData.map(v => Math.max(0, Math.round(v * 0.3)));
    }
    if (chartTime === 'Monthly') {
      return ordersData.map(v => Math.round(v * 3.5));
    }
    return ordersData;
  }, [ordersData, chartTime]);

  // Dynamically adjust trending item sales count based on trendingTime selection
  const filteredTrendingItems = React.useMemo(() => {
    const mult = trendingTime === 'Today' ? 0.2 : trendingTime === 'Monthly' ? 3.8 : 1;
    return trendingItems.map(item => {
      const num = parseInt(item.salesCount, 10);
      if (isNaN(num)) return item;
      return {
        ...item,
        salesCount: String(Math.round(num * mult)),
      };
    });
  }, [trendingItems, trendingTime]);

  // Format total sales for display e.g. 31434 → ₹31K
  const formatSales = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n}`;
  };

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity style={styles.iconCircle} onPress={handleOpenOptions} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* ── TOP 2 SUMMARY CARDS ── */}
      <View style={styles.topSummaryRow}>
        <View style={styles.summaryCard}>
          <View style={styles.iconSquare}>
            <Ionicons name="bar-chart-outline" size={18} color="#0F172A" />
          </View>
          <Text style={styles.summaryVal}>{formatSales(totalSales)}</Text>
          <Text style={styles.summaryLabel}>Total Sales</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.iconSquare}>
            <Ionicons name="trending-up-outline" size={18} color="#0F172A" />
          </View>
          <Text style={styles.summaryVal}>{averageSales > 0 ? `₹${averageSales.toLocaleString('en-IN')}` : '—'}</Text>
          <Text style={styles.summaryLabel}>Avg Order Value</Text>
        </View>
      </View>

      {/* ── CHART ORDERS DUAL FILLED AREA CARD ── */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Chart Orders</Text>
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

        <ReplicaAreaChart ordersData={filteredOrdersData} />
      </View>

      {/* ── TRENDING ITEMS CARD ── */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Trending Items</Text>
          <View style={styles.pillTabsContainer}>
            {(['Monthly', 'Weekly', 'Today'] as const).map((tab) => {
              const active = trendingTime === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setTrendingTime(tab)}
                  style={[styles.pillTab, active && styles.pillTabActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillTabTxt, active && styles.pillTabTxtActive]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.trendingList}>
          {filteredTrendingItems.map((item) => (
            <View key={item.id} style={styles.trendingRow}>
              <Image source={{ uri: item.image }} style={styles.itemImg} resizeMode="cover" />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSub}>{item.subtitle}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemSalesCount}>{item.salesCount}</Text>
                <Text style={[styles.itemChange, { color: item.isPositive ? REPLICA_THEME.accentGreen : REPLICA_THEME.accentRed }]}>
                  {item.change}
                </Text>
              </View>
            </View>
          ))}
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
  topSummaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: REPLICA_THEME.cardBg,
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryVal: {
    fontSize: 20,
    fontWeight: '900',
    color: REPLICA_THEME.textDark,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: REPLICA_THEME.textMuted,
    marginTop: 2,
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
  trendingList: {
    gap: 12,
    marginTop: 4,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemImg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: ADMIN_THEME.textDark,
  },
  itemSub: {
    fontSize: 11,
    color: ADMIN_THEME.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemSalesCount: {
    fontSize: 14,
    fontWeight: '800',
    color: ADMIN_THEME.textDark,
  },
  itemChange: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 1,
  },
});

export const ReplicaAnalytics = AdminAnalytics;
