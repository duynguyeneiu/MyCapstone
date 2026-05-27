// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Brand {
  id: number;
  name: string;
  description: string;
  logo: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  categoryId: number;
  brandId: number;
  barcode: string;
}

export interface User {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  role: string;
  status: string;
  createdDate: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userId: number;
  customerName: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  address: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories: Category[] = [
  { id: 1, name: "Skincare",   image: "https://picsum.photos/seed/skincare/400/300"  },
  { id: 2, name: "Fragrance",  image: "https://picsum.photos/seed/fragrance/400/300" },
  { id: 3, name: "Makeup",     image: "https://picsum.photos/seed/makeup/400/300"    },
  { id: 4, name: "Hair Care",  image: "https://picsum.photos/seed/haircare/400/300"  },
];

// ─── Brands ───────────────────────────────────────────────────────────────────

export const brands: Brand[] = [
  { id: 1, name: "Mallorie Essentials", description: "Premium skincare and beauty products crafted with natural ingredients.",       logo: "https://picsum.photos/seed/brand1/100/100" },
  { id: 2, name: "Dior Beauty",         description: "Luxury French fashion house offering iconic fragrances and cosmetics.",        logo: "https://picsum.photos/seed/brand2/100/100" },
  { id: 3, name: "L'Oréal Paris",       description: "World's leading beauty brand with a wide range of skincare and haircare.",    logo: "https://picsum.photos/seed/brand3/100/100" },
  { id: 4, name: "Chanel",              description: "Haute couture house renowned for timeless elegance and luxury beauty.",       logo: "https://picsum.photos/seed/brand4/100/100" },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: Product[] = [
  { id: 1,  name: "Hydrating Rose Serum",         description: "Deeply hydrating serum enriched with rose extract to plump and brighten skin.",          price: 45.99,  quantity: 50, image: "https://picsum.photos/seed/prod1/600/600",  categoryId: 1, brandId: 1, barcode: "SKC001" },
  { id: 2,  name: "Vitamin C Brightening Cream",  description: "Powerful antioxidant cream that evens skin tone and boosts radiance.",                   price: 38.50,  quantity: 35, image: "https://picsum.photos/seed/prod2/600/600",  categoryId: 1, brandId: 3, barcode: "SKC002" },
  { id: 3,  name: "Retinol Night Treatment",       description: "Advanced retinol formula that reduces fine lines and renews skin overnight.",             price: 62.00,  quantity: 20, image: "https://picsum.photos/seed/prod3/600/600",  categoryId: 1, brandId: 1, barcode: "SKC003" },
  { id: 4,  name: "Miss Dior Eau de Parfum",       description: "A floral, fresh fragrance embodying femininity and freedom.",                            price: 120.00, quantity: 15, image: "https://picsum.photos/seed/prod4/600/600",  categoryId: 2, brandId: 2, barcode: "FRG001" },
  { id: 5,  name: "Chanel No. 5 EDP",             description: "The world's most iconic perfume — a floral aldehyde masterpiece.",                       price: 145.00, quantity: 10, image: "https://picsum.photos/seed/prod5/600/600",  categoryId: 2, brandId: 4, barcode: "FRG002" },
  { id: 6,  name: "Velvet Matte Lipstick",         description: "Long-lasting matte lipstick with a rich, comfortable formula.",                          price: 22.00,  quantity: 60, image: "https://picsum.photos/seed/prod6/600/600",  categoryId: 3, brandId: 3, barcode: "MKP001" },
  { id: 7,  name: "HD Foundation SPF 30",          description: "Full-coverage buildable foundation with sun protection and a natural finish.",            price: 34.99,  quantity: 40, image: "https://picsum.photos/seed/prod7/600/600",  categoryId: 3, brandId: 3, barcode: "MKP002" },
  { id: 8,  name: "Smoothing Argan Oil Shampoo",   description: "Nourishing shampoo infused with argan oil for silky, frizz-free hair.",                 price: 18.99,  quantity: 80, image: "https://picsum.photos/seed/prod8/600/600",  categoryId: 4, brandId: 1, barcode: "HRC001" },
  { id: 9,  name: "Keratin Repair Mask",           description: "Intensive conditioning mask that restores strength and shine to damaged hair.",           price: 28.00,  quantity: 45, image: "https://picsum.photos/seed/prod9/600/600",  categoryId: 4, brandId: 3, barcode: "HRC002" },
  { id: 10, name: "Hyaluronic Acid Toner",         description: "Alcohol-free toner with multi-weight hyaluronic acid for plump, dewy skin.",             price: 29.99,  quantity: 55, image: "https://picsum.photos/seed/prod10/600/600", categoryId: 1, brandId: 1, barcode: "SKC004" },
];

// ─── Users ────────────────────────────────────────────────────────────────────

export const users: User[] = [
  { id: 1, fullname: "Admin User",    email: "admin@mallorie.com",    phone: "+1 555 000 0001", address: "1 Admin St, New York, NY 10001",        avatar: "https://picsum.photos/seed/user1/80/80", role: "Admin",    status: "Active",   createdDate: "2024-01-01" },
  { id: 2, fullname: "Jessica Lee",   email: "jessica@example.com",   phone: "+1 555 234 5678", address: "12 Rose Ave, Los Angeles, CA 90001",   avatar: "https://picsum.photos/seed/user2/80/80", role: "Customer", status: "Active",   createdDate: "2024-03-15" },
  { id: 3, fullname: "Oliver Smith",  email: "oliver@example.com",    phone: "+1 555 345 6789", address: "45 Oak Lane, Chicago, IL 60601",       avatar: "https://picsum.photos/seed/user3/80/80", role: "Customer", status: "Active",   createdDate: "2024-04-20" },
  { id: 4, fullname: "Emily Brown",   email: "emily@example.com",     phone: "+1 555 456 7890", address: "78 Maple Dr, Houston, TX 77001",       avatar: "https://picsum.photos/seed/user4/80/80", role: "Manager",  status: "Active",   createdDate: "2024-02-10" },
  { id: 5, fullname: "Laura Cute",    email: "laura@example.com",     phone: "+1 555 567 8901", address: "22 Pine St, Phoenix, AZ 85001",        avatar: "https://picsum.photos/seed/user5/80/80", role: "Customer", status: "Inactive", createdDate: "2024-05-05" },
];

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders: Order[] = [
  {
    id: 1001, userId: 2, customerName: "Jessica Lee", date: "2025-05-10", status: "Delivered",
    address: "12 Rose Ave, Los Angeles, CA",
    items: [
      { productId: 1,  productName: "Hydrating Rose Serum",    quantity: 2, unitPrice: 45.99 },
      { productId: 6,  productName: "Velvet Matte Lipstick",   quantity: 1, unitPrice: 22.00 },
    ],
    totalAmount: 113.98,
  },
  {
    id: 1002, userId: 3, customerName: "Oliver Smith", date: "2025-05-12", status: "Cancelled",
    address: "45 Oak Lane, Chicago, IL",
    items: [
      { productId: 4, productName: "Miss Dior Eau de Parfum", quantity: 1, unitPrice: 120.00 },
    ],
    totalAmount: 120.00,
  },
  {
    id: 1003, userId: 4, customerName: "Emily Brown", date: "2025-05-14", status: "Shipping",
    address: "78 Maple Dr, Houston, TX",
    items: [
      { productId: 2, productName: "Vitamin C Brightening Cream", quantity: 1, unitPrice: 38.50 },
      { productId: 9, productName: "Keratin Repair Mask",          quantity: 2, unitPrice: 28.00 },
    ],
    totalAmount: 94.50,
  },
  {
    id: 1004, userId: 5, customerName: "Laura Cute", date: "2025-05-15", status: "Cancelled",
    address: "22 Pine St, Phoenix, AZ",
    items: [
      { productId: 5, productName: "Chanel No. 5 EDP", quantity: 1, unitPrice: 145.00 },
    ],
    totalAmount: 145.00,
  },
  {
    id: 1005, userId: 2, customerName: "Jessica Lee", date: "2025-05-18", status: "Pending",
    address: "12 Rose Ave, Los Angeles, CA",
    items: [
      { productId: 7,  productName: "HD Foundation SPF 30",    quantity: 1, unitPrice: 34.99 },
      { productId: 10, productName: "Hyaluronic Acid Toner",   quantity: 1, unitPrice: 29.99 },
    ],
    totalAmount: 64.98,
  },
  {
    id: 1006, userId: 3, customerName: "Oliver Smith", date: "2025-05-20", status: "Pending",
    address: "45 Oak Lane, Chicago, IL",
    items: [
      { productId: 8, productName: "Smoothing Argan Oil Shampoo", quantity: 2, unitPrice: 18.99 },
    ],
    totalAmount: 37.98,
  },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const dashboardStats: DashboardStats = {
  totalRevenue:   orders.reduce((sum, o) => sum + o.totalAmount, 0),
  totalOrders:    orders.length,
  totalCustomers: users.filter((u) => u.role === "Customer").length,
  totalProducts:  products.length,
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getCategoryById(id: number): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getBrandById(id: number): Brand | undefined {
  return brands.find((b) => b.id === id);
}

export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}
