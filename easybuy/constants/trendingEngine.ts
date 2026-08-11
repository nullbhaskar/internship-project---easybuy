import { generateFullIndianCatalog } from './mockDataGenerator';
import { db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export interface SmartTrendingBanner {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  bgLight: string;
  bgDark: string;
  textColorLight: string;
  textColorDark: string;
  image: string;
  collectionId: string;
  priority: number;
  stateCode?: string;
  isFlashSale?: boolean;
  saleEndTime?: number; // timestamp in ms for live countdown
  featuredProduct: {
    id: string;
    title: string;
    price: string;
    originalPrice: string;
    discount: string;
    image: string;
  };
}

export interface SmartContext {
  userStateCode?: string; // e.g., 'KL', 'BR', 'PB', 'WB', 'RJ', 'DL', 'MH', 'TN', etc.
  weatherType?: 'rain' | 'hot' | 'cold' | 'clear';
  forceFlashSale?: boolean;
  festivalOverride?: string;
}

const catalog = generateFullIndianCatalog();
const milkItem = catalog.find((p) => p.name.includes('Milk')) || catalog[0];
const pepperItem = catalog.find((p) => p.name.includes('Pepper')) || catalog[1];
const snackItem = catalog.find((p) => p.categoryId === 'snacks') || catalog[2];
const teaItem = catalog.find((p) => p.name.includes('Tea')) || catalog[3];
const sattuItem = catalog.find((p) => p.name.includes('Sattu')) || catalog[4];

// Tracking Last Banner ID to prevent back-to-back duplicate banners
let lastBannerId: string | null = null;
let localPoolCache: { candidates: SmartTrendingBanner[]; key: string; timestamp: number } | null = null;
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 mins cache

// ─── 1. RICH MULTI-ITEM STATE-SPECIFIC BANNER POOLS ───
const STATE_BANNER_POOLS: Record<string, SmartTrendingBanner[]> = {
  BR: [
    {
      id: 'br_sattu_1',
      stateCode: 'BR',
      tag: '🌾 BIHAR SPECIALTY HARVEST',
      title: 'Patna Roasted Chana Sattu & Makhana',
      subtitle: 'Traditional protein sattu ground from roasted gram in Patna.',
      ctaText: 'Order Sattu • ₹189',
      bgLight: '#FEFCE8',
      bgDark: '#2E2A00',
      textColorLight: '#854D0E',
      textColorDark: '#FEF08A',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: sattuItem?.id || 'local_br_1',
        title: sattuItem?.name || 'Organic Roasted Chana Sattu 1kg',
        price: '₹189',
        originalPrice: '₹249',
        discount: '24% OFF',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: 'br_litti_2',
      stateCode: 'BR',
      tag: '🍲 LITTI CHOKHA SPECIAL',
      title: 'Mithila Litti Spice & Ajwain Mix',
      subtitle: 'Authentic Ajwain & Kalonji infused spice blend for home litti.',
      ctaText: 'Explore Litti Pack • ₹129',
      bgLight: '#FFF7ED',
      bgDark: '#431407',
      textColorLight: '#9A3412',
      textColorDark: '#FDBA74',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_br_2',
        title: 'Litti Chokha Special Spice Mix Pack',
        price: '₹129',
        originalPrice: '₹179',
        discount: '28% OFF',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: 'br_makhana_3',
      stateCode: 'BR',
      tag: '✨ DARBHANGA FOXNUTS',
      title: 'Crispy Jumbo Grade-A Roasted Makhana',
      subtitle: 'Fresh roasted foxnuts sourced directly from Darbhanga wetlands.',
      ctaText: 'Order Makhana • ₹449',
      bgLight: '#ECFDF5',
      bgDark: '#064E3B',
      textColorLight: '#065F46',
      textColorDark: '#6EE7B7',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_br_3',
        title: 'Premium Darbhanga Makhana 500g',
        price: '₹449',
        originalPrice: '₹599',
        discount: '25% OFF',
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: 'br_art_4',
      stateCode: 'BR',
      tag: '🎨 MITHILA ART & SILK',
      title: 'Handpainted Madhubani Canvas & Silk Stole',
      subtitle: 'Authentic folk art framed on natural cotton canvas.',
      ctaText: 'Explore Folk Art • ₹899',
      bgLight: '#FCE7F3',
      bgDark: '#4C0519',
      textColorLight: '#BE185D',
      textColorDark: '#FBCFE8',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_br_4',
        title: 'Handcrafted Madhubani Painting Canvas',
        price: '₹899',
        originalPrice: '₹1499',
        discount: '40% OFF',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
      },
    },
  ],

  WB: [
    {
      id: 'wb_tea_1',
      stateCode: 'WB',
      tag: '🫖 BENGAL TEA TRAIL',
      title: 'Darjeeling First Flush Whole Leaf Tea',
      subtitle: 'Muscatel single-origin spring harvest black tea.',
      ctaText: 'Explore Tea Trail • ₹699',
      bgLight: '#ECFDF5',
      bgDark: '#064E3B',
      textColorLight: '#065F46',
      textColorDark: '#6EE7B7',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: teaItem?.id || 'local_wb_1',
        title: teaItem?.name || 'Darjeeling First Flush Whole Leaf Tea 250g',
        price: '₹699',
        originalPrice: '₹899',
        discount: '22% OFF',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: 'wb_honey_2',
      stateCode: 'WB',
      tag: '🍯 SUNDARBAN WILD HARVEST',
      title: 'Sundarban Raw Wild Forest Honey',
      subtitle: 'Unfiltered natural mangrove forest honey from Bengal.',
      ctaText: 'Order Honey • ₹429',
      bgLight: '#FEFCE8',
      bgDark: '#2E2A00',
      textColorLight: '#854D0E',
      textColorDark: '#FEF08A',
      image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d33?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_wb_2',
        title: 'Sundarban Raw Wild Forest Honey 500g',
        price: '₹429',
        originalPrice: '₹550',
        discount: '22% OFF',
        image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d33?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: 'wb_sweets_3',
      stateCode: 'WB',
      tag: '🍬 BENGALI MISHTI SPECIAL',
      title: 'Kolkata Nolen Gur Rosogolla Box',
      subtitle: 'Authentic date palm jaggery infused cottage cheese sweets.',
      ctaText: 'Get Sweets • ₹249',
      bgLight: '#FFF7ED',
      bgDark: '#431407',
      textColorLight: '#9A3412',
      textColorDark: '#FDBA74',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_wb_3',
        title: 'Kolkata Nolen Gur Rosogolla Box 1kg',
        price: '₹249',
        originalPrice: '₹320',
        discount: '22% OFF',
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
      },
    },
  ],

  PB: [
    {
      id: 'pb_papad_1',
      stateCode: 'PB',
      tag: '🥛 PUNJAB DESI HERITAGE',
      title: 'Amritsari Spicy Dal Papad & Paneer',
      subtitle: 'Sun-dried black pepper urad papad crafted in Amritsar.',
      ctaText: 'Order Punjabi Pantry • ₹199',
      bgLight: '#FFF3E0',
      bgDark: '#3E1800',
      textColorLight: '#D84315',
      textColorDark: '#FFB74D',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_pb_1',
        title: 'Amritsari Spicy Urad Dal Papad 500g',
        price: '₹199',
        originalPrice: '₹279',
        discount: '28% OFF',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: 'pb_phulkari_2',
      stateCode: 'PB',
      tag: '🧵 PATIALA WEAVES',
      title: 'Traditional Hand Embroidered Phulkari',
      subtitle: 'Vibrant silk thread hand-embroidered Phulkari dupatta.',
      ctaText: 'Explore Phulkari • ₹999',
      bgLight: '#FCE7F3',
      bgDark: '#4C0519',
      textColorLight: '#BE185D',
      textColorDark: '#FBCFE8',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_pb_2',
        title: 'Traditional Phulkari Dupatta',
        price: '₹999',
        originalPrice: '₹1499',
        discount: '33% OFF',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: 'pb_pickle_3',
      stateCode: 'PB',
      tag: '🏺 PIND KITCHEN PICKLES',
      title: 'Homemade Punjabi Mustard Mango Pickle',
      subtitle: 'Spicy mustard oil cured raw mango pickle seasoned with fenugreek.',
      ctaText: 'Order Pickle • ₹299',
      bgLight: '#FEFCE8',
      bgDark: '#2E2A00',
      textColorLight: '#854D0E',
      textColorDark: '#FEF08A',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_pb_3',
        title: 'Homemade Punjabi Mango Pickle 1kg',
        price: '₹299',
        originalPrice: '₹399',
        discount: '25% OFF',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      },
    },
  ],

  KL: [
    {
      id: 'kl_pepper_1',
      stateCode: 'KL',
      tag: '🌴 KERALA HERITAGE SPICE',
      title: 'Wayanad Pepper & Malabar Spices',
      subtitle: 'Authentic spice harvests directly from Kerala gardens.',
      ctaText: 'Explore Spice • ₹349',
      bgLight: '#FFF7ED',
      bgDark: '#431407',
      textColorLight: '#9A3412',
      textColorDark: '#FDBA74',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: pepperItem?.id || 'local_kl_1',
        title: pepperItem?.name || 'Wayanad Whole Black Pepper 250g',
        price: '₹349',
        originalPrice: '₹449',
        discount: '22% OFF',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: 'kl_chips_2',
      stateCode: 'KL',
      tag: '🍌 MALABAR BITES',
      title: 'Thin & Crispy Coconut Oil Banana Chips',
      subtitle: 'Thinly sliced Nendran bananas fried in 100% pure coconut oil.',
      ctaText: 'Order Chips • ₹249',
      bgLight: '#FEFCE8',
      bgDark: '#2E2A00',
      textColorLight: '#854D0E',
      textColorDark: '#FEF08A',
      image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_kl_2',
        title: 'Thin & Crispy Coconut Oil Banana Chips 500g',
        price: '₹249',
        originalPrice: '₹320',
        discount: '22% OFF',
        image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: 'kl_oil_3',
      stateCode: 'KL',
      tag: '🥥 KERALA BOTANICALS',
      title: 'Pure Cold Pressed Virgin Coconut Oil',
      subtitle: 'Raw unrefined virgin coconut oil pressed from fresh coconuts.',
      ctaText: 'Order Oil • ₹499',
      bgLight: '#ECFDF5',
      bgDark: '#064E3B',
      textColorLight: '#065F46',
      textColorDark: '#6EE7B7',
      image: 'https://images.unsplash.com/photo-1608248597261-e97d747f7b6f?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_kl_3',
        title: 'Pure Cold Pressed Virgin Coconut Oil 1L',
        price: '₹499',
        originalPrice: '₹649',
        discount: '23% OFF',
        image: 'https://images.unsplash.com/photo-1608248597261-e97d747f7b6f?w=600&auto=format&fit=crop&q=80',
      },
    },
  ],

  RJ: [
    {
      id: 'rj_mojari_1',
      stateCode: 'RJ',
      tag: '👑 ROYAL RAJASTHAN',
      title: 'Handcrafted Jodhpuri Leather Mojari',
      subtitle: 'Genuine leather handcrafted Mojari shoes with embroidery.',
      ctaText: 'Explore Mojari • ₹1199',
      bgLight: '#FCE7F3',
      bgDark: '#4C0519',
      textColorLight: '#BE185D',
      textColorDark: '#FBCFE8',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_rj_1',
        title: 'Handcrafted Jodhpuri Leather Mojari',
        price: '₹1199',
        originalPrice: '₹1799',
        discount: '33% OFF',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: 'rj_pottery_2',
      stateCode: 'RJ',
      tag: '🎨 JAIPUR ARTISANS',
      title: 'Jaipur Blue Pottery Decorative Vase',
      subtitle: 'Hand-painted ceramic blue pottery vase with classic floral motifs.',
      ctaText: 'Explore Pottery • ₹849',
      bgLight: '#F0F9FF',
      bgDark: '#0C4A6E',
      textColorLight: '#0369A1',
      textColorDark: '#7DD3FC',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_rj_2',
        title: 'Jaipur Blue Pottery Decorative Vase',
        price: '₹849',
        originalPrice: '₹1299',
        discount: '35% OFF',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
      },
    },
  ],

  DL: [
    {
      id: 'dl_tech_1',
      stateCode: 'DL',
      tag: '⚡ CAPITAL TECH & GAMING',
      title: 'Cyberpunk RGB Gaming Desk Setup',
      subtitle: 'XL extended desk mat with 14 RGB lighting modes.',
      ctaText: 'Explore Tech • ₹799',
      bgLight: '#F3E8FF',
      bgDark: '#3B0764',
      textColorLight: '#7E22CE',
      textColorDark: '#E9D5FF',
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80',
      collectionId: 'quick_essentials',
      priority: 100,
      featuredProduct: {
        id: 'local_dl_1',
        title: 'Cyberpunk RGB Gaming Mouse Pad',
        price: '₹799',
        originalPrice: '₹1299',
        discount: '38% OFF',
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: 'dl_masala_2',
      stateCode: 'DL',
      tag: '🥘 CHANDNI CHOWK SPICES',
      title: 'Chandni Chowk Special Garam Masala',
      subtitle: 'Fragrant small-batch ground whole spice mix.',
      ctaText: 'Order Spices • ₹149',
      bgLight: '#FFF7ED',
      bgDark: '#431407',
      textColorLight: '#9A3412',
      textColorDark: '#FDBA74',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      collectionId: 'regional_delights',
      priority: 100,
      featuredProduct: {
        id: 'local_dl_2',
        title: 'Chandni Chowk Special Garam Masala 200g',
        price: '₹149',
        originalPrice: '₹210',
        discount: '29% OFF',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      },
    },
  ],
};

