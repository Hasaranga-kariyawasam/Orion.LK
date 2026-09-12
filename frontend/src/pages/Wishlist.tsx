import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, ChevronRight, Trash2, ShoppingBag,
  Star, ArrowRight, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useShop } from '../context/ShopContext';
import { formatLKR } from '../data';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, wishlistSyncing } = useShop();
  const navigate = useNavigate();

  return (
    <div className="bg-[#0D1117] min-h-screen pb-20">

      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Heart size={22} className="text-[#ea364c] fill-[#ea364c]" />
              My Wishlist
            </h1>
            {wishlistSyncing && (
              <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <Loader2 size={10} className="animate-spin" /> Syncing…
              </span>
            )}
            {!wishlistSyncing && wishlist.length > 0 && (
              <span className="text-[10px] font-black bg-[#ea364c]/15 text-[#ea364c] border border-[#ea364c]/25 px-2.5 py-1 rounded-full">
                {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-700" />
            <Link to="/profile" className="hover:text-white transition-colors">Profile</Link>
            <ChevronRight size={12} className="text-gray-700" />
            <span className="text-[#ea364c]">Wishlist</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">

        {wishlist.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/6 rounded-2xl p-16 flex flex-col items-center text-center"
          >
            {/* Animated heart */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-[#ea364c]/8 border border-[#ea364c]/15 flex items-center justify-center">
                <Heart size={36} className="text-[#ea364c]/40" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-[#ea364c]/5 blur-xl animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wide mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-8">
              Save items you love by clicking the heart icon on any product. Your wishlist syncs across all your devices.
            </p>
            <Link
              to="/shop"
              className="bg-[#ea364c] text-white font-black text-xs uppercase tracking-wider py-3 px-8 rounded-xl hover:bg-[#c42d3f] transition-all shadow-lg shadow-[#ea364c]/25 flex items-center gap-2"
            >
              <ShoppingBag size={15} /> Browse Products <ArrowRight size={13} />
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Actions bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs text-gray-500">
                <span className="text-white font-bold">{wishlist.length}</span> saved item{wishlist.length !== 1 ? 's' : ''} · synced to your account
              </p>
              <button
                onClick={() => wishlist.forEach(p => addToCart(p))}
                className="flex items-center gap-2 bg-[#ea364c] text-white text-xs font-black uppercase tracking-wider py-2 px-4 rounded-xl hover:bg-[#c42d3f] transition-all shadow-md shadow-[#ea364c]/20"
              >
                <ShoppingCart size={13} /> Add All to Cart
              </button>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {wishlist.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden group hover:border-white/15 transition-all"
                  >
                    {/* Image */}
                    <div
                      className="relative h-44 bg-white/3 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600'; }}
                      />
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.discount && (
                          <span className="bg-[#ea364c] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                            -{product.discount}%
                          </span>
                        )}
                        {product.isNew && (
                          <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                            New
                          </span>
                        )}
                      </div>
                      {/* Remove from wishlist */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#ea364c] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{product.brand || product.category}</p>
                      <h3
                        className="text-sm font-bold text-white leading-snug mb-2 line-clamp-2 cursor-pointer hover:text-[#ea364c] transition-colors"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {product.name}
                      </h3>

                      {/* Rating */}
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                className={i < Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-500">({product.reviews})</span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-base font-black text-white">{formatLKR(product.price)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[11px] text-gray-600 line-through">{formatLKR(product.originalPrice)}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.status === 'Sold Out'}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-[#ea364c] hover:bg-[#c42d3f] text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-md shadow-[#ea364c]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart size={12} />
                          {product.status === 'Sold Out' ? 'Sold Out' : 'Add to Cart'}
                        </button>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ea364c] hover:bg-[#ea364c]/10 hover:border-[#ea364c]/30 transition-all"
                          title="Remove from wishlist"
                        >
                          <Heart size={14} className="fill-[#ea364c]" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
