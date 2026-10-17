import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { resolveMediaUrl } from '../lib/api';

const HeroCarousel = () => {
  const { heroImages, products, categories } = useAdmin();
  const [currentIndex, setCurrentIndex] = useState(0);
  const validHeroImages = useMemo(() => {
    const configuredImages = heroImages.map(resolveMediaUrl).filter(Boolean);
    if (configuredImages.length > 0) return configuredImages;

    const databaseImages = [
      ...products.flatMap(product => product.images || [product.image]),
      ...categories.map(category => category.img),
    ].map(resolveMediaUrl).filter(Boolean);

    return Array.from(new Set(databaseImages)).slice(0, 8);
  }, [heroImages, products, categories]);

  useEffect(() => {
    if (validHeroImages.length === 0) return;
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = validHeroImages[0];
    document.head.appendChild(preload);
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validHeroImages.length);
    }, 4000);
    return () => {
      clearInterval(timer);
      preload.remove();
    };
  }, [validHeroImages]);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validHeroImages.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validHeroImages.length) % validHeroImages.length);
  };

  return (
    <div className="w-full h-full relative group bg-[#0D1117] rounded-2xl overflow-hidden cursor-pointer shadow-lg">
      {validHeroImages.map((img, idx) => (
        <img
          key={idx}
          src={img} 
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
          loading={idx === 0 ? 'eager' : 'lazy'}
          fetchPriority={idx === 0 ? 'high' : 'low'}
          decoding="async"
          alt="Premium PC Build" 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            idx === currentIndex ? 'opacity-100' : 'opacity-0'
          }`} 
        />
      ))}
      
      {/* Controls */}
      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        <button onClick={prevSlide} className="bg-black/50 hover:bg-black/80 backdrop-blur p-2 rounded-full text-white transition-colors pointer-events-auto">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="bg-black/50 hover:bg-black/80 backdrop-blur p-2 rounded-full text-white transition-colors pointer-events-auto">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="absolute bottom-6 left-6 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
         <button className="bg-[#2ee661] text-black font-black uppercase tracking-wider py-3 px-10 rounded-full hover:bg-white transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
           Shop Now
         </button>
      </div>
    </div>
  );
};

export default HeroCarousel;
