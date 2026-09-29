import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home, Truck, Sparkles, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { formatLKR } from '../data';
import { ApiOrder } from '../lib/api';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const orderFromState = (location.state as { order?: ApiOrder })?.order;
  const orderNumberParam = searchParams.get('orderNumber') || orderFromState?.orderNumber || '';

  const [orderNumber, setOrderNumber] = useState(orderNumberParam);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!orderNumber) {
      const generated = `ORD-${Date.now().toString().slice(-6)}`;
      setOrderNumber(generated);
    }
  }, [orderNumber]);

  return (
    <div className="bg-gray-50 min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-xl w-full mx-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100 text-center relative overflow-hidden"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-[#1cd75b]">
            <CheckCircle2 size={42} strokeWidth={2.5} />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm font-medium mb-6">
            Thank you for choosing Orion.LK. Your order is registered in our system and being prepared.
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Number</span>
              <span className="text-base font-black text-gray-900 font-mono">{orderNumber}</span>
            </div>

            {orderFromState?.pointsEarned && orderFromState.pointsEarned > 0 && (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" /> Reward Points Earned:
                </span>
                <span className="text-sm font-black text-amber-700">
                  +{orderFromState.pointsEarned} Points
                </span>
              </div>
            )}

            {orderFromState?.total !== undefined && (
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="font-bold">Total Paid:</span>
                <span className="font-black text-gray-900 text-sm">{formatLKR(orderFromState.total)}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-gray-600 text-left bg-white p-3 rounded-xl border border-gray-100">
              <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                <Package size={16} />
              </div>
              <p>You can track the live status of this package anytime using your Order Number.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link 
              to={`/track?id=${orderNumber}`}
              className="w-full sm:w-auto bg-[#ea364c] hover:bg-[#c42d3f] text-white font-black uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
            >
              <Truck size={16} /> Track Shipment
            </Link>
            <Link 
              to="/orders" 
              className="w-full sm:w-auto bg-black hover:bg-gray-900 text-white font-black uppercase tracking-wider py-3.5 px-6 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 text-xs"
            >
              <ShoppingBag size={16} /> My Orders
            </Link>
            <Link 
              to="/shop" 
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <Home size={16} /> Store
            </Link>
          </div>

          {/* Decorative background accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#1cd75b] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        </motion.div>
      </div>
    </div>
  );
}
