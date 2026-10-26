import { StrictMode, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import SpecialOffers from './pages/SpecialOffers';
import BuildMyPC from './pages/BuildMyPC';
import Admin from './pages/Admin';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Drawers from './components/Drawers';
import AIAssistant from './components/AIAssistant';
import CompareModal from './components/CompareModal';
import ScrollToTopButton from './components/ScrollToTopButton';
import ProtectedRoute from './components/ProtectedRoute';
import PayHereSandbox from './pages/PayHereSandbox';
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
            <div className="min-h-screen flex flex-col font-sans relative bg-gray-50 text-gray-900">
              <Routes>
                {/* Auth and Admin pages — no store header/footer */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<Admin />} />

                {/* Main app layout */}
                <Route path="*" element={
                  <>
                    <Header />
                    <main className="flex-grow pt-[114px] md:pt-[140px] lg:pt-[128px] pb-16 md:pb-0 bg-gray-50">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product" element={<Navigate to="/shop" replace />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                        <Route path="/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/offers" element={<SpecialOffers />} />
                        <Route path="/special-offers" element={<SpecialOffers />} />
                        <Route path="/build" element={<BuildMyPC />} />
                        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                        <Route path="/payhere-sandbox" element={<PayHereSandbox />} />
                        <Route path="/payhere-sandbox/success" element={<PayHereSandbox />} />
                        <Route path="/payhere-sandbox/cancel" element={<PayHereSandbox />} />
                        <Route path="/payhere-sandbox/error" element={<PayHereSandbox />} />
                      </Routes>
                    </main>
                    <Footer />
                    <Drawers />
                    <AIAssistant />
                    <CompareModal />
                    <ScrollToTopButton />
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
