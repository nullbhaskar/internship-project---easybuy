export const DARK_HERO_BACKGROUND_POOL = [
  {
    id: 'greenhouse_glass',
    name: 'Moody Glasshouse Sanctuary',
    uri: 'https://images.unsplash.com/photo-1519996521430-02b798c1d881?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'emerald_palms',
    name: 'Deep Emerald Tropical Palms',
    uri: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'slate_monstera',
    name: 'Dark Slate & Monstera Architecture',
    uri: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'mist_evergreen',
    name: 'Misty Dark Evergreen Canopy',
    uri: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'pottery_oak',
    name: 'Artisanal Studio & Dark Oak',
    uri: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'courtyard_ambient',
    name: 'Dark Courtyard & Warm Amber',
    uri: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1200&auto=format&fit=crop&q=80',
  },
];

// ─── BRAND DESIGN TOKENS ───
export const THEME = {
  PRIMARY: '#2F6E49', // Deep Green
  SECONDARY: '#89B882', // Mint Accent
  ACCENT: '#F6CC63', // Warm Amber Gold
  BG_CREAM: '#FAF7F2', // Warm Champagne Ivory Ambient Background
  BG_DARK: '#090D16', // Pitch obsidian black from reference mockup
  CARD_WHITE: '#FFFFFF',
  CARD_DARK: '#121927', // Reference mockup card background
  BORDER_DARK: '#1F293D', // Muted dark border
  TEXT_DARK: '#0F172A',
  TEXT_MUTED: '#64748B',
  CORAL: '#FF6B6B',
  PURPLE: '#8E44AD', // Lavender Highlight
  SKY_BLUE: '#3498DB',
};

export const SEARCH_TICKERS = [
  'Search "Mechanical Keyboard"',
  'Search "Running Shoes"',
  'Search "Coffee Mug"',
  'Search "Hostel Lamp"',
  'Ask AI: Hostel setup under ₹999...',
];

export const DAILY_QUOTES = [
  "What's the plan for today?",
  "Let's find something you'll actually use.",
  "Today's cart might be dangerous.",
  "Budget says no. Heart says yes.",
  "Only good finds today.",
  "You deserve something nice.",
];

import { styles } from '../components/home/home.styles';

