import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Truck, MapPin, Package, CheckCircle2, ChevronRight, Settings, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const [orderId, setOrderId] = useState(queryId || '');
  const [isTracking, setIsTracking] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (queryId) {
      executeTrack(queryId);
    }
  }, [queryId]);

  const executeTrack = (idToTrack: string) => {
    if (!idToTrack.trim()) {
      setError('Please enter a valid Order ID');
      return;
    }
    setError('');
    setIsTracking(true);
    setTrackingData(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsTracking(false);
      if (idToTrack.trim().toUpperCase().startsWith('ORD-')) {
        setTrackingData({
          id: idToTrack.toUpperCase(),
          status: 'shipped', // placed, processing, shipped, delivered
          date: new Date().toLocaleDateString(),
          estimatedDelivery: new Date(Date.now() + 86400000 * 2).toLocaleDateString(),
          steps: [
            { title: 'Order Placed', date: 'Oct 24, 2024 - 10:00 AM', completed: true, icon: Package },
            { title: 'Processing', date: 'Oct 24, 2024 - 02:30 PM', completed: true, icon: Settings },
            { title: 'Shipped', date: 'Oct 25, 2024 - 09:15 AM', completed: true, icon: Truck },
            { title: 'Out for Delivery', date: 'Pending', completed: false, icon: MapPin },
            { title: 'Delivered', date: 'Pending', completed: false, icon: CheckCircle2 }
          ]
        });
      } else {
        setError('Order not found. Please verify your Order ID and try again. (Hint: Try ORD-123)');
      }
    }, 1500);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    executeTrack(orderId);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Track Your Order</h1>
          
          <div className="flex items-center gap-2 text-sm font-bold">
            <Link to="/" className="text-gray-400 hover:text-black transition-colors">Home</Link>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-red-500">Track Order</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-12">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden mb-8">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
            <MapPin size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2 relative z-10">Where is my order?</h2>
          <p className="text-gray-500 mb-8 relative z-10">Enter your order ID below to get real-time tracking updates.</p>
          
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 relative z-10 max-w-xl mx-auto">
            <input 
              type="text" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. ORD-123456" 
              className="flex-1 p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 font-bold uppercase"
            />
            <button 
              type="submit" 
              disabled={isTracking}
              className="bg-black text-white font-black uppercase tracking-wider py-4 px-8 rounded-xl hover:bg-gray-900 transition-colors shadow-lg disabled:opacity-70 flex items-center justify-center min-w-[160px]"
            >
              {isTracking ? 'Searching...' : 'Track Now'}
            </button>
          </form>
          {error && (
            <p className="text-red-500 text-sm font-bold mt-4 flex items-center justify-center gap-2 relative z-10">
              <AlertCircle size={16} /> {error}
            </p>
          )}

          {/* Decorative background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
        </div>

        <AnimatePresence>
          {trackingData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Order Details</p>
                  <h3 className="text-2xl font-black text-gray-900">{trackingData.id}</h3>
                </div>
                <div className="md:text-right">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Estimated Delivery</p>
                  <p className="text-lg font-black text-[#1cd75b]">{trackingData.estimatedDelivery}</p>
                </div>
              </div>

              <div className="p-6 md:p-10">
                <div className="relative">
                  {/* Timeline connecting line */}
                  <div className="absolute left-6 md:left-8 top-10 bottom-10 w-0.5 bg-gray-100"></div>
                  
                  <div className="space-y-8">
                    {trackingData.steps.map((step: any, index: number) => {
                      const Icon = step.icon;
                      return (
                        <div key={index} className="relative flex items-start gap-6">
                          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 transition-colors ${
                            step.completed 
                              ? 'bg-[#1cd75b] text-white' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            <Icon size={24} />
                          </div>
                          <div className="pt-2 md:pt-4">
                            <h4 className={`text-base md:text-lg font-black uppercase ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
