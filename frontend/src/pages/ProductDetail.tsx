import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_PRODUCTS, formatLKR } from '../data';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { fetchProductById } from '../lib/api';
import { Heart, ShoppingCart, Check, ShieldCheck, ChevronRight, Home as HomeIcon, Truck, Headset, Scale, Facebook, Twitter, Linkedin, Share2, MapPin, Calendar, Star, Minus, Plus, Bell } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FAQAccordion from '../components/FAQAccordion';
import ImageViewer from '../components/ImageViewer';
import ProductDetailSkeleton from '../components/ProductDetailSkeleton';
import ProductCardSkeleton from '../components/ProductCardSkeleton';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { products } = useAdmin();

  const [product, setProduct] = useState<any>(() => {
    return products.find(p => p.id === id || (p as any)._id === id) || products[0] || MOCK_PRODUCTS[0];
  });

  const [activeTab, setActiveTab] = useState<'description' | 'shipping' | 'reviews'>('description');
  const [isLoading, setIsLoading] = useState(true);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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
        setProduct(products[0] || MOCK_PRODUCTS[0]);
        setIsLoading(false);
      }
    };

    loadProduct();
    return () => { isMounted = false; };
  }, [id, products]);

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

  const [quantity, setQuantity] = useState(1);

  const { addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useShop();
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const relatedProducts = products
    .filter(p => p.category === product.category && (p.id !== product.id && (p as any)._id !== product.id))
    .slice(0, 4);

  if (isLoading || !product) {
    return <ProductDetailSkeleton />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-[#1cd75b] z-[100] transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 text-xs text-gray-500 overflow-x-auto whitespace-nowrap px-4 md:px-0">
          <Link to="/" className="hover:text-red-500 transition-colors">Home</Link>
          <span className="mx-1">/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-red-500 transition-colors">{product.category}</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900 truncate max-w-[200px] md:max-w-md">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">

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

            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl md:text-3xl font-medium text-gray-900 leading-tight">
                {product.name}
              </h1>
              {product.brand && (
                <div className="text-2xl font-black text-gray-300 ml-4 lowercase tracking-tighter">
                  {product.brand}
                </div>
              )}
            </div>

            {/* Bullet points from specifications */}
            <div className="mb-4">
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                {product.specifications ? Object.entries(product.specifications).slice(0, 5).map(([k, v]) => (
                  <li key={k}><span className="font-medium">{k}:</span> {v}</li>
                )) : (
                  <>
                    <li>High-quality materials</li>
                    <li>Durable and reliable</li>
                    <li>1 Year Warranty</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                <ShieldCheck size={14} /> 06 MONTHS WARRANTY
              </span>
            </div>


            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-end gap-3 mb-1">
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through font-medium mb-0.5">{formatLKR(product.originalPrice)}</span>
                )}
                <span className="text-3xl font-bold text-red-600 tracking-tight">{formatLKR(product.price)}</span>
              </div>

              {/* Installments */}
              <div className="mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                  <span>3 X {formatLKR(product.price / 3)} with</span>
                  <img src="https://qa-merchant.paykoko.com/assets/images/logo.png" alt="Koko" className="h-4" />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                  <span>4 X {formatLKR(product.price / 4)} with</span>
                  <img src="https://payzy.lk/images/logoWordDark.png" alt="Payzy" className="h-4" />
                </div>
              </div>

              {/* Price Alert */}
              <div className="mt-4">
                {!showPriceAlert && !alertSuccess ? (
                  <button
                    onClick={() => setShowPriceAlert(true)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1cd75b] transition-colors"
                  >
                    <Bell size={16} /> Get Price Drop Alerts
                  </button>
                ) : alertSuccess ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1cd75b] bg-[#1cd75b]/10 p-3 rounded-lg">
                    <Check size={16} /> Alert saved! We'll email you if the price drops.
                  </div>
                ) : (
                  <form onSubmit={handlePriceAlert} className="flex items-center gap-2 mt-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      className="flex-1 text-sm p-2.5 rounded-lg border border-gray-200 focus:border-[#1cd75b] focus:ring-1 focus:ring-[#1cd75b] outline-none"
                    />
                    <button type="submit" className="bg-black text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors">
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>


            {/* Options */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-900 w-20">Colors:</span>
                <div className="flex gap-2">
                  <button className="w-6 h-6 rounded-full bg-black ring-2 ring-offset-2 ring-gray-900"></button>
                  <button className="w-6 h-6 rounded-full bg-gray-300 hover:ring-2 hover:ring-offset-2 hover:ring-gray-300"></button>
                  <button className="w-6 h-6 rounded-full bg-orange-500 hover:ring-2 hover:ring-offset-2 hover:ring-orange-500"></button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-900 w-20">Warranty:</span>
                <select className="border border-gray-300 rounded-md py-1 px-3 text-sm focus:ring-gray-900 focus:border-gray-900">
                  <option>6 Months Warranty</option>
                  <option>1 Year Warranty</option>
                </select>
                <button className="text-xs text-gray-400 hover:text-gray-900">x Clear</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-8 mt-4">
              <div className="flex gap-3">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-14 w-32 shrink-0 bg-white">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-gray-500 hover:text-black hover:bg-gray-100 h-full transition-colors"><Minus size={18} /></button>
                  <input type="text" value={quantity} readOnly className="w-full text-center font-bold text-gray-900 bg-transparent outline-none" />
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-gray-500 hover:text-black hover:bg-gray-100 h-full transition-colors"><Plus size={18} /></button>
                </div>

                <button
                  className="flex-1 bg-black text-white font-black uppercase tracking-wider h-14 rounded-xl hover:bg-gray-900 transition-colors shadow-sm"
                >
                  BUY NOW
                </button>

                <button
                  onClick={() => addToCart({ ...product, price: product.price * quantity })}
                  className="w-14 h-14 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-900 transition-colors shrink-0 shadow-sm group"
                  title="Add to Cart"
                >
                  <ShoppingCart size={22} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <button className="w-full sm:w-fit bg-[#25D366] text-white font-bold text-sm tracking-wider py-3 px-6 rounded-xl hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.012 2C6.486 2 2 6.486 2 12.013c0 1.76.45 3.468 1.306 4.992L2 22l5.127-1.332A9.972 9.972 0 0012.012 22c5.526 0 10-4.486 10-10.013S17.538 2 12.012 2zm5.54 14.18c-.244.686-1.42 1.32-1.96 1.378-.54.058-1.192.176-3.41-1.026-2.67-1.448-4.364-4.22-4.496-4.394-.132-.174-1.072-1.427-1.072-2.72 0-1.293.676-1.927.917-2.182.242-.255.526-.318.702-.318.176 0 .352 0 .506.006.16.006.376-.06.58.428.216.518.702 1.716.766 1.846.064.13.106.282.02.434-.084.152-.126.242-.252.392-.128.15-.264.32-.38.452-.12.14-.246.29-.108.528.138.238.614 1.014 1.318 1.642.91.81 1.67 1.054 1.91 1.168.242.114.382.094.526-.068.144-.162.624-.726.79-9.76.164-.25.328-.208.544-.128.216.08 1.372.646 1.61.764.238.118.396.176.454.274.058.098.058.57-.186 1.256z" />
                </svg>
                Check on Whatsapp
              </button>
            </div>

            {/* Meta Actions */}
            <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 mb-6">
              <div className="flex gap-4">
                <button onClick={() => toggleCompare(product)} className={`flex items-center gap-1 text-sm font-semibold ${inCompare ? 'text-[#2ee661]' : 'text-gray-500 hover:text-black'}`}>
                  <Scale size={16} /> Compare
                </button>
                <button onClick={() => toggleWishlist(product)} className={`flex items-center gap-1 text-sm font-semibold ${inWishlist ? 'text-red-500' : 'text-gray-500 hover:text-black'}`}>
                  <Heart size={16} className={inWishlist ? 'fill-current' : ''} /> Add to wishlist
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                Share:
                <button className="hover:text-blue-600"><Facebook size={14} /></button>
                <button className="hover:text-black"><Twitter size={14} /></button>
                <button className="hover:text-blue-700"><Linkedin size={14} /></button>
              </div>
            </div>

            {/* Watching Alert */}
            <div className="bg-pink-50 text-pink-700 p-3 rounded-lg flex items-center gap-2 text-sm font-bold mb-6">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
              {Math.floor(Math.random() * 20) + 5} People watching this product now!
            </div>

            {/* Delivery Info */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
              <h4 className="font-bold text-gray-900 mb-3 text-sm">Delivery Information (Estimated Delivery Time)</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p><span className="font-bold text-gray-800">Store Pickup:</span> Same Day (During Working Hours)</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Truck size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p><span className="font-bold text-gray-800">Island Wide Delivery:</span> 1-3 Working Days</p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-6">
              Payment Methods:
              <div className="flex gap-1">
                <div className="w-8 h-5 bg-blue-900 rounded"></div>
                <div className="w-8 h-5 bg-orange-500 rounded"></div>
                <div className="w-8 h-5 bg-blue-500 rounded"></div>
                <div className="w-8 h-5 bg-purple-600 rounded"></div>
                <div className="w-8 h-5 bg-green-500 rounded"></div>
              </div>
            </div>


            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 mb-6">
              <span className="flex items-center gap-1"><Truck size={14} /> FREE DELIVERY</span>
              <span className="flex items-center gap-1"><ShieldCheck size={14} /> RELIABLE WARRANTY</span>
              <span className="flex items-center gap-1"><Headset size={14} /> CUSTOMER SUPPORT</span>
            </div>

            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-sm text-gray-500">
              <p><span className="font-bold text-gray-900">Category:</span> <Link to={`/shop?category=${product.category}`} className="hover:text-black hover:underline">{product.category}</Link></p>
              {product.tags && <p><span className="font-bold text-gray-900">Tags:</span> {product.tags.map(t => <span key={t} className="mr-2 text-gray-600">#{t.toLowerCase().replace(/\s/g, '')}</span>)}</p>}
              {product.sku && <p><span className="font-bold text-gray-900">SKU:</span> {product.sku}</p>}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Specs */}
        <div className="mt-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-center gap-12 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'description' ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Description
              {activeTab === 'description' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></span>}
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-3 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'shipping' ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Shipping & Delivery
              {activeTab === 'shipping' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></span>}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'reviews' ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Reviews ({product.reviews || 0})
              {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></span>}
            </button>
          </div>
          <div className="prose prose-sm max-w-none text-gray-600">
            {activeTab === 'description' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-6">
                  <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Product Description</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>{product.description || product.shortDescription || "No detailed description available."}</p>
                    <p>Designed to elevate your computing experience, this component is built with rigorous quality control, delivering uncompromised performance under heavy workloads.</p>
                  </div>

                  {/* Dummy promotional image/banner */}
                  <div className="mt-8 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white p-8 flex flex-col items-start justify-center relative shadow-lg h-48">
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-[#fc2d3f] mb-2 uppercase tracking-widest">Premium Hardware</h3>
                      <p className="max-w-md text-sm opacity-80 leading-relaxed">Experience next level performance with genuine parts and warranty.</p>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-white/10 to-transparent"></div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Specifications</h3>
                    {product.specifications ? (
                      <ul className="space-y-4">
                        {Object.entries(product.specifications).map(([key, value], idx) => (
                          <li key={idx} className="flex flex-col border-b border-gray-200/60 pb-3 last:border-0 last:pb-0">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{key}</span>
                            <span className="text-sm font-medium text-gray-900">{value}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Full specifications are not available for this item.</p>
                    )}
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-900">Shipping Policies</h3>
                <p>We partner with reliable courier services to ensure your products reach you safely and on time.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Store Pickup: Available at our main branch. Please bring your order confirmation.</li>
                  <li>Colombo & Suburbs: Delivered within 1-2 working days.</li>
                  <li>Outstation: Delivered within 2-4 working days.</li>
                </ul>
                <p className="text-xs text-gray-500 mt-4">* Delivery times may vary during public holidays and adverse weather conditions.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-6">Customer Reviews</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Reviews List */}
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-4xl font-black text-gray-900">{product.rating}</div>
                      <div className="flex flex-col">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'} />)}
                        </div>
                        <span className="text-sm text-gray-500">{product.reviews} reviews</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {product.reviews > 0 ? (
                        <div className="border-b border-gray-100 pb-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-900">Great product!</span>
                            <span className="text-xs text-gray-500">2 days ago</span>
                          </div>
                          <div className="flex text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                          </div>
                          <p className="text-sm text-gray-600">Exactly as described. Fast shipping and good packaging. Highly recommended.</p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">There are no reviews yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Review Form */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-2">Be the first to review "{product.name}"</h4>
                    <p className="text-xs text-gray-500 mb-4">Your email address will not be published. Required fields are marked *</p>

                    <form className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-700">Your rating *</span>
                        <div className="flex text-gray-300 cursor-pointer hover:text-yellow-400">
                          <Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Pros</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Cons</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Your review *</label>
                        <textarea className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-red-500 focus:border-red-500" required></textarea>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Name *</label>
                          <input type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-gray-900 focus:border-gray-900" required />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Email *</label>
                          <input type="email" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-gray-900 focus:border-gray-900" required />
                        </div>
                      </div>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" className="mt-1 rounded border-gray-300" />
                        <span className="text-xs text-gray-600">Save my name, email, and website in this browser for the next time I comment.</span>
                      </label>

                      <button type="submit" className="bg-red-600 text-white font-bold px-6 py-2 rounded hover:bg-red-700 transition-colors">
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <FAQAccordion />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-black text-gray-900 uppercase mb-6 tracking-tight">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoading ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />) : relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
