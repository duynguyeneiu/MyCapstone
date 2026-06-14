"use client";
import { useState } from "react";
import { PRODUCTS } from "../../../lib/data";

interface Props {
  search: string;
}


const CAT_LABELS: Record<string, string> = {
  beverages: "Beverages",
  snacks: "Snacks & Confectionery",
  food: "Food",
  "personal-care": "Personal Care",
  household: "Household Essentials",
};

const SUB_LABELS: Record<string, string> = {
  "water-soft-drinks": "Water & Soft Drinks",
  "tea-coffee": "Tea & Coffee",
  "chips-snacks": "Chips & Snacks",
  sweets: "Sweets",
  "instant-foods": "Instant Foods",
  "ready-canned": "Ready & Canned Foods",
  "oral-hair-care": "Oral & Hair Care",
  "body-skin-care": "Body & Skin Care",
  "laundry-cleaning": "Laundry & Cleaning",
  "paper-storage": "Paper & Storage",
};

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  beverages: { bg: "#e0f5ed", text: "#004d38" },
  snacks: { bg: "#fff3d6", text: "#7a5c00" },
  food: { bg: "#fef3c7", text: "#92400e" },
  "personal-care": { bg: "#ede9fe", text: "#4c1d95" },
  household: { bg: "#e0f2fe", text: "#075985" },
};

const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';

const SUB_BY_CAT: Record<string, string[]> = {
  beverages:       ['water-soft-drinks', 'tea-coffee'],
  snacks:          ['chips-snacks', 'sweets'],
  food:            ['instant-foods', 'ready-canned'],
  'personal-care': ['oral-hair-care', 'body-skin-care'],
  household:       ['laundry-cleaning', 'paper-storage'],
};

interface AdminProduct {
  id: number;
  name: string;
  code: string;
  cat: string;
  subcat: string;
  image: string;
  importPrice: number;
  salePrice: number;
  stock: number;
  status: string;
  desc: string;
  rating: number;
}

const toAdmin = (): AdminProduct[] =>
  PRODUCTS.map((p) => {
    const stock = 20 + ((p.id * 17 + 3) % 120);
    return {
      id: p.id,
      name: p.name,
      code: `P${String(p.id).padStart(3, "0")}`,
      cat: p.category,
      subcat: p.subcategory,
      image: p.image,
      importPrice: p.original
        ? Math.round(p.original * 0.72 * 100) / 100
        : Math.round(p.price * 0.72 * 100) / 100,
      salePrice: p.price,
      stock,
      status: stock <= 10 ? "Low Stock" : "Active",
      desc: p.desc,
      rating: p.rating,
    };
  });

const emptyForm = {
  name: "",
  code: "",
  cat: "",
  subcat: "",
  image: "",
  stock: "",
  importPrice: "",
  salePrice: "",
  desc: "",
  status: "Active",
};

