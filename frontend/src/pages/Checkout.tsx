import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { formatLKR } from '../data';
import { ChevronRight, ArrowLeft, ShieldCheck, Truck, Sparkles, MapPin, Loader2, Pencil } from 'lucide-react';

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
      firstName: addr.firstName || prev.firstName,
      lastName: addr.lastName || prev.lastName,
      email: addr.email || prev.email,
      phone: addr.phone || prev.phone,
      address: addr.street || '',
      city: addr.city || '',
      district: addr.district || addr.province || prev.district || 'Colombo',
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
          label: addressIndex >= 0 ? (savedAddresses[addressIndex].label || 'Home') : 'Home',
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          street,
          city,
          district,
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
          console.warn('Checkout address could not be saved to the user profile; continuing with the current order address.');
        }
      }

      navigate('/payment');
    } catch (error) {
      console.error('Failed to save checkout details:', error);
      setSaveError('We could not save your checkout details. Please check the information and try again.');
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
            <span className="text-black">Shipping</span>
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
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase">Shipping Details</h2>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase">Saved Addresses</h3>
                  <Link
                    to="/profile?tab=addresses"
                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-black transition-colors"
                  >
                    <Pencil size={12} /> Manage in Profile
                  </Link>
                </div>

                {mongoUser?.addresses && mongoUser.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mongoUser.addresses.map((addr, idx) => {
                      const isSelected = selectedAddressIndex === idx;
                      const addrName = addr.firstName || addr.lastName
                        ? `${addr.firstName || ''} ${addr.lastName || ''}`.trim()
                        : (mongoUser?.name || 'Customer');

                      return (
                        <div
                          key={idx}
                          onClick={() => selectAddress(addr, idx)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all relative group ${
                            isSelected
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="pr-2">
                              <div className="flex items-center gap-1.5 mb-1">
                                <MapPin size={13} className="text-black" />
                                <h4 className="font-bold text-gray-900 text-xs uppercase">{addr.label || 'Home'}</h4>
                                {addr.isDefault && (
                                  <span className="text-[9px] font-black uppercase tracking-wide bg-black text-white px-1.5 py-0.5 rounded">Default</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-900 font-bold">
                                {addrName}
                                {(addr.phone || mongoUser?.phone) && (
                                  <span className="text-gray-500 font-normal"> • {addr.phone || mongoUser?.phone}</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-600 font-medium mt-0.5">{addr.street}</p>
                              <p className="text-[11px] text-gray-500">{addr.city}, {addr.district || addr.province || 'Sri Lanka'} {addr.postalCode ? `(${addr.postalCode})` : ''}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              {isSelected ? (
                                <span className="text-[10px] font-black text-white uppercase tracking-wider bg-black px-2 py-0.5 rounded-full">
                                  Selected
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                  Use
                                </span>
                              )}
                              <Link
                                to="/profile?tab=addresses"
                                onClick={(e) => e.stopPropagation()}
                                title="Edit in Profile"
                                className="text-gray-400 hover:text-black p-1 transition-colors"
                              >
                                <Pencil size={13} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <MapPin size={15} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs uppercase">No Saved Addresses</h4>
                        <p className="text-xs text-gray-500">Enter your details below. We'll automatically save this address to your profile.</p>
                      </div>
                    </div>
                    <Link
                      to="/profile?tab=addresses"
                      className="inline-flex items-center gap-1 text-xs font-bold text-black border border-gray-300 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0 shadow-sm"
                    >
                      <Pencil size={12} /> Add to Profile
                    </Link>
                  </div>
                )}
              </div>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">First Name *</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="First Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Last Name *</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="Last Name" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Phone Number *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="07X XXX XXXX" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Street Address *</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="House number and street name" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Town / City *</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">District *</label>
                    <select required name="district" value={formData.district} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white text-gray-900 appearance-auto">
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
                    <input type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="Postal Code" />
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
                  <span className="font-black text-gray-900 uppercase text-xs bg-gray-100 px-2 py-0.5 rounded">Calculated Next</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-base font-black text-gray-900 uppercase tracking-tight">Total</span>
                  <span className="text-2xl sm:text-3xl font-black text-black tracking-tight">{formatLKR(cartTotal)}</span>
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
                className="w-full bg-black text-white font-black uppercase tracking-wider py-4 rounded-xl hover:bg-gray-900 transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving details...</> : <>Proceed to Payment <ChevronRight size={18} /></>}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600 font-bold">
                <ShieldCheck size={16} className="text-gray-900" /> Secure Checkout
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