// ─── 2. WEATHER BANNERS ───
const WEATHER_BANNERS: Record<string, SmartTrendingBanner> = {
  rain: {
    id: 'weather_rain',
    tag: '🌧️ MONSOON COZY SPECIAL',
    title: 'Hot Darjeeling Chai & Crispy Samosas',
    subtitle: 'Rainy day outside? Enjoy steaming tea & hot samosas.',
    ctaText: 'Order Monsoon Combo • ₹149',
    bgLight: '#EFF6FF',
    bgDark: '#1E3A8A',
    textColorLight: '#1D4ED8',
    textColorDark: '#93C5FD',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    collectionId: 'quick_essentials',
    priority: 70,
    featuredProduct: {
      id: 'rain_1',
      title: 'Hot Chai & Samosa Combo',
      price: '₹149',
      originalPrice: '₹199',
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    },
  },
  hot: {
    id: 'weather_hot',
    tag: '☀️ SUMMER REFRESH COOLERS',
    title: 'Ice Cold Beverages & Gourmet Ice Cream',
    subtitle: 'Beat the heat with chilled juices, sodas & ice cream blocks.',
    ctaText: 'Get Chilled Deals • ₹99',
    bgLight: '#DCFCE7',
    bgDark: '#052E16',
    textColorLight: '#15803D',
    textColorDark: '#86EFAC',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&auto=format&fit=crop&q=80',
    collectionId: 'quick_essentials',
    priority: 70,
    featuredProduct: {
      id: 'hot_1',
      title: 'Chilled Fruit Soda Pack of 4',
      price: '₹99',
      originalPrice: '₹140',
      discount: '29% OFF',
      image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&auto=format&fit=crop&q=80',
    },
  },
  cold: {
    id: 'weather_cold',
    tag: '❄️ WINTER WARMING ESSENTIALS',
    title: 'Hot Cocoa, Soups & Dark Roast Coffee',
    subtitle: 'Stay warm with premium gourmet coffee & steaming soups.',
    ctaText: 'Warm Up • ₹199',
    bgLight: '#F5F3FF',
    bgDark: '#2E1065',
    textColorLight: '#6D28D9',
    textColorDark: '#DDD6FE',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    collectionId: 'quick_essentials',
    priority: 70,
    featuredProduct: {
      id: 'cold_1',
      title: 'Dark Roast Gourmet Coffee 200g',
      price: '₹199',
      originalPrice: '₹299',
      discount: '33% OFF',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    },
  },
};

