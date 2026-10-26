import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Package, MapPin, Settings, LogOut, ChevronRight,
  ShoppingBag, Edit2, CheckCircle2, Clock, Heart, Camera,
  Loader2, Plus, Trash2, AlertCircle, Save, Check, Coins, Sparkles, Gift, ArrowRight,
  Truck, ChevronDown
} from 'lucide-react';
import { formatLKR } from '../data';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { getMyOrders, cancelMyOrder, ApiOrder, MongoAddress, formatAvatarUrl } from '../lib/api';
import { updatePassword, auth, reauthenticateWithPassword } from '../lib/firebase';

const ORDER_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'] as const;
const ORDER_FILTERS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;
type OrderFilter = typeof ORDER_FILTERS[number];

function orderProgress(status: ApiOrder['status']) {
  if (status === 'Cancelled') return 0;
  const index = ORDER_STEPS.indexOf(status as typeof ORDER_STEPS[number]);
  return index < 0 ? 1 : index + 1;
}

function orderTimeline(order: ApiOrder) {
  if (order.trackingUpdates?.length) return order.trackingUpdates;
  const labels = [
    ['Order Received', 'Your order has been received.'],
    ['Processing', 'We are preparing your items.'],
    ['Shipped', 'Your order is on its way.'],
    ['Delivered', 'Your order was delivered successfully.'],
  ];
  const count = orderProgress(order.status);
  return labels.slice(0, Math.max(1, count)).map(([status, message], index) => ({
    status,
    message,
    timestamp: new Date(new Date(order.createdAt).getTime() + index * 86400000).toISOString(),
  }));
}

