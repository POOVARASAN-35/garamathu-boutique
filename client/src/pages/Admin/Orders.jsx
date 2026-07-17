import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../context/ToastContext.jsx';
import { fetchAdminOrders, updateOrderStatus } from '../../store/adminSlice.js';
import { Truck, X, Search, Clock } from 'lucide-react';

export default function Orders() {
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const { orders } = useSelector((state) => state.admin);

  // States
  const [shippingModalOrder, setShippingModalOrder] = useState(null);
  const [courierPartner, setCourierPartner] = useState('DTDC');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Filter States
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('All');
  const [adminSort, setAdminSort] = useState('newest');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [adminSearch, adminStatusFilter, adminSort, itemsPerPage]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'Shipped') {
      setShippingModalOrder({ id: orderId, status: newStatus });
      setCourierPartner('DTDC');
      setTrackingNumber('');
      return;
    }
    submitStatusUpdate(orderId, newStatus);
  };

  const submitStatusUpdate = async (orderId, newStatus, extraParams = {}) => {
    const result = await dispatch(
      updateOrderStatus({
        id: orderId,
        status: newStatus,
        ...extraParams
      })
    );

    if (updateOrderStatus.fulfilled.match(result)) {
      addToast(`Order ${orderId} updated to ${newStatus}!`, 'success');
      dispatch(fetchAdminOrders());
    } else {
      addToast('Status update failed.', 'error');
    }
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      addToast('Tracking number is required.', 'warning');
      return;
    }
    submitStatusUpdate(shippingModalOrder.id, shippingModalOrder.status, {
      courierPartner,
      trackingNumber: trackingNumber.trim()
    });
    setShippingModalOrder(null);
  };

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = 
        (o.customOrderId || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
        (o._id || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
        (o.customerName || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
        (o.email || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
        (o.shippingAddress?.district || '').toLowerCase().includes(adminSearch.toLowerCase());

      const matchStatus = adminStatusFilter === 'All' || o.orderStatus === adminStatusFilter;

      return matchSearch && matchStatus;
    }).sort((a, b) => {
      if (adminSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (adminSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (adminSort === 'price-high') return (b.total || 0) - (a.total || 0);
      if (adminSort === 'price-low') return (a.total || 0) - (b.total || 0);
      return 0;
    });
  }, [orders, adminSearch, adminStatusFilter, adminSort]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'Preparing':
      case 'Packed':
      case 'Processing':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'Cancelled':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'Order Confirmed':
      case 'Pending':
      default:
        return 'bg-gray-150 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 relative">
      
      <div className="text-left">
        <h2 className="font-playfair text-2xl font-bold text-emerald-950">Customer Orders</h2>
        <p className="text-xs text-gold-600 font-montserrat tracking-widest mt-1 uppercase">Track payments and manage shipping stages</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-gold-500/10 rounded-2xl p-4.5 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 font-poppins text-xs font-semibold text-emerald-950 text-left">
        <div className="space-y-1">
          <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Search Orders</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              placeholder="ID, name, email, district..."
              className="w-full bg-slate-50 border border-gray-250 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Order Status</label>
          <select
            value={adminStatusFilter}
            onChange={(e) => setAdminStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-gray-250 rounded-lg p-2 text-xs focus:outline-none font-semibold text-emerald-950"
          >
            <option value="All">All Statuses</option>
            <option value="Order Confirmed">Order Confirmed</option>
            <option value="Preparing">Preparing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Sort Orders</label>
          <select
            value={adminSort}
            onChange={(e) => setAdminSort(e.target.value)}
            className="w-full bg-slate-50 border border-gray-250 rounded-lg p-2 text-xs focus:outline-none font-semibold text-emerald-950"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Total: High to Low</option>
            <option value="price-low">Total: Low to High</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Items Per Page</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="w-full bg-slate-50 border border-gray-250 rounded-lg p-2 text-xs focus:outline-none font-semibold text-emerald-950"
          >
            <option value={5}>5 Orders</option>
            <option value={10}>10 Orders</option>
            <option value={20}>20 Orders</option>
            <option value={50}>50 Orders</option>
          </select>
        </div>
      </div>

      {/* Orders list table */}
      <div className="bg-white border border-gold-500/10 rounded-2xl shadow-sm overflow-hidden text-left font-poppins">
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
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400 font-semibold uppercase">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                currentItems.map((o) => (
                  <tr key={o._id} className="hover:bg-sand-50/50">
                    <td className="px-5 py-3.5 font-bold font-mono text-emerald-900">
                      {o.customOrderId || `GB-ORD-${o._id.toString().substring(0, 6)}`}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold">{o.customerName}</p>
                      <span className="text-[9px] text-gray-400 block">{o.email}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{o.shippingAddress?.district || 'N/A'}</td>
                    <td className="px-5 py-3.5 font-montserrat font-bold text-emerald-950">₹{o.total?.toLocaleString('en-IN') || 0}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusColor(o.orderStatus)}`}>
                        {o.orderStatus}
                      </span>
                      {o.orderStatus === 'Shipped' && o.trackingNumber && (
                        <span className="text-[9px] text-gray-400 block mt-1 font-semibold font-mono">
                          {o.courierPartner}: {o.trackingNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <select
                        value={o.orderStatus || 'Order Confirmed'}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        className="bg-sand-50 border border-gold-500/20 rounded px-2.5 py-1 text-[11px] font-semibold focus:outline-none"
                      >
                        <option value="Order Confirmed">Order Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls footer */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-gold-500/10 px-5 py-4 flex items-center justify-between font-poppins text-xs font-semibold text-emerald-950">
            <span className="text-gray-400 font-bold uppercase tracking-wider">
              Page {currentPage} of {totalPages} &middot; Total {filteredOrders.length} orders
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white border border-gray-200 hover:bg-slate-100 disabled:opacity-50 text-gray-700 font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    currentPage === idx + 1
                      ? 'bg-emerald-900 text-white'
                      : 'bg-white border border-gray-200 hover:bg-slate-100 text-gray-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-white border border-gray-200 hover:bg-slate-100 disabled:opacity-50 text-gray-700 font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Courier & Tracking Modal Popup for Shipped Transition */}
      {shippingModalOrder && (
        <div className="fixed inset-0 bg-[#020617]/50 flex items-center justify-center z-50 p-4 font-poppins text-xs">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-sm w-full p-6 space-y-4 shadow-luxury animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-playfair text-base font-bold text-gray-900 flex items-center gap-1.5">
                <Truck className="w-5 h-5 text-indigo-650" />
                Shipping Details
              </h3>
              <button 
                onClick={() => setShippingModalOrder(null)} 
                className="p-1 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleShippingSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase block tracking-wider">Courier Partner</label>
                <select
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="DTDC">DTDC</option>
                  <option value="Professional Courier">Professional Courier</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="Speed Post">Speed Post</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase block tracking-wider">Tracking Reference Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TRK89343434"
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#6366F1]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#064e3b] hover:bg-[#d97706] text-white font-montserrat font-bold py-3 text-xs tracking-wider uppercase rounded-xl transition-colors shadow-sm"
              >
                Dispatch Shipment
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
