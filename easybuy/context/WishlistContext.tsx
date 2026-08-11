import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

  // Load Wishlist on mount
  useEffect(() => {
    async function loadWishlistData() {
      try {
        const localData = await AsyncStorage.getItem('easybuy_wishlist_items');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            setWishlistItems(parsed);
          }
        }

        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists() && snap.data().wishlist) {
            setWishlistItems(snap.data().wishlist);
            await AsyncStorage.setItem('easybuy_wishlist_items', JSON.stringify(snap.data().wishlist));
          }
        }
      } catch (e) {
        console.log('Error loading wishlist:', e);
      }
    }
    loadWishlistData();
  }, []);

  const persistWishlist = async (items: WishlistItem[]) => {
    try {
      await AsyncStorage.setItem('easybuy_wishlist_items', JSON.stringify(items));
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setWishlistItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      persistWishlist(updated);
      return updated;
    });
  };

  const clearWishlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setWishlistItems([]);
    persistWishlist([]);
  };

  const openWishlist = () => {
    Haptics.selectionAsync().catch(() => {});
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
