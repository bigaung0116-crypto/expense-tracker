import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Firebase Configuration (ဒေတာအစစ်အမှန်များ ထည့်သွင်းပြီး)
const firebaseConfig = {
  apiKey: "AIzaSyB3Yo56BVfUyioiUjkPkHSG-abWjR4EO30",
  authDomain: "expense-tracker-a0aa5.firebaseapp.com",
  projectId: "expense-tracker-a0aa5",
  storageBucket: "expense-tracker-a0aa5.firebasestorage.app",
  messagingSenderId: "68710527698",
  appId: "1:68710527698:web:7b262015d7b662a49b730b",
  measurementId: "G-6DFHED7P2P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };