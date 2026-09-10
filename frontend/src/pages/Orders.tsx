import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, ChevronRight, CheckCircle2, Clock, Truck, CreditCard, Filter, Loader2
} from 'lucide-react';
import { formatLKR } from '../data';
import { getMyOrders, ApiOrder } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type OrderStatus = 'All' | 'Processing' | 'Delivered' | 'Pending' | 'Cancelled';

export default function Orders() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('All');
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredOrders = activeFilter === 'All' 
    ? orders 
    : orders.filter(order => order.status === activeFilter);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Delivered': return { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 size={16} /> };
      case 'Processing': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Clock size={16} /> };
      case 'Pending': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock size={16} /> };
      case 'Cancelled': return { bg: 'bg-red-100', text: 'text-red-700', icon: <CreditCard size={16} /> };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: <Package size={16} /> };
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <Package size={28} /> My Orders
          </h1>
          <div className="flex items-center gap-2 text-sm font-bold">
            <Link to="/" className="text-gray-400 hover:text-black transition-colors">Home</Link>
            <ChevronRight size={16} className="text-gray-300" />
            <Link to="/profile" className="text-gray-400 hover:text-black transition-colors">Profile</Link>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-[#1cd75b]">Orders</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar">
          {(['All', 'Processing', 'Delivered', 'Pending', 'Cancelled'] as OrderStatus[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeFilter === filter 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filter === 'All' && <Filter size={14} />}
              {filter === 'Processing' && <Truck size={14} />}
              {filter === 'Delivered' && <CheckCircle2 size={14} />}
              {filter === 'Pending' && <Clock size={14} />}
              {filter}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
              <Loader2 size={36} className="animate-spin text-[#1cd75b] mb-3" />
              <p className="text-sm font-bold text-gray-500">Loading your real orders from database...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
              <Package size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} orders found
              </h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                You have not placed any {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} orders yet. Browse our selection of PC components and hardware!
              </p>
              <Link 
                to="/shop" 
                className="mt-6 px-6 py-2.5 bg-[#1cd75b] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#18c251] transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const firstItem = order.items?.[0];
              
              return (
                <div key={order.orderNumber || order.id || order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-full sm:w-40 h-40 sm:h-auto bg-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
                    {firstItem?.image ? (
                      <img src={firstItem.image} alt={firstItem.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={36} className="text-gray-400" />
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-black text-gray-900">{order.orderNumber}</h3>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.icon} {order.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'} • <span className="font-black text-gray-900">{formatLKR(order.total)}</span>
                      </p>
                      {firstItem && (
                        <p className="text-xs text-gray-500 truncate">
                          {firstItem.name} {order.items?.length > 1 ? `+ ${order.items.length - 1} more` : ''}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => navigate(`/track?id=${order.orderNumber}`)}
                        className="bg-[#1cd75b] text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#18c251] transition-colors flex items-center gap-2"
                      >
                        <Truck size={15} /> Track Order
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
