import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, X, Plus, Trash2, Hash, ChevronDown } from 'lucide-react';
import { useAdmin, AdminProductItem } from '../../context/AdminContext';
import { BRAND_NEW_CATEGORIES, USED_CATEGORIES } from '../../data';

const WARRANTY_OPTIONS = ['No Warranty', '3 Months', '6 Months', '12 Months', '18 Months', '24 Months', 'Custom'];
const COLOR_OPTIONS = ['Black', 'White', 'Silver', 'Grey', 'Red', 'Blue', 'Green', 'Gold', 'Rose Gold', 'Space Grey', 'Navy Blue', 'Orange'];
const SPEC_TEMPLATES: Record<string, string[]> = {
  'Graphics Cards': ['Graphics Engine', 'Bus Standard', 'OpenGL', 'Video Memory', 'Engine Clock', 'CUDA Core', 'Memory Speed', 'Memory Interface'],
  'Processors': ['Socket Type', 'Core Count', 'Thread Count', 'Base Clock', 'Boost Clock', 'Cache', 'TDP', 'Integrated Graphics'],
  'RAM': ['Capacity', 'Type', 'Speed', 'Latency', 'Voltage', 'Form Factor'],
  'Monitors': ['Panel Type', 'Screen Size', 'Resolution', 'Refresh Rate', 'Response Time', 'Brightness', 'Contrast Ratio', 'Ports'],
  'Keyboards': ['Switch Type', 'Layout', 'Connectivity', 'Backlight', 'Anti-Ghosting', 'Keycaps Material'],
};

const ALL_CATEGORIES = [
  ...BRAND_NEW_CATEGORIES.map(c => ({ name: c.name, type: 'Brand New' })),
  ...USED_CATEGORIES.map(c => ({ name: c.name, type: 'Used' })),
];

interface AddItemProps {
  onBack: () => void;
  editId?: string;
}

