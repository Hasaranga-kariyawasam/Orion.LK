import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MOCK_PRODUCTS, BRAND_NEW_CATEGORIES, USED_CATEGORIES } from '../data';
import { Product } from '../types';
import { getAllUsersFromDb } from '../lib/api';

export interface Accessory {
  id: string;
  name: string;
  image: string;
  colorClass: string;
  gradientClass: string;
}

export interface Brand {
  id: string;
  name: string;
  image: string;
  banner?: string;
  visible?: boolean;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: number;
  paymentMethod: string;
  shippingAddress: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  totalSpent: number;
  isAdmin: boolean;
  avatar?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  count: number;
  img: string;
  type: 'brand-new' | 'used';
}

export interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  enabled: boolean;
  details?: string; // e.g. bank account number
}

export interface SpecialOffer {
  productId: string;
  badgeText: string;
  offerPrice?: number;
  expiresAt?: string;
  enabled: boolean;
}

export interface AdminProductItem extends Product {
  stock?: number;
  warranty?: string;
  colors?: string[];
  descriptionShipping?: string;
  paymentOptions?: string[];
  deliveryInfo?: string;
  isSpecialOffer?: boolean;
}

interface AdminContextType {
  heroImages: string[];
  setHeroImages: (images: string[]) => void;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  accessories: Accessory[];
  setAccessories: (accessories: Accessory[]) => void;
  brands: Brand[];
  setBrands: (brands: Brand[]) => void;
  saveSettings: () => void;
  // Extended
  products: AdminProductItem[];
  setProducts: (products: AdminProductItem[]) => void;
  orders: AdminOrder[];
  setOrders: (orders: AdminOrder[]) => void;
  users: AdminUser[];
  setUsers: (users: AdminUser[]) => void;
  categories: AdminCategory[];
  setCategories: (categories: AdminCategory[]) => void;
  paymentOptions: PaymentOption[];
  setPaymentOptions: (options: PaymentOption[]) => void;
  specialOffers: SpecialOffer[];
  setSpecialOffers: (offers: SpecialOffer[]) => void;
  whatsappNumber: string;
  setWhatsappNumber: (num: string) => void;
  storeAddress: string;
  setStoreAddress: (addr: string) => void;
  bestSellerIds: string[];
  setBestSellerIds: (ids: string[]) => void;
  refreshUsers: () => Promise<void>;
}

const DEFAULT_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1542393545-10f5cde2c810?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800"
];

const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=v0oASOYTq0s";

