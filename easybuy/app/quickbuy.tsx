import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ExperimentalNavigation } from '../components/navigation/ExperimentalNavigation';
import { QuickAddModal, QuickAddProduct } from '../components/cart/QuickAddModal';
import { SearchModal } from '../components/search/SearchModal';
import { LocationPickerModal } from '../components/location/LocationPickerModal';
import { useAddress } from '../context/AddressContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');
const RIGHT_WIDTH = width - 105; // right panel width
const COL = (RIGHT_WIDTH - 48) / 3;  // 3 columns with gaps

// ─── OSM TILE HELPER ─────────────────────────────────────────────────────────
// Computes a direct OpenStreetMap tile URL (same CDN as full-screen map)
function getOSMTileUrl(lat: number, lng: number, zoom = 15): string {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
  );
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

// ─── DATA ────────────────────────────────────────────────────────────────────

interface QBProduct {
  id: string;
  name: string;
  weight: string;
  price: string;
  originalPrice?: string;
  image: string;
}

interface QBCategory {
  id: string;
  name: string;
  iconName: string;
  products: QBProduct[];
}

const QB_CATEGORIES: QBCategory[] = [
  {
    id: 'popular',
    name: 'Popular',
    iconName: 'star-outline',
    products: [
      { id: 'p1',  name: 'Fresh Milk',       weight: '1 L',    price: '₹52',  originalPrice: '₹58', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
      { id: 'p2',  name: 'Wheat Bread',      weight: '400g',   price: '₹35',  originalPrice: '₹40', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
      { id: 'p3',  name: 'Farm Fresh Eggs',  weight: 'Pack 6', price: '₹38',  image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400' },
      { id: 'p4',  name: 'Maggi Noodles',    weight: '70g',    price: '₹15',  image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400' },
      { id: 'p5',  name: 'Fresh Bananas',    weight: '1 Bunch',price: '₹27',  image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400' },
      { id: 'p6',  name: 'Bisleri Water',    weight: '1 L',    price: '₹20',  image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400' },
      { id: 'p7',  name: 'Coca-Cola',        weight: '2 L',    price: '₹85',  image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400' },
      { id: 'p8',  name: "Lay's Chips",      weight: '52g',    price: '₹20',  image: 'https://images.unsplash.com/photo-1576405515954-b32f24e4dfc3?w=400' },
      { id: 'p9',  name: 'Fresh Tomatoes',   weight: '500g',   price: '₹18',  image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' },
    ],
  },
  {
    id: 'dairy',
    name: 'Dairy & Eggs',
    iconName: 'egg-outline',
    products: [
      { id: 'd1',  name: 'Amul Taaza Milk',  weight: '1 L',   price: '₹52',  originalPrice: '₹58', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
      { id: 'd2',  name: 'Toned Milk',       weight: '500ml', price: '₹27',  image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
      { id: 'd3',  name: 'Amul Dahi',        weight: '400g',  price: '₹32',  image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' },
      { id: 'd4',  name: 'Amul Butter',      weight: '100g',  price: '₹56',  image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400' },
      { id: 'd5',  name: 'Cheese Slices',    weight: '200g',  price: '₹89',  originalPrice: '₹99', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400' },
      { id: 'd6',  name: 'Fresh Paneer',     weight: '200g',  price: '₹95',  originalPrice: '₹105', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400' },
      { id: 'd7',  name: 'Pav Buns',         weight: '6 pcs', price: '₹30',  image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=400' },
      { id: 'd8',  name: 'Farm Eggs',        weight: 'Pack 6',price: '₹38',  image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400' },
      { id: 'd9',  name: 'Full Cream Milk',  weight: '1 L',   price: '₹66',  image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
    ],
  },
  {
    id: 'fruits',
    name: 'Fruits & Veggies',
    iconName: 'leaf-outline',
    products: [
      { id: 'fv1', name: 'Red Apples',       weight: '1 kg',  price: '₹149', originalPrice: '₹180', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400' },
      { id: 'fv2', name: 'Fresh Bananas',    weight: '1 Bunch',price: '₹27', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400' },
      { id: 'fv3', name: 'Sweet Oranges',    weight: '1 kg',  price: '₹89',  image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400' },
      { id: 'fv4', name: 'Fresh Tomatoes',   weight: '500g',  price: '₹18',  image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' },
      { id: 'fv5', name: 'Onions',           weight: '1 kg',  price: '₹29',  image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400' },
      { id: 'fv6', name: 'Potatoes',         weight: '1 kg',  price: '₹22',  image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' },
      { id: 'fv7', name: 'Alphonso Mango',   weight: '1 kg',  price: '₹149', originalPrice: '₹199', image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400' },
      { id: 'fv8', name: 'Green Grapes',     weight: '500g',  price: '₹79',  image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400' },
      { id: 'fv9', name: 'Baby Spinach',     weight: '250g',  price: '₹19',  image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400' },
      { id: 'fv10',name: 'Capsicum',         weight: '250g',  price: '₹24',  image: 'https://images.unsplash.com/photo-1590137461098-5eda4d2a3c14?w=400' },
      { id: 'fv11',name: 'Fresh Lemons',     weight: '6 pcs', price: '₹22',  image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400' },
      { id: 'fv12',name: 'Broccoli',         weight: '300g',  price: '₹49',  image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400' },
    ],
  },
  {
    id: 'snacks',
    name: 'Instant Snacks',
    iconName: 'fast-food-outline',
    products: [
      { id: 's1',  name: 'Maggi Noodles',    weight: '70g',   price: '₹15',  image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400' },
      { id: 's2',  name: 'Kurkure Masala',   weight: '50g',   price: '₹20',  image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
      { id: 's3',  name: 'Haldiram Bhujia',  weight: '200g',  price: '₹89',  originalPrice: '₹99', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400' },
      { id: 's4',  name: 'Oreo Biscuits',    weight: '120g',  price: '₹25',  image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
      { id: 's5',  name: 'Dairy Milk',       weight: '40g',   price: '₹20',  image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400' },
      { id: 's6',  name: 'Makhana 60g',      weight: '60g',   price: '₹60',  originalPrice: '₹75', image: 'https://images.unsplash.com/photo-1576405515954-b32f24e4dfc3?w=400' },
      { id: 's7',  name: 'Parle-G Pack',     weight: '250g',  price: '₹25',  image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
      { id: 's8',  name: "Lay's Chips",      weight: '52g',   price: '₹20',  image: 'https://images.unsplash.com/photo-1576405515954-b32f24e4dfc3?w=400' },
      { id: 's9',  name: 'KitKat',           weight: '37g',   price: '₹30',  image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400' },
    ],
  },
  {
    id: 'drinks',
    name: 'Cold Drinks',
    iconName: 'cafe-outline',
    products: [
      { id: 'dr1', name: 'Coca-Cola',        weight: '2 L',   price: '₹85',  image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400' },
      { id: 'dr2', name: 'Sprite',           weight: '1.5 L', price: '₹65',  image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400' },
      { id: 'dr3', name: 'Tropicana Orange', weight: '1 L',   price: '₹99',  originalPrice: '₹120', image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
      { id: 'dr4', name: 'Red Bull',         weight: '250ml', price: '₹115', image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400' },
      { id: 'dr5', name: 'Green Tea',        weight: '25 bags',price: '₹145',originalPrice: '₹175', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400' },
      { id: 'dr6', name: 'Nescafe 3-in-1',  weight: '10 pcs',price: '₹129', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400' },
      { id: 'dr7', name: 'Bisleri Water',    weight: '1 L',   price: '₹20',  image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400' },
      { id: 'dr8', name: 'Real Juice',       weight: '1 L',   price: '₹55',  originalPrice: '₹75', image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
      { id: 'dr9', name: 'Frooti Mango',     weight: '200ml', price: '₹15',  image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
    ],
  },
  {
    id: 'spices',
    name: 'Spices & Masala',
    iconName: 'flame-outline',
    products: [
      { id: 'sp1', name: 'MDH Garam Masala', weight: '100g',  price: '₹65',  image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
      { id: 'sp2', name: 'Everest Chilli',   weight: '200g',  price: '₹79',  image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400' },
      { id: 'sp3', name: 'Turmeric Powder',  weight: '200g',  price: '₹55',  image: 'https://images.unsplash.com/photo-1614179689702-355944cd0918?w=400' },
      { id: 'sp4', name: 'Coriander Powder', weight: '200g',  price: '₹55',  image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
      { id: 'sp5', name: 'Tata Salt',        weight: '1 kg',  price: '₹25',  image: 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=400' },
      { id: 'sp6', name: 'Sugar',            weight: '1 kg',  price: '₹45',  image: 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=400' },
      { id: 'sp7', name: 'Mustard Oil',      weight: '500ml', price: '₹115', originalPrice: '₹130', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
      { id: 'sp8', name: 'Cumin Seeds',      weight: '100g',  price: '₹69',  image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
      { id: 'sp9', name: 'Black Pepper',     weight: '100g',  price: '₹79',  image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
    ],
  },
  {
    id: 'hygiene',
    name: 'Hygiene Care',
    iconName: 'medkit-outline',
    products: [
      { id: 'hy1', name: 'Sanitary Pads',    weight: '6 pcs', price: '₹49',  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'hy2', name: 'Colgate Paste',    weight: '150g',  price: '₹95',  originalPrice: '₹115', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'hy3', name: 'Wet Wipes',        weight: '20 pcs',price: '₹65',  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'hy4', name: 'H&S Shampoo',      weight: '200ml', price: '₹185', originalPrice: '₹225', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400' },
      { id: 'hy5', name: 'Deo Axe Spray',    weight: '150ml', price: '₹249', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400' },
      { id: 'hy6', name: 'Band-Aid Strips',  weight: '20 pcs',price: '₹59',  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'hy7', name: 'Hand Sanitizer',   weight: '200ml', price: '₹89',  originalPrice: '₹99', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'hy8', name: 'Dettol Handwash',  weight: '200ml', price: '₹89',  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'hy9', name: 'Soap Bar Pack',    weight: '4 pcs', price: '₹149', originalPrice: '₹175', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
    ],
  },
  {
    id: 'household',
    name: 'Household Emergency',
    iconName: 'build-outline',
    products: [
      { id: 'hh1', name: 'Garbage Bags',     weight: '30 pcs',price: '₹89',  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { id: 'hh2', name: 'AA Batteries',     weight: '4 pcs', price: '₹60',  originalPrice: '₹70', image: 'https://images.unsplash.com/photo-1619597001682-79cf8f41db1e?w=400' },
      { id: 'hh3', name: 'Dishwash Bar',     weight: '200g',  price: '₹20',  image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400' },
      { id: 'hh4', name: 'Mosquito Refill',  weight: '45 nts',price: '₹49',  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
      { id: 'hh5', name: 'Emergency Candles',weight: '5 pcs', price: '₹45',  image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400' },
      { id: 'hh6', name: 'Floor Cleaner',    weight: '500ml', price: '₹89',  originalPrice: '₹110', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400' },
      { id: 'hh7', name: 'Scotch Brite',     weight: '1 pc',  price: '₹35',  image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400' },
      { id: 'hh8', name: 'LED Bulb 9W',      weight: '1 pc',  price: '₹149', originalPrice: '₹175', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400' },
      { id: 'hh9', name: 'AAA Batteries',    weight: '4 pcs', price: '₹55',  image: 'https://images.unsplash.com/photo-1619597001682-79cf8f41db1e?w=400' },
    ],
  },
  {
    id: 'staples',
    name: 'Atta, Rice & Dals',
    iconName: 'cart-outline',
    products: [
      { id: 'st1', name: 'Aashirvaad Atta',  weight: '5 kg',  price: '₹249', originalPrice: '₹280', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      { id: 'st2', name: 'Basmati Rice',     weight: '1 kg',  price: '₹129', originalPrice: '₹150', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      { id: 'st3', name: 'Toor Dal Premium', weight: '1 kg',  price: '₹159', image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400' },
      { id: 'st4', name: 'Fortune Oil',      weight: '1 L',   price: '₹135', originalPrice: '₹155', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
      { id: 'st5', name: 'Poha Thick',       weight: '500g',  price: '₹42',  image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      { id: 'st6', name: 'Chana Dal',        weight: '500g',  price: '₹48',  image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400' },
      { id: 'st7', name: 'Rajma Red',        weight: '500g',  price: '₹75',  image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400' },
      { id: 'st8', name: 'Suji Rava',        weight: '500g',  price: '₹35',  image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      { id: 'st9', name: 'Moong Dal',        weight: '500g',  price: '₹62',  image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400' },
    ],
  },
  {
    id: 'frozen',
    name: 'Ice Cream & Frozen',
    iconName: 'ice-cream-outline',
    products: [
      { id: 'fz1', name: 'Amul Vanilla Gold', weight: '1 L',   price: '₹160', originalPrice: '₹180', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400' },
      { id: 'fz2', name: 'Cornetto Pack 2',   weight: '2 pcs', price: '₹70',  image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
      { id: 'fz3', name: 'Frozen Green Peas', weight: '500g',  price: '₹65',  originalPrice: '₹80',  image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
      { id: 'fz4', name: 'McCain French Fries',weight: '420g', price: '₹115', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
      { id: 'fz5', name: 'Butterscotch Cone', weight: '1 pc',  price: '₹35',  image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
      { id: 'fz6', name: 'Frozen Sweet Corn', weight: '500g',  price: '₹75',  image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
      { id: 'fz7', name: 'Choco Bar Pack 4',  weight: '4 pcs', price: '₹99',  originalPrice: '₹120', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400' },
      { id: 'fz8', name: 'McCain Veggie Nuggets',weight: '320g',price: '₹125',image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
      { id: 'fz9', name: 'Cassata Ice Cream', weight: '1 pc',  price: '₹60',  image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400' },
    ],
  },
  {
    id: 'baby',
    name: 'Baby Care',
    iconName: 'happy-outline',
    products: [
      { id: 'bc1', name: 'Pampers Diapers M', weight: '20 pcs',price: '₹299', originalPrice: '₹350', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
      { id: 'bc2', name: 'Baby Wipes Pack',   weight: '72 pcs',price: '₹115', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
      { id: 'bc3', name: 'Cerelac Wheat Apple',weight: '300g', price: '₹245', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
      { id: 'bc4', name: "Johnson's Baby Soap",weight: '75g',  price: '₹55',  image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
      { id: 'bc5', name: 'Baby Powder 100g',  weight: '100g', price: '₹75',  image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
      { id: 'bc6', name: 'Baby Feeding Bottle',weight: '250ml',price: '₹149', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
      { id: 'bc7', name: 'Baby Massage Oil',  weight: '100ml', price: '₹120', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
      { id: 'bc8', name: 'Himalaya Baby Lotion',weight: '200ml',price: '₹135',image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
      { id: 'bc9', name: 'Baby Shampoo 100ml',weight: '100ml',price: '₹95',  image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
    ],
  },
  {
    id: 'pet',
    name: 'Pet Supplies',
    iconName: 'paw-outline',
    products: [
      { id: 'pt1', name: 'Pedigree Dog Food', weight: '1.2 kg',price: '₹310', originalPrice: '₹340', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' },
      { id: 'pt2', name: 'Whiskas Wet Cat Food',weight: '85g', price: '₹45',  image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' },
      { id: 'pt3', name: 'Drools Dog Food',   weight: '3 kg',  price: '₹649', originalPrice: '₹750', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' },
      { id: 'pt4', name: 'Me-O Cat Treats',   weight: '50g',   price: '₹99',  image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' },
      { id: 'pt5', name: 'Dog Chew Sticks',   weight: '200g',  price: '₹125', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' },
      { id: 'pt6', name: 'Pet Shampoo',       weight: '200ml', price: '₹185', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' },
      { id: 'pt7', name: 'Cat Litter Sand',   weight: '5 kg',  price: '₹349', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' },
      { id: 'pt8', name: 'Dog Squeaky Toy',   weight: '1 pc',  price: '₹99',  image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' },
      { id: 'pt9', name: 'Whiskas Dry Food',  weight: '1.2 kg',price: '₹340', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' },
    ],
  },
  {
    id: 'wellness',
    name: 'Health & Wellness',
    iconName: 'fitness-outline',
    products: [
      { id: 'wl1', name: 'Vitamin C Tabs',    weight: '20 tabs',price: '₹299', originalPrice: '₹399', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'wl2', name: 'Whey Protein 1lb',  weight: '450g',  price: '₹1299',originalPrice: '₹1499',image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'wl3', name: 'ORS Apple Drink',   weight: '200ml', price: '₹32',  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'wl4', name: 'Dettol Antiseptic', weight: '250ml', price: '₹125', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'wl5', name: 'Volini Pain Spray', weight: '55g',   price: '₹145', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'wl6', name: 'Dabur Chyawanprash',weight: '500g', price: '₹199', originalPrice: '₹230', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'wl7', name: 'Revital H Capsules',weight: '30 caps',price: '₹310', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'wl8', name: 'Moov Pain Relief',  weight: '50g',   price: '₹135', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
      { id: 'wl9', name: 'Multivitamin Gummies',weight: '30 pcs',price: '₹399',originalPrice: '₹499', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
    ],
  },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function QuickBuyScreen() {
  const router = useRouter();
  const { openCart, totalItems: cartCount, addToCart } = useCart();
  const { openWishlist, totalWishlistItems } = useWishlist();
  const { selectedAddress, openLocationModal } = useAddress();

  const [activeTabId, setActiveTabId]       = useState('popular');
  const [searchVisible, setSearchVisible]   = useState(false);
  const [drawerVisible, setDrawerVisible]   = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState<QuickAddProduct | null>(null);

  // ── Tab Switch Animation ──────────────────────────────────────────────────
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;

  const handleTabChange = (catId: string) => {
    if (catId === activeTabId) return;
    Haptics.selectionAsync().catch(() => {});

    // Quick fade out + slide down
    Animated.parallel([
      Animated.timing(contentFadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(contentTranslateY, { toValue: 12, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setActiveTabId(catId);
      contentTranslateY.setValue(16);
      // Smooth fade in + slide up
      Animated.parallel([
        Animated.timing(contentFadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(contentTranslateY, { toValue: 0, friction: 7, tension: 140, useNativeDriver: true }),
      ]).start();
    });
  };

  // ── Swipe-right-to-dismiss ──────────────────────────────────────────────────
  const slideX       = useRef(new Animated.Value(0)).current;
  const splashOpacity= useRef(new Animated.Value(0)).current;
  const splashScale  = useRef(new Animated.Value(0.82)).current;
  const dot1         = useRef(new Animated.Value(0.3)).current;
  const dot2         = useRef(new Animated.Value(0.3)).current;
  const dot3         = useRef(new Animated.Value(0.3)).current;
  const barWidth     = useRef(new Animated.Value(0)).current;

  const startLoadingAnim = () => {
    const pulseDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.timing(dot, { toValue: 0.3, duration: 200, useNativeDriver: false }),
        Animated.delay(400 - delay),
      ]));
    pulseDot(dot1, 0).start();
    pulseDot(dot2, 120).start();
    pulseDot(dot3, 240).start();
    Animated.timing(barWidth, { toValue: 100, duration: 440, useNativeDriver: false }).start();
  };

  const triggerSplashAndBack = () => {
    barWidth.setValue(0);
    startLoadingAnim();
    Animated.parallel([
      Animated.timing(splashOpacity, { toValue: 1, duration: 160, useNativeDriver: false }),
      Animated.spring(splashScale, { toValue: 1, friction: 6, tension: 200, useNativeDriver: false }),
    ]).start();
    setTimeout(() => {
      router.back();
      setTimeout(() => {
        splashOpacity.setValue(0); splashScale.setValue(0.82);
        barWidth.setValue(0); dot1.setValue(0.3); dot2.setValue(0.3);
        dot3.setValue(0.3); slideX.setValue(0);
      }, 300);
    }, 500);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.timing(slideX, { toValue: width, duration: 220, useNativeDriver: false })
      .start(triggerSplashAndBack);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dx > 12 && Math.abs(gs.dy) < Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => { if (gs.dx > 0) slideX.setValue(gs.dx); },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > width * 0.35 || gs.vx > 0.5) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          Animated.timing(slideX, { toValue: width, duration: 180, useNativeDriver: false })
            .start(triggerSplashAndBack);
        } else {
          Animated.spring(slideX, { toValue: 0, friction: 6, tension: 100, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const activeCategory = QB_CATEGORIES.find(c => c.id === activeTabId) || QB_CATEGORIES[0];

  const handleAddPress = (product: QBProduct) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    } as any);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <Animated.View
        style={[styles.root, { transform: [{ translateX: slideX }] }]}
        {...panResponder.panHandlers}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <StatusBar style="dark" />

          {/* ── 1. FLOATING TOP HEADER CARD ── */}
          <View style={styles.headerCard}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                setDrawerVisible(true);
              }}
              style={styles.headerMenuBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="menu-outline" size={22} color="#1E293B" />
            </TouchableOpacity>

            <View style={styles.headerCenterColumn}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerTitle}>QuickBuy</Text>
              </View>

              <View style={styles.headerMetaRow}>
                <View style={styles.deliveryPill}>
                  <Ionicons name="flash" size={10} color="#15803D" />
                  <Text style={styles.deliveryPillTxt}>10–15 min delivery</Text>
                </View>
                <Text style={styles.metaDivider}>|</Text>
                <TouchableOpacity
                  style={styles.locationPill}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    openLocationModal();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="location-outline" size={12} color="#334155" />
                  <Text style={styles.locationTxt}>
                    {selectedAddress?.city || 'Patna'}, {selectedAddress?.state || 'Bihar'}
                  </Text>
                  <Ionicons name="chevron-down" size={12} color="#334155" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.headerRightGroup}>
              <TouchableOpacity
                style={styles.headerCircleBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setSearchVisible(true); }}
                activeOpacity={0.8}
              >
                <Ionicons name="search-outline" size={19} color="#1E293B" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerCircleBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); router.push("/cart" as any); }}
                activeOpacity={0.8}
              >
                <Ionicons name="cart-outline" size={19} color="#1E293B" />
                {cartCount > 0 && (
                  <View style={styles.badgeGreen}>
                    <Text style={styles.badgeGreenTxt}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── SPLIT BODY ── */}
          <View style={styles.splitBody}>

            {/* LEFT SIDEBAR */}
            <View style={styles.sidebar}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
                {QB_CATEGORIES.map(cat => {
                  const isActive = cat.id === activeTabId;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.sideTab, isActive && styles.sideTabActive]}
                      onPress={() => handleTabChange(cat.id)}
                      activeOpacity={0.85}
                    >
                      {isActive && <View style={styles.activeBar} />}
                      <View style={{ marginBottom: 4, transform: [{ scale: isActive ? 1.12 : 1 }] }}>
                        <Ionicons
                          name={(isActive && cat.iconName === 'star-outline' ? 'star' : cat.iconName) as any}
                          size={24}
                          color={isActive ? '#16A34A' : '#334155'}
                        />
                      </View>
                      <Text style={[styles.sideTabText, isActive && styles.sideTabTextActive]} numberOfLines={2}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 110 }} />
              </ScrollView>
            </View>

            {/* RIGHT CONTENT */}
            <ScrollView style={styles.rightPanel} showsVerticalScrollIndicator={false}>

              <Animated.View
                style={{
                  opacity: contentFadeAnim,
                  transform: [{ translateY: contentTranslateY }],
                }}
              >
                <View style={styles.emeraldBanner}>
                  <View style={styles.bannerLeftContent}>
                    <View style={styles.superFastTag}>
                      <Text style={styles.superFastTxt}>SUPER FAST</Text>
                    </View>

                    <Text style={styles.emeraldBannerTitle}>
                      10-MIN EXPRESS{'\n'}DELIVERY <Text style={{ color: '#FACC15' }}>⚡</Text>
                    </Text>

                    <Text style={styles.emeraldBannerSub}>
                      Essentials at your door in a flash!
                    </Text>
                  </View>

                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' }}
                    style={styles.bannerBagImg}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.grid}>
                  {activeCategory.products.map((product: QBProduct) => (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.circleWrap}>
                        <Image source={{ uri: product.image }} style={styles.productImg} resizeMode="cover" />
                      </View>

                      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

                      <Text style={styles.productWeight}>{product.weight}</Text>

                      <View style={styles.priceRow}>
                        <Text style={styles.price}>{product.price}</Text>
                        {product.originalPrice && (
                          <Text style={styles.originalPrice}>{product.originalPrice}</Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleAddPress(product)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.addBtnTxt}>Add</Text>
                        <Ionicons name="add" size={14} color="#22C55E" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </Animated.View>

              <View style={{ height: 120 }} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Animated.View>

      <ExperimentalNavigation
        activeTab="quickbuy"
        onTabChange={(tabId) => { if (tabId !== 'quickbuy') router.replace(`/${tabId}` as any); }}
      />

      {/* SPLASH OVERLAY */}
      <Animated.View style={[styles.splashOverlay, { opacity: splashOpacity, pointerEvents: 'none' } as any]}>
        <Animated.Image
          source={require('../assets/images/easybuy_logo.png')}
          style={[styles.splashLogo, { transform: [{ scale: splashScale }] }]}
          resizeMode="contain"
        />
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: dot, transform: [{ scale: dot }] }]} />
          ))}
        </View>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: barWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
        </View>
      </Animated.View>

      {/* ── EXACT REPLICA QUICKBUY MENU DRAWER MODAL ── */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setDrawerVisible(false)}
          />

          <View style={styles.menuSheetContainer}>
            {/* Top Mint Header Section with Drag Handle & User Greeting */}
            <View style={styles.menuTopMintSection}>
              {/* Drag Handle Indicator */}
              <View style={styles.dragHandle} />

              {/* User Profile Greeting Row */}
              <View style={styles.menuGreetingHeader}>
                <View style={styles.menuAvatarWrap}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200' }}
                    style={styles.menuAvatarImg}
                    resizeMode="cover"
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.greetingTitle}>Hey Bhaskar! 👋</Text>
                  <Text style={styles.greetingSub}>Welcome to QuickBuy</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setDrawerVisible(false)}
                  style={styles.menuCloseBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={20} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 10 }}>

              {/* 1. Delivery Location Card with Map Graphic */}
              <TouchableOpacity
                style={styles.locationMapCard}
                onPress={() => {
                  setDrawerVisible(false);
                  openLocationModal();
                }}
                activeOpacity={0.88}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <View style={styles.greenPinWrap}>
                      <Ionicons name="location-sharp" size={14} color="#16A34A" />
                    </View>
                    <Text style={styles.deliveryLocationLabel}>DELIVERY LOCATION</Text>
                  </View>

                  <Text style={styles.deliveryAddressMain}>
                    {selectedAddress?.city || 'Patna'}, {selectedAddress?.state || 'Bihar'} - {selectedAddress?.pincode || '800001'}
                  </Text>

                  <View style={styles.changeAddressLink}>
                    <Text style={styles.changeAddressLinkTxt}>Change Address</Text>
                    <Ionicons name="chevron-forward" size={12} color="#16A34A" />
                  </View>
                </View>

                {/* Right Mini Map Preview — OSM Tile */}
                <TouchableOpacity
                  style={styles.miniMapWrap}
                  onPress={() => { setDrawerVisible(false); openLocationModal(); }}
                  activeOpacity={0.85}
                >
                  <Image
                    style={styles.miniMapImg}
                    resizeMode="cover"
                    source={{
                      uri: getOSMTileUrl(
                        selectedAddress?.latitude ?? 25.5941,
                        selectedAddress?.longitude ?? 85.1376,
                        15
                      )
                    }}
                  />
                  {/* Green location dot overlay */}
                  <View style={styles.miniMapPinCenter} pointerEvents="none">
                    <View style={styles.miniMapDot} />
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* 2. My Wishlist Card */}
              <TouchableOpacity
                style={styles.menuRowItem}
                onPress={() => {
                  setDrawerVisible(false);
                  openWishlist();
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.menuRowIconWrap, { backgroundColor: '#FFE4E6' }]}>
                  <Ionicons name="heart" size={18} color="#F43F5E" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.menuRowTitle}>My Wishlist</Text>
                  <Text style={styles.menuRowSub}>
                    {totalWishlistItems > 0 ? `${totalWishlistItems} saved items` : 'No saved items yet'}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* 3. Explore All Categories Card */}
              <TouchableOpacity
                style={styles.menuRowItem}
                onPress={() => {
                  setDrawerVisible(false);
                  router.push('/all-items' as any);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.menuRowIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="grid" size={18} color="#D97706" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.menuRowTitle}>Explore All Categories</Text>
                  <Text style={styles.menuRowSub}>All items in categorized manner</Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* 4. My Orders Card */}
              <TouchableOpacity
                style={styles.menuRowItem}
                onPress={() => {
                  setDrawerVisible(false);
                  router.push('/profile' as any);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.menuRowIconWrap, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="bag-handle" size={18} color="#0284C7" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.menuRowTitle}>My Orders</Text>
                  <Text style={styles.menuRowSub}>View your past orders & tracking</Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* 5. My Profile Card */}
              <TouchableOpacity
                style={styles.menuRowItem}
                onPress={() => {
                  setDrawerVisible(false);
                  router.push('/profile' as any);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.menuRowIconWrap, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="person" size={18} color="#7C3AED" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.menuRowTitle}>My Profile</Text>
                  <Text style={styles.menuRowSub}>Account details & preferences</Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* 6. Help & Support Card */}
              <TouchableOpacity
                style={styles.menuRowItem}
                onPress={() => {
                  setDrawerVisible(false);
                  router.push('/profile' as any);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.menuRowIconWrap, { backgroundColor: '#CCFBF1' }]}>
                  <Ionicons name="headset" size={18} color="#0D9488" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.menuRowTitle}>Help & Support</Text>
                  <Text style={styles.menuRowSub}>FAQs, chat support & more</Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

            </ScrollView>

            {/* Bottom Quick Bar */}
            <View style={styles.bottomFooterBar}>
              <TouchableOpacity style={styles.footerBarItem} activeOpacity={0.7}>
                <Ionicons name="share-social-outline" size={14} color="#64748B" />
                <Text style={styles.footerBarTxt}>Share App</Text>
              </TouchableOpacity>
              <Text style={styles.footerDivider}>|</Text>
              <TouchableOpacity style={styles.footerBarItem} activeOpacity={0.7}>
                <Ionicons name="star-outline" size={14} color="#64748B" />
                <Text style={styles.footerBarTxt}>Rate Us</Text>
              </TouchableOpacity>
              <Text style={styles.footerDivider}>|</Text>
              <TouchableOpacity style={styles.footerBarItem} activeOpacity={0.7}>
                <Ionicons name="settings-outline" size={14} color="#64748B" />
                <Text style={styles.footerBarTxt}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SearchModal visible={searchVisible} onClose={() => setSearchVisible(false)} />
      <QuickAddModal
        visible={quickAddVisible}
        product={quickAddProduct}
        onClose={() => setQuickAddVisible(false)}
        onAddToCart={(prod, size, color, qty) => {
          addToCart({
            id: prod.id,
            title: prod.title,
            price: prod.price,
            originalPrice: prod.originalPrice,
            image: prod.image,
            selectedVariant: `${size} / ${color}`,
            quantity: qty,
          } as any);
          setQuickAddVisible(false);
        }}
      />
      <LocationPickerModal />
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  // 1. Floating Top Header Card
  headerCard: {
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerMenuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerCenterColumn: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  deliveryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  deliveryPillTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  metaDivider: {
    fontSize: 11,
    color: '#94A3B8',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  wishlistPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    position: 'relative',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  wishlistPillTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  wishlistBadge: {
    backgroundColor: '#EF4444',
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  wishlistBadgeTxt: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeGreen: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#16A34A',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeGreenTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Split body
  splitBody: { flex: 1, flexDirection: 'row' },

  // Left Sidebar
  sidebar: { width: 105, backgroundColor: '#F1F5F9' },
  sideTab: {
    paddingVertical: 14, paddingHorizontal: 6,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    borderTopLeftRadius: 18, borderBottomLeftRadius: 18,
    marginVertical: 2, marginLeft: 4,
  },
  sideTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  activeBar: {
    position: 'absolute', left: 0, top: 12, bottom: 12,
    width: 4, backgroundColor: '#16A34A',
    borderTopRightRadius: 4, borderBottomRightRadius: 4,
  },
  sideTabEmoji: { fontSize: 24, marginBottom: 4 },
  sideTabText: {
    fontSize: 11, fontWeight: '600', color: '#475569',
    textAlign: 'center', lineHeight: 14,
  },
  sideTabTextActive: { fontWeight: '800', color: '#16A34A' },

  // Right Panel
  rightPanel: { flex: 1, backgroundColor: '#FFFFFF' },

  // 2. Emerald 10-Min Express Banner
  emeraldBanner: {
    margin: 10,
    borderRadius: 20,
    padding: 14,
    backgroundColor: '#047857',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerLeftContent: {
    flex: 1,
    paddingRight: 8,
  },
  superFastTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
  },
  superFastTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emeraldBannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  emeraldBannerSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#A7F3D0',
    marginTop: 4,
  },
  bannerBagImg: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },

  // Product Grid (3 columns)
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 10, gap: 12,
  },
  productCard: {
    width: COL, alignItems: 'center',
    paddingVertical: 8,
  },
  circleWrap: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    borderWidth: 1, borderColor: '#F1F5F9',
    marginBottom: 6,
  },
  productImg: { width: 76, height: 76 },
  productName: {
    fontSize: 11, fontWeight: '700', color: '#1E293B',
    textAlign: 'center', lineHeight: 14, marginBottom: 2,
  },
  productWeight: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginBottom: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  price: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  originalPrice: { fontSize: 10, color: '#94A3B8', textDecorationLine: 'line-through' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    borderWidth: 1.5, borderColor: '#22C55E', borderRadius: 8,
    paddingVertical: 4, paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
  },
  addBtnTxt: { fontSize: 12, fontWeight: '700', color: '#22C55E' },

  // Splash
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', zIndex: 999,
  },
  splashLogo: { width: 160, height: 60, marginBottom: 20 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9C27B0' },
  barTrack: { width: 100, height: 3, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#9C27B0', borderRadius: 2 },
  // Drawer Modal Styles (Exact Replica of User Mockup)
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuSheetContainer: {
    backgroundColor: '#FAFCFA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 24,
  },
  menuTopMintSection: {
    backgroundColor: '#ECFDF5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    alignSelf: 'center',
    marginBottom: 10,
  },
  menuGreetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D1FAE5',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  menuAvatarImg: {
    width: 52,
    height: 52,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  greetingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  menuCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  locationMapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  greenPinWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryLocationLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  deliveryAddressMain: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  changeAddressLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeAddressLinkTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  miniMapWrap: {
    width: 90,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    position: 'relative',
  },
  miniMapImg: {
    width: '100%',
    height: '100%',
  },
  miniMapPinCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -5,
    marginLeft: -5,
  },
  miniMapDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  menuRowItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuRowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuRowSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  bottomFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
  },
  footerBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  footerBarTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  footerDivider: {
    color: '#CBD5E1',
    fontSize: 12,
  },
});
