// src/types/index.ts
// Shared TypeScript interfaces used across the storefront and cart.

export interface ProductVariant {
  type: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviewsCount: number;
  soldCount: number;
  description: string;
  variants?: ProductVariant[];
  isFlashSale?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariants: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  icon: string;   // Lucide icon name, e.g. "Smartphone"
  color: string;  // Tailwind classes, e.g. "bg-blue-50 text-blue-600"
}