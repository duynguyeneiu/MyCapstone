// ─── SHARED DATA ─────────────────────────────────────────────────────────────
export const STAFF_LIST = [
  { id: 1, name: "Minh Tran", role: "Staff", pin: "1234", color: "#1d6fb8" },
  { id: 2, name: "Lan Pham", role: "Staff", pin: "5678", color: "#6941c6" },
  { id: 3, name: "Hung Le", role: "Staff", pin: "2468", color: "#D97706" },
  { id: 4, name: "Thao Nguyen", role: "Staff", pin: "1357", color: "#dc2626" },
  { id: 5, name: "Bao Tran", role: "Staff", pin: "9999", color: "#059669" },
];

export const ADMINS = [
  { username: "alex.nguyen", password: "admin123", name: "Alex Nguyen" },
  { username: "admin", password: "admin", name: "Admin" },
];

export const CATEGORIES_DATA = [
  { id: 1, name: "Beverages", icon: "local_cafe", color: "#1d6fb8", products: 24, active: true },
  { id: 2, name: "Bakery", icon: "bakery_dining", color: "#D97706", products: 18, active: true },
  { id: 3, name: "Snacks", icon: "cookie", color: "#6941c6", products: 32, active: true },
  { id: 4, name: "Dairy", icon: "egg_alt", color: "#059669", products: 15, active: true },
  { id: 5, name: "Groceries", icon: "shopping_basket", color: "#dc2626", products: 47, active: true },
  { id: 6, name: "Supplies", icon: "inventory_2", color: "#0891b2", products: 11, active: false },
];

export const PRODUCTS_DATA = [
  { id: 1, name: "Arabica Coffee Beans 1kg", sku: "BEV-001", category: "Beverages", price: 185000, stock: 2, barcode: "8934673500011", active: true },
  { id: 2, name: "Bánh Mì Flour Special 5kg", sku: "BAK-002", category: "Bakery", price: 95000, stock: 12, barcode: "8934673500022", active: true },
  { id: 3, name: "Coconut Milk Organic 400ml", sku: "GRO-003", category: "Groceries", price: 42000, stock: 8, barcode: "8934673500033", active: true },
  { id: 4, name: "Eco-Friendly Straws (Pack 50)", sku: "SUP-004", category: "Supplies", price: 28000, stock: 0, barcode: "8934673500044", active: false },
  { id: 5, name: "Vietnamese Drip Coffee Mix", sku: "BEV-005", category: "Beverages", price: 65000, stock: 45, barcode: "8934673500055", active: true },
  { id: 6, name: "Pandan Wafer Crispy 200g", sku: "SNK-006", category: "Snacks", price: 38000, stock: 30, barcode: "8934673500066", active: true },
  { id: 7, name: "Yogurt Strawberry 100g", sku: "DAI-007", category: "Dairy", price: 22000, stock: 60, barcode: "8934673500077", active: true },
  { id: 8, name: "Green Tea Matcha Latte", sku: "BEV-008", category: "Beverages", price: 55000, stock: 20, barcode: "8934673500088", active: true },
];

export const ORDERS_DATA = [
  { id: "ORD-2584", customer: "Nguyen Van A", amount: 185000, status: "Completed", date: "2024-06-01", items: 3, payment: "Cash" },
  { id: "ORD-2583", customer: "Tran Thi B", amount: 320000, status: "Completed", date: "2024-06-01", items: 5, payment: "Card" },
  { id: "ORD-2582", customer: "Walk-in", amount: 75000, status: "Processing", date: "2024-06-01", items: 2, payment: "QR" },
  { id: "ORD-2581", customer: "Duc Huy", amount: 450000, status: "Cancelled", date: "2024-05-31", items: 7, payment: "Card" },
  { id: "ORD-2580", customer: "Le Van C", amount: 220000, status: "Completed", date: "2024-05-31", items: 4, payment: "Cash" },
  { id: "ORD-2579", customer: "Pham Thi D", amount: 99000, status: "Completed", date: "2024-05-31", items: 1, payment: "QR" },
];

export const INVENTORY_DATA = [
  { id: 1, name: "Arabica Coffee Beans 1kg", sku: "BEV-001", category: "Beverages", stock: 2, minStock: 10, cost: 140000, lastUpdated: "2024-06-01" },
  { id: 2, name: "Eco-Friendly Straws (Pack 50)", sku: "SUP-004", category: "Supplies", stock: 0, minStock: 5, cost: 20000, lastUpdated: "2024-05-29" },
  { id: 3, name: "Bánh Mì Flour Special", sku: "BAK-002", category: "Bakery", stock: 12, minStock: 20, cost: 70000, lastUpdated: "2024-06-01" },
  { id: 4, name: "Coconut Milk Organic", sku: "GRO-003", category: "Groceries", stock: 8, minStock: 15, cost: 32000, lastUpdated: "2024-05-30" },
  { id: 5, name: "Vietnamese Drip Coffee Mix", sku: "BEV-005", category: "Beverages", stock: 45, minStock: 20, cost: 48000, lastUpdated: "2024-06-01" },
  { id: 6, name: "Pandan Wafer Crispy", sku: "SNK-006", category: "Snacks", stock: 30, minStock: 10, cost: 28000, lastUpdated: "2024-05-31" },
];

export const USERS_DATA = [
  { id: 1, name: "Alex Nguyen", email: "alex.nguyen@retailpro.vn", role: "Admin", status: "Active", lastLogin: "2024-06-01 08:12", avatar: "#1d6fb8" },
  { id: 2, name: "Minh Tran", email: "minh.tran@retailpro.vn", role: "Staff", status: "Active", lastLogin: "2024-06-01 07:55", avatar: "#1d6fb8" },
  { id: 3, name: "Lan Pham", email: "lan.pham@retailpro.vn", role: "Staff", status: "Active", lastLogin: "2024-05-31 17:30", avatar: "#6941c6" },
  { id: 4, name: "Hung Le", email: "hung.le@retailpro.vn", role: "Staff", status: "Inactive", lastLogin: "2024-05-28 09:00", avatar: "#D97706" },
  { id: 5, name: "Thao Nguyen", email: "thao.nguyen@retailpro.vn", role: "Manager", status: "Active", lastLogin: "2024-06-01 08:00", avatar: "#dc2626" },
];

export const PROMOTIONS_DATA = [
  { id: 1, code: "WELCOME10", type: "Percentage", value: 10, minOrder: 100000, used: 34, limit: 100, active: true, expires: "2024-12-31" },
  { id: 2, code: "SAVE50K", type: "Fixed", value: 50000, minOrder: 200000, used: 89, limit: 200, active: true, expires: "2024-07-31" },
  { id: 3, code: "FREESHIP", type: "Percentage", value: 100, minOrder: 300000, used: 200, limit: 200, active: false, expires: "2024-05-31" },
  { id: 4, code: "SUMMER20", type: "Percentage", value: 20, minOrder: 150000, used: 12, limit: 500, active: true, expires: "2024-08-31" },
];
