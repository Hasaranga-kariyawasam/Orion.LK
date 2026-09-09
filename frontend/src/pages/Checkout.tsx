import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { formatLKR } from '../data';
import { ChevronRight, ArrowLeft, ShieldCheck, Truck, CreditCard } from 'lucide-react';

export default function Checkout() {
  const { cart, cartTotal } = useShop();
  const navigate = useNavigate();
  
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

  const loadSavedAddress = () => {
    setFormData({
      firstName: 'Hass',
      lastName: 'K',
      email: 'hass.kariyawasam@gmail.com',
      phone: '0771234567',
      address: '123 Tech Park, Galle Road',
      city: 'Colombo 03',
      district: 'Colombo',
      zip: '00300'
    });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normally you'd save shipping data to context/state here, then navigate
    navigate('/payment');
  };

  if (cart.length === 0) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Checkout Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Checkout</h1>
          
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="text-red-500">Shipping</span>
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
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase">Shipping Details</h2>
              </div>
              
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Saved Addresses</h3>
                <div 
                  onClick={loadSavedAddress}
                  className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#1cd75b] hover:bg-[#1cd75b]/5 transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-[#1cd75b] transition-colors">Home</h4>
                      <p className="text-sm text-gray-500 mt-1">Hass K • 0771234567</p>
                      <p className="text-sm text-gray-500">123 Tech Park, Galle Road, Colombo 03, Colombo</p>
                    </div>
                    <span className="text-xs font-bold text-[#1cd75b] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">Use This</span>
                  </div>
                </div>
              </div>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">First Name *</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="First Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Last Name *</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="Last Name" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Phone Number *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="07X XXX XXXX" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Street Address *</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="House number and street name" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Town / City *</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">District *</label>
                    <select required name="district" value={formData.district} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900">
                      <option value="">Select District</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Galle">Galle</option>
                      {/* Add more as needed */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Postcode / ZIP</label>
                    <input type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="Postal Code" />
                  </div>
                </div>
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

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-black text-gray-900 uppercase">Total</span>
                  <span className="text-2xl font-black text-red-600">{formatLKR(cartTotal)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                className="w-full bg-black text-white font-black uppercase tracking-wider py-4 rounded-xl hover:bg-gray-900 transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                Proceed to Payment <ChevronRight size={18} />
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
