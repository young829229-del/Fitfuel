export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  description: string;
  images: string[];
  image?: string; // fallback / primary image
  stock: number;
  category?: string;
  keyBenefits?: string[];
  ingredients?: string;
  nutritionalInfo?: string;
  usage?: string;
  weightSize?: string;
  isFeatured?: boolean;
  isUnavailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  order?: number;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  createdAt: string;
}

export interface HomepageSettings {
  featuredProductIds: string[];
  bestSellerIds: string[];
  newArrivalIds: string[];
  recommendedIds: string[];
  updatedAt?: string;
}