export default function AdminProductsPage({ search }: Props) {
  const [products, setProducts] = useState<AdminProduct[]>(toAdmin());
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = products.filter(
    (p) =>
      (!search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())) &&
      (!catFilter || p.cat === catFilter) &&
      (!statusFilter || p.status === statusFilter),
  );

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(curPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const goTo = (p: number) => setCurPage(Math.max(1, Math.min(totalPages, p)));

  const pageNums: number[] = [];
  const half = 2;
  let lo = Math.max(1, safePage - half);
  let hi = Math.min(totalPages, safePage + half);
  if (hi - lo < 4) {
    if (lo === 1) hi = Math.min(totalPages, lo + 4);
    else lo = Math.max(1, hi - 4);
  }
  for (let i = lo; i <= hi; i++) pageNums.push(i);

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      Active: { bg: "#e0f5ed", text: "#004d38" },
      Inactive: { bg: "#e5e7eb", text: "#374151" },
      "Low Stock": { bg: "#fff3d6", text: "#7a5c00" },
    };
    const c = map[s] ?? map["Inactive"];
    return (
      <span
        style={{
          background: c.bg,
          color: c.text,
          padding: "3px 10px",
          borderRadius: "99px",
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        {s}
      </span>
    );
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };
  const openEdit = (p: AdminProduct) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      code: p.code,
      cat: p.cat,
      subcat: p.subcat,
      image: p.image,
      stock: String(p.stock),
      importPrice: String(p.importPrice),
      salePrice: String(p.salePrice),
      desc: p.desc,
      status: p.status === "Low Stock" ? "Active" : p.status,
    });
    setFormOpen(true);
  };
  const saveProduct = () => {
    if (!form.name.trim()) {
      alert("Product name is required");
      return;
    }
    if (editId !== null) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editId
            ? {
                ...p,
                name: form.name,
                code: form.code,
                cat: form.cat || p.cat,
                subcat: form.subcat || p.subcat,
                image: form.image || p.image,
                stock: parseInt(form.stock) || 0,
                importPrice: parseFloat(form.importPrice) || 0,
                salePrice: parseFloat(form.salePrice) || 0,
                status: form.status,
                desc: form.desc,
              }
            : p,
        ),
      );
    } else {
      const stock = parseInt(form.stock) || 0;
      setProducts((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: form.name,
          code: form.code,
          cat: form.cat || "beverages",
          subcat: form.subcat || "",
          image: form.image,
          importPrice: parseFloat(form.importPrice) || 0,
          salePrice: parseFloat(form.salePrice) || 0,
          stock,
          status: stock <= 10 ? "Low Stock" : form.status,
          desc: form.desc,
          rating: 0,
        },
      ]);
    }
    setFormOpen(false);
  };
  const openDelete = (id: number) => {
    setDeleteId(id);
    setDelOpen(true);
  };
  const confirmDelete = () => {
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    setDelOpen(false);
  };

  const lowStockCount = products.filter((p) => p.status === "Low Stock").length;
  const activeCount = products.filter((p) => p.status === "Active").length;

  return (
    <>
      <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-5">
            <div
              className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between"
              style={{
                borderColor: "#b8e0cc",
                boxShadow: "0 0 0 1px #00694c1a,0 4px 20px #00694c14",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-on-surface-variant font-label-md text-label-md mb-1">
                    Total Products
                  </p>
                  <h3 className="font-bold" style={{ fontSize: "24px" }}>
                    {products.length}
                  </h3>
                </div>
                <span
                  className="material-symbols-outlined p-2 rounded-lg"
                  style={{ color: "#00694c", background: "#e0f5ed" }}
                >
                  shopping_bag
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span
                  className="font-label-sm text-label-sm"
                  style={{ color: "#00694c" }}
                >
                  {Object.keys(CAT_LABELS).length} categories
                </span>
              </div>
            </div>
            <div
              className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between"
              style={{
                borderColor: "#fcd97a",
                boxShadow: "0 0 0 1px #f59e0b1a,0 4px 20px #f59e0b14",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-on-surface-variant font-label-md text-label-md mb-1">
                    Active Products
                  </p>
                  <h3 className="font-bold" style={{ fontSize: "24px" }}>
                    {activeCount}
                  </h3>
                </div>
                <span
                  className="material-symbols-outlined p-2 rounded-lg"
                  style={{ color: "#b47b10", background: "#fff3d6" }}
                >
                  check_circle
                </span>
              </div>
              <div className="mt-4">
                <span
                  className="font-label-sm text-label-sm"
                  style={{ color: "#b47b10" }}
                >
                  {Math.round((activeCount / products.length) * 100)}% of total
                </span>
              </div>
            </div>
            <div
              className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between"
              style={{
                borderColor: "#fac057",
                boxShadow: "0 0 0 1px #D9770622,0 4px 20px #D9770614",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-on-surface-variant font-label-md text-label-md mb-1">
                    Low Stock
                  </p>
                  <h3
                    className="font-bold"
                    style={{ fontSize: "24px", color: "#854f0b" }}
                  >
                    {lowStockCount}
                  </h3>
                </div>
                <span
                  className="material-symbols-outlined p-2 rounded-lg"
                  style={{ color: "#854f0b", background: "#fff3d6" }}
                >
                  warning
                </span>
              </div>
              <div className="mt-4">
                <span
                  className="font-label-sm text-label-sm font-medium"
                  style={{ color: "#854f0b" }}
                >
                  Need restock
                </span>
              </div>
            </div>
            <div
              className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between"
              style={{
                borderColor: "#b8e0cc",
                boxShadow: "0 0 0 1px #00694c1a,0 4px 20px #00694c14",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-on-surface-variant font-label-md text-label-md mb-1">
                    Subcategories
                  </p>
                  <h3 className="font-bold" style={{ fontSize: "24px" }}>
                    {Object.keys(SUB_LABELS).length}
                  </h3>
                </div>
                <span
                  className="material-symbols-outlined p-2 rounded-lg"
                  style={{ color: "#00694c", background: "#e0f5ed" }}
                >
                  category
                </span>
              </div>
              <div className="mt-4">
                <span
                  className="font-label-sm text-label-sm"
                  style={{ color: "#00694c" }}
                >
                  Across all categories
                </span>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div
            className="bg-surface-container-lowest border rounded-xl overflow-hidden"
            style={{ borderColor: "#c8e4d8" }}
          >
            <div
              className="p-6 border-b flex items-center justify-between gap-3 flex-wrap"
              style={{ borderColor: "#c8e4d8" }}
            >
              <div className="flex items-center gap-3">
                <select
                  value={catFilter}
                  onChange={(e) => {
                    setCatFilter(e.target.value);
                    setCurPage(1);
                  }}
                  className="rounded-lg px-3 py-2 focus:outline-none"
                  style={{
                    background: "#fff8e6",
                    border: "1.5px solid #fcd97a",
                    fontSize: "13px",
                  }}
                >
                  <option value="">All Categories</option>
                  {Object.entries(CAT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurPage(1);
                  }}
                  className="rounded-lg px-3 py-2 focus:outline-none"
                  style={{
                    background: "#fff8e6",
                    border: "1.5px solid #fcd97a",
                    fontSize: "13px",
                  }}
                >
                  <option value="">All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Low Stock</option>
                </select>
              </div>
              <button
                onClick={openAdd}
                className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-bold"
                style={{ fontSize: "14px" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  add
                </span>
                Add Product
              </button>
            </div>
            <div style={{ overflowX: "auto", width: "100%" }}>
              <table
                className="text-left"
                style={{ minWidth: "100%", whiteSpace: "nowrap" }}
              >
                <thead style={{ background: "#f4fbf7" }}>
                  <tr>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Subcategory
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Import Price
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Sale Price
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Rating
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "#c8e4d8" }}>
                  {paged.map((p) => {
                    const cc = CAT_COLORS[p.cat] ?? {
                      bg: "#e0f5ed",
                      text: "#004d38",
                    };
                    const stockColor = p.stock <= 10 ? "#854f0b" : "#191c1e";
                    return (
                      <tr
                        key={p.id}
                        className="transition-colors"
                        style={{ borderColor: "#c8e4d8" }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden"
                              style={{ background: "#f4fbf7" }}
                            >
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    padding: 4,
                                  }}
                                />
                              ) : (
                                <span className="flex items-center justify-center w-full h-full text-xl">
                                  📦
                                </span>
                              )}
                            </div>
                            <div>
                              <p
                                className="font-bold text-on-surface"
                                style={{ fontSize: "13px" }}
                              >
                                {p.name}
                              </p>
                              <p
                                className="text-on-surface-variant"
                                style={{ fontSize: "11px" }}
                              >
                                {p.code}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            style={{
                              background: cc.bg,
                              color: cc.text,
                              padding: "3px 10px",
                              borderRadius: "99px",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            {CAT_LABELS[p.cat] ?? p.cat}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-on-surface-variant"
                          style={{ fontSize: "12px" }}
                        >
                          {SUB_LABELS[p.subcat] ?? p.subcat}
                        </td>
                        <td
                          className="px-4 py-3 text-on-surface"
                          style={{ fontSize: "13px" }}
                        >
                          {fmt(p.importPrice)}
                        </td>
                        <td
                          className="px-4 py-3 font-bold text-on-surface"
                          style={{ fontSize: "13px" }}
                        >
                          {fmt(p.salePrice)}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{
                            fontSize: "13px",
                            color: stockColor,
                            fontWeight: p.stock <= 10 ? 700 : 400,
                          }}
                        >
                          {p.stock}
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: "13px" }}>
                          <span style={{ color: "#b47b10", fontWeight: 600 }}>
                            ★ {p.rating.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">{statusBadge(p.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                              style={{ borderColor: "#c8e4d8" }}
                              onMouseOver={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background = "#e0f5ed";
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.borderColor = "#00694c";
                              }}
                              onMouseOut={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background = "";
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.borderColor = "#c8e4d8";
                              }}
                              title="Edit"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "16px", color: "#3d4943" }}
                              >
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => openDelete(p.id)}
                              className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                              style={{ borderColor: "#c8e4d8" }}
                              onMouseOver={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background = "#fee2e2";
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.borderColor = "#dc2626";
                              }}
                              onMouseOut={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background = "";
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.borderColor = "#c8e4d8";
                              }}
                              title="Delete"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "16px", color: "#3d4943" }}
                              >
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              className="px-6 py-4 border-t flex items-center justify-center"
              style={{ borderColor: "#c8e4d8" }}
            >
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {/* Prev */}
                  <button
                    onClick={() => goTo(safePage - 1)}
                    disabled={safePage === 1}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                    style={{
                      borderColor: "#c8e4d8",
                      opacity: safePage === 1 ? 0.35 : 1,
                      cursor: safePage === 1 ? "not-allowed" : "pointer",
                      fontSize: "16px",
                    }}
                    onMouseOver={(e) => {
                      if (safePage > 1)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#e0f5ed";
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "";
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      chevron_left
                    </span>
                  </button>

                  {/* First page shortcut */}
                  {lo > 1 && (
                    <>
                      <button
                        onClick={() => goTo(1)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                        style={{
                          borderColor: "#c8e4d8",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#e0f5ed";
                        }}
                        onMouseOut={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "";
                        }}
                      >
                        1
                      </button>
                      {lo > 2 && (
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#94a3b8",
                            padding: "0 2px",
                          }}
                        >
                          …
                        </span>
                      )}
                    </>
                  )}

                  {/* Page numbers */}
                  {pageNums.map((n) => (
                    <button
                      key={n}
                      onClick={() => goTo(n)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                      style={{
                        borderColor: n === safePage ? "#00694c" : "#c8e4d8",
                        background: n === safePage ? "#00694c" : "",
                        color: n === safePage ? "#fff" : "",
                        fontWeight: n === safePage ? 700 : 400,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) => {
                        if (n !== safePage)
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#e0f5ed";
                      }}
                      onMouseOut={(e) => {
                        if (n !== safePage)
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "";
                      }}
                    >
                      {n}
                    </button>
                  ))}

                  {/* Last page shortcut */}
                  {hi < totalPages && (
                    <>
                      {hi < totalPages - 1 && (
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#94a3b8",
                            padding: "0 2px",
                          }}
                        >
                          …
                        </span>
                      )}
                      <button
                        onClick={() => goTo(totalPages)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                        style={{
                          borderColor: "#c8e4d8",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#e0f5ed";
                        }}
                        onMouseOut={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "";
                        }}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  {/* Next */}
                  <button
                    onClick={() => goTo(safePage + 1)}
                    disabled={safePage === totalPages}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                    style={{
                      borderColor: "#c8e4d8",
                      opacity: safePage === totalPages ? 0.35 : 1,
                      cursor:
                        safePage === totalPages ? "not-allowed" : "pointer",
                    }}
                    onMouseOver={(e) => {
                      if (safePage < totalPages)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#e0f5ed";
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "";
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      chevron_right
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Add / Edit Modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setFormOpen(false);
          }}
        >
          <div
            className="rounded-2xl w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto"
            style={{
              background: "#ffffff",
              border: "1.5px solid #c8e4d8",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,105,76,0.12)",
            }}
          >
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: "#c8e4d8" }}
            >
              <h3
                className="font-bold text-on-surface"
                style={{ fontSize: "18px" }}
              >
                {editId ? "Edit Product" : "Add Product"}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-1"
              >
                close
              </button>
            </div>
            <div className="p-6 space-y-4">

              {/* Image URL + preview */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Image URL
                </label>
                <div className="flex gap-3 items-start">
                  <div className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                    style={{ background: "#f4fbf7", border: "1.5px solid #c8e4d8" }}>
                    {form.image
                      ? <img src={form.image} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                      : <span className="material-symbols-outlined" style={{ color: "#b8d4c8", fontSize: 28 }}>image</span>
                    }
                  </div>
                  <input
                    type="text"
                    placeholder="https://… or /images/product.png"
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: "1.5px solid #c8e4d8", background: "#f4fbf7", fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Name + Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                    Product Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: "1.5px solid #c8e4d8", background: "#f4fbf7", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                    Product Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. P001"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: "1.5px solid #c8e4d8", background: "#f4fbf7", fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Category + Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                    Category <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    value={form.cat}
                    onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value, subcat: "" }))}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: "1.5px solid #c8e4d8", background: "#f4fbf7", fontSize: "14px" }}
                  >
                    <option value="">Select category</option>
                    {Object.entries(CAT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                    Subcategory
                  </label>
                  <select
                    value={form.subcat}
                    onChange={(e) => setForm((f) => ({ ...f, subcat: e.target.value }))}
                    disabled={!form.cat}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      border: "1.5px solid #c8e4d8", background: "#f4fbf7", fontSize: "14px",
                      opacity: form.cat ? 1 : 0.5, cursor: form.cat ? "pointer" : "not-allowed",
                    }}
                  >
                    <option value="">Select subcategory</option>
                    {(SUB_BY_CAT[form.cat] ?? []).map((k) => (
                      <option key={k} value={k}>{SUB_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Import Price + Sale Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                    Import Price (₫) <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={form.importPrice}
                    onChange={(e) => setForm((f) => ({ ...f, importPrice: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: "1.5px solid #c8e4d8", background: "#f4fbf7", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                    Sale Price (₫) <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={form.salePrice}
                    onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: "1.5px solid #c8e4d8", background: "#f4fbf7", fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Stock + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: "1.5px solid #c8e4d8", background: "#f4fbf7", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: "1.5px solid #c8e4d8", background: "#f4fbf7", fontSize: "14px" }}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Product description..."
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none resize-none"
                  style={{ border: "1.5px solid #c8e4d8", background: "#f4fbf7", fontSize: "14px" }}
                />
              </div>
            </div>
            <div
              className="flex justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: "#c8e4d8" }}
            >
              <button
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container"
                style={{ borderColor: "#c8e4d8", fontSize: "14px" }}
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                className="btn-primary px-4 py-2 rounded-lg text-white font-bold"
                style={{ fontSize: "14px" }}
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {delOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDelOpen(false);
          }}
        >
          <div
            className="rounded-2xl w-[360px] p-8 text-center"
            style={{
              background: "#ffffff",
              border: "2px solid #00a86b",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,105,76,0.15)",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#fee2e2" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#991b1b", fontSize: "28px" }}
              >
                delete
              </span>
            </div>
            <h3
              className="font-bold text-on-surface mb-2"
              style={{ fontSize: "18px" }}
            >
              Delete product?
            </h3>
            <p
              className="text-on-surface-variant mb-6"
              style={{ fontSize: "14px" }}
            >
              &quot;{products.find((p) => p.id === deleteId)?.name}&quot; will
              be permanently removed from the catalogue.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDelOpen(false)}
                className="px-5 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container"
                style={{ borderColor: "#c8e4d8", fontSize: "14px" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-lg text-white font-bold"
                style={{ background: "#dc2626", fontSize: "14px" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
