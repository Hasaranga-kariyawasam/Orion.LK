import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { useAdmin } from '../context/AdminContext';
import { ChevronRight, Filter, X, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { BRAND_NEW_CATEGORIES, USED_CATEGORIES } from '../data';

const ITEMS_PER_PAGE = 16;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategoryType, setSelectedCategoryType] = useState<'all' | 'brand-new' | 'used'>(
    typeParam === 'used' ? 'used' : typeParam === 'brand-new' ? 'brand-new' : 'all'
  );

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [categoryParam, searchParams, products]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, selectedCategoryType, selectedBrands, selectedTags, priceRange, searchParam, sortBy]);

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

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-3">Condition</h3>
        <div className="flex bg-gray-100 border border-gray-200/80 rounded-xl p-1 text-xs font-bold gap-1">
          {(['all', 'brand-new', 'used'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedCategoryType(type)}
              className={`flex-1 py-2 rounded-lg transition-all duration-200 capitalize ${
                selectedCategoryType === type
                  ? 'bg-black text-white shadow-sm font-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {type === 'brand-new' ? 'New' : type === 'all' ? 'All' : 'Used'}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-3">
          Categories <span className="text-gray-400 font-normal">({displayedCategories.length})</span>
        </h3>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
          <button
            onClick={() => { const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); }}
            className={`flex items-center justify-between w-full text-xs py-2 px-3 rounded-lg transition-all text-left ${
              !categoryParam
                ? 'bg-black text-white font-bold'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            <span>All Categories</span>
            <span className="text-[10px] opacity-70">{products.length}</span>
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
                    ? 'bg-black text-white font-bold'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <span className="truncate mr-2">{cat.name}</span>
                <span className="text-[10px] opacity-70 shrink-0">{catCount > 0 ? catCount : cat.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div className="border-t border-gray-200 pt-5">
        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-4">Price Range</h3>
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
          <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded-md">LKR 0</span>
          <span className="text-[10px] font-bold text-[#ea364c] bg-red-50 border border-red-200 px-2 py-1 rounded-md">
            LKR {priceRange[1].toLocaleString()}
          </span>
        </div>
      </div>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div className="border-t border-gray-200 pt-5">
          <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-3">Brands</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
            {availableBrands.map(brand => (
              <label key={brand} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-black group">
                <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                  selectedBrands.includes(brand)
                    ? 'bg-[#ea364c] border-[#ea364c]'
                    : 'border-gray-300 group-hover:border-[#ea364c]'
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
        <div className="border-t border-gray-200 pt-5">
          <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-3">Features & Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-black hover:bg-gray-50'
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
          className="w-full py-2.5 border border-red-200 text-[#ea364c] bg-red-50 hover:bg-red-100 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Breadcrumb bar ── */}
      <div className="border-b border-gray-200 bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Link to="/" className="hover:text-black transition-colors font-bold">Home</Link>
            <ChevronRight size={13} className="text-gray-400" />
            <span className="text-gray-900 font-bold">Shop</span>
            {categoryParam && (
              <>
                <ChevronRight size={13} className="text-gray-400" />
                <span className="text-[#ea364c] font-bold">{categoryParam}</span>
              </>
            )}
          </div>
          <span className="text-xs text-gray-500 font-medium hidden md:block">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* ── Horizontal Category Scroll Bar (No Emojis) ── */}
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2.5">
            {/* Condition pills - clean text without emojis */}
            <div className="flex gap-1 shrink-0 mr-2">
              {(['all', 'brand-new', 'used'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedCategoryType(type)}
                  className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all border ${
                    selectedCategoryType === type
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'text-gray-600 border-gray-200 hover:border-gray-400 hover:text-black bg-gray-100'
                  }`}
                >
                  {type === 'brand-new' ? 'New' : type === 'all' ? 'All' : 'Used'}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 shrink-0" />

            {/* All Categories button */}
            <button
              onClick={() => { const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); }}
              className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all border shrink-0 ${
                !categoryParam
                  ? 'bg-black text-white border-black font-black shadow-sm'
                  : 'text-gray-700 border-gray-200 hover:border-gray-400 hover:text-black bg-white hover:bg-gray-50'
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
                  className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all border shrink-0 ${
                    isSelected
                      ? 'bg-black text-white border-black font-black shadow-sm'
                      : 'text-gray-700 border-gray-200 hover:border-gray-400 hover:text-black bg-white hover:bg-gray-50'
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
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sticky top-[60px] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#ea364c]" />
                <span className="text-sm font-black text-gray-900 uppercase tracking-wider">Filters</span>
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
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsFilterOpen(false)} />
            <div className="relative ml-auto w-[85%] max-w-sm bg-white h-full overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#ea364c]" />
                  <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">Filters</h2>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black"
                >
                  <X size={16} />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* ── Product Grid Area ── */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden flex items-center gap-2 bg-white border border-gray-200 text-gray-800 py-2 px-3 rounded-xl text-xs font-bold hover:bg-gray-50 shadow-sm transition-all"
              >
                <Filter size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-[#ea364c] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <h1 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight truncate">
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
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 py-2 px-3.5 rounded-xl text-xs font-bold hover:border-gray-300 shadow-sm transition-all whitespace-nowrap"
              >
                {sortLabels[sortBy]}
                <ChevronDown size={12} className={`transition-transform text-gray-400 ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                  {Object.entries(sortLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => { setSortBy(value); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                        sortBy === value
                          ? 'bg-red-50 text-[#ea364c] font-bold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedProducts.map((p, idx) => (
                  <ProductCard key={p.id || idx} product={p} index={idx} />
                ))}
              </div>

              {/* ── Page-wise Pagination ── */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">
                    Showing <span className="font-bold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> of <span className="font-bold text-gray-900">{filteredProducts.length}</span> products
                  </p>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                    >
                      Previous
                    </button>

                    {/* Page Numbers with smart ellipsis */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                      .map((page, idx, arr) => {
                        const prev = arr[idx - 1];
                        const hasGap = prev && page - prev > 1;
                        return (
                          <React.Fragment key={page}>
                            {hasGap && <span className="px-1 text-gray-400 text-xs">...</span>}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`w-9 h-9 text-xs font-black rounded-xl transition-all ${
                                currentPage === page
                                  ? 'bg-black text-white shadow-sm'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mb-5">
                <Filter size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-wide">No Products Found</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or browsing a different category.</p>
              <button
                onClick={clearAll}
                className="bg-black hover:bg-gray-800 text-white font-black uppercase text-xs py-2.5 px-6 rounded-xl transition-colors shadow-sm"
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
