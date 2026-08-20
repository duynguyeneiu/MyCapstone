"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPageNums } from "@/src/lib/utils";
import ProductCard from "../ui/ProductCard";
import { productService } from "@/src/services/productService";
import { categoryService } from "@/src/services/categoryService";
import { Product, Category } from "@/src/lib/data";

interface ShopContentProps {
  initCategory?: string | "all";
  initSubcategory?: string | "all";
}

const ITEMS_PER_PAGE = 12;

type SortOption = "default" | "name-asc" | "name-desc" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortOption, string> = {
  default: "Default",
  "name-asc": "Name: A → Z",
  "name-desc": "Name: Z → A",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

function sortProducts(items: Product[], sortBy: SortOption): Product[] {
  const sorted = [...items];
  switch (sortBy) {
    case "default":
      // Keep the order returned by the backend — no client-side sorting.
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
  }
  return sorted;
}

export default function ShopContent({
  initCategory = "all",
  initSubcategory = "all",
}: ShopContentProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // category and subcategory are URL-driven — read directly from props
  const category = initCategory;
  const subcategory = initSubcategory;

  useEffect(() => {
    categoryService
      .getAll()
      .then(setCategories)
      .catch((err) => console.error(err))
      .finally(() => setCategoriesLoaded(true));
  }, []);

  // Reset to page 1 whenever the URL-driven category/subcategory changes.
  // Adjusting state during render (rather than in an effect) avoids an
  // extra cascading render — see https://react.dev/learn/you-might-not-need-an-effect
  const [prevFilters, setPrevFilters] = useState({ category, subcategory, sortBy });
  if (
    prevFilters.category !== category ||
    prevFilters.subcategory !== subcategory ||
    prevFilters.sortBy !== sortBy
  ) {
    setPrevFilters({ category, subcategory, sortBy });
    setPage(1);
  }

  useEffect(() => {
    if (!categoriesLoaded) return;
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      try {
        // Sorting must hold across the whole filtered catalog (not just the
        // current page), so fetch every matching item up front and paginate
        // client-side after sorting.
        let allItems: Product[];

        if (subcategory !== "all") {
          const result = await productService.getByCategory(Number(subcategory), {
            page: 1,
            pageSize: 1000,
          });
          allItems = result.items;
        } else if (category !== "all") {
          // Backend only scopes by a single category id — a top-level category
          // groups several leaf categories that products are actually assigned
          // to, so roll the parent + its children up client-side.
          const childIds = categories
            .filter((c) => c.parentCategoryId === Number(category))
            .map((c) => c.id);
          const ids = [Number(category), ...childIds];
          const pages = await Promise.all(
            ids.map((id) => productService.getByCategory(id, { page: 1, pageSize: 1000 })),
          );
          allItems = pages.flatMap((r) => r.items);
        } else {
          const result = await productService.getPaged({ page: 1, pageSize: 1000 });
          allItems = result.items;
        }

        if (cancelled) return;
        const sorted = sortProducts(allItems, sortBy);
        const start = (page - 1) * ITEMS_PER_PAGE;
        setProducts(sorted.slice(start, start + ITEMS_PER_PAGE));
        setTotalItems(sorted.length);
        setTotalPages(Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE)));
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [category, subcategory, page, categories, categoriesLoaded, sortBy]);

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
            <div>
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
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <h2
              className="serif"
              style={{ fontSize: "1.5rem", fontWeight: 700 }}
            >
              {heading}
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#64748b", fontSize: ".875rem" }}>
                {totalItems} product{totalItems !== 1 ? "s" : ""}
              </span>

              {/* Sort box */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#fff",
                  borderRadius: "0.75rem",
                  padding: "0.4rem 0.75rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,.05)",
                }}
              >
                <span
                  style={{
                    fontSize: ".85rem",
                    fontWeight: 500,
                    color: "#64748b",
                  }}
                >
                  Sort
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{
                    border: "none",
                    padding: 0,
                    width: "auto",
                    fontSize: ".85rem",
                    fontWeight: 500,
                    color: "#374151",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <option key={key} value={key}>
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {!loading && products.length === 0 ? (
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
                {products.map((p) => (
                  <ProductCard key={p.id} p={p} categoryName={p.category ?? ""} />
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
                      disabled={page === 1}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "0.5rem",
                        border: "1.5px solid",
                        borderColor:
                          page === 1 ? "#e2e8f0" : "var(--amber-border)",
                        background:
                          page === 1 ? "#f8fafc" : "var(--amber-xs)",
                        color: page === 1 ? "#cbd5e1" : "var(--amber-dk)",
                        cursor: page === 1 ? "default" : "pointer",
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
                    {getPageNums(page, totalPages).map((n, i) =>
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
                              page === n
                                ? "var(--teal)"
                                : "var(--amber-border)",
                            background:
                              page === n
                                ? "var(--teal)"
                                : "var(--amber-xs)",
                            color: page === n ? "#fff" : "var(--amber-dk)",
                            fontWeight: page === n ? 700 : 500,
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
                      disabled={page === totalPages}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "0.5rem",
                        border: "1.5px solid",
                        borderColor:
                          page === totalPages
                            ? "#e2e8f0"
                            : "var(--amber-border)",
                        background:
                          page === totalPages
                            ? "#f8fafc"
                            : "var(--amber-xs)",
                        color:
                          page === totalPages
                            ? "#cbd5e1"
                            : "var(--amber-dk)",
                        cursor: page === totalPages ? "default" : "pointer",
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
