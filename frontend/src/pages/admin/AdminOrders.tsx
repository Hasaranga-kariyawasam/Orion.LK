import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Printer,
  Trash2,
  AlertTriangle,
  Coins,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Calendar,
  DollarSign,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useAdmin, AdminOrder } from '../../context/AdminContext';
import { formatLKR, BRAND_LOGO_URL } from '../../data';

const STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

const statusColor = (s: string) => {
  if (s === 'Pending') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
  if (s === 'Processing') return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  if (s === 'Shipped') return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
  if (s === 'Delivered') return 'text-green-400 bg-green-400/10 border-green-400/20';
  return 'text-red-400 bg-red-400/10 border-red-400/20';
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Pending: <Clock size={13} />,
  Processing: <Package size={13} />,
  Shipped: <Truck size={13} />,
  Delivered: <CheckCircle size={13} />,
  Cancelled: <XCircle size={13} />,
};

export default function AdminOrders() {
  const { orders, refreshOrders, updateOrderStatusInDb, deleteOrderFromContext } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrder | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    refreshOrders();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await refreshOrders();
    setIsSyncing(false);
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId || o.orderNumber === selectedOrderId) || null;

  const filtered = orders.filter(o => {
    const term = search.toLowerCase();
    const matchSearch =
      o.orderNumber.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerEmail.toLowerCase().includes(term) ||
      (o.customerPhone && o.customerPhone.includes(term));
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusUpdate = async (id: string, newStatus: AdminOrder['status']) => {
    setIsUpdating(true);
    setActionMessage(null);
    try {
      const ok = await updateOrderStatusInDb(id, newStatus, statusNote.trim() || undefined);
      if (ok) {
        setActionMessage({
          type: 'success',
          text: `Order status changed to ${newStatus}${newStatus === 'Cancelled' ? ' (Reward points refunded if applicable)' : ''}.`,
        });
        setStatusNote('');
      } else {
        setActionMessage({ type: 'error', text: 'Failed to update order status.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Error updating order' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteOrderFromContext(id);
    if (ok) {
      if (selectedOrderId === id) setSelectedOrderId(null);
      setDeleteConfirmId(null);
    } else {
      alert('Failed to delete order.');
    }
  };

  // Metrics
  const totalRev = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const processingCount = orders.filter(o => o.status === 'Processing').length;
  const shippedCount = orders.filter(o => o.status === 'Shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="space-y-6">
      {/* Header and Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Order Management</h2>
          <p className="text-gray-500 text-sm mt-1">
            {orders.length} orders total &bull; Live MongoDB order synchronization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] hover:border-[#2ee661] text-gray-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-[#2ee661]' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Orders'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 font-medium">All Orders</span>
            <Package size={16} className="text-gray-400" />
          </div>
          <p className="text-xl font-black text-white">{orders.length}</p>
        </div>
        <div className="bg-[#161B22] border border-yellow-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-yellow-400 font-medium">Pending</span>
            <Clock size={16} className="text-yellow-400" />
          </div>
          <p className="text-xl font-black text-white">{pendingCount}</p>
        </div>
        <div className="bg-[#161B22] border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-blue-400 font-medium">Processing</span>
            <Package size={16} className="text-blue-400" />
          </div>
          <p className="text-xl font-black text-white">{processingCount}</p>
        </div>
        <div className="bg-[#161B22] border border-purple-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-purple-400 font-medium">Shipped</span>
            <Truck size={16} className="text-purple-400" />
          </div>
          <p className="text-xl font-black text-white">{shippedCount}</p>
        </div>
        <div className="bg-[#161B22] border border-green-500/20 rounded-2xl p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-green-400 font-medium">Delivered Rev</span>
            <DollarSign size={16} className="text-green-400" />
          </div>
          <p className="text-lg font-black text-[#2ee661] truncate">LKR {totalRev.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => {
            const count = s === 'All' ? orders.length : orders.filter(o => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border ${
                  filterStatus === s
                    ? 'bg-[#2ee661] text-black border-[#2ee661]'
                    : 'bg-[#0d1117] border-[#30363D] text-gray-400 hover:border-[#2ee661]/40'
                }`}
              >
                {s} <span className="ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order #, customer, email, or phone..."
            className="w-full bg-[#0d1117] border border-[#30363D] rounded-xl pl-10 pr-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#2ee661]/50"
          />
        </div>
      </div>

      {/* Main Grid: Orders List & Detail Panel */}
      <div
        className="grid grid-cols-1 gap-6"
        style={{ gridTemplateColumns: selectedOrder ? 'minmax(0, 1.2fr) minmax(0, 1.8fr)' : '1fr' }}
      >
        {/* Table */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363D] bg-black/20">
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      No matching orders found
                    </td>
                  </tr>
                ) : (
                  filtered.map(o => {
                    const isSelected = selectedOrderId === o.id || selectedOrderId === o.orderNumber;
                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedOrderId(isSelected ? null : o.id)}
                        className={`border-b border-[#30363D]/40 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#2ee661]/10 border-l-4 border-l-[#2ee661]' : ''
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[#2ee661] font-bold text-xs">{o.orderNumber}</span>
                          {o.pointsUsed && o.pointsUsed > 0 ? (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
                              <Coins size={10} />
                              <span>{o.pointsUsed} Pts applied</span>
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-white font-medium text-xs sm:text-sm">{o.customerName}</p>
                          <p className="text-gray-500 text-[11px] truncate max-w-[140px]">{o.customerEmail}</p>
                        </td>
                        <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{o.date}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-white font-bold text-sm">LKR {o.total.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(
                              o.status
                            )}`}
                          >
                            {STATUS_ICON[o.status]}
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedOrderId(isSelected ? null : o.id)}
                              className="p-1.5 rounded-lg bg-[#0d1117] border border-[#30363D] hover:border-[#2ee661] text-gray-300 hover:text-white transition-colors"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setInvoiceOrder(o)}
                              className="p-1.5 rounded-lg bg-[#0d1117] border border-[#30363D] hover:border-[#2ee661] text-gray-300 hover:text-white transition-colors"
                              title="Print Invoice"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(o.id)}
                              className="p-1.5 rounded-lg bg-[#0d1117] border border-[#30363D] hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Detail Panel */}
        {selectedOrder && (
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-6 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#30363D] pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-mono text-xl font-bold text-[#2ee661]">{selectedOrder.orderNumber}</h3>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {STATUS_ICON[selectedOrder.status]}
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <Calendar size={12} /> Placed on {selectedOrder.date} &bull; ID: {selectedOrder.id}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInvoiceOrder(selectedOrder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1117] border border-[#30363D] hover:border-[#2ee661] text-xs font-bold text-gray-300 hover:text-white rounded-xl transition-colors"
                >
                  <Printer size={13} /> Print Invoice
                </button>
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>

            {/* Action feedback message */}
            {actionMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  actionMessage.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {actionMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                {actionMessage.text}
              </div>
            )}

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0d1117] border border-[#30363D] rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={13} className="text-[#2ee661]" /> Customer Details
                </p>
                <p className="text-white font-bold text-sm">{selectedOrder.customerName}</p>
                <p className="text-gray-400 text-xs flex items-center gap-1.5">
                  <Mail size={12} className="text-gray-500" /> {selectedOrder.customerEmail}
                </p>
                {selectedOrder.customerPhone && (
                  <p className="text-gray-400 text-xs flex items-center gap-1.5">
                    <Phone size={12} className="text-gray-500" /> {selectedOrder.customerPhone}
                  </p>
                )}
                <div className="pt-2 border-t border-[#30363D]/50 flex items-center gap-2 text-xs text-gray-400">
                  <CreditCard size={13} className="text-gray-500" />
                  <span>Payment: <strong className="text-white">{selectedOrder.paymentMethod}</strong></span>
                </div>
              </div>

              <div className="bg-[#0d1117] border border-[#30363D] rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#2ee661]" /> Shipping Address
                </p>
                {selectedOrder.shippingAddressObj ? (
                  <div className="text-xs text-gray-300 space-y-1">
                    <p className="font-bold text-white">{selectedOrder.shippingAddressObj.name}</p>
                    <p>{selectedOrder.shippingAddressObj.street}</p>
                    <p>
                      {selectedOrder.shippingAddressObj.city}, {selectedOrder.shippingAddressObj.province}{' '}
                      {selectedOrder.shippingAddressObj.postalCode}
                    </p>
                    <p className="text-gray-500">{selectedOrder.shippingAddressObj.phone}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-300">{selectedOrder.shippingAddress}</p>
                )}
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="bg-[#0d1117] border border-[#30363D] rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Package size={13} className="text-[#2ee661]" /> Ordered Items ({selectedOrder.orderItems?.length || selectedOrder.items || 0})
              </p>
              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                <div className="divide-y divide-[#30363D]/50">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-lg border border-[#30363D] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#161B22] flex items-center justify-center text-gray-600 shrink-0">
                            <Package size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{item.name}</p>
                          <p className="text-gray-500 text-[11px]">
                            Qty: {item.quantity} &times; LKR {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-white font-bold whitespace-nowrap">
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 py-2">
                  {selectedOrder.items} item(s) included in this order.
                </p>
              )}

              {/* Points & Financial Summary */}
              <div className="mt-4 pt-4 border-t border-[#30363D] space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">
                    LKR {(selectedOrder.subtotal || selectedOrder.total).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping Fee</span>
                  <span className="text-white font-semibold">
                    {selectedOrder.shipping && selectedOrder.shipping > 0
                      ? `LKR ${selectedOrder.shipping.toLocaleString()}`
                      : 'Free'}
                  </span>
                </div>

                {/* Points Used Discount */}
                {selectedOrder.pointsUsed && selectedOrder.pointsUsed > 0 ? (
                  <div className="flex justify-between text-amber-400 bg-amber-400/5 px-2.5 py-1.5 rounded-lg border border-amber-400/10">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Coins size={12} /> Points Discount ({selectedOrder.pointsUsed} Pts)
                    </span>
                    <span className="font-bold">
                      - LKR {(selectedOrder.pointsDiscount || selectedOrder.pointsUsed).toLocaleString()}
                    </span>
                  </div>
                ) : null}

                {/* Points Earned */}
                {selectedOrder.pointsEarned && selectedOrder.pointsEarned > 0 ? (
                  <div className="flex justify-between text-emerald-400 bg-emerald-400/5 px-2.5 py-1.5 rounded-lg border border-emerald-400/10">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Coins size={12} /> Points Earned (1% Cashback)
                    </span>
                    <span className="font-bold">+{selectedOrder.pointsEarned} Pts</span>
                  </div>
                ) : null}

                <div className="flex justify-between text-sm pt-2 border-t border-[#30363D]">
                  <span className="text-white font-bold">Total Paid</span>
                  <span className="text-[#2ee661] font-black text-base">
                    LKR {selectedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Updates History */}
            {selectedOrder.trackingUpdates && selectedOrder.trackingUpdates.length > 0 && (
              <div className="bg-[#0d1117] border border-[#30363D] rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Tracking & Dispatch Log
                </p>
                <div className="space-y-2.5 text-xs">
                  {selectedOrder.trackingUpdates.map((u, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 border-l-2 border-[#2ee661] pl-3 py-0.5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{u.status}</span>
                          <span className="text-gray-500 text-[10px]">
                            {new Date(u.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {u.message && <p className="text-gray-400 mt-0.5">{u.message}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Change Control Center */}
            <div className="bg-[#0d1117] border border-[#30363D] rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Update Order Status & Dispatch Log
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Changing status updates the customer's tracking view and appends an entry to tracking history.
                </p>
              </div>

              <input
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="Optional dispatch note (e.g. PromptX Tracking # 782910, Dispatched via express)..."
                className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#2ee661]/50"
              />

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(s => {
                  const isActive = selectedOrder.status === s;
                  return (
                    <button
                      key={s}
                      disabled={isUpdating || isActive}
                      onClick={() => handleStatusUpdate(selectedOrder.id, s)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-[#2ee661] text-black border-[#2ee661] shadow'
                          : 'bg-[#161B22] text-gray-400 border-[#30363D] hover:border-[#2ee661]/40 hover:text-white disabled:opacity-40'
                      }`}
                    >
                      {STATUS_ICON[s]}
                      <span>{s}</span>
                    </button>
                  );
                })}
              </div>

              {selectedOrder.status !== 'Cancelled' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-400/5 border border-amber-400/15 text-[11px] text-amber-400/90">
                  <Coins size={13} className="shrink-0" />
                  <span>
                    Note: If you mark this order as <strong>Cancelled</strong>, any reward points redeemed by the customer
                    will automatically be refunded to their account.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert size={28} />
              <h3 className="text-lg font-bold text-white">Delete Order?</h3>
            </div>
            <p className="text-sm text-gray-400">
              Are you sure you want to permanently delete order <span className="text-[#2ee661] font-mono">{deleteConfirmId}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0d1117] border border-[#30363D] text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-black rounded-2xl max-w-2xl w-full p-8 space-y-6 shadow-2xl my-8 relative print:m-0 print:p-0 print:shadow-none">
            {/* Action Bar (Hidden on print) */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Printer size={16} />
                <span>Printable Official Invoice</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#2ee661] text-black font-black text-xs rounded-xl shadow hover:opacity-90 flex items-center gap-2"
                >
                  <Printer size={14} /> Print Now
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Invoice Header */}
            <div className="flex items-start justify-between">
              <div>
                <img src={BRAND_LOGO_URL} alt="Orion.LK" className="h-10 object-contain mb-1" />
                <p className="text-xs text-gray-600">Premium Computer & Tech Hub</p>
                <p className="text-xs text-gray-600">Colombo, Sri Lanka</p>
                <p className="text-xs text-gray-600">support@orion.lk &bull; +94 77 123 4567</p>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wide">INVOICE</h1>
                <p className="text-sm font-mono font-bold text-gray-800 mt-1">{invoiceOrder.orderNumber}</p>
                <p className="text-xs text-gray-500 mt-0.5">Date: {invoiceOrder.date}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800 border">
                  Status: {invoiceOrder.status}
                </span>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50 text-xs border border-gray-200">
              <div>
                <p className="font-bold text-gray-500 uppercase tracking-wider mb-1">Billed To</p>
                <p className="font-bold text-gray-900 text-sm">{invoiceOrder.customerName}</p>
                <p className="text-gray-700">{invoiceOrder.customerEmail}</p>
                {invoiceOrder.customerPhone && <p className="text-gray-700">{invoiceOrder.customerPhone}</p>}
                <p className="text-gray-500 mt-1">Payment: {invoiceOrder.paymentMethod}</p>
              </div>
              <div>
                <p className="font-bold text-gray-500 uppercase tracking-wider mb-1">Delivered To</p>
                {invoiceOrder.shippingAddressObj ? (
                  <div className="text-gray-700 space-y-0.5">
                    <p className="font-bold text-gray-900">{invoiceOrder.shippingAddressObj.name}</p>
                    <p>{invoiceOrder.shippingAddressObj.street}</p>
                    <p>
                      {invoiceOrder.shippingAddressObj.city}, {invoiceOrder.shippingAddressObj.province}{' '}
                      {invoiceOrder.shippingAddressObj.postalCode}
                    </p>
                    <p>{invoiceOrder.shippingAddressObj.phone}</p>
                  </div>
                ) : (
                  <p className="text-gray-700">{invoiceOrder.shippingAddress}</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 font-bold text-gray-600 uppercase">Item Description</th>
                    <th className="text-center py-2 font-bold text-gray-600 uppercase">Qty</th>
                    <th className="text-right py-2 font-bold text-gray-600 uppercase">Unit Price</th>
                    <th className="text-right py-2 font-bold text-gray-600 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoiceOrder.orderItems && invoiceOrder.orderItems.length > 0 ? (
                    invoiceOrder.orderItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5">
                          <p className="font-bold text-gray-900">{item.name}</p>
                        </td>
                        <td className="py-2.5 text-center text-gray-700 font-medium">{item.quantity}</td>
                        <td className="py-2.5 text-right text-gray-700 font-mono">
                          LKR {item.price.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-bold text-gray-900 font-mono">
                          LKR {(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-3 text-gray-600">
                        {invoiceOrder.items} item(s) included in this invoice.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Lines */}
            <div className="border-t-2 border-gray-300 pt-4 flex justify-end text-xs">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">
                    LKR {(invoiceOrder.subtotal || invoiceOrder.total).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span className="font-mono font-medium">
                    {invoiceOrder.shipping && invoiceOrder.shipping > 0
                      ? `LKR ${invoiceOrder.shipping.toLocaleString()}`
                      : 'Free'}
                  </span>
                </div>
                {invoiceOrder.pointsUsed && invoiceOrder.pointsUsed > 0 ? (
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span>Reward Points Discount:</span>
                    <span className="font-mono">
                      - LKR {(invoiceOrder.pointsDiscount || invoiceOrder.pointsUsed).toLocaleString()}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-gray-300 pt-2 text-sm font-black text-gray-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base">LKR {invoiceOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Invoice Footer */}
            <div className="border-t pt-4 text-center text-[10px] text-gray-500">
              <p>Thank you for shopping with Orion.LK! All brand new items carry official manufacturer warranty.</p>
              <p className="mt-0.5">Keep this invoice as proof of purchase for warranty and support claims.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
