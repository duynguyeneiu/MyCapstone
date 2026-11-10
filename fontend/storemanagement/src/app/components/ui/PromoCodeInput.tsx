"use client";

import { useEffect, useRef, useState } from "react";
import { promotionService, PromotionApplyResult } from "@/src/services/promotionService";
import { getApiErrorMessage } from "@/src/lib/apiError";
import { fmt } from "@/src/lib/utils";

interface Props {
  /** Goods amount before shipping – the discount is based on this */
  orderAmount: number;
  applied: PromotionApplyResult | null;
  onChange: (result: PromotionApplyResult | null) => void;
  accent?: string;
}

/**
 * Promo code box shared by customer checkout and POS.
 * Re-checks the applied code whenever the order amount changes
 * (e.g. items removed so the order drops below MinOrderValue).
 */
export default function PromoCodeInput({ orderAmount, applied, onChange, accent = "#00694c" }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const lastAmount = useRef(orderAmount);

  const apply = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setChecking(true);
    setError(null);
    try {
      onChange(await promotionService.validate(trimmed, orderAmount));
      setCode("");
    } catch (err) {
      onChange(null);
      setError(getApiErrorMessage(err, "Promotion code cannot be applied."));
    } finally {
      setChecking(false);
    }
  };

  // Order amount changed → re-validate the applied code
  useEffect(() => {
    if (lastAmount.current === orderAmount) return;
    lastAmount.current = orderAmount;
    if (!applied) return;
    if (orderAmount <= 0) { onChange(null); return; }
    promotionService
      .validate(applied.code, orderAmount)
      .then((r) => onChange(r))
      .catch((err) => {
        onChange(null);
        setError(getApiErrorMessage(err, "Promotion code was removed."));
      });
  }, [orderAmount, applied, onChange]);

  if (applied) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        padding: "8px 10px", borderRadius: 8, border: `1.5px dashed ${accent}`, background: "#f0fdf7", fontSize: 13 }}>
        <span>
          <b style={{ color: accent, letterSpacing: ".04em" }}>{applied.code}</b>
          <span style={{ color: "#059669", marginLeft: 8 }}>-{fmt(applied.discount)}</span>
        </span>
        <button type="button" onClick={() => { onChange(null); setError(null); }}
          style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(code); } }}
          placeholder="Promo code"
          style={{ flex: 1, minWidth: 0, padding: "8px 10px", fontSize: 13, borderRadius: 8,
            border: "1.5px solid #e2e8f0", outline: "none", textTransform: "uppercase" }}
        />
        <button type="button" onClick={() => apply(code)} disabled={checking || !code.trim() || orderAmount <= 0}
          style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", color: "#fff",
            background: checking || !code.trim() || orderAmount <= 0 ? "#bccac1" : accent,
            cursor: checking || !code.trim() || orderAmount <= 0 ? "not-allowed" : "pointer" }}>
          {checking ? "…" : "Apply"}
        </button>
      </div>
      {error && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}
