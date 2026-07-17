import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { loginUser, clearError } from '../../store/authSlice.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast('Please fill in all fields.', 'warning');
      return;
    }

    const result = await dispatch(loginUser({ email: email.trim(), password: password.trim() }));
    if (loginUser.fulfilled.match(result)) {
      addToast('Welcome back to Gramathu Boutique!', 'success');
      navigate('/');
    } else {
      addToast(result.payload || 'Invalid email or password.', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 select-none">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white border border-gold-500/10 p-8 sm:p-10 rounded-3xl shadow-luxury relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-wine-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <span className="font-playfair text-xl font-bold tracking-[0.2em] text-emerald-950 uppercase">
            GRAMATHU <span className="text-wine-accent font-normal italic">BOUTIQUE</span>
          </span>
          <h2 className="text-2xl font-bold font-playfair text-emerald-950 pt-2">Welcome Back</h2>
          <p className="text-xs text-gray-500 font-medium">Log in to view your wishlist, track orders, and checkout seamlessly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gold-600 uppercase tracking-widest block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-sand-50/50 border border-gold-500/15 rounded-xl pl-10 pr-4 py-3 text-xs text-emerald-950 focus:border-wine-accent focus:outline-none transition-colors font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gold-600 uppercase tracking-widest block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-600" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-sand-50/50 border border-gold-500/15 rounded-xl pl-10 pr-10 py-3 text-xs text-emerald-950 focus:border-wine-accent focus:outline-none transition-colors font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-500 select-none">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gold-500/20 text-wine-accent focus:ring-wine-accent w-4 h-4" 
              />
              Remember Me
            </label>
            <Link to="/forgot-password" className="text-wine-accent font-semibold hover:underline">Forgot Password?</Link>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wine-accent hover:bg-wine-accent-dark text-white font-montserrat font-bold py-3.5 text-xs tracking-widest uppercase rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Log In
                <ShieldCheck className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-semibold text-gray-400 border-t border-gold-500/10 pt-6">
          New to Gramathu Boutique? <Link to="/register" className="text-wine-accent font-bold hover:underline">Create Account</Link>
        </div>
      </motion.div>
    </div>
  );
}
