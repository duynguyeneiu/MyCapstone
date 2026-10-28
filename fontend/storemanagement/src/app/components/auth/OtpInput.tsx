"use client";

import React, { useRef } from "react";

export const OTP_LENGTH = 6;

interface Props {
  digits: string[];
  onChange: (digits: string[]) => void;
  hasError?: boolean;
  disabled?: boolean;
}

// Ô nhập OTP dùng chung cho trang Verify (đăng ký) và Forgot Password
export default function OtpInput({ digits, onChange, hasError, disabled }: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    onChange(next);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      onChange(pasted.split(""));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
    e.preventDefault();
  };

  const inputStyle: React.CSSProperties = {
    width: 48, height: 60, borderRadius: 12, border: "2px solid #c8e4d8",
    textAlign: "center", fontSize: "1.4rem", fontWeight: 700, outline: "none",
    background: "#f4fbf7", fontFamily: "'DM Sans', sans-serif", transition: "border-color .15s",
    caretColor: "transparent",
  };

  return (
    <div
      style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: "1.5rem" }}
      onPaste={handlePaste}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          style={{
            ...inputStyle,
            borderColor: d ? "#00694c" : hasError ? "#ef4444" : "#c8e4d8",
            background: d ? "#f0fdf4" : "#f4fbf7",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#00694c"; e.currentTarget.style.background = "#fff"; }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = digits[i] ? "#00694c" : "#c8e4d8";
            e.currentTarget.style.background = digits[i] ? "#f0fdf4" : "#f4fbf7";
          }}
        />
      ))}
    </div>
  );
}

export const emptyOtp = () => Array<string>(OTP_LENGTH).fill("");
