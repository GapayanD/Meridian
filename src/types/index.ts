export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
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
  variants?: {
    type: string;
    options: string[];
  }[];
  isFlashSale?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariants: Record<string, string>;
}

export interface Order {
  customer_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  country: string;
  cart_items: CartItem[];
  delivery_method: string;
  payment_method: string;
  total_price: number;
  notes?: string;
  status: 'pending';
}
