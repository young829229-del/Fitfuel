export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  keyBenefits: string[];
  stockQuantity: number;
  image: string;
  images: string[];
  rating?: number;
  reviewsCount?: number;
  featured?: boolean;
  status?: 'active' | 'draft' | 'archived';
  sizes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: string; // 'Cash on Delivery (COD)' | 'Esewa / Khalti' | 'Bank Transfer'
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  image: string;
  active: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  displayOrder: number;
  visible: boolean;
  createdAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  image?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  active: boolean;
  expiryDate?: string;
  usageCount: number;
  createdAt: string;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  currency: string;
  phone: string;
  email: string;
  address: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  codEnabled: boolean;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  role: 'super_admin' | 'admin' | 'editor';
  createdAt: string;
}
