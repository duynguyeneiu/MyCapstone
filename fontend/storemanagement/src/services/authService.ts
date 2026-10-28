import axios from "axios";
import api from "../lib/userApi";

// Phải trùng tên với enum OtpPurpose ở backend (UserService.API/Models/OTP/OtpPurpose.cs)
export type OtpPurpose = "Register" | "ForgotPassword";

export interface OtpSendResponse {
  success: boolean;
  message: string;
  retryAfterSeconds: number;
}

export interface OtpVerifyResponse {
  success: boolean;
  message: string;
  verificationToken: string | null;
}

export const authService = {
  async sendOtp(phone: string, purpose: OtpPurpose): Promise<OtpSendResponse> {
    const res = await api.post<OtpSendResponse>("/Otp/send", { phone, purpose });
    return res.data;
  },

  async verifyOtp(
    phone: string,
    purpose: OtpPurpose,
    code: string,
  ): Promise<OtpVerifyResponse> {
    const res = await api.post<OtpVerifyResponse>("/Otp/verify", {
      phone,
      purpose,
      code,
    });
    return res.data;
  },

  async register(data: {
    fullName: string;
    phone: string;
    password: string;
    verificationToken: string;
  }) {
    const res = await api.post("/Auth/register", data);
    return res.data;
  },

  async resetPassword(data: {
    phone: string;
    newPassword: string;
    confirmNewPassword: string;
    verificationToken: string;
  }) {
    await api.post("/Auth/reset-password", data);
  },
};

// Lấy số giây phải chờ khi backend trả 429 (đang trong thời gian cooldown gửi lại OTP)
export function getRetryAfterSeconds(err: unknown): number {
  if (!axios.isAxiosError(err)) return 0;
  const data = err.response?.data as { retryAfterSeconds?: number } | undefined;
  return data?.retryAfterSeconds ?? 0;
}
