import { StrictMode, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import OrderTracking from './pages/OrderTracking';
import Orders from './pages/Orders';
import SpecialOffers from './pages/SpecialOffers';
import BuildMyPC from './pages/BuildMyPC';
import Admin from './pages/Admin';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import Drawers from './components/Drawers';
import AIAssistant from './components/AIAssistant';
import CompareModal from './components/CompareModal';
import ProtectedRoute from './components/ProtectedRoute';
import { ShopProvider } from './context/ShopContext';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <ShopProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col font-sans relative">
            <Routes>
              {/* Auth and Admin pages — no store header/footer */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<Admin />} />

              {/* Main app layout */}
              <Route path="*" element={
                <>
                  <Header />
                  <main className="flex-grow pt-[136px] md:pt-[152px] pb-16 md:pb-0">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                      <Route path="/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/track" element={<OrderTracking />} />
                      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                      <Route path="/offers" element={<SpecialOffers />} />
                      <Route path="/build" element={<BuildMyPC />} />
                    </Routes>
                  </main>
                  <Footer />
                  <Drawers />
                  <AIAssistant />
                  <CompareModal />
                  
                  {/* WhatsApp Fixed Button */}
                  <a href="#" className="fixed bottom-20 md:bottom-6 left-6 z-40 w-[50px] h-[50px] md:w-[60px] md:h-[60px] bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="md:w-8 md:h-8">
                      <path d="M12.012 2C6.486 2 2 6.486 2 12.013c0 1.76.45 3.468 1.306 4.992L2 22l5.127-1.332A9.972 9.972 0 0012.012 22c5.526 0 10-4.486 10-10.013S17.538 2 12.012 2zm5.54 14.18c-.244.686-1.42 1.32-1.96 1.378-.54.058-1.192.176-3.41-1.026-2.67-1.448-4.364-4.22-4.496-4.394-.132-.174-1.072-1.427-1.072-2.72 0-1.293.676-1.927.917-2.182.242-.255.526-.318.702-.318.176 0 .352 0 .506.006.16.006.376-.06.58.428.216.518.702 1.716.766 1.846.064.13.106.282.02.434-.084.152-.126.242-.252.392-.128.15-.264.32-.38.452-.12.14-.246.29-.108.528.138.238.614 1.014 1.318 1.642.91.81 1.67 1.054 1.91 1.168.242.114.382.094.526-.068.144-.162.624-.726.79-9.76.164-.25.328-.208.544-.128.216.08 1.372.646 1.61.764.238.118.396.176.454.274.058.098.058.57-.186 1.256z"/>
                    </svg>
                  </a>
                </>
              } />
            </Routes>
          </div>
        </Router>
        </ShopProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

