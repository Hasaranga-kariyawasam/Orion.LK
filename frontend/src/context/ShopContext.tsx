import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';

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
  
  useEffect(() => {
    localStorage.setItem('savedBuilds', JSON.stringify(savedBuilds));
  }, [savedBuilds]);

  const saveBuild = (name: string, items: Product[], total: number) => {
    const newBuild: SavedBuild = {
      id: Date.now().toString(),
      name,
      date: new Date().toLocaleDateString(),
      items,
      total
    };
    setSavedBuilds([newBuild, ...savedBuilds]);
  };

  const loadBuild = (id: string) => {
    const build = savedBuilds.find(b => b.id === id);
    if (build) {
      setBuildItems(build.items);
    }
  };

  const deleteSavedBuild = (id: string) => {
    setSavedBuilds(savedBuilds.filter(b => b.id !== id));
  };

  const [buildItems, setBuildItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('buildItems');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Price Drop', message: 'ASUS ROG Strix RTX 4090 is now 4% off!', time: '2 hours ago', isRead: false },
    { id: '2', title: 'Special Offer', message: 'Clearance sale is live! Up to 50% off.', time: '1 day ago', isRead: true }
  ]);


  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    localStorage.setItem('buildItems', JSON.stringify(buildItems));
  }, [buildItems]);

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

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  
  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 2) {
        alert("You can only compare up to 2 items at a time.");
        return prev;
      }
      return [...prev, product];
    });
  };

  const isInCompare = (productId: string) => {
    return compareList.some(p => p.id === productId);
  };
  
  const clearCart = () => setCart([]);

  const addNotification = (title: string, message: string) => {
    const newNotif = { id: Date.now().toString(), title, message, time: 'Just now', isRead: false };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const addToBuild = (product: Product) => {
    setBuildItems(prev => {
      if (prev.some(item => item.id === product.id)) return prev;
      addNotification('Added to Build', `${product.name} has been added to your PC build.`);
      return [...prev, product];
    });
  };

  const removeFromBuild = (productId: string) => {
    setBuildItems(prev => prev.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const buildTotal = buildItems ? buildItems.reduce((total, item) => total + (item.discount ? item.price : (item.originalPrice || item.price)), 0) : 0;

  return (
    <ShopContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleWishlist,
      isInWishlist,
      isCartOpen,
      setIsCartOpen,
      isWishlistOpen,
      setIsWishlistOpen,
      cartTotal,
      compareList,
      toggleCompare,
      isInCompare,
      isCompareModalOpen,
      setIsCompareModalOpen,
      clearCart,
      buildItems,
      notifications,
      buildTotal,
      addToBuild,
      removeFromBuild,
      addNotification,
      markNotificationsRead,
      savedBuilds,
      saveBuild,
      loadBuild,
      deleteSavedBuild,
      setBuildItems
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
