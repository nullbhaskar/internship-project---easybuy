import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminOrder } from './adminTypes';

interface AdminOrdersProps {
  orders: AdminOrder[];
  onUpdateStatus?: (orderId: string, status: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onUpdateStatus }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const baseOrders = orders.length > 0 ? orders : [];

  const displayOrders = baseOrders.filter(o => {
    const matchesFilter = filter === 'All' || (o.status && o.status.toLowerCase() === filter.toLowerCase());
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
      (o.orderId && o.orderId.toLowerCase().includes(searchLower)) ||
      (o.userName && o.userName.toLowerCase().includes(searchLower)) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(searchLower)) ||
      (o.shippingAddress?.fullName && o.shippingAddress.fullName.toLowerCase().includes(searchLower)) ||
      (o.address?.fullName && o.address.fullName.toLowerCase().includes(searchLower));
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string = '') => {
    switch(status.toLowerCase()) {
      case 'pending': return { bg: '#FFF7ED', text: '#EA580C', dot: '#F59E0B' };
      case 'processing': return { bg: '#F3E8FF', text: '#7E22CE', dot: '#9333EA' };
      case 'shipped': return { bg: '#EFF6FF', text: '#3B82F6', dot: '#3B82F6' };
      case 'delivered': return { bg: '#F0FDF4', text: '#16A34A', dot: '#10B981' };
      case 'cancelled': return { bg: '#FEF2F2', text: '#EF4444', dot: '#EF4444' };
      default: return { bg: '#F1F5F9', text: '#64748B', dot: '#94A3B8' };
    }
  };

  const getUserName = (o: any) => {
    if (o.shippingAddress?.fullName) return o.shippingAddress.fullName;
    if (o.address?.fullName) return o.address.fullName;
    if (o.userName && o.userName !== 'User') return o.userName;
    if (o.userEmail) return o.userEmail.split('@')[0];
    return 'Guest User';
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
        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(f => (
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
    if (createdAt?.seconds) return new Date(createdAt.seconds * 1000).toLocaleDateString('en-IN');
    if (typeof createdAt === 'string') return new Date(createdAt).toLocaleDateString('en-IN');
    return 'Unknown date';
  };

  const renderOrder = ({ item: o }: { item: any }) => {
    const colors = getStatusColor(o.status);
    const date = formatOrderDate(o.createdAt);
    
    return (
      <TouchableOpacity 
        style={styles.orderCard} 
        activeOpacity={0.7}
        onPress={() => setSelectedOrder(o)}
      >
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.orderId}>{o.orderId || o.id}</Text>
            <Text style={styles.orderName}>{getUserName(o)}</Text>
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
      </TouchableOpacity>
    );
  };

  const renderOrderDetailsModal = () => {
    if (!selectedOrder) return null;
    const colors = getStatusColor(selectedOrder.status);
    const date = formatOrderDate(selectedOrder.createdAt);
    const items = selectedOrder.items || selectedOrder.products || [];
    
    return (
      <Modal
        visible={!!selectedOrder}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setSelectedOrder(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {/* Top Info */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 }}>
                    {selectedOrder.orderId || selectedOrder.id}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#64748B' }}>{date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.bg, height: 28 }]}>
                  <View style={[styles.statusDot, { backgroundColor: colors.dot }]} />
                  <Text style={[styles.statusText, { color: colors.text }]}>{selectedOrder.status || 'Pending'}</Text>
                </View>
              </View>

              {/* Customer Details */}
              <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <Text style={styles.infoText}><Text style={styles.infoLabel}>Name:</Text> {getUserName(selectedOrder)}</Text>
                <Text style={styles.infoText}><Text style={styles.infoLabel}>Email:</Text> {selectedOrder.userEmail || 'N/A'}</Text>
                <Text style={styles.infoText}><Text style={styles.infoLabel}>Phone:</Text> {selectedOrder.shippingAddress?.phone || selectedOrder.phone || 'N/A'}</Text>
                
                <Text style={[styles.infoLabel, { marginTop: 12, marginBottom: 4 }]}>Shipping Address:</Text>
                <Text style={styles.infoText}>
                  {selectedOrder.shippingAddress ? (
                    `${selectedOrder.shippingAddress.street || ''}, ${selectedOrder.shippingAddress.city || ''}, ${selectedOrder.shippingAddress.state || ''} - ${selectedOrder.shippingAddress.pincode || ''}`
                  ) : selectedOrder.address ? (
                    typeof selectedOrder.address === 'object' ? 
                      `${selectedOrder.address.street || ''}, ${selectedOrder.address.city || ''}` : selectedOrder.address
                  ) : 'No address provided'}
                </Text>
              </View>

              {/* Items */}
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Items Ordered</Text>
              {items.map((item: any, i: number) => (
                <View key={i} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.title || item.name}</Text>
                    <Text style={styles.itemQty}>Qty: {item.quantity || 1}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{(item.price || 0) * (item.quantity || 1)}</Text>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₹{(parseFloat(String(selectedOrder.totalAmount).replace(/[^0-9.]/g, '')) || 0).toFixed(2)}</Text>
              </View>

              {/* Action Buttons */}
              <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Update Status</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => {
                  const isActive = selectedOrder.status === status;
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusBtn,
                        isActive && styles.statusBtnActive
                      ]}
                      onPress={() => {
                        if (onUpdateStatus && !isActive) {
                          onUpdateStatus(selectedOrder.id, status);
                          setSelectedOrder({ ...selectedOrder, status });
                        }
                      }}
                    >
                      <Text style={[
                        styles.statusBtnText,
                        isActive && styles.statusBtnTextActive
                      ]}>{status}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
        ListFooterComponent={
          displayOrders.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#94A3B8' }}>No orders found.</Text>
          ) : <View style={{ height: 120 }} />
        }
      />
      {renderOrderDetailsModal()}
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
  orderTotal: { fontSize: 15, fontWeight: '700', color: '#0F172A' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  closeBtn: { backgroundColor: '#F1F5F9', padding: 6, borderRadius: 20 },
  
  sectionBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoText: { fontSize: 14, color: '#334155', marginBottom: 6 },
  infoLabel: { fontWeight: '600', color: '#64748B' },
  
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  itemQty: { fontSize: 12, color: '#64748B' },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#3B82F6' },
  
  statusBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  statusBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  statusBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  statusBtnTextActive: { color: '#FFFFFF' },
});
