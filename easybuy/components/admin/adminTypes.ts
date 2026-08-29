export type AdminSection = 'dashboard' | 'products' | 'orders' | 'stock' | 'aicontrol';

export interface AdminProduct {
  id: string;
  productId?: string;
  title?: string;
  name?: string;
  shortTitle?: string;
  description?: string;
  longDescription?: string;
  brand?: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  thumbnail?: string;
  images?: string[];
  price?: number | string;
  priceNumber?: number;
  mrp?: number;
  stock?: number | string;
  discountPct?: string;
  discountPercentage?: number;
  isQuickDelivery?: boolean;
  isQuickBuy?: boolean;
  deliveryTime?: string;
  rating?: number;
  reviewCount?: number;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface AdminCategory {
  id: string;
  name?: string;
  categoryId?: string;
  displayOrder?: number;
  productCount?: number;
  image?: string;
  icon?: string;
  gradient?: [string, string];
}

export interface AdminOrder {
  id: string;
  orderId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  quantity?: number;
  totalAmount?: number | string;
  status?: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  products?: { id: string; title: string; price: string; quantity: number; image: string }[];
  currentStepIndex?: number;
  [key: string]: any;
}

export type StockStatusFilter = 'all' | 'inStock' | 'lowStock' | 'outOfStock';
export type ProductSortOption = 'newest' | 'priceLow' | 'priceHigh' | 'stockLow' | 'stockHigh';
export type OrderStatusFilter = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
