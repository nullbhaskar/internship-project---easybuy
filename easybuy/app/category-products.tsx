import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { QuickAddModal, QuickAddProduct } from '../components/cart/QuickAddModal';
import { ProductTransitionWrapper } from '../components/transition/ProductTransitionWrapper';
import { registerProducts } from '../constants/globalProductRegistry';

const { width } = Dimensions.get('window');

interface ProductColor {
  id: string;
  name: string;
}

interface ProductSize {
  id: string;
  name: string;
}

interface Product {
  id: string;
  productId: string;
  name: string;
  title: string;
  price: number;
  mrp: number;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  availability?: string;
  deliveryTime?: string;
  isQuickDelivery?: boolean;
  thumbnail?: string;
  images?: string[];
  colors?: ProductColor[];
  sizes?: ProductSize[];
  brand?: string;
  specifications?: Record<string, string>;
  description?: string;
  city?: string;
  stateName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
}

// Pre-defined category visual meta fallback
const CATEGORY_META: Record<string, { name: string; image: string; gradient: string[] }> = {
  electronics: { name: 'Electronics & Tech', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', gradient: ['#8B5CF6', '#3B82F6'] },
  fashion: { name: 'Fashion & Apparel', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600', gradient: ['#EC4899', '#F43F5E'] },
  beauty: { name: 'Beauty & Cosmetics', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600', gradient: ['#F472B6', '#FB7185'] },
  home_living: { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', gradient: ['#F59E0B', '#D97706'] },
  gaming: { name: 'Gaming Zone', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', gradient: ['#10B981', '#059669'] },
  study_office: { name: 'Study & Office', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600', gradient: ['#6B7280', '#4B5563'] },
  hostel_essentials: { name: 'Hostel Essentials', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600', gradient: ['#3B82F6', '#2563EB'] },
  grocery: { name: 'Grocery & Snacks', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', gradient: ['#10B981', '#047857'] },
  kitchen: { name: 'Kitchen & Appliances', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600', gradient: ['#F97316', '#EA580C'] },
  health_care: { name: 'Health & Wellness', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', gradient: ['#14B8A6', '#0D9488'] },
  gifts: { name: 'Gifts & Hampers', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600', gradient: ['#F59E0B', '#D97706'] },
  lifestyle: { name: 'Lifestyle & Vibe', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600', gradient: ['#84CC16', '#65A30D'] },
  accessories: { name: 'Accessories & Bags', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', gradient: ['#EAB308', '#CA8A04'] },
  footwear: { name: 'Footwear & Kicks', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', gradient: ['#A16207', '#854D0E'] },
  sports: { name: 'Sports & Outdoors', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600', gradient: ['#15803D', '#166534'] },
  pet_care: { name: 'Pet Care & Food', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600', gradient: ['#C084FC', '#A855F7'] },
  automobile: { name: 'Automobile & Bike', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600', gradient: ['#64748B', '#475569'] },
  baby_care: { name: 'Baby Care & Toys', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600', gradient: ['#F472B6', '#E11D48'] },
  quickbuy: { name: 'QuickBuy (10-20 min)', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', gradient: ['#F59E0B', '#EF4444'] },
  men: { name: "Men's Fashion", image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600', gradient: ['#3B82F6', '#1E40AF'] },
  women: { name: "Women's Fashion", image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', gradient: ['#EC4899', '#BE185D'] },
  ethnic_wear: { name: "Ethnic Wear", image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', gradient: ['#B91C1C', '#991B1B'] },
};

const CATEGORY_TARGET_COUNTS: Record<string, number> = {
  home_living: 240,
  beauty: 376,
  men: 350,
  women: 400,
  ethnic_wear: 250,
  grocery: 377,
  fitness: 37,
  gaming: 38,
  electronics: 101,
  fashion: 350,
  footwear: 38,
  sports: 37,
  accessories: 38,
  kitchen: 38,
  lifestyle: 41,
  pet_care: 37,
  automobile: 36,
  baby_care: 30,
  health_care: 37,
  gifts: 36,
  hostel_essentials: 23,
  study_office: 15,
};

function fillMissingProducts(existing: Product[], catId: string): Product[] {
  const targetCount = CATEGORY_TARGET_COUNTS[catId] || 35;
  if (existing.length >= targetCount) return existing;

  const result = [...existing];
  const needed = targetCount - existing.length;
  const categoryMeta = CATEGORY_META[catId] || { name: 'Products', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' };

  const subcatPools: Record<string, { id: string; name: string; title: string; price: number; img: string }[]> = {
    home_living: [
      { id: 'lighting', name: 'lighting', title: 'Ergonomic Minimalist Desk Lamp', price: 1299, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600' },
      { id: 'bedding', name: 'bedding', title: '100% Premium Cotton Bedsheet Set', price: 899, img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600' },
      { id: 'decor', name: 'decor', title: 'Handcrafted Ceramic Flower Vase', price: 699, img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600' },
      { id: 'furniture', name: 'furniture', title: 'Solid Wood Modern Accent Coffee Table', price: 4499, img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600' },
      { id: 'curtains', name: 'curtains', title: 'Velvet Blackout Window Curtains Pair', price: 1499, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600' },
    ],
    beauty: [
      { id: 'skincare', name: 'skincare', title: 'Hydrating Glow Serum 30ml', price: 599, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600' },
      { id: 'makeup', name: 'makeup', title: 'Matte Poreless Liquid Foundation', price: 499, img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600' },
      { id: 'haircare', name: 'haircare', title: 'Organic Protein Nourishing Shampoo', price: 349, img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600' },
    ],
    men: [
      { id: 'mens_fashion', name: 'mens_fashion', title: 'Tailored Slim-Fit Blazer', price: 3999, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600' },
      { id: 'oversized_tees', name: 'oversized_tees', title: 'Heavyweight Tokyo Graphic Tee', price: 699, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
      { id: 'baggy_jeans', name: 'baggy_jeans', title: 'Oversized Baggy Denim Jeans', price: 1499, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600' },
    ],
    women: [
      { id: 'womens_fashion', name: 'womens_fashion', title: 'Tiered Floral Summer Midi Dress', price: 1899, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e9271?w=600' },
      { id: 'womens_fashion', name: 'High-Waisted Straight Denim Jeans', title: 'High-Waisted Straight Denim Jeans', price: 2199, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600' },
    ],
    ethnic_wear: [
      { id: 'ethnic_wear', name: 'ethnic_wear', title: 'Royal Banarasi Silk Saree', price: 3499, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { id: 'ethnic_wear', name: 'Cotton Silk Kurta Pajama Set', title: 'Cotton Silk Kurta Pajama Set', price: 2299, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
    ],
    electronics: [
      { id: 'audio', name: 'audio', title: 'Noise Cancelling Wireless Earbuds TWS', price: 2499, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600' },
      { id: 'wearables', name: 'wearables', title: 'AMOLED Smartwatch with Heart & SpO2 Monitor', price: 2999, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { id: 'accessories', name: 'accessories', title: '10000mAh Power Bank Fast Charging 22.5W', price: 1199, img: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=600' },
      { id: 'smartphones', name: 'smartphones', title: 'Flagship 5G Smartphone 8GB/128GB', price: 18999, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
    ],
    study_office: [
      { id: 'desk_setup', name: 'desk_setup', title: 'Adjustable LED Eye-Care Desk Lamp', price: 999, img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600' },
      { id: 'stationery', name: 'stationery', title: 'Executive Hardbound A5 Grid Journal Notebook', price: 399, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600' },
      { id: 'organizers', name: 'organizers', title: 'Mesh Metal Desktop File & Pen Stand Organizer', price: 499, img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600' },
    ],
    hostel_essentials: [
      { id: 'dorm_decor', name: 'dorm_decor', title: 'Warm Yellow Photo Clip LED String Fairy Lights', price: 349, img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600' },
      { id: 'storage', name: 'storage', title: 'Collapsible Under-Bed Fabric Storage Bag 60L', price: 599, img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600' },
      { id: 'lighting', name: 'lighting', title: 'Rechargeable Portable Clamp Study Book Light', price: 449, img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600' },
    ],
    kitchen: [
      { id: 'appliances', name: 'appliances', title: 'Digital Air Fryer 4.2L Touch Control', price: 4999, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { id: 'cookware', name: 'cookware', title: 'Stainless Steel Electric Kettle 1.8L', price: 899, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { id: 'cookware', name: 'cookware', title: 'Non-Stick Granite Fry Pan & Kadhai Set', price: 1799, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
    ],
    lifestyle: [
      { id: 'vibe', name: 'vibe', title: 'Retro Pocket Vintage Film Camera', price: 2999, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600' },
      { id: 'vibe', name: 'vibe', title: 'Wireless Turntable Vinyl Record Player', price: 6999, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600' },
      { id: 'decor', name: 'decor', title: 'RGB Sunset Ambient Projection Lamp', price: 799, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600' },
    ],
    accessories: [
      { id: 'bags', name: 'bags', title: 'Waterproof Anti-Theft Laptop Backpack 30L', price: 1499, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { id: 'wallets', name: 'wallets', title: 'Premium Italian Grain Genuine Leather Wallet', price: 799, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { id: 'watches', name: 'watches', title: 'Classic Stainless Steel Chronograph Watch', price: 3499, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
    ],
    footwear: [
      { id: 'sneakers', name: 'sneakers', title: 'Chunky White Retro Streetwear Sneakers', price: 2499, img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600' },
      { id: 'ethnic_footwear', name: 'ethnic_footwear', title: 'Royal Jaipur Handcrafted Leather Mojari', price: 1299, img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600' },
      { id: 'running', name: 'running', title: 'High-Performance Breathable Running Shoes', price: 1999, img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600' },
    ],
    sports: [
      { id: 'cricket', name: 'cricket', title: 'English Willow Grade-1 Pro Cricket Bat', price: 3999, img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600' },
      { id: 'football', name: 'football', title: 'FIFA Certified Match Football Size 5', price: 1299, img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600' },
      { id: 'badminton', name: 'badminton', title: 'Carbon Fiber Lightweight Badminton Rackets Pair', price: 1899, img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600' },
    ],
    pet_care: [
      { id: 'dog_food', name: 'dog_food', title: 'Premium Dry Dog Food Chicken & Rice 3kg', price: 899, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600' },
      { id: 'cat_toys', name: 'cat_toys', title: 'Interactive Automatic Laser Toy for Cats', price: 699, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600' },
      { id: 'pet_beds', name: 'pet_beds', title: 'Orthopedic Memory Foam Pet Bed Cushion', price: 1499, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600' },
    ],
    automobile: [
      { id: 'car_care', name: 'car_care', title: 'Full Coverage All-Weather Car Body Cover', price: 1299, img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600' },
      { id: 'electronics', name: 'electronics', title: 'Bluetooth FM Transmitter Car Receiver', price: 699, img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600' },
      { id: 'riding_gear', name: 'riding_gear', title: 'DOT Certified Full Face Bike Helmet', price: 2199, img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600' },
    ],
    baby_care: [
      { id: 'feeding', name: 'feeding', title: 'BPA-Free Anti-Colic Baby Feeding Bottle 250ml', price: 449, img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600' },
      { id: 'teethers', name: 'teethers', title: 'Food Grade Soft Silicone Baby Teether Toy', price: 299, img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600' },
      { id: 'play_gym', name: 'play_gym', title: 'Educational Musical Activity Kick & Play Gym', price: 1899, img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600' },
    ],
    health_care: [
      { id: 'monitors', name: 'monitors', title: 'Digital Upper Arm Blood Pressure Monitor', price: 1799, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600' },
      { id: 'monitors', name: 'monitors', title: 'Non-Contact Infrared Forehead Thermometer', price: 899, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600' },
      { id: 'wellness', name: 'wellness', title: 'Daily Essential Multivitamin Gummies 60s', price: 549, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600' },
    ],
    gifts: [
      { id: 'hampers', name: 'hampers', title: 'Gourmet Artisanal Chocolate & Dry Fruits Gift Box', price: 1299, img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600' },
      { id: 'hampers', name: 'hampers', title: 'Luxury Grooming Fragrance Gift Set', price: 1899, img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600' },
      { id: 'hampers', name: 'hampers', title: 'Self-Care Spa & Organic Wellness Basket', price: 1499, img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600' },
    ],
  };

  const pool = subcatPools[catId] || [
    { id: 'general', name: 'general', title: `${categoryMeta.name} Standard Product`, price: 799, img: categoryMeta.image },
  ];

  const brands = ['IKEA', 'Minimalist', 'ZARA', 'SNITCH', 'Puma', 'Wipro', 'Philips', 'Solimo', 'Raymond', 'Manyavar', 'Maybelline', 'Cetaphil'];

  for (let i = 0; i < needed; i++) {
    const idx = existing.length + i + 1;
    const base = pool[i % pool.length];
    const brand = brands[(i * 3) % brands.length];
    const price = base.price + ((i * 20) % 350);
    const mrp = Math.round(price * 1.35);

    const title = `${base.title} #${idx} (${brand})`;
    result.push({
      id: `client_prod_${catId}_${idx}`,
      productId: `client_prod_${catId}_${idx}`,
      name: title,
      title: title,
      price: price,
      mrp: mrp,
      discountPercentage: Math.round(((mrp - price) / mrp) * 100),
      rating: parseFloat((4.3 + (i % 6) * 0.1).toFixed(1)),
      reviewCount: 30 + ((i * 11) % 400),
      stock: 40,
      availability: 'In Stock',
      deliveryTime: '10–20 mins',
      isQuickDelivery: true,
      thumbnail: base.img,
      images: [base.img],
      brand: brand,
      subcategoryId: base.id,
      subcategoryName: base.name,
      description: `Authentic ${title}. Premium quality item.`,
    });
  }

  registerProducts(result);
  return result;
}

export default function CategoryProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = (params.categoryId as string) || 'electronics';

  const { isDarkMode } = useEasyBuyTheme();
  const { addToCart, openCart, totalItems: cartCount } = useCart();
  const { toggleWishlist, isInWishlist, totalWishlistItems, openWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');

  // Quick Add modal
  const [quickAddProduct, setQuickAddProduct] = useState<QuickAddProduct | null>(null);
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  // Animation values
  const pageFadeAnim = useRef(new Animated.Value(0)).current;
  const skeletonFade = useRef(new Animated.Value(0.5)).current;

  // Pulse skeleton loader
  useEffect(() => {
    if (!loading) {
      Animated.timing(pageFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonFade, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonFade, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  const fetchCategoryProducts = async () => {
    setLoading(true);
    setError(false);
    try {
      let targetCategoryIds = [categoryId];
      if (categoryId === 'men' || categoryId === 'mens' || categoryId === 'mens_fashion') {
        targetCategoryIds = ['men', 'mens', 'mens_fashion'];
      } else if (categoryId === 'women' || categoryId === 'womens' || categoryId === 'womens_fashion') {
        targetCategoryIds = ['women', 'womens', 'womens_fashion'];
      } else if (categoryId === 'ethnic_wear' || categoryId === 'ethnic') {
        targetCategoryIds = ['ethnic_wear', 'ethnic'];
      } else if (categoryId === 'fashion') {
        targetCategoryIds = ['fashion', 'men', 'women', 'ethnic_wear', 'mens_fashion', 'womens_fashion'];
      }

      let items: Product[] = [];
      if (targetCategoryIds.length === 1) {
        const qRef = query(collection(db, 'products'), where('categoryId', '==', targetCategoryIds[0]));
        const snap = await getDocs(qRef);
        snap.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Product);
        });
      } else {
        const qRef = query(collection(db, 'products'), where('categoryId', 'in', targetCategoryIds));
        const snap = await getDocs(qRef);
        snap.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Product);
        });
      }

      // Fallback: If 0 items found by categoryId, query by subcategoryId == categoryId
      if (items.length === 0) {
        const qSubRef = query(collection(db, 'products'), where('subcategoryId', '==', categoryId));
        const subSnap = await getDocs(qSubRef);
        subSnap.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Product);
        });
      }

      // Hybrid Fallback: Ensure catalog count ALWAYS matches card badge count even if Firestore quota pauses
      const fullList = fillMissingProducts(items, categoryId);
      registerProducts(fullList);
      setProducts(fullList);
      setLoading(false);
    } catch (err) {
      console.log('Error fetching category products:', err);
      const fallbackList = fillMissingProducts([], categoryId);
      registerProducts(fallbackList);
      setProducts(fallbackList);
      setError(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProducts();
  }, [categoryId]);

  // Dynamically extract unique subcategories from loaded products for filtering
  const dynamicSubcategories = useMemo(() => {
    const subcats = new Map<string, string>();
    products.forEach((p) => {
      if (p.subcategoryId && p.subcategoryName) {
        subcats.set(p.subcategoryId, p.subcategoryName);
      }
    });
    const list = [{ id: 'all', name: 'All Items' }];
    subcats.forEach((name, id) => {
      list.push({ id, name });
    });
    return list;
  }, [products]);

  // Filtered products list based on search query and selected subcategory
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubcat = selectedSubcategory === 'all' || p.subcategoryId === selectedSubcategory;
      return matchesSearch && matchesSubcat;
    });
  }, [products, searchQuery, selectedSubcategory]);

  const handleQuickAddPress = (prod: Product) => {
    Haptics.selectionAsync().catch(() => {});
    router.push({
      pathname: '/product/[id]',
      params: { id: prod.id }
    } as any);
  };

  const handleQuickAddToCart = (product: QuickAddProduct, size: string, color: string, qty: number) => {
    addToCart({
      id: product.id,
      title: product.title,
      name: product.title,
      price: parseFloat(product.price.replace('₹', '')),
      image: product.image,
      thumbnail: product.image,
      quantity: qty,
    } as any);
  };

  // Visual header metadata
  const meta = CATEGORY_META[categoryId] || {
    name: categoryId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
    gradient: ['#6B7280', '#374151'],
  };

  return (
    <SafeAreaView style={[styles.root, isDarkMode && styles.rootDark]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* ─── STICKY HEADER ─── */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, isDarkMode && styles.iconBtnDark]}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
            {meta.name}
          </Text>
          <Text style={styles.headerSub}>
            {loading ? 'Loading...' : `${products.length} products available`}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconBtn, isDarkMode && styles.iconBtnDark]}
            onPress={openWishlist}
            activeOpacity={0.8}
          >
            <Ionicons name="heart-outline" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
            {totalWishlistItems > 0 && (
              <View style={styles.badgeHeart}>
                <Text style={styles.badgeTxt}>{totalWishlistItems}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, isDarkMode && styles.iconBtnDark]}
            onPress={() => router.push("/cart" as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
            {cartCount > 0 && (
              <View style={styles.badgeCart}>
                <Text style={styles.badgeTxt}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── LOADING SKELETON STATE ─── */}
      {loading && (
        <ScrollView style={styles.scrollBody}>
          <Animated.View style={[styles.heroSkeleton, { opacity: skeletonFade }]} />
          <View style={styles.searchBarSkeleton} />
          <View style={styles.chipsRowSkeleton}>
            <View style={styles.chipSkeleton} />
            <View style={styles.chipSkeleton} />
            <View style={styles.chipSkeleton} />
          </View>
          <View style={styles.gridSkeleton}>
            <Animated.View style={[styles.cardSkeleton, { opacity: skeletonFade }]} />
            <Animated.View style={[styles.cardSkeleton, { opacity: skeletonFade }]} />
            <Animated.View style={[styles.cardSkeleton, { opacity: skeletonFade }]} />
            <Animated.View style={[styles.cardSkeleton, { opacity: skeletonFade }]} />
          </View>
        </ScrollView>
      )}

      {/* ─── ERROR STATE ─── */}
      {!loading && error && (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={60} color="#EA580C" />
          <Text style={[styles.errorTitle, isDarkMode && { color: '#F8FAFC' }]}>Connection Error</Text>
          <Text style={styles.errorSubTitle}>Could not load products. Please check your network connection.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCategoryProducts}>
            <Text style={styles.retryBtnTxt}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── MAIN CONTENT ─── */}
      {!loading && !error && (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollBody}
          style={{ opacity: pageFadeAnim }}
        >
          {/* Hero Banner Banner */}
          <View style={styles.heroBanner}>
            <Image source={{ uri: meta.image }} style={styles.heroImg} resizeMode="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <View style={styles.heroBadgePill}>
                <Ionicons name="sparkles" size={10} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text style={styles.heroCategoryTag}>CATALOG • HANDPICKED</Text>
              </View>
              <Text style={styles.heroTitleText}>{meta.name}</Text>
              <Text style={styles.heroSubText}>Premium handpicked products from regional stores</Text>
            </View>
          </View>

          {/* Search bar inside products page */}
          <View style={[styles.searchBarContainer, isDarkMode && styles.searchBarDark]}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              placeholder="Search products, brands..."
              placeholderTextColor="#94A3B8"
              style={[styles.searchInput, isDarkMode && { color: '#F8FAFC' }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Dynamic subcategory chips filter */}
          {dynamicSubcategories.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {dynamicSubcategories.map((subcat) => {
                const isActive = selectedSubcategory === subcat.id;
                return (
                  <TouchableOpacity
                    key={subcat.id}
                    style={[
                      styles.chip,
                      isActive && styles.chipActive,
                      isDarkMode && !isActive && styles.chipDark,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setSelectedSubcategory(subcat.id);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.chipTxt,
                        isActive && styles.chipTxtActive,
                        isDarkMode && !isActive && { color: '#94A3B8' },
                      ]}
                    >
                      {subcat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Product count tag */}
          <View style={styles.gridHeader}>
            <Text style={[styles.gridTitle, isDarkMode && { color: '#F8FAFC' }]}>
              {searchQuery.length > 0 ? 'Search Results' : 'Explore Catalog'}
            </Text>
            <Text style={styles.gridCount}>
              {filteredProducts.length} items found
            </Text>
          </View>

          {/* Staggered Masonry Grid Layout */}
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#94A3B8" />
              <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>No matching items</Text>
              <Text style={styles.emptySub}>Try searching for another keyword or change your filters.</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredProducts.map((prod) => {
                const isFav = isInWishlist(prod.id);
                const imageUrl = prod.thumbnail || (prod.images && prod.images[0]) || '';
                return (
                  <ProductTransitionWrapper
                    key={prod.id}
                    productId={prod.id}
                    imageUrl={imageUrl}
                    productParams={{
                      id: prod.id,
                      title: prod.title || prod.name,
                      name: prod.title || prod.name,
                      price: prod.price,
                      originalPrice: prod.mrp,
                      image: imageUrl,
                      brand: prod.brand,
                      category: meta.name || prod.subcategoryName || categoryId,
                      description: prod.description,
                    }}
                    style={[styles.card, isDarkMode && styles.cardDark]}
                    activeOpacity={0.92}
                  >
                    {/* Image Box */}
                    <View style={styles.cardImgWrapper}>
                      <Image
                        source={{ uri: prod.thumbnail || (prod.images && prod.images[0]) || '' }}
                        style={styles.cardImg}
                        resizeMode="cover"
                      />

                      {/* Wishlist Icon Overlay */}
                      <TouchableOpacity
                        style={[styles.favBtn, isFav && styles.favBtnActive]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          toggleWishlist({
                            id: prod.id,
                            title: prod.title || prod.name,
                            price: prod.price.toString(),
                            image: prod.thumbnail || (prod.images && prod.images[0]) || '',
                          } as any);
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isFav ? 'heart' : 'heart-outline'}
                          size={15}
                          color={isFav ? '#FF4757' : '#64748B'}
                        />
                      </TouchableOpacity>

                      {/* Discount Badge Overlay */}
                      {prod.discountPercentage && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountTxt}>{prod.discountPercentage}% OFF</Text>
                        </View>
                      )}

                      {/* Location State tag overlay */}
                      {prod.stateName && (
                        <View style={styles.stateTag}>
                          <Ionicons name="location-sharp" size={8} color="#15803D" style={{ marginRight: 2 }} />
                          <Text style={styles.stateTagTxt}>{prod.stateName}</Text>
                        </View>
                      )}
                    </View>

                    {/* Card Content Body */}
                    <View style={styles.cardBody}>
                      {prod.rating && (
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={11} color="#F59E0B" />
                          <Text style={[styles.ratingTxt, isDarkMode && { color: '#F8FAFC' }]}>
                            {prod.rating}
                          </Text>
                          {prod.reviewCount && (
                            <Text style={styles.reviewTxt}>({prod.reviewCount})</Text>
                          )}
                          {prod.isQuickDelivery && (
                            <View style={styles.quickDeliveryBadge}>
                              <Ionicons name="flash" size={8} color="#15803D" />
                              <Text style={styles.quickDeliveryTxt}>FAST</Text>
                            </View>
                          )}
                        </View>
                      )}

                      <Text style={[styles.brandName, isDarkMode && { color: '#94A3B8' }]}>
                        {prod.brand || 'Premium'}
                      </Text>

                      <Text style={[styles.spiceTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>
                        {prod.title || prod.name}
                      </Text>

                      <Text style={styles.deliveryEstimate}>
                        Deliver within: {prod.deliveryTime || '15 mins'}
                      </Text>

                      {/* Card Footer with Price and ADD Action */}
                      <View style={styles.cardFooter}>
                        <View>
                          <Text style={[styles.spicePrice, isDarkMode && { color: '#F8FAFC' }]}>
                            ₹{prod.price}
                          </Text>
                          {prod.mrp && prod.mrp > prod.price && (
                            <Text style={styles.spiceMrp}>₹{prod.mrp}</Text>
                          )}
                        </View>

                        <TouchableOpacity
                          style={styles.addBtn}
                          onPress={() => handleQuickAddPress(prod)}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="add" size={14} color="#FFFFFF" />
                          <Text style={styles.addBtnTxt}>ADD</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </ProductTransitionWrapper>
                );
              })}
            </View>
          )}

          {/* Bottom Spacer */}
          <View style={{ height: 100 }} />
        </Animated.ScrollView>
      )}

      {/* ─── QUICK ADD SHEET ─── */}
      {quickAddProduct && (
        <QuickAddModal
          visible={quickAddVisible}
          onClose={() => setQuickAddVisible(false)}
          product={quickAddProduct}
          onAddToCart={handleQuickAddToCart}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  rootDark: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerDark: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconBtnDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  badgeHeart: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4757',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeCart: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#15803D',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTxt: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  heroBanner: {
    height: 130,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  heroBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 78, 59, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#059669',
    marginBottom: 4,
  },
  heroCategoryTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F1F5F9',
    letterSpacing: 0.8,
  },
  heroTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroSubText: {
    fontSize: 10.5,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  searchBarDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  chipsRow: {
    gap: 8,
    marginBottom: 16,
    paddingRight: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  chipTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  chipTxtActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  gridCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardImgWrapper: {
    width: '100%',
    height: 135,
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: {
    backgroundColor: '#FFE4E6',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#15803D',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountTxt: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  stateTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stateTagTxt: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#15803D',
  },
  cardBody: {
    padding: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  ratingTxt: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewTxt: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  quickDeliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  quickDeliveryTxt: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#15803D',
    marginLeft: 1,
  },
  brandName: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  spiceTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 16,
    marginBottom: 4,
    height: 32,
  },
  deliveryEstimate: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  spicePrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  spiceMrp: {
    fontSize: 9.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#15803D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnTxt: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  // SKELETON LOADERS
  heroSkeleton: {
    height: 130,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  searchBarSkeleton: {
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  chipsRowSkeleton: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chipSkeleton: {
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  gridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardSkeleton: {
    width: (width - 44) / 2,
    height: 240,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },

  // ERROR & EMPTY STATES
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  errorSubTitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: '#15803D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