export default function Profile() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'rewards' | 'addresses' | 'settings'>('dashboard');
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('All');

  // Settings Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  // Address Form States
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrFirstName, setNewAddrFirstName] = useState('');
  const [newAddrLastName, setNewAddrLastName] = useState('');
  const [newAddrEmail, setNewAddrEmail] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState('Colombo');
  const [newAddrPostal, setNewAddrPostal] = useState('');
  const [addrSaving, setAddrSaving] = useState(false);

  // Avatar Upload States
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { wishlist } = useShop();
  const { user, mongoUser, logout, updateMongoProfile, uploadAvatar } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (searchParams.get('tab') === 'orders') setActiveTab('orders');
  }, [searchParams]);

  // Sync real profile data from Mongo/Firebase
  useEffect(() => {
    if (user || mongoUser) {
      const fullName = mongoUser?.name || user?.displayName || '';
      const parts = fullName.trim().split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setPhone(mongoUser?.phone || '');
    }
  }, [user, mongoUser]);

  // Fetch real orders from MongoDB
  useEffect(() => {
    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const userOrders = await getMyOrders();
        setOrders(userOrders);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    if (user) {
      loadOrders();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Profile picture must be under 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
    } catch (err: any) {
      alert(err.message || 'Failed to upload profile picture to image server');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'User';
      const result = await updateMongoProfile({
        name: fullName,
        phone: phone.trim(),
      });

      if (result) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError('Failed to update profile in database.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccess(false);
    setPwError('');

    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters long.');
      return;
    }

    if (!currentPassword) {
      setPwError('Enter your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }

    setPwSaving(true);
    try {
      if (auth.currentUser) {
        await reauthenticateWithPassword(auth.currentUser, currentPassword);
        await updatePassword(auth.currentUser, newPassword);
        setPwSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwSuccess(false), 3000);
      }
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setPwError('For security, please log out and log back in before changing your password.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPwError('Your current password is incorrect.');
      } else {
        setPwError(err.message || 'Failed to change password.');
      }
    } finally {
      setPwSaving(false);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddressIndex(null);
    setNewAddrLabel('Home');
    const fullName = mongoUser?.name || user?.displayName || '';
    const parts = fullName.trim().split(' ');
    setNewAddrFirstName(parts[0] || '');
    setNewAddrLastName(parts.slice(1).join(' ') || '');
    setNewAddrEmail(mongoUser?.email || user?.email || '');
    setNewAddrPhone(mongoUser?.phone || '');
    setNewAddrStreet('');
    setNewAddrCity('');
    setNewAddrDistrict('Colombo');
    setNewAddrPostal('');
    setShowAddAddress(true);
  };

  const handleEditAddress = (index: number) => {
    const addr = addresses[index];
    if (!addr) return;
    setEditingAddressIndex(index);
    setNewAddrLabel(addr.label || 'Home');
    setNewAddrFirstName(addr.firstName || firstName || '');
    setNewAddrLastName(addr.lastName || lastName || '');
    setNewAddrEmail(addr.email || userEmail || '');
    setNewAddrPhone(addr.phone || phone || '');
    setNewAddrStreet(addr.street || '');
    setNewAddrCity(addr.city || '');
    setNewAddrDistrict(addr.district || addr.province || 'Colombo');
    setNewAddrPostal(addr.postalCode || '');
    setShowAddAddress(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim() || !newAddrCity.trim()) return;

    setAddrSaving(true);
    try {
      const currentAddresses = mongoUser?.addresses || [];
      const addressData: MongoAddress = {
        label: newAddrLabel,
        firstName: newAddrFirstName.trim(),
        lastName: newAddrLastName.trim(),
        email: newAddrEmail.trim(),
        phone: newAddrPhone.trim(),
        street: newAddrStreet.trim(),
        city: newAddrCity.trim(),
        district: newAddrDistrict,
        province: newAddrDistrict,
        postalCode: newAddrPostal.trim(),
        isDefault: editingAddressIndex !== null ? (currentAddresses[editingAddressIndex]?.isDefault || false) : currentAddresses.length === 0,
      };

      let updatedAddresses: MongoAddress[];
      if (editingAddressIndex !== null && editingAddressIndex >= 0) {
        updatedAddresses = currentAddresses.map((addr, idx) => idx === editingAddressIndex ? addressData : addr);
      } else {
        updatedAddresses = [...currentAddresses, addressData];
      }

      await updateMongoProfile({
        addresses: updatedAddresses,
      });

      setShowAddAddress(false);
      setEditingAddressIndex(null);
    } catch (err) {
      console.error('Failed to save address:', err);
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    const currentAddresses = mongoUser?.addresses || [];
    const updated = currentAddresses.filter((_, i) => i !== index);
    await updateMongoProfile({ addresses: updated });
  };

  const handleCancelOrder = async (order: ApiOrder) => {
    if (order.status !== 'Pending') return;
    if (!window.confirm(`Cancel order ${order.orderNumber}? This can only be done before processing starts.`)) return;

    const orderId = order.id || order._id || order.orderNumber;
    setCancellingOrder(orderId);
    try {
      await cancelMyOrder(orderId);
      setOrders(current => current.map(item =>
        (item.orderNumber === order.orderNumber || item.id === order.id || item._id === order._id)
          ? { ...item, status: 'Cancelled' }
          : item
      ));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to cancel this order.');
    } finally {
      setCancellingOrder(null);
    }
  };

  // Real user display data
  const displayName = mongoUser?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || mongoUser?.email || '';
  const userAvatar = formatAvatarUrl(mongoUser?.avatar || user?.photoURL) || null;
  const addresses = mongoUser?.addresses || [];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* User Profile Card */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                {/* Avatar with Camera upload button */}
                <div className="relative group">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
                    {uploadingAvatar ? (
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-[#1cd75b]" />
                      </div>
                    ) : userAvatar ? (
                      <img src={userAvatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-gray-400">
                        {displayName[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    title="Upload Profile Picture"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#1cd75b] text-black rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer border-2 border-white"
                  >
                    <Camera size={14} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{displayName}</h2>
                  <p className="text-gray-500 text-sm">{userEmail}</p>
                  {mongoUser?.phone && (
                    <p className="text-gray-400 text-xs mt-0.5">{mongoUser.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <Camera size={14} /> Change Photo
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center gap-2 text-xs font-bold bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-xl transition-colors"
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-white p-6 rounded-2xl shadow-sm border border-amber-500/30 flex flex-col items-center justify-center text-center hover:border-amber-500 transition-colors cursor-pointer"
                onClick={() => setActiveTab('rewards')}
              >
                <div className="w-12 h-12 bg-amber-500/20 text-amber-600 rounded-full flex items-center justify-center mb-3">
                  <Coins size={24} />
                </div>
                <h3 className="font-black text-gray-900 text-lg">
                  {mongoUser?.points !== undefined ? mongoUser.points : 100} Pts
                </h3>
                <p className="text-xs text-amber-700 font-bold">LKR {(mongoUser?.points !== undefined ? mongoUser.points : 100).toLocaleString()} Value</p>
              </div>

              <div
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:border-black transition-colors cursor-pointer"
                onClick={() => setActiveTab('orders')}
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                  <Package size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {ordersLoading ? '...' : `${orders.length} Orders`}
                </h3>
                <p className="text-sm text-gray-500">Purchase history</p>
              </div>

              <div
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:border-black transition-colors cursor-pointer"
                onClick={() => setActiveTab('addresses')}
              >
                <div className="w-12 h-12 bg-green-50 text-[#1cd75b] rounded-full flex items-center justify-center mb-3">
                  <MapPin size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {addresses.length} {addresses.length === 1 ? 'Address' : 'Addresses'}
                </h3>
                <p className="text-sm text-gray-500">Shipping destinations</p>
              </div>

              <div
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:border-black transition-colors cursor-pointer"
                onClick={() => navigate('/shop')}
              >
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
                  <Heart size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{wishlist.length} Wishlist</h3>
                <p className="text-sm text-gray-500">Saved items</p>
              </div>
            </div>

            {/* Recent Orders section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 uppercase">Recent Orders</h3>
                {orders.length > 0 && (
                  <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-gray-500 hover:text-black flex items-center gap-1">
                    View All <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {ordersLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="animate-spin text-[#1cd75b]" size={28} />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10">
                  <Package size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-bold text-gray-700">No orders placed yet</p>
                  <p className="text-xs text-gray-500 mt-1">Explore our products and place your first order!</p>
                  <Link to="/shop" className="inline-block mt-4 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.orderNumber || order.id || order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${order.status === 'Delivered' ? 'bg-green-100 text-green-500' : 'bg-blue-100 text-blue-500'}`}>
                          {order.status === 'Delivered' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{order.orderNumber}</h4>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-1">
                        <span className="font-black text-gray-900">{formatLKR(order.total)}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">My Orders</h2>
              <p className="text-sm text-gray-500 mt-1">View your products, payment details, and delivery progress.</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {ORDER_FILTERS.map(filter => {
                const count = filter === 'All' ? orders.length : orders.filter(order => order.status === filter).length;
                const active = orderFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setOrderFilter(filter)}
                    className={`shrink-0 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-wider transition-colors ${
                      active
                        ? filter === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {filter} <span className="ml-1 opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>

            {ordersLoading ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 flex justify-center">
                <Loader2 className="animate-spin text-[#1cd75b]" size={32} />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-3" />
                <h3 className="font-bold text-gray-900 text-lg">No orders yet</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">When you order computer hardware or accessories, your order tracking will appear here.</p>
                <Link to="/shop" className="inline-block mt-5 px-6 py-2.5 bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-gray-800 transition-colors">
                  Explore Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.filter(order => orderFilter === 'All' || order.status === orderFilter).map((order) => {
                  const key = order.orderNumber || order.id || order._id || '';
                  const progress = orderProgress(order.status);
                  const isExpanded = expandedOrder === key;
                  const statusStyle = order.status === 'Delivered'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'Cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700';
                  return (
                    <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden ring-1 ring-gray-100">
                      <button
                        type="button"
                        onClick={() => setExpandedOrder(isExpanded ? null : key)}
                        className="w-full text-left p-4 md:p-6 border-b-4 border-transparent hover:border-[#1cd75b]/40 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                              {order.items?.[0]?.image ? <img src={order.items[0].image} alt={order.items[0].name} className="w-full h-full object-cover" /> : <Package size={20} className="text-gray-400" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-gray-900 font-mono">{order.orderNumber}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                            <div className="text-right">
                              <p className="font-black text-gray-900">{formatLKR(order.total)}</p>
                              <span className={`inline-flex mt-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${statusStyle}`}>{order.status}</span>
                            </div>
                            <ChevronDown size={18} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        {order.status !== 'Cancelled' && (
                          <div className="mt-5">
                            <div className="flex items-center">
                              {ORDER_STEPS.map((step, index) => (
                                <React.Fragment key={step}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${index < progress ? 'bg-[#16a34a] text-white shadow-xs' : 'bg-gray-100 text-gray-400'}`}>
                                    {index < progress ? <Check size={12} strokeWidth={3} /> : index + 1}
                                  </div>
                                  {index < ORDER_STEPS.length - 1 && <div className={`h-1 flex-1 mx-1 rounded-full ${index + 1 <= progress ? 'bg-[#16a34a]' : 'bg-gray-100'}`} />}
                                </React.Fragment>
                              ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[9px] font-bold uppercase text-gray-400">
                              {ORDER_STEPS.map(step => <span key={step}>{step}</span>)}
                            </div>
                          </div>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/60 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2"><Truck size={14} /> Shipment details</h3>
                            <div className="relative ml-2 space-y-5">
                              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                              {orderTimeline(order).map((event, index) => (
                                <div key={`${event.timestamp}-${index}`} className="relative flex gap-4">
                                  <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0 z-10 ${index === orderTimeline(order).length - 1 ? 'bg-[#1cd75b]' : 'bg-gray-400'}`} />
                                  <div className="min-w-0 -mt-1">
                                    <p className="text-sm font-bold text-gray-900">{event.status}</p>
                                    <p className="text-xs text-gray-500 mt-1">{event.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-5">
                            <div>
                              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Products</h3>
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex gap-2 items-center">
                                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 overflow-hidden shrink-0">{item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}</div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                                      <p className="text-[10px] text-gray-500">Qty {item.quantity} · {formatLKR(item.price)}</p>
                                    </div>
                                    {order.status === 'Delivered' && item.productId && (
                                      <Link to={`/product/${item.productId}?tab=reviews`} className="shrink-0 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-[10px] font-black uppercase text-green-700 hover:bg-green-100">
                                        Review
                                      </Link>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Delivery address</h3>
                              <p className="text-xs font-bold text-gray-900">{order.shippingAddress.name}</p>
                              <p className="text-xs text-gray-500">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                              <p className="text-xs text-gray-500">{order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between text-xs"><span className="text-gray-500">Payment · {order.paymentMethod}</span><span className="font-black text-gray-900">{formatLKR(order.total)}</span></div>
                            {order.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(order)}
                                disabled={cancellingOrder === (order.id || order._id || order.orderNumber)}
                                className="w-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-colors"
                              >
                                {cancellingOrder === (order.id || order._id || order.orderNumber) ? 'Cancelling...' : 'Cancel Order'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {orders.filter(order => orderFilter === 'All' || order.status === orderFilter).length === 0 && (
                  <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center">
                    <Package size={36} className="mx-auto text-gray-300 mb-3" />
                    <p className="font-bold text-gray-900">No {orderFilter.toLowerCase()} orders</p>
                    <p className="text-sm text-gray-500 mt-1">Orders in this category will appear here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'rewards':
        const points = mongoUser?.points !== undefined ? mongoUser.points : 100;
        const history = mongoUser?.pointsHistory || [
          {
            amount: 100,
            type: 'bonus',
            description: 'Welcome Bonus: 100 Orion Reward Points!',
            date: mongoUser?.createdAt || new Date().toISOString(),
          },
        ];

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Orion Loyalty & Reward Points</h2>
            <p className="text-gray-500 text-sm mb-6">Earn points on every purchase and redeem them for direct discounts at checkout.</p>

            {/* Main Balance Banner */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-8 text-black shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-black/15 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-black mb-3">
                    <Sparkles size={14} /> Orion VIP Loyalty Member
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-1">
                    {points.toLocaleString()} <span className="text-2xl md:text-3xl font-bold">Points</span>
                  </h3>
                  <p className="text-black/80 font-bold text-sm">
                    Equivalent Cash Value: <span className="underline decoration-black/30">LKR {points.toLocaleString()}.00</span> (1 Point = LKR 1.00)
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Link
                    to="/shop"
                    className="bg-black hover:bg-gray-900 text-white font-black uppercase tracking-wider py-3 px-6 rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={15} /> Redeem in Store <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* How it works grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black mb-3">
                  1
                </div>
                <h4 className="font-black text-gray-900 text-sm mb-1 uppercase">Earn on Purchases</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Earn 1 Point for every LKR 100 spent on any tech products or accessories in our store.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black mb-3">
                  2
                </div>
                <h4 className="font-black text-gray-900 text-sm mb-1 uppercase">1 Point = LKR 1</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Direct 1:1 rupee value. No complicated tier requirements or minimum spend restrictions.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black mb-3">
                  3
                </div>
                <h4 className="font-black text-gray-900 text-sm mb-1 uppercase">Instant Checkout</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Toggle points redemption during payment to deduct directly from your cart total.
                </p>
              </div>
            </div>

            {/* Points History */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 uppercase mb-4">Points Activity Log</h3>
              
              <div className="space-y-3">
                {history.map((tx: any, idx: number) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs ${
                          tx.type === 'bonus' ? 'bg-amber-100 text-amber-700' :
                          tx.type === 'refund' ? 'bg-blue-100 text-blue-700' :
                          isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {tx.type === 'bonus' ? <Gift size={16} /> :
                           tx.type === 'refund' ? <Coins size={16} /> :
                           isPositive ? '+' : '-'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{tx.description}</p>
                          <p className="text-[10px] text-gray-400">
                            {tx.date ? new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-black ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? `+${tx.amount}` : tx.amount} Pts
                        </span>
                        <p className="text-[10px] text-gray-400">
                          {isPositive ? `+LKR ${tx.amount}` : `-LKR ${Math.abs(tx.amount)}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Saved Addresses</h2>
              <button
                onClick={() => {
                  if (showAddAddress) {
                    setShowAddAddress(false);
                    setEditingAddressIndex(null);
                  } else {
                    handleOpenAddAddress();
                  }
                }}
                className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-900 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={14} /> {showAddAddress ? 'Cancel' : 'Add New'}
              </button>
            </div>

            {/* Add / Edit Address Form */}
            {showAddAddress && (
              <div className="relative bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-md mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {addrSaving && (
                  <div className="absolute inset-0 z-20 rounded-2xl bg-white/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                    <Loader2 size={28} className="animate-spin text-black" />
                    <p className="text-xs font-black uppercase tracking-wider text-gray-700">Saving address...</p>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                  <h3 className="font-black text-gray-900 uppercase tracking-tight text-base">
                    {editingAddressIndex !== null ? 'Edit Shipping Address' : 'Add Shipping Address'}
                  </h3>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Required fields marked with *</span>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="First Name"
                        value={newAddrFirstName}
                        onChange={e => setNewAddrFirstName(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Last Name"
                        value={newAddrLastName}
                        onChange={e => setNewAddrLastName(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={newAddrEmail}
                        onChange={e => setNewAddrEmail(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="0771234567"
                        value={newAddrPhone}
                        onChange={e => setNewAddrPhone(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>

                    {/* Street Address */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Street Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="House No, Street / Lane"
                        value={newAddrStreet}
                        onChange={e => setNewAddrStreet(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>

                    {/* Town / City */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Town / City *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Galle, Colombo"
                        value={newAddrCity}
                        onChange={e => setNewAddrCity(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">District *</label>
                      <select
                        value={newAddrDistrict}
                        onChange={e => setNewAddrDistrict(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                      >
                        {[
                          'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
                          'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
                          'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
                          'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
                          'Monaragala', 'Ratnapura', 'Kegalle'
                        ].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Postcode / ZIP */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Postcode / ZIP</label>
                      <input
                        type="text"
                        placeholder="e.g. 80000"
                        value={newAddrPostal}
                        onChange={e => setNewAddrPostal(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>

                    {/* Address Label */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address Label</label>
                      <select
                        value={newAddrLabel}
                        onChange={e => setNewAddrLabel(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddAddress(false);
                        setEditingAddressIndex(null);
                      }}
                      className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-black rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addrSaving}
                      className="px-6 py-2.5 bg-black hover:bg-gray-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      {addrSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {editingAddressIndex !== null ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {addresses.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
                <MapPin size={44} className="mx-auto text-gray-300 mb-3" />
                <h3 className="font-black text-gray-900 text-lg uppercase mb-1">No saved addresses</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">Add your delivery address to speed up your checkout process.</p>
                <button
                  onClick={handleOpenAddAddress}
                  className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-900 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} /> Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {addresses.map((addr, idx) => (
                  <div key={`${addr.label}-${addr.street}-${idx}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 ring-1 ring-gray-100/60 relative group hover:border-gray-400 transition-all">
                    {addr.isDefault && (
                      <div className="absolute top-4 right-4 bg-black text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                        Default
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {addr.label || 'Address'}
                      </span>
                    </div>

                    {/* Name & Phone */}
                    <p className="text-sm text-gray-900 font-bold mb-1">
                      {addr.firstName || addr.lastName ? `${addr.firstName || ''} ${addr.lastName || ''}`.trim() : displayName}
                      {(addr.phone || mongoUser?.phone) && (
                        <span className="text-gray-500 font-medium"> • {addr.phone || mongoUser?.phone}</span>
                      )}
                    </p>

                    {/* Email */}
                    {(addr.email || userEmail) && (
                      <p className="text-xs text-gray-500 mb-2">{addr.email || userEmail}</p>
                    )}

                    {/* Street, Town/City, District, Zip */}
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      {addr.street}<br />
                      {addr.city}, {addr.district || addr.province || 'Sri Lanka'} {addr.postalCode ? `(${addr.postalCode})` : ''}
                    </p>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEditAddress(idx)}
                        className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} /> Edit Address
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">Account Settings</h2>

            {/* Personal Information Form */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-lg font-black text-gray-900">Personal Information</h3>

                {/* Avatar change in settings */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                    {userAvatar ? (
                      <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                        {displayName[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-[#1cd75b] hover:underline"
                  >
                    Upload Photo
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <Check size={16} /> Profile details saved successfully to database!
                </div>
              )}

              {saveError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} /> {saveError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Managed via Firebase Authentication.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="077 123 4567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 text-sm"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#1cd75b] text-black font-black uppercase tracking-wider py-3 px-8 rounded-xl hover:bg-[#18c251] transition-colors shadow-lg flex items-center gap-2 text-xs disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Password Section */}
              <h3 className="text-lg font-black text-gray-900 mb-6 border-b border-gray-100 pb-4 mt-12 pt-4">Change Password</h3>

              {pwSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <Check size={16} /> Password updated successfully!
                </div>
              )}

              {pwError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} /> {pwError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Current Password</label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="bg-black text-white font-black uppercase tracking-wider py-3 px-8 rounded-xl hover:bg-gray-800 transition-colors text-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {pwSaving ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">My Account</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden  top-32">
              <nav className="flex flex-col">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-3 p-4 text-left transition-colors border-l-4 ${activeTab === 'dashboard' ? 'border-gray-900 bg-gray-50 text-gray-900 font-bold' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
                >
                  <User size={18} /> Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-3 p-4 text-left transition-colors border-l-4 border-t border-t-gray-100 ${activeTab === 'orders' ? 'border-l-gray-900 bg-gray-50 text-gray-900 font-bold' : 'border-l-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
                >
                  <ShoppingBag size={18} /> My Orders
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`flex items-center justify-between p-4 text-left transition-colors border-l-4 border-t border-t-gray-100 ${activeTab === 'rewards' ? 'border-l-amber-500 bg-amber-50/50 text-amber-900 font-bold' : 'border-l-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
                >
                  <div className="flex items-center gap-3">
                    <Coins size={18} className={activeTab === 'rewards' ? 'text-amber-600' : 'text-amber-500'} />
                    <span>Reward Points</span>
                  </div>
                  <span className="text-[10px] font-black bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded-full">
                    {mongoUser?.points !== undefined ? mongoUser.points : 100}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`flex items-center gap-3 p-4 text-left transition-colors border-l-4 border-t border-t-gray-100 ${activeTab === 'addresses' ? 'border-l-gray-900 bg-gray-50 text-gray-900 font-bold' : 'border-l-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
                >
                  <MapPin size={18} /> Saved Addresses
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-3 p-4 text-left transition-colors border-l-4 border-t border-t-gray-100 ${activeTab === 'settings' ? 'border-l-gray-900 bg-gray-50 text-gray-900 font-bold' : 'border-l-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
                >
                  <Settings size={18} /> Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-4 text-left transition-colors border-l-4 border-t border-t-gray-100 border-l-transparent text-red-500 hover:bg-red-50 font-bold"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>

        </div>
      </div>
    </div>
  );
}
