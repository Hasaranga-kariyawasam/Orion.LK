import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, ChevronRight, CheckCircle2, Clock, Truck,
  Filter, Loader2, XCircle, Settings,
  ShoppingBag, ArrowRight, Sparkles, Check, Star, RefreshCw,
  X, MapPin, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatLKR } from '../data';
import { getMyOrders, cancelMyOrder, ApiOrder, OrderItem } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

type OrderFilter = 'All' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

const STATUS_CONFIG: Record<string, { text: string; border: string; bg: string; icon: React.ReactNode }> = {
  Delivered:  { text: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50', icon: <CheckCircle2 size={12} /> },
  Processing: { text: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50', icon: <Settings size={12} /> },
  Pending:    { text: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50', icon: <Clock size={12} /> },
  Shipped:    { text: 'text-teal-700', border: 'border-teal-200', bg: 'bg-teal-50', icon: <Truck size={12} /> },
  Cancelled:  { text: 'text-red-700', border: 'border-red-200', bg: 'bg-red-50', icon: <XCircle size={12} /> },
};

const ORDER_STEPS = [
  { step: 1, label: 'PENDING', key: 'Pending' },
  { step: 2, label: 'PROCESSING', key: 'Processing' },
  { step: 3, label: 'SHIPPED', key: 'Shipped' },
  { step: 4, label: 'DELIVERED', key: 'Delivered' },
];

function getStepIndex(status: string): number {
  switch (status) {
    case 'Pending': return 1;
    case 'Processing': return 2;
    case 'Shipped': return 3;
    case 'Delivered': return 4;
    default: return 0;
  }
}

const FILTERS: OrderFilter[] = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

interface ReviewModalState {
  isOpen: boolean;
  item: OrderItem | null;
  orderNumber: string;
}

export default function Orders() {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('All');
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  // Review Modal State
  const [reviewModal, setReviewModal] = useState<ReviewModalState>({
    isOpen: false,
    item: null,
    orderNumber: '',
  });
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [submittedReviews, setSubmittedReviews] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('user_submitted_reviews') || '{}');
    } catch {
      return {};
    }
  });

  const navigate = useNavigate();
  const { user, mongoUser, refreshProfile } = useAuth();
  const { addNotification } = useShop();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const loadOrders = async (isManualRefresh = false) => {
    if (!user) { setLoading(false); return; }
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getMyOrders();
      setOrders(data);
      const snapshotKey = `customer_order_statuses_${user.uid}`;
      const previous: Record<string, string> = JSON.parse(localStorage.getItem(snapshotKey) || '{}');
      const next: Record<string, string> = {};
      data.forEach(order => {
        const id = order.id || order._id || order.orderNumber;
        next[id] = order.status;
        if (previous[id] && previous[id] !== order.status) {
          addNotification(
            `Order ${order.status}`,
            `${order.orderNumber} status changed from ${previous[id]} to ${order.status}.`
          );
        }
      });
      localStorage.setItem(snapshotKey, JSON.stringify(next));
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrderIds(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string, pointsUsed: number = 0) => {
    const confirmMsg = pointsUsed > 0
      ? `Are you sure you want to cancel order ${orderNumber}? The ${pointsUsed} reward points you redeemed will be automatically refunded to your account.`
      : `Are you sure you want to cancel order ${orderNumber}?`;

    if (!window.confirm(confirmMsg)) return;

    setCancellingId(orderId);
    try {
      await cancelMyOrder(orderId);
      setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId || o.orderNumber === orderNumber) ? { ...o, status: 'Cancelled' } : o));
      await refreshProfile();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  // Open Review Modal
  const openReviewModal = (item: OrderItem, orderNumber: string) => {
    setReviewModal({
      isOpen: true,
      item,
      orderNumber,
    });
    setRating(5);
    setReviewComment('');
    setReviewerName(mongoUser?.name || user?.displayName || 'Customer');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal.item) return;

    setReviewSubmitting(true);
    try {
      const reviewKey = `${reviewModal.orderNumber}_${reviewModal.item.productId}`;
      const newReview = {
        id: `rev_${Date.now()}`,
        name: reviewerName.trim() || 'Verified Customer',
        rating,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        comment: reviewComment.trim(),
        productName: reviewModal.item.name,
      };

      // Store in localStorage for product detail & order state
      const productReviewsKey = `reviews_${reviewModal.item.productId}`;
      const existingReviews = JSON.parse(localStorage.getItem(productReviewsKey) || '[]');
      localStorage.setItem(productReviewsKey, JSON.stringify([newReview, ...existingReviews]));

      const nextSubmitted = { ...submittedReviews, [reviewKey]: true };
      setSubmittedReviews(nextSubmitted);
      localStorage.setItem('user_submitted_reviews', JSON.stringify(nextSubmitted));

      setReviewModal({ isOpen: false, item: null, orderNumber: '' });
      addNotification('Review Published', `Thank you for reviewing ${reviewModal.item.name}!`);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filteredOrders = activeFilter === 'All'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'All' ? orders.length : orders.filter(o => o.status === f).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">

      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <Package size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">
                My Orders
              </h1>
              <p className="text-xs text-gray-500">Track shipments, view purchases, and review products</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadOrders(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              title="Refresh order statuses"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
              <Link to="/" className="hover:text-black transition-colors">Home</Link>
              <ChevronRight size={12} className="text-gray-300" />
              <Link to="/profile" className="hover:text-black transition-colors">Profile</Link>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-black">Orders</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">

        {/* Stats summary */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {(['Pending', 'Processing', 'Shipped', 'Delivered'] as OrderFilter[]).map(s => {
              const cfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => setActiveFilter(s)}
                  className={`bg-white border rounded-xl p-3 text-left hover:border-gray-400 transition-all cursor-pointer ${activeFilter === s ? 'border-black ring-1 ring-black' : 'border-gray-200'}`}
                >
                  <p className="text-lg font-black text-gray-900">{counts[s]}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{s}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {FILTERS.map(f => {
            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:text-black hover:border-gray-400'
                }`}
              >
                {f}
                {counts[f] > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white text-black' : 'bg-gray-100 text-gray-600'}`}>
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
            <div className="bg-white border border-gray-200 rounded-2xl p-14 flex flex-col items-center shadow-sm">
              <Loader2 size={32} className="animate-spin text-black mb-3" />
              <p className="text-sm font-bold text-gray-500">Loading your orders…</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-14 flex flex-col items-center text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
                <Package size={28} className="text-gray-400" />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-1.5 uppercase">No {activeFilter !== 'All' ? activeFilter : ''} orders</h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                {activeFilter === 'All'
                  ? "You haven't placed any orders yet. Discover our latest PC parts!"
                  : `You have no ${activeFilter.toLowerCase()} orders.`}
              </p>
              <Link
                to="/shop"
                className="bg-black text-white font-black text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl hover:bg-gray-900 transition-colors shadow-md flex items-center gap-2"
              >
                <ShoppingBag size={14} /> Browse Catalog
              </Link>
            </div>
          ) : (
            filteredOrders.map((order, idx) => {
              const orderId = order.id || order._id || order.orderNumber;
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
              const currentStep = getStepIndex(order.status);
              const isExpanded = Boolean(expandedOrderIds[orderId]);
              const items = order.items || [];

              return (
                <motion.div
                  key={order.orderNumber || orderId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:border-gray-300 transition-all"
                >
                  {/* Compact Header Bar */}
                  <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50/50">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-black text-gray-900">
                          {order.orderNumber}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.text} ${cfg.bg} ${cfg.border}`}>
                          {cfg.icon} {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        <span className="mx-1.5">•</span>
                        {items.length} item{items.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase">Total</p>
                        <p className="text-base font-black text-black">{formatLKR(order.total)}</p>
                      </div>
                      <button
                        onClick={() => toggleExpandOrder(orderId)}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-xs font-bold text-gray-800 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        {isExpanded ? (
                          <>Hide Details <ChevronUp size={14} /></>
                        ) : (
                          <>View Details <ChevronDown size={14} /></>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 4-Step Stepper Progress Bar (Image 3 Style) */}
                  {order.status !== 'Cancelled' ? (
                    <div className="px-6 py-6 border-b border-gray-100 bg-white">
                      <div className="relative max-w-2xl mx-auto">
                        {/* Connecting background progress track */}
                        <div className="absolute top-4 left-6 right-6 h-1 bg-gray-100 -translate-y-1/2 z-0" />
                        
                        {/* Connecting active filled track */}
                        <div
                          className="absolute top-4 left-6 h-1 bg-[#16a34a] -translate-y-1/2 z-0 transition-all duration-700"
                          style={{
                            width: currentStep <= 1 ? '0%' : currentStep === 2 ? '33.3%' : currentStep === 3 ? '66.6%' : '100%'
                          }}
                        />

                        {/* Step Circles & Labels */}
                        <div className="relative z-10 flex justify-between items-start">
                          {ORDER_STEPS.map((stepItem) => {
                            const isCompleted = stepItem.step < currentStep;
                            const isCurrent = stepItem.step === currentStep;
                            const isPassedOrCurrent = stepItem.step <= currentStep;

                            return (
                              <div key={stepItem.step} className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 shadow-sm ${
                                    isPassedOrCurrent
                                      ? 'bg-[#16a34a] text-white ring-4 ring-[#16a34a]/15'
                                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                                  }`}
                                >
                                  {isCompleted || isCurrent ? (
                                    <Check size={14} strokeWidth={3} />
                                  ) : (
                                    stepItem.step
                                  )}
                                </div>
                                <span
                                  className={`mt-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                                    isPassedOrCurrent ? 'text-gray-900 font-black' : 'text-gray-400'
                                  }`}
                                >
                                  {stepItem.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-3 bg-red-50/60 border-b border-red-100 text-xs font-bold text-red-700 flex items-center gap-2">
                      <XCircle size={15} /> This order was cancelled.
                    </div>
                  )}

                  {/* Compact Purchased Products Row */}
                  <div className="p-4 sm:p-5 space-y-3">
                    {items.map((item, itemIdx) => {
                      const reviewKey = `${order.orderNumber}_${item.productId}`;
                      const isReviewed = Boolean(submittedReviews[reviewKey]);

                      return (
                        <div
                          key={item.productId || itemIdx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-gray-50/70 hover:bg-gray-50 border border-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-14 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package size={20} className="text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Qty: {item.quantity} <span className="mx-1">•</span> {formatLKR(item.price)} each
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <span className="text-xs font-black text-gray-900 mr-2">
                              {formatLKR(item.price * item.quantity)}
                            </span>

                            {/* Write Review Button */}
                            {isReviewed ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                <Check size={12} /> Reviewed
                              </span>
                            ) : (
                              <button
                                onClick={() => openReviewModal(item, order.orderNumber)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-black text-gray-900 text-[10px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer hover:bg-gray-50"
                              >
                                <Star size={11} className="text-amber-500 fill-amber-500" /> Write Review
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Collapsible Details Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-100 bg-gray-50/40 p-4 sm:p-6 space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Shipping Address */}
                          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                            <div className="flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-wider text-gray-900">
                              <MapPin size={13} /> Delivery Address
                            </div>
                            {order.shippingAddress ? (
                              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                <span className="font-bold text-gray-900">{order.shippingAddress.name}</span><br />
                                {order.shippingAddress.phone && <span>{order.shippingAddress.phone}<br /></span>}
                                {order.shippingAddress.street}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400">Address recorded on invoice.</p>
                            )}
                          </div>

                          {/* Payment & Rewards Summary */}
                          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
                            <div className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2">
                              Payment & Rewards
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Payment Method:</span>
                              <span className="font-bold uppercase text-gray-900">{order.paymentMethod || 'Online'}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Subtotal:</span>
                              <span className="font-bold">{formatLKR(order.subtotal || order.total)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Shipping:</span>
                              <span className="font-bold">{formatLKR(order.shipping || 0)}</span>
                            </div>
                            {order.pointsUsed !== undefined && order.pointsUsed > 0 && (
                              <div className="flex justify-between text-xs text-amber-700 bg-amber-50 p-1.5 rounded-lg">
                                <span className="font-bold flex items-center gap-1">
                                  <Sparkles size={11} /> Points Redeemed:
                                </span>
                                <span className="font-black">-{formatLKR(order.pointsDiscount || order.pointsUsed)} ({order.pointsUsed} Pts)</span>
                              </div>
                            )}
                            {order.pointsEarned !== undefined && order.pointsEarned > 0 && (
                              <div className="flex justify-between text-xs text-emerald-700 bg-emerald-50 p-1.5 rounded-lg">
                                <span className="font-bold">Points Earned:</span>
                                <span className="font-black">+{order.pointsEarned} Pts</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Timeline Updates if available */}
                        {order.trackingUpdates && order.trackingUpdates.length > 0 && (
                          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                            <div className="text-xs font-black uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-1.5">
                              <Truck size={13} /> Tracking History
                            </div>
                            <div className="space-y-2">
                              {order.trackingUpdates.map((update, uIdx) => (
                                <div key={uIdx} className="flex items-start gap-2 text-xs">
                                  <div className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0" />
                                  <div className="flex-1">
                                    <span className="font-bold text-gray-900">{update.status}: </span>
                                    <span className="text-gray-600">{update.message}</span>
                                    <span className="text-[10px] text-gray-400 ml-2">{update.timestamp}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bottom Action Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => navigate(`/track?id=${order.orderNumber}`)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-800 hover:text-black transition-colors cursor-pointer"
                    >
                      <Truck size={13} /> Live Tracking Link <ArrowRight size={11} />
                    </button>

                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleCancelOrder(orderId, order.orderNumber, order.pointsUsed)}
                        disabled={cancellingId === orderId}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {cancellingId === orderId ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <XCircle size={12} />
                        )}
                        Cancel Order
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Review Submission Modal */}
      <AnimatePresence>
        {reviewModal.isOpen && reviewModal.item && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setReviewModal({ isOpen: false, item: null, orderNumber: '' })}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {reviewModal.item.image ? (
                    <img src={reviewModal.item.image} alt={reviewModal.item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={20} className="text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 pr-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Review Item</span>
                  <h3 className="text-sm font-black text-gray-900 truncate">{reviewModal.item.name}</h3>
                </div>
              </div>

              <form onSubmit={submitReview} className="space-y-4">
                {/* Rating Stars */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                      >
                        <Star
                          size={28}
                          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-600 ml-2">{rating} of 5 Stars</span>
                  </div>
                </div>

                {/* Reviewer Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Hasaranga"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Review</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="How is this product working for you? Mention build quality, packaging, and performance..."
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setReviewModal({ isOpen: false, item: null, orderNumber: '' })}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-6 py-2.5 bg-black hover:bg-gray-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {reviewSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} className="fill-current" />}
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
