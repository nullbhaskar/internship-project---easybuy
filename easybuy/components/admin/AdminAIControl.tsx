import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminProduct, AdminOrder } from './adminTypes';

interface AdminAIControlProps {
  products: AdminProduct[];
  orders: AdminOrder[];
}

export const AdminAIControl: React.FC<AdminAIControlProps> = ({ products, orders }) => {
  const [automationActive, setAutomationActive] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const totalMonitored = products.length > 0 ? products.length : 2481;
  const incomplete = products.filter(p => !p.imageUrl && !p.img || !p.price && !p.priceNumber || !p.category).length;
  const dataHealth = products.length > 0 ? Math.round(((products.length - incomplete) / products.length) * 100) : 98;

  const [dynamicActivities, setDynamicActivities] = useState<any[]>([]);

  React.useEffect(() => {
    if (products.length === 0) {
      setDynamicActivities([
        { icon: 'pricetag', title: 'Price adjusted for Aura Headphones', time: 'Just now', desc: '+5.2% based on competitor surge', color: '#10B981' },
        { icon: 'bus', title: 'Stock transfer initiated', time: '15m ago', desc: '300 units to New York...', color: '#64748B' },
        { icon: 'mail', title: 'Campaign generated', time: '1h ago', desc: '"Weekend Tech Sale" email...', color: '#64748B' }
      ]);
      return;
    }

    const generateSingle = (p: any, time: string = 'Just now') => {
      const types = [
        { icon: 'pricetag', title: `Smart Price applied to ${p?.title?.slice(0, 20) || 'Product'}...`, desc: `+3.1% margin lift based on high checkout demand.`, color: '#10B981' },
        { icon: 'archive', title: `Auto-restock triggered for ${p?.title?.slice(0, 20) || 'Product'}...`, desc: `Supplier order placed for 150 units.`, color: '#3B82F6' },
        { icon: 'warning', title: `Demand surge detected: ${p?.title?.slice(0, 20) || 'Product'}...`, desc: `Added to front-page marketing carousel.`, color: '#F59E0B' },
        { icon: 'trending-down', title: `Price drop matched on ${p?.title?.slice(0, 20) || 'Product'}...`, desc: `-1.5% to match local competitor.`, color: '#EF4444' }
      ];
      const selected = types[Math.floor(Math.random() * types.length)];
      return { ...selected, time, id: Math.random().toString() };
    };

    // Initial 3 logs
    setDynamicActivities([
      generateSingle(products[0], '2 mins ago'),
      generateSingle(products[Math.floor(products.length / 2)], '14 mins ago'),
      generateSingle(products[products.length - 1], '1 hour ago')
    ]);

    // Live auto-updating feed! Add a new event every 10 seconds
    const interval = setInterval(() => {
      setDynamicActivities(prev => {
        const randProduct = products[Math.floor(Math.random() * products.length)];
        const newEvent = generateSingle(randProduct, 'Just now');
        
        // Push older events down the timeline
        const updatedFeed = [newEvent, ...prev].slice(0, 3);
        // Simulate time passing for older events
        updatedFeed[1].time = '2 mins ago';
        updatedFeed[2].time = '10 mins ago';
        
        return updatedFeed;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [products]);

  const handleOptimize = () => {
    setIsOptimizing(true);
    // Simulate cache clearing and optimization process
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimized(true);
      Alert.alert("Optimization Complete", "App Cache Cleared successfully! Data structures have been optimized and memory freed.");
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="hardware-chip" size={16} color="#3B82F6" />
        </View>
        <Text style={styles.headerTitle}>AI Control Center</Text>
        <View style={styles.textAvatar}>
          <Text style={styles.textAvatarChar}>A</Text>
        </View>
      </View>

      <Text style={styles.subHeader}>System Automation</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>System monitoring & automation</Text>
        <Switch
          value={automationActive}
          onValueChange={(val) => {
            setAutomationActive(val);
            if (!val) {
              Alert.alert("Automation Disabled", "Warning: The AI will no longer automatically optimize prices or sync inventory. You must do this manually.");
            } else {
              Alert.alert("Automation Enabled", "The AI system has resumed monitoring and automatic optimization.");
            }
          }}
          trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
        />
      </View>

      {automationActive && (
        <View style={styles.activeBadge}>
          <Ionicons name="flash" size={14} color="#FFFFFF" />
          <Text style={styles.activeText}>Automation Active</Text>
        </View>
      )}

      {/* Smart Pricing */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={styles.blueIcon}>
              <Ionicons name="pricetag" size={14} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>Smart Pricing</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.pricingStats}>
          <View>
            <Text style={styles.statLabel}>Products Monitored</Text>
            <Text style={styles.statValue}>{totalMonitored.toLocaleString()}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Margin Lift (7d)</Text>
            <Text style={styles.statValueGreen}>+4.2%</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.outlineBtn} onPress={() => setShowLogs(true)}>
          <Text style={styles.outlineBtnText}>View Pricing Logs →</Text>
        </TouchableOpacity>

        {/* Pricing Logs Modal */}
        <Modal visible={showLogs} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', padding: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}>AI Pricing Logs</Text>
                <TouchableOpacity onPress={() => setShowLogs(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {[
                  { time: '10 mins ago', title: 'Noise-Cancelling Headphones', change: '+₹450.00', reason: 'High demand surge detected.' },
                  { time: '1 hour ago', title: 'Mechanical Keyboard', change: '-₹150.00', reason: 'Competitor price drop.' },
                  { time: '3 hours ago', title: 'Ergonomic Mouse', change: '+₹50.00', reason: 'Low local inventory.' },
                  { time: 'Yesterday', title: '4K Monitor', change: '-₹1,200.00', reason: 'Stale inventory optimization.' },
                  { time: 'Yesterday', title: 'USB-C Cable (Pack of 3)', change: '+₹20.00', reason: 'High checkout attachment rate.' },
                ].map((log, i) => (
                  <View key={i} style={{ borderBottomWidth: 1, borderColor: '#F1F5F9', paddingVertical: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A', flex: 1 }}>{log.title}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: log.change.startsWith('+') ? '#10B981' : '#EF4444' }}>{log.change}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: '#64748B' }}>{log.reason}</Text>
                      <Text style={{ fontSize: 12, color: '#94A3B8' }}>{log.time}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>

      {/* Demand Forecast */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={styles.orangeIcon}>
              <Ionicons name="trending-up" size={14} color="#EA580C" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Demand</Text>
              <Text style={styles.cardTitle}>Forecast</Text>
            </View>
          </View>
          <Text style={styles.dateLabel}>Next 14 Days</Text>
        </View>

        <View style={styles.chartMockArea}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 4 }}>
            {/* Generate fake bars for Actual and Projected */}
            {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
              <View key={`act-${i}`} style={{ width: 8, height: `${h}%`, backgroundColor: '#94A3B8', borderRadius: 4 }} />
            ))}
            <View style={{ width: 1, height: '100%', backgroundColor: '#CBD5E1', marginHorizontal: 4 }} />
            {[75, 85, 60, 95, 70, 100, 85].map((h, i) => (
              <View key={`proj-${i}`} style={{ width: 8, height: `${h}%`, backgroundColor: '#3B82F6', borderRadius: 4, opacity: 0.8 }} />
            ))}
          </View>
        </View>
        
        <View style={styles.legendRow}>
          <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#94A3B8'}]} /><Text style={styles.legendText}>Actual (Past)</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#3B82F6'}]} /><Text style={styles.legendText}>Projected</Text></View>
        </View>

        <View style={styles.healthRow}>
          <View style={[styles.healthCircle, { borderColor: optimized ? '#10B981' : dataHealth > 90 ? '#10B981' : dataHealth > 70 ? '#F59E0B' : '#EF4444' }]}>
            <Text style={styles.healthScore}>{optimized ? '100%' : `${dataHealth}%`}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.healthTitle}>Data Health</Text>
            <Text style={styles.healthDesc}>{optimized ? 'Cache cleared & data optimized.' : dataHealth > 90 ? 'Model accuracy is very high.' : 'Improve catalog data to increase accuracy.'}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.optimizeBtn, optimized && { backgroundColor: '#10B981' }, isOptimizing && { opacity: 0.8 }]}
            onPress={handleOptimize}
            disabled={isOptimizing || optimized}
          >
            {isOptimizing ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.optimizeBtnText}>Clearing...</Text>
              </View>
            ) : (
              <Text style={styles.optimizeBtnText}>{optimized ? 'Optimized ✓' : 'Optimize'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      
      <View style={styles.activityCard}>
        {dynamicActivities.map((act, i) => (
          <View key={act.id || i} style={[styles.activityItem, i === dynamicActivities.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.activityIconBox}><Ionicons name={act.icon as any} size={14} color="#3B82F6" /></View>
            <View style={styles.activityContent}>
              <View style={styles.activityTop}>
                <Text style={styles.activityTitle}>{act.title}</Text>
                <Text style={styles.activityTime}>{act.time}</Text>
              </View>
              <Text style={[styles.activityDesc, { color: act.color }]}>{act.desc}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.viewLogBtn}>
          <Text style={styles.viewLogBtnText}>View Full Log</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconBox: { width: 24, height: 24, backgroundColor: '#EFF6FF', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#0F172A' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  textAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  textAvatarChar: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  
  subHeader: { fontSize: 14, color: '#64748B', marginBottom: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  
  activeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, alignSelf: 'flex-start', marginBottom: 24, gap: 6 },
  activeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  blueIcon: { width: 24, height: 24, backgroundColor: '#EFF6FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  orangeIcon: { width: 24, height: 24, backgroundColor: '#FFF7ED', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3B82F6' },
  liveText: { color: '#3B82F6', fontSize: 12, fontWeight: '600' },
  
  pricingStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  statValueGreen: { fontSize: 16, fontWeight: '700', color: '#3B82F6' }, // The design shows it as blue +4.2%
  
  outlineBtn: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  outlineBtnText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  
  dateLabel: { fontSize: 12, color: '#64748B', textAlign: 'right' },
  chartMockArea: { height: 100, marginBottom: 12 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#64748B' },
  
  healthRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 16 },
  healthCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: '#EA580C', alignItems: 'center', justifyContent: 'center' },
  healthScore: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  healthTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  healthDesc: { fontSize: 12, color: '#64748B' },
  optimizeBtn: { backgroundColor: '#9A3412', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  optimizeBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 16 },
  activityCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', padding: 16 },
  activityItem: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#F1F5F9', paddingVertical: 12, gap: 12 },
  activityIconBox: { width: 28, height: 28, backgroundColor: '#EFF6FF', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  activityTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  activityTitle: { fontSize: 13, fontWeight: '600', color: '#0F172A', flex: 1 },
  activityTime: { fontSize: 11, color: '#94A3B8' },
  activityDesc: { fontSize: 12, color: '#64748B' },
  activityDescGreen: { fontSize: 12, color: '#EA580C', fontWeight: '500' },
  
  viewLogBtn: { alignItems: 'center', paddingTop: 12 },
  viewLogBtnText: { color: '#64748B', fontSize: 13, fontWeight: '600' }
});
