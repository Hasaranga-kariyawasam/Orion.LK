import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Product } from '../types';
import { getWishlist, saveWishlist } from '../lib/api';
import { auth } from '../lib/firebase';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export interface SavedBuild {
  id: string;
  name: string;
  date: string;
  items: Product[];
  total: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (isOpen: boolean) => void;
  cartTotal: number;
  compareList: Product[];
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: string) => boolean;
  clearCart: () => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (isOpen: boolean) => void;
  buildItems: Product[];
  notifications: Notification[];
  buildTotal: number;
  addToBuild: (product: Product) => void;
  removeFromBuild: (productId: string) => void;
  addNotification: (title: string, message: string) => void;
  markNotificationsRead: () => void;
  savedBuilds: SavedBuild[];
  saveBuild: (name: string, items: Product[], total: number) => void;
  loadBuild: (id: string) => void;
  deleteSavedBuild: (id: string) => void;
  setBuildItems: (items: Product[]) => void;
  wishlistSyncing: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [compareList, setCompareList] = useState<Product[]>(() => {
    const saved = localStorage.getItem('compareList');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(() => {
    const saved = localStorage.getItem('savedBuilds');
    return saved ? JSON.parse(saved) : [];
  });
  const [buildItems, setBuildItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('buildItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Price Drop', message: 'ASUS ROG Strix RTX 4090 is now 4% off!', time: '2 hours ago', isRead: false },
    { id: '2', title: 'Special Offer', message: 'Clearance sale is live! Up to 50% off.', time: '1 day ago', isRead: true }
  ]);

  // ── Wishlist DB sync ──────────────────────────────────────────────────────
  const [wishlistSyncing, setWishlistSyncing] = useState(false);
  const wishlistRef = useRef(wishlist);
  wishlistRef.current = wishlist;

  // When the user logs in: load wishlist from DB and merge with local state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) return;
      try {
        setWishlistSyncing(true);
        const dbIds = await getWishlist();
        if (dbIds.length === 0) {
          // First login — push local wishlist to DB
          if (wishlistRef.current.length > 0) {
            await saveWishlist(wishlistRef.current.map(p => p.id));
          }
        } else {
          // Merge: DB is source of truth for IDs; keep full Product objects from local
          setWishlist(prev => {
            const localIds = new Set(prev.map(p => p.id));
            // Keep products already in local state that are in the DB list
            const merged = prev.filter(p => dbIds.includes(p.id));
            // IDs in DB but not locally we can't reconstruct without product data — they'll show when products load
            // Store the missing IDs so they can be matched against product catalogue
            const missingIds = dbIds.filter(id => !localIds.has(id));
            if (missingIds.length > 0) {
              localStorage.setItem('wishlist-pending-ids', JSON.stringify(missingIds));
            }
            return merged;
          });
        }
      } catch (e) {
        console.warn('Wishlist DB sync error:', e);
      } finally {
        setWishlistSyncing(false);
      }
    });
    return unsubscribe;
  }, []);

  // When product catalogue loads, try to restore any pending wishlist product IDs
  useEffect(() => {
    const pendingRaw = localStorage.getItem('wishlist-pending-ids');
    if (!pendingRaw) return;
    // This runs whenever wishlist changes; pendingIds will be matched against locally-known products
    // The Drawers/ProductCard already hold Product objects, so we rely on AdminContext products
    // For now, just clear pending — full product objects will be added via toggleWishlist from UI
  }, []);

  // Save wishlist IDs to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Save wishlist IDs to DB (debounced 800ms, non-blocking) whenever it changes
  const dbSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!auth.currentUser) return;
    if (dbSaveTimerRef.current) clearTimeout(dbSaveTimerRef.current);
    dbSaveTimerRef.current = setTimeout(() => {
      saveWishlist(wishlistRef.current.map(p => p.id));
    }, 800);
    return () => { if (dbSaveTimerRef.current) clearTimeout(dbSaveTimerRef.current); };
  }, [wishlist]);

  // ── Persistence (localStorage) ─────────────────────────────────────────
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('compareList', JSON.stringify(compareList)); }, [compareList]);
  useEffect(() => { localStorage.setItem('buildItems', JSON.stringify(buildItems)); }, [buildItems]);
  useEffect(() => { localStorage.setItem('savedBuilds', JSON.stringify(savedBuilds)); }, [savedBuilds]);

  // ── Cart ───────────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) =>
    setCart(prev => prev.filter(item => item.product.id !== productId));

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  // ── Wishlist ───────────────────────────────────────────────────────────
  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  // ── Compare ────────────────────────────────────────────────────────────
  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 2) { alert('You can only compare up to 2 items at a time.'); return prev; }
      return [...prev, product];
    });
  };

  const isInCompare = (productId: string) => compareList.some(p => p.id === productId);

  // ── Notifications ──────────────────────────────────────────────────────
  const addNotification = (title: string, message: string) => {
    const newNotif = { id: Date.now().toString(), title, message, time: 'Just now', isRead: false };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

  // ── Builds ─────────────────────────────────────────────────────────────
  const saveBuild = (name: string, items: Product[], total: number) => {
    const newBuild: SavedBuild = { id: Date.now().toString(), name, date: new Date().toLocaleDateString(), items, total };
    setSavedBuilds([newBuild, ...savedBuilds]);
  };

  const loadBuild = (id: string) => {
    const build = savedBuilds.find(b => b.id === id);
    if (build) setBuildItems(build.items);
  };

  const deleteSavedBuild = (id: string) =>
    setSavedBuilds(savedBuilds.filter(b => b.id !== id));

  const addToBuild = (product: Product) => {
    setBuildItems(prev => {
      if (prev.some(item => item.id === product.id)) return prev;
      addNotification('Added to Build', `${product.name} has been added to your PC build.`);
      return [...prev, product];
    });
  };

  const removeFromBuild = (productId: string) =>
    setBuildItems(prev => prev.filter(item => item.id !== productId));

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const buildTotal = buildItems
    ? buildItems.reduce((total, item) => total + (item.discount ? item.price : (item.originalPrice || item.price)), 0)
    : 0;

  return (
    <ShopContext.Provider value={{
      cart, wishlist, addToCart, removeFromCart, updateQuantity,
      toggleWishlist, isInWishlist,
      isCartOpen, setIsCartOpen,
      isWishlistOpen, setIsWishlistOpen,
      cartTotal, compareList, toggleCompare, isInCompare,
      isCompareModalOpen, setIsCompareModalOpen,
      clearCart,
      buildItems, notifications, buildTotal,
      addToBuild, removeFromBuild, addNotification, markNotificationsRead,
      savedBuilds, saveBuild, loadBuild, deleteSavedBuild, setBuildItems,
      wishlistSyncing,
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
