import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Mail, Lock, User, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, registerUser, clearError } from '../store/authSlice.js';
import { useToast } from '../context/ToastContext.jsx';

export default function LoginRegisterModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { loading, error } = useSelector((state) => state.auth);

  const [isLoginState, setIsLoginState] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Password Requirements State
  const [passChecks, setPassChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

  // Calculate strength score
  const checkRequirements = (val) => {
    setPassChecks({
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      lower: /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(val)
    });
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    checkRequirements(val);
  };

  const strengthCount = Object.values(passChecks).filter(Boolean).length;
  let strengthLabel = 'Weak';
  let strengthColor = 'bg-red-500';
  let strengthTextColor = 'text-red-500';
  
  if (strengthCount === 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    strengthTextColor = 'text-emerald-500';
  } else if (strengthCount >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
    strengthTextColor = 'text-amber-500';
  }

  // Clear errors when toggling modal state
  useEffect(() => {
    dispatch(clearError());
  }, [isLoginState, isOpen, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all required fields.', 'warning');
      return;
    }

    if (isLoginState) {
      // Login
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        addToast('Welcome back to Gramathu Boutique!', 'success');
        onClose();
      } else {
        addToast(result.payload || 'Invalid email or password.', 'error');
      }
    } else {
      // Register
      if (!firstName || !lastName) {
        addToast('Please enter your first and last names.', 'warning');
        return;
      }
      if (password !== confirmPassword) {
        addToast('Passwords do not match.', 'error');
        return;
      }
      if (strengthCount < 5) {
        addToast('Password must satisfy all strength criteria.', 'error');
        return;
      }

      const result = await dispatch(registerUser({ firstName, lastName, email, password, confirmPassword }));
      if (registerUser.fulfilled.match(result)) {
        addToast('Account created successfully! Welcome.', 'success');
        onClose();
      } else {
        addToast(result.payload || 'Registration failed. Try again.', 'error');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white shadow-luxury rounded-3xl overflow-hidden z-10 border border-gray-100 max-h-[90vh] flex flex-col"
          >
            {/* Header banner */}
            <div className="bg-gray-900 px-6 py-6 text-center border-b border-gray-800 flex-shrink-0 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/75 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl sm:text-2xl font-bold tracking-wider text-white font-playfair">
                {isLoginState ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
              </h3>
              <p className="text-xs text-sienna-400 mt-1 font-poppins tracking-wide font-medium">
                {isLoginState ? 'Traditional Elegance with Modern Style' : 'Join our premium boutique experience'}
              </p>
            </div>

            {/* Content (Scrollable for smaller screens) */}
            <div className="overflow-y-auto p-6 sm:p-8 flex-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Registration fields (Name) */}
                {!isLoginState && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-poppins">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none transition-colors font-semibold"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-poppins">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none transition-colors font-semibold"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-poppins">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none transition-colors font-semibold"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-poppins">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={isLoginState ? (e) => setPassword(e.target.value) : handlePasswordChange}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none transition-colors font-semibold"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-sienna-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Live Password Strength Meter */}
                {!isLoginState && password.length > 0 && (
                  <div className="space-y-2 pt-1 font-poppins">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-400 uppercase tracking-wider">Password Strength:</span>
                      <span className={`${strengthTextColor} uppercase tracking-wider`}>{strengthLabel}</span>
                    </div>
                    {/* Animated Strength bar */}
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColor} transition-all duration-500`}
                        style={{ width: `${(strengthCount / 5) * 100}%` }}
                      />
                    </div>
                    {/* List of requirements */}
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-medium text-gray-500">
                      <li className="flex items-center gap-1.5">
                        <Check className={`w-3.5 h-3.5 ${passChecks.length ? 'text-emerald-500' : 'text-gray-300'}`} />
                        Min 8 Characters
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className={`w-3.5 h-3.5 ${passChecks.upper ? 'text-emerald-500' : 'text-gray-300'}`} />
                        Uppercase Letter
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className={`w-3.5 h-3.5 ${passChecks.lower ? 'text-emerald-500' : 'text-gray-300'}`} />
                        Lowercase Letter
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className={`w-3.5 h-3.5 ${passChecks.number ? 'text-emerald-500' : 'text-gray-300'}`} />
                        Number
                      </li>
                      <li className="flex items-center gap-1.5 col-span-2">
                        <Check className={`w-3.5 h-3.5 ${passChecks.special ? 'text-emerald-500' : 'text-gray-300'}`} />
                        Special Character (e.g. !@#$%)
                      </li>
                    </ul>
                  </div>
                )}

                {/* Confirm Password */}
                {!isLoginState && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-poppins">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-xs text-gray-800 focus:border-sienna-500 focus:outline-none transition-colors font-semibold"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Login specific fields (Remember me & Forgot password) */}
                {isLoginState && (
                  <div className="flex items-center justify-between text-xs pt-1 font-poppins">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-gray-300 text-sienna-600 focus:ring-sienna-500 w-3.5 h-3.5"
                      />
                      Remember Me
                    </label>
                    <button
                      type="button"
                      onClick={() => addToast('Password reset link simulated. Check your email.', 'info')}
                      className="font-semibold text-sienna-600 hover:text-sienna-700 hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-500 flex items-start gap-2 font-semibold font-poppins">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sienna-600 text-white font-poppins font-semibold py-3.5 text-xs tracking-wider uppercase rounded-xl hover:bg-sienna-750 transition-colors shadow-accent-glow duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : isLoginState ? (
                    'Login to Account'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Toggle modal states */}
              <div className="mt-6 text-center text-xs font-semibold text-gray-500 font-poppins">
                {isLoginState ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setIsLoginState(false)}
                      className="text-sienna-600 hover:text-sienna-700 hover:underline transition-colors font-bold"
                    >
                      Register Now
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => setIsLoginState(true)}
                      className="text-sienna-600 hover:text-sienna-700 hover:underline transition-colors font-bold"
                    >
                      Login Here
                    </button>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
