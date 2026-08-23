import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, User, Mail, Shield, KeyRound, MapPin, Layers, FileText, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import theme from '../theme';

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

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [societyName, setSocietyName] = useState('');
  const [address, setAddress] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [wings, setWings] = useState([]);
  const [floors, setFloors] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  const WING_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handleCheckboxChange = (opt) =>
    wings.includes(opt) ? setWings(wings.filter((i) => i !== opt)) : setWings([...wings, opt]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const sendOTP = async () => {
    if (!email) {
      toast.error('Please enter an email address first.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email });
      setOtpSent(true);
      setTimer(120);
      toast.success('Verification code sent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      toast.error('Please enter the OTP.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setIsVerified(true);
      setTimer(0);
      toast.success('Email verified successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error('Please verify your email first.');
      return;
    }
    if (wings.length === 0) {
      toast.error('Please select at least one Wing/Block.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (Number(floors) <= 0) {
      toast.error('Floors must be greater than zero.');
      return;
    }

    const payload = {
      name, email, password, role: 'admin', otp, societyName, address, regNumber, wings, floors: Number(floors),
    };

    setLoading(true);
    try {
      await api.post('/auth/register', payload);
      toast.success('Society created! You can now log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '16px 16px 16px 45px', background: '#F9F8F3', border: `1px solid ${theme.border}`, 
    borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', transition: 'all 0.2s',
    boxSizing: 'border-box'
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = theme.accent;
    e.target.style.background = '#FFFFFF';
    e.target.style.boxShadow = '0 4px 12px rgba(217,115,78,0.1)';
  };

  const blurStyle = (e) => {
    e.target.style.borderColor = theme.border;
    e.target.style.background = '#F9F8F3';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: theme.bg, fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Left Side - Graphic & Branding */}
      <div className="left-panel hide-on-mobile" style={{
        flex: 1, display: 'flex', flexDirection: 'column', padding: '60px',
        backgroundColor: '#FFFDF9', borderRight: `1px solid ${theme.border}`,
        position: 'relative', overflow: 'hidden'
      }}>
        <style>
          {`
            @media (max-width: 1000px) { .hide-on-mobile { display: none !important; } }
            .form-container { width: 100%; max-width: 500px; }
            @media (max-width: 600px) { .form-container { padding: 30px 20px !important; } }
          `}
        </style>
        
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} style={{ zIndex: 10, marginBottom: 'auto' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: theme.textSec, fontWeight: '500', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = theme.accent} onMouseOut={e => e.target.style.color = theme.textSec}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ zIndex: 10, maxWidth: '500px', marginBottom: 'auto' }}>
          <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', border: `1px solid ${theme.border}` }}>
            <img src="/awaastech-logo.png" alt="Awaastech" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '54px', fontWeight: '500', lineHeight: '1.1', color: theme.textMain, margin: '0 0 20px 0' }}>
            <AnimatedText text="Elevate your society administration." />
          </h1>
          <p style={{ fontSize: '18px', color: theme.textSec, lineHeight: '1.6', fontWeight: '300' }}>
            Set up your digital infrastructure in minutes. Securely onboard residents, manage finances, and streamline operations.
          </p>
        </motion.div>

        <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', right: '-10%', bottom: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(217,115,78,0.05) 0%, rgba(255,253,249,0) 70%)', borderRadius: '50%', zIndex: 0 }}
        />
      </div>

      {/* Right Side - Registration Form */}
      <div className="p-4 md:p-[40px_20px]" style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="form-container p-6 md:p-[50px]"
          style={{ background: 'white', borderRadius: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.04)', border: `1px solid ${theme.border}` }}
        >
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ margin: '0', fontSize: '26px', fontWeight: '600', color: theme.textMain }}>Create Society</h2>
            <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: theme.textSec }}>Admin profile and infrastructure details</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Step 1: Admin Profile */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: theme.accent }}>1</div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Administrator Profile</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ position: 'relative' }}>
                  <User size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Mail size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '16px' }} />
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={otpSent || isVerified} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                  
                  {!isVerified && (
                    <motion.button whileHover={!(loading || (otpSent && timer > 0)) ? { y: -2 } : {}} type="button" onClick={otpSent ? (timer === 0 ? sendOTP : null) : sendOTP} disabled={loading || (otpSent && timer > 0)}
                      style={{
                        padding: '0 20px', backgroundColor: (otpSent && timer > 0) ? theme.border : theme.textMain, color: (otpSent && timer > 0) ? theme.textSec : 'white',
                        border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: (loading || (otpSent && timer > 0)) ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {loading ? '...' : otpSent ? (timer > 0 ? `Wait ${timer}s` : 'Resend') : 'Verify'}
                    </motion.button>
                  )}
                  {isVerified && (
                    <div style={{ padding: '0 20px', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', borderRadius: '12px', border: '1px solid #D1FAE5' }}>
                      <Shield size={16} style={{ marginRight: '6px' }} /> Verified
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {otpSent && !isVerified && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', gap: '10px', overflow: 'hidden' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <KeyRound size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '16px' }} />
                        <input type="text" placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} style={{...inputStyle, borderColor: theme.accent}} onFocus={focusStyle} onBlur={blurStyle} />
                      </div>
                      <motion.button whileHover={{ y: -2 }} type="button" onClick={verifyOTP} disabled={loading}
                        style={{ padding: '0 24px', backgroundColor: theme.accent, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}
                      >
                        Confirm
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ position: 'relative' }}>
                  <Lock size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input type={showPassword ? "text" : "password"} placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={!isVerified} style={{...inputStyle, paddingRight: '45px'}} onFocus={focusStyle} onBlur={blurStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {showPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                  </button>
                </div>
                

              </div>
            </div>

            {/* Step 2: Society Infrastructure */}
            <motion.div initial={{ opacity: 0.4 }} animate={{ opacity: isVerified ? 1 : 0.4 }} style={{ pointerEvents: isVerified ? 'auto' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: theme.accent }}>2</div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Infrastructure Details</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ position: 'relative' }}>
                  <Building2 size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input type="text" placeholder="Society Name" value={societyName} onChange={(e) => setSocietyName(e.target.value)} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input type="text" placeholder="Physical Address" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>

                <div style={{ position: 'relative' }}>
                  <FileText size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input type="text" placeholder="Registration No. (e.g. REG-12345)" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>

                <div>
                  <span style={{ fontSize: '13px', color: theme.textSec, fontWeight: '500', display: 'block', marginBottom: '8px' }}>Wing/Block Configuration</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                    {WING_OPTIONS.map((opt) => (
                      <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        key={opt}
                        onClick={() => handleCheckboxChange(opt)}
                        style={{
                          border: `1px solid ${wings.includes(opt) ? theme.accent : theme.border}`, 
                          borderRadius: '10px', padding: '10px 0', cursor: 'pointer',
                          fontWeight: '600', fontSize: '14px', textAlign: 'center', transition: 'all 0.2s',
                          backgroundColor: wings.includes(opt) ? theme.accent : '#F9F8F3',
                          color: wings.includes(opt) ? 'white' : theme.textMain,
                        }}
                      >
                        {opt}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <Layers size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input type="number" placeholder="Total Floors per Wing" value={floors} onChange={(e) => setFloors(e.target.value)} required min="1" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>
            </motion.div>

            <motion.button
              whileHover={isVerified ? { y: -2, boxShadow: '0 8px 20px rgba(217,115,78,0.2)' } : {}}
              whileTap={isVerified ? { y: 0, boxShadow: 'none' } : {}}
              type="submit"
              disabled={loading || !isVerified}
              style={{
                width: '100%', padding: '18px', backgroundColor: (!isVerified || loading) ? '#D1D5DB' : theme.accent, color: 'white',
                border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
                cursor: (!isVerified || loading) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: '10px'
              }}
            >
              {loading ? 'Deploying Environment...' : 'Initialize Society'}
            </motion.button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center', paddingTop: '20px' }}>
            <p style={{ fontSize: '14px', color: theme.textSec, margin: 0 }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: theme.accent, fontWeight: '600', textDecoration: 'none' }}>
                Sign in to Dashboard
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Register;