"use client";
import { useState } from "react";

interface Props {
  search: string;
}

const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

const statusConfig: Record<string, { bg: string; color: string }> = {
  Pending: { bg: "#fff3d6", color: "#7a5c00" },
  Processing: { bg: "#fff3d6", color: "#b47b10" },
  Shipped: { bg: "#e0f5ed", color: "#004d38" },
  Delivered: { bg: "#e0f5ed", color: "#004d38" },
  Paid: { bg: "#e0f5ed", color: "#004d38" },
  Refunded: { bg: "#fce7f3", color: "#831843" },
  Cancelled: { bg: "#fee2e2", color: "#7f1d1d" },
};

const payIcon: Record<string, string> = {
  Cash: "payments",
  "Bank Transfer": "account_balance",
  VNPay: "qr_code",
  COD: "local_shipping",
};

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}
interface Order {
  id: number;
  oid: string;
  customer: string;
  phone: string;
  address: string;
  date: string;
  channel: string;
  payment: string;
  amount: number;
  discount: number;
  status: string;
  items: OrderItem[];
}

const initialOrders: Order[] = [
  {
    id: 1,
    oid: "#ORD-2584",
    customer: "Minh Hoang",
    phone: "0901234567",
    address: "123 Le Loi, Q1, TP.HCM",
    date: "24 May 2024 09:32",
    channel: "Online",
    payment: "VNPay",
    amount: 1250000,
    discount: 0,
    status: "Delivered",
    items: [
      { name: "Wireless Earbuds Pro", qty: 1, price: 490000 },
      { name: "USB-C Hub 7-in-1", qty: 1, price: 750000 },
    ],
  },
  {
    id: 2,
    oid: "#ORD-2583",
    customer: "Phuong Linh",
    phone: "0912345678",
    address: "45 Nguyen Hue, Q1, TP.HCM",
    date: "24 May 2024 08:15",
    channel: "Online",
    payment: "Bank Transfer",
    amount: 850000,
    discount: 50000,
    status: "Processing",
    items: [
      { name: "Sunscreen SPF50+", qty: 2, price: 195000 },
      { name: "Face Wash Foam", qty: 1, price: 110000 },
      { name: "Green Tea 500ml", qty: 3, price: 15000 },
    ],
  },
  {
    id: 3,
    oid: "#ORD-2582",
    customer: "Tran Anh",
    phone: "0923456789",
    address: "78 Hai Ba Trung, Q3, TP.HCM",
    date: "24 May 2024 07:50",
    channel: "POS",
    payment: "Cash",
    amount: 2100000,
    discount: 100000,
    status: "Paid",
    items: [
      { name: "USB-C Hub 7-in-1", qty: 2, price: 750000 },
      { name: "Wireless Earbuds Pro", qty: 1, price: 490000 },
    ],
  },
  {
    id: 4,
    oid: "#ORD-2581",
    customer: "Duc Huy",
    phone: "0934567890",
    address: "POS Counter",
    date: "23 May 2024 17:20",
    channel: "POS",
    payment: "Cash",
    amount: 450000,
    discount: 0,
    status: "Cancelled",
    items: [
      { name: "Dish Soap 750ml", qty: 3, price: 38000 },
      { name: "Floor Cleaner 1L", qty: 2, price: 58000 },
    ],
  },
  {
    id: 5,
    oid: "#ORD-2580",
    customer: "Lan Anh",
    phone: "0945678901",
    address: "22 Vo Thi Sau, Q3, TP.HCM",
    date: "23 May 2024 15:10",
    channel: "Online",
    payment: "VNPay",
    amount: 980000,
    discount: 0,
    status: "Shipped",
    items: [
      { name: "Sunscreen SPF50+", qty: 3, price: 195000 },
      { name: "Face Wash Foam", qty: 3, price: 110000 },
    ],
  },
  {
    id: 6,
    oid: "#ORD-2579",
    customer: "Bao Long",
    phone: "0956789012",
    address: "POS Counter",
    date: "23 May 2024 12:30",
    channel: "POS",
    payment: "Cash",
    amount: 320000,
    discount: 20000,
    status: "Paid",
    items: [
      { name: "Green Tea 500ml", qty: 10, price: 15000 },
      { name: "Instant Noodles Pack", qty: 20, price: 7000 },
    ],
  },
  {
    id: 7,
    oid: "#ORD-2578",
    customer: "Thu Hang",
    phone: "0967890123",
    address: "55 Dien Bien Phu, Binh Thanh",
    date: "23 May 2024 10:05",
    channel: "Online",
    payment: "COD",
    amount: 1560000,
    discount: 0,
    status: "Pending",
    items: [
      { name: "Wireless Earbuds Pro", qty: 2, price: 490000 },
      { name: "Floor Cleaner 1L", qty: 2, price: 58000 },
    ],
  },
  {
    id: 8,
    oid: "#ORD-2577",
    customer: "Quoc Viet",
    phone: "0978901234",
    address: "POS Counter",
    date: "23 May 2024 09:00",
    channel: "POS",
    payment: "Bank Transfer",
    amount: 760000,
    discount: 0,
    status: "Refunded",
    items: [{ name: "USB-C Hub 7-in-1", qty: 1, price: 750000 }],
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AdminOrdersPage({ search }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [payFilter, setPayFilter] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [dStatus, setDStatus] = useState("");
  const [checkAll, setCheckAll] = useState(false);

  const filtered = () =>
    orders.filter(
      (o) =>
        (!search ||
          o.oid.toLowerCase().includes(search.toLowerCase()) ||
          o.customer.toLowerCase().includes(search.toLowerCase())) &&
        (!statusFilter || o.status === statusFilter) &&
        (!typeFilter || o.channel === typeFilter) &&
        (!payFilter || o.payment === payFilter),
    );

  const openDetail = (id: number) => {
    const o = orders.find((x) => x.id === id);
    if (!o) return;
    setCurrentOrderId(id);
    setDStatus(o.status);
    setDetailOpen(true);
  };

  const updateStatus = () => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === currentOrderId ? { ...o, status: dStatus } : o,
      ),
    );
    setDetailOpen(false);
  };

  const data = filtered();
  const currentOrder = orders.find((o) => o.id === currentOrderId);
  const subtotal = currentOrder
    ? currentOrder.items.reduce((s, i) => s + i.qty * i.price, 0)
    : 0;
  const vat = currentOrder
    ? Math.round((subtotal - currentOrder.discount) * 0.1)
    : 0;
  const total = subtotal - (currentOrder?.discount || 0) + vat;

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
                    Total Orders Today
                  </p>
                  <h3 className="font-bold" style={{ fontSize: "24px" }}>
                    47
                  </h3>
                </div>
                <span
                  className="material-symbols-outlined p-2 rounded-lg"
                  style={{ color: "#00694c", background: "#e0f5ed" }}
                >
                  receipt_long
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#00694c", fontSize: "18px" }}
                >
                  trending_up
                </span>
                <span
                  className="font-label-sm text-label-sm"
                  style={{ color: "#00694c" }}
                >
                  +12% from yesterday
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
                    Pending
                  </p>
                  <h3 className="font-bold" style={{ fontSize: "24px" }}>
                    12
                  </h3>
                </div>
                <span
                  className="material-symbols-outlined p-2 rounded-lg"
                  style={{ color: "#b47b10", background: "#fff3d6" }}
                >
                  hourglass_empty
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span
                  className="font-label-sm text-label-sm"
                  style={{ color: "#b47b10" }}
                >
                  Awaiting processing
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
                    Delivered
                  </p>
                  <h3 className="font-bold" style={{ fontSize: "24px" }}>
                    28
                  </h3>
                </div>
                <span
                  className="material-symbols-outlined p-2 rounded-lg"
                  style={{ color: "#00694c", background: "#e0f5ed" }}
                >
                  local_shipping
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span
                  className="font-label-sm text-label-sm"
                  style={{ color: "#00694c" }}
                >
                  Completed today
                </span>
              </div>
            </div>
            <div
              className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between"
              style={{
                borderColor: "#fca5a5",
                boxShadow: "0 0 0 1px #dc262622,0 4px 20px #dc262614",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-on-surface-variant font-label-md text-label-md mb-1">
                    Cancelled
                  </p>
                  <h3
                    className="font-bold"
                    style={{ fontSize: "24px", color: "#dc2626" }}
                  >
                    7
                  </h3>
                </div>
                <span
                  className="material-symbols-outlined p-2 rounded-lg"
                  style={{ color: "#dc2626", background: "#fee2e2" }}
                >
                  cancel
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span
                  className="font-label-sm text-label-sm"
                  style={{ color: "#dc2626" }}
                >
                  Today
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <optgroup label="── Online ──">
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </optgroup>
                  <optgroup label="── POS ──">
                    <option>Paid</option>
                    <option>Refunded</option>
                  </optgroup>
                  <option>Cancelled</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Channels</option>
                  <option>Online</option>
                  <option>POS</option>
                </select>
                <select
                  value={payFilter}
                  onChange={(e) => setPayFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Payments</option>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>VNPay</option>
                  <option>COD</option>
                </select>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container"
                style={{ borderColor: "#c8e4d8", fontSize: "14px" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  download
                </span>
                Export
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
                      Order ID
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Channel
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Payment
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">
                      Order Status
                    </th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "#c8e4d8" }}>
                  {data.map((o) => {
                    const sc =
                      statusConfig[o.status] || statusConfig["Pending"];
                    return (
                      <tr
                        key={o.id}
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
                          <p
                            className="font-bold text-on-surface"
                            style={{ fontSize: "13px" }}
                          >
                            {o.oid}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg,#00694c,#00a86b)",
                                fontSize: "11px",
                              }}
                            >
                              {getInitials(o.customer)}
                            </div>
                            <div>
                              <p
                                className="font-bold text-on-surface"
                                style={{ fontSize: "13px" }}
                              >
                                {o.customer}
                              </p>
                              <p
                                className="text-on-surface-variant"
                                style={{ fontSize: "11px" }}
                              >
                                {o.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 text-on-surface-variant"
                          style={{ fontSize: "12px" }}
                        >
                          {o.date}
                        </td>
                        <td className="px-4 py-3">
                          {o.channel === "Online" ? (
                            <span
                              style={{
                                background: "#fff3d6",
                                color: "#7a5c00",
                                padding: "2px 8px",
                                borderRadius: "99px",
                                fontSize: "11px",
                                fontWeight: 600,
                              }}
                            >
                              🌐 Online
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "#e0f5ed",
                                color: "#004d38",
                                padding: "2px 8px",
                                borderRadius: "99px",
                                fontSize: "11px",
                                fontWeight: 600,
                              }}
                            >
                              🏪 POS
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span
                              className="material-symbols-outlined text-on-surface-variant"
                              style={{ fontSize: "15px" }}
                            >
                              {payIcon[o.payment] || "payments"}
                            </span>
                            <span
                              className="text-on-surface-variant"
                              style={{ fontSize: "12px" }}
                            >
                              {o.payment}
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 font-bold text-on-surface"
                          style={{ fontSize: "13px" }}
                        >
                          {fmt(o.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            style={{
                              background: sc.bg,
                              color: sc.color,
                              padding: "3px 10px",
                              borderRadius: "99px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => openDetail(o.id)}
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
                              title="View & Update"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "16px", color: "#3d4943" }}
                              >
                                visibility
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
              className="px-6 py-4 border-t flex items-center justify-between"
              style={{ borderColor: "#c8e4d8" }}
            >
              <p
                className="text-on-surface-variant"
                style={{ fontSize: "13px" }}
              >
                Showing {data.length} of {orders.length} orders
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container"
                  style={{ borderColor: "#c8e4d8" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    chevron_left
                  </span>
                </button>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold btn-primary"
                  style={{ fontSize: "13px" }}
                >
                  1
                </button>
                <button
                  className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container"
                  style={{ borderColor: "#c8e4d8", fontSize: "13px" }}
                >
                  2
                </button>
                <button
                  className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container"
                  style={{ borderColor: "#c8e4d8", fontSize: "13px" }}
                >
                  3
                </button>
                <button
                  className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container"
                  style={{ borderColor: "#c8e4d8" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px" }}
                  >
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Detail Modal */}
      {detailOpen && currentOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailOpen(false);
          }}
        >
          <div
            className="bg-surface-container-lowest rounded-xl border w-[560px] max-w-[95vw] max-h-[90vh] overflow-y-auto"
            style={{ borderColor: "#c8e4d8" }}
          >
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: "#c8e4d8" }}
            >
              <div>
                <h3
                  className="font-bold text-on-surface"
                  style={{ fontSize: "18px" }}
                >
                  {currentOrder.oid}
                </h3>
                <p
                  className="text-on-surface-variant"
                  style={{ fontSize: "12px" }}
                >
                  {currentOrder.date}
                </p>
              </div>
              <button
                onClick={() => setDetailOpen(false)}
                className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-1"
              >
                close
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Customer info */}
              <div
                className="rounded-xl p-4"
                style={{ background: "#f4fbf7", border: "1px solid #c8e4d8" }}
              >
                <p
                  className="font-bold text-on-surface mb-3"
                  style={{ fontSize: "13px" }}
                >
                  Customer Information
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p
                      className="text-on-surface-variant"
                      style={{ fontSize: "11px" }}
                    >
                      Name
                    </p>
                    <p
                      className="font-bold text-on-surface"
                      style={{ fontSize: "13px" }}
                    >
                      {currentOrder.customer}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-on-surface-variant"
                      style={{ fontSize: "11px" }}
                    >
                      Phone
                    </p>
                    <p
                      className="font-bold text-on-surface"
                      style={{ fontSize: "13px" }}
                    >
                      {currentOrder.phone}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p
                      className="text-on-surface-variant"
                      style={{ fontSize: "11px" }}
                    >
                      Shipping Address
                    </p>
                    <p
                      className="font-bold text-on-surface"
                      style={{ fontSize: "13px" }}
                    >
                      {currentOrder.address}
                    </p>
                  </div>
                </div>
              </div>
              {/* Order items */}
              <div>
                <p
                  className="font-bold text-on-surface mb-2"
                  style={{ fontSize: "13px" }}
                >
                  Order Items
                </p>
                <table className="w-full" style={{ fontSize: "13px" }}>
                  <thead>
                    <tr className="border-b" style={{ borderColor: "#c8e4d8" }}>
                      <th className="text-left py-2 text-on-surface-variant font-label-sm text-label-sm uppercase">
                        Product
                      </th>
                      <th className="text-center py-2 text-on-surface-variant font-label-sm text-label-sm uppercase">
                        Qty
                      </th>
                      <th className="text-right py-2 text-on-surface-variant font-label-sm text-label-sm uppercase">
                        Price
                      </th>
                      <th className="text-right py-2 text-on-surface-variant font-label-sm text-label-sm uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: "#c8e4d8" }}
                  >
                    {currentOrder.items.map((item, idx) => (
                      <tr key={idx} style={{ borderColor: "#c8e4d8" }}>
                        <td className="py-2 text-on-surface">{item.name}</td>
                        <td className="py-2 text-center text-on-surface-variant">
                          {item.qty}
                        </td>
                        <td className="py-2 text-right text-on-surface-variant">
                          {fmt(item.price)}
                        </td>
                        <td className="py-2 text-right font-bold text-on-surface">
                          {fmt(item.qty * item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Totals */}
              <div
                className="rounded-xl p-4 space-y-2"
                style={{ background: "#f4fbf7", border: "1px solid #c8e4d8" }}
              >
                <div
                  className="flex justify-between"
                  style={{ fontSize: "13px" }}
                >
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="text-on-surface">{fmt(subtotal)}</span>
                </div>
                <div
                  className="flex justify-between"
                  style={{ fontSize: "13px" }}
                >
                  <span className="text-on-surface-variant">Discount</span>
                  <span className="text-on-surface">
                    {currentOrder.discount
                      ? `-${fmt(currentOrder.discount)}`
                      : "—"}
                  </span>
                </div>
                <div
                  className="flex justify-between"
                  style={{ fontSize: "13px" }}
                >
                  <span className="text-on-surface-variant">VAT (10%)</span>
                  <span className="text-on-surface">{fmt(vat)}</span>
                </div>
                <div
                  className="flex justify-between border-t pt-2"
                  style={{ borderColor: "#c8e4d8" }}
                >
                  <span
                    className="font-bold text-on-surface"
                    style={{ fontSize: "14px" }}
                  >
                    Total
                  </span>
                  <span
                    className="font-bold"
                    style={{ fontSize: "14px", color: "#00694c" }}
                  >
                    {fmt(total)}
                  </span>
                </div>
              </div>
              {/* Payment & Channel */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#fff8e6", border: "1px solid #fcd97a" }}
                >
                  <p
                    className="text-on-surface-variant mb-1"
                    style={{ fontSize: "11px" }}
                  >
                    Payment Method
                  </p>
                  <p
                    className="font-bold text-on-surface"
                    style={{ fontSize: "13px" }}
                  >
                    {currentOrder.payment}
                  </p>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#f4fbf7", border: "1px solid #c8e4d8" }}
                >
                  <p
                    className="text-on-surface-variant mb-1"
                    style={{ fontSize: "11px" }}
                  >
                    Channel
                  </p>
                  <p
                    className="font-bold text-on-surface"
                    style={{ fontSize: "13px" }}
                  >
                    {currentOrder.channel}
                  </p>
                </div>
              </div>
              {/* Update Status */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Update Order Status
                </label>
                <select
                  value={dStatus}
                  onChange={(e) => setDStatus(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none"
                  style={{
                    border: "1.5px solid #c8e4d8",
                    background: "#f4fbf7",
                    fontSize: "14px",
                  }}
                >
                  <optgroup label="── Online ──">
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </optgroup>
                  <optgroup label="── POS ──">
                    <option>Paid</option>
                    <option>Refunded</option>
                  </optgroup>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
            <div
              className="flex justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: "#c8e4d8" }}
            >
              <button
                onClick={() => setDetailOpen(false)}
                className="px-4 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container"
                style={{ borderColor: "#c8e4d8", fontSize: "14px" }}
              >
                Close
              </button>
              <button
                onClick={updateStatus}
                className="btn-primary px-4 py-2 rounded-lg text-white font-bold"
                style={{ fontSize: "14px" }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
