import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { formatLKR } from '../data';
import { ChevronRight, ArrowLeft, ShieldCheck, Truck, Sparkles, MapPin, Loader2 } from 'lucide-react';

const sriLankanDistricts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Puttalam', 'Kurunegala', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle',
  'Ampara', 'Batticaloa', 'Trincomalee'
];

export default function Checkout() {
  const { cart, cartTotal } = useShop();
  const { user, mongoUser, updateMongoProfile } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    zip: ''
  });

  // Prefer the user's saved default address, then restore an in-progress checkout.
  useEffect(() => {
    const saved = sessionStorage.getItem('checkout_shipping_address');
    const addresses = mongoUser?.addresses || [];
    const defaultIndex = addresses.findIndex(address => address.isDefault);
    const defaultAddr = addresses[defaultIndex >= 0 ? defaultIndex : 0];

    if (defaultAddr) {
      const fullName = mongoUser?.name || user?.displayName || '';
      const parts = fullName.trim().split(' ');
      setSelectedAddressIndex(defaultIndex >= 0 ? defaultIndex : 0);
      setFormData(prev => ({
        ...prev,
        firstName: parts[0] || prev.firstName,
        lastName: parts.slice(1).join(' ') || prev.lastName,
        email: mongoUser?.email || user?.email || prev.email,
        phone: mongoUser?.phone || prev.phone,
        address: defaultAddr.street,
        city: defaultAddr.city,
        district: defaultAddr.province || 'Colombo',
        zip: defaultAddr.postalCode || '',
      }));
      return;
    }

    if (saved) {
      try {
        setFormData(JSON.parse(saved));
        setSelectedAddressIndex(null);
        return;
      } catch (error) {
        console.error('Failed to restore checkout address:', error);
      }
    }

    if (mongoUser || user) {
      const fullName = mongoUser?.name || user?.displayName || '';
      const parts = fullName.trim().split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || parts[0] || '',
        lastName: prev.lastName || parts.slice(1).join(' ') || '',
        email: prev.email || mongoUser?.email || user?.email || '',
        phone: prev.phone || mongoUser?.phone || '',
        district: prev.district || 'Colombo',
      }));
    }
  }, [mongoUser, user]);

  const selectAddress = (addr: any, index: number | null = null) => {
    setSelectedAddressIndex(index);
    setFormData(prev => ({
      ...prev,
      address: addr.street,
      city: addr.city,
      district: addr.province || 'Colombo',
      zip: addr.postalCode || '',
    }));
  };

  // Redirect if cart is empty
  useEffect(() => {
    window.scrollTo(0, 0);
    if (cart.length === 0) {
      navigate('/shop');
    }
  }, [cart, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    try {
      sessionStorage.setItem('checkout_shipping_address', JSON.stringify(formData));

      if (user) {
        const savedAddresses = mongoUser?.addresses || [];
        const street = formData.address.trim();
        const city = formData.city.trim();
        const district = formData.district.trim();
        const postalCode = formData.zip.trim();
        const addressIndex = savedAddresses.findIndex(address =>
          address.street.trim().toLowerCase() === street.toLowerCase()
        );
        const checkoutAddress = {
          label: addressIndex >= 0 ? savedAddresses[addressIndex].label : 'Home',
          street,
          city,
          province: district,
          postalCode,
          isDefault: addressIndex >= 0
            ? savedAddresses[addressIndex].isDefault
            : savedAddresses.length === 0,
        };
        const addresses = addressIndex >= 0
          ? savedAddresses.map((address, index) => index === addressIndex ? checkoutAddress : address)
          : [...savedAddresses, checkoutAddress];

        const updatedProfile = await updateMongoProfile({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          addresses,
        });
        if (!updatedProfile) {
          throw new Error('Profile address could not be saved');
        }
      }

      navigate('/payment');
    } catch (error) {
      console.error('Failed to save checkout details:', error);
      setSaveError('We could not save your address to your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Checkout Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Checkout</h1>
          
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="text-[#12b94b]">Shipping</span>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-gray-400">Payment</span>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-gray-400">Success</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-6">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Shipping Form */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#1cd75b]/10 text-[#12b94b] flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase">Shipping Details</h2>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase">Saved Addresses</h3>
                  {mongoUser?.addresses && mongoUser.addresses.length > 0 && (
                    <span className="text-xs text-gray-400">{mongoUser.addresses.length} available</span>
                  )}
                </div>

                {mongoUser?.addresses && mongoUser.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mongoUser.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectAddress(addr, idx)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedAddressIndex === idx
                            ? 'border-[#1cd75b] bg-[#1cd75b]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-[#1cd75b]" />
                              <h4 className="font-bold text-gray-900 text-xs uppercase">{addr.label}</h4>
                              {addr.isDefault && (
                                <span className="text-[9px] font-black uppercase tracking-wide text-[#12b94b]">Default</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 font-medium mt-1">{addr.street}</p>
                            <p className="text-[11px] text-gray-400">{addr.city}, {addr.province}</p>
                          </div>
                          {selectedAddressIndex === idx && (
                            <span className="text-[10px] font-black text-[#1cd75b] uppercase tracking-wider bg-[#1cd75b]/10 px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    onClick={() => selectAddress({ street: '123 Tech Park, Galle Road', city: 'Colombo 03', province: 'Colombo', postalCode: '00300' })}
                    className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#1cd75b] hover:bg-[#1cd75b]/5 transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-[#1cd75b] transition-colors">Home</h4>
                        <p className="text-sm text-gray-500 mt-1">{formData.firstName || 'Customer'} • {formData.phone || '0771234567'}</p>
                        <p className="text-sm text-gray-500">123 Tech Park, Galle Road, Colombo 03, Colombo</p>
                      </div>
                      <span className="text-xs font-bold text-[#1cd75b] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">Use This</span>
                    </div>
                  </div>
                )}
              </div>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">First Name *</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="First Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Last Name *</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="Last Name" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Phone Number *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="07X XXX XXXX" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Street Address *</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="House number and street name" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Town / City *</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">District *</label>
                    <select required name="district" value={formData.district} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none transition-all bg-white text-gray-900 appearance-auto">
                      <option value="" className="text-gray-900">Select District</option>
                      {formData.district && !sriLankanDistricts.includes(formData.district) && (
                        <option value={formData.district} className="text-gray-900">{formData.district}</option>
                      )}
                      {sriLankanDistricts.map(district => (
                        <option key={district} value={district} className="text-gray-900">{district}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Postcode / ZIP</label>
                    <input type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="Postal Code" />
                  </div>
                </div>
                {saveError && (
                  <p className="text-sm font-bold text-red-600" role="alert">{saveError}</p>
                )}
              </form>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
              <h3 className="text-lg font-black text-gray-900 uppercase mb-4 border-b border-gray-100 pb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 items-center">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-contain bg-gray-50 rounded-lg p-2" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">{item.product.name}</h4>
                      <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-black text-gray-900">
                      {formatLKR(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Subtotal</span>
                  <span className="font-bold text-gray-900">{formatLKR(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Shipping</span>
                  <span className="font-bold text-[#1cd75b] uppercase">Calculated Next</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-base font-black text-gray-900 uppercase">Total</span>
                  <span className="text-2xl font-black text-[#12b94b]">{formatLKR(cartTotal)}</span>
                </div>
              </div>

              {/* Loyalty Reward Points Preview */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 mb-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">Orion Rewards</p>
                  <p className="text-[11px] text-amber-700">
                    Earn <span className="font-black text-amber-900">+{Math.floor(cartTotal / 100)} Points</span> on this purchase!
                  </p>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isSaving}
                className="w-full bg-black text-white font-black uppercase tracking-wider py-4 rounded-xl hover:bg-gray-900 transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving details...</> : <>Proceed to Payment <ChevronRight size={18} /></>}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-bold">
                <ShieldCheck size={16} className="text-[#1cd75b]" /> Secure Checkout
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