export default function AdminAddItem({ onBack, editId }: AddItemProps) {
  const { products, setProducts, categories } = useAdmin();
  const existingProduct = editId ? products.find(p => p.id === editId) : null;

  const [name, setName] = useState(existingProduct?.name || '');
  const [brand, setBrand] = useState(existingProduct?.brand || '');
  const [categoryType, setCategoryType] = useState<'Brand New' | 'Used'>('Brand New');
  const [category, setCategory] = useState(existingProduct?.category || '');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [price, setPrice] = useState(existingProduct?.price?.toString() || '');
  const [originalPrice, setOriginalPrice] = useState(existingProduct?.originalPrice?.toString() || '');
  const [discount, setDiscount] = useState(existingProduct?.discount?.toString() || '');
  const [stock, setStock] = useState((existingProduct as any)?.stock?.toString() || '0');
  const [inStock, setInStock] = useState((existingProduct?.status || 'In Stock') === 'In Stock');
  const [warranty, setWarranty] = useState((existingProduct as any)?.warranty || '6 Months');
  const [customWarranty, setCustomWarranty] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>((existingProduct as any)?.colors || []);
  const [customColor, setCustomColor] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(existingProduct?.hashtags || []);
  const [hashtagInput, setHashtagInput] = useState('');
  const [descriptionTab, setDescriptionTab] = useState<'description' | 'shipping'>('description');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [shortDescription, setShortDescription] = useState(existingProduct?.shortDescription || '');
  const [shippingDescription, setShippingDescription] = useState((existingProduct as any)?.descriptionShipping || '');
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    existingProduct?.specifications ? Object.entries(existingProduct.specifications).map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }]
  );
  const [images, setImages] = useState<{ url: string; file?: File }[]>(
    existingProduct?.images?.map(url => ({ url })) || []
  );
  const [tags, setTags] = useState<string[]>(existingProduct?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [sku, setSku] = useState(existingProduct?.sku || '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-load spec template when category changes
  useEffect(() => {
    if (!editId && SPEC_TEMPLATES[category]) {
      setSpecs(SPEC_TEMPLATES[category].map(key => ({ key, value: '' })));
    }
  }, [category]);

  // Auto-calculate discount
  useEffect(() => {
    if (price && originalPrice) {
      const p = parseFloat(price), op = parseFloat(originalPrice);
      if (op > p) setDiscount(Math.round(((op - p) / op) * 100).toString());
    }
  }, [price, originalPrice]);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newImgs = Array.from(e.target.files).map((file: File) => ({ url: URL.createObjectURL(file as Blob), file }));
    setImages(prev => [...prev, ...newImgs]);
  };

  const removeImage = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(`#${tag}`)) setHashtags(prev => [...prev, `#${tag}`]);
    setHashtagInput('');
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const toggleColor = (c: string) => {
    setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const addCustomColor = () => {
    if (customColor.trim() && !selectedColors.includes(customColor.trim())) {
      setSelectedColors(prev => [...prev, customColor.trim()]);
      setCustomColor('');
    }
  };

  const filteredCategories = ALL_CATEGORIES.filter(c => c.type === categoryType);

  const handleSave = () => {
    setSaving(true);
    const finalCategory = showNewCategory && newCategory ? newCategory : category;
    const finalWarranty = warranty === 'Custom' ? customWarranty : warranty;
    const specsObj: Record<string, string> = {};
    specs.filter(s => s.key && s.value).forEach(s => { specsObj[s.key] = s.value; });

    const newProduct: AdminProductItem = {
      id: editId || Date.now().toString(),
      name, brand, category: finalCategory,
      price: parseFloat(price) || 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      discount: discount ? parseInt(discount) : undefined,
      rating: existingProduct?.rating || 4.5,
      reviews: existingProduct?.reviews || 0,
      image: images[0]?.url || '',
      images: images.map(i => i.url),
      isNew: !editId,
      status: inStock ? 'In Stock' : 'Out of Stock',
      description, shortDescription,
      sku, tags, hashtags,
      specifications: specsObj,
      stock: parseInt(stock) || 0,
      warranty: finalWarranty,
      colors: selectedColors,
      descriptionShipping: shippingDescription,
    };

    setTimeout(() => {
      if (editId) {
        setProducts(products.map(p => p.id === editId ? newProduct : p));
      } else {
        setProducts([newProduct, ...products]);
      }
      setSaving(false);
      onBack();
    }, 600);
  };

  const labelCls = "text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block";
  const inputCls = "w-full bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#2ee661]/60 transition-colors";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white">{editId ? 'Edit Product' : 'Add New Item'}</h2>
          <p className="text-gray-500 text-sm mt-0.5">Fill in product details below</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-[#30363D] pb-3">Basic Information</h3>

            <div>
              <label className={labelCls}>Product Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Brand</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. ASUS" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>SKU</label>
                <input value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. ROG-RTX4090-O24G" className={inputCls} />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>Category *</label>
              <div className="flex gap-3 mb-3">
                {(['Brand New', 'Used'] as const).map(t => (
                  <button key={t} onClick={() => { setCategoryType(t); setCategory(''); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${categoryType === t ? 'bg-[#2ee661] text-black' : 'bg-[#0d1117] border border-[#30363D] text-gray-400'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <select value={category} onChange={e => { setCategory(e.target.value); setShowNewCategory(false); }}
                  className={`flex-1 ${inputCls}`}>
                  <option value="">Select category...</option>
                  {filteredCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <button onClick={() => setShowNewCategory(v => !v)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${showNewCategory ? 'border-[#2ee661]/60 text-[#2ee661] bg-[#2ee661]/10' : 'border-[#30363D] text-gray-400 hover:border-[#2ee661]/40'}`}>
                  <Plus size={16} />
                </button>
              </div>
              {showNewCategory && (
                <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name..." className={`${inputCls} mt-3`} />
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-[#30363D] pb-3">Pricing</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Sale Price (LKR) *</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="850000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Original Price (LKR)</label>
                <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="890000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Discount %</label>
                <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Auto" className={inputCls} />
              </div>
            </div>
            {price && originalPrice && (
              <p className="text-xs text-[#2ee661]">
                Customer saves LKR {(parseFloat(originalPrice) - parseFloat(price)).toLocaleString()} ({discount}% off)
              </p>
            )}
          </div>

          {/* Description & Shipping */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden">
            <div className="flex border-b border-[#30363D]">
              {(['description', 'shipping'] as const).map(tab => (
                <button key={tab} onClick={() => setDescriptionTab(tab)}
                  className={`flex-1 py-3.5 text-sm font-bold transition-colors ${descriptionTab === tab ? 'text-[#2ee661] border-b-2 border-[#2ee661]' : 'text-gray-500 hover:text-white'}`}>
                  {tab === 'description' ? 'Description' : 'Shipping & Delivery'}
                </button>
              ))}
            </div>
            <div className="p-6 space-y-4">
              {descriptionTab === 'description' ? (
                <>
                  <div>
                    <label className={labelCls}>Short Description</label>
                    <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={2} placeholder="Brief product summary shown in cards..." className={`${inputCls} resize-none`} />
                  </div>
                  <div>
                    <label className={labelCls}>Full Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} placeholder="Full product description, features, tech specs narrative..." className={`${inputCls} resize-none`} />
                  </div>
                </>
              ) : (
                <div>
                  <label className={labelCls}>Shipping & Delivery Information</label>
                  <textarea value={shippingDescription} onChange={e => setShippingDescription(e.target.value)} rows={8}
                    placeholder="e.g. Free delivery in Colombo district&#10;Island-wide delivery: 2-5 business days&#10;Express delivery available at extra cost&#10;International shipping: not available" className={`${inputCls} resize-none`} />
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Specifications</h3>
              <button onClick={() => setSpecs(prev => [...prev, { key: '', value: '' }])}
                className="text-xs text-[#2ee661] flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Row
              </button>
            </div>
            <div className="space-y-3">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input value={s.key} onChange={e => setSpecs(prev => prev.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
                    placeholder="Spec name (e.g. Engine Clock)" className={`flex-1 ${inputCls}`} />
                  <input value={s.value} onChange={e => setSpecs(prev => prev.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                    placeholder="Value (e.g. OC mode: 2640 MHz)" className={`flex-1 ${inputCls}`} />
                  <button onClick={() => setSpecs(prev => prev.filter((_, j) => j !== i))} className="p-2 text-gray-600 hover:text-red-400 transition-colors shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags & Hashtags */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-[#30363D] pb-3">Tags & Hashtags</h3>
            <div>
              <label className={labelCls}>Search Tags</label>
              <div className="flex gap-2 mb-3">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Type and press Enter" className={`flex-1 ${inputCls}`} />
                <button onClick={addTag} className="px-4 py-3 rounded-xl bg-[#2ee661]/10 border border-[#2ee661]/30 text-[#2ee661] font-bold text-sm hover:bg-[#2ee661]/20 transition-colors">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 bg-[#0d1117] border border-[#30363D] text-gray-300 text-xs rounded-lg px-3 py-1.5">
                    {t}<button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="text-gray-600 hover:text-red-400"><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Hashtags</label>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={hashtagInput} onChange={e => setHashtagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                    placeholder="ASUSROG" className={`${inputCls} pl-9`} />
                </div>
                <button onClick={addHashtag} className="px-4 py-3 rounded-xl bg-[#2ee661]/10 border border-[#2ee661]/30 text-[#2ee661] font-bold text-sm hover:bg-[#2ee661]/20 transition-colors">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {hashtags.map(h => (
                  <span key={h} className="inline-flex items-center gap-1.5 bg-[#2ee661]/10 border border-[#2ee661]/20 text-[#2ee661] text-xs rounded-lg px-3 py-1.5">
                    {h}<button onClick={() => setHashtags(prev => prev.filter(x => x !== h))} className="text-[#2ee661]/50 hover:text-red-400"><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Images */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Product Images</h3>
            <div
              className="border-2 border-dashed border-[#30363D] hover:border-[#2ee661]/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} className="text-gray-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Click to upload images</p>
              <p className="text-xs text-gray-600 mt-1">JPG, PNG, WebP · Max 5MB each</p>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <div key={i} className={`relative group rounded-lg overflow-hidden aspect-square ${i === 0 ? 'ring-2 ring-[#2ee661]' : ''}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-1 left-1 bg-[#2ee661] text-black text-[9px] font-black px-1.5 py-0.5 rounded">PRIMARY</span>}
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock & Status */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Stock & Status</h3>
            <div>
              <label className={labelCls}>Stock Quantity</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div className="flex items-center justify-between bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-3">
              <span className="text-sm text-gray-300 font-medium">{inStock ? 'In Stock' : 'Out of Stock'}</span>
              <button onClick={() => setInStock(v => !v)}
                className={`w-12 h-6 rounded-full transition-colors relative ${inStock ? 'bg-[#2ee661]' : 'bg-gray-700'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${inStock ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Warranty */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Warranty</h3>
            <select value={warranty} onChange={e => setWarranty(e.target.value)} className={inputCls}>
              {WARRANTY_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            {warranty === 'Custom' && (
              <input value={customWarranty} onChange={e => setCustomWarranty(e.target.value)} placeholder="e.g. 90 Days Manufacturer Warranty" className={inputCls} />
            )}
          </div>

          {/* Colors */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Available Colors</h3>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button key={c} onClick={() => toggleColor(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${selectedColors.includes(c) ? 'bg-[#2ee661] text-black border-[#2ee661]' : 'bg-[#0d1117] text-gray-400 border-[#30363D] hover:border-[#2ee661]/40'}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={customColor} onChange={e => setCustomColor(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                placeholder="Custom color..." className={`flex-1 ${inputCls}`} />
              <button onClick={addCustomColor} className="px-3 py-2 rounded-xl bg-[#2ee661]/10 border border-[#2ee661]/30 text-[#2ee661] text-sm font-bold hover:bg-[#2ee661]/20 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            {selectedColors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedColors.map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 bg-[#2ee661]/10 text-[#2ee661] border border-[#2ee661]/20 text-xs rounded-lg px-2.5 py-1">
                    {c}<button onClick={() => toggleColor(c)} className="hover:text-red-400"><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving || !name || !price}
            className="w-full bg-[#2ee661] hover:bg-[#24c24e] text-black font-black py-4 rounded-2xl text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#2ee661]/20">
            {saving ? 'Saving...' : editId ? '✓ Update Product' : '✓ Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
