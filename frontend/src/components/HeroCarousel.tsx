import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { resolveMediaUrl } from '../lib/api';

const HeroCarousel = () => {
  const { heroImages } = useAdmin();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFirstImageLoaded, setIsFirstImageLoaded] = useState(false);

  const validHeroImages = useMemo(() => {
    return heroImages
      .map(resolveMediaUrl)
      .filter(Boolean);
  }, [heroImages]);

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
      <style>{`
        .hero-banner-loader {
          width: 32px;
          aspect-ratio: 1;
          background: #16a34a;
          border-radius: 50%;
          animation: hero-morph 1.8s infinite linear;
        }
        @keyframes hero-morph {
          12.5% { border-radius: 37% 63% 70% 30% / 30% 62% 38% 70%; }
          25% { border-radius: 50% 50% 70% 30% / 52% 62% 38% 48%; }
          37.5% { border-radius: 33% 67% 18% 82% / 52% 75% 25% 48%; }
          50% { border-radius: 73% 27% 18% 82% / 52% 32% 68% 48%; }
          62.5% { border-radius: 73% 27% 74% 26% / 64% 32% 68% 36%; }
          75% { border-radius: 84% 16% 15% 85% / 55% 79% 21% 45%; }
          87.5% { border-radius: 12% 88% 69% 31% / 10% 66% 34% 90%; }
        }
      `}</style>

      {/* Small Morphing Loader inside Hero Banner while loading */}
      {!isFirstImageLoaded && validHeroImages.length > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D1117] z-20">
          <div className="hero-banner-loader shadow-[0_0_15px_rgba(22,163,74,0.5)]" />
        </div>
      )}

      {validHeroImages.map((img, idx) => (
        <img
          key={idx}
          src={img} 
          onLoad={() => {
            if (idx === 0) setIsFirstImageLoaded(true);
          }}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
            if (idx === 0) setIsFirstImageLoaded(true);
          }}
          loading={idx === 0 ? 'eager' : 'lazy'}
          fetchPriority={idx === 0 ? 'high' : 'low'}
          decoding="async"
          alt="Featured Hardware" 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            idx === currentIndex ? 'opacity-100' : 'opacity-0'
          }`} 
        />
      ))}
      
      {/* Controls */}
      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        <button onClick={prevSlide} className="bg-black/50 hover:bg-black/80 backdrop-blur p-2 rounded-full text-white transition-colors pointer-events-auto cursor-pointer">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="bg-black/50 hover:bg-black/80 backdrop-blur p-2 rounded-full text-white transition-colors pointer-events-auto cursor-pointer">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="absolute bottom-6 left-6 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
         <button className="bg-[#15803d] hover:bg-[#166534] text-white font-black uppercase tracking-wider py-3 px-10 rounded-full transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] cursor-pointer">
           Shop Now
         </button>
      </div>
    </div>
  );
};

export default HeroCarousel;
