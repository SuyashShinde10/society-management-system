import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import AnimatedText from '../components/ui/AnimatedText';
import FormError from '../components/ui/FormError';

const SquiggleDoodle = ({ style }) => (
  <svg width="100" height="16" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <motion.path d="M2 10C15 -5 25 25 40 10C55 -5 65 25 80 10C95 -5 105 25 118 10" stroke="#D9734E" strokeWidth="3" strokeLinecap="round" 
      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, delay: 0.3 }} />
  </svg>
);

const StarburstDoodle = ({ style }) => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <motion.path d="M20 0L23 17L40 20L23 23L20 40L17 23L0 20L17 17L20 0Z" fill="#D9734E" 
      initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, delay: 0.5 }} />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) return null;
  const { login } = auth;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      const role = (result.role || '').toLowerCase().trim();
      if (role === 'superadmin') {
        navigate('/superadmin', { replace: true });
      } else if (role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (role === 'security') {
        navigate('/security', { replace: true });
      } else {
        navigate('/resident', { replace: true });
      }
    } else {
      toast.error(`Access denied: ${result.message}`);
      setErrors({ form: result.message });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: theme.bg, fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Left Side - Graphic, Doodles & Community Illustration */}
      <div className="hide-on-mobile" style={{
        flex: 1.1, display: 'flex', flexDirection: 'column', padding: '50px 60px',
        backgroundColor: '#FFFDF9', borderRight: `1px solid ${theme.border}`,
        position: 'relative', overflow: 'hidden'
      }}>
        <style>
          {`
            @media (max-width: 960px) { .hide-on-mobile { display: none !important; } }
            @media (min-width: 961px) { .show-on-mobile { display: none !important; } }
          `}
        </style>
        
        {/* Top Back Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6 }}
          style={{ zIndex: 10, marginBottom: '24px' }}
        >
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: theme.textMain, fontWeight: '600', fontSize: '13.5px', padding: '8px 16px', background: '#F9F8F3', borderRadius: '20px', border: `1px solid ${theme.border}`, transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background = '#FFFFFF'} onMouseOut={e => e.target.style.background = '#F9F8F3'}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        {/* Branding & Headline with Doodles */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ zIndex: 10, maxWidth: '520px' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: '48px', height: '48px', background: theme.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <img src="/awaastech-logo.png" alt="Awaastech" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
            </div>
            <span className="text-sm font-semibold tracking-wider uppercase text-slate-500">Awaastech Community</span>
          </div>

          <div style={{ position: 'relative' }}>
            <StarburstDoodle style={{ position: 'absolute', top: '-18px', right: '40px', opacity: 0.8 }} />
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: '500', lineHeight: '1.15', color: theme.textMain, margin: '0 0 16px 0' }}>
              <AnimatedText text="Welcome back to your community." />
            </h1>
            <SquiggleDoodle style={{ position: 'absolute', bottom: '-8px', left: '0', opacity: 0.9 }} />
          </div>

          <p style={{ fontSize: '16px', color: theme.textSec, lineHeight: '1.6', fontWeight: '300', marginTop: '20px', marginBottom: '28px' }}>
            Access your unified society portal to settle maintenance, inspect real-time gate entries, and connect with management.
          </p>
        </motion.div>

        {/* Bespoke Community Illustration Scene with Floating Stat Badges */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ 
            zIndex: 10, marginTop: 'auto', marginBottom: '10px',
            background: 'linear-gradient(180deg, #FBF9F4 0%, #F5F1E8 100%)',
            borderRadius: '24px', border: `1px solid ${theme.border}`, padding: '24px',
            position: 'relative', overflow: 'hidden'
          }}
        >
          {/* SVG Society Cottage Illustration */}
          <div className="flex justify-center mb-3">
            <svg width="240" height="120" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Ground line */}
              <line x1="20" y1="110" x2="220" y2="110" stroke="#D1CCC2" strokeWidth="2" strokeLinecap="round" />
              {/* Main Building Base */}
              <rect x="70" y="55" width="100" height="55" rx="4" fill="#FFFFFF" stroke="#6B705C" strokeWidth="2" />
              {/* Warm Terracotta Roof */}
              <polygon points="60,55 120,20 180,55" fill="#D9734E" stroke="#B85633" strokeWidth="2" />
              {/* Roof Shingle Line */}
              <path d="M75 48 Q 120 28 165 48" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" fill="none" />
              {/* Chimney with soft puff */}
              <rect x="145" y="24" width="14" height="20" fill="#B85633" rx="2" />
              <circle cx="152" cy="18" r="4" fill="#E8E4D9" fillOpacity="0.8" />
              <circle cx="156" cy="11" r="5" fill="#E8E4D9" fillOpacity="0.5" />
              {/* Glowing Warm Windows */}
              <rect x="85" y="65" width="22" height="22" rx="3" fill="#FDE68A" stroke="#6B705C" strokeWidth="1.5" />
              <line x1="96" y1="65" x2="96" y2="87" stroke="#6B705C" strokeWidth="1" />
              <line x1="85" y1="76" x2="107" y2="76" stroke="#6B705C" strokeWidth="1" />
              {/* Second Window */}
              <rect x="133" y="65" width="22" height="22" rx="3" fill="#FDE68A" stroke="#6B705C" strokeWidth="1.5" />
              <line x1="144" y1="65" x2="144" y2="87" stroke="#6B705C" strokeWidth="1" />
              <line x1="133" y1="76" x2="155" y2="76" stroke="#6B705C" strokeWidth="1" />
              {/* Wooden Entry Door */}
              <rect x="110" y="80" width="20" height="30" rx="3" fill="#6B705C" />
              <circle cx="125" cy="95" r="1.5" fill="#FDE68A" />
              {/* Neighboring Pine Trees */}
              <polygon points="40,110 32,75 48,75" fill="#6B705C" fillOpacity="0.85" />
              <polygon points="40,85 34,60 46,60" fill="#6B705C" />
              <polygon points="200,110 193,80 207,80" fill="#6B705C" fillOpacity="0.85" />
              <polygon points="200,90 195,70 205,70" fill="#6B705C" />
            </svg>
          </div>

          {/* Floating Live Indicator Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#E8E4D9] text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              24/7 Gate Verification
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#E8E4D9] text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#D9734E]"></span>
              Zero-Reconciliation Ledger
            </span>
          </div>
        </motion.div>

        {/* Decorative Blobs */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', right: '-20%', bottom: '-20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(217,115,78,0.04) 0%, rgba(255,253,249,0) 70%)', borderRadius: '50%', zIndex: 0 }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', left: '-10%', top: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(107,112,92,0.04) 0%, rgba(255,253,249,0) 70%)', borderRadius: '50%', zIndex: 0 }}
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="p-5 md:p-[40px]" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <Link to="/" className="show-on-mobile" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: theme.textMain, fontWeight: '600', fontSize: '14px', marginBottom: '20px', padding: '8px 16px', background: '#F9F8F3', borderRadius: '20px', border: `1px solid ${theme.border}`, transition: 'all 0.2s' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="p-6 md:p-[50px]"
          style={{ width: '100%', maxWidth: '440px', background: 'white', borderRadius: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.04)', border: `1px solid ${theme.border}` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ background: '#F9F8F3', padding: '12px', borderRadius: '14px', color: theme.accent }}>
              <Lock size={24} />
            </div>
            <div>
              <h2 style={{ margin: '0', fontSize: '24px', fontWeight: '600', color: theme.textMain }}>Secure Log In</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSec }}>Enter your credentials to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errors.form && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {errors.form}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                required
                placeholder="you@example.com"
                style={{ 
                  width: '100%', padding: '16px', background: '#F9F8F3', border: `1px solid ${errors.email ? '#E11D48' : theme.border}`, 
                  borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', transition: 'all 0.2s' 
                }}
                onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 4px 12px rgba(217,115,78,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.email ? '#E11D48' : theme.border; e.target.style.background = '#F9F8F3'; e.target.style.boxShadow = 'none'; }}
              />
              <FormError error={errors.email} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '13px', color: theme.accent, textDecoration: 'none', fontWeight: '500' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  required
                  placeholder="••••••••"
                  style={{ 
                    width: '100%', padding: '16px', paddingRight: '45px', background: '#F9F8F3', border: `1px solid ${errors.password ? '#E11D48' : theme.border}`, 
                    borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' 
                  }}
                  onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 4px 12px rgba(217,115,78,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.password ? '#E11D48' : theme.border; e.target.style.background = '#F9F8F3'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                </button>
              </div>
              <FormError error={errors.password} />
            </div>

            <motion.button
              whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(217,115,78,0.2)' }}
              whileTap={{ y: 0, boxShadow: 'none' }}
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '18px', background: theme.accent, color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '10px', opacity: loading ? 0.7 : 1, transition: 'background 0.2s'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </motion.button>
          </form>

          <div style={{ marginTop: '35px', textAlign: 'center', paddingTop: '20px' }}>
            <p style={{ fontSize: '14px', color: theme.textSec, margin: 0 }}>
              New resident or admin?{' '}
              <Link to="/register" style={{ color: theme.accent, fontWeight: '600', textDecoration: 'none' }}>
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Login;