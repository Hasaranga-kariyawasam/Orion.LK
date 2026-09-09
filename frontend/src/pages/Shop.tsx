import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MOCK_PRODUCTS, BRAND_NEW_CATEGORIES } from '../data';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { useEffect } from 'react';
import { ChevronRight, Filter, X } from 'lucide-react';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [categoryParam, searchParams]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  // Extract unique tags and brands for the current category
  const productsInCategory = useMemo(() => {
    if (!categoryParam) return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter(p => p.category === categoryParam);
  }, [categoryParam]);

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    productsInCategory.forEach(p => p.brand && brands.add(p.brand));
    return Array.from(brands);
  }, [productsInCategory]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    productsInCategory.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [productsInCategory]);

  // Filters state
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return productsInCategory.filter(p => {
      // Price filter
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      
      // Brand filter
      if (selectedBrands.length > 0 && (!p.brand || !selectedBrands.includes(p.brand))) return false;
      
      // Tag filter
      if (selectedTags.length > 0) {
        if (!p.tags) return false;
        const hasMatchingTag = selectedTags.some(tag => p.tags!.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });
  }, [productsInCategory, priceRange, selectedBrands, selectedTags]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link to="/" className="hover:text-black transition-colors">HOME</Link>
          <ChevronRight size={14} />
          <span className="text-black font-bold">SHOP {categoryParam ? `- ${categoryParam.toUpperCase()}` : ''}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 md:mt-8 flex flex-col md:flex-row gap-8">
        
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="md:hidden flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold uppercase tracking-wider"
        >
          <Filter size={18} /> Show Filters
        </button>

        {/* Sidebar Filters */}
        <div className={`fixed inset-0 z-50 bg-white p-6 transform transition-transform duration-300 md:relative md:inset-auto md:bg-transparent md:p-0 md:w-64 md:shrink-0 md:transform-none ${isFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex items-center justify-between md:hidden mb-6">
            <h2 className="text-xl font-black uppercase">Filters</h2>
            <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
          </div>

          <div className="space-y-8 h-full overflow-y-auto md:overflow-visible pb-20 md:pb-0">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Categories</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setSearchParams({})}
                  className={`block text-sm w-full text-left ${!categoryParam ? 'font-bold text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  All Products
                </button>
                {BRAND_NEW_CATEGORIES.slice(0, 8).map(cat => (
                  <button 
                    key={cat.name}
                    onClick={() => setSearchParams({ category: cat.name })}
                    className={`block text-sm w-full text-left ${categoryParam === cat.name ? 'font-bold text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Price Range</h3>
              <input 
                type="range" 
                min="0" 
                max="1000000" 
                step="10000"
                value={priceRange[1]} 
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full accent-gray-900"
              />
              <div className="flex items-center justify-between mt-2 text-xs font-bold text-gray-500">
                <span>Rs. 0</span>
                <span>Rs. {priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            {/* Brand Filter (Dynamic) */}
            {availableBrands.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Brands</h3>
                <div className="space-y-2">
                  {availableBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                      <input 
                        type="checkbox" 
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Filter (Dynamic) */}
            {availableTags.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Features & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border transition-colors ${
                        selectedTags.includes(tag) 
                          ? 'bg-gray-900 text-white border-gray-900' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">
              {categoryParam || 'All Products'}
            </h1>
            <span className="text-sm font-bold text-gray-400">{filteredProducts.length} Results</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Filter size={24} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">No Products Found</h3>
              <p className="text-gray-500">Try adjusting your filters or selecting a different category.</p>
              <button 
                onClick={() => { setSelectedBrands([]); setSelectedTags([]); setPriceRange([0, 1000000]); }}
                className="mt-6 bg-gray-900 text-white font-black uppercase text-xs py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
