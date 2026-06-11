'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'client' | 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
}

interface PendingRegistration {
  name: string;
  phone: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  pendingPhone: string | null;
  login: (phone: string, password: string) => { success: boolean; error?: string };
  startRegister: (name: string, phone: string, password: string) => { success: boolean; error?: string };
  completeRegister: (otp: string) => { success: boolean; error?: string };
  logout: () => void;
}

const DEMO_ACCOUNTS: (User & { password: string })[] = [
  { id: '1', name: 'Admin User',  phone: '0901234567', password: 'admin123',  role: 'admin'  },
  { id: '2', name: 'Staff User',  phone: '0901234568', password: 'staff123',  role: 'staff'  },
  { id: '3', name: 'Client User', phone: '0901234569', password: 'client123', role: 'client' },
];

const registeredAccounts: (User & { password: string })[] = [];

const DEMO_OTP = '12345';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState<PendingRegistration | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hm-user');
      if (saved) setUser(JSON.parse(saved));
      const savedPending = localStorage.getItem('hm-pending');
      if (savedPending) setPending(JSON.parse(savedPending));
    } catch {}
  }, []);

  const login = (phone: string, password: string): { success: boolean; error?: string } => {
    const all = [...DEMO_ACCOUNTS, ...registeredAccounts];
    const found = all.find(a => a.phone === phone && a.password === password);
    if (!found) return { success: false, error: 'Invalid phone number or password' };
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem('hm-user', JSON.stringify(userData));
    return { success: true };
  };

  const startRegister = (name: string, phone: string, password: string): { success: boolean; error?: string } => {
    const all = [...DEMO_ACCOUNTS, ...registeredAccounts];
    if (all.find(a => a.phone === phone)) {
      return { success: false, error: 'Phone number is already registered' };
    }
    const pendingData = { name, phone, password };
    setPending(pendingData);
    localStorage.setItem('hm-pending', JSON.stringify(pendingData));
    return { success: true };
  };

  const completeRegister = (otp: string): { success: boolean; error?: string } => {
    if (!pending) return { success: false, error: 'No pending registration' };
    if (otp !== DEMO_OTP) return { success: false, error: 'Incorrect verification code' };
    const newUser: User = { id: Date.now().toString(), name: pending.name, phone: pending.phone, role: 'client' };
    registeredAccounts.push({ ...newUser, password: pending.password });
    setUser(newUser);
    setPending(null);
    localStorage.setItem('hm-user', JSON.stringify(newUser));
    localStorage.removeItem('hm-pending');
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hm-user');
  };

  return (
    <AuthContext.Provider value={{ user, pendingPhone: pending?.phone ?? null, login, startRegister, completeRegister, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
