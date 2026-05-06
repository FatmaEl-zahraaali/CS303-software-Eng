import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBMMujnaQ1fHRYZZjnGmyQybeoxpuyaYg0",
  authDomain: "myproject-f8405.firebaseapp.com",
  projectId: "myproject-f8405",
  storageBucket: "myproject-f8405.firebasestorage.app",
  messagingSenderId: "660014656338",
  appId: "1:660014656338:web:5d62df128a56e0ddf9288b",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);