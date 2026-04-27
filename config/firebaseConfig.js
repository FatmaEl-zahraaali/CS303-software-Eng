import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyBMMujnaQ1fHRYZZjnGmyQybeoxpuyaYg0",
  authDomain: "myproject-f8405.firebaseapp.com",
  projectId: "myproject-f8405",
  storageBucket: "myproject-f8405.firebasestorage.app",
  messagingSenderId: "660014656338",
  appId: "1:660014656338:web:5d62df128a56e0ddf9288b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);