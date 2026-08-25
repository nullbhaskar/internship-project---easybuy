import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { GuestAuthModal } from '../components/auth/GuestAuthModal';

export type AuthStateType = 'authenticated' | 'guest' | 'logged_out';

export interface EasyBuyUser {
  uid: string;
  email: string;
  fullName?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  photoURL?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  authState: AuthStateType;
  isAuthenticated: boolean;
  isGuest: boolean;
  user: EasyBuyUser | null;
  setGuestMode: () => Promise<void>;
  exitGuestMode: () => Promise<void>;
  setAuthenticatedUser: (user: EasyBuyUser) => Promise<void>;
  logout: () => Promise<void>;
  requireAuth: (actionPrompt?: string, onAuthenticated?: () => void) => boolean;
  openAuthModal: (actionPrompt?: string) => void;
  closeAuthModal: () => void;
}

const GUEST_STORAGE_KEY = 'easybuy_guest_mode';
const USER_SESSION_KEY = 'easybuy_user_session';

const AuthContext = createContext<AuthContextType>({
  authState: 'logged_out',
  isAuthenticated: false,
  isGuest: false,
  user: null,
  setGuestMode: async () => {},
  exitGuestMode: async () => {},
  setAuthenticatedUser: async () => {},
  logout: async () => {},
  requireAuth: () => false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthStateType>('logged_out');
  const [user, setUser] = useState<EasyBuyUser | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState<string | undefined>(undefined);

  // Synchronize Firebase Auth & local session storage
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // 1. First check if a stored user session exists
        const storedSession = await AsyncStorage.getItem(USER_SESSION_KEY);
        if (storedSession) {
          const parsedUser = JSON.parse(storedSession) as EasyBuyUser;
          if (parsedUser && parsedUser.email) {
            await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
            if (isMounted) {
              setUser(parsedUser);
              setAuthState('authenticated');
            }
            return;
          }
        }

        // 2. Check if Firebase currentUser exists
        if (auth.currentUser) {
          const fbUser = auth.currentUser;
          let profileData: EasyBuyUser = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            fullName: fbUser.displayName || 'EasyBuy User',
            photoURL: fbUser.photoURL || undefined,
          };

          try {
            const snap = await getDoc(doc(db, 'users', fbUser.uid));
            if (snap.exists()) {
              const d = snap.data();
              profileData = {
                ...profileData,
                fullName: d.fullName || profileData.fullName,
                phone: d.phone,
                gender: d.gender,
                dob: d.dob,
              };
            }
          } catch {}

          await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
          await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(profileData));
          if (isMounted) {
            setUser(profileData);
            setAuthState('authenticated');
          }
          return;
        }

        // 3. Otherwise check if Guest mode was set
        const isGuestStored = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
        if (isMounted) {
          if (isGuestStored === 'true') {
            setUser(null);
            setAuthState('guest');
          } else {
            setUser(null);
            setAuthState('logged_out');
          }
        }
      } catch (e) {
        console.log('Error initializing auth context:', e);
      }
    };

    initAuth();

    // Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      if (firebaseUser) {
        let profile: EasyBuyUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: firebaseUser.displayName || 'EasyBuy User',
          photoURL: firebaseUser.photoURL || undefined,
        };

        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            const d = snap.data();
            profile = {
              ...profile,
              fullName: d.fullName || profile.fullName,
              phone: d.phone,
              gender: d.gender,
              dob: d.dob,
            };
          }
        } catch {}

        await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
        await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
        setUser(profile);
        setAuthState('authenticated');
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const setAuthenticatedUser = async (userData: EasyBuyUser) => {
    try {
      await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
      await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
      setUser(userData);
      setAuthState('authenticated');
    } catch (e) {
      console.log('Error setting authenticated user:', e);
    }
  };

  const setGuestMode = async () => {
    try {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
      await AsyncStorage.setItem(GUEST_STORAGE_KEY, 'true');
      setUser(null);
      setAuthState('guest');
    } catch (e) {
      console.log('Error activating guest mode:', e);
    }
  };

  const exitGuestMode = async () => {
    try {
      await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
      const storedSession = await AsyncStorage.getItem(USER_SESSION_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        setUser(parsed);
        setAuthState('authenticated');
      } else {
        setAuthState('logged_out');
      }
    } catch (e) {
      console.log('Error exiting guest mode:', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
      await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
      await AsyncStorage.removeItem('isAdmin');
      // Clear user-specific data so next login starts fresh
      await AsyncStorage.removeItem('easybuy_cart_items');
      await AsyncStorage.removeItem('easybuy_wishlist_items');
      try {
        signOut(auth).catch(() => {});
      } catch {}
      setUser(null);
      setAuthState('logged_out');
    } catch (e) {
      console.log('Logout error:', e);
    }
  };

  const openAuthModal = (actionPrompt?: string) => {
    setAuthModalPrompt(actionPrompt);
    setAuthModalVisible(true);
  };

  const closeAuthModal = () => {
    setAuthModalVisible(false);
    setAuthModalPrompt(undefined);
  };

  /**
   * Universal Auth Guard Helper
   */
  const requireAuth = (actionPrompt?: string, onAuthenticated?: () => void): boolean => {
    if (authState === 'authenticated' && user) {
      onAuthenticated?.();
      return true;
    }

    openAuthModal(actionPrompt);
    return false;
  };

  const isGuest = authState === 'guest';
  const isAuthenticated = authState === 'authenticated' && user !== null;

  return (
    <AuthContext.Provider
      value={{
        authState,
        isAuthenticated,
        isGuest,
        user,
        setGuestMode,
        exitGuestMode,
        setAuthenticatedUser,
        logout,
        requireAuth,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      <GuestAuthModal
        visible={authModalVisible}
        onClose={closeAuthModal}
        actionPrompt={authModalPrompt}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
