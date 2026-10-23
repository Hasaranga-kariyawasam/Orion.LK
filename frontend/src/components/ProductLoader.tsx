import React from 'react';

interface ProductLoaderProps {
  text?: string;
  className?: string;
  color?: string;
}

export default function ProductLoader({
  text = 'Loading Products...',
  className = '',
  color = 'text-[#161B22]'
}: ProductLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 min-h-[300px] w-full ${className}`}>
      <div className={`loader mb-3.5 ${color}`} />
      {text && (
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{text}</p>
      )}
    </div>
  );
}
