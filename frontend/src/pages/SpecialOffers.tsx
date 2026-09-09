import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Flame, Clock } from 'lucide-react';
import { MOCK_PRODUCTS } from '../data';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';

export default function SpecialOffers() {
  const [isLoading, setIsLoading] = useState(true);

  // Filter products that have a discount
  const discountedProducts = MOCK_PRODUCTS.filter(p => p.discount && p.discount > 0);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#161B22] to-black py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f0364c] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2ee661] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-[#f0364c]/20 text-[#f0364c] border border-[#f0364c]/30 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
            <Flame size={16} /> Limited Time Only
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">
            Special <span className="text-[#2ee661]">Offers</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg mb-8">
            Grab incredible deals on premium hardware and accessories. These exclusive discounts won't last long, so upgrade your setup today!
          </p>
          
          <div className="flex items-center gap-4 text-white bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
            <Clock size={20} className="text-[#f0364c]" />
            <div className="flex gap-4 font-black text-xl font-mono tracking-widest">
              <span>02<span className="text-xs text-gray-500 font-sans tracking-normal block text-center">DAYS</span></span>:
              <span>14<span className="text-xs text-gray-500 font-sans tracking-normal block text-center">HRS</span></span>:
              <span>45<span className="text-xs text-gray-500 font-sans tracking-normal block text-center">MINS</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wider">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-[#f0364c]">Special Offers</span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <Sparkles size={24} className="text-[#2ee661]" /> Exclusive Deals
          </h2>
          <span className="text-sm font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            {discountedProducts.length} Items
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading 
            ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
            : discountedProducts.length > 0 
              ? discountedProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))
              : (
                <div className="col-span-full py-16 text-center text-gray-500 font-bold">
                  No special offers available at the moment. Check back later!
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
}
