"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import userApi from "@/src/lib/userApi";
import { getApiErrorMessage } from "@/src/lib/apiError";
import { authService, getRetryAfterSeconds } from "@/src/services/authService";

export type UserRole = "client" | "admin" | "staff";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
}

// Chỉ giữ trong React state (bộ nhớ), KHÔNG lưu localStorage vì có mật khẩu
interface PendingRegistration {
  name: string;
  phone: string;
  password: string;
  resendAt: number; // thời điểm (ms) được phép gửi lại OTP
  verificationToken?: string; // giữ lại nếu verify xong nhưng register lỗi, để thử lại không cần OTP mới
}

type ActionResult = { success: boolean; error?: string };

interface AuthContextValue {
  user: User | null;
  // true once the saved session has been read from localStorage
  authReady: boolean;
  pendingPhone: string | null;
  pendingResendAt: number | null;
  login: (
    phone: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  startRegister: (
    name: string,
    phone: string,
    password: string,
  ) => Promise<ActionResult>;
  resendRegisterOtp: () => Promise<ActionResult>;
  completeRegister: (otp: string) => Promise<ActionResult>;
  logout: () => void;
}

function mapRole(roleName: string | undefined): UserRole {
  switch (roleName?.toLowerCase()) {
    case "admin":
      return "admin";
    case "staff":
      return "staff";
    default:
      return "client";
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [pending, setPending] = useState<PendingRegistration | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hm-user");
      if (saved) setUser(JSON.parse(saved));
      // Dọn dữ liệu cũ: phiên bản trước lưu cả mật khẩu vào localStorage
      localStorage.removeItem("hm-pending");
    } catch {}
    // Báo cho ClientShell biết đã đọc xong session, lúc này mới được kiểm tra đăng nhập
    setAuthReady(true);
  }, []);

  const login = async (
    phone: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await userApi.post("/Auth/login", { phone, password });
      const { token, userId, fullName, role } = res.data;
      const userData: User = {
        id: String(userId),
        name: fullName,
        phone,
        role: mapRole(role),
      };
      localStorage.setItem("hm-token", token);
      localStorage.setItem("hm-user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch {
      return { success: false, error: "Invalid phone number or password" };
    }
  };

  // Bước 1: gửi OTP tới SĐT (chưa tạo tài khoản)
  const startRegister = async (
    name: string,
    phone: string,
    password: string,
  ): Promise<ActionResult> => {
    try {
      const data = await authService.sendOtp(phone, "Register");
      setPending({
        name,
        phone,
        password,
        resendAt: Date.now() + data.retryAfterSeconds * 1000,
      });
      return { success: true };
    } catch (err) {
      // 429: mã đã được gửi gần đây -> vẫn cho sang trang nhập mã
      const retryAfter = getRetryAfterSeconds(err);
      if (retryAfter > 0) {
        setPending({
          name,
          phone,
          password,
          resendAt: Date.now() + retryAfter * 1000,
        });
        return { success: true };
      }
      return {
        success: false,
        error: getApiErrorMessage(err, "Could not send verification code"),
      };
    }
  };

  const resendRegisterOtp = async (): Promise<ActionResult> => {
    if (!pending) return { success: false, error: "No pending registration" };
    try {
      const data = await authService.sendOtp(pending.phone, "Register");
      setPending({
        ...pending,
        resendAt: Date.now() + data.retryAfterSeconds * 1000,
      });
      return { success: true };
    } catch (err) {
      const retryAfter = getRetryAfterSeconds(err);
      if (retryAfter > 0) {
        setPending({ ...pending, resendAt: Date.now() + retryAfter * 1000 });
      }
      return {
        success: false,
        error: getApiErrorMessage(err, "Could not resend verification code"),
      };
    }
  };

  // Bước 2: verify OTP -> nhận token -> tạo tài khoản -> đăng nhập
  const completeRegister = async (otp: string): Promise<ActionResult> => {
    if (!pending)
      return {
        success: false,
        error: "Registration session expired. Please fill in the form again.",
      };

    try {
      let token = pending.verificationToken;

      if (!token) {
        const verified = await authService.verifyOtp(
          pending.phone,
          "Register",
          otp,
        );
        if (!verified.verificationToken)
          return { success: false, error: verified.message };

        token = verified.verificationToken;
        setPending({ ...pending, verificationToken: token });
      }

      await authService.register({
        fullName: pending.name,
        phone: pending.phone,
        password: pending.password,
        verificationToken: token,
      });
    } catch (err) {
      // 400 = OTP sai hoặc token hết hạn -> bỏ token, lần sau phải verify lại
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setPending({ ...pending, verificationToken: undefined });
      }
      return {
        success: false,
        error: getApiErrorMessage(err, "Verification failed"),
      };
    }

    const result = await login(pending.phone, pending.password);
    if (!result.success) return result;

    setPending(null);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hm-user");
    localStorage.removeItem("hm-token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        pendingPhone: pending?.phone ?? null,
        pendingResendAt: pending?.resendAt ?? null,
        login,
        startRegister,
        resendRegisterOtp,
        completeRegister,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