// ─── QUICK COMMERCE (QUICKBUY 10-20 MIN DARK CAPSULE) ───
export const QUICKBUY_GRID_ITEMS = [
  { id: 'qb1', name: 'Milk', time: '10–20 min', bg: '#E0F2FE', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb2', name: 'Bread', time: '10–20 min', bg: '#FFEDD5', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb3', name: 'Eggs', time: '10–20 min', bg: '#FEF3C7', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb4', name: 'Fruits', time: '10–20 min', bg: '#DCFCE7', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb5', name: 'Drinks', time: '10–20 min', bg: '#E0F2FE', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb6', name: 'Medicine', time: '10–20 min', bg: '#F3E8FF', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb7', name: 'More', isMore: true, bg: '#1E293B', icon: 'grid-outline' },
];

// ─── 2 AM DAILY ROTATING FLASH SALE CATALOG ───
export const DAILY_FLASH_DEALS = [
  {
    id: 'flash_deal_1',
    title: 'Sneaker Pro X1',
    desc: 'Ultra-light responsive cushioning for modern urban runners.',
    price: '₹2,999',
    oldPrice: '₹4,999',
    discount: '-40% OFF',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    tag: 'LIMITED DROP',
  },
  {
    id: 'flash_deal_2',
    title: 'Wireless ANC Headphones',
    desc: 'Hi-Fi studio acoustics with 40h playtime & active noise cancel.',
    price: '₹1,999',
    oldPrice: '₹4,499',
    discount: '-55% OFF',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    tag: '2 AM SPECIAL',
  },
  {
    id: 'flash_deal_3',
    title: 'Smart Watch Ultra Pro',
    desc: 'AMOLED retina display, dual GPS & 24/7 heart health monitoring.',
    price: '₹2,499',
    oldPrice: '₹5,999',
    discount: '-58% OFF',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    tag: 'HOT DROP',
  },
  {
    id: 'flash_deal_4',
    title: 'Italian Espresso Coffee Maker',
    desc: '15-bar high pressure pump for authentic velvety espresso drops.',
    price: '₹3,299',
    oldPrice: '₹6,999',
    discount: '-52% OFF',
    image: 'https://images.unsplash.com/photo-1517668808822-9eaa02ae2d35?w=800&auto=format&fit=crop&q=80',
    tag: 'DAILY HARVEST',
  },
  {
    id: 'flash_deal_5',
    title: 'Minimalist Leather Backpack',
    desc: 'Water-resistant vegan leather with padded laptop vault.',
    price: '₹1,499',
    oldPrice: '₹3,499',
    discount: '-57% OFF',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    tag: 'SUPER SAVER',
  },
];

// ─── MOOD CATEGORY CHIPS ───
export const MOOD_CHIPS = [
  { id: 'explore_all', label: 'Explore All', sub: 'Categorized items', icon: 'grid', iconBg: '#FEF3C7', iconColor: '#D97706' },
  { id: 'regional', label: 'Regional Tastes', sub: 'Local favourites', icon: 'location-sharp', iconBg: '#FFEDD5', iconColor: '#EA580C' },
  { id: 'quickbuy', label: '10-Min Delivery', sub: 'Super fast', icon: 'flash', iconBg: '#DCFCE7', iconColor: '#16A34A' },
  { id: 'offers', label: 'Offers', sub: 'Best deals for you', icon: 'pricetag', iconBg: '#F3E8FF', iconColor: '#9333EA' },
];

// ─── SHOP BY VIBE (PASTEL GRID CARDS WITH SUBTITLES) ───
export const VIBE_CARDS = [
  { id: 'v1', title: 'Late Night Essentials', sub: 'Quick & easy midnight snacks', icon: 'moon-outline', emoji: '🌙', bg: '#F3E8FF', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80', collectionId: 'late_night_munchies' },
  { id: 'v2', title: 'Healthy Living', sub: 'Eat clean, feel awesome', icon: 'leaf-outline', emoji: '🍃', bg: '#DCFCE7', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop&q=80', collectionId: 'healthy_living' },
  { id: 'v3', title: 'Study Fuel', sub: 'Stay sharp, stay powered', icon: 'book-outline', emoji: '📖', bg: '#FEF9C3', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop&q=80', collectionId: 'study_fuel' },
  { id: 'v4', title: 'Party Ready', sub: 'Snacks that bring people together', icon: 'musical-notes-outline', emoji: '🎵', bg: '#FCE7F3', image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=500&auto=format&fit=crop&q=80', collectionId: 'party_ready' },
  { id: 'v5', title: 'Tea Time', sub: 'Perfect for every sip', icon: 'cafe-outline', emoji: '☕', bg: '#E0F2FE', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80', collectionId: 'tea_time' },
];



export const FRUIT_SALAD_RECOMMENDED = [
  {
    id: 'salad_honey_lime',
    title: 'Honey Lime Combo',
    price: '₹ 2,000',
    priceNum: 2000,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_berry_mango',
    title: 'Berry Mango Combo',
    price: '₹ 8,000',
    priceNum: 8000,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_melon_combo',
    title: 'Melon Salad Combo',
    price: '₹ 5,000',
    priceNum: 5000,
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_orange_combo',
    title: 'Orange Berry Supreme',
    price: '₹ 6,000',
    priceNum: 6000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_kiwi_dragon',
    title: 'Kiwi Dragonfruit Bliss',
    price: '₹ 7,500',
    priceNum: 7500,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_avocado_crunch',
    title: 'Avocado Crunch Salad',
    price: '₹ 9,200',
    priceNum: 9200,
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_pomegranate_gold',
    title: 'Pomegranate Golden Mix',
    price: '₹ 4,800',
    priceNum: 4800,
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_superfood_bowl',
    title: 'Superfood Berry Bowl',
    price: '₹ 11,000',
    priceNum: 11000,
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80',
    bgColor: '#FFFFFF',
  },
];

export const FRUIT_SALAD_TAB_PRODUCTS: Record<string, any[]> = {
  hot: [
    {
      id: 'salad_quinoa',
      title: 'Quinoa Fruit Salad',
      price: '₹ 10,000',
      priceNum: 10000,
      image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&q=80',
      bgColor: '#FFF9E6',
    },
    {
      id: 'salad_tropical',
      title: 'Tropical Fruit Salad',
      price: '₹ 10,000',
      priceNum: 10000,
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80',
      bgColor: '#FFF0F2',
    },
    {
      id: 'salad_melon_mix',
      title: 'Melon Berry Mix',
      price: '₹ 12,000',
      priceNum: 12000,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      bgColor: '#F1F0FF',
    },
    {
      id: 'salad_citrus_glow',
      title: 'Citrus Glow Delight',
      price: '₹ 6,500',
      priceNum: 6500,
      image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80',
      bgColor: '#FEF3C7',
    },
    {
      id: 'salad_fig_walnut',
      title: 'Honey Fig & Walnut Bowl',
      price: '₹ 14,000',
      priceNum: 14000,
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&q=80',
      bgColor: '#EDF2F7',
    },
    {
      id: 'salad_chia_pudding',
      title: 'Chia Fruit Parfait',
      price: '₹ 8,500',
      priceNum: 8500,
      image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80',
      bgColor: '#EBF8FF',
    },
  ],
  popular: [
    {
      id: 'salad_berry_mango',
      title: 'Berry Mango Combo',
      price: '₹ 8,000',
      priceNum: 8000,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
      bgColor: '#EBF8FF',
    },
    {
      id: 'salad_honey_lime',
      title: 'Honey Lime Combo',
      price: '₹ 2,000',
      priceNum: 2000,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
      bgColor: '#FFF9E6',
    },
    {
      id: 'salad_avocado_crunch',
      title: 'Avocado Crunch Salad',
      price: '₹ 9,200',
      priceNum: 9200,
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&q=80',
      bgColor: '#E6FFFA',
    },
    {
      id: 'salad_pomegranate_gold',
      title: 'Pomegranate Golden Mix',
      price: '₹ 4,800',
      priceNum: 4800,
      image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400&q=80',
      bgColor: '#FFF5F5',
    },
  ],
  new: [
    {
      id: 'salad_kiwi_dragon',
      title: 'Kiwi Dragonfruit Bliss',
      price: '₹ 7,500',
      priceNum: 7500,
      image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80',
      bgColor: '#F0FFF4',
    },
    {
      id: 'salad_tropical',
      title: 'Tropical Fruit Salad',
      price: '₹ 10,000',
      priceNum: 10000,
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80',
      bgColor: '#FFF0F2',
    },
    {
      id: 'salad_superfood_bowl',
      title: 'Superfood Berry Bowl',
      price: '₹ 11,000',
      priceNum: 11000,
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80',
      bgColor: '#F3E8FF',
    },
    {
      id: 'salad_quinoa',
      title: 'Quinoa Fruit Salad',
      price: '₹ 10,000',
      priceNum: 10000,
      image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&q=80',
      bgColor: '#FFF9E6',
    },
  ],
  top: [
    {
      id: 'salad_melon_mix',
      title: 'Melon Berry Mix',
      price: '₹ 12,000',
      priceNum: 12000,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      bgColor: '#F1F0FF',
    },
    {
      id: 'salad_fig_walnut',
      title: 'Honey Fig & Walnut Bowl',
      price: '₹ 14,000',
      priceNum: 14000,
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&q=80',
      bgColor: '#EDF2F7',
    },
    {
      id: 'salad_berry_mango',
      title: 'Berry Mango Combo',
      price: '₹ 8,000',
      priceNum: 8000,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
      bgColor: '#EBF8FF',
    },
  ],
};

// ─── CURATED LIFESTYLE COLLECTIONS ───
export const CURATED_COLLECTIONS = [
  { id: 'c1', title: 'State Heritage Sweets & Spices', tag: 'Curated', priceText: 'From ₹129', bg: '#FFF3E0', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400' },
  { id: 'c2', title: 'Organic Farm Fresh Veggies', tag: 'Farm Harvest', priceText: 'From ₹35', bg: '#DCFCE7', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400' },
];

// ─── TACTILE SPRING PRESS CARD COMPONENT ───
