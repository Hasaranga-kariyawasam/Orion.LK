import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full p-4 animate-pulse">
      {/* Top badges & Icons placeholder */}
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex flex-col gap-1 items-start absolute left-2 top-2 z-20">
          <div className="w-12 h-5 bg-gray-200 rounded"></div>
          <div className="w-10 h-5 bg-gray-200 rounded"></div>
        </div>
        <div className="absolute right-2 top-2 z-20 w-9 h-9 bg-gray-200 rounded-full"></div>
      </div>

      {/* Image Gallery placeholder */}
      <div className="relative aspect-[4/3] w-full bg-gray-100 rounded-lg mb-4 mt-8"></div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="w-full h-4 bg-gray-200 rounded mb-1.5"></div>
        <div className="w-3/4 h-4 bg-gray-200 rounded mb-3"></div>

        {/* Rating placeholder */}
        <div className="flex items-center gap-1 mb-2.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded-full"></div>
          ))}
        </div>

        {/* Price placeholder */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex flex-col gap-1">
            <div className="w-16 h-3 bg-gray-200 rounded"></div>
            <div className="w-24 h-5 bg-gray-200 rounded"></div>
          </div>
          <div className="w-16 h-5 bg-gray-200 rounded"></div>
        </div>

        {/* Installments placeholder */}
        <div className="bg-gray-50 rounded-lg p-2 mt-auto space-y-2 mb-3">
          <div className="w-full h-3 bg-gray-200 rounded"></div>
          <div className="w-full h-3 bg-gray-200 rounded"></div>
        </div>

        {/* Action Buttons placeholder */}
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
          <div className="w-11 h-11 bg-gray-200 rounded-xl shrink-0"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
