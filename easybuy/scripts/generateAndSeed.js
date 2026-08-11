/**
 * EasyBuy — Full 2,500 Product Catalog Generator + Firestore Seeder
 * Run: node scripts/generateAndSeed.js
 *
 * Generates ~2,500 products across 8 categories and seeds to Firestore.
 * NEVER touches: users, orders, cart, wishlist, addresses
 */

const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, writeBatch, collection, getDocs, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyAccokA8hHD60rOs_R-1lrY_zfM3jrBCKI',
  authDomain: 'easybuy-7ee49.firebaseapp.com',
  projectId: 'easybuy-7ee49',
  storageBucket: 'easybuy-7ee49.firebasestorage.app',
  messagingSenderId: '908559589622',
  appId: '1:908559589622:web:e187e48b6aba7ea8944cd7',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// ─── STATES ─────────────────────────────────────────────────────────────────
const STATES = [
  { id: 'BR', name: 'Bihar',       capital: 'Patna',     cities: ['Patna','Gaya','Muzaffarpur','Bhagalpur','Darbhanga'] },
  { id: 'MH', name: 'Maharashtra', capital: 'Mumbai',    cities: ['Mumbai','Pune','Nagpur','Nashik','Aurangabad'] },
  { id: 'DL', name: 'Delhi',       capital: 'New Delhi', cities: ['New Delhi','Dwarka','Rohini','Noida','Gurugram'] },
  { id: 'KL', name: 'Kerala',      capital: 'Thiruvananthapuram', cities: ['Thiruvananthapuram','Kochi','Kozhikode','Thrissur','Kollam'] },
  { id: 'RJ', name: 'Rajasthan',   capital: 'Jaipur',    cities: ['Jaipur','Jodhpur','Udaipur','Bikaner','Kota'] },
  { id: 'PB', name: 'Punjab',      capital: 'Chandigarh',cities: ['Amritsar','Ludhiana','Chandigarh','Jalandhar','Patiala'] },
  { id: 'KA', name: 'Karnataka',   capital: 'Bengaluru', cities: ['Bengaluru','Mysuru','Mangaluru','Hubli','Belagavi'] },
  { id: 'WB', name: 'West Bengal', capital: 'Kolkata',   cities: ['Kolkata','Howrah','Durgapur','Asansol','Siliguri'] },
  { id: 'TN', name: 'Tamil Nadu',  capital: 'Chennai',   cities: ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem'] },
  { id: 'UP', name: 'Uttar Pradesh', capital: 'Lucknow', cities: ['Lucknow','Kanpur','Agra','Varanasi','Prayagraj'] },
];

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'women',        name: 'Women',        icon: 'woman-outline',       color: '#EC4899' },
  { id: 'men',          name: 'Men',          icon: 'man-outline',         color: '#3B82F6' },
  { id: 'tech',         name: 'Tech',         icon: 'laptop-outline',      color: '#6366F1' },
  { id: 'grocery',      name: 'Grocery',      icon: 'basket-outline',      color: '#22C55E' },
  { id: 'beauty',       name: 'Beauty',       icon: 'sparkles-outline',    color: '#F59E0B' },
  { id: 'ethnic_wear',  name: 'Ethnic Wear',  icon: 'shirt-outline',       color: '#EA580C' },
  { id: 'kids',         name: 'Kids',         icon: 'happy-outline',       color: '#A855F7' },
  { id: 'home',         name: 'Home',         icon: 'home-outline',        color: '#14B8A6' },
  { id: 'quickbuy',     name: 'QuickBuy',     icon: 'flash-outline',       color: '#EF4444' },
];

// ─── SUBCATEGORIES ───────────────────────────────────────────────────────────
const SUBCATEGORIES = [
  // Women
  { id: 'w_tops',       name: 'Tops',             categoryId: 'women' },
  { id: 'w_tshirts',    name: 'T-Shirts',         categoryId: 'women' },
  { id: 'w_dresses',    name: 'Dresses',          categoryId: 'women' },
  { id: 'w_jeans',      name: 'Jeans',            categoryId: 'women' },
  { id: 'w_baggy',      name: 'Baggy Jeans',      categoryId: 'women' },
  { id: 'w_cargo',      name: 'Cargo Pants',      categoryId: 'women' },
  { id: 'w_skirts',     name: 'Skirts',           categoryId: 'women' },
  { id: 'w_bags',       name: 'Bags',             categoryId: 'women' },
  { id: 'w_footwear',   name: 'Footwear',         categoryId: 'women' },
  { id: 'w_acc',        name: 'Accessories',      categoryId: 'women' },
  // Men
  { id: 'm_tshirts',    name: 'T-Shirts',         categoryId: 'men' },
  { id: 'm_shirts',     name: 'Shirts',           categoryId: 'men' },
  { id: 'm_jeans',      name: 'Jeans',            categoryId: 'men' },
  { id: 'm_baggy',      name: 'Baggy Jeans',      categoryId: 'men' },
  { id: 'm_cargo',      name: 'Cargo Pants',      categoryId: 'men' },
  { id: 'm_hoodies',    name: 'Hoodies',          categoryId: 'men' },
  { id: 'm_jackets',    name: 'Jackets',          categoryId: 'men' },
  { id: 'm_footwear',   name: 'Footwear',         categoryId: 'men' },
  { id: 'm_watches',    name: 'Watches',          categoryId: 'men' },
  { id: 'm_acc',        name: 'Accessories',      categoryId: 'men' },
  // Tech
  { id: 't_phones',     name: 'Smartphones',      categoryId: 'tech' },
  { id: 't_laptops',    name: 'Laptops',          categoryId: 'tech' },
  { id: 't_headphones', name: 'Headphones',       categoryId: 'tech' },
  { id: 't_earbuds',    name: 'Earbuds',          categoryId: 'tech' },
  { id: 't_speakers',   name: 'Speakers',         categoryId: 'tech' },
  { id: 't_powerbanks', name: 'Power Banks',      categoryId: 'tech' },
  { id: 't_chargers',   name: 'Chargers',         categoryId: 'tech' },
  { id: 't_tablets',    name: 'Tablets',          categoryId: 'tech' },
  { id: 't_gaming',     name: 'Gaming',           categoryId: 'tech' },
  { id: 't_smartwatch', name: 'Smartwatches',     categoryId: 'tech' },
  // Grocery
  { id: 'g_fruits',     name: 'Fruits',           categoryId: 'grocery' },
  { id: 'g_veggies',    name: 'Vegetables',       categoryId: 'grocery' },
  { id: 'g_dairy',      name: 'Dairy',            categoryId: 'grocery' },
  { id: 'g_snacks',     name: 'Snacks',           categoryId: 'grocery' },
  { id: 'g_beverages',  name: 'Beverages',        categoryId: 'grocery' },
  { id: 'g_staples',    name: 'Staples',          categoryId: 'grocery' },
  { id: 'g_spices',     name: 'Spices',           categoryId: 'grocery' },
  { id: 'g_bakery',     name: 'Bakery',           categoryId: 'grocery' },
  // Beauty
  { id: 'b_skincare',   name: 'Skincare',         categoryId: 'beauty' },
  { id: 'b_haircare',   name: 'Haircare',         categoryId: 'beauty' },
  { id: 'b_makeup',     name: 'Makeup',           categoryId: 'beauty' },
  { id: 'b_fragrance',  name: 'Fragrance',        categoryId: 'beauty' },
  { id: 'b_bodycare',   name: 'Body Care',        categoryId: 'beauty' },
  // Ethnic Wear
  { id: 'e_kurtis',     name: 'Kurtis',           categoryId: 'ethnic_wear' },
  { id: 'e_sarees',     name: 'Sarees',           categoryId: 'ethnic_wear' },
  { id: 'e_lehengas',   name: 'Lehengas',         categoryId: 'ethnic_wear' },
  { id: 'e_sherwanis',  name: 'Sherwanis',        categoryId: 'ethnic_wear' },
  { id: 'e_kurtas',     name: 'Kurtas',           categoryId: 'ethnic_wear' },
  // Kids
  { id: 'k_toys',       name: 'Toys',             categoryId: 'kids' },
  { id: 'k_clothing',   name: 'Kids Clothing',    categoryId: 'kids' },
  { id: 'k_baby',       name: 'Baby Care',        categoryId: 'kids' },
  { id: 'k_games',      name: 'Games',            categoryId: 'kids' },
  { id: 'k_edutoys',    name: 'Educational Toys', categoryId: 'kids' },
  // Home
  { id: 'h_decor',      name: 'Decor',            categoryId: 'home' },
  { id: 'h_kitchen',    name: 'Kitchen',          categoryId: 'home' },
  { id: 'h_bedding',    name: 'Bedding',          categoryId: 'home' },
  { id: 'h_lighting',   name: 'Lighting',         categoryId: 'home' },
  // QuickBuy
  { id: 'qb_general',   name: 'Quick Essentials', categoryId: 'quickbuy' },
];

