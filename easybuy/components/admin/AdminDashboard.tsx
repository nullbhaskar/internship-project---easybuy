import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { AdminOrder, AdminProduct } from './adminTypes';

interface AdminDashboardProps {
  products: AdminProduct[];
  orders: AdminOrder[];
  categories: any[];
  onNavigate: (s: any) => void;
  onAddProduct: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, orders, onNavigate }) => {
  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })}`;
  };
  const validOrders = orders.filter(o => {
    const s = o.status?.toLowerCase() || '';
    return s !== 'cancelled' && s !== 'canceled' && s !== 'returned';
  });
  const totalRevenue = validOrders.reduce((sum, o) => sum + (parseFloat(String(o.totalAmount).replace(/[^0-9.]/g, '')) || 0), 0);
  const lowStockCount = products.filter(p => Number(p.stock || 0) <= 5).length;
  const uniqueClients = new Set(orders.map(o => o.userEmail || o.userId)).size;

  const displayRevenue = orders.length > 0 ? totalRevenue : 33380;
  const displayOrdersCount = orders.length > 0 ? orders.length : 5;
  const displayClientsCount = uniqueClients > 0 ? uniqueClients : 2;
  const displayLowStockCount = products.length > 0 ? lowStockCount : 1;

  const [chartMode, setChartMode] = useState<'7 Days' | '30 Days' | '12 Months'>('7 Days');
  const [selectedChartIndex, setSelectedChartIndex] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState<number>(300);

  // Chart Data Calculation
  let chartData: number[] = [];
  let labels: string[] = [];

  if (chartMode === '7 Days') {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    chartData = last7Days.map(date => {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      const dayOrders = validOrders.filter(o => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt); return d >= start && d <= end;
      });
      return dayOrders.reduce((sum, o) => sum + (parseFloat(String(o.totalAmount).replace(/[^0-9.]/g, '')) || 0), 0);
    });
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    labels = last7Days.map(d => daysOfWeek[d.getDay()]);
  } else if (chartMode === '30 Days') {
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d;
    });
    chartData = last30Days.map(date => {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      const dayOrders = validOrders.filter(o => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt); return d >= start && d <= end;
      });
      return dayOrders.reduce((sum, o) => sum + (parseFloat(String(o.totalAmount).replace(/[^0-9.]/g, '')) || 0), 0);
    });
    labels = last30Days.map(d => d.getDate().toString());
  } else {
    const last12Months = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return d;
    });
    chartData = last12Months.map(date => {
      const m = date.getMonth();
      const y = date.getFullYear();
      const monthOrders = validOrders.filter(o => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt); return d.getMonth() === m && d.getFullYear() === y;
      });
      return monthOrders.reduce((sum, o) => sum + (parseFloat(String(o.totalAmount).replace(/[^0-9.]/g, '')) || 0), 0);
    });
    const monthNames = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    labels = last12Months.map(d => monthNames[d.getMonth()]);
  }

  // Fallback if empty database
  if (orders.length === 0) {
    if (chartMode === '7 Days') chartData = [1200, 2100, 1800, 3200, 2800, 4100, 3800];
    if (chartMode === '30 Days') chartData = Array.from({ length: 30 }).map(() => 500 + Math.random() * 2000);
    if (chartMode === '12 Months') chartData = [15, 18, 12, 22, 28, 25, 30, 35, 32, 40, 45, 50].map(k => k * 1000);
  }

  const maxChartValue = Math.max(...chartData) || 1;

  const cycleChartMode = () => {
    if (chartMode === '7 Days') setChartMode('30 Days');
    else if (chartMode === '30 Days') setChartMode('12 Months');
    else setChartMode('7 Days');
  };

  // Insights Calculation
  let salesInsight = { title: "Demand spike detected", desc: "Category seeing 45% lift in your top region." };
  if (orders.length > 0) {
    if (validOrders.length > 10) {
      salesInsight = { title: "High Order Volume", desc: `You have ${validOrders.length} successful orders. Keep it up!` };
    } else if (validOrders.length > 0) {
      salesInsight = { title: "Recent Sales Activity", desc: `You have ${validOrders.length} order(s) placed recently.` };
    } else {
      salesInsight = { title: "Waiting for first sale", desc: "Share your store link to start getting orders." };
    }
  }

  let productInsight = { title: "3 products missing meta", desc: "Affecting SEO visibility. Auto-generate with AI?", hasFix: true, action: 'products' };
  if (products.length > 0) {
    const lowStockItems = products.filter(p => Number(p.stock || 0) <= 5);
    const missingImages = products.filter(p => !p.imageUrl && !p.img);
    
    if (lowStockItems.length > 0) {
      productInsight = { 
        title: `${lowStockItems.length} items running low`, 
        desc: "Products have 5 or less units left in stock.", 
        hasFix: true,
        action: 'stock'
      };
    } else if (missingImages.length > 0) {
      productInsight = { 
        title: `${missingImages.length} items missing images`, 
        desc: "Products without images have lower conversion rates.", 
        hasFix: true,
        action: 'products'
      };
    } else {
      productInsight = { 
        title: "Catalog looks healthy", 
        desc: "All your products are well-stocked and optimized.", 
        hasFix: false,
        action: 'products'
      };
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="grid" size={16} color="#3B82F6" />
        </View>
        <Text style={styles.headerTitle}>Overview</Text>
        <View style={styles.textAvatar}>
          <Text style={styles.textAvatarChar}>A</Text>
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greetText}>Good morning,</Text>
          <Text style={styles.greetName}>Admin</Text>
        </View>
        <View style={styles.nominalBadge}>
          <View style={styles.nominalDot} />
          <Text style={styles.nominalText}>Systems Nominal</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => onNavigate('orders')}>
          <View style={styles.statTop}>
            <Ionicons name="cash-outline" size={18} color="#64748B" />
            <Text style={styles.statTrendUp}>↑ 14%</Text>
          </View>
          <Text style={styles.statValue}>{formatCurrency(displayRevenue)}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => onNavigate('orders')}>
          <View style={styles.statTop}>
            <Ionicons name="cart-outline" size={18} color="#64748B" />
            <Text style={styles.statTrendUp}>↑ 8%</Text>
          </View>
          <Text style={styles.statValue}>{displayOrdersCount}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => onNavigate('orders')}>
          <View style={styles.statTop}>
            <Ionicons name="people-outline" size={18} color="#64748B" />
            <Text style={styles.statTrendUp}>↑ 12%</Text>
          </View>
          <Text style={styles.statValue}>{displayClientsCount}</Text>
          <Text style={styles.statLabel}>Active Customers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => onNavigate('stock')}>
          <View style={styles.statTop}>
            <Ionicons name="warning-outline" size={18} color="#EF4444" />
            <Text style={styles.statTrendDown}>Alert</Text>
          </View>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{displayLowStockCount}</Text>
          <Text style={[styles.statLabel, { color: '#EF4444' }]}>Low Stock Items</Text>
        </TouchableOpacity>
      </View>

      {/* Smooth Curved SVG Graph */}
      <View style={[styles.chartCard, { padding: 0 }]} onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
        <View style={{ padding: 20, paddingBottom: 0 }}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Revenue ({chartMode})</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 4 }}>
                {formatCurrency(totalRevenue)}
              </Text>
            </View>
            <TouchableOpacity onPress={cycleChartMode} hitSlop={{top:10, bottom:10, left:10, right:10}} style={{ backgroundColor: '#F1F5F9', padding: 8, borderRadius: 20 }}>
              <Ionicons name="filter" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 180, marginTop: 10 }}>
          {/* Background Grid Lines */}
          <View style={{ position: 'absolute', top: 10, bottom: 30, left: 20, right: 20, justifyContent: 'space-between' }}>
            {[1, 2, 3, 4].map((_, i) => (
              <View key={i} style={{ height: 1, backgroundColor: '#F1F5F9', width: '100%' }} />
            ))}
          </View>

          {/* Flow Line Graph */}
          <View style={{ flex: 1, position: 'relative' }}>
            {(() => {
              if (chartData.length === 0 || chartWidth <= 0) return null;
              
              const chartH = 130;
              const points = chartData.map((val, i) => {
                const heightPct = maxChartValue > 0 ? (val / maxChartValue) : 0;
                return {
                  x: 20 + i * ((chartWidth - 40) / Math.max(1, chartData.length - 1)),
                  y: 10 + chartH - (heightPct * chartH),
                  val,
                  index: i
                };
              });

              let pathD = `M ${points[0].x},${points[0].y}`;
              for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                const cp1x = prev.x + (curr.x - prev.x) / 2;
                const cp1y = prev.y;
                const cp2x = prev.x + (curr.x - prev.x) / 2;
                const cp2y = curr.y;
                pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
              }
              const areaPathD = `${pathD} L ${points[points.length - 1].x},${10 + chartH} L ${points[0].x},${10 + chartH} Z`;

              const is30Days = chartMode === '30 Days';

              return (
                <>
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                    <Svg width="100%" height="100%">
                      <Defs>
                        <SvgLinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.3" />
                          <Stop offset="1" stopColor="#3B82F6" stopOpacity="0.0" />
                        </SvgLinearGradient>
                      </Defs>
                      <Path d={areaPathD} fill="url(#gradient)" />
                      <Path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>

                  {/* Data Dots & Touch Areas */}
                  {points.map((p) => {
                    const isSelected = selectedChartIndex === p.index;
                    return (
                      <View key={`dot-${p.index}`} style={{ position: 'absolute', left: p.x - 15, top: p.y - 15, width: 30, height: 180 - p.y, zIndex: 2, alignItems: 'center' }}>
                        {/* The Dot */}
                        <TouchableOpacity 
                          activeOpacity={0.8}
                          onPress={() => setSelectedChartIndex(p.index === selectedChartIndex ? null : p.index)}
                          style={{
                            width: isSelected ? 12 : 8,
                            height: isSelected ? 12 : 8,
                            borderRadius: 6,
                            backgroundColor: isSelected ? '#2563EB' : '#FFFFFF',
                            borderWidth: 2,
                            borderColor: '#3B82F6',
                            shadowColor: '#2563EB',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4,
                            marginTop: 15 - (isSelected ? 6 : 4)
                          }}
                        />
                        
                        {/* Label */}
                        {(!is30Days || p.index % 5 === 0) && (
                          <Text style={{ position: 'absolute', bottom: 10, fontSize: is30Days ? 8 : 10, color: isSelected ? '#0F172A' : '#94A3B8', fontWeight: isSelected ? '700' : '500' }}>
                            {labels[p.index]}
                          </Text>
                        )}

                        {/* Tooltip */}
                        {isSelected && (
                          <View style={{ position: 'absolute', top: -30, backgroundColor: '#0F172A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 10 }}>
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{formatCurrency(p.val)}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </>
              );
            })()}
          </View>
        </View>
      </View>

      {/* Insights */}
      <Text style={styles.sectionTitle}>✦ Recent Insights</Text>
      
      <View style={styles.insightCard}>
        <View style={[styles.insightIconBox, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="trending-up" size={18} color="#3B82F6" />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{salesInsight.title}</Text>
          <Text style={styles.insightDesc}>{salesInsight.desc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
      </View>

      <View style={styles.insightCard}>
        <View style={[styles.insightIconBox, { backgroundColor: productInsight.hasFix ? '#FEF2F2' : '#F0FDF4' }]}>
          <Ionicons name={productInsight.hasFix ? "alert" : "checkmark-circle"} size={18} color={productInsight.hasFix ? "#EF4444" : "#22C55E"} />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{productInsight.title}</Text>
          <Text style={styles.insightDesc}>{productInsight.desc}</Text>
        </View>
        {productInsight.hasFix && (
          <TouchableOpacity onPress={() => onNavigate(productInsight.action)} style={styles.fixBtn}>
            <Text style={styles.fixBtnText}>Fix</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: { width: 24, height: 24, backgroundColor: '#EFF6FF', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#0F172A' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  textAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  textAvatarChar: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  greeting: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetText: {
    fontSize: 14,
    color: '#64748B',
  },
  greetName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  nominalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
  },
  nominalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  nominalText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTrendUp: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  statTrendDown: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  chartMockArea: {
    height: 120,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartXLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  insightIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  insightDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  fixBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  fixBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});
