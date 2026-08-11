import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useEasyBuyTheme } from '../../constants/ThemeContext';

const { height } = Dimensions.get('window');

export const WishlistDrawerModal: React.FC = () => {
  const { isDarkMode } = useEasyBuyTheme();
  const { wishlistItems, isWishlistOpen, closeWishlist, removeFromWishlist, totalWishlistItems } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item: any) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
    });
    removeFromWishlist(item.id);
  };

  return (
    <Modal
      visible={isWishlistOpen}
      animationType="slide"
      transparent
      onRequestClose={closeWishlist}
    >
      <View style={styles.backdropOverlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={closeWishlist} activeOpacity={1} />

        <View style={[styles.drawerSheetCard, isDarkMode && styles.drawerSheetCardDark]}>
          {/* Handle bar */}
          <View style={[styles.handleBar, isDarkMode && { backgroundColor: '#334155' }]} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="heart" size={22} color="#FF6B6B" />
              <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Your Wishlist
              </Text>
              {totalWishlistItems > 0 && (
                <View style={styles.itemCountBadge}>
                  <Text style={styles.itemCountTxt}>{totalWishlistItems}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.closeCircleBtn, isDarkMode && { backgroundColor: '#1E293B' }]}
              onPress={closeWishlist}
            >
              <Ionicons name="close" size={18} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          </View>

          {/* Wishlist List */}
          {wishlistItems.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Ionicons name="heart-dislike-outline" size={54} color={isDarkMode ? '#475569' : '#CBD5E1'} />
              <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Your wishlist is empty
              </Text>
              <Text style={[styles.emptySub, isDarkMode && { color: '#94A3B8' }]}>
                Tap the heart icon on any product to save it for later!
              </Text>
              <TouchableOpacity style={styles.exploreBtn} onPress={closeWishlist}>
                <Text style={styles.exploreBtnTxt}>Explore Items →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginVertical: 10 }}>
              {wishlistItems.map((item) => (
                <View key={item.id} style={[styles.wishlistItemRow, isDarkMode && styles.wishlistItemRowDark]}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemThumbImg} resizeMode="cover" />
                  ) : (
                    <View style={styles.placeholderThumb}>
                      <Ionicons name="heart-outline" size={24} color="#94A3B8" />
                    </View>
                  )}

                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={[styles.itemTitleTxt, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.itemPriceTxt, isDarkMode && { color: '#C084FC' }]}>
                      {item.price}
                    </Text>
                  </View>

                  {/* Move to Cart CTA */}
                  <TouchableOpacity
                    style={styles.moveToCartBtn}
                    onPress={() => handleMoveToCart(item)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="cart-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.moveToCartTxt}>Move to Cart</Text>
                  </TouchableOpacity>

                  {/* Remove Heart Button */}
                  <TouchableOpacity style={{ padding: 4 }} onPress={() => removeFromWishlist(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 3, 10, 0.75)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  drawerSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
    maxHeight: height * 0.8,
    minHeight: height * 0.45,
  },
  drawerSheetCardDark: {
    backgroundColor: '#0B0F19',
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  itemCountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  itemCountTxt: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  exploreBtn: {
    marginTop: 10,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  exploreBtnTxt: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  wishlistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 18,
    marginBottom: 10,
    gap: 10,
  },
  wishlistItemRowDark: {
    backgroundColor: '#111827',
  },
  itemThumbImg: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  placeholderThumb: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitleTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemPriceTxt: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2F6E49',
  },
  moveToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4,
  },
  moveToCartTxt: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
