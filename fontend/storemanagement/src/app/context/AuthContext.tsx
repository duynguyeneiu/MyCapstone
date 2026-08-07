'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import userApi from '@/src/lib/userApi';

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
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  startRegister: (name: string, phone: string, password: string) => { success: boolean; error?: string };
  completeRegister: (otp: string) => { success: boolean; error?: string };
  logout: () => void;
}

// Registration has no backend endpoint yet (AuthController.Register is commented
// out) — this stays a local-only demo flow until that's implemented.
const registeredAccounts: (User & { password: string })[] = [];
const DEMO_OTP = '12345';

function mapRole(roleName: string | undefined): UserRole {
  switch (roleName?.toLowerCase()) {
    case 'admin':
      return 'admin';
    case 'staff':
      return 'staff';
    default:
      return 'client';
  }
}

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

  const login = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await userApi.post('/Auth/login', { phone, password });
      const { token, userId, fullName, role } = res.data;
      const userData: User = { id: String(userId), name: fullName, phone, role: mapRole(role) };
      localStorage.setItem('hm-token', token);
      localStorage.setItem('hm-user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      let message = 'Invalid phone number or password';
      if (axios.isAxiosError(err) && typeof err.response?.data === 'string') {
        message = err.response.data;
      }
      return { success: false, error: message };
    }
  };

  const startRegister = (name: string, phone: string, password: string): { success: boolean; error?: string } => {
    if (registeredAccounts.find(a => a.phone === phone)) {
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
    localStorage.removeItem('hm-token');
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
