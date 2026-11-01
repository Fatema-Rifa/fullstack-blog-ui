import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration with environment variable fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBBsDtr818uIoqLQPN6fg1ouunlUnOBIlo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-blogging-app-b2eb9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-blogging-app-b2eb9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "my-blogging-app-b2eb9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "412237551126",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:412237551126:web:e6c25918722925c2914737",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MV2BSM7J87",
};

// Initialize Firebase (singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize Analytics conditionally (only supported in browser)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported or blocked (e.g. adblocker)
  });
}

// ── Authentication Helper Functions ──────────────────────────────────────────

/**
 * Sign in with email and password
 */
export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Register with email, password, and display name
 */
export const registerWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
};

/**
 * Sign in with Google Popup
 */
export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

/**
 * Sign out from Firebase
 */
export const logoutFirebase = async () => {
  return await signOut(auth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

export { app, analytics, onAuthStateChanged };
export default app;
