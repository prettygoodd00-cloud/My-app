export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice?: number;
  description: string;
  composition: string;
  care: string;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  isFeatured: boolean;
  isNew: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  address?: string;
  createdAt: string;
  ordersCount?: number;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  maxStock: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    deliveryMethod: 'courier' | 'boutique' | 'express';
    paymentMethod: 'card' | 'sbp' | 'cash';
    comment?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  totalAmount: number;
  promoCode?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
}
