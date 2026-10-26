import React, { useState } from 'react';
import { Tag, Percent, Calendar, ToggleLeft, ToggleRight, Search, Star, Save, Upload } from 'lucide-react';
import { useAdmin, SpecialOffer } from '../../context/AdminContext';
import { broadcastAdminNotification, uploadImageToServer } from '../../lib/api';

const toDateTimeLocal = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const fromDateTimeLocal = (value: string) => value ? new Date(value).toISOString() : '';

export default function AdminSpecialOffers() {
  const {
    products,
    specialOffers,
    setSpecialOffers,
    specialOffersDeadline,
    setSpecialOffersDeadline,
    specialOffersBannerUrl,
    setSpecialOffersBannerUrl,
    saveSettings,
  } = useAdmin();
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const getOffer = (productId: string) => specialOffers.find(o => o.productId === productId);

  const toggleOffer = (productId: string) => {
    const existing = getOffer(productId);
    if (existing) {
      const enabled = !existing.enabled;
      setSpecialOffers(specialOffers.map(o => o.productId === productId ? { ...o, enabled } : o));
      if (enabled) {
        const product = products.find(item => item.id === productId);
        if (product) {
          void broadcastAdminNotification(
            'New Special Offer',
            `${product.name} is now on special offer. Check it out before it ends.`
          ).catch(error => console.error('Failed to broadcast special offer notification:', error));
        }
      }
    } else {
      setSpecialOffers([...specialOffers, { productId, badgeText: 'HOT DEAL', enabled: true }]);
      const product = products.find(item => item.id === productId);
      if (product) {
        void broadcastAdminNotification(
          'New Special Offer',
          `${product.name} is now on special offer. Check it out before it ends.`
        ).catch(error => console.error('Failed to broadcast special offer notification:', error));
      }
    }
  };

  const updateOffer = (productId: string, updates: Partial<SpecialOffer>) => {
    setSpecialOffers(specialOffers.map(o => o.productId === productId ? { ...o, ...updates } : o));
  };

  const removeOffer = (productId: string) => {
    setSpecialOffers(specialOffers.filter(o => o.productId !== productId));
  };

  const activeOffers = specialOffers.filter(o => o.enabled);

  const handleSaveOffers = async () => {
    await saveSettings();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">Special Offers</h2>
            <p className="text-gray-500 text-sm mt-1">{activeOffers.length} active offers</p>
          </div>
          <button
            onClick={handleSaveOffers}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2ee661] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#21d653] transition-colors"
          >
            <Save size={15} /> {saved ? 'Saved' : 'Save Offers'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl rounded-xl border border-[#30363D] bg-[#161B22] p-5 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-white">Offers Banner</h3>
          <p className="mt-1 text-xs text-gray-500">Choose the image displayed behind the special-offers page headline.</p>
        </div>
        {specialOffersBannerUrl && <img src={specialOffersBannerUrl} alt="Special offers banner preview" className="h-32 w-full rounded-lg object-cover" />}
        <div className="flex gap-2">
          <input value={specialOffersBannerUrl} onChange={e => setSpecialOffersBannerUrl(e.target.value)} placeholder="Banner image URL" className="min-w-0 flex-1 rounded-xl border border-[#30363D] bg-[#0d1117] px-4 py-2.5 text-sm text-white focus:border-[#2ee661]/50 focus:outline-none" />
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-[#30363D] bg-[#0d1117] px-3 text-gray-300 hover:text-[#2ee661]">
            <Upload size={16} />
            <input type="file" accept="image/*" className="hidden" onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              try { setSpecialOffersBannerUrl(await uploadImageToServer(file)); }
              catch (err: any) { alert('Image upload failed: ' + (err.message || 'Unknown error')); }
              e.currentTarget.value = '';
            }} />
          </label>
        </div>
      </div>

      {/* Active Offers Summary */}
      {activeOffers.length > 0 && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-sm border-b border-[#30363D] pb-3">🔥 Active Special Offers ({activeOffers.length})</h3>
          <div className="space-y-3">
            {activeOffers.map(offer => {
              const product = products.find(p => p.id === offer.productId);
              if (!product) return null;
              return (
                <div key={offer.productId} className="flex items-center gap-4 bg-[#0d1117] rounded-xl p-3">
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{product.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded">{offer.badgeText}</span>
                      {offer.offerPrice && <span className="text-[#2ee661] text-xs font-bold">LKR {offer.offerPrice.toLocaleString()}</span>}
                    </div>
                  </div>
                  <button onClick={() => removeOffer(offer.productId)} className="text-gray-600 hover:text-red-400 text-xs font-bold transition-colors">Remove</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Search & Toggle */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-white text-sm">Add / Manage Offers on Products</h3>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full bg-[#0d1117] border border-[#30363D] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#2ee661]/50" />
        </div>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredProducts.map(product => {
            const offer = getOffer(product.id);
            const isActive = offer?.enabled ?? false;
            return (
              <div key={product.id} className={`bg-[#0d1117] border rounded-xl p-4 transition-colors ${isActive ? 'border-[#2ee661]/30' : 'border-[#30363D]'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">{product.category}</span>
                      <span className="text-[#2ee661] text-xs font-bold">LKR {product.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleOffer(product.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isActive ? 'bg-[#2ee661]/10 border-[#2ee661]/30 text-[#2ee661]' : 'bg-[#161B22] border-[#30363D] text-gray-400'}`}>
                    {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {isActive ? 'Active' : 'Add Offer'}
                  </button>
                </div>

                {isActive && offer && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#30363D]">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Badge Text</label>
                      <input value={offer.badgeText} onChange={e => updateOffer(product.id, { badgeText: e.target.value })}
                        className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#2ee661]/50" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Offer Price (LKR)</label>
                      <input type="number" value={offer.offerPrice || ''} onChange={e => updateOffer(product.id, { offerPrice: parseFloat(e.target.value) || undefined })}
                        placeholder={product.price.toString()}
                        className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#2ee661]/50" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-5 max-w-md rounded-2xl border border-[#30363D] bg-[#161B22] p-4">
        <label className="mb-1 block text-xs font-black uppercase tracking-wider text-gray-400">
          Campaign deadline
        </label>
        <input
          type="datetime-local"
          value={toDateTimeLocal(specialOffersDeadline)}
          onChange={e => setSpecialOffersDeadline(fromDateTimeLocal(e.target.value))}
          className="w-full rounded-lg border border-[#30363D] bg-[#0d1117] px-3 py-2 text-sm text-white focus:border-[#2ee661]/50 focus:outline-none"
        />
        <p className="mt-2 text-[10px] text-gray-600">
          One deadline applies to every active special offer item.
        </p>
      </div>
    </div>
  );
}
