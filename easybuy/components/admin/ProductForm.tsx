import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminCategory, AdminProduct } from './adminTypes';

interface ProductFormProps {
  categories: AdminCategory[];
  product: AdminProduct | null;
  loading: boolean;
  onSave: (product: AdminProduct) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  categories,
  product,
  loading,
  onSave,
  onCancel,
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Local state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [description, setDescription] = useState('');
  const [isQuickBuy, setIsQuickBuy] = useState(false);
  const [error, setError] = useState('');
  
  // Calculate discount percentage
  const mrpNum = parseFloat(mrp) || 0;
  const priceNum = parseFloat(price) || 0;
  const discountPercent = mrpNum > 0 && priceNum < mrpNum 
    ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) 
    : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    if (product) {
      setTitle(String(product.title || (product as any).name || ''));
      setPrice(String(product.price ?? (product as any).priceNumber ?? ''));
      setMrp(String(product.mrp ?? product.price ?? (product as any).priceNumber ?? ''));
      setStock(String(product.stock ?? 0));
      setBrand(String(product.brand || ''));
      setCategoryId(String(product.categoryId || ''));
      setCategoryName(String(product.categoryName || ''));
      setThumbnail(String(product.thumbnail || product.image || (product as any).imageUrl || ''));
      setDescription(String(product.description || ''));
      setIsQuickBuy(product.isQuickBuy ?? false);
    } else {
      if (categories.length > 0) {
        setCategoryId(String(categories[0].categoryId || categories[0].id || ''));
        setCategoryName(String(categories[0].name || ''));
      }
    }
  }, [product, categories]);

  const handleSubmit = () => {
    setError('');
    if (!title || !title.trim()) { setError('Product name is required.'); return; }
    if (!price.trim() || isNaN(priceNum)) { setError('Valid selling price is required.'); return; }
    if (!mrp.trim() || isNaN(mrpNum)) { setError('Valid MRP is required.'); return; }
    if (!stock.trim() || isNaN(Number(stock))) { setError('Valid stock quantity is required.'); return; }
    if (priceNum > mrpNum) { setError('Selling price cannot exceed MRP.'); return; }

    const selectedCat = categories.find(c => (c.categoryId || c.id) === categoryId);
    const resolvedCatName = selectedCat ? selectedCat.name : (categoryName || categoryId);

    onSave({
      id: product?.id || '',
      title: title.trim(),
      price: priceNum,
      mrp: mrpNum,
      stock: parseInt(stock, 10),
      brand: brand.trim(),
      categoryId,
      categoryName: resolvedCatName,
      thumbnail: thumbnail.trim(),
      image: thumbnail.trim(),
      description: description.trim(),
      isQuickBuy,
      createdAt: product?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <Modal visible={true} transparent={true} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalCard, { transform: [{ translateY: slideAnim }] }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <Ionicons name={product ? "create-outline" : "add-outline"} size={20} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.title}>{product ? 'Edit Product' : 'New Product'}</Text>
                <Text style={styles.subtitle}>{product ? 'Update product details' : 'Add to inventory'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Image Preview Area */}
            <View style={styles.imageSection}>
              {thumbnail ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: thumbnail }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.editImageBtn}>
                     <Ionicons name="camera-outline" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color="#94A3B8" />
                  <Text style={styles.placeholderText}>Add Product Image</Text>
                </View>
              )}
            </View>

            {error ? (
              <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '500' }}>{error}</Text>
              </View>
            ) : null}

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Premium Cotton T-Shirt"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Selling Price (₹) <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>MRP (₹) <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={mrp}
                  onChangeText={setMrp}
                />
              </View>
            </View>

            {discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Ionicons name="pricetag" size={14} color="#059669" />
                <Text style={styles.discountText}>{discountPercent}% discount auto-calculated</Text>
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Stock Qty <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={stock}
                  onChangeText={setStock}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Brand</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Nike"
                  placeholderTextColor="#94A3B8"
                  value={brand}
                  onChangeText={setBrand}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map(cat => {
                  const cId = cat.categoryId || cat.id;
                  const isActive = categoryId === cId;
                  return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                    onPress={() => setCategoryId(cId)}
                  >
                    <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                )})}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="#94A3B8"
                value={thumbnail}
                onChangeText={setThumbnail}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Product details..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>QuickBuy (10-20 min)</Text>
                <Text style={styles.switchSub}>Enable express delivery for this product</Text>
              </View>
              <Switch
                value={isQuickBuy}
                onValueChange={setIsQuickBuy}
                trackColor={{ false: '#E2E8F0', true: '#818CF8' }}
                thumbColor={isQuickBuy ? '#4F46E5' : '#FFFFFF'}
              />
            </View>

          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Product'}</Text>
            </TouchableOpacity>
          </View>
          
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 500,
    borderRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageWrapper: {
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editImageBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    marginTop: -8,
  },
  discountText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  switchSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
