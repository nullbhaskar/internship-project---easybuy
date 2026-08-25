/**
 * Shared TypeScript type definitions for the EasyBuy app.
 * Centralises all domain types to avoid duplication across screens.
 */

// ─── Product ────────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductColor {
  id: string;
  name: string;
  hex?: string;
}

export interface ProductSize {
  id: string;
  name: string;
  available?: boolean;
}

export interface Product {
  id: string;
  title: string;
  name?: string;
  shortTitle?: string;
  description?: string;
  price: number;
  mrp?: number;
  brand?: string;
  brandId?: string;
  category?: string;
  subcategory?: string;
  thumbnail?: string;
  images?: string[];
  stock?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  isQuickBuy?: boolean;
  isQuickDelivery?: boolean;
  colors?: ProductColor[];
  sizes?: ProductSize[];
  specifications?: Record<string, string>;
  state?: string;
  city?: string;
}

export type AdminProduct = Product;

// ─── Order ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  phone?: string;
  email?: string;
  status: OrderStatus;
  items?: OrderItem[];
  cartItems?: OrderItem[];
  products?: OrderItem[];
  totalAmount: number;
  shippingAddress?: ShippingAddress;
  address?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ─── User ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  fullName?: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;
  isAdmin?: boolean;
  createdAt?: string | Date;
}

// ─── Cart ───────────────────────────────────────────────────────────────────

export interface CartItem {
  id?: string;
  productId: string;
  title: string;
  name?: string;
  price: number;
  mrp?: number;
  quantity: number;
  thumbnail?: string;
  image?: string;
  selectedColor?: string;
  selectedSize?: string;
}

// ─── Address ────────────────────────────────────────────────────────────────

export interface SavedAddress {
  id: string;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}
