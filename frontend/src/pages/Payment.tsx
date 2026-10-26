import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { API_BASE_URL } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { createOrderInDb, createPayHerePayment } from '../lib/api';
import { formatLKR } from '../data';
import {
  ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2, CreditCard,
  Wallet, Sparkles, Coins, AlertCircle, Loader2, Check
} from 'lucide-react';

interface PayHerePaymentPayload {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

declare global {
  interface Window {
    payhere?: {
      startPayment: (payment: PayHerePaymentPayload) => void;
      onCompleted?: (orderId: string) => void;
      onDismissed?: () => void;
      onError?: (error: string) => void;
    };
  }
}

function loadPayHereScript(): Promise<void> {
  if (window.payhere) return Promise.resolve();
  const existingScript = document.querySelector('script[data-payhere-sdk]');
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load PayHere.')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.payhere.lk/lib/payhere.js';
    script.async = true;
    script.dataset.payhereSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load PayHere.'));
    document.head.appendChild(script);
  });
}

export default function Payment() {
  const { cart, cartTotal, clearCart } = useShop();
  const { mongoUser, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('payhere');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Points Redemption State
  const userPoints = mongoUser?.points || 0;
  const [usePoints, setUsePoints] = useState(false);
  const maxRedeemablePoints = Math.min(userPoints, cartTotal);
  const [pointsAmount, setPointsAmount] = useState(maxRedeemablePoints);

  useEffect(() => {
    if (paymentMethod === 'payhere') {
      loadPayHereScript().catch(err => setErrorMessage(err.message));
    }
  }, [paymentMethod]);

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
    let waitingForPayHere = false;

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

      const paymentMethodLabel = paymentMethod === 'cod' ? 'Cash on Delivery' : 'PayHere Sandbox';

      const submitOrder = async (label: string) => {
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
          pointsDiscount,
          total: finalTotal,
          shippingAddress: {
            name: `${shippingData.firstName || ''} ${shippingData.lastName || ''}`.trim() || 'Customer',
            street: shippingData.address || 'Street',
            city: shippingData.city || 'City',
            province: shippingData.district || 'Western Province',
            postalCode: shippingData.zip || '00000',
            phone: shippingData.phone || '0770000000',
          },
          paymentMethod: label,
          notes: pointsDiscount > 0 ? `Paid with ${pointsDiscount} Orion points discount` : undefined,
        });

        clearCart();
        sessionStorage.removeItem('checkout_shipping_address');
        await refreshProfile();
        navigate(`/success?orderNumber=${newOrder.orderNumber}`, { state: { order: newOrder } });
      };

      if (paymentMethod === 'payhere') {
        waitingForPayHere = true;
        await loadPayHereScript();
        if (!window.payhere) throw new Error('PayHere is unavailable. Please try again.');
        const payHere = await createPayHerePayment(finalTotal);
        window.payhere.onCompleted = async () => {
          try {
            await submitOrder(paymentMethodLabel);
          } catch (err: any) {
            setErrorMessage(err.message || 'Payment succeeded, but the order could not be saved.');
            setIsProcessing(false);
          }
        };
        window.payhere.onDismissed = () => setIsProcessing(false);
        window.payhere.onError = (message) => {
          setErrorMessage(message || 'PayHere payment failed.');
          setIsProcessing(false);
        };
        window.payhere.startPayment({
          sandbox: payHere.sandbox,
          merchant_id: payHere.merchantId,
          return_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/payment`,
          notify_url: `${API_BASE_URL}/api/payhere/notify`,
          order_id: payHere.orderId,
          items: cart.map(item => `${item.product.name} x${item.quantity}`).join(', '),
          amount: payHere.amount,
          currency: payHere.currency,
          hash: payHere.hash,
          first_name: shippingData.firstName || 'Customer',
          last_name: shippingData.lastName || '',
          email: shippingData.email || mongoUser?.email || '',
          phone: shippingData.phone || mongoUser?.phone || '',
          address: shippingData.address || '',
          city: shippingData.city || '',
          country: 'Sri Lanka',
        });
        return;
      }

      await submitOrder(paymentMethodLabel);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMessage(err.message || 'Failed to process order. Please try again.');
    } finally {
      if (!waitingForPayHere) setIsProcessing(false);
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
                {/* Card entry is handled by PayHere's hosted checkout. */}
                <label
                  className={`relative flex min-h-28 cursor-pointer items-center justify-between gap-4 overflow-hidden rounded-2xl border-2 p-4 transition-all sm:p-5 ${
                    paymentMethod === 'payhere'
                      ? 'border-[#1cd75b] bg-gradient-to-br from-[#1cd75b]/10 via-white to-white shadow-[0_8px_24px_rgba(28,215,91,0.10)]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setPaymentMethod('payhere')}
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${paymentMethod === 'payhere' ? 'bg-[#1cd75b] text-white shadow-md shadow-[#1cd75b]/20' : 'bg-gray-100 text-gray-500'}`}>
                      <CreditCard size={23} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-gray-900">PayHere</span>
                        <span className="rounded-full border border-[#1cd75b]/30 bg-[#1cd75b]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#11833a]">
                          Sandbox
                        </span>
                      </div>
                      <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                        Secure credit or debit card checkout
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden gap-1.5 sm:flex">
                      <span className="flex h-6 w-9 items-center justify-center rounded bg-[#1a1f71] text-[8px] font-black italic text-white">VISA</span>
                      <span className="flex h-6 w-9 items-center justify-center rounded bg-gray-900 text-[8px] font-black text-white">MC</span>
                    </div>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${paymentMethod === 'payhere' ? 'border-[#1cd75b]' : 'border-gray-300'}`}>
                      {paymentMethod === 'payhere' && <span className="h-2.5 w-2.5 rounded-full bg-[#1cd75b]" />}
                    </span>
                  </div>
                </label>

                {/* Koko */}
                <label aria-disabled="true" className="flex items-center justify-between p-4 border-2 rounded-xl cursor-not-allowed opacity-60 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'koko' ? 'border-red-500' : 'border-gray-300'}`}>
                      {paymentMethod === 'koko' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">Koko Installments</span>
                      <span className="text-xs text-gray-500">Installment checkout is not connected yet</span>
                    </div>
                  </div>
                  <img src="https://qa-merchant.paykoko.com/assets/images/logo.png" alt="Koko" className="h-6 object-contain" />
                </label>

                {/* Payzy */}
                <label aria-disabled="true" className="flex items-center justify-between p-4 border-2 rounded-xl cursor-not-allowed opacity-60 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'payzy' ? 'border-red-500' : 'border-gray-300'}`}>
                      {paymentMethod === 'payzy' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">Payzy Installments</span>
                      <span className="text-xs text-gray-500">Installment checkout is not connected yet</span>
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
                  <span className="text-2xl font-black text-black">{formatLKR(finalTotal)}</span>
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
                className="w-full bg-black hover:bg-gray-900 text-white font-black uppercase tracking-wider py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600 font-bold text-center">
                <ShieldCheck size={16} className="text-gray-900" /> 
                Payments are securely encrypted and processed.
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
