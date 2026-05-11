import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBMMujnaQ1fHRYZZjnGmyQybeoxpuyaYg0",
  authDomain: "myproject-f8405.firebaseapp.com",
  projectId: "myproject-f8405",
  storageBucket: "myproject-f8405.firebasestorage.app",
  messagingSenderId: "660014656338",
  appId: "1:660014656338:web:5d62df128a56e0ddf9288b",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' 
    ? browserLocalPersistence 
    : getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };