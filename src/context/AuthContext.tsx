import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AuthUser, signOutGsi } from '../services/authService';

const STORAGE_KEY = 'axiom_executive_user';

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => readStoredUser());

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage may be blocked — fall back to in-memory only */
    }
  }, []);

  const signOut = useCallback(() => {
    signOutGsi();
    setUser(null);
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
