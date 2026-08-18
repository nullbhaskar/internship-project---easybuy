import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, S } from './adminTheme';
import { AdminOrder, AdminProduct, AdminSection } from './adminTypes';

interface AdminDashboardProps {
  products: AdminProduct[];
  orders: AdminOrder[];
  categories: { id: string; name?: string; categoryId?: string }[];
  onNavigate: (section: AdminSection) => void;
  onAddProduct: () => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  accent: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, accent, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (!onPress) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.statOuter} disabled={!onPress}>
      <Animated.View style={[styles.statCard, { transform: [{ scale }] }]}>
        <View style={[styles.statIconWrap, { backgroundColor: `${accent}22` }]}>
          <Ionicons name={icon} size={20} color={accent} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statSub} numberOfLines={1}>{subtitle}</Text>
        {onPress && (
          <View style={styles.statArrow}>
            <Ionicons name="arrow-forward" size={11} color={accent} />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products, orders, categories, onNavigate, onAddProduct,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const parseAmountNum = (amt: any): number => {
    if (typeof amt === 'number') return isNaN(amt) ? 0 : amt;
    if (!amt) return 0;
    const cleaned = String(amt).replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Compute stats from real data
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => !o.status || o.status.toLowerCase() === 'pending' || o.status.toLowerCase() === 'processing').length;
  const deliveredOrders = orders.filter(o => o.status?.toLowerCase() === 'delivered').length;
  const lowStock = products.filter(p => { const s = Number(p.stock ?? 0); return s > 0 && s <= 5; }).length;
  const outOfStock = products.filter(p => Number(p.stock ?? 0) === 0).length;
  const revenue = orders
    .filter(o => o.status?.toLowerCase() !== 'cancelled')
    .reduce((sum, o) => sum + parseAmountNum(o.totalAmount), 0);

  // Top categories by product count
  const catCounts: Record<string, number> = {};
  products.forEach(p => {
    if (p.categoryId) catCounts[p.categoryId] = (catCounts[p.categoryId] || 0) + 1;
  });
  const topCats = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  // Low stock alerts
  const lowStockItems = products
    .filter(p => Number(p.stock ?? 0) <= 5)
    .slice(0, 4);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    pending:   { color: C.warning,   bg: C.warningDim,   label: 'Pending' },
    confirmed: { color: C.primary,   bg: C.primaryDim,   label: 'Confirmed' },
    shipped:   { color: C.secondary, bg: C.secondaryDim, label: 'Shipped' },
    delivered: { color: C.success,   bg: C.successDim,   label: 'Delivered' },
    cancelled: { color: C.danger,    bg: C.dangerDim,    label: 'Cancelled' },
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {/* Greeting Banner */}
      <View style={styles.greetBanner}>
        <View>
          <Text style={styles.greetText}>{greeting}, Admin 👋</Text>
          <Text style={styles.greetSub}>Here's what's happening in your store today.</Text>
        </View>
        <View style={styles.greetBadge}>
          <Ionicons name="storefront" size={18} color={C.primary} />
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionLabel}>STORE OVERVIEW</Text>
      <View style={styles.statsGrid}>
        <StatCard title="Products"   value={totalProducts}                 subtitle="Total catalog"      icon="cube-outline"           accent={C.primary}   onPress={() => onNavigate('products')} />
        <StatCard title="Categories" value={totalCategories}               subtitle="Active categories"  icon="albums-outline"         accent={C.violet}    onPress={() => onNavigate('categories')} />
        <StatCard title="Orders"     value={totalOrders}                   subtitle="All time"           icon="receipt-outline"        accent={C.secondary} onPress={() => onNavigate('orders')} />
        <StatCard title="Revenue"    value={`₹${revenue.toLocaleString()}`} subtitle="From delivered"    icon="cash-outline"           accent={C.success} />
        <StatCard title="Low Stock"  value={lowStock}                      subtitle="Needs attention"    icon="warning-outline"        accent={C.warning} />
        <StatCard title="Out of Stock" value={outOfStock}                  subtitle="Restock required"   icon="alert-circle-outline"   accent={C.danger} />
        <StatCard title="Pending"    value={pendingOrders}                 subtitle="Awaiting action"    icon="time-outline"           accent={C.warning}   onPress={() => onNavigate('orders')} />
        <StatCard title="Delivered"  value={deliveredOrders}               subtitle="Completed orders"   icon="checkmark-circle-outline" accent={C.success} />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
      <View style={styles.quickGrid}>
        {[
          { label: 'Add Product',  icon: 'add-circle' as const,     color: C.primary,   bg: C.primaryDim,   action: onAddProduct },
          { label: 'Products',     icon: 'cube' as const,            color: C.secondary, bg: C.secondaryDim, action: () => onNavigate('products') },
          { label: 'Orders',       icon: 'receipt' as const,         color: C.warning,   bg: C.warningDim,   action: () => onNavigate('orders') },
          { label: 'Analytics',    icon: 'bar-chart' as const,       color: C.success,   bg: C.successDim,   action: () => onNavigate('analytics') },
        ].map(item => (
          <TouchableOpacity key={item.label} style={[styles.quickCard, { backgroundColor: item.bg }]} onPress={item.action} activeOpacity={0.8}>
            <View style={[styles.quickIconWrap, { backgroundColor: `${item.color}22` }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={[styles.quickLabel, { color: item.color }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Inventory Alerts */}
      {lowStockItems.length > 0 && (
        <>
          <View style={styles.rowHeader}>
            <Text style={styles.sectionLabel}>INVENTORY ALERTS</Text>
            <TouchableOpacity onPress={() => onNavigate('products')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.alertCard}>
            {lowStockItems.map((p, i) => {
              const stock = Number(p.stock ?? 0);
              const isOut = stock === 0;
              return (
                <View key={p.id} style={[styles.alertRow, i > 0 && styles.alertBorder]}>
                  <View style={[styles.alertDot, { backgroundColor: isOut ? C.danger : C.warning }]} />
                  <Text style={styles.alertName} numberOfLines={1}>
                    {p.title || p.name || 'Unnamed'}
                  </Text>
                  <View style={[styles.alertBadge, { backgroundColor: isOut ? C.dangerDim : C.warningDim }]}>
                    <Text style={[styles.alertBadgeText, { color: isOut ? C.danger : C.warning }]}>
                      {isOut ? 'Out of Stock' : `${stock} left`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <>
          <View style={styles.rowHeader}>
            <Text style={styles.sectionLabel}>RECENT ORDERS</Text>
            <TouchableOpacity onPress={() => onNavigate('orders')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ordersCard}>
            {recentOrders.map((order, i) => {
              const sc = STATUS_CONFIG[order.status || 'pending'] || STATUS_CONFIG.pending;
              return (
                <View key={order.id} style={[styles.orderRow, i > 0 && styles.orderBorder]}>
                  <View style={styles.orderLeft}>
                    <Text style={styles.orderIdText}>#{order.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderCustomer} numberOfLines={1}>
                      {order.userName || order.userEmail || 'Customer'}
                    </Text>
                  </View>
                  <View style={styles.orderMid}>
                    <Text style={styles.orderAmount}>₹{Number(order.totalAmount ?? 0).toLocaleString()}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Top Categories */}
      {topCats.length > 0 && (
        <>
          <View style={styles.rowHeader}>
            <Text style={styles.sectionLabel}>TOP CATEGORIES</Text>
            <TouchableOpacity onPress={() => onNavigate('categories')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.catCard}>
            {topCats.map(([catId, count], i) => {
              const cat = categories.find(c => (c.categoryId || c.id) === catId);
              const name = cat?.name || catId;
              const emoji = CATEGORY_EMOJIS[catId] || '🏷️';
              const pct = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
              return (
                <View key={catId} style={[styles.catRow, i > 0 && styles.catBorder]}>
                  <Text style={styles.catEmoji}>{emoji}</Text>
                  <View style={styles.catInfo}>
                    <Text style={styles.catName}>{name}</Text>
                    <View style={styles.catBarBg}>
                      <View style={[styles.catBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: C.primary }]} />
                    </View>
                  </View>
                  <Text style={styles.catCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      <View style={{ height: S.xxl }} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  greetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.primaryDim,
    borderRadius: R.card,
    padding: S.lg,
    marginBottom: S.lg,
    borderWidth: 1,
    borderColor: C.primaryGlow,
  },
  greetText: { color: C.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 3 },
  greetSub:  { color: C.textSecondary, fontSize: 12 },
  greetBadge: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: C.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: S.sm,
    marginTop: S.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: S.lg,
  },
  statOuter: { width: '47.5%' },
  statCard: {
    backgroundColor: C.surface2,
    borderRadius: R.card,
    padding: S.lg,
    borderWidth: 1,
    borderColor: C.border,
    minHeight: 110,
  },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: S.sm,
  },
  statValue: { color: C.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statTitle: { color: C.textSecondary, fontSize: 12, fontWeight: '700' },
  statSub:   { color: C.textMuted, fontSize: 10, marginTop: 2 },
  statArrow: { position: 'absolute', top: S.sm, right: S.sm },

  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: S.lg,
  },
  quickCard: {
    flex: 1,
    borderRadius: R.card2,
    padding: S.md,
    alignItems: 'center',
    gap: S.xs,
    borderWidth: 1,
    borderColor: C.border,
  },
  quickIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  quickLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },

  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: S.sm,
    marginTop: S.sm,
  },
  viewAll: { color: C.primary, fontSize: 11, fontWeight: '700' },

  alertCard: {
    backgroundColor: C.surface2,
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: S.lg,
    overflow: 'hidden',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingVertical: S.md,
    paddingHorizontal: S.lg,
  },
  alertBorder: { borderTopWidth: 1, borderTopColor: C.border },
  alertDot:   { width: 8, height: 8, borderRadius: 4 },
  alertName:  { color: C.textPrimary, fontSize: 13, fontWeight: '600', flex: 1 },
  alertBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.badge },
  alertBadgeText: { fontSize: 11, fontWeight: '700' },

  ordersCard: {
    backgroundColor: C.surface2,
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: S.lg,
    overflow: 'hidden',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: S.md,
    paddingHorizontal: S.lg,
    gap: S.sm,
  },
  orderBorder:    { borderTopWidth: 1, borderTopColor: C.border },
  orderLeft:      { flex: 1 },
  orderIdText:    { color: C.textPrimary, fontSize: 12, fontWeight: '800' },
  orderCustomer:  { color: C.textMuted, fontSize: 11, marginTop: 1 },
  orderMid:       { alignItems: 'flex-end', marginRight: S.sm },
  orderAmount:    { color: C.success, fontSize: 13, fontWeight: '800' },
  orderDate:      { color: C.textMuted, fontSize: 10, marginTop: 1 },
  statusBadge:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: R.badge },
  statusText:     { fontSize: 10, fontWeight: '700' },

  catCard: {
    backgroundColor: C.surface2,
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: S.lg,
    overflow: 'hidden',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: S.md,
    paddingHorizontal: S.lg,
    gap: S.sm,
  },
  catBorder: { borderTopWidth: 1, borderTopColor: C.border },
  catEmoji:  { fontSize: 20, width: 28 },
  catInfo:   { flex: 1, gap: 4 },
  catName:   { color: C.textPrimary, fontSize: 12, fontWeight: '700' },
  catBarBg:  { height: 4, backgroundColor: C.border2, borderRadius: 2, overflow: 'hidden' },
  catBarFill:{ height: 4, borderRadius: 2 },
  catCount:  { color: C.textSecondary, fontSize: 13, fontWeight: '800', minWidth: 36, textAlign: 'right' },
});
