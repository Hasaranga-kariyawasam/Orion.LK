import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Search, Menu, User, Phone, Globe, ChevronRight, Shuffle, Watch, Headphones, Square, Keyboard, HardDrive, Headset, BatteryCharging, Smartphone, Speaker, Cable, Car, Camera, Monitor, MoreHorizontal, Home, LayoutGrid, RefreshCw, Wind, Store, MapPin, Package, Bell, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { BRAND_NEW_CATEGORIES, USED_CATEGORIES, MOCK_PRODUCTS } from '../data';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { formatLKR } from '../data';
import { useAuth } from '../context/AuthContext';
import { formatAvatarUrl } from '../lib/api';

export default function Header() {
  const { categories, products } = useAdmin();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<'brandNew' | 'used' | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  const brandNewCategories = categories.length > 0
    ? categories.filter(c => c.type === 'brand-new')
    : BRAND_NEW_CATEGORIES;

  const usedCategories = categories.length > 0
    ? categories.filter(c => c.type === 'used')
    : USED_CATEGORIES;

  const searchResults = searchQuery.trim() === ''
    ? products.slice(0, 5)
    : products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

  const handleSearchNavigate = (id: string) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(`/product/${id}`);
  };

  const { cart, wishlist, setIsCartOpen, setIsWishlistOpen, cartTotal, compareList, setIsCompareModalOpen, notifications, markNotificationsRead } = useShop();
  const { user, mongoUser, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSignOut = async () => {
    setShowProfileDropdown(false);
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If we scroll down, hide. If we scroll up, show.
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <header className={`w-full bg-[#161B22]/90 backdrop-blur-md fixed top-0 left-0 right-0 z-40 transition-transform duration-300  border-b border-[#30363D] ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        {/* Top Header */}
        <div className="container mx-auto max-w-7xl px-4 h-24 flex items-center justify-between gap-6">

          {/* Logo */}
          <a href="/" className="flex items-center shrink-0">
            <span className="text-3xl font-black tracking-tight flex items-baseline" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              <span className="text-white">O</span>
              <span className="text-white">RION</span>
              <span className="text-[#2ee661] ml-1 text-2xl" style={{ textShadow: '0 0 10px rgba(46, 230, 97, 0.5)' }}>.lk</span>
            </span>
          </a>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-2xl relative group">
            <input
              type="text"
              placeholder="Search for products"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="w-full bg-[#0D1117] text-white placeholder-[#8B949E] border border-[#30363D] rounded-full py-2.5 pl-6 pr-14 focus:outline-none focus:border-[#2ee661] focus:bg-[#0D1117]/80 transition-all shadow-inner"
            />
            <button className="absolute right-0 top-0 h-full w-12 bg-[#2ee661] text-black flex items-center justify-center rounded-r-full hover:bg-[#24c24e] transition-colors">
              <Search size={18} strokeWidth={2.5} />
            </button>

            {/* Search Dropdown */}
            <AnimatePresence>
              {showSearchResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
                >
                  <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {searchQuery.trim() === '' ? 'Trending Products' : 'Search Results'}
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map(product => (
                        <div
                          key={product.id}
                          onClick={() => handleSearchNavigate(product.id)}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-[#1cd75b]">{formatLKR(product.price)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        No products found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4 shrink-0">
            <Link to="/orders" title="My Orders" className="w-10 h-10 rounded-full border border-[#30363D] flex items-center justify-center text-[#8B949E] hover:text-white hover:border-[#2ee661] hover:bg-[#2ee661]/10 transition-colors">
              <Package size={20} />
            </Link>

            <div className="relative group" onMouseEnter={() => { setShowNotifications(true); markNotificationsRead(); }} onMouseLeave={() => setShowNotifications(false)}>
              <button className="w-10 h-10 rounded-full border border-[#30363D] flex items-center justify-center text-[#8B949E] hover:text-white hover:border-[#2ee661] hover:bg-[#2ee661]/10 transition-colors relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f0364c] border-none text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
                  >
                    <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-900">Notifications</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div key={notif.id} className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-50/50' : ''}`}>
                            <h4 className="text-sm font-bold text-gray-900 mb-1">{notif.title}</h4>
                            <p className="text-xs text-gray-600 mb-2 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{notif.time}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-500 text-sm">No notifications</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative group" onMouseEnter={() => setShowProfileDropdown(true)} onMouseLeave={() => setShowProfileDropdown(false)}>
              {user ? (
                <button className="w-10 h-10 rounded-full border border-[#30363D] flex items-center justify-center overflow-hidden hover:border-[#2ee661] transition-colors">
                  {formatAvatarUrl(mongoUser?.avatar || user.photoURL) ? (
                    <img src={formatAvatarUrl(mongoUser?.avatar || user.photoURL)!} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-[#8B949E]" />
                  )}
                </button>
              ) : (
                <Link to="/login" title="Sign In" className="w-10 h-10 rounded-full border border-[#30363D] flex items-center justify-center text-[#8B949E] hover:text-white hover:border-[#2ee661] hover:bg-[#2ee661]/10 transition-colors">
                  <User size={20} />
                </Link>
              )}

              <AnimatePresence>
                {showProfileDropdown && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
                  >
                    <div className="p-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors">
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors">
                        <Package size={16} /> My Orders
                      </Link>
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-[#2ee661] font-bold hover:bg-[#2ee661]/10 transition-colors">
                        <Settings size={16} /> Admin Dashboard
                      </Link>
                    </div>
                    <div className="py-2 border-t border-gray-100">
                      <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-bold">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="w-10 h-10 rounded-full border border-[#30363D] flex items-center justify-center text-[#8B949E] hover:text-white hover:border-[#2ee661] hover:bg-[#2ee661]/10 transition-colors relative"
            >
              <Shuffle size={18} className={compareList.length > 0 ? "text-[#2ee661]" : ""} />
              <span className="absolute -top-2 -right-2 bg-[#2ee661] border-none text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{compareList.length}</span>
            </button>

            <button onClick={() => setIsWishlistOpen(true)} className="w-10 h-10 rounded-full border border-[#30363D] flex items-center justify-center text-[#8B949E] hover:text-white hover:border-[#2ee661] hover:bg-[#2ee661]/10 transition-colors relative">
              <Heart size={20} className={wishlist.length > 0 ? "fill-[#2ee661] text-[#2ee661]" : ""} />
              <span className="absolute -top-2 -right-2 bg-[#2ee661] border-none text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{wishlist.length}</span>
            </button>

            {/* Cart Pill Button matching custom design */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="h-10 pl-1.5 pr-4 rounded-full bg-[#f0364c] hover:bg-[#d9293e] transition-all duration-200 flex items-center gap-2.5 relative ml-2 shadow-sm hover:shadow-md cursor-pointer group"
              aria-label="Shopping Cart"
            >
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingCart size={15} strokeWidth={2.2} className="text-gray-900 ml-[-1px]" />
              </div>
              <span className="font-black text-[13px] md:text-sm text-white tracking-tight whitespace-nowrap">
                LKR {cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[#f0364c] text-[10px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.15)] border border-gray-100/80">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </button>
          </div>
        </div>

        {/* Sub Header */}
        <div className="bg-white border-b border-gray-200 relative" onMouseLeave={() => setActiveDropdown(null)}>
          <div className="container mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6 h-full">
              {/* Links */}
              <nav className="hidden lg:flex items-center gap-4 xl:gap-6 font-bold text-gray-600 text-[12px] xl:text-[13px] uppercase tracking-wide h-full whitespace-nowrap">
                <button
                  onMouseEnter={() => setActiveDropdown('brandNew')}
                  className={`flex items-center gap-1 transition-colors h-full outline-none ${activeDropdown === 'brandNew' ? 'text-[#2ee661]' : 'hover:text-black'}`}
                >
                  BRAND NEW PRODUCTS <ChevronRight size={14} className={`transition-transform duration-300 ${activeDropdown === 'brandNew' ? '-rotate-90' : 'rotate-90'}`} />
                </button>
                <button
                  onMouseEnter={() => setActiveDropdown('used')}
                  className={`flex items-center gap-1 transition-colors h-full outline-none ${activeDropdown === 'used' ? 'text-[#2ee661]' : 'hover:text-black'}`}
                >
                  USED PRODUCTS <ChevronRight size={14} className={`transition-transform duration-300 ${activeDropdown === 'used' ? '-rotate-90' : 'rotate-90'}`} />
                </button>
                <a href="/shop" className="hover:text-black transition-colors">
                  ALL PRODUCTS
                </a>
                <Link to="/offers" className="text-[#f0364c] hover:text-red-700 transition-colors flex items-center gap-1">
                  <Heart size={14} className="fill-current" /> SPECIAL OFFERS
                </Link>
                <Link to="/orders" className="hover:text-black transition-colors">
                  TRACK YOUR DELIVERY
                </Link>
                <Link to="/build" className="text-[#2ee661] font-black hover:text-[#24c24e] transition-colors flex items-center gap-1">
                  <Package size={14} /> BUILD MY PC
                </Link>
              </nav>

              {/* Full-width Mega Menu */}
              <AnimatePresence>
                {activeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[100%] left-0 w-full bg-white border-t border-gray-100 shadow-2xl z-50 py-10 px-4"
                  >
                    <div className="container mx-auto max-w-7xl grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-x-4 gap-y-12">
                      {(activeDropdown === 'brandNew' ? brandNewCategories : usedCategories).map((cat: any, idx) => (
                        <Link
                          key={cat.id || idx}
                          to={`/shop?category=${encodeURIComponent(cat.name)}&type=${activeDropdown === 'brandNew' ? 'brand-new' : 'used'}`}
                          onClick={() => setActiveDropdown(null)}
                          className="flex flex-col items-center text-center group cursor-pointer"
                        >
                          <div className="h-16 flex items-center justify-center transform group-hover:-translate-y-1 group-hover:scale-105 transition-all duration-300 mb-3 w-full p-2">
                            <img src={cat.img} alt={cat.name} className="max-w-full max-h-full object-contain" />
                          </div>
                          <span className="text-[12px] font-bold text-gray-800 group-hover:text-[#2ee661] leading-tight transition-colors line-clamp-2">
                            {cat.name} <span className="text-gray-400 font-normal">({cat.count})</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Info */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Globe className="text-gray-400" size={20} />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Islandwide</span>
                  <span className="text-xs font-bold text-[#2ee661]">Fast Delivery</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-gray-400" size={20} />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Contact Us</span>
                  <span className="text-xs font-bold text-[#2ee661]">077757 46 43</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <a href="/" className="flex flex-col items-center gap-1 text-[#2ee661]">
            <Home size={22} strokeWidth={2} />
            <span className="text-[10px] font-bold">Home</span>
          </a>
          <button onClick={() => setActiveDropdown(activeDropdown ? null : 'brandNew')} className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#2ee661] transition-colors">
            <Store size={22} strokeWidth={2} />
            <span className="text-[10px] font-bold">Shop</span>
          </button>
          <button onClick={() => setIsWishlistOpen(true)} className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#2ee661] transition-colors relative">
            <div className="relative">
              <Heart size={22} strokeWidth={2} className={wishlist.length > 0 ? "fill-[#2ee661] text-[#2ee661]" : ""} />
              <span className="absolute -top-1 -right-2 bg-[#2ee661] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            </div>
            <span className="text-[10px] font-bold">Wishlist</span>
          </button>
          <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#f0364c] transition-colors relative">
            <div className="relative">
              <ShoppingCart size={22} strokeWidth={2} />
              <span className="absolute -top-1 -right-2 bg-[#f0364c] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            <span className="text-[10px] font-bold">Cart</span>
          </button>
        </div>
      </div>
    </>
  );
}
