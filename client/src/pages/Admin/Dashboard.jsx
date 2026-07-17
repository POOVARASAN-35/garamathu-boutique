import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  TrendingUp, ShieldAlert, LayoutDashboard, ShoppingBag, 
  FolderOpen, ClipboardList, Users, DollarSign 
} from 'lucide-react';
import { fetchAdminOrders, fetchAdminCustomers } from '../../store/adminSlice.js';
import { fetchSarees, fetchCategories } from '../../store/productSlice.js';

export default function Dashboard() {
  const dispatch = useDispatch();

  const { orders, customers } = useSelector((state) => state.admin);
  const { sarees, categories } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchAdminOrders());
    dispatch(fetchAdminCustomers());
    dispatch(fetchSarees({ limit: 100, adminView: 'true' }));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Calculable Admin Dashboard Metrics
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending');
  const lowStockSarees = sarees.filter(s => s.stock <= 5);

  return (
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
  );
}
