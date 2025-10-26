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

// ✅ Inicializacija samo enkrat
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();

// ✅ Nastavi, da Firebase uporablja AsyncStorage namesto localStorage
auth.setPersistence({
  type: 'LOCAL',
  async set(key, value) {
    await AsyncStorage.setItem(key, value);
  },
  async get(key) {
    return (await AsyncStorage.getItem(key));
  },
  async remove(key) {
    await AsyncStorage.removeItem(key);
  },
})
  .then(() => console.log('✅ Firebase Auth persistence set to AsyncStorage'))
  .catch((err) => console.error('❌ Failed to set persistence:', err));

export function getAuthInstance() {
  return auth;
}

export { firebase, auth, firestore };
