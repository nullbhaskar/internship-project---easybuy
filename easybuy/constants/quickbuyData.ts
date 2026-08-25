export interface QBProduct {
  id: string;
  name: string;
  weight: string;
  price: string;
  originalPrice?: string;
  image: string;
}

export interface QBCategory {
  id: string;
  name: string;
  iconName: string;
  products: QBProduct[];
}

export const QB_CATEGORIES: QBCategory[] = [
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
      { id: 'p1',  name: 'Fresh Milk',       weight: '1 L',    price: '₹52',  originalPrice: '₹58', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
      { id: 'p3',  name: 'Farm Fresh Eggs',  weight: 'Pack 6', price: '₹38',  image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400' },
      { id: 'p10', name: 'Amul Butter',      weight: '100g',   price: '₹54',  image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400' },
      { id: 'p11', name: 'Paneer (Fresh)',   weight: '200g',   price: '₹75',  image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=400' },
      { id: 'p12', name: 'Curd (Dahi)',      weight: '400g',   price: '₹30',  image: 'https://images.unsplash.com/photo-1574880993510-91a5390eb142?w=400' },
    ],
  },
  {
    id: 'snacks',
    name: 'Snacks & Drinks',
    iconName: 'fast-food-outline',
    products: [
      { id: 'p4',  name: 'Maggi Noodles',    weight: '70g',    price: '₹15',  image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400' },
      { id: 'p8',  name: "Lay's Chips",      weight: '52g',    price: '₹20',  image: 'https://images.unsplash.com/photo-1576405515954-b32f24e4dfc3?w=400' },
      { id: 'p7',  name: 'Coca-Cola',        weight: '2 L',    price: '₹85',  image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400' },
      { id: 'p13', name: 'Oreo Biscuits',    weight: '120g',   price: '₹30',  image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
      { id: 'p14', name: 'Red Bull',         weight: '250ml',  price: '₹115', image: 'https://images.unsplash.com/photo-1584852951759-3382f716612d?w=400' },
    ],
  },
  {
    id: 'fruits',
    name: 'Fruits & Veg',
    iconName: 'leaf-outline',
    products: [
      { id: 'p5',  name: 'Fresh Bananas',    weight: '1 Bunch',price: '₹27',  image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400' },
      { id: 'p9',  name: 'Fresh Tomatoes',   weight: '500g',   price: '₹18',  image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' },
      { id: 'p15', name: 'Onions',           weight: '1 kg',   price: '₹25',  image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400' },
      { id: 'p16', name: 'Potatoes',         weight: '1 kg',   price: '₹20',  image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' },
      { id: 'p17', name: 'Apples (Fuji)',    weight: '4 pcs',  price: '₹120', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=400' },
    ],
  },
];
