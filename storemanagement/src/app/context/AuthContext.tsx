'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'client' | 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

// Hardcoded demo accounts
const DEMO_ACCOUNTS: (User & { password: string })[] = [
  { id: '1', name: 'Admin User',  email: 'admin@happy.com',  password: 'admin123',  role: 'admin'  },
  { id: '2', name: 'Staff User',  email: 'staff@happy.com',  password: 'staff123',  role: 'staff'  },
  { id: '3', name: 'Client User', email: 'client@happy.com', password: 'client123', role: 'client' },
];

// Registered accounts accumulate here (in-memory; resets on refresh — extend with localStorage if needed)
const registeredAccounts: (User & { password: string })[] = [];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Rehydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hm-user');
      if (saved) setUser(JSON.parse(saved));
    } catch {}
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const all = [...DEMO_ACCOUNTS, ...registeredAccounts];
    const found = all.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (!found) return { success: false, error: 'Invalid email or password' };
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem('hm-user', JSON.stringify(userData));
    return { success: true };
  };

  const register = (name: string, email: string, password: string): { success: boolean; error?: string } => {
    const all = [...DEMO_ACCOUNTS, ...registeredAccounts];
    if (all.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email is already registered' };
    }
    const newUser: User = { id: Date.now().toString(), name, email, role: 'client' };
    registeredAccounts.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem('hm-user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hm-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
