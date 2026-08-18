import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export interface CuratedBundleItem {
  id: string;
  title: string;
  price: string;
  priceNum: number;
  originalPrice?: string;
  image: string;
  category: string;
  raw?: any;
}

export interface CuratedBundleInfo {
  tag: string;
  title: string;
  subtitle: string;
  price: string;
  oldPrice: string;
  items: CuratedBundleItem[];
}

interface CuratedBundleModalProps {
  visible: boolean;
  bundle: CuratedBundleInfo | null;
  onClose: () => void;
  onAddToCart: (item: any) => void;
  onAddAllToCart: (items: any[]) => void;
  isDarkMode?: boolean;
}

export const CuratedBundleModal: React.FC<CuratedBundleModalProps> = ({
  visible,
  bundle,
  onClose,
  onAddToCart,
  onAddAllToCart,
  isDarkMode = false,
}) => {
  if (!bundle) return null;

  const bgStyle = isDarkMode ? '#1E293B' : '#FAF8F5';
  const cardBg = isDarkMode ? '#0F172A' : '#FFFFFF';
  const textColor = isDarkMode ? '#F8FAFC' : '#1C1917';
  const subTextColor = isDarkMode ? '#94A3B8' : '#78716C';
  const borderCol = isDarkMode ? '#334155' : '#E2DCD2';

  const handleAddSingle = (item: CuratedBundleItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onAddToCart(item.raw || {
      id: item.id,
      name: item.title,
      price: item.priceNum,
      priceFormatted: item.price,
      image: item.image,
      thumbnail: item.image,
      categoryName: item.category,
    });
  };

  const handleAddBundle = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const rawItems = bundle.items.map((item) => item.raw || {
      id: item.id,
      name: item.title,
      price: item.priceNum,
      priceFormatted: item.price,
      image: item.image,
      thumbnail: item.image,
      categoryName: item.category,
    });
    onAddAllToCart(rawItems);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.sheetContainer, { backgroundColor: bgStyle, borderColor: borderCol }]}>
          {/* DRAG HANDLE */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: isDarkMode ? '#475569' : '#CBD5E1' }]} />
          </View>

          {/* HEADER */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tag, { color: subTextColor }]}>{bundle.tag}</Text>
              <Text style={[styles.title, { color: textColor }]}>{bundle.title}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: subTextColor }]}>
            {bundle.subtitle} (Curated 5 Essential Items)
          </Text>

          {/* ITEMS LIST */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
          >
            {bundle.items.slice(0, 5).map((item, idx) => (
              <View
                key={item.id || idx}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: borderCol,
                  },
                ]}
              >
                <TouchableOpacity
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {
                    onClose();
                    router.push({
                      pathname: '/product/[id]',
                      params: {
                        id: item.id,
                        title: item.title,
                        price: item.price,
                        originalPrice: item.originalPrice,
                        image: item.image,
                        category: item.category,
                      },
                    } as any);
                  }}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: item.image }} style={styles.itemImage} />

                  <View style={{ flex: 1, paddingHorizontal: 12 }}>
                    <Text style={[styles.itemCategory, { color: subTextColor }]}>
                      {item.category || 'ESSENTIAL'}
                    </Text>
                    <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                      <Text style={[styles.itemPrice, { color: textColor }]}>{item.price}</Text>
                      {item.originalPrice ? (
                        <Text style={[styles.itemOldPrice, { color: subTextColor }]}>
                          {item.originalPrice}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.addSingleBtn, { backgroundColor: isDarkMode ? '#246B43' : '#2F6E49' }]}
                  onPress={() => handleAddSingle(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.addSingleText}>ADD</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* FOOTER ACTION BAR */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: cardBg,
                borderTopColor: borderCol,
              },
            ]}
          >
            <View>
              <Text style={[styles.totalLabel, { color: subTextColor }]}>BUNDLE SAVINGS PRICE</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={[styles.totalPrice, { color: textColor }]}>{bundle.price}</Text>
                <Text style={[styles.totalOldPrice, { color: subTextColor }]}>{bundle.oldPrice}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkoutBundleBtn}
              onPress={handleAddBundle}
              activeOpacity={0.88}
            >
              <Ionicons name="bag-handle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.checkoutBundleText}>ADD ALL 5 TO CART</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    maxHeight: height * 0.85,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 14,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  itemCategory: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemOldPrice: {
    fontSize: 12,
    marginLeft: 6,
    textDecorationLine: 'line-through',
  },
  addSingleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 2,
  },
  addSingleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  totalOldPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  checkoutBundleBtn: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutBundleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
