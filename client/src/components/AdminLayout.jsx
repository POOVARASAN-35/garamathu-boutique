import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingBag, FolderOpen, ClipboardList, 
  Users, Truck, Settings, LogOut, Menu, X, ExternalLink, ShieldCheck, ChevronRight
} from 'lucide-react';
import { logoutAdminThunk } from '../store/adminSlice.js';
import { useToast } from '../context/ToastContext.jsx';

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { currentAdmin } = useSelector((state) => state.admin);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu whenever location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logoutAdminThunk());
    addToast('Admin logged out successfully.', 'info');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/admin/products', label: 'Products', icon: <ShoppingBag className="w-4 h-4" /> },
    { path: '/admin/categories', label: 'Categories', icon: <FolderOpen className="w-4 h-4" /> },
    { path: '/admin/orders', label: 'Orders', icon: <ClipboardList className="w-4 h-4" /> },
    { path: '/admin/customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { path: '/admin/settings', label: 'Settings', icon: <Truck className="w-4 h-4" /> }
  ];

  // Get active menu item label for header display
  const currentItem = menuItems.find(item => location.pathname.startsWith(item.path));
  const currentPageTitle = currentItem ? currentItem.label : 'Admin Portal';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-left select-none font-poppins">
      
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-emerald-950 text-white border-b border-gold-500/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left Side: Mobile Menu Button & Brand / Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-gold-400 focus:outline-none transition-colors border border-gold-500/20"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="Gramathu Boutique Logo" 
                className="h-8 sm:h-9 w-auto rounded-full bg-white border border-gold-500/20 p-0.5" 
              />
              <div className="flex flex-col leading-none">
                <span className="font-playfair text-sm sm:text-base font-bold tracking-[0.15em] text-white uppercase">
                  Gramathu Boutique
                </span>
                <span className="font-montserrat text-[8px] sm:text-[9px] tracking-[0.25em] text-gold-400 font-semibold uppercase mt-0.5">
                  Admin Portal
                </span>
              </div>
            </Link>

            {/* Current Active Section Badge (Desktop) */}
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-emerald-800/80 text-xs font-medium text-gray-300">
              <ChevronRight className="w-3.5 h-3.5 text-gold-500" />
              <span className="text-gold-400 font-semibold tracking-wider uppercase">{currentPageTitle}</span>
            </div>
          </div>

          {/* Right Side: Store Front Link, Admin Info & Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-900 text-gold-400 hover:text-gold-300 text-xs font-medium border border-gold-500/20 transition-all"
              title="View Store Front"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Site</span>
            </Link>

            {currentAdmin && (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-900/40 border border-gold-500/10 px-3 py-1 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-gold-500 text-emerald-950 font-bold text-xs flex items-center justify-center font-playfair uppercase">
                  {currentAdmin.name ? currentAdmin.name.charAt(0) : 'A'}
                </div>
                <div className="flex flex-col leading-none text-left">
                  <span className="text-xs font-semibold text-gray-200">{currentAdmin.name}</span>
                  <span className="text-[9px] text-gold-400 uppercase tracking-widest">{currentAdmin.role || 'Admin'}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 text-xs font-semibold border border-rose-500/20 transition-colors uppercase tracking-wider"
              title="Logout Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container: Sidebar + Outlet */}
      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 bg-emerald-950 text-white flex-shrink-0 flex-col justify-between hidden md:flex border-r border-gold-500/20">
          <div className="p-5 space-y-6">
            <div className="text-xs uppercase tracking-wider text-gold-500/80 font-semibold px-3 font-montserrat">
              Navigation Menu
            </div>

            <nav className="flex flex-col gap-1.5">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                    isActive
                      ? 'bg-gold-500 text-emerald-950 shadow-md font-bold'
                      : 'text-gray-300 hover:bg-gold-500/10 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Desktop Sidebar Footer */}
          <div className="p-5 border-t border-gold-500/10 space-y-3">
            {currentAdmin && (
              <div className="flex items-center gap-3 text-left text-xs bg-emerald-900/30 p-3 rounded-xl border border-gold-500/10">
                <ShieldCheck className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-gray-200 truncate">{currentAdmin.name}</p>
                  <p className="text-[10px] text-gold-400 uppercase font-semibold tracking-wider mt-0.5">{currentAdmin.role || 'Super Admin'}</p>
                </div>
              </div>
            )}

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-gold-400 hover:bg-gold-500/10 rounded-xl font-semibold border border-gold-500/20 transition-all uppercase tracking-wider"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Main Website
            </Link>
          </div>
        </aside>

        {/* Mobile Slide-Over Drawer Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
              />

              {/* Drawer Menu Content */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-72 bg-emerald-950 text-white z-50 flex flex-col justify-between p-6 shadow-2xl border-r border-gold-500/20 md:hidden overflow-y-auto"
              >
                <div className="space-y-6">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gold-500/20">
                    <div className="flex items-center gap-2.5">
                      <img src="/logo.png" alt="Logo" className="h-8 w-auto rounded-full bg-white p-0.5" />
                      <span className="font-playfair text-base font-bold tracking-wider text-white">ADMIN MENU</span>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 rounded-lg bg-emerald-900/60 text-gold-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Admin User Info Card in Drawer */}
                  {currentAdmin && (
                    <div className="bg-emerald-900/40 p-3.5 rounded-xl border border-gold-500/15 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500 text-emerald-950 font-bold text-sm flex items-center justify-center font-playfair uppercase">
                        {currentAdmin.name ? currentAdmin.name.charAt(0) : 'A'}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white">{currentAdmin.name}</p>
                        <p className="text-[10px] text-gold-400 uppercase font-semibold tracking-wider">{currentAdmin.role || 'Admin'}</p>
                      </div>
                    </div>
                  )}

                  {/* Mobile Navigation Links */}
                  <nav className="flex flex-col gap-2">
                    <p className="text-[10px] font-semibold text-gold-500 uppercase tracking-widest px-2 font-montserrat">
                      Sections
                    </p>
                    {menuItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                          isActive
                            ? 'bg-gold-500 text-emerald-950 shadow-md font-bold'
                            : 'text-gray-300 hover:bg-gold-500/10 hover:text-white'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </div>

                {/* Drawer Footer Actions */}
                <div className="pt-6 border-t border-gold-500/15 space-y-3">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-gold-400 hover:bg-gold-500/10 rounded-xl font-semibold border border-gold-500/20 transition-all uppercase tracking-wider"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Main Website
                  </Link>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-rose-300 bg-rose-950/50 hover:bg-rose-900 rounded-xl font-semibold border border-rose-500/20 transition-all uppercase tracking-wider"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout Admin
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Panel Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

