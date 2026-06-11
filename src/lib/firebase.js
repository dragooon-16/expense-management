// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCOs9bfpKoFLa9QUCHB3itqY8lCJKCsRMs",
  authDomain: "travelexp-eeddb.firebaseapp.com",
  projectId: "travelexp-eeddb",
  storageBucket: "travelexp-eeddb.firebasestorage.app",
  messagingSenderId: "958565272542",
  appId: "1:958565272542:web:46e4457925f8b35adc2b4f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
