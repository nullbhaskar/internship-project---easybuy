import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { GuestAuthModal } from '../components/auth/GuestAuthModal';

export type AuthStateType = 'authenticated' | 'guest' | 'logged_out';

interface AuthContextType {
  authState: AuthStateType;
  isAuthenticated: boolean;
  isGuest: boolean;
  user: User | null;
  setGuestMode: () => Promise<void>;
  exitGuestMode: () => Promise<void>;
  requireAuth: (actionPrompt?: string, onAuthenticated?: () => void) => boolean;
  openAuthModal: (actionPrompt?: string) => void;
  closeAuthModal: () => void;
}

const GUEST_STORAGE_KEY = 'easybuy_guest_mode';

const AuthContext = createContext<AuthContextType>({
  authState: 'logged_out',
  isAuthenticated: false,
  isGuest: false,
  user: null,
  setGuestMode: async () => {},
  exitGuestMode: async () => {},
  requireAuth: () => false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthStateType>('logged_out');
  const [user, setUser] = useState<User | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState<string | undefined>(undefined);

  // Synchronize Firebase Auth & local guest storage
  useEffect(() => {
    let isMounted = true;

    // Check local guest mode flag
    const checkLocalGuestState = async (firebaseUser: User | null) => {
      try {
        if (firebaseUser) {
          // If we have a real Firebase user, clear guest mode flag
          await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
          if (isMounted) {
            setUser(firebaseUser);
            setAuthState('authenticated');
          }
        } else {
          // No Firebase user - check if guest mode was enabled
          const isGuestStored = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
          if (isMounted) {
            setUser(null);
            if (isGuestStored === 'true') {
              setAuthState('guest');
            } else {
              setAuthState('logged_out');
            }
          }
        }
      } catch (e) {
        console.log('Error initializing auth state:', e);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      checkLocalGuestState(firebaseUser);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const setGuestMode = async () => {
    try {
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
      if (!auth.currentUser) {
        setAuthState('logged_out');
      }
    } catch (e) {
      console.log('Error exiting guest mode:', e);
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
   * Call before any restricted action.
   * If authenticated -> runs callback (if provided) and returns true.
   * If guest/logged_out -> opens GuestAuthModal and returns false.
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
  const isAuthenticated = authState === 'authenticated';

  return (
    <AuthContext.Provider
      value={{
        authState,
        isAuthenticated,
        isGuest,
        user,
        setGuestMode,
        exitGuestMode,
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