// ─── PRODUCT DATA TABLES ──────────────────────────────────────────────────────

const DATA = {
  women: {
    brands: ['Zara','H&M','Mango','Forever 21','Vero Moda','AND','W for Woman','Global Desi','Aurelia','Biba','Sassafras','Rare Rabbit','Nykaa Fashion','Ajio','Myntra'],
    subMap: {
      w_tops:    { names: ['Floral Crop Top','Puff Sleeve Blouse','Off-Shoulder Top','Ribbed Crop Top','Linen Tank Top','Satin Blouse','Lace Trim Top','Stripe Casual Top','Tie-Front Blouse','Printed Casual Top'], price: [399,499,599,699,799,899,999,1199,1299,1499], img: ['photo-1434389677669-e08b4cac3105','photo-1485462537746-965f33f52f29','photo-1527719327859-a6f4e2de2a9f','photo-1539109136881-3be0616acf4b','photo-1591047139829-d91aecb6caea'] },
      w_tshirts: { names: ['Oversized Graphic Tee','Vintage Wash Tee','Tie-Dye T-Shirt','Ribbed Slim Tee','Drop Shoulder Tee','Printed Band Tee','Essential White Tee','Cropped Boxy Tee','Slogan Print Tee','Pocket Detail Tee'], price: [299,349,399,449,499,549,599,649,699,799], img: ['photo-1583743814966-8936f5b7be1a','photo-1562157873-818bc0726f68','photo-1503342217505-b0a15ec3261c','photo-1622445275463-afa2ab738c34','photo-1536532184021-da5392b55da1'] },
      w_dresses: { names: ['Midi Wrap Dress','Floral Maxi Dress','Mini Skater Dress','Bodycon Party Dress','Boho Sundress','Shirt Dress','Smocked Dress','Off-Shoulder Dress','Ruffle Hem Dress','Slip Dress'], price: [799,999,1199,1399,1499,1699,1899,2099,2299,2499], img: ['photo-1515886657613-9f3515b0c78f','photo-1572804013309-59a88b7e92f1','photo-1566479179817-71f7e6e19ef7','photo-1496747611176-843222e1e57c','photo-1469334031218-e382a71b716b'] },
      w_jeans:   { names: ['Skinny Fit Jeans','Straight Leg Jeans','Mom Jeans','High Rise Jeans','Wide Leg Jeans','Slim Ankle Jeans','Distressed Jeans','Classic Blue Jeans','Dark Wash Jeans','White Denim Jeans'], price: [799,999,1199,1399,1499,1599,1699,1799,1899,1999], img: ['photo-1541099649105-f69ad21f3246','photo-1542272201-b1ca555f8505','photo-1555689502-c4b22d76c56f','photo-1582418702059-97ebafb35d09','photo-1475178626620-a4d074967452'] },
      w_baggy:   { names: ['90s Baggy Jeans','Wide Baggy Denim','Retro Loose Jeans','Vintage Baggy Fit','Y2K Denim','Skater Baggy Jeans','Low-Rise Baggy Denim','Bleached Baggy Jean','Patchwork Baggy Jean','Carpenter Baggy Jean'], price: [999,1199,1399,1499,1599,1699,1799,1899,1999,2199], img: ['photo-1541099649105-f69ad21f3246','photo-1542272201-b1ca555f8505','photo-1529711297966-4a67e0b0df4d','photo-1475178626620-a4d074967452','photo-1582418702059-97ebafb35d09'] },
      w_cargo:   { names: ['Utility Cargo Pants','Wide Leg Cargo','Parachute Cargo Pants','Combat Cargo','Y2K Cargo Trousers','Khaki Cargo Pants','Olive Cargo Jogger','Camo Print Cargo','Multi-Pocket Cargo','Low-Rise Cargo'], price: [799,899,999,1099,1199,1299,1399,1499,1599,1699], img: ['photo-1594938298603-c8148c4b4047','photo-1509551388413-e18d0ac5d495','photo-1509460913899-515f1df34fea','photo-1571945153237-4929e783af4a','photo-1626497764746-6dc36546b388'] },
      w_skirts:  { names: ['Mini Pleated Skirt','Midi Wrap Skirt','Satin Slip Skirt','Denim Mini Skirt','Maxi Floral Skirt','Tennis Skirt','Ruched Mini Skirt','A-Line Skirt','Leopard Print Skirt','Asymmetric Skirt'], price: [499,599,699,799,899,999,1099,1199,1299,1399], img: ['photo-1583496661160-fb5218afa3a9','photo-1551163943-3f6a855d1153','photo-1508779069171-3a84f98748cb','photo-1570976447640-ac859083963f','photo-1591047139829-d91aecb6caea'] },
      w_bags:    { names: ['Mini Shoulder Bag','Tote Canvas Bag','Quilted Chain Bag','Bucket Bag','Crossbody Sling','Backpack Leather','Hobo Bag','Clutch Bag','Camera Bag','Saddle Bag'], price: [499,799,1199,1499,1799,2199,2499,2999,3499,3999], img: ['photo-1548036328-c9fa89d128fa','photo-1584917865442-de89df76afd3','photo-1553062407-98eeb64c6a62','photo-1591561954557-26941169b49e','photo-1566150905458-1bf1fc113f0d'] },
      w_footwear:{ names: ['Block Heel Sandals','Strappy Heels','White Sneakers','Platform Loafers','Ankle Boots','Pointed Toe Flats','Espadrille Wedge','Mule Sandals','Chunky Sneakers','Ballet Flats'], price: [599,799,999,1199,1399,1599,1799,1999,2199,2499], img: ['photo-1543163521-1bf539c55dd2','photo-1518049362265-d5b2a6467637','photo-1512374382149-233c42b6a83b','photo-1600185365778-86df8b4e1421','photo-1603487742131-4160ec999306'] },
      w_acc:     { names: ['Pearl Earrings','Gold Layered Necklace','Scrunchie Set','Hair Claw Clips','Beaded Bracelet','Silk Scarf','Bucket Hat','Sunglass Retro','Anklet Set','Ring Stack Set'], price: [199,299,399,499,599,699,799,899,999,1199], img: ['photo-1515562141207-7a88fb7ce338','photo-1535632066927-ab7c9ab60908','photo-1588444837495-c6cfeb53f32d','photo-1611923134239-b9be5816e23c','photo-1599643477877-530eb83abc8e'] },
    },
  },
  men: {
    brands: ['SNITCH','H&M','Roadster','WROGN','Highlander','Jack & Jones','Spykar','Mufti','Peter England','Van Heusen','Levis','Tommy Hilfiger','Adidas','Nike','Puma'],
    subMap: {
      m_tshirts: { names: ['Oversized Graphic Tee','Essential Solid Tee','Acid Wash Tee','Polo T-Shirt','Henley Neck Tee','Drop-Shoulder Tee','Printed Half Sleeve','Striped Collar Tee','Pigment Dyed Tee','Pack of 2 Tees'], price: [299,349,399,449,499,549,599,649,699,799], img: ['photo-1581655353564-df123a1eb820','photo-1583743814966-8936f5b7be1a','photo-1503341504253-dff4815485f1','photo-1529374255404-311a2a4f1fd9','photo-1521572163474-6864f9cf17ab'] },
      m_shirts:  { names: ['Oxford Shirt','Linen Summer Shirt','Oversized Cuban Shirt','Check Flannel Shirt','Poplin Shirt','Denim Shirt','Resort Print Shirt','Mandarin Collar Shirt','Formal White Shirt','Half Sleeve Casual Shirt'], price: [599,699,799,899,999,1099,1199,1299,1399,1499], img: ['photo-1598033129183-c4f50c736f10','photo-1620012253295-c15cc3e65df4','photo-1603252109303-2751441dd157','photo-1605518216938-7c31b7b14ad0','photo-1563630423918-b58f07336ac9'] },
      m_jeans:   { names: ['Slim Fit Jeans','Regular Fit Jeans','Skinny Jeans','Tapered Jeans','Light Wash Denim','Dark Indigo Jeans','Distressed Jeans','Stretch Jeans','Cargo Denim','Classic 501'], price: [799,999,1199,1399,1499,1699,1799,1899,1999,2199], img: ['photo-1542272201-b1ca555f8505','photo-1541099649105-f69ad21f3246','photo-1555689502-c4b22d76c56f','photo-1475178626620-a4d074967452','photo-1582418702059-97ebafb35d09'] },
      m_baggy:   { names: ['90s Baggy Jeans','Wide Leg Cargo Denim','Vintage Baggy Denim','Skater Wide Jeans','Parachute Denim','Low-Rise Baggy','Carpenter Jean','Patchwork Baggy','Bleach Wash Baggy','Y2K Denim Trouser'], price: [999,1199,1399,1499,1599,1699,1799,1899,1999,2199], img: ['photo-1541099649105-f69ad21f3246','photo-1529711297966-4a67e0b0df4d','photo-1475178626620-a4d074967452','photo-1568251188392-ae9ded1c92f4','photo-1542272201-b1ca555f8505'] },
      m_cargo:   { names: ['Multi-Pocket Cargo','Parachute Cargo Pants','Utility Cargo Jogger','Camo Cargo Pants','Khaki Cargo','Olive Green Cargo','Combat Cargo Pants','Track Cargo','Low-Rise Cargo Pant','Wide Leg Cargo'], price: [699,799,899,999,1099,1199,1299,1399,1499,1599], img: ['photo-1594938298603-c8148c4b4047','photo-1509551388413-e18d0ac5d495','photo-1626497764746-6dc36546b388','photo-1571945153237-4929e783af4a','photo-1509460913899-515f1df34fea'] },
      m_hoodies: { names: ['Essential Pullover Hoodie','Zip-Up Hoodie','Oversized Hoodie','Graphic Print Hoodie','Fleece Hoodie','Tie-Dye Hoodie','Kangaroo Pocket Hoodie','Quarter Zip Hoodie','Cropped Hoodie','Heavyweight Hoodie'], price: [799,899,999,1099,1199,1299,1399,1499,1599,1799], img: ['photo-1556821840-3a63f15732ce','photo-1620799140408-edc6dcb6d633','photo-1608188252879-b1e538e64056','photo-1578768079052-aa76e52ff62e','photo-1591047139829-d91aecb6caea'] },
      m_jackets: { names: ['Bomber Jacket','Denim Jacket','Puffer Jacket','Windbreaker Jacket','Leather Biker Jacket','Coach Jacket','Harrington Jacket','Track Jacket','Fleece Jacket','MA-1 Flight Jacket'], price: [1199,1499,1799,1999,2199,2499,2799,2999,3499,3999], img: ['photo-1551028719-00167b16eac5','photo-1591047139829-d91aecb6caea','photo-1617196034183-421b4040d20d','photo-1611312449408-fcece27cdbb7','photo-1605459783432-d09f41f1f2c7'] },
      m_footwear:{ names: ['White Sneakers','Running Shoes','Chunky Sole Sneakers','Canvas Shoes','Casual Loafers','Derby Shoes','Chukka Boots','Slip-On Sneakers','Basketball High-Tops','Sandals'], price: [799,999,1199,1399,1599,1799,1999,2199,2499,2999], img: ['photo-1542291026-7eec264c27ff','photo-1491553895911-0055eca6402d','photo-1600185365926-3a2ce3cdb9eb','photo-1523217582562-09d0def993a6','photo-1608231387042-66d1773070a5'] },
      m_watches: { names: ['Minimalist Watch','Chronograph Watch','Digital Sports Watch','Mesh Strap Watch','Leather Strap Watch','Smartwatch Basic','Dive Watch','Field Watch','Dress Watch','G-Shock Style Watch'], price: [999,1499,1999,2499,2999,3499,3999,4499,4999,5999], img: ['photo-1523275335684-37898b6baf30','photo-1508057198894-247b23fe5ade','photo-1533139502658-0198f920d8e8','photo-1434056886845-dac89ffe9b56','photo-1578985545062-69928b1d9587'] },
      m_acc:     { names: ['Cap/Snapback','Belt Leather','Wallet Bifold','Sunglasses','Beaded Bracelet','Dog Tag Necklace','Canvas Belt','Beanie Winter Hat','Wrist Band','Keychain Charm'], price: [199,299,399,499,599,699,799,899,999,1099], img: ['photo-1588850561407-ed78c282e89b','photo-1624222247344-550fb60583dc','photo-1566479179817-71f7e6e19ef7','photo-1511499767150-a48a237f0083','photo-1543163521-1bf539c55dd2'] },
    },
  },
  tech: {
    brands: ['Samsung','Apple','OnePlus','Xiaomi','realme','Noise','boAt','JBL','Sony','ASUS','Lenovo','HP','Dell','Logitech','Anker'],
    subMap: {
      t_phones:    { names: ['Galaxy S24 FE','iPhone 15','OnePlus 12R','Redmi Note 13 Pro','realme 12 Pro','Motorola Edge 50','Poco X6 Pro','Nothing Phone 2a','iQOO Z9','Vivo T3 Pro'], price: [9999,14999,19999,24999,29999,34999,39999,44999,49999,59999], img: ['photo-1511707171634-5f897ff02aa9','photo-1592750475338-74b7b21085ab','photo-1605236453806-6ff36851218e','photo-1609252925-95f79f45e24f','photo-1574944985070-8f3ebc6b79d2'] },
      t_laptops:   { names: ['IdeaPad Slim 3','HP 15s Intel','Dell Inspiron 15','VivoBook 15','MacBook Air M1','Legion 5 Gaming','ROG Strix G15','Aspire 5','Surface Laptop Go','Chromebook Flex'], price: [29999,34999,39999,44999,54999,64999,74999,84999,94999,119999], img: ['photo-1496181133206-80ce9b88a853','photo-1517336714731-489689fd1ca8','photo-1611078489935-0cb964de46d6','photo-1593642632559-0c6d3fc62b89','photo-1541807084-5c52b6b3adef'] },
      t_headphones:{ names: ['Sony WH-1000XM5','boAt Rockerz 550','JBL Tune 770NC','Noise One ANC','Sennheiser HD 450BT','realme Buds Air 5','OnePlus Bullets Z2','boAt Bassheads 900','Sony MDR-ZX310AP','Skullcandy Hesh'], price: [1299,1699,1999,2499,2999,3499,3999,4999,5999,7999], img: ['photo-1505740420928-5e560c06d30e','photo-1546435770-a3e426bf472b','photo-1484704849700-f032a568e944','photo-1583394838336-acd977736f90','photo-1487215078519-e21cc028cb29'] },
      t_earbuds:   { names: ['boAt Airdopes 141','realme Buds T300','Noise Buds VS104','OnePlus Nord Buds 2','Samsung Galaxy Buds FE','JBL Wave Beam','Redmi Buds 5 Pro','Nothing Ear (a)','Apple AirPods 3','Sony WF-1000XM5'], price: [799,999,1299,1599,1999,2499,2999,3499,3999,5999], img: ['photo-1590658268037-6bf12165a8df','photo-1606220945770-b5b6c2c55bf1','photo-1608043152269-423dbba4e7e1','photo-1598520106830-8c45c2035460','photo-1572536147248-ac59a8abfa4b'] },
      t_speakers:  { names: ['JBL Go 4','boAt Stone 352','Sony SRS-XB13','Bose SoundLink Flex','JBL Charge 5','Marshall Emberton II','Ultimate Ears Boom 3','Harman Kardon Onyx 7','Mivi Roam 2','Noise Tone Pro'], price: [1299,1599,1999,2499,2999,3499,3999,4999,5999,7999], img: ['photo-1608043152269-423dbba4e7e1','photo-1545454675-3531b543be5d','photo-1614680376739-414d95ff43df','photo-1608043152269-423dbba4e7e1','photo-1558089687-f282ffcbc0b4'] },
      t_powerbanks:{ names: ['Redmi 10000mAh PD','boAt Energy Bar 10K','Anker PowerCore 10K','Mi 20000mAh','realme 33W PB','Samsung 25W PB','Ambrane 20K PD','OnePlus SUPERVOOC','URBN 20K','TP-Link PB Fast Charge'], price: [799,999,1199,1299,1499,1599,1699,1799,1899,1999], img: ['photo-1609592806596-b2e3caf3d099','photo-1609592806596-b2e3caf3d099','photo-1623126908029-58cb08a2b272','photo-1601972599720-36938d4ecd31','photo-1611532736597-de2d4265fba3'] },
      t_chargers:  { names: ['65W GaN Charger','33W Fast Charger','Apple 20W USB-C','Anker Nano II 45W','Samsung 25W Adapter','boAt Deuce 100W','Mi 67W Turbo Charger','realme 240W Charger','Belkin 3-Port Charger','OnePlus Warp Charger'], price: [499,699,899,999,1099,1199,1299,1399,1499,1699], img: ['photo-1588599376442-3cbf9c67a6a7','photo-1601972599720-36938d4ecd31','photo-1609592806596-b2e3caf3d099','photo-1611532736597-de2d4265fba3','photo-1623126908029-58cb08a2b272'] },
      t_tablets:   { names: ['Redmi Pad SE','Samsung Tab A9','Realme Pad 2','Lenovo Tab M10 FHD','iPad (10th Gen)','Samsung Tab S9 FE','OnePlus Pad Go','Xiaomi Pad 6','HONOR Pad X9','Motorola Tab G62'], price: [9999,12999,14999,17999,24999,29999,34999,39999,44999,54999], img: ['photo-1544244015-0df4b3ffc6b0','photo-1561154464-82e9adf32764','photo-1502945015378-0e284ca1a5be','photo-1542751371-adc38448a05e','photo-1589739900266-43b2843f4c12'] },
      t_gaming:    { names: ['PS5 DualSense Controller','Xbox Controller Series X','Gaming Mouse Logitech G102','Mechanical Keyboard','Gaming Headset HyperX','Gaming Chair Corsair','RGB Mouse Pad XL','Nintendo Joy-Con','Steam Deck Cover','Gaming Monitor 144Hz'], price: [3999,4999,1999,2999,3499,6999,799,2499,999,12999], img: ['photo-1593305841991-05c297ba4575','photo-1586182987320-4f376d39d787','photo-1598550476439-6847785fcea6','photo-1541140532154-b024d705b90a','photo-1612287230202-1ff1d85d1bdf'] },
      t_smartwatch:{ names: ['boAt Wave Call 3','Noise ColorFit Pro 5','Samsung Galaxy Watch 6','Amazfit GTR 4','Garmin Venu Sq 2','Apple Watch SE','realme Watch 3','Fastrack Limitless FS1','Mi Watch S3','Fire-Boltt Ninja Pro'], price: [1499,1999,2499,2999,3499,3999,4999,5999,7999,9999], img: ['photo-1523275335684-37898b6baf30','photo-1508057198894-247b23fe5ade','photo-1434056886845-dac89ffe9b56','photo-1577803645773-f96470509666','photo-1619946794135-5bc917a27793'] },
    },
  },
  grocery: {
    brands: ['Amul','Haldiram','Britannia','Parle','Mother Dairy','Nestle','ITC','MDH','Everest','Tata','Patanjali','Aashirvaad','Fortune','Daawat','Real Fruit'],
    subMap: {
      g_fruits:   { names: ['Fresh Bananas 6pcs','Red Apples 1kg','Sweet Oranges 1kg','Kiwi Pack 6pcs','Mango Alphonso 1kg','Papaya Half Cut','Grapes Seedless 500g','Pomegranate 1pc','Watermelon Slice','Strawberries 250g'], price: [39,79,89,99,149,59,79,89,49,99], img: ['photo-1571771894821-ce9b6c11b08e','photo-1567306226416-28f0efdc88ce','photo-1619566636858-adf3ef46400b','photo-1610832958506-aa56368176cf','photo-1550258987-190a2d41a8ba'] },
      g_veggies:  { names: ['Tomatoes 500g','Onions 1kg','Potatoes 1kg','Spinach Bunch','Capsicum 250g','Broccoli 300g','Carrots 500g','Cucumber 3pcs','Green Peas 200g','Cauliflower 1pc'], price: [25,29,35,19,49,69,35,29,49,39], img: ['photo-1540420773420-3366772f4999','photo-1590165482129-1b8b27698780','photo-1518977676601-b53f82aba655','photo-1576045057995-568f588f82fb','photo-1588117305388-c2631a279f82'] },
      g_dairy:    { names: ['Amul Taaza Milk 1L','Mother Dairy Curd 400g','Amul Butter 100g','Britannia Cheese Slices','Amul Ghee 500ml','Nestle Milkmaid','Greek Yogurt 400g','Paneer Fresh 200g','Toned Milk 500ml','Condensed Milk 400g'], price: [65,45,55,89,285,99,89,95,32,99], img: ['photo-1550583724-b2692b85b150','photo-1628088062854-d1870b4553da','photo-1488477181946-6428a0291777','photo-1563636619-e9143da7973b','photo-1586201375761-83865001e31c'] },
      g_snacks:   { names: ['Lays Magic Masala 50g','Kurkure Masala Munch','Haldirams Bhujia 200g','Oreo Biscuits Pack','Digestive Marie Biscuit','Pringles Original','Maggi 2-Min Noodles 4pk','Tedhe Medhe Snack','Bingo Mad Angles','Too Yumm Makhana'], price: [20,20,89,55,45,199,75,20,25,99], img: ['photo-1576405515954-b32f24e4dfc3','photo-1566478989037-eec170784d0b','photo-1599490659213-e2b9527bd087','photo-1621939514649-280e2ee25f60','photo-1491553895911-0055eca6402d'] },
      g_beverages:{ names: ['Real Juice Mixed Fruit','Tropicana Orange 1L','Coca-Cola 2L','Sprite 1.5L','Red Bull Energy Drink','Bisleri Water 1L','Green Tea Box 25 bags','Nescafe 3-in-1 Pack','Horlicks Health Drink','Boost Energy Drink'], price: [55,99,55,49,115,20,145,129,299,199], img: ['photo-1563227812-0ea4c22e6cc8','photo-1622483767028-3f66f32aef97','photo-1546171753-97d7676e4602','photo-1588850561407-ed78c282e89b','photo-1596040033229-a9821ebd058d'] },
      g_staples:  { names: ['Aashirvaad Atta 5kg','Basmati Rice 5kg','Toor Dal 1kg','Chana Dal 1kg','Moong Dal 500g','Refined Oil 1L','Soyabean Oil 1L','Mustard Oil 500ml','Salt 1kg Pack','Sugar 1kg Pack'], price: [245,399,129,119,89,135,125,115,25,45], img: ['photo-1586201375761-83865001e31c','photo-1536304993881-ff86d42a5de7','photo-1612392166886-ee8475b03af2','photo-1574781862182-66de786e6df0','photo-1514190051997-0f6f39ca5cde'] },
      g_spices:   { names: ['MDH Garam Masala 100g','Everest Chilli Powder 200g','Kashmiri Red Chilli','Turmeric Powder 200g','Coriander Powder 200g','Cumin Seeds 100g','Cardamom Box 50g','Black Pepper Powder','Bay Leaves Pack','Desi Ghee Masala'], price: [65,79,89,55,55,69,149,79,35,199], img: ['photo-1596040033229-a9821ebd058d','photo-1614179689702-355944cd0918','photo-1528735602780-2552fd46c7af','photo-1596097635121-14b38c5d7a96','photo-1509358271058-acd22cc93898'] },
      g_bakery:   { names: ['Britannia Multigrain Bread','Harvest Gold White Bread','Croissant 4pcs','English Muffins 6pcs','Butter Cookies 200g','Muffin Chocolate 4pcs','Whole Wheat Roti','Pita Bread Pack','Bun Burger 6pcs','Sourdough Loaf'], price: [45,39,129,89,79,109,55,75,55,199], img: ['photo-1509440159596-0249088772ff','photo-1534620808146-d33bb39128b2','photo-1549931319-a545dcf3bc7c','photo-1571115177098-24ec42ed204d','photo-1608198399988-341b63a0da95'] },
    },
  },
  beauty: {
    brands: ['Mamaearth','Minimalist','The Ordinary','Lakme','L\'Oreal','Nykaa','Biotique','WOW','Himalaya','Plum','Kay Beauty','Dot & Key','Cetaphil','Neutrogena','Forest Essentials'],
    subMap: {
      b_skincare:  { names: ['SPF 50 Sunscreen 50ml','Vitamin C Serum 30ml','Hyaluronic Acid Serum','Niacinamide 10% Serum','Retinol 0.5% Serum','Moisturiser SPF 30','Night Cream 50ml','Face Wash Gel','Toner Balancing 200ml','Eye Cream 20ml'], price: [299,399,499,549,599,699,749,299,349,499], img: ['photo-1596462502278-27bfdc403348','photo-1620916566398-39f1143ab7be','photo-1556228720-195a672e8a03','photo-1571781926291-c477ebfd024b','photo-1526758097130-bab247274f58'] },
      b_haircare:  { names: ['Onion Shampoo 300ml','Argan Oil Hair Mask','Anti-Dandruff Shampoo','Keratin Hair Serum','Biotin Hair Oil 200ml','Leave-In Conditioner','Rice Water Shampoo','Hair Growth Serum','Deep Conditioner 200ml','Dry Shampoo Spray'], price: [249,299,349,399,449,399,329,499,349,299], img: ['photo-1522337360788-8b13dee7a37e','photo-1590439471364-192aa70c0b53','photo-1559056199-641a0ac8b55e','photo-1633681926022-84c23e8cb2d6','photo-1598440947619-2c35fc9aa908'] },
      b_makeup:    { names: ['Matte Lipstick','BB Cream SPF 30','Kohl Kajal','Mascara Volume','Concealer Full Coverage','Compact Powder','Blush Palette','Eyeshadow Palette','Highlighter Stick','Lip Liner Pencil'], price: [199,349,149,249,299,349,449,499,299,149], img: ['photo-1487412720507-e7ab37603c6f','photo-1522335789203-aabd1fc54bc9','photo-1586495777744-4e6b0f6b0b6a','photo-1512207736890-6ffed8a84e8d','photo-1503236823255-94609f598e71'] },
      b_fragrance: { names: ['Versace Eros EDT 50ml','Fogg Scent Xpressio','Wild Stone Edge Perfume','Engage Cologne W2','Park Avenue Voyage','Titan Skinn Nude','Titan Skinn Celeste','Denver Prestige Perfume','Axe Signature Denim','Paco Rabanne 1 Million'], price: [499,299,349,399,449,899,949,599,249,1499], img: ['photo-1541643600914-78b084683702','photo-1523293182086-7651a899d37f','photo-1592945403244-b3fbafd7f539','photo-1563170351-be54709cfd15','photo-1588776814546-ec7b13be1566'] },
      b_bodycare:  { names: ['Dove Body Lotion 400ml','WOW Aloe Vera Gel','Vitamin E Body Oil','Coffee Scrub 100g','Neem Body Wash 250ml','Coconut Butter Cream','Dettol Soap Pack 4','Rose Water Toner','Kojic Acid Body Lotion','Talc Powder Shower Fresh'], price: [199,249,299,349,199,299,149,149,349,99], img: ['photo-1570194065650-d99fb4bedf0a','photo-1608248543803-ba4f8c70ae0b','photo-1619459494994-cb8b04a5b826','photo-1631390090960-ec2413a9d68f','photo-1515377905703-c4788e51af15'] },
    },
  },
  ethnic_wear: {
    brands: ['FabIndia','W for Woman','Aurelia','Biba','Soch','Global Desi','Anouk','Jaipur Kurti','Shree','Meena Bazaar','Manyavar','Mohey','Ethnix','Vedic','Raw Mango'],
    subMap: {
      e_kurtis:   { names: ['Straight Print Kurti','Anarkali Flared Kurti','A-Line Kurta','Embroidered Festive Kurti','Cotton Daily Kurti','Silk Kurti','Rayon Block Print Kurti','Short Kurti with Leggings','Kaftan Style Kurti','Mirror Work Kurti'], price: [399,599,799,999,1199,1499,1699,1899,2199,2499], img: ['photo-1583391733956-3750e0ff4e8b','photo-1596755389378-c31d21fd1273','photo-1583391733956-3750e0ff4e8b','photo-1610030469983-98e550d6193c','photo-1617922001439-4a2e6562f328'] },
      e_sarees:   { names: ['Banarasi Silk Saree','Kanjivaram Pure Silk','Chanderi Cotton Saree','Georgette Party Saree','Chiffon Printed Saree','Linen Saree','Bengal Tant Saree','Bandhani Rajasthani Saree','Kalamkari Print Saree','Net Embroidered Saree'], price: [999,1999,2499,2999,3499,3999,4499,4999,5499,7999], img: ['photo-1610030469983-98e550d6193c','photo-1617922001439-4a2e6562f328','photo-1583391733956-3750e0ff4e8b','photo-1596755389378-c31d21fd1273','photo-1588117305388-c2631a279f82'] },
      e_lehengas: { names: ['Bridal Lehenga Choli','Semi-Bridal Lehenga','Net Lehenga Set','Cotton Chaniya Choli','Embroidered Lehenga','Printed Lehenga','Sequin Work Lehenga','Velvet Lehenga','Ombre Lehenga','Sharara Set'], price: [1499,1999,2499,2999,3499,3999,4999,5999,6999,8999], img: ['photo-1583391733956-3750e0ff4e8b','photo-1596755389378-c31d21fd1273','photo-1617922001439-4a2e6562f328','photo-1610030469983-98e550d6193c','photo-1588117305388-c2631a279f82'] },
      e_sherwanis:{ names: ['Royal Sherwani Gold','Slim Fit Wedding Sherwani','Indo-Western Sherwani','Jodhpuri Suit','Bandhgala Jacket','Nehru Jacket','Classic Achkan','Silk Sherwani Beige','Embroidered Sherwani','Modi Jacket Ethnic'], price: [2999,3999,4999,5999,6999,7999,8999,9999,11999,14999], img: ['photo-1617922001439-4a2e6562f328','photo-1596755389378-c31d21fd1273','photo-1610030469983-98e550d6193c','photo-1583391733956-3750e0ff4e8b','photo-1588117305388-c2631a279f82'] },
      e_kurtas:   { names: ['Linen Kurta Men','Cotton Kurta Set','Pathani Kurta','Kurta Pyjama Set','Embroidered Kurta','Block Print Kurta','Mandarin Collar Kurta','Lucknowi Chikankari Kurta','Silk Blend Kurta','Festival Kurta Set'], price: [599,799,999,1199,1399,1599,1799,1999,2199,2499], img: ['photo-1598033129183-c4f50c736f10','photo-1620012253295-c15cc3e65df4','photo-1603252109303-2751441dd157','photo-1617922001439-4a2e6562f328','photo-1610030469983-98e550d6193c'] },
    },
  },
  kids: {
    brands: ['Fisher-Price','LEGO','Hasbro','Funskool','Mattel','Milton','Pigeon','Mee Mee','Babyhug','Little Tikes','Chicco','LuvLap','Mothercare','Disney','Barbie'],
    subMap: {
      k_toys:    { names: ['RC Monster Truck','Barbie Dream House','LEGO City Set','Hot Wheels 5-Car Pack','Nerf N-Strike Blaster','Baby Doll Soft','Dinosaur Set 12pcs','Kitchen Toy Playset','Building Blocks 100pcs','Doctor Set Toy'], price: [299,499,699,899,1099,1299,1499,1699,1899,2199], img: ['photo-1558618666-fcd25c85cd64','photo-1515488042361-ee00e0ddd4e4','photo-1587654780291-39c9404d746b','photo-1530325553241-4f5c8895ae69','photo-1570395546900-e8dc8b6d9d9d'] },
      k_clothing:{ names: ['Cotton T-Shirt Boy','Frock Girls Cotton','Dungaree Boys','Pyjama Night Suit','School Uniform Shirt','Track Pant Kids','Ethnic Kurta Kids','Denim Jacket Kids','Hoodie Kids Warm','Party Dress Girls'], price: [199,249,299,349,399,449,499,549,599,699], img: ['photo-1519689680058-324335c77eba','photo-1622290291468-a28f7a7dc6a8','photo-1514090458221-65bb69cf63e6','photo-1519278409-1f56ab241ef4','photo-1471286174890-9c112ffca5b4'] },
      k_baby:    { names: ['Pampers Diapers M 60pc','Mee Mee Baby Lotion','Pigeon Baby Wipes','Dettol Baby Wash','Himalaya Baby Oil','Baby Powder 100g','Feeding Bottle 250ml','Silicone Pacifier','Baby Rattle Toy','Cerelac Wheat Stage 1'], price: [499,199,149,249,199,99,249,149,199,299], img: ['photo-1544367567-0f2fcb009e0b','photo-1515488042361-ee00e0ddd4e4','photo-1589793463571-aa77b3ef4c8a','photo-1517849845537-4d257902454a','photo-1522771739844-6a9f6d5f14af'] },
      k_games:   { names: ['Ludo Board Game','Monopoly Junior','Snakes & Ladders XL','UNO Card Game','Jenga Classic','Cluedo Junior','Chess Set Wooden','Puzzles 100pcs Kids','Memory Matching Game','Carrom Board Large'], price: [199,299,399,499,599,699,799,899,999,1199], img: ['photo-1606503153255-59d5e417b8f8','photo-1632501641765-e568d28b0015','photo-1610890716171-6b1bb98ffd09','photo-1514214246283-d8a5e7de31ab','photo-1557804506-669a67965ba0'] },
      k_edutoys: { names: ['Alphabets Flash Cards','Number Learning Board','Science Experiment Kit','Globe 8 inch Rotating','Wooden Puzzle Map India','DIY Robot Kit','Telescope Kids 50x','Microscope Kids Set','Abacus 13 Wires','Coding Blocks Kit'], price: [199,299,399,499,599,699,799,899,999,1199], img: ['photo-1503676260728-1c00da094a0b','photo-1562240020-ce31ccb0fa7f','photo-1583394838336-acd977736f90','photo-1484069560501-87d72b0e3d05','photo-1580196969807-cc6de06c05be'] },
    },
  },
  home: {
    brands: ['IKEA','Pepperfry','HomeTown','Urban Ladder','Fabindia','Wakefit','Sleepyhead','Godrej','Philips','Syska','Lifelong','Prestige','Hawkins','Milton','Borosil'],
    subMap: {
      h_decor:   { names: ['Macrame Wall Hanging','Boho Cushion Cover 2pcs','Ceramic Vase Set','Photo Frame Wooden','Fairy Lights 10m','Scented Candle Set','Himalayan Salt Lamp','Potted Succulent Plant','Dream Catcher Large','Wall Clock Minimalist'], price: [299,399,499,599,699,799,899,999,1099,1199], img: ['photo-1556228578-8c89e6adf883','photo-1555041469-a586c61ea9bc','photo-1493663284031-b7e3aefcae8e','photo-1549488344-cbb6c34a78f6','photo-1540932239986-30128078f3c5'] },
      h_kitchen: { names: ['Prestige Pressure Cooker 3L','Non-Stick Tawa 280mm','Borosil Mixing Bowls Set','Milton Casserole 1L','Steel Dinner Set 30pcs','Glass Jar Set 3pcs','Chopping Board Bamboo','Knife Set 5pcs','Vegetable Peeler','Silicone Spatula Set'], price: [899,699,599,499,999,399,299,599,149,249], img: ['photo-1556909114-f6e7ad7d3136','photo-1584568694244-14fbdf83bd30','photo-1466637574441-749b8f19452f','photo-1565538810643-b5bdb714032a','photo-1556910103-1c02745aae4d'] },
      h_bedding: { names: ['Cotton Bedsheet King','Microfiber Pillow 2pcs','Quilt/Razai Double Bed','Mattress Protector','AC Blanket Light','Weighted Blanket 7kg','Pillow Cover 4pcs Set','Single Fitted Sheet','Duvet Cover Set','Mosquito Net Double Bed'], price: [799,699,1299,599,899,1999,399,499,999,399], img: ['photo-1522771739844-6a9f6d5f14af','photo-1584100936595-c0654b55a2e2','photo-1555041469-a586c61ea9bc','photo-1560185008-b033106af5c3','photo-1493663284031-b7e3aefcae8e'] },
      h_lighting:{ names: ['Syska LED Bulb 9W','Philips Batten 20W','Decorative String Light','RGB LED Strip 5m','Night Lamp Bedside','Desk Lamp Study','Smart Bulb WiFi 9W','LED Panel Light','Garden Solar Light','Fairy Light Curtain'], price: [149,299,349,499,599,699,799,899,399,549], img: ['photo-1507003211169-0a1dd7228f2d','photo-1524484485831-a92ffc0de03f','photo-1558002038-1055907df827','photo-1586023492125-27b2c045efd7','photo-1565814329452-e1efa11c5b89'] },
    },
  },
  quickbuy: {
    brands: ['Amul','Britannia','Nestle','Mother Dairy','Parle','Maggi','Haldiram','Bisleri','Fortune','ITC'],
    subMap: {
      qb_general: { names: ['Amul Milk 1L','Whole Wheat Bread Loaf','Farm Fresh Eggs 6pcs','Banana Bunch 6pcs','Bisleri Water 1L','Maggi 2-Min Noodles','Mixed Fruit Juice 1L','Greek Yogurt 400g','Lays Chips 50g','Digestive Biscuits'], price: [65,45,49,39,20,75,55,89,20,45], img: ['photo-1550583724-b2692b85b150','photo-1509440159596-0249088772ff','photo-1518977676601-b53f82aba655','photo-1571771894821-ce9b6c11b08e','photo-1563227812-0ea4c22e6cc8'] },
    },
  },
};

