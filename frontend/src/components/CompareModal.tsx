import React from 'react';
import { X, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatLKR } from '../data';
import { Link } from 'react-router-dom';

const CompareModal: React.FC = () => {
  const { compareList, isCompareModalOpen, setIsCompareModalOpen, toggleCompare } = useShop();

  if (!isCompareModalOpen) return null;

  // Extract all unique specification keys from the two products
  const allSpecKeys = Array.from<string>(new Set(
    compareList.flatMap(p => p.specifications ? Object.keys(p.specifications) : [])
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsCompareModalOpen(false)}
      ></div>
      
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900">
            Compare Products
          </h2>
          <button 
            onClick={() => setIsCompareModalOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {compareList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <X size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-black uppercase text-gray-900 mb-2">No Products Selected</h3>
              <p className="text-gray-500 max-w-md">Add products to comparison to see their specifications side-by-side.</p>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="mt-8 bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-gray-800 transition-colors"
              >
                Back to Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              {/* Product Headers */}
              {compareList.map((product) => (
                <div key={product.id} className="flex flex-col relative group">
                  <button 
                    onClick={() => toggleCompare(product)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur border border-gray-200 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm z-10 transition-colors"
                    title="Remove from comparison"
                  >
                    <X size={16} />
                  </button>
                  <Link to={`/product/${product.id}`} onClick={() => setIsCompareModalOpen(false)} className="block aspect-square bg-gray-50 rounded-2xl p-6 mb-4 border border-gray-100 hover:border-gray-300 transition-colors">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </Link>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{product.brand || 'Generic'}</div>
                  <Link to={`/product/${product.id}`} onClick={() => setIsCompareModalOpen(false)} className="text-base md:text-lg font-black text-gray-900 leading-tight mb-2 hover:underline">
                    {product.name}
                  </Link>
                  <div className="text-xl font-black text-[#2ee661] mb-6">
                    {formatLKR(product.price)}
                  </div>
                </div>
              ))}
              
              {/* If only 1 product is selected */}
              {compareList.length === 1 && (
                <div className="flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl min-h-[300px]">
                  <p className="text-gray-400 font-bold uppercase text-sm text-center px-4">Add another product to compare</p>
                </div>
              )}

              {/* Specifications Table */}
              <div className="col-span-2 mt-8 border-t border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 py-6">Technical Specifications</h3>
                
                {allSpecKeys.length > 0 ? (
                  <div className="flex flex-col">
                    {allSpecKeys.map((key, idx) => (
                      <div key={key} className={`grid grid-cols-2 gap-4 md:gap-8 py-4 px-2 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} rounded-lg`}>
                        {compareList.map(product => (
                          <div key={product.id} className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">{key}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {product.specifications?.[key] || '-'}
                            </span>
                          </div>
                        ))}
                        {compareList.length === 1 && (
                          <div></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                    No detailed specifications available for comparison.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
