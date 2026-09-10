import React, { useState, useEffect } from 'react';
import { Search, Shield, User, ShoppingBag, DollarSign, ToggleLeft, ToggleRight, Mail, RefreshCw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminUsers() {
  const { users, setUsers, refreshUsers } = useAdmin();
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    refreshUsers();
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSync = async () => {
    setSyncing(true);
    await refreshUsers();
    setSyncing(false);
  };

  const toggleAdmin = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">User Management</h2>
          <p className="text-gray-500 text-sm mt-1">{users.length} registered database users</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] hover:border-[#2ee661] text-gray-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin text-[#2ee661]' : ''} />
          <span>Sync MongoDB Users</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: User, color: 'text-blue-400' },
          { label: 'Total Orders', value: users.reduce((s, u) => s + u.orders, 0), icon: ShoppingBag, color: 'text-[#2ee661]' },
          { label: 'Total Revenue', value: `LKR ${(users.reduce((s, u) => s + u.totalSpent, 0) / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5">
            <s.icon size={20} className={`${s.color} mb-3`} />
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email..."
          className="w-full bg-[#0d1117] border border-[#30363D] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#2ee661]/50" />
      </div>

      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363D]">
                {['User', 'Joined', 'Orders', 'Total Spent', 'Role', 'Admin Toggle'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-[#30363D]/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full rounded-full object-cover" /> : u.name[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium">{u.name}</p>
                        <p className="text-gray-500 text-xs flex items-center gap-1"><Mail size={10} />{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{u.joined}</td>
                  <td className="px-5 py-4 text-white font-bold">{u.orders}</td>
                  <td className="px-5 py-4 text-[#2ee661] font-bold">LKR {u.totalSpent.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${u.isAdmin ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                      {u.isAdmin ? <Shield size={11} /> : <User size={11} />}
                      {u.isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleAdmin(u.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${u.isAdmin ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 hover:bg-yellow-400/20' : 'text-gray-400 bg-[#0d1117] border-[#30363D] hover:border-[#2ee661]/40'}`}>
                      {u.isAdmin ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
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