// ─── 3. TIME OF DAY BANNERS ───
const TIME_BANNERS: Record<string, SmartTrendingBanner> = {
  morning: {
    id: 'time_morning',
    tag: '🌅 MORNING ENERGY BOOST',
    title: 'Fresh Milk, Darjeeling Tea & Bakery',
    subtitle: 'Start your morning with farm-fresh milk, artisan tea & fresh loaves.',
    ctaText: 'Order Morning Pantry • ₹66',
    bgLight: '#FEFCE8',
    bgDark: '#2E2A00',
    textColorLight: '#854D0E',
    textColorDark: '#FEF08A',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80',
    collectionId: 'quick_essentials',
    priority: 50,
    featuredProduct: {
      id: milkItem?.id || 'prod_milk_1',
      title: milkItem?.name || 'Fresh Taaza Whole Milk 1L',
      price: '₹66',
      originalPrice: '₹72',
      discount: '8% OFF',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80',
    },
  },
  afternoon: {
    id: 'time_afternoon',
    tag: '🔥 AFTERNOON PICK-ME-UP',
    title: 'Wayanad Pepper & Malabar Spices',
    subtitle: 'Authentic spice harvests directly from Kerala gardens.',
    ctaText: 'Explore Spice • ₹349',
    bgLight: '#FFF7ED',
    bgDark: '#431407',
    textColorLight: '#9A3412',
    textColorDark: '#FDBA74',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    collectionId: 'regional_delights',
    priority: 50,
    featuredProduct: {
      id: pepperItem?.id || 'local_kl_1',
      title: pepperItem?.name || 'Wayanad Whole Black Pepper 250g',
      price: '₹349',
      originalPrice: '₹449',
      discount: '22% OFF',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    },
  },
  evening: {
    id: 'time_evening',
    tag: '☕ EVENING CHAI & SNACK HOUR',
    title: 'Chai Time Samosas & Regional Namkeen',
    subtitle: 'Pair your evening tea with hot samosas, papad & crunchy namkeen.',
    ctaText: 'Order Evening Snacks • ₹129',
    bgLight: '#FFF3E0',
    bgDark: '#3E1800',
    textColorLight: '#D84315',
    textColorDark: '#FFB74D',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    collectionId: 'regional_delights',
    priority: 50,
    featuredProduct: {
      id: snackItem?.id || 'snack_1',
      title: 'Chai Time Hot Samosas & Namkeen Combo',
      price: '₹129',
      originalPrice: '₹179',
      discount: '28% OFF',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    },
  },
  night: {
    id: 'time_night',
    tag: '🌙 LATE NIGHT CRAVINGS',
    title: 'Midnight Snacks, Drinks & Ice Creams',
    subtitle: 'Late night study session or movie marathon? Fast 10-min delivery.',
    ctaText: 'Get Midnight Fix • ₹149',
    bgLight: '#F3E8FF',
    bgDark: '#1E1B4B',
    textColorLight: '#7E22CE',
    textColorDark: '#E9D5FF',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&auto=format&fit=crop&q=80',
    collectionId: 'late_night_munchies',
    priority: 50,
    featuredProduct: {
      id: 'night_munch',
      title: 'Midnight Snacks & Soda Combo',
      price: '₹149',
      originalPrice: '₹210',
      discount: '30% OFF',
      image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&auto=format&fit=crop&q=80',
    },
  },
};

