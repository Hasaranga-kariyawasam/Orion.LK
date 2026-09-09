import React from 'react';

const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-16 animate-pulse">
      {/* Breadcrumbs placeholder */}
      <div className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="w-12 h-3 bg-gray-200 rounded"></div>
          <div className="w-2 h-3 bg-gray-200 rounded"></div>
          <div className="w-20 h-3 bg-gray-200 rounded"></div>
          <div className="w-2 h-3 bg-gray-200 rounded"></div>
          <div className="w-48 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          
          {/* Left: Image Gallery placeholder */}
          <div className="flex flex-col md:flex-row gap-4 h-full items-start">
            <div className="flex md:flex-col items-center gap-2 shrink-0 md:w-20">
              <div className="w-full h-8 bg-gray-200 rounded-md hidden md:block"></div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-2xl shrink-0"></div>
              ))}
              <div className="w-full h-8 bg-gray-200 rounded-md hidden md:block"></div>
            </div>
            <div className="flex-1 bg-gray-100 rounded-3xl w-full aspect-square md:aspect-[4/3]"></div>
          </div>

          {/* Right: Product Info placeholder */}
          <div className="flex flex-col">
            <div className="w-3/4 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-1/2 h-8 bg-gray-200 rounded mb-4"></div>
            
            <div className="space-y-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full h-4 bg-gray-200 rounded"></div>
              ))}
            </div>

            <div className="w-40 h-6 bg-gray-200 rounded mb-6"></div>
            
            <div className="w-1/3 h-10 bg-gray-200 rounded mb-6"></div>

            <div className="space-y-3 mb-8">
              <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
              <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
            </div>
            
            <div className="flex gap-3 mb-4">
              <div className="w-32 h-14 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 h-14 bg-gray-200 rounded-xl"></div>
              <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
            </div>
            
            <div className="w-full sm:w-48 h-12 bg-gray-200 rounded-xl mb-8"></div>
          </div>
        </div>

        {/* Tabs placeholder */}
        <div className="mt-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex gap-8 mb-6 border-b border-gray-100 pb-2">
            <div className="w-24 h-5 bg-gray-200 rounded"></div>
            <div className="w-32 h-5 bg-gray-200 rounded"></div>
            <div className="w-20 h-5 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
