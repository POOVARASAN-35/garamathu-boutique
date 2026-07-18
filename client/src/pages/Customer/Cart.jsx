import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchCart, 
  addToCart, 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  setShippingDistrict, 
  setShippingCharge, 
  applyCoupon, 
  removeCoupon,
  moveToWishlist,
  populateGuestCartItems
} from '../../store/cartSlice.js';
import { saveAddress, deleteAddress } from '../../store/authSlice.js';
import { fetchAdminSettings } from '../../store/adminSlice.js';
import { fetchSarees } from '../../store/productSlice.js';
import { useToast } from '../../context/ToastContext.jsx';
import { 
  ShoppingBag, Trash2, ArrowRight, Tag, Info, AlertTriangle, 
  Truck, PenTool, Eye, Heart, Share2, Plus, Edit, X, Check, MapPin,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickViewModal from '../../components/QuickViewModal.jsx';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { items: cartItems, shippingDistrict, shippingCharge, coupon, loading } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);
  const adminSettings = useSelector((state) => state.admin.settings);
  const { sarees } = useSelector((state) => state.products);

  // States
  const [district, setDistrict] = useState(shippingDistrict || 'Erode');
  const [street, setStreet] = useState('');
  const [pincode, setPincode] = useState('');
  const [shippingRules, setShippingRules] = useState([]);
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [couponText, setCouponText] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Address Modal States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressEditor, setShowAddressEditor] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  // Editor fields
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('Erode');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrState, setAddrState] = useState('Tamil Nadu');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Load products and cart settings
  useEffect(() => {
    dispatch(fetchSarees({ limit: 100 }));
    dispatch(fetchAdminSettings());
    dispatch(fetchCart());
  }, [dispatch, token]);

  // Fetch Shipping Rules
  useEffect(() => {
    const loadRules = async () => {
      try {
        const res = await fetch('import.meta.env.VITE_API_URL/api/shipping-rules');
        if (res.ok) {
          const data = await res.json();
          setShippingRules(data);
        }
      } catch (err) {
        console.error('Error fetching shipping rules:', err);
      }
    };
    loadRules();
  }, []);

  // Guest population trigger
  useEffect(() => {
    if (!token && sarees.length > 0) {
      dispatch(populateGuestCartItems(sarees));
    }
  }, [dispatch, token, sarees]);

  useEffect(() => {
    if (adminSettings?.shipping) {
      dispatch(setShippingCharge(adminSettings.shipping.defaultShippingCharge));
    }
  }, [adminSettings, dispatch]);

  // Auto populate inputs from default address
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      if (defaultAddr) {
        setStreet(defaultAddr.street);
        setDistrict(defaultAddr.district);
        setPincode(defaultAddr.pincode);
        setPhone(defaultAddr.phone);
        dispatch(setShippingDistrict(defaultAddr.district));
      }
    }
  }, [user, dispatch]);

  // Subtotal & totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.offerPrice !== undefined ? item.product.offerPrice : (item.product?.price || 0);
      return acc + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  const activeShippingFee = useMemo(() => {
    const matched = shippingRules.find(r => r.district.toLowerCase() === district.trim().toLowerCase());
    if (matched) {
      return matched.shippingCharge;
    }
    const isFree = district.trim().toLowerCase() === 'erode';
    return isFree ? 0 : (shippingCharge || 120);
  }, [district, shippingRules, shippingCharge]);

  const discount = useMemo(() => {
    if (coupon) {
      return Math.round(subtotal * (coupon.discountPercent / 100));
    }
    return 0;
  }, [coupon, subtotal]);

  const grandTotal = subtotal - discount + activeShippingFee;

  // Quantity updates
  const handleQtyChange = (productId, newQty, product) => {
    if (newQty < 1) return;
    if (newQty > product.stock) {
      addToast(`Only ${product.stock} items available in stock.`, 'warning');
      return;
    }
    dispatch(updateQuantity({ productId, quantity: newQty }));
    addToast('Quantity Updated', 'success');
  };

  const handleRemoveItem = (productId, name) => {
    dispatch(removeFromCart(productId));
    addToast(`${name} removed from cart.`, 'info');
  };

  const handleMoveToWishlistAction = (productId, name) => {
    dispatch(moveToWishlist(productId));
    addToast(`${name} moved to your wishlist collection.`, 'success');
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponText.trim()) return;
    dispatch(applyCoupon(couponText))
      .unwrap()
      .then((res) => {
        addToast(res.message || '✅ Coupon Applied Successfully', 'success');
      })
      .catch((err) => {
        addToast(err || '❌ Invalid Coupon Code', 'error');
      });
    setCouponText('');
  };

  const handleCheckout = async () => {
    if (!token) {
      addToast('Please login or register to complete checkout.', 'warning');
      return;
    }
    if (!street || !district || !pincode || !phone) {
      addToast('Please input shipping address to checkout.', 'warning');
      return;
    }

    setIsCheckingOut(true);
    addToast('Securing order details...', 'loading');

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.product?.offerPrice !== undefined ? item.product.offerPrice : item.product?.price
        })),
        shippingAddress: {
          street,
          district,
          state: 'Tamil Nadu',
          pincode,
          phone
        },
        paymentMethod: 'Razorpay',
        couponCode: coupon?.code,
        notes
      };

      const response = await fetch('import.meta.env.VITE_API_URL/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();
      if (!response.ok) {
        addToast(data.message || 'Checkout failed.', 'error');
        setIsCheckingOut(false);
        return;
      }

      addToast('Payment Successful! Order Placed.', 'success');
      dispatch(clearCart());
      dispatch(removeCoupon());
      navigate(`/order-success/${data.data.customOrderId || data.data.id || data.id}`);
    } catch (e) {
      addToast('Network error during checkout.', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Address Selection & Management helpers
  const handleSelectAddress = (addr) => {
    setStreet(addr.street);
    setDistrict(addr.district);
    setPincode(addr.pincode);
    setPhone(addr.phone);
    dispatch(setShippingDistrict(addr.district));
    setShowAddressModal(false);
    addToast('Shipping address loaded.', 'info');
  };

  const handleEditAddressClick = (addr) => {
    setEditingAddress(addr);
    setAddrName(addr.name || '');
    setAddrPhone(addr.phone || '');
    setAddrStreet(addr.street || '');
    setAddrDistrict(addr.district || 'Erode');
    setAddrPincode(addr.pincode || '');
    setAddrState(addr.state || 'Tamil Nadu');
    setAddrIsDefault(addr.isDefault || false);
    setShowAddressEditor(true);
  };

  const handleAddNewAddressClick = () => {
    setEditingAddress(null);
    setAddrName('');
    setAddrPhone('');
    setAddrStreet('');
    setAddrDistrict('Erode');
    setAddrPincode('');
    setAddrState('Tamil Nadu');
    setAddrIsDefault(false);
    setShowAddressEditor(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrStreet || !addrPincode) {
      addToast('Please fill all required address fields.', 'warning');
      return;
    }

    const payload = {
      id: editingAddress?._id || editingAddress?.id,
      name: addrName,
      phone: addrPhone,
      street: addrStreet,
      district: addrDistrict,
      state: addrState,
      pincode: addrPincode,
      isDefault: addrIsDefault
    };

    dispatch(saveAddress(payload))
      .unwrap()
      .then(() => {
        addToast('Address saved successfully!', 'success');
        setShowAddressEditor(false);
      })
      .catch(() => {
        addToast('Failed to save address.', 'error');
      });
  };

  const handleDeleteAddress = (addrId) => {
    dispatch(deleteAddress(addrId))
      .unwrap()
      .then(() => {
        addToast('Address deleted.', 'info');
      });
  };

  // Recommendations & Viewed lists
  const inspiredLooks = useMemo(() => {
    if (cartItems.length > 0) {
      const cartCats = cartItems.map(item => item.product?.category);
      return sarees.filter(s => cartCats.includes(s.category) && !cartItems.some(i => i.productId === s.id)).slice(0, 8);
    }
    return sarees.filter(s => s.isFeatured).slice(0, 8);
  }, [sarees, cartItems]);

  const recentlyViewed = useMemo(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('gb_recently_viewed') || '[]');
      return sarees.filter(s => ids.includes(s.id || s._id?.toString())).slice(0, 8);
    } catch (e) {
      return [];
    }
  }, [sarees]);

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    setDistrict(val);
    dispatch(setShippingDistrict(val));
  };

  const shareProduct = (product) => {
    navigator.clipboard.writeText(`${window.location.origin}/product/${product.id || product._id}`);
    addToast('Product share link copied!', 'success');
  };

  const districts = [
    "Erode", "Chennai", "Coimbatore", "Salem", "Madurai", "Trichy", "Tirunelveli", "Vellore", "Thanjavur", "Kanchipuram"
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 sm:py-24 text-left selection:bg-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold font-poppins uppercase tracking-[0.25em] text-[#A8A19A] mb-5">
          <Link to="/" className="hover:text-gray-950 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-950">Cart</span>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 mb-12"
        >
          <h1 className="font-playfair text-5xl sm:text-6xl font-black text-[#111111] leading-none">
            Shopping <span className="italic font-normal text-red-900">Cart</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-poppins max-w-xl">
            Review your selected products and complete your purchase with confidence.
          </p>
        </motion.div>

        {/* Stats Row */}
        {cartItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="bg-white border border-[#EBE8E2] rounded-2xl p-4.5 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] text-[#A69E96] font-bold uppercase tracking-wider">Cart Items</p>
                <p className="text-sm font-bold text-gray-950 font-poppins">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Products
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#EBE8E2] rounded-2xl p-4.5 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50/60 flex items-center justify-center text-emerald-600">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] text-[#A69E96] font-bold uppercase tracking-wider">Cart Value</p>
                <p className="text-sm font-bold text-gray-950 font-poppins">₹{subtotal.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="bg-white border border-[#EBE8E2] rounded-2xl p-4.5 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-orange-50/75 flex items-center justify-center text-[#B25A2B]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] text-[#A69E96] font-bold uppercase tracking-wider">Shipping Method</p>
                <p className="text-xs font-bold text-gray-950 font-poppins">
                  {district.toLowerCase() === 'erode' ? 'Free (Erode Local)' : 'Standard (Tamil Nadu)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cart Layout Panels */}
        {cartItems.length === 0 ? (
          
          /* Empty Basket layout */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-white border border-[#EBE8E2] rounded-[32px] p-8 shadow-sm mb-16"
          >
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-red-900 border border-rose-100/50">
              <ShoppingBag className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="font-playfair text-2xl sm:text-3xl font-black text-gray-950 tracking-wide uppercase">Your Cart is Empty</h3>
              <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto font-poppins">
                Looks like you haven't added any beautiful sarees yet.
              </p>
            </div>
            <Link
              to="/collection/all"
              className="inline-flex items-center gap-2 bg-[#111827] hover:bg-gray-950 text-white font-poppins font-bold text-xs tracking-wider uppercase py-3.5 px-8 rounded-xl shadow-md transition-colors"
            >
              Explore Collections
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          
          /* Active Checkout elements */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
            
            {/* Left Column: Saree Cards (70%) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-4">
                <AnimatePresence>
                  {cartItems.map((item) => {
                    const prod = item.product;
                    if (!prod) return null;
                    const price = prod.offerPrice !== undefined ? prod.offerPrice : prod.price;
                    const saved = prod.offerPrice ? prod.price - prod.offerPrice : 0;
                    
                    return (
                      <motion.div
                        key={item.productId}
                        layout
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col sm:flex-row gap-5 p-5 bg-white border border-[#EBE8E2] rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 items-stretch text-left relative overflow-hidden group"
                      >
                        {/* Image Frame */}
                        <Link to={`/product/${item.productId}`} className="w-full sm:w-28 aspect-[3/4] sm:aspect-auto sm:h-36 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 relative block">
                          <img
                            src={prod.images?.[0] || '/placeholder.jpg'}
                            alt={prod.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                          />
                          {saved > 0 && (
                            <span className="absolute top-2 left-2 bg-red-900 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              Sale
                            </span>
                          )}
                        </Link>

                        {/* Item Details */}
                        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                          <div>
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-[8px] font-extrabold text-[#B25A2B] uppercase tracking-widest block font-poppins mb-0.5">
                                  {prod.category} – {prod.fabric}
                                </span>
                                <Link to={`/product/${item.productId}`} className="hover:text-red-900 transition-colors">
                                  <h4 className="text-sm font-bold text-gray-950 line-clamp-1 font-poppins leading-tight">
                                    {prod.name}
                                  </h4>
                                </Link>
                              </div>
                              
                              <div className="text-right">
                                <span className="text-sm font-bold text-gray-950 font-poppins block">
                                  ₹{(price * item.quantity).toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] text-gray-400 font-poppins block">
                                  (₹{price.toLocaleString('en-IN')} each)
                                </span>
                              </div>
                            </div>

                            <p className="text-[9px] text-[#A69E96] font-mono tracking-wider uppercase mt-1">
                              CODE: {prod.code} • Color: {prod.color}
                            </p>
                          </div>

                          <div className="flex flex-wrap justify-between items-end gap-4 mt-4 pt-3 border-t border-gray-100">
                            
                            {/* Quantity Adjustment Selector */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-[#E5E2DA] bg-[#FAF9F6] rounded-xl overflow-hidden shadow-inner">
                                <button
                                  onClick={() => handleQtyChange(item.productId, item.quantity - 1, prod)}
                                  className="px-3.5 py-1.5 text-xs text-gray-600 hover:text-red-900 active:bg-gray-100 transition-colors font-bold"
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="px-3 py-1.5 text-xs font-bold text-gray-950 font-poppins">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQtyChange(item.productId, item.quantity + 1, prod)}
                                  className="px-3.5 py-1.5 text-xs text-gray-600 hover:text-red-900 active:bg-gray-100 transition-colors font-bold"
                                  disabled={item.quantity >= prod.stock}
                                >
                                  +
                                </button>
                              </div>
                              {prod.stock <= 3 && (
                                <span className="text-[8px] font-bold text-red-500 uppercase font-poppins">
                                  Only {prod.stock} Left!
                                </span>
                              )}
                            </div>

                            {/* Actions Group */}
                            <div className="flex gap-2">
                              {saved > 0 && (
                                <span className="bg-[#FAF9F6] text-emerald-700 text-[8px] font-bold tracking-wider px-2.5 py-1.5 rounded-lg border border-emerald-100 uppercase self-center font-poppins">
                                  Saved ₹{saved * item.quantity}
                                </span>
                              )}
                              
                              <button
                                onClick={() => handleMoveToWishlistAction(item.productId, prod.name)}
                                className="p-2 bg-rose-50/70 hover:bg-rose-100 text-red-900 rounded-xl transition-all shadow-sm"
                                title="Move to Wishlist"
                              >
                                <Heart className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setQuickViewProduct(prod)}
                                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-all shadow-sm"
                                title="Quick View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => shareProduct(prod)}
                                className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-all shadow-sm"
                                title="Share Saree"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.productId, prod.name)}
                                className="p-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Coupons & Custom Instructions Drawer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Coupon Code Panel */}
                <div className="p-5.5 bg-white border border-[#EBE8E2] rounded-3xl text-left space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2 font-poppins">
                    <Tag className="w-4 h-4 text-indigo-650" />
                    Boutique Promos
                  </h4>
                  
                  {coupon ? (
                    <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-150 rounded-2xl text-xs font-poppins">
                      <span className="text-indigo-850 font-bold tracking-wider">{coupon.code} (10% Discount)</span>
                      <button
                        onClick={() => {
                          dispatch(removeCoupon());
                          addToast('Coupon code cleared', 'info');
                        }}
                        className="text-red-500 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponText}
                        onChange={(e) => setCouponText(e.target.value)}
                        placeholder="WELCOME10"
                        className="bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-red-900/30 focus:border-red-900 w-full outline-none font-semibold uppercase font-poppins"
                      />
                      <button
                        type="submit"
                        className="bg-[#111827] hover:bg-gray-950 text-white font-poppins font-bold text-[10px] py-2.5 px-4.5 rounded-xl transition-colors tracking-wider uppercase"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>

                {/* Shipping Instructions Notes */}
                <div className="p-5.5 bg-white border border-[#EBE8E2] rounded-3xl text-left space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2 font-poppins">
                    <PenTool className="w-4 h-4 text-indigo-650" />
                    Special Instructions
                  </h4>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., custom pleating settings, specific delivery hour..."
                    className="bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-red-900/30 focus:border-red-900 w-full outline-none font-medium font-poppins"
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Checkout forms & Sticky summaries (30%) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              
              {/* Delivery Destination Settings */}
              <div className="bg-white p-6 rounded-3xl border border-[#EBE8E2] text-left space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-2.5 border-b border-[#EBE8E2]">
                  <h3 className="font-playfair text-base font-black text-gray-950 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-indigo-650" />
                    Delivery Destination
                  </h3>
                  {token && (
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="text-[9px] font-bold text-indigo-650 hover:underline uppercase tracking-wider font-poppins"
                    >
                      Saved Places
                    </button>
                  )}
                </div>

                <div className="space-y-4 text-xs font-poppins">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Select District</label>
                    <select
                      value={district}
                      onChange={handleDistrictChange}
                      className="w-full bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-red-900/30 outline-none font-semibold text-gray-800"
                    >
                      {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="Other">Other District</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Street Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Door No, Street Name"
                      className="w-full bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-red-900/30 outline-none font-medium text-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Pincode</label>
                      <input
                        type="text"
                        maxLength="6"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="638001"
                        className="w-full bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-red-900/30 outline-none font-medium text-gray-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Contact Phone</label>
                      <input
                        type="text"
                        maxLength="10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-red-900/30 outline-none font-medium text-gray-800 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Calculations Summary */}
              <div className="bg-white p-6 rounded-3xl border border-[#EBE8E2] text-left space-y-4 shadow-md">
                <h3 className="font-playfair text-base font-black text-gray-950 pb-2.5 border-b border-[#EBE8E2]">
                  Order Summary
                </h3>

                <div className="space-y-3.5 font-poppins text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-[#A39D95]">Subtotal</span>
                    <span className="text-gray-900 font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between font-semibold text-red-600">
                      <span>Discount ({coupon.discountPercent}%)</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span className="text-[#A39D95]">Shipping Charge</span>
                    <span className="text-gray-950 font-bold">
                      {activeShippingFee === 0 ? (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Free Delivery</span>
                      ) : (
                        `₹${activeShippingFee.toLocaleString('en-IN')}`
                      )}
                    </span>
                  </div>

                  <div className="h-[1px] bg-gray-100 my-1" />

                  <div className="flex justify-between text-sm font-bold text-gray-900">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {!token && (
                  <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 flex items-start gap-1.5 font-semibold font-poppins leading-relaxed">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Please sign in from the header profile icon to secure checkout.</span>
                  </div>
                )}

                {/* Checkout Trigger */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0}
                  className="w-full bg-red-900 hover:bg-[#5E1914] text-white font-poppins font-bold py-4 text-xs tracking-widest uppercase rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Proceed to Secure Checkout
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Inspired Looks / Recommendation Carousel */}
        {inspiredLooks.length > 0 && (
          <div className="border-t border-[#EBE8E2] pt-16 mb-20">
            <h2 className="font-playfair text-2xl sm:text-3xl font-black text-gray-950 tracking-tight uppercase mb-8">You May Also Like</h2>
            
            <div className="flex gap-6 overflow-x-auto pb-4 scroll-snap-x scroll-smooth snap-mandatory scrollbar-thin scrollbar-thumb-gray-250">
              {inspiredLooks.map(item => {
                const currentPrice = item.offerPrice !== undefined ? item.offerPrice : item.price;
                return (
                  <motion.div 
                    whileHover={{ y: -3 }}
                    key={item.id} 
                    className="w-56 bg-white border border-[#EBE8E2] rounded-3xl p-4 flex-shrink-0 snap-start shadow-sm relative group"
                  >
                    <Link to={`/product/${item.id}`}>
                      <img src={item.images?.[0]} alt={item.name} className="w-full aspect-[3/4] object-cover rounded-2xl mb-3.5 shadow-sm" />
                      <span className="text-[8px] font-bold text-red-900 tracking-widest uppercase block">{item.category}</span>
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-1 font-poppins mt-1">{item.name}</h4>
                      <p className="text-xs font-bold text-gray-950 mt-1 font-poppins">₹{currentPrice.toLocaleString('en-IN')}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recently Viewed Carousel */}
        {recentlyViewed.length > 0 && (
          <div className="border-t border-[#EBE8E2] pt-16">
            <h2 className="font-playfair text-2xl sm:text-3xl font-black text-gray-950 tracking-tight uppercase mb-8">Recently Viewed Products</h2>
            
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-250">
              {recentlyViewed.map(item => {
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
                      <p className="text-xs font-bold text-gray-990 mt-1 font-poppins">₹{currentPrice.toLocaleString('en-IN')}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Address Selection Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white border border-[#EBE8E2] rounded-[24px] p-6 shadow-xl max-w-md w-full relative z-10 space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#EBE8E2]">
                <h3 className="font-poppins font-bold text-gray-950 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-900" />
                  Your Saved Addresses
                </h3>
                <button 
                  onClick={() => setShowAddressModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Address List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {(!user?.addresses || user.addresses.length === 0) ? (
                  <p className="text-xs text-gray-400 font-poppins text-center py-6">No saved places found.</p>
                ) : (
                  user.addresses.map((addr) => (
                    <div 
                      key={addr._id || addr.id}
                      className="border border-[#E5E2DA] rounded-xl p-3.5 hover:border-red-900/60 transition-colors flex justify-between items-start gap-4"
                    >
                      <div className="text-left space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-gray-950 font-poppins">{addr.name || 'Address'}</span>
                          {addr.isDefault && (
                            <span className="text-[7px] font-bold text-red-900 bg-rose-50 border border-rose-100 rounded px-1 uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 font-poppins line-clamp-2">
                          {addr.street}, {addr.district}, {addr.state} – {addr.pincode}
                        </p>
                        <p className="text-[10px] text-gray-400 font-poppins">Phone: {addr.phone}</p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleSelectAddress(addr)}
                          className="p-1.5 bg-rose-50 hover:bg-red-900 text-red-900 hover:text-white rounded-lg transition-all"
                          title="Select Address"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditAddressClick(addr)}
                          className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-all"
                          title="Edit Address"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr._id || addr.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                          title="Delete Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-[#EBE8E2]">
                <button
                  onClick={handleAddNewAddressClick}
                  className="w-full bg-[#111827] hover:bg-gray-950 text-white text-xs font-bold font-poppins py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Address
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Address Form Editor Modal */}
      <AnimatePresence>
        {showAddressEditor && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressEditor(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white border border-[#EBE8E2] rounded-[24px] p-6 shadow-xl max-w-sm w-full relative z-10 space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#EBE8E2]">
                <h3 className="font-poppins font-bold text-gray-950 text-sm">
                  {editingAddress ? 'Modify Address' : 'New Delivery Address'}
                </h3>
                <button 
                  onClick={() => setShowAddressEditor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs font-poppins text-left">
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    placeholder="Recipient's Name"
                    className="w-full bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-900/30 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    maxLength="10"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-900/30 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    placeholder="Door No, Street name, Area"
                    className="w-full bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-900/30 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">District</label>
                    <select
                      value={addrDistrict}
                      onChange={(e) => setAddrDistrict(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-900/30 outline-none"
                    >
                      {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="Other">Other District</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Pincode</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value)}
                      placeholder="638001"
                      className="w-full bg-[#FAF9F6] border border-[#E5E2DA] rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-900/30 outline-none"
                      required
                    />
                  </div>
                </div>

                {addrDistrict.toLowerCase() === 'erode' && (
                  <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-[9px] font-bold uppercase tracking-wider text-center">
                    🎉 Free Shipping Eligible!
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="addrDefault"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="rounded text-red-900 focus:ring-red-900"
                  />
                  <label htmlFor="addrDefault" className="text-[10px] font-semibold text-gray-600 font-poppins select-none">
                    Set as default address
                  </label>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddressEditor(false)}
                    className="flex-1 py-2.5 bg-gray-50 border border-[#EBE8E2] text-[#111827] rounded-xl font-bold font-poppins text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-red-900 hover:bg-[#5E1914] text-white rounded-xl font-bold font-poppins text-xs"
                  >
                    Save Address
                  </button>
                </div>
              </form>
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
