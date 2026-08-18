import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, S } from './adminTheme';
import { AdminProduct } from './adminTypes';
import { ProductCard } from './ProductCard';

interface ProductTableProps {
  products: AdminProduct[];
  loading: boolean;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
}

const SkeletonCard = () => (
  <View style={sStyles.skeletonCard}>
    <View style={sStyles.skeletonImg} />
    <View style={sStyles.skeletonInfo}>
      <View style={sStyles.skeletonLine} />
      <View style={[sStyles.skeletonLine, { width: '60%' }]} />
      <View style={[sStyles.skeletonLine, { width: '40%', backgroundColor: `${C.success}33` }]} />
    </View>
  </View>
);

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <View>
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </View>
    );
  }

  if (!products.length) {
    return (
      <View style={sStyles.empty}>
        <View style={sStyles.emptyIcon}>
          <Ionicons name="cube-outline" size={44} color={C.textDim} />
        </View>
        <Text style={sStyles.emptyTitle}>No products found</Text>
        <Text style={sStyles.emptySub}>Try adjusting your search or filters, or add a new product.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 20 }}
      scrollEnabled={false}
      renderItem={({ item, index }) => (
        <ProductCard
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          index={index}
        />
      )}
    />
  );
};

const sStyles = StyleSheet.create({
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: R.card,
    padding: S.md,
    marginBottom: 10,
    gap: S.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skeletonImg: {
    width: 76,
    height: 76,
    borderRadius: R.card2,
    backgroundColor: '#F1F5F9',
  },
  skeletonInfo: {
    flex: 1,
    gap: S.sm,
    paddingTop: S.xs,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: C.surface3,
    width: '80%',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 56,
    gap: S.sm,
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: C.surface2,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: S.sm,
    borderWidth: 1, borderColor: C.border,
  },
  emptyTitle: {
    color: C.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: C.textMuted,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
});
