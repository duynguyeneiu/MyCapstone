"use client";
import { useState } from "react";
import { PRODUCTS } from "../../../lib/data";

interface Props {
  search: string;
}

const iconMap: Record<string, { icon: string; bg: string; color: string }> = {
  Beverages: { icon: "local_cafe", bg: "#e0f5ed", color: "#00694c" },
  "Snacks & Confectionery": { icon: "cookie", bg: "#fff3d6", color: "#b47b10" },
  Food: { icon: "restaurant", bg: "#fef3c7", color: "#92400e" },
  "Personal Care": { icon: "spa", bg: "#ede9fe", color: "#6d28d9" },
  "Household Essentials": { icon: "home", bg: "#e0f2fe", color: "#0369a1" },
  "Water & Soft Drinks": {
    icon: "water_drop",
    bg: "#e0f5ed",
    color: "#00694c",
  },
  "Tea & Coffee": {
    icon: "emoji_food_beverage",
    bg: "#fff3d6",
    color: "#b47b10",
  },
  "Chips & Snacks": { icon: "bakery_dining", bg: "#fff3d6", color: "#b47b10" },
  Sweets: { icon: "cake", bg: "#fce7f3", color: "#9d174d" },
  "Instant Foods": { icon: "ramen_dining", bg: "#fef3c7", color: "#92400e" },
  "Ready & Canned Foods": { icon: "set_meal", bg: "#fef3c7", color: "#92400e" },
  "Oral & Hair Care": { icon: "face", bg: "#ede9fe", color: "#6d28d9" },
  "Body & Skin Care": {
    icon: "self_improvement",
    bg: "#ede9fe",
    color: "#6d28d9",
  },
  "Laundry & Cleaning": {
    icon: "local_laundry_service",
    bg: "#e0f2fe",
    color: "#0369a1",
  },
  "Paper & Storage": { icon: "inventory_2", bg: "#e0f2fe", color: "#0369a1" },
};
const defaultIcon = { icon: "category", bg: "#e0f5ed", color: "#00694c" };

interface Category {
  id: number;
  name: string;
  parent: string;
  products: number;
  desc: string;
  status: string;
}

const catProductCount = (cat: string) =>
  PRODUCTS.filter((p) => p.category === cat).length;
const subProductCount = (sub: string) =>
  PRODUCTS.filter((p) => p.subcategory === sub).length;

const initialCategories: Category[] = [
  // ── Top-level categories ──────────────────────────────────────────────────
  {
    id: 1,
    name: "Beverages",
    parent: "",
    products: catProductCount("beverages"),
    desc: "Drinks, teas, coffees and soft beverages",
    status: "Active",
  },
  {
    id: 2,
    name: "Snacks & Confectionery",
    parent: "",
    products: catProductCount("snacks"),
    desc: "Chips, crackers, sweets and candy",
    status: "Active",
  },
  {
    id: 3,
    name: "Food",
    parent: "",
    products: catProductCount("food"),
    desc: "Instant noodles, canned and ready-to-eat foods",
    status: "Active",
  },
  {
    id: 4,
    name: "Personal Care",
    parent: "",
    products: catProductCount("personal-care"),
    desc: "Oral hygiene, hair, body and skin care products",
    status: "Active",
  },
  {
    id: 5,
    name: "Household Essentials",
    parent: "",
    products: catProductCount("household"),
    desc: "Cleaning supplies, paper goods and storage",
    status: "Active",
  },
  // ── Subcategories › Beverages ─────────────────────────────────────────────
  {
    id: 6,
    name: "Water & Soft Drinks",
    parent: "Beverages",
    products: subProductCount("water-soft-drinks"),
    desc: "Purified water, mineral water and soft drinks",
    status: "Active",
  },
  {
    id: 7,
    name: "Tea & Coffee",
    parent: "Beverages",
    products: subProductCount("tea-coffee"),
    desc: "Ready-to-drink teas and canned coffees",
    status: "Active",
  },
  // ── Subcategories › Snacks & Confectionery ───────────────────────────────
  {
    id: 8,
    name: "Chips & Snacks",
    parent: "Snacks & Confectionery",
    products: subProductCount("chips-snacks"),
    desc: "Potato chips, crackers and savory snacks",
    status: "Active",
  },
  {
    id: 9,
    name: "Sweets",
    parent: "Snacks & Confectionery",
    products: subProductCount("sweets"),
    desc: "Candy, chocolate bars and wafer treats",
    status: "Active",
  },
  // ── Subcategories › Food ─────────────────────────────────────────────────
  {
    id: 10,
    name: "Instant Foods",
    parent: "Food",
    products: subProductCount("instant-foods"),
    desc: "Instant noodles, porridge and quick meals",
    status: "Active",
  },
  {
    id: 11,
    name: "Ready & Canned Foods",
    parent: "Food",
    products: subProductCount("ready-canned"),
    desc: "Canned meats, tuna and ready-to-eat products",
    status: "Active",
  },
  // ── Subcategories › Personal Care ────────────────────────────────────────
  {
    id: 12,
    name: "Oral & Hair Care",
    parent: "Personal Care",
    products: subProductCount("oral-hair-care"),
    desc: "Toothpaste, toothbrush, mouthwash and shampoo",
    status: "Active",
  },
  {
    id: 13,
    name: "Body & Skin Care",
    parent: "Personal Care",
    products: subProductCount("body-skin-care"),
    desc: "Body wash, soap, lotion and sunscreen",
    status: "Active",
  },
  // ── Subcategories › Household Essentials ─────────────────────────────────
  {
    id: 14,
    name: "Laundry & Cleaning",
    parent: "Household Essentials",
    products: subProductCount("laundry-cleaning"),
    desc: "Detergent, fabric softener and surface cleaners",
    status: "Active",
  },
  {
    id: 15,
    name: "Paper & Storage",
    parent: "Household Essentials",
    products: subProductCount("paper-storage"),
    desc: "Toilet paper, tissues, wet wipes and foil",
    status: "Active",
  },
];

