import React, { useState } from 'react';
import { Search, Clock, Package, Truck, CheckCircle, XCircle, ChevronDown, Eye } from 'lucide-react';
import { useAdmin, AdminOrder } from '../../context/AdminContext';

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
  const { orders, setOrders } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: AdminOrder['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">Order Management</h2>
        <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${filterStatus === s ? 'bg-[#2ee661] text-black border-[#2ee661]' : 'bg-[#0d1117] border-[#30363D] text-gray-400 hover:border-[#2ee661]/30'}`}>
            {s} {s !== 'All' && <span className="ml-1 opacity-70">({orders.filter(o => o.status === s).length})</span>}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order #, name, or email..."
          className="w-full bg-[#0d1117] border border-[#30363D] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#2ee661]/50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ gridTemplateColumns: selectedOrder ? '1fr 1fr' : '1fr' }}>
        {/* Orders Table */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363D]">
                  {['Order #', 'Customer', 'Date', 'Total', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-500">No orders found</td></tr>
                ) : filtered.map(o => (
                  <tr key={o.id}
                    onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)}
                    className={`border-b border-[#30363D]/50 hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedOrder?.id === o.id ? 'bg-[#2ee661]/5 border-l-2 border-l-[#2ee661]' : ''}`}>
                    <td className="px-5 py-4 font-mono text-[#2ee661] font-bold text-xs">{o.orderNumber}</td>
                    <td className="px-5 py-4">
                      <p className="text-white font-medium text-sm">{o.customerName}</p>
                      <p className="text-gray-500 text-xs">{o.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{o.date}</td>
                    <td className="px-5 py-4 text-white font-bold text-sm whitespace-nowrap">LKR {o.total.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(o.status)}`}>
                        {STATUS_ICON[o.status]}{o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Eye size={15} className="text-gray-600 hover:text-[#2ee661] transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Order Detail</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-white">
                <XCircle size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order #</span>
                <span className="text-[#2ee661] font-mono font-bold">{selectedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="text-white font-medium">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="text-white">{selectedOrder.customerEmail}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="text-white">{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items</span>
                <span className="text-white">{selectedOrder.items}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="text-white">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping To</span>
                <span className="text-white text-right max-w-[180px]">{selectedOrder.shippingAddress}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#30363D] pt-3">
                <span className="text-gray-400 font-bold">Total</span>
                <span className="text-[#2ee661] font-black text-base">LKR {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Update Status */}
            <div className="border-t border-[#30363D] pt-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(s => (
                  <button key={s} onClick={() => updateStatus(selectedOrder.id, s)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${selectedOrder.status === s ? 'bg-[#2ee661] text-black border-[#2ee661]' : 'bg-[#0d1117] text-gray-400 border-[#30363D] hover:border-[#2ee661]/40'}`}>
                    {STATUS_ICON[s]} <span className="ml-1">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
