import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import { useAdmin } from '../context/AdminContext';
import { resolveMediaUrl } from '../lib/api';
import { getActiveSpecialOffers, getOfferProduct } from '../lib/specialOffers';
import { DEFAULT_BEST_SELLER_BANNER_IMAGE, matchesCategoryName } from '../lib/homeProductSections';
import { Truck, Smile, ShieldCheck, Award, CheckCircle, ChevronLeft, ChevronRight, Play, Youtube, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';


const AnimatedSection = ({ children, className }: { children: React.ReactNode, className?: string, delay?: number, key?: React.Key }) => (
  <section className={className}>
    {children}
  </section>
);

const FALLBACK_HOME_IMAGE = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=1200';

const getHomeImage = (url: string | undefined) => resolveMediaUrl(url) || FALLBACK_HOME_IMAGE;

const handleHomeImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_HOME_IMAGE;
};

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
      ? videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0` : null
      : null;
  } catch {
    return null;
  }
};

const FALLBACK_VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export default function Home() {
  const { videoUrl, heroImages, accessories, featuredImages, pcBuildCards, homePromoCards, brandBanner, secondBannerImage, homeProductCategories, bestSellerBannerImage, brands, categories, products, bestSellerIds, specialOffers, specialOffersDeadline, whatsappNumber, storeAddress, refreshHomeSettings, homeSettingsReady } = useAdmin();
  const [isMuted, setIsMuted] = useState(true);
  const [showVideoText, setShowVideoText] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [failedBannerImages, setFailedBannerImages] = useState<string[]>([]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') void refreshHomeSettings();
    };
    const interval = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [refreshHomeSettings]);
  const [bestSellerCategory, setBestSellerCategory] = useState('Processors');
  const [heroImageReady, setHeroImageReady] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [isCategoryHovered, setIsCategoryHovered] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const videoRef = useRef<HTMLVideoElement>(null);
  const categorySliderRef = useRef<HTMLDivElement>(null);
  const clearanceSliderRef = useRef<HTMLDivElement>(null);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateViewport = () => setIsDesktopViewport(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  // Fast 500ms initial morph loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Keep the campaign countdown in sync with its configured deadline.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Top Categories auto-scroll
  useEffect(() => {
    if (isCategoryHovered) return;
    const slider = categorySliderRef.current;
    if (!slider) return;

    const interval = setInterval(() => {
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: 240, behavior: 'smooth' });
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [isCategoryHovered]);

  // Top Categories horizontal scroll via mouse wheel
  useEffect(() => {
    const slider = categorySliderRef.current;
    if (!slider) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
      }
    };

    slider.addEventListener('wheel', handleWheel, { passive: false });
    return () => slider.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    setHeroImageReady(false);
    const heroUrl = heroImages.map(resolveMediaUrl).find(Boolean);
    if (!homeSettingsReady) return;
    if (!heroUrl) {
      setHeroImageReady(true);
      return;
    }
    const image = new Image();
    image.onload = () => setHeroImageReady(true);
    image.onerror = () => setHeroImageReady(true);
    image.src = heroUrl;
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [heroImages, homeSettingsReady]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categorySliderRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      categorySliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollClearance = (direction: 'left' | 'right') => {
    if (clearanceSliderRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      clearanceSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const displayCategories = categories.filter(category => Boolean(category.img));
  const databaseImageFallbacks = products
    .flatMap(product => product.images || [product.image])
    .map(resolveMediaUrl)
    .filter(Boolean);
  const getFeaturedImage = (index: number) =>
    resolveMediaUrl(featuredImages[index]?.url) ||
    databaseImageFallbacks[index] ||
    resolveMediaUrl(displayCategories[index]?.img) ||
    FALLBACK_HOME_IMAGE;
  const displayClearance = getActiveSpecialOffers(products, specialOffers, specialOffersDeadline, now).slice(0, 4);
  const campaignDeadline = specialOffersDeadline ? Date.parse(specialOffersDeadline) : NaN;
  const remainingSeconds = Number.isFinite(campaignDeadline) ? Math.max(0, Math.floor((campaignDeadline - now) / 1000)) : 0;
  const timeLeft = {
    days: Math.floor(remainingSeconds / 86400),
    hours: Math.floor((remainingSeconds % 86400) / 3600),
    mins: Math.floor((remainingSeconds % 3600) / 60),
    secs: remainingSeconds % 60,
  };

  const bestSellerProducts = products.filter(p => {
    if (bestSellerCategory === 'Coolers') {
      return p.category === 'Coolers' || p.category === 'Cooling Pads' || p.category === 'Fan Kits';
    }
    return matchesCategoryName(p.category, bestSellerCategory);
  });
  const selectedBestSellers = bestSellerProducts.filter(product => bestSellerIds.includes(product.id));
  const displayBestSellers = selectedBestSellers.length > 0
    ? selectedBestSellers.slice(0, 8)
    : bestSellerProducts.slice(0, 8);
  const bestSellerCampaignImage = bestSellerBannerImage === DEFAULT_BEST_SELLER_BANNER_IMAGE
    ? DEFAULT_BEST_SELLER_BANNER_IMAGE
    : resolveMediaUrl(bestSellerBannerImage);
  const deliveryPromo = homePromoCards[0];
  const installmentsPromo = homePromoCards[1];
  const gamingPromo = homePromoCards[2];
  const keyboardsPromo = homePromoCards[3];
  const speakersPromo = homePromoCards[4];
  const haylouBrand = brands.find(brand => brand.name.toLowerCase() === 'haylou');
  const haylouProductImages = products
    .filter(product => product.brand?.toLowerCase() === 'haylou' || product.name.toLowerCase().includes('haylou'))
    .flatMap(product => product.images?.length ? product.images : [product.image])
    .map(resolveMediaUrl)
    .filter(Boolean);
  const haylouBannerImages = Array.from(new Set([
    resolveMediaUrl(brandBanner.image),
    resolveMediaUrl(haylouBrand?.banner),
    ...haylouProductImages,
  ].filter(Boolean)));
  const bannerImagesKey = [...haylouBannerImages, resolveMediaUrl(secondBannerImage)].join('|');
  useEffect(() => setFailedBannerImages([]), [bannerImagesKey]);
  const haylouBannerImage = haylouBannerImages.find(image => !failedBannerImages.includes(image));
  const homeBannerImages = [
    { image: haylouBannerImage, alt: 'Haylou banner' },
    { image: resolveMediaUrl(secondBannerImage), alt: 'Second promotional banner' },
  ].filter((banner): banner is { image: string; alt: string } =>
    Boolean(banner.image) && !failedBannerImages.includes(banner.image)
  );

  const laptopProducts = products.filter(p => p.category === 'Laptops' || p.category.toLowerCase().includes('laptop')).slice(0, 4);
  const displayLaptops = laptopProducts.length > 0 ? laptopProducts : products.slice(0, 4);
  const homeProductSections = homeProductCategories
    .map(selectedCategory => {
      const categoryProducts = products.filter(product => matchesCategoryName(product.category, selectedCategory));
      return {
        category: categoryProducts[0]?.category || selectedCategory,
        products: categoryProducts.slice(0, 4),
      };
    })
    .filter(section => section.products.length > 0);

  useEffect(() => {
    const hideTextTimer = window.setTimeout(() => setShowVideoText(false), 5000);
    return () => window.clearTimeout(hideTextTimer);
  }, []);

  return (
    <>
      {pageLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3">
            <div className="home-loader" />
            <p className="text-sm font-black tracking-tight text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              ORION<span className="text-[#16a34a]">.LK</span>
            </p>
          </div>
        </div>
      )}
      <style>{`
        .home-loader {
          width: 48px;
          aspect-ratio: 1;
          background: #161B22;
          border-radius: 50%;
          animation: home-loader-morph 1.8s infinite linear;
        }
        @keyframes home-loader-morph {
          12.5% { border-radius: 37% 63% 70% 30% / 30% 62% 38% 70%; }
          25% { border-radius: 50% 50% 70% 30% / 52% 62% 38% 48%; }
          37.5% { border-radius: 33% 67% 18% 82% / 52% 75% 25% 48%; }
          50% { border-radius: 73% 27% 18% 82% / 52% 32% 68% 48%; }
          62.5% { border-radius: 73% 27% 74% 26% / 64% 32% 68% 36%; }
          75% { border-radius: 84% 16% 15% 85% / 55% 79% 21% 45%; }
          87.5% { border-radius: 12% 88% 69% 31% / 10% 66% 34% 90%; }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 pt-4 pb-12">

        {/* 1. Hero Section */}
        <AnimatedSection className="max-w-7xl mx-auto px-4 mt-0 ">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 h-auto md:h-[460px]">
            {/* Main Hero Carousel */}
            <div className="col-span-3 md:col-span-2 relative h-[190px] sm:h-[240px] md:h-full md:min-h-[300px]">
              <HeroCarousel />
            </div>

            {/* Stacked Right Columns */}
            <div className="hidden md:col-span-1 md:flex md:flex-col gap-4">
              <div className="flex-1 relative rounded-2xl overflow-hidden group shadow-lg bg-[#0D1117] cursor-pointer">
                <img src={getFeaturedImage(0)} onError={handleHomeImageError} alt={featuredImages[0]?.alt || 'Accessories'} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <button className="bg-white text-black font-black uppercase tracking-wider py-2 px-6 rounded-full hover:bg-gray-200 transition-all shadow-lg">
                    Shop Now
                  </button>
                </div>
              </div>
              <div className="flex-1 relative rounded-2xl overflow-hidden group shadow-lg bg-[#0D1117] cursor-pointer">
                <img src={getFeaturedImage(1)} onError={handleHomeImageError} alt={featuredImages[1]?.alt || 'Hardware'} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <button className="bg-white text-black font-black uppercase tracking-wider py-2 px-6 rounded-full hover:bg-gray-200 transition-all shadow-lg">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>

            {/* Tall Right Column */}
            <div className="hidden md:block md:col-span-1 relative rounded-2xl overflow-hidden group shadow-lg bg-[#0D1117] cursor-pointer">
              <img src={getFeaturedImage(2)} onError={handleHomeImageError} alt={featuredImages[2]?.alt || 'Monitors'} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
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
        <AnimatedSection className="hidden md:block border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Truck className="text-black shrink-0" size={22} />
              <span className="font-semibold text-[10px] leading-tight">Fast & Express<br />Islandwide Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Smile className="text-black shrink-0" size={22} />
              <span className="font-semibold text-[10px] leading-tight">Top Customer<br />Satisfaction</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <ShieldCheck className="text-black shrink-0" size={22} />
              <span className="font-semibold text-[10px] leading-tight">Secures Payment<br />Methods</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Award className="text-black shrink-0" size={22} />
              <span className="font-semibold text-[10px] leading-tight">Best Quality Since<br />Day One</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <CheckCircle className="text-black shrink-0" size={22} />
              <span className="font-semibold text-[10px] leading-tight">Warranty on All<br />Products</span>
            </div>
          </div>
        </AnimatedSection>

        {/* 3. Top Categories */}
        <AnimatedSection className="max-w-7xl mx-auto px-3 sm:px-4 mt-6 md:mt-10 relative">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase">Top Categories</h2>
            </div>
            <Link to="/shop" className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
              View All in Shop <ChevronRight size={14} />
            </Link>
          </div>

          {/* Scroll Arrows */}
          <button
            onClick={() => scrollCategories('left')}
            className="absolute left-1 sm:left-2 top-[57%] -translate-y-1/2 bg-white/95 p-2 rounded-full z-10 hover:bg-white text-gray-800 transition-all hover:scale-105"
            aria-label="Scroll left"
          >
            <ChevronLeft size={22} />
          </button>

          <div
            ref={categorySliderRef}
            onMouseEnter={() => setIsCategoryHovered(true)}
            onMouseLeave={() => setIsCategoryHovered(false)}
            className="flex overflow-x-auto gap-3 md:gap-4 pb-4 scrollbar-hide px-5 md:px-6 scroll-smooth"
          >
            {displayCategories.map((cat, idx) => (
              <Link
                key={cat.id || idx}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-1.5 cursor-pointer group min-w-[88px] md:min-w-[90px] shrink-0"
              >
                <div className="w-20 h-20 md:w-[80px] md:h-[80px] rounded-xl md:rounded-lg bg-white overflow-hidden flex items-center justify-center p-2 md:p-2.5 transition-all duration-300">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-[11px] md:text-xs font-bold text-center text-gray-800 group-hover:text-black transition-colors leading-tight line-clamp-2 max-w-[100px]">{cat.name}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scrollCategories('right')}
            className="absolute right-1 sm:right-2 top-[57%] -translate-y-1/2 bg-white/95 p-2 rounded-full shadow-lg z-10 hover:bg-white text-gray-800 border border-gray-200 transition-all hover:scale-105"
            aria-label="Scroll right"
          >
            <ChevronRight size={22} />
          </button>
        </AnimatedSection>
        {/* Pre-Built PCs Section */}
        <AnimatedSection className="hidden md:block max-w-7xl mx-auto w-full px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TiltCard className="md:col-span-1 rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-[190px] sm:h-[240px] md:h-[310px] group bg-black">
              <img src={getHomeImage(pcBuildCards[0]?.image)} onError={handleHomeImageError} alt={pcBuildCards[0]?.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/20 to-black/90"></div>
              <div className="absolute inset-0 pt-8 pb-6 px-4 flex flex-col justify-between items-center text-center text-white">
                <div>
                  <span className="text-[#ff9800] font-bold text-xs uppercase tracking-wide block mb-2">{pcBuildCards[0]?.eyebrow}</span>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase leading-[1.1] tracking-wide drop-shadow-md whitespace-pre-line">{pcBuildCards[0]?.title}</h3>
                </div>
                <button className="bg-white text-black font-black text-[13px] py-2.5 px-6 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 mt-auto">
                  Shop Now <ChevronRight size={14} className="text-black" strokeWidth={3} />
                </button>
              </div>
            </TiltCard>

            <TiltCard className="md:col-span-2 rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-[190px] sm:h-[240px] md:h-[310px] group bg-black">
              <img src={getHomeImage(pcBuildCards[1]?.image)} onError={handleHomeImageError} alt={pcBuildCards[1]?.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/80"></div>
              <div className="absolute inset-0 pt-8 pb-6 px-6 flex flex-col justify-between items-center text-center text-white">
                <div>
                  <span className="text-[#ff9800] font-bold text-[13px] uppercase tracking-wide block mb-2">{pcBuildCards[1]?.eyebrow}</span>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase leading-[1.1] tracking-wide drop-shadow-lg whitespace-pre-line">{pcBuildCards[1]?.title}</h3>
                </div>
                <button className="bg-white text-black font-black text-[13px] py-2.5 px-6 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 mt-auto">
                  Shop Now <ChevronRight size={14} className="text-black" strokeWidth={3} />
                </button>
              </div>
            </TiltCard>

            <TiltCard className="md:col-span-1 rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-[190px] sm:h-[240px] md:h-[310px] group bg-[#09101a]">
              <img src={getHomeImage(pcBuildCards[2]?.image)} onError={handleHomeImageError} alt={pcBuildCards[2]?.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-blue-900/30 to-black/90 mix-blend-overlay"></div>
              <div className="absolute inset-0 pt-8 pb-6 px-4 flex flex-col justify-between items-center text-center text-white">
                <div>
                  <span className="text-[#ff9800] font-bold text-xs uppercase tracking-wide block mb-2">{pcBuildCards[2]?.eyebrow}</span>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase leading-[1.1] tracking-wide drop-shadow-md whitespace-pre-line">{pcBuildCards[2]?.title}</h3>
                </div>
                <button className="bg-white text-black font-black text-[13px] py-2.5 px-6 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 mt-auto">
                  Shop Now <ChevronRight size={14} className="text-black" strokeWidth={3} />
                </button>
              </div>
            </TiltCard>
          </div>
        </AnimatedSection>


        {/* 5. Hardware Spotlight */}
        {isDesktopViewport && (
        <AnimatedSection className="hidden md:block max-w-7xl mx-auto px-3 md:px-0 mt-8 md:mt-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-6 gap-3 md:gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">Hardware Spotlight</h2>
            </div>
          </div>

          <div
            className="w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden relative shadow-xl md:shadow-2xl bg-black group"
            onMouseEnter={() => setShowVideoText(true)}
            onMouseLeave={() => setShowVideoText(false)}
            onClick={() => setShowVideoText(visible => !visible)}
          >
            {youtubeEmbedUrl ? (
              <iframe
                src={youtubeEmbedUrl}
                title="Hardware Spotlight video"
                className="w-full h-full border-0 pointer-events-none scale-105"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={videoFailed ? FALLBACK_VIDEO_URL : videoUrl}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                autoPlay
                muted={isMuted}
                loop
                playsInline
                onError={() => setVideoFailed(true)}
              />
            )}

            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity duration-300" />

            {/* Sound Toggle */}
            {!youtubeEmbedUrl && (
              <button
                onClick={(e) => { e.preventDefault(); setIsMuted(!isMuted); }}
                className={`absolute top-3 right-3 md:top-6 md:right-6 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white min-h-11 min-w-11 flex items-center justify-center rounded-full transition-all z-20 ${showVideoText ? 'md:opacity-100 md:pointer-events-auto' : 'md:opacity-0 md:pointer-events-none'}`}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            )}

            <div className={`hidden md:block absolute bottom-10 left-10 z-20 max-w-sm transition-all duration-300 ${showVideoText ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <span className="bg-[#15803d] text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest mb-3 inline-block shadow-sm">Featured</span>
              <h3 className="text-4xl font-black text-white mb-2 leading-tight">NVIDIA RTX 4090<br />Founders Edition</h3>
              <p className="text-gray-300 text-sm mb-6 line-clamp-2">Beyond fast. Experience AI-powered graphics and lifelike virtual worlds.</p>
              <Link to="/product/1" className="min-h-11 inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                View Product <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </AnimatedSection>
        )}

        {/* 5. Shop Accessories */}
        <AnimatedSection className="hidden md:block max-w-7xl w-full mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-black mb-4 md:mb-6 text-gray-900 uppercase">Shop Accessories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {accessories.map(accessory => (
              <Link key={accessory.id} to={`/shop?category=${encodeURIComponent(accessory.name)}`} className={`${accessory.colorClass} rounded-xl p-3 sm:p-6 relative overflow-hidden group cursor-pointer shadow-sm h-24 sm:h-32 md:h-[130px] flex items-center justify-center`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${accessory.gradientClass} opacity-80 z-0`}></div>
                <img
                  src={resolveMediaUrl(accessory.image)}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-500 z-0"
                  alt={accessory.name}
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="text-center text-white font-black text-sm sm:text-lg md:text-xl relative z-10 drop-shadow-md leading-tight">{accessory.name}</h3>
              </Link>
            ))}
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
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-[minmax(360px,0.45fr)_minmax(0,1fr)] gap-4">
            <Link to={`/shop?category=${encodeURIComponent(bestSellerCategory)}`} aria-label={`Shop ${bestSellerCategory}`} className="block w-full min-h-0 aspect-[3/2] sm:aspect-[9/16] lg:aspect-auto lg:min-h-[400px] rounded-xl overflow-hidden bg-gray-900 shadow-sm">
              <img
                src={bestSellerCampaignImage}
                alt="Best Sellers campaign"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
            </Link>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 content-start">
              {displayBestSellers.map((product, idx) => (
                <ProductCard key={product.id || idx} product={product} index={idx} />
              ))}
            </div>
          </div>
        </AnimatedSection>

        {homeProductSections.map(section => (
          <AnimatedSection key={section.category} className="max-w-7xl mx-auto px-4 mt-12 md:mt-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase">{section.category}</h2>
              <Link to={`/shop?category=${encodeURIComponent(section.category)}`} className="text-xs font-bold text-gray-900 flex items-center gap-1 hover:text-black transition-colors">
                View More <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {section.products.map((product, index) => (
                <ProductCard key={product.id || index} product={product} index={index} />
              ))}
            </div>
          </AnimatedSection>
        ))}

        {/* Home banners */}
        <AnimatedSection className="max-w-7xl mx-auto px-4 mt-12 md:mt-16 mb-8">
          <div className={`grid gap-6 ${homeBannerImages.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {homeBannerImages.map(banner => (
              <div key={banner.image} className="w-full max-w-[740px] mx-auto aspect-[370/167] rounded-2xl overflow-hidden bg-white shadow-md">
                <img
                  src={banner.image}
                  alt={banner.alt}
                  loading="lazy"
                  decoding="async"
                  className="block w-full h-full object-contain"
                  onError={() => setFailedBannerImages(previous => [...previous, banner.image])}
                />
              </div>
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



          </div>
        </AnimatedSection>

        {/* 4. Clearance Sale */}
        <AnimatedSection className="max-w-7xl mx-auto px-3 sm:px-4 mt-10 md:mt-16">
          <div className="relative bg-[#070b18] border border-blue-950/50 rounded-2xl p-6 sm:p-8 md:p-10 overflow-hidden shadow-2xl">
            {/* Esports Neon Diagonal Streaks & Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
              <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
              {/* Diagonal accent lines */}
              <div className="absolute inset-0 opacity-15" style={{
                backgroundImage: 'repeating-linear-gradient(135deg, rgba(234, 54, 76, 0.4) 0px, rgba(234, 54, 76, 0.4) 1px, transparent 1px, transparent 60px)'
              }} />
            </div>

            {/* Top Banner Content: Left Info/Timer + Right 3D Controller */}
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-800/60">
              <div className="max-w-xl">
                <span className="text-[#ea364c] font-black text-lg md:text-xl uppercase tracking-wider block mb-1">
                  SPECIAL OFFERS
                </span>
                <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-2">
                  EXCLUSIVE DEALS
                </h3>
                <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                  TRUSTED BY PROS. MADE FOR WINNERS.
                </p>
                <div className="w-10 h-1 bg-[#ea364c] rounded-full mb-3" />
                <p className="text-xs text-gray-400 mb-3 font-medium">The time is running out</p>

                {/* Red Countdown Timer */}
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#ea364c] text-white px-3.5 py-2 rounded-lg flex flex-col items-center min-w-[56px] shadow-lg">
                    <span className="text-2xl font-black leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase font-black tracking-wider mt-1">DAYS</span>
                  </div>
                  <div className="bg-[#ea364c] text-white px-3.5 py-2 rounded-lg flex flex-col items-center min-w-[56px] shadow-lg">
                    <span className="text-2xl font-black leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase font-black tracking-wider mt-1">HOURS</span>
                  </div>
                  <div className="bg-[#ea364c] text-white px-3.5 py-2 rounded-lg flex flex-col items-center min-w-[56px] shadow-lg">
                    <span className="text-2xl font-black leading-none">{String(timeLeft.mins).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase font-black tracking-wider mt-1">MINS</span>
                  </div>
                  <div className="bg-[#ea364c] text-white px-3.5 py-2 rounded-lg flex flex-col items-center min-w-[56px] shadow-lg">
                    <span className="text-2xl font-black leading-none">{String(timeLeft.secs).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase font-black tracking-wider mt-1">SECS</span>
                  </div>
                </div>
              </div>

              {/* 3D Console/Controller Artwork */}
              <div className="relative hidden md:flex md:w-auto justify-center md:justify-end shrink-0">
                <div className="relative w-64 h-52 sm:w-80 sm:h-60 md:w-96 md:h-64">
                  <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />
                  <img
                    src="/assets/clearance-controller.jpg"
                    alt="Gaming Console Controller"
                    className="w-full h-full object-contain mix-blend-lighten filter drop-shadow-[0_12px_30px_rgba(234,54,76,0.35)] -rotate-3 hover:rotate-0 transition-transform duration-500 rounded-2xl [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_96%)]"
                  />
                </div>
              </div>
            </div>

            {/* Centered 4 Product Cards Grid */}
            <div className="relative z-10 mt-5 md:mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
              {displayClearance.map(({ product, offer }, idx) => (
                <div key={product.id || idx} className="relative">
                  <ProductCard product={getOfferProduct(product, offer)} index={idx} />
                  <span className="absolute top-3 left-3 z-10 bg-[#f0364c] text-white text-[10px] font-black uppercase px-2 py-1 rounded-md">{offer.badgeText}</span>
                </div>
              ))}
              {displayClearance.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm font-bold text-gray-400">No active special offers at the moment.</p>
              )}
            </div>

            {/* Bottom Link */}
            <div className="mt-8 flex justify-center relative z-10">
              <Link
                to="/offers"
                className="bg-[#ea364c] hover:bg-[#d6283d] text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-red-500/20 flex items-center gap-2 text-sm"
              >
                View All Offers <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </AnimatedSection>

        {/* Promotional Banners Grid */}
        <AnimatedSection className="hidden md:block max-w-7xl mx-auto px-1 mt-12 md:mt-16 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <TiltCard className="col-span-1 rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-48 md:h-64 group bg-[#0e1628]">
              <img src={getHomeImage(deliveryPromo?.image)} onError={handleHomeImageError} alt={deliveryPromo?.alt} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-transparent"></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
                <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-2 drop-shadow-md whitespace-pre-line">{deliveryPromo?.title}</h3>
                <div className="bg-gray-900 self-start px-4 py-1 rounded shadow-lg border border-white/20">
                  <span className="font-bold text-sm tracking-widest uppercase">{deliveryPromo?.description}</span>
                </div>
                <Link to={deliveryPromo?.href || '/shop'} className="bg-white text-black self-start mt-4 px-5 py-2 rounded font-bold text-xs uppercase">{deliveryPromo?.buttonText || 'Shop Now'}</Link>
              </div>
            </TiltCard>

            <TiltCard className="col-span-1 rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-48 md:h-64 group bg-[#281b3d]">
              <img src={getHomeImage(installmentsPromo?.image)} onError={handleHomeImageError} alt={installmentsPromo?.alt} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-transparent"></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
                <h4 className="text-indigo-300 font-bold tracking-widest uppercase mb-1">{installmentsPromo?.eyebrow}</h4>
                <h3 className="text-3xl md:text-4xl font-black mb-4 whitespace-pre-line">{installmentsPromo?.title}</h3>
                <Link to={installmentsPromo?.href || '/shop'} className="bg-white text-indigo-900 self-start px-6 py-2 rounded font-bold text-sm shadow-lg">{installmentsPromo?.buttonText || 'Learn More'}</Link>
              </div>
            </TiltCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TiltCard className="rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-64 md:h-80 group bg-black">
              <img src={getHomeImage(gamingPromo?.image)} onError={handleHomeImageError} alt={gamingPromo?.alt} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                <div>
                  <span className="text-gray-400 font-bold text-[10px] tracking-widest uppercase block mb-1">{gamingPromo?.eyebrow}</span>
                  <h3 className="text-2xl font-black uppercase leading-tight whitespace-pre-line">{gamingPromo?.title}</h3>
                  <p className="text-gray-900 font-bold text-sm mt-2">{gamingPromo?.description}</p>
                </div>
                <Link to={gamingPromo?.href || '/shop'} className="bg-white text-black font-black text-xs py-2 px-6 rounded self-start uppercase">{gamingPromo?.buttonText || 'Shop Now'}</Link>
              </div>
            </TiltCard>

            <TiltCard className="rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-64 md:h-80 group bg-gray-900">
              <img src={getHomeImage(keyboardsPromo?.image)} onError={handleHomeImageError} alt={keyboardsPromo?.alt} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-white text-center">
                <span className="text-yellow-500 font-bold text-[10px] tracking-widest uppercase block mb-2">{keyboardsPromo?.eyebrow}</span>
                <h3 className="text-3xl font-black uppercase tracking-wider mb-2 whitespace-pre-line">{keyboardsPromo?.title}</h3>
                <p className="text-gray-300 font-bold text-sm mb-6">{keyboardsPromo?.description}</p>
                <Link to={keyboardsPromo?.href || '/shop'} className="bg-white text-black font-black text-xs py-2 px-6 rounded uppercase">{keyboardsPromo?.buttonText || 'Shop Now'}</Link>
              </div>
            </TiltCard>

            <TiltCard className="rounded-xl overflow-hidden cursor-pointer shadow-sm relative h-64 md:h-80 group bg-black">
              <img src={getHomeImage(speakersPromo?.image)} onError={handleHomeImageError} alt={speakersPromo?.alt} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white text-right items-end">
                <div>
                  <span className="text-gray-400 font-bold text-[10px] tracking-widest uppercase block mb-1">{speakersPromo?.eyebrow}</span>
                  <h3 className="text-2xl font-black uppercase leading-tight whitespace-pre-line">{speakersPromo?.title}</h3>
                  <p className="text-gray-900 font-bold text-sm mt-2">{speakersPromo?.description}</p>
                </div>
                <Link to={speakersPromo?.href || '/shop'} className="bg-white text-black font-black text-xs py-2 px-6 rounded uppercase">{speakersPromo?.buttonText || 'Shop Now'}</Link>
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
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Play className="text-white w-12 h-12" fill="white" />
              </div>
            </div>
          </div>
        </AnimatedSection>



        {/* 10. Why Choose */}
        <AnimatedSection className="hidden md:block">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

          <h2 className="text-[28px] font-black text-center mb-12 text-gray-900 relative z-10">Why Choose Orion.lk</h2>
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
        <AnimatedSection className="max-w-7xl mx-auto px-3 sm:px-4 mt-8 md:mt-12 mb-6 md:mb-12">
          <h2 className="text-xl sm:text-2xl font-black text-center mb-4 md:mb-8 text-gray-900">Our Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap justify-center items-center gap-2.5 sm:gap-3 md:gap-6">
            {brands.filter(brand => brand.visible !== false).map((brand, idx) => (
              <div key={brand.id || idx} className="bg-white border border-gray-100 h-[72px] sm:h-[80px] w-full md:w-[160px] rounded-xl flex justify-center items-center cursor-pointer shadow-sm group hover:shadow-md transition-all duration-300 p-2 sm:p-3">
                {brand.image ? (
                  <>
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="max-h-9 sm:max-h-10 max-w-full md:max-w-[120px] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                      onError={event => {
                        event.currentTarget.classList.add('hidden');
                        event.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <span className="hidden max-w-full text-center font-black text-xs sm:text-sm md:text-base leading-tight break-words text-gray-700 group-hover:text-black transition-colors duration-300">{brand.name}</span>
                  </>
                ) : (
                  <span className="max-w-full text-center font-black text-xs sm:text-sm md:text-base leading-tight break-words text-gray-700 group-hover:text-black transition-colors duration-300">{brand.name}</span>
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>

      </div>
    </>
  );
}
