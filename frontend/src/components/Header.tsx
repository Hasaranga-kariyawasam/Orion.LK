import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Search, Menu, X, User, Phone, Globe, ChevronRight, Shuffle, Watch, Headphones, Square, Keyboard, HardDrive, Headset, BatteryCharging, Smartphone, Speaker, Cable, Car, Camera, Monitor, MoreHorizontal, Home, LayoutGrid, RefreshCw, Wind, Store, MapPin, Package, Bell, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BRAND_LOGO_URL } from '../data';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { formatLKR } from '../data';
import { useAuth } from '../context/AuthContext';
import { formatAvatarUrl } from '../lib/api';
import { getProductType, PRODUCT_TYPES } from '../lib/productClassification';
import { ProductType } from '../types';

export default function Header() {
  const { categories, products, whatsappNumber } = useAdmin();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<ProductType | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuTab, setMobileMenuTab] = useState<'categories' | 'menu'>('categories');
  const [mobileCategoryType, setMobileCategoryType] = useState<ProductType>('pc');
  const [desktopHeaderTheme, setDesktopHeaderTheme] = useState<'dark' | 'light'>(() =>
    localStorage.getItem('orion_desktop_header_theme') === 'light' ? 'light' : 'dark'
  );
  const navigate = useNavigate();
  const location = useLocation();

  const isDesktopHeaderLight = desktopHeaderTheme === 'light';

  const toggleDesktopHeaderTheme = () => {
    setDesktopHeaderTheme(current => {
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('orion_desktop_header_theme', next);
      return next;
    });
  };

  // Close menus on page navigation
  useEffect(() => {
    setActiveDropdown(null);
    setShowSearchResults(false);
    setShowMobileSearch(false);
    setShowMobileSearch(false);
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
    setShowNotifications(false);
  }, [location.pathname, location.search]);

  // Close dropdowns on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setShowSearchResults(false);
        setIsMobileMenuOpen(false);
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const currentDropdownCategories = activeDropdown
    ? categories.filter(c => getProductType(c.productType, '', c.name, c.productTypeManual) === activeDropdown)
    : [];

  const currentDropdownTitle = activeDropdown === 'pc'
    ? 'PC'
    : activeDropdown === 'laptop' ? 'Laptops' : activeDropdown === 'other' ? 'Other Products' : '';

  const searchResults = searchQuery.trim() === ''
    ? products.slice(0, 5)
    : products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

  const handleSearchNavigate = (id: string) => {
    setShowSearchResults(false);
    setShowMobileSearch(false);
    setSearchQuery('');
    navigate(`/product/${id}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      setShowMobileSearch(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const { cart, wishlist, setIsCartOpen, setIsWishlistOpen, cartTotal, compareList, setIsCompareModalOpen, notifications, removeNotification } = useShop();
  const { user, mongoUser, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSignOut = async () => {
    setShowProfileDropdown(false);
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Hide header as soon as user scrolls down
          // Do not reveal on small scroll up, only show when scrolled all the way to top
          if (currentScrollY > 80) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`w-full fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out will-change-transform ${isDesktopHeaderLight ? 'bg-white' : 'bg-[#e8eef7]'} ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        {/* Top Header */}
        <div
          onMouseEnter={() => setActiveDropdown(null)}
          className={`relative z-30 backdrop-blur-md transition-colors duration-200 ${isDesktopHeaderLight ? 'bg-white' : 'bg-white md:bg-[#161B22]/90'}`}
        >
          <div className="relative z-10 container mx-auto max-w-7xl px-3 md:px-4 h-14 md:h-20 flex items-center justify-between gap-2 md:gap-6">

            <button
              type="button"
              onClick={() => {
                setMobileMenuTab('categories');
                setIsMobileMenuOpen(true);
              }}
              aria-label="Open categories and menu"
              className="lg:hidden min-h-11 min-w-11 flex items-center justify-center text-[#161B22] md:text-white"
            >
              <Menu size={23} />
            </button>

            {/* Logo */}
            <a href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center shrink-0 md:static md:translate-x-0">
              <span className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                <span className={isDesktopHeaderLight ? 'text-[#161B22]' : 'text-[#161B22] md:text-white'}>O</span>
                <span className={isDesktopHeaderLight ? 'text-[#161B22]' : 'text-[#161B22] md:text-white'}>RION</span>
                <span className="text-[#16a34a] ml-1 text-2xl" style={{ textShadow: '0 0 10px rgba(22, 163, 74, 0.4)' }}>.lk</span>
              </span>
            </a>

            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex flex-1 max-w-2xl relative group"
            >
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                className={`w-full rounded-full border py-2.5 pl-6 pr-14 transition-all focus:outline-none focus:border-[#16a34a] shadow-inner ${isDesktopHeaderLight ? 'bg-gray-50 text-gray-900 placeholder-gray-500 border-gray-200 focus:bg-white' : 'bg-[#0D1117] text-white placeholder-[#8B949E] border-[#30363D] focus:bg-[#0D1117]/80'}`}
              />
              <button
                type="submit"
                aria-label="Search products"
                className="absolute right-0 top-0 h-full w-12 bg-[#16a34a] text-white flex items-center justify-center rounded-r-full hover:bg-[#15803d] transition-colors cursor-pointer"
              >
                <Search size={18} strokeWidth={2.5} />
              </button>

              {/* Search Dropdown - positioned below Sub Header */}
              <AnimatePresence>
                {showSearchResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute top-full left-0 right-0 mt-[68px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]"
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
                              <span className="text-sm font-black text-[#15803d]">{formatLKR(product.price)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-500 text-sm">
                          No products found matching "{searchQuery}"
                        </div>
                      )}
                    </div>
                    {searchQuery.trim() !== '' && (
                      <div
                        onClick={handleSearchSubmit}
                        className="p-3 bg-gray-50 hover:bg-[#15803d]/10 text-center text-xs font-bold text-gray-700 hover:text-black cursor-pointer transition-colors border-t border-gray-100 flex items-center justify-center gap-1.5"
                      >
                        <span>View all results for "{searchQuery}"</span>
                        <ChevronRight size={14} className="text-[#15803d]" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Action Icons */}
            <div className="flex items-center gap-1.5 lg:gap-4 shrink-0">
              <Link to="/profile?tab=orders" title="My Orders" className={`hidden lg:flex w-10 h-10 rounded-full border items-center justify-center transition-colors ${isDesktopHeaderLight ? 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'border-[#30363D] text-[#8B949E] hover:text-white hover:bg-white/10'}`}>
                <Package size={20} />
              </Link>

              <div className="relative group hidden lg:block" onMouseEnter={() => setShowNotifications(true)} onMouseLeave={() => setShowNotifications(false)}>
                <button
                  onClick={() => setShowNotifications(prev => !prev)}
                  className={`hidden lg:flex w-10 h-10 rounded-full border items-center justify-center transition-colors relative cursor-pointer ${isDesktopHeaderLight ? 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'border-[#30363D] text-[#8B949E] hover:text-white hover:bg-white/10'}`}
                >
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
                      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
                    >
                      <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900">Notifications</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(notif => (
                            <div key={notif.id} onClick={() => removeNotification(notif.id)} className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-50/50' : ''}`}>
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="text-sm font-bold text-gray-900 mb-1">{notif.title}</h4>
                                <span className="text-[10px] text-gray-400 shrink-0">Dismiss</span>
                              </div>
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

              <div
                className="relative order-4 group lg:order-none"
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
              >
                {user ? (
                  <button
                    type="button"
                    onClick={() => setShowProfileDropdown(prev => !prev)}
                    className={`w-10 h-10 rounded-full border-0 md:border flex items-center justify-center overflow-hidden transition-colors cursor-pointer ${isDesktopHeaderLight ? 'md:border-gray-200 hover:bg-gray-100' : 'md:border-[#30363D] hover:bg-gray-100 md:hover:bg-white/10'}`}
                  >
                    {formatAvatarUrl(mongoUser?.avatar || user.photoURL) ? (
                      <img src={formatAvatarUrl(mongoUser?.avatar || user.photoURL)!} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className={isDesktopHeaderLight ? 'text-[#161B22]' : 'text-[#161B22] md:text-[#8B949E]'} />
                    )}
                  </button>
                ) : (
                  <>
                    <Link to="/login" title="Sign In" className={`lg:hidden w-10 h-10 rounded-full border-0 md:border flex items-center justify-center transition-colors ${isDesktopHeaderLight ? 'md:border-gray-200 text-[#161B22] hover:text-black hover:bg-gray-100' : 'md:border-[#30363D] text-[#161B22] md:text-[#8B949E] hover:text-black md:hover:text-white hover:bg-gray-100 md:hover:bg-white/10'}`}>
                      <User size={20} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowProfileDropdown(prev => !prev)}
                      title="Profile and display settings"
                      aria-label="Open profile and display settings"
                      className={`hidden lg:flex w-10 h-10 rounded-full border items-center justify-center transition-colors ${isDesktopHeaderLight ? 'border-gray-200 text-gray-700 hover:bg-gray-100' : 'border-[#30363D] text-[#8B949E] hover:text-white hover:bg-white/10'}`}
                    >
                      <User size={20} />
                    </button>
                  </>
                )}

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 hidden w-64 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl z-[100] before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 lg:block"
                    >
                      {user ? (
                        <>
                          <div className="p-3 bg-gradient-to-r from-gray-50 to-amber-50/60 border-b border-gray-100 flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'User'}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                              {mongoUser?.points !== undefined ? mongoUser.points : 100} Pts
                            </span>
                          </div>
                          <div className="py-2">
                            <Link
                              to="/profile"
                              onClick={() => setShowProfileDropdown(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                            >
                              <User size={16} /> My Profile
                            </Link>
                            <Link
                              to="/profile?tab=orders"
                              onClick={() => setShowProfileDropdown(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                            >
                              <Package size={16} /> My Orders
                            </Link>
                            {(user.email === 'orian@admin.lk' || user.email === 'orion@admin.lk' || mongoUser?.isAdmin) && (
                              <Link
                                to="/admin"
                                onClick={() => setShowProfileDropdown(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-[#15803d] font-bold hover:bg-[#15803d]/10 transition-colors"
                              >
                                <Settings size={16} /> Admin Dashboard
                              </Link>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="border-b border-gray-100 p-4">
                          <p className="text-sm font-bold text-gray-900">Welcome to Orion.LK</p>
                          <Link to="/login" onClick={() => setShowProfileDropdown(false)} className="mt-1 inline-block text-xs font-semibold text-gray-500 hover:text-gray-900">
                            Sign in to your account
                          </Link>
                        </div>
                      )}
                      <div className="border-t border-gray-100 py-2">
                        <button
                          type="button"
                          onClick={toggleDesktopHeaderTheme}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950"
                        >
                          {isDesktopHeaderLight ? <Moon size={16} /> : <Sun size={16} />}
                          Switch to {isDesktopHeaderLight ? 'dark' : 'light'} mode
                        </button>
                        {user && (
                          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-bold cursor-pointer">
                            <LogOut size={16} /> Sign Out
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsCompareModalOpen(true)}
                className={`hidden lg:flex w-10 h-10 rounded-full border items-center justify-center transition-colors relative cursor-pointer ${isDesktopHeaderLight ? 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'border-[#30363D] text-[#8B949E] hover:text-white hover:bg-white/10'}`}
              >
                <Shuffle size={18} className={compareList.length > 0 ? "text-[#15803d]" : ""} />
                <span className="absolute -top-2 -right-2 bg-[#15803d] border-none text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{compareList.length}</span>
              </button>

              <button onClick={() => setIsWishlistOpen(true)} className={`hidden md:flex w-10 h-10 rounded-full border items-center justify-center transition-colors relative cursor-pointer ${isDesktopHeaderLight ? 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'border-[#30363D] text-[#8B949E] hover:text-white hover:bg-white/10'}`}>
                <Heart size={20} className={wishlist.length > 0 ? "fill-[#15803d] text-[#15803d]" : ""} />
                <span className="absolute -top-2 -right-2 bg-[#15803d] border-none text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{wishlist.length}</span>
              </button>

              {/* Cart Pill Button matching custom design */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="hidden md:flex h-10 pl-1.5 pr-4 rounded-full bg-[#15803d] hover:bg-[#166534] transition-all duration-200 items-center gap-2.5 relative ml-2 shadow-sm hover:shadow-md cursor-pointer group"
                aria-label="Shopping Cart"
              >
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  <ShoppingCart size={15} strokeWidth={2.2} className="text-gray-900 ml-[-1px]" />
                </div>
                <span className="font-black text-[13px] md:text-sm text-white tracking-tight whitespace-nowrap">
                  LKR {cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.15)] border border-gray-100/80">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="lg:hidden bg-green-50 px-4 py-2.5">
          <div className="mx-auto flex h-10 max-w-7xl overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search for products"
              aria-label="Search for products"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-gray-800 outline-none placeholder:text-gray-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="mobile-search-glow my-0.5 mr-0.5 flex w-9 shrink-0 items-center justify-center rounded-full bg-[#15803d] text-white hover:bg-[#166534]"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Sub Header */}
        <div
          className={`desktop-subheader-glow hidden lg:block relative border-0 transition-colors duration-200 ${isDesktopHeaderLight ? 'bg-white' : 'bg-[#e8eef7]'} ${activeDropdown ? 'z-50' : 'z-20'}`}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="container mx-auto max-w-7xl px-3 md:px-4 h-11 md:h-12 flex items-center justify-between">
            <div className="flex items-center gap-6 h-full">
              {/* Links */}
              <nav className="hidden lg:flex items-center gap-4 xl:gap-6 font-bold text-slate-700 text-[12px] xl:text-[13px] uppercase tracking-wide h-full whitespace-nowrap">
                {PRODUCT_TYPES.map(productType => (
                  <button
                    key={productType}
                    onMouseEnter={() => setActiveDropdown(productType)}
                    onClick={() => setActiveDropdown(activeDropdown === productType ? null : productType)}
                    className={`flex items-center gap-1 transition-colors h-full outline-none cursor-pointer ${activeDropdown === productType ? 'text-[#15803d]' : 'hover:text-[#15803d]'}`}
                  >
                    {productType === 'pc' ? 'PC' : productType === 'laptop' ? 'LAPTOPS' : 'OTHER'} <ChevronRight size={14} className={`transition-transform duration-300 ${activeDropdown === productType ? '-rotate-90' : 'rotate-90'}`} />
                  </button>
                ))}
                <a
                  href="/shop"
                  onMouseEnter={() => setActiveDropdown(null)}
                  className="hover:text-slate-950 transition-colors"
                >
                  ALL PRODUCTS
                </a>
                <Link
                  to="/offers"
                  onMouseEnter={() => setActiveDropdown(null)}
                  className="text-[#f0364c] hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  <Heart size={14} className="fill-current" /> SPECIAL OFFERS
                </Link>
                <Link
                  to="/build"
                  onMouseEnter={() => setActiveDropdown(null)}
                  className="text-slate-900 font-black hover:text-black transition-colors flex items-center gap-1"
                >
                  <Package size={14} /> BUILD MY PC
                </Link>
              </nav>

              {/* Compact navigation for mobile and tablet screens */}
              <nav className="lg:hidden flex items-center gap-1.5 h-full w-full overflow-x-auto scrollbar-hide whitespace-nowrap pr-2 text-[10px] sm:text-[11px] font-black uppercase tracking-wide">
                {PRODUCT_TYPES.map(productType => (
                  <button
                    key={productType}
                    onClick={() => setActiveDropdown(activeDropdown === productType ? null : productType)}
                    aria-expanded={activeDropdown === productType}
                    aria-controls="mobile-category-menu"
                    className={`relative min-h-10 shrink-0 inline-flex items-center px-3 py-2 transition-colors capitalize after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d] focus-visible:ring-offset-2 ${activeDropdown === productType ? 'text-[#15803d] after:bg-[#15803d]' : 'text-slate-700 after:bg-transparent hover:text-slate-950'}`}
                  >
                    {productType === 'pc' ? 'PC' : productType}
                  </button>
                ))}
                <a href="/shop" className="min-h-10 shrink-0 flex items-center px-3 py-2 text-slate-700 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d] focus-visible:ring-offset-2 transition-colors">
                  All Products
                </a>
                <Link to="/offers" className="min-h-10 shrink-0 flex items-center px-3 py-2 text-[#d92840] hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d] focus-visible:ring-offset-2 transition-colors">
                  Offers
                </Link>
              </nav>

              {/* Full-width Mega Menu */}
              <AnimatePresence>
                {activeDropdown && (
                  <>
                    {/* Dimmed backdrop - clicking it closes dropdown */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setActiveDropdown(null)}
                      className="fixed inset-0 top-[128px] bg-black/40 backdrop-blur-[2px] z-[40]"
                    />

                    <motion.div
                      id="mobile-category-menu"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="fixed inset-y-0 left-0 w-[86vw] max-w-sm bg-white shadow-2xl z-[80] py-5 px-4 overflow-y-auto lg:absolute lg:inset-y-auto lg:top-[100%] lg:left-0 lg:w-full lg:max-w-none lg:shadow-2xl lg:border-t lg:border-gray-100 lg:py-8 lg:px-6 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
                    >
                      <div className="flex items-center justify-between mb-6 lg:hidden">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-gray-400">Browse</p>
                          <h3 className="text-lg font-black text-gray-900">
                            {currentDropdownTitle}
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveDropdown(null)}
                          aria-label="Close category menu"
                          className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="container mx-auto max-w-7xl">
                        <div className="hidden lg:flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                          <div>
                            <h3 className="text-xl font-black text-gray-900">{currentDropdownTitle}</h3>
                          </div>
                          <Link
                            to={`/shop?productType=${activeDropdown}`}
                            onClick={() => setActiveDropdown(null)}
                            className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1"
                          >
                            Browse All in Shop <ChevronRight size={14} />
                          </Link>
                        </div>
                        <div className="flex gap-2 mb-5">
                          {[
                            ['brand-new', 'New'],
                            ['used', 'Used'],
                          ].map(([type, label]) => (
                            <Link
                              key={type}
                              to={`/shop?productType=${activeDropdown}&type=${type}`}
                              onClick={() => setActiveDropdown(null)}
                              className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-[#15803d]"
                            >
                              {label} {currentDropdownCategories.filter(category =>
                                (category.type || (category.name.toLowerCase().startsWith('used ') ? 'used' : 'brand-new')) === type
                              ).length}
                            </Link>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-6 max-h-[65vh] overflow-y-auto pr-2">
                          {currentDropdownCategories.map((cat: any, idx) => (
                            <Link
                              key={cat.id || idx}
                              to={`/shop?category=${encodeURIComponent(cat.name)}&productType=${activeDropdown}${cat.type ? `&type=${cat.type}` : ''}`}
                              onClick={() => setActiveDropdown(null)}
                              className="flex flex-col items-center text-center group cursor-pointer rounded-xl p-2.5 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                            >
                              <div className="h-16 w-16 bg-white rounded-xl shadow-xs flex items-center justify-center transform group-hover:-translate-y-1 group-hover:scale-105 transition-all duration-300 mb-2 p-2">
                                <img
                                  src={cat.img}
                                  alt={cat.name}
                                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                              <span className="text-[12px] font-bold text-gray-800 group-hover:text-[#15803d] leading-tight transition-colors line-clamp-2">
                                {cat.name} <span className="text-gray-400 font-normal">({cat.count})</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Right Info */}
            <div
              onMouseEnter={() => setActiveDropdown(null)}
              className="hidden md:flex items-center gap-8"
            >
              <div className="flex items-center gap-2">
                <Globe className="text-gray-400" size={20} />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Islandwide</span>
                  <span className="text-xs font-bold text-slate-900">Fast Delivery</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-gray-400" size={20} />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Contact Us</span>
                  <span className="text-xs font-bold text-slate-900">{whatsappNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close categories and menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/55 lg:hidden"
            />
            <motion.aside
              id="mobile-category-menu"
              role="dialog"
              aria-modal="true"
              aria-label={mobileMenuTab === 'categories' ? 'Product categories' : 'Site menu'}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[78vw] max-w-[340px] flex-col bg-white shadow-2xl lg:hidden"
            >
              <div className="grid h-14 shrink-0 grid-cols-2 border-b border-gray-200">
                {(['categories', 'menu'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMobileMenuTab(tab)}
                    aria-pressed={mobileMenuTab === tab}
                    className={`relative text-xs font-bold uppercase tracking-wide transition-colors ${mobileMenuTab === tab ? 'bg-white text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#15803d]' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {mobileMenuTab === 'categories' ? (
                <>
                  <div className="grid shrink-0 grid-cols-3 border-b border-gray-200 bg-white">
                    {PRODUCT_TYPES.map(productType => {
                      const label = productType === 'pc' ? 'PC' : productType === 'laptop' ? 'Laptop' : 'Other';
                      const count = categories.filter(category =>
                        getProductType(category.productType, '', category.name, category.productTypeManual) === productType
                      ).length;
                      return (
                        <button
                          key={productType}
                          type="button"
                          onClick={() => setMobileCategoryType(productType)}
                          aria-pressed={mobileCategoryType === productType}
                          className={`min-h-12 px-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${mobileCategoryType === productType ? 'mobile-category-glow bg-green-50 text-[#15803d] shadow-[inset_0_-2px_0_#15803d]' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          {label} <span className="ml-0.5 text-[10px] opacity-75">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  {categories.filter(category =>
                    getProductType(category.productType, '', category.name, category.productTypeManual) === mobileCategoryType
                  ).length > 0 ? categories.filter(category =>
                    getProductType(category.productType, '', category.name, category.productTypeManual) === mobileCategoryType
                  ).map(category => {
                    const name = category.name.toLowerCase();
                    const categoryIcon = name.includes('watch') ? Watch
                      : name.includes('earbud') ? Headset
                      : name.includes('headphone') ? Headphones
                      : name.includes('case') ? Square
                      : name.includes('computer') || name.includes('keyboard') ? Keyboard
                      : name.includes('storage') || name.includes('drive') ? HardDrive
                      : name.includes('power bank') ? BatteryCharging
                      : name.includes('mobile') || name.includes('phone') ? Smartphone
                      : name.includes('speaker') ? Speaker
                      : name.includes('cable') || name.includes('adapter') ? Cable
                      : name.includes('car') ? Car
                      : name.includes('camera') || name.includes('cctv') ? Camera
                      : name.includes('monitor') || name.includes('display') ? Monitor
                      : name.includes('fan') || name.includes('cooler') ? Wind
                      : name.includes('software') ? LayoutGrid
                      : MoreHorizontal;
                    const Icon = categoryIcon;
                    const productType = getProductType(category.productType, '', category.name, category.productTypeManual);
                    const query = new URLSearchParams({
                      category: category.name,
                      productType,
                    });
                    if (category.type) query.set('type', category.type);

                    return (
                      <Link
                        key={category.id || category.name}
                        to={`/shop?${query.toString()}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex min-h-[50px] items-center gap-3 border-b border-gray-200 px-5 text-[13px] font-medium text-slate-900 transition-colors hover:bg-green-50 active:bg-green-100"
                      >
                        <Icon size={17} strokeWidth={1.8} className="shrink-0 text-gray-700" />
                        <span className="min-w-0 flex-1 truncate">{category.name}</span>
                        <ChevronRight size={15} className="shrink-0 text-gray-400" />
                      </Link>
                    );
                  }) : (
                    <p className="px-5 py-6 text-sm text-gray-500">No categories available.</p>
                  )}
                  </nav>
                </>
              ) : (
                <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowMobileSearch(true);
                    }}
                    className="flex min-h-[50px] w-full items-center gap-3 border-b border-gray-200 px-5 text-left text-sm font-medium text-slate-900"
                  >
                    <Search size={18} className="text-gray-700" /> Search Products
                  </button>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex min-h-[50px] items-center gap-3 border-b border-gray-200 px-5 text-sm font-medium text-slate-900">
                    <Home size={18} className="text-gray-700" /> Home
                  </Link>
                  <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="flex min-h-[50px] items-center gap-3 border-b border-gray-200 px-5 text-sm font-medium text-slate-900">
                    <Store size={18} className="text-gray-700" /> All Products
                  </Link>
                  <Link to="/offers" onClick={() => setIsMobileMenuOpen(false)} className="flex min-h-[50px] items-center gap-3 border-b border-gray-200 px-5 text-sm font-medium text-slate-900">
                    <Heart size={18} className="text-gray-700" /> Special Offers
                  </Link>
                  <Link to="/build" onClick={() => setIsMobileMenuOpen(false)} className="flex min-h-[50px] items-center gap-3 border-b border-gray-200 px-5 text-sm font-medium text-slate-900">
                    <Package size={18} className="text-gray-700" /> Build My PC
                  </Link>
                  <Link to={user ? '/profile' : '/login'} onClick={() => setIsMobileMenuOpen(false)} className="flex min-h-[50px] items-center gap-3 border-b border-gray-200 px-5 text-sm font-medium text-slate-900">
                    <User size={18} className="text-gray-700" /> {user ? 'My Profile' : 'Sign In'}
                  </Link>
                  {user && (
                    <Link to="/profile?tab=orders" onClick={() => setIsMobileMenuOpen(false)} className="flex min-h-[50px] items-center gap-3 border-b border-gray-200 px-5 text-sm font-medium text-slate-900">
                      <ShoppingCart size={18} className="text-gray-700" /> My Orders
                    </Link>
                  )}
                </nav>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            className="fixed inset-0 z-[100] lg:hidden bg-black/50 backdrop-blur-sm px-4 pt-[max(1rem,env(safe-area-inset-top))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileSearch(false)}
            role="presentation"
          >
            <motion.div
              className="mx-auto mt-2 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              onClick={event => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Search products"
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 border-b border-gray-100 p-3">
                <Search size={19} className="ml-1 shrink-0 text-gray-400" />
                <input
                  autoFocus
                  type="search"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  aria-label="Search products"
                  className="h-11 min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="submit"
                    className="min-h-10 rounded-lg bg-[#15803d] px-3 text-sm font-bold text-white"
                  >
                    Search
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowMobileSearch(false)}
                  aria-label="Close search"
                  className="min-h-10 min-w-10 rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} className="mx-auto" />
                </button>
              </form>
              <div className="max-h-[65vh] overflow-y-auto">
                <p className="px-4 pt-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  {searchQuery.trim() ? 'Search results' : 'Popular products'}
                </p>
                {searchResults.length > 0 ? searchResults.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSearchNavigate(product.id)}
                    className="flex min-h-[68px] w-full items-center gap-3 border-b border-gray-100 px-4 py-2.5 text-left hover:bg-gray-50"
                  >
                    <img src={product.image} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-gray-100 object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-gray-900">{product.name}</span>
                      <span className="block truncate text-xs text-gray-500">{product.category}</span>
                    </span>
                    <span className="shrink-0 text-xs font-black text-[#15803d]">{formatLKR(product.price)}</span>
                  </button>
                )) : (
                  <p className="px-4 py-6 text-center text-sm text-gray-500">No products found.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <a href="/" className="min-h-11 min-w-11 flex flex-col items-center justify-center gap-1 text-[#15803d]">
            <Home size={22} strokeWidth={2} />
            <span className="text-[10px] font-bold">Home</span>
          </a>
          <button onClick={() => setActiveDropdown(activeDropdown ? null : 'pc')} className="min-h-11 min-w-11 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-[#15803d] transition-colors">
            <Store size={22} strokeWidth={2} />
            <span className="text-[10px] font-bold">Shop</span>
          </button>
          <Link to="/build" className="min-h-11 min-w-11 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-[#15803d] transition-colors">
            <Package size={22} strokeWidth={2} />
            <span className="text-[10px] font-bold">Build</span>
          </Link>
          <button onClick={() => setIsWishlistOpen(true)} aria-label={`Wishlist, ${wishlist.length} items`} className="min-h-11 min-w-11 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-[#15803d] transition-colors relative">
            <div className="relative">
              <Heart size={22} strokeWidth={2} className={wishlist.length > 0 ? 'fill-[#15803d] text-[#15803d]' : ''} />
              {wishlist.length > 0 && <span className="absolute -top-1 -right-2 bg-[#15803d] text-white text-[9px] font-black min-w-4 h-4 px-0.5 rounded-full flex items-center justify-center shadow-sm">{wishlist.length}</span>}
            </div>
            <span className="text-[10px] font-bold">Wishlist</span>
          </button>
          <button onClick={() => setIsCartOpen(true)} className="min-h-11 min-w-11 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-[#15803d] transition-colors relative">
            <div className="relative">
              <ShoppingCart size={22} strokeWidth={2} />
              <span className="absolute -top-1 -right-2 bg-[#15803d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
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
