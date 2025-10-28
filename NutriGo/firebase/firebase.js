// firebase/firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyBf_udv4BtcZshxjCBlgXZsQAnnKmFPeCU',
  authDomain: 'nutrigo-57bfa.firebaseapp.com',
  projectId: 'nutrigo-57bfa',
  storageBucket: 'nutrigo-57bfa.appspot.com',
  messagingSenderId: '260433369104',
  appId: '1:260433369104:web:b70f62ca2a479b3d5f9295',
  measurementId: 'G-3Y1T1MEP3W',
};

// ✅ Inicializacija Firebase samo enkrat
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();

/**
 * 🔥 “Compat” Firebase Auth v Expo/React Native ne podpira native persistence,
 * zato to rešimo ročno z AsyncStorage in onAuthStateChanged listenerjem.
 */

// 🔹 Shranjevanje prijave v AsyncStorage
auth.onAuthStateChanged(async (user) => {
  if (user) {
    await AsyncStorage.setItem('firebaseUser', JSON.stringify(user));
    console.log('✅ User persisted to AsyncStorage');
  } else {
    await AsyncStorage.removeItem('firebaseUser');
    console.log('🚪 User logged out, storage cleared');
  }
});

// 🔹 Funkcija za pridobitev Auth instance
export function getAuthInstance() {
  return auth;
}

// 🔹 Funkcija za obnovitev uporabnika iz AsyncStorage (če Firebase ne ohrani seje)
export async function restoreUserSession() {
  const stored = await AsyncStorage.getItem('firebaseUser');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      console.log('🔁 Restored user from AsyncStorage:', user.email);
      return user;
    } catch (e) {
      console.warn('⚠️ Failed to parse stored user:', e);
    }
  }
  return null;
}

export { firebase, auth, firestore };
