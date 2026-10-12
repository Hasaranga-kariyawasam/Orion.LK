import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { MOCK_PRODUCTS, BRAND_NEW_CATEGORIES, USED_CATEGORIES } from '../data';
import { Product } from '../types';
import {
  getAllUsersFromDb,
  fetchProducts,
  createProductInDb,
  updateProductInDb,
  deleteProductFromDb,
  fetchCategories,
  createCategoryInDb,
  updateCategoryInDb,
  deleteCategoryFromDb,
  fetchBrands,
  createBrandInDb,
  updateBrandInDb,
  deleteBrandFromDb,
  getAllOrdersFromDb,
  updateOrderStatusInDb as apiUpdateOrderStatus,
  deleteOrderFromDb,
  OrderItem,
  broadcastAdminNotification,
  getHomeSettings,
  saveHomeSettings as saveHomeSettingsApi,
  resolveMediaUrl,
} from '../lib/api';

export interface Accessory {
  id: string;
  name: string;
  image: string;
  colorClass: string;
  gradientClass: string;
}

export interface FeaturedImage {
  id: string;
  label: string;
  alt: string;
  url: string;
}

export interface PcBuildCard {
  id: string;
  eyebrow: string;
  title: string;
  image: string;
  alt: string;
}

export interface HomePromoCard {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  buttonText: string;
  href: string;
}

export interface Brand {
  id: string;
  _id?: string;
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
  customerPhone?: string;
  date: string;
  subtotal?: number;
  shipping?: number;
  pointsUsed?: number;
  pointsDiscount?: number;
  pointsEarned?: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: number;
  orderItems?: OrderItem[];
  paymentMethod: string;
  shippingAddress: string;
  shippingAddressObj?: {
    name: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string;
  };
  trackingUpdates?: Array<{ status: string; message: string; timestamp: string }>;
  notes?: string;
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  totalSpent: number;
  points?: number;
  isAdmin: boolean;
  avatar?: string;
}

export interface AdminCategory {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  count: number;
  img: string;
  type: 'brand-new' | 'used';
}

export interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  details?: string;
}

export interface SpecialOffer {
  productId: string;
  badgeText: string;
  offerPrice?: number;
  enabled: boolean;
}

