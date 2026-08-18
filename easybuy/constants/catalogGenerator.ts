// ─── EASYBUY FULL PRODUCTION-GRADE CATALOG GENERATOR (4000-5000 PRODUCTS) ───

export interface StateItem {
  id: string;
  stateId: string;
  name: string;
  stateName: string;
  code: string;
  type: 'State' | 'Union Territory';
  capital: string;
  popularCities: string[];
  majorCities: string[];
  featuredCategories: string[];
  seasonalCollection: string;
  heroBanner: string;
  deliveryEstimate: string;
}

export interface CategoryItem {
  id: string;
  categoryId: string;
  name: string;
  icon: string;
  banner: string;
  gradient: [string, string];
  displayOrder: number;
  trendingScore: number;
  badgeBg: string;
  badgeColor: string;
  image: string;
}

export interface SubcategoryItem {
  id: string;
  subcategoryId: string;
  categoryId: string;
  name: string;
  icon: string;
  displayOrder: number;
}

export interface BrandItem {
  id: string;
  brandId: string;
  name: string;
  logo: string;
  categories: string[];
  rating: number;
}

export interface ProductItem {
  productId: string;
  id: string;
  title: string;
  name: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  longDescription: string;
  brand: string;
  brandId: string;

  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;

  stateId: string;
  stateName: string;
  city: string;
  locality: string;

  price: any;
  priceNumber: number;
  originalPrice?: any;
  mrp: number;
  originalPriceNumber: number;
  discountPercentage: number;
  discountPct: string;

  rating: number;
  ratingString?: string;
  reviewCount: number;

  stock: number;
  availability: 'In Stock' | 'Low Stock' | 'Pre-Order';
  stockStatus: 'In Stock' | 'Low Stock';

  images: string[];
  thumbnail: string;
  image?: string;
  videoUrl?: string;

  isTrending: boolean;
  isBestSeller: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isLimitedOffer: boolean;
  isFeatured: boolean;
  isQuickDelivery: boolean;
  isRecommended: boolean;
  offerBadge: string;
  wishlistSupported: boolean;
  availableQuantity: number;

  deliveryMinutes: number;
  deliveryTime: string;

  trendingScore: number;
  popularityScore: number;
  salesCount: number;
  wishlistCount: number;
  views: number;

  searchKeywords: string[];
  tags: string[];

  season: 'All-Season' | 'Summer' | 'Monsoon' | 'Winter' | 'Festive';
  gender: 'Unisex' | 'Men' | 'Women' | 'Kids';
  ageGroup: 'Gen-Z' | 'All Ages' | 'Teens' | 'Adults';
  bestFor: string[];
  features: string[];
  specifications: Record<string, string>;

  colors?: { id: string; name: string; image?: string; hex?: string }[];
  sizes?: { id: string; name: string }[];
  variants?: { id: string; name: string; price: number }[];

  bundleProducts?: string[];
  similarProducts?: string[];
  recommendedProducts?: string[];

  warranty: string;
  returnPolicy: string;
  seller: string;
  sellerRating: number;
  deliveryPartner: string;
  cashOnDelivery: boolean;
  emiAvailable: boolean;
  arAvailable: boolean;
  videoAvailable: boolean;
}

