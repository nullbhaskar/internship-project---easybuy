/**
 * EasyBuy Production Catalog Seeder
 * Complete state-wise catalog with rich product variety & 100% strict category matching.
 *
 * Usage:
 *   node scripts/seedFullCatalog.js
 */

const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, doc, writeBatch, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAccokA8hHD60rOs_R-1lrY_zfM3jrBCKI",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "easybuy-7ee49.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "easybuy-7ee49",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "easybuy-7ee49.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "908559589622",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:908559589622:web:e187e48b6aba7ea8944cd7",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// ─── 1. ALL 36 INDIAN STATES & UNION TERRITORIES ───
const INDIAN_STATES_AND_UTS = [
  { id: 'AP', stateId: 'AP', name: 'Andhra Pradesh', stateName: 'Andhra Pradesh', code: 'AP', type: 'State', capital: 'Amaravati', popularCities: ['Visakhapatnam', 'Vijayawada', 'Tirupati'], featuredCategories: ['electronics', 'grocery'], seasonalCollection: 'Coastal Harvest', heroBanner: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', deliveryEstimate: '10–25 mins' },
  { id: 'AR', stateId: 'AR', name: 'Arunachal Pradesh', stateName: 'Arunachal Pradesh', code: 'AR', type: 'State', capital: 'Itanagar', popularCities: ['Itanagar', 'Pasighat'], featuredCategories: ['lifestyle', 'grocery'], seasonalCollection: 'Organic Tea & Crafts', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'AS', stateId: 'AS', name: 'Assam', stateName: 'Assam', code: 'AS', type: 'State', capital: 'Dispur', popularCities: ['Guwahati', 'Silchar', 'Dibrugarh'], featuredCategories: ['grocery', 'fashion'], seasonalCollection: 'Assam Orthodox Tea & Silk', heroBanner: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'BR', stateId: 'BR', name: 'Bihar', stateName: 'Bihar', code: 'BR', type: 'State', capital: 'Patna', popularCities: ['Patna', 'Muzaffarpur', 'Darbhanga', 'Gaya'], featuredCategories: ['hostel_essentials', 'grocery', 'study_office'], seasonalCollection: 'Patna Sattu & Study Kits', heroBanner: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200', deliveryEstimate: '10–18 mins' },
  { id: 'CG', stateId: 'CG', name: 'Chhattisgarh', stateName: 'Chhattisgarh', code: 'CG', type: 'State', capital: 'Raipur', popularCities: ['Raipur', 'Bhilai'], featuredCategories: ['grocery', 'home_living'], seasonalCollection: 'Tribal Herbal Care', heroBanner: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200', deliveryEstimate: '12–25 mins' },
  { id: 'GA', stateId: 'GA', name: 'Goa', stateName: 'Goa', code: 'GA', type: 'State', capital: 'Panaji', popularCities: ['Panaji', 'Margao', 'Calangute'], featuredCategories: ['lifestyle', 'fashion', 'accessories'], seasonalCollection: 'Sunset Beachwear', heroBanner: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200', deliveryEstimate: '10–15 mins' },
  { id: 'GJ', stateId: 'GJ', name: 'Gujarat', stateName: 'Gujarat', code: 'GJ', type: 'State', capital: 'Gandhinagar', popularCities: ['Ahmedabad', 'Surat', 'Vadodara'], featuredCategories: ['fashion', 'grocery', 'kitchen'], seasonalCollection: 'Festive Bandhani & Snacks', heroBanner: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'HR', stateId: 'HR', name: 'Haryana', stateName: 'Haryana', code: 'HR', type: 'State', capital: 'Chandigarh', popularCities: ['Gurugram', 'Faridabad', 'Ambala'], featuredCategories: ['electronics', 'fitness', 'gaming'], seasonalCollection: 'Cyber Hub Tech', heroBanner: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200', deliveryEstimate: '10–15 mins' },
  { id: 'HP', stateId: 'HP', name: 'Himachal Pradesh', stateName: 'Himachal Pradesh', code: 'HP', type: 'State', capital: 'Shimla', popularCities: ['Shimla', 'Manali', 'Dharamshala'], featuredCategories: ['fashion', 'grocery', 'lifestyle'], seasonalCollection: 'Winter Woolens & Mountain Honey', heroBanner: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'JH', stateId: 'JH', name: 'Jharkhand', stateName: 'Jharkhand', code: 'JH', type: 'State', capital: 'Ranchi', popularCities: ['Ranchi', 'Jamshedpur', 'Dhanbad'], featuredCategories: ['study_office', 'electronics'], seasonalCollection: 'Steel City Tech & Student Needs', heroBanner: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200', deliveryEstimate: '12–22 mins' },
  { id: 'KA', stateId: 'KA', name: 'Karnataka', stateName: 'Karnataka', code: 'KA', type: 'State', capital: 'Bengaluru', popularCities: ['Bengaluru', 'Mysuru', 'Mangaluru'], featuredCategories: ['electronics', 'gaming', 'fashion'], seasonalCollection: 'Silicon Valley Gadgets & Filter Coffee', heroBanner: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1200', deliveryEstimate: '8–15 mins' },
  { id: 'KL', stateId: 'KL', name: 'Kerala', stateName: 'Kerala', code: 'KL', type: 'State', capital: 'Thiruvananthapuram', popularCities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode'], featuredCategories: ['grocery', 'beauty', 'health_care'], seasonalCollection: 'Spices, Coconut Oil & Ayurveda', heroBanner: 'https://images.unsplash.com/photo-1608248597261-e97d747f7b6f?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'MP', stateId: 'MP', name: 'Madhya Pradesh', stateName: 'Madhya Pradesh', code: 'MP', type: 'State', capital: 'Bhopal', popularCities: ['Indore', 'Bhopal', 'Gwalior'], featuredCategories: ['grocery', 'fashion', 'home_living'], seasonalCollection: 'Indori Namkeen & Chanderi Weaves', heroBanner: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'MH', stateId: 'MH', name: 'Maharashtra', stateName: 'Maharashtra', code: 'MH', type: 'State', capital: 'Mumbai', popularCities: ['Mumbai', 'Pune', 'Nagpur', 'Thane'], featuredCategories: ['fashion', 'beauty', 'electronics', 'gaming'], seasonalCollection: 'Gen-Z Streetwear & Fast Tech', heroBanner: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200', deliveryEstimate: '8–15 mins' },
  { id: 'MN', stateId: 'MN', name: 'Manipur', stateName: 'Manipur', code: 'MN', type: 'State', capital: 'Imphal', popularCities: ['Imphal', 'Thoubal'], featuredCategories: ['fashion', 'grocery'], seasonalCollection: 'Handloom Textiles', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'ML', stateId: 'ML', name: 'Meghalaya', stateName: 'Meghalaya', code: 'ML', type: 'State', capital: 'Shillong', popularCities: ['Shillong', 'Tura'], featuredCategories: ['lifestyle', 'grocery'], seasonalCollection: 'Monsoon Rainwear & Organic Spices', heroBanner: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'MZ', stateId: 'MZ', name: 'Mizoram', stateName: 'Mizoram', code: 'MZ', type: 'State', capital: 'Aizawl', popularCities: ['Aizawl', 'Lunglei'], featuredCategories: ['fashion', 'lifestyle'], seasonalCollection: 'Bamboo Handicrafts', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'NL', stateId: 'NL', name: 'Nagaland', stateName: 'Nagaland', code: 'NL', type: 'State', capital: 'Kohima', popularCities: ['Dimapur', 'Kohima'], featuredCategories: ['fashion', 'grocery'], seasonalCollection: 'Naga Handlooms & Chili', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'OR', stateId: 'OR', name: 'Odisha', stateName: 'Odisha', code: 'OR', type: 'State', capital: 'Bhubaneswar', popularCities: ['Bhubaneswar', 'Cuttack', 'Puri'], featuredCategories: ['grocery', 'home_living', 'fashion'], seasonalCollection: 'Sambalpuri Silk & Sweets', heroBanner: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200', deliveryEstimate: '12–25 mins' },
  { id: 'PB', stateId: 'PB', name: 'Punjab', stateName: 'Punjab', code: 'PB', type: 'State', capital: 'Chandigarh', popularCities: ['Ludhiana', 'Amritsar', 'Jalandhar'], featuredCategories: ['fitness', 'sports', 'grocery', 'fashion'], seasonalCollection: 'Amritsari Papad, Dairy & Phulkari', heroBanner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'RJ', stateId: 'RJ', name: 'Rajasthan', stateName: 'Rajasthan', code: 'RJ', type: 'State', capital: 'Jaipur', popularCities: ['Jaipur', 'Jodhpur', 'Udaipur'], featuredCategories: ['lifestyle', 'fashion', 'home_living'], seasonalCollection: 'Royal Mojaris & Block Prints', heroBanner: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'SK', stateId: 'SK', name: 'Sikkim', stateName: 'Sikkim', code: 'SK', type: 'State', capital: 'Gangtok', popularCities: ['Gangtok', 'Namchi'], featuredCategories: ['beauty', 'grocery'], seasonalCollection: 'Organic Tea & Himalayan Skincare', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'TN', stateId: 'TN', name: 'Tamil Nadu', stateName: 'Tamil Nadu', code: 'TN', type: 'State', capital: 'Chennai', popularCities: ['Chennai', 'Coimbatore', 'Madurai'], featuredCategories: ['electronics', 'grocery', 'fashion'], seasonalCollection: 'Filter Coffee & Kanjeevaram Weaves', heroBanner: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200', deliveryEstimate: '10–18 mins' },
  { id: 'TG', stateId: 'TG', name: 'Telangana', stateName: 'Telangana', code: 'TG', type: 'State', capital: 'Hyderabad', popularCities: ['Hyderabad', 'Warangal'], featuredCategories: ['electronics', 'gaming', 'grocery'], seasonalCollection: 'Cyberabad Tech & Biryani Spices', heroBanner: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=1200', deliveryEstimate: '10–15 mins' },
  { id: 'TR', stateId: 'TR', name: 'Tripura', stateName: 'Tripura', code: 'TR', type: 'State', capital: 'Agartala', popularCities: ['Agartala', 'Udaipur'], featuredCategories: ['lifestyle', 'grocery'], seasonalCollection: 'Bamboo Crafts', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'UP', stateId: 'UP', name: 'Uttar Pradesh', stateName: 'Uttar Pradesh', code: 'UP', type: 'State', capital: 'Lucknow', popularCities: ['Noida', 'Lucknow', 'Kanpur', 'Varanasi'], featuredCategories: ['fashion', 'study_office', 'hostel_essentials', 'grocery'], seasonalCollection: 'Chikan Weaves & Campus Essentials', heroBanner: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200', deliveryEstimate: '10–18 mins' },
  { id: 'UK', stateId: 'UK', name: 'Uttarakhand', stateName: 'Uttarakhand', code: 'UK', type: 'State', capital: 'Dehradun', popularCities: ['Dehradun', 'Haridwar', 'Rishikesh'], featuredCategories: ['fitness', 'lifestyle', 'grocery'], seasonalCollection: 'Organic Pulses & Adventure Gear', heroBanner: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200', deliveryEstimate: '12–25 mins' },
  { id: 'WB', stateId: 'WB', name: 'West Bengal', stateName: 'West Bengal', code: 'WB', type: 'State', capital: 'Kolkata', popularCities: ['Kolkata', 'Siliguri', 'Durgapur'], featuredCategories: ['grocery', 'lifestyle', 'beauty'], seasonalCollection: 'Darjeeling Tea & Bengali Sweets', heroBanner: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200', deliveryEstimate: '10–18 mins' },
  { id: 'DL', stateId: 'DL', name: 'Delhi', stateName: 'Delhi', code: 'DL', type: 'Union Territory', capital: 'New Delhi', popularCities: ['New Delhi', 'South Delhi', 'Connaught Place'], featuredCategories: ['fashion', 'electronics', 'beauty', 'gaming'], seasonalCollection: 'Gen-Z Streetwear & Flagship Tech', heroBanner: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200', deliveryEstimate: '8–12 mins' },
  { id: 'JK', stateId: 'JK', name: 'Jammu and Kashmir', stateName: 'Jammu and Kashmir', code: 'JK', type: 'Union Territory', capital: 'Srinagar', popularCities: ['Srinagar', 'Jammu'], featuredCategories: ['fashion', 'grocery', 'lifestyle'], seasonalCollection: 'Pashmina Shawls & Kashmiri Saffron', heroBanner: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'CH', stateId: 'CH', name: 'Chandigarh', stateName: 'Chandigarh', code: 'CH', type: 'Union Territory', capital: 'Chandigarh', popularCities: ['Chandigarh'], featuredCategories: ['fashion', 'fitness', 'gaming'], seasonalCollection: 'City Beautiful Streetwear', heroBanner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200', deliveryEstimate: '10–15 mins' },
];

// ─── 2. MAIN CATEGORIES ───
const PRODUCT_CATEGORIES = [
  { id: 'quickbuy', categoryId: 'quickbuy', name: 'QuickBuy (10-20 min)', icon: 'flash-outline', badgeBg: '#FFF9C4', badgeColor: '#F57F17', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', gradient: ['#F59E0B', '#EF4444'], displayOrder: 1, trendingScore: 99 },
  { id: 'electronics', categoryId: 'electronics', name: 'Electronics & Tech', icon: 'hardware-chip-outline', badgeBg: '#E1BEE7', badgeColor: '#7B1FA2', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', gradient: ['#8B5CF6', '#3B82F6'], displayOrder: 2, trendingScore: 98 },
  { id: 'fashion', categoryId: 'fashion', name: 'Fashion & Apparel', icon: 'shirt-outline', badgeBg: '#FCE4EC', badgeColor: '#C2185B', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', gradient: ['#EC4899', '#F43F5E'], displayOrder: 3, trendingScore: 97 },
  { id: 'beauty', categoryId: 'beauty', name: 'Beauty & Cosmetics', icon: 'sparkles-outline', badgeBg: '#F3E5F5', badgeColor: '#8E24AA', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500', gradient: ['#D946EF', '#A855F7'], displayOrder: 4, trendingScore: 96 },
  { id: 'home_living', categoryId: 'home_living', name: 'Home & Living', icon: 'home-outline', badgeBg: '#E0F2F1', badgeColor: '#00796B', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', gradient: ['#10B981', '#059669'], displayOrder: 5, trendingScore: 94 },
  { id: 'gaming', categoryId: 'gaming', name: 'Gaming Zone', icon: 'game-controller-outline', badgeBg: '#EDE7F6', badgeColor: '#512DA8', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500', gradient: ['#6366F1', '#4F46E5'], displayOrder: 6, trendingScore: 95 },
  { id: 'study_office', categoryId: 'study_office', name: 'Study & Office', icon: 'briefcase-outline', badgeBg: '#E8EAF6', badgeColor: '#303F9F', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500', gradient: ['#3B82F6', '#2563EB'], displayOrder: 7, trendingScore: 92 },
  { id: 'fitness', categoryId: 'fitness', name: 'Fitness & Gym', icon: 'barbell-outline', badgeBg: '#E0F7FA', badgeColor: '#0097A7', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500', gradient: ['#06B6D4', '#0891B2'], displayOrder: 8, trendingScore: 93 },
  { id: 'hostel_essentials', categoryId: 'hostel_essentials', name: 'Hostel Essentials', icon: 'bed-outline', badgeBg: '#FFF3E0', badgeColor: '#E65100', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500', gradient: ['#F97316', '#EA580C'], displayOrder: 9, trendingScore: 96 },
  { id: 'grocery', categoryId: 'grocery', name: 'Grocery & Snacks', icon: 'cart-outline', badgeBg: '#DCFCE7', badgeColor: '#166534', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', gradient: ['#22C55E', '#16A34A'], displayOrder: 10, trendingScore: 98 },
  { id: 'kitchen', categoryId: 'kitchen', name: 'Kitchen & Appliances', icon: 'restaurant-outline', badgeBg: '#FFE0B2', badgeColor: '#F57C00', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500', gradient: ['#FB923C', '#F97316'], displayOrder: 11, trendingScore: 91 },
  { id: 'lifestyle', categoryId: 'lifestyle', name: 'Lifestyle & Vibe', icon: 'bulb-outline', badgeBg: '#F1F8E9', badgeColor: '#558B2F', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500', gradient: ['#84CC16', '#65A30D'], displayOrder: 12, trendingScore: 95 },
  { id: 'accessories', categoryId: 'accessories', name: 'Accessories & Bags', icon: 'watch-outline', badgeBg: '#FFF8E1', badgeColor: '#FFA000', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', gradient: ['#EAB308', '#CA8A04'], displayOrder: 13, trendingScore: 94 },
  { id: 'footwear', categoryId: 'footwear', name: 'Footwear & Kicks', icon: 'footsteps-outline', badgeBg: '#EFEBE9', badgeColor: '#5D4037', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', gradient: ['#A16207', '#854D0E'], displayOrder: 14, trendingScore: 96 },
  { id: 'sports', categoryId: 'sports', name: 'Sports & Outdoors', icon: 'football-outline', badgeBg: '#E8F5E9', badgeColor: '#2E7D32', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500', gradient: ['#15803D', '#166534'], displayOrder: 15, trendingScore: 90 },
  { id: 'pet_care', categoryId: 'pet_care', name: 'Pet Care & Food', icon: 'paw-outline', badgeBg: '#F3E5F5', badgeColor: '#7B1FA2', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500', gradient: ['#C084FC', '#A855F7'], displayOrder: 16, trendingScore: 88 },
  { id: 'automobile', categoryId: 'automobile', name: 'Automobile & Bike', icon: 'car-sport-outline', badgeBg: '#ECEFF1', badgeColor: '#455A64', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500', gradient: ['#64748B', '#475569'], displayOrder: 17, trendingScore: 87 },
  { id: 'baby_care', categoryId: 'baby_care', name: 'Baby Care & Toys', icon: 'happy-outline', badgeBg: '#FFF0F5', badgeColor: '#DB7093', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500', gradient: ['#F472B6', '#E11D48'], displayOrder: 18, trendingScore: 89 },
  { id: 'health_care', categoryId: 'health_care', name: 'Health & Wellness', icon: 'medkit-outline', badgeBg: '#E0F7FA', badgeColor: '#00838F', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', gradient: ['#14B8A6', '#0D9488'], displayOrder: 19, trendingScore: 92 },
  { id: 'gifts', categoryId: 'gifts', name: 'Gifts & Hampers', icon: 'gift-outline', badgeBg: '#FFF3E0', badgeColor: '#EF6C00', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500', gradient: ['#F59E0B', '#D97706'], displayOrder: 20, trendingScore: 93 },
  { id: 'men', categoryId: 'men', name: "Men's Fashion", icon: 'shirt-outline', badgeBg: '#E0F2FE', badgeColor: '#0284C7', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500', gradient: ['#3B82F6', '#1E40AF'], displayOrder: 21, trendingScore: 97 },
  { id: 'women', categoryId: 'women', name: "Women's Fashion", icon: 'shirt-outline', badgeBg: '#FCE4EC', badgeColor: '#C2185B', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500', gradient: ['#EC4899', '#BE185D'], displayOrder: 22, trendingScore: 97 },
  { id: 'ethnic_wear', categoryId: 'ethnic_wear', name: "Ethnic Wear", icon: 'shirt-outline', badgeBg: '#FEF2F2', badgeColor: '#991B1B', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500', gradient: ['#B91C1C', '#991B1B'], displayOrder: 23, trendingScore: 97 },
];

const BRAND_CATALOG = [
  { id: 'apple', brandId: 'apple', name: 'Apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200', categories: ['electronics'], rating: 4.9 },
  { id: 'samsung', brandId: 'samsung', name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200', categories: ['electronics'], rating: 4.8 },
  { id: 'nothing', brandId: 'nothing', name: 'Nothing', logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200', categories: ['electronics'], rating: 4.7 },
  { id: 'boat', brandId: 'boat', name: 'boAt', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200', categories: ['electronics', 'gaming'], rating: 4.6 },
  { id: 'snitch', brandId: 'snitch', name: 'SNITCH', logo: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200', categories: ['fashion'], rating: 4.8 },
  { id: 'minimalist', brandId: 'minimalist', name: 'Minimalist', logo: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200', categories: ['beauty'], rating: 4.8 },
  { id: 'ikea', brandId: 'ikea', name: 'IKEA', logo: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200', categories: ['home_living', 'lifestyle'], rating: 4.8 },
  { id: 'milton', brandId: 'milton', name: 'Milton', logo: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200', categories: ['kitchen', 'hostel_essentials'], rating: 4.7 },
  { id: 'optimum', brandId: 'optimum', name: 'Optimum Nutrition', logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200', categories: ['fitness'], rating: 4.9 },
  { id: 'bihar_organics', brandId: 'bihar_organics', name: 'Bihar Organics', logo: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200', categories: ['grocery'], rating: 4.8 },
];

const CATEGORY_TEMPLATES = {
    electronics: [
      { sub: 'phones', title: 'Nothing Phone (2a) 5G (8GB/128GB)', brand: 'Nothing', basePrice: 23999, mrp: 25999, img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600' },
      { sub: 'phones', title: 'Apple iPhone 15 (128GB)', brand: 'Apple', basePrice: 65999, mrp: 79900, img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600' },
      { sub: 'phones', title: 'Samsung Galaxy S24 Ultra 5G', brand: 'Samsung', basePrice: 129999, mrp: 134999, img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600' },
      { sub: 'laptops', title: 'Apple MacBook Air M2 (8GB/256GB SSD)', brand: 'Apple', basePrice: 89900, mrp: 99900, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
      { sub: 'laptops', title: 'ASUS TUF Gaming F15 Laptop', brand: 'ASUS', basePrice: 52990, mrp: 74990, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
      { sub: 'earbuds', title: 'boAt Airdopes 141 ANC TWS Earbuds', brand: 'boAt', basePrice: 1299, mrp: 2990, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600' },
      { sub: 'smartwatches', title: 'Apple Watch Series 9 GPS 45mm', brand: 'Apple', basePrice: 41900, mrp: 44900, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
    ],
    fashion: [
      { sub: 'mens_fashion', title: 'Italian Tailored Slim-Fit Navy Blazer Suit', brand: 'Raymond', basePrice: 4999, mrp: 7999, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600' },
      { sub: 'ethnic_wear', title: 'Royal Banarasi Silk Saree with Zari Border', brand: 'Rajasthan Crafts', basePrice: 3499, mrp: 5999, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Handcrafted Cotton Silk Kurta Pajama Set for Men', brand: 'Manyavar', basePrice: 2299, mrp: 3999, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
      { sub: 'womens_fashion', title: 'Floral Print Tiered Summer Midi Dress', brand: 'ZARA', basePrice: 1899, mrp: 3299, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e9271?w=600' },
      { sub: 'mens_fashion', title: 'Vintage Biker Faux Leather Jacket Black', brand: 'SNITCH', basePrice: 2999, mrp: 4999, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600' },
      { sub: 'baggy_jeans', title: 'Retro Washed Oversized Baggy Denim', brand: 'SNITCH', basePrice: 1499, mrp: 2499, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600' },
      { sub: 'cargo_pants', title: 'Y2K Streetwear Wide Leg Cargo Pants', brand: 'SNITCH', basePrice: 1699, mrp: 2799, img: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600' },
      { sub: 'oversized_tees', title: 'Heavyweight 240GSM Tokyo Graphic Tee', brand: 'Bewakoof', basePrice: 699, mrp: 1299, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
      { sub: 'hoodies', title: 'Vintage Fleece Pullover Oversized Hoodie', brand: 'SNITCH', basePrice: 1299, mrp: 2299, img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600' },
    ],
    beauty: [
      { sub: 'serum', title: 'Minimalist 10% Niacinamide Face Serum 30ml', brand: 'Minimalist', basePrice: 599, mrp: 699, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600' },
      { sub: 'k_beauty', title: 'Korean Rice Water Brightening Cleansing Foam', brand: 'The Face Shop', basePrice: 499, mrp: 650, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600' },
      { sub: 'sunscreen', title: 'SPF 50 PA++++ Lightweight Dewy Sunscreen Gel', brand: 'Minimalist', basePrice: 399, mrp: 499, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600' },
      { sub: 'makeup', title: 'Velvet Matte Long-Wearing Liquid Lipstick 5ml', brand: 'Maybelline', basePrice: 449, mrp: 699, img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600' },
      { sub: 'skincare', title: 'Vitamin C Radiance Face Glow Sheet Mask Pack of 5', brand: 'Garnier', basePrice: 299, mrp: 499, img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600' },
      { sub: 'haircare', title: 'Natural Botanical Hair Growth Oil 100ml', brand: 'Mamaearth', basePrice: 399, mrp: 599, img: 'https://images.unsplash.com/photo-1608248597261-e97d747f7b6f?w=600' },
    ],
    grocery: [
      { sub: 'regional_food', title: 'Organic Roasted Chana Sattu 1kg', brand: 'Bihar Organics', basePrice: 249, mrp: 349, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600' },
      { sub: 'regional_food', title: 'Darbhanga Grade-A Crispy Roasted Makhana 500g', brand: 'Bihar Organics', basePrice: 499, mrp: 699, img: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600' },
      { sub: 'regional_food', title: 'Amritsari Spicy Urad Dal Papad 500g', brand: 'Punjab Delights', basePrice: 199, mrp: 289, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600' },
      { sub: 'regional_food', title: 'Malabar Thin Coconut Oil Banana Chips 500g', brand: 'Kerala Fresh', basePrice: 279, mrp: 399, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600' },
      { sub: 'regional_food', title: 'Darjeeling First Flush Orthodox Black Tea 250g', brand: 'Bengal Organics', basePrice: 599, mrp: 899, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600' },
      { sub: 'regional_food', title: 'Pampore Grade-A1 Pure Kashmiri Saffron Mongra 2g', brand: 'Kashmir Organics', basePrice: 899, mrp: 1299, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600' },
      { sub: 'dry_fruits', title: 'California Roasted & Salted Almonds 500g', brand: 'Happilo', basePrice: 499, mrp: 699, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600' },
      { sub: 'staples', title: 'Organic Himalayan Red Rice 1kg', brand: 'Organica', basePrice: 199, mrp: 299, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600' },
    ],
    home_living: [
      { sub: 'furniture', title: 'Ergonomic Mesh High-Back Office Chair', brand: 'IKEA', basePrice: 4999, mrp: 7999, img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600' },
      { sub: 'furniture', title: 'Solid Wood Coffee Table with Storage', brand: 'IKEA', basePrice: 3499, mrp: 5999, img: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600' },
      { sub: 'decor', title: 'Velvet Touch Decorative Throw Pillow Cover Set of 4', brand: 'IKEA', basePrice: 699, mrp: 1199, img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600' },
      { sub: 'bedding', title: 'Microfiber Lightweight All-Season AC Comforter Double', brand: 'Solimo', basePrice: 1499, mrp: 2499, img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600' },
      { sub: 'lighting', title: 'Warm White Fairy LED String Lights 10m', brand: 'Wipro', basePrice: 349, mrp: 599, img: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600' },
    ],
    gaming: [
      { sub: 'controllers', title: 'PS5 DualSense Wireless Controller', brand: 'Sony', basePrice: 5490, mrp: 6390, img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600' },
      { sub: 'mice', title: 'Logitech G304 Lightspeed Wireless Gaming Mouse', brand: 'Logitech', basePrice: 2495, mrp: 3795, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600' },
      { sub: 'headsets', title: 'Over-Ear RGB Gaming Headset 7.1 Surround Sound', brand: 'Razer', basePrice: 3999, mrp: 5999, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600' },
      { sub: 'keyboards', title: 'Mechanical RGB Gaming Keyboard Blue Switches', brand: 'Redragon', basePrice: 2799, mrp: 4299, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
      { sub: 'consoles', title: 'Nintendo Switch OLED Model Gaming Console', brand: 'Nintendo', basePrice: 31999, mrp: 35999, img: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600' },
    ],
    hostel_essentials: [
      { sub: 'electric_kettle', title: 'Milton 1.8L Stainless Steel Electric Kettle', brand: 'Milton', basePrice: 799, mrp: 1499, img: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600' },
      { sub: 'study_lamp', title: 'Rechargeable Touch Dimming LED Desk Lamp', brand: 'Wipro', basePrice: 599, mrp: 1199, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600' },
      { sub: 'storage', title: 'Heavy-Duty Mesh Laundry Bag Basket Foldable', brand: 'Solimo', basePrice: 299, mrp: 499, img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600' },
      { sub: 'extension', title: 'Portable Universal Extension Cord Spool 5m', brand: 'Anchor', basePrice: 449, mrp: 799, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600' },
    ],
    lifestyle: [
      { sub: 'tumbler', title: '1.2L Insulated Stainless Steel Tumbler with Straw', brand: 'IKEA', basePrice: 999, mrp: 1799, img: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=600' },
      { sub: 'galaxy_projector', title: 'Galaxy Star Projector Night Light with Speaker', brand: 'EasyBuy Select', basePrice: 1499, mrp: 2999, img: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600' },
      { sub: 'speakers', title: 'Portable Bluetooth Mini Speaker 10W Waterproof', brand: 'JBL', basePrice: 1999, mrp: 3499, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600' },
      { sub: 'diffuser', title: 'Aromatherapy Essential Oil Diffuser Humidifier', brand: 'Wipro', basePrice: 899, mrp: 1499, img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600' },
    ],
    kitchen: [
      { sub: 'appliances', title: 'Digital Air Fryer 4.2L Rapid Hot Air Tech', brand: 'Milton', basePrice: 3499, mrp: 5999, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { sub: 'appliances', title: 'High-Speed Bullet Mixer Grinder 900W', brand: 'NutriBullet', basePrice: 2799, mrp: 4499, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },
      { sub: 'appliances', title: 'Multi-Cooker Electric Kettle & Noodle Pot 1.5L', brand: 'Milton', basePrice: 1199, mrp: 1999, img: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600' },
      { sub: 'cookware', title: 'Non-Stick Granite Cookware Set 3 Pcs', brand: 'Prestige', basePrice: 1899, mrp: 3299, img: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600' },
      { sub: 'appliances', title: 'Pop-Up 2-Slice Stainless Steel Bread Toaster', brand: 'Philips', basePrice: 1299, mrp: 1999, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600' },
    ],
    automobile: [
      { sub: 'riding_gear', title: 'DOT Certified Full Face Motorcycle Helmet', brand: 'Studds', basePrice: 1999, mrp: 3499, img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600' },
    ],
    gifts: [
      { sub: 'hampers', title: 'Gourmet Chocolate & Dry Fruits Gift Box', brand: 'EasyBuy Select', basePrice: 1299, mrp: 2199, img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600' },
      { sub: 'perfumes', title: 'Luxury Perfume & Grooming Fragrance Gift Set', brand: 'EasyBuy Select', basePrice: 1899, mrp: 2999, img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600' },
      { sub: 'wellness', title: 'Self-Care Spa & Organic Wellness Gift Basket', brand: 'Minimalist', basePrice: 1499, mrp: 2499, img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600' },
      { sub: 'executive', title: 'Executive Leather Wallet & Metal Rollerball Pen Combo Set', brand: 'EasyBuy Select', basePrice: 999, mrp: 1799, img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600' },
      { sub: 'gadgets', title: 'Galaxy Star Projector Night Light Gift Set', brand: 'EasyBuy Select', basePrice: 1499, mrp: 2999, img: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600' },
      { sub: 'toys', title: 'Giant 4-Foot Soft Plush Teddy Bear Gift', brand: 'EasyBuy Select', basePrice: 1299, mrp: 2499, img: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600' },
      { sub: 'tech_gifts', title: 'Instant Pocket Bluetooth Photo Printer Gift Kit', brand: 'Fujifilm', basePrice: 3999, mrp: 5999, img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600' },
      { sub: 'handicrafts', title: 'Royal Jaipur Wooden & Brass Keepsake Gift Box', brand: 'Rajasthan Crafts', basePrice: 899, mrp: 1499, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600' },
      { sub: 'smartwatches', title: 'Apple Watch Series 9 GPS 45mm (Gift Edition)', brand: 'Apple', basePrice: 41900, mrp: 44900, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { sub: 'earbuds', title: 'boAt Airdopes 141 ANC TWS Earbuds (Gift Pack)', brand: 'boAt', basePrice: 1299, mrp: 2990, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600' },
      { sub: 'phones', title: 'Nothing Phone (2a) 5G (8GB/128GB) (Gift Edition)', brand: 'Nothing', basePrice: 23999, mrp: 25999, img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600' },
      { sub: 'controllers', title: 'PS5 DualSense Wireless Controller (Cosmic Red Gift)', brand: 'Sony', basePrice: 5490, mrp: 6390, img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600' },
      { sub: 'baggy_jeans', title: 'Retro Washed Oversized Baggy Denim (Gift Pack)', brand: 'SNITCH', basePrice: 1499, mrp: 2499, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600' },
      { sub: 'sneakers', title: 'Chunky White Retro Streetwear Sneakers (Gift Pack)', brand: 'SNITCH', basePrice: 1899, mrp: 3499, img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600' },
      { sub: 'mojari', title: 'Royal Jaipur Handcrafted Leather Mojari Gift Pair', brand: 'Rajasthan Crafts', basePrice: 1299, mrp: 2299, img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600' },
      { sub: 'hoodies', title: 'Vintage Fleece Pullover Oversized Hoodie (Gift Edition)', brand: 'SNITCH', basePrice: 1299, mrp: 2299, img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600' },
      { sub: 'tumbler', title: '1.2L Insulated Stainless Steel Tumbler (Gift Box)', brand: 'IKEA', basePrice: 999, mrp: 1799, img: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=600' },
      { sub: 'serum', title: 'Minimalist Glow Serum Gift Set 30ml', brand: 'Minimalist', basePrice: 599, mrp: 699, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600' },
      { sub: 'appliances', title: 'Digital Air Fryer 4.2L (Home Gift Pack)', brand: 'Milton', basePrice: 3499, mrp: 5999, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { sub: 'bags', title: 'Waterproof Anti-Theft Laptop Backpack 30L (Gift Edition)', brand: 'Wildcraft', basePrice: 1299, mrp: 2499, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { sub: 'sports_gear', title: 'English Willow Grade-1 Cricket Bat (Pro Gift)', brand: 'SG', basePrice: 2499, mrp: 4499, img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600' },
      { sub: 'electric_kettle', title: 'Milton 1.8L Stainless Steel Kettle (Campus Gift)', brand: 'Milton', basePrice: 799, mrp: 1499, img: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600' },
    ],
    baby_care: [
      { sub: 'toys', title: 'BPA-Free Food Grade Soft Silicone Baby Teether', brand: 'MeeMee', basePrice: 299, mrp: 499, img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600' },
      { sub: 'toys', title: 'Soft Plush Animal Rattle Toy Set 3 Pcs', brand: 'Fisher-Price', basePrice: 499, mrp: 799, img: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600' },
      { sub: 'feeding', title: 'Anti-Colic Glass Baby Feeding Bottle 250ml', brand: 'Pigeon', basePrice: 599, mrp: 899, img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600' },
      { sub: 'skincare', title: 'Gentle Organic Baby Bath Shampoo & Wash 200ml', brand: 'Mamaearth', basePrice: 349, mrp: 499, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600' },
      { sub: 'diapering', title: 'Ultra Soft Baby Diaper Pants Large 32 Pack', brand: 'Pampers', basePrice: 699, mrp: 999, img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600' },
      { sub: 'diapering', title: 'Gentle Water Wipes 72 Sheets Pack of 3', brand: 'Huggies', basePrice: 399, mrp: 599, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600' },
      { sub: 'clothing', title: 'Organic Soft Cotton Newborn Onesies Gift Set 5 Pcs', brand: 'Mothercare', basePrice: 999, mrp: 1699, img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600' },
      { sub: 'gear', title: 'Lightweight Foldable Baby Stroller & Pram', brand: 'LuvLap', basePrice: 3499, mrp: 5999, img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600' },
      { sub: 'toys', title: 'Musical Activity Gym & Play Mat with Hanging Toys', brand: 'Fisher-Price', basePrice: 1899, mrp: 2999, img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600' },
      { sub: 'feeding', title: 'Baby High Chair with Adjustable Tray & Safety Harness', brand: 'Chicco', basePrice: 2799, mrp: 4499, img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600' },
      { sub: 'feeding', title: 'Electric Steam Baby Bottle Sterilizer & Warmer', brand: 'Philips Avent', basePrice: 2499, mrp: 3999, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600' },
      { sub: 'skincare', title: 'Organic Baby Moisturizing Cream & Body Lotion 200ml', brand: 'Sebamed', basePrice: 449, mrp: 699, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600' },
      { sub: 'toys', title: 'Wooden Educational Building Blocks Toy Set 50 Pcs', brand: 'Melissa & Doug', basePrice: 799, mrp: 1299, img: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600' },
      { sub: 'gear', title: 'Ergonomic 3-in-1 Baby Carrier Backpack Harness', brand: 'MeeMee', basePrice: 1499, mrp: 2499, img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600' },
      { sub: 'nursery', title: 'Non-Toxic Baby Playpen Safety Gate Activity Center', brand: 'LuvLap', basePrice: 4999, mrp: 7999, img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600' },
      { sub: 'toys', title: 'Electronic Musical Learning Piano Toy for Toddlers', brand: 'Fisher-Price', basePrice: 899, mrp: 1499, img: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600' },
    ],
    health_care: [
      { sub: 'wellness', title: 'Digital Upper Arm Blood Pressure Monitor', brand: 'Omron', basePrice: 1299, mrp: 2299, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600' },
      { sub: 'thermometer', title: 'Non-Contact Infrared Digital Forehead Thermometer', brand: 'Dr. Trust', basePrice: 999, mrp: 1899, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600' },
      { sub: 'oximeter', title: 'Pulse Oximeter Finger Blood Oxygen Monitor', brand: 'Dr. Trust', basePrice: 799, mrp: 1499, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600' },
      { sub: 'supplements', title: 'Daily Multivitamin Gummies 60s Bottle', brand: 'HealthKart', basePrice: 499, mrp: 799, img: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600' },
      { sub: 'first_aid', title: 'Complete Emergency First Aid Kit with Medical Supplies', brand: 'Dettol', basePrice: 399, mrp: 699, img: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600' },
    ],
    kitchen: [
      { sub: 'appliances', title: 'Digital Air Fryer 4.2L Rapid Hot Air Tech', brand: 'Milton', basePrice: 3499, mrp: 5999, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { sub: 'appliances', title: 'High-Speed Bullet Mixer Grinder 900W', brand: 'NutriBullet', basePrice: 2799, mrp: 4499, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },
      { sub: 'appliances', title: 'Multi-Cooker Electric Kettle & Noodle Pot 1.5L', brand: 'Milton', basePrice: 1199, mrp: 1999, img: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600' },
      { sub: 'cookware', title: 'Non-Stick Granite Cookware Set 3 Pcs', brand: 'Prestige', basePrice: 1899, mrp: 3299, img: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600' },
    ],
    automobile: [
      { sub: 'riding_gear', title: 'DOT Certified Full Face Motorcycle Helmet', brand: 'Studds', basePrice: 1999, mrp: 3499, img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600' },
      { sub: 'car_care', title: 'High Pressure Portable Car Washer & Foam Spray', brand: 'Bosch', basePrice: 2499, mrp: 4299, img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600' },
      { sub: 'accessories', title: 'Waterproof All-Weather Silver Car Body Cover', brand: 'AutoForm', basePrice: 1299, mrp: 2199, img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600' },
      { sub: 'car_electronics', title: 'Bluetooth Car Receiver & Wireless FM Transmitter', brand: 'boAt', basePrice: 599, mrp: 1199, img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600' },
      { sub: 'car_electronics', title: 'Touchscreen 7-Inch Android Car Stereo Player', brand: 'Sony', basePrice: 6999, mrp: 9999, img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600' },
      { sub: 'car_care', title: 'Automatic Car Vacuum Cleaner High Power 120W', brand: 'Black+Decker', basePrice: 1499, mrp: 2499, img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600' },
      { sub: 'riding_gear', title: 'Protective Armored Biker Riding Gloves Touchscreen', brand: 'Royal Enfield', basePrice: 899, mrp: 1499, img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600' },
      { sub: 'tools', title: 'Heavy Duty Portable Tire Inflator Air Compressor 12V', brand: 'Michelin', basePrice: 1899, mrp: 2999, img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600' },
      { sub: 'accessories', title: 'Leatherette Ergonomic Car Seat Cushion Set', brand: 'AutoForm', basePrice: 1599, mrp: 2799, img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600' },
      { sub: 'accessories', title: 'Universal Car Mobile Holder Mount 360 Rotation', brand: 'Portronics', basePrice: 399, mrp: 799, img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600' },
      { sub: 'lighting', title: 'Super Bright LED Headlight Bulbs H7 Pack of 2', brand: 'Philips', basePrice: 1299, mrp: 2199, img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600' },
      { sub: 'maintenance', title: 'Synthetic Engine Oil 15W-50 2.5L for Motorcycles', brand: 'Motul', basePrice: 1199, mrp: 1699, img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600' },
    ],
    pet_care: [
      { sub: 'pet_food', title: 'Pedigree Adult Dry Dog Food Chicken 3kg', brand: 'Pedigree', basePrice: 799, mrp: 1050, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600' },
      { sub: 'pet_food', title: 'Whiskas Dry Cat Food Ocean Fish 1.2kg', brand: 'Whiskas', basePrice: 449, mrp: 599, img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600' },
      { sub: 'accessories', title: 'Stainless Steel Anti-Skid Pet Feeding Bowls Pair', brand: 'SuperPets', basePrice: 349, mrp: 599, img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600' },
      { sub: 'bedding', title: 'Soft Fleece Cushion Pet Bed Large', brand: 'SuperPets', basePrice: 899, mrp: 1499, img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600' },
      { sub: 'pet_food', title: 'Creamy Purrrr Cat Wet Food Treats Box 12 Pack', brand: 'Sheba', basePrice: 399, mrp: 549, img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600' },
      { sub: 'pet_food', title: 'Royal Canin Adult Golden Retriever Dry Food 3kg', brand: 'Royal Canin', basePrice: 1899, mrp: 2499, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600' },
      { sub: 'toys', title: 'Interactive Automatic Laser Toy for Cats & Kittens', brand: 'SuperPets', basePrice: 499, mrp: 899, img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600' },
      { sub: 'accessories', title: 'Heavy-Duty Adjustable Nylon Dog Collar & Leash Set', brand: 'SuperPets', basePrice: 399, mrp: 699, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600' },
      { sub: 'grooming', title: 'Organic Herbal Pet Shampoo & Deodorizer 500ml', brand: 'Himalaya', basePrice: 299, mrp: 449, img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600' },
      { sub: 'grooming', title: 'Slicker Dog Grooming Brush & Deshedding Comb', brand: 'SuperPets', basePrice: 349, mrp: 599, img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600' },
      { sub: 'toys', title: 'Squeaky Durable Rubber Chew Bone Toy for Dogs', brand: 'KONG', basePrice: 299, mrp: 499, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600' },
      { sub: 'litter_care', title: 'Odor Control Clumping Bentonite Cat Litter 5kg', brand: 'SuperPets', basePrice: 499, mrp: 799, img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600' },
      { sub: 'travel', title: 'Foldable Breathable Pet Travel Carrier Bag', brand: 'SuperPets', basePrice: 1299, mrp: 2199, img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600' },
      { sub: 'health', title: 'Multivitamin Chewable Supplements for Dogs 60s', brand: 'Drools', basePrice: 399, mrp: 599, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600' },
    ],
    sports: [
      { sub: 'cricket', title: 'English Willow Grade-1 Professional Cricket Bat', brand: 'SG', basePrice: 2499, mrp: 4499, img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600' },
      { sub: 'football', title: 'UEFA Approved Match Size-5 Football', brand: 'Adidas', basePrice: 999, mrp: 1799, img: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600' },
      { sub: 'badminton', title: 'Carbon Fiber Lightweight Badminton Racket Pair', brand: 'Yonex', basePrice: 1899, mrp: 2999, img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600' },
      { sub: 'yoga', title: 'Non-Slip TPE Yoga Mat 6mm with Strap', brand: 'Decathlon', basePrice: 699, mrp: 1299, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600' },
      { sub: 'gym', title: 'Adjustable Rubberized Steel Dumbbells 10kg Pair', brand: 'Cosco', basePrice: 1499, mrp: 2499, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' },
      { sub: 'camping', title: 'Waterproof Outdoor 4-Person Camping Tent', brand: 'Quechua', basePrice: 3499, mrp: 5999, img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600' },
      { sub: 'table_tennis', title: 'Pro Tournament Table Tennis Racket Set with Balls', brand: 'Stag', basePrice: 899, mrp: 1499, img: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600' },
      { sub: 'basketball', title: 'Premium Synthetic Leather Basketball Size-7', brand: 'Spalding', basePrice: 1299, mrp: 2199, img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600' },
      { sub: 'accessories', title: 'Insulated Stainless Steel Sports Water Bottle 1L', brand: 'Milton', basePrice: 599, mrp: 999, img: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=600' },
      { sub: 'fitness', title: 'Adjustable Speed Skipping Rope with Ball Bearings', brand: 'Decathlon', basePrice: 299, mrp: 499, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' },
      { sub: 'football', title: 'Pro Finger Save Goalkeeper Gloves', brand: 'Adidas', basePrice: 799, mrp: 1399, img: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600' },
      { sub: 'fitness', title: 'Elastic Knee Support & Compression Sleeves Pair', brand: 'Nivia', basePrice: 349, mrp: 599, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600' },
      { sub: 'badminton', title: 'Professional Shuttlecocks Duck Feather 12 Pack', brand: 'Yonex', basePrice: 699, mrp: 1099, img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600' },
      { sub: 'camping', title: 'Outdoor Trekking Backpack 45L with Rain Cover', brand: 'Wildcraft', basePrice: 2499, mrp: 4199, img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600' },
    ],
    footwear: [
      { sub: 'sneakers', title: 'Chunky White Retro Streetwear Sneakers', brand: 'SNITCH', basePrice: 1899, mrp: 3499, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
      { sub: 'mojari', title: 'Royal Jaipur Handcrafted Leather Mojari Shoes', brand: 'Rajasthan Crafts', basePrice: 1299, mrp: 2299, img: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600' },
      { sub: 'running', title: 'Breathable Lightweight Mesh Running Shoes', brand: 'Puma', basePrice: 2299, mrp: 3999, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { sub: 'canvas', title: 'Vintage High-Top Black Canvas Sneakers', brand: 'Converse', basePrice: 1699, mrp: 2799, img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600' },
      { sub: 'formal', title: 'Italian Genuine Leather Formal Oxford Dress Shoes', brand: 'Red Tape', basePrice: 2499, mrp: 4499, img: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600' },
      { sub: 'sneakers', title: 'Y2K Chunky Platform Dad Sneakers', brand: 'Nike', basePrice: 3499, mrp: 5999, img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600' },
      { sub: 'sandals', title: 'Unisex Comfortable EVA Slide Sandals & Clogs', brand: 'Crocs', basePrice: 1199, mrp: 1999, img: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600' },
      { sub: 'basketball', title: 'High-Performance Pro Basketball Sneakers', brand: 'Jordan', basePrice: 5999, mrp: 8999, img: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600' },
      { sub: 'boots', title: 'Classic Suede Leather Chelsea Ankle Boots', brand: 'Woodland', basePrice: 3299, mrp: 5499, img: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600' },
      { sub: 'mojari', title: 'Handstitched Traditional Kolhapuri Leather Chappal', brand: 'Rajasthan Crafts', basePrice: 999, mrp: 1699, img: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600' },
      { sub: 'boots', title: 'Lightweight Waterproof Trekking & Hiking Boots', brand: 'Wildcraft', basePrice: 2899, mrp: 4799, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { sub: 'formal', title: 'Slip-On Breathable Genuine Leather Loafers', brand: 'Louis Philippe', basePrice: 2199, mrp: 3799, img: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600' },
      { sub: 'heels', title: 'Metallic Strap Stiletto High Heels Party Sandals', brand: 'Bata', basePrice: 1899, mrp: 2999, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600' },
      { sub: 'running', title: 'Ergonomic Orthopedic Arch Support Walking Shoes', brand: 'Skechers', basePrice: 2799, mrp: 4499, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { sub: 'sandals', title: 'Lightweight EVA Flip-Flops & Beach Slippers', brand: 'Puma', basePrice: 499, mrp: 899, img: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600' },
      { sub: 'sneakers', title: 'Retro Suede Low-Top Skateboarding Shoes', brand: 'Vans', basePrice: 2299, mrp: 3699, img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600' },
      { sub: 'boots', title: 'High-Top Insulated Waterproof Winter Snow Boots', brand: 'Woodland', basePrice: 3899, mrp: 6499, img: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600' },
      { sub: 'running', title: 'Gym & Cross-Training Athletic Performance Shoes', brand: 'Reebok', basePrice: 2599, mrp: 4199, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
    ],
    accessories: [
      { sub: 'bags', title: 'Waterproof Anti-Theft Laptop Backpack 30L', brand: 'Wildcraft', basePrice: 1299, mrp: 2499, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { sub: 'wallets', title: 'Genuine Leather RFID Blocking Slim Wallet', brand: 'Wildcraft', basePrice: 599, mrp: 1199, img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600' },
      { sub: 'sunglasses', title: 'UV400 Polarized Aviator Sunglasses', brand: 'Ray-Ban', basePrice: 1499, mrp: 2999, img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600' },
    ],
    study_office: [
      { sub: 'study_lamp', title: 'Architect LED Touch Dimming Desk Lamp', brand: 'Wipro', basePrice: 699, mrp: 1299, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600' },
      { sub: 'stationery', title: 'Hardcover Executive Notebook & Metal Pen Set', brand: 'Parker', basePrice: 499, mrp: 899, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600' },
      { sub: 'organizer', title: 'Bamboo Wooden Desktop Organizer with Pen Stand', brand: 'IKEA', basePrice: 799, mrp: 1399, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600' },
    ],
    quickbuy: [
      { sub: 'snacks', title: 'Superfast Midnight Munchies Combo Kit (10-Min Delivery)', brand: 'EasyBuy Express', basePrice: 199, mrp: 299, img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600' },
      { sub: 'tech_express', title: 'Instant Type-C 65W Fast Charging Kit', brand: 'EasyBuy Express', basePrice: 499, mrp: 999, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600' },
    ]
  };

function generateCoreProducts() {
  const products = [];
  let globalIdCounter = 1000;
  const now = new Date().toISOString();

  for (let sIdx = 0; sIdx < INDIAN_STATES_AND_UTS.length; sIdx++) {
    const state = INDIAN_STATES_AND_UTS[sIdx];
    const cities = state.popularCities;

    for (let cIdx = 0; cIdx < PRODUCT_CATEGORIES.length; cIdx++) {
      const category = PRODUCT_CATEGORIES[cIdx];
      if (category.id === 'quickbuy') continue; // Skip quickbuy for core products

      const templates = CATEGORY_TEMPLATES[category.id] || [];
      // Pick 2-3 distinct items per category per state for variety
      const targetPerCat = Math.min(templates.length, 2);

      for (let tIdx = 0; tIdx < targetPerCat; tIdx++) {
        globalIdCounter++;
        const tmpl = templates[(sIdx + tIdx) % templates.length];
        const city = cities[(tIdx + sIdx) % cities.length];
        const price = tmpl.basePrice + ((sIdx * 7 + tIdx * 11) % 40) - 20;
        const mrp = Math.max(price + 40, tmpl.mrp);
        const discountPct = Math.round(((mrp - price) / mrp) * 100);
        const productId = `prod_${category.id}_${state.id.toLowerCase()}_${globalIdCounter}`;
        const title = sIdx % 5 === 0 ? `${tmpl.title} (${state.name} Edition)` : tmpl.title;

        products.push({
          id: productId,
          productId: productId,
          title: title,
          name: title,
          shortTitle: tmpl.title,
          description: `Authentic ${tmpl.title} available with fast express delivery in ${city}, ${state.name}. Guaranteed 100% genuine with official brand warranty.`,
          shortDescription: tmpl.title,
          longDescription: `Get your ${tmpl.title} delivered in ${city}, ${state.name} with superfast shipping and cash on delivery.`,
          brand: tmpl.brand,
          brandId: tmpl.brand.toLowerCase().replace(/\s+/g, '_'),

          categoryId: category.id,
          categoryName: category.name,
          subcategoryId: tmpl.sub,
          subcategoryName: tmpl.sub,

          stateId: state.id,
          stateName: state.name,
          city: city,
          locality: `${city} Central`,

          price: price,
          priceNumber: price,
          mrp: mrp,
          originalPriceNumber: mrp,
          discountPercentage: discountPct,
          discountPct: `${discountPct}%`,

          rating: parseFloat((4.3 + ((sIdx + tIdx) % 5) * 0.1).toFixed(1)),
          ratingString: String(parseFloat((4.3 + ((sIdx + tIdx) % 5) * 0.1).toFixed(1))),
          reviewCount: 150 + (((sIdx + tIdx) * 43) % 500),

          stock: 50,
          availability: 'In Stock',
          stockStatus: 'In Stock',

          images: [tmpl.img],
          thumbnail: tmpl.img,

          isTrending: tIdx === 0,
          isBestSeller: (sIdx + tIdx) % 2 === 0,
          isBestseller: (sIdx + tIdx) % 2 === 0,
          isNewArrival: tIdx === 1,
          isQuickDelivery: (sIdx + tIdx) % 2 === 0,
          deliveryTime: (sIdx + tIdx) % 2 === 0 ? '10–20 mins' : '25–40 mins',
          deliveryMinutes: (sIdx + tIdx) % 2 === 0 ? 15 : 30,
          updatedAt: now,
          createdAt: now,
        });
      }
    }
  }

  return { products, lastCounter: globalIdCounter };
}

function generateQuickBuyProducts(startCounter) {
  const products = [];
  let counter = startCounter;
  const now = new Date().toISOString();
  const qbCategory = PRODUCT_CATEGORIES.find(c => c.id === 'quickbuy') || { id: 'quickbuy', name: 'QuickBuy (10-20 min)' };
  const templates = CATEGORY_TEMPLATES['quickbuy'] || [];

  for (let sIdx = 0; sIdx < INDIAN_STATES_AND_UTS.length; sIdx++) {
    const state = INDIAN_STATES_AND_UTS[sIdx];
    const cities = state.popularCities;

    for (let tIdx = 0; tIdx < templates.length; tIdx++) {
      counter++;
      const tmpl = templates[tIdx];
      const city = cities[tIdx % cities.length];
      const productId = `prod_qb_${state.id.toLowerCase()}_${counter}`;
      const title = `${tmpl.title} (${state.name})`;
      const price = tmpl.basePrice + ((sIdx * 5) % 50);
      const mrp = Math.max(price + 50, tmpl.mrp);
      const discountPct = Math.round(((mrp - price) / mrp) * 100);

      products.push({
        id: productId,
        productId: productId,
        title: title,
        name: title,
        shortTitle: tmpl.title,
        description: `Authentic ${tmpl.title} delivered superfast in 10 mins across ${city}, ${state.name}.`,
        shortDescription: `${tmpl.title} in ${city}, ${state.name}.`,
        longDescription: `Get ${tmpl.title} delivered in ${city}, ${state.name} within 10-20 minutes!`,
        brand: tmpl.brand,
        brandId: tmpl.brand.toLowerCase().replace(/\s+/g, '_'),

        categoryId: qbCategory.id,
        categoryName: qbCategory.name,
        subcategoryId: tmpl.sub,
        subcategoryName: tmpl.sub,

        stateId: state.id,
        stateName: state.name,
        city: city,
        locality: `${city} Express Hub`,

        price: price,
        priceNumber: price,
        mrp: mrp,
        originalPriceNumber: mrp,
        discountPercentage: discountPct,
        discountPct: `${discountPct}%`,

        rating: parseFloat((4.5 + (sIdx % 4) * 0.1).toFixed(1)),
        ratingString: String(parseFloat((4.5 + (sIdx % 4) * 0.1).toFixed(1))),
        reviewCount: 300 + ((sIdx * 17) % 400),

        stock: 40,
        availability: 'In Stock',
        stockStatus: 'In Stock',

        images: [tmpl.img],
        thumbnail: tmpl.img,

        isTrending: true,
        isBestSeller: true,
        isBestseller: true,
        isNewArrival: tIdx === 0,
        isQuickDelivery: true,
        deliveryTime: '10–15 mins',
        deliveryMinutes: 10,
        updatedAt: now,
        createdAt: now,
      });
    }
  }

  return products;
}

function generateMassiveGroceryProducts(startCounter) {
  const products = [];
  let idCounter = startCounter;
  const now = new Date().toISOString();

  const stateRegionalFoodMap = {
    BR: [
      { sub: 'regional_food', title: 'Organic Roasted Chana Sattu', brand: 'Bihar Organics', price: 249, mrp: 349, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600' },
      { sub: 'regional_food', title: 'Darbhanga Grade-A Crispy Roasted Makhana', brand: 'Bihar Organics', price: 499, mrp: 699, img: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600' },
    ],
    PB: [
      { sub: 'regional_food', title: 'Amritsari Spicy Urad Dal Papad', brand: 'Punjab Delights', price: 199, mrp: 289, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600' },
      { sub: 'regional_food', title: 'Pure Amritsari Desi Ghee Pinni (500g)', brand: 'Punjab Delights', price: 349, mrp: 499, img: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600' },
    ],
    KL: [
      { sub: 'regional_food', title: 'Malabar Thin Coconut Oil Banana Chips', brand: 'Kerala Fresh', price: 279, mrp: 399, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600' },
      { sub: 'regional_food', title: 'Wayanad Pure Organic Black Pepper', brand: 'Kerala Fresh', price: 320, mrp: 450, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600' },
    ],
    WB: [
      { sub: 'regional_food', title: 'Darjeeling First Flush Orthodox Black Tea', brand: 'Bengal Organics', price: 599, mrp: 899, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600' },
      { sub: 'regional_food', title: 'Traditional Kolkata Sponge Rasgulla (1kg)', brand: 'Bengal Organics', price: 280, mrp: 350, img: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600' },
    ],
    JK: [
      { sub: 'regional_food', title: 'Pampore Grade-A1 Pure Kashmiri Saffron Mongra', brand: 'Kashmir Organics', price: 899, mrp: 1299, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600' },
      { sub: 'regional_food', title: 'Kashmiri Traditional Shahi Kahwa Green Tea Mix', brand: 'Kashmir Organics', price: 399, mrp: 599, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600' },
    ],
    RJ: [
      { sub: 'regional_food', title: 'Rajasthani Crispy Methi Khakhra Pack', brand: 'Rajasthan Crafts', price: 149, mrp: 220, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600' },
      { sub: 'regional_food', title: 'Bikaneri Authentic Spicy Sev Bhujia', brand: 'Rajasthan Crafts', price: 140, mrp: 180, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600' },
    ],
    MH: [
      { sub: 'regional_food', title: 'Maharashtrian Thin Poha Flattened Rice', brand: 'Fortune', price: 99, mrp: 149, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600' },
      { sub: 'regional_food', title: 'Ratnagiri Grade-A Alphonso Mango Pulp', brand: 'Farm Fresh', price: 399, mrp: 550, img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600' },
    ],
    TN: [
      { sub: 'regional_food', title: 'Classic Kumbakonam Degree Filter Coffee Powder', brand: 'Blue Tokai', price: 349, mrp: 499, img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600' },
    ],
    KA: [
      { sub: 'regional_food', title: 'Chikmagalur Dark Roast Filter Coffee Powder', brand: 'Blue Tokai', price: 349, mrp: 499, img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600' },
    ],
    GJ: [
      { sub: 'regional_food', title: 'Crispy Gujarati Fafda & Nylon Khaman Snack Mix', brand: 'Gujarat Snacks', price: 159, mrp: 210, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600' },
    ],
    DEFAULT: [
      { sub: 'regional_food', title: 'Royal Organic Garam Masala Blend', brand: 'Everest', price: 120, mrp: 160, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600' },
    ]
  };

  const universalGroceries = [
    { sub: 'fruits_vegetables', title: 'Farm Fresh Organic Red Apples', brand: 'Farm Fresh', price: 180, mrp: 240, img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600' },
    { sub: 'fruits_vegetables', title: 'Organic Robusta Bananas', brand: 'Farm Fresh', price: 60, mrp: 90, img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600' },
    { sub: 'fruits_vegetables', title: 'Fresh Green Broccoli Crown', brand: 'Farm Fresh', price: 99, mrp: 149, img: 'https://images.unsplash.com/photo-1459411621453-7b03166349b6?w=600' },
    { sub: 'fruits_vegetables', title: 'Juicy Seedless Red Pomegranates', brand: 'Farm Fresh', price: 199, mrp: 299, img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600' },
    { sub: 'fruits_vegetables', title: 'Fresh Hydroponic Baby Spinach', brand: 'Farm Fresh', price: 49, mrp: 79, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600' },
    { sub: 'dairy_bakery', title: 'Pure Cow Milk Toned Pack', brand: 'Amul', price: 32, mrp: 35, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600' },
    { sub: 'dairy_bakery', title: 'Fresh Malai Paneer Block', brand: 'Amul', price: 110, mrp: 130, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600' },
    { sub: 'dairy_bakery', title: 'Pasteurized Salted Butter', brand: 'Amul', price: 275, mrp: 290, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600' },
    { sub: 'dairy_bakery', title: '100% Whole Wheat Brown Bread', brand: 'Britannia', price: 50, mrp: 60, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600' },
    { sub: 'beverages', title: 'Pure Tender Coconut Water Pack', brand: 'Raw Pressery', price: 75, mrp: 99, img: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600' },
    { sub: 'beverages', title: 'Organic Japanese Matcha Green Tea', brand: 'Organic Tattva', price: 499, mrp: 799, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600' },
    { sub: 'staples_pulses', title: 'Royal Long Grain Aged Basmati Rice', brand: 'India Gate', price: 699, mrp: 999, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600' },
    { sub: 'staples_pulses', title: 'Chakki Fresh Shudh Whole Wheat Atta', brand: 'Aashirvaad', price: 249, mrp: 320, img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600' },
    { sub: 'staples_pulses', title: 'Unpolished Organic Toor Arhar Dal', brand: 'Tata Sampann', price: 169, mrp: 220, img: 'https://images.unsplash.com/photo-1585992236310-6edddc08acff?w=600' },
    { sub: 'spices_oils', title: 'Kachi Ghani Cold Pressed Mustard Oil', brand: 'Fortune', price: 189, mrp: 240, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600' },
    { sub: 'spices_oils', title: 'Pure Desi Cow Ghee Glass Jar', brand: 'Patanjali', price: 650, mrp: 750, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600' },
    { sub: 'snacks_munchies', title: 'Classic Salted Crunchy Potato Chips', brand: "Lay's", price: 30, mrp: 35, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600' },
    { sub: 'dry_fruits', title: 'California Whole Roasted Salted Almonds', brand: 'Happilo', price: 499, mrp: 699, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600' },
    { sub: 'dry_fruits', title: 'King Size Jumbo Cashews W240', brand: 'Nutraj', price: 599, mrp: 850, img: 'https://images.unsplash.com/photo-1509358271058-acd05cc93898?w=600' }
  ];

  const weights = ['100g', '200g', '250g', '400g', '500g', '750g', '1kg', '2kg', '5kg', 'Pack of 2', 'Pack of 3', 'Family Pack', 'Combo Saver'];
  const grades = ['Premium Grade A', '100% Organic', 'Farm Fresh', 'Artisanal Reserve', 'Export Quality', 'Handpicked Select', 'Value Pack', 'Traditional Recipe', 'Natural Sun-Dried', 'Gold Edition'];

  for (let i = 0; i < 377; i++) {
    idCounter++;
    const state = INDIAN_STATES_AND_UTS[i % INDIAN_STATES_AND_UTS.length];
    const city = state.popularCities[i % state.popularCities.length];

    // Every 5th item is an authentic regional food specialty of THIS state!
    let base;
    if (i % 5 === 0) {
      const regList = stateRegionalFoodMap[state.id] || stateRegionalFoodMap.DEFAULT;
      base = regList[i % regList.length];
    } else {
      base = universalGroceries[i % universalGroceries.length];
    }

    const weight = weights[i % weights.length];
    const grade = grades[(i * 3) % grades.length];
    const brand = base.brand;
    
    const multiplier = 1 + (i % 7) * 0.15;
    const basePrice = Math.round(base.price * multiplier);
    const mrp = Math.round(basePrice * 1.3);
    const discountPct = Math.round(((mrp - basePrice) / mrp) * 100);

    const title = `${grade} ${base.title} ${weight} (${brand})`;
    const productId = `prod_grocery_massive_${idCounter}`;

    products.push({
      id: productId,
      productId: productId,
      title: title,
      name: title,
      shortTitle: title,
      description: `Authentic ${title}. Guaranteed 100% fresh, natural, and premium quality delivered straight to ${city}, ${state.name}.`,
      shortDescription: title,
      longDescription: `Get your ${title} delivered in ${city}, ${state.name} with 10-20 min express quickbuy delivery. Superfast doorstep fulfillment.`,
      brand: brand,
      brandId: brand.toLowerCase().replace(/[^a-z0-9]/g, '_'),

      categoryId: 'grocery',
      categoryName: 'Grocery & Snacks',
      subcategoryId: base.sub,
      subcategoryName: base.sub,

      stateId: state.id,
      stateName: state.name,
      city: city,
      locality: `${city} Central`,

      price: basePrice,
      priceNumber: basePrice,
      mrp: mrp,
      originalPriceNumber: mrp,
      discountPercentage: discountPct,
      discountPct: `${discountPct}%`,

      rating: parseFloat((4.1 + (i % 9) * 0.1).toFixed(1)),
      ratingString: String(parseFloat((4.1 + (i % 9) * 0.1).toFixed(1))),
      reviewCount: 50 + ((i * 19) % 800),

      stock: 100 + (i % 50),
      availability: 'In Stock',
      stockStatus: 'In Stock',

      images: [base.img],
      thumbnail: base.img,

      isTrending: i % 10 === 0,
      isBestSeller: i % 5 === 0,
      isBestseller: i % 5 === 0,
      isNewArrival: i % 8 === 0,
      isQuickDelivery: true,
      deliveryTime: '10–20 mins',
      deliveryMinutes: 15,
      updatedAt: now,
      createdAt: now,
    });
  }

  return { products, lastCounter: idCounter };
}

function generateFitnessProducts(startCounter) {
  const products = [];
  let idCounter = startCounter;
  const now = new Date().toISOString();

  const baseItems = [
    { sub: 'supplements', title: 'Optimum Nutrition Gold Standard 100% Whey Protein 2kg', brand: 'ON', price: 6499, img: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600' },
    { sub: 'supplements', title: 'MuscleBlaze Biozyme Performance Whey Protein 1kg', brand: 'MuscleBlaze', price: 2999, img: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600' },
    { sub: 'dumbbells', title: 'Cosco Rubberized Steel Hex Dumbbells 10kg Pair', brand: 'Cosco', price: 1899, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' },
    { sub: 'yoga', title: 'Decathlon Non-Slip TPE Yoga Mat 6mm with Strap', brand: 'Decathlon', price: 699, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600' },
    { sub: 'resistance_bands', title: 'Heavy-Duty Resistance Loop Bands Set of 5', brand: 'Decathlon', price: 499, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' },
    { sub: 'accessories', title: 'Padded Leather Weightlifting Gym Gloves', brand: 'Puma', price: 399, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' },
    { sub: 'core', title: 'Dual-Wheel Ab Roller Wheel with Knee Pad', brand: 'Cosco', price: 449, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' },
    { sub: 'cardio', title: 'Speed Skipping Rope with Ball Bearings', brand: 'Decathlon', price: 299, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' },
    { sub: 'dumbbells', title: 'Neoprene Dip Dumbbells 5kg Pair', brand: 'Cosco', price: 999, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' },
    { sub: 'accessories', title: 'Adjustable Weightlifting Leather Belt', brand: 'Nivia', price: 799, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' },
    { sub: 'recovery', title: 'High-Density Foam Roller for Muscle Recovery', brand: 'Decathlon', price: 599, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600' },
    { sub: 'supplements', title: 'Pre-Workout Energy Powder 30 Servings', brand: 'MuscleBlaze', price: 1299, img: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600' },
  ];

  const weights = ['Standard Size', 'Pro Edition', 'Pack of 2', 'Heavy Duty', 'Ultra Grip', 'Compact Travel', 'Max Performance'];
  const brands = ['Decathlon', 'Cosco', 'Optimum Nutrition', 'MuscleBlaze', 'Puma', 'Adidas', 'Nike', 'Nivia'];

  for (let i = 0; i < 37; i++) {
    idCounter++;
    const state = INDIAN_STATES_AND_UTS[i % INDIAN_STATES_AND_UTS.length];
    const city = state.popularCities[i % state.popularCities.length];
    const base = baseItems[i % baseItems.length];
    const weight = weights[i % weights.length];
    const brand = brands[(i * 3) % brands.length];
    
    const price = base.price + ((i * 35) % 300);
    const mrp = Math.round(price * 1.3);
    const discountPct = Math.round(((mrp - price) / mrp) * 100);

    const title = `${base.title} ${weight} (${brand})`;
    const productId = `prod_fitness_card_${idCounter}`;

    products.push({
      id: productId,
      productId: productId,
      title: title,
      name: title,
      shortTitle: title,
      description: `Authentic ${title}. High-grade fitness and gym equipment with brand warranty delivered in ${city}, ${state.name}.`,
      shortDescription: title,
      longDescription: `Get your ${title} delivered in ${city}, ${state.name} with 10-20 min express delivery.`,
      brand: brand,
      brandId: brand.toLowerCase().replace(/[^a-z0-9]/g, '_'),

      categoryId: 'fitness',
      categoryName: 'Fitness & Gym',
      subcategoryId: base.sub,
      subcategoryName: base.sub,

      stateId: state.id,
      stateName: state.name,
      city: city,
      locality: `${city} Central`,

      price: price,
      priceNumber: price,
      mrp: mrp,
      originalPriceNumber: mrp,
      discountPercentage: discountPct,
      discountPct: `${discountPct}%`,

      rating: parseFloat((4.3 + (i % 7) * 0.1).toFixed(1)),
      ratingString: String(parseFloat((4.3 + (i % 7) * 0.1).toFixed(1))),
      reviewCount: 40 + ((i * 11) % 300),

      stock: 40,
      availability: 'In Stock',
      stockStatus: 'In Stock',

      images: [base.img],
      thumbnail: base.img,

      isTrending: i % 5 === 0,
      isBestSeller: i % 3 === 0,
      isBestseller: i % 3 === 0,
      isNewArrival: i % 4 === 0,
      isQuickDelivery: true,
      deliveryTime: '10–20 mins',
      deliveryMinutes: 15,
      updatedAt: now,
      createdAt: now,
    });
  }

  return { products, lastCounter: idCounter };
}

function generateGamingProducts(startCounter) {
  const products = [];
  let idCounter = startCounter;
  const now = new Date().toISOString();

  const baseItems = [
    { sub: 'controllers', title: 'PS5 DualSense Wireless Controller', brand: 'Sony', price: 5490, img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600' },
    { sub: 'controllers', title: 'Xbox Wireless Controller Carbon Black', brand: 'Microsoft', price: 5190, img: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600' },
    { sub: 'mice', title: 'Logitech G304 Lightspeed Wireless Gaming Mouse', brand: 'Logitech', price: 2495, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600' },
    { sub: 'headsets', title: 'Razer Kraken Over-Ear RGB Gaming Headset', brand: 'Razer', price: 3999, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600' },
    { sub: 'keyboards', title: 'Redragon Mechanical RGB Gaming Keyboard', brand: 'Redragon', price: 2799, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
    { sub: 'consoles', title: 'Nintendo Switch OLED Model Gaming Console', brand: 'Nintendo', price: 31999, img: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600' },
    { sub: 'streaming', title: 'Elgato Stream Deck MK.2 Studio Controller', brand: 'Elgato', price: 12999, img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600' },
    { sub: 'monitors', title: 'Samsung Odyssey 27-Inch Curved 165Hz Gaming Monitor', brand: 'Samsung', price: 18999, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600' },
    { sub: 'chairs', title: 'Ergonomic Racing Gaming Chair with Lumbar Support', brand: 'Green Soul', price: 11999, img: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600' },
  ];

  const colors = ['Cosmic Red', 'Midnight Black', 'White', 'Electric Volt', 'Cyberpunk Purple', 'RGB Chroma'];

  for (let i = 0; i < 38; i++) {
    idCounter++;
    const state = INDIAN_STATES_AND_UTS[i % INDIAN_STATES_AND_UTS.length];
    const city = state.popularCities[i % state.popularCities.length];
    const base = baseItems[i % baseItems.length];
    const color = colors[i % colors.length];

    const price = base.price + ((i * 45) % 500);
    const mrp = Math.round(price * 1.25);
    const discountPct = Math.round(((mrp - price) / mrp) * 100);

    const title = `${base.title} (${color} Edition)`;
    const productId = `prod_gaming_card_${idCounter}`;

    products.push({
      id: productId,
      productId: productId,
      title: title,
      name: title,
      shortTitle: title,
      description: `Authentic ${title}. Official gaming gear with brand warranty delivered in ${city}, ${state.name}.`,
      shortDescription: title,
      longDescription: `Get your ${title} delivered in ${city}, ${state.name} in 10-20 mins.`,
      brand: base.brand,
      brandId: base.brand.toLowerCase().replace(/[^a-z0-9]/g, '_'),

      categoryId: 'gaming',
      categoryName: 'Gaming Zone',
      subcategoryId: base.sub,
      subcategoryName: base.sub,

      stateId: state.id,
      stateName: state.name,
      city: city,
      locality: `${city} Central`,

      price: price,
      priceNumber: price,
      mrp: mrp,
      originalPriceNumber: mrp,
      discountPercentage: discountPct,
      discountPct: `${discountPct}%`,

      rating: parseFloat((4.5 + (i % 5) * 0.1).toFixed(1)),
      ratingString: String(parseFloat((4.5 + (i % 5) * 0.1).toFixed(1))),
      reviewCount: 80 + ((i * 15) % 500),

      stock: 25,
      availability: 'In Stock',
      stockStatus: 'In Stock',

      images: [base.img],
      thumbnail: base.img,

      isTrending: i % 4 === 0,
      isBestSeller: i % 3 === 0,
      isBestseller: i % 3 === 0,
      isNewArrival: i % 5 === 0,
      isQuickDelivery: true,
      deliveryTime: '10–20 mins',
      deliveryMinutes: 15,
      updatedAt: now,
      createdAt: now,
    });
  }

  return { products, lastCounter: idCounter };
}

function generateFashionCatalogProducts(startCounter) {
  const products = [];
  let idCounter = startCounter;
  const now = new Date().toISOString();

  const mensBase = [
    { sub: 'mens_fashion', title: 'Italian Tailored Slim-Fit Navy Blazer Suit', brand: 'Raymond', price: 4999, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600' },
    { sub: 'mens_fashion', title: 'Vintage Biker Faux Leather Jacket Black', brand: 'SNITCH', price: 2999, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600' },
    { sub: 'oversized_tees', title: 'Heavyweight 240GSM Tokyo Graphic Tee', brand: 'Bewakoof', price: 699, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
    { sub: 'baggy_jeans', title: 'Retro Washed Oversized Baggy Denim Jeans', brand: 'SNITCH', price: 1499, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600' },
    { sub: 'cargo_pants', title: 'Y2K Streetwear Wide Leg Cargo Pants', brand: 'SNITCH', price: 1699, img: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600' },
    { sub: 'hoodies', title: 'Vintage Fleece Pullover Oversized Hoodie', brand: 'SNITCH', price: 1299, img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600' },
    { sub: 'mens_fashion', title: 'Classic Checked Casual Cotton Flannel Shirt', brand: "Levi's", price: 1899, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600' },
    { sub: 'mens_fashion', title: 'Slim-Fit Chino Trousers Khaki', brand: 'Dockers', price: 1999, img: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600' },
  ];

  const womensBase = [
    { sub: 'womens_fashion', title: 'Floral Print Tiered Summer Midi Dress', brand: 'ZARA', price: 1899, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e9271?w=600' },
    { sub: 'womens_fashion', title: 'High-Waisted Wide Leg Straight Denim Jeans', brand: 'H&M', price: 2299, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600' },
    { sub: 'womens_fashion', title: 'Oversized Ribbed Knit Cropped Sweater', brand: 'ZARA', price: 1699, img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600' },
    { sub: 'womens_fashion', title: 'Chic Pastel Linen Summer Crop Top', brand: 'MANGO', price: 999, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e9271?w=600' },
    { sub: 'womens_fashion', title: 'Pleated A-Line Satin Party Skirt', brand: 'Forever 21', price: 1499, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e9271?w=600' },
    { sub: 'womens_fashion', title: 'Athleisure High-Rise Soft Leggings', brand: 'Puma', price: 1299, img: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600' },
  ];

  const stateEthnicMap = {
    UP: [
      { sub: 'ethnic_wear', title: 'Royal Banarasi Katan Silk Saree with Real Zari Border', brand: 'Banaras Heritage', price: 4499, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Lucknowi Hand-Embroidered Chikankari Kurti Top', brand: 'Lucknowi Weaves', price: 1799, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
      { sub: 'ethnic_wear', title: 'Varanasi Royal Brocade Groom Sherwani Set', brand: 'Manyavar', price: 8999, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
    ],
    PB: [
      { sub: 'ethnic_wear', title: 'Traditional Amritsari Phulkari Embroidered Dupatta & Suit', brand: 'Punjab Handlooms', price: 2499, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Authentic Patiala Salwar Suit & Kurti Set', brand: 'Patiala Royal Weaves', price: 2199, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e9271?w=600' },
      { sub: 'ethnic_wear', title: 'Handcrafted Traditional Punjabi Leather Jutti', brand: 'Amritsar Crafts', price: 1299, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600' },
      { sub: 'ethnic_wear', title: 'Classic Punjabi Kurta Pajama with Embroidered Jacket', brand: 'Manyavar', price: 3499, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
    ],
    BR: [
      { sub: 'ethnic_wear', title: 'Authentic Bhagalpuri Tussar Silk Saree', brand: 'Bhagalpur Silks', price: 3299, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Handpainted Madhubani Mithila Art Stole & Dupatta', brand: 'Mithila Crafts', price: 1499, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Bihari Khadi Cotton Kurta Pajama Set', brand: 'Bihar Handloom', price: 1899, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
    ],
    RJ: [
      { sub: 'ethnic_wear', title: 'Royal Jaipuri Bandhani & Leheriya Silk Saree', brand: 'Rajasthan Crafts', price: 3499, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Jaipuri Hand-Block Print Anarkali Kurti Set', brand: 'Biba', price: 2599, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e9271?w=600' },
      { sub: 'ethnic_wear', title: 'Handcrafted Embroidered Jodhpuri Royal Mojari', brand: 'Jodhpur Artisans', price: 1499, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600' },
    ],
    TN: [
      { sub: 'ethnic_wear', title: 'Traditional Kancheepuram Pure Gold Zari Silk Saree', brand: 'Nalli Silks', price: 5999, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Pure South Silk Veshti Mundu & Angavastram Set', brand: 'Ramraj Cotton', price: 1999, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
    ],
    MH: [
      { sub: 'ethnic_wear', title: 'Royal Yeola Paithani Pure Silk Saree with Peacock Pallu', brand: 'Yeola Weaves', price: 4999, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Traditional Maharashtrian Nauvari Kashta Saree', brand: 'Pune Silks', price: 2999, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
    ],
    WB: [
      { sub: 'ethnic_wear', title: 'Authentic Handloom Tant Cotton Saree', brand: 'Bengal Weavers', price: 1499, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Baluchari Silk Saree with Mythological Motifs', brand: 'Bishnupur Silks', price: 4299, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
    ],
    JK: [
      { sub: 'ethnic_wear', title: '100% Pure Kashmiri Pashmina Cashmere Woolen Shawl', brand: 'Kashmir Handloom', price: 4999, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Hand-Embroidered Kashmiri Aari Work Kurti Pheran', brand: 'Kashmir Heritage', price: 2799, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
    ],
    GJ: [
      { sub: 'ethnic_wear', title: 'Authentic Patan Patola Double Ikat Silk Saree', brand: 'Gujarat Handlooms', price: 5499, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Festive Chaniya Choli Set with Mirror Work', brand: 'Ahmedabad Crafts', price: 3199, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e9271?w=600' },
    ],
    AS: [
      { sub: 'ethnic_wear', title: 'Traditional Golden Muga Silk Mekhela Chador Set', brand: 'Assam Handlooms', price: 4799, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Handwoven Eri Silk Stole & Shawl', brand: 'Assam Weaves', price: 1699, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
    ],
    MP: [
      { sub: 'ethnic_wear', title: 'Heavy Designer Chanderi Silk Saree & Anarkali', brand: 'Chanderi Weaves', price: 2999, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Maheshwari Handloom Cotton Silk Saree', brand: 'Maheshwar Crafts', price: 2499, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
    ],
    KA: [
      { sub: 'ethnic_wear', title: 'Traditional Mysore Pure Silk Saree with Gold Zari', brand: 'Mysore Silks', price: 4899, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Ilkal Handloom Cotton Saree with Kasuti Work', brand: 'Karnataka Handlooms', price: 1899, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
    ],
    KL: [
      { sub: 'ethnic_wear', title: 'Traditional Kasavu Kerala Cotton Saree with Gold Border', brand: 'Kerala Handlooms', price: 1799, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
      { sub: 'ethnic_wear', title: 'Kerala Handloom Mundu Dhoti Set', brand: 'Ramraj Cotton', price: 1299, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
    ],
    HR: [
      { sub: 'ethnic_wear', title: 'Panipat Handloom Heavy Winter Woolen Khes & Blanket', brand: 'Panipat Handlooms', price: 1599, img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600' },
      { sub: 'ethnic_wear', title: 'Traditional Cotton Kurta Pajama with Embroidered Vest', brand: 'Manyavar', price: 2399, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
    ],
    DEFAULT: [
      { sub: 'ethnic_wear', title: 'Handcrafted Cotton Silk Kurta Pajama Set for Men', brand: 'Manyavar', price: 2299, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
      { sub: 'ethnic_wear', title: 'Designer Georgette Anarkali Suit Set', brand: 'Biba', price: 2799, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e9271?w=600' },
      { sub: 'ethnic_wear', title: 'Classic Embroidered Kurti Top', brand: 'FabIndia', price: 1599, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
    ]
  };

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Classic Navy', 'Charcoal Black', 'Pastel Olive', 'Royal Crimson', 'Beige Gold', 'Vintage Indigo'];

  function pushItems(baseList, targetCount, catSub, explicitCategoryId, explicitCategoryName, isEthnic = false) {
    for (let i = 0; i < targetCount; i++) {
      idCounter++;
      const state = INDIAN_STATES_AND_UTS[i % INDIAN_STATES_AND_UTS.length];
      const city = state.popularCities[i % state.popularCities.length];
      
      let base;
      if (isEthnic) {
        const stateList = stateEthnicMap[state.id] || stateEthnicMap.DEFAULT;
        base = stateList[i % stateList.length];
      } else {
        base = baseList[i % baseList.length];
      }

      const size = sizes[i % sizes.length];
      const color = colors[(i * 3) % colors.length];

      const price = base.price + ((i * 25) % 400);
      const mrp = Math.round(price * 1.35);
      const discountPct = Math.round(((mrp - price) / mrp) * 100);

      const title = `${base.title} - ${color} (${size})`;
      const productId = `prod_fashion_${catSub}_${idCounter}`;

      products.push({
        id: productId,
        productId: productId,
        title: title,
        name: title,
        shortTitle: base.title,
        description: `Authentic ${title}. Premium quality fashion apparel with official brand tag delivered to ${city}, ${state.name}.`,
        shortDescription: title,
        longDescription: `Get your ${title} delivered in ${city}, ${state.name} with 10-20 min express quickbuy delivery.`,
        brand: base.brand,
        brandId: base.brand.toLowerCase().replace(/[^a-z0-9]/g, '_'),

        categoryId: explicitCategoryId,
        categoryName: explicitCategoryName,
        subcategoryId: base.sub,
        subcategoryName: base.sub,

        stateId: state.id,
        stateName: state.name,
        city: city,
        locality: `${city} Central`,

        price: price,
        priceNumber: price,
        mrp: mrp,
        originalPriceNumber: mrp,
        discountPercentage: discountPct,
        discountPct: `${discountPct}%`,

        rating: parseFloat((4.2 + (i % 7) * 0.1).toFixed(1)),
        ratingString: String(parseFloat((4.2 + (i % 7) * 0.1).toFixed(1))),
        reviewCount: 60 + ((i * 17) % 500),

        stock: 50,
        availability: 'In Stock',
        stockStatus: 'In Stock',

        images: [base.img],
        thumbnail: base.img,

        isTrending: i % 5 === 0,
        isBestSeller: i % 3 === 0,
        isBestseller: i % 3 === 0,
        isNewArrival: i % 4 === 0,
        isQuickDelivery: true,
        deliveryTime: '10–20 mins',
        deliveryMinutes: 15,
        updatedAt: now,
        createdAt: now,
      });
    }
  }

  pushItems(mensBase, 350, 'mens', 'men', "Men's Fashion", false);
  pushItems(womensBase, 400, 'womens', 'women', "Women's Fashion", false);
  pushItems([], 250, 'ethnic', 'ethnic_wear', "Ethnic Wear", true);

  return { products, lastCounter: idCounter };
}

function generateBeautyProducts(startCounter) {
  const products = [];
  let idCounter = startCounter;
  const now = new Date().toISOString();

  const baseItems = [
    { sub: 'skincare', title: 'Minimalist 10% Niacinamide Face Serum 30ml', brand: 'Minimalist', price: 599, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600' },
    { sub: 'skincare', title: 'Minimalist 2% Salicylic Acid Serum for Acne 30ml', brand: 'Minimalist', price: 549, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600' },
    { sub: 'skincare', title: "L'Oréal Paris Revitalift Hyaluronic Acid Serum 30ml", brand: "L'Oreal", price: 799, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600' },
    { sub: 'makeup', title: 'Maybelline New York Fit Me Matte Poreless Liquid Foundation', brand: 'Maybelline', price: 499, img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600' },
    { sub: 'makeup', title: 'Lakmé Absolute Skin Natural Mousse Foundation 25g', brand: 'Lakme', price: 675, img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600' },
    { sub: 'skincare', title: 'Cetaphil Gentle Skin Cleanser Face Wash 250ml', brand: 'Cetaphil', price: 533, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600' },
    { sub: 'skincare', title: 'Plum Green Tea Alcohol-Free Face Toner 200ml', brand: 'Plum', price: 390, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600' },
    { sub: 'haircare', title: 'Biotique Bio Kelp Protein Shampoo 340ml', brand: 'Biotique', price: 299, img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600' },
  ];

  const variants = ['Shade 115', 'Shade 128', 'Hydrating Formula', 'Matte Finish', 'Glow Booster', 'Travel Size 15ml', 'Value Pack 50ml'];
  const brands = ['Minimalist', 'Maybelline', 'Lakme', "L'Oreal", 'Cetaphil', 'Plum', 'Biotique', 'Mamaearth', 'The Ordinary'];

  for (let i = 0; i < 376; i++) {
    idCounter++;
    const state = INDIAN_STATES_AND_UTS[i % INDIAN_STATES_AND_UTS.length];
    const city = state.popularCities[i % state.popularCities.length];
    const base = baseItems[i % baseItems.length];
    const variant = variants[i % variants.length];
    const brand = brands[(i * 3) % brands.length];

    const price = base.price + ((i * 15) % 250);
    const mrp = Math.round(price * 1.3);
    const discountPct = Math.round(((mrp - price) / mrp) * 100);

    const title = `${base.title} - ${variant} (${brand})`;
    const productId = `prod_beauty_${idCounter}`;

    products.push({
      id: productId,
      productId: productId,
      title: title,
      name: title,
      shortTitle: base.title,
      description: `Authentic ${title}. Dermatologically tested 100% original beauty product delivered to ${city}, ${state.name}.`,
      shortDescription: title,
      longDescription: `Get your ${title} delivered in ${city}, ${state.name} with 10-20 min express quickbuy delivery.`,
      brand: brand,
      brandId: brand.toLowerCase().replace(/[^a-z0-9]/g, '_'),

      categoryId: 'beauty',
      categoryName: 'Beauty & Cosmetics',
      subcategoryId: base.sub,
      subcategoryName: base.sub,

      stateId: state.id,
      stateName: state.name,
      city: city,
      locality: `${city} Central`,

      price: price,
      priceNumber: price,
      mrp: mrp,
      originalPriceNumber: mrp,
      discountPercentage: discountPct,
      discountPct: `${discountPct}%`,

      rating: parseFloat((4.3 + (i % 6) * 0.1).toFixed(1)),
      ratingString: String(parseFloat((4.3 + (i % 6) * 0.1).toFixed(1))),
      reviewCount: 50 + ((i * 19) % 600),

      stock: 45,
      availability: 'In Stock',
      stockStatus: 'In Stock',

      images: [base.img],
      thumbnail: base.img,

      isTrending: i % 5 === 0,
      isBestSeller: i % 3 === 0,
      isBestseller: i % 3 === 0,
      isNewArrival: i % 4 === 0,
      isQuickDelivery: true,
      deliveryTime: '10–20 mins',
      deliveryMinutes: 15,
      updatedAt: now,
      createdAt: now,
    });
  }

  return { products, lastCounter: idCounter };
}

function generateHomeLivingProducts(startCounter) {
  const products = [];
  let idCounter = startCounter;
  const now = new Date().toISOString();

  const baseItems = [
    { sub: 'lighting', title: 'IKEA Minimalist Ergonomic Desk Lamp Black', brand: 'IKEA', price: 1299, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600' },
    { sub: 'bedding', title: 'Solimo 100% Cotton 144 TC Double Bedsheet with 2 Pillow Covers', brand: 'Solimo', price: 899, img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600' },
    { sub: 'lighting', title: 'Wipro Smart LED Batten Light 20W RGB Wi-Fi App Control', brand: 'Wipro', price: 999, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600' },
    { sub: 'curtains', title: 'Story@Home Velvet Blackout Window Curtains Set of 2', brand: 'Story@Home', price: 1499, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600' },
    { sub: 'decor', title: 'Urban Ladder Soft Velvet Cushion Covers Pack of 5', brand: 'Urban Ladder', price: 699, img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600' },
    { sub: 'furniture', title: 'Pepperfry Solid Sheesham Wood Coffee Table Natural Finish', brand: 'Pepperfry', price: 4999, img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600' },
    { sub: 'decor', title: 'Home Centre Ceramic Handcrafted Flower Vase Amber', brand: 'Home Centre', price: 799, img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600' },
    { sub: 'bedding', title: 'Wakefit Orthopedic Memory Foam Sleeping Pillow', brand: 'Wakefit', price: 1199, img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600' },
  ];

  const variants = ['Warm White', 'Cool Daylight', 'King Size', 'Queen Size', 'Mustard Yellow', 'Forest Green', 'Teal Blue'];
  const brands = ['IKEA', 'Solimo', 'Wipro', 'Philips', 'Story@Home', 'Urban Ladder', 'Pepperfry', 'Home Centre', 'Wakefit'];

  for (let i = 0; i < 240; i++) {
    idCounter++;
    const state = INDIAN_STATES_AND_UTS[i % INDIAN_STATES_AND_UTS.length];
    const city = state.popularCities[i % state.popularCities.length];
    const base = baseItems[i % baseItems.length];
    const variant = variants[i % variants.length];
    const brand = brands[(i * 3) % brands.length];

    const price = base.price + ((i * 35) % 400);
    const mrp = Math.round(price * 1.35);
    const discountPct = Math.round(((mrp - price) / mrp) * 100);

    const title = `${base.title} - ${variant} (${brand})`;
    const productId = `prod_home_living_${idCounter}`;

    products.push({
      id: productId,
      productId: productId,
      title: title,
      name: title,
      shortTitle: base.title,
      description: `Authentic ${title}. Premium home aesthetic with manufacturer warranty delivered in ${city}, ${state.name}.`,
      shortDescription: title,
      longDescription: `Get your ${title} delivered in ${city}, ${state.name} with 10-20 min express quickbuy delivery.`,
      brand: brand,
      brandId: brand.toLowerCase().replace(/[^a-z0-9]/g, '_'),

      categoryId: 'home_living',
      categoryName: 'Home & Living',
      subcategoryId: base.sub,
      subcategoryName: base.sub,

      stateId: state.id,
      stateName: state.name,
      city: city,
      locality: `${city} Central`,

      price: price,
      priceNumber: price,
      mrp: mrp,
      originalPriceNumber: mrp,
      discountPercentage: discountPct,
      discountPct: `${discountPct}%`,

      rating: parseFloat((4.4 + (i % 5) * 0.1).toFixed(1)),
      ratingString: String(parseFloat((4.4 + (i % 5) * 0.1).toFixed(1))),
      reviewCount: 40 + ((i * 13) % 450),

      stock: 35,
      availability: 'In Stock',
      stockStatus: 'In Stock',

      images: [base.img],
      thumbnail: base.img,

      isTrending: i % 5 === 0,
      isBestSeller: i % 3 === 0,
      isBestseller: i % 3 === 0,
      isNewArrival: i % 4 === 0,
      isQuickDelivery: true,
      deliveryTime: '10–20 mins',
      deliveryMinutes: 15,
      updatedAt: now,
      createdAt: now,
    });
  }

  return { products, lastCounter: idCounter };
}

function generateFullCatalog() {
  const { products: coreProducts, lastCounter: cCounter } = generateCoreProducts();
  const { products: groceryProducts, lastCounter: gCounter } = generateMassiveGroceryProducts(cCounter);
  const { products: fitnessProducts, lastCounter: fCounter } = generateFitnessProducts(gCounter);
  const { products: gamingProducts, lastCounter: gmCounter } = generateGamingProducts(fCounter);
  const { products: fashionProducts, lastCounter: fsCounter } = generateFashionCatalogProducts(gmCounter);
  const { products: beautyProducts, lastCounter: btCounter } = generateBeautyProducts(fsCounter);
  const { products: homeLivingProducts, lastCounter: hlCounter } = generateHomeLivingProducts(btCounter);
  const qbProducts = generateQuickBuyProducts(hlCounter);

  console.log(`📦 Generated ${coreProducts.length} unique Core Products across categories.`);
  console.log(`🌾 Generated ${groceryProducts.length} Grocery & Snacks Products!`);
  console.log(`🏋️ Generated ${fitnessProducts.length} Fitness & Gym Products!`);
  console.log(`🎮 Generated ${gamingProducts.length} Gaming Zone Products!`);
  console.log(`👗 Generated ${fashionProducts.length} Fashion & Ethnic Wear Products! (350 Men's + 400 Women's + 250 Ethnic)`);
  console.log(`💄 Generated ${beautyProducts.length} Beauty & Cosmetics Products!`);
  console.log(`🏡 Generated ${homeLivingProducts.length} Home & Living Products!`);
  console.log(`⚡ Generated ${qbProducts.length} QuickBuy Products across 31 states.`);
  return [...coreProducts, ...groceryProducts, ...fitnessProducts, ...gamingProducts, ...fashionProducts, ...beautyProducts, ...homeLivingProducts, ...qbProducts];
}

async function runFullProductionCatalogSeed() {
  console.log('\n🚀 Starting FULL EasyBuy Catalog Seeder (Authentic Regional Specialties)...');
  console.log('------------------------------------------------------------');

  const products = generateFullCatalog();

  const totalDocuments =
    INDIAN_STATES_AND_UTS.length +
    PRODUCT_CATEGORIES.length +
    BRAND_CATALOG.length +
    products.length;

  console.log(`📊 Seeding Total Documents: ${totalDocuments}`);
  console.log(`   • States & UTs: ${INDIAN_STATES_AND_UTS.length}`);
  console.log(`   • Main Categories: ${PRODUCT_CATEGORIES.length}`);
  console.log(`   • Top Brands: ${BRAND_CATALOG.length}`);
  console.log(`   • State-Wise Products: ${products.length}\n`);

  let batch = writeBatch(db);
  let batchCount = 0;
  let totalWritten = 0;

  async function commitBatchIfNeeded(force = false) {
    if (batchCount >= 400 || (force && batchCount > 0)) {
      await batch.commit();
      totalWritten += batchCount;
      console.log(`⚡ Committed batch chunk: ${totalWritten} / ${totalDocuments} documents written...`);
      batch = writeBatch(db);
      batchCount = 0;
      await new Promise((res) => setTimeout(res, 350));
    }
  }

  // 1. Seed States
  console.log(`📍 Writing ${INDIAN_STATES_AND_UTS.length} States...`);
  for (const st of INDIAN_STATES_AND_UTS) {
    batch.set(doc(db, 'states', st.id), st, { merge: true });
    batchCount++;
    await commitBatchIfNeeded();
  }

  // 2. Seed Categories
  console.log(`🛍️ Writing ${PRODUCT_CATEGORIES.length} Categories...`);
  for (const cat of PRODUCT_CATEGORIES) {
    batch.set(doc(db, 'categories', cat.id), cat, { merge: true });
    batchCount++;
    await commitBatchIfNeeded();
  }

  // 3. Seed Brands
  console.log(`🏷️ Writing ${BRAND_CATALOG.length} Top Brands...`);
  for (const br of BRAND_CATALOG) {
    batch.set(doc(db, 'brands', br.id), br, { merge: true });
    batchCount++;
    await commitBatchIfNeeded();
  }

  // 4. Seed Products
  console.log(`📦 Writing ${products.length} State-Wise Products across all categories...`);
  for (const p of products) {
    batch.set(doc(db, 'products', p.id), p, { merge: true });
    batchCount++;
    await commitBatchIfNeeded();
  }

  await commitBatchIfNeeded(true);

  console.log('------------------------------------------------------------');
  console.log(`🎉 SUCCESS! Wrote ${totalWritten} full state-wise catalog items to Firestore.`);
  console.log('🔒 User authentication & user accounts remain 100% untouched.\n');
  process.exit(0);
}

runFullProductionCatalogSeed().catch((err) => {
  console.error('❌ Seeding Error:', err);
  process.exit(1);
});
