import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { formatLKR } from '../data';
import { ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2, CreditCard, Wallet } from 'lucide-react';

export default function Payment() {
  const { cart, cartTotal, clearCart } = useShop();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (cart.length === 0) {
      navigate('/shop');
    }
  }, [cart, navigate]);

  const shippingCost = 450;
  const finalTotal = cartTotal + shippingCost;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      navigate('/success');
    }, 2000);
  };

  if (cart.length === 0) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Checkout Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Payment</h1>
          
          <div className="flex items-center gap-2 text-sm font-bold">
            <Link to="/checkout" className="text-gray-400 hover:text-black">Shipping</Link>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-red-500">Payment</span>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-gray-400">Success</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <Link to="/checkout" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Shipping
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Payment Methods */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase">Select Payment Method</h2>
              </div>
              
              <div className="space-y-4">
                {/* Credit Card */}
                <label className={`flex flex-col border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-red-500 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-red-500' : 'border-gray-300'}`}>
                        {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                      </div>
                      <span className="font-bold text-gray-900">Credit / Debit Card</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-[8px] text-white font-bold italic">VISA</div>
                      <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center text-[8px] text-white font-bold">MC</div>
                    </div>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="p-4 border-t border-gray-200/60 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Card Number</label>
                          <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" placeholder="0000 0000 0000 0000" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Expiry Date</label>
                            <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" placeholder="MM/YY" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">CVC</label>
                            <input type="text" className="w-full p-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" placeholder="123" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </label>

                {/* Koko */}
                <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'koko' ? 'border-red-500 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('koko')}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'koko' ? 'border-red-500' : 'border-gray-300'}`}>
                      {paymentMethod === 'koko' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">Koko Installments</span>
                      <span className="text-xs text-gray-500">Pay in 3 interest-free installments</span>
                    </div>
                  </div>
                  <img src="https://qa-merchant.paykoko.com/assets/images/logo.png" alt="Koko" className="h-6 object-contain" />
                </label>

                {/* Payzy */}
                <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'payzy' ? 'border-red-500 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('payzy')}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'payzy' ? 'border-red-500' : 'border-gray-300'}`}>
                      {paymentMethod === 'payzy' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">Payzy Installments</span>
                      <span className="text-xs text-gray-500">Pay in 4 interest-free installments</span>
                    </div>
                  </div>
                  <img src="https://payzy.lk/images/logoWordDark.png" alt="Payzy" className="h-5 object-contain" />
                </label>

                {/* Cash on Delivery */}
                <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-red-500 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('cod')}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-red-500' : 'border-gray-300'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">Cash on Delivery</span>
                      <span className="text-xs text-gray-500">Pay when your order arrives</span>
                    </div>
                  </div>
                  <Wallet size={24} className="text-gray-400" />
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
              <h3 className="text-lg font-black text-gray-900 uppercase mb-4 border-b border-gray-100 pb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Subtotal ({cart.length} items)</span>
                  <span className="font-bold text-gray-900">{formatLKR(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Shipping (Islandwide)</span>
                  <span className="font-bold text-gray-900">{formatLKR(shippingCost)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-black text-gray-900 uppercase">Total to Pay</span>
                  <span className="text-2xl font-black text-red-600">{formatLKR(finalTotal)}</span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-[#1cd75b] text-black font-black uppercase tracking-wider py-4 rounded-xl hover:bg-[#18c251] transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : paymentMethod === 'cod' ? (
                  <>Place Order <CheckCircle2 size={18} /></>
                ) : (
                  <>Complete Payment <CheckCircle2 size={18} /></>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-bold text-center">
                <ShieldCheck size={16} className="text-[#1cd75b]" /> 
                Payments are securely encrypted and processed.
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
