import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Check, Calendar, Truck, ArrowLeft, ShieldCheck, 
  MapPin, Gift, Award, HelpCircle 
} from 'lucide-react';

export default function OrderTracking() {
  const { orderId } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderTracking = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/track/${orderId}`);
        const data = await response.json();
        if (response.ok) {
          setOrder(data);
        } else {
          setError(data.message || 'Unable to load tracking details.');
        }
      } catch (err) {
        setError('Network error loading tracking information.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderTracking();
  }, [orderId]);

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

  const statusSteps = [
    { label: 'Order Confirmed', description: 'Your order has been verified.' },
    { label: 'Preparing', description: 'We are preparing your items.' },
    { label: 'Packed', description: 'Order has been secure-packed.' },
    { label: 'Shipped', description: 'Package is with our courier partner.' },
    { label: 'Out for Delivery', description: 'Package will reach you today.' },
    { label: 'Delivered', description: 'Successfully handed over.' }
  ];

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-32 text-center">
        <span className="w-10 h-10 border-4 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin inline-block" />
        <p className="text-xs text-gray-500 mt-2 font-poppins font-semibold">Resolving package routing...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
        <div className="text-amber-500 text-5xl">🔍</div>
        <h2 className="font-playfair text-xl font-bold text-gray-900">Track Order</h2>
        <p className="text-xs text-gray-500">{error || 'Could not find tracking logs for this order ID.'}</p>
        <div className="pt-4 flex flex-col gap-2">
          <Link to="/" className="inline-block bg-emerald-900 text-white text-xs font-bold px-6 py-2.5 rounded-lg uppercase tracking-wider">
            Go to Homepage
          </Link>
          <Link to="/my-orders" className="text-xs text-emerald-800 underline font-semibold">
            View Purchase History
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = order.orderStatus || 'Order Confirmed';
  const isCancelled = currentStatus === 'Cancelled';
  
  // Find current index of status in steps
  const activeIndex = statusSteps.findIndex(step => step.label.toLowerCase() === currentStatus.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 sm:py-20 text-left">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        
        {/* Back Link */}
        <div>
          <Link to="/my-orders" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-emerald-950 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-playfair text-4xl font-extrabold text-gray-950">Track Shipment</h1>
          <p className="text-xs text-gray-500 font-poppins">
            Real-time fulfillment stages from our warehouse to your doorstep.
          </p>
        </div>

        {/* Shipment Details Bar */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-poppins">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Tracking Order ID</span>
            <span className="font-bold text-gray-900 font-mono text-sm">{order.customOrderId || order.id}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Courier / Partner</span>
            <span className="font-semibold text-gray-700">{order.courierPartner || 'DTDC'}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Tracking Reference ID</span>
            <span className="font-semibold text-gray-800 font-mono">{order.trackingNumber || 'Awaiting dispatch details'}</span>
          </div>
        </div>

        {/* Cancelled View or Timeline View */}
        {isCancelled ? (
          <div className="bg-red-50 border border-red-150 rounded-3xl p-6 text-center space-y-3">
            <div className="text-red-500 text-4xl">🚫</div>
            <h3 className="font-playfair text-lg font-bold text-red-950">Fulfillment Cancelled</h3>
            <p className="text-xs text-red-700 leading-relaxed max-w-sm mx-auto">
              This order has been cancelled and package transit is stopped. If this was a mistake, please reach out to our team at support@gramathuboutique.com.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-premium space-y-8">
            
            {/* Expected Delivery details header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Expected Delivery Date</h4>
                <p className="text-base sm:text-lg font-extrabold text-emerald-900">{formatDate(order.estimatedDeliveryDate)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            {/* Stepper timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-8 text-xs font-poppins">
              {/* Connecting Line */}
              <div className="absolute left-[11px] sm:left-[15px] top-1.5 bottom-1.5 w-[2px] bg-slate-100" />
              
              {/* Status Step Render */}
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div key={idx} className="relative flex gap-4 sm:gap-6 items-start">
                    
                    {/* Circle Node */}
                    <div className={`absolute -left-[20px] sm:-left-[24px] w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                      isCompleted 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-300'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>

                    {/* Step details content */}
                    <div className="flex-1 pl-4">
                      <h5 className={`font-bold transition-colors ${
                        isCurrent ? 'text-emerald-800 font-extrabold text-sm' : (isCompleted ? 'text-gray-900 font-bold' : 'text-gray-400')
                      }`}>
                        {step.label}
                      </h5>
                      <p className={`mt-0.5 text-[11px] leading-relaxed transition-colors ${
                        isCurrent ? 'text-gray-700 font-medium' : (isCompleted ? 'text-gray-500' : 'text-gray-400')
                      }`}>
                        {step.description}
                      </p>
                    </div>

                    {/* Status badge details */}
                    {isCurrent && (
                      <span className="flex-shrink-0 self-center text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-100 rounded uppercase tracking-wider animate-pulse">
                        Active Stage
                      </span>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Current status description panel */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl leading-relaxed text-xs text-emerald-800 font-medium font-poppins flex gap-3">
              <Gift className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">
                  {activeIndex === 5 ? 'Order Delivered' : `Fulfillment Stage: ${currentStatus}`}
                </p>
                <p className="text-[11px] text-emerald-900/80 mt-0.5">
                  {activeIndex === 0 && 'Your order details have been stored and confirmed. Our packaging team is retrieving your premium sarees from the inventory.'}
                  {activeIndex === 1 && 'Our cataloging agents are reviewing saree weave folds, borders, and threads to match our high quality assurance checks.'}
                  {activeIndex === 2 && 'Your sarees are secure-packed in luxury customized gift packaging boxes to guarantee zero damage during transit.'}
                  {activeIndex === 3 && `The package has been handed over to ${order.courierPartner || 'DTDC'} under Tracking Number: ${order.trackingNumber}.`}
                  {activeIndex === 4 && 'The dispatch manager reports the parcel is out for delivery. Keep your phone reachable for courier delivery updates.'}
                  {activeIndex === 5 && 'The shipment has been successfully handed over to you. We hope you fall in love with your new heritage saree weave.'}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Customer Address Details box */}
        <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Delivery Details</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed font-poppins">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Customer Name</span>
              <p className="font-semibold text-gray-900">{order.customerName || 'Guest Customer'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Destination Address</span>
              <p className="font-medium text-gray-600">
                {order.shippingAddress.street},<br />
                {order.shippingAddress.district}, Tamil Nadu - {order.shippingAddress.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Helper footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-400 font-poppins uppercase tracking-wider pt-4 border-t border-gray-100">
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Authentic product guarantee</span>
          <span className="flex items-center gap-1"><Award className="w-4 h-4 text-[#d97706]" /> 7 days exchange window</span>
          <span className="flex items-center gap-1"><HelpCircle className="w-4 h-4 text-[#6366F1]" /> support@gramathuboutique.com</span>
        </div>

      </div>
    </div>
  );
}
