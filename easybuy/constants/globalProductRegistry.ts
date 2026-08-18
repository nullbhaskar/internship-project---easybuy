import { generateFullIndianCatalog } from './catalogGenerator';

export interface SpecItem {
  icon: string;
  title: string;
  sub: string;
}

export interface VariantOption {
  id: string;
  name: string;
  image?: string;
  icon?: string;
  hex?: string;
}

export interface FeatureCardItem {
  icon: string;
  title: string;
  sub: string;
  fullWidth?: boolean;
}

export interface ProductData {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  editionBadge: string;
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
  featureCards: FeatureCardItem[];
  applicationProtocol: string;
  ingredientsProfile: string;
  reviewQuote: string;
  reviewAuthor: string;
  features: { icon: string; title: string }[];
  aboutText: string;
  aboutImage: string;
  couponCode: string;
  couponDesc: string;
  accordionLabel1: string;
  accordionLabel2: string;
  relatedArsenal: Array<{
    id: string;
    title: string;
    price: string;
    image: string;
    category: string;
  }>;
}

// ─── UNIVERSAL IN-MEMORY PRODUCT REGISTRY ───
const GLOBAL_PRODUCT_MAP = new Map<string, Partial<ProductData> & { [key: string]: any }>();

/**
 * Register any raw product object or list into the universal lookup registry
 */
export function registerProducts(products: any[]) {
  if (!Array.isArray(products)) return;
  for (const p of products) {
    if (p && (p.id || p.productId)) {
      const key = String(p.id || p.productId);
      GLOBAL_PRODUCT_MAP.set(key, p);
    }
  }
}

export function registerProduct(product: any) {
  if (product && (product.id || product.productId)) {
    const key = String(product.id || product.productId);
    GLOBAL_PRODUCT_MAP.set(key, product);
  }
}

// Pre-populate with catalog
try {
  const catalog = generateFullIndianCatalog();
  if (Array.isArray(catalog)) {
    catalog.forEach((p: any) => {
      if (p.id) GLOBAL_PRODUCT_MAP.set(String(p.id), { ...p, rating: String(p.rating || '4.8') } as any);
    });
  }
} catch (e) {
  console.log('Error initializing catalog in globalProductRegistry:', e);
}

// Pre-populate known static & regional items across app
const KNOWN_STATIC_PRODUCTS: any[] = [
  // Patna / Default Regional Items
  {
    id: 'ptn-1',
    title: 'Casual Breathable Printed Cotton Linen Shirt',
    name: 'Casual Breathable Printed Cotton Linen Shirt',
    price: '₹1,199',
    priceNum: 1199,
    originalPrice: '₹1,699',
    originalPriceNum: 1699,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    tag: 'Patna Menswear',
    categoryName: 'Menswear',
    brand: 'EasyBuy Urban',
    description: 'Crafted from 100% pure organic cotton-linen blend. Features a slim tailored fit, breathable weave for humid climates, and vintage button closure.',
  },
  {
    id: 'ptn-2',
    title: 'Classic Woolen Tweed Blazer Overcoat',
    name: 'Classic Woolen Tweed Blazer Overcoat',
    price: '₹3,499',
    priceNum: 3499,
    originalPrice: '₹4,599',
    originalPriceNum: 4599,
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80',
    tag: 'Patna Menswear',
    categoryName: 'Menswear',
    brand: 'Heritage Tailors',
    description: 'Double-breasted heavyweight woolen tweed blazer with silk interior lining. Designed for autumn & winter sophistication.',
  },
  {
    id: 'ptn-3',
    title: 'Obsidian Chronograph Leather Strap Watch',
    name: 'Obsidian Chronograph Leather Strap Watch',
    price: '₹1,899',
    priceNum: 1899,
    originalPrice: '₹2,499',
    originalPriceNum: 2499,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    tag: 'Patna Luxury Watch',
    categoryName: 'Watches & Accessories',
    brand: 'Chronos Luxe',
    description: 'Precision Japanese quartz movement chronograph featuring genuine full-grain leather strap, 5ATM water resistance, and scratch-proof sapphire crystal.',
  },
  {
    id: 'ptn-4',
    title: 'Handloom Chanderi Cotton Kurti & Dupatta Set',
    name: 'Handloom Chanderi Cotton Kurti & Dupatta Set',
    price: '₹1,499',
    priceNum: 1499,
    originalPrice: '₹1,999',
    originalPriceNum: 1999,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    tag: 'Patna Womens Heritage',
    categoryName: 'Ethnic Wear',
    brand: 'Heritage Handlooms',
    description: 'Authentic Chanderi tissue-cotton weave handcrafted by master weavers. Accompanied by embroidered sheer dupatta and gold zari highlights.',
  },
  {
    id: 'ptn-5',
    title: 'Polarized Vintage Square Aviator Sunglasses',
    name: 'Polarized Vintage Square Aviator Sunglasses',
    price: '₹1,199',
    priceNum: 1199,
    originalPrice: '₹1,699',
    originalPriceNum: 1699,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    tag: 'Patna Mens Eyewear',
    categoryName: 'Eyewear',
    brand: 'Solitaire Optix',
    description: 'UV400 anti-glare polarized lenses encased in ultra-light titanium alloy frame. Ergonomic silicone nose pads for all-day outdoor comfort.',
  },
  {
    id: 'ptn-6',
    title: 'Relaxed Fit Multi-Pocket Cargo Denim Jeans',
    name: 'Relaxed Fit Multi-Pocket Cargo Denim Jeans',
    price: '₹1,699',
    priceNum: 1699,
    originalPrice: '₹2,299',
    originalPriceNum: 2299,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    tag: 'Patna Mens Streetwear',
    categoryName: 'Bottomwear',
    brand: 'Urban Denim Co.',
    description: 'Heavy 14oz ring-spun denim with utility side cargo pockets, reinforced knee panels, and vintage enzyme stone wash.',
  },
  {
    id: 'ptn-7',
    title: 'Handcrafted Full-Grain Leather Mojari Shoes',
    name: 'Handcrafted Full-Grain Leather Mojari Shoes',
    price: '₹1,299',
    priceNum: 1299,
    originalPrice: '₹1,799',
    originalPriceNum: 1799,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
    tag: 'Patna Mens Footwear',
    categoryName: 'Footwear',
    brand: 'Artisanal Craft',
    description: 'Traditional Jutti shoes made with vegetable-tanned full-grain leather, padded memory foam footbed, and hand-stitched leather sole.',
  },
  {
    id: 'ptn-8',
    title: 'Handloom Bhagalpuri Tussar Silk Saree',
    name: 'Handloom Bhagalpuri Tussar Silk Saree',
    price: '₹2,799',
    priceNum: 2799,
    originalPrice: '₹3,599',
    originalPriceNum: 3599,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    tag: 'Patna Silk Classic',
    categoryName: 'Silk Sarees',
    brand: 'Bhagalpur Heritage',
    description: '100% Certified pure wild Tussar Silk sourced directly from Bhagalpur weavers. Naturally breathable texture with metallic zari border.',
  },
  {
    id: 'ptn-9',
    title: 'Heavyweight Oversized Streetwear Hoodie',
    name: 'Heavyweight Oversized Streetwear Hoodie',
    price: '₹1,899',
    priceNum: 1899,
    originalPrice: '₹2,499',
    originalPriceNum: 2499,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    tag: 'Patna Urban Hoodie',
    categoryName: 'Streetwear',
    brand: 'Vibe Culture',
    description: '450 GSM French Terry cotton hoodie with dropped shoulders, double-lined hood, and high-density chest embroidery.',
  },
  {
    id: 'ptn-10',
    title: 'Charcoal Beard & Facial Grooming Kit',
    name: 'Charcoal Beard & Facial Grooming Kit',
    price: '₹799',
    priceNum: 799,
    originalPrice: '₹1,199',
    originalPriceNum: 1199,
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80',
    tag: 'Patna Mens Grooming',
    categoryName: 'Grooming',
    brand: 'Luxe Grooming',
    description: 'Complete 4-piece grooming set: Activated Charcoal Beard Wash, Cedarwood Beard Oil, Natural Wood Beard Comb, and Face Scrub.',
  },
  {
    id: 'ptn-11',
    title: 'Mithila Peri Peri Roasted Makhana (200g)',
    name: 'Mithila Peri Peri Roasted Makhana (200g)',
    price: '₹199',
    priceNum: 199,
    originalPrice: '₹280',
    originalPriceNum: 280,
    image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?w=600&auto=format&fit=crop&q=80',
    tag: 'QuickBuy Snack',
    categoryName: 'Snacks & Pantry',
    brand: 'Mithila Harvest',
    description: 'Hand-picked jumbo fox nuts slow roasted in olive oil and tossed with authentic African Peri Peri spice blend. 0% Trans Fat.',
  },
  {
    id: 'ptn-12',
    title: 'Organic Roasted Bihar Chana Sattu Flour',
    name: 'Organic Roasted Bihar Chana Sattu Flour',
    price: '₹149',
    priceNum: 149,
    originalPrice: '₹199',
    originalPriceNum: 199,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    tag: 'QuickBuy Superfood',
    categoryName: 'Superfoods',
    brand: 'Desi Organics',
    description: 'Stone-ground roasted Bengal gram flour rich in plant protein, dietary fiber, and natural cooling minerals.',
  },
  {
    id: 'ptn-13',
    title: 'Silk Matte Lip Crayon (Dusty Rose)',
    name: 'Silk Matte Lip Crayon (Dusty Rose)',
    price: '₹599',
    priceNum: 599,
    originalPrice: '₹849',
    originalPriceNum: 849,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
    tag: 'Regional Beauty',
    categoryName: 'Cosmetics',
    brand: 'Glow Couture',
    description: 'Hydrating matte lipstick enriched with Jojoba Oil and Vitamin E. 12-hour smudge-proof transfer-resistant formula.',
  },
  {
    id: 'ptn-14',
    title: 'Authentic Tilkut & Gur Anarsa Sweet Box',
    name: 'Authentic Tilkut & Gur Anarsa Sweet Box',
    price: '₹249',
    priceNum: 249,
    originalPrice: '₹320',
    originalPriceNum: 320,
    image: 'https://images.unsplash.com/photo-1582176647440-3b137b3156e3?w=600&auto=format&fit=crop&q=80',
    tag: 'Regional Sweet',
    categoryName: 'Gourmet Sweets',
    brand: 'Gaya Sweets',
    description: 'Traditional winter delicacy made from roasted white sesame seeds, organic jaggery, and cardamom. Freshly packed daily.',
  },
  {
    id: 'ptn-15',
    title: 'Kesar & Sandalwood Radiance Face Glow Oil',
    name: 'Kesar & Sandalwood Radiance Face Glow Oil',
    price: '₹649',
    priceNum: 649,
    originalPrice: '₹899',
    originalPriceNum: 899,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
    tag: 'Ayurvedic Skincare',
    categoryName: 'Skincare',
    brand: 'Veda Organics',
    description: 'Ayurvedic Kumkumadi elixir infused with Kashmiri Saffron strand extracts, Pure Sandalwood Oil, and Goat Milk for radiant skin glow.',
  },
  {
    id: 'ptn-16',
    title: 'Handcrafted Oxidized Silver Hoop Jhumkas',
    name: 'Handcrafted Oxidized Silver Hoop Jhumkas',
    price: '₹549',
    priceNum: 549,
    originalPrice: '₹799',
    originalPriceNum: 799,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
    tag: 'Jewelry',
    categoryName: 'Jewelry',
    brand: 'Tribal Jewels',
    description: 'German silver tribal jhumka earrings featuring intricate ghungroo drops, nickel-free hypoallergenic plating, and vintage antique polish.',
  },
  {
    id: 'ptn-17',
    title: 'Retro Full-Grain Leather Court Sneakers',
    name: 'Retro Full-Grain Leather Court Sneakers',
    price: '₹2,499',
    priceNum: 2499,
    originalPrice: '₹3,299',
    originalPriceNum: 3299,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    tag: 'Mens Kicks',
    categoryName: 'Sneakers',
    brand: 'Courtside Retro',
    description: 'Minimalist low-top sneakers crafted with premium Italian full-grain leather, OrthoLite cushioned insoles, and durable vulcanized rubber soles.',
  },
  {
    id: 'ptn-18',
    title: 'Single-Origin Chikmagalur Dark Roast Coffee',
    name: 'Single-Origin Chikmagalur Dark Roast Coffee',
    price: '₹450',
    priceNum: 450,
    originalPrice: '₹590',
    originalPriceNum: 590,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    tag: 'Gourmet Coffee',
    categoryName: 'Gourmet Brew',
    brand: 'Chikmagalur Roasters',
    description: '100% Arabica dark roast coffee beans grown at 4,500ft altitude. Bold cocoa notes, low acidity, and thick velvet crema.',
  },
];

