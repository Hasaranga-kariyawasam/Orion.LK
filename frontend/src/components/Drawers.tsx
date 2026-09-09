import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, Heart, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatLKR } from '../data';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Drawers() {
  const { 
    cart, wishlist, isCartOpen, setIsCartOpen, isWishlistOpen, setIsWishlistOpen,
    removeFromCart, updateQuantity, toggleWishlist, addToCart, cartTotal
  } = useShop();
  const navigate = useNavigate();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [formErrors, setFormErrors] = useState({ name: '', phone: '', address: '' });

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    const errors = { name: '', phone: '', address: '' };

    if (!formData.name.trim()) { errors.name = 'Name is required'; hasError = true; }
    if (!formData.phone.trim()) { errors.phone = 'Phone number is required'; hasError = true; }
    else if (!/^\d{10}$/.test(formData.phone.replace(/\s+/g, ''))) { errors.phone = 'Invalid phone format'; hasError = true; }
    if (!formData.address.trim()) { errors.address = 'Delivery address is required'; hasError = true; }

    setFormErrors(errors);

    if (!hasError) {
      alert('Order placed successfully! Thank you for shopping with us.');
      window.location.reload();
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {(isCartOpen || isWishlistOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsCartOpen(false); setIsWishlistOpen(false); setCheckoutStep('cart'); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[70] flex flex-col border-l border-gray-100"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-black uppercase text-gray-900 flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#2ee661]" />
                {checkoutStep === 'cart' ? 'Shopping Cart' : 'Checkout'}
              </h2>
              <button onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingBag size={64} className="mb-4 opacity-20" />
                  <p className="font-bold">Your cart is empty</p>
                </div>
              ) : checkoutStep === 'cart' ? (
                <div className="flex flex-col gap-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 bg-white p-3 border border-gray-100 rounded-xl shadow-sm relative">
                      <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-contain rounded-lg bg-gray-50 p-2" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-snug pr-6">{item.product.name}</h3>
                          <p className="text-[#2ee661] font-black text-sm mt-1">{formatLKR(item.product.price)}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center bg-gray-100 rounded-md">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 hover:bg-gray-200 rounded-l-md text-gray-600 hover:text-gray-900"><Minus size={14} /></button>
                            <span className="w-8 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 hover:bg-gray-200 rounded-r-md text-gray-600 hover:text-gray-900"><Plus size={14} /></button>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full p-2.5 rounded-lg border text-sm ${formErrors.name ? 'border-red-500' : 'border-gray-200'} focus:border-gray-900 outline-none transition-colors bg-gray-50`}
                      placeholder="John Doe"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`w-full p-2.5 rounded-lg border text-sm ${formErrors.phone ? 'border-red-500' : 'border-gray-200'} focus:border-gray-900 outline-none transition-colors bg-gray-50`}
                      placeholder="077 123 4567"
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Delivery Address</label>
                    <textarea 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className={`w-full p-2.5 rounded-lg border text-sm min-h-[80px] ${formErrors.address ? 'border-red-500' : 'border-gray-200'} focus:border-gray-900 outline-none transition-colors bg-gray-50`}
                      placeholder="Street address, City, District"
                    />
                    {formErrors.address && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.address}</p>}
                  </div>
                </form>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-600 uppercase">Subtotal</span>
                  <span className="text-xl font-black text-gray-900">{formatLKR(cartTotal)}</span>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); navigate('/checkout'); }} 
                  className="w-full bg-[#1cd75b] hover:bg-[#18c251] text-black font-black uppercase tracking-wider py-3.5 rounded-xl transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ChevronRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wishlist Drawer */}
      <AnimatePresence>
        {isWishlistOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[70] flex flex-col border-l border-gray-100"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-black uppercase text-gray-900 flex items-center gap-2">
                <Heart size={20} className="text-[#2ee661]" />
                Your Wishlist
              </h2>
              <button onClick={() => setIsWishlistOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Heart size={64} className="mb-4 opacity-20" />
                  <p className="font-bold">Your wishlist is empty</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {wishlist.map((product) => (
                    <div key={product.id} className="flex gap-4 bg-white p-3 border border-gray-100 rounded-xl shadow-sm relative">
                      <img src={product.image} alt={product.name} className="w-20 h-20 object-contain rounded-lg bg-gray-50 p-2" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-snug pr-6">{product.name}</h3>
                          <p className="text-[#2ee661] font-black text-sm mt-1">{formatLKR(product.price)}</p>
                        </div>
                        <button 
                          onClick={() => { addToCart(product); toggleWishlist(product); setIsWishlistOpen(false); }}
                          className="mt-2 text-xs font-bold uppercase text-white bg-gray-900 hover:bg-black py-2 px-3 rounded-lg w-max transition-colors"
                        >
                          Move to Cart
                        </button>
                      </div>
                      <button onClick={() => toggleWishlist(product)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
