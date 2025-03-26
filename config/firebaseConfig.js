// config/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDFMu1G7M7YUnGambl3eRPRIoiGrWix-Sc",
  authDomain: "scenario2-b41e8.firebaseapp.com",
  projectId: "scenario2-b41e8",
  storageBucket: "scenario2-b41e8.firebasestorage.app",
  messagingSenderId: "356638583340",
  appId: "1:356638583340:web:55ac3245587cffd8bebf89",
  measurementId: "G-HLTVCYW5KH"
};

const app = initializeApp(firebaseConfig);

console.log("getReactNativePersistence:"  );

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
