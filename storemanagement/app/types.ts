// ============================================================
// MALLORIE COSMETIC – Shared TypeScript Interfaces
// ============================================================

export interface Product {
  productId: number
  name: string
  description: string
  price: number
  imageUrl: string
  barCode: string
  quantity: number
  categoryId: number
  brandId: number
  category?: { name: string }
  brand?: { name: string }
}

export interface Category {
  categoryId: number
  name: string
  avatar: string
}

export interface Brand {
  brandId: number
  name: string
  logo: string
  description: string
}

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  subTotal: number
  imageUrl: string
}

export interface User {
  userId: number
  fullname: string
  email: string
  phone: string
  address: string
  avatar: string
  description: string
  roleId: number
  roleName?: string
}

export interface Order {
  orderId: number
  date: string
  status: string
  totalAmount: number
  phone: string
  adress: string
  userId: number
  user?: { fullname: string }
  orderDetails: OrderDetail[]
}

export interface OrderDetail {
  productId: number
  quantity: number
  unitPrice: number
  product: { name: string; imageUrl?: string }
}

export interface OrderHistoryItem {
  orderId: number
  date: string
  totalAmount: number
  status: string
}

export interface DashboardData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  recentOrders: RecentOrder[]
}

export interface RecentOrder {
  orderId: number
  customerName: string
  date: string
  itemCount: number
  totalAmount: number
  status: string
}

export interface CheckoutForm {
  fullName: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  notes: string
  paymentMethod: 'cod' | 'paypal'
}
