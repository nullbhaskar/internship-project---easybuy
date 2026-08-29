import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface DarkPromoBannerItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  discountTag: string;
  image: string;
  category: string;
  ctaText: string;
}

export const DARK_PROMO_ITEMS: DarkPromoBannerItem[] = [
  {
    id: 'promo_beauty',
    badge: 'LIMITED PROMO • BEAUTY MIST',
    title: 'Luxe Midnight Botanical Serums',
    subtitle: 'Cold-pressed rosehip & facial mist for effortless radiance.',
    discountTag: 'FLAT 30% OFF',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    category: 'beauty',
    ctaText: 'Shop Beauty Mist →',
  },
  {
    id: 'promo_menswear',
    badge: 'EXCLUSIVE EDIT • TAILORING',
    title: 'The Dark Minimalist Wardrobe',
    subtitle: 'Double-breasted coats, tweed blazers & quiet luxury menswear.',
    discountTag: 'UP TO 40% OFF',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80',
    category: 'fashion',
    ctaText: 'Explore Tailoring →',
  },
  {
    id: 'promo_bakery',
    badge: 'GOURMET PROMO • BAKERY & BREW',
    title: 'Dark Sea-Salt Chocolate Cookies',
    subtitle: 'Hand-baked artisan cookies paired with single-estate cold brew.',
    discountTag: 'BUY 2 GET 1 FREE',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80',
    category: 'grocery',
    ctaText: 'Order Gourmet Treats →',
  },
  {
    id: 'promo_timepieces',
    badge: 'FLASH SALE • TIMEPIECES',
    title: 'Obsidian Chronographs & Silver Cuffs',
    subtitle: 'Precision sapphire crystal movement & oxidized silver heritage.',
    discountTag: 'FLAT ₹1,500 OFF',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    category: 'accessories',
    ctaText: 'Shop Timepieces →',
  },
  {
    id: 'promo_acoustics',
    badge: 'HIGH-FIDELITY • AUDIO EDIT',
    title: 'Studio Noise-Canceling Acoustics',
    subtitle: 'Immersive spatial audio & matte dark obsidian ergonomics.',
    discountTag: 'SAVE ₹2,400 TODAY',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    category: 'electronics',
    ctaText: 'Claim Audio Deal →',
  },
];

interface DarkLuxuryPromotionalSectionProps {
  isDarkMode?: boolean;
  adminBanners?: any;
}

export function DarkLuxuryPromotionalSection({ isDarkMode = true, adminBanners }: DarkLuxuryPromotionalSectionProps) {
  const router = useRouter();

  const promoItems = DARK_PROMO_ITEMS.map((item, index) => {
    if (index === 0 && adminBanners?.featuredPromoMain) {
      return { ...item, image: adminBanners.featuredPromoMain };
    }
    if (index === 1 && adminBanners?.featuredPromoSub) {
      return { ...item, image: adminBanners.featuredPromoSub };
    }
    return item;
  });

  return (
    <View style={styles.sectionContainer}>
      {/* Header Label */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.sparkleBadge}>
            <Ionicons name="sparkles" size={12} color="#FFA451" />
            <Text style={styles.sparkleBadgeText}>FEATURED PROMOTIONS</Text>
          </View>
          <Text style={[styles.mainTitle, isDarkMode && styles.mainTitleDark]}>
            Dark Luxe Edit & Offers
          </Text>
        </View>

        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.push('/all-items' as any);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllBtnText}>All Deals</Text>
          <Ionicons name="chevron-forward" size={14} color="#FFA451" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Carousel of Dark Promotional Banners */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH * 0.82 + 16}
        snapToAlignment="start"
      >
        {promoItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.bannerCard, isDarkMode && styles.bannerCardDark]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              router.push({
                pathname: '/all-items',
                params: { category: item.category },
              } as any);
            }}
            activeOpacity={0.92}
          >
            {/* Background Image */}
            <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />

            {/* Dark Gradient / Ambient Overlay */}
            <View style={styles.bannerOverlay} />

            {/* Discount Floating Pill Badge */}
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{item.discountTag}</Text>
            </View>

            {/* Banner Text & CTA Content */}
            <View style={styles.bannerContent}>
              <Text style={styles.badgeText}>{item.badge}</Text>
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.bannerSubtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>

              {/* Action Button */}
              <View style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>{item.ctaText}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitleGroup: {
    flex: 1,
  },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sparkleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFA451',
    letterSpacing: 1.5,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  mainTitleDark: {
    color: '#F8FAFC',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  viewAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFA451',
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 12,
    gap: 16,
  },
  bannerCard: {
    width: SCREEN_WIDTH * 0.82,
    height: 310,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  bannerCardDark: {
    borderColor: '#334155',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 22,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFA451',
    letterSpacing: 1.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 16,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ctaButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
});