// ─── DISTRIBUTIONS ────────────────────────────────────────────────────────────
// How many products per subcategory per state
const DIST = {
  women:       { perSub: 8, states: 5 },   // 10 subs × 8 × 5 = 400
  men:         { perSub: 7, states: 5 },   // 10 subs × 7 × 5 = 350
  tech:        { perSub: 8, states: 5 },   // 10 subs × 8 × 5 = 400
  grocery:     { perSub: 9, states: 5 },   //  8 subs × 9 × 5 = 360
  beauty:      { perSub: 11, states: 5 },  //  5 subs × 11 × 5= 275
  ethnic_wear: { perSub: 10, states: 5 },  //  5 subs × 10 × 5= 250
  kids:        { perSub: 10, states: 5 },  //  5 subs × 10 × 5= 250
  home:        { perSub: 12, states: 5 },  //  4 subs × 12 × 5= 240
  quickbuy:    { perSub: 5,  states: 5 },  //  1 sub  ×  5 × 5= 25
};

// ─── GENERATOR ───────────────────────────────────────────────────────────────
function pick(arr, idx) { return arr[idx % arr.length]; }
function rnd(min, max, seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + Math.floor((x - Math.floor(x)) * (max - min + 1));
}
function rating(seed) { return parseFloat((3.5 + (rnd(0, 15, seed) / 10)).toFixed(1)); }
function reviews(seed) { return rnd(12, 9800, seed); }

