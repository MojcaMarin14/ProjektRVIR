import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { getAuthInstance, firestore } from '../firebase/firebase';
import { User } from '../models/User';

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuthInstance();

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ 1. Poskusi obnoviti uporabnika iz AsyncStorage
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          console.log('🔁 Restored user from storage:', parsed.email);
          setUser(parsed);
        }

        // ✅ 2. Poslušaj Firebase spremembe
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            console.log('👤 Firebase user logged in:', firebaseUser.email);

            try {
              const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
              let userData: any = {};
              if (userDoc.exists()) {
                userData = userDoc.data();
              }

              const fullUser: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                ...userData,
              };

              setUser(fullUser);
              await AsyncStorage.setItem('user', JSON.stringify(fullUser));
              console.log('💾 User persisted to AsyncStorage');
            } catch (err) {
              console.error('🔥 Error loading user data:', err);
            }
          } else {
            // ⚠️ Firebase izbriše sejo po restartu, zato ne brišemo AsyncStorage takoj
            console.log('⚠️ Firebase user null, keeping stored session until confirmed logout');
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error('❌ Error initializing auth listener:', err);
        setLoading(false);
      }
    };

    init();
  }, []);

  // ✅ 3. Funkcija za odjavo
  const logout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('user');
      setUser(null);
      console.log('🚪 User logged out manually');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// ✅ Hook za uporabo uporabnika
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
