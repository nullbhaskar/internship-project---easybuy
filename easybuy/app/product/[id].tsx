import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  Modal,
  Platform,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
  FadeInDown,
  type SharedValue,
} from 'react-native-reanimated';
import { useProductTransition } from '../../context/ProductTransitionContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { lookupProduct, ProductData } from '../../constants/globalProductRegistry';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { requireAuth } = useAuth();

  const productId = (params.id as string) || 'ptn-1';

  const getInitialProd = () => {
    const initial = lookupProduct(productId, params as any);
    const passImg = (params as any).image || (params as any).thumbnail;
    if (passImg && typeof passImg === 'string') {
      const rest = (initial.images || []).filter((i) => i !== passImg);
      return {
        ...initial,
        images: [passImg, ...rest],
      };
    }
    return initial;
  };

  const [prod, setProd] = useState<ProductData>(getInitialProd);

  useEffect(() => {
    setProd(getInitialProd());
  }, [productId, (params as any).title, (params as any).price, (params as any).image]);

  const { origin, setOrigin, overlayRef } = useProductTransition();
  const [transitionDone, setTransitionDone] = useState(
    () => !(origin && origin.productId === productId)
  );
  const entranceAnim = useSharedValue(origin && origin.productId === productId ? 0 : 1);

  const [appProtocolOpen, setAppProtocolOpen] = useState(true);
  const [ingredientsOpen, setIngredientsOpen] = useState(false);

  useEffect(() => {
    if (origin && origin.productId === productId) {
      const t = setTimeout(() => {
        setTransitionDone(true);
        overlayRef.current?.hide();
      }, 380);
      entranceAnim.value = withDelay(
        220,
        withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) })
      );
      return () => clearTimeout(t);
    } else {
      setTransitionDone(true);
      entranceAnim.value = 1;
    }
  }, [productId, origin]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (origin && origin.productId === productId) {
      setTransitionDone(false);
      entranceAnim.value = withTiming(0, { duration: 240, easing: Easing.in(Easing.cubic) });
      overlayRef.current?.animateBack(origin, () => router.back());
    } else {
      router.back();
    }
  };

  useEffect(() => () => { setOrigin(null); }, []);

  // Optional Firestore enrichment
  useEffect(() => {
    async function fetchFirestore() {
      try {
        const snap = await getDoc(doc(db, 'products', productId));
        if (snap.exists()) {
          const d = snap.data();
          const liveImg = d.thumbnail || (Array.isArray(d.images) && d.images[0]) || d.image || d.imageUrl;

          const pn = typeof d.price === 'number' ? d.price : (parseInt(String(d.price || '').replace(/[^\d]/g, ''), 10) || 149);
          const on = typeof d.mrp === 'number' ? d.mrp : pn + 100;
          setProd((prev) => {
            const currentImg = liveImg || (params as any).image || (prev.images && prev.images[0]);
            const existingRest = (Array.isArray(d.images) ? d.images : prev.images || []).filter((i: string) => i !== currentImg);
            const finalImages = currentImg ? [currentImg, ...existingRest] : prev.images;

            return {
              ...prev,
              title: d.name || d.title || prev.title,
              brand: d.brand || prev.brand,
              price: `₹${pn}`,
              priceNum: pn,
              originalPrice: `₹${on}`,
              originalPriceNum: on,
              images: finalImages,
              rating: String(d.rating || prev.rating),
              reviewsCount: String(d.reviewCount || prev.reviewsCount),
              aboutText: d.longDescription || d.description || prev.aboutText,
            };
          });
        }
      } catch (_) {}
    }
    fetchFirestore();
  }, [productId, (params as any).image]);

  const { addToCart: globalAddToCart } = useCart();
  const { toggleWishlist: globalToggleWishlist, isInWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [zoomModal, setZoomModal] = useState(false);
  const [activeImgIdx] = useState(0);

  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const qtyScaleAnim = useRef(new Animated.Value(1)).current;
  const isFavorite = isInWishlist(prod.id);

  const toggleFav = () => {
    globalToggleWishlist({
      id: prod.id, title: prod.title, price: prod.price,
      originalPrice: prod.originalPrice, rating: prod.rating,
      image: prod.images[0] || prod.aboutImage,
    });
    Animated.sequence([
      Animated.timing(heartScaleAnim, { toValue: 1.35, duration: 110, useNativeDriver: false }),
      Animated.spring(heartScaleAnim, { toValue: 1, friction: 4, tension: 160, useNativeDriver: false }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  const handleQtyChange = (delta: number) => {
    const next = Math.max(1, Math.min(10, quantity + delta));
    if (next !== quantity) {
      setQuantity(next);
      Haptics.selectionAsync().catch(() => {});
      Animated.sequence([
        Animated.timing(qtyScaleAnim, { toValue: 1.2, duration: 80, useNativeDriver: false }),
        Animated.spring(qtyScaleAnim, { toValue: 1, friction: 5, tension: 160, useNativeDriver: false }),
      ]).start();
    }
  };

  const handleAddToCart = () => {
    if (!requireAuth('add items to your cart')) {
      return;
    }

    globalAddToCart({
      id: prod.id, title: prod.title, price: prod.price,
      originalPrice: prod.originalPrice, image: prod.images[0] || prod.aboutImage,
      quantity: quantity,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setToastMsg(`✓ Added ${quantity}x to Cart!`);
    setTimeout(() => setToastMsg(null), 2800);
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { handleBack(); return true; });
    return () => sub.remove();
  }, [origin, productId]);

  // Entrance animation: content slides+fades up from below
  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entranceAnim.value,
    transform: [{ translateY: interpolate(entranceAnim.value, [0, 1], [36, 0], Extrapolation.CLAMP) }],
  }));

  // Staggered card entrance
  const card0 = useSharedValue(0);
  const card1 = useSharedValue(0);
  const card2 = useSharedValue(0);

  useEffect(() => {
    card0.value = withDelay(300, withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) }));
    card1.value = withDelay(420, withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) }));
    card2.value = withDelay(540, withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) }));
  }, [prod.id]);

  const cs = (v: SharedValue<number>) => useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: interpolate(v.value, [0, 1], [20, 0], Extrapolation.CLAMP) }],
  }));

  const c0s = cs(card0);
  const c1s = cs(card1);
  const c2s = cs(card2);

  const fc = prod.featureCards || [];

  return (
    <View style={S.root}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>

        {/* ═══════════════════════════════════════════
            1 ◆ HERO — full-bleed product image
                Badges overlaid at BOTTOM of image only
            ═══════════════════════════════════════════ */}
        <View style={S.heroWrapper}>
          <TouchableOpacity activeOpacity={0.97} onPress={() => setZoomModal(true)} style={S.heroBox}>
            <Image
              source={{ uri: prod.images[activeImgIdx] || prod.aboutImage }}
              style={[S.heroImg, { opacity: transitionDone ? 1 : 0 }]}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Edition badge pills — inside hero at bottom-left */}
          <View style={S.heroPillsRow} pointerEvents="none">
            <View style={S.pillWhite}><Text style={S.pillWhiteTxt}>LIMITED DROP</Text></View>
            <View style={S.pillDark}><Text style={S.pillDarkTxt}>EDITION  01</Text></View>
          </View>

          {/* Floating circular header buttons */}
          <View style={S.floatingHeader}>
            <TouchableOpacity style={S.circleBtn} onPress={handleBack} activeOpacity={0.85}>
              <Ionicons name="chevron-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity style={S.circleBtn} onPress={toggleFav} activeOpacity={0.85}>
              <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? '#EF4444' : '#0F172A'} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════
            2 ◆ WHITE CONTENT PANEL — fades up on entry
            ═══════════════════════════════════════════ */}
        <Reanimated.View style={[S.contentPanel, entranceStyle]}>

          {/* Product title + tagline (white background, dark text) */}
          <View style={S.titleSection}>
            <Text style={S.prodTitle}>{prod.title.toUpperCase()}</Text>
            <Text style={S.prodTagline}>{prod.tagline}</Text>
          </View>

          {/* ── PRICE  /  QUANTITY ── */}
          <View style={S.priceQtyRow}>
            <View>
              <Text style={S.metaLabel}>PRICE</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 3 }}>
                <Text style={S.priceMain}>{prod.price}</Text>
                <Text style={S.priceOld}>{prod.originalPrice}</Text>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[S.metaLabel, { color: '#F59E0B' }]}>QUANTITY</Text>
              <View style={S.stepperRow}>
                <TouchableOpacity onPress={() => handleQtyChange(-1)} style={S.stepperBtn} activeOpacity={0.7}>
                  <Ionicons name="remove" size={16} color="#0F172A" />
                </TouchableOpacity>
                <Animated.View style={{ transform: [{ scale: qtyScaleAnim }] }}>
                  <Text style={S.stepperVal}>{quantity}</Text>
                </Animated.View>
                <TouchableOpacity onPress={() => handleQtyChange(1)} style={S.stepperBtn} activeOpacity={0.7}>
                  <Ionicons name="add" size={16} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── STAGGERED FEATURE CARDS (light grey surface) ── */}
          {fc[0] && (
            <Reanimated.View style={[S.cardFull, c0s]}>
              <Ionicons name={(fc[0].icon as any) || 'flask-outline'} size={26} color="#0F172A" style={{ marginBottom: 10 }} />
              <Text style={S.cardTitle}>{fc[0].title}</Text>
              <Text style={S.cardSub}>{fc[0].sub}</Text>
            </Reanimated.View>
          )}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {fc[1] && (
              <Reanimated.View style={[S.cardHalf, c1s]}>
                <Ionicons name={(fc[1].icon as any) || 'water-outline'} size={22} color="#0F172A" style={{ marginBottom: 8 }} />
                <Text style={S.cardTitle}>{fc[1].title}</Text>
                <Text style={S.cardSub}>{fc[1].sub}</Text>
              </Reanimated.View>
            )}
            {fc[2] && (
              <Reanimated.View style={[S.cardHalf, c2s]}>
                <Ionicons name={(fc[2].icon as any) || 'flash-outline'} size={22} color="#0F172A" style={{ marginBottom: 8 }} />
                <Text style={S.cardTitle}>{fc[2].title}</Text>
                <Text style={S.cardSub}>{fc[2].sub}</Text>
              </Reanimated.View>
            )}
          </View>

          {/* ── ACCORDION 1: DYNAMIC LABEL ── */}
          <View style={S.divider} />
          <TouchableOpacity
            style={S.accordionRow}
            onPress={() => { Haptics.selectionAsync().catch(() => {}); setAppProtocolOpen(!appProtocolOpen); }}
            activeOpacity={0.75}
          >
            <Text style={S.accordionTitle}>{prod.accordionLabel1}</Text>
            <Ionicons name={appProtocolOpen ? 'chevron-up' : 'chevron-down'} size={17} color="#94A3B8" />
          </TouchableOpacity>
          {appProtocolOpen && (
            <Reanimated.View entering={FadeInDown.duration(280).easing(Easing.out(Easing.cubic))} style={S.accordionBody}>
              <Text style={S.accordionTxt}>{prod.applicationProtocol}</Text>
            </Reanimated.View>
          )}

          {/* ── ACCORDION 2: DYNAMIC LABEL ── */}
          <View style={S.divider} />
          <TouchableOpacity
            style={S.accordionRow}
            onPress={() => { Haptics.selectionAsync().catch(() => {}); setIngredientsOpen(!ingredientsOpen); }}
            activeOpacity={0.75}
          >
            <Text style={S.accordionTitle}>{prod.accordionLabel2}</Text>
            <Ionicons name={ingredientsOpen ? 'chevron-up' : 'chevron-down'} size={17} color="#94A3B8" />
          </TouchableOpacity>
          {ingredientsOpen && (
            <Reanimated.View entering={FadeInDown.duration(280).easing(Easing.out(Easing.cubic))} style={S.accordionBody}>
              <Text style={S.accordionTxt}>{prod.ingredientsProfile}</Text>
            </Reanimated.View>
          )}

          {/* ── PERFORMANCE DATA (Reviews) ── */}
          <View style={S.divider} />
          <View style={{ marginTop: 20, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={S.sectionLabel}>CUSTOMER REVIEWS</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {[1,2,3,4,5].map((s) => <Ionicons key={s} name="star" size={11} color="#F59E0B" />)}
                <Text style={[S.sectionLabel, { color: '#94A3B8', fontSize: 10 }]}>  {prod.rating} ({prod.reviewsCount})</Text>
              </View>
            </View>

            <View style={S.reviewCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', gap: 3 }}>
                  {[1,2,3,4,5].map((s) => <Ionicons key={s} name="star" size={12} color="#0F172A" />)}
                </View>
                <Text style={S.quoteGlyph}>{'\u201C\u201D'}</Text>
              </View>
              <Text style={S.reviewTxt}>{prod.reviewQuote}</Text>
              <Text style={S.reviewAuthor}>{prod.reviewAuthor.toUpperCase()}</Text>
            </View>
          </View>

          {/* ── ARSENAL CAROUSEL ── */}
          <View style={{ marginTop: 28, marginBottom: 32 }}>
            <Text style={[S.sectionLabel, { marginBottom: 14 }]}>EXPAND  ARSENAL</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              {prod.relatedArsenal.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={S.arsenalCard}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); router.push(`/product/${item.id}` as any); }}
                  activeOpacity={0.88}
                >
                  <Image source={{ uri: item.image }} style={S.arsenalImg} resizeMode="cover" />
                  <Text style={S.arsenalCat}>{item.category}</Text>
                  <Text style={S.arsenalTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={S.arsenalPrice}>{item.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Reanimated.View>
      </ScrollView>

      {/* ══ STICKY ADD TO CART ══ */}
      <View style={S.stickyBar}>
        <TouchableOpacity style={S.addBtn} onPress={handleAddToCart} activeOpacity={0.9}>
          <Ionicons name="cart" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={S.addBtnTxt}>ADD TO CART  •  {prod.price}</Text>
        </TouchableOpacity>
      </View>

      {/* ══ TOAST ══ */}
      {toastMsg && (
        <View style={S.toast}>
          <Text style={S.toastTxt}>{toastMsg}</Text>
        </View>
      )}

      {/* ══ ZOOM ══ */}
      <Modal visible={zoomModal} transparent animationType="fade" onRequestClose={() => setZoomModal(false)}>
        <View style={S.zoomBg}>
          <TouchableOpacity style={S.zoomClose} onPress={() => setZoomModal(false)}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Image source={{ uri: prod.images[activeImgIdx] || prod.aboutImage }} style={S.zoomImg} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
//  STYLES — white/light body, badges only inside hero
// ─────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 110 },

  // ── HERO ──
  heroWrapper: {
    width: SCREEN_WIDTH,
    height: 420,
    position: 'relative',
  },
  heroBox: {
    width: '100%',
    height: '100%',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },

  // Edition pills — absolute, bottom-left of hero
  heroPillsRow: {
    position: 'absolute',
    bottom: 20,
    left: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillWhite: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  pillWhiteTxt: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#0F172A',
  },
  pillDark: {
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pillDarkTxt: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#FFFFFF',
  },

  // Floating back + heart
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 36,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },

  // ── WHITE CONTENT PANEL ──
  contentPanel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  // Title block (ON WHITE — not inside hero)
  titleSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  prodTitle: {
    fontSize: 24,
    fontWeight: '300',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#0F172A',
    letterSpacing: -0.3,
    lineHeight: 30,
    marginBottom: 6,
  },
  prodTagline: {
    fontSize: 13,
    color: '#3B82F6',          // blue italic — exactly as reference
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 19,
  },

  // Price / Qty row
  priceQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: '#94A3B8',
  },
  priceMain: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  priceOld: {
    fontSize: 15,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 14,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    minWidth: 18,
    textAlign: 'center',
  },

  // Feature cards — light grey surface (#F4F6F8)
  cardFull: {
    backgroundColor: '#F4F6F9',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  cardHalf: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.3,
    color: '#0F172A',
    marginBottom: 5,
  },
  cardSub: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
    color: '#64748B',
  },

  // Dividers & accordions
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  accordionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  accordionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#0F172A',
  },
  accordionBody: {
    paddingBottom: 18,
  },
  accordionTxt: {
    fontSize: 13,
    lineHeight: 21,
    color: '#64748B',
    fontWeight: '400',
  },

  // Reviews
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
    color: '#0F172A',
  },
  reviewCard: {
    backgroundColor: '#F4F6F9',
    borderRadius: 18,
    padding: 20,
  },
  quoteGlyph: {
    fontSize: 36,
    color: 'rgba(15,23,42,0.12)',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 36,
    fontWeight: '900',
  },
  reviewTxt: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#0F172A',
    fontStyle: 'italic',
    lineHeight: 23,
    marginBottom: 14,
    fontWeight: '400',
  },
  reviewAuthor: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.8,
    color: '#94A3B8',
  },

  // Arsenal
  arsenalCard: { width: 145 },
  arsenalImg: {
    width: '100%',
    height: 175,
    borderRadius: 14,
    backgroundColor: '#F4F6F9',
    marginBottom: 8,
  },
  arsenalCat: {
    fontSize: 9, fontWeight: '900', letterSpacing: 1.4,
    color: '#94A3B8', marginBottom: 3,
  },
  arsenalTitle: {
    fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 2,
  },
  arsenalPrice: {
    fontSize: 13, fontWeight: '800', color: '#64748B',
  },

  // Sticky CTA
  stickyBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 14,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    zIndex: 99,
  },
  addBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  addBtnTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.92)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  toastTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  // Zoom
  zoomBg: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  zoomClose: {
    position: 'absolute', top: 52, right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  zoomImg: { width: '100%', height: '80%' },
});
