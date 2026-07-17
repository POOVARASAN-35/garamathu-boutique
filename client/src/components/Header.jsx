import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Heart, ShoppingBag, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { logout } from '../store/authSlice.js';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ onOpenAuthModal, onOpenSearchModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const categories = useSelector((state) => state.products.categories);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Collections', path: '/collection/all' },
    { label: 'Contact', path: '/contact' }
  ];

  const isHome = location.pathname === '/';
  
  // Dynamic header styles for Zara/Dior layout overlay
  const headerClass = `fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
    isHome
      ? isScrolled
        ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 shadow-luxury'
        : 'bg-transparent py-6 border-b border-transparent'
      : 'bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 shadow-luxury'
  }`;

  const textColorClass = isHome && !isScrolled ? 'text-white' : 'text-gray-900';
  const subtextColorClass = isHome && !isScrolled ? 'text-white/80' : 'text-sienna-600';
  const navLinkClass = isHome && !isScrolled 
    ? 'text-white/90 hover:text-white hover:scale-105' 
    : 'text-gray-800 hover:text-sienna-600 hover:scale-105';
  const iconColorClass = isHome && !isScrolled 
    ? 'text-white hover:text-white/80 hover:bg-white/10' 
    : 'text-gray-800 hover:text-sienna-600 hover:bg-gray-100';

  return (
    <>
      <header className={headerClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`md:hidden p-2 rounded-full transition-all duration-300 ${iconColorClass}`}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo / Brand Name */}
          <Link to="/" className="flex items-center gap-2 select-none">
            <img src="/logo.png" alt="Gramathu Boutique Logo" className="h-10 sm:h-12 w-auto object-contain rounded-full shadow-sm bg-white" />
            {/*<div className="flex flex-col items-start leading-none mt-0.5">
              <span className={`font-playfair text-sm sm:text-base font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${textColorClass}`}>
                Gramathu
              </span>
              <span className={`font-poppins text-[7px] sm:text-[8px] tracking-[0.35em] font-semibold uppercase mt-1 transition-colors duration-500 ${subtextColorClass}`}>
                Boutique
              </span>
            </div>*/}
          </Link>

          {/* Center Navigation Menu */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                <Link
                  to={link.path}
                  className={`font-poppins text-xs font-semibold uppercase tracking-wider transition-all duration-300 luxury-underline block ${navLinkClass}`}
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Search Icon */}
            <button
              onClick={onOpenSearchModal}
              className={`p-2.5 rounded-full transition-all duration-300 ${iconColorClass}`}
              aria-label="Search Products"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Login / Profile */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`p-2.5 rounded-full transition-all duration-300 flex items-center gap-1.5 ${iconColorClass}`}
                  >
                    <User className="w-4.5 h-4.5" />
                    <span className="hidden lg:inline text-xs font-medium">Hi, {user.firstName}</span>
                  </button>
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 shadow-luxury rounded-xl p-2 z-50 text-left"
                      >
                        <div className="px-4 py-2.5 border-b border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account</p>
                          <p className="text-xs font-semibold text-gray-800 truncate mt-0.5">{user.email}</p>
                        </div>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-sienna-50 hover:text-sienna-600 rounded-lg transition-colors font-medium mt-1"
                          >
                            <LayoutDashboard className="w-4 h-4 text-sienna-500" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/my-orders"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-sienna-50 hover:text-sienna-600 rounded-lg transition-colors font-medium"
                        >
                          <ShoppingBag className="w-4 h-4 text-sienna-500" />
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors font-semibold text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className={`p-2.5 rounded-full transition-all duration-300 ${iconColorClass}`}
                  aria-label="Account Login"
                >
                  <User className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={`p-2.5 rounded-full transition-all duration-300 relative block ${iconColorClass}`}
              aria-label="Wishlist"
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white font-poppins text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className={`p-2.5 rounded-full transition-all duration-300 relative block ${iconColorClass}`}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white font-poppins text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-80 h-full bg-white shadow-luxury p-6 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                  <Link to="/" className="flex flex-col select-none">
                    <span className="font-playfair text-xl font-bold tracking-[0.2em] text-gray-900 uppercase">
                      Gramathu
                    </span>
                    <span className="font-poppins text-[9px] tracking-[0.4em] text-sienna-500 font-semibold uppercase mt-0.5">
                      Boutique
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <nav className="flex flex-col gap-6 mt-8 text-left">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.path}
                      className="font-playfair text-xl font-semibold text-gray-800 hover:text-sienna-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="h-[1px] bg-gray-100 my-2"></div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Collections</p>
                  <div className="flex flex-col gap-3 pl-1 max-h-[35vh] overflow-y-auto">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/collection/${encodeURIComponent(cat.name)}`}
                        className="text-sm font-medium text-gray-600 hover:text-sienna-600 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="border-t border-gray-100 pt-6 text-left">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-gray-500">Logged in as {user.email}</p>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-sienna-600"
                      >
                        <LayoutDashboard className="w-4 h-4 text-sienna-500" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm font-semibold text-red-500 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full bg-gray-900 text-white font-poppins font-medium py-3.5 rounded-xl hover:bg-sienna-600 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                  >
                    <User className="w-4 h-4" />
                    Login / Create Account
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
