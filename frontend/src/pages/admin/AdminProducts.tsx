import React, { useState } from 'react';
import { Search, Filter, Trash2, Edit3, Plus, Package, CheckCircle, XCircle, Star } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminProducts({ onAddItem, onEditItem }: { onAddItem: () => void; onEditItem: (id: string) => void }) {
  const { products, deleteProductFromContext } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const statuses = ['All', 'In Stock', 'Out of Stock', 'Sold Out'];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || p.category === filterCategory;
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const deleteProduct = async (id: string) => {
    if (confirm('Delete this product permanently from database?')) {
      await deleteProductFromContext(id);
    }
  };

  const statusColor = (s?: string) => {
    if (s === 'In Stock') return 'text-green-400 bg-green-400/10';
    if (s === 'Out of Stock') return 'text-red-400 bg-red-400/10';
    return 'text-yellow-400 bg-yellow-400/10';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Products</h2>
          <p className="text-gray-500 text-sm mt-1">{products.length} total products</p>
        </div>
        <button onClick={onAddItem} className="flex items-center gap-2 bg-[#2ee661] text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#24c24e] transition-colors">
          <Plus size={18} /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-[#0d1117] border border-[#30363D] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#2ee661]/50"
          />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-[#2ee661]/50 min-w-[160px]">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-[#2ee661]/50 min-w-[140px]">
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363D]">
                {['Product', 'Category', 'Price', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No products found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-[#30363D]/50 hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-[#0d1117]" />
                      <div>
                        <p className="text-white font-medium text-sm leading-tight line-clamp-1 max-w-[200px]">{p.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{p.brand || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{p.category}</td>
                  <td className="px-5 py-4">
                    <p className="text-white font-bold">LKR {p.price.toLocaleString()}</p>
                    {p.originalPrice && <p className="text-gray-500 text-xs line-through">LKR {p.originalPrice.toLocaleString()}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold text-xs">{p.rating}</span>
                      <span className="text-gray-500 text-xs">({p.reviews})</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusColor(p.status)}`}>
                      {p.status === 'In Stock' ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      {p.status || 'In Stock'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEditItem(p.id)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#30363D] text-xs text-gray-500">
          Showing {filtered.length} of {products.length} products
        </div>
      </div>
    </div>
  );
}
