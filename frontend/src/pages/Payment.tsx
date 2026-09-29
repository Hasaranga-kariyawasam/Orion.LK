import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { createOrderInDb } from '../lib/api';
import { formatLKR } from '../data';
import {
  ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2, CreditCard,
  Wallet, Sparkles, Coins, AlertCircle, Loader2, Check
} from 'lucide-react';

export default function Payment() {
  const { cart, cartTotal, clearCart } = useShop();
  const { mongoUser, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Points Redemption State
  const userPoints = mongoUser?.points || 0;
  const [usePoints, setUsePoints] = useState(false);
  const maxRedeemablePoints = Math.min(userPoints, cartTotal);
  const [pointsAmount, setPointsAmount] = useState(maxRedeemablePoints);

  // Sync points amount when points or cart changes
  useEffect(() => {
    setPointsAmount(Math.min(userPoints, cartTotal));
  }, [userPoints, cartTotal]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (cart.length === 0) {
      navigate('/shop');
    }
  }, [cart, navigate]);

  const shippingCost = 450;
  const pointsDiscount = usePoints ? Math.min(pointsAmount, maxRedeemablePoints) : 0;
  const finalTotal = Math.max(0, cartTotal - pointsDiscount) + shippingCost;
  const pointsToEarn = Math.max(0, Math.floor((cartTotal - pointsDiscount) / 100));

  const handlePayment = async () => {
    setErrorMessage('');
    setIsProcessing(true);

    try {
      // Retrieve shipping details from checkout step
      let shippingData: any = null;
      const saved = sessionStorage.getItem('checkout_shipping_address');
      if (saved) {
        try { shippingData = JSON.parse(saved); } catch (e) {}
      }

      if (!shippingData) {
        // Fallback to user saved default address or prompt
        const defaultAddr = mongoUser?.addresses?.[0];
        if (defaultAddr) {
          shippingData = {
            firstName: mongoUser?.name?.split(' ')[0] || 'Customer',
            lastName: mongoUser?.name?.split(' ').slice(1).join(' ') || '',
            email: mongoUser?.email || '',
            phone: mongoUser?.phone || '0770000000',
            address: defaultAddr.street,
            city: defaultAddr.city,
            district: defaultAddr.province || 'Colombo',
            zip: defaultAddr.postalCode || '00300',
          };
        } else {
          setErrorMessage('Shipping details missing. Please return to Checkout.');
          setIsProcessing(false);
          return;
        }
      }

      const paymentMethodLabel =
        paymentMethod === 'cod' ? 'Cash on Delivery' :
        paymentMethod === 'koko' ? 'Koko Installments' :
        paymentMethod === 'payzy' ? 'Payzy Installments' : 'Credit / Debit Card';

      // Call real order creation API
      const newOrder = await createOrderInDb({
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        subtotal: cartTotal,
        shipping: shippingCost,
        pointsUsed: pointsDiscount,
        pointsDiscount: pointsDiscount,
        total: finalTotal,
        shippingAddress: {
          name: `${shippingData.firstName || ''} ${shippingData.lastName || ''}`.trim() || 'Customer',
          street: shippingData.address || 'Street',
          city: shippingData.city || 'City',
          province: shippingData.district || 'Western Province',
          postalCode: shippingData.zip || '00000',
          phone: shippingData.phone || '0770000000',
        },
        paymentMethod: paymentMethodLabel,
        notes: pointsDiscount > 0 ? `Paid with ${pointsDiscount} Orion points discount` : undefined,
      });

      // Clear cart and shipping cache
      clearCart();
      sessionStorage.removeItem('checkout_shipping_address');

      // Refresh user profile to immediately show updated points balance
      await refreshProfile();

      // Navigate to order success with real order number and state
      navigate(`/success?orderNumber=${newOrder.orderNumber}`, { state: { order: newOrder } });
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMessage(err.message || 'Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Points & Payment Methods */}
          <div className="lg:col-span-8 space-y-6">

            {/* Orion Loyalty Points Redemption Box */}
            <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-white border-2 border-amber-500/30 p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black shadow-md shadow-amber-500/20">
                    <Coins size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-gray-900 uppercase">Orion Reward Points</h2>
                      <span className="bg-amber-500/20 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        1 Pt = 1 LKR
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      You have <span className="font-bold text-amber-700">{userPoints} Points</span> available (LKR {userPoints.toLocaleString()} value)
                    </p>
                  </div>
                </div>

                {userPoints > 0 && (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                )}
              </div>

              {userPoints > 0 ? (
                usePoints ? (
                  <div className="mt-4 pt-4 border-t border-amber-200/60 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-700 uppercase">
                        Redeem Points (Max: {maxRedeemablePoints} Pts)
                      </span>
                      <button
                        type="button"
                        onClick={() => setPointsAmount(maxRedeemablePoints)}
                        className="text-xs font-bold text-amber-700 hover:text-amber-900 underline text-left"
                      >
                        Apply Max ({maxRedeemablePoints} Pts)
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max={maxRedeemablePoints}
                        value={pointsAmount}
                        onChange={(e) => setPointsAmount(Number(e.target.value))}
                        className="flex-1 accent-amber-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
                      />
                      <div className="w-28 flex items-center bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-sm font-black text-gray-900">
                        <span className="text-amber-600 mr-1">Pts:</span>
                        <input
                          type="number"
                          min="1"
                          max={maxRedeemablePoints}
                          value={pointsAmount}
                          onChange={(e) => setPointsAmount(Math.min(maxRedeemablePoints, Math.max(1, Number(e.target.value))))}
                          className="w-full outline-none font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/15 rounded-xl flex items-center justify-between text-xs text-amber-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Check size={14} className="text-amber-700" />
                        Discount applied to order:
                      </span>
                      <span className="text-sm font-black text-amber-800">
                        -{formatLKR(pointsDiscount)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-500">
                    Toggle switch above to use your points and get an instant discount on this purchase!
                  </div>
                )
              ) : (
                <div className="mt-2 text-xs text-gray-500">
                  You currently have 0 points. Complete this order to earn{' '}
                  <span className="font-bold text-gray-900">+{pointsToEarn} points</span> for your next purchase!
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
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
                  <div className="flex items-center justify-between p-4" onClick={() => setPaymentMethod('card')}>
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

                {usePoints && pointsDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles size={14} /> Points Discount
                    </span>
                    <span className="font-black">-{formatLKR(pointsDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-black text-gray-900 uppercase">Total to Pay</span>
                  <span className="text-2xl font-black text-red-600">{formatLKR(finalTotal)}</span>
                </div>
              </div>

              {/* Rewards to earn notice */}
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl mb-6 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-bold flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-500" /> Rewards to Earn:
                </span>
                <span className="font-black text-amber-700">+{pointsToEarn} Points</span>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-[#1cd75b] text-black font-black uppercase tracking-wider py-4 rounded-xl hover:bg-[#18c251] transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing Order...</span>
                  </>
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
