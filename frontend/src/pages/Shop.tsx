import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { useAdmin } from '../context/AdminContext';
import { ChevronRight, Filter, X, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { BRAND_NEW_CATEGORIES, USED_CATEGORIES } from '../data';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const typeParam = searchParams.get('type');
  const searchParam = searchParams.get('search');

  const { products, categories } = useAdmin();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedCategoryType, setSelectedCategoryType] = useState<'all' | 'brand-new' | 'used'>(
    typeParam === 'used' ? 'used' : typeParam === 'brand-new' ? 'brand-new' : 'all'
  );

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [categoryParam, searchParams, products]);

  const allCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    return [
      ...BRAND_NEW_CATEGORIES.map((c, i) => ({ id: `bn-${i}`, name: c.name, count: c.count, img: c.img, type: 'brand-new' as const })),
      ...USED_CATEGORIES.map((c, i) => ({ id: `u-${i}`, name: c.name, count: c.count, img: c.img, type: 'used' as const })),
    ];
  }, [categories]);

  const displayedCategories = useMemo(() => {
    if (selectedCategoryType === 'all') return allCategories;
    return allCategories.filter(c => c.type === selectedCategoryType);
  }, [allCategories, selectedCategoryType]);

  const productsInCategory = useMemo(() => {
    return products.filter(p => {
      if (categoryParam && categoryParam !== 'All' && categoryParam !== 'all') {
        if (p.category?.toLowerCase() !== categoryParam.toLowerCase()) return false;
      }
      if (selectedCategoryType === 'used') {
        if (!p.category?.toLowerCase().includes('used') && p.isNewProduct !== false) return false;
      } else if (selectedCategoryType === 'brand-new') {
        if (p.category?.toLowerCase().includes('used')) return false;
      }
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
    const s = new Set<string>();
    productsInCategory.forEach(p => p.brand && s.add(p.brand));
    return Array.from(s);
  }, [productsInCategory]);

  const availableTags = useMemo(() => {
    const s = new Set<string>();
    productsInCategory.forEach(p => p.tags?.forEach(t => s.add(t)));
    return Array.from(s);
  }, [productsInCategory]);

  const filteredProducts = useMemo(() => {
    let list = productsInCategory.filter(p => {
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (selectedBrands.length > 0 && (!p.brand || !selectedBrands.includes(p.brand))) return false;
      if (selectedTags.length > 0) {
        if (!p.tags) return false;
        if (!selectedTags.some(t => p.tags!.includes(t))) return false;
      }
      return true;
    });
    switch (sortBy) {
      case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'name-asc': list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': list = [...list].reverse(); break;
    }
    return list;
  }, [productsInCategory, priceRange, selectedBrands, selectedTags, sortBy]);

  const toggleBrand = (brand: string) =>
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedTags([]);
    setPriceRange([0, 1500000]);
    setSortBy('default');
    setSearchParams({});
    setSelectedCategoryType('all');
  };

  const activeFilterCount = selectedBrands.length + selectedTags.length +
    (priceRange[1] < 1500000 ? 1 : 0) + (categoryParam ? 1 : 0) +
    (selectedCategoryType !== 'all' ? 1 : 0);

  const sortLabels: Record<string, string> = {
    default: 'Default Sorting',
    newest: 'Newest First',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'name-asc': 'Name: A–Z',
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Condition */}
      <div>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Condition</h3>
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 text-xs font-bold gap-1">
          {(['all', 'brand-new', 'used'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedCategoryType(type)}
              className={`flex-1 py-2 rounded-lg transition-all duration-200 capitalize ${
                selectedCategoryType === type
                  ? 'bg-[#ea364c] text-white shadow-lg shadow-[#ea364c]/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {type === 'brand-new' ? 'New' : type === 'all' ? 'All' : 'Used'}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
          Categories <span className="text-gray-600 font-normal">({displayedCategories.length})</span>
        </h3>
        <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
          <button
            onClick={() => { const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); }}
            className={`flex items-center justify-between w-full text-xs py-2 px-3 rounded-lg transition-all text-left ${
              !categoryParam
                ? 'bg-[#ea364c]/15 text-[#ea364c] font-bold border border-[#ea364c]/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>All Categories</span>
            <span className="text-[10px] opacity-60">{products.length}</span>
          </button>
          {displayedCategories.map(cat => {
            const isSelected = categoryParam?.toLowerCase() === cat.name.toLowerCase();
            const catCount = products.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <button
                key={cat.id || cat.name}
                onClick={() => { const p = new URLSearchParams(searchParams); p.set('category', cat.name); setSearchParams(p); }}
                className={`flex items-center justify-between w-full text-xs py-2 px-3 rounded-lg transition-all text-left ${
                  isSelected
                    ? 'bg-[#ea364c]/15 text-[#ea364c] font-bold border border-[#ea364c]/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="truncate mr-2">{cat.name}</span>
                <span className="text-[10px] opacity-60 shrink-0">{catCount > 0 ? catCount : cat.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div className="border-t border-white/8 pt-6">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Price Range</h3>
        <input
          type="range"
          min="0"
          max="1500000"
          step="10000"
          value={priceRange[1]}
          onChange={e => setPriceRange([0, parseInt(e.target.value)])}
          className="w-full cursor-pointer accent-[#ea364c]"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-bold text-gray-500 bg-white/5 border border-white/10 px-2 py-1 rounded-md">LKR 0</span>
          <span className="text-[10px] font-bold text-[#ea364c] bg-[#ea364c]/10 border border-[#ea364c]/20 px-2 py-1 rounded-md">
            LKR {priceRange[1].toLocaleString()}
          </span>
        </div>
      </div>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div className="border-t border-white/8 pt-6">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Brands</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
            {availableBrands.map(brand => (
              <label key={brand} className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer hover:text-white group">
                <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                  selectedBrands.includes(brand)
                    ? 'bg-[#ea364c] border-[#ea364c]'
                    : 'border-white/20 group-hover:border-[#ea364c]/50'
                }`}>
                  {selectedBrands.includes(brand) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="hidden" />
                <span className="truncate">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {availableTags.length > 0 && (
        <div className="border-t border-white/8 pt-6">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Features & Tags</h3>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-[#ea364c] text-white border-[#ea364c] shadow-lg shadow-[#ea364c]/25'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-[#ea364c]/50 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full py-2.5 border border-[#ea364c]/30 text-[#ea364c] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#ea364c]/10 transition-all"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#0D1117] min-h-screen pb-20">

      {/* ── Breadcrumb bar ── */}
      <div className="border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-700" />
            <span className="text-gray-300 font-bold">Shop</span>
            {categoryParam && (
              <>
                <ChevronRight size={12} className="text-gray-700" />
                <span className="text-[#ea364c] font-bold">{categoryParam}</span>
              </>
            )}
          </div>
          <span className="text-xs text-gray-600 font-medium hidden md:block">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* ── Horizontal Category Scroll Bar ── */}
      <div className="border-b border-white/5 bg-[#0D1117] sticky top-0 z-20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
            {/* Condition pills */}
            <div className="flex gap-1 shrink-0 mr-2">
              {(['all', 'brand-new', 'used'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedCategoryType(type)}
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap transition-all border ${
                    selectedCategoryType === type
                      ? 'bg-[#ea364c] text-white border-[#ea364c] shadow-md shadow-[#ea364c]/30'
                      : 'text-gray-400 border-white/10 hover:border-[#ea364c]/40 hover:text-white bg-white/5'
                  }`}
                >
                  {type === 'brand-new' ? '🆕 New' : type === 'all' ? '⚡ All' : '♻️ Used'}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10 shrink-0" />

            {/* All Categories button */}
            <button
              onClick={() => { const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); }}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap transition-all border shrink-0 ${
                !categoryParam
                  ? 'bg-white text-gray-900 border-white font-black'
                  : 'text-gray-400 border-white/10 hover:border-white/30 hover:text-white bg-white/5'
              }`}
            >
              All
            </button>

            {/* Category pills */}
            {displayedCategories.map(cat => {
              const isSelected = categoryParam?.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id || cat.name}
                  onClick={() => { const p = new URLSearchParams(searchParams); p.set('category', cat.name); setSearchParams(p); }}
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap transition-all border shrink-0 ${
                    isSelected
                      ? 'bg-white text-gray-900 border-white font-black'
                      : 'text-gray-400 border-white/10 hover:border-white/30 hover:text-white bg-white/5'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 flex gap-6">

        {/* ── Left Sidebar (desktop) ── */}
        <aside className="hidden md:block w-56 lg:w-64 shrink-0">
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 sticky top-[60px]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#ea364c]" />
                <span className="text-sm font-black text-white uppercase tracking-wider">Filters</span>
              </div>
              {activeFilterCount > 0 && (
                <span className="text-[10px] font-black bg-[#ea364c] text-white px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* ── Mobile Filter Overlay ── */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
            <div className="relative ml-auto w-[85%] max-w-sm bg-[#111827] h-full overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#ea364c]" />
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">Filters</h2>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* ── Product Grid ── */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden flex items-center gap-2 bg-white/5 border border-white/10 text-white py-2 px-3 rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
              >
                <Filter size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-[#ea364c] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <h1 className="text-base md:text-lg font-black text-white uppercase tracking-tight truncate">
                {searchParam
                  ? <><Search size={16} className="inline mr-1 text-gray-400" />"{searchParam}"</>
                  : categoryParam || 'All Products'
                }
              </h1>
            </div>

            {/* Sort dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowSortMenu(v => !v)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 py-2 px-3 rounded-xl text-xs font-bold hover:bg-white/10 transition-all whitespace-nowrap"
              >
                {sortLabels[sortBy]}
                <ChevronDown size={12} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#111827] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden">
                  {Object.entries(sortLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => { setSortBy(value); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                        sortBy === value
                          ? 'bg-[#ea364c]/15 text-[#ea364c] font-bold'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {categoryParam && (
                <span className="flex items-center gap-1.5 bg-[#ea364c]/10 border border-[#ea364c]/30 text-[#ea364c] text-[10px] font-bold px-3 py-1.5 rounded-full">
                  {categoryParam}
                  <button onClick={() => { const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); }}>
                    <X size={10} />
                  </button>
                </span>
              )}
              {selectedCategoryType !== 'all' && (
                <span className="flex items-center gap-1.5 bg-[#ea364c]/10 border border-[#ea364c]/30 text-[#ea364c] text-[10px] font-bold px-3 py-1.5 rounded-full capitalize">
                  {selectedCategoryType}
                  <button onClick={() => setSelectedCategoryType('all')}><X size={10} /></button>
                </span>
              )}
              {selectedBrands.map(b => (
                <span key={b} className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold px-3 py-1.5 rounded-full">
                  {b}
                  <button onClick={() => toggleBrand(b)}><X size={10} /></button>
                </span>
              ))}
              {selectedTags.map(t => (
                <span key={t} className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-bold px-3 py-1.5 rounded-full">
                  {t}
                  <button onClick={() => toggleTag(t)}><X size={10} /></button>
                </span>
              ))}
              {priceRange[1] < 1500000 && (
                <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold px-3 py-1.5 rounded-full">
                  ≤ LKR {priceRange[1].toLocaleString()}
                  <button onClick={() => setPriceRange([0, 1500000])}><X size={10} /></button>
                </span>
              )}
              <button onClick={clearAll} className="text-[10px] font-bold text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors">
                Clear all
              </button>
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((p, idx) => (
                  <ProductCard key={p.id || idx} product={p} index={idx} />
                ))}
              </div>
              <p className="text-center text-xs text-gray-600 mt-8">
                Showing all {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                <Filter size={24} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">No Products Found</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or browsing a different category.</p>
              <button
                onClick={clearAll}
                className="bg-[#ea364c] text-white font-black uppercase text-xs py-2.5 px-6 rounded-xl hover:bg-[#c42d3f] transition-colors shadow-lg shadow-[#ea364c]/25"
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
