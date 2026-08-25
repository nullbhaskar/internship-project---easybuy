export interface CuratedBundleItem {
  id: string;
  title: string;
  price: string;
  priceNum: number;
  originalPrice: string;
  image: string;
  category: string;
}

export interface CuratedBundleInfo {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  price: string;
  oldPrice: string;
  avatar1: string;
  avatar2: string;
  badge: string;
  items: CuratedBundleItem[];
}

export const ALL_CURATED_BUNDLES: CuratedBundleInfo[] = [
  {
    id: 'jan_winter',
    tag: 'WINTER CHILL',
    title: 'Cozy Morning Essentials',
    subtitle: 'Beat the fog with hot coffee and warm snacks.',
    price: '₹599', oldPrice: '₹899',
    avatar1: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=100&q=80',
    badge: '+3',
    items: [ { id: 'gro-2', title: 'Tata Tea Gold', price: '₹140', priceNum: 140, originalPrice: '₹150', image: 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=400&q=80', category: 'Grocery' } ]
  },
  {
    id: 'feb_valentines',
    tag: 'VALENTINES SPECIAL',
    title: 'Last-Minute Date Night',
    subtitle: 'Gourmet chocolates & ambiance.',
    price: '₹1299', oldPrice: '₹1899',
    avatar1: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=100&q=80',
    badge: '+2',
    items: [ { id: 'gro-6', title: 'Ferrero Rocher', price: '₹499', priceNum: 499, originalPrice: '₹600', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80', category: 'Grocery' } ]
  },
  {
    id: 'mar_holi',
    tag: 'HOLI HAI!',
    title: 'Color & Care Kit',
    subtitle: 'Organic colors and skin protection.',
    price: '₹450', oldPrice: '₹650',
    avatar1: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&q=80',
    badge: '+4',
    items: [ { id: 'bty-3', title: 'Vitamin C Serum', price: '₹599', priceNum: 599, originalPrice: '₹799', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', category: 'Beauty & Personal Care' } ]
  },
  {
    id: 'apr_summer',
    tag: 'BEAT THE HEAT',
    title: 'Hydration Station',
    subtitle: 'Cold drinks and refreshing snacks.',
    price: '₹349', oldPrice: '₹499',
    avatar1: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=100&q=80',
    badge: '+3',
    items: [ { id: 'gro-7', title: 'Red Bull Energy Drink', price: '₹125', priceNum: 125, originalPrice: '₹125', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&q=80', category: 'Grocery' } ]
  },
  {
    id: 'may_ipl',
    tag: 'MATCH DAY FEVER',
    title: 'Stadium Snacks Combo',
    subtitle: 'The perfect binge kit for the final overs.',
    price: '₹699', oldPrice: '₹999',
    avatar1: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=100&q=80',
    badge: '+5',
    items: [ { id: 'gro-8', title: 'Lays Magic Masala', price: '₹20', priceNum: 20, originalPrice: '₹20', image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&q=80', category: 'Grocery' } ]
  },
  {
    id: 'jun_college',
    tag: 'COLLEGE READY',
    title: 'Hostel Starter Pack',
    subtitle: 'Maggi, coffee, and late-night survival gear.',
    price: '₹299', oldPrice: '₹450',
    avatar1: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1585238341267-1cb188e4ceb1?w=100&q=80',
    badge: '+4',
    items: [ { id: 'gro-1', title: 'Maggi 2-Minute Noodles', price: '₹14', priceNum: 14, originalPrice: '₹14', image: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&q=80', category: 'Grocery' } ]
  },
  {
    id: 'jul_monsoon',
    tag: 'MONSOON MAGIC',
    title: 'Chai & Pakoda Kit',
    subtitle: 'Enjoy the Delhi rains without stepping out.',
    price: '₹249', oldPrice: '₹350',
    avatar1: 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1596450514735-111a2fe02935?w=100&q=80',
    badge: '+3',
    items: [ { id: 'gro-2', title: 'Tata Tea Gold', price: '₹140', priceNum: 140, originalPrice: '₹150', image: 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=400&q=80', category: 'Grocery' } ]
  },
  {
    id: 'aug_rakhi',
    tag: 'FESTIVE AUGUST',
    title: 'Rakhi Sweets & Gifts',
    subtitle: 'Premium chocolates and sibling love.',
    price: '₹899', oldPrice: '₹1200',
    avatar1: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1605807616928-51909a8fb927?w=100&q=80',
    badge: '+4',
    items: [ { id: 'gro-6', title: 'Ferrero Rocher', price: '₹499', priceNum: 499, originalPrice: '₹600', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80', category: 'Grocery' } ]
  },
  {
    id: 'sep_tech',
    tag: 'TECH UPGRADE',
    title: 'Gadget Refresh',
    subtitle: 'Earbuds, powerbanks and more in 10 mins.',
    price: '₹3499', oldPrice: '₹4999',
    avatar1: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&q=80',
    badge: '+2',
    items: [ { id: 'elec-2', title: 'Sony WH-1000XM5', price: '₹24990', priceNum: 24990, originalPrice: '₹29990', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80', category: 'Electronics & Tech' } ]
  },
  {
    id: 'oct_diwali',
    tag: 'DIWALI MEGA-FEST',
    title: 'The Ultimate Festive Hamper',
    subtitle: 'Everything you need to light up the night.',
    price: '₹1499', oldPrice: '₹1999',
    avatar1: 'https://images.unsplash.com/photo-1572973163351-4601138db5d8?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1582283084714-9988117d91e6?w=100&q=80',
    badge: '+3',
    items: [ { id: 'gro-5', title: 'Aashirvaad Atta', price: '₹220', priceNum: 220, originalPrice: '₹250', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', category: 'Grocery' } ]
  },
  {
    id: 'nov_detox',
    tag: 'HEALTH & DETOX',
    title: 'Clean Eating Kit',
    subtitle: 'Oats, green tea, and healthy snacks.',
    price: '₹599', oldPrice: '₹899',
    avatar1: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&q=80',
    badge: '+4',
    items: [ { id: 'bty-3', title: 'Vitamin C Serum', price: '₹599', priceNum: 599, originalPrice: '₹799', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', category: 'Beauty & Personal Care' } ]
  },
  {
    id: 'dec_party',
    tag: 'PARTY SEASON',
    title: 'House Party Essentials',
    subtitle: 'Snacks, cold drinks, and speaker vibes.',
    price: '₹1299', oldPrice: '₹1800',
    avatar1: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=100&q=80',
    badge: '+5',
    items: [ { id: 'gro-7', title: 'Red Bull Energy Drink', price: '₹125', priceNum: 125, originalPrice: '₹125', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&q=80', category: 'Grocery' } ]
  },
  {
    id: 'wknd_movie',
    tag: 'WEEKEND VIBES',
    title: 'Netflix & Chill Kit',
    subtitle: 'Popcorn, nachos, and cold beverages.',
    price: '₹450', oldPrice: '₹600',
    avatar1: 'https://images.unsplash.com/photo-1572177292271-fc4c46f6e8cc?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1582283084714-9988117d91e6?w=100&q=80',
    badge: '+4',
    items: [ { id: 'gro-8', title: 'Lays Magic Masala', price: '₹20', priceNum: 20, originalPrice: '₹20', image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&q=80', category: 'Grocery' } ]
  },
  {
    id: 'late_night',
    tag: 'MIDNIGHT CRAVINGS',
    title: 'The All-Nighter',
    subtitle: 'Maggi, coffee, and energy drinks.',
    price: '₹299', oldPrice: '₹450',
    avatar1: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=100&q=80',
    badge: '+3',
    items: [ { id: 'gro-1', title: 'Maggi 2-Minute Noodles', price: '₹14', priceNum: 14, originalPrice: '₹14', image: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&q=80', category: 'Grocery' } ]
  },
  {
    id: 'morning_rush',
    tag: 'MORNING RUSH',
    title: 'Instant Breakfast',
    subtitle: 'Eggs, bread, milk, and coffee.',
    price: '₹199', oldPrice: '₹250',
    avatar1: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&q=80',
    badge: '+4',
    items: [ { id: 'gro-2', title: 'Tata Tea Gold', price: '₹140', priceNum: 140, originalPrice: '₹150', image: 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=400&q=80', category: 'Grocery' } ]
  }
];

export function getSmartDynamicBundle(overrideIndex?: number): CuratedBundleInfo {
  if (overrideIndex !== undefined && overrideIndex > 0) {
    return ALL_CURATED_BUNDLES[overrideIndex % ALL_CURATED_BUNDLES.length];
  }

  const date = new Date();
  const month = date.getMonth(); 
  const hour = date.getHours();
  const day = date.getDay(); 

  if (hour >= 22 || hour < 4) return ALL_CURATED_BUNDLES.find(b => b.id === 'late_night')!;
  if (hour >= 6 && hour < 11) return ALL_CURATED_BUNDLES.find(b => b.id === 'morning_rush')!;
  if (day === 0 || day === 6) return ALL_CURATED_BUNDLES.find(b => b.id === 'wknd_movie')!;

  return ALL_CURATED_BUNDLES[month] || ALL_CURATED_BUNDLES[7]; 
}
