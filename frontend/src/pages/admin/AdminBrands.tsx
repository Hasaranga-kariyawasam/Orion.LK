import React, { useRef, useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Upload, X, Loader2 } from 'lucide-react';
import { useAdmin, Brand } from '../../context/AdminContext';
import { uploadImageToServer } from '../../lib/api';

export default function AdminBrands() {
  const { brands, saveBrandToDb, deleteBrandFromContext } = useAdmin();
  const [uploading, setUploading] = useState<string | null>(null);
  const logoRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const bannerRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addBrand = async () => {
    const brandName = prompt('Enter Brand Name:');
    if (!brandName || !brandName.trim()) return;

    try {
      await saveBrandToDb({
        name: brandName.trim(),
        image: '',
        banner: '',
        visible: true,
      });
    } catch (err: any) {
      alert('Error creating brand: ' + (err.message || 'Unknown error'));
    }
  };

  const update = async (brand: Brand, field: string, val: any) => {
    const id = brand.id || brand._id || '';
    try {
      await saveBrandToDb({ [field]: val }, id);
    } catch (err: any) {
      console.error('Error updating brand:', err);
    }
  };

  const toggleVisibility = async (brand: Brand) => {
    const id = brand.id || brand._id || '';
    try {
      await saveBrandToDb({ visible: !brand.visible }, id);
    } catch (err: any) {
      console.error('Error toggling brand visibility:', err);
    }
  };

  const remove = async (id: string) => {
    if (confirm('Delete this brand from database?')) {
      await deleteBrandFromContext(id);
    }
  };

  const handleFileUpload = async (brand: Brand, field: 'image' | 'banner', file: File) => {
    const id = brand.id || brand._id || '';
    setUploading(`${id}-${field}`);
    try {
      const url = await uploadImageToServer(file);
      await saveBrandToDb({ [field]: url }, id);
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(null);
    }
  };

  const inputCls = "w-full bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#2ee661]/50";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Brand Management</h2>
          <p className="text-gray-500 text-sm mt-1">{brands.length} brands</p>
        </div>
        <button onClick={addBrand} className="flex items-center gap-2 bg-[#2ee661] text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#24c24e] transition-colors shadow-lg shadow-[#2ee661]/20">
          <Plus size={18} /> Add Brand
        </button>
      </div>

      <div className="space-y-4">
        {brands.map(brand => {
          const brandId = brand.id || brand._id || '';
          return (
            <div key={brandId} className={`bg-[#161B22] border rounded-2xl p-5 transition-colors ${brand.visible !== false ? 'border-[#30363D]' : 'border-red-500/20 opacity-60'}`}>
              <div className="flex flex-col md:flex-row gap-5">
                {/* Logo Preview */}
                <div className="space-y-3 shrink-0 w-full md:w-44">
                  <div className="w-full h-20 bg-[#0d1117] border border-[#30363D] rounded-xl flex items-center justify-center p-2 overflow-hidden relative">
                    {uploading === `${brandId}-image` ? (
                      <Loader2 size={20} className="text-[#2ee661] animate-spin" />
                    ) : brand.image ? (
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
                    <input
                      value={brand.name}
                      onChange={e => update(brand, 'name', e.target.value)}
                      placeholder="e.g. ASUS ROG"
                      className={inputCls}
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Logo</label>
                    <div className="flex gap-2">
                      <input
                        value={brand.image}
                        onChange={e => update(brand, 'image', e.target.value)}
                        placeholder="SVG or PNG URL"
                        className={`flex-1 ${inputCls}`}
                      />
                      <button
                        onClick={() => logoRefs.current[brandId]?.click()}
                        title="Upload logo file"
                        className="px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] hover:border-[#2ee661]/40 transition-colors"
                      >
                        <Upload size={16} />
                      </button>
                      <input
                        ref={el => (logoRefs.current[brandId] = el)}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleFileUpload(brand, 'image', e.target.files[0])}
                      />
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Banner Image (optional)</label>
                    <div className="flex gap-2">
                      <input
                        value={brand.banner || ''}
                        onChange={e => update(brand, 'banner', e.target.value)}
                        placeholder="Banner image URL"
                        className={`flex-1 ${inputCls}`}
                      />
                      <button
                        onClick={() => bannerRefs.current[brandId]?.click()}
                        title="Upload banner file"
                        className="px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] hover:border-[#2ee661]/40 transition-colors"
                      >
                        <Upload size={16} />
                      </button>
                      <input
                        ref={el => (bannerRefs.current[brandId] = el)}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleFileUpload(brand, 'banner', e.target.files[0])}
                      />
                    </div>
                  </div>

                  {/* Visibility & Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => toggleVisibility(brand)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                        brand.visible !== false
                          ? 'border-[#2ee661]/30 text-[#2ee661] bg-[#2ee661]/10'
                          : 'border-gray-700 text-gray-500 bg-transparent'
                      }`}
                    >
                      {brand.visible !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                      {brand.visible !== false ? 'Visible on store' : 'Hidden'}
                    </button>

                    <button
                      onClick={() => remove(brandId)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