registerProducts(KNOWN_STATIC_PRODUCTS);

/**
 * Universal lookup helper for Product Detail Screen (PDP)
 */
export function lookupProduct(id: string, params: Record<string, any> = {}): ProductData {
  const cleanId = String(id || params.id || 'default_pdp').trim();

  // Check if we have route params passed explicitly
  const paramTitle = params.title || params.name || params.productName;
  const paramPrice = params.price || params.priceNum;
  const paramImage = params.image || params.thumbnail || params.img;
  const paramCategory = params.category || params.categoryName || params.tag;
  const paramBrand = params.brand;
  const paramDesc = params.description || params.longDescription || params.aboutText;
  const paramOrigPrice = params.originalPrice || params.mrp;

  // Search in Global Map
  let matched: any = GLOBAL_PRODUCT_MAP.get(cleanId);

  // If not found in map by ID, try searching by title keyword
  if (!matched && paramTitle) {
    const titleLower = String(paramTitle).toLowerCase();
    for (const [_, item] of GLOBAL_PRODUCT_MAP.entries()) {
      if (item && (item.title || item.name) && String(item.title || item.name).toLowerCase() === titleLower) {
        matched = item;
        break;
      }
    }
  }

  // Auto-register runtime product if params are passed
  if (!matched && paramTitle) {
    matched = {
      id: cleanId,
      productId: cleanId,
      title: paramTitle,
      name: paramTitle,
      price: paramPrice,
      mrp: paramOrigPrice,
      image: paramImage,
      brand: paramBrand,
      categoryName: paramCategory,
      description: paramDesc,
    };
    GLOBAL_PRODUCT_MAP.set(cleanId, matched);
  }

  // Construct final title, price, images, brand
  const title = paramTitle || matched?.title || matched?.name || 'Luxe Specialty Product';
  
  let priceNum = 149;
  if (paramPrice) {
    priceNum = typeof paramPrice === 'number' ? paramPrice : (parseInt(String(paramPrice).replace(/[^\d]/g, ''), 10) || 149);
  } else if (matched?.priceNumber || matched?.priceNum || matched?.price) {
    const rawP = matched.priceNumber || matched.priceNum || matched.price;
    priceNum = typeof rawP === 'number' ? rawP : (parseInt(String(rawP).replace(/[^\d]/g, ''), 10) || 149);
  }

  let origPriceNum = Math.round(priceNum * 1.3);
  if (paramOrigPrice) {
    origPriceNum = typeof paramOrigPrice === 'number' ? paramOrigPrice : (parseInt(String(paramOrigPrice).replace(/[^\d]/g, ''), 10) || Math.round(priceNum * 1.3));
  } else if (matched?.mrp || matched?.originalPriceNumber || matched?.originalPriceNum || matched?.originalPrice) {
    const rawO = matched.mrp || matched.originalPriceNumber || matched.originalPriceNum || matched.originalPrice;
    origPriceNum = typeof rawO === 'number' ? rawO : (parseInt(String(rawO).replace(/[^\d]/g, ''), 10) || Math.round(priceNum * 1.3));
  }
  if (origPriceNum <= priceNum) origPriceNum = Math.round(priceNum * 1.25);

  const savings = Math.max(0, origPriceNum - priceNum);
  const discountPct = `${Math.round((savings / origPriceNum) * 100)}% OFF`;

  // Image resolution - prioritize paramImage (edited from admin or clicked card image!)
  const mainImage = paramImage || matched?.image || matched?.thumbnail || (matched?.images && matched.images[0]) || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80';
  
  let imageList: string[] = [];
  if (paramImage && typeof paramImage === 'string') {
    const existingImages = Array.isArray(matched?.images) ? matched.images : [];
    const rest = existingImages.filter((img: string) => img !== paramImage);
    imageList = [paramImage, ...rest];
  } else if (Array.isArray(matched?.images) && matched.images.length > 0) {
    imageList = matched.images;
  } else if (Array.isArray(paramImage)) {
    imageList = paramImage;
  } else {
    imageList = [mainImage];
  }

  const categoryName = paramCategory || matched?.categoryName || matched?.tag || 'Lifestyle & Fashion';
  const brand = paramBrand || matched?.brand || 'EasyBuy Originals';
  const aboutText = paramDesc || matched?.longDescription || matched?.description || matched?.aboutText || `${title} is crafted with top-tier materials and rigorous quality standards. Experience premium style, durability, and 10-15 minute doorstep delivery.`;

  // Dynamic Variants generator based on product title/category keywords
  const titleLower = title.toLowerCase();
  
  let secondaryTitle = 'SIZE';
  let secondaryVariants: VariantOption[] = [
    { id: 's1', name: 'S' },
    { id: 's2', name: 'M' },
    { id: 's3', name: 'L' },
    { id: 's4', name: 'XL' },
  ];

  let colors: VariantOption[] = [
    { id: 'c1', name: 'Obsidian Black', hex: '#0F172A' },
    { id: 'c2', name: 'Emerald Green', hex: '#15803D' },
    { id: 'c3', name: 'Amber Gold', hex: '#D97706' },
    { id: 'c4', name: 'Cream Silk', hex: '#FEF08A' },
  ];

  if (titleLower.includes('watch') || titleLower.includes('sunglasses') || titleLower.includes('eyewear')) {
    secondaryTitle = 'CASE SIZE';
    secondaryVariants = [
      { id: 'v1', name: '38mm' },
      { id: 'v2', name: '42mm' },
      { id: 'v3', name: '44mm' },
    ];
    colors = [
      { id: 'c1', name: 'Obsidian Black', hex: '#0F172A' },
      { id: 'c2', name: 'Rose Gold', hex: '#E11D48' },
      { id: 'c3', name: 'Silver Steel', hex: '#94A3B8' },
    ];
  } else if (titleLower.includes('makhana') || titleLower.includes('sattu') || titleLower.includes('coffee') || titleLower.includes('tea') || titleLower.includes('snack') || titleLower.includes('sweet') || titleLower.includes('oil')) {
    secondaryTitle = 'PACK SIZE';
    secondaryVariants = [
      { id: 'v1', name: '100g' },
      { id: 'v2', name: '250g' },
      { id: 'v3', name: '500g' },
      { id: 'v4', name: '1kg' },
    ];
    colors = [
      { id: 'c1', name: 'Original Flavor', hex: '#F59E0B' },
      { id: 'c2', name: 'Peri Peri Spice', hex: '#EF4444' },
      { id: 'c3', name: 'Sea Salt & Herbs', hex: '#10B981' },
    ];
  } else if (titleLower.includes('lipstick') || titleLower.includes('beauty') || titleLower.includes('oil') || titleLower.includes('grooming') || titleLower.includes('kohl')) {
    secondaryTitle = 'SHADE / TYPE';
    secondaryVariants = [
      { id: 'v1', name: 'Dusty Rose' },
      { id: 'v2', name: 'Ruby Velvet' },
      { id: 'v3', name: 'Nude Peach' },
    ];
    colors = [
      { id: 'c1', name: 'Dusty Rose', hex: '#BE123C' },
      { id: 'c2', name: 'Deep Crimson', hex: '#881337' },
      { id: 'c3', name: 'Coral Bronze', hex: '#B45309' },
    ];
  } else if (titleLower.includes('shoes') || titleLower.includes('mojari') || titleLower.includes('sneaker') || titleLower.includes('juttis')) {
    secondaryTitle = 'UK / IND SIZE';
    secondaryVariants = [
      { id: 'v1', name: 'UK 7' },
      { id: 'v2', name: 'UK 8' },
      { id: 'v3', name: 'UK 9' },
      { id: 'v4', name: 'UK 10' },
    ];
    colors = [
      { id: 'c1', name: 'Tan Brown', hex: '#78350F' },
      { id: 'c2', name: 'Jet Black', hex: '#0F172A' },
      { id: 'c3', name: 'Dark Mahogany', hex: '#451A03' },
    ];
  }

  // Dynamic Luxury Editorial Specs & Protocols
  let tagline = "Engineered for superior performance and daily luxury.";
  let editionBadge = "LIMITED DROP • EDITION 01";
  let accordionLabel1 = "PRODUCT DETAILS";
  let accordionLabel2 = "SPECIFICATIONS";

  let featureCards: FeatureCardItem[] = [];
  let applicationProtocol = "";
  let ingredientsProfile = "";
  let reviewQuote = "";
  let reviewAuthor = "";

  // ── HELMET / MOTORCYCLE SAFETY GEAR ──
  if (titleLower.includes('helmet') || titleLower.includes('visor') || titleLower.includes('motorcycle gear') || titleLower.includes('motorbike')) {
    editionBadge = "DOT CERTIFIED • SAFETY GRADE A";
    tagline = "Full-face protection engineered for impact absorption and all-weather aerodynamics.";
    accordionLabel1 = "SAFETY CERTIFICATION";
    accordionLabel2 = "MATERIALS & BUILD";
    featureCards = [
      {
        icon: "shield-checkmark-outline",
        title: "DOT / ISI CERTIFIED",
        sub: "Meets IS 4151 & DOT FMVSS-218 safety standards for full-face crash protection.",
        fullWidth: true,
      },
      {
        icon: "aperture-outline",
        title: "ABS SHELL",
        sub: "Injected ABS thermoplastic outer shell",
      },
      {
        icon: "sunny-outline",
        title: "UV VISOR",
        sub: "Anti-scratch UV400 clear visor",
      },
    ];
    applicationProtocol = "Inspect helmet before each ride. Ensure chin strap is firmly buckled under the jaw. Replace helmet after any impact or every 5 years. Store away from direct sunlight and fuel fumes.";
    ingredientsProfile = "Outer Shell: High-Impact ABS Thermoplastic. Inner Liner: EPS multi-density foam. Comfort Liner: Removable & washable antibacterial micro-fleece. Visor: UV400 polycarbonate anti-scratch. Ventilation: 4 front intake + 2 rear exhaust vents. Weight: ~1.35 kg.";
    reviewQuote = `"Excellent fitting and very sturdy build. The DOT certification gives real confidence on highways. The visor is crystal clear even at night."`;
    reviewAuthor = "— ROHIT S. • VERIFIED BUYER";

  // ── APPAREL: SHIRTS, JACKETS, JEANS, KURTIS ──
  } else if (titleLower.includes('shirt') || titleLower.includes('blazer') || titleLower.includes('jacket') || titleLower.includes('hoodie') || titleLower.includes('kurti') || titleLower.includes('saree') || titleLower.includes('jeans') || titleLower.includes('trouser') || titleLower.includes('kurta') || titleLower.includes('dupatta') || titleLower.includes('dress') || titleLower.includes('linen') || titleLower.includes('t-shirt') || titleLower.includes('tshirt')) {
    editionBadge = "HERITAGE CUT • EDITION 2026";
    tagline = "Tailored for effortless elegance, climate breathability, and perfect drape.";
    accordionLabel1 = "CARE INSTRUCTIONS";
    accordionLabel2 = "FABRIC COMPOSITION";
    featureCards = [
      {
        icon: "shirt-outline",
        title: "BREATHABLE WEAVE",
        sub: "100% Organic ring-spun weave engineered for maximum climate airflow.",
        fullWidth: true,
      },
      {
        icon: "cut-outline",
        title: "TAILORED FIT",
        sub: "Anatomical precision drop",
      },
      {
        icon: "shield-checkmark-outline",
        title: "PRE-SHRUNK",
        sub: "100% Color-fast retention",
      },
    ];
    applicationProtocol = "Machine wash cold (30°C) with gentle detergent. Do not bleach. Hang dry in shade to preserve organic fiber integrity. Warm iron on reverse side at medium heat if needed.";
    ingredientsProfile = "65% Organic Certified Linen, 35% Long-Staple Cotton. Buttons: Natural shell / polished resin. Stitching: Double-lock seam. Finish: Pre-shrunk, enzyme washed for softness.";
    reviewQuote = `"The fit and drape are immaculate. The fabric breathes like a dream in warm weather and feels ultra-luxurious on the skin."`;
    reviewAuthor = "— ARJUN M. • VERIFIED BUYER";

  // ── FOOTWEAR ──
  } else if (titleLower.includes('shoes') || titleLower.includes('mojari') || titleLower.includes('sneaker') || titleLower.includes('juttis') || titleLower.includes('sandal') || titleLower.includes('boot') || titleLower.includes('loafer') || titleLower.includes('slipper') || titleLower.includes('chappal')) {
    editionBadge = "ARTISAN CRAFT • HANDMADE";
    tagline = "Handcrafted from full-grain leather for all-day comfort and heritage style.";
    accordionLabel1 = "SIZING GUIDE";
    accordionLabel2 = "MATERIALS & CRAFT";
    featureCards = [
      {
        icon: "footsteps-outline",
        title: "FULL-GRAIN LEATHER",
        sub: "Vegetable-tanned full-grain leather upper with natural breathability and aging patina.",
        fullWidth: true,
      },
      {
        icon: "layers-outline",
        title: "MEMORY FOAM",
        sub: "Padded arch-support insole",
      },
      {
        icon: "construct-outline",
        title: "HAND-STITCHED",
        sub: "Goodyear welt construction",
      },
    ];
    applicationProtocol = "Refer to our size chart: Indian size = UK size + 1. Measure foot length in cm and match to chart. For half sizes, size up. Width options: Standard (D) and Wide (EE). Break-in period recommended: 3-5 wears.";
    ingredientsProfile = "Upper: Full-grain vegetable-tanned leather. Lining: Genuine leather or breathable textile. Insole: Memory foam padded arch support. Outsole: Rubber / leather blend. Construction: Goodyear welt / hand-stitched blake.";
    reviewQuote = `"Premium leather quality, very comfortable even on the first wear. The stitching is immaculate and feels truly handmade."`;
    reviewAuthor = "— KARAN T. • VERIFIED BUYER";

  // ── FOOD / SNACKS / BEVERAGES ──
  } else if (titleLower.includes('makhana') || titleLower.includes('sattu') || titleLower.includes('coffee') || titleLower.includes('tea') || titleLower.includes('snack') || titleLower.includes('sweet') || titleLower.includes('ramen') || titleLower.includes('biscuit') || titleLower.includes('chocolate') || titleLower.includes('juice') || titleLower.includes('masala') || titleLower.includes('pickle')) {
    editionBadge = "ARTISANAL BATCH • FRESH HARVEST";
    tagline = "Slow roasted to perfection with 0% trans fat and rich organic minerals.";
    accordionLabel1 = "STORAGE & USAGE";
    accordionLabel2 = "INGREDIENTS";
    featureCards = [
      {
        icon: "nutrition-outline",
        title: "ORGANIC HARVEST",
        sub: "Hand-picked organic ingredients slow-processed for maximum nutrition retention.",
        fullWidth: true,
      },
      {
        icon: "flame-outline",
        title: "BOLD FLAVOUR",
        sub: "Authentic spice / flavour blend",
      },
      {
        icon: "heart-outline",
        title: "0% TRANS FAT",
        sub: "Guilt-free gourmet snack",
      },
    ];
    applicationProtocol = "Store in a cool, dry place away from direct heat and sunlight. Reseal the pouch tightly after opening to preserve peak freshness. Best before date printed on pack. Not suitable for those with known nut/gluten allergies unless stated.";
    ingredientsProfile = "Please refer to product label for complete ingredient list and allergen information. Produced in a facility that may handle nuts, dairy, and gluten.";
    reviewQuote = `"Hands down the best quality I've ordered online. Perfectly packed, fresh on arrival, and the taste is authentic and rich."`;
    reviewAuthor = "— MEERA P. • VERIFIED BUYER";

  // ── WATCHES / SUNGLASSES / HEADPHONES / SMARTWATCH ──
  } else if (titleLower.includes('watch') || titleLower.includes('sunglasses') || titleLower.includes('headphones') || titleLower.includes('smartwatch') || titleLower.includes('earphone') || titleLower.includes('earbud') || titleLower.includes('eyewear')) {
    editionBadge = "PRECISION CRAFT • EDITION 01";
    tagline = "Engineered for timeless precision, acoustic purity, and structural endurance.";
    accordionLabel1 = "HOW TO USE";
    accordionLabel2 = "TECHNICAL SPECIFICATIONS";
    featureCards = [
      {
        icon: "hardware-chip-outline",
        title: "PRECISION ENGINE",
        sub: "High-frequency precision movement / driver encased in surgical-grade materials.",
        fullWidth: true,
      },
      {
        icon: "water-outline",
        title: "5 ATM PROOF",
        sub: "50M Water Resistance",
      },
      {
        icon: "shield-outline",
        title: "PREMIUM OPTICS",
        sub: "UV400 anti-scratch crystal",
      },
    ];
    applicationProtocol = "Avoid exposure to extreme magnetic fields, chemical solvents, or prolonged UV exposure. Clean gently with a soft microfiber cloth. For smartwatches / earbuds: fully charge before first use.";
    ingredientsProfile = "Case: 316L Surgical Grade Stainless Steel / Aerospace Aluminium. Glass: Sapphire Crystal / Corning Gorilla Glass. Strap: Genuine Italian Calfskin / Fluoroelastomer. Movement: Swiss Quartz / Japanese Movement. Water Resistance: 5 ATM.";
    reviewQuote = `"The build quality and finish are incredible — looks and feels like a luxury item costing 5x more. Very happy with the purchase."`;
    reviewAuthor = "— RAHUL V. • VERIFIED BUYER";

  // ── PHONES / TABLETS / LAPTOPS / ELECTRONICS ──
  } else if (titleLower.includes('phone') || titleLower.includes('smartphone') || titleLower.includes('tablet') || titleLower.includes('laptop') || titleLower.includes('computer') || titleLower.includes('earphone') || titleLower.includes('speaker') || titleLower.includes('camera') || titleLower.includes('charger') || titleLower.includes('powerbank') || titleLower.includes('cable') || titleLower.includes('keyboard') || titleLower.includes('mouse') || titleLower.includes('monitor') || titleLower.includes('led') || titleLower.includes('tv') || titleLower.includes('television')) {
    editionBadge = "TECH EDITION • GENUINE";
    tagline = "Powered by cutting-edge silicon for next-generation performance and connectivity.";
    accordionLabel1 = "IN THE BOX";
    accordionLabel2 = "TECHNICAL SPECIFICATIONS";
    featureCards = [
      {
        icon: "hardware-chip-outline",
        title: "HIGH PERFORMANCE CHIP",
        sub: "Latest generation processor delivering smooth multitasking and gaming performance.",
        fullWidth: true,
      },
      {
        icon: "battery-charging-outline",
        title: "FAST CHARGE",
        sub: "Rapid charge technology",
      },
      {
        icon: "wifi-outline",
        title: "CONNECTIVITY",
        sub: "Wi-Fi 6 / Bluetooth 5.3",
      },
    ];
    applicationProtocol = "What's in the Box: 1x Device, 1x USB-C / Charging Cable, 1x Adapter, 1x Quick Start Guide, 1x Warranty Card. Activate device by following on-screen setup. Register warranty within 30 days of purchase.";
    ingredientsProfile = "Processor: Latest Gen SoC. RAM: 8 / 12 GB. Storage: 128 / 256 GB. Display: Full HD+ IPS / AMOLED. Battery: 5000 mAh. Connectivity: 4G / 5G, Wi-Fi 6, Bluetooth 5.3, USB-C. OS: Android / Windows. Warranty: 1 year manufacturer.";
    reviewQuote = `"Excellent build quality and blazing fast performance. The display colours are vivid and the battery easily lasts a full day."`;
    reviewAuthor = "— VIKRAM S. • VERIFIED BUYER";

  // ── GROOMING / SKINCARE / BEAUTY ──
  } else if (titleLower.includes('grooming') || titleLower.includes('serum') || titleLower.includes('cream') || titleLower.includes('lotion') || titleLower.includes('moisturizer') || titleLower.includes('face wash') || titleLower.includes('shampoo') || titleLower.includes('conditioner') || titleLower.includes('lipstick') || titleLower.includes('kohl') || titleLower.includes('kajal') || titleLower.includes('foundation') || titleLower.includes('beard') || titleLower.includes('hair oil') || titleLower.includes('perfume') || titleLower.includes('deodorant') || titleLower.includes('sunscreen') || titleLower.includes('beauty')) {
    editionBadge = "LUXE FORMULA • DERMATOLOGIST TESTED";
    tagline = "Precision skincare actives formulated to restore, hydrate, and protect.";
    accordionLabel1 = "APPLICATION PROTOCOL";
    accordionLabel2 = "INGREDIENTS PROFILE";
    featureCards = [
      {
        icon: "flask-outline",
        title: "ACTIVE MATRIX",
        sub: "Concentrated active elements engineered for peak daily skin performance.",
        fullWidth: true,
      },
      {
        icon: "water-outline",
        title: "HYDRATION",
        sub: "+400% moisture retention",
      },
      {
        icon: "flash-outline",
        title: "RECOVERY",
        sub: "Overnight cellular repair",
      },
    ];
    applicationProtocol = "Dispense 2-3 drops onto fingertips. Press gently into cleansed skin, focusing on key zones. Follow with a barrier seal / SPF. Use AM and/or PM as directed on packaging.";
    ingredientsProfile = "98.5% Organic Kashmiri Saffron Extract, Pure Sandalwood Essential Elixir, Cold-Pressed Jojoba Matrix, Hyaluronic Acid (Tri-Molecular), Niacinamide 10%, Vitamin C 15%, Ceramide Complex.";
    reviewQuote = `"Absolute game changer. The texture is rich but absorbs quickly — skin density and glow improved within a week."`;
    reviewAuthor = "— PRIYA S. • VERIFIED BUYER";

  // ── AUTO / CAR ACCESSORIES / CLEANING TOOLS ──
  } else if (titleLower.includes('car washer') || titleLower.includes('foam spray') || titleLower.includes('pressure washer') || titleLower.includes('car wash') || titleLower.includes('car cleaner') || titleLower.includes('car wiper') || titleLower.includes('car cover') || titleLower.includes('car seat') || titleLower.includes('car mat') || titleLower.includes('dashcam') || titleLower.includes('dash cam') || titleLower.includes('car vacuum') || titleLower.includes('tyre') || titleLower.includes('tire') || titleLower.includes('car polish') || titleLower.includes('car care') || titleLower.includes('portable washer')) {
    editionBadge = "HIGH PRESSURE • PORTABLE GRADE";
    tagline = "Professional-grade cleaning power in a compact, portable design for home and on-road use.";
    accordionLabel1 = "HOW TO USE";
    accordionLabel2 = "TECHNICAL SPECIFICATIONS";
    featureCards = [
      {
        icon: "water-outline",
        title: "HIGH-PRESSURE PUMP",
        sub: "Delivers up to 130 BAR pressure — removes stubborn mud, grease, and grime in seconds.",
        fullWidth: true,
      },
      {
        icon: "flash-outline",
        title: "FOAM CANNON",
        sub: "Thick foam coating for deep clean",
      },
      {
        icon: "phone-portrait-outline",
        title: "PORTABLE DESIGN",
        sub: "Compact build, carry anywhere",
      },
    ];
    applicationProtocol = "Step 1: Fill the foam bottle with car wash solution + water (1:10 ratio). Step 2: Connect to water source and power on. Step 3: Spray foam coating from top to bottom. Step 4: Rinse with high-pressure jet. Step 5: Dry with microfiber cloth. Do not point nozzle at people or electrical components.";
    ingredientsProfile = "Motor: 1800W copper-wound brushless motor. Max Pressure: 130 BAR / 1900 PSI. Flow Rate: 6.5 L/min. Foam Bottle Capacity: 1.1L. Hose Length: 5m. Power: 220V AC. Weight: 3.5 kg. Accessories: High-pressure lance, foam cannon nozzle, flat fan nozzle, soap bottle, 5m hose. Warranty: 1 year.";
    reviewQuote = `"Absolutely brilliant pressure washer. The foam cannon gives a thick lather and the jet strips even dried mud off the tyres perfectly. Great value."`;
    reviewAuthor = "— DEEPAK M. • VERIFIED BUYER";

  // ── HOME APPLIANCES / CLEANING EQUIPMENT ──
  } else if (titleLower.includes('vacuum') || titleLower.includes('iron') || titleLower.includes('air purifier') || titleLower.includes('fan') || titleLower.includes('heater') || titleLower.includes('cooler') || titleLower.includes('air conditioner') || titleLower.includes('washing machine') || titleLower.includes('refrigerator') || titleLower.includes('fridge') || titleLower.includes('microwave') || titleLower.includes('oven') || titleLower.includes('water purifier') || titleLower.includes('ro system') || titleLower.includes('geyser') || titleLower.includes('trimmer') || titleLower.includes('shaver') || titleLower.includes('hair dryer') || titleLower.includes('straightener') || titleLower.includes('epilator')) {
    editionBadge = "HOME GRADE • ENERGY EFFICIENT";
    tagline = "Built for reliable daily home performance with energy-efficient operation.";
    accordionLabel1 = "INSTALLATION & USAGE";
    accordionLabel2 = "TECHNICAL SPECIFICATIONS";
    featureCards = [
      {
        icon: "home-outline",
        title: "ENERGY STAR RATED",
        sub: "BEE 5-star energy efficient — designed for minimal power consumption and maximum output.",
        fullWidth: true,
      },
      {
        icon: "settings-outline",
        title: "AUTO CONTROL",
        sub: "Smart sensor-based operation",
      },
      {
        icon: "shield-checkmark-outline",
        title: "SAFETY CERTIFIED",
        sub: "ISI / BIS mark approved",
      },
    ];
    applicationProtocol = "Read the user manual fully before first use. Ensure proper earthing / grounding of power socket. Do not operate with wet hands. Keep children away during operation. Service unit every 6 months for optimal performance. Contact authorized service center for repairs.";
    ingredientsProfile = "Body: ABS high-impact plastic. Power Input: 220-240V AC 50Hz. Power Consumption: as per energy label. Safety Certifications: ISI / BEE rated. Cord Length: 1.5m. Warranty: 1 year on product + 5 years on compressor (if applicable). Made in India / assembled in India.";
    reviewQuote = `"Works perfectly from day one. Energy consumption is very low and the build quality is solid. After-sales service was also fast and helpful."`;
    reviewAuthor = "— SUNITA K. • VERIFIED BUYER";

  // ── KITCHEN / COOKWARE ──
  } else if (titleLower.includes('cookware') || titleLower.includes('kadai') || titleLower.includes('tawa') || titleLower.includes('pressure cooker') || titleLower.includes('pan') || titleLower.includes('pot') || titleLower.includes('knife') || titleLower.includes('cutting board') || titleLower.includes('mixer') || titleLower.includes('grinder') || titleLower.includes('juicer') || titleLower.includes('blender') || titleLower.includes('toaster') || titleLower.includes('kettle') || titleLower.includes('flask') || titleLower.includes('bottle') || titleLower.includes('casserole') || titleLower.includes('bowl') || titleLower.includes('plate') || titleLower.includes('steel')) {
    editionBadge = "CULINARY GRADE • PREMIUM";
    tagline = "Forged from professional-grade materials for authentic Indian cooking performance.";
    accordionLabel1 = "CARE & CLEANING";
    accordionLabel2 = "MATERIAL SPECIFICATIONS";
    featureCards = [
      {
        icon: "flame-outline",
        title: "INDUCTION READY",
        sub: "Works on all heat sources — induction, gas, ceramic, halogen, and electric stoves.",
        fullWidth: true,
      },
      {
        icon: "shield-checkmark-outline",
        title: "FOOD SAFE",
        sub: "PTFE/PFOA-free non-stick coating",
      },
      {
        icon: "thermometer-outline",
        title: "HEAT DISTRIBUTION",
        sub: "Triple-layer base for even heat",
      },
    ];
    applicationProtocol = "Season with oil before first use if cast iron or carbon steel. Hand wash with warm soapy water — avoid steel scrubbers on non-stick surfaces. Dry immediately after washing to prevent rust. Do not leave water-filled cookware on heat unattended. Not recommended for dishwashers.";
    ingredientsProfile = "Material: Tri-ply stainless steel / hard-anodized aluminium / cast iron (as applicable). Coating: PTFE/PFOA-free non-stick. Base: Triple-layer induction-compatible base. Handle: Riveted stainless steel / heat-resistant Bakelite. Compatible: All hob types incl. induction. Oven safe up to 220°C.";
    reviewQuote = `"Excellent cooking performance. The heat spreads evenly and the non-stick coating is still perfect after months of daily use. Worth every rupee."`;
    reviewAuthor = "— SAVITA R. • VERIFIED BUYER";

  // ── SPORTS / FITNESS / OUTDOOR ──
  } else if (titleLower.includes('bat') || titleLower.includes('racket') || titleLower.includes('racquet') || titleLower.includes('shuttle') || titleLower.includes('football') || titleLower.includes('cricket') || titleLower.includes('badminton') || titleLower.includes('tennis') || titleLower.includes('dumbbell') || titleLower.includes('yoga') || titleLower.includes('gym') || titleLower.includes('treadmill') || titleLower.includes('cycle') || titleLower.includes('bicycle') || titleLower.includes('fitness') || titleLower.includes('resistance band') || titleLower.includes('protein') || titleLower.includes('supplement') || titleLower.includes('whey') || titleLower.includes('sport') || titleLower.includes('running') || titleLower.includes('jersey') || titleLower.includes('gloves') || titleLower.includes('mat')) {
    editionBadge = "SPORTS PRO • PERFORMANCE GRADE";
    tagline = "Engineered for peak athletic performance, durability, and recovery.";
    accordionLabel1 = "EQUIPMENT CARE & USAGE";
    accordionLabel2 = "TECHNICAL SPECIFICATIONS";

    if (titleLower.includes('bat') || titleLower.includes('cricket')) {
      tagline = "Handcrafted Grade-1 willow for massive power hitting, immaculate balance, and sweet-spot ping.";
      accordionLabel1 = "KNOCKING-IN & CARE";
      accordionLabel2 = "WILLOW & BUILD SPECS";
      featureCards = [
        {
          icon: "trophy-outline",
          title: "GRADE-1 WILLOW",
          sub: "Handcrafted English/Kashmiri willow with straight grains & thick power edges.",
          fullWidth: true,
        },
        {
          icon: "flash-outline",
          title: "MID-BOW BALANCE",
          sub: "Light pickup for quick strokes",
        },
        {
          icon: "shield-checkmark-outline",
          title: "CANE HANDLE",
          sub: "12-Piece cane handle for shock absorption",
        },
      ];
      applicationProtocol = "Knock-in blade face and edges using a wooden mallet or old ball for 4–6 hours before match play. Apply linseed oil lightly avoiding rubber grip. Store in bat cover away from moisture.";
      ingredientsProfile = "Blade: Handcrafted Grade-1 Willow. Handle: 12-piece Singapore cane handle. Edge Thickness: 38–40mm. Spine: 62–65mm. Weight: 1180g–1220g. Sweet Spot: Mid-to-low bow profile. Toe Guard: Pre-fitted rubber toe guard.";
      reviewQuote = `"Immaculate grain structure and incredible ping off the sweet spot. The balance feels light in hand and power output on drive shots is phenomenal."`;
      reviewAuthor = "— SURESH R. • VERIFIED BUYER";
    } else if (titleLower.includes('racket') || titleLower.includes('racquet') || titleLower.includes('badminton') || titleLower.includes('shuttle') || titleLower.includes('tennis')) {
      tagline = "Ultra-light carbon fiber frame engineered for rapid swing speed, pin-point control, and heavy smashes.";
      accordionLabel1 = "STRINGING & CARE";
      accordionLabel2 = "FRAME SPECIFICATIONS";
      featureCards = [
        {
          icon: "flash-outline",
          title: "HIGH-MODULUS CARBON",
          sub: "Aerodynamic nano-carbon frame delivering 28-30 lbs high string tension capacity.",
          fullWidth: true,
        },
        {
          icon: "speedometer-outline",
          title: "RAPID SWING",
          sub: "Ultra-slim shaft reduces air drag",
        },
        {
          icon: "shield-checkmark-outline",
          title: "ISOMETRIC HEAD",
          sub: "+32% enlarged sweet spot",
        },
      ];
      applicationProtocol = "Avoid hitting hard court surface with frame. Re-string at recommended tension (24-28 lbs) based on playing style. Store in thermoguard racket cover to protect string tension from temperature fluctuations.";
      ingredientsProfile = "Frame Material: High-Modulus Carbon Graphite + Nano Fortify. Shaft: Ultra-slim flexible shaft. Weight/Grip: 4U (83g ± 2g) G5. String Tension: 24–30 lbs. Balance: Head-Heavy for power smashes. Joint: Built-in T-Joint.";
      reviewQuote = `"Super lightweight yet powerful. Smashes feel effortless and net play control is pinpoint accurate. String tension holds perfectly."`;
      reviewAuthor = "— ADITYA K. • VERIFIED BUYER";
    } else if (titleLower.includes('football') || titleLower.includes('ball')) {
      tagline = "FIFA-certified match ball with 32 thermal-bonded panels for aerodynamic precision and air retention.";
      accordionLabel1 = "INFLATION & CARE";
      accordionLabel2 = "BALL SPECIFICATIONS";
      featureCards = [
        {
          icon: "football-outline",
          title: "32 THERMAL-BONDED PANELS",
          sub: "Seamless surface technology for zero water absorption and true flight trajectory.",
          fullWidth: true,
        },
        {
          icon: "shield-checkmark-outline",
          title: "BUTYL BLADDER",
          sub: "Max air & shape retention",
        },
        {
          icon: "ribbon-outline",
          title: "MATCH CERTIFIED",
          sub: "FIFA / ISO quality tested",
        },
      ];
      applicationProtocol = "Moisten pump needle before inserting into valve. Inflate to recommended pressure (0.6 - 1.1 bar / 8.5 - 15.6 psi). Wipe clean with damp cloth after outdoor play. Do not over-inflate.";
      ingredientsProfile = "Outer Shell: High-grade PU leather with 32 thermal-bonded micro-textured panels. Bladder: Butyl bladder with polyester wrapping. Size: Official Size 5 (Circumference 68-70 cm). Weight: 420-445g. Rating: Match Play Certified.";
      reviewQuote = `"True flight trajectory and great touch response off the boots. Holds air pressure for weeks without needing re-pump."`;
      reviewAuthor = "— ROHIT P. • VERIFIED BUYER";
    } else {
      featureCards = [
        {
          icon: "barbell-outline",
          title: "PRO PERFORMANCE",
          sub: "Engineered for high-intensity training — built to withstand heavy, repeated daily use.",
          fullWidth: true,
        },
        {
          icon: "body-outline",
          title: "ERGONOMIC DESIGN",
          sub: "Anatomical grip for injury prevention",
        },
        {
          icon: "shield-checkmark-outline",
          title: "CERTIFIED SAFE",
          sub: "Non-slip, anti-bacterial surface",
        },
      ];
      applicationProtocol = "Warm up before use. Start with lighter resistance / weight and gradually increase intensity. Maintain proper form at all times to prevent injury. Clean equipment with dry cloth after each session. Store in a dry place away from moisture. Consult a fitness professional before starting any new exercise regimen.";
      ingredientsProfile = "Material: Cast iron / rubber-coated / high-density foam / commercial-grade PVC (as per product). Weight Tolerance: As specified. Surface: Anti-slip textured grip. Certifications: CE / ISO certified. Country of Origin: India. Warranty: 1 year on manufacturing defects.";
      reviewQuote = `"Very sturdy and well-built. The grip is comfortable even during long sessions. Excellent quality for the price — great addition to my home gym."`;
      reviewAuthor = "— AMIT K. • VERIFIED BUYER";
    }

  // ── BAGS / LUGGAGE / WALLETS ──
  } else if (titleLower.includes('bag') || titleLower.includes('backpack') || titleLower.includes('handbag') || titleLower.includes('wallet') || titleLower.includes('purse') || titleLower.includes('luggage') || titleLower.includes('suitcase') || titleLower.includes('pouch') || titleLower.includes('tote') || titleLower.includes('clutch') || titleLower.includes('sling') || titleLower.includes('laptop bag') || titleLower.includes('messenger') || titleLower.includes('duffel')) {
    editionBadge = "TRAVEL EDITION • PREMIUM CRAFT";
    tagline = "Crafted from durable materials for style, utility, and everyday carry confidence.";
    accordionLabel1 = "CARE INSTRUCTIONS";
    accordionLabel2 = "MATERIAL & DIMENSIONS";
    featureCards = [
      {
        icon: "briefcase-outline",
        title: "PREMIUM MATERIAL",
        sub: "Crafted from PU leather / genuine leather / ballistic nylon for long-lasting durability.",
        fullWidth: true,
      },
      {
        icon: "lock-closed-outline",
        title: "SECURE ZIPPERS",
        sub: "YKK double-pull metal zippers",
      },
      {
        icon: "layers-outline",
        title: "PADDED BACK",
        sub: "Ergonomic cushioned back panel",
      },
    ];
    applicationProtocol = "Wipe exterior with a damp cloth for regular cleaning. Avoid prolonged exposure to direct sunlight. Do not overload beyond recommended capacity. Store in dust bag when not in use. For genuine leather: condition with leather balm every 3 months.";
    ingredientsProfile = "Material: Premium PU leather / genuine cowhide / 1680D ballistic nylon. Lining: Polyester. Hardware: Brushed gunmetal zippers & D-rings. Compartments: As per product. Laptop Sleeve: Fits up to 15.6\". Dimensions: Refer product images. Weight: Approx. 600g–900g. Warranty: 6 months on stitching & hardware.";
    reviewQuote = `"Absolutely love this bag. The build quality is premium, zippers are smooth, and it fits everything I need for work and travel."`;
    reviewAuthor = "— POOJA M. • VERIFIED BUYER";

  // ── JEWELRY / ACCESSORIES ──
  } else if (titleLower.includes('necklace') || titleLower.includes('bracelet') || titleLower.includes('ring') || titleLower.includes('earring') || titleLower.includes('pendant') || titleLower.includes('chain') || titleLower.includes('bangle') || titleLower.includes('jhumka') || titleLower.includes('anklet') || titleLower.includes('maang') || titleLower.includes('mangalsutra') || titleLower.includes('choker') || titleLower.includes('oxidized') || titleLower.includes('silver') || titleLower.includes('gold plated') || titleLower.includes('jewel') || titleLower.includes('accessory')) {
    editionBadge = "ARTISAN JEWELS • HANDCRAFTED";
    tagline = "Handcrafted by master artisans using traditional techniques and hypoallergenic metals.";
    accordionLabel1 = "CARE GUIDE";
    accordionLabel2 = "MATERIALS & CRAFTSMANSHIP";
    featureCards = [
      {
        icon: "diamond-outline",
        title: "HANDCRAFTED",
        sub: "Each piece handcrafted by skilled artisans — no two pieces are exactly alike.",
        fullWidth: true,
      },
      {
        icon: "shield-checkmark-outline",
        title: "HYPOALLERGENIC",
        sub: "Nickel-free, skin-safe metals",
      },
      {
        icon: "color-palette-outline",
        title: "ANTIQUE FINISH",
        sub: "Traditional oxidized / gold plating",
      },
    ];
    applicationProtocol = "Apply perfume, hairspray, and lotions before wearing jewelry to prevent tarnishing. Remove before bathing, swimming, or exercising. Store separately in the provided pouch or a soft cloth to prevent scratches. Polish gently with a dry microfiber cloth to restore shine.";
    ingredientsProfile = "Base Metal: German silver / brass / copper alloy. Plating: 22K gold / rhodium / antique oxidized finish. Stone: Semi-precious stones / kundan / meenakari enamel (if applicable). Finishing: Nickel-free hypoallergenic plating. Craft: Handmade by traditional artisans. Origin: Rajasthan / Jaipur / Bihar craft clusters.";
    reviewQuote = `"Gorgeous piece — the craftsmanship is beautiful and very detailed. It was exactly as shown and arrived safely packed. I get so many compliments wearing it."`;
    reviewAuthor = "— KAVYA S. • VERIFIED BUYER";

  // ── HOME DECOR / FURNITURE / LIGHTING ──
  } else if (titleLower.includes('sofa') || titleLower.includes('chair') || titleLower.includes('table') || titleLower.includes('shelf') || titleLower.includes('lamp') || titleLower.includes('light') || titleLower.includes('curtain') || titleLower.includes('bedsheet') || titleLower.includes('pillow') || titleLower.includes('cushion') || titleLower.includes('mattress') || titleLower.includes('rug') || titleLower.includes('carpet') || titleLower.includes('wall art') || titleLower.includes('frame') || titleLower.includes('clock') || titleLower.includes('decor') || titleLower.includes('showpiece') || titleLower.includes('figurine') || titleLower.includes('vase') || titleLower.includes('candle')) {
    editionBadge = "HOME LUXE • DESIGN EDITION";
    tagline = "Curated home design crafted to elevate every corner of your living space.";
    accordionLabel1 = "ASSEMBLY & CARE";
    accordionLabel2 = "DIMENSIONS & MATERIALS";
    featureCards = [
      {
        icon: "home-outline",
        title: "PREMIUM BUILD",
        sub: "Crafted from solid wood / teak / engineered hardwood for lasting structural integrity.",
        fullWidth: true,
      },
      {
        icon: "color-palette-outline",
        title: "DESIGN FINISH",
        sub: "Hand-lacquered premium finish",
      },
      {
        icon: "resize-outline",
        title: "SPACE-SMART",
        sub: "Compact ergonomic design",
      },
    ];
    applicationProtocol = "Assemble as per included instruction manual. Keep away from direct sunlight to prevent fading. Wipe with a dry or slightly damp cloth — do not use harsh chemical cleaners. For wooden items: apply furniture polish every 3 months. For fabric items: vacuum regularly and spot-clean with mild detergent.";
    ingredientsProfile = "Material: Sheesham / teak / engineered wood / solid pine (as per product). Finish: PU lacquer / walnut stain / fabric upholstery. Dimensions: Refer product images. Weight Capacity: As specified. Assembly: Easy DIY with included tools. Country of Origin: India. Warranty: 1 year on structural defects.";
    reviewQuote = `"Looks stunning in person — much better than the photos. Assembly was easy and the build quality is solid. Completely transformed my living room."`;
    reviewAuthor = "— NANDITA P. • VERIFIED BUYER";

  // ── BABY / KIDS PRODUCTS ──
  } else if (titleLower.includes('baby') || titleLower.includes('kids') || titleLower.includes('toy') || titleLower.includes('diaper') || titleLower.includes('stroller') || titleLower.includes('pram') || titleLower.includes('cradle') || titleLower.includes('feeding') || titleLower.includes('infant') || titleLower.includes('toddler') || titleLower.includes('children') || titleLower.includes('lego') || titleLower.includes('puzzle') || titleLower.includes('doll') || titleLower.includes('cartoon') || titleLower.includes('school bag') || titleLower.includes('pencil')) {
    editionBadge = "CHILD SAFE • BIS CERTIFIED";
    tagline = "Designed for safe, joyful development — tested and certified for children at every stage.";
    accordionLabel1 = "SAFETY & USAGE";
    accordionLabel2 = "MATERIALS & CERTIFICATIONS";
    featureCards = [
      {
        icon: "shield-checkmark-outline",
        title: "BIS / CE CERTIFIED",
        sub: "Tested and certified safe for children — no BPA, no phthalates, no toxic paints.",
        fullWidth: true,
      },
      {
        icon: "happy-outline",
        title: "AGE APPROPRIATE",
        sub: "Designed for safe developmental play",
      },
      {
        icon: "color-palette-outline",
        title: "NON-TOXIC",
        sub: "Food-grade, safe-touch materials",
      },
    ];
    applicationProtocol = "Adult supervision required at all times. Check for loose parts before each use. Clean with a damp cloth and mild soap — do not submerge in water unless rated waterproof. Keep away from infants under 3 years if product contains small parts. Store in a cool, dry place.";
    ingredientsProfile = "Material: ABS plastic / natural wood / BPA-free silicone (as applicable). Paint: Non-toxic, child-safe water-based paint. Certifications: BIS IS 9873 / CE EN71 certified. Age: Suitable for 3+ years (unless stated otherwise). Country of Origin: India. Warranty: 6 months on manufacturing defects.";
    reviewQuote = `"My child absolutely loves it! The quality is excellent and I love that it's certified safe. Great educational value and keeps them engaged for hours."`;
    reviewAuthor = "— NEHA G. • VERIFIED BUYER";

  // ── GENERIC FALLBACK (everything else) ──
  } else {
    editionBadge = "PREMIUM QUALITY • CERTIFIED";
    tagline = "Designed and tested for superior performance, reliability, and daily convenience.";
    accordionLabel1 = "PRODUCT DETAILS";
    accordionLabel2 = "SPECIFICATIONS";
    featureCards = [
      {
        icon: "star-outline",
        title: "PREMIUM QUALITY",
        sub: "Rigorously quality-tested for durability and consistent performance.",
        fullWidth: true,
      },
      {
        icon: "shield-checkmark-outline",
        title: "100% GENUINE",
        sub: "Authenticity guaranteed",
      },
      {
        icon: "flash-outline",
        title: "FAST DELIVERY",
        sub: "Express 10-15 min dispatch",
      },
    ];
    applicationProtocol = "Read enclosed instruction manual before first use. Keep out of reach of children. Store in a cool, dry location. Contact our support within 7 days for any quality concerns.";
    ingredientsProfile = `Product: ${title}. Brand: ${brand}. Category: ${categoryName}. Country of Origin: India. Warranty: 6 months from date of purchase. For full specifications, refer to the product manual or contact support.`;
    reviewQuote = `"Great product for the price. Build quality is solid and it arrived well-packaged. Exactly as described — would definitely buy again."`;
    reviewAuthor = "— ANITA R. • VERIFIED BUYER";
  }

  // Related Arsenal items
  const relatedArsenal = [
    {
      id: 'ptn-10',
      title: 'CARBON CLEANSE WASH',
      price: '₹799',
      image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=80',
      category: 'GROOMING',
    },
    {
      id: 'ptn-3',
      title: 'TITANIUM CHRONO SHIELD',
      price: '₹1,899',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80',
      category: 'WATCHES',
    },
    {
      id: 'ptn-1',
      title: 'ORGANIC COTTON SHIRT',
      price: '₹1,199',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80',
      category: 'MENSWEAR',
    },
  ];

  return {
    id: cleanId,
    title,
    subtitle: categoryName,
    tagline,
    editionBadge,
    brand,
    categoryName,
    price: `₹${priceNum.toLocaleString('en-IN')}`,
    priceNum,
    originalPrice: `₹${origPriceNum.toLocaleString('en-IN')}`,
    originalPriceNum: origPriceNum,
    discountPct,
    savingsText: savings > 0 ? `Save ₹${savings.toLocaleString('en-IN')}` : 'Special Offer',
    rating: String(matched?.rating || '4.9'),
    reviewsCount: String(matched?.reviewCount || matched?.reviewsCount || '142'),
    avatarsCount: '1.4k',
    deliveryDate: matched?.deliveryTime || '10-15 min',
    images: imageList,
    colors,
    secondaryVariantsTitle: secondaryTitle,
    secondaryVariants,
    specsBar: [
      { icon: 'star', title: String(matched?.rating || '4.9'), sub: 'Rating' },
      { icon: 'shield-checkmark-outline', title: '100%', sub: 'Authentic' },
      { icon: 'timer-outline', title: matched?.deliveryTime || '10-15 min', sub: 'Express' },
      { icon: 'arrow-undo-outline', title: '7 Days', sub: 'Easy Return' },
    ],
    featureCards,
    applicationProtocol,
    ingredientsProfile,
    reviewQuote,
    reviewAuthor,
    features: [
      { icon: 'checkmark-circle-outline', title: 'Top Rated Premium Quality Item' },
      { icon: 'ribbon-outline', title: '100% Quality & Authenticity Guaranteed' },
      { icon: 'flash-outline', title: 'Ultra-Fast Express Handoff & Dispatch' },
      { icon: 'reorder-four-outline', title: 'Hassle-Free Doorstep Replacement' },
    ],
    aboutText,
    aboutImage: mainImage,
    couponCode: 'EASYBUYPLUS',
    couponDesc: 'Save extra ₹100 on orders above ₹499 with code EASYBUYPLUS',
    accordionLabel1,
    accordionLabel2,
    relatedArsenal,
  };
}
