import React, { useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  CreditCard,
  Download,
  Receipt,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const formatLkr = (amount: number) =>
  `LKR ${amount.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;

const getOrderDate = (order: { createdAt?: string; date?: string }) => {
  const value = order.createdAt || order.date;
  return value ? new Date(value) : null;
};

export default function AdminAnalytics() {
  const { orders, refreshOrders } = useAdmin();

  const activeOrders = useMemo(
    () => orders.filter(order => order.status !== 'Cancelled'),
    [orders]
  );
  const paidOrders = useMemo(
    () => activeOrders.filter(order => ['Processing', 'Shipped', 'Delivered'].includes(order.status)),
    [activeOrders]
  );
  const totalIncome = useMemo(
    () => activeOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    [activeOrders]
  );
  const paidIncome = useMemo(
    () => paidOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    [paidOrders]
  );
  const cancelledAmount = useMemo(
    () => orders
      .filter(order => order.status === 'Cancelled')
      .reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    [orders]
  );

  const paymentMethods = useMemo(() => {
    const values = new Map<string, { orders: number; amount: number }>();
    activeOrders.forEach(order => {
      const method = order.paymentMethod || 'Unknown';
      const current = values.get(method) || { orders: 0, amount: 0 };
      values.set(method, {
        orders: current.orders + 1,
        amount: current.amount + (Number(order.total) || 0),
      });
    });
    return Array.from(values.entries())
      .map(([method, value]) => ({ method, ...value }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeOrders]);

  const trend = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      const amount = activeOrders
        .filter(order => getOrderDate(order)?.toISOString().slice(0, 10) === key)
        .reduce((sum, order) => sum + (Number(order.total) || 0), 0);
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount,
      };
    });
  }, [activeOrders]);

  const pendingPayments = orders.filter(order => order.status === 'Pending');
  const topMethod = paymentMethods[0];
  const averageOrderValue = activeOrders.length ? totalIncome / activeOrders.length : 0;
  const maxTrend = Math.max(...trend.map(day => day.amount), 1);

  const exportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total income', totalIncome],
      ['Paid income', paidIncome],
      ['All active orders', activeOrders.length],
      ['Paid orders', paidOrders.length],
      ['Average order value', Math.round(averageOrderValue)],
      ['Pending payment orders', pendingPayments.length],
      ['Cancelled amount', cancelledAmount],
      ['Top payment method', topMethod?.method || 'N/A'],
      [],
      ['Payment method', 'Orders', 'Amount'],
      ...paymentMethods.map(method => [method.method, method.orders, method.amount]),
    ];
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `orion-payment-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    { label: 'Total income', value: formatLkr(totalIncome), helper: 'Active orders', icon: TrendingUp, color: 'text-[#2ee661]' },
    { label: 'Paid orders', value: paidOrders.length, helper: formatLkr(paidIncome), icon: Receipt, color: 'text-blue-400' },
    { label: 'Average order value', value: formatLkr(averageOrderValue), helper: `${activeOrders.length} active orders`, icon: BarChart3, color: 'text-purple-400' },
    { label: 'Pending payments', value: pendingPayments.length, helper: 'Needs attention', icon: Clock, color: 'text-yellow-400' },
    { label: 'Cancelled amount', value: formatLkr(cancelledAmount), helper: 'Refund data not stored', icon: RotateCcw, color: 'text-red-400' },
    { label: 'Top payment method', value: topMethod?.method || 'N/A', helper: topMethod ? formatLkr(topMethod.amount) : 'No data', icon: CreditCard, color: 'text-cyan-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Payment Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">Income, payment methods and order payment status</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refreshOrders()} className="px-4 py-2 rounded-xl border border-[#30363D] text-gray-300 text-xs font-bold hover:border-[#2ee661]">
            Refresh
          </button>
          <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2ee661] text-black text-xs font-bold hover:bg-[#24c24e]">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5">
            <card.icon size={20} className={`${card.color} mb-4`} />
            <p className="text-xl font-black text-white truncate">{card.value}</p>
            <p className="text-xs text-gray-300 mt-1">{card.label}</p>
            <p className="text-[11px] text-gray-500 mt-2">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-white">7-day income trend</h3>
              <p className="text-xs text-gray-500 mt-1">Non-cancelled orders</p>
            </div>
            <ArrowUpRight size={18} className="text-[#2ee661]" />
          </div>
          <div className="flex items-end gap-3 h-48">
            {trend.map(day => (
              <div key={day.label} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                <span className="text-[10px] text-gray-500">{day.amount ? `${Math.round(day.amount / 1000)}K` : '-'}</span>
                <div className="w-full rounded-t-lg bg-[#2ee661]/80 hover:bg-[#2ee661] transition-colors" style={{ height: `${Math.max((day.amount / maxTrend) * 75, day.amount ? 8 : 2)}%` }} />
                <span className="text-xs text-gray-500">{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#30363D]">
            <h3 className="font-bold text-white">Payment-method breakdown</h3>
            <p className="text-xs text-gray-500 mt-1">Active order income by method</p>
          </div>
          <div className="p-5 space-y-3">
            {paymentMethods.length === 0 ? <p className="text-sm text-gray-500">No payment data available.</p> : paymentMethods.map(method => (
              <div key={method.method} className="flex items-center justify-between bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-white">{method.method}</p>
                  <p className="text-xs text-gray-500">{method.orders} orders</p>
                </div>
                <p className="text-sm font-bold text-[#2ee661]">{formatLkr(method.amount)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-[#161B22] border border-yellow-400/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <ArrowDownRight size={18} className="text-yellow-400 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-300">Payment data note</p>
            <p className="text-xs text-gray-400 mt-1">
              The current order model stores cancelled orders but does not store refund transactions or gateway settlement confirmations. Cancelled amount is shown separately and is not treated as a refund.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
