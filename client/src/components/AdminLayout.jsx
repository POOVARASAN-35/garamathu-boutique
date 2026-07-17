import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, ShoppingBag, FolderOpen, ClipboardList, 
  Users, Truck, Settings, LogOut 
} from 'lucide-react';
import { logoutAdminThunk } from '../store/adminSlice.js';
import { useToast } from '../context/ToastContext.jsx';

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentAdmin } = useSelector((state) => state.admin);

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

  return (
    <div className="flex min-h-screen bg-sand-100/50 pt-0 text-left select-none">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-emerald-900 text-white flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-gold-500/20">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-2.5 select-none text-left">
            <img src="/logo.png" alt="Gramathu Boutique Logo" className="h-9 w-auto rounded-full bg-white border border-gold-500/10 p-0.5" />
            <div className="flex flex-col leading-none">
              <span className="font-playfair text-base font-bold tracking-[0.15em] text-white uppercase">Admin</span>
              <span className="font-montserrat text-[8px] tracking-[0.3em] text-gold-500 font-medium uppercase mt-1">Control Panel</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                  isActive
                    ? 'bg-gold-500 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gold-500/10 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer / Admin Meta */}
        <div className="p-6 border-t border-gold-500/10 space-y-4">
          {currentAdmin && (
            <div className="flex flex-col text-left text-xs bg-emerald-950/40 p-3 rounded-xl border border-gold-500/5">
              <span className="font-bold text-gray-200 truncate">{currentAdmin.name}</span>
              <span className="text-[10px] text-gold-500 uppercase font-semibold tracking-wider mt-0.5">{currentAdmin.role}</span>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs text-rose-300 hover:bg-rose-900/10 hover:text-rose-200 rounded-lg font-semibold transition-colors uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            Admin Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
