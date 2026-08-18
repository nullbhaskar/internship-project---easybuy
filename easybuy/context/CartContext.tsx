import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  image?: string;
  quantity: number;
  selectedVariant?: string;
  unit?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  deliveryFee: 0,
  totalAmount: 0,
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isGuest, isAuthenticated, requireAuth } = useAuth();

  // Load Cart from AsyncStorage and Firestore on mount / auth change
  useEffect(() => {
    async function loadCartData() {
      if (isGuest) {
        setCartItems([]);
        return;
      }

      try {
        const localData = await AsyncStorage.getItem('easybuy_cart_items');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        }

        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists() && snap.data().cart) {
            setCartItems(snap.data().cart);
            await AsyncStorage.setItem('easybuy_cart_items', JSON.stringify(snap.data().cart));
          }
        }
      } catch (e) {
        console.log('Error loading cart:', e);
      }
    }
    loadCartData();
  }, [isGuest, isAuthenticated]);

  // Save Cart state helper
  const persistCart = async (items: CartItem[]) => {
    if (isGuest || !auth.currentUser) return;
    try {
      await AsyncStorage.setItem('easybuy_cart_items', JSON.stringify(items));
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { cart: items }, { merge: true });
      }
    } catch (e) {
      console.log('Error saving cart:', e);
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    if (!requireAuth('add items to your cart')) {
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const addQty = item.quantity || 1;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === item.id);
      let updated: CartItem[];
      if (existingIdx > -1) {
        updated = prev.map((i, idx) =>
          idx === existingIdx ? { ...i, quantity: i.quantity + addQty } : i
        );
      } else {
        updated = [...prev, { ...item, quantity: addQty }];
      }
      persistCart(updated);
      return updated;
    });
  };

  const removeFromCart = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      persistCart(updated);
      return updated;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    Haptics.selectionAsync().catch(() => {});
    setCartItems((prev) => {
      const updated = prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];

      persistCart(updated);
      return updated;
    });
  };

  const clearCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setCartItems([]);
    persistCart([]);
  };

  const openCart = () => {
    if (!requireAuth('view your shopping cart')) {
      return;
    }
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  // Calculations
  const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const subtotal = cartItems.reduce((acc, curr) => {
    const numericPrice = typeof curr.price === 'number'
      ? curr.price
      : (parseInt(String(curr.price || '').replace(/[^\d]/g, ''), 10) || 0);
    return acc + numericPrice * curr.quantity;
  }, 0);

  const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const totalAmount = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        totalAmount,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
