export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
  description: string;
  keyBenefits: string[];
  nutritionalInfo?: string;
  ingredients?: string;
  usage?: string;
  stockStatus: string;
  stockQuantity?: number;
  image: string;
  images?: string[];
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
