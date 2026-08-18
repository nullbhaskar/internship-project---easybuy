import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface EditorialStoryData {
  issue: string;
  title: string;
  author: string;
  readTime: string;
  coverImage: string;
  paragraphs: string[];
  featuredProducts: any[];
}

interface EditorialStoryModalProps {
  visible: boolean;
  story: EditorialStoryData | null;
  onClose: () => void;
  onAddToCart: (product: any) => void;
  isDarkMode: boolean;
}

export function EditorialStoryModal({
  visible,
  story,
  onClose,
  onAddToCart,
  isDarkMode,
}: EditorialStoryModalProps) {
  if (!visible || !story) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        {/* Floating Close Button */}
        <SafeAreaView style={styles.headerSafeArea}>
          <TouchableOpacity
            style={[styles.closeBtn, isDarkMode && styles.closeBtnDark]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onClose();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color={isDarkMode ? '#F8FAFC' : '#1E293B'} />
          </TouchableOpacity>
        </SafeAreaView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={true}
        >
          {/* Cover Hero Image */}
          <View style={styles.heroContainer}>
            <Image source={{ uri: story.coverImage }} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <View style={styles.issueTag}>
                <Text style={styles.issueTagText}>{story.issue.toUpperCase()}</Text>
              </View>
              <Text style={styles.heroTitle}>{story.title}</Text>
              <View style={styles.authorRow}>
                <Text style={styles.authorText}>By {story.author}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.readTimeText}>{story.readTime}</Text>
              </View>
            </View>
          </View>

          {/* Story Body */}
          <View style={styles.bodySection}>
            {story.paragraphs.map((p, idx) => (
              <Text
                key={`p_${idx}`}
                style={[
                  styles.paragraph,
                  idx === 0 && styles.firstParagraph,
                  isDarkMode && styles.paragraphDark,
                ]}
              >
                {p}
              </Text>
            ))}
          </View>

          {/* Featured Artisanal Collection Carousel/List */}
          {story.featuredProducts && story.featuredProducts.length > 0 && (
            <View style={[styles.productsSection, isDarkMode && styles.productsSectionDark]}>
              <Text style={styles.sectionHeaderLabel}>CURATED SELECTION</Text>
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                Featured in this Story
              </Text>

              {story.featuredProducts.map((prod) => (
                <View
                  key={prod.id}
                  style={[styles.productCard, isDarkMode && styles.productCardDark]}
                >
                  <Image source={{ uri: prod.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productBadge}>{prod.badge || prod.tag || 'HANDMADE'}</Text>
                    <Text style={[styles.productTitle, isDarkMode && styles.productTitleDark]}>
                      {prod.name || prod.title}
                    </Text>
                    <Text style={styles.productPrice}>
                      {prod.priceFormatted || (typeof prod.price === 'number' ? `$${prod.price}` : prod.price)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addCartBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                      onAddToCart(prod);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="bag-add-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.addCartBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Footer Branding */}
          <View style={styles.footerBranding}>
            <Ionicons name="sparkles" size={24} color="#FFA451" />
            <Text style={[styles.footerText, isDarkMode && styles.footerTextDark]}>
              EasyBuy Artisanal Stories & Journal
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  headerSafeArea: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 99,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  closeBtnDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 380,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroContent: {
    padding: 24,
  },
  issueTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFA451',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  issueTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  dotSeparator: {
    color: '#94A3B8',
    marginHorizontal: 8,
  },
  readTimeText: {
    fontSize: 13,
    color: '#FFA451',
    fontWeight: '600',
  },
  bodySection: {
    padding: 24,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: '#334155',
    marginBottom: 18,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  firstParagraph: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
  },
  paragraphDark: {
    color: '#CBD5E1',
  },
  productsSection: {
    marginTop: 10,
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productsSectionDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  sectionHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFA451',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#F8FAFC',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  productCardDark: {
    backgroundColor: '#0F172A',
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
  },
  productBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFA451',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  productTitleDark: {
    color: '#F8FAFC',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addCartBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  footerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    gap: 8,
  },
  footerText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  footerTextDark: {
    color: '#94A3B8',
  },
});

export default EditorialStoryModal;

