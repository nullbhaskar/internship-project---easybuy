import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  toggleMaintenanceMode: () => Promise<void>;
}

const MaintenanceContext = createContext<MaintenanceContextType>({
  isMaintenanceMode: false,
  toggleMaintenanceMode: async () => {},
});

export const useMaintenance = () => useContext(MaintenanceContext);

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'appConfig');
    
    // Create doc if it doesn't exist
    getDoc(docRef).then(snap => {
      if (!snap.exists()) {
        setDoc(docRef, { isMaintenanceMode: false });
      }
    });

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setIsMaintenanceMode(docSnap.data().isMaintenanceMode === true);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleMaintenanceMode = async () => {
    try {
      const docRef = doc(db, 'settings', 'appConfig');
      await setDoc(docRef, { isMaintenanceMode: !isMaintenanceMode }, { merge: true });
    } catch (error) {
      console.error("Failed to toggle maintenance mode", error);
    }
  };

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, toggleMaintenanceMode }}>
      {children}
    </MaintenanceContext.Provider>
  );
};