const emptyForm = { name: "", parent: "", desc: "", status: "Active" };

export default function AdminCategoriesPage({ search }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [statusFilter, setStatusFilter] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [checkAll, setCheckAll] = useState(false);
  const [curPage, setCurPage] = useState(1);

  const filtered = () =>
    categories.filter(
      (c) =>
        (!search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.desc.toLowerCase().includes(search.toLowerCase())) &&
        (!statusFilter || c.status === statusFilter) &&
        (!parentFilter || (parentFilter === "Category" ? !c.parent : parentFilter === "Subcategory" ? !!c.parent : true)),
    );

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditId(c.id);
    setForm({ name: c.name, parent: c.parent, desc: c.desc, status: c.status });
    setFormOpen(true);
  };

  const saveCategory = () => {
    if (!form.name.trim()) {
      alert("Category name is required");
      return;
    }
    if (editId !== null) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editId
            ? {
                ...c,
                name: form.name,
                parent: form.parent,
                desc: form.desc,
                status: form.status,
              }
            : c,
        ),
      );
    } else {
      setCategories((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: form.name,
          parent: form.parent,
          products: 0,
          desc: form.desc,
          status: form.status,
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
    setCategories((prev) => prev.filter((c) => c.id !== deleteId));
    setDelOpen(false);
  };

  const data = filtered();

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const safePage = Math.min(curPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paged = data.slice(pageStart, pageStart + PAGE_SIZE);
  const goTo = (p: number) => setCurPage(Math.max(1, Math.min(totalPages, p)));
  const half = 2;
  let lo = Math.max(1, safePage - half);
  let hi = Math.min(totalPages, safePage + half);
  if (hi - lo < 4) {
    if (lo === 1) hi = Math.min(totalPages, lo + 4);
    else lo = Math.max(1, hi - 4);
  }
  const pageNums: number[] = [];
  for (let i = lo; i <= hi; i++) pageNums.push(i);

  return (
    <>
      <div className="p-8 space-y-6">
        {/* Stats */}
        {(() => {
          const activeCnt = categories.filter(
            (c) => c.status === "Active",
          ).length;
          const inactiveCnt = categories.filter(
            (c) => c.status === "Inactive",
          ).length;
          const pct = categories.length
            ? Math.round((activeCnt / categories.length) * 100)
            : 0;
          return (
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
                      Total Categories
                    </p>
                    <h3 className="font-bold" style={{ fontSize: "24px" }}>
                      {categories.length}
                    </h3>
                  </div>
                  <span
                    className="material-symbols-outlined p-2 rounded-lg"
                    style={{ color: "#00694c", background: "#e0f5ed" }}
                  >
                    category
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1">
                  <span
                    className="font-label-sm text-label-sm"
                    style={{ color: "#00694c" }}
                  >
                    {categories.filter((c) => !c.parent).length} parent ·{" "}
                    {categories.filter((c) => !!c.parent).length} sub
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
                      Active Categories
                    </p>
                    <h3 className="font-bold" style={{ fontSize: "24px" }}>
                      {activeCnt}
                    </h3>
                  </div>
                  <span
                    className="material-symbols-outlined p-2 rounded-lg"
                    style={{ color: "#b47b10", background: "#fff3d6" }}
                  >
                    check_circle
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1">
                  <span
                    className="font-label-sm text-label-sm"
                    style={{ color: "#b47b10" }}
                  >
                    {pct}% of total
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
                      Total Products
                    </p>
                    <h3 className="font-bold" style={{ fontSize: "24px" }}>
                      {PRODUCTS.length}
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
                    Across all categories
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
                      Inactive
                    </p>
                    <h3
                      className="font-bold"
                      style={{ fontSize: "24px", color: "#854f0b" }}
                    >
                      {inactiveCnt}
                    </h3>
                  </div>
                  <span
                    className="material-symbols-outlined p-2 rounded-lg"
                    style={{ color: "#854f0b", background: "#fff3d6" }}
                  >
                    block
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1">
                  <span
                    className="font-label-sm text-label-sm"
                    style={{ color: "#854f0b" }}
                  >
                    {inactiveCnt === 0
                      ? "All categories active"
                      : "Need review"}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Table */}
        <div
          className="bg-surface-container-lowest border rounded-xl overflow-hidden"
          style={{ borderColor: "#c8e4d8" }}
        >
          <div
            className="p-6 border-b flex items-center justify-between gap-3"
            style={{ borderColor: "#c8e4d8" }}
          >
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurPage(1);
                }}
                className="rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface-variant focus:outline-none"
                style={{
                  background: "#fff8e6",
                  border: "1.5px solid #fcd97a",
                  fontSize: "13px",
                }}
              >
                <option value="">All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <select
                value={parentFilter}
                onChange={(e) => {
                  setParentFilter(e.target.value);
                  setCurPage(1);
                }}
                className="rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface-variant focus:outline-none"
                style={{
                  background: "#fff8e6",
                  border: "1.5px solid #fcd97a",
                  fontSize: "13px",
                }}
              >
                <option value="">All Types</option>
                <option>Category</option>
                <option>Subcategory</option>
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
              Add Category
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ background: "#f4fbf7" }}>
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={checkAll}
                      onChange={(e) => setCheckAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Parent
                  </th>
                  <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Products
                  </th>
                  <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Description
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
                {paged.map((c) => {
                  const ic = iconMap[c.name] || defaultIcon;
                  return (
                    <tr
                      key={c.id}
                      className="transition-colors"
                      style={{ borderColor: "#c8e4d8" }}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={checkAll}
                          readOnly
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: ic.bg }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ color: ic.color, fontSize: "18px" }}
                            >
                              {ic.icon}
                            </span>
                          </div>
                          <p
                            className="font-bold text-on-surface"
                            style={{ fontSize: "13px" }}
                          >
                            {c.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {c.parent ? (
                          <span
                            style={{
                              background: "#fff3d6",
                              color: "#7a5c00",
                              padding: "2px 8px",
                              borderRadius: "99px",
                              fontSize: "11px",
                            }}
                          >
                            {c.parent}
                          </span>
                        ) : (
                          <span
                            style={{
                              background: "#e0f5ed",
                              color: "#004d38",
                              padding: "2px 8px",
                              borderRadius: "99px",
                              fontSize: "11px",
                            }}
                          >
                            Top-level
                          </span>
                        )}
                      </td>
                      <td
                        className="px-4 py-3 font-bold text-on-surface"
                        style={{ fontSize: "13px" }}
                      >
                        {c.products}
                      </td>
                      <td
                        className="px-4 py-3 text-on-surface-variant"
                        style={{
                          fontSize: "12px",
                          maxWidth: "220px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {c.desc}
                      </td>
                      <td className="px-4 py-3">
                        {c.status === "Active" ? (
                          <span
                            style={{
                              background: "#e0f5ed",
                              color: "#004d38",
                              padding: "3px 10px",
                              borderRadius: "99px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              background: "#e5e7eb",
                              color: "#374151",
                              padding: "3px 10px",
                              borderRadius: "99px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(c)}
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
                            onClick={() => openDelete(c.id)}
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
                <button
                  onClick={() => goTo(safePage - 1)}
                  disabled={safePage === 1}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center"
                  style={{
                    borderColor: "#c8e4d8",
                    opacity: safePage === 1 ? 0.35 : 1,
                    cursor: safePage === 1 ? "default" : "pointer",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    chevron_left
                  </span>
                </button>
                {lo > 1 && (
                  <>
                    <button
                      onClick={() => goTo(1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center"
                      style={{
                        borderColor: "#c8e4d8",
                        fontSize: "13px",
                        cursor: "pointer",
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
                {pageNums.map((n) => (
                  <button
                    key={n}
                    onClick={() => goTo(n)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                    style={{
                      fontSize: "13px",
                      cursor: "pointer",
                      border: "1.5px solid",
                      borderColor: n === safePage ? "#00694c" : "#c8e4d8",
                      background: n === safePage ? "#00694c" : "#fff",
                      color: n === safePage ? "#fff" : "#374151",
                    }}
                  >
                    {n}
                  </button>
                ))}
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
                      className="w-8 h-8 rounded-lg border flex items-center justify-center"
                      style={{
                        borderColor: "#c8e4d8",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => goTo(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center"
                  style={{
                    borderColor: "#c8e4d8",
                    opacity: safePage === totalPages ? 0.35 : 1,
                    cursor: safePage === totalPages ? "default" : "pointer",
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

      {/* Add/Edit Modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setFormOpen(false);
          }}
        >
          <div
            className="rounded-2xl w-[520px] max-w-[95vw] max-h-[90vh] overflow-y-auto"
            style={{
              background: "#ffffff",
              border: "1.5px solid #c8e4d8",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,105,76,0.12)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: "#c8e4d8" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "#e0f5ed" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#00694c", fontSize: "20px" }}
                  >
                    category
                  </span>
                </div>
                <h3
                  className="font-bold"
                  style={{ fontSize: "18px", color: "#191c1e" }}
                >
                  {editId ? "Edit Category" : "Add Category"}
                </h3>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="material-symbols-outlined rounded-full p-1"
                style={{
                  color: "#6b7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "22px",
                }}
              >
                close
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Name + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                    Category Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      border: "1.5px solid #c8e4d8",
                      background: "#f4fbf7",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      border: "1.5px solid #c8e4d8",
                      background: "#f4fbf7",
                      fontSize: "14px",
                    }}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              {/* Parent Category */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Parent Category
                </label>
                <select
                  value={form.parent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, parent: e.target.value }))
                  }
                  className="w-full rounded-lg px-3 py-2 focus:outline-none"
                  style={{
                    border: "1.5px solid #c8e4d8",
                    background: "#f4fbf7",
                    fontSize: "14px",
                  }}
                >
                  <option value="">None (Top-level category)</option>
                  <option>Beverages</option>
                  <option>Snacks &amp; Confectionery</option>
                  <option>Food</option>
                  <option>Personal Care</option>
                  <option>Household Essentials</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe this category..."
                  value={form.desc}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, desc: e.target.value }))
                  }
                  className="w-full rounded-lg px-3 py-2 focus:outline-none resize-none"
                  style={{
                    border: "1.5px solid #c8e4d8",
                    background: "#f4fbf7",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: "#c8e4d8" }}
            >
              <button
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-lg border"
                style={{
                  borderColor: "#c8e4d8",
                  fontSize: "14px",
                  color: "#3d4943",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveCategory}
                className="btn-primary px-4 py-2 rounded-lg text-white font-bold"
                style={{ fontSize: "14px" }}
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {delOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
          }}
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
              Delete category?
            </h3>
            <p
              className="text-on-surface-variant mb-2"
              style={{ fontSize: "14px" }}
            >
              &quot;{categories.find((c) => c.id === deleteId)?.name}&quot; will
              be permanently removed.
            </p>
            <p className="mb-6" style={{ fontSize: "12px", color: "#854f0b" }}>
              ⚠ Products in this category will be uncategorized.
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
