import React, { useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, S } from './adminTheme';
import { AdminProduct } from './adminTypes';

interface ProductCardProps {
  item: AdminProduct;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onEdit, onDelete, index = 0 }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  };

  const stock = Number(item.stock ?? 0);
  const isLowStock  = stock > 0 && stock <= 5;
  const isOutOfStock = stock === 0;

  const price = Number(item.price ?? 0);
  const mrp   = Number(item.mrp ?? 0);
  const discount = mrp > 0 && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const stockColor = isOutOfStock ? C.danger : isLowStock ? C.warning : C.success;
  const stockBg    = isOutOfStock ? C.dangerDim : isLowStock ? C.warningDim : C.successDim;
  const stockLabel = isOutOfStock ? 'Out of Stock' : isLowStock ? `Low (${stock})` : `In Stock (${stock})`;

  return (
    <Animated.View style={[pStyles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onEdit(item)}
        style={pStyles.cardInner}
      >
        {/* Image */}
        <View style={pStyles.imgWrap}>
          <Image
            source={{ uri: item.thumbnail || item.images?.[0] || 'https://placehold.co/80x80/1a2540/6366f1?text=P' }}
            style={pStyles.img}
            resizeMode="cover"
          />
          {discount > 0 && (
            <View style={pStyles.discountBadge}>
              <Text style={pStyles.discountText}>{discount}%</Text>
            </View>
          )}
          {(item.isQuickDelivery || item.isQuickBuy) && (
            <View style={pStyles.quickBadge}>
              <Text style={pStyles.quickText}>⚡</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={pStyles.info}>
          <Text style={pStyles.name} numberOfLines={2}>
            {item.title || item.name || 'Untitled Product'}
          </Text>
          <View style={pStyles.metaRow}>
            {item.categoryId ? (
              <View style={pStyles.catBadge}>
                <Text style={pStyles.catText}>{item.categoryId}</Text>
              </View>
            ) : null}
            {item.brand ? (
              <Text style={pStyles.brand} numberOfLines={1}>{item.brand}</Text>
            ) : null}
          </View>
          <View style={pStyles.priceRow}>
            <Text style={pStyles.price}>₹{price.toLocaleString()}</Text>
            {mrp > 0 && mrp !== price ? (
              <Text style={pStyles.mrp}>₹{mrp.toLocaleString()}</Text>
            ) : null}
          </View>
          <View style={[pStyles.stockBadge, { backgroundColor: stockBg }]}>
            <View style={[pStyles.stockDot, { backgroundColor: stockColor }]} />
            <Text style={[pStyles.stockText, { color: stockColor }]}>{stockLabel}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={pStyles.actions}>
          <TouchableOpacity
            style={pStyles.editBtn}
            onPress={() => onEdit(item)}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
          >
            <Ionicons name="pencil" size={15} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={pStyles.deleteBtn}
            onPress={() => onDelete(item)}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <Ionicons name="trash-outline" size={15} color={C.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const pStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: R.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: S.md,
    gap: S.md,
  },
  imgWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  img: {
    width: 76,
    height: 76,
    borderRadius: R.card2,
    backgroundColor: '#F8FAFC',
  },
  discountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  discountText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  quickBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#EAB308',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  quickText: { fontSize: 10 },

  info: { flex: 1, gap: 5 },
  name: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xs + 2,
    flexWrap: 'wrap',
  },
  catBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  catText: {
    color: '#4F46E5',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  brand: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  price: { color: '#16A34A', fontSize: 15, fontWeight: '900' },
  mrp: { color: '#94A3B8', fontSize: 11, textDecorationLine: 'line-through' },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.badge,
    alignSelf: 'flex-start',
  },
  stockDot: { width: 6, height: 6, borderRadius: 3 },
  stockText: { fontSize: 10, fontWeight: '700' },

  actions: {
    gap: S.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    width: 34, height: 34, borderRadius: 11,
    backgroundColor: '#EEF2FF',
    borderWidth: 1, borderColor: '#C7D2FE',
    justifyContent: 'center', alignItems: 'center',
  },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 11,
    backgroundColor: '#FEE2E2',
    borderWidth: 1, borderColor: '#FCA5A5',
    justifyContent: 'center', alignItems: 'center',
  },
});
