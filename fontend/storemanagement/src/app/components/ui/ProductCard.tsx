"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/src/lib/data";
import { fmt, disc } from "@/src/lib/utils";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Badge from "./Badge";

interface ProductCardProps {
  p: Product;
  categoryName: string;
}

export default function ProductCard({ p, categoryName }: ProductCardProps) {
  const router = useRouter();

  const { addToCart } = useCart();

  const { user } = useAuth();

  const d = disc(p);

  return (
    <div
      onClick={() => router.push(`/product/${p.id}`)}
      style={{
        background: "#fff",
        borderRadius: "1.25rem",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,.10)",
        cursor: "pointer",
        transition: "all .25s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-4px)";

        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 12px 36px rgba(0,105,76,.22)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";

        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 24px rgba(0,0,0,.10)";
      }}
    >
      {/* IMAGE */}
      <div
        style={{
          background: "var(--teal-xs)",
          height: 160,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: "0.5rem",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: ".8rem",
            }}
          >
            No image
          </div>
        )}

        {/* {d > 0 && (
          <span
            style={{
              position:
                "absolute",
              top: 8,
              right: 8,
              background:
                "#fef9c3",
              color: "#854d0e",
              borderRadius:
                9999,
              padding:
                ".15rem .6rem",
              fontSize:
                ".72rem",
              fontWeight: 600,
            }}
          >
            -{d}%
          </span>
        )} */}
      </div>

      {/* PRODUCT INFO */}
      <div
        style={{
          padding: "1rem",
        }}
      >
        {/* <Badge>
          {categoryName
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")}
        </Badge> */}

        <p
          style={{
            fontWeight: 600,
            fontSize: ".875rem",
            lineHeight: 1.4,
            margin: ".3rem 0 .25rem",
            minHeight: "2.45rem",

            display: "-webkit-box",

            WebkitLineClamp: 2,

            WebkitBoxOrient: "vertical",

            overflow: "hidden",
          }}
        >
          {p.name}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontWeight: 700,
                fontSize: ".875rem",
                color: "var(--teal)",
              }}
            >
              {fmt(p.price)}
            </span>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={(e) => {
              e.stopPropagation();

              if (!user) {
                router.push("/login");
                return;
              }

              addToCart(p.id);
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--teal)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
