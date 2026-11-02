import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithPasscode: (passcode: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AUTHORIZED_ADMIN_EMAIL = 'young829229@gmail.com';
const ADMIN_MASTER_PASSCODE = 'admin123';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check user admin status
  const checkAdminStatus = async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser) return false;

    // 1. Check primary admin email
    if (currentUser.email && currentUser.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return true;
    }

    // 2. Check local admin session flag
    if (sessionStorage.getItem('fitful_admin_authenticated') === 'true') {
      return true;
    }

    // 3. Check Firestore admins collection
    try {
      const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      if (adminDoc.exists()) {
        return true;
      }
    } catch (err) {
      console.warn("Could not check admin collection:", err);
    }

    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      const isUserAdmin = await checkAdminStatus(currentUser);
      setIsAdmin(isUserAdmin);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const isUserAdmin = await checkAdminStatus(result.user);
      
      if (!isUserAdmin) {
        setError(`Access Denied: ${result.user.email} is not an authorized administrator. Only ${AUTHORIZED_ADMIN_EMAIL} is granted access.`);
        await signOut(auth);
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
        // Record admin entry in Firestore admins collection
        try {
          await setDoc(doc(db, 'admins', result.user.uid), {
            email: result.user.email,
            role: 'SuperAdmin',
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn("Could not record admin doc:", e);
        }
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError("Popup was blocked by your browser. Please allow popups or use the Admin Passcode option below.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError("Sign-in was cancelled.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    }
  };

  const loginWithPasscode = async (passcode: string): Promise<boolean> => {
    setError(null);
    if (passcode.trim() === ADMIN_MASTER_PASSCODE) {
      try {
        // Authenticate anonymously or ensure firebase auth is initialized
        if (!auth.currentUser) {
          try {
            await signInAnonymously(auth);
          } catch (e) {
            console.warn("Anonymous auth not enabled in console, using verified session:", e);
          }
        }
        sessionStorage.setItem('fitful_admin_authenticated', 'true');
        setIsAdmin(true);
        return true;
      } catch (err: any) {
        console.error("Passcode sign-in error:", err);
        setError(err.message || "Authentication error.");
        return false;
      }
    } else {
      setError("Invalid admin passcode. Please verify and try again.");
      return false;
    }
  };

  const logout = async () => {
    sessionStorage.removeItem('fitful_admin_authenticated');
    await signOut(auth);
    setIsAdmin(false);
    setUser(null);
    setError(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        error,
        loginWithGoogle,
        loginWithPasscode,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
};
