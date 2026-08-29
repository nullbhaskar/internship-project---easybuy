import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminProduct } from './adminTypes';

interface AdminProductsDirProps {
  products: AdminProduct[];
  onAddProduct: () => void;
  onEditProduct: (p: AdminProduct) => void;
  onDeleteProduct: (p: AdminProduct) => void;
}

export const AdminProductsDir: React.FC<AdminProductsDirProps> = ({ products, onAddProduct, onEditProduct, onDeleteProduct }) => {
  const [search, setSearch] = useState('');

  const mockProducts = [
    { id: '1', name: 'Aura Wireless Headphones', price: 129.00, stock: 45, status: 'Healthy', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100' },
    { id: '2', name: 'Nova Smartwatch', price: 249.00, stock: 12, status: 'Low Stock', img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100' },
    { id: '3', name: 'Apex Mechanical Keyboard', price: 189.00, stock: 84, status: 'Healthy', img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=100' }
  ];

  const [activeOptions, setActiveOptions] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'default' | 'priceAsc' | 'priceDesc' | 'nameAsc'>('default');

  const baseProducts = products && products.length > 0 ? products : mockProducts;
  
  const getPrice = (p: any) => parseFloat(String(p.price || p.priceNumber || 0).replace(/[^0-9.]/g, '')) || 0;
  const getName = (p: any) => (p.title || p.name || '').toLowerCase();

  const sortedProducts = useMemo(() => {
    if (sortMode === 'default') return baseProducts;
    return [...baseProducts].sort((a, b) => {
      if (sortMode === 'priceAsc') return getPrice(a) - getPrice(b);
      if (sortMode === 'priceDesc') return getPrice(b) - getPrice(a);
      if (sortMode === 'nameAsc') return getName(a).localeCompare(getName(b));
      return 0;
    });
  }, [baseProducts, sortMode]);

  const displayProducts = useMemo(() => {
    if (!search) return sortedProducts;
    const sLower = search.toLowerCase();
    return sortedProducts.filter(p => {
      const title = getName(p);
      return title.includes(sLower);
    });
  }, [sortedProducts, search]);

  const handleFilterPress = () => {
    if (sortMode === 'default') setSortMode('priceAsc');
    else if (sortMode === 'priceAsc') setSortMode('priceDesc');
    else if (sortMode === 'priceDesc') setSortMode('nameAsc');
    else setSortMode('default');
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="bag-handle" size={16} color="#3B82F6" />
        </View>
        <Text style={styles.headerTitle}>Products</Text>
        <View style={styles.textAvatar}>
          <Text style={styles.textAvatarChar}>A</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#94A3B8" style={{marginRight: 8}} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterBtn, sortMode !== 'default' && { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]} 
          onPress={handleFilterPress}
        >
          <Ionicons 
            name={sortMode === 'nameAsc' ? 'text' : (sortMode === 'priceDesc' ? 'arrow-down' : (sortMode === 'priceAsc' ? 'arrow-up' : 'options'))} 
            size={18} 
            color={sortMode !== 'default' ? '#3B82F6' : '#64748B'} 
          />
        </TouchableOpacity>
      </View>
    </>
  );

  const renderProduct = ({ item: p }: { item: any }) => {
    const isHealthy = Number(p.stock || 0) > 10;
    const imgUri = p.thumbnail || (p.images && p.images[0]) || p.imageUrl || p.image || p.img || 'https://via.placeholder.com/100';
    
    return (
      <View style={styles.productCard}>
        <Image source={{ uri: imgUri }} style={styles.productImg} />
        <View style={styles.productInfo}>
          <View style={styles.productTopRow}>
            <Text style={styles.productName} numberOfLines={1}>{p.title || p.name || 'Unnamed Product'}</Text>
            <TouchableOpacity onPress={() => setActiveOptions(activeOptions === p.id ? null : p.id)} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Ionicons name="ellipsis-vertical" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          
          {activeOptions === p.id && (
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 4, marginBottom: 4 }}>
              <TouchableOpacity onPress={() => { setActiveOptions(null); onEditProduct(p); }}>
                <Text style={{color: '#3B82F6', fontSize: 12, fontWeight: '600'}}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setActiveOptions(null); onDeleteProduct(p); }}>
                <Text style={{color: '#EF4444', fontSize: 12, fontWeight: '600'}}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.productPrice}>₹{(parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0).toFixed(2)}</Text>
          
          <View style={styles.productBottomRow}>
            <Text style={styles.stockText}>{p.stock || 0} in stock</Text>
            <View style={styles.dot} />
            <View style={isHealthy ? styles.statusHealthy : styles.statusLow}>
              <View style={isHealthy ? styles.statusDotGreen : styles.statusDotOrange} />
              <Text style={isHealthy ? styles.statusTextGreen : styles.statusTextOrange}>{isHealthy ? 'Healthy' : 'Low Stock'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={displayProducts}
        keyExtractor={(p) => p.id}
        renderItem={renderProduct}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={onAddProduct}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  filterBtn: { width: 40, height: 40, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  
  productCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 12 },
  productImg: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: '#F1F5F9' },
  productInfo: { flex: 1, justifyContent: 'space-between' },
  productTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { fontSize: 14, fontWeight: '600', color: '#0F172A', flex: 1, marginRight: 8 },
  productPrice: { fontSize: 13, fontWeight: '700', color: '#3B82F6', marginTop: 2 },
  
  productBottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  stockText: { fontSize: 11, color: '#64748B' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
  statusHealthy: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  statusTextGreen: { fontSize: 11, color: '#10B981', fontWeight: '500' },
  
  statusLow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDotOrange: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F59E0B' },
  statusTextOrange: { fontSize: 11, color: '#F59E0B', fontWeight: '500' },
  
  fab: { position: 'absolute', bottom: 100, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }
});