const DEFAULT_ACCESSORIES: Accessory[] = [
  { id: "1", name: "Adapters", image: "https://images.unsplash.com/photo-1583394838084-25e1a38481ff?auto=format&fit=crop&q=80&w=300", colorClass: "bg-[#5a2e98]", gradientClass: "from-purple-800 to-indigo-600" },
  { id: "2", name: "Headsets", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=300", colorClass: "bg-[#d43763]", gradientClass: "from-rose-500 to-pink-500" },
  { id: "3", name: "Controllers", image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&q=80&w=300", colorClass: "bg-[#2563eb]", gradientClass: "from-blue-600 to-cyan-500" },
  { id: "4", name: "Keyboards", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=300", colorClass: "bg-[#059669]", gradientClass: "from-emerald-600 to-teal-500" }
];

const DEFAULT_BRANDS: Brand[] = [
  { id: "1", name: "ASUS ROG", image: "https://upload.wikimedia.org/wikipedia/commons/d/d1/ROG_Logo.svg", banner: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=1200", visible: true },
  { id: "2", name: "MSI", image: "https://upload.wikimedia.org/wikipedia/commons/b/b1/MSI_logo.svg", visible: true },
  { id: "3", name: "Gigabyte", image: "https://upload.wikimedia.org/wikipedia/commons/2/23/Gigabyte_Technology_logo.svg", visible: true },
  { id: "4", name: "Corsair", image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Corsair_Logo.svg", visible: true },
  { id: "5", name: "Razer", image: "https://upload.wikimedia.org/wikipedia/en/4/40/Razer_snake_logo.svg", visible: true },
  { id: "6", name: "Logitech", image: "https://upload.wikimedia.org/wikipedia/commons/1/17/Logitech_logo.svg", visible: true }
];

const DEFAULT_ORDERS: AdminOrder[] = [
  { id: '1', orderNumber: 'ORD-746291', customerName: 'Kasun Perera', customerEmail: 'kasun@gmail.com', date: '2024-03-15', total: 45000, status: 'Processing', items: 2, paymentMethod: 'Bank Transfer', shippingAddress: 'No 12, Colombo 03' },
  { id: '2', orderNumber: 'ORD-892102', customerName: 'Amali Silva', customerEmail: 'amali@gmail.com', date: '2024-03-14', total: 850000, status: 'Delivered', items: 1, paymentMethod: 'Card', shippingAddress: 'No 45, Kandy' },
  { id: '3', orderNumber: 'ORD-543981', customerName: 'Nuwan Fernando', customerEmail: 'nuwan@gmail.com', date: '2024-03-13', total: 8500, status: 'Pending', items: 3, paymentMethod: 'COD', shippingAddress: 'No 78, Galle' },
  { id: '4', orderNumber: 'ORD-321456', customerName: 'Dilshan Rajapaksa', customerEmail: 'dilshan@gmail.com', date: '2024-03-12', total: 125000, status: 'Shipped', items: 2, paymentMethod: 'Bank Transfer', shippingAddress: 'No 5, Negombo' },
  { id: '5', orderNumber: 'ORD-654789', customerName: 'Sanduni Wijesinghe', customerEmail: 'sanduni@gmail.com', date: '2024-03-11', total: 22000, status: 'Cancelled', items: 1, paymentMethod: 'Card', shippingAddress: 'No 33, Matara' },
];

const DEFAULT_USERS: AdminUser[] = [
  { id: 'admin-1', name: 'Super Admin', email: 'orian@admin.lk', joined: '2024-01-01', orders: 0, totalSpent: 0, isAdmin: true },
];

const DEFAULT_CATEGORIES: AdminCategory[] = [
  ...BRAND_NEW_CATEGORIES.map((c, i) => ({ id: `bn-${i}`, name: c.name, count: c.count, img: c.img, type: 'brand-new' as const })),
  ...USED_CATEGORIES.map((c, i) => ({ id: `u-${i}`, name: c.name, count: c.count, img: c.img, type: 'used' as const })),
];

const DEFAULT_PAYMENTS: PaymentOption[] = [
  { id: '1', name: 'Bank Transfer', description: 'Direct bank transfer to our account', icon: '🏦', enabled: true, details: 'Bank: Commercial Bank\nAccount: 1234567890\nBranch: Colombo' },
  { id: '2', name: 'Credit / Debit Card', description: 'Visa, Mastercard, AMEX accepted', icon: '💳', enabled: true, details: '' },
  { id: '3', name: 'Cash on Delivery', description: 'Pay when you receive your order', icon: '💵', enabled: true, details: 'Available in Colombo district only' },
  { id: '4', name: 'Frimi / Genie', description: 'Mobile payment apps', icon: '📱', enabled: false, details: '' },
];

const DEFAULT_SPECIAL_OFFERS: SpecialOffer[] = [
  { productId: '1', badgeText: 'HOT DEAL', offerPrice: 820000, expiresAt: '2024-12-31', enabled: true },
];

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch { return defaultValue; }
  };

  const [heroImages, setHeroImages] = useState<string[]>(() => loadState('admin_heroImages', DEFAULT_HERO_IMAGES));
  const [videoUrl, setVideoUrl] = useState<string>(() => loadState('admin_videoUrl', DEFAULT_VIDEO_URL));
  const [accessories, setAccessories] = useState<Accessory[]>(() => loadState('admin_accessories', DEFAULT_ACCESSORIES));
  const [brands, setBrands] = useState<Brand[]>(() => loadState('admin_brands', DEFAULT_BRANDS));
  const [products, setProducts] = useState<AdminProductItem[]>(() => loadState('admin_products', MOCK_PRODUCTS));
  const [orders, setOrders] = useState<AdminOrder[]>(() => loadState('admin_orders', DEFAULT_ORDERS));
  const [users, setUsers] = useState<AdminUser[]>(() => loadState('admin_users', DEFAULT_USERS));
  const [categories, setCategories] = useState<AdminCategory[]>(() => loadState('admin_categories', DEFAULT_CATEGORIES));
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>(() => loadState('admin_payments', DEFAULT_PAYMENTS));
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>(() => loadState('admin_offers', DEFAULT_SPECIAL_OFFERS));
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => loadState('admin_whatsapp', '+94 77 123 4567'));
  const [storeAddress, setStoreAddress] = useState<string>(() => loadState('admin_address', 'No. 123, Main Street, Colombo 03, Sri Lanka'));
  const [bestSellerIds, setBestSellerIds] = useState<string[]>(() => loadState('admin_bestsellers', ['1', '2', '3', '4']));

  const refreshUsers = async () => {
    try {
      const dbUsers = await getAllUsersFromDb();
      if (dbUsers && dbUsers.length > 0) {
        const mapped: AdminUser[] = dbUsers.map(u => ({
          id: u.id || u.uid,
          name: u.name || 'Customer',
          email: u.email,
          joined: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2024-01-01',
          orders: u.orders || 0,
          totalSpent: u.totalSpent || 0,
          isAdmin: !!u.isAdmin,
          avatar: u.avatar,
        }));
        setUsers(mapped);
      }
    } catch (e) {
      console.warn('Error refreshing MongoDB users:', e);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('admin_heroImages', JSON.stringify(heroImages));
    localStorage.setItem('admin_videoUrl', JSON.stringify(videoUrl));
    localStorage.setItem('admin_accessories', JSON.stringify(accessories));
    localStorage.setItem('admin_brands', JSON.stringify(brands));
    localStorage.setItem('admin_products', JSON.stringify(products));
    localStorage.setItem('admin_orders', JSON.stringify(orders));
    localStorage.setItem('admin_users', JSON.stringify(users));
    localStorage.setItem('admin_categories', JSON.stringify(categories));
    localStorage.setItem('admin_payments', JSON.stringify(paymentOptions));
    localStorage.setItem('admin_offers', JSON.stringify(specialOffers));
    localStorage.setItem('admin_whatsapp', JSON.stringify(whatsappNumber));
    localStorage.setItem('admin_address', JSON.stringify(storeAddress));
    localStorage.setItem('admin_bestsellers', JSON.stringify(bestSellerIds));
  };

  return (
    <AdminContext.Provider value={{
      heroImages, setHeroImages,
      videoUrl, setVideoUrl,
      accessories, setAccessories,
      brands, setBrands,
      saveSettings,
      products, setProducts,
      orders, setOrders,
      users, setUsers,
      categories, setCategories,
      paymentOptions, setPaymentOptions,
      specialOffers, setSpecialOffers,
      whatsappNumber, setWhatsappNumber,
      storeAddress, setStoreAddress,
      bestSellerIds, setBestSellerIds,
      refreshUsers,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
