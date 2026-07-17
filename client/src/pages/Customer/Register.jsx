import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { registerUser, clearError } from '../../store/authSlice.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password requirements checklist
  const [passChecks, setPassChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

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
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      addToast('Please fill in all fields.', 'warning');
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

    const result = await dispatch(registerUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password.trim()
    }));

    if (registerUser.fulfilled.match(result)) {
      addToast('Account created! Welcome to Gramathu Boutique.', 'success');
      navigate('/');
    } else {
      addToast(result.payload || 'Registration failed.', 'error');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 select-none">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white border border-gold-500/10 p-8 sm:p-10 rounded-3xl shadow-luxury relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-wine-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-6">
          <span className="font-playfair text-xl font-bold tracking-[0.2em] text-emerald-950 uppercase">
            GRAMATHU <span className="text-wine-accent font-normal italic">BOUTIQUE</span>
          </span>
          <h2 className="text-2xl font-bold font-playfair text-emerald-950 pt-1">Create Account</h2>
          <p className="text-xs text-gray-500 font-medium">Join us to shop traditional handloom collections and check out fast.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-gold-600 uppercase tracking-widest block">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-600" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Priya"
                  className="w-full bg-sand-50/50 border border-gold-500/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-emerald-950 focus:border-wine-accent focus:outline-none transition-colors font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-gold-600 uppercase tracking-widest block">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Raman"
                className="w-full bg-sand-50/50 border border-gold-500/15 rounded-xl px-3 py-2.5 text-xs text-emerald-950 focus:border-wine-accent focus:outline-none transition-colors font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gold-600 uppercase tracking-widest block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full bg-sand-50/50 border border-gold-500/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-emerald-950 focus:border-wine-accent focus:outline-none transition-colors font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gold-600 uppercase tracking-widest block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-600" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full bg-sand-50/50 border border-gold-500/15 rounded-xl pl-9 pr-10 py-2.5 text-xs text-emerald-950 focus:border-wine-accent focus:outline-none transition-colors font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicator list */}
            {password.length > 0 && (
              <div className="space-y-2 pt-1.5">
                <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wide text-gray-400">
                  <span>Strength: <strong className={strengthTextColor}>{strengthLabel}</strong></span>
                  <span>{strengthCount}/5 criteria satisfied</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full ${strengthColor}`} style={{ width: `${(strengthCount / 5) * 100}%` }} />
                </div>
                
                {/* Requirements check list */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] font-bold text-gray-400">
                  <span className={`flex items-center gap-1 ${passChecks.length ? 'text-emerald-600' : ''}`}>
                    {passChecks.length ? '✓' : '•'} 8+ characters
                  </span>
                  <span className={`flex items-center gap-1 ${passChecks.upper ? 'text-emerald-600' : ''}`}>
                    {passChecks.upper ? '✓' : '•'} 1+ Uppercase letter
                  </span>
                  <span className={`flex items-center gap-1 ${passChecks.lower ? 'text-emerald-600' : ''}`}>
                    {passChecks.lower ? '✓' : '•'} 1+ Lowercase letter
                  </span>
                  <span className={`flex items-center gap-1 ${passChecks.number ? 'text-emerald-600' : ''}`}>
                    {passChecks.number ? '✓' : '•'} 1+ Number
                  </span>
                  <span className={`flex items-center gap-1 ${passChecks.special ? 'text-emerald-600' : ''} col-span-2`}>
                    {passChecks.special ? '✓' : '•'} 1+ Special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gold-600 uppercase tracking-widest block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-600" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-sand-50/50 border border-gold-500/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-emerald-950 focus:border-wine-accent focus:outline-none transition-colors font-medium"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wine-accent hover:bg-wine-accent-dark text-white font-montserrat font-bold py-3 text-xs tracking-widest uppercase rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Register Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold text-gray-400 border-t border-gold-500/10 pt-4">
          Already have an account? <Link to="/login" className="text-wine-accent font-bold hover:underline">Log In</Link>
        </div>
      </motion.div>
    </div>
  );
}
