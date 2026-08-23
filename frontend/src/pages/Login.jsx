import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

const SparkleDoodle = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: '-10px', left: '-20px' }}>
    <motion.path 
      d="M15 0L17 12L30 15L17 17L15 30L12 17L0 15L12 12L15 0Z" 
      fill="#D9734E" 
      initial={{ scale: 0, rotate: 45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, delay: 1 }}
    />
  </svg>
);

const AnimatedText = ({ text }) => {
  const words = text.split(" ");
  return (
    <motion.span 
      initial="hidden" 
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.12 } },
        hidden: {}
      }}
      style={{ display: "inline-flex", flexWrap: "wrap", position: 'relative' }}
    >
      <SparkleDoodle />
      {words.map((word, index) => (
        <motion.span 
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 100 } }
          }} 
          style={{ marginRight: "8px" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) return null;
  const { login } = auth;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      if (result.role === 'superadmin') {
        navigate('/superadmin');
      } else if (result.role === 'admin') {
        navigate('/dashboard');
      } else if (result.role === 'security') {
        navigate('/security');
      } else {
        navigate('/resident');
      }
    } else {
      toast.error(`Access denied: ${result.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: theme.bg, fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Left Side - Graphic & Branding */}
      <div className="hide-on-mobile" style={{
        flex: 1, display: 'flex', flexDirection: 'column', padding: '60px',
        backgroundColor: '#FFFDF9', borderRight: `1px solid ${theme.border}`,
        position: 'relative', overflow: 'hidden'
      }}>
        <style>
          {`
            @media (max-width: 900px) { .hide-on-mobile { display: none !important; } }
            @media (min-width: 901px) { .show-on-mobile { display: none !important; } }
          `}
        </style>
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8 }}
          style={{ zIndex: 10, marginBottom: 'auto' }}
        >
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: theme.textMain, fontWeight: '600', fontSize: '14px', padding: '8px 16px', background: '#F9F8F3', borderRadius: '20px', border: `1px solid ${theme.border}`, transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background = '#FFFFFF'} onMouseOut={e => e.target.style.background = '#F9F8F3'}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ zIndex: 10, maxWidth: '500px', marginBottom: 'auto' }}
        >
          <div style={{ width: '50px', height: '50px', background: theme.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', border: `1px solid ${theme.border}` }}>
            <img src="/awaastech-logo.png" alt="Awaastech" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '54px', fontWeight: '500', lineHeight: '1.1', color: theme.textMain, margin: '0 0 20px 0' }}>
            <AnimatedText text="Welcome back to your community." />
          </h1>
          <p style={{ fontSize: '18px', color: theme.textSec, lineHeight: '1.6', fontWeight: '300' }}>
            Access your unified dashboard to manage bills, view notices, and interact with the society committee.
          </p>
        </motion.div>

        {/* Decorative Blobs */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', right: '-20%', bottom: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(217,115,78,0.04) 0%, rgba(255,253,249,0) 70%)', borderRadius: '50%', zIndex: 0 }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', left: '-10%', top: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(107,112,92,0.05) 0%, rgba(255,253,249,0) 70%)', borderRadius: '50%', zIndex: 0 }}
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ 
                  width: '100%', padding: '16px', background: '#F9F8F3', border: `1px solid ${theme.border}`, 
                  borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', transition: 'all 0.2s' 
                }}
                onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 4px 12px rgba(217,115,78,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.background = '#F9F8F3'; e.target.style.boxShadow = 'none'; }}
              />
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ 
                    width: '100%', padding: '16px', paddingRight: '45px', background: '#F9F8F3', border: `1px solid ${theme.border}`, 
                    borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 4px 12px rgba(217,115,78,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.background = '#F9F8F3'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                </button>
              </div>
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