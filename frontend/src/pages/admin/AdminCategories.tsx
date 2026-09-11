import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit3, Check, X, Upload, Loader2 } from 'lucide-react';
import { useAdmin, AdminCategory } from '../../context/AdminContext';
import { uploadImageToServer } from '../../lib/api';

export default function AdminCategories() {
  const { categories, saveCategoryToDb, deleteCategoryFromContext } = useAdmin();
  const [activeType, setActiveType] = useState<'brand-new' | 'used'>('brand-new');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const filtered = categories.filter(c => c.type === activeType);

  const addCategory = async () => {
    const promptName = prompt('Enter Category Name:');
    if (!promptName || !promptName.trim()) return;

    try {
      await saveCategoryToDb({
        name: promptName.trim(),
        count: 0,
        img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=300',
        type: activeType,
      });
    } catch (err: any) {
      alert('Error creating category: ' + (err.message || 'Unknown error'));
    }
  };

  const saveEdit = async (cat: AdminCategory) => {
    if (!editName.trim()) return;
    try {
      await saveCategoryToDb({ name: editName.trim() }, cat.id || cat._id);
      setEditingId(null);
    } catch (err: any) {
      alert('Error saving category: ' + (err.message || 'Unknown error'));
    }
  };

  const startEdit = (cat: AdminCategory) => {
    setEditingId(cat.id || cat._id || '');
    setEditName(cat.name);
  };

  const updateImg = async (cat: AdminCategory, img: string) => {
    try {
      await saveCategoryToDb({ img }, cat.id || cat._id);
    } catch (err: any) {
      console.error('Error updating category image:', err);
    }
  };

  const handleFileUpload = async (cat: AdminCategory, file: File) => {
    const catId = cat.id || cat._id || '';
    setUploadingId(catId);
    try {
      const url = await uploadImageToServer(file);
      await saveCategoryToDb({ img: url }, catId);
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingId(null);
    }
  };

  const deleteCategory = async (id: string) => {
    if (confirm('Delete this category from database?')) {
      await deleteCategoryFromContext(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Categories</h2>
          <p className="text-gray-500 text-sm mt-1">{categories.length} total categories</p>
        </div>
        <button onClick={addCategory} className="flex items-center gap-2 bg-[#2ee661] text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#24c24e] transition-colors shadow-lg shadow-[#2ee661]/20">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-1 bg-[#0d1117] border border-[#30363D] rounded-xl p-1 w-fit">
        {([['brand-new', '🆕 Brand New'], ['used', '♻️ Used']] as const).map(([type, label]) => (
          <button key={type} onClick={() => setActiveType(type)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${activeType === type ? 'bg-[#2ee661] text-black' : 'text-gray-400 hover:text-white'}`}>
            {label} <span className="ml-1 opacity-70">({categories.filter(c => c.type === type).length})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((cat) => {
          const catId = cat.id || cat._id || '';
          return (
            <div key={catId} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex items-center gap-4 group">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0d1117] shrink-0 border border-[#30363D] relative">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                {uploadingId === catId && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Loader2 size={16} className="text-[#2ee661] animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {editingId === catId ? (
                  <div className="flex items-center gap-2">
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEdit(cat)}
                      autoFocus
                      className="flex-1 bg-[#0d1117] border border-[#2ee661]/50 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none" />
                    <button onClick={() => saveEdit(cat)} className="p-1.5 text-[#2ee661] hover:bg-[#2ee661]/10 rounded-lg"><Check size={15} /></button>
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
                <div className="flex items-center gap-2 mt-2">
                  <input
                    value={cat.img}
                    onChange={e => updateImg(cat, e.target.value)}
                    placeholder="Image URL..."
                    className="flex-1 bg-[#0d1117] border border-[#30363D] rounded-lg px-2.5 py-1 text-gray-400 text-xs focus:outline-none focus:border-[#2ee661]/50"
                  />
                  <button
                    onClick={() => fileInputRefs.current[catId]?.click()}
                    title="Upload new image"
                    className="p-1.5 bg-[#0d1117] border border-[#30363D] rounded-lg text-gray-400 hover:text-[#2ee661] hover:border-[#2ee661]/50 transition-colors shrink-0"
                  >
                    <Upload size={13} />
                  </button>
                  <input
                    ref={el => (fileInputRefs.current[catId] = el)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFileUpload(cat, e.target.files[0])}
                  />
                </div>
              </div>
              <button onClick={() => deleteCategory(catId)} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}

        <button onClick={addCategory}
          className="h-24 border-2 border-dashed border-[#30363D] hover:border-[#2ee661]/50 text-gray-600 hover:text-[#2ee661] rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
          <Plus size={20} /> Add Category
        </button>
      </div>
    </div>
  );
}
