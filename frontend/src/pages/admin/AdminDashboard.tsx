import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const salesData = [
  { name: 'Mon', sales: 4000 }, { name: 'Tue', sales: 3000 }, { name: 'Wed', sales: 5200 },
  { name: 'Thu', sales: 2780 }, { name: 'Fri', sales: 6890 }, { name: 'Sat', sales: 8390 }, { name: 'Sun', sales: 3490 },
];
const categoryData = [
  { name: 'GPUs', views: 700 }, { name: 'Monitors', views: 520 }, { name: 'RAM', views: 420 },
  { name: 'Laptops', views: 380 }, { name: 'Keyboards', views: 300 },
];
const pieData = [
  { name: 'Bank Transfer', value: 45 }, { name: 'Card', value: 30 }, { name: 'COD', value: 25 },
];
const PIE_COLORS = ['#2ee661', '#3b82f6', '#f59e0b'];

const statusIcon = (s: string) => {
  if (s === 'Pending') return <Clock size={14} className="text-yellow-400" />;
  if (s === 'Processing') return <Package size={14} className="text-blue-400" />;
  if (s === 'Shipped') return <Truck size={14} className="text-purple-400" />;
  if (s === 'Delivered') return <CheckCircle size={14} className="text-green-400" />;
  return <XCircle size={14} className="text-red-400" />;
};
const statusColor = (s: string) => {
  if (s === 'Pending') return 'text-yellow-400 bg-yellow-400/10';
  if (s === 'Processing') return 'text-blue-400 bg-blue-400/10';
  if (s === 'Shipped') return 'text-purple-400 bg-purple-400/10';
  if (s === 'Delivered') return 'text-green-400 bg-green-400/10';
  return 'text-red-400 bg-red-400/10';
};

export default function AdminDashboard() {
  const { orders, products, users } = useAdmin();
  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;

  const stats = [
    { label: 'Total Revenue', value: `LKR ${(totalRevenue / 1000).toFixed(0)}K`, change: '+12.5%', up: true, icon: TrendingUp, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/20', iconColor: 'text-[#2ee661]' },
    { label: 'Total Orders', value: orders.length, change: '+8.2%', up: true, icon: ShoppingBag, color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20', iconColor: 'text-blue-400' },
    { label: 'Total Users', value: users.length, change: '+3.1%', up: true, icon: Users, color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/20', iconColor: 'text-purple-400' },
    { label: 'Pending Orders', value: pendingOrders, change: '-2 today', up: false, icon: Package, color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/20', iconColor: 'text-yellow-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm">Welcome back — here's what's happening at Orion.LK</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-4">
              <s.icon size={22} className={s.iconColor} />
              <span className={`text-xs font-bold flex items-center gap-1 ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{s.change}
              </span>
            </div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
          <h3 className="font-bold text-white mb-1">Weekly Sales (LKR)</h3>
          <p className="text-xs text-gray-500 mb-6">Sales revenue for the past 7 days</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363D" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1c2128', border: '1px solid #30363D', borderRadius: '10px', color: '#fff' }} />
                <Line type="monotone" dataKey="sales" stroke="#2ee661" strokeWidth={3} dot={{ r: 4, fill: '#2ee661', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Split */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
          <h3 className="font-bold text-white mb-1">Payment Methods</h3>
          <p className="text-xs text-gray-500 mb-4">Order payment split</p>
          <div className="h-40 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1c2128', border: '1px solid #30363D', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-gray-400">{d.name}</span>
                </div>
                <span className="text-white font-bold">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Traffic */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
        <h3 className="font-bold text-white mb-1">Top Category Traffic</h3>
        <p className="text-xs text-gray-500 mb-6">Most viewed categories this week</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363D" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip cursor={{ fill: 'rgba(46,230,97,0.05)' }} contentStyle={{ backgroundColor: '#1c2128', border: '1px solid #30363D', borderRadius: '10px', color: '#fff' }} />
              <Bar dataKey="views" fill="#2ee661" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#30363D]">
          <h3 className="font-bold text-white">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363D]">
                {['Order #', 'Customer', 'Date', 'Total', 'Items', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b border-[#30363D]/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-[#2ee661] font-bold text-xs">{o.orderNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{o.customerName}</p>
                    <p className="text-gray-500 text-xs">{o.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{o.date}</td>
                  <td className="px-6 py-4 text-white font-bold">LKR {o.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-400">{o.items}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor(o.status)}`}>
                      {statusIcon(o.status)}{o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
