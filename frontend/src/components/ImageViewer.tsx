import React, { useState, useRef } from 'react';
import { Maximize2, ChevronUp, ChevronDown, X } from 'lucide-react';

interface ImageViewerProps {
  images: string[];
  productName: string;
  discount?: number;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images, productName, discount }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Hover Zoom State
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const nextImage = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 h-full items-start">
        {/* Thumbnails Sidebar */}
        {images.length > 1 && (
          <div className="flex md:flex-col items-center gap-2 shrink-0 md:w-20">
            <button onClick={prevImage} className="hidden md:flex w-full h-8 items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-md text-gray-400 transition-colors">
              <ChevronUp size={20} />
            </button>
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-hidden w-full py-1 scrollbar-hide">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveIndex(idx)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 overflow-hidden shrink-0 transition-all ${activeIndex === idx ? 'border-gray-900 shadow-md ring-0' : 'border-gray-100 hover:border-gray-300 opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${productName} thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <button onClick={nextImage} className="hidden md:flex w-full h-8 items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-md text-gray-400 transition-colors">
              <ChevronDown size={20} />
            </button>
          </div>
        )}
        
        {/* Main Image Area */}
        <div 
          ref={containerRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          className="flex-1 bg-[#f4f5f7] rounded-3xl w-full aspect-square md:aspect-[4/3] flex items-center justify-center relative overflow-hidden group shadow-sm cursor-crosshair"
        >
          {/* Main Image with Zoom */}
          <img 
            src={activeImage} 
            alt={productName} 
            style={{ 
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              transform: isHovering ? 'scale(2.2)' : 'scale(1)',
            }}
            className="w-[85%] h-[85%] object-contain mix-blend-multiply transition-transform duration-300 ease-out" 
          />

          {/* Badges */}
          {discount && (
            <span className="absolute top-6 right-6 bg-[#fc2d3f] text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              -{discount}%
            </span>
          )}

          {/* Expand Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFullScreen(true); }}
            className="absolute bottom-6 left-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-lg hover:scale-110 hover:text-gray-900 transition-all z-10"
            title="Full Screen"
          >
            <Maximize2 size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
          <button 
            onClick={() => setIsFullScreen(false)}
            className="absolute top-6 right-6 text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center transition-colors z-10"
          >
            <X size={24} />
          </button>
          
          <img 
            src={activeImage} 
            alt={productName} 
            className="w-full h-full max-w-6xl max-h-[85vh] object-contain drop-shadow-2xl" 
          />
        </div>
      )}
    </>
  );
};

export default ImageViewer;
