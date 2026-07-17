import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Mail, Lock, Eye, EyeOff, Sparkles, Check, 
  AlertCircle, ShoppingBag, TrendingUp, Users, CreditCard, 
  HelpCircle, ArrowRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginAdminThunk } from '../../store/adminSlice.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { adminToken, adminLoading, adminError } = useSelector((state) => state.admin);

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // UI state managers
  const [progress, setProgress] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  // Preloader progress bar animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setShowPreloader(false), 600);
          return 100;
        }
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 70);
    return () => clearInterval(timer);
  }, []);

  // Redirect if already logged in as Admin
  useEffect(() => {
    if (adminToken) {
      navigate('/admin/dashboard');
    }
  }, [adminToken, navigate]);

  // Handle Input Changes with real-time validation
  const handleEmailChange = (val) => {
    setEmail(val);
    if (!val.trim()) {
      setEmailError('❌ Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setEmailError('❌ Invalid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (!val) {
      setPasswordError('❌ Password is required');
    } else {
      setPasswordError('');
    }
  };

  // Caps Lock detection
  const handleCheckCapsLock = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation checks
    const finalEmailError = !email.trim() ? '❌ Email is required' : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const finalEmailFormatError = email.trim() && !emailRegex.test(email) ? '❌ Invalid email address' : '';
    const finalPasswordError = !password ? '❌ Password is required' : '';

    if (finalEmailError || finalEmailFormatError || finalPasswordError) {
      setEmailError(finalEmailError || finalEmailFormatError);
      setPasswordError(finalPasswordError);
      addToast('Please fix validation errors.', 'error');
      return;
    }

    const result = await dispatch(loginAdminThunk({ email: email.trim(), password: password.trim() }));
    if (loginAdminThunk.fulfilled.match(result)) {
      setSuccessOpen(true);
      addToast('Authorized successfully.', 'success');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } else {
      setErrorOpen(true);
      addToast(result.payload || 'Access denied.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex items-center justify-center relative overflow-hidden font-poppins selection:bg-[#6366F1] selection:text-white">
      {/* Dynamic styles injected for custom animations and luxury fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Poppins:wght@300;400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&display=swap');
        
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }

        @keyframes aurora-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes aurora-2 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-40px, 40px) scale(0.9); }
          66% { transform: translate(30px, -20px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes aurora-3 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, 30px) scale(1.15); }
          66% { transform: translate(-30px, -40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-aurora-1 { animation: aurora-1 15s infinite ease-in-out; }
        .animate-aurora-2 { animation: aurora-2 18s infinite ease-in-out; }
        .animate-aurora-3 { animation: aurora-3 20s infinite ease-in-out; }

        .glass-luxury {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(229, 231, 235, 0.6);
        }
        .btn-luxury {
          background: linear-gradient(135deg, #111827 0%, #374151 100%);
          box-shadow: 0 4px 20px rgba(17, 24, 39, 0.15);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-luxury:hover {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
          transform: translateY(-2px);
        }
        .input-luxury {
          transition: all 0.3s ease;
        }
        .input-luxury:focus {
          border-color: #6366F1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
          background-color: #ffffff;
        }
      `}</style>

      {/* Modern animated aurora background mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#F8FAFC]">
        <div className="absolute top-[10%] left-[5%] w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-[#EEF2FF] to-[#E0E7FF] opacity-70 blur-[120px] animate-aurora-1" />
        <div className="absolute bottom-[10%] right-[10%] w-[50rem] h-[50rem] rounded-full bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] opacity-60 blur-[130px] animate-aurora-2" />
        <div className="absolute top-[40%] right-[20%] w-[35rem] h-[35rem] rounded-full bg-gradient-to-l from-[#F0FDF4] to-[#DCFCE7] opacity-40 blur-[110px] animate-aurora-3" />
        
        {/* Floating subtle premium geometric mesh */}
        <div className="absolute top-12 left-12 w-64 h-64 border border-[#E5E7EB]/40 rounded-full opacity-20" />
        <div className="absolute bottom-20 right-20 w-96 h-96 border border-[#E5E7EB]/40 rounded-[20%] opacity-20 rotate-45" />
      </div>

      {/* 1. LUXURY INITIAL PRELOADER */}
      <AnimatePresence>
        {showPreloader && (
          <motion.div 
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-[#111827] z-[100] flex flex-col items-center justify-center text-white"
          >
            <div className="space-y-8 text-center max-w-sm px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="space-y-3"
              >
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-[#6366F1]" />
                </div>
                <h1 className="font-playfair text-2xl font-bold tracking-widest uppercase">
                  GRAMATHU <span className="text-[#6366F1] italic font-normal">BOUTIQUE</span>
                </h1>
                <p className="text-[9px] font-montserrat tracking-[0.3em] text-gray-400 uppercase font-semibold">
                  Secure Admin Infrastructure
                </p>
              </motion.div>

              {/* Dynamic luxury progress line */}
              <div className="space-y-2">
                <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden mx-auto">
                  <motion.div 
                    className="h-full bg-[#6366F1]" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-400 font-mono">{Math.min(Math.round(progress), 100)}% Loaded</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[90vh]">
        
        {/* LEFT COLUMN: BRAND SHOWCASE & STATS */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="hidden lg:block lg:col-span-6 space-y-8 text-left"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#6366F1]/10 text-[#6366F1] font-montserrat text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#6366F1]/10">
              <Sparkles className="w-3.5 h-3.5" /> Luxury Commerce Suite
            </div>
            <h2 className="font-playfair text-5xl font-bold leading-tight text-[#111827]">
              The Entrance to <br />
              <span className="text-[#6366F1] italic font-normal">Traditional Elegance</span>
            </h2>
            <p className="text-sm text-[#374151] font-poppins leading-relaxed max-w-md">
              Securely sign in to oversee your luxury inventory, curate beautiful collections, fulfill sarees catalog orders, and manage your shopper experiences.
            </p>
          </div>

          {/* Luxury Animated Stats Cards */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: 'Saree Inventory', value: '1,250+', desc: 'Premium Catalogs', icon: ShoppingBag, color: 'bg-indigo-500/10 text-indigo-600', delay: 0.8 },
              { label: 'Processed Orders', value: '5,430+', desc: 'Completed Invoices', icon: TrendingUp, color: 'bg-purple-500/10 text-purple-600', delay: 0.9 },
              { label: 'Active Customers', value: '3,210+', desc: 'Happy Shoppers', icon: Users, color: 'bg-pink-500/10 text-pink-600', delay: 1.0 },
              { label: 'Boutique Revenue', value: '₹12.5L', desc: 'SaaS Analytics', icon: CreditCard, color: 'bg-emerald-500/10 text-emerald-600', delay: 1.1 }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: stat.delay }}
                className="p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white border-t-white/90 shadow-sm space-y-2 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 font-montserrat uppercase tracking-wider">{stat.label}</span>
                  <div className={`p-2 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-montserrat text-[#111827]">{stat.value}</h3>
                  <p className="text-[9px] text-[#374151]/70 font-semibold">{stat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: LOGIN CARD */}
        <div className="col-span-12 lg:col-span-6 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-md p-8 sm:p-10 rounded-[28px] shadow-2xl glass-luxury relative text-left"
          >
            {/* Branding header */}
            <div className="space-y-2 text-center pb-6 border-b border-[#E5E7EB]/60">
              <div className="w-14 h-14 bg-white hover:bg-[#6366F1]/5 border border-[#E5E7EB]/80 text-[#6366F1] rounded-2xl flex items-center justify-center mx-auto shadow-md transition-all duration-300">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-[#111827] tracking-wider">
                GRAMATHU <span className="text-[#6366F1] italic font-normal">BOUTIQUE</span>
              </h3>
              <p className="text-[9px] text-gray-400 font-montserrat tracking-[0.2em] font-semibold uppercase">
                Secure Administrator Portal
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              
              {/* Email Input Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="admin@gramathuboutique.com"
                    className={`w-full bg-white/50 border ${
                      emailError ? 'border-red-400' : 'border-gray-200'
                    } rounded-xl pl-10 pr-4 py-3 text-xs text-[#111827] focus:outline-none input-luxury font-medium font-poppins`}
                    required
                  />
                </div>
                {/* Real-time Email validation */}
                <AnimatePresence>
                  {emailError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[9px] font-bold text-red-500 mt-1"
                    >
                      {emailError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Input Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Secret Password</label>
                  <button 
                    type="button" 
                    onClick={() => addToast('Please contact Super Admin to reset keys.', 'info')}
                    className="text-[9px] font-bold text-[#6366F1] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onKeyDown={handleCheckCapsLock}
                    onKeyUp={handleCheckCapsLock}
                    placeholder="••••••••"
                    className={`w-full bg-white/50 border ${
                      passwordError ? 'border-red-400' : 'border-gray-200'
                    } rounded-xl pl-10 pr-10 py-3 text-xs text-[#111827] focus:outline-none input-luxury font-medium font-poppins`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111827] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Validation and Warning labels */}
                <AnimatePresence>
                  {passwordError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[9px] font-bold text-red-500 mt-1"
                    >
                      {passwordError}
                    </motion.p>
                  )}
                  {capsLockActive && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[9px] font-bold text-amber-600 mt-1 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5" /> Warning: Caps Lock is On
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Options */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <label className="flex items-center gap-2 cursor-pointer select-none font-semibold">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#E5E7EB] bg-white text-[#6366F1] focus:ring-[#6366F1]/40 w-4 h-4" 
                  />
                  Remember Me
                </label>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Secure Session
                </div>
              </div>

              {/* Large Premium Submit Button */}
              <button
                type="submit"
                disabled={adminLoading || successOpen}
                className="w-full btn-luxury text-white font-montserrat font-bold py-3.5 text-xs tracking-widest uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-80"
              >
                {adminLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                    <span>Processing Secure Auth...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badges Grid */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-[#E5E7EB]/60 text-[8px] font-bold text-gray-400 font-montserrat uppercase tracking-wider text-center">
              <div className="flex flex-col items-center gap-1 py-1 px-1 bg-white/40 border border-[#E5E7EB]/30 rounded-lg">
                <span className="text-emerald-500">✓</span> Encrypted
              </div>
              <div className="flex flex-col items-center gap-1 py-1 px-1 bg-white/40 border border-[#E5E7EB]/30 rounded-lg">
                <span className="text-emerald-500">✓</span> Authorized
              </div>
              <div className="flex flex-col items-center gap-1 py-1 px-1 bg-white/40 border border-[#E5E7EB]/30 rounded-lg">
                <span className="text-emerald-500">✓</span> Protected
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2. ERROR CARD POPUP OVERLAY */}
      <AnimatePresence>
        {errorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full bg-white rounded-3xl border border-red-100 p-8 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-100/50 mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-playfair text-xl font-bold text-[#111827]">Login Failed</h3>
              <p className="text-xs text-gray-500 leading-relaxed mt-2 font-poppins">
                {adminError || 'Invalid email or password. Please verify your credentials and try again.'}
              </p>
              <button
                onClick={() => setErrorOpen(false)}
                className="w-full bg-[#111827] text-white font-montserrat font-bold py-3 text-xs tracking-wider uppercase rounded-xl hover:bg-[#6366F1] transition-colors mt-6"
              >
                Try Again
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. SUCCESS CARD POPUP OVERLAY */}
      <AnimatePresence>
        {successOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-sm w-full bg-white rounded-3xl border border-emerald-100 p-8 text-center shadow-2xl"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100/50 mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-playfair text-xl font-bold text-[#111827]">Welcome Back</h3>
              <p className="text-xs text-gray-500 leading-relaxed mt-2 font-poppins">
                Authentication successful. Loading your luxury administration dashboard...
              </p>
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mx-auto mt-6" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Footer Layout */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[10px] text-gray-400 font-montserrat uppercase tracking-wider font-semibold z-10 w-full px-4">
        <span>Version 1.0</span>
        <span className="mx-2.5">•</span>
        <span>© 2026 Gramathu Boutique</span>
        <span className="mx-2.5">•</span>
        <span>Secure Admin Portal</span>
      </div>
    </div>
  );
}
