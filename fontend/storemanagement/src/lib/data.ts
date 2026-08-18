export interface Category {
  id: number;
  name: string;
  description: string;
  parentCategoryId: number | null;
  status: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  categoryId: number;
  category?: string;
  brandId: number;
  brand?: string;
  barcode: string;
  status: string;
  rating?: number;
  reviews?: number;
}
export interface ProductCardDto {
  id: number;
  name: string;
  price: number;
  originalPrice?: number | null;

  image: string;

  category: string;
  subcategory?: string;

  rating: number;
  reviews: number;
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
