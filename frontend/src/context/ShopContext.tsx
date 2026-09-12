import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Product } from '../types';
import { getWishlist, saveWishlist, getCartFromDb, saveCartToDb } from '../lib/api';
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
  cartSyncing: boolean;
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

  // ── Cart DB sync ──────────────────────────────────────────────────────────
  const [cartSyncing, setCartSyncing] = useState(false);
  const cartRef = useRef(cart);
  cartRef.current = cart;

  // When the user logs in: load cart and wishlist from DB and merge with local state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) return;

      // 1. Sync Wishlist
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
            const merged = prev.filter(p => dbIds.includes(p.id));
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

      // 2. Sync Cart
      try {
        setCartSyncing(true);
        const dbCart = await getCartFromDb();
        if (dbCart && dbCart.length > 0) {
          setCart(prev => {
            const merged = [...prev];
            for (const item of dbCart) {
              const idx = merged.findIndex(i => i.product.id === item.productId || (i.product as any)._id === item.productId);
              if (idx >= 0) {
                merged[idx] = {
                  ...merged[idx],
                  quantity: Math.max(merged[idx].quantity, item.quantity)
                };
              } else if (item.product) {
                merged.push({
                  product: { ...item.product, id: item.product.id || item.product._id || item.productId },
                  quantity: item.quantity
                });
              }
            }
            return merged;
          });
        } else if (cartRef.current.length > 0) {
          // First login or DB empty: push local cart to DB
          await saveCartToDb(cartRef.current.map(i => ({
            productId: i.product.id,
            quantity: i.quantity,
            product: i.product
          })));
        }
      } catch (e) {
        console.warn('Cart DB sync error:', e);
      } finally {
        setCartSyncing(false);
      }
    });
    return unsubscribe;
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

  // Save cart to DB (debounced 800ms, non-blocking) whenever it changes
  const dbCartSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!auth.currentUser) return;
    if (dbCartSaveTimerRef.current) clearTimeout(dbCartSaveTimerRef.current);
    dbCartSaveTimerRef.current = setTimeout(() => {
      saveCartToDb(cartRef.current.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        product: i.product
      })));
    }, 800);
    return () => { if (dbCartSaveTimerRef.current) clearTimeout(dbCartSaveTimerRef.current); };
  }, [cart]);

  // ── Persistence (localStorage) ─────────────────────────────────────────
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('compareList', JSON.stringify(compareList)); }, [compareList]);
  useEffect(() => { localStorage.setItem('buildItems', JSON.stringify(buildItems)); }, [buildItems]);
  useEffect(() => { localStorage.setItem('savedBuilds', JSON.stringify(savedBuilds)); }, [savedBuilds]);

  // ── Cart Operations ───────────────────────────────────────────────────
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
      const filtered = prev.filter(item => item.category !== product.category);
      return [...filtered, product];
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
      wishlistSyncing, cartSyncing,
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
