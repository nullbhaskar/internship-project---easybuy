import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminOrder } from './adminTypes';

interface AdminOrdersProps {
  orders: AdminOrder[];
  onUpdateStatus?: (orderId: string, status: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onUpdateStatus }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const baseOrders = orders.length > 0 ? orders : [
    { id: '1', orderId: '#ORD-9021', userName: 'Alex Johnson', totalAmount: 129.00, status: 'Pending', createdAt: new Date().toISOString() },
    { id: '2', orderId: '#ORD-9022', userName: 'Sarah Smith', totalAmount: 249.00, status: 'Shipped', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '3', orderId: '#ORD-9023', userName: 'Mike Brown', totalAmount: 89.99, status: 'Delivered', createdAt: new Date(Date.now() - 172800000).toISOString() },
  ];

  const displayOrders = baseOrders.filter(o => {
    const matchesFilter = filter === 'All' || (o.status && o.status.toLowerCase() === filter.toLowerCase());
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
      (o.orderId && o.orderId.toLowerCase().includes(searchLower)) ||
      (o.userName && o.userName.toLowerCase().includes(searchLower)) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(searchLower));
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string = '') => {
    switch(status.toLowerCase()) {
      case 'pending': return { bg: '#FFF7ED', text: '#EA580C', dot: '#F59E0B' };
      case 'shipped': return { bg: '#EFF6FF', text: '#3B82F6', dot: '#3B82F6' };
      case 'delivered': return { bg: '#F0FDF4', text: '#16A34A', dot: '#10B981' };
      case 'cancelled': return { bg: '#FEF2F2', text: '#EF4444', dot: '#EF4444' };
      default: return { bg: '#F1F5F9', text: '#64748B', dot: '#94A3B8' };
    }
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="receipt" size={16} color="#3B82F6" />
        </View>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.textAvatar}>
          <Text style={styles.textAvatarChar}>A</Text>
        </View>
      </View>

      <Text style={styles.pageTitle}>Order Management</Text>
      <Text style={styles.pageSub}>Track and process customer orders.</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#94A3B8" style={{marginRight: 8}} />
          <TextInput
            placeholder="Search by ID or name..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>
        {['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map(f => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  const formatOrderDate = (createdAt: any) => {
    if (!createdAt) return 'Unknown date';
    // Firestore Timestamp object
    if (createdAt?.seconds) return new Date(createdAt.seconds * 1000).toLocaleDateString('en-IN');
    // ISO string
    if (typeof createdAt === 'string') return new Date(createdAt).toLocaleDateString('en-IN');
    return 'Unknown date';
  };

  const renderOrder = ({ item: o }: { item: any }) => {
    const colors = getStatusColor(o.status);
    const date = formatOrderDate(o.createdAt);
    const statusLower = (o.status || '').toLowerCase();
    
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.orderId}>{o.orderId || o.id}</Text>
            <Text style={styles.orderName}>{o.userName || o.userEmail || 'Guest User'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: colors.dot }]} />
            <Text style={[styles.statusText, { color: colors.text }]}>{o.status || 'Pending'}</Text>
          </View>
        </View>
        
        <View style={styles.orderDivider} />
        
        <View style={styles.orderBottom}>
          <View style={styles.orderMeta}>
            <Ionicons name="calendar-outline" size={14} color="#94A3B8" style={{marginRight: 4}} />
            <Text style={styles.orderMetaText}>{date}</Text>
          </View>
          <Text style={styles.orderTotal}>₹{(parseFloat(String(o.totalAmount).replace(/[^0-9.]/g, '')) || 0).toFixed(2)}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {statusLower !== 'shipped' && statusLower !== 'delivered' && statusLower !== 'cancelled' && (
            <TouchableOpacity 
              style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' }}
              onPress={() => onUpdateStatus && onUpdateStatus(o.id, 'Shipped')}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1D4ED8' }}>Mark Shipped</Text>
            </TouchableOpacity>
          )}
          {statusLower === 'shipped' && (
            <TouchableOpacity 
              style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#BBF7D0' }}
              onPress={() => onUpdateStatus && onUpdateStatus(o.id, 'Delivered')}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#15803D' }}>Mark Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={displayOrders}
        keyExtractor={(o) => o.id}
        renderItem={renderOrder}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
    </View>
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
  
  pageTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  pageSub: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  
  filterScroll: { flexGrow: 0, marginBottom: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  filterPillActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterTextActive: { color: '#FFFFFF' },
  
  orderCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 12 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  orderName: { fontSize: 13, color: '#64748B' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  
  orderDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderMeta: { flexDirection: 'row', alignItems: 'center' },
  orderMetaText: { fontSize: 12, color: '#94A3B8' },
  orderTotal: { fontSize: 15, fontWeight: '700', color: '#0F172A' }
});
