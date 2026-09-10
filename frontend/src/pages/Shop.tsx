import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { useAdmin } from '../context/AdminContext';
import { ChevronRight, Filter, X } from 'lucide-react';
import { BRAND_NEW_CATEGORIES, USED_CATEGORIES } from '../data';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const typeParam = searchParams.get('type'); // 'brand-new' | 'used'
  const searchParam = searchParams.get('search');
  
  const { products, categories } = useAdmin();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500000]);
  const [selectedCategoryType, setSelectedCategoryType] = useState<'all' | 'brand-new' | 'used'>(
    typeParam === 'used' ? 'used' : typeParam === 'brand-new' ? 'brand-new' : 'all'
  );

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [categoryParam, searchParams, products]);

  // Combine categories
  const allCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    return [
      ...BRAND_NEW_CATEGORIES.map((c, i) => ({ id: `bn-${i}`, name: c.name, count: c.count, img: c.img, type: 'brand-new' as const })),
      ...USED_CATEGORIES.map((c, i) => ({ id: `u-${i}`, name: c.name, count: c.count, img: c.img, type: 'used' as const })),
    ];
  }, [categories]);

  // Extract products in category / search filter
  const productsInCategory = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (categoryParam && categoryParam !== 'All' && categoryParam !== 'all') {
        const catMatch = p.category?.toLowerCase() === categoryParam.toLowerCase();
        if (!catMatch) return false;
      }
      // Type filter (brand new vs used)
      if (selectedCategoryType === 'used') {
        if (!p.category?.toLowerCase().includes('used') && p.isNewProduct !== false) return false;
      } else if (selectedCategoryType === 'brand-new') {
        if (p.category?.toLowerCase().includes('used')) return false;
      }
      // Search keyword filter
      if (searchParam && searchParam.trim()) {
        const q = searchParam.toLowerCase().trim();
        const match = p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [products, categoryParam, selectedCategoryType, searchParam]);

  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    productsInCategory.forEach(p => p.brand && brandsSet.add(p.brand));
    return Array.from(brandsSet);
  }, [productsInCategory]);

  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    productsInCategory.forEach(p => p.tags?.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
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

  const displayedCategories = useMemo(() => {
    if (selectedCategoryType === 'all') return allCategories;
    return allCategories.filter(c => c.type === selectedCategoryType);
  }, [allCategories, selectedCategoryType]);

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
            {/* Condition Tabs */}
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">Item Condition</h3>
              <div className="flex bg-gray-200 rounded-lg p-1 text-xs font-bold">
                <button
                  onClick={() => setSelectedCategoryType('all')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${selectedCategoryType === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-600'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedCategoryType('brand-new')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${selectedCategoryType === 'brand-new' ? 'bg-white text-black shadow-sm' : 'text-gray-600'}`}
                >
                  Brand New
                </button>
                <button
                  onClick={() => setSelectedCategoryType('used')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${selectedCategoryType === 'used' ? 'bg-white text-black shadow-sm' : 'text-gray-600'}`}
                >
                  Used
                </button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Categories</h3>
                <span className="text-xs text-gray-400 font-bold">({displayedCategories.length})</span>
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                <button 
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('category');
                    setSearchParams(newParams);
                  }}
                  className={`block text-xs py-1.5 px-2 rounded-lg w-full text-left transition-colors ${!categoryParam ? 'font-bold bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  All Categories ({products.length})
                </button>
                {displayedCategories.map(cat => {
                  const isSelected = categoryParam?.toLowerCase() === cat.name.toLowerCase();
                  const catCount = products.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length;
                  return (
                    <button 
                      key={cat.id || cat.name}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('category', cat.name);
                        setSearchParams(newParams);
                      }}
                      className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg w-full text-left transition-colors ${isSelected ? 'font-bold bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <span className="truncate mr-2">{cat.name}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                        {catCount > 0 ? catCount : cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Price Range</h3>
              <input 
                type="range" 
                min="0" 
                max="1500000" 
                step="10000"
                value={priceRange[1]} 
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full accent-gray-900 cursor-pointer"
              />
              <div className="flex items-center justify-between mt-2 text-xs font-bold text-gray-500">
                <span>LKR 0</span>
                <span>LKR {priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            {/* Brand Filter (Dynamic) */}
            {availableBrands.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Brands</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-900">
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
              {categoryParam || (searchParam ? `Search: "${searchParam}"` : 'All Products')}
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
                <ProductCard key={p.id || idx} product={p} index={idx} />
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
                onClick={() => { setSelectedBrands([]); setSelectedTags([]); setPriceRange([0, 1500000]); setSearchParams({}); }}
                className="mt-6 bg-gray-900 text-white font-black uppercase text-xs py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
