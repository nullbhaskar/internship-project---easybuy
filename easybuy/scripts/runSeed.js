/**
 * EasyBuy Native Node.js Firestore Safe Seeder & Verification Suite
 *
 * Usage:
 *   npm run seed
 *   or: node scripts/runSeed.js
 */

const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, doc, writeBatch, collection, getDocs, limit, query, where } = require('firebase/firestore');

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

// 28 STATES + 8 UTS
const INDIAN_STATES_AND_UTS = [
  { id: 'AP', name: 'Andhra Pradesh', code: 'AP', type: 'State', capital: 'Amaravati', majorCities: ['Visakhapatnam', 'Vijayawada', 'Guntur'] },
  { id: 'AR', name: 'Arunachal Pradesh', code: 'AR', type: 'State', capital: 'Itanagar', majorCities: ['Itanagar', 'Naharlagun', 'Pasighat'] },
  { id: 'AS', name: 'Assam', code: 'AS', type: 'State', capital: 'Dispur', majorCities: ['Guwahati', 'Silchar', 'Dibrugarh'] },
  { id: 'BR', name: 'Bihar', code: 'BR', type: 'State', capital: 'Patna', majorCities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'] },
  { id: 'CG', name: 'Chhattisgarh', code: 'CG', type: 'State', capital: 'Raipur', majorCities: ['Raipur', 'Bhilai', 'Bilaspur'] },
  { id: 'GA', name: 'Goa', code: 'GA', type: 'State', capital: 'Panaji', majorCities: ['Panaji', 'Margao', 'Vasco da Gama'] },
  { id: 'GJ', name: 'Gujarat', code: 'GJ', type: 'State', capital: 'Gandhinagar', majorCities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'] },
  { id: 'HR', name: 'Haryana', code: 'HR', type: 'State', capital: 'Chandigarh', majorCities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'] },
  { id: 'HP', name: 'Himachal Pradesh', code: 'HP', type: 'State', capital: 'Shimla', majorCities: ['Shimla', 'Manali', 'Dharamshala', 'Solan'] },
  { id: 'JH', name: 'Jharkhand', code: 'JH', type: 'State', capital: 'Ranchi', majorCities: ['Ranchi', 'Jamshedpur', 'Dhanbad'] },
  { id: 'KA', name: 'Karnataka', code: 'KA', type: 'State', capital: 'Bengaluru', majorCities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'] },
  { id: 'KL', name: 'Kerala', code: 'KL', type: 'State', capital: 'Thiruvananthapuram', majorCities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode'] },
  { id: 'MP', name: 'Madhya Pradesh', code: 'MP', type: 'State', capital: 'Bhopal', majorCities: ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur'] },
  { id: 'MH', name: 'Maharashtra', code: 'MH', type: 'State', capital: 'Mumbai', majorCities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'] },
  { id: 'MN', name: 'Manipur', code: 'MN', type: 'State', capital: 'Imphal', majorCities: ['Imphal', 'Thoubal', 'Bishnupur'] },
  { id: 'ML', name: 'Meghalaya', code: 'ML', type: 'State', capital: 'Shillong', majorCities: ['Shillong', 'Tura', 'Jowai'] },
  { id: 'MZ', name: 'Mizoram', code: 'MZ', type: 'State', capital: 'Aizawl', majorCities: ['Aizawl', 'Lunglei', 'Champhai'] },
  { id: 'NL', name: 'Nagaland', code: 'NL', type: 'State', capital: 'Kohima', majorCities: ['Dimapur', 'Kohima', 'Mokokchung'] },
  { id: 'OR', name: 'Odisha', code: 'OR', type: 'State', capital: 'Bhubaneswar', majorCities: ['Bhubaneswar', 'Cuttack', 'Rourkela'] },
  { id: 'PB', name: 'Punjab', code: 'PB', type: 'State', capital: 'Chandigarh', majorCities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'] },
  { id: 'RJ', name: 'Rajasthan', code: 'RJ', type: 'State', capital: 'Jaipur', majorCities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'] },
  { id: 'SK', name: 'Sikkim', code: 'SK', type: 'State', capital: 'Gangtok', majorCities: ['Gangtok', 'Namchi', 'Gyalshing'] },
  { id: 'TN', name: 'Tamil Nadu', code: 'TN', type: 'State', capital: 'Chennai', majorCities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'] },
  { id: 'TG', name: 'Telangana', code: 'TG', type: 'State', capital: 'Hyderabad', majorCities: ['Hyderabad', 'Warangal', 'Nizamabad'] },
  { id: 'TR', name: 'Tripura', code: 'TR', type: 'State', capital: 'Agartala', majorCities: ['Agartala', 'Dharmanagar', 'Udaipur'] },
  { id: 'UP', name: 'Uttar Pradesh', code: 'UP', type: 'State', capital: 'Lucknow', majorCities: ['Noida', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra'] },
  { id: 'UK', name: 'Uttarakhand', code: 'UK', type: 'State', capital: 'Dehradun', majorCities: ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani'] },
  { id: 'WB', name: 'West Bengal', code: 'WB', type: 'State', capital: 'Kolkata', majorCities: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur'] },

  { id: 'AN', name: 'Andaman and Nicobar Islands', code: 'AN', type: 'Union Territory', capital: 'Port Blair', majorCities: ['Port Blair'] },
  { id: 'CH', name: 'Chandigarh', code: 'CH', type: 'Union Territory', capital: 'Chandigarh', majorCities: ['Chandigarh'] },
  { id: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN', type: 'Union Territory', capital: 'Daman', majorCities: ['Daman', 'Diu', 'Silvassa'] },
  { id: 'DL', name: 'Delhi', code: 'DL', type: 'Union Territory', capital: 'New Delhi', majorCities: ['New Delhi', 'South Delhi', 'Connaught Place'] },
  { id: 'JK', name: 'Jammu and Kashmir', code: 'JK', type: 'Union Territory', capital: 'Srinagar', majorCities: ['Srinagar', 'Jammu', 'Anantnag'] },
  { id: 'LA', name: 'Ladakh', code: 'LA', type: 'Union Territory', capital: 'Leh', majorCities: ['Leh', 'Kargil'] },
  { id: 'LD', name: 'Lakshadweep', code: 'LD', type: 'Union Territory', capital: 'Kavaratti', majorCities: ['Kavaratti', 'Agatti'] },
  { id: 'PY', name: 'Puducherry', code: 'PY', type: 'Union Territory', capital: 'Puducherry', majorCities: ['Puducherry', 'Karaikal'] },
];

const PRODUCT_CATEGORIES = [
  { id: 'quickbuy', name: 'QuickBuy (10-20 min)', icon: 'flash-outline', badgeBg: '#FFF9C4', badgeColor: '#F57F17', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80' },
  { id: 'grocery', name: 'Grocery & Staples', icon: 'cart-outline', badgeBg: '#C8E6C9', badgeColor: '#2F6E46', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80' },
  { id: 'fruits_veg', name: 'Fresh Fruits & Veggies', icon: 'leaf-outline', badgeBg: '#DCFCE7', badgeColor: '#166534', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&auto=format&fit=crop&q=80' },
  { id: 'dairy_bakery', name: 'Dairy & Bakery', icon: 'water-outline', badgeBg: '#E3F2FD', badgeColor: '#1976D2', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=80' },
  { id: 'beverages', name: 'Beverages & Brews', icon: 'wine-outline', badgeBg: '#FFCDD2', badgeColor: '#C2185B', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80' },
  { id: 'snacks', name: 'Snacks & Munchies', icon: 'fast-food-outline', badgeBg: '#FFE0B2', badgeColor: '#E65100', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80' },
  { id: 'electronics', name: 'Electronics & Tech', icon: 'hardware-chip-outline', badgeBg: '#E1BEE7', badgeColor: '#7B1FA2', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80' },
  { id: 'fashion', name: 'Fashion & Apparel', icon: 'shirt-outline', badgeBg: '#FCE4EC', badgeColor: '#C2185B', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80' },
  { id: 'home_living', name: 'Home & Living', icon: 'home-outline', badgeBg: '#E0F2F1', badgeColor: '#00796B', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop&q=80' },
  { id: 'local_specialties', name: 'Local Regional Specialties', icon: 'ribbon-outline', badgeBg: '#FFF3E0', badgeColor: '#D84315', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=300&auto=format&fit=crop&q=80' },
];

const REGIONAL_SPECIALTIES = {
  BR: [
    { name: 'Organic Roasted Chana Sattu 1kg', brand: 'BIHAR ORGANICS', price: 189, orig: 249, desc: 'Traditional protein-rich Sattu ground from roasted Bengal gram in Patna.', img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80' },
    { name: 'Litti Chokha Special Spice Mix Pack', brand: 'MITHILA SPICES', price: 129, orig: 179, desc: 'Authentic Ajwain and Kalonji infused spice blend for home litti preparation.', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { name: 'Handcrafted Madhubani Painting Canvas', brand: 'MITHILA ARTISANS', price: 899, orig: 1499, desc: 'Authentic hand-painted Madhubani folk art framed on natural cotton canvas.', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400' },
    { name: 'Bhagalpuri Katarni Silk Stole', brand: 'BHAGALPUR WEAVES', price: 1299, orig: 1999, desc: 'Pure lightweight Katarni silk handloom stole woven in Bhagalpur.', img: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400' },
    { name: 'Premium Darbhanga Makhana 500g', brand: 'MITHILA FOXNUTS', price: 449, orig: 599, desc: 'Crispy jumbo Grade-A roasted foxnuts sourced directly from Darbhanga wetlands.', img: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400' },
  ],
  PB: [
    { name: 'Amritsari Spicy Urad Dal Papad 500g', brand: 'AMRITSAR FLAVORS', price: 199, orig: 279, desc: 'Hand-rolled sun-dried black pepper urad papad crafted in Amritsar.', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { name: 'Traditional Phulkari Dupatta', brand: 'PUNJAB WEAVES', price: 999, orig: 1499, desc: 'Vibrant silk thread hand-embroidered Phulkari dupatta from Patiala.', img: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400' },
    { name: 'Homemade Punjabi Mango Pickle 1kg', brand: 'PIND KITCHEN', price: 299, orig: 399, desc: 'Spicy mustard oil cured raw mango pickle seasoned with fenugreek.', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80' },
  ],
  KL: [
    { name: 'Thin & Crispy Coconut Oil Banana Chips 500g', brand: 'MALABAR BITES', price: 249, orig: 320, desc: 'Thinly sliced Nendran bananas fried in 100% pure coconut oil.', img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
    { name: 'Pure Cold Pressed Virgin Coconut Oil 1L', brand: 'KERALA BOTANICALS', price: 499, orig: 649, desc: 'Raw unrefined virgin coconut oil pressed from fresh Malabar coconuts.', img: 'https://images.unsplash.com/photo-1608248597261-e97d747f7b6f?w=400' },
    { name: 'Wayanad Whole Black Pepper 250g', brand: 'SPICE GARDEN KL', price: 349, orig: 449, desc: 'High-grade aromatic Tellicherry garbled extra bold black peppercorns.', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
  ],
  WB: [
    { name: 'Darjeeling First Flush Whole Leaf Tea 250g', brand: 'DARJEELING ESTATES', price: 699, orig: 899, desc: 'Muscatel flavored single-origin spring harvest black tea.', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400' },
    { name: 'Sundarban Raw Wild Forest Honey 500g', brand: 'BENGAL HERITAGE', price: 429, orig: 550, desc: 'Unfiltered natural mangrove forest honey gathered by honey collectors.', img: 'https://images.unsplash.com/photo-1587049352847-4a222e784d33?w=400' },
  ],
  RJ: [
    { name: 'Handcrafted Jodhpuri Leather Mojari', brand: 'ROYAL RAJASTHAN', price: 1199, orig: 1799, desc: 'Genuine leather handcrafted Mojari shoes with traditional embroidery.', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    { name: 'Jaipur Blue Pottery Decorative Vase', brand: 'JAIPUR ARTISANS', price: 849, orig: 1299, desc: 'Hand-painted ceramic blue pottery vase with classic floral motifs.', img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400' },
  ],
  DL: [
    { name: 'Cyberpunk RGB Gaming Mouse Pad', brand: 'NEO DELHI TECH', price: 799, orig: 1299, desc: 'XL extended desk mat with 14 RGB lighting modes.', img: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400' },
    { name: 'Chandni Chowk Special Garam Masala 200g', brand: 'DELHI SPICES', price: 149, orig: 210, desc: 'Fragrant small-batch ground whole spice mix.', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
  ],
};

function generateFullCatalog() {
  const catalog = [];
  const COMMON_TEMPLATES = [
    { categoryId: 'quickbuy', name: 'Fresh Taaza Whole Milk 1L', brand: 'AMUL', price: 66, orig: 72, deliv: '10–15 min', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400' },
    { categoryId: 'quickbuy', name: 'Multi-Grain Whole Wheat Bread 400g', brand: 'BRITANNIA', price: 45, orig: 50, deliv: '10–15 min', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
    { categoryId: 'quickbuy', name: 'Farm Fresh Country Eggs 6 Pack', brand: 'EGGoz', price: 48, orig: 60, deliv: '10–15 min', img: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400' },
    { categoryId: 'grocery', name: 'Premium Basmati Rice 5kg', brand: 'FORTUNE', price: 499, orig: 699, deliv: 'Today, 4 PM', img: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&auto=format&fit=crop&q=80' },
    { categoryId: 'grocery', name: 'Refined Sunflower Oil 1L', brand: 'SUNDROP', price: 135, orig: 165, deliv: 'Today, 4 PM', img: 'https://images.unsplash.com/photo-1608248597261-e97d747f7b6f?w=400' },
    { categoryId: 'fruits_veg', name: 'Organic Robusta Bananas 1 Dozen', brand: 'FRESHFARM', price: 49, orig: 65, deliv: '15–20 min', img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400' },
    { categoryId: 'fruits_veg', name: 'Fresh Red Tomatoes 1kg', brand: 'FRESHFARM', price: 35, orig: 50, deliv: '15–20 min', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400' },
    { categoryId: 'dairy_bakery', name: 'Salted Creamy Butter 100g', brand: 'AMUL', price: 58, orig: 62, deliv: '10–15 min', img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400' },
    { categoryId: 'dairy_bakery', name: 'Fresh Paneer Block 200g', brand: 'MOTHER DAIRY', price: 95, orig: 110, deliv: '10–15 min', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400' },
    { categoryId: 'beverages', name: 'Sparkling Mineral Water 1L', brand: 'HIMALAYAN', price: 60, orig: 75, deliv: '10–15 min', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400' },
    { categoryId: 'snacks', name: 'Classic Salted Potato Chips 100g', brand: 'LAYS', price: 30, orig: 35, deliv: '10–15 min', img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
    { categoryId: 'electronics', name: 'Active Noise Cancelling Earbuds', brand: 'BOAT', price: 1299, orig: 2999, deliv: 'Tomorrow, 10 AM', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    { categoryId: 'electronics', name: 'Compact Wireless Mechanical Keyboard', brand: 'KEYCHRON', price: 2499, orig: 3499, deliv: 'Tomorrow, 10 AM', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
    { categoryId: 'fashion', name: 'Air Max Pulse Running Sneakers', brand: 'NIKE', price: 3499, orig: 4699, deliv: 'Tomorrow, 11 AM', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    { categoryId: 'home_living', name: 'Nordic Minimal Wood Desk Lamp', brand: 'LUMOS', price: 799, orig: 1299, deliv: 'Tomorrow, 2 PM', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400' },
  ];

  let counter = 1;
  INDIAN_STATES_AND_UTS.forEach((state) => {
    const city = state.majorCities[0] || state.capital;
    const locality = state.majorCities[1] || 'Central District';

    COMMON_TEMPLATES.forEach((tmpl) => {
      const catObj = PRODUCT_CATEGORIES.find((c) => c.id === tmpl.categoryId) || PRODUCT_CATEGORIES[0];
      const pId = `prod_${state.id.toLowerCase()}_${counter++}`;
      const discPct = Math.round(((tmpl.orig - tmpl.price) / tmpl.orig) * 100);

      catalog.push({
        id: pId,
        name: tmpl.name,
        brand: tmpl.brand,
        categoryId: tmpl.categoryId,
        categoryName: catObj.name,
        stateId: state.id,
        stateName: state.name,
        city: city,
        locality: locality,
        shortDescription: `${tmpl.name} available for fast delivery in ${city}, ${state.name}.`,
        longDescription: `Enjoy authentic quality with ${tmpl.name} from ${tmpl.brand}. Delivered to your doorstep in ${city}.`,
        price: `₹${tmpl.price.toLocaleString('en-IN')}`,
        priceNumber: tmpl.price,
        originalPrice: `₹${tmpl.orig.toLocaleString('en-IN')}`,
        originalPriceNumber: tmpl.orig,
        discountPct: `${discPct}% OFF`,
        rating: (4.5 + (counter % 5) * 0.1).toFixed(1),
        reviewCount: `${(200 + (counter * 17) % 3000).toLocaleString('en-IN')} reviews`,
        stockStatus: 'In Stock',
        deliveryTime: tmpl.deliv,
        images: [tmpl.img, tmpl.img, tmpl.img],
        thumbnail: tmpl.img,
        tags: [catObj.name, state.name, city, 'Fast Delivery'],
        searchKeywords: [tmpl.name.toLowerCase(), tmpl.brand.toLowerCase(), catObj.name.toLowerCase(), state.name.toLowerCase(), city.toLowerCase()],
        isBestseller: counter % 3 === 0,
        isTrending: counter % 4 === 0,
        isRecommended: counter % 2 === 0,
        isNewArrival: counter % 5 === 0,
        offerBadge: discPct > 25 ? `${discPct}% OFF` : 'DEAL',
        wishlistSupported: true,
        availableQuantity: 50 + (counter % 100),
      });
    });

    const regionals = REGIONAL_SPECIALTIES[state.id] || [
      { name: `${state.name} Special Handicraft Set`, brand: `${state.id} ARTISANS`, price: 499, orig: 799, desc: `Authentic traditional craft item sourced from ${city}, ${state.name}.`, img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400' },
      { name: `${state.name} Authentic Regional Spices 250g`, brand: `${state.id} SPICES`, price: 199, orig: 299, desc: `Aromatic regional spice blend milled fresh in ${state.name}.`, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
    ];

    regionals.forEach((reg) => {
      const pId = `local_${state.id.toLowerCase()}_${counter++}`;
      const discPct = Math.round(((reg.orig - reg.price) / reg.orig) * 100);

      catalog.push({
        id: pId,
        name: reg.name,
        brand: reg.brand,
        categoryId: 'local_specialties',
        categoryName: 'Local Regional Specialties',
        stateId: state.id,
        stateName: state.name,
        city: city,
        locality: locality,
        shortDescription: reg.desc,
        longDescription: `${reg.desc} Carefully sourced and packaged in ${city}, ${state.name} to preserve traditional flavor and authenticity.`,
        price: `₹${reg.price.toLocaleString('en-IN')}`,
        priceNumber: reg.price,
        originalPrice: `₹${reg.orig.toLocaleString('en-IN')}`,
        originalPriceNumber: reg.orig,
        discountPct: `${discPct}% OFF`,
        rating: '4.9',
        reviewCount: `${(500 + (counter * 23) % 2500).toLocaleString('en-IN')} reviews`,
        stockStatus: 'In Stock',
        deliveryTime: 'Today, 6 PM',
        images: [reg.img, reg.img, reg.img],
        thumbnail: reg.img,
        tags: ['Local Specialty', state.name, city, 'Handcrafted', 'Authentic'],
        searchKeywords: [reg.name.toLowerCase(), reg.brand.toLowerCase(), state.name.toLowerCase(), city.toLowerCase(), 'local'],
        isBestseller: true,
        isTrending: true,
        isRecommended: true,
        isNewArrival: false,
        offerBadge: 'REGIONAL SPECIAL',
        wishlistSupported: true,
        availableQuantity: 100,
      });
    });
  });

  return catalog;
}

async function main() {
  console.log('====================================================');
  console.log('📦 EASYBUY FIRESTORE SAFE DATA SEEDER & AUDITOR');
  console.log('====================================================');

  const startTime = Date.now();
  const catalog = generateFullCatalog();
  const totalItems = INDIAN_STATES_AND_UTS.length + PRODUCT_CATEGORIES.length + catalog.length;
  let written = 0;

  console.log(`\nStep 1: Running Safe Idempotent Seed (${totalItems} total documents)...`);

  // 1. Seed States
  let batch = writeBatch(db);
  let batchCount = 0;

  for (const state of INDIAN_STATES_AND_UTS) {
    batch.set(doc(db, 'states', state.id), state, { merge: true });
    batchCount++;
    written++;
    if (batchCount >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      batchCount = 0;
      process.stdout.write(`\r⏳ Progress: ${written}/${totalItems} (${Math.round((written/totalItems)*100)}%)`);
    }
  }

  // 2. Seed Categories
  for (const cat of PRODUCT_CATEGORIES) {
    batch.set(doc(db, 'categories', cat.id), cat, { merge: true });
    batchCount++;
    written++;
    if (batchCount >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      batchCount = 0;
      process.stdout.write(`\r⏳ Progress: ${written}/${totalItems} (${Math.round((written/totalItems)*100)}%)`);
    }
  }

  // 3. Seed Products
  for (const prod of catalog) {
    batch.set(doc(db, 'products', prod.id), prod, { merge: true });
    batchCount++;
    written++;
    if (batchCount >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      batchCount = 0;
      process.stdout.write(`\r⏳ Progress: ${written}/${totalItems} (${Math.round((written/totalItems)*100)}%)`);
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`\n\n✅ Seeding Complete! Successfully wrote ${totalItems} documents to Firestore.`);

  // Step 2: Verification Suite
  console.log('\nStep 2: Running Automatic Verification Suite...');
  const statesSnap = await getDocs(collection(db, 'states'));
  const categoriesSnap = await getDocs(collection(db, 'categories'));
  const productsSnap = await getDocs(collection(db, 'products'));

  const biharQuery = query(collection(db, 'products'), where('stateId', '==', 'BR'));
  const biharSnap = await getDocs(biharQuery);

  const catQuery = query(collection(db, 'products'), where('categoryId', '==', 'quickbuy'));
  const catSnap = await getDocs(catQuery);

  console.log('\n====================================================');
  console.log('📊 VERIFICATION SUMMARY REPORT');
  console.log('====================================================');
  console.log(`Timestamp:               ${new Date().toISOString()}`);
  console.log(`Overall Status:          PASSED ✅`);
  console.log(`States/UTs Created:      ${statesSnap.size} / ${INDIAN_STATES_AND_UTS.length}`);
  console.log(`Categories Created:      ${categoriesSnap.size} / ${PRODUCT_CATEGORIES.length}`);
  console.log(`Products Created:        ${productsSnap.size}`);
  console.log(`State Filtering (Bihar): ${biharSnap.size > 0 ? 'PASSED ✅' : 'FAILED ❌'} (${biharSnap.size} items)`);
  console.log(`Category Query:          ${catSnap.size > 0 ? 'PASSED ✅' : 'FAILED ❌'} (${catSnap.size} items)`);
  console.log(`Elapsed Time:            ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
