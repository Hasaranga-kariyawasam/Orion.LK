import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Truck, MapPin, Package, CheckCircle2, ChevronRight,
  Settings, AlertCircle, RefreshCw, ShoppingBag, Clock,
  XCircle, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getOrderByNumber, ApiOrder } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatLKR } from '../data';

// ── Status timeline config ─────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'Pending',    label: 'Order Placed',      icon: Package,      desc: 'Your order has been received.' },
  { key: 'Processing', label: 'Processing',         icon: Settings,     desc: 'We\'re preparing your items.' },
  { key: 'Shipped',    label: 'Shipped',             icon: Truck,        desc: 'Your order is on its way.' },
  { key: 'Shipped',    label: 'Out for Delivery',    icon: MapPin,       desc: 'Your order is nearby.' },
  { key: 'Delivered',  label: 'Delivered',           icon: CheckCircle2, desc: 'Successfully delivered!' },
] as const;

function getCompletedSteps(status: ApiOrder['status']): number {
  switch (status) {
    case 'Pending':    return 1;
    case 'Processing': return 2;
    case 'Shipped':    return 3;
    case 'Delivered':  return 5;
    case 'Cancelled':  return 0;
    default:           return 1;
  }
}

const statusColors: Record<string, string> = {
  Pending:    'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Shipped:    'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Delivered:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Cancelled:  'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';
  const { user } = useAuth();

  const [orderId, setOrderId] = useState(queryId);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const fetchOrder = useCallback(async (id: string, silent = false) => {
    if (!id.trim()) { setError('Please enter a valid Order ID'); return; }
    if (!silent) { setIsTracking(true); setOrder(null); setError(''); }
    try {
      const found = await getOrderByNumber(id.trim().toUpperCase());
      if (found) {
        setOrder(found);
        setError('');
        setLastRefreshed(new Date());
      } else {
        if (!silent) setError('Order not found. Please verify your Order ID and try again.');
      }
    } catch {
      if (!silent) setError('Failed to fetch order. Please try again.');
    } finally {
      if (!silent) setIsTracking(false);
    }
  }, []);

  // Auto-track when coming from Orders page
  useEffect(() => {
    if (queryId && user) fetchOrder(queryId);
  }, [queryId, user, fetchOrder]);

  // Auto-refresh every 30s for active orders
  useEffect(() => {
    if (!order || order.status === 'Delivered' || order.status === 'Cancelled') return;
    const interval = setInterval(() => fetchOrder(order.orderNumber, true), 30000);
    return () => clearInterval(interval);
  }, [order, fetchOrder]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderId);
  };

  const completedSteps = order ? getCompletedSteps(order.status) : 0;
  const isCancelled = order?.status === 'Cancelled';

  return (
    <div className="bg-[#0D1117] min-h-screen pb-20">

      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Truck size={22} className="text-[#ea364c]" />
            Track Your Order
          </h1>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-700" />
            <Link to="/orders" className="hover:text-white transition-colors">Orders</Link>
            <ChevronRight size={12} className="text-gray-700" />
            <span className="text-[#ea364c]">Track</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">

        {/* Search bar */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#ea364c]/5 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#ea364c]/10 border border-[#ea364c]/20 flex items-center justify-center">
                <MapPin size={18} className="text-[#ea364c]" />
              </div>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wide">Where is my order?</h2>
                <p className="text-xs text-gray-500">Enter your Order ID for real-time tracking</p>
              </div>
            </div>

            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mt-5">
              <input
                type="text"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="e.g. ORD-123456"
                className="flex-1 bg-white/5 border border-white/10 focus:border-[#ea364c]/50 focus:ring-1 focus:ring-[#ea364c]/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 font-mono text-sm outline-none transition-all uppercase"
              />
              <button
                type="submit"
                disabled={isTracking}
                className="bg-[#ea364c] hover:bg-[#c42d3f] text-white font-black uppercase tracking-wider py-3 px-7 rounded-xl transition-all shadow-lg shadow-[#ea364c]/25 disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isTracking ? (
                  <><RefreshCw size={15} className="animate-spin" /> Searching...</>
                ) : (
                  <><ArrowRight size={15} /> Track Now</>
                )}
              </button>
            </form>

            {error && (
              <p className="text-red-400 text-xs font-bold mt-3 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            {!user && (
              <p className="text-amber-400/80 text-xs mt-3 flex items-center gap-2">
                <AlertCircle size={13} />
                <span>You must be <Link to="/login" className="underline">signed in</Link> to track your orders.</span>
              </p>
            )}
          </div>
        </div>

        {/* Tracking result */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Order header card */}
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                <div className="p-5 md:p-6 border-b border-white/6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Order Number</p>
                    <p className="text-xl font-black text-white font-mono">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border ${statusColors[order.status] || statusColors.Pending}`}>
                      {order.status === 'Delivered' && <CheckCircle2 size={11} />}
                      {order.status === 'Cancelled' && <XCircle size={11} />}
                      {order.status === 'Shipped' && <Truck size={11} />}
                      {order.status === 'Processing' && <Settings size={11} />}
                      {order.status === 'Pending' && <Clock size={11} />}
                      {order.status}
                    </span>
                    {lastRefreshed && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <button
                        onClick={() => fetchOrder(order.orderNumber)}
                        className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        <RefreshCw size={10} />
                        Refreshed {lastRefreshed.toLocaleTimeString()}
                      </button>
                    )}
                  </div>
                </div>

                {/* Items preview */}
                <div className="p-5 md:p-6 border-b border-white/6">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">
                    Items ({order.items.length})
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/8 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag size={14} className="text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-500">Qty: {item.quantity} · {formatLKR(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals + address */}
                <div className="p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Ship to</p>
                    <p className="text-xs text-gray-300 font-bold">{order.shippingAddress.name}</p>
                    <p className="text-xs text-gray-500">{order.shippingAddress.street}</p>
                    <p className="text-xs text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                    <p className="text-xs text-gray-500">{order.shippingAddress.phone}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Order Total</p>
                    <p className="text-xl font-black text-white">{formatLKR(order.total)}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {!isCancelled ? (
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 md:p-8">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Shipment Progress</p>

                  {/* Progress bar */}
                  <div className="mb-8">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedSteps / STATUS_STEPS.length) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#ea364c] to-[#ff6b35]"
                        style={{ boxShadow: '0 0 8px rgba(234,54,76,0.5)' }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-gray-600">Order Placed</span>
                      <span className="text-[9px] text-gray-600">Delivered</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="relative">
                    <div className="absolute left-5 top-5 bottom-5 w-px bg-white/5" />
                    <div className="space-y-6">
                      {STATUS_STEPS.map((step, index) => {
                        const done = index < completedSteps;
                        const active = index === completedSteps - 1;
                        const Icon = step.icon;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="relative flex items-start gap-5"
                          >
                            {/* Icon bubble */}
                            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 z-10 transition-all ${
                              done
                                ? active
                                  ? 'bg-[#ea364c] border-[#ea364c] shadow-lg shadow-[#ea364c]/40'
                                  : 'bg-[#ea364c]/80 border-[#ea364c]/60'
                                : 'bg-white/3 border-white/10'
                            }`}>
                              <Icon size={16} className={done ? 'text-white' : 'text-gray-600'} />
                              {active && (
                                <div className="absolute inset-0 rounded-full bg-[#ea364c]/30 animate-ping" />
                              )}
                            </div>

                            {/* Text */}
                            <div className="pt-2">
                              <h4 className={`text-sm font-black uppercase tracking-wide ${done ? 'text-white' : 'text-gray-600'}`}>
                                {step.label}
                                {active && <span className="ml-2 text-[9px] font-black text-[#ea364c] bg-[#ea364c]/10 border border-[#ea364c]/20 px-2 py-0.5 rounded-full">Current</span>}
                              </h4>
                              <p className={`text-[11px] mt-0.5 ${done ? 'text-gray-400' : 'text-gray-600'}`}>{step.desc}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center">
                  <XCircle size={36} className="text-red-400 mx-auto mb-3" />
                  <h3 className="text-base font-black text-red-400 uppercase">Order Cancelled</h3>
                  <p className="text-xs text-gray-500 mt-1">This order was cancelled. Contact support if you need help.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
