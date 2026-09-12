import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Package, MapPin, Settings, LogOut, ChevronRight,
  ShoppingBag, Edit2, CheckCircle2, Clock, Heart, Camera,
  Loader2, Plus, Trash2, AlertCircle, Save, Check
} from 'lucide-react';
import { formatLKR } from '../data';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { getMyOrders, ApiOrder, MongoAddress, formatAvatarUrl } from '../lib/api';
import { updatePassword, auth } from '../lib/firebase';

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'addresses' | 'settings'>('dashboard');
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Settings Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  // Address Form States
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrProvince, setNewAddrProvince] = useState('');
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

    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }

    setPwSaving(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPwSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwSuccess(false), 3000);
      }
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setPwError('For security, please log out and log back in before changing your password.');
      } else {
        setPwError(err.message || 'Failed to change password.');
      }
    } finally {
      setPwSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet || !newAddrCity) return;

    setAddrSaving(true);
    try {
      const currentAddresses = mongoUser?.addresses || [];
      const newAddress: MongoAddress = {
        label: newAddrLabel,
        street: newAddrStreet,
        city: newAddrCity,
        province: newAddrProvince,
        postalCode: newAddrPostal,
        isDefault: currentAddresses.length === 0,
      };

      await updateMongoProfile({
        addresses: [...currentAddresses, newAddress],
      });

      setShowAddAddress(false);
      setNewAddrStreet('');
      setNewAddrCity('');
      setNewAddrProvince('');
      setNewAddrPostal('');
    } catch (err) {
      console.error('Failed to add address:', err);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-sm text-gray-500">View purchase history</p>
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
                <div className="space-y-4">
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
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">My Orders</h2>

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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="hidden md:grid grid-cols-5 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2">Order ID & Date</div>
                  <div>Status</div>
                  <div>Items</div>
                  <div className="text-right">Total</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <div key={order.orderNumber || order.id || order._id} className="flex flex-col md:grid md:grid-cols-5 gap-4 p-4 md:p-6 items-start md:items-center hover:bg-gray-50 transition-colors">
                      <div className="col-span-2 flex flex-col w-full md:w-auto">
                        <div className="flex justify-between items-center md:block">
                          <span className="font-bold text-gray-900">{order.orderNumber}</span>
                          <span className="md:hidden font-black text-gray-900">{formatLKR(order.total)}</span>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-gray-500 font-medium text-sm hidden md:block">
                        {order.items?.length || 0} Items
                      </div>
                      <div className="text-right font-black text-gray-900 hidden md:block">
                        {formatLKR(order.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Saved Addresses</h2>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-900 transition-colors flex items-center gap-1.5"
              >
                <Plus size={14} /> {showAddAddress ? 'Cancel' : 'Add New'}
              </button>
            </div>

            {/* Add Address Form Modal / Inline */}
            {showAddAddress && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="font-bold text-gray-900 mb-4">Add Shipping Address</h3>
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address Label</label>
                      <select
                        value={newAddrLabel}
                        onChange={e => setNewAddrLabel(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white outline-none"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Street Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="123 Galle Road"
                        value={newAddrStreet}
                        onChange={e => setNewAddrStreet(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City *</label>
                      <input
                        type="text"
                        required
                        placeholder="Colombo 03"
                        value={newAddrCity}
                        onChange={e => setNewAddrCity(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Province</label>
                      <input
                        type="text"
                        placeholder="Western Province"
                        value={newAddrProvince}
                        onChange={e => setNewAddrProvince(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Postal Code</label>
                      <input
                        type="text"
                        placeholder="00300"
                        value={newAddrPostal}
                        onChange={e => setNewAddrPostal(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addrSaving}
                      className="px-5 py-2 bg-[#1cd75b] text-black text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#18c251] transition-colors flex items-center gap-1.5"
                    >
                      {addrSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            )}

            {addresses.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center">
                <MapPin size={40} className="mx-auto text-gray-300 mb-2" />
                <h3 className="font-bold text-gray-900">No saved addresses</h3>
                <p className="text-xs text-gray-500 mt-1">Add an address to speed up your checkout process.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative group">
                    {addr.isDefault && (
                      <div className="absolute top-4 right-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">
                        Default
                      </div>
                    )}
                    <h3 className="font-black text-gray-900 text-lg mb-1">{addr.label}</h3>
                    <p className="text-sm text-gray-900 font-bold mb-3">{displayName} • {mongoUser?.phone || 'No phone'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {addr.street}<br />
                      {addr.city}{addr.province ? `, ${addr.province}` : ''}<br />
                      {addr.postalCode}
                    </p>
                    <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
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
