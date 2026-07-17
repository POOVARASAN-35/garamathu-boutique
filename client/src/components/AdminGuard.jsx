import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function AdminGuard({ children }) {
  const { adminToken } = useSelector((state) => state.admin);
  const { token: customerToken } = useSelector((state) => state.auth);

  if (!adminToken) {
    if (customerToken) {
      // Logged in as a customer, display styled Access Denied page
      return (
        <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-6 text-center select-none relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-950/20 rounded-full blur-3xl pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-[#161C2A] rounded-3xl border border-red-900/30 p-8 space-y-6 shadow-2xl relative z-10"
          >
            <div className="w-16 h-16 bg-red-950/50 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-900/30 shadow-lg">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="font-playfair text-2xl font-black uppercase tracking-wider text-white">
                Access Denied
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-poppins">
                You don't have permission to access this page. The requested resource is restricted to authorized administrator credentials only.
              </p>
            </div>
            <div className="pt-4 flex gap-3 justify-center">
              <a 
                href="/" 
                className="px-5 py-2.5 border border-gray-800 text-gray-300 text-xs font-bold rounded-xl hover:bg-[#1F2736] transition-colors uppercase tracking-wider font-poppins"
              >
                Go to Website
              </a>
              <a 
                href="/admin/login" 
                className="px-5 py-2.5 bg-red-950 text-white text-xs font-bold rounded-xl hover:bg-red-900 border border-red-900/30 transition-colors shadow-lg uppercase tracking-wider font-poppins"
              >
                Admin Login
              </a>
            </div>
          </motion.div>
        </div>
      );
    }
    // Not logged in as either, redirect to /admin/login
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
