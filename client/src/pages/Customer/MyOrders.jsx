import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, ChevronDown, ChevronUp, Calendar, ShieldAlert,
  Search, SlidersHorizontal, Package, AlertCircle, CheckCircle, ArrowRight,
  ShieldCheck, RefreshCw, Star, MapPin, X, Copy, Mail, ExternalLink, Download,
  Truck, ArrowUpRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { addToCart } from '../../store/cartSlice.js';
import { fetchSarees } from '../../store/productSlice.js';

export default function MyOrders() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { token } = useSelector((state) => state.auth);
  const { sarees } = useSelector((state) => state.products);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('LastYear');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Modal details state
  const [selectedDetailsOrder, setSelectedDetailsOrder] = useState(null);

  // Review Modal state
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Recently Viewed state
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Fetch orders from server
  const fetchMyOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
        // Expand order from hash if applicable
        const hash = location.hash;
        if (hash && hash.startsWith('#invoice-')) {
          const ordId = hash.replace('#invoice-', '');
          setExpandedOrderId(ordId);
        }
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
    dispatch(fetchSarees({ limit: 100 }));
  }, [token, location.hash, dispatch]);

  // Load recently viewed
  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('gb_recently_viewed') || '[]');
      if (ids.length > 0 && sarees.length > 0) {
        const filtered = ids.map(idVal => sarees.find(s => s.id === idVal)).filter(Boolean);
        setRecentlyViewed(filtered);
      }
    } catch (e) {}
  }, [sarees]);

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Order ID Copied to Clipboard 📋', 'success');
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      addToast('Generating invoice PDF...', 'loading');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/invoice/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        addToast('Invoice Downloaded Successfully 🎉', 'success');
      } else {
        addToast('Failed to download invoice.', 'error');
      }
    } catch (e) {
      addToast('Error downloading invoice.', 'error');
    }
  };

  const handleBuyAgain = (item) => {
    // Build a compatible product object for cart
    const prodObj = sarees.find(s => s.id === item.productId) || {
      _id: item.productId,
      id: item.productId,
      productName: item.name,
      price: item.price,
      images: [item.image]
    };
    dispatch(addToCart({ product: prodObj, quantity: 1 }));
    addToast(`${item.name} added to cart!`, 'success');
    navigate('/cart');
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/cancel`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      if (response.ok) {
        addToast('Order Cancelled Successfully 🎉', 'success');
        fetchMyOrders();
      } else {
        addToast(data.message || 'Failed to cancel order.', 'error');
      }
    } catch (e) {
      addToast('Error cancelling order.', 'error');
    }
  };

  const handleReturnOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to return this product?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      if (response.ok) {
        addToast('Order Return Request Submitted Successfully 🎉', 'success');
        fetchMyOrders();
      } else {
        addToast(data.message || 'Failed to return order.', 'error');
      }
    } catch (e) {
      addToast('Error returning order.', 'error');
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      addToast('Please enter a comment.', 'warning');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: reviewingProduct.productId,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      const data = await response.json();
      if (response.ok) {
        addToast('Review Submitted Successfully 🎉', 'success');
        setReviewingProduct(null);
        setReviewComment('');
        setReviewRating(5);
      } else {
        addToast(data.message || 'Failed to submit review.', 'error');
      }
    } catch (e) {
      addToast('Error submitting review.', 'error');
    }
  };

  // Statistics memo
  const stats = useMemo(() => {
    const total = orders.length;
    const transit = orders.filter(o => ['Shipped', 'Out for Delivery'].includes(o.orderStatus)).length;
    const delivered = orders.filter(o => o.orderStatus === 'Delivered').length;
    const cancelled = orders.filter(o => o.orderStatus === 'Cancelled').length;
    return { total, transit, delivered, cancelled };
  }, [orders]);

  // Filter & Search logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Live Search
      const searchMatch = 
        (order.customOrderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(i => (i.name || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.items.some(i => (i.productId || '').toLowerCase().includes(searchTerm.toLowerCase()));

      if (!searchMatch) return false;

      // 2. Status Filter
      if (statusFilter !== 'All' && (order.orderStatus || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // 3. Payment Status Filter
      if (paymentFilter !== 'All' && (order.paymentStatus || '').toLowerCase() !== paymentFilter.toLowerCase()) {
        return false;
      }

      // 4. Time Filter
      const orderDate = new Date(order.createdAt);
      const diffTime = Math.abs(new Date() - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (timeFilter === 'Last30Days' && diffDays > 30) return false;
      if (timeFilter === 'Last6Months' && diffDays > 180) return false;
      if (timeFilter === 'LastYear' && diffDays > 365) return false;

      return true;
    });
  }, [orders, searchTerm, statusFilter, timeFilter, paymentFilter]);

  const getStatusBadge = (status) => {
    const colors = {
      'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'Shipped': 'bg-blue-50 text-blue-700 border-blue-100',
      'Out for Delivery': 'bg-purple-50 text-purple-700 border-purple-100',
      'Preparing': 'bg-yellow-50 text-yellow-700 border-yellow-100',
      'Packed': 'bg-orange-50 text-orange-700 border-orange-100',
      'Cancelled': 'bg-rose-50 text-rose-700 border-rose-100',
      'Refunded': 'bg-red-50 text-red-700 border-red-100',
      'Pending': 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusDot = (status) => {
    const colors = {
      'Delivered': '🟢',
      'Shipped': '🔵',
      'Out for Delivery': '🟣',
      'Preparing': '🟡',
      'Packed': '🟠',
      'Cancelled': '🔴',
      'Refunded': '🔴',
      'Pending': '⚪'
    };
    return colors[status] || '⚪';
  };

  const formatLocalDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    return new Date(dateVal).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const recommendedSarees = useMemo(() => {
    return sarees.filter(s => s.isFeatured || s.rating >= 4.8).slice(0, 4);
  }, [sarees]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-[#111827] text-left selection:bg-indigo-100">
      
      {/* breadcrumb & Header */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 font-poppins">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <span>&middot;</span>
          <span className="text-gray-900 font-bold">My Orders</span>
        </nav>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-playfair text-4xl sm:text-5xl font-black text-[#111827] leading-none">
            My <span className="italic font-normal text-indigo-600">Orders</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-poppins max-w-xl">
            Track your orders, manage purchases, download invoices, and reorder your favorite sarees.
          </p>
        </div>

        {!token ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white border border-gray-200 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-playfair text-lg font-bold text-gray-900">Authentication Required</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">Please log in to view your boutique order dashboard.</p>
            </div>
            <Link to="/login" className="inline-block bg-[#111827] hover:bg-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-lg uppercase tracking-wider transition-colors shadow-sm">
              Log In
            </Link>
          </div>
        ) : (
          <>
            {/* 1. Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', val: stats.total, icon: '📦', color: 'from-blue-50 to-indigo-50/10' },
                { label: 'In Transit', val: stats.transit, icon: '🚚', color: 'from-amber-50 to-yellow-50/10' },
                { label: 'Delivered', val: stats.delivered, icon: '✅', color: 'from-emerald-50 to-green-50/10' },
                { label: 'Cancelled', val: stats.cancelled, icon: '❌', color: 'from-rose-50 to-red-50/10' }
              ].map((s, idx) => (
                <div key={idx} className={`bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all`}>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-poppins">{s.label}</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-montserrat">{s.val}</span>
                  </div>
                  <div className="text-2xl">{s.icon}</div>
                </div>
              ))}
            </div>

            {/* 2. Filter & Search Controls */}
            <div className="bg-white border border-gray-150 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Order ID, Product Name, or Code..."
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                {/* Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-slate-50 hover:bg-slate-100 border border-gray-200 text-[#111827] font-bold text-xs px-5 py-3 rounded-2xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                  {showFilters ? 'Hide Filters' : 'Filters'}
                </button>
              </div>

              {/* Collapsible Filter Bar */}
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs font-poppins font-medium text-gray-650">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Order Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-250 rounded-xl p-2.5 focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Preparing">Processing / Preparing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Time Period</label>
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-250 rounded-xl p-2.5 focus:outline-none"
                    >
                      <option value="Last30Days">Last 30 Days</option>
                      <option value="Last6Months">Last 6 Months</option>
                      <option value="LastYear">Last Year</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Payment Status</label>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-250 rounded-xl p-2.5 focus:outline-none"
                    >
                      <option value="All">All Payments</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Orders Grid/List */}
            {loading ? (
              <div className="py-20 text-center">
                <span className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-650 rounded-full animate-spin inline-block" />
                <p className="text-xs text-gray-400 mt-2 font-poppins">Querying order transactions...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              /* Empty state block */
              <div className="bg-white border border-gray-150 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-5">
                <div className="text-5xl">🛍️</div>
                <div className="space-y-1">
                  <h3 className="font-playfair text-xl font-bold text-gray-900">No Orders Yet</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                    Looks like you haven't purchased anything yet. Explore our premium saree collections.
                  </p>
                </div>
                <Link to="/" className="inline-block bg-[#111827] hover:bg-indigo-600 text-white text-xs font-bold px-8 py-3.5 rounded-xl uppercase tracking-wider transition-colors shadow-sm font-poppins">
                  Start Shopping
                </Link>
              </div>
            ) : (
              /* Orders display list */
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const currentStatus = order.orderStatus || 'Order Confirmed';
                  const isDelivered = currentStatus === 'Delivered';
                  const isCancelled = currentStatus === 'Cancelled';
                  const isRefunded = currentStatus === 'Refunded';

                  // Calculate cancel eligibility
                  const cancelEligible = ['Order Confirmed', 'Preparing', 'Packed', 'Pending'].includes(currentStatus);

                  // Calculate return eligibility (Delivered date within 7 days)
                  let returnEligible = false;
                  if (isDelivered && order.updatedAt) {
                    const deliveredDate = new Date(order.updatedAt);
                    const diffDays = Math.ceil(Math.abs(new Date() - deliveredDate) / (1000 * 60 * 60 * 24));
                    returnEligible = diffDays <= 7;
                  }

                  return (
                    <div
                      key={order._id}
                      className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-premium transition-all duration-300 grid grid-cols-1"
                    >
                      {/* Card Header details */}
                      <div className="bg-slate-50/80 px-6 py-4.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs font-poppins font-medium text-gray-500">
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Order ID</span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-[#111827] font-mono">{order.customOrderId || order.id}</span>
                              <button onClick={() => copyToClipboard(order.customOrderId || order.id)} className="text-gray-400 hover:text-[#111827]" title="Copy Order ID">
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Order Date</span>
                            <span className="font-semibold text-gray-700">{formatLocalDate(order.createdAt)}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Payment</span>
                            <span className="font-semibold text-gray-700">{order.paymentMethod} &middot; <span className={order.paymentStatus === 'Paid' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{order.paymentStatus}</span></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-400 text-[10px] uppercase tracking-wider">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border flex items-center gap-1 ${getStatusBadge(currentStatus)}`}>
                            <span>{getStatusDot(currentStatus)}</span>
                            {currentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Card Body details */}
                      <div className="p-6 space-y-6">
                        
                        {/* Products loop */}
                        <div className="divide-y divide-slate-100">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 sm:gap-6 py-4 first:pt-0 last:pb-0 items-center justify-between">
                              <div className="flex gap-4 items-center">
                                <img src={item.image} alt={item.name} className="w-14 h-18 object-cover rounded-xl border border-gray-100 bg-white" />
                                <div className="space-y-1">
                                  <h4 className="font-playfair text-sm sm:text-base font-bold text-gray-900">{item.name}</h4>
                                  <p className="text-[10px] text-gray-400 font-semibold font-poppins uppercase tracking-wider">SKU: {item.productId?.substring(18, 24) || 'GB-SREE'}</p>
                                  <p className="text-xs text-gray-500 font-poppins font-medium">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <div className="text-right space-y-1">
                                <span className="font-extrabold text-gray-900 text-sm sm:text-base">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                <button
                                  onClick={() => handleBuyAgain(item)}
                                  className="text-[10px] text-indigo-650 font-bold block hover:underline"
                                >
                                  Buy Again &rarr;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delivery timeline stepper tracker */}
                        {!isCancelled && !isRefunded && (
                          <div className="p-5 bg-slate-50 border border-gray-150 rounded-2xl space-y-4 text-xs font-poppins">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
                              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-indigo-600" />
                                {isDelivered ? 'Delivered On' : 'Estimated Delivery'}
                              </span>
                              <span className="font-extrabold text-emerald-900">
                                {formatLocalDate(order.estimatedDeliveryDate)}
                              </span>
                            </div>

                            {/* Horizontal timelines */}
                            <div className="flex justify-between items-center py-2 overflow-x-auto gap-4">
                              {['Order Placed', 'Payment Successful', 'Order Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                                // Determine matching step indexes based on status transitions
                                const statusMap = {
                                  'Order Confirmed': 2,
                                  'Preparing': 2,
                                  'Packed': 3,
                                  'Shipped': 4,
                                  'Out for Delivery': 5,
                                  'Delivered': 6
                                };
                                const targetIdx = statusMap[currentStatus] || 0;
                                const isCompleted = idx <= targetIdx;

                                return (
                                  <div key={idx} className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-[70px]">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-[8px] transition-colors ${
                                      isCompleted 
                                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                                        : 'bg-white border-gray-300 text-gray-300'
                                    }`}>
                                      {isCompleted ? '✓' : '○'}
                                    </div>
                                    <span className={`text-[8px] font-extrabold tracking-tight uppercase ${isCompleted ? 'text-gray-900' : 'text-gray-450'}`}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Courier logs info */}
                        {currentStatus === 'Shipped' && order.trackingNumber && (
                          <div className="flex flex-wrap items-center justify-between gap-4 p-4.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs font-poppins font-medium text-indigo-950">
                            <div className="flex items-center gap-3">
                              <span>Courier: <strong>{order.courierPartner || 'DTDC'}</strong></span>
                              <span className="text-gray-300">|</span>
                              <span>Tracking ID: <strong className="font-mono">{order.trackingNumber}</strong></span>
                            </div>
                            <Link
                              to={`/track-order/${order.customOrderId || order.id}`}
                              className="text-xs font-extrabold text-indigo-650 hover:underline flex items-center gap-0.5"
                            >
                              Track Shipment <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}

                        {/* Card Footer action button list */}
                        <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-100 text-xs font-poppins font-bold">
                          <button
                            onClick={() => setSelectedDetailsOrder(order)}
                            className="bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 px-5 py-3.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                          >
                            View Details
                          </button>
                          
                          <button
                            onClick={() => handleDownloadInvoice(order._id)}
                            className="bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 px-5 py-3.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" /> Download Invoice
                          </button>
                          
                          <Link
                            to={`/track-order/${order.customOrderId || order.id}`}
                            className="bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 px-5 py-3.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                          >
                            Track Status
                          </Link>

                          {/* Conditional Return/Cancel triggers */}
                          {cancelEligible && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="border border-rose-200 hover:bg-rose-50 text-rose-600 px-5 py-3.5 rounded-xl transition-all shadow-sm ml-auto"
                            >
                              Cancel Order
                            </button>
                          )}

                          {returnEligible && (
                            <button
                              onClick={() => handleReturnOrder(order._id)}
                              className="border border-rose-200 hover:bg-rose-50 text-rose-600 px-5 py-3.5 rounded-xl transition-all shadow-sm ml-auto"
                            >
                              Return Product
                            </button>
                          )}

                          {isDelivered && order.items.length > 0 && (
                            <button
                              onClick={() => setReviewingProduct(order.items[0])}
                              className="bg-[#111827] hover:bg-indigo-600 text-white px-5 py-3.5 rounded-xl transition-all shadow-md ml-auto"
                            >
                              Write Review
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. Recently Viewed horizontal list */}
            {recentlyViewed.length > 0 && (
              <div className="space-y-6 pt-8 text-left">
                <h3 className="font-playfair text-2xl font-bold text-gray-900 font-poppins">Recently Viewed Weaves</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 justify-start">
                  {recentlyViewed.map((saree) => (
                    <Link
                      key={saree.id}
                      to={`/product/${saree.id}`}
                      className="w-48 bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex-shrink-0"
                    >
                      <img src={saree.images[0]} alt={saree.productName} className="w-full h-52 object-cover" />
                      <div className="p-3 space-y-1">
                        <span className="text-[9px] text-[#6366F1] uppercase font-bold tracking-widest block">{saree.category}</span>
                        <h4 className="font-playfair font-bold text-gray-900 truncate">{saree.productName}</h4>
                        <span className="font-extrabold text-[#111827] text-xs">₹{(saree.offerPrice || saree.price).toLocaleString('en-IN')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 5. You May Also Like recommended list */}
            {recommendedSarees.length > 0 && (
              <div className="space-y-6 pt-6 text-left">
                <h3 className="font-playfair text-2xl font-bold text-gray-900 font-poppins">You May Also Like</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recommendedSarees.map((saree) => (
                    <Link
                      key={saree.id}
                      to={`/product/${saree.id}`}
                      className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <img src={saree.images[0]} alt={saree.productName} className="w-full h-56 object-cover" />
                      <div className="p-4.5 space-y-1 text-xs">
                        <span className="text-[9px] text-[#6366F1] uppercase font-bold tracking-widest block font-poppins">{saree.category}</span>
                        <h4 className="font-playfair font-bold text-gray-900 truncate text-sm">{saree.productName}</h4>
                        <div className="flex gap-2 items-baseline">
                          <span className="font-extrabold text-[#111827]">₹{(saree.offerPrice || saree.price).toLocaleString('en-IN')}</span>
                          {saree.offerPrice && <span className="text-[10px] text-gray-400 line-through">₹{saree.price.toLocaleString('en-IN')}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 6. Order Details Modal Overlay */}
      {selectedDetailsOrder && (
        <div className="fixed inset-0 bg-[#020617]/50 flex items-center justify-center z-50 p-4 font-poppins text-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-luxury my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-150">
              <h3 className="font-playfair text-lg font-bold text-[#111827]">Order details overview</h3>
              <button 
                onClick={() => setSelectedDetailsOrder(null)} 
                className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 text-left">
              
              {/* Receipt details */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Order ID</span>
                  <span className="font-bold text-gray-900 font-mono">{selectedDetailsOrder.customOrderId || selectedDetailsOrder.id}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Estimated Delivery</span>
                  <span className="font-semibold text-emerald-700">{formatLocalDate(selectedDetailsOrder.estimatedDeliveryDate)}</span>
                </div>
              </div>

              {/* Products list */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Ordered Items</span>
                <div className="divide-y divide-slate-100 bg-slate-50/50 border border-gray-100 rounded-2xl p-4 space-y-3">
                  {selectedDetailsOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center justify-between py-2 first:pt-0 last:pb-0">
                      <div className="flex gap-3 items-center">
                        <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-lg border border-gray-100 bg-white" />
                        <div>
                          <h5 className="font-playfair font-bold text-gray-900">{item.name}</h5>
                          <span className="text-[10px] text-gray-400">Quantity: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Shipping Address</span>
                  <div className="bg-slate-50/50 border border-gray-100 p-4 rounded-2xl leading-relaxed text-gray-600 font-medium">
                    <p className="font-bold text-gray-900">{selectedDetailsOrder.customerName || 'Customer'}</p>
                    <p>{selectedDetailsOrder.shippingAddress.street}</p>
                    <p>{selectedDetailsOrder.shippingAddress.district}, Tamil Nadu - {selectedDetailsOrder.shippingAddress.pincode}</p>
                    <p className="pt-1.5 font-bold font-mono text-gray-900">PH: {selectedDetailsOrder.shippingAddress.phone}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Billing Address</span>
                  <div className="bg-slate-50/50 border border-gray-100 p-4 rounded-2xl leading-relaxed text-gray-600 font-medium">
                    <p className="font-bold text-gray-900">{selectedDetailsOrder.customerName || 'Customer'}</p>
                    <p>{selectedDetailsOrder.shippingAddress.street}</p>
                    <p>{selectedDetailsOrder.shippingAddress.district}, Tamil Nadu - {selectedDetailsOrder.shippingAddress.pincode}</p>
                    <p className="pt-1.5 font-bold font-mono text-gray-900">PH: {selectedDetailsOrder.shippingAddress.phone}</p>
                  </div>
                </div>
              </div>

              {/* Pricing subtotal detail sheet */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Payment Calculation</span>
                <div className="bg-slate-50/50 border border-gray-100 rounded-2xl p-4.5 space-y-2">
                  <div className="flex justify-between font-medium text-gray-500">
                    <span>Subtotal Price</span>
                    <span>₹{(selectedDetailsOrder.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {selectedDetailsOrder.discount > 0 && (
                    <div className="flex justify-between font-medium text-rose-600">
                      <span>Discount Coupon</span>
                      <span>-₹{(selectedDetailsOrder.discount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-gray-500">
                    <span>CGST (9%)</span>
                    <span>₹{Math.round(((selectedDetailsOrder.subtotal || 0) / 1.18) * 0.09).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-500">
                    <span>SGST (9%)</span>
                    <span>₹{Math.round(((selectedDetailsOrder.subtotal || 0) / 1.18) * 0.09).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-500">
                    <span>Shipping Charges</span>
                    <span>{selectedDetailsOrder.shippingCharge === 0 ? 'FREE' : `₹${selectedDetailsOrder.shippingCharge.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div className="h-[1px] bg-slate-200/60 my-1.5" />
                  <div className="flex justify-between text-sm font-extrabold text-[#111827]">
                    <span>Grand Total Paid</span>
                    <span>₹{(selectedDetailsOrder.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons modal */}
              <div className="flex gap-3 justify-end pt-3">
                <button
                  onClick={() => {
                    handleDownloadInvoice(selectedDetailsOrder._id);
                    setSelectedDetailsOrder(null);
                  }}
                  className="bg-[#111827] hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl transition-colors shadow-sm"
                >
                  Download Receipt
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 7. Product Review Form Modal Overlay */}
      {reviewingProduct && (
        <div className="fixed inset-0 bg-[#020617]/50 flex items-center justify-center z-50 p-4 font-poppins text-xs">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-md w-full p-6 space-y-4 shadow-luxury text-left">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-playfair text-base font-bold text-gray-900">Write Product Review</h3>
              <button 
                onClick={() => setReviewingProduct(null)} 
                className="p-1 text-gray-400 hover:text-gray-900 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostReview} className="space-y-4">
              <div className="flex items-center gap-3.5 p-3 bg-slate-50 border border-gray-100 rounded-2xl">
                <img src={reviewingProduct.image} alt={reviewingProduct.name} className="w-12 h-15 object-cover rounded-lg" />
                <div>
                  <h4 className="font-playfair font-bold text-gray-900">{reviewingProduct.name}</h4>
                  <span className="text-[10px] text-gray-450">Fulfillment Verified</span>
                </div>
              </div>

              {/* Rating selection stars */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase block">Rating Score</label>
                <div className="flex gap-1.5 text-amber-500 text-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase block">Your Review comments</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us what you loved about this premium weave saree fold, border, texture, and look..."
                  className="w-full bg-slate-50 border border-gray-250 rounded-2xl p-3 h-24 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#111827] hover:bg-indigo-650 text-white font-montserrat font-bold py-3 text-xs tracking-wider uppercase rounded-xl transition-colors shadow-sm"
              >
                Submit Review Rating
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