// ─── 4. FLASH SALE BANNER ───
const FLASH_SALE_BANNER: SmartTrendingBanner = {
  id: 'flash_sale_hero',
  tag: '⚡ FLASH SALE • UP TO 60% OFF',
  title: 'Mega Flash Sale On Instant Pantry',
  subtitle: 'Limited quantity deals expiring soon. Fast 10-min delivery!',
  ctaText: 'Claim Mega Deals • ₹49',
  bgLight: '#FEF2F2',
  bgDark: '#450A0A',
  textColorLight: '#DC2626',
  textColorDark: '#FCA5A5',
  image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
  collectionId: 'quick_essentials',
  priority: 90,
  isFlashSale: true,
  saleEndTime: Date.now() + 1000 * 60 * 60 * 4,
  featuredProduct: {
    id: 'flash_prod_1',
    title: 'Classic Salted Chips & Soda Combo',
    price: '₹49',
    originalPrice: '₹120',
    discount: '59% OFF',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
  },
};

// Helper: Pick a random banner from candidates ensuring non-repetition
function getRandomNonRepeatingBanner(pool: SmartTrendingBanner[]): SmartTrendingBanner {
  if (pool.length === 1) return pool[0];
  const candidates = pool.filter((b) => b.id !== lastBannerId);
  const selected = candidates[Math.floor(Math.random() * candidates.length)] || pool[0];
  lastBannerId = selected.id;
  return selected;
}

