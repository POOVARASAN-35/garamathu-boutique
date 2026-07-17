import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle, Calendar, Package, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setOrder(data);
        } else {
          setError(data.message || 'Failed to retrieve order details.');
        }
      } catch (err) {
        setError('Network error loading success details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    const d = new Date(dateVal);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-32 text-center">
        <span className="w-10 h-10 border-4 border-emerald-900/30 border-t-emerald-900 rounded-full animate-spin inline-block" />
        <p className="text-xs text-gray-500 mt-2 font-poppins font-medium">Securing order receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
        <div className="text-red-500 text-5xl">⚠️</div>
        <h2 className="font-playfair text-xl font-bold text-gray-900">Order Confirmation Error</h2>
        <p className="text-xs text-gray-500">{error || "Could not load order details. Please check 'My Orders' history."}</p>
        <Link to="/my-orders" className="inline-block bg-emerald-900 text-white text-xs font-bold px-6 py-2.5 rounded-lg uppercase tracking-wider">
          Go to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-[#F8FAFC] py-16 sm:py-24 flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto px-4 text-center space-y-8">
        
        {/* Animated Success Badge */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="font-playfair text-4xl font-extrabold text-emerald-950">Order Confirmed 🎉</h1>
          <p className="text-xs text-gray-500 max-w-sm">
            Thank you Poovarasan! Your order has been successfully placed. We've sent a confirmation email & SMS.
          </p>
        </div>

        {/* Amazon/Flipkart Style Receipt Card */}
        <div className="bg-white border border-gray-150 rounded-3xl p-6 text-left shadow-premium space-y-6">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100 text-xs font-poppins">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Order ID</span>
              <span className="font-bold text-gray-900 font-mono text-sm">{order.customOrderId || order.id}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Estimated Delivery</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(order.estimatedDeliveryDate)}
              </span>
            </div>
            <div className="space-y-1 pt-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Delivery Method</span>
              <span className="font-semibold text-gray-700">Standard Delivery</span>
            </div>
            <div className="space-y-1 pt-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Tracking Status</span>
              <span className="font-bold text-amber-600 uppercase text-[10px] tracking-wider bg-amber-50 px-2 py-0.5 border border-amber-100 rounded">
                {order.orderStatus === 'Order Confirmed' ? 'Preparing your order' : order.orderStatus}
              </span>
            </div>
          </div>

          {/* Delivery Address Snapshot */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Shipping Address</span>
            <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 leading-relaxed font-medium text-gray-600">
              <p className="font-bold text-gray-900">{order.customerName || 'Poovarasan'}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.district}, Tamil Nadu - {order.shippingAddress.pincode}</p>
              <p className="pt-1.5 font-bold font-mono text-gray-900">PH: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Items Summary list */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Items Ordered</span>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 py-3 items-center">
                  <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-lg border border-gray-100 bg-white" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                    <span className="text-[10px] text-gray-400">Qty: {item.quantity || 1}</span>
                  </div>
                  <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals summary */}
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-poppins">
            <span className="font-bold text-gray-900 text-sm">Total Paid:</span>
            <span className="font-extrabold text-emerald-900 text-base">₹{(order.total || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center text-xs font-poppins">
          <Link
            to={`/track-order/${order.customOrderId || order.id}`}
            className="bg-emerald-900 hover:bg-gold-500 text-white font-bold px-8 py-3.5 rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-md active:scale-95"
          >
            Track My Order <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 font-bold px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all active:scale-95"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="flex justify-center items-center gap-4 text-[10px] font-bold text-gray-400 font-poppins uppercase tracking-wider pt-4">
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure checkout</span>
          <span>&middot;</span>
          <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-[#6366F1]" /> support@gramathuboutique.com</span>
        </div>

      </div>
    </div>
  );
}
