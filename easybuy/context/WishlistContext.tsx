import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export interface WishlistItem {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  rating?: string;
  image?: string;
  tag?: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  totalWishlistItems: number;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  toggleWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
  clearWishlist: () => {},
  totalWishlistItems: 0,
  isWishlistOpen: false,
  openWishlist: () => {},
  closeWishlist: () => {},
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { isGuest, isAuthenticated, user, requireAuth } = useAuth();

  // Load Wishlist on mount / auth change
  useEffect(() => {
    async function loadWishlistData() {
      // Always clear wishlist first on user change (prevents cross-user leakage)
      setWishlistItems([]);

      if (isGuest || !isAuthenticated) {
        return;
      }

      try {
        const activeUid = user?.uid || auth.currentUser?.uid;
        if (activeUid) {
          const userDocRef = doc(db, 'users', activeUid);
          const snap = await getDoc(userDocRef);
          if (snap.exists() && snap.data().wishlist) {
            setWishlistItems(snap.data().wishlist);
          }
        }
      } catch (e) {
        console.log('Error loading wishlist:', e);
      }
    }
    loadWishlistData();
  }, [isGuest, isAuthenticated, user?.uid]);

  const persistWishlist = async (items: WishlistItem[]) => {
    if (isGuest) return;
    try {
      await AsyncStorage.setItem('easybuy_wishlist_items', JSON.stringify(items));
      const activeUid = user?.uid || auth.currentUser?.uid;
      if (activeUid) {
        const userDocRef = doc(db, 'users', activeUid);
        await setDoc(userDocRef, { wishlist: items }, { merge: true });
      }
    } catch (e) {
      console.log('Error saving wishlist:', e);
    }
  };

  const isInWishlist = (id: string) => {
    return wishlistItems.some((i) => i.id === id);
  };

  const toggleWishlist = (item: WishlistItem) => {
    if (!requireAuth('save items to your wishlist')) {
      return;
    }

    const exists = isInWishlist(item.id);
    if (exists) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setWishlistItems((prev) => {
        const updated = prev.filter((i) => i.id !== item.id);
        persistWishlist(updated);
        return updated;
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setWishlistItems((prev) => {
        const updated = [item, ...prev];
        persistWishlist(updated);
        return updated;
      });
    }
  };

  const removeFromWishlist = (id: string) => {
    if (isGuest) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setWishlistItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      persistWishlist(updated);
      return updated;
    });
  };

  const clearWishlist = () => {
    if (isGuest) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setWishlistItems([]);
    persistWishlist([]);
  };

  const openWishlist = () => {
    if (!requireAuth('view your saved wishlist')) {
      return;
    }
    setIsWishlistOpen(true);
  };

  const closeWishlist = () => {
    setIsWishlistOpen(false);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        totalWishlistItems: wishlistItems.length,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