export interface AdminProductItem extends Product {
  _id?: string;
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
  featuredImages: FeaturedImage[];
  setFeaturedImages: (images: FeaturedImage[]) => void;
  pcBuildCards: PcBuildCard[];
  setPcBuildCards: (cards: PcBuildCard[]) => void;
  homePromoCards: HomePromoCard[];
  setHomePromoCards: (cards: HomePromoCard[]) => void;
  brands: Brand[];
  setBrands: (brands: Brand[]) => void;
  saveSettings: () => Promise<void>;
  // Live items
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
  specialOffersDeadline: string;
  setSpecialOffersDeadline: (deadline: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (num: string) => void;
  storeAddress: string;
  setStoreAddress: (addr: string) => void;
  bestSellerIds: string[];
  setBestSellerIds: (ids: string[]) => void;
  refreshHomeSettings: () => Promise<void>;
  // Async actions connected to MongoDB
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshBrands: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  updateOrderStatusInDb: (id: string, status: AdminOrder['status'], note?: string) => Promise<boolean>;
  deleteOrderFromContext: (id: string) => Promise<boolean>;
  saveProductToDb: (productData: any, editId?: string) => Promise<AdminProductItem>;
  deleteProductFromContext: (id: string) => Promise<boolean>;
  saveCategoryToDb: (catData: any, editId?: string) => Promise<AdminCategory>;
  deleteCategoryFromContext: (id: string) => Promise<boolean>;
  saveBrandToDb: (brandData: any, editId?: string) => Promise<Brand>;
  deleteBrandFromContext: (id: string) => Promise<boolean>;
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

const DEFAULT_FEATURED_IMAGES: FeaturedImage[] = [
  { id: 'accessories', label: 'Accessories', alt: 'Accessories', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=400' },
  { id: 'hardware', label: 'Hardware', alt: 'Hardware', url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=400' },
  { id: 'monitors', label: 'Monitors', alt: 'Monitors', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400' },
];

const DEFAULT_PC_BUILD_CARDS: PcBuildCard[] = [
  {
    id: 'hybrid',
    eyebrow: 'PRE-BUILT PCS',
    title: 'HYBRID PC\nBUILDS',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=600',
    alt: 'Hybrid PC Builds',
  },
  {
    id: 'brand-new',
    eyebrow: 'PRE-BUILT PCS',
    title: 'BRAND NEW\nPC BUILDS',
    image: 'https://images.unsplash.com/photo-1587202372585-79464e83fdf5?auto=format&fit=crop&q=80&w=800',
    alt: 'Brand New PC Builds',
  },
  {
    id: 'used',
    eyebrow: 'PRE-BUILT PCS',
    title: 'USED PC\nBUILDS',
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=600',
    alt: 'Used PC Builds',
  },
];

const DEFAULT_HOME_PROMO_CARDS: HomePromoCard[] = [
  { id: 'delivery', eyebrow: '', title: 'Island Wide', description: 'Delivery Available', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800', alt: 'Island Wide Delivery', buttonText: 'Shop Now', href: '/shop' },
  { id: 'installments', eyebrow: 'Pay in 3 Installments', title: 'Option 2', description: '', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800', alt: 'Koko Option 2', buttonText: 'Learn More', href: '/shop' },
  { id: 'gaming-accessories', eyebrow: 'Ergonomic Precision', title: 'Shop Gaming\nAccessories', description: 'Starting at just Rs.550', image: 'https://images.unsplash.com/photo-1527814050087-379381547996?auto=format&fit=crop&q=80&w=600', alt: 'Gaming Accessories', buttonText: 'Shop Now', href: '/shop?category=Accessories' },
  { id: 'keyboards', eyebrow: 'Keyboards', title: 'Crafted for Speed', description: 'From Rs.1,190 Upwards', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600', alt: 'Keyboards', buttonText: 'Shop Now', href: '/shop?category=Keyboards' },
  { id: 'speakers', eyebrow: 'Volcanic Sound', title: 'Speakers &\nHeadphones', description: 'From Rs.1,500', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600', alt: 'Speakers and Headphones', buttonText: 'Shop Now', href: '/shop?category=Headsets' },
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

const DEFAULT_PAYMENTS: PaymentOption[] = [
  { id: '1', name: 'Bank Transfer', description: 'Direct bank transfer to our account', icon: '🏦', enabled: true, details: 'Bank: Commercial Bank\nAccount: 1234567890\nBranch: Colombo' },
  { id: '2', name: 'Credit / Debit Card', description: 'Visa, Mastercard, AMEX accepted', icon: '💳', enabled: true, details: '' },
  { id: '3', name: 'Cash on Delivery', description: 'Pay when you receive your order', icon: '💵', enabled: true, details: 'Available in Colombo district only' },
  { id: '4', name: 'Frimi / Genie', description: 'Mobile payment apps', icon: '📱', enabled: false, details: '' },
];

const DEFAULT_SPECIAL_OFFERS: SpecialOffer[] = [
  { productId: '1', badgeText: 'HOT DEAL', offerPrice: 820000, enabled: true },
];

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch { return defaultValue; }
  };

  const [heroImages, setHeroImages] = useState<string[]>(() => loadState('admin_heroImages', DEFAULT_HERO_IMAGES).map(resolveMediaUrl));
  const [videoUrl, setVideoUrl] = useState<string>(() => loadState('admin_videoUrl', DEFAULT_VIDEO_URL));
  const [accessories, setAccessories] = useState<Accessory[]>(() => loadState('admin_accessories', DEFAULT_ACCESSORIES).map((item: Accessory) => ({ ...item, image: resolveMediaUrl(item.image) })));
  const [featuredImages, setFeaturedImages] = useState<FeaturedImage[]>(() => loadState('admin_featuredImages', DEFAULT_FEATURED_IMAGES).map((item: FeaturedImage) => ({ ...item, url: resolveMediaUrl(item.url) })));
  const [pcBuildCards, setPcBuildCards] = useState<PcBuildCard[]>(() => loadState('admin_pcBuildCards', DEFAULT_PC_BUILD_CARDS).map((item: PcBuildCard) => ({ ...item, image: resolveMediaUrl(item.image) })));
  const [homePromoCards, setHomePromoCards] = useState<HomePromoCard[]>(() => loadState('admin_homePromoCards', DEFAULT_HOME_PROMO_CARDS).map((item: HomePromoCard) => ({ ...item, image: resolveMediaUrl(item.image) })));
  const [brands, setBrands] = useState<Brand[]>(() => loadState('admin_brands', []));
  const [products, setProducts] = useState<AdminProductItem[]>(() => loadState('admin_products', MOCK_PRODUCTS));
  const [orders, setOrders] = useState<AdminOrder[]>(() => loadState('admin_orders', DEFAULT_ORDERS));
  const [users, setUsers] = useState<AdminUser[]>(() => loadState('admin_users', DEFAULT_USERS));
  const [categories, setCategories] = useState<AdminCategory[]>(() => loadState('admin_categories', []));
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>(() => loadState('admin_payments', DEFAULT_PAYMENTS));
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>(() => loadState('admin_offers', DEFAULT_SPECIAL_OFFERS));
  const [specialOffersDeadline, setSpecialOffersDeadline] = useState<string>(() => loadState('admin_offers_deadline', ''));
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => loadState('admin_whatsapp', '+94 77 123 4567'));
  const [storeAddress, setStoreAddress] = useState<string>(() => loadState('admin_address', 'No. 123, Main Street, Colombo 03, Sri Lanka'));
  const [bestSellerIds, setBestSellerIds] = useState<string[]>(() => loadState('admin_bestsellers', ['1', '2', '3', '4']));

  useEffect(() => {
    const syncSpecialOffers = (event: StorageEvent) => {
      if (event.key === 'admin_offers' && event.newValue) {
        try {
          setSpecialOffers(JSON.parse(event.newValue));
        } catch (error) {
          console.error('Failed to sync special offers:', error);
        }
      }
      if (event.key === 'admin_offers_deadline') {
        try {
          setSpecialOffersDeadline(event.newValue ? JSON.parse(event.newValue) : '');
        } catch (error) {
          console.error('Failed to sync special offers deadline:', error);
        }
      }
    };
    window.addEventListener('storage', syncSpecialOffers);
    return () => window.removeEventListener('storage', syncSpecialOffers);
  }, []);

  // 1. Refresh Products from MongoDB
  const refreshProducts = async () => {
    try {
      const res = await fetchProducts({ limit: 1000 });
      if (res.products && res.products.length > 0) {
        const mapped = res.products.map(p => ({
          ...p,
          id: p._id || p.id,
          isNew: p.isNewProduct !== undefined ? p.isNewProduct : p.isNew,
        }));
        setProducts(mapped);
        localStorage.setItem('admin_products', JSON.stringify(mapped));
      }
    } catch (e) {
      console.warn('Error refreshing products:', e);
    }
  };

  // 2. Refresh Categories from MongoDB
  const refreshCategories = async () => {
    try {
      const cats = await fetchCategories();
      if (cats && cats.length > 0) {
        const mapped: AdminCategory[] = cats.map(c => ({
          id: c._id || c.id,
          _id: c._id,
          name: c.name,
          slug: c.slug,
          count: c.count || 0,
          img: c.img || '',
          type: c.type || 'brand-new',
        }));
        setCategories(mapped);
        localStorage.setItem('admin_categories', JSON.stringify(mapped));
      }
    } catch (e) {
      console.warn('Error refreshing categories:', e);
    }
  };

  // 3. Refresh Brands from MongoDB
  const refreshBrands = async () => {
    try {
      const bList = await fetchBrands();
      if (bList && bList.length > 0) {
        const mapped: Brand[] = bList.map(b => ({
          id: b._id || b.id,
          _id: b._id,
          name: b.name,
          image: b.image || '',
          banner: b.banner || '',
          visible: b.visible !== false,
        }));
        setBrands(mapped);
        localStorage.setItem('admin_brands', JSON.stringify(mapped));
      }
    } catch (e) {
      console.warn('Error refreshing brands:', e);
    }
  };

  // 4. Refresh Users from MongoDB
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
          points: u.points !== undefined ? u.points : 100,
          isAdmin: !!u.isAdmin,
          avatar: u.avatar,
        }));
        setUsers(mapped);
      }
    } catch (e) {
      console.warn('Error refreshing MongoDB users:', e);
    }
  };

  // 4b. Refresh Orders from MongoDB
  const refreshOrders = async () => {
    try {
      const dbOrders = await getAllOrdersFromDb();
      if (dbOrders && dbOrders.length > 0) {
        const mapped: AdminOrder[] = dbOrders.map(o => {
          const addr = o.shippingAddress;
          const addressStr = addr
            ? `${addr.street}, ${addr.city}, ${addr.province}`
            : 'No address provided';
          const itemsCount = o.items ? o.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
          return {
            id: o._id || o.id || o.orderNumber,
            orderNumber: o.orderNumber,
            customerName: o.customerName || addr?.name || 'Customer',
            customerEmail: o.customerEmail || 'customer@orion.lk',
            customerPhone: o.customerPhone || addr?.phone || '',
            date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '2024-03-15',
            subtotal: o.subtotal,
            shipping: o.shipping,
            pointsUsed: o.pointsUsed || 0,
            pointsDiscount: o.pointsDiscount || 0,
            pointsEarned: o.pointsEarned || 0,
            total: o.total,
            status: o.status,
            items: itemsCount,
            orderItems: o.items || [],
            paymentMethod: o.paymentMethod || 'Card',
            shippingAddress: addressStr,
            shippingAddressObj: addr,
            trackingUpdates: o.trackingUpdates || [],
            notes: o.notes,
            createdAt: o.createdAt,
          };
        });
        setOrders(mapped);
        localStorage.setItem('admin_orders', JSON.stringify(mapped));
      }
    } catch (e) {
      console.warn('Error refreshing orders from DB:', e);
    }
  };

  const updateOrderStatusInDb = async (id: string, status: AdminOrder['status'], note?: string): Promise<boolean> => {
    try {
      await apiUpdateOrderStatus(id, status, note);
      await refreshOrders();
      return true;
    } catch (err) {
      console.error('Failed to update order status in DB:', err);
      return false;
    }
  };

  const deleteOrderFromContext = async (id: string): Promise<boolean> => {
    try {
      await deleteOrderFromDb(id);
      setOrders(prev => {
        const updated = prev.filter(o => o.id !== id);
        localStorage.setItem('admin_orders', JSON.stringify(updated));
        return updated;
      });
      return true;
    } catch (err) {
      console.error('Failed to delete order from DB:', err);
      return false;
    }
  };

  // 5. Save Product to MongoDB
  const saveProductToDb = async (productData: any, editId?: string): Promise<AdminProductItem> => {
    const previousProduct = editId ? products.find(product => product.id === editId || product._id === editId) : undefined;
    let saved: any;
    if (editId) {
      saved = await updateProductInDb(editId, productData);
    } else {
      saved = await createProductInDb(productData);
    }
    const formatted: AdminProductItem = {
      ...saved,
      id: saved._id || saved.id || editId,
      isNew: saved.isNewProduct !== undefined ? saved.isNewProduct : saved.isNew,
    };
    setProducts(prev => {
      const updated = editId ? prev.map(p => p.id === editId ? formatted : p) : [formatted, ...prev];
      localStorage.setItem('admin_products', JSON.stringify(updated));
      return updated;
    });
    if (previousProduct && Number(productData.price) < Number(previousProduct.price)) {
      void broadcastAdminNotification(
        'Price Drop Alert',
        `${saved.name || previousProduct.name} is now available for LKR ${Number(productData.price).toLocaleString()}.`
      ).catch(error => console.error('Failed to broadcast price drop notification:', error));
    }
    return formatted;
  };

  // 6. Delete Product from MongoDB
  const deleteProductFromContext = async (id: string): Promise<boolean> => {
    try {
      await deleteProductFromDb(id);
      setProducts(prev => {
        const updated = prev.filter(p => p.id !== id && (p as any)._id !== id);
        localStorage.setItem('admin_products', JSON.stringify(updated));
        return updated;
      });
      return true;
    } catch (err) {
      console.error('Failed to delete product:', err);
      return false;
    }
  };

  // 7. Save Category to MongoDB
  const saveCategoryToDb = async (catData: any, editId?: string): Promise<AdminCategory> => {
    let saved: any;
    if (editId) {
      saved = await updateCategoryInDb(editId, catData);
    } else {
      saved = await createCategoryInDb(catData);
    }
    const formatted: AdminCategory = {
      id: saved._id || saved.id || editId,
      _id: saved._id,
      name: saved.name,
      slug: saved.slug,
      count: saved.count || 0,
      img: saved.img || '',
      type: saved.type || 'brand-new',
    };
    setCategories(prev => {
      const updated = editId ? prev.map(c => c.id === editId ? formatted : c) : [...prev, formatted];
      localStorage.setItem('admin_categories', JSON.stringify(updated));
      return updated;
    });
    return formatted;
  };

  // 8. Delete Category from MongoDB
  const deleteCategoryFromContext = async (id: string): Promise<boolean> => {
    try {
      await deleteCategoryFromDb(id);
      setCategories(prev => {
        const updated = prev.filter(c => c.id !== id && c._id !== id);
        localStorage.setItem('admin_categories', JSON.stringify(updated));
        return updated;
      });
      return true;
    } catch (err) {
      console.error('Failed to delete category:', err);
      return false;
    }
  };

  // 9. Save Brand to MongoDB
  const saveBrandToDb = async (brandData: any, editId?: string): Promise<Brand> => {
    let saved: any;
    if (editId) {
      saved = await updateBrandInDb(editId, brandData);
    } else {
      saved = await createBrandInDb(brandData);
    }
    const formatted: Brand = {
      id: saved._id || saved.id || editId,
      _id: saved._id,
      name: saved.name,
      image: saved.image || '',
      banner: saved.banner || '',
      visible: saved.visible !== false,
    };
    setBrands(prev => {
      const updated = editId ? prev.map(b => b.id === editId ? formatted : b) : [...prev, formatted];
      localStorage.setItem('admin_brands', JSON.stringify(updated));
      return updated;
    });
    return formatted;
  };

  // 10. Delete Brand from MongoDB
  const deleteBrandFromContext = async (id: string): Promise<boolean> => {
    try {
      await deleteBrandFromDb(id);
      setBrands(prev => {
        const updated = prev.filter(b => b.id !== id && b._id !== id);
        localStorage.setItem('admin_brands', JSON.stringify(updated));
        return updated;
      });
      return true;
    } catch (err) {
      console.error('Failed to delete brand:', err);
      return false;
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    refreshProducts();
    refreshCategories();
    refreshBrands();
    refreshUsers();
    refreshOrders();
  }, []);

  const applyHomeSettings = useCallback((settings: Awaited<ReturnType<typeof getHomeSettings>>) => {
      if (!settings) return;
      if (Array.isArray(settings.heroImages)) {
        setHeroImages(settings.heroImages.map(resolveMediaUrl).filter(Boolean));
      }
      if (Array.isArray(settings.featuredImages)) {
        setFeaturedImages((settings.featuredImages as FeaturedImage[]).map(image => ({ ...image, url: resolveMediaUrl(image.url) })));
      }
      if (Array.isArray(settings.pcBuildCards)) {
        setPcBuildCards((settings.pcBuildCards as PcBuildCard[]).map(card => ({ ...card, image: resolveMediaUrl(card.image) })));
      }
      if (Array.isArray(settings.homePromoCards)) {
        setHomePromoCards((settings.homePromoCards as HomePromoCard[]).map(card => ({ ...card, image: resolveMediaUrl(card.image) })));
      }
      if (Array.isArray(settings.accessories)) {
        setAccessories((settings.accessories as Accessory[]).map(accessory => ({ ...accessory, image: resolveMediaUrl(accessory.image) })));
      }
      if (Array.isArray(settings.bestSellerIds)) setBestSellerIds(settings.bestSellerIds);
      if (typeof settings.whatsappNumber === 'string') setWhatsappNumber(settings.whatsappNumber);
      if (typeof settings.storeAddress === 'string') setStoreAddress(settings.storeAddress);
      if (Array.isArray(settings.specialOffers)) setSpecialOffers(settings.specialOffers as SpecialOffer[]);
      if (typeof settings.specialOffersDeadline === 'string') setSpecialOffersDeadline(settings.specialOffersDeadline);
  }, []);

  const refreshHomeSettings = useCallback(async () => {
    try {
      applyHomeSettings(await getHomeSettings());
    } catch (error) {
      console.warn('Home settings load failed:', error);
    }
  }, [applyHomeSettings]);

  useEffect(() => {
    void refreshHomeSettings();
  }, []);

  const saveSettings = async () => {
    localStorage.setItem('admin_heroImages', JSON.stringify(heroImages));
    localStorage.setItem('admin_videoUrl', JSON.stringify(videoUrl));
    localStorage.setItem('admin_accessories', JSON.stringify(accessories));
    localStorage.setItem('admin_featuredImages', JSON.stringify(featuredImages));
    localStorage.setItem('admin_pcBuildCards', JSON.stringify(pcBuildCards));
    localStorage.setItem('admin_homePromoCards', JSON.stringify(homePromoCards));
    localStorage.setItem('admin_brands', JSON.stringify(brands));
    localStorage.setItem('admin_products', JSON.stringify(products));
    localStorage.setItem('admin_orders', JSON.stringify(orders));
    localStorage.setItem('admin_users', JSON.stringify(users));
    localStorage.setItem('admin_categories', JSON.stringify(categories));
    localStorage.setItem('admin_payments', JSON.stringify(paymentOptions));
    localStorage.setItem('admin_offers', JSON.stringify(specialOffers));
    localStorage.setItem('admin_offers_deadline', JSON.stringify(specialOffersDeadline));
    localStorage.setItem('admin_whatsapp', JSON.stringify(whatsappNumber));
    localStorage.setItem('admin_address', JSON.stringify(storeAddress));
    localStorage.setItem('admin_bestsellers', JSON.stringify(bestSellerIds));
    const saved = await saveHomeSettingsApi({
      heroImages, featuredImages, pcBuildCards, homePromoCards,
      accessories, bestSellerIds, whatsappNumber, storeAddress,
      specialOffers, specialOffersDeadline,
    });
    applyHomeSettings(saved);
  };

  return (
    <AdminContext.Provider value={{
      heroImages, setHeroImages,
      videoUrl, setVideoUrl,
      accessories, setAccessories,
      featuredImages, setFeaturedImages,
      pcBuildCards, setPcBuildCards,
      homePromoCards, setHomePromoCards,
      brands, setBrands,
      saveSettings,
      products, setProducts,
      orders, setOrders,
      users, setUsers,
      categories, setCategories,
      paymentOptions, setPaymentOptions,
      specialOffers, setSpecialOffers, specialOffersDeadline, setSpecialOffersDeadline,
      whatsappNumber, setWhatsappNumber,
      storeAddress, setStoreAddress,
      bestSellerIds, setBestSellerIds,
      refreshHomeSettings,
      refreshProducts,
      refreshCategories,
      refreshBrands,
      refreshUsers,
      refreshOrders,
      updateOrderStatusInDb,
      deleteOrderFromContext,
      saveProductToDb,
      deleteProductFromContext,
      saveCategoryToDb,
      deleteCategoryFromContext,
      saveBrandToDb,
      deleteBrandFromContext,
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