// ─── 5. DYNAMIC SMART EVALUATION ENGINE ───
export function getSmartTrendingBannerSync(ctx: SmartContext = {}): SmartTrendingBanner {
  const now = new Date();
  const hour = now.getHours();

  // 1. Check Flash Sale condition (Priority 90)
  if (ctx.forceFlashSale) {
    lastBannerId = FLASH_SALE_BANNER.id;
    return FLASH_SALE_BANNER;
  }

  // 2. Check State Specific Pool (Priority 100) — Always primary when state is set!
  const stateCode = ctx.userStateCode || 'BR';
  const statePool = STATE_BANNER_POOLS[stateCode];

  if (statePool && statePool.length > 0) {
    return getRandomNonRepeatingBanner(statePool);
  }

  // 3. Check Weather Banner (Priority 70)
  if (ctx.weatherType && WEATHER_BANNERS[ctx.weatherType]) {
    const b = WEATHER_BANNERS[ctx.weatherType];
    lastBannerId = b.id;
    return b;
  }

  // 4. Check Time of Day Banner (Priority 50)
  let timeKey = 'morning';
  if (hour >= 5 && hour < 11) {
    timeKey = 'morning';
  } else if (hour >= 11 && hour < 16) {
    timeKey = 'afternoon';
  } else if (hour >= 16 && hour < 21) {
    timeKey = 'evening';
  } else {
    timeKey = 'night';
  }

  const timeBanner = TIME_BANNERS[timeKey];
  lastBannerId = timeBanner.id;
  return timeBanner;
}