function generateProducts() {
  const products = [];
  let globalIdx = 0;

  for (const [catId, catConf] of Object.entries(DIST)) {
    const catData = DATA[catId];
    const stateSlice = STATES.slice(0, catConf.states);
    const subs = Object.entries(catData.subMap);

    for (const [subId, subData] of subs) {
      for (let si = 0; si < stateSlice.length; si++) {
        const state = stateSlice[si];

        for (let pi = 0; pi < catConf.perSub; pi++) {
          globalIdx++;
          const seed = globalIdx * 137 + si * 31 + pi * 17;

          const nameIdx    = (pi + si) % subData.names.length;
          const basePrice  = subData.price[nameIdx % subData.price.length];
          const brand      = pick(catData.brands, globalIdx + si);
          const imgBase    = pick(subData.img, globalIdx + pi);
          const city       = pick(state.cities, globalIdx + pi);
          const mrp        = Math.round(basePrice * (1 + rnd(10, 40, seed) / 100));
          const discount   = Math.round(((mrp - basePrice) / mrp) * 100);
          const rat        = rating(seed);
          const rev        = reviews(seed);
          const isNew      = rnd(0, 10, seed + 1) > 7;
          const isTrending = rnd(0, 10, seed + 2) > 6;
          const isBest     = rnd(0, 10, seed + 3) > 7;
          const isQuick    = catId === 'quickbuy' || (catId === 'grocery' && rnd(0, 1, seed) === 1);
          const delivMins  = isQuick ? pick([10, 15, 20], seed) : pick([30, 45, 60, 90, 120], seed);

          const name = `${subData.names[nameIdx]}`;
          const productId = `prod_${catId}_${String(globalIdx).padStart(4, '0')}`;

          const subCatInfo = SUBCATEGORIES.find(s => s.id === subId);
          const catInfo    = CATEGORIES.find(c => c.id === catId);

          const tags = [
            isTrending ? 'Trending' : null,
            isBest ? 'Bestseller' : null,
            isNew ? 'New Arrival' : null,
            isQuick ? 'Quick Delivery' : null,
            state.name,
            brand,
            subCatInfo?.name,
          ].filter(Boolean);

          products.push({
            productId,
            id: productId,
            title: name,
            name,
            shortTitle: name.split('(')[0].trim(),
            description: `${name} — premium quality ${subCatInfo?.name || catId} from ${brand}. Available for fast delivery in ${city}, ${state.name}. Genuine product with manufacturer warranty.`,
            brand,
            brandId: brand.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            categoryId: catId,
            categoryName: catInfo?.name || catId,
            subcategoryId: subId,
            subcategoryName: subCatInfo?.name || subId,
            stateId: state.id,
            stateName: state.name,
            city,
            price: basePrice,
            mrp,
            discountPercentage: discount,
            rating: rat,
            reviewCount: rev,
            stock: rnd(5, 200, seed),
            availability: 'In Stock',
            images: [
              `https://images.unsplash.com/${imgBase}?w=600&auto=format&fit=crop&q=80`,
              `https://images.unsplash.com/${pick(subData.img, globalIdx + pi + 1)}?w=600&auto=format&fit=crop&q=80`,
            ],
            thumbnail: `https://images.unsplash.com/${imgBase}?w=400&auto=format&fit=crop&q=80`,
            isTrending,
            isBestSeller: isBest,
            isNewArrival: isNew,
            isQuickDelivery: isQuick,
            deliveryMinutes: delivMins,
            deliveryTime: `${delivMins} mins`,
            tags,
            specifications: buildSpecs(catId, seed),
            colors: buildColors(catId, seed),
            sizes: buildSizes(catId, seed),
            warranty: rnd(0, 1, seed) ? '1 Year Manufacturer Warranty' : '6 Month Brand Warranty',
            returnPolicy: '7 Days Easy Return & Instant Refund',
            cashOnDelivery: true,
            emiAvailable: basePrice >= 3000,
            _seededAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  return products;
}

function buildSpecs(catId, seed) {
  const specMap = {
    women:       { 'Material': pick(['Cotton','Polyester','Rayon','Linen','Silk'], seed), 'Fit': pick(['Regular','Slim','Loose','Oversized'], seed+1) },
    men:         { 'Material': pick(['Cotton','Denim','Polyester','Linen'], seed), 'Fit': pick(['Slim','Regular','Relaxed','Baggy'], seed+1) },
    tech:        { 'Connectivity': pick(['Bluetooth 5.3','USB-C','WiFi 6','Wired'], seed), 'Battery': pick(['5000mAh','4000mAh','6000mAh','3500mAh'], seed+1) },
    grocery:     { 'Weight': pick(['250g','500g','1kg','2kg','5kg'], seed), 'Shelf Life': pick(['3 days','7 days','30 days','6 months'], seed+1) },
    beauty:      { 'Skin Type': pick(['All Skin Types','Oily','Dry','Sensitive','Combination'], seed), 'Volume': pick(['30ml','50ml','100ml','200ml','250ml'], seed+1) },
    ethnic_wear: { 'Fabric': pick(['Cotton','Silk','Georgette','Chiffon','Rayon'], seed), 'Work': pick(['Embroidered','Printed','Plain','Woven'], seed+1) },
    kids:        { 'Age Group': pick(['0-2 years','2-5 years','5-8 years','8-12 years'], seed), 'Material': pick(['Plastic','Wood','Fabric','Metal'], seed+1) },
    home:        { 'Material': pick(['Wood','Metal','Ceramic','Fabric','Glass'], seed), 'Dimensions': pick(['30x30cm','40x40cm','60x60cm','Large','Medium'], seed+1) },
    quickbuy:    { 'Weight': pick(['250g','500g','1L','1kg'], seed), 'Type': 'Quick Delivery Essential' },
  };
  return specMap[catId] || {};
}

function buildColors(catId, seed) {
  if (['grocery','tech'].includes(catId)) return [];
  const palette = ['Black','White','Red','Blue','Green','Yellow','Pink','Purple','Orange','Grey','Navy','Beige','Olive','Maroon','Teal'];
  const count = 2 + (seed % 3);
  return Array.from({ length: count }, (_, i) => ({ id: `c_${i}`, name: pick(palette, seed + i) }));
}

function buildSizes(catId, seed) {
  if (['grocery','tech','beauty','home'].includes(catId)) return [];
  const sizeSets = {
    women:       ['XS','S','M','L','XL','XXL'],
    men:         ['S','M','L','XL','XXL','3XL'],
    ethnic_wear: ['S','M','L','XL','XXL','Free Size'],
    kids:        ['2Y','4Y','6Y','8Y','10Y','12Y'],
    quickbuy:    [],
  };
  const sizes = sizeSets[catId] || ['S','M','L','XL'];
  return sizes.map((s, i) => ({ id: `s_${i}`, name: s }));
}

// ─── FIRESTORE HELPERS ────────────────────────────────────────────────────────
function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function purgeCollection(collName) {
  const snap = await getDocs(collection(db, collName));
  if (snap.empty) { console.log(`  ℹ️  '${collName}' already empty.`); return 0; }
  console.log(`  🗑️  Deleting ${snap.size} docs from '${collName}'…`);
  let total = 0;
  for (const batchDocs of chunk(snap.docs, 400)) {
    const batch = writeBatch(db);
    batchDocs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    total += batchDocs.length;
  }
  console.log(`  ✅ '${collName}' cleared (${total} docs).`);
  return total;
}

async function seedCollection(collName, items, idField) {
  if (!items?.length) { console.log(`  ⚠️  No items for '${collName}'.`); return 0; }
  console.log(`  📤 Seeding ${items.length} docs → '${collName}'…`);
  let total = 0;
  for (const batchItems of chunk(items, 400)) {
    const batch = writeBatch(db);
    batchItems.forEach(item => {
      const id = item[idField] || item.id;
      batch.set(doc(collection(db, collName), String(id)), item);
    });
    await batch.commit();
    total += batchItems.length;
    process.stdout.write(`     ${total}/${items.length} done\r`);
  }
  console.log(`  ✅ '${collName}' — ${total} docs seeded.       `);
  return total;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🏪  EasyBuy — Full Catalog Generator + Seeder');
  console.log('━'.repeat(55));

  // Generate
  console.log('\n⚙️   Generating product catalog…');
  const products = generateProducts();
  console.log(`✅  Generated ${products.length} products across ${Object.keys(DIST).length} categories.\n`);

  // Purge
  console.log('━━━ STEP 1: Purging old data ━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔒  untouched: users, orders, cart, wishlist, addresses\n');
  for (const c of ['products','states','categories','subcategories','trending_banners']) {
    await purgeCollection(c);
  }

  // Seed
  console.log('\n━━━ STEP 2: Seeding fresh data ━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  await seedCollection('states',        STATES,       'id');
  await seedCollection('categories',    CATEGORIES,   'id');
  await seedCollection('subcategories', SUBCATEGORIES,'id');
  await seedCollection('products',      products,     'productId');

  // Summary
  const bycat = {};
  products.forEach(p => { bycat[p.categoryId] = (bycat[p.categoryId]||0)+1; });
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉  DONE! Product breakdown:');
  Object.entries(bycat).sort((a,b)=>b[1]-a[1]).forEach(([cat,count]) => {
    console.log(`    ${cat.padEnd(15)} ${count} products`);
  });
  console.log(`\n    TOTAL: ${products.length} products`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌  Fatal error:', err.message || err);
  process.exit(1);
});
