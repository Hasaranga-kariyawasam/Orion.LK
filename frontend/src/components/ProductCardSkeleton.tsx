import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full p-3 sm:p-3.5 animate-pulse">
      {/* Image Gallery placeholder with overlay badges & wishlist */}
      <div className="relative aspect-[4/3] w-full bg-gray-100 rounded-lg mb-2.5">
        <div className="flex flex-col gap-1 items-start absolute left-2 top-2 z-20">
          <div className="w-10 h-4 bg-gray-200 rounded"></div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="absolute right-2 top-2 z-20 w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="w-full h-3.5 bg-gray-200 rounded mb-1"></div>
        <div className="w-3/4 h-3.5 bg-gray-200 rounded mb-2"></div>

        {/* Rating placeholder */}
        <div className="flex items-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 bg-gray-200 rounded-full"></div>
          ))}
        </div>

        {/* Price placeholder */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col gap-1">
            <div className="w-12 h-2.5 bg-gray-200 rounded"></div>
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-14 h-4 bg-gray-200 rounded"></div>
        </div>

        {/* Installments placeholder */}
        <div className="bg-gray-50 rounded-lg p-1.5 mt-auto space-y-1 mb-2.5">
          <div className="w-full h-2.5 bg-gray-200 rounded"></div>
          <div className="w-full h-2.5 bg-gray-200 rounded"></div>
        </div>

        {/* Action Buttons placeholder */}
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