// ─── 6. ASYNC FIRESTORE INTEGRATION WITH CACHING & FALLBACK ───
export async function getSmartTrendingBannerAsync(ctx: SmartContext = {}): Promise<SmartTrendingBanner> {
  const now = Date.now();
  const stateCode = ctx.userStateCode || 'BR';
  const cacheKey = `${stateCode}_${ctx.weatherType || 'clear'}`;

  // If local candidates cache exists and is fresh, pick a random non-repeating banner from it!
  if (localPoolCache && localPoolCache.key === cacheKey && now - localPoolCache.timestamp < CACHE_TTL_MS && localPoolCache.candidates.length > 0) {
    return getRandomNonRepeatingBanner(localPoolCache.candidates);
  }

  try {
    const bannerRef = collection(db, 'trending_banners');
    const q = query(bannerRef, where('active', '==', true));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const candidates: SmartTrendingBanner[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        candidates.push({
          id: docSnap.id,
          tag: data.tag || '🔥 TRENDING',
          title: data.title || '',
          subtitle: data.subtitle || '',
          ctaText: data.ctaText || 'Explore',
          bgLight: data.bgLight || '#FFF7ED',
          bgDark: data.bgDark || '#431407',
          textColorLight: data.textColorLight || '#9A3412',
          textColorDark: data.textColorDark || '#FDBA74',
          image: data.image || '',
          collectionId: data.collectionId || 'regional_delights',
          priority: data.priority || 0,
          featuredProduct: data.featuredProduct || {
            id: 'sp_default',
            title: data.title || '',
            price: '₹299',
            originalPrice: '₹399',
            discount: '25% OFF',
            image: data.image || '',
          },
        });
      });

      if (candidates.length > 0) {
        localPoolCache = { candidates, key: cacheKey, timestamp: now };
        return getRandomNonRepeatingBanner(candidates);
      }
    }
  } catch (err) {
    // Quiet fallback to local state pools
  }

  // Fallback to local synchronous state pool resolver
  const pool = STATE_BANNER_POOLS[stateCode] || STATE_BANNER_POOLS['BR'];
  if (pool && pool.length > 0) {
    localPoolCache = { candidates: pool, key: cacheKey, timestamp: now };
    return getRandomNonRepeatingBanner(pool);
  }

  return getSmartTrendingBannerSync(ctx);
}

// ─── 7. MULTI-BANNER SLIDABLE POOL GETTER ───
export function getSmartTrendingBannersSync(ctx: SmartContext = {}): SmartTrendingBanner[] {
  const stateCode = ctx.userStateCode || 'BR';
  const pool = STATE_BANNER_POOLS[stateCode] || STATE_BANNER_POOLS['BR'];
  return pool && pool.length > 0 ? pool : [FLASH_SALE_BANNER];
}

export async function getSmartTrendingBannersAsync(ctx: SmartContext = {}): Promise<SmartTrendingBanner[]> {
  const stateCode = ctx.userStateCode || 'BR';
  const pool = STATE_BANNER_POOLS[stateCode] || STATE_BANNER_POOLS['BR'];
  return pool && pool.length > 0 ? pool : [FLASH_SALE_BANNER];
}
