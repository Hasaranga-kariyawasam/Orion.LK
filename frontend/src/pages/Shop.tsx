import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { useAdmin } from '../context/AdminContext';
import { ChevronRight, Filter, X, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { getProductType, isUsedProduct, PRODUCT_TYPES } from '../lib/productClassification';

const ITEMS_PER_PAGE = 16;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const typeParam = searchParams.get('type');
  const productTypeParam = searchParams.get('productType');
  const searchParam = searchParams.get('search');

  const { products, categories, productsLoading, productsError, refreshProducts } = useAdmin();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
    setSelectedCategoryType(typeParam === 'used' ? 'used' : typeParam === 'brand-new' ? 'brand-new' : 'all');
  }, [typeParam]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, productTypeParam, selectedCategoryType, selectedBrands, selectedTags, priceRange, searchParam, sortBy]);

  const allCategories = categories;

  const displayedCategories = useMemo(() => {
    return allCategories.filter(c =>
      (!productTypeParam || getProductType(c.productType, '', c.name) === productTypeParam) &&
      (selectedCategoryType === 'all' || c.type === selectedCategoryType)
    );
  }, [allCategories, selectedCategoryType, productTypeParam]);

  const productsInCategory = useMemo(() => {
    return products.filter(p => {
      if (categoryParam && categoryParam !== 'All' && categoryParam !== 'all') {
        if (p.category?.toLowerCase() !== categoryParam.toLowerCase()) return false;
      }
      const matchingCategory = categories.find(c => c.name.toLowerCase() === p.category?.toLowerCase());
      const productType = getProductType(
        matchingCategory?.productType || p.productType,
        p.name,
        p.category,
        matchingCategory?.productTypeManual,
      );
      if (productTypeParam && productType !== productTypeParam) return false;
      const isUsed = isUsedProduct(p, matchingCategory?.type);
      if (selectedCategoryType === 'used' && !isUsed) return false;
      if (selectedCategoryType === 'brand-new' && isUsed) return false;
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
  }, [products, categories, categoryParam, productTypeParam, selectedCategoryType, searchParam]);

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

  const setConditionFilter = (type: 'all' | 'brand-new' | 'used') => {
    const params = new URLSearchParams(searchParams);
    if (type === 'all') params.delete('type');
    else params.set('type', type);
    setSearchParams(params);
    setSelectedCategoryType(type);
  };

  const setProductTypeFilter = (productType: string) => {
    const params = new URLSearchParams(searchParams);
    if (productType === 'all') params.delete('productType');
    else params.set('productType', productType);
    setSearchParams(params);
  };

  const activeFilterCount = selectedBrands.length + selectedTags.length +
    (priceRange[1] < 1500000 ? 1 : 0) + (categoryParam ? 1 : 0) +
    (selectedCategoryType !== 'all' ? 1 : 0) + (productTypeParam ? 1 : 0);

  const sortLabels: Record<string, string> = {
    default: 'Default Sorting',
    newest: 'Newest First',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'name-asc': 'Name: A–Z',
  };

  const FilterPanel = () => (
    <div className="space-y-4 md:space-y-6">
      {/* Condition */}
      <div>
        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-3">Condition</h3>
        <div className="flex bg-gray-100 border border-gray-200/80 rounded-xl p-1 text-xs font-bold gap-1">
          {(['all', 'brand-new', 'used'] as const).map(type => (
            <button
              key={type}
              onClick={() => setConditionFilter(type)}
              className={`flex-1 py-2 rounded-lg transition-all duration-200 capitalize ${selectedCategoryType === type
                ? 'bg-[#161B22] text-white font-black'
                : 'text-gray-600 hover:text-[#15803d]'
                }`}
            >
              {type === 'brand-new' ? 'New' : type === 'all' ? 'All' : 'Used'}
            </button>
          ))}
        </div>
      </div>

      {/* Product type */}
      <div>
        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-3">Product Type</h3>
        <div className="flex flex-wrap gap-1.5">
          {(['all', ...PRODUCT_TYPES] as const).map(productType => (
            <button
              key={productType}
              onClick={() => setProductTypeFilter(productType)}
              className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${(!productTypeParam && productType === 'all') || productTypeParam === productType
                ? 'bg-[#161B22] text-white'
                : 'bg-gray-100 text-gray-600 hover:text-[#15803d]'
              }`}
            >
              {productType === 'all' ? 'All' : productType === 'pc' ? 'PC' : productType}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-3">
          Categories <span className="text-gray-400 font-normal">({displayedCategories.length})</span>
        </h3>
        <div className="space-y-1 max-h-48 md:max-h-64 overflow-y-auto pr-1 scrollbar-hide">
          <button
            onClick={() => { const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); }}
            className={`flex items-center justify-between w-full text-xs py-2 px-3 rounded-lg transition-all text-left ${!categoryParam
              ? 'bg-[#161B22] text-white font-bold'
              : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
          >
            <span>All Categories</span>
            <span className="text-[10px] opacity-70">{products.length}</span>
          </button>
          {displayedCategories.map(cat => {
            const isSelected = categoryParam?.toLowerCase() === cat.name.toLowerCase();
            const catCount = productsInCategory.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <button
                key={cat.id || cat.name}
                onClick={() => { const p = new URLSearchParams(searchParams); p.set('category', cat.name); setSearchParams(p); }}
                className={`flex items-center justify-between w-full text-xs py-2 px-3 rounded-lg transition-all text-left ${isSelected
                  ? 'bg-[#161B22] text-white font-bold'
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
          className="w-full cursor-pointer accent-[#15803d]"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded-md">LKR 0</span>
          <span className="text-[10px] font-bold text-[#15803d] bg-green-50 border border-green-300 px-2 py-1 rounded-md">
            LKR {priceRange[1].toLocaleString()}
          </span>
        </div>
      </div>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div className="border-t border-gray-200 pt-5">
          <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-3">Brands</h3>
          <div className="space-y-2 max-h-36 md:max-h-48 overflow-y-auto pr-1 scrollbar-hide">
            {availableBrands.map(brand => (
              <label key={brand} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-black group">
                <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${selectedBrands.includes(brand)
                  ? 'bg-[#15803d] border-[#15803d]'
                  : 'border-gray-300 group-hover:border-[#15803d]'
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
                className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border transition-all ${selectedTags.includes(tag)
                  ? 'bg-[#161B22] text-white border-[#161B22] shadow-sm'
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
          className="w-full py-2.5 border border-[#15803d]/40 text-[#15803d] bg-green-50/60 hover:bg-green-100/80 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">

      {/* ── Breadcrumb bar ── */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Link to="/" className="hover:text-black transition-colors font-bold">Home</Link>
            <ChevronRight size={13} className="text-gray-400" />
            <span className="text-gray-900 font-bold">Shop</span>
            {(categoryParam || productTypeParam) && (
              <>
                <ChevronRight size={13} className="text-gray-400" />
                <span className="text-[#ea364c] font-bold capitalize">{categoryParam || (productTypeParam === 'pc' ? 'PC' : productTypeParam)}</span>
              </>
            )}
          </div>
          <span className="text-xs text-gray-500 font-medium hidden md:block">
            {productsLoading ? 'Loading products...' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`}
          </span>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-4 mt-0 flex gap-6">

        {/* ── Left Sidebar (desktop) ── */}
        <aside className="hidden md:block w-56 lg:w-64 shrink-0">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5  top-[60px]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#15803d]" />
                <span className="text-sm font-black text-gray-900 uppercase tracking-wider">Filters</span>
              </div>
              {activeFilterCount > 0 && (
                <span className="text-[10px] font-black bg-[#15803d] text-white px-2 py-0.5 rounded-full">
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
            <div className="relative ml-auto w-[88%] max-w-sm bg-white h-full overflow-y-auto p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 flex items-center justify-between border-b border-gray-100 bg-white px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:-mx-6 sm:-mt-6 sm:px-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#15803d]" />
                  <div>
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">Filters</h2>
                    <p className="text-[11px] text-gray-500">{filteredProducts.length} matching products</p>
                  </div>
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
          <div className="mb-4 md:mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="order-2 md:hidden min-h-11 shrink-0 flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-200 text-gray-800 py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold hover:bg-gray-50 shadow-sm transition-all"
              >
                <Filter size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-[#15803d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <h1 className="order-1 min-w-0 flex-1 text-[13px] sm:text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight truncate">
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
                aria-label={`Sort products: ${sortLabels[sortBy]}`}
                className="min-h-11 flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-200 text-gray-800 py-2 px-2.5 sm:px-3.5 rounded-xl text-xs font-bold hover:border-gray-300 shadow-sm transition-all whitespace-nowrap"
              >
                <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
                <span className="sm:hidden"><SlidersHorizontal size={15} /></span>
                <ChevronDown size={12} className={`transition-transform text-gray-400 ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                  {Object.entries(sortLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => { setSortBy(value); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${sortBy === value
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
          <p className="md:hidden mt-2 text-[11px] font-medium text-gray-500">
            {productsLoading ? 'Loading products…' : `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} found`}
          </p>
          </div>

          {/* Grid */}
          {productsLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center py-28 min-h-[400px]">
              <div className="loader mb-4 text-[#161B22]" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading products from the database...</p>
            </div>
          ) : productsError ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center py-20 px-6 min-h-[300px] text-center">
              <p className="text-sm font-bold text-gray-800">Could not load products from the database.</p>
              <p className="mt-2 text-xs text-gray-500">{productsError}</p>
              <button
                onClick={() => void refreshProducts()}
                className="mt-5 rounded-xl bg-[#161B22] px-5 py-2.5 text-xs font-bold text-white"
              >
                Try again
              </button>
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                {paginatedProducts.map((p, idx) => (
                  <ProductCard key={p.id || idx} product={p} index={idx} />
                ))}
              </div>

              {/* ── Page-wise Pagination ── */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-200 pb-10 mb-10">
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
                              className={`w-9 h-9 text-xs font-black rounded-xl transition-all ${currentPage === page
                                ? 'bg-[#161B22] text-white shadow-sm'
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
                className="bg-[#161B22] hover:bg-[#0D1117] text-white font-black uppercase text-xs py-2.5 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
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
