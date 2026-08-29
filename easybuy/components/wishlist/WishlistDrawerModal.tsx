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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useEasyBuyTheme } from '../../constants/ThemeContext';
import { EmptyStateView } from '../EmptyStateView';

const { height } = Dimensions.get('window');

export const WishlistDrawerModal: React.FC = () => {
  const { isDarkMode } = useEasyBuyTheme();
  const { wishlistItems, isWishlistOpen, closeWishlist, removeFromWishlist, totalWishlistItems } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
    });
    removeFromWishlist(item.id);
  };

  const handleMoveAllToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    wishlistItems.forEach((item) => {
      addToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
      });
      removeFromWishlist(item.id);
    });
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
          {/* Handle Bar */}
          <View style={[styles.handleBar, isDarkMode && { backgroundColor: '#334155' }]} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.heartIconWrap}>
                <Ionicons name="heart" size={18} color="#E11D48" />
              </View>
              <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Saved Wishlist
              </Text>
              {totalWishlistItems > 0 && (
                <View style={styles.itemCountBadge}>
                  <Text style={styles.itemCountTxt}>{totalWishlistItems}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.closeCircleBtn, isDarkMode && { backgroundColor: '#1E293B' }]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                closeWishlist();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          </View>

          {/* Wishlist Items List */}
          {wishlistItems.length === 0 ? (
            <EmptyStateView
              isDark={isDarkMode}
              iconName="heart-outline"
              title="Your wishlist is empty"
              subtitle="Explore items & save your favorites to view them anytime."
              actionText="Explore Catalog →"
              onAction={() => {
                Haptics.selectionAsync().catch(() => {});
                closeWishlist();
              }}
            />
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginVertical: 8 }}>
                {wishlistItems.map((item) => (
                  <View key={item.id} style={[styles.wishlistItemRow, isDarkMode && styles.wishlistItemRowDark]}>
                    <TouchableOpacity
                      style={styles.itemInfoTouchable}
                      onPress={() => {
                        closeWishlist();
                        router.push({
                          pathname: '/product/[id]',
                          params: {
                            id: item.id,
                            title: item.title,
                            price: item.price,
                            originalPrice: item.originalPrice,
                            image: item.image,
                          },
                        } as any);
                      }}
                      activeOpacity={0.85}
                    >
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.itemThumbImg} resizeMode="cover" />
                      ) : (
                        <View style={styles.placeholderThumb}>
                          <Ionicons name="heart-outline" size={22} color="#94A3B8" />
                        </View>
                      )}

                      <View style={styles.itemTextMeta}>
                        <Text style={[styles.itemTitleTxt, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <View style={styles.itemPriceRow}>
                          <Text style={styles.itemPriceTxt}>{item.price}</Text>
                          {item.originalPrice && (
                            <Text style={styles.itemOldPriceTxt}>{item.originalPrice}</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Move to Cart CTA Button */}
                    <TouchableOpacity
                      style={styles.moveToCartBtn}
                      onPress={() => handleMoveToCart(item)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="bag-handle-outline" size={14} color="#FFFFFF" />
                      <Text style={styles.moveToCartTxt}>Move to Cart</Text>
                    </TouchableOpacity>

                    {/* Remove Button */}
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        removeFromWishlist(item.id);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={17} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {/* Bottom Quick Action: Move All to Cart */}
              <View style={[styles.bottomActionBar, isDarkMode && styles.bottomActionBarDark]}>
                <TouchableOpacity
                  style={styles.moveAllBtn}
                  onPress={handleMoveAllToCart}
                  activeOpacity={0.88}
                >
                  <Ionicons name="cart" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.moveAllBtnTxt}>Move All ({totalWishlistItems}) to Cart</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.72)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  drawerSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: height * 0.82,
    minHeight: height * 0.45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  drawerSheetCardDark: {
    backgroundColor: '#0F172A',
  },
  handleBar: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heartIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  itemCountBadge: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  itemCountTxt: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
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
    paddingVertical: 45,
    gap: 10,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 8,
    backgroundColor: '#2F6E49',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#2F6E49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreBtnTxt: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  wishlistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  wishlistItemRowDark: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  itemInfoTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemThumbImg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  placeholderThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextMeta: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  itemTitleTxt: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemPriceTxt: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
    color: '#2F6E49',
  },
  itemOldPriceTxt: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  moveToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F6E49',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 5,
    shadowColor: '#2F6E49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  moveToCartTxt: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  removeBtn: {
    padding: 6,
  },
  bottomActionBar: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 4,
  },
  bottomActionBarDark: {
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  moveAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F6E49',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#2F6E49',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  moveAllBtnTxt: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
