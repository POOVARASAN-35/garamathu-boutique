import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSareeById, fetchSarees } from '../../store/productSlice.js';
import { addToCart } from '../../store/cartSlice.js';
import { toggleWishlist, syncWishlistOnServer } from '../../store/wishlistSlice.js';
import { useToast } from '../../context/ToastContext.jsx';
import { 
  Heart, ShoppingBag, Percent, Check, AlertTriangle, Eye, 
  Flame, Share2, ChevronRight, Sparkles, Star, Truck, Info, 
  MapPin, ShieldCheck, RefreshCw, X, ArrowLeft, ArrowRight, 
  ChevronLeft, Plus, Minus, CreditCard, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../../components/ProductCard.jsx';

export default function ProductDetails({ onQuickView }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { currentSaree, sarees, loading } = useSelector((state) => state.products);
  const wishlist = useSelector((state) => state.wishlist.items);
  const token = useSelector((state) => state.auth.token);
  const isWishlisted = currentSaree ? wishlist.includes(currentSaree.id) : false;

  // Active UI States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showShareModal, setShowShareModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Delivery Checker State
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [shippingRules, setShippingRules] = useState([]);
  const [countdownText, setCountdownText] = useState('00h : 00m');

  // Buy Now Flow States
  const [buyNowOpen, setBuyNowOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleOpenBuyNow = () => {
    if (!token) {
      addToast('Please login or register to complete purchase.', 'warning');
      return;
    }
    setBuyNowOpen(false);
    setPlacedOrder(null);
    setCheckoutStep(1);
    setBuyNowOpen(true);
  };

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    pincode: '',
    state: 'Tamil Nadu'
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  // Local recently viewed items
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Magnifier Zoom position coordinates
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  // Load product detail & related items
  useEffect(() => {
    dispatch(fetchSareeById(id));
  }, [id, dispatch]);

  // Load shipping rules and setup countdown timer
  useEffect(() => {
    const fetchRules = async () => {
      try {
       const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/shipping-rules`
      );
        if (res.ok) {
          const data = await res.json();
          setShippingRules(data);
        }
      } catch (err) {
        console.error('Error fetching shipping rules:', err);
      }
    };
    fetchRules();

    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(24, 0, 0, 0); // next midnight
      const diff = target - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setCountdownText(`${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentSaree) {
      dispatch(fetchSarees({ category: currentSaree.category, limit: 4 }));
      setActiveImageIndex(0);
      setQuantity(1);

      // Track recently viewed in LocalStorage
      try {
        const viewed = JSON.parse(localStorage.getItem('gb_recently_viewed') || '[]');
        const updated = [currentSaree.id, ...viewed.filter(i => i !== currentSaree.id)].slice(0, 5);
        localStorage.setItem('gb_recently_viewed', JSON.stringify(updated));
      } catch (e) {}
    }
  }, [currentSaree, dispatch]);

  // Load recently viewed details
  useEffect(() => {
    try {
      const viewedIds = JSON.parse(localStorage.getItem('gb_recently_viewed') || '[]');
      if (viewedIds.length > 0 && sarees.length > 0) {
        const filtered = viewedIds
          .map(idVal => sarees.find(s => s.id === idVal))
          .filter(Boolean)
          .filter(s => s.id !== id);
        setRecentlyViewed(filtered);
      }
    } catch (e) {}
  }, [sarees, id]);

  if (loading || !currentSaree) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <span className="w-10 h-10 border-4 border-indigo-500/30 border-t-[#6366F1] rounded-full animate-spin inline-block" />
        <p className="text-xs text-gray-500 mt-3 font-poppins">Loading boutique item details...</p>
      </div>
    );
  }

  const isSoldOut = currentSaree.stock === 0;
  const currentPrice = currentSaree.offerPrice !== undefined ? currentSaree.offerPrice : currentSaree.price;
  const discountPercent = currentSaree.offerPrice
    ? Math.round(((currentSaree.price - currentSaree.offerPrice) / currentSaree.price) * 100)
    : 0;
  const saveAmount = currentSaree.offerPrice ? currentSaree.price - currentSaree.offerPrice : 0;

  // Magnifier Zoom calculations
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${currentSaree.images[activeImageIndex]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '220%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(currentSaree.id));
    dispatch(syncWishlistOnServer([...wishlist].includes(currentSaree.id) 
      ? wishlist.filter(idVal => idVal !== currentSaree.id) 
      : [...wishlist, currentSaree.id]
    ));
    if (isWishlisted) {
      addToast('Removed from Wishlist', 'info');
    } else {
      addToast('Added to Wishlist!', 'success');
    }
  };

  const handleAddToCart = () => {
    if (isSoldOut) {
      addToast('Product is Out of Stock', 'error');
      return;
    }
    dispatch(addToCart({ product: currentSaree, quantity }));
    addToast('Item added to cart successfully!', 'success');
  };

  const getDistrictFromPincode = (pinCodeVal) => {
    if (!pinCodeVal || pinCodeVal.length < 6) return null;
    const prefix = pinCodeVal.substring(0, 3);
    if (prefix === '638') return 'Erode';
    if (prefix === '641' || prefix === '642') return 'Coimbatore';
    if (prefix === '636') return 'Salem';
    if (pinCodeVal.startsWith('600') || pinCodeVal.startsWith('601') || pinCodeVal.startsWith('602') || pinCodeVal.startsWith('603')) return 'Chennai';
    if (prefix === '625') return 'Madurai';
    if (prefix === '560') return 'Bangalore';
    if (prefix === '500') return 'Hyderabad';
    if (prefix === '400' || prefix === '401' || prefix === '402' || prefix === '403') return 'Mumbai';
    if (prefix === '110') return 'Delhi';
    
    // Fallbacks
    if (pinCodeVal.startsWith('6')) return 'Chennai'; // Tamil Nadu fallback
    if (pinCodeVal.startsWith('5')) return 'Bangalore'; // South India general
    if (pinCodeVal.startsWith('4')) return 'Mumbai'; // West India general
    return 'Delhi'; // North India general
  };

  // Delivery Checker Pincode resolver
  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.length < 6) {
      addToast('❌ Please enter a valid 6-digit pincode.', 'warning');
      return;
    }
    
    const resolvedDistrict = getDistrictFromPincode(pincode);
    const rule = shippingRules.find(r => r.district.toLowerCase() === resolvedDistrict.toLowerCase());

    const isErode = resolvedDistrict.toLowerCase() === 'erode';
    const charge = rule ? rule.shippingCharge : 99;
    const days = rule ? rule.estimatedDeliveryDays : 3;

    // Format delivery date: weekday, day, month (e.g. Thursday, 24 July)
    const today = new Date();
    
    let etaText = '';
    if (days === 1) {
      const etaDate = new Date(today);
      etaDate.setDate(today.getDate() + 1);
      const formatted = etaDate.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      etaText = formatted;
    } else {
      // range style format e.g. Friday, 25 July - Saturday, 26 July
      const minDate = new Date(today);
      minDate.setDate(today.getDate() + days - 1);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + days);
      
      const formatMin = minDate.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      const formatMax = maxDate.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      etaText = `${formatMin} - ${formatMax}`;
    }

    setDeliveryInfo({
      district: resolvedDistrict,
      isErode,
      charge,
      eta: etaText
    });
  };



  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Link copied to clipboard!', 'success');
  };

  const handlePostReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    addToast('✅ Review submitted successfully! Thank you for sharing.', 'success');
    setReviewModalOpen(false);
    setNewReviewText('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-[#111827] relative selection:bg-[#6366F1] selection:text-white font-poppins">
      
      {/* Luxury style injection */}
      <style>{`
        .shadow-premium {
          box-shadow: 0 10px 30px rgba(17, 24, 39, 0.05);
        }
        .border-premium {
          border: 1px solid rgba(229, 231, 235, 0.7);
        }
        .zoom-lens {
          display: none;
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 15px rgba(0,0,0,0.15);
        }
      `}</style>

      {/* Main product wrapper */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8 text-left font-poppins">
          <Link to="/" className="hover:text-[#6366F1] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/collection/all" className="hover:text-[#6366F1] transition-colors">Collections</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-[#6366F1] transition-colors truncate max-w-[150px]">{currentSaree.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold truncate max-w-[200px]">{currentSaree.name}</span>
        </nav>

        {/* Two-Column Grid: Image Gallery Left, Purchase Sticky Panel Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* LEFT SECTION: IMAGE GALLERY */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-premium flex items-center justify-center">
              {/* Zoom Target */}
              <div 
                className="w-full h-full relative cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={currentSaree.images[activeImageIndex]}
                  alt={currentSaree.name}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
                
                {/* Lens Zoom display */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                  style={zoomStyle}
                />
              </div>

              {/* Gallery navigation overlays */}
              {currentSaree.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? currentSaree.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white hover:text-[#6366F1] rounded-full border border-gray-100 transition-all text-gray-600 shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex((prev) => (prev === currentSaree.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white hover:text-[#6366F1] rounded-full border border-gray-100 transition-all text-gray-600 shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 text-left">
                {isSoldOut ? (
                  <span className="bg-[#111827] text-white font-montserrat text-[9px] font-bold tracking-widest px-3 py-1.5 rounded-lg uppercase shadow-sm">Sold Out</span>
                ) : (
                  discountPercent > 0 && (
                    <span className="bg-red-500 text-white font-montserrat text-[9px] font-bold tracking-widest px-3 py-1.5 rounded-lg uppercase shadow-sm flex items-center gap-0.5">
                      <Percent className="w-3.5 h-3.5" />
                      {discountPercent}% Off
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Thumbnails grid */}
            {currentSaree.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-1 justify-start">
                {currentSaree.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                      idx === activeImageIndex ? 'border-[#6366F1] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SECTION: STICKY PURCHASE PANEL */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 text-left">
            
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest block font-poppins">{currentSaree.category}</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  <Check className="w-3 h-3" /> 100% Original
                </span>
              </div>
              <h1 className="font-playfair text-3xl font-bold leading-tight text-[#111827]">{currentSaree.name}</h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-wider">CODE: {currentSaree.productCode} | SKU: {currentSaree.sku || 'GB-SAREE-TEMP'}</p>
            </div>

            {/* Ratings & Orders proof */}
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 font-montserrat">
              <div className="flex items-center gap-1 bg-[#6366F1]/5 border border-[#6366F1]/10 text-[#6366F1] px-2.5 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-[#6366F1] text-[#6366F1]" />
                <span>4.9</span>
              </div>
              <span>(1,250 Reviews)</span>
              <span className="text-gray-200">|</span>
              <span className="text-[#111827]">3,500+ Orders</span>
            </div>

            {/* Live activity indicators */}
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                <Eye className="w-4 h-4 text-[#6366F1] animate-pulse" />
                <span>28 Patrons viewing this weave</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-red-500">
                <Flame className="w-4 h-4 text-red-500 animate-bounce" />
                <span>Sold 8 times today</span>
              </div>
            </div>

            {/* Price block */}
            <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#111827]">₹{currentPrice.toLocaleString('en-IN')}</span>
                {currentSaree.offerPrice !== undefined && (
                  <>
                    <span className="text-base text-gray-400 line-through font-medium">₹{currentSaree.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-bold text-red-500">Save ₹{saveAmount.toLocaleString('en-IN')} ({discountPercent}%)</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-medium block">Inclusive of all local taxes</span>
            </div>

            {/* Offers card */}
            <div className="p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-[#6366F1]/10 rounded-2xl">
              <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider block mb-2 font-montserrat flex items-center gap-1">
                🎉 Available Offers
              </span>
              <ul className="text-[11px] text-[#374151] space-y-1.5 font-medium">
                <li className="flex items-start gap-1.5">✓ Buy 2 Premium Sarees @ ₹499 combo</li>
                <li className="flex items-start gap-1.5">✓ FREE express shipping in Erode district</li>
                <li className="flex items-start gap-1.5">✓ Flat ₹200 OFF on orders above ₹3,000</li>
              </ul>
            </div>

            {/* Delivery Checker */}
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Check Delivery Availability</span>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-[#111827]"
                  required
                />
                <button 
                  type="submit"
                  className="bg-[#111827] hover:bg-[#6366F1] text-white text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider transition-colors"
                >
                  Check
                </button>
              </form>

              {deliveryInfo && (
                <div className="space-y-4 pt-3 border-t border-slate-100 font-poppins text-xs">
                  <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                    <span className="text-base">📍</span>
                    <span>Deliver to: {deliveryInfo.district} - {pincode}</span>
                  </div>
                  
                  {deliveryInfo.isErode ? (
                    <>
                      <div className="text-emerald-600 font-extrabold text-sm flex items-center gap-1">
                        <span>✅</span> FREE Delivery
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Estimated Delivery</span>
                        <span className="font-extrabold text-gray-900 text-sm">{deliveryInfo.eta}</span>
                        <span className="text-gray-500 text-[11px] block mt-0.5 font-medium">
                          if you order within <span className="text-[#6366F1] font-extrabold">{countdownText}</span>
                        </span>
                      </div>

                      <div className="pt-2 grid grid-cols-1 gap-1 text-[11px] font-bold text-gray-400">
                        <span className="flex items-center gap-1 text-emerald-600">✔ Secure Packaging</span>
                        <span className="flex items-center gap-1 text-emerald-600">✔ Easy Returns</span>
                        <span className="flex items-center gap-1 text-emerald-600">✔ Cashless Delivery</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-rose-600 font-extrabold text-sm flex items-center gap-1">
                        <span>Shipping Charge :</span> ₹{deliveryInfo.charge}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Estimated Delivery</span>
                        <span className="font-extrabold text-gray-900 text-sm">{deliveryInfo.eta}</span>
                      </div>

                      <div className="pt-2 grid grid-cols-1 gap-1 text-[11px] font-bold text-gray-400">
                        <span className="flex items-center gap-1 text-[#6366F1]">✔ Standard Delivery</span>
                        <span className="flex items-center gap-1 text-[#6366F1]">✔ Track Your Order</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quantity selection & Cart/Wishlist Buttons */}
            <div className="space-y-4">
              {!isSoldOut && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Quantity</span>
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      type="button" 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3.5 py-2 hover:bg-slate-50 hover:text-[#6366F1] font-bold text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-5 py-2 text-xs font-bold text-gray-800">{quantity}</span>
                    <button 
                      type="button" 
                      onClick={() => setQuantity(q => Math.min(currentSaree.stock, q + 1))}
                      className="px-3.5 py-2 hover:bg-slate-50 hover:text-[#6366F1] font-bold text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart & Buy Now Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {!isSoldOut ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-white border border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-montserrat font-bold py-4 text-xs tracking-widest uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                    <button
                      onClick={handleOpenBuyNow}
                      className="flex-1 bg-[#111827] hover:bg-[#6366F1] text-white font-montserrat font-bold py-4 text-xs tracking-widest uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-md"
                    >
                      <Sparkles className="w-4 h-4 fill-white" /> Buy Now
                    </button>
                  </>
                ) : (
                  <div className="w-full bg-red-50 border border-red-150 rounded-xl py-4 px-6 text-center text-xs text-red-500 font-semibold flex items-center justify-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Out of stock. Get notified when back in stock.
                  </div>
                )}
              </div>

              {/* Wishlist & Share controls */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleToggleWishlist}
                  className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    isWishlisted 
                      ? 'bg-red-500 border-red-500 text-white shadow-md' 
                      : 'bg-white border-gray-200 hover:bg-slate-50 text-gray-600'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
                  {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                </button>
                
                <button
                  onClick={() => setShowShareModal(true)}
                  className="py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-slate-50 text-gray-600"
                  title="Share product link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-gray-150 text-[9px] font-bold text-gray-400 font-montserrat uppercase tracking-wider text-center">
              <div className="p-2 bg-white border border-gray-100 rounded-xl flex flex-col items-center gap-1 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Original</span>
              </div>
              <div className="p-2 bg-white border border-gray-100 rounded-xl flex flex-col items-center gap-1 shadow-sm">
                <Truck className="w-4 h-4 text-[#6366F1]" />
                <span>Fast Delivery</span>
              </div>
              <div className="p-2 bg-white border border-gray-100 rounded-xl flex flex-col items-center gap-1 shadow-sm">
                <RefreshCw className="w-4 h-4 text-purple-500" />
                <span>Easy Returns</span>
              </div>
            </div>

          </div>

        </div>



        {/* TAB DETAILS INFO SECTION */}
        <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-16 text-left">
          {/* Tab headers */}
          <div className="flex border-b border-gray-100 gap-6 text-xs font-bold uppercase tracking-widest font-montserrat">
            {['description', 'specifications', 'shipping', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3.5 transition-all relative ${
                  activeTab === tab ? 'text-[#6366F1] font-bold' : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabUnderline" 
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6366F1]" 
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div className="pt-6 text-xs text-gray-500 leading-relaxed min-h-[150px]">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">{currentSaree.description || 'This premium saree showcases a rich heritage weave blending artistic handloom patterns with high-end fabric selections. Perfect for styling during traditional celebrations, religious ceremonies, and family milestones.'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-montserrat">Designer Note</span>
                    <p className="text-[11px] text-gray-650 font-medium">Handcrafted with fine details, showcasing traditional margins and gold/silver zaree borders reflecting regional heritage.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-montserrat">Weave Care</span>
                    <p className="text-[11px] text-gray-650 font-medium">Dry clean only is advised to protect the delicate metallic threads and sustain texture shine over the years.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 max-w-3xl">
                {[
                  { label: 'Weave Fabric', value: currentSaree.fabric || 'Kanchipuram Semi Silk' },
                  { label: 'Primary Color', value: currentSaree.primaryColor || currentSaree.color || 'Royal Blue' },
                  { label: 'Secondary Color', value: currentSaree.secondaryColor },
                  { label: 'Average Weight', value: currentSaree.weight || '450 grams (Lightweight comfort)' },
                  { label: 'Saree Length', value: currentSaree.sareeLength || '5.5 Meters' },
                  { label: 'Blouse Piece', value: currentSaree.blousePiece || 'Included' },
                  { label: 'Blouse Fabric', value: currentSaree.blouseFabric },
                  { label: 'Border Type', value: currentSaree.borderType },
                  { label: 'Weaving Type', value: currentSaree.weavingType },
                  { label: 'Work Type', value: currentSaree.workType },
                  { label: 'Pattern', value: currentSaree.pattern },
                  { label: 'Occasion Type', value: currentSaree.occasion || 'Bridal, Festive, Rituals' },
                  { label: 'Style / Design', value: currentSaree.style },
                  { label: 'Wash Care', value: currentSaree.washCare || 'Dry clean only' },
                  { label: 'Country of Origin', value: 'India' }
                ].filter(spec => spec.value && spec.value.trim() !== '').map((spec, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-gray-50/80 font-medium">
                    <span className="text-gray-400 font-semibold">{spec.label}</span>
                    <span className="text-gray-800 font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3 max-w-xl">
                <p className="font-bold text-gray-700">Premium handled delivery services are provided for all luxury boutique purchases:</p>
                <ul className="list-disc pl-5 space-y-2 text-[#374151] font-medium">
                  <li><strong>Erode Local Area:</strong> Express delivery is completed within 24 hours (Free Shipping).</li>
                  <li><strong>Statewide Tamil Nadu:</strong> Estimated delivery within 2-4 business days.</li>
                  <li><strong>Other Indian States:</strong> Estimated delivery within 3-5 business days.</li>
                  <li><strong>Full Tracking:</strong> Tracking codes will be dispatched to your registered phone number/email immediately upon dispatch.</li>
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  {/* Rating summary */}
                  <div className="text-center p-6 bg-slate-50 border border-gray-100 rounded-2xl w-40">
                    <h4 className="text-4xl font-extrabold text-[#111827] font-montserrat">4.9</h4>
                    <div className="flex justify-center gap-0.5 my-1.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Boutique Rating</span>
                  </div>

                  {/* Rating bars */}
                  <div className="flex-1 w-full space-y-2 text-xs font-semibold text-gray-500">
                    {[
                      { stars: 5, pct: '92%' },
                      { stars: 4, pct: '6%' },
                      { stars: 3, pct: '1%' },
                      { stars: 2, pct: '0%' },
                      { stars: 1, pct: '1%' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-12 font-bold">{bar.stars} Star</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-gray-100/50">
                          <div className="h-full bg-amber-500" style={{ width: bar.pct }} />
                        </div>
                        <span className="w-8 text-right font-bold">{bar.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                  <h4 className="font-bold text-[#111827] text-sm">Customer Stories</h4>
                  <button 
                    onClick={() => setReviewModalOpen(true)}
                    className="bg-[#111827] hover:bg-[#6366F1] text-white text-[10px] font-bold font-montserrat py-2 px-4 rounded-lg uppercase tracking-wider transition-colors active:scale-95"
                  >
                    Write a Review
                  </button>
                </div>

                {/* Review entries list */}
                <div className="divide-y divide-gray-100">
                  {[
                    { author: 'Lekha S.', rating: 5, date: '12 May 2026', title: 'Gorgeous Saree! Highly recommend.', text: 'Absolutely gorgeous semi-silk saree. The zari detailing has a premium gold sheen that is not gaudy. Fabric is lightweight and drapes incredibly easily.' },
                    { author: 'Meera Raman', rating: 5, date: '04 May 2026', title: 'Perfect for temple functions', text: 'Purchased for family rituals in Erode, received delivery the next morning. Quality checks are superb. Beautiful color theme!' }
                  ].map((rev, idx) => (
                    <div key={idx} className="py-4 space-y-2 text-left">
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 font-montserrat">
                        <span className="text-[#111827]">{rev.author}</span>
                        <span>{rev.date}</span>
                      </div>
                      <div className="flex gap-1 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                      </div>
                      <p className="font-bold text-[#111827] text-xs font-poppins">{rev.title}</p>
                      <p className="text-[11px] text-gray-500 font-medium font-poppins leading-relaxed">{rev.text}</p>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block">✓ Verified Purchase</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {sarees.length > 1 && (
          <section className="border-t border-gray-150 pt-16 text-center">
            <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 tracking-wider mb-2">Related Products</h3>
            <p className="text-xs text-[#6366F1] font-poppins tracking-widest uppercase mb-12 font-semibold">Similar boutique picks you may like</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {sarees.filter(s => s.id !== currentSaree.id).slice(0, 4).map((saree) => (
                <ProductCard key={saree.id} product={saree} onQuickView={onQuickView} />
              ))}
            </div>
          </section>
        )}

        {/* RECENTLY VIEWED */}
        {recentlyViewed.length > 0 && (
          <section className="border-t border-gray-150 pt-16 mt-16 text-center">
            <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 tracking-wider mb-2">Recently Viewed</h3>
            <p className="text-xs text-[#6366F1] font-poppins tracking-widest uppercase mb-12 font-semibold font-bold">Patron history</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {recentlyViewed.map((saree) => (
                <ProductCard key={saree.id} product={saree} onQuickView={onQuickView} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      {!isSoldOut && (
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl py-3 px-5 z-40 flex items-center justify-between pointer-events-auto">
          <div>
            <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Price</span>
            <span className="text-base font-extrabold text-[#111827] font-montserrat">₹{currentPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="bg-white border border-[#111827] text-[#111827] text-xs font-montserrat font-bold py-2.5 px-4 rounded-xl uppercase transition-colors"
            >
              Cart
            </button>
            <button
              onClick={handleOpenBuyNow}
              className="bg-[#111827] text-white text-xs font-montserrat font-bold py-2.5 px-5 rounded-xl uppercase transition-all shadow-md active:scale-95 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" /> Buy Now
            </button>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10" 
              onClick={() => setShowShareModal(false)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-sm w-full bg-white rounded-3xl border border-gray-150 p-6 text-center shadow-2xl relative z-10 space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h4 className="font-playfair text-lg font-bold text-[#111827]">Share Collection</h4>
                <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-slate-50 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-gray-500 font-poppins">Share this premium handloom weave with family and friends:</p>
              
              <div className="grid grid-cols-2 gap-3 font-semibold text-xs text-[#374151]">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent('Check out this premium saree details page on Gramathu Boutique: ' + window.location.href)}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-xl flex items-center justify-center gap-1.5 text-emerald-700 font-montserrat"
                >
                  WhatsApp
                </a>
                <button
                  onClick={handleCopyLink}
                  className="p-3 bg-slate-50 border border-gray-200 hover:bg-slate-100 rounded-xl flex items-center justify-center gap-1.5 text-gray-700 font-montserrat"
                >
                  Copy Link
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX FULL SCREEN IMAGE VIEWER */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-4 text-white">
            <div className="flex justify-end p-2">
              <button 
                onClick={() => setLightboxOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="relative flex-1 flex items-center justify-center">
              <img 
                src={currentSaree.images[activeImageIndex]} 
                alt="Fullscreen View" 
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
              
              {currentSaree.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIndex(p => p === 0 ? currentSaree.images.length - 1 : p - 1)}
                    className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 text-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex(p => p === currentSaree.images.length - 1 ? 0 : p + 1)}
                    className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 text-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="text-center text-xs text-white/60 py-4 font-montserrat font-bold">
              Image {activeImageIndex + 1} of {currentSaree.images.length} • {currentSaree.name}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* WRITE A REVIEW MODAL */}
      <AnimatePresence>
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10" 
              onClick={() => setReviewModalOpen(false)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full bg-white rounded-3xl border border-gray-150 p-6 shadow-2xl relative z-10 space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h4 className="font-playfair text-lg font-bold text-[#111827]">Write a Review</h4>
                <button onClick={() => setReviewModalOpen(false)} className="p-1 hover:bg-slate-50 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              
              <form onSubmit={handlePostReview} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Review Rating</label>
                  <div className="flex gap-1.5 text-amber-500">
                    {[1,2,3,4,5].map((s) => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setNewReviewRating(s)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${s <= newReviewRating ? 'fill-current' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Your Review Story</label>
                  <textarea
                    rows={4}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Tell us about the fabric feel, drape quality, colors, and shipping speed..."
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#6366F1] font-medium"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#111827] hover:bg-[#6366F1] text-white font-montserrat font-bold py-3 text-xs tracking-wider uppercase rounded-xl transition-all"
                >
                  Submit Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREMIUM MULTI-STEP CHECKOUT DRAWER (SLIDE-OVER PANEL) */}
      <AnimatePresence>
        {buyNowOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setBuyNowOpen(false)}
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 text-left border-l border-gray-150"
            >
              {/* Header */}
              <div className="p-5 bg-[#111827] text-white flex justify-between items-center">
                <div>
                  <h3 className="font-playfair text-lg font-bold">Premium Checkout Flow</h3>
                  <span className="text-[9px] text-[#6366F1] font-bold uppercase tracking-widest block font-montserrat">Gramathu Boutique Portal</span>
                </div>
                <button 
                  onClick={() => {
                    setBuyNowOpen(false);
                    setCheckoutStep(1);
                  }} 
                  className="p-1.5 hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Steps Progress Header */}
              {checkoutStep <= 5 && (
                <div className="px-5 py-3.5 bg-slate-50 border-b border-gray-100 flex justify-between text-[9px] font-bold text-gray-400 font-montserrat uppercase tracking-wider">
                  <span className={checkoutStep >= 1 ? 'text-[#6366F1]' : ''}>1. Items</span>
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  <span className={checkoutStep >= 2 ? 'text-[#6366F1]' : ''}>2. Address</span>
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  <span className={checkoutStep >= 3 ? 'text-[#6366F1]' : ''}>3. Shipping</span>
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  <span className={checkoutStep >= 4 ? 'text-[#6366F1]' : ''}>4. Payment</span>
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  <span className={checkoutStep >= 5 ? 'text-[#6366F1]' : ''}>5. Summary</span>
                </div>
              )}

              {/* Step Forms Containers */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* STEP 1: SELECT QUANTITY */}
                {checkoutStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#111827] text-sm">Review Selected Items</h4>
                    <div className="flex gap-4 p-4 border border-gray-100 bg-slate-50 rounded-2xl">
                      <img src={currentSaree.images[0]} alt={currentSaree.name} className="w-16 h-20 object-cover rounded-lg border border-gray-200" />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-semibold text-xs text-[#111827] truncate">{currentSaree.name}</h5>
                        <p className="text-[10px] text-gray-400 font-mono">CODE: {currentSaree.productCode}</p>
                        <p className="text-xs font-bold text-[#6366F1] mt-1">₹{currentPrice.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Quantity</span>
                      <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3.5 py-1.5 font-bold text-xs"><Minus className="w-3 h-3" /></button>
                        <span className="px-5 py-1.5 text-xs font-bold text-gray-800">{quantity}</span>
                        <button type="button" onClick={() => setQuantity(q => Math.min(currentSaree.stock, q + 1))} className="px-3.5 py-1.5 font-bold text-xs"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between font-bold">
                      <span className="text-xs text-gray-400 uppercase">Estimated Subtotal</span>
                      <span className="text-base text-[#111827]">₹{(currentPrice * quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                {/* STEP 2: SELECT DELIVERY ADDRESS */}
                {checkoutStep === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#111827] text-sm">Delivery Address</h4>
                    <div className="space-y-3 font-semibold text-xs text-gray-500">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider block">Full Name</label>
                        <input
                          type="text"
                          value={shippingAddress.name}
                          onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                          placeholder="Priya Raman"
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-[#111827]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider block">Phone Number</label>
                        <input
                          type="text"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value.replace(/\D/g, '')})}
                          placeholder="9898989801"
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-[#111827]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider block">Street Address</label>
                        <input
                          type="text"
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                          placeholder="10, Periyar Street"
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-[#111827]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider block">City / Town</label>
                          <input
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                            placeholder="Erode"
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-[#111827]"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider block">Pincode</label>
                          <input
                            type="text"
                            value={shippingAddress.pincode}
                            onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value.replace(/\D/g, '')})}
                            placeholder="638001"
                            maxLength={6}
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#6366F1] font-semibold text-[#111827]"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: SHIPPING DETAILS */}
                {checkoutStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#111827] text-sm">Select Shipping Speed</h4>
                    <div className="space-y-3 font-semibold text-xs text-[#374151]">
                      {/* Erode local free speed option */}
                      {shippingAddress.pincode.startsWith('638') ? (
                        <label className="p-4 border-2 border-[#6366F1] bg-[#6366F1]/5 rounded-2xl flex items-center justify-between cursor-pointer">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-[#111827] block">Express Delivery (Erode Local Area)</span>
                            <span className="text-[10px] text-gray-400 block">ETA: Tomorrow</span>
                          </div>
                          <span className="font-bold text-emerald-600 text-xs">FREE</span>
                        </label>
                      ) : (
                        <>
                          <label className={`p-4 border rounded-2xl flex items-center justify-between cursor-pointer ${
                            shippingMethod === 'standard' ? 'border-[#6366F1] bg-[#6366F1]/5' : 'border-gray-200'
                          }`}>
                            <div className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                name="ship" 
                                checked={shippingMethod === 'standard'} 
                                onChange={() => setShippingMethod('standard')} 
                                className="w-4 h-4 text-[#6366F1] focus:ring-[#6366F1]"
                              />
                              <div className="space-y-0.5 text-left">
                                <span className="font-extrabold text-[#111827] block">Standard Delivery</span>
                                <span className="text-[10px] text-gray-400 block">ETA: 3–5 Business Days</span>
                              </div>
                            </div>
                            <span className="font-bold text-[#111827]">₹100</span>
                          </label>

                          <label className={`p-4 border rounded-2xl flex items-center justify-between cursor-pointer ${
                            shippingMethod === 'express' ? 'border-[#6366F1] bg-[#6366F1]/5' : 'border-gray-200'
                          }`}>
                            <div className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                name="ship" 
                                checked={shippingMethod === 'express'} 
                                onChange={() => setShippingMethod('express')} 
                                className="w-4 h-4 text-[#6366F1] focus:ring-[#6366F1]"
                              />
                              <div className="space-y-0.5 text-left">
                                <span className="font-extrabold text-[#111827] block">Premium Express Delivery</span>
                                <span className="text-[10px] text-gray-400 block">ETA: 2 Business Days</span>
                              </div>
                            </div>
                            <span className="font-bold text-[#111827]">₹200</span>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: PAYMENT METHOD */}
                {checkoutStep === 4 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#111827] text-sm">Choose Payment Method</h4>
                    <div className="space-y-3 font-semibold text-xs text-[#374151]">
                      {[
                        { id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay at your doorstep with Cash/UPI' },
                        { id: 'card', label: 'Credit / Debit Card', desc: 'Secure online processing via Gateway' },
                        { id: 'upi', label: 'UPI / NetBanking', desc: 'Instant authorization using PhonePe, GPay' }
                      ].map((pay) => (
                        <label key={pay.id} className={`p-4 border rounded-2xl flex items-start gap-3 cursor-pointer ${
                          paymentMethod === pay.id ? 'border-[#6366F1] bg-[#6366F1]/5' : 'border-gray-200'
                        }`}>
                          <input 
                            type="radio" 
                            name="pay" 
                            checked={paymentMethod === pay.id} 
                            onChange={() => setPaymentMethod(pay.id)} 
                            className="mt-1 w-4 h-4 text-[#6366F1] focus:ring-[#6366F1]"
                          />
                          <div className="space-y-0.5 text-left">
                            <span className="font-extrabold text-[#111827] block">{pay.label}</span>
                            <span className="text-[10px] text-gray-400 block leading-tight">{pay.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 5: ORDER SUMMARY */}
                {checkoutStep === 5 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#111827] text-sm">Order Summary & Verification</h4>
                    
                    <div className="space-y-3 p-4 bg-slate-50 border border-gray-150 rounded-2xl text-[11px] font-semibold text-[#374151]">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span>₹{(currentPrice * quantity).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>{shippingAddress.pincode.startsWith('638') ? 'FREE' : shippingMethod === 'express' ? '₹200' : '₹100'}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 text-[#111827] font-bold text-xs">
                        <span>Grand Total</span>
                        <span>₹{(
                          currentPrice * quantity + 
                          (shippingAddress.pincode.startsWith('638') ? 0 : shippingMethod === 'express' ? 200 : 100)
                        ).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-gray-100 rounded-2xl text-xs space-y-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-montserrat">Shipping To</span>
                      <p className="font-bold text-[#111827]">{shippingAddress.name} ({shippingAddress.phone})</p>
                      <p className="text-gray-500 font-semibold leading-tight">{shippingAddress.street}, {shippingAddress.city} - {shippingAddress.pincode}</p>
                    </div>

                    <div className="p-4 bg-white border border-gray-100 rounded-2xl text-xs flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase font-montserrat block">Payment Mode</span>
                        <span className="font-bold text-[#111827] uppercase">{paymentMethod}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#6366F1] uppercase bg-[#6366F1]/5 px-2 py-0.5 rounded border border-[#6366F1]/10">
                        🔒 Secure Auth
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 6: PLACE ORDER SUCCESS */}
                {checkoutStep === 6 && (
                  <div className="py-8 text-center space-y-5">
                    <div className="w-16 h-16 bg-green-50 text-green-500 border border-green-150 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <Check className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-playfair text-xl font-bold text-[#111827]">Order Placed Successfully!</h4>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">Thank you for shopping at Gramathu Boutique. Your luxurious handloom purchase is now registered.</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl max-w-sm mx-auto text-xs font-semibold space-y-1.5 text-left">
                      <div className="flex justify-between border-b border-gray-200/50 pb-1.5 font-bold">
                        <span>Invoice ID</span>
                        <span className="text-[#6366F1] font-mono">{placedOrder?.id || placedOrder?.customOrderId || `GB-${Math.floor(100000 + Math.random() * 900000)}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Mode</span>
                        <span>{shippingAddress.pincode.startsWith('638') ? 'Express' : 'Standard'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Delivery</span>
                        <span>{shippingAddress.pincode.startsWith('638') ? 'Tomorrow' : '3-5 Business Days'}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Sticky bottom buttons for flow control */}
              {checkoutStep <= 5 ? (
                <div className="p-5 border-t border-gray-150 bg-slate-50 grid grid-cols-2 gap-3 flex-shrink-0">
                  <button
                    onClick={() => {
                      if (checkoutStep === 1) {
                        setBuyNowOpen(false);
                      } else {
                        setCheckoutStep(checkoutStep - 1);
                      }
                    }}
                    className="py-3.5 bg-white border border-gray-200 text-gray-700 font-montserrat font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (checkoutStep === 2) {
                        // Validate address form
                        if (!shippingAddress.name.trim() || !shippingAddress.phone.trim() || !shippingAddress.street.trim() || !shippingAddress.city.trim() || shippingAddress.pincode.length < 6) {
                          addToast('❌ Please complete the delivery details.', 'warning');
                          return;
                        }
                      }
                      if (checkoutStep === 5) {
                        const orderPayload = {
                          items: [
                            {
                              productId: currentSaree.id || currentSaree._id,
                              quantity: quantity
                            }
                          ],
                          shippingAddress: {
                            street: shippingAddress.street,
                            district: shippingAddress.pincode.startsWith('638') ? 'Erode' : shippingAddress.city,
                            state: shippingAddress.state || 'Tamil Nadu',
                            pincode: shippingAddress.pincode,
                            phone: shippingAddress.phone
                          },
                          paymentMethod: paymentMethod.toLowerCase() === 'cod' ? 'cod' : 'Razorpay',
                          couponCode: '',
                          notes: 'Buy Now Direct Purchase'
                        };

                        addToast('Securing order details...', 'loading');

                        fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(orderPayload)
                          })
                        .then(res => res.json())
                        .then(data => {
                          if (data.success) {
                            setPlacedOrder(data.data);
                            setCheckoutStep(6);
                            addToast('✅ Order placed successfully!', 'success');
                          } else {
                            addToast(data.message || 'Checkout failed.', 'error');
                          }
                        })
                        .catch(err => {
                          addToast('Network error during checkout.', 'error');
                        });
                      } else {
                        setCheckoutStep(checkoutStep + 1);
                      }
                    }}
                    className="py-3.5 bg-[#111827] hover:bg-[#6366F1] text-white font-montserrat font-bold text-xs tracking-wider uppercase rounded-xl transition-colors shadow-md"
                  >
                    {checkoutStep === 5 ? 'Place Order' : 'Continue'}
                  </button>
                </div>
              ) : (
                <div className="p-5 border-t border-gray-150 bg-slate-50 flex-shrink-0">
                  <button
                    onClick={() => {
                      setBuyNowOpen(false);
                      setCheckoutStep(1);
                      navigate('/');
                    }}
                    className="w-full bg-[#111827] hover:bg-[#6366F1] text-white font-montserrat font-bold py-3.5 text-xs tracking-wider uppercase rounded-xl transition-colors shadow-md"
                  >
                    Return to Storefront
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
