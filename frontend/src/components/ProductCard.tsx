import React, { useState } from 'react';
import { ShoppingCart, Search, Shuffle, Heart, Star, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatLKR } from '../data';
import { useShop } from '../context/ShopContext';

const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600';

const ProductCard: React.FC<{ product: Product, index?: number }> = ({ product, index = 0 }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare, addToBuild } = useShop();
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const kokoInstallment = product.price / 3;
  const payzyInstallment = product.price / 4;

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.5) }}
      className="group bg-white rounded-xl overflow-hidden hover:shadow-sm transition-all duration-300 flex flex-col h-fit relative p-4"
    >

      {/* Top badges & Icons */}
      <div className=" relative z-10">
        <div className="flex flex-col gap-1 items-start absolute left-1 top-2 z-20 ">
          {product.discount && (
            <span className="bg-[#fc2d3f] text-white text-[11px] font-black px-2 py-1 rounded inline-block tracking-wider uppercase shadow-sm">
              -{product.discount}%
            </span>
          )}
          {product.isNew && product.status !== 'Sold Out' && (
            <span className="bg-[#1a5eff] text-white text-[11px] font-black px-2 py-1 rounded inline-block tracking-wider uppercase shadow-sm">
              NEW
            </span>
          )}
          {product.status === 'Sold Out' && (
            <span className="bg-gray-500 text-white text-[11px] font-black px-2 py-1 rounded inline-block tracking-wide shadow-sm">
              SOLD OUT
            </span>
          )}
        </div>


        {/* Always visible Wishlist Button */}


        {/* Always visible Cart Button */}
        <div className="flex flex-col gap-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1.5 rounded-lg shadow-sm border border-gray-100 absolute right-2 top-2 z-20">
          {/* add wishlist button in side this dev */}
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className={`transition-colors p-1.5 rounded-lg  ${inWishlist ? 'text-[#fc2d3f] bg-white/90 hover:bg-white shadow-sm' : 'bg-transparent hover:bg-gray-100'}`}
            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={18} strokeWidth={1.5} fill={inWishlist ? "#fc2d3f" : "#b3b3b3ff"} />
          </button>


          <button onClick={(e) => { e.preventDefault(); addToCart(product); }} className="hover:text-black transition-colors p-1" title="Add to Cart"><ShoppingCart size={18} strokeWidth={1.5} /></button>

          <button onClick={(e) => { e.preventDefault(); toggleCompare(product); }} className={`transition-colors p-1 ${inCompare ? 'text-[#2ee661]' : 'hover:text-black'}`} title="Compare"><Shuffle size={18} strokeWidth={1.5} /></button>
          <button onClick={(e) => { e.preventDefault(); addToBuild(product); }} className="hover:text-black transition-colors p-1 text-[#2ee661]" title="Add to My Build"><Wrench size={18} strokeWidth={1.5} /></button>
        </div>
      </div>

      {/* Image Gallery (Scrub to switch) */}
      <div
        className="relative aspect-[4/4] w-full flex items-center justify-center overflow-hidden mb-4 group/image mt-0"
        onMouseMove={(e) => {
          if (images.length <= 1) return;
          const { left, width } = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - left;
          const sectionWidth = width / images.length;
          const index = Math.min(Math.floor(x / sectionWidth), images.length - 1);
          setCurrentImageIndex(Math.max(0, index));
        }}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        <Link to={`/product/${product.id}`} className="w-full h-full block">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover/image:scale-105"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
            }}
          />
        </Link>

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity">
            {images.map((_, idx) => (
              <div key={idx} className={`h-1 rounded-sm transition-all ${idx === currentImageIndex ? 'bg-gray-800 w-4' : 'bg-gray-300 w-2'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-[13px] font-bold text-gray-800 line-clamp-2 mb-1.5 min-h-[38px] leading-snug hover:text-black transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} className={i < Math.floor(product.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
          ))}
        </div>

        <div className="flex items-center justify-between mb-2 mt-1">
          <div className="flex  gap-1.5">
            {product.originalPrice && (
              <span className="text-[20px] font-black text-[#222222ff] tracking-tight leading-none">
                {formatLKR(product.price)}
              </span>
            )}

            <span className="text-xs text-gray-500 line-through font-bold">
              {formatLKR(product.originalPrice)}
            </span>
          </div>

        </div>

        {/* Installments */}
        <div className="bg-[#f8f9fa] rounded-lg p-2 mt-auto border border-gray-100 space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">or 3 × {formatLKR(kokoInstallment)}</span>
            <div className="h-4 flex items-center">
              <img src="https://qa-merchant.paykoko.com/assets/images/logo.png" alt="Koko" className="h-full object-contain" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">or 4 × {formatLKR(payzyInstallment)}</span>
            <div className="h-4 flex items-center">
              <img src="https://payzy.lk/images/logoWordDark.png" alt="Payzy" className="h-full object-contain" />
            </div>
          </div>
        </div>





        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="flex-1 bg-black text-white font-black uppercase tracking-wider text-sm py-2.5 rounded-xl hover:bg-gray-900 transition-colors duration-300"
          >
            Buy Now
          </button>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="w-11 h-11 bg-black rounded-xl flex items-center justify-center text-white hover:bg-gray-900 transition-colors duration-300 shrink-0 group/cartbtn"
          >
            <ShoppingCart size={16} strokeWidth={2.5} className="group-hover/cartbtn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