// ─── 1. ALL 36 INDIAN STATES & UNION TERRITORIES ───
export const INDIAN_STATES_AND_UTS: StateItem[] = [
  { id: 'AP', stateId: 'AP', name: 'Andhra Pradesh', stateName: 'Andhra Pradesh', code: 'AP', type: 'State', capital: 'Amaravati', popularCities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'], majorCities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'], featuredCategories: ['electronics', 'grocery', 'fashion'], seasonalCollection: 'Coastal Harvest & Tech', heroBanner: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', deliveryEstimate: '10–25 mins' },
  { id: 'AR', stateId: 'AR', name: 'Arunachal Pradesh', stateName: 'Arunachal Pradesh', code: 'AR', type: 'State', capital: 'Itanagar', popularCities: ['Itanagar', 'Naharlagun', 'Pasighat'], majorCities: ['Itanagar', 'Naharlagun', 'Pasighat'], featuredCategories: ['lifestyle', 'fashion', 'grocery'], seasonalCollection: 'Himalayan Organic Tea & Crafts', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'AS', stateId: 'AS', name: 'Assam', stateName: 'Assam', code: 'AS', type: 'State', capital: 'Dispur', popularCities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'], majorCities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'], featuredCategories: ['grocery', 'lifestyle', 'fashion'], seasonalCollection: 'Assam Orthodox Tea & Silk', heroBanner: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'BR', stateId: 'BR', name: 'Bihar', stateName: 'Bihar', code: 'BR', type: 'State', capital: 'Patna', popularCities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'], majorCities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'], featuredCategories: ['hostel_essentials', 'study_office', 'grocery', 'electronics'], seasonalCollection: 'Monsoon Sattu & Study Kits', heroBanner: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200', deliveryEstimate: '10–18 mins' },
  { id: 'CG', stateId: 'CG', name: 'Chhattisgarh', stateName: 'Chhattisgarh', code: 'CG', type: 'State', capital: 'Raipur', popularCities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'], majorCities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'], featuredCategories: ['grocery', 'home_living', 'fitness'], seasonalCollection: 'Tribal Crafts & Herbal Care', heroBanner: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200', deliveryEstimate: '12–25 mins' },
  { id: 'GA', stateId: 'GA', name: 'Goa', stateName: 'Goa', code: 'GA', type: 'State', capital: 'Panaji', popularCities: ['Panaji', 'Margao', 'Vasco da Gama', 'Calangute'], majorCities: ['Panaji', 'Margao', 'Vasco da Gama', 'Calangute'], featuredCategories: ['lifestyle', 'fashion', 'accessories', 'beverages'], seasonalCollection: 'Beachwear & Sunset Blends', heroBanner: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200', deliveryEstimate: '10–15 mins' },
  { id: 'GJ', stateId: 'GJ', name: 'Gujarat', stateName: 'Gujarat', code: 'GJ', type: 'State', capital: 'Gandhinagar', popularCities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'], majorCities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'], featuredCategories: ['fashion', 'grocery', 'electronics', 'kitchen'], seasonalCollection: 'Festive Bandhani & Snacks', heroBanner: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'HR', stateId: 'HR', name: 'Haryana', stateName: 'Haryana', code: 'HR', type: 'State', capital: 'Chandigarh', popularCities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Kaithal'], majorCities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Kaithal'], featuredCategories: ['electronics', 'fitness', 'fashion', 'gaming'], seasonalCollection: 'Cyber Hub Tech & Activewear', heroBanner: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200', deliveryEstimate: '10–15 mins' },
  { id: 'HP', stateId: 'HP', name: 'Himachal Pradesh', stateName: 'Himachal Pradesh', code: 'HP', type: 'State', capital: 'Shimla', popularCities: ['Shimla', 'Manali', 'Dharamshala', 'Solan'], majorCities: ['Shimla', 'Manali', 'Dharamshala', 'Solan'], featuredCategories: ['fashion', 'lifestyle', 'grocery'], seasonalCollection: 'Winter Woolens & Mountain Honey', heroBanner: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'JH', stateId: 'JH', name: 'Jharkhand', stateName: 'Jharkhand', code: 'JH', type: 'State', capital: 'Ranchi', popularCities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'], majorCities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'], featuredCategories: ['study_office', 'electronics', 'hostel_essentials'], seasonalCollection: 'Steel City Tech & Student Needs', heroBanner: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200', deliveryEstimate: '12–22 mins' },
  { id: 'KA', stateId: 'KA', name: 'Karnataka', stateName: 'Karnataka', code: 'KA', type: 'State', capital: 'Bengaluru', popularCities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'], majorCities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'], featuredCategories: ['electronics', 'gaming', 'beauty', 'fashion'], seasonalCollection: 'Silicon Valley Gadgets & Filter Coffee', heroBanner: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1200', deliveryEstimate: '8–15 mins' },
  { id: 'KL', stateId: 'KL', name: 'Kerala', stateName: 'Kerala', code: 'KL', type: 'State', capital: 'Thiruvananthapuram', popularCities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'], majorCities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'], featuredCategories: ['grocery', 'beauty', 'health_care', 'lifestyle'], seasonalCollection: 'Spices, Coconut Oil & Ayurveda', heroBanner: 'https://images.unsplash.com/photo-1608248597261-e97d747f7b6f?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'MP', stateId: 'MP', name: 'Madhya Pradesh', stateName: 'Madhya Pradesh', code: 'MP', type: 'State', capital: 'Bhopal', popularCities: ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain'], majorCities: ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain'], featuredCategories: ['grocery', 'fashion', 'home_living'], seasonalCollection: 'Indori Namkeen & Chanderi Weaves', heroBanner: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'MH', stateId: 'MH', name: 'Maharashtra', stateName: 'Maharashtra', code: 'MH', type: 'State', capital: 'Mumbai', popularCities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'], majorCities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'], featuredCategories: ['fashion', 'beauty', 'electronics', 'gaming', 'lifestyle'], seasonalCollection: 'Streetwear, K-Beauty & Fast Tech', heroBanner: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200', deliveryEstimate: '8–15 mins' },
  { id: 'MN', stateId: 'MN', name: 'Manipur', stateName: 'Manipur', code: 'MN', type: 'State', capital: 'Imphal', popularCities: ['Imphal', 'Thoubal', 'Bishnupur'], majorCities: ['Imphal', 'Thoubal', 'Bishnupur'], featuredCategories: ['fashion', 'sports', 'grocery'], seasonalCollection: 'Handloom Textiles & Organic Tea', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'ML', stateId: 'ML', name: 'Meghalaya', stateName: 'Meghalaya', code: 'ML', type: 'State', capital: 'Shillong', popularCities: ['Shillong', 'Tura', 'Jowai'], majorCities: ['Shillong', 'Tura', 'Jowai'], featuredCategories: ['lifestyle', 'fashion', 'grocery'], seasonalCollection: 'Monsoon Rainwear & Organic Spices', heroBanner: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'MZ', stateId: 'MZ', name: 'Mizoram', stateName: 'Mizoram', code: 'MZ', type: 'State', capital: 'Aizawl', popularCities: ['Aizawl', 'Lunglei', 'Champhai'], majorCities: ['Aizawl', 'Lunglei', 'Champhai'], featuredCategories: ['fashion', 'lifestyle', 'electronics'], seasonalCollection: 'Bamboo Handicrafts & Music Tech', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'NL', stateId: 'NL', name: 'Nagaland', stateName: 'Nagaland', code: 'NL', type: 'State', capital: 'Kohima', popularCities: ['Dimapur', 'Kohima', 'Mokokchung'], majorCities: ['Dimapur', 'Kohima', 'Mokokchung'], featuredCategories: ['fashion', 'lifestyle', 'grocery'], seasonalCollection: 'Naga Handlooms & Chili Spices', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'OR', stateId: 'OR', name: 'Odisha', stateName: 'Odisha', code: 'OR', type: 'State', capital: 'Bhubaneswar', popularCities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'], majorCities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'], featuredCategories: ['grocery', 'home_living', 'fashion'], seasonalCollection: 'Sambalpuri Silk & Temple Sweets', heroBanner: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200', deliveryEstimate: '12–25 mins' },
  { id: 'PB', stateId: 'PB', name: 'Punjab', stateName: 'Punjab', code: 'PB', type: 'State', capital: 'Chandigarh', popularCities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'], majorCities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'], featuredCategories: ['fitness', 'sports', 'grocery', 'fashion'], seasonalCollection: 'Gym Nutrition, Dairy & Phulkari', heroBanner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'RJ', stateId: 'RJ', name: 'Rajasthan', stateName: 'Rajasthan', code: 'RJ', type: 'State', capital: 'Jaipur', popularCities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'], majorCities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'], featuredCategories: ['lifestyle', 'fashion', 'home_living', 'grocery'], seasonalCollection: 'Handicrafts, Mojaris & Royal Pickles', heroBanner: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=1200', deliveryEstimate: '10–20 mins' },
  { id: 'SK', stateId: 'SK', name: 'Sikkim', stateName: 'Sikkim', code: 'SK', type: 'State', capital: 'Gangtok', popularCities: ['Gangtok', 'Namchi', 'Gyalshing'], majorCities: ['Gangtok', 'Namchi', 'Gyalshing'], featuredCategories: ['beauty', 'lifestyle', 'grocery'], seasonalCollection: 'Organic Tea & Himalayan Skincare', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'TN', stateId: 'TN', name: 'Tamil Nadu', stateName: 'Tamil Nadu', code: 'TN', type: 'State', capital: 'Chennai', popularCities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'], majorCities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'], featuredCategories: ['electronics', 'grocery', 'study_office', 'fashion'], seasonalCollection: 'Filter Coffee & Kanjeevaram Weaves', heroBanner: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200', deliveryEstimate: '10–18 mins' },
  { id: 'TG', stateId: 'TG', name: 'Telangana', stateName: 'Telangana', code: 'TG', type: 'State', capital: 'Hyderabad', popularCities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'], majorCities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'], featuredCategories: ['electronics', 'gaming', 'fashion', 'grocery'], seasonalCollection: 'Cyberabad Tech & Biryani Spices', heroBanner: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=1200', deliveryEstimate: '10–15 mins' },
  { id: 'TR', stateId: 'TR', name: 'Tripura', stateName: 'Tripura', code: 'TR', type: 'State', capital: 'Agartala', popularCities: ['Agartala', 'Dharmanagar', 'Udaipur'], majorCities: ['Agartala', 'Dharmanagar', 'Udaipur'], featuredCategories: ['lifestyle', 'grocery', 'fashion'], seasonalCollection: 'Bamboo Crafts & Pineapple Concentrates', heroBanner: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'UP', stateId: 'UP', name: 'Uttar Pradesh', stateName: 'Uttar Pradesh', code: 'UP', type: 'State', capital: 'Lucknow', popularCities: ['Noida', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra'], majorCities: ['Noida', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra'], featuredCategories: ['fashion', 'study_office', 'hostel_essentials', 'grocery'], seasonalCollection: 'Chikan Weaves & Campus Essentials', heroBanner: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200', deliveryEstimate: '10–18 mins' },
  { id: 'UK', stateId: 'UK', name: 'Uttarakhand', stateName: 'Uttarakhand', code: 'UK', type: 'State', capital: 'Dehradun', popularCities: ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani'], majorCities: ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani'], featuredCategories: ['fitness', 'lifestyle', 'grocery'], seasonalCollection: 'Organic Pulses & Adventure Wear', heroBanner: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200', deliveryEstimate: '12–25 mins' },
  { id: 'WB', stateId: 'WB', name: 'West Bengal', stateName: 'West Bengal', code: 'WB', type: 'State', capital: 'Kolkata', popularCities: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur'], majorCities: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur'], featuredCategories: ['grocery', 'lifestyle', 'beauty', 'fashion'], seasonalCollection: 'Darjeeling Tea & Bengali Sweets', heroBanner: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200', deliveryEstimate: '10–18 mins' },

  // Union Territories
  { id: 'AN', stateId: 'AN', name: 'Andaman and Nicobar', stateName: 'Andaman and Nicobar', code: 'AN', type: 'Union Territory', capital: 'Port Blair', popularCities: ['Port Blair', 'Havelock'], majorCities: ['Port Blair', 'Havelock'], featuredCategories: ['lifestyle', 'fashion', 'accessories'], seasonalCollection: 'Island Wear & Ocean Care', heroBanner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200', deliveryEstimate: '20–40 mins' },
  { id: 'CH', stateId: 'CH', name: 'Chandigarh', stateName: 'Chandigarh', code: 'CH', type: 'Union Territory', capital: 'Chandigarh', popularCities: ['Chandigarh'], majorCities: ['Chandigarh'], featuredCategories: ['fashion', 'fitness', 'gaming', 'electronics'], seasonalCollection: 'City Beautiful Tech & Streetwear', heroBanner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200', deliveryEstimate: '10–15 mins' },
  { id: 'DN', stateId: 'DN', name: 'Dadra & Nagar Haveli', stateName: 'Dadra & Nagar Haveli', code: 'DN', type: 'Union Territory', capital: 'Daman', popularCities: ['Daman', 'Diu', 'Silvassa'], majorCities: ['Daman', 'Diu', 'Silvassa'], featuredCategories: ['lifestyle', 'grocery', 'accessories'], seasonalCollection: 'Coastal Essentials', heroBanner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200', deliveryEstimate: '15–25 mins' },
  { id: 'DL', stateId: 'DL', name: 'Delhi', stateName: 'Delhi', code: 'DL', type: 'Union Territory', capital: 'New Delhi', popularCities: ['New Delhi', 'South Delhi', 'Connaught Place', 'Dwarka'], majorCities: ['New Delhi', 'South Delhi', 'Connaught Place', 'Dwarka'], featuredCategories: ['fashion', 'electronics', 'beauty', 'gaming', 'lifestyle'], seasonalCollection: 'Gen-Z Streetwear & Flagship Tech', heroBanner: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200', deliveryEstimate: '8–12 mins' },
  { id: 'JK', stateId: 'JK', name: 'Jammu and Kashmir', stateName: 'Jammu and Kashmir', code: 'JK', type: 'Union Territory', capital: 'Srinagar', popularCities: ['Srinagar', 'Jammu', 'Anantnag'], majorCities: ['Srinagar', 'Jammu', 'Anantnag'], featuredCategories: ['fashion', 'grocery', 'lifestyle'], seasonalCollection: 'Pashmina Shawls & Kashmiri Saffron', heroBanner: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=1200', deliveryEstimate: '15–30 mins' },
  { id: 'LA', stateId: 'LA', name: 'Ladakh', stateName: 'Ladakh', code: 'LA', type: 'Union Territory', capital: 'Leh', popularCities: ['Leh', 'Kargil'], majorCities: ['Leh', 'Kargil'], featuredCategories: ['lifestyle', 'fashion', 'fitness'], seasonalCollection: 'High-Altitude Gear & Sea Buckthorn', heroBanner: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200', deliveryEstimate: '20–45 mins' },
  { id: 'LD', stateId: 'LD', name: 'Lakshadweep', stateName: 'Lakshadweep', code: 'LD', type: 'Union Territory', capital: 'Kavaratti', popularCities: ['Kavaratti', 'Agatti'], majorCities: ['Kavaratti', 'Agatti'], featuredCategories: ['lifestyle', 'grocery', 'accessories'], seasonalCollection: 'Coral Reef Organics', heroBanner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200', deliveryEstimate: '25–50 mins' },
  { id: 'PY', stateId: 'PY', name: 'Puducherry', stateName: 'Puducherry', code: 'PY', type: 'Union Territory', capital: 'Puducherry', popularCities: ['Puducherry', 'Karaikal'], majorCities: ['Puducherry', 'Karaikal'], featuredCategories: ['lifestyle', 'beauty', 'fashion'], seasonalCollection: 'French Riviera Cafe Vibe & Organics', heroBanner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200', deliveryEstimate: '12–20 mins' },
];

// ─── 2. MAIN 20 CATEGORIES ───
export const PRODUCT_CATEGORIES: CategoryItem[] = [
  { id: 'quickbuy', categoryId: 'quickbuy', name: 'QuickBuy (10-20 min)', icon: 'flash-outline', banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', badgeBg: '#FFF9C4', badgeColor: '#F57F17', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', gradient: ['#F59E0B', '#EF4444'], displayOrder: 1, trendingScore: 99 },
  { id: 'electronics', categoryId: 'electronics', name: 'Electronics & Tech', icon: 'hardware-chip-outline', banner: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', badgeBg: '#E1BEE7', badgeColor: '#7B1FA2', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', gradient: ['#8B5CF6', '#3B82F6'], displayOrder: 2, trendingScore: 98 },
  { id: 'fashion', categoryId: 'fashion', name: 'Fashion & Apparel', icon: 'shirt-outline', banner: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', badgeBg: '#FCE4EC', badgeColor: '#C2185B', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', gradient: ['#EC4899', '#F43F5E'], displayOrder: 3, trendingScore: 97 },
  { id: 'beauty', categoryId: 'beauty', name: 'Beauty & Cosmetics', icon: 'sparkles-outline', banner: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500', badgeBg: '#F3E5F5', badgeColor: '#8E24AA', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500', gradient: ['#D946EF', '#A855F7'], displayOrder: 4, trendingScore: 96 },
  { id: 'home_living', categoryId: 'home_living', name: 'Home & Living', icon: 'home-outline', banner: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', badgeBg: '#E0F2F1', badgeColor: '#00796B', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', gradient: ['#10B981', '#059669'], displayOrder: 5, trendingScore: 94 },
  { id: 'gaming', categoryId: 'gaming', name: 'Gaming Zone', icon: 'game-controller-outline', banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500', badgeBg: '#EDE7F6', badgeColor: '#512DA8', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500', gradient: ['#6366F1', '#4F46E5'], displayOrder: 6, trendingScore: 95 },
  { id: 'study_office', categoryId: 'study_office', name: 'Study & Office', icon: 'briefcase-outline', banner: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500', badgeBg: '#E8EAF6', badgeColor: '#303F9F', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500', gradient: ['#3B82F6', '#2563EB'], displayOrder: 7, trendingScore: 92 },
  { id: 'fitness', categoryId: 'fitness', name: 'Fitness & Gym', icon: 'barbell-outline', banner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500', badgeBg: '#E0F7FA', badgeColor: '#0097A7', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500', gradient: ['#06B6D4', '#0891B2'], displayOrder: 8, trendingScore: 93 },
  { id: 'hostel_essentials', categoryId: 'hostel_essentials', name: 'Hostel Essentials', icon: 'bed-outline', banner: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500', badgeBg: '#FFF3E0', badgeColor: '#E65100', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500', gradient: ['#F97316', '#EA580C'], displayOrder: 9, trendingScore: 96 },
  { id: 'grocery', categoryId: 'grocery', name: 'Grocery & Snacks', icon: 'cart-outline', banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', badgeBg: '#DCFCE7', badgeColor: '#166534', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', gradient: ['#22C55E', '#16A34A'], displayOrder: 10, trendingScore: 98 },
  { id: 'kitchen', categoryId: 'kitchen', name: 'Kitchen & Appliances', icon: 'restaurant-outline', banner: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500', badgeBg: '#FFE0B2', badgeColor: '#F57C00', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500', gradient: ['#FB923C', '#F97316'], displayOrder: 11, trendingScore: 91 },
  { id: 'lifestyle', categoryId: 'lifestyle', name: 'Lifestyle & Vibe', icon: 'bulb-outline', banner: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500', badgeBg: '#F1F8E9', badgeColor: '#558B2F', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500', gradient: ['#84CC16', '#65A30D'], displayOrder: 12, trendingScore: 95 },
  { id: 'accessories', categoryId: 'accessories', name: 'Accessories & Bags', icon: 'watch-outline', banner: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', badgeBg: '#FFF8E1', badgeColor: '#FFA000', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', gradient: ['#EAB308', '#CA8A04'], displayOrder: 13, trendingScore: 94 },
  { id: 'footwear', categoryId: 'footwear', name: 'Footwear & Kicks', icon: 'footsteps-outline', banner: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', badgeBg: '#EFEBE9', badgeColor: '#5D4037', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', gradient: ['#A16207', '#854D0E'], displayOrder: 14, trendingScore: 96 },
  { id: 'sports', categoryId: 'sports', name: 'Sports & Outdoors', icon: 'football-outline', banner: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500', badgeBg: '#E8F5E9', badgeColor: '#2E7D32', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500', gradient: ['#15803D', '#166534'], displayOrder: 15, trendingScore: 90 },
  { id: 'pet_care', categoryId: 'pet_care', name: 'Pet Care & Food', icon: 'paw-outline', banner: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500', badgeBg: '#F3E5F5', badgeColor: '#7B1FA2', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500', gradient: ['#C084FC', '#A855F7'], displayOrder: 16, trendingScore: 88 },
  { id: 'automobile', categoryId: 'automobile', name: 'Automobile & Bike', icon: 'car-sport-outline', banner: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500', badgeBg: '#ECEFF1', badgeColor: '#455A64', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500', gradient: ['#64748B', '#475569'], displayOrder: 17, trendingScore: 87 },
  { id: 'baby_care', categoryId: 'baby_care', name: 'Baby Care & Toys', icon: 'happy-outline', banner: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500', badgeBg: '#FFF0F5', badgeColor: '#DB7093', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500', gradient: ['#F472B6', '#E11D48'], displayOrder: 18, trendingScore: 89 },
  { id: 'health_care', categoryId: 'health_care', name: 'Health & Wellness', icon: 'medkit-outline', banner: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', badgeBg: '#E0F7FA', badgeColor: '#00838F', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', gradient: ['#14B8A6', '#0D9488'], displayOrder: 19, trendingScore: 92 },
  { id: 'gifts', categoryId: 'gifts', name: 'Gifts & Hampers', icon: 'gift-outline', banner: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500', badgeBg: '#FFF3E0', badgeColor: '#EF6C00', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500', gradient: ['#F59E0B', '#D97706'], displayOrder: 20, trendingScore: 93 },
];

// ─── 3. SUBCATEGORIES MAP ───
export const SUBCATEGORIES_MAP: Record<string, { id: string; name: string; icon: string }[]> = {
  fashion: [
    { id: 'baggy_jeans', name: 'Baggy Jeans', icon: 'body-outline' },
    { id: 'wide_leg_jeans', name: 'Wide Leg Jeans', icon: 'body-outline' },
    { id: 'cargo_pants', name: 'Cargo Pants', icon: 'shirt-outline' },
    { id: 'oversized_tees', name: 'Oversized T-Shirts', icon: 'shirt-outline' },
    { id: 'streetwear', name: 'Streetwear', icon: 'sparkles-outline' },
    { id: 'hoodies', name: 'Hoodies & Sweats', icon: 'shirt-outline' },
    { id: 'coord_sets', name: 'Co-ord Sets', icon: 'layers-outline' },
  ],
  electronics: [
    { id: 'phones', name: 'Smartphones', icon: 'phone-portrait-outline' },
    { id: 'laptops', name: 'Laptops & MacBooks', icon: 'laptop-outline' },
    { id: 'earbuds', name: 'TWS Earbuds & Pods', icon: 'headset-outline' },
    { id: 'smartwatches', name: 'Smartwatches', icon: 'watch-outline' },
    { id: 'keyboards', name: 'Mechanical Keyboards', icon: 'hardware-chip-outline' },
  ],
  beauty: [
    { id: 'facewash', name: 'Cleanser & Face Wash', icon: 'water-outline' },
    { id: 'serum', name: 'Face Serums', icon: 'flask-outline' },
    { id: 'lip_tint', name: 'Lip Tints & Oils', icon: 'heart-outline' },
    { id: 'moisturizer', name: 'Hydrating Moisturizers', icon: 'water-outline' },
    { id: 'k_beauty', name: 'Korean Skincare', icon: 'flower-outline' },
  ],
  lifestyle: [
    { id: 'tumbler', name: 'Stanley-style Tumblers', icon: 'cafe-outline' },
    { id: 'galaxy_projector', name: 'Galaxy Star Projectors', icon: 'planet-outline' },
  ],
  hostel_essentials: [
    { id: 'study_lamp', name: 'Rechargeable Desk Lamps', icon: 'bulb-outline' },
    { id: 'electric_kettle', name: 'Electric Instant Kettles', icon: 'water-outline' },
    { id: 'laptop_stand', name: 'Laptop Stand & Hub', icon: 'laptop-outline' },
  ],
  gaming: [
    { id: 'controllers', name: 'Wireless Controllers', icon: 'game-controller-outline' },
  ],
  grocery: [
    { id: 'milk', name: 'Dairy & Milk', icon: 'nutrition-outline' },
    { id: 'bread', name: 'Bakery & Bread', icon: 'cart-outline' },
    { id: 'eggs', name: 'Farm Fresh Eggs', icon: 'egg-outline' },
    { id: 'regional_food', name: 'Regional Delicacies', icon: 'ribbon-outline' },
  ],
  fitness: [
    { id: 'protein', name: 'Whey Protein & Creatine', icon: 'fitness-outline' },
  ],
};

// ─── 4. BRANDS DIRECTORY ───
export const BRAND_CATALOG: BrandItem[] = [
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

// ─── UNIQUE IMAGE POOLS PER CATEGORY (1200+ unique Unsplash URLs) ───
// Each pool has 20-30 unique images so state×product combos give 1000+ unique assignments

const IMG: Record<string, string[]> = {
  // ── FASHION: JEANS & DENIM ──
  jeans: [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800',
    'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800',
    'https://images.unsplash.com/photo-1542574271-7f3b92e6c821?w=800',
    'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
    'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800',
    'https://images.unsplash.com/photo-1560060141-bde58f4c9ca3?w=800',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
    'https://images.unsplash.com/photo-1494759516653-7ef491d90b30?w=800',
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800',
    'https://images.unsplash.com/photo-1602810319428-019690571b5b?w=800',
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800',
    'https://images.unsplash.com/photo-1604025702880-5e5d83f2abd2?w=800',
    'https://images.unsplash.com/photo-1587855049254-351f4e55fe2a?w=800',
  ],
  // ── FASHION: T-SHIRTS / OVERSIZED TEES ──
  tee: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    'https://images.unsplash.com/photo-1527719327859-c952aa28b8eb?w=800',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
    'https://images.unsplash.com/photo-1599338237987-f93892f7c00a?w=800',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=0', // intentionally broken to force pool rotation
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800',
    'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800',
    'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800',
    'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800',
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=0',
    'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800',
  ],
  // ── FASHION: CARGO PANTS ──
  cargo: [
    'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800',
    'https://images.unsplash.com/photo-1612902456551-b5cbde75c04c?w=800',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
    'https://images.unsplash.com/photo-1553835020-a97a3fc1d8d9?w=800',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800',
    'https://images.unsplash.com/photo-1528956066890-86a3cd2a2ee0?w=800',
    'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800',
    'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800',
    'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800',
    'https://images.unsplash.com/photo-1570976447640-ac859083963f?w=800',
    'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=800',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
    'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800',
    'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=800',
    'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800',
    'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
  ],
  // ── FASHION: HOODIES & SWEATSHIRTS ──
  hoodie: [
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=800',
    'https://images.unsplash.com/photo-1480053598786-6c6d9a1cbdd3?w=800',
    'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800',
    'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800',
    'https://images.unsplash.com/photo-1573802700572-e3fd975cb40b?w=800',
    'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=800',
    'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.unsplash.com/photo-1596609548086-85bbf8ddb6b9?w=800',
    'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=800',
    'https://images.unsplash.com/photo-1618517351616-38fb9952b0dd?w=800',
    'https://images.unsplash.com/photo-1619603364853-d0aad8a99b5f?w=800',
    'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800',
    'https://images.unsplash.com/photo-1625891813228-1e3b7b38ad4a?w=800',
  ],
  // ── FASHION: SNEAKERS & SHOES ──
  sneaker: [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    'https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=800',
    'https://images.unsplash.com/photo-1578116922645-3976907a7671?w=800',
    'https://images.unsplash.com/photo-1542338347-4fff3b3f7372?w=800',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
    'https://images.unsplash.com/photo-1527090526205-beaac8dc3c62?w=800',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
    'https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=800',
    'https://images.unsplash.com/photo-1583341612423-a60fe7ab3942?w=800',
    'https://images.unsplash.com/photo-1612338994428-c2c39d4b4f0e?w=800',
    'https://images.unsplash.com/photo-1619088093018-6d3cd6f17e6b?w=800',
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800',
    'https://images.unsplash.com/photo-1625814992418-c5c4cf91e60b?w=800',
  ],
  // ── FASHION: COORD SETS & DRESSES ──
  dress: [
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
    'https://images.unsplash.com/photo-1584187839132-de57e3e1e91a?w=800',
    'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800',
    'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800',
    'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
    'https://images.unsplash.com/photo-1470139430712-1c7870af5f6e?w=800',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
    'https://images.unsplash.com/photo-1594938298603-c8148c4b1a47?w=800',
    'https://images.unsplash.com/photo-1592477725143-2e57dc728f0a?w=800',
    'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=800',
    'https://images.unsplash.com/photo-1613482184972-f9bc6b8c6083?w=800',
    'https://images.unsplash.com/photo-1618517351616-38fb9952b0dd?w=800',
    'https://images.unsplash.com/photo-1619537903549-0981d6bca911?w=800',
    'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=800',
    'https://images.unsplash.com/photo-1625891813228-1e3b7b38ad4a?w=800',
  ],
  // ── FASHION: ACCESSORIES / BAGS ──
  bag: [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
    'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    'https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=800',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
    'https://images.unsplash.com/photo-1608731267464-ef4f70b2f8f5?w=800',
    'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=800',
    'https://images.unsplash.com/photo-1618354691038-a8b2012ef64a?w=800',
    'https://images.unsplash.com/photo-1625811850878-a68b75ec0e61?w=800',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800',
    'https://images.unsplash.com/photo-1563642421748-5047b6585a4a?w=800',
    'https://images.unsplash.com/photo-1614112748778-6a46b7699c95?w=800',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
    'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800',
    'https://images.unsplash.com/photo-1618898909019-010e4e234c55?w=800',
    'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=800',
    'https://images.unsplash.com/photo-1577459286949-ba28ca15c54d?w=800',
    'https://images.unsplash.com/photo-1559563458-527698bf5295?w=800',
  ],

  // ── ELECTRONICS: PHONES ──
  phone: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
    'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800',
    'https://images.unsplash.com/photo-1574012328319-a9a42cb6ccfb?w=800',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800',
    'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800',
    'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=0',
    'https://images.unsplash.com/photo-1632134813348-c64b1a6e8b69?w=800',
    'https://images.unsplash.com/photo-1640955011254-39734e60b16f?w=800',
    'https://images.unsplash.com/photo-1643174088013-1dee2c43d97f?w=800',
    'https://images.unsplash.com/photo-1646753522408-077ef9839300?w=800',
    'https://images.unsplash.com/photo-1648000800697-f5c673dbe66f?w=800',
    'https://images.unsplash.com/photo-1612300087165-7eddfd3f8a35?w=800',
    'https://images.unsplash.com/photo-1607936854279-55e8a4c64888?w=800',
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',
    'https://images.unsplash.com/photo-1612344020500-21e14d23ef4d?w=800',
  ],
  // ── ELECTRONICS: IPHONE ──
  iphone: [
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800',
    'https://images.unsplash.com/photo-1632134813348-c64b1a6e8b69?w=800',
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',
    'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800',
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800',
    'https://images.unsplash.com/photo-1569091791842-7cfb64e04797?w=800',
    'https://images.unsplash.com/photo-1603816781754-e28b2a6c0d44?w=800',
  ],
  // ── ELECTRONICS: SAMSUNG GALAXY ──
  galaxy: [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800',
    'https://images.unsplash.com/photo-1551355738-a2b26ec3e45f?w=800',
    'https://images.unsplash.com/photo-1614645077690-0f7d23714b60?w=800',
    'https://images.unsplash.com/photo-1643174088013-1dee2c43d97f?w=800',
    'https://images.unsplash.com/photo-1640955011254-39734e60b16f?w=800',
    'https://images.unsplash.com/photo-1607936854279-55e8a4c64888?w=800',
    'https://images.unsplash.com/photo-1612344020500-21e14d23ef4d?w=800',
    'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800',
    'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800',
  ],
  // ── ELECTRONICS: NOTHING PHONE ──
  nothing: [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
    'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800',
    'https://images.unsplash.com/photo-1574012328319-a9a42cb6ccfb?w=800',
  ],
  // ── ELECTRONICS: EARBUDS / HEADPHONES ──
  earbud: [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800',
    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800',
    'https://images.unsplash.com/photo-1600086827875-a63b01f1335c?w=800',
    'https://images.unsplash.com/photo-1633545488963-30db3f8a8b27?w=800',
    'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
    'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800',
    'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800',
    'https://images.unsplash.com/photo-1574920162043-b872873f19c8?w=800',
    'https://images.unsplash.com/photo-1644014379223-bc5faf0d0fc4?w=800',
    'https://images.unsplash.com/photo-1576738880868-92fb89e11f11?w=800',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800',
    'https://images.unsplash.com/photo-1641806357285-ccd77ac22a39?w=800',
    'https://images.unsplash.com/photo-1618517047922-bdb4cc96b4f5?w=800',
    'https://images.unsplash.com/photo-1612960671345-58b01fffe2de?w=800',
    'https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=800',
    'https://images.unsplash.com/photo-1621992236514-7b2e5e32a26b?w=800',
    'https://images.unsplash.com/photo-1639747281292-5b3e6d1dbd56?w=800',
    'https://images.unsplash.com/photo-1646917832405-e5e3a28a8e74?w=800',
  ],
  // ── ELECTRONICS: HEADPHONES (OVER-EAR) ──
  headphone: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
    'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    'https://images.unsplash.com/photo-1557825835-70d97c4aa567?w=800',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
    'https://images.unsplash.com/photo-1618517047922-bdb4cc96b4f5?w=800',
    'https://images.unsplash.com/photo-1649079048827-4d8dd1e7d1ee?w=800',
    'https://images.unsplash.com/photo-1620038694386-9f5c9c265a0b?w=800',
    'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800',
    'https://images.unsplash.com/photo-1639855137483-8cbb5a4f6db1?w=800',
    'https://images.unsplash.com/photo-1631281956016-3cdc1b2fe5fb?w=800',
    'https://images.unsplash.com/photo-1635405446378-cfb9b0cfefd6?w=800',
    'https://images.unsplash.com/photo-1649879110521-10e74fd57547?w=800',
    'https://images.unsplash.com/photo-1619143380553-7dfce9fe3b06?w=800',
    'https://images.unsplash.com/photo-1608094349124-a2ce5db81c3e?w=800',
    'https://images.unsplash.com/photo-1599669454699-248893623440?w=800',
    'https://images.unsplash.com/photo-1628366208049-3d62b2b3a17a?w=800',
    'https://images.unsplash.com/photo-1616626150706-80cfcb83dbbb?w=800',
  ],
  // ── ELECTRONICS: KEYBOARDS ──
  keyboard: [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800',
    'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?w=800',
    'https://images.unsplash.com/photo-1561380013-7c24088c5cbb?w=800',
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800',
    'https://images.unsplash.com/photo-1595044426077-d36d9236d44a?w=800',
    'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=800',
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800',
    'https://images.unsplash.com/photo-1636760569194-e31cb0a2df2f?w=800',
    'https://images.unsplash.com/photo-1609669756879-4001daf3d9e8?w=800',
    'https://images.unsplash.com/photo-1614681699023-80ca24a00f0d?w=800',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800',
    'https://images.unsplash.com/photo-1580655653885-65763b2597d1?w=800',
    'https://images.unsplash.com/photo-1608678257139-61bbdda81c24?w=800',
    'https://images.unsplash.com/photo-1627480439568-c5e7efa1e38b?w=800',
    'https://images.unsplash.com/photo-1619597228408-ad84abfb2a9e?w=800',
    'https://images.unsplash.com/photo-1641129736034-9bc9e9e6aa8e?w=800',
    'https://images.unsplash.com/photo-1643770878908-b2e31b66c2e9?w=800',
    'https://images.unsplash.com/photo-1649505337027-a0b2cd6a5bb7?w=800',
    'https://images.unsplash.com/photo-1651503384655-a61f96e0e5b3?w=800',
  ],
  // ── ELECTRONICS: MOUSE ──
  mouse: [
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
    'https://images.unsplash.com/photo-1563642421748-5047b6585a4a?w=800',
    'https://images.unsplash.com/photo-1586374579358-9d19d632b6df?w=800',
    'https://images.unsplash.com/photo-1610631787813-9eeb1a2386cc?w=800',
    'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=800',
    'https://images.unsplash.com/photo-1629652487043-fb2825838f8c?w=800',
    'https://images.unsplash.com/photo-1631043198640-36cf45d52de7?w=800',
    'https://images.unsplash.com/photo-1636760569194-e31cb0a2df2f?w=800',
    'https://images.unsplash.com/photo-1643770878908-b2e31b66c2e9?w=800',
    'https://images.unsplash.com/photo-1648736968745-1cdbab1da45b?w=800',
    'https://images.unsplash.com/photo-1651163163880-c5e4e7b2ffd5?w=800',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
    'https://images.unsplash.com/photo-1613741012579-bfcf0a3fae65?w=800',
    'https://images.unsplash.com/photo-1625510154262-57e6aadb7f1d?w=800',
    'https://images.unsplash.com/photo-1648000800697-f5c673dbe66f?w=800',
    'https://images.unsplash.com/photo-1625811850878-a68b75ec0e61?w=800',
    'https://images.unsplash.com/photo-1563642421748-5047b6585a4a?w=800',
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800',
    'https://images.unsplash.com/photo-1639855137483-8cbb5a4f6db1?w=800',
  ],
  // ── ELECTRONICS: LAPTOPS ──
  laptop: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
    'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800',
    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800',
    'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800',
    'https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=800',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
    'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800',
    'https://images.unsplash.com/photo-1640952131659-49a06dd90ad2?w=800',
    'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=800',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
    'https://images.unsplash.com/photo-1605134513573-384dcf99a44c?w=800',
    'https://images.unsplash.com/photo-1618335829737-2228915674e0?w=800',
    'https://images.unsplash.com/photo-1622659419756-f69a4b8ace50?w=800',
    'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800',
    'https://images.unsplash.com/photo-1627395202816-ae96e54eea5a?w=800',
    'https://images.unsplash.com/photo-1634979149798-e9a118734e93?w=800',
    'https://images.unsplash.com/photo-1640952131659-49a06dd90ad2?w=800',
    'https://images.unsplash.com/photo-1643174088013-1dee2c43d97f?w=800',
  ],
  // ── ELECTRONICS: SMARTWATCH ──
  smartwatch: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
    'https://images.unsplash.com/photo-1617197700929-84e20738f6a6?w=800',
    'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800',
    'https://images.unsplash.com/photo-1631769280407-ab3168e4ca50?w=800',
    'https://images.unsplash.com/photo-1638025989067-2a3b7def7f85?w=800',
    'https://images.unsplash.com/photo-1640163831063-2a25d2bf1cb3?w=800',
    'https://images.unsplash.com/photo-1644414636717-f9d1b7a7a4a8?w=800',
    'https://images.unsplash.com/photo-1648000800697-f5c673dbe66f?w=800',
    'https://images.unsplash.com/photo-1613041091051-9b9e4282a1f1?w=800',
    'https://images.unsplash.com/photo-1598966693285-53dc9c8e1fd0?w=800',
    'https://images.unsplash.com/photo-1534282765893-07ba9e4c0e77?w=800',
    'https://images.unsplash.com/photo-1617197700929-84e20738f6a6?w=800',
    'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800',
    'https://images.unsplash.com/photo-1599438099527-82893f96b895?w=800',
    'https://images.unsplash.com/photo-1618398938426-c96dea0de5da?w=800',
    'https://images.unsplash.com/photo-1622517283557-d0ea6f2c7b71?w=800',
  ],

  // ── BEAUTY: SERUM & SKINCARE ──
  serum: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800',
    'https://images.unsplash.com/photo-1570194065650-d99fb4b28b18?w=800',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800',
    'https://images.unsplash.com/photo-1567721913486-6585f069b3a5?w=800',
    'https://images.unsplash.com/photo-1601612628452-9e99ced43524?w=800',
    'https://images.unsplash.com/photo-1612377231866-f03ea03d58e8?w=800',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800',
    'https://images.unsplash.com/photo-1620118369584-df8f5f4dba3b?w=800',
    'https://images.unsplash.com/photo-1624381361879-a693b1571474?w=800',
    'https://images.unsplash.com/photo-1625891812214-39e5ed08c03e?w=800',
    'https://images.unsplash.com/photo-1627811352994-fabe2f9a1fb0?w=800',
    'https://images.unsplash.com/photo-1629552688085-8f7a40c4fd6a?w=800',
    'https://images.unsplash.com/photo-1632588546780-a4a1cd7ba85e?w=800',
    'https://images.unsplash.com/photo-1634542984003-e0fb8e200e91?w=800',
    'https://images.unsplash.com/photo-1638026897702-33ded028b3d5?w=800',
    'https://images.unsplash.com/photo-1640956226680-6aa49d19e13c?w=800',
    'https://images.unsplash.com/photo-1643270978022-3ce31e0e7561?w=800',
  ],
  // ── BEAUTY: FACE WASH / CLEANSER ──
  facewash: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800',
    'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800',
    'https://images.unsplash.com/photo-1597392582469-a697322d5c32?w=800',
    'https://images.unsplash.com/photo-1601612628452-9e99ced43524?w=800',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800',
    'https://images.unsplash.com/photo-1612377231866-f03ea03d58e8?w=800',
    'https://images.unsplash.com/photo-1614597396930-cd6760b99f7c?w=800',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800',
    'https://images.unsplash.com/photo-1622388502397-5d87c9ee46e2?w=800',
    'https://images.unsplash.com/photo-1625891812214-39e5ed08c03e?w=800',
    'https://images.unsplash.com/photo-1628023154167-1a3a2a26f16d?w=800',
    'https://images.unsplash.com/photo-1629552688085-8f7a40c4fd6a?w=800',
    'https://images.unsplash.com/photo-1632588546780-a4a1cd7ba85e?w=800',
    'https://images.unsplash.com/photo-1635270011754-3b3e7c0b3cb6?w=800',
    'https://images.unsplash.com/photo-1638026897702-33ded028b3d5?w=800',
    'https://images.unsplash.com/photo-1639757081685-8ac88e3c1aae?w=800',
    'https://images.unsplash.com/photo-1641491166088-3f1d7e6f7283?w=800',
    'https://images.unsplash.com/photo-1643270978022-3ce31e0e7561?w=800',
    'https://images.unsplash.com/photo-1645519428699-4c6ff1dd84f1?w=800',
  ],
  // ── BEAUTY: LIPSTICK / LIP TINT ──
  lipstick: [
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800',
    'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=800',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800',
    'https://images.unsplash.com/photo-1567721913486-6585f069b3a5?w=800',
    'https://images.unsplash.com/photo-1599733589523-7662cd77d36a?w=800',
    'https://images.unsplash.com/photo-1603052875302-d376b7c0638a?w=800',
    'https://images.unsplash.com/photo-1611782021660-42b9b4f2c9be?w=800',
    'https://images.unsplash.com/photo-1617443831600-e88e3882b929?w=800',
    'https://images.unsplash.com/photo-1621780787681-2d0e8339e9d2?w=800',
    'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=800',
    'https://images.unsplash.com/photo-1627810592073-45bc4a03284e?w=800',
    'https://images.unsplash.com/photo-1630441427453-ca1e50a44a11?w=800',
    'https://images.unsplash.com/photo-1633244036455-b6e9ecfdbde0?w=800',
    'https://images.unsplash.com/photo-1635270011754-3b3e7c0b3cb6?w=800',
    'https://images.unsplash.com/photo-1637788219085-bf9cfb8e6c01?w=800',
    'https://images.unsplash.com/photo-1639757081685-8ac88e3c1aae?w=800',
    'https://images.unsplash.com/photo-1641491166088-3f1d7e6f7283?w=800',
    'https://images.unsplash.com/photo-1643270978022-3ce31e0e7561?w=800',
    'https://images.unsplash.com/photo-1645519428699-4c6ff1dd84f1?w=800',
  ],
  // ── BEAUTY: PERFUME / FRAGRANCE ──
  perfume: [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800',
    'https://images.unsplash.com/photo-1541119638723-c51cbe2262aa?w=800',
    'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=0',
    'https://images.unsplash.com/photo-1563170352-b3dc7acdd5dc?w=800',
    'https://images.unsplash.com/photo-1595520407624-2f3b0c52e8f3?w=800',
    'https://images.unsplash.com/photo-1601124461359-cf6aa4ded2f5?w=800',
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800',
    'https://images.unsplash.com/photo-1619685292782-8cc5abd8d97a?w=800',
    'https://images.unsplash.com/photo-1622388502397-5d87c9ee46e2?w=800',
    'https://images.unsplash.com/photo-1628023154167-1a3a2a26f16d?w=800',
    'https://images.unsplash.com/photo-1633244036455-b6e9ecfdbde0?w=800',
    'https://images.unsplash.com/photo-1636338439476-12bef57ba35f?w=800',
    'https://images.unsplash.com/photo-1638026897702-33ded028b3d5?w=800',
    'https://images.unsplash.com/photo-1640956226680-6aa49d19e13c?w=800',
    'https://images.unsplash.com/photo-1642857793714-2bed30d5fd0b?w=800',
    'https://images.unsplash.com/photo-1643270978022-3ce31e0e7561?w=800',
    'https://images.unsplash.com/photo-1644955580059-c3a3db0e1bcc?w=800',
    'https://images.unsplash.com/photo-1546514714-df0ccc50b7a3?w=800',
  ],
  // ── BEAUTY: MOISTURIZER / SUNSCREEN ──
  moisturizer: [
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
    'https://images.unsplash.com/photo-1570194065650-d99fb4b28b18?w=800',
    'https://images.unsplash.com/photo-1601612628452-9e99ced43524?w=800',
    'https://images.unsplash.com/photo-1614597396930-cd6760b99f7c?w=800',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
    'https://images.unsplash.com/photo-1624381361879-a693b1571474?w=800',
    'https://images.unsplash.com/photo-1627811352994-fabe2f9a1fb0?w=800',
    'https://images.unsplash.com/photo-1629552688085-8f7a40c4fd6a?w=800',
    'https://images.unsplash.com/photo-1632588546780-a4a1cd7ba85e?w=800',
    'https://images.unsplash.com/photo-1634542984003-e0fb8e200e91?w=800',
    'https://images.unsplash.com/photo-1636860695826-2a547f0ca66d?w=800',
    'https://images.unsplash.com/photo-1638026897702-33ded028b3d5?w=800',
    'https://images.unsplash.com/photo-1639757081685-8ac88e3c1aae?w=800',
    'https://images.unsplash.com/photo-1641491166088-3f1d7e6f7283?w=800',
    'https://images.unsplash.com/photo-1643270978022-3ce31e0e7561?w=800',
    'https://images.unsplash.com/photo-1645519428699-4c6ff1dd84f1?w=800',
    'https://images.unsplash.com/photo-1603052875302-d376b7c0638a?w=800',
    'https://images.unsplash.com/photo-1567721913486-6585f069b3a5?w=800',
    'https://images.unsplash.com/photo-1612377231866-f03ea03d58e8?w=800',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800',
  ],

  // ── GROCERY: MILK & DAIRY ──
  milk: [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800',
    'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=800',
    'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800',
    'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=800',
    'https://images.unsplash.com/photo-1583753340884-2ee5a27b4e8f?w=800',
    'https://images.unsplash.com/photo-1517448931540-bbc1fde8b89b?w=800',
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800',
    'https://images.unsplash.com/photo-1573551089778-46a7abc39d9f?w=800',
    'https://images.unsplash.com/photo-1594087683396-8fba3d40bfb4?w=800',
    'https://images.unsplash.com/photo-1612540139150-4562e6b77a8a?w=800',
    'https://images.unsplash.com/photo-1622389822960-b0a5e1b86e78?w=800',
    'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800',
    'https://images.unsplash.com/photo-1637945613440-a7ae14d49bd7?w=800',
    'https://images.unsplash.com/photo-1640619882124-ddc4cd9c2d8e?w=800',
    'https://images.unsplash.com/photo-1643270978022-3ce31e0e7561?w=0',
    'https://images.unsplash.com/photo-1645519428699-4c6ff1dd84f1?w=0',
    'https://images.unsplash.com/photo-1625811850878-a68b75ec0e61?w=0',
    'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800',
    'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=800',
  ],
  // ── GROCERY: BREAD & BAKERY ──
  bread: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800',
    'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800',
    'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=800',
    'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800',
    'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=800',
    'https://images.unsplash.com/photo-1612240498936-65f5101365d2?w=800',
    'https://images.unsplash.com/photo-1617611013291-75e09d671b32?w=800',
    'https://images.unsplash.com/photo-1623241899289-a1d89f3e0a2e?w=800',
    'https://images.unsplash.com/photo-1626082896492-766af4eb6501?w=800',
    'https://images.unsplash.com/photo-1627600941614-45b9f8d2b8f7?w=800',
    'https://images.unsplash.com/photo-1631144145867-6ead7d5d1fcb?w=800',
    'https://images.unsplash.com/photo-1632244018038-5d3f534f3f39?w=800',
    'https://images.unsplash.com/photo-1634928083019-b3c9bb82e975?w=800',
    'https://images.unsplash.com/photo-1639504018745-9cf69e1fca3d?w=800',
    'https://images.unsplash.com/photo-1641329088168-4d0c70dfcd2e?w=800',
    'https://images.unsplash.com/photo-1643648898066-95af6d736dd7?w=800',
    'https://images.unsplash.com/photo-1645519427028-22d0c3a5a4b4?w=800',
    'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800',
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800',
  ],
  // ── GROCERY: EGGS ──
  egg: [
    'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800',
    'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=800',
    'https://images.unsplash.com/photo-1491524062933-cb0289261700?w=800',
    'https://images.unsplash.com/photo-1609780447631-05b93e5a88ea?w=800',
    'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800',
    'https://images.unsplash.com/photo-1594878898423-56951f2a895e?w=800',
    'https://images.unsplash.com/photo-1610631913824-8a9ebb3e59dc?w=800',
    'https://images.unsplash.com/photo-1624381337889-2bc3e4f78e4e?w=800',
    'https://images.unsplash.com/photo-1637945613440-a7ae14d49bd7?w=800',
    'https://images.unsplash.com/photo-1638716396756-d0fbf8e89b64?w=800',
  ],
  // ── GROCERY: MAKHANA / SATTU / REGIONAL SNACKS ──
  makhana: [
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
    'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800',
    'https://images.unsplash.com/photo-1571167366136-b57e973d4b2d?w=800',
    'https://images.unsplash.com/photo-1585169042-6a8b03f32c5c?w=800',
    'https://images.unsplash.com/photo-1602532305019-3dbbd5e6d6eb?w=800',
    'https://images.unsplash.com/photo-1607301406259-dfb186e15de8?w=800',
    'https://images.unsplash.com/photo-1612878010854-1250dfc5000a?w=800',
    'https://images.unsplash.com/photo-1618478594486-c65b899c4936?w=800',
    'https://images.unsplash.com/photo-1621189768633-f3faff4bdb8f?w=800',
    'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=0',
    'https://images.unsplash.com/photo-1628023154167-1a3a2a26f16d?w=0',
    'https://images.unsplash.com/photo-1630441427453-ca1e50a44a11?w=0',
    'https://images.unsplash.com/photo-1632588546780-a4a1cd7ba85e?w=0',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800',
    'https://images.unsplash.com/photo-1600271772470-bd22a42787b3?w=800',
    'https://images.unsplash.com/photo-1576097449798-7c7f90e1248a?w=800',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
    'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800',
  ],
  // ── GROCERY: VEGETABLES & FRUITS ──
  vegetable: [
    'https://images.unsplash.com/photo-1543168256-418811576931?w=800',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=800',
    'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800',
    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
    'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800',
    'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800',
    'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=800',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800',
    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800',
    'https://images.unsplash.com/photo-1621519899919-b6a7cf87aa2f?w=800',
    'https://images.unsplash.com/photo-1624811019619-57c5d7e00b5f?w=800',
    'https://images.unsplash.com/photo-1626157329882-9e00d0dc6a37?w=800',
    'https://images.unsplash.com/photo-1627484542069-39a694c83124?w=800',
    'https://images.unsplash.com/photo-1591294810426-b29bf92a5ef0?w=800',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
    'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=800',
    'https://images.unsplash.com/photo-1629563583896-0a2f9ceaa3b6?w=800',
    'https://images.unsplash.com/photo-1534706932291-70a98030c50c?w=800',
  ],

  // ── HOME & LIVING: FURNITURE / LAMPS / RACKS ──
  lamp: [
    'https://images.unsplash.com/photo-1532009877282-3340270e0529?w=800',
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
    'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800',
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800',
    'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800',
    'https://images.unsplash.com/photo-1621280822249-8e83e3fe5e27?w=800',
    'https://images.unsplash.com/photo-1623298320869-0e4e8de67ca3?w=800',
    'https://images.unsplash.com/photo-1625183868024-01a9b7c382f0?w=800',
    'https://images.unsplash.com/photo-1627811352994-fabe2f9a1fb0?w=0',
    'https://images.unsplash.com/photo-1629552688085-8f7a40c4fd6a?w=0',
    'https://images.unsplash.com/photo-1632588546780-a4a1cd7ba85e?w=0',
    'https://images.unsplash.com/photo-1631967685949-febb48d51d60?w=800',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
  ],
  furniture: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
    'https://images.unsplash.com/photo-1583845112203-29329902332e?w=800',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800',
    'https://images.unsplash.com/photo-1603547403966-4c9db6cf5f51?w=800',
    'https://images.unsplash.com/photo-1610126844601-e1c48e1da64e?w=800',
    'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800',
    'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=800',
    'https://images.unsplash.com/photo-1620332372374-f108c53d2e03?w=800',
    'https://images.unsplash.com/photo-1622500663439-a68c9e22e79e?w=800',
    'https://images.unsplash.com/photo-1624552184280-9e9631bbeee9?w=800',
    'https://images.unsplash.com/photo-1626208095875-b3b1c36aaab8?w=800',
    'https://images.unsplash.com/photo-1628783882862-a9b0cee48b3b?w=800',
    'https://images.unsplash.com/photo-1631967685949-febb48d51d60?w=800',
    'https://images.unsplash.com/photo-1633439095025-c80ccf2e9b5c?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  ],

  // ── HOSTEL: KETTLE ──
  kettle: [
    'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    'https://images.unsplash.com/photo-1568901342437-0afba80e9a57?w=800',
    'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800',
    'https://images.unsplash.com/photo-1593640408182-31c228e62d8c?w=800',
    'https://images.unsplash.com/photo-1600271772470-bd22a42787b3?w=800',
    'https://images.unsplash.com/photo-1606487497624-6f05b19fbcef?w=800',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800',
    'https://images.unsplash.com/photo-1619599879779-b45e0f5e70fa?w=800',
    'https://images.unsplash.com/photo-1621780822249-8e83e3fe5e27?w=800',
    'https://images.unsplash.com/photo-1624183280417-59e7dbbc15f1?w=800',
    'https://images.unsplash.com/photo-1626208095875-b3b1c36aaab8?w=800',
    'https://images.unsplash.com/photo-1628783882862-a9b0cee48b3b?w=800',
    'https://images.unsplash.com/photo-1631967685949-febb48d51d60?w=800',
    'https://images.unsplash.com/photo-1633439095025-c80ccf2e9b5c?w=800',
    'https://images.unsplash.com/photo-1636338439476-12bef57ba35f?w=800',
    'https://images.unsplash.com/photo-1638026897702-33ded028b3d5?w=800',
    'https://images.unsplash.com/photo-1640956226680-6aa49d19e13c?w=800',
    'https://images.unsplash.com/photo-1643270978022-3ce31e0e7561?w=0',
  ],
  // ── HOSTEL: WATER BOTTLE ──
  bottle: [
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.unsplash.com/photo-1570998050279-8a4c98bd5f5a?w=800',
    'https://images.unsplash.com/photo-1589187151076-2d3b3bd35ef3?w=800',
    'https://images.unsplash.com/photo-1601924358447-5fd2b0be7588?w=800',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=0',
    'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=0',
    'https://images.unsplash.com/photo-1622500663439-a68c9e22e79e?w=0',
    'https://images.unsplash.com/photo-1479136655376-22fa5399fdd2?w=800',
    'https://images.unsplash.com/photo-1594222082867-adf571d9bec9?w=800',
    'https://images.unsplash.com/photo-1596803244536-8a41a6b4c62a?w=800',
    'https://images.unsplash.com/photo-1609741013484-17c8dffa1093?w=800',
    'https://images.unsplash.com/photo-1622658352836-30e10d7e4e43?w=800',
    'https://images.unsplash.com/photo-1625811850878-a68b75ec0e61?w=0',
    'https://images.unsplash.com/photo-1628478644851-97d7e2a77ed2?w=800',
    'https://images.unsplash.com/photo-1630441427453-ca1e50a44a11?w=0',
    'https://images.unsplash.com/photo-1633244036455-b6e9ecfdbde0?w=0',
    'https://images.unsplash.com/photo-1536941842682-ad90d52e2c80?w=800',
    'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800',
  ],
  // ── HOSTEL: LAPTOP STAND ──
  laptopstand: [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
    'https://images.unsplash.com/photo-1616627988671-e677c32e5168?w=800',
    'https://images.unsplash.com/photo-1593640408182-31c228e62d8c?w=800',
    'https://images.unsplash.com/photo-1593640495609-42a16a36ea8a?w=800',
    'https://images.unsplash.com/photo-1606487497624-6f05b19fbcef?w=800',
    'https://images.unsplash.com/photo-1610126844601-e1c48e1da64e?w=800',
    'https://images.unsplash.com/photo-1617881773615-5e2f5f2a0d0a?w=800',
    'https://images.unsplash.com/photo-1619599879779-b45e0f5e70fa?w=800',
    'https://images.unsplash.com/photo-1621761191319-c986187a1ee1?w=800',
    'https://images.unsplash.com/photo-1623181075765-5d0a7a5be4b6?w=800',
  ],
  // ── HOSTEL: STUDY LAMP ──
  studylamp: [
    'https://images.unsplash.com/photo-1532009877282-3340270e0529?w=800',
    'https://images.unsplash.com/photo-1583845112203-29329902332e?w=800',
    'https://images.unsplash.com/photo-1589581966902-d2e4ae3ece15?w=800',
    'https://images.unsplash.com/photo-1598550476439-6847ef8edd6c?w=800',
    'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800',
    'https://images.unsplash.com/photo-1609741013484-17c8dffa1093?w=0',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800',
    'https://images.unsplash.com/photo-1619367628741-a8c72b9b5be9?w=800',
    'https://images.unsplash.com/photo-1622658352836-30e10d7e4e43?w=0',
    'https://images.unsplash.com/photo-1625183868024-01a9b7c382f0?w=800',
  ],

  // ── FITNESS: PROTEIN ──
  protein: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=800',
    'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
    'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=800',
    'https://images.unsplash.com/photo-1614297879571-ebf5a9db4adc?w=800',
    'https://images.unsplash.com/photo-1617195733415-8bc5fd4b5da8?w=800',
    'https://images.unsplash.com/photo-1619967946935-7f06de7febd0?w=800',
    'https://images.unsplash.com/photo-1622029289219-2f0be8ccfa38?w=800',
    'https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=800',
    'https://images.unsplash.com/photo-1628023154167-1a3a2a26f16d?w=0',
    'https://images.unsplash.com/photo-1629552688085-8f7a40c4fd6a?w=0',
    'https://images.unsplash.com/photo-1548691032-2e79b8a79e0e?w=800',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=800',
    'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800',
    'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
    'https://images.unsplash.com/photo-1593348752578-28aba9e7e6e4?w=800',
    'https://images.unsplash.com/photo-1595952618278-6dd96476cb23?w=800',
  ],

  // ── GAMING ──
  gaming: [
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    'https://images.unsplash.com/photo-1598550476439-6847ef8edd6c?w=800',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800',
    'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
    'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=800',
    'https://images.unsplash.com/photo-1616588589963-d3f929e1d6cc?w=800',
    'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800',
    'https://images.unsplash.com/photo-1620710000000-000000000001?w=800',
    'https://images.unsplash.com/photo-1622037023267-cce1e3e73f68?w=800',
    'https://images.unsplash.com/photo-1625007015513-9eb3a2e74ec1?w=800',
    'https://images.unsplash.com/photo-1627224237862-8e5bfe59f41a?w=800',
    'https://images.unsplash.com/photo-1630439066869-32d32f2e83c5?w=800',
    'https://images.unsplash.com/photo-1633439095025-c80ccf2e9b5c?w=0',
    'https://images.unsplash.com/photo-1636338439476-12bef57ba35f?w=0',
    'https://images.unsplash.com/photo-1604418376245-cd3e6a5c0a5a?w=800',
    'https://images.unsplash.com/photo-1617886903335-74b0d5e2a5bf?w=800',
    'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800',
    'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=0',
  ],

  // ── ACCESSORIES: WATCHES ──
  watch: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800',
    'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=0',
    'https://images.unsplash.com/photo-1600028068383-ea11a7a101f3?w=800',
    'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=0',
    'https://images.unsplash.com/photo-1614332460912-b3c5c4b85ef4?w=800',
    'https://images.unsplash.com/photo-1617197700929-84e20738f6a6?w=800',
    'https://images.unsplash.com/photo-1622388502397-5d87c9ee46e2?w=0',
    'https://images.unsplash.com/photo-1623698524855-b1ccfe1d46da?w=800',
    'https://images.unsplash.com/photo-1624883174027-46b7025f7f54?w=800',
    'https://images.unsplash.com/photo-1627285028741-6b3e7d37b5ef?w=800',
    'https://images.unsplash.com/photo-1629563583896-0a2f9ceaa3b6?w=0',
    'https://images.unsplash.com/photo-1631543904503-39d0e34f0b9e?w=800',
    'https://images.unsplash.com/photo-1633244036455-b6e9ecfdbde0?w=0',
    'https://images.unsplash.com/photo-1635270011754-3b3e7c0b3cb6?w=0',
    'https://images.unsplash.com/photo-1637788219085-bf9cfb8e6c01?w=0',
    'https://images.unsplash.com/photo-1639757081685-8ac88e3c1aae?w=0',
    'https://images.unsplash.com/photo-1534534573898-db5148bc8b0c?w=800',
  ],

  // ── LIFESTYLE: TUMBLER / PROJECTOR ──
  lifestyle: [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
    'https://images.unsplash.com/photo-1599443015574-be5fe8a05783?w=800',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=0',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800',
    'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=0',
    'https://images.unsplash.com/photo-1613041091051-9b9e4282a1f1?w=0',
    'https://images.unsplash.com/photo-1616616615537-04f7cfe7d5bc?w=800',
    'https://images.unsplash.com/photo-1618517047922-bdb4cc96b4f5?w=0',
    'https://images.unsplash.com/photo-1620038694386-9f5c9c265a0b?w=0',
    'https://images.unsplash.com/photo-1621508638997-e8cf81d1f6d7?w=800',
    'https://images.unsplash.com/photo-1622929091283-d6d82dfdf9e2?w=800',
    'https://images.unsplash.com/photo-1625094521927-92abca5e4b3b?w=800',
    'https://images.unsplash.com/photo-1627394941572-1e1f5e7a5b89?w=800',
    'https://images.unsplash.com/photo-1629780320144-f49e4dc17a2e?w=800',
    'https://images.unsplash.com/photo-1630783708791-0e0f4a6e1ce5?w=800',
    'https://images.unsplash.com/photo-1632588546780-a4a1cd7ba85e?w=0',
    'https://images.unsplash.com/photo-1634542984003-e0fb8e200e91?w=0',
    'https://images.unsplash.com/photo-1637788219085-bf9cfb8e6c01?w=0',
  ],

  // ── KITCHEN: APPLIANCES ──
  kitchen: [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800',
    'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800',
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800',
    'https://images.unsplash.com/photo-1600271772470-bd22a42787b3?w=800',
    'https://images.unsplash.com/photo-1606487497624-6f05b19fbcef?w=800',
    'https://images.unsplash.com/photo-1619367628741-a8c72b9b5be9?w=800',
    'https://images.unsplash.com/photo-1622659800073-17c8c3a6c4c6?w=800',
    'https://images.unsplash.com/photo-1624552184280-9e9631bbeee9?w=800',
    'https://images.unsplash.com/photo-1626208095875-b3b1c36aaab8?w=800',
    'https://images.unsplash.com/photo-1628783882862-a9b0cee48b3b?w=800',
    'https://images.unsplash.com/photo-1631967685949-febb48d51d60?w=800',
    'https://images.unsplash.com/photo-1633439095025-c80ccf2e9b5c?w=800',
    'https://images.unsplash.com/photo-1636338439476-12bef57ba35f?w=800',
    'https://images.unsplash.com/photo-1638026897702-33ded028b3d5?w=800',
    'https://images.unsplash.com/photo-1554434347-3c57c4a12e17?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=0',
    'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800',
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800',
  ],

  // ── SPORTS & OUTDOORS ──
  sports: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=0',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800',
    'https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?w=800',
    'https://images.unsplash.com/photo-1598306442928-4d90f32c6866?w=800',
    'https://images.unsplash.com/photo-1612286526810-5db1a94ea6dc?w=800',
    'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=800',
    'https://images.unsplash.com/photo-1619067439773-4c7e2f9e2ebb?w=800',
    'https://images.unsplash.com/photo-1622029019960-0e7c42b0e81c?w=800',
    'https://images.unsplash.com/photo-1624372636740-0b84d6d10c13?w=800',
    'https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=800',
    'https://images.unsplash.com/photo-1628023154167-1a3a2a26f16d?w=0',
    'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=800',
    'https://images.unsplash.com/photo-1556741533-411cf82e4e2d?w=800',
    'https://images.unsplash.com/photo-1562675060-b6a8c8fdc2b4?w=800',
    'https://images.unsplash.com/photo-1520975917517-d0d8e4de3a1c?w=800',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
  ],

  // ── HEALTH & WELLNESS ──
  health: [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800',
    'https://images.unsplash.com/photo-1559076988-8b8f54fe59b2?w=800',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800',
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800',
    'https://images.unsplash.com/photo-1604049726001-a2e0a6f0f9d2?w=800',
    'https://images.unsplash.com/photo-1611612768395-b1f5c2b36e76?w=800',
    'https://images.unsplash.com/photo-1616949429020-68adee8ad2bd?w=800',
    'https://images.unsplash.com/photo-1621761191319-c986187a1ee1?w=800',
    'https://images.unsplash.com/photo-1623181075765-5d0a7a5be4b6?w=800',
    'https://images.unsplash.com/photo-1624552184280-9e9631bbeee9?w=800',
    'https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=0',
    'https://images.unsplash.com/photo-1628023154167-1a3a2a26f16d?w=0',
    'https://images.unsplash.com/photo-1629552688085-8f7a40c4fd6a?w=0',
    'https://images.unsplash.com/photo-1632588546780-a4a1cd7ba85e?w=0',
    'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800',
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800',
    'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800',
    'https://images.unsplash.com/photo-1558452919-08ae4aea8e29?w=800',
    'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=800',
    'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800',
  ],

  // ── PET CARE ──
  pet: [
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=800',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
    'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
    'https://images.unsplash.com/photo-1605897472359-fa6e61c9e35c?w=800',
    'https://images.unsplash.com/photo-1612351932576-1f8e75e37d98?w=800',
    'https://images.unsplash.com/photo-1616499370260-485b3e5ed653?w=800',
    'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800',
    'https://images.unsplash.com/photo-1625813592938-a014e61b7c49?w=800',
    'https://images.unsplash.com/photo-1629282637975-4e24b3d34abd?w=800',
    'https://images.unsplash.com/photo-1633244036455-b6e9ecfdbde0?w=0',
    'https://images.unsplash.com/photo-1636338439476-12bef57ba35f?w=0',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800',
    'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800',
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800',
    'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?w=800',
  ],

  // ── BABY CARE ──
  baby: [
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
    'https://images.unsplash.com/photo-1522508660917-bd28afeb1c5f?w=800',
    'https://images.unsplash.com/photo-1533483595632-c5f0e57a1936?w=800',
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800',
    'https://images.unsplash.com/photo-1566620571458-e6efb9e8ee33?w=800',
    'https://images.unsplash.com/photo-1570184611244-1c9ba08e38ff?w=800',
    'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=800',
    'https://images.unsplash.com/photo-1584839404048-f5f4a5e69aa6?w=800',
    'https://images.unsplash.com/photo-1602726819559-3e01551f1b8c?w=800',
    'https://images.unsplash.com/photo-1611943661176-0ac9f3bce99c?w=800',
    'https://images.unsplash.com/photo-1617195733415-8bc5fd4b5da8?w=0',
    'https://images.unsplash.com/photo-1619967946935-7f06de7febd0?w=0',
    'https://images.unsplash.com/photo-1621760155328-9d90ed4f4ee2?w=800',
    'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800',
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800',
    'https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?w=800',
    'https://images.unsplash.com/photo-1504173010664-32509107de98?w=800',
    'https://images.unsplash.com/photo-1492962827063-e5ea0d8c01f5?w=800',
    'https://images.unsplash.com/photo-1470116945706-e6bf5d5a53ca?w=800',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800',
  ],

  // ── AUTOMOBILE ──
  automobile: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0729?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=0',
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=800',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=0',
    'https://images.unsplash.com/photo-1598966293643-5eac3d68e99b?w=800',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=0',
    'https://images.unsplash.com/photo-1605559911160-a3d95d213904?w=800',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=0',
    'https://images.unsplash.com/photo-1614926857083-7be149266cda?w=800',
    'https://images.unsplash.com/photo-1617197700929-84e20738f6a6?w=0',
    'https://images.unsplash.com/photo-1619741526804-b7b0d67b1dbd?w=800',
    'https://images.unsplash.com/photo-1622099082027-57b01f979d69?w=800',
    'https://images.unsplash.com/photo-1625811850878-a68b75ec0e61?w=0',
    'https://images.unsplash.com/photo-1514316703755-dca7d7d9d882?w=800',
  ],

  // ── GIFTS & HAMPERS ──
  gifts: [
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800',
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800',
    'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800',
    'https://images.unsplash.com/photo-1612462777082-c76f1e91e68c?w=800',
    'https://images.unsplash.com/photo-1617885963861-2ebcff7fe9e2?w=800',
    'https://images.unsplash.com/photo-1621761191319-c986187a1ee1?w=0',
    'https://images.unsplash.com/photo-1624552184280-9e9631bbeee9?w=0',
    'https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=0',
    'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800',
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=0',
    'https://images.unsplash.com/photo-1558394664-77c6cd2a0b77?w=800',
    'https://images.unsplash.com/photo-1577080086127-7abb62e56b56?w=800',
    'https://images.unsplash.com/photo-1587561624769-4cfe2fdaad7b?w=800',
    'https://images.unsplash.com/photo-1597586124394-fbd6ef244026?w=800',
    'https://images.unsplash.com/photo-1604906645462-24148b4a9c0e?w=800',
    'https://images.unsplash.com/photo-1612462777082-c76f1e91e68c?w=800',
    'https://images.unsplash.com/photo-1617885963861-2ebcff7fe9e2?w=800',
    'https://images.unsplash.com/photo-1624994289796-54a6ddb73b3b?w=800',
    'https://images.unsplash.com/photo-1631967685949-febb48d51d60?w=0',
  ],
};

// Smart image picker: picks from a pool based on state+product index for variety
function pickImg(pool: string[], sIdx: number, pIdx: number): string {
  const cleanPool = pool.filter(u => !u.endsWith('?w=0'));
  if (cleanPool.length === 0) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
  return cleanPool[(sIdx * 7 + pIdx * 13) % cleanPool.length];
}

// Category → fallback pool when no keyword matched
const CATEGORY_IMG_POOLS: Record<string, string[]> = {
  fashion: IMG.jeans,
  electronics: IMG.phone,
  beauty: IMG.serum,
  quickbuy: IMG.vegetable,
  grocery: IMG.vegetable,
  hostel_essentials: IMG.kettle,
  gaming: IMG.gaming,
  study_office: IMG.laptop,
  fitness: IMG.protein,
  home_living: IMG.furniture,
  lifestyle: IMG.lifestyle,
  accessories: IMG.bag,
  footwear: IMG.sneaker,
  sports: IMG.sports,
  pet_care: IMG.pet,
  automobile: IMG.automobile,
  baby_care: IMG.baby,
  health_care: IMG.health,
  gifts: IMG.gifts,
  kitchen: IMG.kitchen,
};

const CATEGORY_PRODUCT_TEMPLATES: Record<string, { titles: string[]; brand: string; brandId: string; basePrice: number; mrp: number; img: string; tags: string[]; specs: Record<string, string> }[]> = {
  fashion: [
    {
      titles: ['Retro Washed Oversized Baggy Denim', 'Y2K Streetwear Wide Baggy Cargo Jeans', 'Vintage Dark Indigo Baggy Denim Pants'],
      brand: 'SNITCH',
      brandId: 'snitch',
      basePrice: 1499,
      mrp: 2499,
      img: 'jeans',  // resolved at runtime via IMG pool
      tags: ['Trending', 'Baggy Fit'],
      specs: { Material: '100% Cotton Denim', Fit: 'Relaxed Baggy' },
    },
    {
      titles: ['Heavyweight 240GSM Tokyo Graphic Tee', 'Aesthetic Cyberpunk Oversized Boxy Shirt', 'Minimalist Acid Wash Heavy Cotton Drop Shoulder'],
      brand: 'Bewakoof Official',
      brandId: 'bewakoof',
      basePrice: 699,
      mrp: 1299,
      img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
      tags: ['Hostel Essential', 'Gen-Z Pick'],
      specs: { Fabric: '240 GSM Combed Cotton' },
    },
    {
      titles: ['Tactical Multi-Pocket Cargo Pants', 'Relaxed Fit Streetwear Cargo Trousers'],
      brand: 'SNITCH',
      brandId: 'snitch',
      basePrice: 1299,
      mrp: 2199,
      img: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
      tags: ['Streetwear', 'Multi-Pocket'],
      specs: { Fit: 'Relaxed Cargo' },
    },
    {
      titles: ['Urban Chunky White Leather Sneakers', 'Hype Retrosport High-Top Kicks'],
      brand: 'Puma',
      brandId: 'puma',
      basePrice: 2499,
      mrp: 4999,
      img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
      tags: ['Kicks', 'Sneakers'],
      specs: { Material: 'Synthetic Leather' },
    },
  ],
  electronics: [
    {
      titles: ['Nothing Phone (2a) 5G (8GB/128GB)', 'Apple iPhone 15 (128GB - Black)', 'Samsung Galaxy S24 Ultra 5G'],
      brand: 'Nothing',
      brandId: 'nothing',
      basePrice: 23999,
      mrp: 25999,
      img: 'phone',
      tags: ['Trending', '5G Flagship'],
      specs: { Display: '120Hz AMOLED', Processor: 'Dimensity 7200 Pro' },
    },
    {
      titles: ['boAt Airdopes 141 ANC TWS Earbuds', 'Realme Buds Air 6 Pro ANC'],
      brand: 'boAt',
      brandId: 'boat',
      basePrice: 1299,
      mrp: 2990,
      img: 'earbud',
      tags: ['TWS', 'Noise Cancelling'],
      specs: { ANC: '32dB Active Noise Cancellation' },
    },
    {
      titles: ['RGB Hot-Swappable Mechanical Gaming Keyboard', 'Wireless Compact Mechanical Keyboard'],
      brand: 'Redragon',
      brandId: 'redragon',
      basePrice: 2999,
      mrp: 4999,
      img: 'keyboard',
      tags: ['Mechanical Keyboard', 'RGB'],
      specs: { Switch: 'Red Linear Switches' },
    },
    {
      titles: ['MacBook Pro M3 14-inch Laptop', 'Dell XPS 15 OLED Creator Laptop', 'ASUS ROG Strix Gaming Laptop'],
      brand: 'Apple',
      brandId: 'apple',
      basePrice: 99999,
      mrp: 119999,
      img: 'laptop',
      tags: ['Premium Laptop', 'Creator'],
      specs: { RAM: '16GB', Storage: '512GB SSD' },
    },
    {
      titles: ['Apple Watch Ultra 2 GPS', 'Samsung Galaxy Watch 6 Classic', 'boAt Wave Sigma Smartwatch'],
      brand: 'Apple',
      brandId: 'apple',
      basePrice: 5999,
      mrp: 8999,
      img: 'smartwatch',
      tags: ['Smartwatch', 'Fitness Tracker'],
      specs: { Battery: '18-Hour Battery Life' },
    },
    {
      titles: ['Sony WH-1000XM5 ANC Over-Ear Headphones', 'boAt Rockerz 450 Pro Wireless Headphone'],
      brand: 'Sony',
      brandId: 'sony',
      basePrice: 14999,
      mrp: 24999,
      img: 'headphone',
      tags: ['ANC', 'Over-Ear'],
      specs: { ANC: '30-Hour Playtime' },
    },
  ],
  beauty: [
    {
      titles: ['Minimalist 10% Niacinamide Face Serum', 'Korean Rice Water Brightening Serum', 'SPF 50 PA++++ Dewy Sunscreen Gel'],
      brand: 'Minimalist',
      brandId: 'minimalist',
      basePrice: 599,
      mrp: 699,
      img: 'serum',
      tags: ['K-Beauty Glow', 'Skincare'],
      specs: { SkinType: 'All Skin Types' },
    },
    {
      titles: ['Hydrating Velvet Matte Tinted Lipstick', 'Longwear Berry Red Lip Tint', 'Nude Pink Glossy Lip Butter'],
      brand: 'Sugar Cosmetics',
      brandId: 'sugar',
      basePrice: 499,
      mrp: 799,
      img: 'lipstick',
      tags: ['Velvet Matte', 'Lipstick'],
      specs: { Finish: 'Matte' },
    },
    {
      titles: ['Foaming Korean Cleanser Face Wash', 'Deep Pore Cleansing Salicylic Face Wash', 'CeraVe Hydrating Gentle Face Wash'],
      brand: 'CeraVe',
      brandId: 'cerave',
      basePrice: 399,
      mrp: 599,
      img: 'facewash',
      tags: ['Cleanser', 'Skincare'],
      specs: { Type: 'Foaming Cleanser' },
    },
    {
      titles: ['Luxury Oud Attar Perfume 50ml', 'Victoria Secret Bombshell Fragrance', 'Davidoff Cool Water EDT'],
      brand: 'Davidoff',
      brandId: 'davidoff',
      basePrice: 799,
      mrp: 1499,
      img: 'perfume',
      tags: ['Fragrance', 'Luxury'],
      specs: { Volume: '50ml' },
    },
    {
      titles: ['La Roche-Posay Daily Moisturiser SPF', 'CeraVe AM Facial Moisturising Lotion', 'Neutrogena Hydro Boost Water Gel'],
      brand: 'La Roche-Posay',
      brandId: 'laroche',
      basePrice: 899,
      mrp: 1299,
      img: 'moisturizer',
      tags: ['Moisturizer', 'Hydration'],
      specs: { SPF: 'SPF 30' },
    },
  ],
  quickbuy: [
    {
      titles: ['Fresh Pasteurised Full Cream Milk 1L', 'Organic A2 Cow Milk Pouch 500ml'],
      brand: 'Amul',
      brandId: 'amul',
      basePrice: 66,
      mrp: 70,
      img: 'milk',
      tags: ['10-Min Delivery', 'Dairy'],
      specs: { Type: 'Pasteurised Full Cream Milk' },
    },
    {
      titles: ['Multigrain Artisan Brown Bread 400g', 'Whole Wheat Fresh Sandwich Bread Loaf'],
      brand: 'Britannia',
      brandId: 'britannia',
      basePrice: 49,
      mrp: 55,
      img: 'bread',
      tags: ['10-Min Delivery', 'Bakery'],
      specs: { Type: 'Whole Wheat' },
    },
    {
      titles: ['Farm Fresh Country Eggs Tray (12)', 'Organic Free-Range Eggs Pack (6)'],
      brand: 'Country Delight',
      brandId: 'country_delight',
      basePrice: 89,
      mrp: 99,
      img: 'egg',
      tags: ['10-Min Delivery', 'Protein'],
      specs: { Count: '12 Eggs' },
    },
    {
      titles: ['Fresh Mixed Seasonal Vegetables 500g', 'Organic Spinach & Tomato Combo Pack'],
      brand: 'Blinkit Fresh',
      brandId: 'blinkit',
      basePrice: 49,
      mrp: 69,
      img: 'vegetable',
      tags: ['10-Min Delivery', 'Fresh Produce'],
      specs: { Weight: '500g Mixed Vegetables' },
    },
  ],
  grocery: [
    {
      titles: ['Organic Roasted Chana Sattu 1kg (Patna Ground)', 'Darbhanga Grade-A Crispy Roasted Makhana 500g', 'Malabar Thin Coconut Oil Banana Chips 500g'],
      brand: 'Bihar Organics',
      brandId: 'bihar_organics',
      basePrice: 249,
      mrp: 349,
      img: 'makhana',
      tags: ['Regional Specialty', 'Pantry'],
      specs: { Grade: '100% Organic' },
    },
    {
      titles: ['Fresh Organic Seasonal Vegetables Box', 'Mixed Fruit Basket Premium 2kg'],
      brand: 'Fresho',
      brandId: 'fresho',
      basePrice: 149,
      mrp: 199,
      img: 'vegetable',
      tags: ['Farm Fresh', 'Organic'],
      specs: { Origin: 'Direct from Farm' },
    },
  ],
  hostel_essentials: [
    {
      titles: ['1.8L Multi-purpose Electric Boiling Kettle', 'Instant Rapid Boil Stainless Steel Kettle'],
      brand: 'Milton',
      brandId: 'milton',
      basePrice: 799,
      mrp: 1499,
      img: 'kettle',
      tags: ['Hostel Must-Have', 'Late Night Maggi'],
      specs: { Material: 'Stainless Steel' },
    },
    {
      titles: ['Rechargeable LED Eye-Care Study Lamp', 'USB-C Dimmable Touch Desk Reading Light'],
      brand: 'Syska',
      brandId: 'syska',
      basePrice: 499,
      mrp: 899,
      img: 'studylamp',
      tags: ['Study Lamp', 'Eye-Care'],
      specs: { Type: 'LED Eye-Care' },
    },
    {
      titles: ['Aluminium Ergonomic Adjustable Laptop Stand', 'Foldable Portable Laptop & Tablet Riser'],
      brand: 'AmazonBasics',
      brandId: 'amazon',
      basePrice: 599,
      mrp: 999,
      img: 'laptopstand',
      tags: ['Laptop Stand', 'Ergonomic'],
      specs: { Material: 'Aluminium Alloy' },
    },
    {
      titles: ['Insulated Stainless Steel Water Bottle 1L', 'Milton Thermos Flask 750ml'],
      brand: 'Milton',
      brandId: 'milton',
      basePrice: 349,
      mrp: 599,
      img: 'bottle',
      tags: ['Water Bottle', 'Insulated'],
      specs: { Capacity: '1 Litre' },
    },
  ],
  gaming: [
    {
      titles: ['PS5 DualSense Wireless Controller', 'Xbox Elite Series 2 Gaming Controller', 'Logitech G Pro X Wireless Gamepad'],
      brand: 'Sony',
      brandId: 'sony',
      basePrice: 5999,
      mrp: 7999,
      img: 'gaming',
      tags: ['Gaming Controller', 'Wireless'],
      specs: { Battery: '15-Hour Playtime' },
    },
    {
      titles: ['SteelSeries Rival 5 RGB Gaming Mouse', 'Razer DeathAdder Essential Wired Mouse', 'Logitech G102 Lightsync Gaming Mouse'],
      brand: 'SteelSeries',
      brandId: 'steelseries',
      basePrice: 1999,
      mrp: 3999,
      img: 'mouse',
      tags: ['Gaming Mouse', 'RGB'],
      specs: { DPI: '18000 DPI' },
    },
  ],
  fitness: [
    {
      titles: ['Optimum Nutrition Gold Standard 100% Whey Protein', 'MuscleBlaze Whey Gold 2kg Chocolate', 'MyProtein Impact Whey Isolate 2.5kg'],
      brand: 'Optimum Nutrition',
      brandId: 'optimum',
      basePrice: 2799,
      mrp: 4999,
      img: 'protein',
      tags: ['Protein', 'Gym Essential'],
      specs: { Protein: '24g per scoop' },
    },
  ],
  home_living: [
    {
      titles: ['IKEA LACK Coffee Table White', 'Wooden Study Desk Compact Office Table', 'Folding Multipurpose Dining Table'],
      brand: 'IKEA',
      brandId: 'ikea',
      basePrice: 2999,
      mrp: 4999,
      img: 'furniture',
      tags: ['Furniture', 'Home Essential'],
      specs: { Material: 'MDF & Wood' },
    },
    {
      titles: ['Nordic Style Rechargeable Desk Lamp', 'Touch Dimmer LED Bedside Table Lamp', 'USB Ambient Study Light'],
      brand: 'IKEA',
      brandId: 'ikea',
      basePrice: 999,
      mrp: 1799,
      img: 'lamp',
      tags: ['Desk Lamp', 'Nordic'],
      specs: { Bulb: 'LED Warm White' },
    },
  ],
  lifestyle: [
    {
      titles: ['Stanley Quencher Tumbler 40oz Insulated', 'IKEA Geometric Star Galaxy Projector Night Light', 'Aesthetic Room Setup Neon LED Strip'],
      brand: 'Stanley',
      brandId: 'stanley',
      basePrice: 1299,
      mrp: 2499,
      img: 'lifestyle',
      tags: ['Lifestyle', 'Room Decor'],
      specs: { Type: 'Insulated Tumbler' },
    },
  ],
  accessories: [
    {
      titles: ['Premium Leather Crossbody Sling Bag', 'Aesthetic Canvas Tote Bag Embroidered', 'Mini Chain Strap Evening Shoulder Bag'],
      brand: 'Lavie',
      brandId: 'lavie',
      basePrice: 999,
      mrp: 1999,
      img: 'bag',
      tags: ['Handbag', 'Fashion Accessory'],
      specs: { Material: 'PU Leather' },
    },
    {
      titles: ['Analog Minimalist Stainless Steel Watch', 'Luxury Chronograph Leather Strap Watch', 'Vintage Quartz Gold Dial Wrist Watch'],
      brand: 'Titan',
      brandId: 'titan',
      basePrice: 1799,
      mrp: 3499,
      img: 'watch',
      tags: ['Wrist Watch', 'Accessories'],
      specs: { Movement: 'Quartz' },
    },
  ],
  footwear: [
    {
      titles: ['Nike Air Force 1 White Canvas Sneakers', 'Adidas Superstar Classic Shell Toe Shoes', 'Puma RS-X Bold Retro Chunky Sneakers'],
      brand: 'Nike',
      brandId: 'nike',
      basePrice: 3499,
      mrp: 6999,
      img: 'sneaker',
      tags: ['Sneakers', 'Hype'],
      specs: { Sole: 'Rubber Air Sole' },
    },
  ],
  sports: [
    {
      titles: ['Cosco Cricket Bat English Willow Grade 1', 'Nivia Storm Football Size 5', 'Victor Thruster Badminton Racket'],
      brand: 'Cosco',
      brandId: 'cosco',
      basePrice: 799,
      mrp: 1499,
      img: 'sports',
      tags: ['Cricket', 'Sports Equipment'],
      specs: { Grade: 'Grade 1 English Willow' },
    },
  ],
  pet_care: [
    {
      titles: ['Royal Canin Adult Dog Food 3kg', 'Whiskas Ocean Fish Cat Food 1.2kg', 'Pedigree Dentastix Dog Treats'],
      brand: 'Royal Canin',
      brandId: 'royal_canin',
      basePrice: 999,
      mrp: 1499,
      img: 'pet',
      tags: ['Pet Food', 'Vet Recommended'],
      specs: { Size: '3kg Pack' },
    },
  ],
  automobile: [
    {
      titles: ['Michelin Car Tyre Pressure Monitor Kit', 'Bosch Car Jumper Starter Cable Set', 'Amaron AAA Car Battery 65AH'],
      brand: 'Bosch',
      brandId: 'bosch',
      basePrice: 1499,
      mrp: 2499,
      img: 'automobile',
      tags: ['Car Accessory', 'Safety'],
      specs: { Type: 'Universal Fit' },
    },
  ],
  baby_care: [
    {
      titles: ['Johnson Baby Gentle Tear-Free Shampoo', 'Pampers Premium Protection Diapers Size 3', 'Chicco Baby Soft Blanket Wrap'],
      brand: 'Johnson & Johnson',
      brandId: 'johnson',
      basePrice: 299,
      mrp: 499,
      img: 'baby',
      tags: ['Baby Essential', 'Gentle'],
      specs: { AgeGroup: '0-12 Months' },
    },
  ],
  health_care: [
    {
      titles: ['Omron Blood Pressure Monitor BP7100', 'Dr. Morepen Pulse Oximeter BPO-06', 'Beurer Infrared Non-Contact Thermometer'],
      brand: 'Omron',
      brandId: 'omron',
      basePrice: 1299,
      mrp: 2299,
      img: 'health',
      tags: ['Health Monitor', 'Medical Grade'],
      specs: { Type: 'Digital Monitor' },
    },
  ],
  study_office: [
    {
      titles: ['MacBook Air M2 Laptop Sleeve Case', 'ASUS 27-inch 4K IPS Monitor', 'Dell Ultrasharp 24 USB-C Hub Monitor'],
      brand: 'ASUS',
      brandId: 'asus',
      basePrice: 14999,
      mrp: 24999,
      img: 'laptop',
      tags: ['Monitor', 'Office'],
      specs: { Resolution: '4K UHD' },
    },
  ],
  gifts: [
    {
      titles: ['Cadbury Celebrations Premium Gift Box', 'Himalaya Herbals Skincare Gift Hamper', 'Luxury Scented Candle & Soap Gift Set'],
      brand: 'Cadbury',
      brandId: 'cadbury',
      basePrice: 499,
      mrp: 899,
      img: 'gifts',
      tags: ['Gift Hamper', 'Festive'],
      specs: { Occasion: 'Birthday / Anniversary' },
    },
  ],
  kitchen: [
    {
      titles: ['Prestige Stainless Steel Pressure Cooker 5L', 'Philips Oven Toaster Griller 25L', 'Pigeon Induction Cooktop 1800W'],
      brand: 'Prestige',
      brandId: 'prestige',
      basePrice: 1499,
      mrp: 2499,
      img: 'kitchen',
      tags: ['Kitchen Appliance', 'Cooking'],
      specs: { Wattage: '1800W' },
    },
  ],
};

// Title keyword → image pool mapping for strict matching
const KEYWORD_TO_POOL: Array<[string, keyof typeof IMG]> = [
  ['iphone', 'iphone'],
  ['galaxy', 'galaxy'],
  ['samsung', 'galaxy'],
  ['nothing phone', 'nothing'],
  ['macbook', 'laptop'],
  ['laptop', 'laptop'],
  ['earbuds', 'earbud'],
  ['earbud', 'earbud'],
  ['airpods', 'earbud'],
  ['headphone', 'headphone'],
  ['over-ear', 'headphone'],
  ['keyboard', 'keyboard'],
  ['mouse', 'mouse'],
  ['smartwatch', 'smartwatch'],
  ['galaxy watch', 'smartwatch'],
  ['apple watch', 'smartwatch'],
  ['phone', 'phone'],
  ['smartphone', 'phone'],
  ['5g', 'phone'],
  ['jeans', 'jeans'],
  ['denim', 'jeans'],
  ['cargo', 'cargo'],
  ['tee', 'tee'],
  ['shirt', 'tee'],
  ['hoodie', 'hoodie'],
  ['sweatshirt', 'hoodie'],
  ['sneaker', 'sneaker'],
  ['shoe', 'sneaker'],
  ['kicks', 'sneaker'],
  ['dress', 'dress'],
  ['coord', 'dress'],
  ['bag', 'bag'],
  ['handbag', 'bag'],
  ['backpack', 'bag'],
  ['watch', 'watch'],
  ['serum', 'serum'],
  ['niacinamide', 'serum'],
  ['sunscreen', 'moisturizer'],
  ['moisturizer', 'moisturizer'],
  ['moisturiser', 'moisturizer'],
  ['face wash', 'facewash'],
  ['cleanser', 'facewash'],
  ['foaming', 'facewash'],
  ['lipstick', 'lipstick'],
  ['lip tint', 'lipstick'],
  ['lip butter', 'lipstick'],
  ['perfume', 'perfume'],
  ['fragrance', 'perfume'],
  ['cologne', 'perfume'],
  ['attar', 'perfume'],
  ['milk', 'milk'],
  ['dairy', 'milk'],
  ['bread', 'bread'],
  ['loaf', 'bread'],
  ['bakery', 'bread'],
  ['egg', 'egg'],
  ['makhana', 'makhana'],
  ['sattu', 'makhana'],
  ['chips', 'makhana'],
  ['snack', 'makhana'],
  ['vegetable', 'vegetable'],
  ['veggie', 'vegetable'],
  ['fruit', 'vegetable'],
  ['spinach', 'vegetable'],
  ['tomato', 'vegetable'],
  ['kettle', 'kettle'],
  ['boiling kettle', 'kettle'],
  ['study lamp', 'studylamp'],
  ['desk lamp', 'studylamp'],
  ['reading light', 'studylamp'],
  ['laptop stand', 'laptopstand'],
  ['table stand', 'laptopstand'],
  ['water bottle', 'bottle'],
  ['flask', 'bottle'],
  ['thermos', 'bottle'],
  ['lamp', 'lamp'],
  ['table lamp', 'lamp'],
  ['protein', 'protein'],
  ['whey', 'protein'],
  ['creatine', 'protein'],
  ['supplement', 'protein'],
  ['gaming', 'gaming'],
  ['controller', 'gaming'],
  ['gamepad', 'gaming'],
  ['furniture', 'furniture'],
  ['table', 'furniture'],
  ['chair', 'furniture'],
  ['desk', 'furniture'],
  ['sofa', 'furniture'],
  ['sports', 'sports'],
  ['cricket', 'sports'],
  ['football', 'sports'],
  ['badminton', 'sports'],
  ['pet', 'pet'],
  ['dog food', 'pet'],
  ['cat food', 'pet'],
  ['car', 'automobile'],
  ['tyre', 'automobile'],
  ['battery', 'automobile'],
  ['baby', 'baby'],
  ['diaper', 'baby'],
  ['shampoo', 'baby'],
  ['health', 'health'],
  ['thermometer', 'health'],
  ['oximeter', 'health'],
  ['blood pressure', 'health'],
  ['gift', 'gifts'],
  ['hamper', 'gifts'],
  ['celebration', 'gifts'],
  ['kitchen', 'kitchen'],
  ['cooker', 'kitchen'],
  ['induction', 'kitchen'],
  ['griller', 'kitchen'],
];

// Helper to generate full catalog programmatically (~4500 products) with STRICT category alignment
export function generateFullIndianCatalog(): ProductItem[] {
  const products: ProductItem[] = [];
  let idCounter = 1000;

  for (let sIdx = 0; sIdx < INDIAN_STATES_AND_UTS.length; sIdx++) {
    const state = INDIAN_STATES_AND_UTS[sIdx];
    const cities = state.popularCities;

    for (let cIdx = 0; cIdx < PRODUCT_CATEGORIES.length; cIdx++) {
      const category = PRODUCT_CATEGORIES[cIdx];
      const subs = SUBCATEGORIES_MAP[category.id] || [
        { id: `${category.id}_general`, name: `${category.name} Essentials`, icon: category.icon }
      ];

      // Select ONLY templates matching the current category
      const pool = CATEGORY_PRODUCT_TEMPLATES[category.id] || CATEGORY_PRODUCT_TEMPLATES.fashion;
      const targetCount = 6;

      for (let pIdx = 0; pIdx < targetCount; pIdx++) {
        idCounter++;
        const template = pool[(sIdx + pIdx) % pool.length];
        const sub = subs[pIdx % subs.length];
        const city = cities[pIdx % cities.length];

        const productId = `prod_${state.id.toLowerCase()}_${category.id}_${idCounter}`;
        const rawTitle = template.titles[pIdx % template.titles.length] || `${state.name} Special ${sub.name}`;
        const title = sIdx % 4 === 0 ? `${rawTitle} (${state.name} Edition)` : rawTitle;

        const priceVar = ((sIdx * 17 + pIdx * 23) % 200) - 100;
        const finalPrice = Math.max(149, template.basePrice + priceVar);
        const finalMrp = Math.max(finalPrice + 200, Math.round(finalPrice * 1.4));
        const discountPct = Math.round(((finalMrp - finalPrice) / finalMrp) * 100);

        const rating = parseFloat((4.0 + ((sIdx + pIdx) % 10) * 0.1).toFixed(1));
        const reviewCount = 85 + ((sIdx * 37 + pIdx * 89) % 3400);

        const isQuickDelivery = category.id === 'quickbuy' || pIdx % 2 === 0;
        const deliveryMinutes = isQuickDelivery ? (10 + (pIdx % 10)) : (25 + (pIdx % 30));

        const isTrending = pIdx % 3 === 0;
        const isBestSeller = pIdx % 4 === 0;
        const isNewArrival = pIdx % 5 === 0;

        // ─── SMART UNIQUE IMAGE PICKER ───
        // 1) Try strict keyword match against title
        const lowTitle = title.toLowerCase();
        let matchedPool: string[] | null = null;
        for (const [kw, poolKey] of KEYWORD_TO_POOL) {
          if (lowTitle.includes(kw)) {
            matchedPool = IMG[poolKey] || null;
            break;
          }
        }
        // 2) Fallback to template img pool key (set in templates as string key)
        if (!matchedPool && template.img in IMG) {
          matchedPool = IMG[template.img as keyof typeof IMG];
        }
        // 3) Fallback to category-level pool
        if (!matchedPool) {
          matchedPool = CATEGORY_IMG_POOLS[category.id] || IMG.jeans;
        }
        const mainImg = pickImg(matchedPool, sIdx, pIdx);

        // Generate 4 unique images: different angles/variants from same category pool
        const img2 = pickImg(matchedPool, sIdx + 3, pIdx + 1);
        const img3 = pickImg(matchedPool, sIdx + 7, pIdx + 2);
        const img4 = pickImg(matchedPool, sIdx + 11, pIdx + 3);
        const images = [mainImg, img2, img3, img4];

        const prodObj: ProductItem = {
          productId,
          id: productId,
          title,
          name: title,
          shortTitle: title.split('(')[0].trim(),
          description: `Premium grade ${sub.name} delivered superfast in ${city}, ${state.name}. Features authentic build, original manufacturer warranty, and 100% genuine quality inspection.`,
          shortDescription: `Top rated ${sub.name} available in ${city}.`,
          longDescription: `Experience the best ${sub.name} tailored for ${state.name} lifestyle. Sourced directly from verified distributors with instant delivery option in ${deliveryMinutes} minutes. Includes full return protection and cash on delivery.`,
          brand: template.brand || 'EasyBuy Select',
          brandId: template.brandId || 'easybuy',

          categoryId: category.id,
          categoryName: category.name,
          subcategoryId: sub.id,
          subcategoryName: sub.name,

          stateId: state.id,
          stateName: state.name,
          city: city,
          locality: `${city} Central`,

          price: finalPrice,
          priceNumber: finalPrice,
          originalPrice: finalMrp,
          mrp: finalMrp,
          originalPriceNumber: finalMrp,
          discountPercentage: discountPct,
          discountPct: `${discountPct}%`,

          rating,
          ratingString: String(rating),
          reviewCount,

          stock: 45 + ((sIdx + pIdx * 12) % 200),
          availability: 'In Stock',
          stockStatus: 'In Stock',

          images,
          thumbnail: mainImg,
          image: mainImg,

          isTrending,
          isBestSeller,
          isBestseller: isBestSeller,
          isNewArrival,
          isLimitedOffer: pIdx % 3 === 1,
          isFeatured: pIdx % 2 === 0,
          isQuickDelivery,
          isRecommended: pIdx % 2 === 0,
          offerBadge: discountPct > 35 ? `SAVE ${discountPct}%` : 'HOT DEAL',
          wishlistSupported: true,
          availableQuantity: 50,

          deliveryMinutes,
          deliveryTime: `${deliveryMinutes} mins`,

          trendingScore: 85 + (pIdx % 15),
          popularityScore: 900 + (reviewCount % 100),
          salesCount: reviewCount * 3,
          wishlistCount: Math.round(reviewCount * 1.5),
          views: reviewCount * 12,

          searchKeywords: [
            title.toLowerCase(),
            sub.name.toLowerCase(),
            category.name.toLowerCase(),
            state.name.toLowerCase(),
            city.toLowerCase(),
            template.brand.toLowerCase(),
          ],
          tags: [...template.tags, state.name, 'Express Delivery'],

          season: 'All-Season',
          gender: 'Unisex',
          ageGroup: 'Gen-Z',
          bestFor: ['Daily Use', 'College', 'Gifting', 'Hostel'],
          features: [
            '100% Genuine Certified Product',
            'Superfast Express Delivery Available',
            '7 Days Easy Replacement Warranty',
            'Cash on Delivery Supported',
          ],
          specifications: (template.specs || { Quality: 'Grade A Original', Origin: 'Made in India' }) as Record<string, string>,

          colors: (template as any).colors ? (template as any).colors.map((c: string, i: number) => ({ id: `c_${i}`, name: c })) : [],
          sizes: (template as any).sizes ? (template as any).sizes.map((s: string, i: number) => ({ id: `s_${i}`, name: s })) : [],

          similarProducts: [
            `prod_${state.id.toLowerCase()}_${category.id}_${idCounter + 1}`,
            `prod_${state.id.toLowerCase()}_${category.id}_${idCounter + 2}`,
          ],
          recommendedProducts: [
            `prod_${state.id.toLowerCase()}_${category.id}_${idCounter - 1}`,
          ],
          bundleProducts: [
            `prod_${state.id.toLowerCase()}_${category.id}_${idCounter + 3}`,
          ],

          warranty: '1 Year Brand Replacement Warranty',
          returnPolicy: '7 Days Return & Instant Refund',
          seller: `${state.name} Official Retail Hub`,
          sellerRating: 4.8,
          deliveryPartner: 'EasyBuy Express Logistics',
          cashOnDelivery: true,
          emiAvailable: finalPrice > 3000,
          arAvailable: category.id === 'fashion' || category.id === 'electronics',
          videoAvailable: true,
        };

        products.push(prodObj);
      }
    }
  }

  return products;
}
