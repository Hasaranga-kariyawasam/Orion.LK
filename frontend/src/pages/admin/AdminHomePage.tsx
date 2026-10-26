import React, { useRef, useState } from 'react';
import { Upload, Trash2, Plus, Video, Image as ImageIcon, Phone, MapPin, Star, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { resolveMediaUrl, uploadImageToServer } from '../../lib/api';
import { BUILD_CATEGORIES } from '../../lib/buildCategories';
import { DEFAULT_BEST_SELLER_BANNER_IMAGE, matchesCategoryName } from '../../lib/homeProductSections';

const GRADIENT_PRESETS = [
  'from-purple-800 to-indigo-600',
  'from-rose-500 to-pink-500',
  'from-blue-600 to-cyan-500',
  'from-emerald-600 to-teal-500',
  'from-orange-500 to-red-500',
  'from-yellow-500 to-orange-500',
];

export default function AdminHomePage({ onSaved }: { onSaved?: () => void }) {
  const {
    heroImages, setHeroImages,
    videoUrl, setVideoUrl,
    accessories, setAccessories,
    featuredImages, setFeaturedImages,
    pcBuildCards, setPcBuildCards,
    homePromoCards, setHomePromoCards,
    brandBanner, setBrandBanner,
    secondBannerImage, setSecondBannerImage,
    homeProductCategories, setHomeProductCategories,
    bestSellerBannerImage, setBestSellerBannerImage,
    pcBuildCategoryMap, setPcBuildCategoryMap, categories,
    brands,
    products, bestSellerIds, setBestSellerIds,
    whatsappNumber, setWhatsappNumber,
    storeAddress, setStoreAddress,
    saveSettings,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'hero' | 'brand-banner' | 'second-banner' | 'featured' | 'pc-builds' | 'pc-build-categories' | 'promos' | 'video' | 'accessories' | 'bestsellers' | 'contact'>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const heroFileRefs = useRef<HTMLInputElement[]>([]);
  const newHeroRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');
    try {
      await saveSettings();
      setSaveMessage('Home page settings saved.');
      onSaved?.();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save home page settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const addHeroImage = () => setHeroImages([...heroImages, '']);
  const updateHeroImage = (i: number, val: string) => { const n = [...heroImages]; n[i] = val; setHeroImages(n); };
  const removeHeroImage = (i: number) => setHeroImages(heroImages.filter((_, j) => j !== i));
  const handleHeroFile = async (i: number, file: File) => {
    try {
      updateHeroImage(i, await uploadImageToServer(file));
    } catch (err: any) {
      alert('Image upload failed: ' + (err.message || 'Unknown error'));
    }
  };
  const handleSecondBannerFile = async (file: File) => {
    try {
      setSecondBannerImage(await uploadImageToServer(file));
    } catch (err: any) {
      alert('Image upload failed: ' + (err.message || 'Unknown error'));
    }
  };
  const handleBestSellerBannerFile = async (file: File) => {
    try {
      setBestSellerBannerImage(await uploadImageToServer(file));
    } catch (err: any) {
      alert('Image upload failed: ' + (err.message || 'Unknown error'));
    }
  };
  const handleBrandBannerFile = async (file: File) => {
    try {
      const image = await uploadImageToServer(file);
      setBrandBanner({ ...brandBanner, image });
    } catch (err: any) {
      alert('Image upload failed: ' + (err.message || 'Unknown error'));
    }
  };

  const updateFeaturedImage = (id: string, url: string) => {
    setFeaturedImages(featuredImages.map(image => image.id === id ? { ...image, url } : image));
  };

  const updatePcBuildCard = (id: string, field: 'eyebrow' | 'title' | 'image' | 'alt', value: string) => {
    setPcBuildCards(pcBuildCards.map(card => card.id === id ? { ...card, [field]: value } : card));
  };

  const updatePromoCard = (id: string, field: string, value: string) => {
    setHomePromoCards(homePromoCards.map(card => card.id === id ? { ...card, [field]: value } : card));
  };

  const handleFeaturedFile = async (id: string, file: File) => {
    try {
      const url = await uploadImageToServer(file);
      updateFeaturedImage(id, url);
    } catch (err: any) {
      alert('Image upload failed: ' + (err.message || 'Unknown error'));
    }
  };

  const addAccessory = () => setAccessories([...accessories, { id: Date.now().toString(), name: 'New Category', image: '', colorClass: 'bg-gray-800', gradientClass: 'from-gray-700 to-gray-900' }]);
  const updateAccessory = (id: string, field: string, val: string) => setAccessories(accessories.map(a => a.id === id ? { ...a, [field]: val } : a));
  const removeAccessory = (id: string) => setAccessories(accessories.filter(a => a.id !== id));

  const toggleBestSeller = (id: string) => {
    setBestSellerIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const inputCls = "w-full bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#2ee661]/50";
  const haylouBrandBanner = brandBanner.image
    || brands.find(brand => brand.name.toLowerCase() === 'haylou')?.banner
    || products.find(product => product.brand?.toLowerCase() === 'haylou' || product.name.toLowerCase().includes('haylou'))?.image
    || '';

  const tabs = [
    { id: 'hero', label: 'Hero Banner', icon: ImageIcon },
    { id: 'brand-banner', label: 'Haylou Banner', icon: ImageIcon },
    { id: 'second-banner', label: 'Second Banner', icon: ImageIcon },
    { id: 'home-products', label: 'Home Products', icon: Plus },
    { id: 'featured', label: 'Featured Images', icon: ImageIcon },
    { id: 'pc-builds', label: 'PC Builds', icon: ImageIcon },
    { id: 'pc-build-categories', label: 'Build Categories', icon: Plus },
    { id: 'promos', label: 'Promo Cards', icon: ImageIcon },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'accessories', label: 'Accessories', icon: Plus },
    { id: 'bestsellers', label: 'Best Sellers', icon: Star },
    { id: 'contact', label: 'Contact Info', icon: Phone },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Home Page</h2>
          <p className="text-gray-500 text-sm mt-1">Customize the home page content</p>
        </div>
        <button onClick={() => void handleSave()} disabled={isSaving} className="flex items-center gap-2 bg-[#2ee661] text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#24c24e] transition-colors disabled:opacity-60">
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
      {(saveMessage || saveError) && (
        <p role={saveError ? 'alert' : 'status'} className={`text-sm font-medium ${saveError ? 'text-red-400' : 'text-green-400'}`}>
          {saveError || saveMessage}
        </p>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-[#0d1117] border border-[#30363D] rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === t.id ? 'bg-[#2ee661] text-black' : 'text-gray-400 hover:text-white'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* Hero Banner */}
      {activeTab === 'hero' && (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Upload or set URLs for the main hero slider. The first image is shown by default.</p>
          {heroImages.map((img, i) => (
            <div key={i} className="flex gap-4 items-center bg-[#161B22] border border-[#30363D] p-4 rounded-2xl">
              <div className="w-24 h-16 rounded-xl overflow-hidden bg-[#0d1117] shrink-0">
                {img ? <img src={img} alt={`Hero ${i + 1}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No image</div>}
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Slide {i + 1}</label>
                <div className="flex gap-2">
                  <input value={img} onChange={e => updateHeroImage(i, e.target.value)}
                    placeholder="Image URL..." className={`flex-1 ${inputCls}`} />
                  <button onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file'; input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) void handleHeroFile(i, file);
                    };
                    input.click();
                  }} className="px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] hover:border-[#2ee661]/40 transition-colors">
                    <Upload size={16} />
                  </button>
                </div>
              </div>
              <button onClick={() => removeHeroImage(i)} className="p-2 text-gray-600 hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button onClick={addHeroImage}
            className="w-full border-2 border-dashed border-[#30363D] hover:border-[#2ee661]/50 text-gray-600 hover:text-[#2ee661] py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors text-sm">
            <Plus size={18} /> Add Hero Slide
          </button>
        </div>
      )}

      {activeTab === 'brand-banner' && (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Upload or set the Haylou banner image. Recommended image dimensions: 740 × 334 px. The home page banner displays the image without text.</p>
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
            <div className="w-full max-w-[740px] aspect-[370/167] rounded-xl bg-white overflow-hidden">
              {haylouBrandBanner && <img src={resolveMediaUrl(haylouBrandBanner)} alt="Haylou banner preview" className="w-full h-full object-contain" />}
            </div>
            <div className="flex gap-2">
              <input value={brandBanner.image} onChange={event => setBrandBanner({ ...brandBanner, image: event.target.value })} placeholder="Banner image URL..." className={`flex-1 ${inputCls}`} />
              <label className="px-4 py-3 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] hover:border-[#2ee661]/40 transition-colors cursor-pointer">
                <Upload size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={event => {
                  const file = event.target.files?.[0];
                  if (file) void handleBrandBannerFile(file);
                  event.target.value = '';
                }} />
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'second-banner' && (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Upload or set the second home page banner image. Recommended image dimensions: 740 × 334 px. The banner displays the image without text.</p>
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
            <div className="w-full max-w-[740px] aspect-[370/167] rounded-xl bg-white overflow-hidden">
              {secondBannerImage && <img src={resolveMediaUrl(secondBannerImage)} alt="Second banner preview" className="w-full h-full object-contain" />}
            </div>
            <div className="flex gap-2">
              <input value={secondBannerImage} onChange={event => setSecondBannerImage(event.target.value)} placeholder="Banner image URL..." className={`flex-1 ${inputCls}`} />
              <label className="px-4 py-3 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] hover:border-[#2ee661]/40 transition-colors cursor-pointer">
                <Upload size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={event => {
                  const file = event.target.files?.[0];
                  if (file) void handleSecondBannerFile(file);
                  event.target.value = '';
                }} />
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'home-products' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Product categories on Home</h3>
            <p className="text-gray-500 text-sm mt-1">Select categories to show as product sections on the home page. Each section displays up to four live products from your catalog.</p>
          </div>
          {products.length === 0 ? (
            <p className="rounded-xl border border-[#30363D] bg-[#161B22] p-4 text-sm text-gray-400">No catalog products are available yet. Add products with categories first.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Array.from(new Set<string>(products.map(product => product.category.trim()).filter(Boolean))).sort().map(category => {
                const checked = homeProductCategories.some(selected => matchesCategoryName(selected, category));
                return (
                  <label key={category} className="flex items-center gap-2 rounded-lg bg-[#161B22] border border-[#30363D] px-3 py-3 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setHomeProductCategories(checked
                        ? homeProductCategories.filter(selected => !matchesCategoryName(selected, category))
                        : [...homeProductCategories, category])}
                      className="accent-[#2ee661]"
                    />
                    {category}
                  </label>
                );
              })}
            </div>
          )}
          <p className="text-xs text-gray-500">{homeProductCategories.length} categories selected</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="min-h-11 rounded-xl bg-[#2ee661] px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#24c24e] disabled:opacity-60"
            >
              {isSaving ? 'Saving categories...' : 'Save Home Categories'}
            </button>
            <span className="text-xs text-gray-500">Save the selected product categories to the Home page.</span>
          </div>
        </div>
      )}

      {/* Featured Images */}
      {activeTab === 'featured' && (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Change the three image cards displayed beside the main hero banner.</p>
          {featuredImages.map(image => (
            <div key={image.id} className="flex gap-4 items-center bg-[#161B22] border border-[#30363D] p-4 rounded-2xl">
              <div className="w-28 h-20 rounded-xl overflow-hidden bg-[#0d1117] shrink-0">
                {image.url ? <img src={image.url} alt={image.alt} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No image</div>}
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">{image.label}</label>
                <div className="flex gap-2">
                  <input value={image.url} onChange={e => updateFeaturedImage(image.id, e.target.value)}
                    placeholder="Image URL..." className={`flex-1 ${inputCls}`} />
                  <label className="px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] hover:border-[#2ee661]/40 transition-colors cursor-pointer">
                    <Upload size={16} />
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) void handleFeaturedFile(image.id, file);
                        e.currentTarget.value = '';
                      }} />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video */}
      {activeTab === 'promos' && (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Edit every promotional image, text and button destination shown on the home page.</p>
          {homePromoCards.map(card => (
            <div key={card.id} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={card.eyebrow} onChange={e => updatePromoCard(card.id, 'eyebrow', e.target.value)} placeholder="Small heading" className={inputCls} />
                <input value={card.alt} onChange={e => updatePromoCard(card.id, 'alt', e.target.value)} placeholder="Image alt text" className={inputCls} />
                <textarea value={card.title} onChange={e => updatePromoCard(card.id, 'title', e.target.value)} placeholder="Main title (use a new line for line breaks)" rows={2} className={`${inputCls} resize-none`} />
                <input value={card.description} onChange={e => updatePromoCard(card.id, 'description', e.target.value)} placeholder="Description / price" className={inputCls} />
                <input value={card.buttonText} onChange={e => updatePromoCard(card.id, 'buttonText', e.target.value)} placeholder="Button text" className={inputCls} />
                <input value={card.href} onChange={e => updatePromoCard(card.id, 'href', e.target.value)} placeholder="Redirect path, e.g. /shop?category=Keyboards" className={inputCls} />
                <div className="md:col-span-2 flex gap-2">
                  <input value={card.image} onChange={e => updatePromoCard(card.id, 'image', e.target.value)} placeholder="Image URL..." className={`flex-1 ${inputCls}`} />
                  <label className="px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] cursor-pointer flex items-center">
                    <Upload size={16} />
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        updatePromoCard(card.id, 'image', await uploadImageToServer(file));
                      } catch (err: any) {
                        alert('Image upload failed: ' + (err.message || 'Unknown error'));
                      }
                      e.currentTarget.value = '';
                    }} />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video */}
      {activeTab === 'pc-builds' && (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Change the three PC Build cards shown on the home page. Use a new line in the title to split it into two lines.</p>
          {pcBuildCards.map(card => (
            <div key={card.id} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-32 h-24 rounded-xl overflow-hidden bg-[#0d1117] shrink-0">
                  {card.image ? <img src={card.image} alt={card.alt} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No image</div>}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={card.eyebrow} onChange={e => updatePcBuildCard(card.id, 'eyebrow', e.target.value)} placeholder="Small label" className={inputCls} />
                  <input value={card.alt} onChange={e => updatePcBuildCard(card.id, 'alt', e.target.value)} placeholder="Image alt text" className={inputCls} />
                  <textarea value={card.title} onChange={e => updatePcBuildCard(card.id, 'title', e.target.value)} placeholder="Card title" rows={2} className={`${inputCls} resize-none`} />
                  <div className="flex gap-2">
                    <input value={card.image} onChange={e => updatePcBuildCard(card.id, 'image', e.target.value)} placeholder="Image URL..." className={inputCls} />
                    <label className="px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] cursor-pointer flex items-center">
                      <Upload size={16} />
                      <input type="file" accept="image/*" className="hidden" onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          updatePcBuildCard(card.id, 'image', await uploadImageToServer(file));
                        } catch (err: any) {
                          alert('Image upload failed: ' + (err.message || 'Unknown error'));
                        }
                        e.currentTarget.value = '';
                      }} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'pc-build-categories' && (
        <div className="space-y-5">
          <p className="text-gray-500 text-sm">Choose the database product categories allowed in each Build My PC section. Products outside the selected categories will not appear in that section.</p>
          {BUILD_CATEGORIES.map(buildCategory => {
            const selectedCategories = pcBuildCategoryMap[buildCategory.id] || [];
            return (
              <section key={buildCategory.id} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">{buildCategory.name}</h3>
                {categories.length === 0 ? (
                  <p className="text-sm text-amber-400">No database categories are available to assign.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {categories.map(category => {
                      const checked = selectedCategories.includes(category.name);
                      return (
                        <label key={category.id} className="flex items-center gap-2 rounded-lg bg-[#0d1117] border border-[#30363D] px-3 py-2 text-sm text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setPcBuildCategoryMap({
                              ...pcBuildCategoryMap,
                              [buildCategory.id]: checked
                                ? selectedCategories.filter(name => name !== category.name)
                                : [...selectedCategories, category.name],
                            })}
                            className="accent-[#2ee661]"
                          />
                          {category.name}
                        </label>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3">{selectedCategories.length} categories selected</p>
              </section>
            );
          })}
        </div>
      )}

      {/* Video */}
      {activeTab === 'video' && (
        <div className="space-y-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Video URL (MP4 or YouTube Embed)</label>
            <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className={inputCls} placeholder="https://..." />
            <div className="aspect-video rounded-xl overflow-hidden bg-[#0d1117] border border-[#30363D]">
              {videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? (
                <iframe src={videoUrl.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen />
              ) : (
                <video src={videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Accessories */}
      {activeTab === 'accessories' && (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Manage the colorful category cards shown in the "Shop Accessories" section.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessories.map(acc => (
              <div key={acc.id} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 space-y-3 relative">
                <button onClick={() => removeAccessory(acc.id)} className="absolute top-3 right-3 p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
                <div className={`w-full h-20 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-r ${acc.gradientClass} relative`}>
                  {acc.image && <img src={acc.image} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" />}
                  <span className="relative z-10 text-white font-black text-sm drop-shadow">{acc.name}</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name</label>
                  <input value={acc.name} onChange={e => updateAccessory(acc.id, 'name', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Image URL</label>
                  <div className="flex gap-2">
                    <input value={acc.image} onChange={e => updateAccessory(acc.id, 'image', e.target.value)} className={`flex-1 ${inputCls}`} placeholder="https://..." />
                    <label className="px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] hover:border-[#2ee661]/40 transition-colors cursor-pointer flex items-center">
                      <Upload size={16} />
                      <input type="file" accept="image/*" className="hidden"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              updateAccessory(acc.id, 'image', await uploadImageToServer(file));
                            } catch (err: any) {
                              alert('Image upload failed: ' + (err.message || 'Unknown error'));
                            }
                          }
                          e.currentTarget.value = '';
                        }} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Gradient</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {GRADIENT_PRESETS.map(g => (
                      <button key={g} onClick={() => updateAccessory(acc.id, 'gradientClass', g)}
                        className={`w-8 h-8 rounded-lg bg-gradient-to-r ${g} border-2 transition-all ${acc.gradientClass === g ? 'border-white scale-110' : 'border-transparent'}`} />
                    ))}
                  </div>
                  <input value={acc.gradientClass} onChange={e => updateAccessory(acc.id, 'gradientClass', e.target.value)}
                    placeholder="from-purple-800 to-indigo-600" className={`${inputCls} text-xs`} />
                </div>
              </div>
            ))}
            <button onClick={addAccessory}
              className="min-h-[220px] border-2 border-dashed border-[#30363D] hover:border-[#2ee661]/50 text-gray-600 hover:text-[#2ee661] rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-colors text-sm">
              <Plus size={22} /> Add Accessory Card
            </button>
          </div>
        </div>
      )}

      {/* Best Sellers */}
      {activeTab === 'bestsellers' && (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Choose the campaign image and products shown in the home page Best Sellers section.</p>
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Campaign image</label>
            <div className="flex gap-4 items-start">
              <img
                src={bestSellerBannerImage === DEFAULT_BEST_SELLER_BANNER_IMAGE ? DEFAULT_BEST_SELLER_BANNER_IMAGE : resolveMediaUrl(bestSellerBannerImage)}
                alt="Best Sellers campaign preview"
                className="w-36 h-[19rem] rounded-xl object-cover object-center bg-gray-900"
              />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-bold text-white">Best Sellers campaign banner</p>
                <div className="flex gap-2">
                  <input aria-label="Best Sellers campaign image URL" value={bestSellerBannerImage} onChange={event => setBestSellerBannerImage(event.target.value)} placeholder="Campaign image URL..." className={`flex-1 ${inputCls}`} />
                  <label aria-label="Upload Best Sellers campaign image" className="px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-xl text-gray-400 hover:text-[#2ee661] hover:border-[#2ee661]/40 transition-colors cursor-pointer flex items-center">
                    <Upload size={16} />
                    <input type="file" accept="image/*" className="hidden" onChange={event => {
                      const file = event.target.files?.[0];
                      if (file) void handleBestSellerBannerFile(file);
                      event.target.value = '';
                    }} />
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs text-gray-500">The preview shows the same campaign crop used beside the two-row product grid on the home page.</p>
                  <button
                    type="button"
                    onClick={() => setBestSellerBannerImage(DEFAULT_BEST_SELLER_BANNER_IMAGE)}
                    className="text-xs font-bold text-[#2ee661] hover:text-white"
                  >
                    Restore reference image
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {products.map(p => {
              const isSelected = bestSellerIds.includes(p.id);
              return (
                <button key={p.id} onClick={() => toggleBestSeller(p.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isSelected ? 'border-[#2ee661]/50 bg-[#2ee661]/5' : 'border-[#30363D] bg-[#161B22] hover:border-[#2ee661]/30'}`}>
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{p.name}</p>
                    <p className="text-gray-500 text-xs">{p.category}</p>
                    <p className="text-[#2ee661] text-xs font-bold mt-0.5">LKR {p.price.toLocaleString()}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#2ee661] border-[#2ee661]' : 'border-[#30363D]'}`}>
                    {isSelected && <span className="text-black text-xs font-black">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500">{bestSellerIds.length} products selected</p>
        </div>
      )}

      {/* Contact Info */}
      {activeTab === 'contact' && (
        <div className="space-y-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                <Phone size={14} /> WhatsApp Number
              </label>
              <input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="+94 77 123 4567" className={inputCls} />
              <p className="text-xs text-gray-600 mt-2">Used for the WhatsApp chat button on the site</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                <MapPin size={14} /> Store Address
              </label>
              <textarea value={storeAddress} onChange={e => setStoreAddress(e.target.value)}
                rows={3} placeholder="No. 123, Main Street, Colombo 03, Sri Lanka" className={`${inputCls} resize-none`} />
            </div>
            <button onClick={saveSettings}
              className="w-full bg-[#2ee661] text-black font-bold py-3 rounded-xl hover:bg-[#24c24e] transition-colors">
              Save Contact Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
