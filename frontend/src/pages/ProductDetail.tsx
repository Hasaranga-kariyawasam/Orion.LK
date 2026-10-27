import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { formatLKR } from '../data';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { ApiProductReview, fetchProductById, fetchProductReviews, submitProductReview } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  Heart, ShoppingCart, Check, ShieldCheck, ChevronRight, Truck, Headset,
  Scale, Facebook, Twitter, Linkedin, MapPin, Star, Minus, Plus,
  Bell, Zap, RefreshCw, MessageCircle, CheckCircle2, XCircle, CreditCard
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FAQAccordion from '../components/FAQAccordion';
import ImageViewer from '../components/ImageViewer';
import ProductDetailSkeleton from '../components/ProductDetailSkeleton';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { products } = useAdmin();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'description' | 'shipping' | 'reviews'>('description');
  const [isLoading, setIsLoading] = useState(true);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Reviews interactive state
  const [reviewsList, setReviewsList] = useState<ApiProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  const { addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare, setIsCartOpen } = useShop();
  const { user } = useAuth();
  const inWishlist = product ? isInWishlist(product.id) : false;
  const inCompare = product ? isInCompare(product.id) : false;
  const availableStock = Number(product?.stock) || 0;
  const isInStock = availableStock > 0 && !['out of stock', 'sold out'].includes(String(product?.status || '').toLowerCase());

  useEffect(() => {
    let isMounted = true;
    const loadProduct = async () => {
      setIsLoading(true);
      const found = products.find(p => p.id === id || (p as any)._id === id);
      if (found) {
        if (isMounted) {
          setProduct(found);
          setIsLoading(false);
        }
        return;
      }
      if (id) {
        try {
          const apiProduct = await fetchProductById(id);
          if (apiProduct && isMounted) {
            setProduct({ ...apiProduct, id: apiProduct._id || apiProduct.id });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Error loading product from API:', e);
        }
      }
      if (isMounted) {
        setProduct(null);
        setIsLoading(false);
      }
    };

    loadProduct();
    return () => { isMounted = false; };
  }, [id, products]);

  useEffect(() => {
    if (!product?.id) return;
    let current = true;
    setReviewsLoading(true);
    setReviewsList([]);
    setCanReview(false);
    setAlreadyReviewed(false);
    setReviewMessage('');
    fetchProductReviews(String(product.id))
      .then(result => {
        if (!current) return;
        setReviewsList(result.reviews);
        setCanReview(result.canReview);
        setAlreadyReviewed(result.alreadyReviewed);
        setReviewError('');
      })
      .catch(error => {
        if (current) setReviewError(error instanceof Error ? error.message : 'Failed to load reviews');
      })
      .finally(() => {
        if (current) setReviewsLoading(false);
      });
    return () => { current = false; };
  }, [product?.id, user?.uid]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = totalScroll / windowHeight;
      setScrollProgress(scroll * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (searchParams.get('tab') === 'reviews') setActiveTab('reviews');
  }, [searchParams, id]);

  useEffect(() => {
    if (searchParams.get('tab') !== 'reviews' || isLoading || !product) return;
    window.setTimeout(() => document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth' }), 0);
  }, [searchParams, isLoading, product]);

  const handlePriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail) {
      setAlertSuccess(true);
      setTimeout(() => {
        setShowPriceAlert(false);
        setAlertSuccess(false);
        setAlertEmail('');
      }, 3000);
    }
  };

  const handleBuyNow = () => {
    if (!isInStock) return;
    addToCart({ ...product, price: product.price * quantity });
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleWhatsApp = () => {
    const text = `Hi Orion LK, I would like to buy/inquire about: ${product.name} (Price: ${formatLKR(product.price)}). Is it currently in stock?`;
    window.open(`https://wa.me/94770000000?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id || !canReview || !reviewComment.trim()) return;
    setReviewError('');
    setReviewMessage('');
    try {
      await submitProductReview({
        productId: String(product.id),
        rating: userRating,
        comment: reviewComment.trim(),
      });
      setCanReview(false);
      setAlreadyReviewed(true);
      setReviewComment('');
      setReviewMessage('Thank you. Your review is awaiting administrator approval.');
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Failed to submit review');
    }
  };

  const relatedProducts = product ? products
    .filter(p => p.category === product.category && (p.id !== product.id && (p as any)._id !== product.id))
    .slice(0, 4) : [];
  const averageRating = reviewsList.length
    ? (reviewsList.reduce((total, review) => total + review.rating, 0) / reviewsList.length).toFixed(1)
    : '0.0';

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-black text-gray-900">Product not found</h1>
        <p className="text-gray-500">This product is no longer available.</p>
        <Link to="/shop" className="rounded-xl bg-[#161B22] px-5 py-3 text-sm font-bold text-white">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-black z-[100] transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-black transition-colors font-bold">Home</Link>
          <ChevronRight size={13} className="text-gray-400 shrink-0" />
          <Link to={`/shop?category=${encodeURIComponent(product.category || '')}`} className="hover:text-black transition-colors">
            {product.category || 'Shop'}
          </Link>
          <ChevronRight size={13} className="text-gray-400 shrink-0" />
          <span className="text-gray-900 font-bold truncate max-w-[200px] md:max-w-md">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-12 bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200/80">

          {/* Left: Image Gallery */}
          <div className="w-full">
            <ImageViewer
              images={product.images && product.images.length > 0 ? product.images : [product.image]}
              productName={product.name}
              discount={product.discount}
            />
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">

            {/* Title & Brand */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight break-words">
                {product.name}
              </h1>
              {product.brand && (
                <div className="text-base sm:text-xl font-black text-gray-400 sm:ml-4 tracking-wider uppercase shrink-0">
                  {product.brand}
                </div>
              )}
            </div>

            {/* Stock status & Warranty badge */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`${isInStock ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'} text-xs font-black px-2.5 py-1 rounded-md border flex items-center gap-1`}>
                {isInStock ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                {isInStock ? 'IN STOCK & READY TO SHIP' : 'OUT OF STOCK'}
              </span>
              <span className="bg-gray-100 text-gray-800 text-xs font-black px-2.5 py-1 rounded-md border border-gray-200 flex items-center gap-1">
                <ShieldCheck size={13} /> {product.warranty ? product.warranty.toUpperCase() : '06 MONTHS OFFICIAL WARRANTY'}
              </span>
            </div>

            {/* Price Section */}
            <div className="mb-5 pb-5 border-b border-gray-100">
              <div className="flex items-baseline gap-3 mb-1">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg md:text-xl text-gray-400 line-through font-semibold">
                    {formatLKR(product.originalPrice)}
                  </span>
                )}
                <span className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
                  {formatLKR(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-md border border-emerald-200 uppercase tracking-wide">
                    Save {formatLKR(product.originalPrice - product.price)}
                  </span>
                )}
              </div>

              {/* Installment breakdown */}
              <div className="mt-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-3 justify-between">
                <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-semibold text-gray-600">
                  <span>or 3 × <strong className="text-gray-900">{formatLKR(Math.round(product.price / 3))}</strong> with</span>
                  <img src="https://mymemorylk.com/wp-content/uploads/2025/11/koko-logo.png" alt="Koko" className="h-4 object-contain" />
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-semibold text-gray-600">
                  <span>or 4 × <strong className="text-gray-900">{formatLKR(Math.round(product.price / 4))}</strong> with</span>
                  <img src="https://mymemorylk.com/wp-content/uploads/2025/11/payzy.png" alt="Payzy" className="h-4 object-contain" />
                </div>
              </div>

              {/* Price Drop Alert */}
              <div className="mt-3">
                {!showPriceAlert && !alertSuccess ? (
                  <button
                    onClick={() => setShowPriceAlert(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition-colors"
                  >
                    <Bell size={13} /> Get notified if price drops
                  </button>
                ) : alertSuccess ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg mt-2">
                    <Check size={14} /> Alert saved! We'll email you if the price drops.
                  </div>
                ) : (
                  <form onSubmit={handlePriceAlert} className="flex items-center gap-2 mt-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      className="flex-1 text-xs p-2.5 rounded-lg border border-gray-200 focus:border-black outline-none"
                    />
                    <button type="submit" className="bg-black text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors">
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Key Features Section */}
            <div className="mb-6">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3">Key Features & Guarantees</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-bold text-gray-900 truncate">Genuine Warranty</h5>
                    <p className="text-[9px] text-gray-500 truncate">Official coverage</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Truck size={16} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-bold text-gray-900 truncate">Fast Delivery</h5>
                    <p className="text-[9px] text-gray-500 truncate">Islandwide express</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <CreditCard size={16} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-bold text-gray-900 truncate">Split Payments</h5>
                    <p className="text-[9px] text-gray-500 truncate">Koko & Payzy</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Zap size={16} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-bold text-gray-900 truncate">100% Authentic</h5>
                    <p className="text-[9px] text-gray-500 truncate">Original sealed box</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <RefreshCw size={16} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-bold text-gray-900 truncate">7 Days Return</h5>
                    <p className="text-[9px] text-gray-500 truncate">On factory faults</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Headset size={16} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-bold text-gray-900 truncate">Tech Support</h5>
                    <p className="text-[9px] text-gray-500 truncate">Direct specialists</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex gap-3">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-12 sm:h-14 w-32 shrink-0 bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!isInStock}
                    className="px-3.5 text-gray-500 hover:text-black hover:bg-gray-100 h-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-full text-center font-black text-gray-900 bg-transparent outline-none text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={!isInStock || quantity >= availableStock}
                    className="px-3.5 text-gray-500 hover:text-black hover:bg-gray-100 h-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                  className="flex-1 bg-[#161B22] text-white font-black uppercase tracking-wider text-xs sm:text-sm h-12 sm:h-14 rounded-xl hover:bg-[#0D1117] active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  BUY NOW
                </button>

                <button
                  type="button"
                  onClick={() => { if (isInStock) addToCart({ ...product, price: product.price * quantity }); }}
                  disabled={!isInStock}
                  className="w-12 sm:w-14 h-12 sm:h-14 bg-[#161B22] text-white rounded-xl flex items-center justify-center hover:bg-[#0D1117] active:scale-[0.99] transition-all shrink-0 shadow-sm group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Add to Cart"
                >
                  <ShoppingCart size={20} strokeWidth={2.2} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* WhatsApp Order Button */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm tracking-wider py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] cursor-pointer"
              >
                <MessageCircle size={18} />
                Order or Inquire on WhatsApp
              </button>
            </div>

            {/* Meta Actions (Wishlist & Compare) */}
            <div className="flex items-center justify-between py-3.5 border-t border-b border-gray-100 mb-6">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                    inWishlist ? 'text-red-500' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Heart size={16} className={inWishlist ? 'fill-red-500 text-red-500' : ''} />
                  {inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleCompare(product)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                    inCompare ? 'text-[#15803d]' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Scale size={16} /> Compare
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                <span>Share:</span>
                <button className="hover:text-blue-600 transition-colors"><Facebook size={14} /></button>
                <button className="hover:text-black transition-colors"><Twitter size={14} /></button>
                <button className="hover:text-blue-700 transition-colors"><Linkedin size={14} /></button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-5">
              <h4 className="font-bold text-gray-900 mb-2.5 text-xs uppercase tracking-wider">Delivery & Pickup Information</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-xs text-gray-600">
                  <MapPin size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p><span className="font-bold text-gray-800">Store Pickup:</span> Available within 2 hours at our store.</p>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-600">
                  <Truck size={15} className="text-blue-600 shrink-0 mt-0.5" />
                  <p><span className="font-bold text-gray-800">Islandwide Courier:</span> Delivered safely in 1–3 business days.</p>
                </div>
              </div>
            </div>

            {/* Accepted Payments */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-600 mb-4">
              <span>Accepted Payments:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-extrabold text-blue-900 border border-gray-200">VISA</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-extrabold text-orange-600 border border-gray-200">Mastercard</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-extrabold text-[#2a2bbd] border border-gray-200">Koko</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-extrabold text-[#00b4d8] border border-gray-200">Payzy</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-extrabold text-emerald-700 border border-gray-200">Cash on Delivery</span>
              </div>
            </div>

            {/* SKU and Category info */}
            <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5 text-xs text-gray-500">
              <p><span className="font-bold text-gray-800">Category:</span> <Link to={`/shop?category=${encodeURIComponent(product.category || '')}`} className="hover:text-black hover:underline">{product.category}</Link></p>
              {product.tags && product.tags.length > 0 && (
                <p><span className="font-bold text-gray-800">Tags:</span> {product.tags.map((t: string) => <span key={t} className="mr-2 text-gray-600">#{t.toLowerCase().replace(/\s/g, '')}</span>)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Specifications / Reviews */}
        <div className="mt-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200/80">
          <div className="flex items-center justify-center gap-8 md:gap-12 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'description' ? 'text-black font-black' : 'text-gray-400 hover:text-gray-700'}`}
            >
              Description
              {activeTab === 'description' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#161B22]"></span>}
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-3 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'shipping' ? 'text-black font-black' : 'text-gray-400 hover:text-gray-700'}`}
            >
              Shipping & Delivery
              {activeTab === 'shipping' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#161B22]"></span>}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'reviews' ? 'text-black font-black' : 'text-gray-400 hover:text-gray-700'}`}
            >
              Reviews ({reviewsList.length})
              {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#161B22]"></span>}
            </button>
          </div>

          <div>
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-5">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Product Overview</h3>
                  {product.description?.includes('<') ? (
                    <div
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5 [&_strong]:font-bold [&_strong]:text-gray-900 [&_p]:mb-3 text-sm"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : (
                    <div className="text-gray-600 leading-relaxed space-y-4 text-sm">
                      <p>{product.description || product.shortDescription || "Engineered for high performance, reliability, and maximum durability. Perfect choice for enthusiasts and professional workloads alike."}</p>
                      <p>Every component is sourced from authorized regional distributors and undergoes inspection before shipment to ensure 100% authentic condition.</p>
                    </div>
                  )}

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-900 to-black text-white flex flex-col justify-center shadow-sm mt-6">
                    <span className="text-xs font-black text-[#ea364c] uppercase tracking-widest mb-1">Official Guarantee</span>
                    <h4 className="text-xl font-black uppercase mb-2">Original Hardware & Sealed Box</h4>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-md">Includes genuine manufacturer accessories, original packaging, and serial numbers verified for warranty service.</p>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-4 tracking-tight">Specifications</h3>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <ul className="space-y-3">
                        {Object.entries(product.specifications).map(([key, value], idx) => (
                          <li key={idx} className="flex flex-col border-b border-gray-200/60 pb-2.5 last:border-0 last:pb-0">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{key}</span>
                            <span className="text-sm font-semibold text-gray-900">{String(value)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-3 text-sm">
                        <li className="flex justify-between border-b border-gray-200/60 pb-2">
                          <span className="text-gray-500">Condition</span>
                          <span className="font-bold text-gray-900">{product.isNew ? 'Brand New Sealed' : 'Verified Used'}</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-200/60 pb-2">
                          <span className="text-gray-500">Category</span>
                          <span className="font-bold text-gray-900">{product.category}</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-200/60 pb-2">
                          <span className="text-gray-500">Warranty</span>
                          <span className="font-bold text-gray-900">06 Months Hardware</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Stock Location</span>
                          <span className="font-bold text-gray-900">Colombo, Sri Lanka</span>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping & Delivery Tab */}
            {activeTab === 'shipping' && (
              <div className="space-y-5 text-sm text-gray-600 max-w-2xl">
                <h3 className="text-lg font-black text-gray-900">Islandwide Shipping & Returns</h3>
                <p>We deliver nationwide with trusted door-to-door courier services and complete parcel insurance.</p>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-1">Colombo & Gampaha (Same Day / Next Day)</h4>
                    <p className="text-xs text-gray-500">Orders placed before 2:00 PM are dispatched same-day and delivered within 24 hours.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-1">All Other Districts (1–3 Business Days)</h4>
                    <p className="text-xs text-gray-500">Express delivery to Kandy, Galle, Kurunegala, Jaffna and islandwide with real-time tracking.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-1">7 Days Faulty Hardware Exchange</h4>
                    <p className="text-xs text-gray-500">If any item arrives with manufacturing defects, our technical team will inspect and replace it promptly.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div id="product-reviews">
                <h3 className="text-lg font-black text-gray-900 mb-6">Customer Ratings & Reviews</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Reviews List */}
                  <div>
                    <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-4xl font-black text-gray-900">{averageRating}</div>
                      <div className="flex flex-col">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-gray-300'} />)}
                        </div>
                        <span className="text-xs text-gray-500 font-semibold mt-0.5">{reviewsList.length} approved customer review{reviewsList.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviewsLoading ? (
                        <p className="text-sm text-gray-500">Loading reviews...</p>
                      ) : reviewsList.length ? reviewsList.map(review => (
                        <div key={review._id} className="border-b border-gray-100 pb-4">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-900 text-sm">{review.customerName}</span>
                            <span className="text-[11px] text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex text-yellow-400 mb-2">
                            {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
                        </div>
                      )) : <p className="text-sm text-gray-500">No approved reviews yet.</p>}
                    </div>
                  </div>

                  {/* Review Form */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h4 className="font-black text-gray-900 text-sm mb-1">Write a Customer Review</h4>
                    <p className="text-xs text-gray-500 mb-4">Share your experience with other buyers.</p>

                    {reviewMessage && <p role="status" className="mb-3 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800">{reviewMessage}</p>}
                    {reviewError && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{reviewError}</p>}
                    {!user ? (
                      <p className="text-xs text-gray-600">Sign in and purchase this product to leave a review. <Link to="/login" className="font-bold underline">Sign in</Link></p>
                    ) : alreadyReviewed ? (
                      <p className="text-xs text-gray-600">You have already submitted a review for this product.</p>
                    ) : canReview ? (
                      <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                        <p className="text-xs text-gray-500">Only customers with a delivered order for this product can submit a review. Reviews appear after admin approval.</p>
                        <div>
                          <span className="block text-xs font-bold text-gray-700 mb-1.5">Rating</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(rating => (
                              <button key={rating} type="button" onClick={() => setUserRating(rating)} aria-label={`${rating} stars`} className="text-yellow-400 hover:scale-110 transition-transform p-0.5">
                                <Star size={18} className={rating <= userRating ? 'fill-current' : 'text-gray-300'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Your Review *</label>
                          <textarea required maxLength={2000} value={reviewComment} onChange={event => setReviewComment(event.target.value)} placeholder="What did you like about this product?" className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-black outline-none h-24" />
                        </div>
                        <button type="submit" className="w-full bg-[#161B22] text-white font-black uppercase tracking-wider text-xs py-2.5 rounded-xl hover:bg-[#0D1117] transition-colors shadow-sm cursor-pointer">
                          Submit Review
                        </button>
                      </form>
                    ) : (
                      <p className="text-xs text-gray-600">A delivered order containing this product is required before you can submit a review.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Accordion */}
        <FAQAccordion />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase mb-6 tracking-tight">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
