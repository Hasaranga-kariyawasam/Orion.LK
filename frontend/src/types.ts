export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  isNew?: boolean;
  discount?: number;
  status?: 'Pending' | 'Processing' | 'Delivered' | 'In Stock' | 'Out of Stock' | 'Sold Out';
  shortDescription?: string;
  description?: string;
  sku?: string;
  brand?: string;
  tags?: string[];
  hashtags?: string[];
  specifications?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  icon?: any;
}
