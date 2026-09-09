import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import { motion } from 'motion/react';

export default function OrderSuccess() {
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    // Generate a random mock order number
    setOrderNumber(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-xl w-full mx-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 text-center relative overflow-hidden"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#1cd75b]">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 font-medium mb-8">Thank you for your purchase. We've received your order and are currently processing it.</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-4 mb-4">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Order Number</span>
              <span className="text-lg font-black text-gray-900">{orderNumber}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 text-left bg-white p-4 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                <Package size={20} />
              </div>
              <p>You will receive an email confirmation shortly with your tracking details.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link 
              to="/shop" 
              className="w-full sm:w-auto bg-black text-white font-black uppercase tracking-wider py-4 px-8 rounded-xl hover:bg-gray-900 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              Continue Shopping <ArrowRight size={18} />
            </Link>
            <Link 
              to="/" 
              className="w-full sm:w-auto bg-gray-100 text-gray-900 font-bold uppercase tracking-wider py-4 px-8 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Home size={18} /> Home
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
