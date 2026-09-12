import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../data';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import { useAdmin } from '../context/AdminContext';
import { Truck, Smile, ShieldCheck, Award, CheckCircle, ChevronLeft, ChevronRight, Play, Youtube, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';


const AnimatedSection = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.section>
);

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [transform, setTransform] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // max rotation 8 degrees for a subtle effect
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-200 ease-out ${className || ''}`}
      style={{ transform, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

const getYouTubeEmbedUrl = (value: string) => {
  try {
    const url = new URL(value);
    const videoId = url.hostname === 'youtu.be'
      ? url.pathname.slice(1)
      : url.searchParams.get('v') || url.pathname.match(/\/embed\/([^/?]+)/)?.[1];

    return url.hostname.includes('youtube.com') || url.hostname === 'youtu.be'
      ? videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}` : null
      : null;
  } catch {
    return null;
  }
};

const FALLBACK_VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';





export default function Home() {
  const { videoUrl, accessories, brands, categories, products } = useAdmin();
  const [isMuted, setIsMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showVideoText, setShowVideoText] = useState(true);
  const [bestSellerCategory, setBestSellerCategory] = useState('Processors');
  const videoRef = useRef<HTMLVideoElement>(null);
  const categorySliderRef = useRef<HTMLDivElement>(null);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categorySliderRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      categorySliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const displayCategories = categories && categories.length > 0 ? categories : CATEGORIES;
  const clearanceProducts = products.filter(p => (p.discount && p.discount > 0) || p.price < 150000).slice(0, 8);
  const displayClearance = clearanceProducts.length > 0 ? clearanceProducts : products.slice(0, 8);

  const bestSellerProducts = products.filter(p => {
    if (bestSellerCategory === 'Coolers') {
      return p.category === 'Coolers' || p.category === 'Cooling Pads' || p.category === 'Fan Kits';
    }
    return p.category === bestSellerCategory;
  });
  const displayBestSellers = bestSellerProducts.length > 0 ? bestSellerProducts.slice(0, 4) : products.slice(0, 4);

  const laptopProducts = products.filter(p => p.category === 'Laptops' || p.category.toLowerCase().includes('laptop')).slice(0, 4);
  const displayLaptops = laptopProducts.length > 0 ? laptopProducts : products.slice(0, 4);

  useEffect(() => {
    const hideTextTimer = window.setTimeout(() => setShowVideoText(false), 5000);
    return () => window.clearTimeout(hideTextTimer);
  }, []);
  return (
    <div> sdfs</div>
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* 1. Hero Section */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-0 ">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[460px]">
          {/* Main Hero Carousel */}
          <div className="md:col-span-2 relative h-full min-h-[300px]">
            <HeroCarousel />
          </div>

          {/* Stacked Right Columns */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="flex-1 relative rounded-2xl overflow-hidden group shadow-lg bg-[#0D1117] cursor-pointer">
              <img src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=400" alt="Accessories" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <button className="bg-white text-black font-black uppercase tracking-wider py-2 px-6 rounded-full hover:bg-gray-200 transition-all shadow-lg">
                  Shop Now
                </button>
              </div>
            </div>
            <div className="flex-1 relative rounded-2xl overflow-hidden group shadow-lg bg-[#0D1117] cursor-pointer">
              <img src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=400" alt="Hardware" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <button className="bg-white text-black font-black uppercase tracking-wider py-2 px-6 rounded-full hover:bg-gray-200 transition-all shadow-lg">
                  Shop Now
                </button>
              </div>
            </div>
          </div>

          {/* Tall Right Column */}
          <div className="md:col-span-1 relative rounded-2xl overflow-hidden group shadow-lg bg-[#0D1117] cursor-pointer">
            <img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400" alt="Monitors" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
            <div className="absolute bottom-6 left-6 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
              <button className="bg-white text-black font-black uppercase tracking-wider py-3 px-8 rounded-full hover:bg-gray-200 transition-all shadow-lg">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* 2. Feature Strip / Trust Badges */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-6 md:mt-8">
        <div className="bg-transparent py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 border-b border-gray-200 pb-8">
          <div className="flex items-center gap-3 text-gray-700">
            <Truck className="text-black" size={28} />
            <span className="font-semibold text-xs leading-tight">Fast & Express<br />Islandwide Delivery</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Smile className="text-black" size={28} />
            <span className="font-semibold text-xs leading-tight">Top Customer<br />Satisfaction</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <ShieldCheck className="text-black" size={28} />
            <span className="font-semibold text-xs leading-tight">Secures Payment<br />Methods</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Award className="text-black" size={28} />
            <span className="font-semibold text-xs leading-tight">Best Quality Since<br />Day One</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <CheckCircle className="text-black" size={28} />
            <span className="font-semibold text-xs leading-tight">Warranty on All<br />Products</span>
          </div>
        </div>
      </AnimatedSection>

      {/* Pre-Built PCs Section */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-10 md:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TiltCard className="md:col-span-1 rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-[380px] group bg-black">
            <img src="https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=600" alt="Hybrid PC Builds" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/20 to-black/90"></div>
            <div className="absolute inset-0 pt-8 pb-6 px-4 flex flex-col justify-between items-center text-center text-white">
              <div>
                <span className="text-[#ff9800] font-bold text-xs uppercase tracking-wide block mb-2">PRE-BUILT PCS</span>
                <h3 className="text-3xl font-black uppercase leading-[1.1] tracking-wide drop-shadow-md">HYBRID PC<br />BUILDS</h3>
              </div>
              <button className="bg-white text-black font-black text-[13px] py-2.5 px-6 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 mt-auto">
                Shop Now <ChevronRight size={14} className="text-black" strokeWidth={3} />
              </button>
            </div>
          </TiltCard>

          <TiltCard className="md:col-span-2 rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-[380px] group bg-black">
            <img src="https://images.unsplash.com/photo-1587202372585-79464e83fdf5?auto=format&fit=crop&q=80&w=800" alt="Brand New PC Builds" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/80"></div>
            <div className="absolute inset-0 pt-8 pb-6 px-6 flex flex-col justify-between items-center text-center text-white">
              <div>
                <span className="text-[#ff9800] font-bold text-[13px] uppercase tracking-wide block mb-2">PRE-BUILT PCS</span>
                <h3 className="text-4xl font-black uppercase leading-[1.1] tracking-wide drop-shadow-lg">BRAND NEW<br />PC BUILDS</h3>
              </div>
              <button className="bg-white text-black font-black text-[13px] py-2.5 px-6 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 mt-auto">
                Shop Now <ChevronRight size={14} className="text-black" strokeWidth={3} />
              </button>
            </div>
          </TiltCard>

          <TiltCard className="md:col-span-1 rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-[380px] group bg-[#09101a]">
            <img src="https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=600" alt="Used PC Builds" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-blue-900/30 to-black/90 mix-blend-overlay"></div>
            <div className="absolute inset-0 pt-8 pb-6 px-4 flex flex-col justify-between items-center text-center text-white">
              <div>
                <span className="text-[#ff9800] font-bold text-xs uppercase tracking-wide block mb-2">PRE-BUILT PCS</span>
                <h3 className="text-3xl font-black uppercase leading-[1.1] tracking-wide drop-shadow-md">USED PC<br />BUILDS</h3>
              </div>
              <button className="bg-white text-black font-black text-[13px] py-2.5 px-6 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 mt-auto">
                Shop Now <ChevronRight size={14} className="text-black" strokeWidth={3} />
              </button>
            </div>
          </TiltCard>
        </div>
      </AnimatedSection>

      {/* 3. Top Categories */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-8 md:mt-10 relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase">Top Categories</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Explore {displayCategories.length} categories available at Orion LK</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
            View All in Shop <ChevronRight size={14} />
          </Link>
        </div>

        {/* Scroll Arrows */}
        <button
          onClick={() => scrollCategories('left')}
          className="absolute left-2 top-[58%] -translate-y-1/2 bg-white/95 p-2.5 rounded-full shadow-lg z-10 hover:bg-white text-gray-800 border border-gray-200 transition-all hover:scale-105"
          aria-label="Scroll left"
        >
          <ChevronLeft size={22} />
        </button>

        <div ref={categorySliderRef} className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-6 scroll-smooth">
          {displayCategories.map((cat, idx) => (
            <Link
              key={cat.id || idx}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-2.5 cursor-pointer group min-w-[110px] shrink-0"
            >
              <div className="w-24 h-24 rounded-2xl bg-white shadow-sm border border-gray-200/80 overflow-hidden flex items-center justify-center p-3 group-hover:border-black group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all duration-300">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="text-xs font-bold text-center text-gray-800 group-hover:text-black transition-colors leading-tight line-clamp-2 max-w-[110px]">{cat.name}</span>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scrollCategories('right')}
          className="absolute right-2 top-[58%] -translate-y-1/2 bg-white/95 p-2.5 rounded-full shadow-lg z-10 hover:bg-white text-gray-800 border border-gray-200 transition-all hover:scale-105"
          aria-label="Scroll right"
        >
          <ChevronRight size={22} />
        </button>
      </AnimatedSection>

      {/* 4. Clearance Sale */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-10 md:mt-14 relative bg-[#030816] rounded-2xl p-8 pt-12 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=1200')] opacity-20 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#030816] to-transparent"></div>
        <div className="relative z-10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-3xl font-black text-[#2ee661] uppercase tracking-wider mb-2 drop-shadow-md">Clearance Sale</h2>
            <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-4 drop-shadow-lg">Up to 50% Off</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Trusted by Pros. Made for Winners.</p>

            <div className="flex gap-4">
              <div className="bg-gray-900 text-white p-3 rounded-lg flex flex-col items-center min-w-[60px] shadow-lg border border-gray-700">
                <span className="text-2xl font-black">22</span>
                <span className="text-[10px] uppercase font-bold">Days</span>
              </div>
              <div className="bg-gray-900 text-white p-3 rounded-lg flex flex-col items-center min-w-[60px] shadow-lg border border-gray-700">
                <span className="text-2xl font-black">01</span>
                <span className="text-[10px] uppercase font-bold">Hours</span>
              </div>
              <div className="bg-gray-900 text-white p-3 rounded-lg flex flex-col items-center min-w-[60px] shadow-lg border border-gray-700">
                <span className="text-2xl font-black">20</span>
                <span className="text-[10px] uppercase font-bold">Mins</span>
              </div>
            </div>
          </div>
          <Link to="/offers" className="bg-[#f0364c] text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-red-700 transition-colors whitespace-nowrap shadow-lg flex items-center gap-2">
            View All Offers <ChevronRight size={20} />
          </Link>
        </div>

        <div className="relative z-10 mt-12 bg-white rounded-xl p-4 md:p-6 shadow-2xl">
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-2">
            {displayClearance.map((product, idx) => (
              <div className="min-w-[220px] w-1/5 flex-shrink-0" key={product.id}>
                <ProductCard product={product} index={idx} />
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* 5. Hardware Spotlight */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-12 md:mt-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Hardware Spotlight</h2>
            <p className="text-gray-500 font-medium">Experience the next generation of gaming performance.</p>
          </div>
        </div>

        <div
          className="w-full aspect-[21/9] md:aspect-video rounded-2xl overflow-hidden relative shadow-2xl bg-black group"
          onMouseEnter={() => setShowVideoText(true)}
        >
          {youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title="Hardware Spotlight video"
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={videoFailed ? FALLBACK_VIDEO_URL : videoUrl}
              poster="https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=1600"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              onError={() => setVideoFailed(true)}
            />
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

          {/* Sound Toggle */}
          {!youtubeEmbedUrl && (
            <button
              onClick={(e) => { e.preventDefault(); setIsMuted(!isMuted); }}
              className="absolute top-6 right-6 bg-black/40 hover:bg-black/80 backdrop-blur-md text-white p-3 rounded-full transition-all z-20"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          )}

          {/* Product Link Overlay */}
          <div className={`absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 max-w-sm transition-opacity duration-500 ${showVideoText ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <span className="bg-[#2ee661] text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest mb-3 inline-block">Featured</span>
            <h3 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight">NVIDIA RTX 4090<br />Founders Edition</h3>
            <p className="text-gray-300 text-sm mb-6 line-clamp-2">Beyond fast. Experience AI-powered graphics and lifelike virtual worlds.</p>
            <Link to="/product/1" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              View Product <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* 5. Shop Accessories */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-10 md:mt-16">
        <h2 className="text-2xl font-black mb-6 text-gray-900 uppercase">Shop Accessories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Adapters */}
          <div className="bg-[#5a2e98] rounded-xl p-6 relative overflow-hidden group cursor-pointer shadow-sm h-32 md:h-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-indigo-600 opacity-80 z-0"></div>
            <img src="https://images.unsplash.com/photo-1583394838084-25e1a38481ff?auto=format&fit=crop&q=80&w=300" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-500 z-0" alt="Adapters" />
            <h3 className="text-white font-black text-lg md:text-xl relative z-10 drop-shadow-md">Adapters</h3>
          </div>
          {/* Headsets */}
          <div className="bg-[#d43763] rounded-xl p-6 relative overflow-hidden group cursor-pointer shadow-sm h-32 md:h-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 opacity-80 z-0"></div>
            <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=300" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-500 z-0" alt="Headsets" />
            <h3 className="text-white font-black text-lg md:text-xl relative z-10 drop-shadow-md">Headsets</h3>
          </div>
          {/* Speakers */}
          <div className="bg-[#1f487e] rounded-xl p-6 relative overflow-hidden group cursor-pointer shadow-sm h-32 md:h-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-600 opacity-80 z-0"></div>
            <img src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=300" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-500 z-0" alt="Speakers" />
            <h3 className="text-white font-black text-lg md:text-xl relative z-10 drop-shadow-md">Speakers</h3>
          </div>
          {/* Webcam */}
          <div className="bg-[#247c45] rounded-xl p-6 relative overflow-hidden group cursor-pointer shadow-sm h-32 md:h-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-500 opacity-80 z-0"></div>
            <img src="https://images.unsplash.com/photo-1595787142842-7404bc60470d?auto=format&fit=crop&q=80&w=300" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-500 z-0" alt="Webcam" />
            <h3 className="text-white font-black text-lg md:text-xl relative z-10 drop-shadow-md">Webcam</h3>
          </div>
        </div>
      </AnimatedSection>

      {/* 6. Best Sellers */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-12 md:mt-16">
        <h2 className="text-2xl font-black mb-6 text-gray-900 uppercase">Best Sellers</h2>
        <div className="flex gap-4 mb-6 overflow-x-auto scrollbar-hide">
          {['Processors', 'Motherboards', 'RAM', 'Coolers'].map(cat => (
            <button
              key={cat}
              onClick={() => setBestSellerCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${bestSellerCategory === cat
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-900 bg-gray-200/60'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayBestSellers.map((product, idx) => (
            <ProductCard key={product.id || idx} product={product} index={idx} />
          ))}
        </div>
      </AnimatedSection>

      {/* 7. Browse Laptops */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-12 md:mt-16 mb-8 md:mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 uppercase">Browse Laptops</h2>
          <Link to="/shop?category=Laptops" className="text-xs font-bold text-gray-900 flex items-center gap-1 hover:text-black transition-colors">
            View More <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayLaptops.map((product, idx) => (
            <ProductCard key={product.id || idx} product={product} index={idx} />
          ))}
          {/* Add a banner card if there are less than 4 laptops */}
          <div className="col-span-1 md:col-span-2 bg-[#091530] rounded-xl overflow-hidden relative group cursor-pointer shadow-sm min-h-[300px]">
            <img src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=600" alt="Gaming Laptops" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 flex flex-col items-start justify-center p-8 bg-gradient-to-r from-[#091530] to-transparent">
              <h4 className="text-green-400 font-bold text-xs uppercase tracking-widest mb-2">Gaming Laptops</h4>
              <p className="text-white font-black text-[28px] md:text-[36px] leading-tight drop-shadow-md mb-6">THE GAME JUST<br />GOT REAL</p>
              <button className="bg-white text-gray-900 font-bold py-2.5 px-6 rounded hover:bg-gray-100 transition-colors shadow-lg">Shop Now</button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Promotional Banners Grid */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-12 md:mt-16 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <TiltCard className="col-span-1 rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-48 md:h-64 group bg-[#0e1628]">
            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800" alt="Island Wide Delivery" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-transparent"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
              <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-2 drop-shadow-md">Island Wide</h3>
              <div className="bg-gray-900 self-start px-4 py-1 rounded shadow-lg border border-white/20">
                <span className="font-bold text-sm tracking-widest uppercase">Delivery Available</span>
              </div>
            </div>
          </TiltCard>

          <TiltCard className="col-span-1 rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-48 md:h-64 group bg-[#281b3d]">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800" alt="Koko Option 2" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-transparent"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
              <h4 className="text-indigo-300 font-bold tracking-widest uppercase mb-1">Pay in 3 Installments</h4>
              <h3 className="text-3xl md:text-4xl font-black mb-4">Option 2</h3>
              <button className="bg-white text-indigo-900 self-start px-6 py-2 rounded font-bold text-sm shadow-lg">Learn More</button>
            </div>
          </TiltCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TiltCard className="rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-64 md:h-80 group bg-black">
            <img src="https://images.unsplash.com/photo-1527814050087-379381547996?auto=format&fit=crop&q=80&w=600" alt="Gaming Accessories" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              <div>
                <span className="text-gray-400 font-bold text-[10px] tracking-widest uppercase block mb-1">Ergonomic Precision</span>
                <h3 className="text-2xl font-black uppercase leading-tight">Shop Gaming<br />Accessories</h3>
                <p className="text-gray-900 font-bold text-sm mt-2">Starting at just Rs.550</p>
              </div>
              <button className="bg-white text-black font-black text-xs py-2 px-6 rounded self-start uppercase">Shop Now</button>
            </div>
          </TiltCard>

          <TiltCard className="rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-64 md:h-80 group bg-gray-900">
            <img src="https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600" alt="Keyboards" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-white text-center">
              <span className="text-yellow-500 font-bold text-[10px] tracking-widest uppercase block mb-2">Keyboards</span>
              <h3 className="text-3xl font-black uppercase tracking-wider mb-2">Crafted for Speed</h3>
              <p className="text-gray-300 font-bold text-sm mb-6">From Rs.1,190 Upwards</p>
              <button className="bg-white text-black font-black text-xs py-2 px-6 rounded uppercase">Shop Now</button>
            </div>
          </TiltCard>

          <TiltCard className="rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-64 md:h-80 group bg-black">
            <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600" alt="Speakers and Headphones" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white text-right items-end">
              <div>
                <span className="text-gray-400 font-bold text-[10px] tracking-widest uppercase block mb-1">Volcanic Sound</span>
                <h3 className="text-2xl font-black uppercase leading-tight">Speakers &<br />Headphones</h3>
                <p className="text-gray-900 font-bold text-sm mt-2">From Rs.1,500</p>
              </div>
              <button className="bg-white text-black font-black text-xs py-2 px-6 rounded uppercase">Shop Now</button>
            </div>
          </TiltCard>
        </div>
      </AnimatedSection>

      {/* 8. Customer Reviews */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-8 md:mt-16 bg-[#f8f9fa] py-12 rounded-2xl mb-12 relative overflow-hidden">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-gray-900 uppercase">Customer Reviews</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xl font-black text-gray-900">4.9</span>
            <div className="flex text-yellow-400">
              {'★★★★★'.split('').map((star, i) => <span key={i} className="text-lg">{star}</span>)}
            </div>
            <a href="#" className="text-xs font-bold text-gray-500 hover:text-gray-900 underline ml-2">View All Reviews</a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 px-4 md:px-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">C</div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Chamika Darshana</h4>
                <div className="text-yellow-400 text-xs">★★★★★</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm italic">"Great customer service and fast delivery! Highly recommended for PC parts in Sri Lanka."</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#24c24e]100 text-green-600 rounded-full flex items-center justify-center font-bold text-lg">V</div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Kasun Vithana</h4>
                <div className="text-yellow-400 text-xs">★★★★★</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm italic">"Best prices in town for genuine products. The staff was very helpful with my new PC build."</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group">
            <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=400" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" alt="Happy Customer" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Play className="text-white w-12 h-12" fill="white" />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* 9. Haylou Banner */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-12 md:mt-16 mb-8">
        <div className="w-full bg-[#030816] rounded-2xl overflow-hidden relative shadow-md h-[250px] md:h-[350px] lg:h-[400px] flex items-center justify-center">
          {/* Logo */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/90">
            <div className="w-6 h-6 border-2 border-white/80 rounded-full flex items-center justify-center text-[10px] font-black italic">H</div>
            <span className="font-medium tracking-[0.2em] text-sm">HAYLOU</span>
          </div>

          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030816] via-[#091530] to-[#030816] z-0" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4a72d3] via-transparent to-transparent z-0 blur-2xl" />

          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pt-10">
            {/* Typography Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full z-0 opacity-90">
              <h3 className="text-[120px] md:text-[200px] font-black text-[#5a8bf6]/30 leading-none tracking-tighter" style={{ textShadow: '0 0 40px rgba(90, 139, 246, 0.4)' }}>1.58"</h3>
              <div className="flex flex-col items-start ml-2 md:ml-6 mt-8 md:mt-16">
                <span className="text-white font-bold text-lg md:text-3xl tracking-widest uppercase" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Escort Extreme</span>
                <span className="text-[#5a8bf6] font-black text-xl md:text-4xl tracking-[0.15em] uppercase" style={{ textShadow: '0 0 20px rgba(90, 139, 246, 0.5)' }}>Adventure</span>
              </div>
            </div>

            {/* Watch Image Mock */}
            <div className="relative z-10 w-[280px] md:w-[450px] h-[280px] md:h-[450px] mt-10 md:mt-20">
              <img src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] border-[12px] border-[#1a1a24]" alt="Haylou Smartwatch Face" />
              <div className="absolute -inset-4 rounded-full border-4 border-gray-800/50 shadow-2xl z-[-1]"></div>
              <div className="absolute top-1/2 -left-8 w-12 h-24 bg-[#1a1a24] -translate-y-1/2 rounded-l-xl z-[-2]"></div>
              <div className="absolute top-1/2 -right-8 w-12 h-24 bg-[#1a1a24] -translate-y-1/2 rounded-r-xl z-[-2]"></div>
            </div>

            <button className="bg-[#2ee661] hover:bg-[#24c24e] text-white font-bold py-2.5 px-8 rounded absolute bottom-6 md:bottom-10 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 text-sm border border-green-400/50">
              Buy Now
            </button>
          </div>
        </div>
      </AnimatedSection>

      {/* 10. Why Choose MY MEMORY */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-12 md:mt-16 mb-12 md:mb-16 bg-[#f8f9fa] py-10 md:py-14 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <h2 className="text-[28px] font-black text-center mb-12 text-gray-900 relative z-10">Why Choose MY MEMORY</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
          <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1">
            <div className="text-black mb-6 group-hover:scale-110 transition-transform duration-300">
              <Truck size={48} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-gray-900 text-[15px] mb-3 leading-snug">Fast Islandwide<br />Delivery</h3>
            <p className="text-gray-500 text-[13px] leading-relaxed">Get your orders delivered anywhere in Sri Lanka quickly and safely.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1">
            <div className="text-black mb-6 group-hover:scale-110 transition-transform duration-300">
              <Award size={48} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-gray-900 text-[15px] mb-3 leading-snug">Best Quality<br />Since 2010</h3>
            <p className="text-gray-500 text-[13px] leading-relaxed">Over a decade of delivering only genuine and top-quality products.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1">
            <div className="text-black mb-6 flex relative group-hover:scale-110 transition-transform duration-300">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-[15px] mb-3 leading-snug">Secure Payment<br />Methods</h3>
            <p className="text-gray-500 text-[13px] leading-relaxed">Pay safely with multiple reliable and protected payment options.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1">
            <div className="text-black mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={48} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-gray-900 text-[15px] mb-3 leading-snug">Warranty on<br />All Products</h3>
            <p className="text-gray-500 text-[13px] leading-relaxed">Every item you buy comes with a trusted warranty for peace of mind.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1">
            <div className="text-black mb-6 group-hover:scale-110 transition-transform duration-300">
              <Smile size={48} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-gray-900 text-[15px] mb-3 leading-snug">Top Customer<br />Satisfaction</h3>
            <p className="text-gray-500 text-[13px] leading-relaxed">Trusted by thousands of happy customers who shop with confidence.</p>
          </div>
        </div>
      </AnimatedSection>

      {/* 11. Brands */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-10 md:mt-12 mb-8 md:mb-12">
        <h2 className="text-2xl font-black text-center mb-8 text-gray-900">Our Brands</h2>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          {(brands && brands.length > 0 ? brands.filter(b => b.visible !== false) : BRANDS).map((brand: any, idx) => (
            <div key={brand.id || idx} className="bg-white border border-gray-100 h-[80px] w-[120px] md:w-[160px] rounded-xl flex justify-center items-center cursor-pointer shadow-sm group hover:shadow-md transition-all duration-300 p-3">
              {brand.image ? (
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="max-h-10 max-w-[90px] md:max-w-[120px] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML = `<span class="font-black text-[14px] md:text-base text-gray-700 group-hover:text-black transition-colors duration-300">${brand.name}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="font-black text-[14px] md:text-base text-gray-700 group-hover:text-black transition-colors duration-300">{brand.name}</span>
              )}
            </div>
          ))}
        </div>
      </AnimatedSection>

    </div>
  );
}
