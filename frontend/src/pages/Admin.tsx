import React, { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Trash2, Plus, Save, Image as ImageIcon, Video, MonitorPlay, Tags, LayoutDashboard, UploadCloud, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for dashboard
const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const trafficData = [
  { name: 'Processors', views: 400 },
  { name: 'GPUs', views: 700 },
  { name: 'Memory', views: 200 },
  { name: 'Motherboards', views: 450 },
  { name: 'Storage', views: 300 },
];

export default function Admin() {
  const { heroImages, setHeroImages, videoUrl, setVideoUrl, accessories, setAccessories, brands, setBrands, saveSettings } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<{name: string, original: string, optimized: string, url: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addHeroImage = () => setHeroImages([...heroImages, '']);
  const updateHeroImage = (idx: number, val: string) => {
    const newImgs = [...heroImages];
    newImgs[idx] = val;
    setHeroImages(newImgs);
  };
  const removeHeroImage = (idx: number) => {
    setHeroImages(heroImages.filter((_, i) => i !== idx));
  };

  const addAccessory = () => {
    setAccessories([...accessories, { id: Date.now().toString(), name: 'New Accessory', image: '', colorClass: 'bg-gray-800', gradientClass: 'from-gray-700 to-gray-900' }]);
  };
  const updateAccessory = (id: string, field: string, val: string) => {
    setAccessories(accessories.map(acc => acc.id === id ? { ...acc, [field]: val } : acc));
  };
  const removeAccessory = (id: string) => {
    setAccessories(accessories.filter(acc => acc.id !== id));
  };

  const addBrand = () => {
    setBrands([...brands, { id: Date.now().toString(), name: 'New Brand', image: '', banner: '', visible: true }]);
  };
  const updateBrand = (id: string, field: string, val: any) => {
    setBrands(brands.map(brand => brand.id === id ? { ...brand, [field]: val } : brand));
  };
  const removeBrand = (id: string) => {
    setBrands(brands.filter(brand => brand.id !== id));
  };
  const toggleBrandVisibility = (id: string) => {
    setBrands(brands.map(brand => brand.id === id ? { ...brand, visible: !brand.visible } : brand));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadStatus('Processing and compressing images...');
    
    // Simulate bulk upload and optimization
    setTimeout(() => {
      const newUploads = Array.from(e.target.files as FileList).map((file: File) => {
        const originalSize = (file.size / 1024).toFixed(1);
        const optimizedSize = (file.size / 1024 * 0.4).toFixed(1); // Mock 60% compression
        return {
          name: file.name,
          original: `${originalSize} KB`,
          optimized: `${optimizedSize} KB`,
          url: URL.createObjectURL(file)
        };
      });
      setUploadedImages(prev => [...prev, ...newUploads]);
      setUploadStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1500);
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'brands', name: 'Brand Management', icon: Tags },
    { id: 'images', name: 'Bulk Image Upload', icon: UploadCloud },
    { id: 'hero', name: 'Hero Banner', icon: ImageIcon },
    { id: 'video', name: 'Video Banner', icon: Video },
    { id: 'accessories', name: 'Accessories', icon: MonitorPlay },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-16 pt-32">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Admin Dashboard</h1>
          <button onClick={saveSettings} className="bg-[#2ee661] text-black px-6 py-3 rounded-xl font-bold uppercase flex items-center gap-2 hover:bg-[#24c24e] transition-colors shadow-lg shadow-[#2ee661]/20">
            <Save size={20} /> Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              >
                <tab.icon size={20} className={activeTab === tab.id ? 'text-[#2ee661]' : ''} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[600px]">
            
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black mb-2">Store Analytics Overview</h2>
                  <p className="text-gray-500 mb-6">Visualize recent sales data and product category traffic.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4 uppercase tracking-wider text-sm">Weekly Sales (LKR)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Line type="monotone" dataKey="sales" stroke="#2ee661" strokeWidth={3} dot={{r: 4, fill: '#2ee661', strokeWidth: 0}} activeDot={{r: 6}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4 uppercase tracking-wider text-sm">Category Traffic</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trafficData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                          <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'brands' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black mb-2">Brand Management</h2>
                  <p className="text-gray-500 mb-6">CRUD hardware brands, assign banners, and toggle home page visibility.</p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {brands.map((brand) => (
                    <div key={brand.id} className={`bg-gray-50 p-4 rounded-xl border ${brand.visible !== false ? 'border-gray-200' : 'border-red-200 opacity-60'} flex flex-col md:flex-row gap-6`}>
                      
                      {/* Left: Logos & Banner Preview */}
                      <div className="w-full md:w-48 space-y-4 shrink-0">
                        <div className="w-full h-24 bg-white rounded-lg border border-gray-200 p-2 flex items-center justify-center">
                          {brand.image ? (
                            <img src={brand.image} alt={brand.name} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <span className="text-xs text-gray-400">No Logo</span>
                          )}
                        </div>
                        {brand.banner && (
                          <div className="w-full h-16 bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src={brand.banner} className="w-full h-full object-cover" />
                            <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold tracking-widest uppercase">Banner</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Inputs */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Brand Name</label>
                          <input type="text" value={brand.name} onChange={(e) => updateBrand(brand.id, 'name', e.target.value)} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. ASUS ROG" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Logo Image URL</label>
                          <input type="text" value={brand.image} onChange={(e) => updateBrand(brand.id, 'image', e.target.value)} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="SVG or PNG URL" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Banner Image URL (Optional)</label>
                          <input type="text" value={brand.banner || ''} onChange={(e) => updateBrand(brand.id, 'banner', e.target.value)} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="URL for brand spotlight banner" />
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                          <button 
                            onClick={() => toggleBrandVisibility(brand.id)} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${brand.visible !== false ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                          >
                            {brand.visible !== false ? <><Eye size={16} /> Visible on Home</> : <><EyeOff size={16} /> Hidden</>}
                          </button>
                          <button onClick={() => removeBrand(brand.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg ml-auto flex items-center gap-2 text-sm font-bold">
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addBrand} className="border-2 border-dashed border-gray-300 text-gray-500 rounded-xl p-6 font-bold flex items-center justify-center gap-2 hover:border-[#2ee661] hover:text-[#2ee661] transition-colors">
                    <Plus size={20} /> Add New Brand
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'images' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black mb-2">Bulk Image Optimization</h2>
                  <p className="text-gray-500 mb-6">Upload product gallery images. Images are automatically compressed and tagged with metadata.</p>
                </div>

                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Drag & Drop Images</h3>
                  <p className="text-gray-500 mb-6 text-sm">Supports JPG, PNG, WEBP (Max 10MB per file)</p>
                  
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                  >
                    Select Files
                  </button>
                  {uploadStatus && (
                    <p className="mt-4 text-sm font-bold text-blue-600 animate-pulse">{uploadStatus}</p>
                  )}
                </div>

                {uploadedImages.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-gray-900 mb-4">Recently Processed ({uploadedImages.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uploadedImages.map((img, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                          <div className="h-32 bg-gray-100">
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-bold truncate text-gray-800">{img.name}</p>
                            <div className="flex justify-between items-center mt-2 text-[10px] uppercase font-bold tracking-wider">
                              <span className="text-gray-400 line-through">{img.original}</span>
                              <span className="text-[#2ee661] bg-[#2ee661]/10 px-2 py-0.5 rounded text-black">{img.optimized}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'hero' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black mb-2">Hero Slider Images</h2>
                  <p className="text-gray-500 mb-6">Manage the main image carousel on the home page.</p>
                </div>
                {heroImages.map((img, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <img src={img || 'https://via.placeholder.com/150'} alt="preview" className="w-24 h-16 object-cover rounded-lg bg-gray-200" />
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Image URL {idx + 1}</label>
                      <input type="text" value={img} onChange={(e) => updateHeroImage(idx, e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-[#2ee661]" />
                    </div>
                    <button onClick={() => removeHeroImage(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg mt-5"><Trash2 size={20} /></button>
                  </div>
                ))}
                <button onClick={addHeroImage} className="w-full border-2 border-dashed border-gray-300 text-gray-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-[#2ee661] hover:text-[#2ee661] transition-colors">
                  <Plus size={20} /> Add Hero Image
                </button>
              </motion.div>
            )}

            {activeTab === 'video' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black mb-2">Video Banner</h2>
                  <p className="text-gray-500 mb-6">Update the promotional YouTube video on the home page.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <label className="text-xs font-bold text-gray-500 uppercase">MP4 Video URL</label>
                  <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mt-2 focus:outline-none focus:border-[#2ee661]" placeholder="https://www.youtube.com/embed/..." />
                  
                  <div className="mt-6 aspect-video rounded-lg overflow-hidden bg-black">
                    <video src={videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'accessories' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black mb-2">Shop Accessories Section</h2>
                  <p className="text-gray-500 mb-6">Manage the colored category blocks on the home page.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accessories.map((acc) => (
                    <div key={acc.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4 relative">
                      <button onClick={() => removeAccessory(acc.id)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1.5 rounded-lg z-20"><Trash2 size={16} /></button>
                      <div className={`w-full h-24 rounded-lg flex items-center justify-center relative overflow-hidden bg-gradient-to-r ${acc.gradientClass}`}>
                         <img src={acc.image} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
                         <span className="relative z-10 text-white font-black drop-shadow-md">{acc.name}</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Category Name</label>
                        <input type="text" value={acc.name} onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Image URL</label>
                        <input type="text" value={acc.image} onChange={(e) => updateAccessory(acc.id, 'image', e.target.value)} className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Tailwind Gradient Classes</label>
                        <input type="text" value={acc.gradientClass} onChange={(e) => updateAccessory(acc.id, 'gradientClass', e.target.value)} className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm" placeholder="from-red-500 to-pink-500" />
                      </div>
                    </div>
                  ))}
                  <button onClick={addAccessory} className="h-full min-h-[250px] border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold flex flex-col items-center justify-center gap-2 hover:border-[#2ee661] hover:text-[#2ee661] transition-colors">
                    <Plus size={24} /> Add Category
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
