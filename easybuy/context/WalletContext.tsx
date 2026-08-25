import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletModal } from '../components/wallet/WalletModal';

interface WalletContextType {
  balance: number;
  points: number;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
  addPoints: (amount: number) => void;
  deductPoints: (amount: number) => boolean;
  openWallet: () => void;
  closeWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(450);
  const [points, setPoints] = useState(1250);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  useEffect(() => {
    // Load from storage
    AsyncStorage.getItem('easybuy_wallet_balance').then(res => {
      if (res) setBalance(Number(res));
    });
    AsyncStorage.getItem('easybuy_wallet_points').then(res => {
      if (res) setPoints(Number(res));
    });
  }, []);

  const save = (b: number, p: number) => {
    AsyncStorage.setItem('easybuy_wallet_balance', b.toString());
    AsyncStorage.setItem('easybuy_wallet_points', p.toString());
  };

  const addBalance = (amount: number) => {
    const newB = balance + amount;
    setBalance(newB);
    save(newB, points);
  };

  const deductBalance = (amount: number) => {
    if (balance >= amount) {
      const newB = balance - amount;
      setBalance(newB);
      save(newB, points);
      return true;
    }
    return false;
  };

  const addPoints = (amount: number) => {
    const newP = points + amount;
    setPoints(newP);
    save(balance, newP);
  };

  const deductPoints = (amount: number) => {
    if (points >= amount) {
      const newP = points - amount;
      setPoints(newP);
      save(balance, newP);
      return true;
    }
    return false;
  };

  return (
    <WalletContext.Provider value={{ 
      balance, points, 
      addBalance, deductBalance, 
      addPoints, deductPoints,
      openWallet: () => setIsWalletOpen(true),
      closeWallet: () => setIsWalletOpen(false)
    }}>
      {children}
      <WalletModal visible={isWalletOpen} onClose={() => setIsWalletOpen(false)} isDarkMode={false} balance={balance} points={points} addBalance={addBalance} deductPoints={deductPoints} />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
}
