import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Package, MapPin, Settings, LogOut, ChevronRight, 
  ShoppingBag, Edit2, CheckCircle2, Clock, Heart 
} from 'lucide-react';
import { formatLKR } from '../data';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'addresses' | 'settings'>('dashboard');
  const navigate = useNavigate();
  const { wishlist, cart } = useShop();
  const { user, logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Real user data from Firebase
  const displayName = user?.displayName || 'User';
  const userEmail = user?.email || '';
  const userAvatar = user?.photoURL || null;

  // Mock Orders Data
  const mockOrders = [
    {
      id: 'ORD-746291',
      date: '2024-03-15',
      total: 45000,
      status: 'Processing',
      items: 2,
    },
    {
      id: 'ORD-892102',
      date: '2024-02-28',
      total: 125000,
      status: 'Delivered',
      items: 1,
    },
    {
      id: 'ORD-543981',
      date: '2023-11-10',
      total: 8500,
      status: 'Delivered',
      items: 3,
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <User size={32} className="text-gray-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Hass Kariyawasam</h2>
                  <p className="text-gray-500">hass.kariyawasam@gmail.com</p>
                </div>
              </div>
              <button onClick={() => setActiveTab('settings')} className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
                <Edit2 size={16} /> Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:border-black transition-colors cursor-pointer" onClick={() => navigate('/orders')}>
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                  <Package size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">3 Orders</h3>
                <p className="text-sm text-gray-500">View past purchases</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:border-black transition-colors cursor-pointer" onClick={() => setActiveTab('addresses')}>
                <div className="w-12 h-12 bg-green-50 text-[#1cd75b] rounded-full flex items-center justify-center mb-3">
                  <MapPin size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">1 Address</h3>
                <p className="text-sm text-gray-500">Manage shipping info</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:border-black transition-colors cursor-pointer" onClick={() => navigate('/shop')}>
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
                  <Heart size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{wishlist.length} Wishlist</h3>
                <p className="text-sm text-gray-500">Saved for later</p>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 uppercase">Recent Orders</h3>
                <button onClick={() => navigate('/orders')} className="text-sm font-bold text-gray-500 hover:text-black flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="space-y-4">
                {mockOrders.slice(0, 2).map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${order.status === 'Delivered' ? 'bg-green-100 text-green-500' : 'bg-blue-100 text-blue-500'}`}>
                        {order.status === 'Delivered' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{order.id}</h4>
                        <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()} • {order.items} items</p>
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
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">My Orders</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-5 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-2">Order ID & Date</div>
                <div>Status</div>
                <div>Items</div>
                <div className="text-right">Total</div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {mockOrders.map((order) => (
                  <div key={order.id} className="flex flex-col md:grid md:grid-cols-5 gap-4 p-4 md:p-6 items-start md:items-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="col-span-2 flex flex-col w-full md:w-auto">
                      <div className="flex justify-between items-center md:block">
                        <span className="font-bold text-gray-900">{order.id}</span>
                        <span className="md:hidden font-black text-gray-900">{formatLKR(order.total)}</span>
                      </div>
                      <span className="text-sm text-gray-500 mt-1">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div>
                      <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-gray-500 font-medium text-sm hidden md:block">
                      {order.items} Items
                    </div>
                    <div className="text-right font-black text-gray-900 hidden md:block">
                      {formatLKR(order.total)}
                    </div>
                    {/* Mobile details footer */}
                    <div className="flex items-center justify-between w-full md:hidden mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{order.items} Items</span>
                      <button className="text-xs font-bold text-black flex items-center gap-1">Details <ChevronRight size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Saved Addresses</h2>
              <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold uppercase hover:bg-gray-900 transition-colors">
                + Add New
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-900 relative">
                <div className="absolute top-4 right-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">
                  Default
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-1">Home</h3>
                <p className="text-sm text-gray-900 font-bold mb-4">Hass K • 077 123 4567</p>
                <p className="text-sm text-gray-600 leading-relaxed max-w-[200px]">
                  123 Tech Park, Galle Road,<br/>
                  Colombo 03,<br/>
                  Colombo
                </p>
                <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100">
                  <button className="text-sm font-bold text-gray-900 hover:text-red-500 transition-colors">Edit</button>
                  <button className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">Account Settings</h2>
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
              <h3 className="text-lg font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Personal Information</h3>
              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">First Name</label>
                    <input type="text" defaultValue="Hass" className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Last Name</label>
                    <input type="text" defaultValue="Kariyawasam" className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Email Address</label>
                  <input type="email" defaultValue="hass.kariyawasam@gmail.com" className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Phone Number</label>
                  <input type="tel" defaultValue="077 123 4567" className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" />
                </div>
                
                <h3 className="text-lg font-black text-gray-900 mb-6 border-b border-gray-100 pb-4 mt-10 pt-4">Change Password</h3>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-8 flex justify-end">
                  <button type="button" className="bg-[#1cd75b] text-black font-black uppercase tracking-wider py-3 px-8 rounded-xl hover:bg-[#18c251] transition-colors shadow-lg">
                    Save Changes
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-32">
              <nav className="flex flex-col">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-3 p-4 text-left transition-colors border-l-4 ${activeTab === 'dashboard' ? 'border-gray-900 bg-gray-50 text-gray-900 font-bold' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
                >
                  <User size={18} /> Dashboard
                </button>
                <button 
                  onClick={() => navigate('/orders')}
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
