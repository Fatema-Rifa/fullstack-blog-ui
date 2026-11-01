import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import {
  auth,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle as firebaseLoginWithGoogle,
  logoutFirebase,
  resetPassword,
  onAuthStateChanged,
} from "../lib/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase ID token with our Express / MongoDB backend
  const syncWithBackend = useCallback(async (fbUser, customPayload = {}) => {
    const idToken = await fbUser.getIdToken();
    const { data } = await api.post("/auth/firebase", {
      idToken,
      ...customPayload,
    });
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  // Listen for Firebase auth state changes & verify backend session on mount
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        // User is logged into Firebase. Ensure backend access token is active
        const token = localStorage.getItem("accessToken");
        if (token) {
          try {
            const { data } = await api.get("/auth/me");
            if (mounted) setUser(data.user);
          } catch {
            // Token may have expired – sync fresh token with backend
            try {
              if (mounted) await syncWithBackend(fbUser);
            } catch {
              localStorage.removeItem("accessToken");
              if (mounted) setUser(null);
            }
          }
        } else {
          // No access token in storage, exchange Firebase token with backend
          try {
            if (mounted) await syncWithBackend(fbUser);
          } catch {
            if (mounted) setUser(null);
          }
        }
      } else {
        // Not logged in to Firebase
        localStorage.removeItem("accessToken");
        if (mounted) setUser(null);
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [syncWithBackend]);

  // Sign in with Email and Password via Firebase
  const login = useCallback(
    async (email, password) => {
      const userCredential = await loginWithEmail(email, password);
      setFirebaseUser(userCredential.user);
      return await syncWithBackend(userCredential.user);
    },
    [syncWithBackend]
  );

  // Sign in with Google Popup via Firebase
  const loginWithGoogle = useCallback(async () => {
    const userCredential = await firebaseLoginWithGoogle();
    setFirebaseUser(userCredential.user);
    return await syncWithBackend(userCredential.user);
  }, [syncWithBackend]);

  // Register with Email & Password via Firebase + Backend
  const register = useCallback(
    async ({ email, password, username, name }) => {
      const userCredential = await registerWithEmail(email, password, name || username);
      setFirebaseUser(userCredential.user);
      return await syncWithBackend(userCredential.user, { username, name });
    },
    [syncWithBackend]
  );

  // Sign out from both Firebase and Backend
  const logout = useCallback(async () => {
    try {
      await logoutFirebase();
    } catch (_) {}
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    localStorage.removeItem("accessToken");
    setUser(null);
    setFirebaseUser(null);
  }, []);

  // Send password reset email via Firebase
  const forgotPassword = useCallback(async (email) => {
    return await resetPassword(email);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        forgotPassword,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
