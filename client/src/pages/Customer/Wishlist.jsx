import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  fetchWishlist, 
  toggleWishlist, 
  moveToCart, 
  clearWishlist,
  populateGuestItems 
} from '../../store/wishlistSlice.js';
import { addToCart } from '../../store/cartSlice.js';
import { fetchSarees } from '../../store/productSlice.js';
import { useToast } from '../../context/ToastContext.jsx';
import { 
  Trash2, ShoppingBag, Eye, Heart, ArrowRight, Share2, 
  AlertCircle, Search, SlidersHorizontal, ChevronRight,
  TrendingUp, Sparkles, Calendar, Layers, Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickViewModal from '../../components/QuickViewModal.jsx';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const { populatedItems: wishlistProducts, items: wishlistIds, loading } = useSelector((state) => state.wishlist);
  const { token } = useSelector((state) => state.auth);
  const { sarees } = useSelector((state) => state.products);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedProductToRemove, setSelectedProductToRemove] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchSarees({ limit: 100 }));
    dispatch(fetchWishlist());
  }, [dispatch, token]);

  // Guest fallback
  useEffect(() => {
    if (!token && sarees.length > 0) {
      dispatch(populateGuestItems(sarees));
    }
  }, [dispatch, token, sarees, wishlistIds]);

  // Unique categories list
  const uniqueCategories = useMemo(() => {
    const cats = new Set(wishlistProducts.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [wishlistProducts]);

  // Filtered & Sorted list
  const processedProducts = useMemo(() => {
    let result = [...wishlistProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.offerPrice ?? a.price) - (b.offerPrice ?? b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.offerPrice ?? b.price) - (a.offerPrice ?? a.price));
    } else if (sortBy === 'alpha-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'alpha-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    return result;
  }, [wishlistProducts, searchQuery, selectedCategory, sortBy]);

  // Separate featured product (newest added) from other products
  const { featuredProduct, gridProducts } = useMemo(() => {
    if (processedProducts.length === 0) {
      return { featuredProduct: null, gridProducts: [] };
    }
    const featured = processedProducts[0];
    const rest = processedProducts.slice(1);
    return { featuredProduct: featured, gridProducts: rest };
  }, [processedProducts]);

  // Stats
  const metaStats = useMemo(() => {
    const count = wishlistProducts.length;
    const categoriesCount = new Set(wishlistProducts.map(p => p.category).filter(Boolean)).size;
    const lastAddedStr = count > 0 ? 'Today' : 'N/A';
    return { count, categoriesCount, lastAddedStr };
  }, [wishlistProducts]);

  // Moody lists
  const inspiredLooks = useMemo(() => {
    if (wishlistProducts.length > 0) {
      const wishlistCats = wishlistProducts.map(p => p.category);
      return sarees.filter(s => wishlistCats.includes(s.category) && !wishlistIds.includes(s.id)).slice(0, 8);
    }
    return sarees.filter(s => s.isFeatured).slice(0, 8);
  }, [sarees, wishlistProducts, wishlistIds]);

  const recommendedProducts = useMemo(() => {
    return sarees.filter(s => s.isFeatured && !wishlistIds.includes(s.id)).slice(0, 8);
  }, [sarees, wishlistIds]);

  const handleConfirmRemove = () => {
    if (!selectedProductToRemove) return;
    dispatch(toggleWishlist(selectedProductToRemove.id));
    addToast(`${selectedProductToRemove.name} removed from your portfolio`, 'info');
    setSelectedProductToRemove(null);
  };

  const handleMoveToBag = (product) => {
    if (product.stock === 0) {
      addToast('Product is out of stock.', 'error');
      return;
    }
    dispatch(moveToCart(product.id));
    dispatch(addToCart({ product, quantity: 1 }));
    addToast('Moved to shopping bag successfully.', 'success');
  };

  const handleShareWishlist = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Collection portfolio link copied!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 sm:py-24 text-left selection:bg-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold font-poppins uppercase tracking-[0.25em] text-[#A8A19A] mb-5">
          <Link to="/" className="hover:text-gray-950 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-950">Wishlist</span>
        </div>

        {/* Hero Portfolio Title */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-3"
          >
            <h1 className="font-playfair text-5xl sm:text-6xl font-black text-[#111111] tracking-tight leading-none">
              My Boutique <span className="italic font-normal text-red-900">Collection</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-poppins max-w-xl leading-relaxed">
              An immersive collection portfolio designed for browsing, styling, and checking out your saved saree favorites.
            </p>
          </motion.div>

          {/* Luxury Floating Info Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-4 w-full lg:w-auto"
          >
            <div className="flex-1 lg:flex-initial bg-white border border-[#EBE8E2] rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-900">
                <Heart className="w-4.5 h-4.5" fill="currentColor" />
              </div>
              <div>
                <p className="text-[9px] text-[#A69E96] font-bold uppercase tracking-wider">Total Items</p>
                <p className="text-sm font-bold text-[#111111] font-poppins">{metaStats.count} Saved</p>
              </div>
            </div>

            <div className="flex-1 lg:flex-initial bg-white border border-[#EBE8E2] rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-amber-800">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-[#A69E96] font-bold uppercase tracking-wider">Last Added</p>
                <p className="text-sm font-bold text-[#111111] font-poppins">{metaStats.lastAddedStr}</p>
              </div>
            </div>

            <div className="flex-1 lg:flex-initial bg-white border border-[#EBE8E2] rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center text-[#9E7C3F]">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[9px] text-[#A69E96] font-bold uppercase tracking-wider">Categories</p>
                <p className="text-sm font-bold text-[#111111] font-poppins">{metaStats.categoriesCount} Types</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Searching, Filtering, and Sorting Header Control Bar */}
        {wishlistProducts.length > 0 && (
          <div className="bg-white border border-[#EBE8E2] rounded-2xl p-4 mb-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Live Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search collection portfolio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-red-900/30 focus:border-red-900 font-poppins placeholder-[#A39D95] text-gray-950 outline-none transition-all"
              />
            </div>

            {/* Filter group */}
            <div className="flex flex-wrap w-full md:w-auto items-center justify-end gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl py-2.5 px-3.5 text-xs text-gray-800 font-poppins focus:ring-2 focus:ring-red-900/30 outline-none"
                >
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl py-2.5 px-3.5 text-xs text-gray-800 font-poppins focus:ring-2 focus:ring-red-900/30 outline-none"
              >
                <option value="latest">Latest Added</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="alpha-asc">A – Z</option>
                <option value="alpha-desc">Z – A</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={handleShareWishlist}
                  className="p-2.5 bg-[#FAF9F6] hover:bg-rose-50 text-gray-700 hover:text-red-900 border border-[#E5E2DA] rounded-xl transition-all shadow-sm"
                  title="Share Portfolio"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    dispatch(clearWishlist());
                    addToast('Boutique portfolio cleared', 'info');
                  }}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-900 hover:text-white border border-red-100 text-xs font-semibold rounded-xl transition-all duration-300 shadow-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Display */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-[#EBE8E2] p-4 space-y-4 animate-pulse">
                <div className="aspect-[3/4] bg-gray-105 rounded-2xl w-full" />
                <div className="h-4 bg-gray-105 rounded w-1/3" />
                <div className="h-4 bg-gray-105 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : processedProducts.length === 0 ? (
          
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-white border border-[#EBE8E2] rounded-[32px] p-8 shadow-sm mb-16"
          >
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative w-24 h-24 bg-rose-50/50 rounded-full flex items-center justify-center text-red-900 border border-rose-100"
            >
              <Heart className="w-10 h-10" fill="none" />
              <Sparkles className="absolute top-2 right-2 w-5 h-5 text-red-400 animate-spin-slow" />
            </motion.div>

            <div className="space-y-2">
              <h3 className="font-playfair text-2xl sm:text-3xl font-black text-gray-950 tracking-wide uppercase">
                Your Boutique Collection is Waiting
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed font-poppins">
                Save your favorite sarees and build your personal fashion collection.
              </p>
            </div>

            <Link
              to="/collection/all"
              className="inline-flex items-center gap-2 bg-red-900 hover:bg-red-950 text-white font-poppins font-bold text-xs tracking-wider uppercase py-3.5 px-8 rounded-xl shadow-md transition-all duration-300"
            >
              Browse Collections
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          
          <div className="mb-20">
            
            {/* 1. Asymmetrical Canvas Cluster (Featured Showcase) */}
            {featuredProduct && (
              <div className="border-t border-b border-[#EBE8E2] py-16 mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column: Asymmetrical Image Cluster */}
                  <div className="lg:col-span-7 relative flex justify-center items-center min-h-[420px]">
                    <div 
                      className="absolute w-72 h-72 rounded-full bg-red-900/10 blur-[64px] -z-10 translate-x-4 -translate-y-4"
                    />

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.7 }}
                      className="w-3/4 aspect-[4/5] rounded-[32px] overflow-hidden border-8 border-white/80 shadow-2xl z-10"
                    >
                      <Link to={`/product/${featuredProduct.id}`}>
                        <img 
                          src={featuredProduct.images?.[0] || '/placeholder.jpg'} 
                          alt={featuredProduct.name} 
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </Link>
                    </motion.div>

                    {featuredProduct.images?.[1] && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20, rotate: 3 }}
                        animate={{ opacity: 1, x: 0, rotate: 6 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="absolute right-0 bottom-4 w-1/3 aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white shadow-xl z-20 hidden sm:block"
                      >
                        <img 
                          src={featuredProduct.images[1]} 
                          alt="Detail closeup" 
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Right Column: Details & CTA */}
                  <div className="lg:col-span-5 space-y-6 text-left">
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-3.5 h-3.5 text-red-900" />
                      <span className="text-[10px] font-bold text-red-900 uppercase tracking-[0.3em] font-poppins block">
                        Featured Saree Look
                      </span>
                    </div>

                    <Link to={`/product/${featuredProduct.id}`} className="hover:text-red-900 transition-colors block">
                      <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] leading-tight">
                        {featuredProduct.name}
                      </h2>
                    </Link>
                    
                    {featuredProduct.code && (
                      <span className="inline-block text-[9px] font-bold text-gray-400 font-mono tracking-widest uppercase border-b border-[#EBE8E2] pb-1.5">
                        CODE: {featuredProduct.code}
                      </span>
                    )}

                    <p className="text-xs sm:text-sm text-gray-500 font-poppins leading-relaxed font-light">
                      {featuredProduct.description || 'A timeless boutique creation, woven with delicate silk structures, contrasting borders, and a beautiful heritage fall.'}
                    </p>

                    <div className="flex items-baseline gap-3 pt-2">
                      <span className="text-3xl font-bold text-[#111111] font-poppins">
                        ₹{(featuredProduct.offerPrice ?? featuredProduct.price).toLocaleString('en-IN')}
                      </span>
                      {featuredProduct.offerPrice !== undefined && (
                        <span className="text-sm text-gray-400 line-through font-poppins">
                          ₹{featuredProduct.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 w-full">
                      {featuredProduct.stock > 0 ? (
                        <button
                          onClick={() => handleMoveToBag(featuredProduct)}
                          className="flex-1 bg-red-900 hover:bg-[#5E1914] text-white font-poppins font-bold text-xs py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/10 active:scale-[0.98]"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Move To Bag
                        </button>
                      ) : (
                        <div className="flex-1 text-center py-3.5 border border-red-100 text-red-500 bg-red-50/50 font-poppins font-bold text-xs rounded-xl uppercase">
                          Out of Stock
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setQuickViewProduct(featuredProduct)}
                          className="p-3.5 bg-white hover:bg-gray-50 border border-[#EBE8E2] text-gray-700 rounded-xl transition-all shadow-sm"
                          title="Quick View"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => setSelectedProductToRemove(featuredProduct)}
                          className="p-3.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 rounded-xl transition-all shadow-sm"
                          title="Remove"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* 2. Equal Height & Width Symmetrical Gallery Grid */}
            {gridProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {gridProducts.map((product) => {
                  const isSoldOut = product.stock === 0;
                  const currentPrice = product.offerPrice !== undefined ? product.offerPrice : product.price;
                  const discount = product.offerPrice 
                    ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
                    : 0;

                  return (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-[24px] overflow-hidden border border-[#EBE8E2] shadow-sm hover:shadow-md transition-all duration-500 relative group aspect-[3/4]"
                    >
                      {/* Image Block (Covering entire background) */}
                      <div className="w-full h-full relative overflow-hidden bg-gray-50">
                        <Link to={`/product/${product.id}`}>
                          <img 
                            src={product.images?.[0] || '/placeholder.jpg'} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-102 cursor-pointer" 
                          />
                        </Link>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

                        {/* Top Left Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-1 items-start">
                          {discount > 0 && !isSoldOut && (
                            <span className="bg-gradient-to-r from-[#5E0B1B] via-[#8A1A2F] to-[#5E0B1B] text-white text-[8px] font-bold tracking-[0.2em] px-2.5 py-1 rounded-md border border-[#D4AF37]/20 shadow-inner uppercase">
                              On Sale
                            </span>
                          )}
                          {isSoldOut && (
                            <span className="bg-gray-950/95 text-white text-[8px] font-bold tracking-[0.15em] px-2.5 py-1 rounded-md uppercase">
                              Sold Out
                            </span>
                          )}
                        </div>

                        {/* Frosted Glass Information Overlay (Identical heights and text layout) */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/95 backdrop-blur-md border-t border-gray-100 flex flex-col justify-between text-left h-24 group-hover:translate-y-4 group-hover:opacity-0 transition-all duration-300">
                          <div>
                            <span className="text-[8px] font-bold text-red-900 uppercase tracking-[0.25em] font-poppins block">
                              {product.category}
                            </span>
                            <Link to={`/product/${product.id}`} className="hover:text-red-900 transition-colors">
                              <h4 className="text-xs font-bold text-gray-950 line-clamp-1 font-poppins mt-0.5">
                                {product.name}
                              </h4>
                            </Link>
                          </div>
                          <div className="flex justify-between items-center mt-1.5">
                            <span className="text-xs font-bold text-gray-950 font-poppins">
                              ₹{currentPrice.toLocaleString('en-IN')}
                            </span>
                            <span className={`text-[8px] font-extrabold uppercase ${isSoldOut ? 'text-red-500' : 'text-emerald-600'}`}>
                              {isSoldOut ? 'Out of stock' : 'In stock'}
                            </span>
                          </div>
                        </div>

                        {/* Action panel sliding up on hover */}
                        <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 bg-black/45 backdrop-blur-sm opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                          <Link to={`/product/${product.id}`} className="hover:underline text-white">
                            <h4 className="text-xs font-bold text-white px-5 text-center line-clamp-2 font-poppins">
                              {product.name}
                            </h4>
                          </Link>
                          <span className="text-sm font-bold text-white font-poppins">
                            ₹{currentPrice.toLocaleString('en-IN')}
                          </span>

                          <div className="flex gap-2.5 mt-1.5">
                            {!isSoldOut && (
                              <button
                                onClick={() => handleMoveToBag(product)}
                                className="p-3 bg-white text-red-900 hover:bg-red-950 hover:text-white rounded-xl shadow-md transition-all"
                                title="Move to bag"
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setQuickViewProduct(product)}
                              className="p-3 bg-white text-gray-800 hover:bg-gray-150 rounded-xl shadow-md transition-all"
                              title="Quick View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedProductToRemove(product)}
                              className="p-3 bg-red-500 text-white hover:bg-red-600 rounded-xl shadow-md transition-all"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* Parallax Banner */}
        <div className="relative rounded-[32px] overflow-hidden my-20 bg-gray-950 text-white py-20 px-8 sm:px-16 text-center shadow-lg group border border-[#D4AF37]/15">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600')] bg-cover bg-center opacity-30 group-hover:scale-102 transition-transform duration-[1200ms]" />
          
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <span className="text-[9px] font-bold text-[#E5D5B8] uppercase tracking-[0.4em] font-poppins block">Discover New Arrivals</span>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">Explore our newest handpicked saree collections.</h2>
            <div className="w-12 h-0.5 bg-[#D4AF37]/40 mx-auto my-4" />
            <p className="text-xs text-gray-300 font-poppins font-light leading-relaxed">
              Timeless designs woven with pure threadwork and contemporary boutique colors.
            </p>
            <div className="pt-4">
              <Link 
                to="/collection/all"
                className="inline-flex items-center gap-2 bg-red-900 hover:bg-red-950 text-white text-xs font-bold uppercase tracking-wider py-3 px-8 rounded-xl shadow-md transition-all"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Inspired Looks Slider */}
        {inspiredLooks.length > 0 && (
          <div className="border-t border-[#EBE8E2] pt-16 mb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-playfair text-2xl sm:text-3xl font-black text-[#111111] tracking-tight uppercase">Inspired Looks</h2>
                <p className="text-xs text-gray-400 font-poppins mt-1">Saree pairings inspired by your wishlist favorites.</p>
              </div>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-4 scroll-snap-x scroll-smooth snap-mandatory scrollbar-thin scrollbar-thumb-gray-250">
              {inspiredLooks.map(item => {
                const currentPrice = item.offerPrice !== undefined ? item.offerPrice : item.price;
                return (
                  <motion.div 
                    whileHover={{ y: -3 }}
                    key={item.id} 
                    className="w-56 bg-white border border-[#EBE8E2] rounded-3xl p-4 flex-shrink-0 snap-start shadow-sm"
                  >
                    <Link to={`/product/${item.id}`}>
                      <img src={item.images?.[0]} alt={item.name} className="w-full aspect-[3/4] object-cover rounded-2xl mb-3.5 shadow-sm" />
                      <span className="text-[8px] font-bold text-red-900 tracking-widest uppercase block">{item.category}</span>
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-1 font-poppins mt-1">{item.name}</h4>
                      <p className="text-xs font-bold text-gray-900 mt-1 font-poppins">₹{currentPrice.toLocaleString('en-IN')}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* You May Also Love Slider */}
        {recommendedProducts.length > 0 && (
          <div className="border-t border-[#EBE8E2] pt-16">
            <h2 className="font-playfair text-2xl sm:text-3xl font-black text-[#111111] tracking-tight uppercase mb-8">You May Also Love</h2>
            
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-250">
              {recommendedProducts.map(item => {
                const currentPrice = item.offerPrice !== undefined ? item.offerPrice : item.price;
                return (
                  <motion.div 
                    whileHover={{ y: -3 }}
                    key={item.id} 
                    className="w-56 bg-white border border-[#EBE8E2] rounded-3xl p-4 flex-shrink-0 shadow-sm"
                  >
                    <Link to={`/product/${item.id}`}>
                      <img src={item.images?.[0]} alt={item.name} className="w-full aspect-[3/4] object-cover rounded-2xl mb-3.5 shadow-sm" />
                      <span className="text-[8px] font-bold text-red-900 tracking-widest uppercase block">{item.category}</span>
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-1 font-poppins mt-1">{item.name}</h4>
                      <p className="text-xs font-bold text-gray-900 mt-1 font-poppins">₹{currentPrice.toLocaleString('en-IN')}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedProductToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductToRemove(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white border border-[#EBE8E2] rounded-[24px] p-6 shadow-xl max-w-sm w-full relative z-10 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-poppins font-bold text-gray-900 text-sm">Remove from Wishlist?</h3>
                <p className="text-xs text-gray-400 font-poppins leading-relaxed">
                  Are you sure you want to remove <span className="font-semibold text-gray-700">"{selectedProductToRemove.name}"</span> from your wishlist?
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedProductToRemove(null)}
                  className="flex-1 py-2.5 bg-[#FAF9F6] hover:bg-gray-150 border border-[#EBE8E2] text-xs font-semibold text-gray-700 rounded-xl transition-colors font-poppins"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRemove}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-800 text-white text-xs font-semibold rounded-xl transition-colors font-poppins shadow-sm"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick View Modal Overlay */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

    </div>
  );
}
