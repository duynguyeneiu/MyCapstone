"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentMethod } from "../../lib/types";
import { fmt, subtotal } from "../../lib/utils";
import { PRODUCTS } from "../../lib/data";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";
import BtnTeal from "../ui/BtnTeal";
import Badge from "../ui/Badge";
import QRModal from "../ui/QRModal";

interface ShipForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note: string;
}

export default function CheckoutContent() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  const [payment, setPayment] = useState<PaymentMethod>("vnpay");
  const [showQR, setShowQR] = useState(false);

  const [ship, setShip] = useState<ShipForm>(() => {
    /* Try to read default saved address from profile */
    let savedAddr = { address: '', city: '' };
    try {
      const raw = localStorage.getItem('hm-addresses');
      if (raw) {
        const list: { addr: string; city: string; def: boolean }[] = JSON.parse(raw);
        const def = list.find(a => a.def) ?? list[0];
        if (def) savedAddr = { address: def.addr, city: def.city };
      }
    } catch { /* ignore */ }

    if (!user) return { firstName: '', lastName: '', email: '', phone: '', note: '', ...savedAddr };
    const parts = user.name.trim().split(/\s+/);
    return {
      firstName: parts[0] || '',
      lastName:  parts.slice(1).join(' ') || '',
      email:     user.email || '',
      phone:     user.phone || '',
      note:      '',
      ...savedAddr,
    };
  });
  const [shipErrors, setShipErrors] = useState<
    Partial<Record<keyof ShipForm, string>>
  >({});

  const sub = subtotal(cart);
  const tax = sub * 0.1;
  const total = sub + tax;

  const payOpts: {
    id: PaymentMethod;
    label: string;
    sub: string;
    icon: string;
    iconBg: string;
    iconColor: string;
  }[] = [
    {
      id: "vnpay",
      label: "VNPay",
      sub: "Scan QR via VNPay app",
      icon: "qr_code_2",
      iconBg: "#fee2e2",
      iconColor: "#b91c1c",
    },
    {
      id: "cod",
      label: "Cash on Delivery",
      sub: "Pay when you receive",
      icon: "local_shipping",
      iconBg: "#d1fae5",
      iconColor: "#065f46",
    },
  ];

  type FieldDef = {
    label: string;
    key: keyof ShipForm;
    type: string;
    ph: string;
    span?: number;
    required?: true;
  };
  const shipFields: FieldDef[] = [
    {
      label: "First Name",
      key: "firstName",
      type: "text",
      ph: "John",
      required: true,
    },
    {
      label: "Last Name",
      key: "lastName",
      type: "text",
      ph: "Doe",
      required: true,
    },
    {
      label: "Email",
      key: "email",
      type: "email",
      ph: "john@example.com",
      span: 2,
      required: true,
    },
    {
      label: "Phone",
      key: "phone",
      type: "tel",
      ph: "+84 912 345 678",
      span: 2,
      required: true,
    },
    {
      label: "Address",
      key: "address",
      type: "text",
      ph: "123 Main Street",
      span: 2,
      required: true,
    },
    { label: "City / Province", key: "city", type: "text", ph: "Ho Chi Minh City",                       span: 2, required: true },
    { label: "Delivery Note",   key: "note", type: "text", ph: "e.g. Leave at door, ring bell twice…",  span: 2 },
  ];

  const validateShipping = (): boolean => {
    const errs: Partial<Record<keyof ShipForm, string>> = {};
    if (!ship.firstName.trim()) errs.firstName = "First name is required";
    if (!ship.lastName.trim())  errs.lastName  = "Last name is required";
    if (!ship.email.trim())     errs.email     = "Email is required";
    if (!ship.phone.trim())     errs.phone     = "Phone number is required";
    if (!ship.address.trim())   errs.address   = "Address is required";
    if (!ship.city.trim())      errs.city      = "City / Province is required";
    setShipErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = () => {
    const oid = placeOrder(cart, payment);
    clearCart();
    router.push(`/orders/success?id=${oid}`);
  };

  const handleSubmit = () => {
    if (!validateShipping()) return;
    if (payment === "vnpay") {
      setShowQR(true);
    } else {
      handlePlaceOrder();
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {showQR && (
        <QRModal
          method={payment}
          total={total}
          onClose={() => setShowQR(false)}
          onConfirm={() => {
            setShowQR(false);
            handlePlaceOrder();
          }}
        />
      )}
      <h1
        className="serif"
        style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}
      >
        Checkout
      </h1>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>
        Complete your order details below
      </p>

      {/* Steps */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: "2.5rem",
        }}
      >
        {[
          ["1", "Shipping", "var(--teal)"],
          ["2", "Payment", "var(--teal)"],
          ["3", "Review", "#e2e8f0"],
        ].map(([n, l, bg], i) => (
          <span
            key={n}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {i > 0 && (
              <span
                style={{ flex: 1, height: 2, width: 40, background: "#e2e8f0" }}
              />
            )}
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: bg,
                color: bg === "#e2e8f0" ? "#94a3b8" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: ".875rem",
                flexShrink: 0,
              }}
            >
              {n}
            </span>
            <span
              style={{
                fontSize: ".875rem",
                fontWeight: 600,
                color: bg === "#e2e8f0" ? "#94a3b8" : "var(--teal)",
              }}
            >
              {l}
            </span>
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div
          style={{
            flex: 1,
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Shipping */}
          <div
            style={{
              background: "#fff",
              borderRadius: "1.25rem",
              padding: "1.5rem",
              boxShadow: "0 2px 10px rgba(0,0,0,.05)",
            }}
          >
            <h3
              className="serif"
              style={{
                fontWeight: 700,
                fontSize: "1.15rem",
                marginBottom: "1.25rem",
              }}
            >
              Shipping Information
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              {shipFields.map(({ label, key, type, ph, span, required }) => (
                <div
                  key={key}
                  style={{ gridColumn: span ? `span ${span}` : undefined }}
                >
                  <label
                    style={{
                      fontSize: ".75rem",
                      fontWeight: 600,
                      color: "#4b5563",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {label}
                    {required && (
                      <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
                    )}
                  </label>
                  <input
                    type={type}
                    placeholder={ph}
                    value={ship[key]}
                    onChange={(e) => {
                      setShip((s) => ({ ...s, [key]: e.target.value }));
                      if (shipErrors[key])
                        setShipErrors((v) => ({ ...v, [key]: undefined }));
                    }}
                    style={{
                      borderColor: shipErrors[key] ? "#ef4444" : undefined,
                    }}
                  />
                  {shipErrors[key] && (
                    <p
                      style={{
                        fontSize: ".72rem",
                        color: "#ef4444",
                        marginTop: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "13px" }}
                      >
                        error
                      </span>
                      {shipErrors[key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div
            style={{
              background: "#fff",
              borderRadius: "1.25rem",
              padding: "1.5rem",
              boxShadow: "0 2px 10px rgba(0,0,0,.05)",
            }}
          >
            <h3
              className="serif"
              style={{
                fontWeight: 700,
                fontSize: "1.15rem",
                marginBottom: "1.25rem",
              }}
            >
              Payment Method
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {payOpts.map((opt) => (
                <label
                  key={opt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1rem",
                    borderRadius: "0.75rem",
                    border: `2px solid ${payment === opt.id ? "var(--teal)" : "#e2e8f0"}`,
                    background: payment === opt.id ? "var(--teal-xs)" : "#fff",
                    cursor: "pointer",
                    transition: ".2s",
                  }}
                >
                  <input
                    type="radio"
                    name="pay"
                    value={opt.id}
                    checked={payment === opt.id}
                    onChange={() => setPayment(opt.id)}
                    style={{
                      accentColor: "var(--teal)",
                      width: 16,
                      height: 16,
                    }}
                  />
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: opt.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "20px", color: opt.iconColor }}
                    >
                      {opt.icon}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: ".9rem" }}>
                      {opt.label}
                    </p>
                    <p style={{ fontSize: ".75rem", color: "#64748b" }}>
                      {opt.sub}
                    </p>
                  </div>
                  {opt.id === "vnpay" && (
                    <Badge style={{ background: "#fee2e2", color: "#b91c1c" }}>
                      Popular
                    </Badge>
                  )}
                </label>
              ))}

              {payment === "vnpay" && (
                <BtnTeal
                  onClick={() => setShowQR(true)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    qr_code_scanner
                  </span>
                  Tap to View VNPay QR Code
                </BtnTeal>
              )}
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "1.25rem",
              padding: "1.5rem",
              boxShadow: "0 2px 12px rgba(0,0,0,.06)",
              position: "sticky",
              top: 76,
            }}
          >
            <h3
              className="serif"
              style={{
                fontWeight: 700,
                fontSize: "1.1rem",
                marginBottom: "1rem",
              }}
            >
              Your Order
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                maxHeight: 200,
                overflowY: "auto",
                marginBottom: "1rem",
              }}
            >
              {cart.map((item) => {
                const p = PRODUCTS.find((x) => x.id === item.id)!;
                return (
                  <div
                    key={item.id}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "0.4rem",
                        background: "var(--teal-xs)",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          padding: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        flex: 1,
                        fontSize: ".8rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name} ×{item.qty}
                    </span>
                    <span
                      style={{
                        fontSize: ".8rem",
                        fontWeight: 700,
                        color: "var(--teal)",
                      }}
                    >
                      {fmt(p.price * item.qty)}
                    </span>
                  </div>
                );
              })}
            </div>
            {[
              ["Subtotal", fmt(sub)],
              ["Shipping", "FREE"],
              ["Tax", fmt(tax)],
            ].map(([l, v]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: ".875rem",
                  marginBottom: "0.4rem",
                }}
              >
                <span style={{ color: "#64748b" }}>{l}</span>
                <span
                  style={{
                    color: l === "Shipping" ? "#16a34a" : undefined,
                    fontWeight: 500,
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
            <div
              style={{
                borderTop: "1px solid #f1f5f9",
                paddingTop: "0.75rem",
                marginTop: "0.25rem",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              <span>Total</span>
              <span style={{ color: "var(--teal)" }}>{fmt(total)}</span>
            </div>
            <BtnTeal
              onClick={handleSubmit}
              style={{
                width: "100%",
                marginTop: "1.25rem",
                padding: "0.75rem",
              }}
            >
              Place Order ✓
            </BtnTeal>
          </div>
        </div>
      </div>
    </div>
  );
}
