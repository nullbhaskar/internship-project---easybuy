import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminProduct } from './adminTypes';

export const ProductCard = ({
  item,
  onEdit,
  onDelete,
  index = 0,
}: {
  item: AdminProduct;
  onEdit: (p: AdminProduct) => void;
  onDelete: (p: AdminProduct) => void;
  index?: number;
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const stock = Number(item.stock ?? 0);
  const isOutOfStock = stock < 5; // "Low Stock" threshold

  const price = Number(item.price ?? 0);
  const mrp   = Number(item.mrp ?? 0);
  const discount = mrp > 0 && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onEdit(item)}
        style={pStyles.cardInner}
      >
        {/* Image */}
        <View style={pStyles.imgWrap}>
          <Image
            source={{ uri: item.thumbnail || item.images?.[0] || 'https://placehold.co/80x80/f1f5f9/94a3b8?text=P' }}
            style={pStyles.img}
            resizeMode="cover"
          />
          {discount > 0 && (
            <View style={pStyles.discountBadge}>
              <Text style={pStyles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={pStyles.info}>
          <Text style={pStyles.tagText}>
            {(item.isQuickDelivery || item.isQuickBuy) ? 'EASYBUY EXPRESS' : 'REGULAR'}
          </Text>
          
          <Text style={pStyles.name} numberOfLines={2}>
            {item.title || item.name || 'Untitled Product'}
          </Text>

          <View style={pStyles.priceRow}>
            <Text style={pStyles.price}>₹{price.toLocaleString()}</Text>
            {mrp > 0 && mrp !== price ? (
              <Text style={pStyles.mrp}>₹{mrp.toLocaleString()}</Text>
            ) : null}
          </View>
          
          <View style={[pStyles.stockBadge, { backgroundColor: isOutOfStock ? '#FEF2F2' : '#ECFDF5' }]}>
            <View style={[pStyles.stockDot, { backgroundColor: isOutOfStock ? '#DC2626' : '#10B981' }]} />
            <Text style={[pStyles.stockText, { color: isOutOfStock ? '#DC2626' : '#059669' }]}>
              {isOutOfStock ? `Low Stock (${stock})` : `In Stock (${stock})`}
            </Text>
          </View>
        </View>

        {/* Actions (Top Right) */}
        <View style={pStyles.actions}>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={(e) => { e.stopPropagation(); onEdit(item); }}
            style={pStyles.iconBtn}
          >
            <Ionicons name="pencil" size={12} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={(e) => { e.stopPropagation(); onDelete(item); }}
            style={pStyles.iconBtn}
          >
            <Ionicons name="trash" size={12} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const pStyles = StyleSheet.create({
  cardInner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    gap: 16,
    alignItems: 'flex-start',
  },
  imgWrap: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  img: {
    width: '100%',
    height: '100%',
    borderRadius: 7,
  },
  discountBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#B91C1C', // Darker red matching target
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 40, // space for actions
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  mrp: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  stockBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 9,
    fontWeight: '600',
  },
  actions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
