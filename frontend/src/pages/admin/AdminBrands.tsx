import React, { useRef, useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminBrands() {
  const { brands, setBrands } = useAdmin();
  const logoRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const bannerRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addBrand = () => {
    setBrands([...brands, { id: Date.now().toString(), name: 'New Brand', image: '', banner: '', visible: true }]);
  };

  const update = (id: string, field: string, val: any) => {
    setBrands(brands.map(b => b.id === id ? { ...b, [field]: val } : b));
  };

  const toggleVisibility = (id: string) => {
    setBrands(brands.map(b => b.id === id ? { ...b, visible: !b.visible } : b));
  };

  const remove = (id: string) => {
    if (confirm('Delete this brand?')) setBrands(brands.filter(b => b.id !== id));
  };

  const handleFileUpload = (id: string, field: 'image' | 'banner', file: File) => {
    const url = URL.createObjectURL(file);
    update(id, field, url);
  };

  const inputCls = "w-full bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#2ee661]/50";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Brand Management</h2>
          <p className="text-gray-500 text-sm mt-1">{brands.length} brands</p>
        </div>
        <button onClick={addBrand} className="flex items-center gap-2 bg-[#2ee661] text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#24c24e] transition-colors">
          <Plus size={18} /> Add Brand
        </button>
      </div>

      <div className="space-y-4">
        {brands.map(brand => (
          <div key={brand.id} className={`bg-[#161B22] border rounded-2xl p-5 transition-colors ${brand.visible !== false ? 'border-[#30363D]' : 'border-red-500/20 opacity-60'}`}>
            <div className="flex flex-col md:flex-row gap-5">
              {/* Logo Preview */}
              <div className="space-y-3 shrink-0 w-full md:w-44">
                <div className="w-full h-20 bg-[#0d1117] border border-[#30363D] rounded-xl flex items-center justify-center p-2 overflow-hidden">
                  {brand.image ? (
                    <img src={brand.image} alt={brand.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-600">No Logo</span>
                  )}
                </div>
                {brand.banner && (
                  <div className="w-full h-14 bg-[#0d1117] rounded-xl overflow-hidden relative border border-[#30363D]">
                    <img src={brand.banner} className="w-full h-full object-cover" alt="Banner" />
                    <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-[9px] text-white font-black tracking-widest uppercase">BANNER</span>
                  </div>
                )}
              </div>

              {/* Inputs */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Brand Name</label>
                  <input value={brand.name} onChange={e => update(brand.id, 'name', e.target.value)} placeholder="e.g. ASUS ROG" className={inputCls} />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Logo</label>
                  <div className="flex gap-2">
                    <input value={brand.image} onChange={e => update(brand.id, 'image', e.target.value)} placeholder="SVG or PNG URL" className={`flex-1 ${inputCls}`} />
                    <button onClick={() => logoRefs.current[brand.id]?.click()}
                      className="px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] hover:border-[#2ee661]/40 transition-colors">
                      <Upload size={16} />
                    </button>
                    <input ref={el => logoRefs.current[brand.id] = el} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleFileUpload(brand.id, 'image', e.target.files[0])} />
                  </div>
                </div>

                {/* Banner Upload */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Banner Image (optional)</label>
                  <div className="flex gap-2">
                    <input value={brand.banner || ''} onChange={e => update(brand.id, 'banner', e.target.value)} placeholder="Banner image URL" className={`flex-1 ${inputCls}`} />
                    <button onClick={() => bannerRefs.current[brand.id]?.click()}
                      className="px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] hover:border-[#2ee661]/40 transition-colors">
                      <Upload size={16} />
                    </button>
                    <input ref={el => bannerRefs.current[brand.id] = el} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleFileUpload(brand.id, 'banner', e.target.files[0])} />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => toggleVisibility(brand.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${brand.visible !== false ? 'text-blue-400 bg-blue-400/10 border-blue-400/20 hover:bg-blue-400/20' : 'text-gray-500 bg-[#0d1117] border-[#30363D]'}`}>
                    {brand.visible !== false ? <><Eye size={15} /> Visible</> : <><EyeOff size={15} /> Hidden</>}
                  </button>
                  <button onClick={() => remove(brand.id)} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors">
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button onClick={addBrand}
          className="w-full border-2 border-dashed border-[#30363D] hover:border-[#2ee661]/50 text-gray-600 hover:text-[#2ee661] py-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
          <Plus size={20} /> Add New Brand
        </button>
      </div>
    </div>
  );
}
