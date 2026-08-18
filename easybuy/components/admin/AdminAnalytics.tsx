import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, S } from './adminTheme';
import { AdminOrder, AdminProduct } from './adminTypes';

interface AdminAnalyticsProps {
  products: AdminProduct[];
  orders: AdminOrder[];
  categories: { id: string; name?: string; categoryId?: string }[];
}

interface MetricBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
  count: number;
}

const MetricBar: React.FC<MetricBarProps> = ({ label, value, total, color, count }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pct = total > 0 ? value / total : 0;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={aStyles.barRow}>
      <View style={aStyles.barLabelRow}>
        <Text style={aStyles.barLabel}>{label}</Text>
        <Text style={[aStyles.barCount, { color }]}>{count}</Text>
      </View>
      <View style={aStyles.barBg}>
        <Animated.View
          style={[
            aStyles.barFill,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={aStyles.barPct}>{Math.round(pct * 100)}%</Text>
    </View>
  );
};

const CATEGORY_EMOJIS: Record<string, string> = {
  grocery: '🛒', beauty: '💄', men: '👔', women: '👗', fashion: '👗',
  ethnic_wear: '🥻', home_living: '🏡', electronics: '📱', gaming: '🎮',
  fitness: '🏋️', study_office: '📚', hostel_essentials: '🛏️',
  kitchen: '🍳', lifestyle: '⌚', accessories: '👜', footwear: '👟',
  sports: '⚽', pet_care: '🐾', automobile: '🚗', baby_care: '🍼',
  health_care: '🩺', gifts: '🎁', quickbuy: '⚡',
};

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ products, orders, categories }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const parseAmountNum = (amt: any): number => {
    if (typeof amt === 'number') return isNaN(amt) ? 0 : amt;
    if (!amt) return 0;
    const cleaned = String(amt).replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // ── Revenue & Order Metrics ───────────────────────────────
  const totalRevenue = orders
    .filter(o => o.status?.toLowerCase() !== 'cancelled')
    .reduce((sum, o) => sum + parseAmountNum(o.totalAmount), 0);

  const activeOrders = orders.filter(o => o.status?.toLowerCase() !== 'cancelled');
  const avgOrderValue = activeOrders.length > 0
    ? Math.round(totalRevenue / activeOrders.length)
    : 0;

  const ordersByStatus = {
    pending:   orders.filter(o => !o.status || o.status.toLowerCase() === 'pending' || o.status.toLowerCase() === 'processing').length,
    confirmed: orders.filter(o => o.status?.toLowerCase() === 'confirmed' || o.status?.toLowerCase() === 'packed').length,
    shipped:   orders.filter(o => o.status?.toLowerCase() === 'shipped' || o.status?.toLowerCase() === 'out for delivery').length,
    delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
    cancelled: orders.filter(o => o.status?.toLowerCase() === 'cancelled').length,
  };
  const totalOrders = orders.length;

  // ── Inventory ─────────────────────────────────────────────
  const inStock    = products.filter(p => Number(p.stock ?? 0) > 5).length;
  const lowStock   = products.filter(p => { const s = Number(p.stock ?? 0); return s > 0 && s <= 5; }).length;
  const outOfStock = products.filter(p => Number(p.stock ?? 0) === 0).length;
  const totalStock = products.reduce((sum, p) => sum + Number(p.stock ?? 0), 0);

  // ── Category Distribution ─────────────────────────────────
  const catCounts: Record<string, number> = {};
  products.forEach(p => {
    if (p.categoryId) catCounts[p.categoryId] = (catCounts[p.categoryId] || 0) + 1;
  });
  const sortedCats = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const STATUS_COLORS: Record<string, string> = {
    pending: C.warning, confirmed: C.primary, shipped: C.secondary,
    delivered: C.success, cancelled: C.danger,
  };

  const SectionHeader = ({ title, icon }: { title: string; icon: keyof typeof Ionicons.glyphMap }) => (
    <View style={aStyles.secHeader}>
      <Ionicons name={icon} size={16} color={C.primary} />
      <Text style={aStyles.secTitle}>{title}</Text>
    </View>
  );

  const EmptyState = ({ msg }: { msg: string }) => (
    <View style={aStyles.emptyBox}>
      <Ionicons name="analytics-outline" size={32} color={C.textDim} />
      <Text style={aStyles.emptyText}>{msg}</Text>
    </View>
  );

  return (
    <Animated.View style={{ opacity: fadeAnim }}>

      {/* Revenue Cards */}
      <SectionHeader title="Revenue Overview" icon="cash-outline" />
      <View style={aStyles.metricsRow}>
        <View style={aStyles.metricCard}>
          <View style={[aStyles.metricIcon, { backgroundColor: C.successDim }]}>
            <Ionicons name="cash-outline" size={18} color={C.success} />
          </View>
          <Text style={aStyles.metricValue}>₹{totalRevenue.toLocaleString()}</Text>
          <Text style={aStyles.metricLabel}>Total Revenue</Text>
          <Text style={aStyles.metricSub}>From delivered orders</Text>
        </View>
        <View style={aStyles.metricCard}>
          <View style={[aStyles.metricIcon, { backgroundColor: C.primaryDim }]}>
            <Ionicons name="receipt-outline" size={18} color={C.primary} />
          </View>
          <Text style={aStyles.metricValue}>{totalOrders}</Text>
          <Text style={aStyles.metricLabel}>Total Orders</Text>
          <Text style={aStyles.metricSub}>All time orders</Text>
        </View>
        <View style={aStyles.metricCard}>
          <View style={[aStyles.metricIcon, { backgroundColor: C.secondaryDim }]}>
            <Ionicons name="trending-up-outline" size={18} color={C.secondary} />
          </View>
          <Text style={aStyles.metricValue}>₹{avgOrderValue.toLocaleString()}</Text>
          <Text style={aStyles.metricLabel}>Avg. Order</Text>
          <Text style={aStyles.metricSub}>Per order value</Text>
        </View>
      </View>

      {/* Order Status Breakdown */}
      <SectionHeader title="Order Status Breakdown" icon="pie-chart-outline" />
      <View style={aStyles.card}>
        {totalOrders === 0 ? (
          <EmptyState msg="No orders yet. When customers place orders they'll appear here." />
        ) : (
          Object.entries(ordersByStatus).map(([status, count]) => (
            <MetricBar
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              value={count}
              total={totalOrders}
              color={STATUS_COLORS[status] || C.primary}
              count={count}
            />
          ))
        )}
      </View>

      {/* Inventory Health */}
      <SectionHeader title="Inventory Health" icon="cube-outline" />
      <View style={aStyles.card}>
        <MetricBar label="In Stock"     value={inStock}    total={products.length} color={C.success}  count={inStock} />
        <MetricBar label="Low Stock"    value={lowStock}   total={products.length} color={C.warning}  count={lowStock} />
        <MetricBar label="Out of Stock" value={outOfStock} total={products.length} color={C.danger}   count={outOfStock} />
        <View style={aStyles.divider} />
        <View style={aStyles.totalRow}>
          <Text style={aStyles.totalLabel}>Total Stock Units</Text>
          <Text style={aStyles.totalValue}>{totalStock.toLocaleString()}</Text>
        </View>
      </View>

      {/* Category Distribution */}
      <SectionHeader title="Category Distribution" icon="albums-outline" />
      <View style={aStyles.card}>
        {sortedCats.length === 0 ? (
          <EmptyState msg="No products categorized yet." />
        ) : (
          sortedCats.map(([catId, count]) => {
            const cat = categories.find(c => (c.categoryId || c.id) === catId);
            const name = cat?.name || catId;
            const emoji = CATEGORY_EMOJIS[catId] || '🏷️';
            return (
              <View key={catId} style={aStyles.catDistRow}>
                <Text style={aStyles.catEmoji}>{emoji}</Text>
                <View style={aStyles.catDistInfo}>
                  <View style={aStyles.catDistLabelRow}>
                    <Text style={aStyles.catDistName}>{name}</Text>
                    <Text style={aStyles.catDistCount}>{count} products</Text>
                  </View>
                  <View style={aStyles.barBg}>
                    <View
                      style={[
                        aStyles.barFill,
                        {
                          backgroundColor: C.primary,
                          width: `${products.length > 0 ? Math.min((count / products.length) * 100, 100) : 0}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={{ height: 28 }} />
    </Animated.View>
  );
};

const aStyles = StyleSheet.create({
  secHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: S.lg,
    marginBottom: S.sm,
  },
  secTitle: { color: C.textSecondary, fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },

  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: S.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: R.card,
    padding: S.md,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  metricIcon: {
    width: 34, height: 34, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: S.xs,
  },
  metricValue: { color: C.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 2 },
  metricLabel: { color: C.textSecondary, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  metricSub:   { color: C.textMuted, fontSize: 9, textAlign: 'center', marginTop: 2 },

  card: {
    backgroundColor: C.surface2,
    borderRadius: R.card,
    padding: S.lg,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: S.lg,
    gap: S.md,
  },
  barRow: { gap: 4 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { color: C.textSecondary, fontSize: 12, fontWeight: '600' },
  barCount: { fontSize: 12, fontWeight: '800' },
  barBg: { height: 6, backgroundColor: C.border2, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  barPct: { color: C.textMuted, fontSize: 10, textAlign: 'right' },
  divider: { height: 1, backgroundColor: C.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: C.textSecondary, fontSize: 13, fontWeight: '600' },
  totalValue: { color: C.textPrimary, fontSize: 15, fontWeight: '800' },

  catDistRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  catEmoji: { fontSize: 20, width: 28 },
  catDistInfo: { flex: 1, gap: 4 },
  catDistLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catDistName: { color: C.textPrimary, fontSize: 12, fontWeight: '700' },
  catDistCount: { color: C.textMuted, fontSize: 11 },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: S.xxl,
    gap: S.sm,
  },
  emptyText: { color: C.textMuted, fontSize: 13, textAlign: 'center', maxWidth: 240 },
});
