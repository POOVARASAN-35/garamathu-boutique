import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, FolderOpen, ClipboardList, Users, Truck, Star, Image, Settings, LogOut,
  Plus, Edit, Trash2, Copy, Check, X, ShieldAlert, ArrowLeftRight, TrendingUp, DollarSign, Eye, AlertTriangle
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { 
  fetchAdminOrders, updateOrderStatus, fetchAdminCustomers, fetchAdminSettings, updateAdminSettings,
  addSareeAdmin, updateSareeAdmin, deleteSareeAdmin, duplicateSareeAdmin,
  addCategoryAdmin, updateCategoryAdmin, deleteCategoryAdmin
} from '../store/adminSlice.js';
import { fetchSarees, fetchCategories } from '../store/productSlice.js';
import { loginUser } from '../store/authSlice.js';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageUpload from '../components/ImageUpload.jsx';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { token, user } = useSelector((state) => state.auth);
  const { orders, customers, settings, loading } = useSelector((state) => state.admin);
  const { sarees, categories } = useSelector((state) => state.products);

  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Admin Login States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Saree CRUD states
  const [sareeFormOpen, setSareeFormOpen] = useState(false);
  const [editingSareeId, setEditingSareeId] = useState(null);
  const [sareeName, setSareeName] = useState('');
  const [sareePrice, setSareePrice] = useState('');
  const [sareeOfferPrice, setSareeOfferPrice] = useState('');
  const [sareeCategory, setSareeCategory] = useState('');
  const [sareeStock, setSareeStock] = useState('');
  const [sareeColor, setSareeColor] = useState('');
  const [sareeFabric, setSareeFabric] = useState('');
  const [sareeDescription, setSareeDescription] = useState('');
  const [sareeImages, setSareeImages] = useState([]);
  const [sareeStatus, setSareeStatus] = useState('Active');
  const [sareeFeatured, setSareeFeatured] = useState(false);
  const [sareeSeoTitle, setSareeSeoTitle] = useState('');
  const [sareeSeoDescription, setSareeSeoDescription] = useState('');

  // Category CRUD states
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catName, setCatName] = useState('');
  const [catImage1, setCatImage1] = useState('');
  const [catImage2, setCatImage2] = useState('');
  const [catOrder, setCatOrder] = useState('1');
  const [catStatus, setCatStatus] = useState('Active');

  // Customer modal view
  const [viewingCustomer, setViewingCustomer] = useState(null);

  // Settings states
  const [shippingFeeInput, setShippingFeeInput] = useState('');
  const [freeDistrictInput, setFreeDistrictInput] = useState('');

  // Admin login handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      addToast('Please enter both email and password.', 'warning');
      return;
    }
    setIsLoggingIn(true);
    try {
      const result = await dispatch(loginUser({ email: adminEmail, password: adminPassword }));
      if (loginUser.fulfilled.match(result)) {
        const loggedUser = result.payload.user;
        if (loggedUser.role === 'admin') {
          addToast('Authorized. Welcome to Admin Dashboard.', 'success');
        } else {
          addToast('Access denied. Customer account is not authorized.', 'error');
        }
      } else {
        addToast(result.payload || 'Invalid admin credentials.', 'error');
      }
    } catch (err) {
      addToast('Authentication error occurred.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Load Admin Data
  useEffect(() => {
    if (token && user?.role === 'admin') {
      dispatch(fetchAdminOrders());
      dispatch(fetchAdminCustomers());
      dispatch(fetchAdminSettings());
      dispatch(fetchSarees({ limit: 100, adminView: 'true' }));
      dispatch(fetchCategories());
    }
  }, [dispatch, token, user]);

  // Sync settings inputs when retrieved
  useEffect(() => {
    if (settings?.shipping) {
      setShippingFeeInput(settings.shipping.defaultShippingCharge);
      setFreeDistrictInput(settings.shipping.freeShippingDistrict);
    }
  }, [settings]);

  if (!token || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 selection:bg-rose-500 selection:text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full space-y-8 bg-[#161C2A] p-8 sm:p-10 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-red-950 text-red-500 border border-red-900/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="font-playfair text-3xl font-black text-white tracking-wider uppercase">
              GRAMATHU <span className="text-red-500 italic font-normal">BOUTIQUE</span>
            </h2>
            <p className="text-xs text-gray-400 font-poppins uppercase tracking-[0.2em] font-semibold">
              Administration Portal
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="mt-8 space-y-6">
            <div className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest font-poppins">Secure Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@gramathuboutique.com"
                  className="w-full bg-[#1F2736] border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-red-950 focus:outline-none transition-colors font-medium font-poppins"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest font-poppins">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1F2736] border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:border-red-950 focus:outline-none transition-colors font-medium font-poppins"
                  required
                />
              </div>
            </div>

            {user && user.role !== 'admin' && (
              <div className="p-3 bg-red-900/10 border border-red-900/30 rounded-xl text-[10px] text-red-400 flex items-start gap-2 font-poppins">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Logged in as <strong>{user.firstName}</strong> (Customer). Please authenticate with administrator access.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-red-950 hover:bg-red-900 border border-red-900/30 text-white font-poppins font-bold py-3.5 text-xs tracking-widest uppercase rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Secure Authorization
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Calculable Admin Dashboard Metrics
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending');
  const lowStockSarees = sarees.filter(s => s.stock <= 5);

  const sidebarMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'sarees', label: 'Saree Manager', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'orders', label: 'Order Manager', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'shipping', label: 'Shipping Rules', icon: <Truck className="w-4 h-4" /> }
  ];

  // Helper to trigger Saree editing
  const openEditSaree = (saree) => {
    setEditingSareeId(saree.id);
    setSareeName(saree.name);
    setSareePrice(saree.price);
    setSareeOfferPrice(saree.offerPrice || '');
    setSareeCategory(saree.category);
    setSareeStock(saree.stock);
    setSareeColor(saree.color);
    setSareeFabric(saree.fabric);
    setSareeDescription(saree.description || '');
    setSareeImages(saree.images || []);
    setSareeStatus(saree.status);
    setSareeFeatured(saree.featured || false);
    setSareeSeoTitle(saree.seoTitle || '');
    setSareeSeoDescription(saree.seoDescription || '');
    setSareeFormOpen(true);
  };

  const handleSareeSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: sareeName,
      price: Number(sareePrice),
      offerPrice: sareeOfferPrice ? Number(sareeOfferPrice) : undefined,
      category: sareeCategory,
      stock: Number(sareeStock),
      color: sareeColor,
      fabric: sareeFabric,
      description: sareeDescription,
      images: sareeImages.filter(Boolean),
      status: sareeStatus,
      featured: sareeFeatured,
      seoTitle: sareeSeoTitle,
      seoDescription: sareeSeoDescription
    };

    if (editingSareeId) {
      const result = await dispatch(updateSareeAdmin({ id: editingSareeId, sareeData: payload }));
      if (updateSareeAdmin.fulfilled.match(result)) {
        addToast('Saree updated successfully!', 'success');
        dispatch(fetchSarees({ limit: 100, adminView: 'true' }));
        closeSareeForm();
      }
    } else {
      const result = await dispatch(addSareeAdmin(payload));
      if (addSareeAdmin.fulfilled.match(result)) {
        addToast('New Saree added successfully!', 'success');
        dispatch(fetchSarees({ limit: 100, adminView: 'true' }));
        closeSareeForm();
      }
    }
  };

  const handleDuplicateSaree = async (id) => {
    const result = await dispatch(duplicateSareeAdmin(id));
    if (duplicateSareeAdmin.fulfilled.match(result)) {
      addToast('Product duplicated successfully!', 'success');
      dispatch(fetchSarees({ limit: 100, adminView: 'true' }));
    } else {
      addToast('Duplication failed.', 'error');
    }
  };

  const handleDeleteSaree = async (id) => {
    if (window.confirm('Delete this product permanently?')) {
      const result = await dispatch(deleteSareeAdmin(id));
      if (deleteSareeAdmin.fulfilled.match(result)) {
        addToast('Product deleted', 'info');
        dispatch(fetchSarees({ limit: 100, adminView: 'true' }));
      }
    }
  };

  const closeSareeForm = () => {
    setSareeFormOpen(false);
    setEditingSareeId(null);
    setSareeName('');
    setSareePrice('');
    setSareeOfferPrice('');
    setSareeCategory('');
    setSareeStock('');
    setSareeColor('');
    setSareeFabric('');
    setSareeDescription('');
    setSareeImages([]);
    setSareeStatus('Active');
    setSareeFeatured(false);
    setSareeSeoTitle('');
    setSareeSeoDescription('');
  };

  // Category controllers
  const openEditCat = (cat) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatImage1(cat.image1);
    setCatImage2(cat.image2 || '');
    setCatOrder(String(cat.displayOrder));
    setCatStatus(cat.status);
    setCatFormOpen(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: catName,
      image1: catImage1,
      image2: catImage2 || catImage1,
      displayOrder: Number(catOrder),
      status: catStatus
    };

    if (editingCatId) {
      const result = await dispatch(updateCategoryAdmin({ id: editingCatId, catData: payload }));
      if (updateCategoryAdmin.fulfilled.match(result)) {
        addToast('Category updated!', 'success');
        dispatch(fetchCategories());
        closeCatForm();
      }
    } else {
      const result = await dispatch(addCategoryAdmin(payload));
      if (addCategoryAdmin.fulfilled.match(result)) {
        addToast('Category created!', 'success');
        dispatch(fetchCategories());
        closeCatForm();
      }
    }
  };

  const handleDeleteCat = async (id) => {
    if (window.confirm('Delete this category?')) {
      const result = await dispatch(deleteCategoryAdmin(id));
      if (deleteCategoryAdmin.fulfilled.match(result)) {
        addToast('Category removed', 'info');
        dispatch(fetchCategories());
      }
    }
  };

  const closeCatForm = () => {
    setCatFormOpen(false);
    setEditingCatId(null);
    setCatName('');
    setCatImage1('');
    setCatImage2('');
    setCatOrder('1');
    setCatStatus('Active');
  };

  // Settings Save
  const handleSaveShippingSettings = async () => {
    const payload = {
      ...settings,
      shipping: {
        freeShippingDistrict: freeDistrictInput,
        defaultShippingCharge: Number(shippingFeeInput),
        estimatedDeliveryDays: settings?.shipping?.estimatedDeliveryDays || "3-5 Days"
      }
    };
    const result = await dispatch(updateAdminSettings(payload));
    if (updateAdminSettings.fulfilled.match(result)) {
      addToast('Shipping Rules updated successfully!', 'success');
    }
  };

  return (
    <div className="flex min-h-screen bg-sand-100/50 pt-20">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-emerald-900 text-white flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-gold-500/20">
        <div className="p-6 space-y-8">
          <div className="flex flex-col select-none text-left">
            <span className="font-playfair text-xl font-bold tracking-[0.2em] text-white uppercase">Admin</span>
            <span className="font-montserrat text-[9px] tracking-[0.4em] text-gold-500 font-medium uppercase mt-0.5">Control Panel</span>
          </div>

          <nav className="flex flex-col gap-2">
            {sidebarMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                  activeTab === item.id
                    ? 'bg-gold-500 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gold-500/10 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-gold-500/10">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-wine-accent hover:bg-wine-accent/10 rounded-lg font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl mx-auto">
        
        {/* ========================================================
            DASHBOARD TAB PANEL
           ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="text-left">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-emerald-950">Boutique Metrics</h2>
              <p className="text-xs text-gold-600 font-montserrat tracking-widest mt-1 uppercase">Welcome back, Administrator</p>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl border border-gold-500/15 shadow-sm text-left">
                <span className="text-[9px] font-bold text-gold-600 uppercase tracking-widest block">Total Revenue</span>
                <span className="font-montserrat text-xl sm:text-2xl font-bold text-emerald-950 mt-1 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +15.4% from last month
                </span>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-gold-500/15 shadow-sm text-left">
                <span className="text-[9px] font-bold text-gold-600 uppercase tracking-widest block">Saree Weaves</span>
                <span className="font-montserrat text-xl sm:text-2xl font-bold text-emerald-950 mt-1 block">{sarees.length} items</span>
                <span className="text-[10px] text-gray-400 font-semibold mt-1.5 block">Across {categories.length} categories</span>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-gold-500/15 shadow-sm text-left">
                <span className="text-[9px] font-bold text-gold-600 uppercase tracking-widest block">Total Orders</span>
                <span className="font-montserrat text-xl sm:text-2xl font-bold text-emerald-950 mt-1 block">{orders.length} orders</span>
                <span className="text-[10px] text-wine-accent font-bold mt-1.5 block">{pendingOrders.length} pending shipping</span>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-gold-500/15 shadow-sm text-left">
                <span className="text-[9px] font-bold text-gold-600 uppercase tracking-widest block">Boutique Patrons</span>
                <span className="font-montserrat text-xl sm:text-2xl font-bold text-emerald-950 mt-1 block">{customers.length} patrons</span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1.5 block">Active registrants</span>
              </div>
            </div>

            {/* SVG Visual Sales Chart & Low stock alerts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Sales analytics chart */}
              <div className="lg:col-span-8 bg-white border border-gold-500/10 rounded-2xl p-6 text-left space-y-4 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5 text-gold-500" /> Sales Progress Chart (Monthly)
                </h3>
                {/* SVG Premium bar graph visualization */}
                <div className="w-full h-64 flex items-end justify-between pt-6 px-4">
                  {[
                    { month: 'Jan', val: 40 },
                    { month: 'Feb', val: 55 },
                    { month: 'Mar', val: 75 },
                    { month: 'Apr', val: 60 },
                    { month: 'May', val: 90 },
                    { month: 'Jun', val: 110 },
                    { month: 'Jul', val: 130 }
                  ].map((data, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 group w-full">
                      <div className="relative w-7 sm:w-10 bg-emerald-900/10 rounded-t-lg h-44 flex items-end justify-center">
                        <div
                          className="w-full bg-gradient-to-t from-emerald-900 to-gold-500 rounded-t-lg transition-all duration-1000 group-hover:from-gold-500 group-hover:to-gold-600"
                          style={{ height: `${(data.val / 150) * 100}%` }}
                        />
                        <span className="absolute -top-6 text-[10px] font-bold text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity">₹{data.val}k</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Warning Box */}
              <div className="lg:col-span-4 bg-white border border-gold-500/10 rounded-2xl p-6 text-left space-y-4 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5 text-wine-accent" /> Stock Level Warnings
                </h3>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {lowStockSarees.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-medium">All saree inventory levels are healthy.</p>
                  ) : (
                    lowStockSarees.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2.5 bg-wine-accent/5 rounded-xl border border-wine-accent/15">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-emerald-950 truncate">{item.name}</p>
                          <span className="text-[9px] text-gray-400 block font-mono">CODE: {item.code}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.stock === 0 ? 'bg-wine-accent text-white' : 'bg-amber-500 text-emerald-950'}`}>
                          {item.stock === 0 ? 'SOLD OUT' : `${item.stock} left`}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            SAREE MANAGEMENT TAB PANEL
           ======================================================== */}
        {activeTab === 'sarees' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-emerald-950">Saree Weave Catalog</h2>
                <p className="text-xs text-gold-600 font-montserrat tracking-widest mt-1 uppercase">CRUD controls for items</p>
              </div>
              <button
                onClick={() => setSareeFormOpen(true)}
                className="bg-emerald-900 hover:bg-gold-500 text-white font-montserrat font-bold text-xs py-3 px-6 rounded-lg uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Saree
              </button>
            </div>

            {/* Saree editor modal popup */}
            {sareeFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSareeForm} />
                <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-luxury overflow-hidden border border-gold-500/20 max-h-[90vh] flex flex-col z-10 text-left">
                  
                  <div className="bg-emerald-900 p-5 text-white flex justify-between items-center">
                    <h3 className="font-playfair text-lg font-bold">{editingSareeId ? 'Edit Product Details' : 'Add New Saree to Shop'}</h3>
                    <button onClick={closeSareeForm} className="p-1 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleSareeSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Product Name</label>
                        <input type="text" value={sareeName} onChange={(e) => setSareeName(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none focus:border-gold-500 font-medium" required />
                      </div>
                      
                      {/* Category */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Category</label>
                        <select value={sareeCategory} onChange={(e) => setSareeCategory(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none focus:border-gold-500 font-semibold" required>
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>

                      {/* Price */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Original Price (₹)</label>
                        <input type="number" value={sareePrice} onChange={(e) => setSareePrice(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-medium" required />
                      </div>

                      {/* Offer Price */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Offer Price (₹, optional)</label>
                        <input type="number" value={sareeOfferPrice} onChange={(e) => setSareeOfferPrice(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-medium" />
                      </div>

                      {/* Stock */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Stock quantity</label>
                        <input type="number" value={sareeStock} onChange={(e) => setSareeStock(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-medium" required />
                      </div>

                      {/* Color */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Color Theme</label>
                        <input type="text" value={sareeColor} onChange={(e) => setSareeColor(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-medium" placeholder="e.g. Royal Blue" required />
                      </div>

                      {/* Fabric */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Weave Fabric Type</label>
                        <input type="text" value={sareeFabric} onChange={(e) => setSareeFabric(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-medium" placeholder="e.g. Pure Silk" required />
                      </div>

                      {/* Status */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Availability Status</label>
                        <select value={sareeStatus} onChange={(e) => setSareeStatus(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-semibold">
                          <option value="Active">Active (Visible)</option>
                          <option value="Inactive">Inactive (Hidden)</option>
                        </select>
                      </div>

                      {/* Images */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block font-montserrat font-semibold">Product Images (Drag & Drop or Click to Browse)</label>
                        <ImageUpload 
                          images={sareeImages}
                          setImages={setSareeImages}
                          productName={sareeName}
                          token={token}
                          addToast={addToast}
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Product Description</label>
                        <textarea rows="2" value={sareeDescription} onChange={(e) => setSareeDescription(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-medium" required />
                      </div>

                      {/* SEO Title */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">SEO Title Tag</label>
                        <input type="text" value={sareeSeoTitle} onChange={(e) => setSareeSeoTitle(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-medium" />
                      </div>

                      {/* SEO Description */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">SEO Meta Description</label>
                        <input type="text" value={sareeSeoDescription} onChange={(e) => setSareeSeoDescription(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-medium" />
                      </div>

                      <div className="md:col-span-2 flex items-center gap-2">
                        <input type="checkbox" checked={sareeFeatured} onChange={(e) => setSareeFeatured(e.target.checked)} className="rounded border-gold-500/30 text-gold-500 focus:ring-gold-500" id="saree-feat" />
                        <label htmlFor="saree-feat" className="text-xs font-semibold text-emerald-950">Feature this product on homepage list</label>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-900 text-white font-montserrat font-bold py-3 text-xs tracking-wider uppercase rounded-lg hover:bg-gold-500 transition-colors">
                      {editingSareeId ? 'Update Product Record' : 'Create Product Record'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Saree list table */}
            <div className="bg-white border border-gold-500/10 rounded-2xl shadow-sm overflow-hidden text-left">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-sand-50 text-[10px] font-bold uppercase tracking-widest text-gold-600 border-b border-gold-500/10">
                    <tr>
                      <th className="px-5 py-4">Saree</th>
                      <th className="px-5 py-4">Code / SKU</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Price</th>
                      <th className="px-5 py-4">Stock</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/5 font-medium text-emerald-950">
                    {sarees.map((s) => (
                      <tr key={s.id} className="hover:bg-sand-50/50">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <img src={s.images[0]} alt={s.name} className="w-8 h-10 object-cover rounded bg-sand-50 border border-gold-500/5" />
                          <div className="min-w-0">
                            <p className="font-semibold truncate max-w-[200px]">{s.name}</p>
                            <span className="text-[9px] text-gray-400 block">{s.fabric} | {s.color}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono">{s.code}<br/><span className="text-[9px] text-gray-400">{s.sku}</span></td>
                        <td className="px-5 py-3.5 text-gray-500">{s.category}</td>
                        <td className="px-5 py-3.5 font-montserrat">
                          ₹{(s.offerPrice || s.price).toLocaleString('en-IN')}
                          {s.offerPrice && <span className="text-[9px] text-gray-400 line-through block">₹{s.price}</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.stock === 0 ? 'bg-red-100 text-red-700' : s.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'text-emerald-700'}`}>
                            {s.stock} left
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex gap-2">
                            <button onClick={() => openEditSaree(s)} className="p-1.5 bg-gray-100 hover:bg-gold-500 hover:text-white rounded transition-colors text-gray-500" title="Edit Saree"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDuplicateSaree(s.id)} className="p-1.5 bg-gray-100 hover:bg-gold-500 hover:text-white rounded transition-colors text-gray-500" title="Duplicate Record"><Copy className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteSaree(s.id)} className="p-1.5 bg-red-50 hover:bg-wine-accent hover:text-white rounded transition-colors text-wine-accent" title="Delete Record"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            CATEGORY MANAGEMENT TAB PANEL
           ======================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-left">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-emerald-950">Shop Categories</h2>
                <p className="text-xs text-gold-600 font-montserrat tracking-widest mt-1 uppercase">Categories catalog listing</p>
              </div>
              <button
                onClick={() => setCatFormOpen(true)}
                className="bg-emerald-900 hover:bg-gold-500 text-white font-montserrat font-bold text-xs py-3 px-6 rounded-lg uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            {/* Category Form modal */}
            {catFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCatForm} />
                <div className="relative w-full max-w-md bg-white rounded-2xl shadow-luxury overflow-hidden border border-gold-500/20 max-h-[90vh] flex flex-col z-10 text-left">
                  <div className="bg-emerald-900 p-5 text-white flex justify-between items-center">
                    <h3 className="font-playfair text-lg font-bold">{editingCatId ? 'Edit Category' : 'Create New Saree Category'}</h3>
                    <button onClick={closeCatForm} className="p-1 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleCatSubmit} className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Category Name</label>
                        <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-semibold text-emerald-950" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Primary Image URL</label>
                        <input type="text" value={catImage1} onChange={(e) => setCatImage1(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-medium" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Secondary Image URL (Fade view)</label>
                        <input type="text" value={catImage2} onChange={(e) => setCatImage2(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-medium" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">Display Order</label>
                          <input type="number" value={catOrder} onChange={(e) => setCatOrder(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-semibold text-emerald-950" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">Status</label>
                          <select value={catStatus} onChange={(e) => setCatStatus(e.target.value)} className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-semibold text-emerald-950">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-900 text-white font-montserrat font-bold py-3 text-xs tracking-wider uppercase rounded-lg hover:bg-gold-500 transition-colors">
                      {editingCatId ? 'Update Category' : 'Create Category'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Categories list table */}
            <div className="bg-white border border-gold-500/10 rounded-2xl shadow-sm overflow-hidden text-left">
              <table className="w-full text-xs">
                <thead className="bg-sand-50 text-[10px] font-bold uppercase tracking-widest text-gold-600 border-b border-gold-500/10">
                  <tr>
                    <th className="px-5 py-4">Display Order</th>
                    <th className="px-5 py-4">Category Name</th>
                    <th className="px-5 py-4">Active Sarees Count</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/5 font-medium text-emerald-950">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-sand-50/50">
                      <td className="px-5 py-3.5 font-bold text-gold-600 font-montserrat">{c.displayOrder}</td>
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <img src={c.image1} alt={c.name} className="w-8 h-8 object-cover rounded border border-gold-500/5 bg-sand-50" />
                        <span className="font-semibold">{c.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{c.productCount || 0} Products</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex gap-2">
                          <button onClick={() => openEditCat(c)} className="p-1.5 bg-gray-100 hover:bg-gold-500 hover:text-white rounded transition-colors text-gray-505" title="Edit Category"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteCat(c.id)} className="p-1.5 bg-red-50 hover:bg-wine-accent hover:text-white rounded transition-colors text-wine-accent" title="Delete Category"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            ORDER STATUS MANAGEMENT TAB PANEL
           ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="text-left">
              <h2 className="font-playfair text-2xl font-bold text-emerald-950">Customer Orders</h2>
              <p className="text-xs text-gold-600 font-montserrat tracking-widest mt-1 uppercase">Track payments and manage shipping stages</p>
            </div>

            {/* Orders list table */}
            <div className="bg-white border border-gold-500/10 rounded-2xl shadow-sm overflow-hidden text-left">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-sand-50 text-[10px] font-bold uppercase tracking-widest text-gold-600 border-b border-gold-500/10">
                    <tr>
                      <th className="px-5 py-4">Order ID</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">District</th>
                      <th className="px-5 py-4">Total Price</th>
                      <th className="px-5 py-4">Order Status</th>
                      <th className="px-5 py-4 text-center">Adjust Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/5 font-medium text-emerald-950">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-sand-50/50">
                        <td className="px-5 py-3.5 font-bold font-mono text-emerald-900">{o.id}</td>
                        <td className="px-5 py-3.5 text-gray-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold">{o.customerName}</p>
                          <span className="text-[9px] text-gray-400 block">{o.email}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{o.shippingAddress.district}</td>
                        <td className="px-5 py-3.5 font-montserrat font-bold">₹{o.total.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            o.orderStatus === 'Delivered' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                            o.orderStatus === 'Shipped' ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' :
                            o.orderStatus === 'Processing' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                            o.orderStatus === 'Cancelled' ? 'bg-red-500/10 text-red-700 border-red-500/20' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <select
                            value={o.orderStatus}
                            onChange={async (e) => {
                              const result = await dispatch(updateOrderStatus({ id: o.id, status: e.target.value }));
                              if (updateOrderStatus.fulfilled.match(result)) {
                                addToast(`Order ${o.id} updated to ${e.target.value}!`, 'success');
                                dispatch(fetchAdminOrders());
                              }
                            }}
                            className="bg-sand-50 border border-gold-500/20 rounded px-2 py-1 text-[11px] font-semibold focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            CUSTOMER DETAILS TAB PANEL
           ======================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="text-left">
              <h2 className="font-playfair text-2xl font-bold text-emerald-950">Boutique Shoppers</h2>
              <p className="text-xs text-gold-600 font-montserrat tracking-widest mt-1 uppercase">Track registrant histories and addresses</p>
            </div>

            {/* Customers list table */}
            <div className="bg-white border border-gold-500/10 rounded-2xl shadow-sm overflow-hidden text-left">
              <table className="w-full text-xs">
                <thead className="bg-sand-50 text-[10px] font-bold uppercase tracking-widest text-gold-600 border-b border-gold-500/10">
                  <tr>
                    <th className="px-5 py-4">Customer Name</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Wishlist Items Count</th>
                    <th className="px-5 py-4 text-center">Addresses details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/5 font-medium text-emerald-950">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-sand-50/50">
                      <td className="px-5 py-3.5 font-semibold">{c.firstName} {c.lastName}</td>
                      <td className="px-5 py-3.5 text-gray-500">{c.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${c.role === 'admin' ? 'bg-gold-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        ❤ {c.wishlist?.length || 0} products favorited
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => setViewingCustomer(c)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gold-500 hover:text-white rounded text-[10px] font-bold transition-all"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Customer detail view modal */}
            {viewingCustomer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingCustomer(null)} />
                <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-luxury overflow-hidden border border-gold-500/20 max-h-[80vh] flex flex-col z-10 text-left">
                  <div className="bg-emerald-900 p-5 text-white flex justify-between items-center">
                    <h3 className="font-playfair text-lg font-bold">Customer Profile Details</h3>
                    <button onClick={() => setViewingCustomer(null)} className="p-1 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-5 text-xs font-montserrat">
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gold-500/10">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Shopper Name</span>
                        <span className="text-emerald-950 font-bold text-sm">{viewingCustomer.firstName} {viewingCustomer.lastName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Email Address</span>
                        <span className="text-emerald-950 font-semibold">{viewingCustomer.email}</span>
                      </div>
                    </div>

                    {/* Address lists */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Saved Delivery Addresses</p>
                      {(!viewingCustomer.addresses || viewingCustomer.addresses.length === 0) ? (
                        <p className="text-gray-400">No addresses registered.</p>
                      ) : (
                        viewingCustomer.addresses.map((addr) => (
                          <div key={addr.id} className="p-3 bg-sand-50 border border-gold-500/10 rounded-xl space-y-1">
                            <p className="font-bold text-emerald-950">{viewingCustomer.firstName} {viewingCustomer.lastName} {addr.isDefault && <span className="text-[9px] bg-gold-500 text-white font-bold px-1.5 py-0.5 rounded ml-2 uppercase">Default</span>}</p>
                            <p className="text-emerald-900/80">{addr.street}</p>
                            <p className="text-emerald-900/80">{addr.district}, Tamil Nadu - {addr.pincode}</p>
                            <p className="font-mono text-emerald-950 pt-1 font-semibold">PH: {addr.phone}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Login histories */}
                    <div className="space-y-2 pt-2 border-t border-gold-500/10">
                      <p className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Boutique Login History</p>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                        {(!viewingCustomer.loginHistory || viewingCustomer.loginHistory.length === 0) ? (
                          <p className="text-gray-400">No login history recorded.</p>
                        ) : (
                          viewingCustomer.loginHistory.map((lh, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-[10px] font-semibold text-gray-500">
                              <span>{new Date(lh.date).toLocaleString('en-IN')}</span>
                              <span className="font-mono">{lh.ip}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SHIPPING MANAGEMENT TAB PANEL
           ======================================================== */}
        {activeTab === 'shipping' && (
          <div className="space-y-6 max-w-xl text-left">
            <div>
              <h2 className="font-playfair text-2xl font-bold text-emerald-950">Shipping charges Rules</h2>
              <p className="text-xs text-gold-600 font-montserrat tracking-widest mt-1 uppercase">Configure delivery rates and local free zones</p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-gold-500/10 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block font-montserrat">Free Shipping District Zone</label>
                <input
                  type="text"
                  value={freeDistrictInput}
                  onChange={(e) => setFreeDistrictInput(e.target.value)}
                  className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-semibold text-emerald-950"
                  placeholder="e.g. Erode"
                />
                <span className="text-[10px] text-gray-400 font-medium block">Purchases mapping to this district will receive ₹0 shipping fee automatically on checkout.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block font-montserrat">Standard Shipping Charge (₹)</label>
                <input
                  type="number"
                  value={shippingFeeInput}
                  onChange={(e) => setShippingFeeInput(e.target.value)}
                  className="w-full bg-sand-50 border border-gold-500/20 rounded-lg p-2.5 text-xs focus:outline-none font-semibold text-emerald-950"
                  placeholder="120"
                />
                <span className="text-[10px] text-gray-400 font-medium block">Flat fee applied to delivery addresses outside the designated free district.</span>
              </div>

              <button
                onClick={handleSaveShippingSettings}
                className="w-full bg-emerald-900 hover:bg-gold-500 text-white font-montserrat font-bold py-3 text-xs tracking-wider uppercase rounded-lg transition-colors"
              >
                Save Shipping Configurations
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
