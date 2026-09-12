import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, ChevronRight, CheckCircle2, Clock, Truck,
  CreditCard, Filter, Loader2, XCircle, Settings,
  ShoppingBag, Heart, ArrowRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatLKR } from '../data';
import { getMyOrders, ApiOrder } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type OrderFilter = 'All' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

const STATUS_CONFIG: Record<string, { gradient: string; text: string; border: string; bg: string; icon: React.ReactNode }> = {
  Delivered:  { gradient: 'from-emerald-500 to-green-600', text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: <CheckCircle2 size={12} /> },
  Processing: { gradient: 'from-blue-500 to-indigo-600',   text: 'text-blue-400',    border: 'border-blue-500/30',    bg: 'bg-blue-500/10',    icon: <Settings size={12} /> },
  Pending:    { gradient: 'from-amber-500 to-orange-500',  text: 'text-amber-400',   border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   icon: <Clock size={12} /> },
  Shipped:    { gradient: 'from-purple-500 to-violet-600', text: 'text-purple-400',  border: 'border-purple-500/30',  bg: 'bg-purple-500/10',  icon: <Truck size={12} /> },
  Cancelled:  { gradient: 'from-red-500 to-rose-600',      text: 'text-red-400',     border: 'border-red-500/30',     bg: 'bg-red-500/10',     icon: <XCircle size={12} /> },
};

const STATUS_SEQUENCE = ['Pending', 'Processing', 'Shipped', 'Delivered'];
function getProgress(status: string): number {
  const idx = STATUS_SEQUENCE.indexOf(status);
  if (idx === -1) return 0;
  return ((idx + 1) / STATUS_SEQUENCE.length) * 100;
}

const FILTERS: OrderFilter[] = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function Orders() {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('All');
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetch = async () => {
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
    fetch();
  }, [user]);

  const filteredOrders = activeFilter === 'All'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'All' ? orders.length : orders.filter(o => o.status === f).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-[#0D1117] min-h-screen pb-20">

      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Package size={22} className="text-[#ea364c]" />
            My Orders
          </h1>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-700" />
            <Link to="/profile" className="hover:text-white transition-colors">Profile</Link>
            <ChevronRight size={12} className="text-gray-700" />
            <span className="text-[#ea364c]">Orders</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">

        {/* Stats summary */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {(['Pending', 'Processing', 'Shipped', 'Delivered'] as OrderFilter[]).map(s => {
              const cfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => setActiveFilter(s)}
                  className={`bg-white/[0.02] border rounded-xl p-3 text-left hover:bg-white/[0.04] transition-all ${activeFilter === s ? `${cfg.border} ${cfg.bg}` : 'border-white/6'}`}
                >
                  <p className={`text-lg font-black ${cfg.text}`}>{counts[s]}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{s}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {FILTERS.map(f => {
            const cfg = STATUS_CONFIG[f];
            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isActive
                    ? f === 'All'
                      ? 'bg-white text-gray-900 border-white'
                      : `${cfg.bg} ${cfg.text} ${cfg.border}`
                    : 'bg-white/[0.03] text-gray-500 border-white/8 hover:text-white hover:border-white/20'
                }`}
              >
                {f !== 'All' && cfg.icon}
                {f}
                {counts[f] > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive && f !== 'All' ? `${cfg.bg} ${cfg.text}` : 'bg-white/8 text-gray-500'}`}>
                    {counts[f]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white/[0.02] border border-white/6 rounded-2xl p-14 flex flex-col items-center">
              <Loader2 size={32} className="animate-spin text-[#ea364c] mb-3" />
              <p className="text-sm font-bold text-gray-500">Loading your orders…</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/6 rounded-2xl p-14 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
                <Package size={28} className="text-gray-600" />
              </div>
              <h3 className="text-base font-black text-white mb-1.5 uppercase">No {activeFilter !== 'All' ? activeFilter : ''} orders</h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                {activeFilter === 'All'
                  ? "You haven't placed any orders yet. Browse our catalog!"
                  : `You have no ${activeFilter.toLowerCase()} orders.`}
              </p>
              <Link
                to="/shop"
                className="bg-[#ea364c] text-white font-black text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl hover:bg-[#c42d3f] transition-colors shadow-lg shadow-[#ea364c]/25 flex items-center gap-2"
              >
                <ShoppingBag size={14} /> Browse Catalog
              </Link>
            </div>
          ) : (
            filteredOrders.map((order, idx) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
              const firstItem = order.items?.[0];
              const progress = getProgress(order.status);

              return (
                <motion.div
                  key={order.orderNumber || order.id || order._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-white/[0.02] border border-white/6 rounded-2xl overflow-hidden hover:border-white/12 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Product image */}
                    <div className="w-full sm:w-28 h-28 bg-white/3 shrink-0 flex items-center justify-center overflow-hidden">
                      {firstItem?.image ? (
                        <img src={firstItem.image} alt={firstItem.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={28} className="text-gray-700" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-black text-white font-mono">{order.orderNumber}</h3>
                            <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.text} ${cfg.bg} ${cfg.border}`}>
                              {cfg.icon} {order.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <p className="text-base font-black text-white shrink-0">{formatLKR(order.total)}</p>
                      </div>

                      {/* Items summary */}
                      <p className="text-xs text-gray-500 mb-3 truncate">
                        {firstItem?.name}
                        {order.items?.length > 1 && <span className="text-gray-600"> +{order.items.length - 1} more</span>}
                        <span className="text-gray-600"> · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
                      </p>

                      {/* Progress bar (not for cancelled) */}
                      {order.status !== 'Cancelled' && (
                        <div className="mb-3">
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-700`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            {STATUS_SEQUENCE.map((s, i) => (
                              <span
                                key={s}
                                className={`text-[8px] font-bold uppercase ${i < STATUS_SEQUENCE.indexOf(order.status) + 1 ? cfg.text : 'text-gray-700'}`}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => navigate(`/track?id=${order.orderNumber}`)}
                          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-lg transition-all ${cfg.bg} ${cfg.text} ${cfg.border} border hover:brightness-110`}
                        >
                          <Truck size={12} /> Track Order <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
