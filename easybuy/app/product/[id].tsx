import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  Share,
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
} from 'react-native-reanimated';
import { useEasyBuyTheme } from '../../constants/ThemeContext';
import { useProductTransition } from '../../context/ProductTransitionContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { generateFullIndianCatalog } from '../../constants/mockDataGenerator';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FULL_CATALOG = generateFullIndianCatalog();

interface SpecItem {
  icon: string;
  title: string;
  sub: string;
}

interface VariantOption {
  id: string;
  name: string;
  image?: string;
  icon?: string;
  hex?: string;
}

interface ProductData {
  id: string;
  title: string;
  subtitle: string;
  brand: string;
  categoryName: string;
  price: string;
  priceNum: number;
  originalPrice: string;
  originalPriceNum: number;
  discountPct: string;
  savingsText: string;
  rating: string;
  reviewsCount: string;
  avatarsCount: string;
  deliveryDate: string;
  images: string[];
  colors: VariantOption[];
  secondaryVariantsTitle: string;
  secondaryVariants: VariantOption[];
  specsBar: SpecItem[];
  features: { icon: string; title: string }[];
  aboutText: string;
  aboutImage: string;
  couponCode: string;
  couponDesc: string;
}

function getFallback(id: string): ProductData {
  const match = FULL_CATALOG.find((p) => p.id === id) || FULL_CATALOG[0];

  const priceNum = typeof match.price === 'number' ? match.price : (parseInt(String(match.price || '').replace(/[^\d]/g, ''), 10) || 149);
  const origPriceNum = typeof match.mrp === 'number' ? match.mrp : (typeof match.originalPrice === 'number' ? match.originalPrice : (parseInt(String(match.originalPrice || '').replace(/[^\d]/g, ''), 10) || priceNum + 100));
  const savings = Math.max(0, origPriceNum - priceNum);

  return {
    id: match.id,
    title: match.name,
    subtitle: match.categoryName || 'Premium Item',
    brand: match.brand || 'QuickBuy Luxe',
    categoryName: match.categoryName || 'Lifestyle',
    price: `₹${priceNum}`,
    priceNum,
    originalPrice: `₹${origPriceNum}`,
    originalPriceNum: origPriceNum,
    discountPct: match.discountPct || `${Math.round((savings / origPriceNum) * 100)}% OFF`,
    savingsText: savings > 0 ? `Save ₹${savings}` : 'Best Value',
    rating: String(match.rating || 4.5),
    reviewsCount: String(match.reviewCount || 120),
    avatarsCount: '1.2k',
    deliveryDate: match.deliveryTime || '10-15 min',
    images: Array.isArray(match.images) && match.images.length > 0 ? match.images : [match.thumbnail],
    colors: [
      { id: 'c1', name: 'Obsidian Black', hex: '#0F172A' },
      { id: 'c2', name: 'Emerald Green', hex: '#15803D' },
      { id: 'c3', name: 'Amber Gold', hex: '#D97706' },
      { id: 'c4', name: 'Cream Silk', hex: '#FEF08A' },
    ],
    secondaryVariantsTitle: 'SIZE',
    secondaryVariants: [
      { id: 's1', name: 'S' },
      { id: 's2', name: 'M' },
      { id: 's3', name: 'L' },
      { id: 's4', name: 'XL' },
    ],
    specsBar: [
      { icon: 'star', title: String(match.rating || 4.5), sub: 'Rating' },
      { icon: 'shield-checkmark-outline', title: '100%', sub: 'Guaranteed' },
      { icon: 'timer-outline', title: match.deliveryTime || '10-15 min', sub: 'Delivery' },
    ],
    features: [
      { icon: 'checkmark-circle-outline', title: 'Top Rated Premium Quality' },
      { icon: 'ribbon-outline', title: '100% Fresh & Authentic' },
    ],
    aboutText: match.longDescription || match.description || `${match.name} is built with premium quality materials, boasting rich details, express handoff delivery to your door, and complete satisfaction guarantees.`,
    aboutImage: match.thumbnail,
    couponCode: 'EASYBUYPLUS',
    couponDesc: 'Get free shipping with EasyBuy Plus membership',
  };
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useEasyBuyTheme();
  const isDark = isDarkMode;

  const productId = (params.id as string) || 'rv2';
  const [prod, setProd] = useState<ProductData>(() => getFallback(productId));

  const { origin, setOrigin, overlayRef } = useProductTransition();
  const [transitionDone, setTransitionDone] = useState(() => !(origin && origin.productId === productId));
  const entranceAnim = useSharedValue(origin && origin.productId === productId ? 0 : 1);

  // Variants selection states
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(1);

  useEffect(() => {
    if (origin && origin.productId === productId) {
      const t = setTimeout(() => {
        setTransitionDone(true);
        overlayRef.current?.hide();
      }, 380);

      entranceAnim.value = withDelay(
        220,
        withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) })
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
      overlayRef.current?.animateBack(origin, () => {
        router.back();
      });
    } else {
      router.back();
    }
  };

  useEffect(() => {
    return () => {
      setOrigin(null);
    };
  }, []);

  useEffect(() => {
    async function fetchFirestoreProduct() {
      if (!productId) return;
      try {
        const docRef = doc(db, 'products', productId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const priceNum = typeof data.price === 'number' ? data.price : (parseInt(String(data.price || '').replace(/[^\d]/g, ''), 10) || 149);
          const origPriceNum = typeof data.mrp === 'number' ? data.mrp : (typeof data.originalPrice === 'number' ? data.originalPrice : priceNum + 100);
          const savings = Math.max(0, origPriceNum - priceNum);

          setProd({
            id: snap.id,
            title: data.name || data.title || 'Product Details',
            subtitle: data.categoryName || 'Premium Item',
            brand: data.brand || 'QuickBuy Luxe',
            categoryName: data.categoryName || 'Lifestyle',
            price: `₹${priceNum}`,
            priceNum,
            originalPrice: `₹${origPriceNum}`,
            originalPriceNum: origPriceNum,
            discountPct: data.discountPct || `${Math.round((savings / origPriceNum) * 100)}% OFF`,
            savingsText: savings > 0 ? `Save ₹${savings}` : 'Best Value',
            rating: String(data.rating || '4.5'),
            reviewsCount: String(data.reviewCount || '450'),
            avatarsCount: '1.2k',
            deliveryDate: data.deliveryTime || '10-15 min',
            images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.thumbnail],
            colors: [
              { id: 'c1', name: 'Obsidian Black', hex: '#0F172A' },
              { id: 'c2', name: 'Emerald Green', hex: '#15803D' },
              { id: 'c3', name: 'Amber Gold', hex: '#D97706' },
              { id: 'c4', name: 'Cream Silk', hex: '#FEF08A' },
            ],
            secondaryVariantsTitle: 'SIZE',
            secondaryVariants: [
              { id: 's1', name: 'S' },
              { id: 's2', name: 'M' },
              { id: 's3', name: 'L' },
              { id: 's4', name: 'XL' },
            ],
            specsBar: [
              { icon: 'star', title: String(data.rating || 4.5), sub: 'Rating' },
              { icon: 'shield-checkmark-outline', title: '100%', sub: 'Guaranteed' },
              { icon: 'timer-outline', title: data.deliveryTime || '10-15 min', sub: 'Delivery' },
            ],
            features: [
              { icon: 'checkmark-circle-outline', title: 'Top Rated Premium Quality' },
              { icon: 'ribbon-outline', title: '100% Quality Guaranteed' },
            ],
            aboutText: data.longDescription || data.shortDescription || data.description || 'Crafted with premium quality ingredients and delivered hot to your doorstep in 10-15 minutes.',
            aboutImage: data.thumbnail,
            couponCode: 'EASYBUYPLUS',
            couponDesc: 'Get free shipping with EasyBuy Plus membership',
          });
        }
      } catch (e) {
        console.log('Error fetching Firestore product:', e);
      }
    }
    fetchFirestoreProduct();
  }, [productId]);

  const { addToCart: globalAddToCart, openCart } = useCart();
  const { toggleWishlist: globalToggleWishlist, isInWishlist } = useWishlist();

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [readMore, setReadMore] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals
  const [zoomModal, setZoomModal] = useState(false);

  // Animation values
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const qtyScaleAnim = useRef(new Animated.Value(1)).current;

  const isFavorite = isInWishlist(prod.id);

  const relatedProducts = useMemo(() => {
    if (!prod) return [];
    return FULL_CATALOG.filter(
      (item) => item.categoryName === prod.categoryName && item.id !== prod.id
    ).slice(0, 6);
  }, [prod]);

  const toggleFav = () => {
    globalToggleWishlist({
      id: prod.id,
      title: prod.title,
      price: prod.price,
      originalPrice: prod.originalPrice,
      rating: prod.rating,
      image: prod.images[0] || prod.aboutImage,
    });

    Animated.sequence([
      Animated.timing(heartScaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: false }),
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
        Animated.timing(qtyScaleAnim, { toValue: 1.15, duration: 80, useNativeDriver: false }),
        Animated.spring(qtyScaleAnim, { toValue: 1, friction: 5, tension: 160, useNativeDriver: false }),
      ]).start();
    }
  };

  const handleAddToCartSuccess = () => {
    for (let i = 0; i < quantity; i++) {
      globalAddToCart({
        id: prod.id,
        title: prod.title,
        price: prod.price,
        originalPrice: prod.originalPrice,
        image: prod.images[0] || prod.aboutImage,
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setToastMsg(`Added ${quantity}x ${prod.title} to Cart! 🛒🎉`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Hardware back press interceptor for clean reverse transition on Android
  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true; // prevent default behavior
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      subscription.remove();
    };
  }, [origin, productId]);

  const entranceStyle = useAnimatedStyle(() => {
    return {
      opacity: entranceAnim.value,
      transform: [
        {
          translateY: interpolate(entranceAnim.value, [0, 1], [30, 0], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <View style={[styles.masterContainer, isDark ? styles.masterDark : styles.masterLight]}>
      <StatusBar style="dark" />

      {/* ── IMMERSIVE HERO SHOWCASE (FULL BLEED) ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.heroCardBox, isDark ? styles.heroDark : styles.heroLight]}>
          <TouchableOpacity activeOpacity={0.95} onPress={() => setZoomModal(true)} style={styles.heroImgContainer}>
            <Image
              source={{ uri: prod.images[activeImgIdx] || prod.aboutImage }}
              style={[styles.heroMainImg, { opacity: transitionDone ? 1 : 0 }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>

        {/* ── TRANSPARENT OVERLAY HEADER ── */}
        <View style={styles.overlayHeaderBar}>
          <TouchableOpacity style={styles.blurCircleBtn} onPress={handleBack} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.blurCircleBtn} onPress={toggleFav} activeOpacity={0.85}>
            <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? '#EF4444' : '#0F172A'} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* ── DETAILS PANEL ── */}
        <Reanimated.View style={[styles.infoContentContainer, entranceStyle]}>
          {/* Brand & Subtitle Tag */}
          <Text style={styles.brandTxt}>{prod.brand.toUpperCase()}</Text>
          <Text style={[styles.productTitleTxt, isDark ? styles.txtLight : styles.txtDark]}>
            {prod.title}
          </Text>

          {/* Price & Savings Row */}
          <View style={styles.priceRowContainer}>
            <View style={styles.priceInner}>
              <Text style={styles.productPriceTxt}>{prod.price}</Text>
              <Text style={styles.productOriginalPriceTxt}>{prod.originalPrice}</Text>
            </View>
            <View style={styles.discountBadge}>
              <Text style={styles.discountTxt}>{prod.discountPct}</Text>
            </View>
          </View>

          {/* Rating Spec Row */}
          <View style={[styles.metaSpecsRow, isDark ? styles.metaDark : styles.metaLight]}>
            {prod.specsBar.map((spec, index) => (
              <View key={index} style={styles.metaSpecItem}>
                <Ionicons name={spec.icon as any} size={16} color="#EAB308" />
                <View style={{ marginLeft: 6 }}>
                  <Text style={[styles.metaSpecTitle, isDark ? styles.txtLight : styles.txtDark]}>{spec.title}</Text>
                  <Text style={styles.metaSpecSub}>{spec.sub}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* SELECT COLOR SWATCHES */}
          <Text style={[styles.sectionHeading, isDark ? styles.txtLight : styles.txtDark]}>
            Color: <Text style={{ fontWeight: '500', color: '#64748B' }}>{prod.colors[selectedColorIdx]?.name}</Text>
          </Text>
          <View style={styles.variantContainer}>
            {prod.colors.map((c, idx) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => {
                  setSelectedColorIdx(idx);
                  Haptics.selectionAsync().catch(() => {});
                }}
                activeOpacity={0.8}
                style={[
                  styles.colorOutline,
                  selectedColorIdx === idx && { borderColor: isDark ? '#A855F7' : '#0F172A' },
                ]}
              >
                <View style={[styles.colorSwatch, { backgroundColor: c.hex }]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* SELECT SIZE SWATCHES */}
          <Text style={[styles.sectionHeading, isDark ? styles.txtLight : styles.txtDark]}>
            Select Size
          </Text>
          <View style={styles.variantContainer}>
            {prod.secondaryVariants.map((s, idx) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => {
                  setSelectedSizeIdx(idx);
                  Haptics.selectionAsync().catch(() => {});
                }}
                activeOpacity={0.8}
                style={[
                  styles.sizeSwatch,
                  isDark ? styles.sizeSwatchDark : styles.sizeSwatchLight,
                  selectedSizeIdx === idx && (isDark ? styles.sizeSwatchActiveDark : styles.sizeSwatchActiveLight),
                ]}
              >
                <Text
                  style={[
                    styles.sizeTxt,
                    isDark ? styles.txtLight : styles.txtDark,
                    selectedSizeIdx === idx && { color: '#FFFFFF', fontWeight: '900' },
                  ]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* QUANTITY PICKER & OVERVIEW */}
          <View style={styles.quantityPickerRow}>
            <Text style={[styles.sectionHeading, isDark ? styles.txtLight : styles.txtDark, { marginBottom: 0 }]}>
              Quantity
            </Text>
            <View style={styles.stepperPill}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => handleQtyChange(-1)} activeOpacity={0.7}>
                <Ionicons name="remove" size={18} color="#0F172A" />
              </TouchableOpacity>
              <Animated.View style={{ transform: [{ scale: qtyScaleAnim }] }}>
                <Text style={styles.stepperValueTxt}>{quantity}</Text>
              </Animated.View>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => handleQtyChange(1)} activeOpacity={0.7}>
                <Ionicons name="add" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* DESCRIPTION */}
          <Text style={[styles.sectionHeading, isDark ? styles.txtLight : styles.txtDark]}>
            About This Product
          </Text>
          <View style={styles.descriptionBox}>
            <Text style={[styles.descriptionTxt, isDark ? styles.subTxtDark : styles.subTxtLight]}>
              {readMore ? prod.aboutText : `${prod.aboutText.slice(0, 110)}... `}
              <Text style={styles.readMoreBtnTxt} onPress={() => setReadMore(!readMore)}>
                {readMore ? 'Read Less' : 'Read More'}
              </Text>
            </Text>
          </View>

          {/* CUSTOMER REVIEWS */}
          <Text style={[styles.sectionHeading, isDark ? styles.txtLight : styles.txtDark, { marginTop: 24 }]}>
            Customer Reviews ({prod.reviewsCount})
          </Text>
          
          <View style={[styles.reviewsSummaryCard, isDark ? styles.reviewsSummaryCardDark : styles.reviewsSummaryCardLight]}>
            <View style={styles.reviewsSummaryRow}>
              <View style={styles.ratingNumberCol}>
                <Text style={[styles.bigRatingNum, isDark ? styles.txtLight : styles.txtDark]}>{prod.rating}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const ratingVal = parseFloat(prod.rating || '4.5');
                    const isFull = star <= Math.floor(ratingVal);
                    const isHalf = !isFull && star - ratingVal < 1;
                    return (
                      <Ionicons
                        key={star}
                        name={isFull ? 'star' : isHalf ? 'star-half' : 'star-outline'}
                        size={14}
                        color="#F59E0B"
                        style={{ marginRight: 2 }}
                      />
                    );
                  })}
                </View>
                <Text style={styles.reviewsCountText}>{prod.reviewsCount} reviews</Text>
              </View>

              {/* Rating Breakdown Bars */}
              <View style={styles.ratingBarsCol}>
                {[
                  { stars: 5, pct: '75%' },
                  { stars: 4, pct: '15%' },
                  { stars: 3, pct: '7%' },
                  { stars: 2, pct: '2%' },
                  { stars: 1, pct: '1%' },
                ].map((row) => (
                  <View key={row.stars} style={styles.breakdownRow}>
                    <Text style={styles.breakdownStarText}>{row.stars}★</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: row.pct as any }]} />
                    </View>
                    <Text style={styles.breakdownPctText}>{row.pct}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* MOCK REVIEWS LIST */}
            <View style={styles.reviewsListDivider} />
            
            {[
              { name: 'Aarav S.', rating: 5, text: 'Absolutely premium quality! Very satisfied with the build and overall experience.', date: '2 days ago' },
              { name: 'Ananya M.', rating: 4, text: 'Very fast delivery, packed well. Exceeded expectations and fits the description.', date: '1 week ago' },
              { name: 'Ishaan P.', rating: 5, text: 'Top-tier product. Highly recommended to everyone looking for genuine quality.', date: '2 weeks ago' },
            ].map((review, idx) => (
              <View key={idx} style={[styles.reviewItemBlock, idx > 0 && styles.reviewItemBorder]}>
                <View style={styles.reviewItemHeader}>
                  <View>
                    <View style={styles.reviewerNameRow}>
                      <Text style={[styles.reviewerNameTxt, isDark ? styles.txtLight : styles.txtDark]}>{review.name}</Text>
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={10} color="#2F6E46" style={{ marginRight: 2 }} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    </View>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={11}
                          color="#F59E0B"
                          style={{ marginRight: 1 }}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDateTxt}>{review.date}</Text>
                </View>
                <Text style={[styles.reviewFeedbackTxt, isDark ? styles.subTxtDark : styles.subTxtLight]}>
                  {review.text}
                </Text>
              </View>
            ))}
          </View>

          {/* RELATED ITEMS CAROUSEL */}
          {relatedProducts.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={[styles.sectionHeading, isDark ? styles.txtLight : styles.txtDark]}>
                You Might Also Like 🛍️
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScrollContent}
              >
                {relatedProducts.map((item: any) => {
                  const itemPrice = typeof item.price === 'number' ? item.price : parseInt(String(item.price || '').replace(/[^\d]/g, ''), 10) || 149;
                  const itemMrp = typeof item.mrp === 'number' ? item.mrp : (typeof item.originalPrice === 'number' ? item.originalPrice : itemPrice + 100);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.relatedCard, isDark ? styles.relatedCardDark : styles.relatedCardLight]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        // Push new product details page
                        router.push(`/product/${item.id}` as any);
                      }}
                      activeOpacity={0.88}
                    >
                      <Image source={{ uri: item.thumbnail }} style={styles.relatedCardImg} resizeMode="cover" />
                      
                      <View style={styles.relatedCardBody}>
                        <Text style={[styles.relatedBrand, isDark && { color: '#94A3B8' }]} numberOfLines={1}>
                          {item.brand || 'Premium'}
                        </Text>
                        <Text style={[styles.relatedTitle, isDark ? styles.txtLight : styles.txtDark]} numberOfLines={2}>
                          {item.name}
                        </Text>
                        
                        <View style={styles.relatedFooterRow}>
                          <Text style={styles.relatedPrice}>₹{itemPrice}</Text>
                          {itemMrp > itemPrice && (
                            <Text style={styles.relatedMrp}>₹{itemMrp}</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 130 }} />
        </Reanimated.View>
      </ScrollView>

      {/* ── IMMERSIVE CHECKOUT BOTTOM STICKY BAR ── */}
      <Reanimated.View style={[styles.bottomStickyBar, isDark ? styles.bottomDark : styles.bottomLight, entranceStyle]}>
        <View style={styles.bottomBarRow}>
          <TouchableOpacity style={[styles.addToCartBtn, { backgroundColor: isDark ? '#A855F7' : '#0F172A' }]} onPress={handleAddToCartSuccess} activeOpacity={0.9}>
            <Ionicons name="cart-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.addToCartTxt}>Add {quantity} to Cart</Text>
          </TouchableOpacity>
        </View>
      </Reanimated.View>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <View style={styles.toastPill}>
          <Text style={styles.toastTxt}>{toastMsg}</Text>
        </View>
      )}

      {/* IMAGE ZOOM MODAL */}
      <Modal visible={zoomModal} transparent animationType="fade" onRequestClose={() => setZoomModal(false)}>
        <View style={styles.zoomContainer}>
          <TouchableOpacity style={styles.closeZoomBtn} onPress={() => setZoomModal(false)}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Image source={{ uri: prod.images[activeImgIdx] || prod.aboutImage }} style={styles.zoomImg} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
  },
  masterLight: {
    backgroundColor: '#FFFFFF',
  },
  masterDark: {
    backgroundColor: '#0F172A',
  },
  txtLight: {
    color: '#F8FAFC',
  },
  txtDark: {
    color: '#0F172A',
  },
  subTxtLight: {
    color: '#475569',
  },
  subTxtDark: {
    color: '#94A3B8',
  },

  // ── IMMERSIVE HERO SHOWCASE (FULL BLEED) ──
  heroCardBox: {
    width: SCREEN_WIDTH,
    height: 400,
    backgroundColor: '#FFFFFF',
  },
  heroLight: {
    backgroundColor: '#FFFFFF',
  },
  heroDark: {
    backgroundColor: '#1E293B',
  },
  heroImgContainer: {
    width: '100%',
    height: '100%',
  },
  heroMainImg: {
    width: '100%',
    height: '100%',
  },

  // ── OVERLAY TRANSPARENT HEADER ──
  overlayHeaderBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 34,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  blurCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  // ── MAIN SCROLLCONTENT ──
  scrollContent: {
    paddingBottom: 40,
  },

  // ── DETAILS PANEL ──
  infoContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  brandTxt: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#A855F7',
    marginBottom: 6,
  },
  productTitleTxt: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 8,
  },
  priceRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceInner: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPriceTxt: {
    fontSize: 24,
    fontWeight: '900',
    color: '#15803D',
  },
  productOriginalPriceTxt: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
  },

  // ── RATING & SPECS ──
  metaSpecsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  metaLight: {
    backgroundColor: '#F8FAFC',
  },
  metaDark: {
    backgroundColor: '#1E293B',
  },
  metaSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaSpecTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  metaSpecSub: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // ── VARIANT INTERACTIVITY ──
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 8,
  },
  variantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  colorOutline: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  sizeSwatch: {
    width: 52,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSwatchLight: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  sizeSwatchDark: {
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  sizeSwatchActiveLight: {
    borderColor: '#0F172A',
    backgroundColor: '#0F172A',
  },
  sizeSwatchActiveDark: {
    borderColor: '#A855F7',
    backgroundColor: '#A855F7',
  },
  sizeTxt: {
    fontSize: 14,
    fontWeight: '700',
  },

  // ── QUANTITY PICKER ──
  quantityPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    width: 120,
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperValueTxt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  // ── DESCRIPTION ──
  descriptionBox: {
    marginTop: 2,
  },
  descriptionTxt: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  readMoreBtnTxt: {
    color: '#A855F7',
    fontWeight: '800',
  },

  // ── sticky BOTTOM BAR ──
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    zIndex: 99,
  },
  bottomLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  bottomDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
  },
  bottomBarRow: {
    width: '100%',
  },
  addToCartBtn: {
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  addToCartTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  // ── TOAST & ZOOM ──
  toastPill: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  toastTxt: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  zoomContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeZoomBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  zoomImg: {
    width: '100%',
    height: '80%',
  },

  // ── REVIEWS & RELATED PRODUCTS STYLES ──
  reviewsSummaryCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  reviewsSummaryCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  reviewsSummaryCardDark: {
    backgroundColor: '#121927',
    borderColor: '#1F293D',
  },
  reviewsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingNumberCol: {
    alignItems: 'center',
    width: '35%',
  },
  bigRatingNum: {
    fontSize: 36,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  reviewsCountText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  ratingBarsCol: {
    width: '60%',
    gap: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownStarText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    width: 20,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  breakdownPctText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
    width: 30,
    textAlign: 'right',
  },
  reviewsListDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  reviewItemBlock: {
    marginBottom: 16,
  },
  reviewItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  reviewerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewerNameTxt: {
    fontSize: 13,
    fontWeight: '800',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#2F6E46',
  },
  reviewDateTxt: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  reviewFeedbackTxt: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  relatedScrollContent: {
    gap: 12,
    paddingRight: 20,
    paddingVertical: 8,
  },
  relatedCard: {
    width: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  relatedCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  relatedCardDark: {
    backgroundColor: '#121927',
    borderColor: '#1F293D',
  },
  relatedCardImg: {
    width: '100%',
    height: 110,
  },
  relatedCardBody: {
    padding: 10,
  },
  relatedBrand: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94A3B8',
    marginBottom: 2,
  },
  relatedTitle: {
    fontSize: 11,
    fontWeight: '800',
    height: 32,
  },
  relatedFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  relatedPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2F6E46',
    marginRight: 6,
  },
  relatedMrp: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
});
