import React, { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Edit3, Check, X } from 'lucide-react';
import { useAdmin, AdminCategory } from '../../context/AdminContext';

export default function AdminCategories() {
  const { categories, setCategories } = useAdmin();
  const [activeType, setActiveType] = useState<'brand-new' | 'used'>('brand-new');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const filtered = categories.filter(c => c.type === activeType);

  const addCategory = () => {
    const newCat: AdminCategory = {
      id: `${activeType}-${Date.now()}`,
      name: 'New Category',
      count: 0,
      img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=150',
      type: activeType,
    };
    setCategories([...categories, newCat]);
    setEditingId(newCat.id);
    setEditName('New Category');
  };

  const saveEdit = (id: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name: editName } : c));
    setEditingId(null);
  };

  const startEdit = (cat: AdminCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const updateImg = (id: string, img: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, img } : c));
  };

  const deleteCategory = (id: string) => {
    if (confirm('Delete this category?')) setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Categories</h2>
          <p className="text-gray-500 text-sm mt-1">{categories.length} total categories</p>
        </div>
        <button onClick={addCategory} className="flex items-center gap-2 bg-[#2ee661] text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#24c24e] transition-colors">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-1 bg-[#0d1117] border border-[#30363D] rounded-xl p-1 w-fit">
        {[['brand-new', '🆕 Brand New'], ['used', '♻️ Used']] .map(([type, label]) => (
          <button key={type} onClick={() => setActiveType(type as any)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${activeType === type ? 'bg-[#2ee661] text-black' : 'text-gray-400 hover:text-white'}`}>
            {label} <span className="ml-1 opacity-70">({categories.filter(c => c.type === type).length})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((cat) => (
          <div key={cat.id} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#0d1117] shrink-0">
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              {editingId === cat.id ? (
                <div className="flex items-center gap-2">
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(cat.id)}
                    autoFocus
                    className="flex-1 bg-[#0d1117] border border-[#2ee661]/50 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none" />
                  <button onClick={() => saveEdit(cat.id)} className="p-1.5 text-[#2ee661] hover:bg-[#2ee661]/10 rounded-lg"><Check size={15} /></button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-500 hover:bg-white/5 rounded-lg"><X size={15} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm">{cat.name}</p>
                  <button onClick={() => startEdit(cat)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-[#2ee661] transition-all">
                    <Edit3 size={13} />
                  </button>
                </div>
              )}
              <p className="text-gray-500 text-xs mt-0.5">{cat.count} items</p>
              <input
                value={cat.img}
                onChange={e => updateImg(cat.id, e.target.value)}
                placeholder="Image URL..."
                className="w-full mt-2 bg-[#0d1117] border border-[#30363D] rounded-lg px-2.5 py-1 text-gray-400 text-xs focus:outline-none focus:border-[#2ee661]/50"
              />
            </div>
            <button onClick={() => deleteCategory(cat.id)} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        <button onClick={addCategory}
          className="h-24 border-2 border-dashed border-[#30363D] hover:border-[#2ee661]/50 text-gray-600 hover:text-[#2ee661] rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
          <Plus size={20} /> Add Category
        </button>
      </div>
    </div>
  );
}
