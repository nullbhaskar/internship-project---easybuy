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
import { C, R, S } from './adminTheme';
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
  const [title,       setTitle]       = useState('');
  const [price,       setPrice]       = useState('');
  const [mrp,         setMrp]         = useState('');
  const [stock,       setStock]       = useState('');
  const [categoryId,  setCategoryId]  = useState('');
  const [brand,       setBrand]       = useState('');
  const [thumbnail,   setThumbnail]   = useState('');
  const [description, setDescription] = useState('');
  const [isQuick,     setIsQuick]     = useState(false);
  const [error,       setError]       = useState('');
  const [imgFailed,   setImgFailed]   = useState(false);

  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8,   useNativeDriver: true }),
    ]).start();
  }, []);

  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (product) {
      setTitle(product.title || product.name || '');
      setPrice(product.price?.toString() || '');
      setMrp(product.mrp?.toString() || '');
      setStock(product.stock?.toString() || '');
      setCategoryId(product.categoryId || '');
      setCategoryName(product.categoryName || '');
      setBrand(product.brand || '');
      setThumbnail(product.thumbnail || product.image || (product.images && product.images[0]) || '');
      setDescription(product.description || product.longDescription || '');
      setIsQuick(!!(product.isQuickDelivery || product.isQuickBuy));
    } else {
      setTitle(''); setPrice(''); setMrp(''); setStock('');
      setCategoryId(''); setCategoryName(''); setBrand(''); setThumbnail('');
      setDescription(''); setIsQuick(false);
    }
    setError(''); setImgFailed(false);
  }, [product]);

  const priceNum = Number(price);
  const mrpNum   = Number(mrp);
  const discount = mrpNum > 0 && priceNum > 0 && mrpNum > priceNum
    ? Math.round(((mrpNum - priceNum) / mrpNum) * 100)
    : 0;

  const handleSubmit = () => {
    setError('');
    if (!title.trim())                           { setError('Product name is required.'); return; }
    if (!price.trim() || isNaN(priceNum))        { setError('Valid selling price is required.'); return; }
    if (!mrp.trim()   || isNaN(mrpNum))          { setError('Valid MRP is required.'); return; }
    if (!stock.trim() || isNaN(Number(stock)))   { setError('Valid stock quantity is required.'); return; }
    if (priceNum > mrpNum)                       { setError('Selling price cannot exceed MRP.'); return; }

    const selectedCat = categories.find(c => (c.categoryId || c.id) === categoryId);
    const resolvedCatName = selectedCat ? selectedCat.name : (categoryName || categoryId);

    const img = thumbnail.trim();

    onSave({
      id:                 product?.id || '',
      productId:          product?.id || (product as any)?.productId || '',
      title:              title.trim(),
      name:               title.trim(),
      shortTitle:         title.trim(),
      brand:              brand.trim(),
      price:              priceNum,
      priceNum:           priceNum,
      priceNumber:        priceNum,
      mrp:                mrpNum,
      originalPrice:      `₹${mrpNum}`,
      originalPriceNum:   mrpNum,
      discountPct:        discount > 0 ? `${discount}% OFF` : '',
      discountPercentage: discount,
      stock:              Number(stock),
      stockStatus:        Number(stock) > 5 ? 'In Stock' : Number(stock) > 0 ? 'Low Stock' : 'Out of Stock',
      categoryId:         categoryId.trim(),
      categoryName:       (resolvedCatName || categoryId).trim(),
      thumbnail:          img,
      image:              img,
      imageUrl:           img,
      images:             img ? [img] : [],
      description:        description.trim(),
      longDescription:    description.trim(),
      stateId:            product?.stateId || (product as any)?.stateId || 'HR',
      stateName:          product?.stateName || (product as any)?.stateName || 'Haryana',
      city:               product?.city || (product as any)?.city || 'Gurugram',
      locality:           product?.locality || (product as any)?.locality || '',
      isQuickDelivery:    isQuick,
      isQuickBuy:         isQuick,
      updatedAt:          new Date().toISOString(),
      createdAt:          product?.createdAt || new Date().toISOString(),
    });
  };

  const isEditing = !!product;

  const FieldLabel = ({ text, required }: { text: string; required?: boolean }) => (
    <Text style={fStyles.fieldLabel}>
      {text}
      {required && <Text style={{ color: C.danger }}> *</Text>}
    </Text>
  );

  return (
    <Animated.View style={[fStyles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Header */}
      <View style={fStyles.header}>
        <View style={fStyles.headerLeft}>
          <View style={fStyles.headerIcon}>
            <Ionicons name={isEditing ? 'pencil' : 'add'} size={18} color={C.primary} />
          </View>
          <View>
            <Text style={fStyles.heading}>{isEditing ? 'Edit Product' : 'Add New Product'}</Text>
            <Text style={fStyles.subHeading}>
              {isEditing ? 'Update product details' : 'Fill in the product information'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={fStyles.closeBtn} onPress={onCancel} activeOpacity={0.8}>
          <Ionicons name="close" size={18} color={C.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: S.lg }}>
        {/* Image Preview */}
        {thumbnail.length > 10 && !imgFailed ? (
          <View style={fStyles.previewWrap}>
            <Image
              source={{ uri: thumbnail }}
              style={fStyles.previewImg}
              resizeMode="contain"
              onError={() => setImgFailed(true)}
            />
            <Text style={fStyles.previewLabel}>Image Preview</Text>
          </View>
        ) : null}

        {/* Product Name */}
        <View>
          <FieldLabel text="Product Name" required />
          <TextInput
            style={fStyles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Premium Running Shoes"
            placeholderTextColor={C.textMuted}
          />
        </View>

        {/* Price + MRP */}
        <View style={fStyles.row2}>
          <View style={fStyles.halfField}>
            <FieldLabel text="Selling Price ₹" required />
            <TextInput
              style={fStyles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={C.textMuted}
            />
          </View>
          <View style={fStyles.halfField}>
            <FieldLabel text="MRP ₹" required />
            <TextInput
              style={fStyles.input}
              value={mrp}
              onChangeText={setMrp}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={C.textMuted}
            />
          </View>
        </View>

        {/* Discount Preview */}
        {discount > 0 && (
          <View style={fStyles.discountBox}>
            <Ionicons name="pricetag" size={14} color={C.success} />
            <Text style={fStyles.discountText}>{discount}% discount auto-calculated</Text>
          </View>
        )}

        {/* Stock + Brand */}
        <View style={fStyles.row2}>
          <View style={fStyles.halfField}>
            <FieldLabel text="Stock Qty" required />
            <TextInput
              style={fStyles.input}
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={C.textMuted}
            />
          </View>
          <View style={fStyles.halfField}>
            <FieldLabel text="Brand" />
            <TextInput
              style={fStyles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="e.g. Nike"
              placeholderTextColor={C.textMuted}
            />
          </View>
        </View>

        {/* Category */}
        <View>
          <FieldLabel text="Category" />
          {categories.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
              <View style={fStyles.catRow}>
                {categories.map((cat) => {
                  const cId = cat.categoryId || cat.id;
                  const isActive = categoryId === cId;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[fStyles.catChip, isActive && fStyles.catChipActive]}
                      onPress={() => {
                        setCategoryId(cId);
                        setCategoryName(cat.name || cId);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[fStyles.catChipText, isActive && fStyles.catChipTextActive]}>
                        {cat.name || cId}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <TextInput
              style={fStyles.input}
              value={categoryId}
              onChangeText={setCategoryId}
              placeholder="Category ID"
              placeholderTextColor={C.textMuted}
            />
          )}
        </View>

        {/* Image URL */}
        <View>
          <FieldLabel text="Image URL" />
          <TextInput
            style={fStyles.input}
            value={thumbnail}
            onChangeText={(v) => { setThumbnail(v); setImgFailed(false); }}
            placeholder="https://..."
            placeholderTextColor={C.textMuted}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* Description */}
        <View>
          <FieldLabel text="Description" />
          <TextInput
            style={[fStyles.input, fStyles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the product..."
            placeholderTextColor={C.textMuted}
            multiline
          />
        </View>

        {/* QuickBuy Toggle */}
        <View style={fStyles.toggleRow}>
          <View style={fStyles.toggleLeft}>
            <View style={fStyles.toggleIcon}>
              <Text style={{ fontSize: 16 }}>⚡</Text>
            </View>
            <View>
              <Text style={fStyles.toggleLabel}>QuickBuy (10–20 min)</Text>
              <Text style={fStyles.toggleSub}>Enable express delivery for this product</Text>
            </View>
          </View>
          <Switch
            value={isQuick}
            onValueChange={setIsQuick}
            trackColor={{ false: C.surface3, true: C.primaryDim }}
            thumbColor={isQuick ? C.primary : C.textMuted}
          />
        </View>

        {/* Error */}
        {error ? (
          <View style={fStyles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={C.danger} />
            <Text style={fStyles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={fStyles.actions}>
          <TouchableOpacity style={fStyles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
            <Text style={fStyles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[fStyles.saveBtn, loading && fStyles.saveBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons
              name={loading ? 'hourglass-outline' : 'checkmark-circle-outline'}
              size={18}
              color="#fff"
            />
            <Text style={fStyles.saveBtnText}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Product'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 8 }} />
      </ScrollView>
    </Animated.View>
  );
};

const fStyles = StyleSheet.create({
  container: {
    backgroundColor: C.surface2,
    borderRadius: R.card,
    padding: S.xl,
    marginBottom: S.xl,
    borderWidth: 1,
    borderColor: C.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: S.xl,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  headerIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.primaryDim,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.primaryGlow,
  },
  heading:    { color: C.textPrimary, fontSize: 17, fontWeight: '800' },
  subHeading: { color: C.textMuted, fontSize: 12, marginTop: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 11,
    backgroundColor: C.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },

  previewWrap: {
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.card,
    padding: S.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  previewImg:   { width: 120, height: 120, borderRadius: R.card2 },
  previewLabel: { color: C.textMuted, fontSize: 11, marginTop: S.xs, fontWeight: '600' },

  fieldLabel: {
    color: C.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: S.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border2,
    borderRadius: R.input,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    color: C.textPrimary,
    backgroundColor: C.surface,
    fontSize: 14,
  },
  textArea:   { minHeight: 88, textAlignVertical: 'top', paddingTop: S.md },
  row2:       { flexDirection: 'row', gap: S.sm },
  halfField:  { flex: 1 },

  catRow: { flexDirection: 'row', gap: S.sm, paddingBottom: 4 },
  catChip: {
    paddingHorizontal: S.md,
    paddingVertical: S.xs + 2,
    borderRadius: R.pill,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border2,
  },
  catChipActive: {
    backgroundColor: C.primaryDim,
    borderColor: C.primary,
  },
  catChipText:       { color: C.textMuted, fontSize: 12, fontWeight: '600' },
  catChipTextActive: { color: C.primary, fontWeight: '800' },

  discountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xs,
    backgroundColor: C.successDim,
    borderRadius: R.input,
    paddingHorizontal: S.md,
    paddingVertical: S.xs + 2,
    borderWidth: 1,
    borderColor: `${C.success}33`,
  },
  discountText: { color: C.success, fontSize: 12, fontWeight: '700' },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    borderRadius: R.card2,
    padding: S.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: S.sm, flex: 1 },
  toggleIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.warningDim,
    justifyContent: 'center', alignItems: 'center',
  },
  toggleLabel: { color: C.textPrimary, fontSize: 13, fontWeight: '700' },
  toggleSub:   { color: C.textMuted, fontSize: 11, marginTop: 1 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.dangerDim,
    borderRadius: R.card2,
    padding: S.md,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.2)',
  },
  errorText: { color: C.danger, fontSize: 13, fontWeight: '600', flex: 1 },

  actions: {
    flexDirection: 'row',
    gap: S.md,
    marginTop: S.xs,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: S.lg,
    borderRadius: R.btn,
    backgroundColor: C.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border2,
  },
  cancelBtnText: { color: C.textSecondary, fontWeight: '700', fontSize: 14 },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: S.lg,
    borderRadius: R.btn,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText:     { color: '#fff', fontWeight: '800', fontSize: 15 },
});
