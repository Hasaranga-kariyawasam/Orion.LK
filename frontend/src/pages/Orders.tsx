import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, ChevronRight, CheckCircle2, Clock, Truck, CreditCard, Filter
} from 'lucide-react';
import { formatLKR } from '../data';

type OrderStatus = 'All' | 'Completed' | 'Processing' | 'Unpaid';

export default function Orders() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('All');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Comprehensive mock order history
  const allOrders = [
    {
      id: 'ORD-892102',
      date: '2024-03-15',
      total: 125000,
      status: 'Completed',
      items: 1,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80',
    },
    {
      id: 'ORD-746291',
      date: '2024-03-10',
      total: 45000,
      status: 'Processing',
      items: 2,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',
    },
    {
      id: 'ORD-930214',
      date: '2024-03-08',
      total: 15500,
      status: 'Unpaid',
      items: 1,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&q=80',
    },
    {
      id: 'ORD-543981',
      date: '2023-11-10',
      total: 8500,
      status: 'Completed',
      items: 3,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&q=80',
    }
  ];

  const filteredOrders = activeFilter === 'All' 
    ? allOrders 
    : allOrders.filter(order => order.status === activeFilter);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Completed': return { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 size={16} /> };
      case 'Processing': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Clock size={16} /> };
      case 'Unpaid': return { bg: 'bg-red-100', text: 'text-red-700', icon: <CreditCard size={16} /> };
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
            <span className="text-red-500">Orders</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar">
          {(['All', 'Processing', 'Completed', 'Unpaid'] as OrderStatus[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeFilter === filter 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filter === 'All' && <Filter size={16} />}
              {filter === 'Processing' && <Truck size={16} />}
              {filter === 'Completed' && <CheckCircle2 size={16} />}
              {filter === 'Unpaid' && <CreditCard size={16} />}
              {filter}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
              <Package size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} orders found</h3>
              <p className="text-gray-500 text-sm">When you place orders, they will appear here.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-full sm:w-40 h-40 sm:h-auto bg-gray-100 shrink-0">
                    <img src={order.image} alt={order.id} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-black text-gray-900">{order.id}</h3>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.icon} {order.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-500">
                          {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {order.items} {order.items === 1 ? 'Item' : 'Items'} • <span className="font-black text-gray-900">{formatLKR(order.total)}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
                      {order.status === 'Unpaid' ? (
                        <button 
                          onClick={() => navigate('/payment')}
                          className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold uppercase hover:bg-gray-900 transition-colors flex items-center gap-2"
                        >
                          <CreditCard size={16} /> Pay Now
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate(`/track?id=${order.id}`)}
                          className="bg-[#1cd75b] text-black px-5 py-2.5 rounded-xl text-sm font-bold uppercase hover:bg-[#18c251] transition-colors flex items-center gap-2"
                        >
                          <Truck size={16} /> Track Order
                        </button>
                      )}
                      <button className="bg-white text-gray-900 border-2 border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold uppercase hover:border-black transition-colors">
                        View Details
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
