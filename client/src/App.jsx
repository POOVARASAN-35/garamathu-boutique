import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCategories } from './store/productSlice.js';

// Layout & Utility Components
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';

// Modals
import LoginRegisterModal from './components/LoginRegisterModal.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';
import QuickViewModal from './components/QuickViewModal.jsx';

// Pages - Customer
import Home from './pages/Customer/Home.jsx';
import Collections from './pages/Customer/Collections.jsx';
import ProductDetails from './pages/Customer/ProductDetails.jsx';
import Wishlist from './pages/Customer/Wishlist.jsx';
import Cart from './pages/Customer/Cart.jsx';
import MyOrders from './pages/Customer/MyOrders.jsx';
import Contact from './pages/Customer/Contact.jsx';
import Login from './pages/Customer/Login.jsx';
import Register from './pages/Customer/Register.jsx';
import OrderSuccess from './pages/Customer/OrderSuccess.jsx';
import OrderTracking from './pages/Customer/OrderTracking.jsx';

// Pages - Admin Portal
import AdminLogin from './pages/Admin/AdminLogin.jsx';
import Dashboard from './pages/Admin/Dashboard.jsx';
import Products from './pages/Admin/Products.jsx';
import Categories from './pages/Admin/Categories.jsx';
import Orders from './pages/Admin/Orders.jsx';
import Customers from './pages/Admin/Customers.jsx';
import Settings from './pages/Admin/Settings.jsx';

import AdminGuard from './components/AdminGuard.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import PageTransition from './components/PageTransition.jsx';

// Helper to scroll window to top on page transitions
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  // Global Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    // Load categories initially to fill header collections links
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleOpenQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 300); // Wait for anims
  };

  const isHome = location.pathname === '/';
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-slate-50 text-gray-800 font-poppins selection:bg-sienna-500 selection:text-white select-none">
        
        {/* Sticky Header - Hidden on Admin Portal */}
        {!isAdminPath && (
          <Header 
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenSearchModal={() => setIsSearchOpen(true)}
          />
        )}

        {/* Main Content Router */}
        <main className={`flex-1 w-full transition-all duration-300 ${isAdminPath ? 'pt-0' : (!isHome ? 'pt-24 sm:pt-28' : 'pt-0')}`}>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<PageTransition><Home onQuickView={handleOpenQuickView} /></PageTransition>} />
            <Route path="/collection/:categoryName" element={<PageTransition><Collections onQuickView={handleOpenQuickView} /></PageTransition>} />
            <Route path="/product/:id" element={<PageTransition><ProductDetails onQuickView={handleOpenQuickView} /></PageTransition>} />
            <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/my-orders" element={<PageTransition><MyOrders /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/order-success/:orderId" element={<PageTransition><OrderSuccess /></PageTransition>} />
            <Route path="/track-order/:orderId" element={<PageTransition><OrderTracking /></PageTransition>} />

            {/* Separate Admin Portal Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<PageTransition><Home onQuickView={handleOpenQuickView} /></PageTransition>} />
          </Routes>
        </main>

        {/* Footer - Hidden on Admin Portal */}
        {!isAdminPath && <Footer />}

        {/* WhatsApp support badge - Hidden on Admin Portal */}
        {!isAdminPath && <WhatsAppButton />}

        {/* Login/Register Popup Modal */}
        <LoginRegisterModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />

        {/* Full-Screen Search Modal Overlay */}
        <SearchOverlay 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
        />

        {/* Quick View Details Modal Popup */}
        <QuickViewModal 
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={handleCloseQuickView}
        />

      </div>
    </>
  );
}
