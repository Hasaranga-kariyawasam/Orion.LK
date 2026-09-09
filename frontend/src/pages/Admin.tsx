import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, Plus, ShoppingBag, Users, Home, Tags,
  LayoutGrid, CreditCard, Star, Save, Menu, X, ChevronRight,
  Bell, Settings, LogOut, Lock, ShieldAlert, AlertCircle, Eye, EyeOff, Loader2, ArrowLeft, LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { loginWithEmail } from '../lib/firebase';
import { formatAvatarUrl } from '../lib/api';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminAddItem from './admin/AdminAddItem';
import AdminOrders from './admin/AdminOrders';
import AdminUsers from './admin/AdminUsers';
import AdminHomePage from './admin/AdminHomePage';
import AdminSpecialOffers from './admin/AdminSpecialOffers';
import AdminCategories from './admin/AdminCategories';
import AdminBrands from './admin/AdminBrands';
import AdminPayments from './admin/AdminPayments';

const ALLOWED_ADMIN_EMAILS = ['orian@admin.lk', 'orion@admin.lk'];

export const isAuthorizedAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

type TabId = 'dashboard' | 'products' | 'add-item' | 'orders' | 'users' | 'home-page' | 'special-offers' | 'categories' | 'brands' | 'payments';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.FC<any>;
  badge?: number;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { id: 'products', label: 'Products', icon: Package },
      { id: 'add-item', label: 'Add Item', icon: Plus },
      { id: 'categories', label: 'Categories', icon: LayoutGrid },
      { id: 'brands', label: 'Brands', icon: Tags },
      { id: 'special-offers', label: 'Special Offers', icon: Star },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { id: 'orders', label: 'Orders', icon: ShoppingBag },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'payments', label: 'Payment Options', icon: CreditCard },
    ],
  },
  {
    title: 'Site',
    items: [
      { id: 'home-page', label: 'Home Page', icon: Home },
    ],
  },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [editItemId, setEditItemId] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { saveSettings, orders } = useAdmin();
  const { user, mongoUser, loading, logout } = useAuth();

  // Admin login states
  const [authEmail, setAuthEmail] = useState('orian@admin.lk');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  const handleAddItem = () => { setEditItemId(undefined); setActiveTab('add-item'); };
  const handleEditItem = (id: string) => { setEditItemId(id); setActiveTab('add-item'); };
  const handleBackFromAddItem = () => { setEditItemId(undefined); setActiveTab('products'); };

  const navigate = (tab: TabId) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const trimmed = authEmail.trim().toLowerCase();
    if (!isAuthorizedAdmin(trimmed)) {
      setAuthError('Access Denied: Only orian@admin.lk is authorized to access the Admin Console.');
      return;
    }
    setAuthSubmitting(true);
    try {
      await loginWithEmail(trimmed, authPassword);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setAuthError('Invalid credentials. Please verify your password for orian@admin.lk.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  // 1. Loading verification state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-sans text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#2ee661] border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  // 2. Not logged in -> Render dedicated Admin Portal Authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#2ee661]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8 relative">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0d1117] border border-[#30363D] flex items-center justify-center text-[#2ee661] shadow-inner mb-4">
              <Lock size={26} />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-white font-black text-2xl tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>ORION</span>
              <span className="text-xs bg-[#2ee661] text-black font-black px-2 py-0.5 rounded">ADMIN</span>
            </div>
            <p className="text-gray-400 text-xs mt-1">Authorized Administrator Portal</p>
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] text-emerald-400 font-mono">
              <span>Restricted to:</span>
              <span className="font-bold">orian@admin.lk</span>
            </div>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Email</label>
              <input
                type="email"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                placeholder="orian@admin.lk"
                required
                className="w-full bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#2ee661] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:border-[#2ee661] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full mt-2 bg-[#2ee661] hover:bg-[#24c24e] text-black font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-[#2ee661]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back */}
          <div className="mt-6 pt-5 border-t border-[#30363D] text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={14} /> Return to Orion.LK Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Logged in with a different (unauthorized) email -> Access Denied 403
  if (!isAuthorizedAdmin(user.email)) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-md bg-[#161B22] border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-5">
            <ShieldAlert size={32} />
          </div>

          <span className="text-xs bg-red-500/10 text-red-400 font-bold px-3 py-1 rounded-full border border-red-500/20">
            403 • ACCESS RESTRICTED
          </span>

          <h2 className="text-xl font-bold text-white mt-4 mb-2">Administrator Access Required</h2>
          <p className="text-gray-400 text-xs leading-relaxed mb-5">
            This administration console is strictly restricted. Only the designated administrator email (<span className="text-white font-mono font-bold">orian@admin.lk</span>) is authorized to access this page.
          </p>

          <div className="bg-[#0d1117] border border-[#30363D] rounded-xl p-3 mb-6 text-left">
            <p className="text-[11px] text-gray-500">Currently signed in as:</p>
            <p className="text-xs font-mono font-bold text-red-400 truncate mt-0.5">{user.email || 'Anonymous User'}</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={logout}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl py-3 font-bold text-sm transition-colors"
            >
              Sign Out & Switch Account
            </button>
            <Link
              to="/"
              className="block w-full text-center py-2.5 text-xs text-gray-500 hover:text-white transition-colors"
            >
              ← Return to Orion.LK Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#161B22] border-r border-[#30363D] z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#30363D] shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-[#2ee661] font-black text-xl tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>ORION</span>
            <span className="text-xs text-gray-500 bg-[#0d1117] border border-[#30363D] rounded px-1.5 py-0.5 font-bold">ADMIN</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-gray-500 hover:text-white lg:hidden"><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_GROUPS.map(group => (
            <div key={group.title} className="mb-6">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${isActive
                        ? 'bg-[#2ee661]/10 text-[#2ee661] border border-[#2ee661]/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon size={17} className={isActive ? 'text-[#2ee661]' : 'text-gray-500 group-hover:text-white transition-colors'} />
                      <span>{item.label}</span>
                      {item.id === 'orders' && pendingOrders > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{pendingOrders}</span>
                      )}
                      {item.id === 'add-item' && !isActive && (
                        <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-[#30363D] p-3 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2ee661] to-teal-500 flex items-center justify-center text-black font-black text-sm shrink-0 overflow-hidden">
              {formatAvatarUrl(mongoUser?.avatar || user?.photoURL) ? (
                <img src={formatAvatarUrl(mongoUser?.avatar || user?.photoURL)!} alt="" className="w-full h-full object-cover" />
              ) : (user?.displayName?.[0] || 'A')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{user?.displayName || 'Admin'}</p>
              <p className="text-gray-500 text-[11px] truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-[#161B22] border-b border-[#30363D] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 hover:text-white lg:hidden">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-white font-bold text-sm capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-gray-600 text-xs hidden sm:block">Orion.LK Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingOrders > 0 && (
              <button onClick={() => navigate('orders')} className="relative p-2 text-gray-500 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4.5 h-4.5 w-5 h-5 rounded-full flex items-center justify-center">{pendingOrders}</span>
              </button>
            )}
            <button onClick={saveSettings}
              className="flex items-center gap-2 bg-[#2ee661] text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#24c24e] transition-colors shadow-md shadow-[#2ee661]/20">
              <Save size={15} /> Save
            </button>
            <Link to="/" className="text-gray-500 hover:text-white transition-colors text-xs font-medium hidden sm:block">← View Site</Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'dashboard' && <AdminDashboard />}
              {activeTab === 'products' && <AdminProducts onAddItem={handleAddItem} onEditItem={handleEditItem} />}
              {activeTab === 'add-item' && <AdminAddItem onBack={handleBackFromAddItem} editId={editItemId} />}
              {activeTab === 'orders' && <AdminOrders />}
              {activeTab === 'users' && <AdminUsers />}
              {activeTab === 'home-page' && <AdminHomePage />}
              {activeTab === 'special-offers' && <AdminSpecialOffers />}
              {activeTab === 'categories' && <AdminCategories />}
              {activeTab === 'brands' && <AdminBrands />}
              {activeTab === 'payments' && <AdminPayments />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
