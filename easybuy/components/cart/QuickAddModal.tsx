import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export interface QuickAddProduct {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  image: string;
  category?: string;
  discount?: string;
}

interface QuickAddModalProps {
  visible: boolean;
  product: QuickAddProduct | null;
  onClose: () => void;
  onAddToCart: (product: QuickAddProduct, size: string, color: string, qty: number) => void;
  isDarkMode?: boolean;
}

const SIZES = ['S', 'M', 'L', 'XL', 'US 9', 'US 10'];
const COLORS = [
  { name: 'Obsidian', hex: '#0F172A' },
  { name: 'Forest', hex: '#246B43' },
  { name: 'Amber', hex: '#F7C75F' },
  { name: 'Cream', hex: '#FFF8DB' },
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  visible,
  product,
  onClose,
  onAddToCart,
  isDarkMode = false,
}) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].name);
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    if (!product) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onAddToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  if (!product) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.sheetContainer, isDarkMode && styles.sheetDark]}
        >
          {/* DRAG HANDLE */}
          <View style={styles.dragHandle} />

          {/* PRODUCT SUMMARY */}
          <View style={styles.headerRow}>
            <Image source={{ uri: product.image }} style={styles.prodThumb} />
            <View style={styles.prodDetails}>
              {product.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{product.discount}</Text>
                </View>
              )}
              <Text style={[styles.prodTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>
                {product.title}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>{product.price}</Text>
                {product.originalPrice && (
                  <Text style={styles.origPriceText}>{product.originalPrice}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* SIZE SELECTOR */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Select Size</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {SIZES.map((size) => {
                const isActive = selectedSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeChip,
                      isActive && styles.sizeChipActive,
                      isDarkMode && !isActive && styles.sizeChipDark,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setSelectedSize(size);
                    }}
                  >
                    <Text style={[styles.sizeText, isActive && styles.sizeTextActive]}>{size}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* COLOR SELECTOR */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
              Select Color: <Text style={styles.subVal}>{selectedColor}</Text>
            </Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => {
                const isActive = selectedColor === c.name;
                return (
                  <TouchableOpacity
                    key={c.name}
                    style={[
                      styles.colorDotOuter,
                      isActive && { borderColor: isDarkMode ? '#F7C75F' : '#246B43' },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setSelectedColor(c.name);
                    }}
                  >
                    <View style={[styles.colorDotInner, { backgroundColor: c.hex }]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* QUANTITY & ADD BUTTON */}
          <View style={styles.footerRow}>
            <View style={[styles.qtySelector, isDarkMode && styles.qtySelectorDark]}>
              <TouchableOpacity
                onPress={() => {
                  if (quantity > 1) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setQuantity((q) => q - 1);
                  }
                }}
                style={styles.qtyBtn}
              >
                <Ionicons name="remove" size={16} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, isDarkMode && { color: '#F8FAFC' }]}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setQuantity((q) => q + 1);
                }}
                style={styles.qtyBtn}
              >
                <Ionicons name="add" size={16} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addCartBtn} onPress={handleConfirm} activeOpacity={0.88}>
              <Ionicons name="bag-add" size={18} color="#FFFFFF" />
              <Text style={styles.addCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
  },
  sheetDark: {
    backgroundColor: '#1E293B',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  prodThumb: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  prodDetails: {
    flex: 1,
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  discountText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  prodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#246B43',
  },
  origPriceText: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  closeBtn: {
    padding: 6,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  subVal: {
    color: '#246B43',
    fontWeight: '700',
  },
  chipRow: {
    gap: 8,
  },
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  sizeChipDark: {
    backgroundColor: '#0F172A',
  },
  sizeChipActive: {
    backgroundColor: '#246B43',
  },
  sizeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  sizeTextActive: {
    color: '#FFFFFF',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorDotOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    gap: 12,
  },
  qtySelectorDark: {
    backgroundColor: '#0F172A',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  addCartBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#246B43',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
  },
  addCartText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
