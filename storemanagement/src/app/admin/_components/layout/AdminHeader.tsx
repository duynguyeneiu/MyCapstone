"use client";
import { useState } from "react";
import Icon from "../ui/Icon";
import { C, type Page } from "../../_lib/types";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNav: (p: Page) => void;
  userName?: string;
  searchValue?: string;
  onSearch?: (v: string) => void;
}

export default function AdminHeader({
  title,
  subtitle,
  onNav,
  userName,
  searchValue,
  onSearch,
}: HeaderProps) {
  const [focused, setFocused] = useState(false);
  const initials = userName
    ? userName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <>
      <style>{`.admin-search-input:focus { outline: none !important; box-shadow: none !important; }`}</style>
      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 28px",
          flexShrink: 0,
          background: "linear-gradient(90deg,#f7fbf9 0%,#fffdf5 100%)",
          borderBottom: `1.5px solid ${C.sidebarBorder}`,
        }}
      >
        {/* Page title */}
        <div style={{ flexShrink: 0 }}>
          <h2
            style={{
              fontFamily: "'Hanken Grotesk',sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: C.textMain,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 12, color: C.textFaint }}>{subtitle}</p>
          )}
        </div>

        {/* Search bar — only shown when onSearch is provided */}
        {onSearch && (
          <div
            style={{
              flex: 1,
              maxWidth: 400,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff8e6",
              border: focused ? "2px solid #f59e0b" : "1.5px solid #fcd97a",
              borderRadius: 999,
              padding: focused ? "6.5px 14px" : "0px 14px",
              boxShadow: focused ? "0 0 0 3px #f59e0b33" : "none",
              transition: "border-color .15s, box-shadow .15s",
            }}
          >
            <Icon
              name="search"
              size={18}
              style={{ color: "#b47b10", flexShrink: 0 }}
            />
            <input
              value={searchValue ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search…"
              className="admin-search-input"
              style={{
                background: "transparent",
                border: "none",
                width: "100%",
                fontSize: 14,
                color: "#191c1e",
                outline: "none",
              }}
            />
            {searchValue && (
              <button
                onClick={() => onSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                <Icon name="close" size={16} style={{ color: "#b47b10" }} />
              </button>
            )}
          </div>
        )}

        {/* Right actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginLeft: "auto",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => onNav("pos")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: `linear-gradient(135deg,${C.primary},#00a86b)`,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Icon name="point_of_sale" size={18} style={{ color: "#fff" }} />{" "}
            Open POS
          </button>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: C.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {initials}
          </div>
        </div>
      </header>
    </>
  );
}
