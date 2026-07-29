"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fmt } from "../../lib/utils";
import {  SortMode } from "../../lib/types";
import ProductCard from "../ui/ProductCard";
import { productService } from "@/src/services/productService";
import { categoryService } from "@/src/services/categoryService";
import { Product, Category } from "@/src/lib/data";

interface ShopContentProps {
  initCategory?: string | "all";
  initSubcategory?: string | "all";
}
function getPageNums(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export default function ShopContent({
  initCategory = "all",
  initSubcategory = "all",
}: ShopContentProps) {
  const router = useRouter();
  const [maxPrice, setMaxPrice] = useState(200000);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortMode>("default");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  async function loadProducts() {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  }
  async function loadCategories() {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }

  const ITEMS_PER_PAGE = 12;

  // Reset to page 1 whenever URL-driven filters change
  useEffect(() => {
    const fetchData = async () => {
      await loadProducts();
      await loadCategories();
    };

    fetchData();
  }, []);

  // category and subcategory are URL-driven — read directly from props
  const category = initCategory;
  const subcategory = initSubcategory;

  const subs =
    category !== "all"
      ? categories.filter((c) => c.parentCategoryId === Number(category))
      : [];

  const childCategoryIds = subs.map((c) => c.id);

  const filtered = products
    .filter(
      (p) =>
        (category === "all" || childCategoryIds.includes(p.categoryId)) &&
        (subcategory === "all" || p.categoryId === Number(subcategory)) &&
        p.price <= maxPrice &&
        (p.rating ?? 0) >= minRating,
    )
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : sort === "rating"
            ? (b.rating ?? 0) - (a.rating ?? 0)
            : 0,
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const currentCategory = categories.find((c) => c.id === Number(category));

  const currentSubcategory = categories.find(
    (c) => c.id === Number(subcategory),
  );

  const heading =
    category === "all"
      ? "All Products"
      : subcategory !== "all"
        ? (currentSubcategory?.name ?? currentCategory?.name ?? "All Products")
        : (currentCategory?.name ?? "All Products");

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {/* ── Sidebar ── */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "1.25rem",
              padding: "1.25rem",
              boxShadow: "0 4px 24px rgba(0,0,0,.10)",
              position: "sticky",
              top: 76,
            }}
          >
            <h3
              className="serif"
              style={{
                fontWeight: 700,
                fontSize: "1.1rem",
                marginBottom: "1.25rem",
              }}
            >
              Filters
            </h3>

            {/* Category + Subcategory — hierarchical */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: ".875rem",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Category
              </p>

              {/* All Products */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  marginBottom: 6,
                }}
              >
                <input
                  type="radio"
                  name="filter"
                  checked={category === "all"}
                  onChange={() => router.push("/shop")}
                  style={{ accentColor: "var(--teal)", width: 16, height: 16 }}
                />
                <span style={{ fontSize: ".875rem" }}>All Products</span>
              </label>

              {categories
                .filter((c) => c.parentCategoryId == null)
                .map((c) => {
                  const catActive = Number(category) === c.id;
                  const childCategories = categories.filter(
                    (child) => child.parentCategoryId === c.id,
                  );
                  return (
                    <div key={c.id}>
                      {/* Category row */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          marginBottom: 4,
                        }}
                      >
                        <input
                          type="radio"
                          name="filter"
                          checked={catActive && subcategory === "all"}
                          onChange={() => router.push(`/shop?category=${c.id}`)}
                          style={{
                            accentColor: "var(--teal)",
                            width: 16,
                            height: 16,
                          }}
                        />
                        <span
                          style={{
                            fontSize: ".875rem",
                            fontWeight: catActive ? 600 : 400,
                            color: catActive ? "var(--teal-dk)" : "#374151",
                          }}
                        >
                          {c.name}
                        </span>
                      </label>
                      {/* Subcategory rows — always visible, indented */}
                      {childCategories.map((s) => (
                        <label
                          key={s.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            cursor: "pointer",
                            marginBottom: 4,
                            paddingLeft: 24,
                          }}
                        >
                          <input
                            type="radio"
                            name="filter"
                            checked={catActive && Number(subcategory) === s.id}
                            onChange={() =>
                              router.push(`/shop?category=${c.id}&sub=${s.id}`)
                            }
                            style={{
                              accentColor: "var(--teal)",
                              width: 14,
                              height: 14,
                            }}
                          />
                          <span
                            style={{
                              fontSize: ".8rem",
                              color:
                                catActive && Number(subcategory) === s.id
                                  ? "var(--teal-dk)"
                                  : "#64748b",
                            }}
                          >
                            {s.name}
                          </span>
                        </label>
                      ))}

                      <div style={{ height: 4 }} />
                    </div>
                  );
                })}
            </div>

            {/* Max Price */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: ".875rem",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Max Price:{" "}
                <span style={{ color: "var(--teal)", fontWeight: 700 }}>
                  {fmt(maxPrice)}
                </span>
              </p>
              <input
                type="range"
                min={5000}
                max={200000}
                step={5000}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(+e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Min Rating */}
            <div style={{ marginBottom: "1.25rem" }}>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: ".875rem",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Min Rating
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {([0, 4, 4.5] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setMinRating(r);
                      setPage(1);
                    }}
                    style={{
                      padding: ".3rem .75rem",
                      borderRadius: 9999,
                      border: "1.5px solid",
                      borderColor: minRating === r ? "var(--teal)" : "#e2e8f0",
                      background: minRating === r ? "var(--teal-xs)" : "#fff",
                      color: minRating === r ? "var(--teal-dk)" : "#64748b",
                      fontSize: ".75rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {r === 0 ? "All" : `${r}+ ★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: ".875rem",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Sort By
              </p>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortMode);
                  setPage(1);
                }}
                style={{ fontSize: ".875rem" }}
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Best Rated</option>
              </select>
            </div>
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
            <h2
              className="serif"
              style={{ fontSize: "1.5rem", fontWeight: 700 }}
            >
              {heading}
            </h2>
            <span style={{ color: "#64748b", fontSize: ".875rem" }}>
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          {filtered.length === 0 ? (
            <p
              style={{ color: "#94a3b8", textAlign: "center", padding: "4rem" }}
            >
              No products match your filters.
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                  gap: "1.25rem",
                }}
              >
                {paginated.map((p) => (
                  <ProductCard
                    key={p.id}
                    p={p}
                    categoryName={
                      categories.find((c) => c.id === p.categoryId)
                        ?.name ?? ""
                    }
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "2rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                    }}
                  >
                    {/* Prev */}
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "0.5rem",
                        border: "1.5px solid",
                        borderColor:
                          safePage === 1 ? "#e2e8f0" : "var(--amber-border)",
                        background:
                          safePage === 1 ? "#f8fafc" : "var(--amber-xs)",
                        color: safePage === 1 ? "#cbd5e1" : "var(--amber-dk)",
                        cursor: safePage === 1 ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "18px" }}
                      >
                        chevron_left
                      </span>
                    </button>

                    {/* Page numbers */}
                    {getPageNums(safePage, totalPages).map((n, i) =>
                      n === "…" ? (
                        <span
                          key={`e${i}`}
                          style={{
                            width: 34,
                            textAlign: "center",
                            color: "#94a3b8",
                            fontSize: ".875rem",
                          }}
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setPage(n as number)}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "0.5rem",
                            border: "1.5px solid",
                            borderColor:
                              safePage === n
                                ? "var(--teal)"
                                : "var(--amber-border)",
                            background:
                              safePage === n
                                ? "var(--teal)"
                                : "var(--amber-xs)",
                            color: safePage === n ? "#fff" : "var(--amber-dk)",
                            fontWeight: safePage === n ? 700 : 500,
                            fontSize: ".875rem",
                            cursor: "pointer",
                          }}
                        >
                          {n}
                        </button>
                      ),
                    )}

                    {/* Next */}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={safePage === totalPages}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "0.5rem",
                        border: "1.5px solid",
                        borderColor:
                          safePage === totalPages
                            ? "#e2e8f0"
                            : "var(--amber-border)",
                        background:
                          safePage === totalPages
                            ? "#f8fafc"
                            : "var(--amber-xs)",
                        color:
                          safePage === totalPages
                            ? "#cbd5e1"
                            : "var(--amber-dk)",
                        cursor: safePage === totalPages ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "18px" }}
                      >
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
