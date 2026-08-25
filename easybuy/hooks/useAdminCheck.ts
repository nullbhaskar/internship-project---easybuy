/**
 * Custom hook to manage authentication state and admin access checks.
 *
 * Handles reading admin status from AsyncStorage and Firebase Auth,
 * then exposes a simple boolean for components to use.
 *
 * Usage:
 *   const { isAdmin, isLoading } = useAdminCheck();
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/firebase';

const ADMIN_EMAIL = 'admineasybuy@gmail.com';

interface AdminCheckResult {
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAdminCheck(): AdminCheckResult {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      try {
        const stored = await AsyncStorage.getItem('isAdmin');
        const isStoredAdmin = stored === 'true';
        const isFirebaseAdmin = auth.currentUser?.email === ADMIN_EMAIL;

        if (mounted) {
          setIsAdmin(isStoredAdmin || isFirebaseAdmin);
        }
      } catch {
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    verify();
    return () => { mounted = false; };
  }, []);

  return { isAdmin, isLoading };
}
