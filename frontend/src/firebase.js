// src/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

// 🏆 ကိုအောင့်ရဲ့ SpendSmart Config အစစ်အမှန် (စာလုံးမှန်ပြင်ပြီး)
const firebaseConfig = {
  apiKey: "AIzaSyB3Yo56BVfUyioiUjkPkHSG-abWjR4EO30",
  authDomain: "expense-tracker-a0aa5.firebaseapp.com",
  projectId: "expense-tracker-a0aa5",
  storageBucket: "expense-tracker-a0aa5.firebasestorage.app",
  messagingSenderId: "68710527698",
  appId: "1:68710527698:web:7b262015d7b662a49b730b",
  measurementId: "G-6DFHED7P2P"
};

// Firebase စတင်ခြင်း
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

// Email Register
export const registerWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Register Error:", error);
    throw error;
  }
};

// Email Login
export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

// Sign Out
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};