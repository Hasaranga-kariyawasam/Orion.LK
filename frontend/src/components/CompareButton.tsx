import React from 'react';
import { Scale } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const CompareButton: React.FC = () => {
  const { compareList, setIsCompareModalOpen } = useShop();

  if (compareList.length === 0) return null;

  return (
    <button 
      onClick={() => setIsCompareModalOpen(true)}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-8 md:left-auto md:translate-x-0 md:right-8 z-40 bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl hover:bg-black transition-all hover:scale-105"
    >
      <div className="relative">
        <Scale size={20} />
        <span className="absolute -top-2 -right-2 bg-[#2ee661] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
          {compareList.length}
        </span>
      </div>
      <span className="font-black uppercase tracking-wider text-xs hidden sm:block">Compare</span>
    </button>
  );
};

export default CompareButton;
