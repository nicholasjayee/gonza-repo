
import * as React from 'react';
import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { toast } from 'sonner';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: () => Promise<{ error: string | null; user?: User | null }>;
  signOut: () => Promise<void>;
  resetPassword: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initializeAuth = useCallback(() => {
    try {
      const userDataCookie = getCookie('userData');
      if (userDataCookie) {
        const userData = JSON.parse(decodeURIComponent(userDataCookie));
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error during auth initialization:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();

    // Listen for cookie changes (e.g., from other tabs or manual changes)
    // Note: This is a simple poll as there's no native 'cookiechange' event
    const interval = setInterval(initializeAuth, 5000);
    return () => clearInterval(interval);
  }, [initializeAuth]);

  const signIn = async () => {
    // Redirect to the auth app's login page
    window.location.href = '/api/auth/login';
  };

  const signInWithGoogle = async () => {
    // Redirect to the auth app's Google auth route
    window.location.href = '/api/auth/google';
  };

  const signUp = async () => {
    // Redirect to the auth app's signup page
    window.location.href = '/api/auth/signup';
    return { error: null, user: null };
  };

  const signOut = async () => {
    try {
      // Redirect to the auth app's logout route
      window.location.href = '/api/auth/logout';
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast.error('Error signing out');
    }
  };

  const resetPassword = async () => {
    // Redirect to the auth app's forgot password page
    window.location.href = '/api/auth/forgot-password';
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
