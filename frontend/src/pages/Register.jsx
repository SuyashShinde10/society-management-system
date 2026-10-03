import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Building2, User, Mail, Shield, 
  KeyRound, MapPin, Layers, FileText, Lock, Eye, EyeOff, Check, CheckCircle2 
} from 'lucide-react';
import api from '../api';
import theme from '../theme';
import AnimatedText from '../components/ui/AnimatedText';
import getErrorMessage from '../utils/errorHandler';
import FormError from '../components/ui/FormError';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Step 1: Identity
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [timer, setTimer] = useState(0);

  // Step 2: Society Infrastructure
  const [societyName, setSocietyName] = useState('');
  const [address, setAddress] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [wings, setWings] = useState(['A', 'B']);
  const [floors, setFloors] = useState('');

  // Step 3: Security & Credentials
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const WING_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handleCheckboxChange = (opt) =>
    wings.includes(opt) 
      ? setWings(wings.filter((i) => i !== opt)) 
      : setWings([...wings, opt]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResetVerification = () => {
    setIsVerified(false);
    setOtpSent(false);
    setOtp('');
    setVerificationToken('');
    setTimer(0);
    setErrors(prev => ({ ...prev, email: null, otp: null }));
  };

  const sendOTP = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      setErrors(prev => ({ ...prev, email: 'A valid email address is required.' }));
      return;
    }
    setErrors(prev => ({ ...prev, email: null }));
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email: cleanEmail });
      setOtpSent(true);
      setTimer(60);
      toast.success('Verification code sent to your email.');
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to send OTP.');
      setErrors(prev => ({ ...prev, email: msg }));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setErrors(prev => ({ ...prev, otp: 'Please enter the 6-digit verification code.' }));
      return;
    }
    setErrors(prev => ({ ...prev, otp: null }));
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: cleanEmail, otp: cleanOtp });
      setIsVerified(true);
      if (res.data?.verificationToken) {
        setVerificationToken(res.data.verificationToken);
      }
      setTimer(0);
      toast.success('Email verified successfully.');
    } catch (error) {
      const msg = getErrorMessage(error, 'Invalid verification code.');
      setErrors(prev => ({ ...prev, otp: msg }));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleNextFromStep1 = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Administrator name is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'A valid email is required.';
    if (!isVerified) newErrors.email = 'Please verify your email before continuing.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please verify your profile to proceed.');
      return;
    }
    setErrors({});
    setStep(2);
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleNextFromStep2 = () => {
    const newErrors = {};
    if (!societyName.trim()) newErrors.societyName = 'Society name is required.';
    if (!address.trim()) newErrors.address = 'Physical address is required.';
    if (!regNumber.trim()) newErrors.regNumber = 'Registration number is required.';
    if (wings.length === 0) newErrors.wings = 'Please select at least one Wing/Block.';
    if (!floors || Number(floors) <= 0) newErrors.floors = 'Floors must be greater than zero.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please complete all infrastructure fields.');
      return;
    }
    setErrors({});
    setStep(3);
  };

  // Final Submission (from Step 3)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    } else {
      const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!strongPassword.test(password)) {
        newErrors.password = 'Password must include uppercase, lowercase, and a number.';
      }
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'admin',
      otp: otp.trim(),
      verificationToken,
      societyName: societyName.trim(),
      address: address.trim(),
      regNumber: regNumber.trim(),
      wings,
      floors: Number(floors),
    };

    setLoading(true);
    try {
      await api.post('/auth/register', payload);
      toast.success('Society successfully created! Please log in.');
      navigate('/login');
    } catch (error) {
      const errMsg = error.response?.data?.message;
      if (errMsg === 'OTP_NOT_REQUESTED_OR_EXPIRED' || errMsg === 'INVALID_OTP') {
        handleResetVerification();
        setStep(1);
        toast.error('Verification code has expired. Please verify email again.');
      } else {
        toast.error(getErrorMessage(error, 'Registration failed.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 14px 14px 42px',
    background: '#F9F8F3',
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    fontSize: '14px',
    color: theme.textMain,
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
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
            @media (min-width: 1001px) { .show-on-mobile { display: none !important; } }
            .form-container { width: 100%; max-width: 520px; }
            @media (max-width: 600px) { .form-container { padding: 20px 14px !important; } }
          `}
        </style>
        
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} style={{ zIndex: 10, marginBottom: 'auto' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: theme.textMain, fontWeight: '600', fontSize: '14px', padding: '8px 16px', background: '#F9F8F3', borderRadius: '20px', border: `1px solid ${theme.border}`, transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background = '#FFFFFF'} onMouseOut={e => e.target.style.background = '#F9F8F3'}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ zIndex: 10, maxWidth: '500px', marginBottom: 'auto' }}>
          <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', border: `1px solid ${theme.border}` }}>
            <img src="/awaastech-logo.png" alt="Awaastech" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '52px', fontWeight: '500', lineHeight: '1.1', color: theme.textMain, margin: '0 0 20px 0' }}>
            <AnimatedText text="Elevate your society administration." />
          </h1>
          <p style={{ fontSize: '17px', color: theme.textSec, lineHeight: '1.6', fontWeight: '300' }}>
            Onboard your community in 3 quick steps. Secure gate access, automated dues, and verified resident registries.
          </p>

          {/* Stepper overview highlights */}
          <div className="mt-8 space-y-3">
            {[
              { num: '01', title: 'Admin Verification', desc: 'Secure email OTP authentication' },
              { num: '02', title: 'Infrastructure Setup', desc: 'Wings, units & architectural limits' },
              { num: '03', title: 'Credentials & Launch', desc: 'Master password and activation' }
            ].map((s, idx) => (
              <div key={s.num} className={`p-3.5 rounded-xl border transition-all flex items-center gap-3.5 ${
                step === idx + 1 
                  ? 'bg-white border-[#D9734E] shadow-sm' 
                  : step > idx + 1 
                  ? 'bg-[#F4F1EA]/60 border-emerald-300' 
                  : 'bg-transparent border-transparent opacity-60'
              }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  step > idx + 1 ? 'bg-emerald-600 text-white' : step === idx + 1 ? 'bg-[#D9734E] text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {step > idx + 1 ? <Check size={14} /> : s.num}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{s.title}</div>
                  <div className="text-xs text-slate-500">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', right: '-10%', bottom: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(217,115,78,0.05) 0%, rgba(255,253,249,0) 70%)', borderRadius: '50%', zIndex: 0 }}
        />
      </div>

      {/* Right Side - Registration Form Wizard */}
      <div className="p-4 md:p-[40px_20px]" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
        <div className="form-container">
          <Link to="/" className="show-on-mobile" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: theme.textMain, fontWeight: '600', fontSize: '14px', marginBottom: '20px', padding: '8px 16px', background: '#F9F8F3', borderRadius: '20px', border: `1px solid ${theme.border}`, transition: 'all 0.2s' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="p-5 sm:p-8 md:p-10"
            style={{ background: 'white', borderRadius: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.04)', border: `1px solid ${theme.border}` }}
          >
            {/* Header with Title */}
            <div style={{ marginBottom: '24px' }}>
              <div className="flex items-center justify-between mb-1">
                <h2 style={{ margin: '0', fontSize: '24px', fontWeight: '600', color: theme.textMain }}>
                  Society Onboarding
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FAF7F0] border border-[#E8E4D9] text-[#D9734E]">
                  Step {step} of 3
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.textSec }}>
                {step === 1 && 'Establish administrator identity & verified contact'}
                {step === 2 && 'Configure wings, blocks, and property limits'}
                {step === 3 && 'Set secure credentials and review deployment'}
              </p>
            </div>

            {/* Wizard Progress Stepper Pills */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              {[
                { s: 1, label: 'Identity' },
                { s: 2, label: 'Society' },
                { s: 3, label: 'Security' }
              ].map(({ s, label }) => {
                const isPassed = step > s;
                const isCurrent = step === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (isPassed) setStep(s);
                    }}
                    disabled={!isPassed && !isCurrent}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-semibold transition-all border ${
                      isCurrent
                        ? 'bg-[#D9734E] text-white border-[#D9734E] shadow-sm'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 cursor-pointer'
                        : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {isPassed ? (
                      <Check size={13} className="shrink-0 stroke-[3]" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px] shrink-0">
                        {s}
                      </span>
                    )}
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* STEP 1: IDENTITY */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                  <div>
                    <label className="registry-label">Administrator Full Name *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '15px' }} />
                      <input 
                        type="text" 
                        placeholder="e.g. Vikram Malhotra" 
                        value={name} 
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                        }} 
                        required 
                        style={{ ...inputStyle, borderColor: errors.name ? '#E11D48' : theme.border }} 
                      />
                    </div>
                    <FormError error={errors.name} />
                  </div>

                  <div>
                    <label className="registry-label">Administrator Email *</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Mail size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '15px' }} />
                        <input 
                          type="email" 
                          placeholder="admin@society.org" 
                          value={email} 
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                          }} 
                          required 
                          disabled={otpSent || isVerified} 
                          style={{ ...inputStyle, borderColor: errors.email ? '#E11D48' : theme.border }} 
                        />
                      </div>
                      
                      {!isVerified && (
                        <button
                          type="button"
                          onClick={otpSent ? (timer === 0 ? sendOTP : null) : sendOTP}
                          disabled={loading || (otpSent && timer > 0)}
                          style={{
                            padding: '0 18px',
                            backgroundColor: (otpSent && timer > 0) ? '#E2E8F0' : theme.textMain,
                            color: (otpSent && timer > 0) ? '#64748B' : 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: (loading || (otpSent && timer > 0)) ? 'not-allowed' : 'pointer',
                            flexShrink: 0
                          }}
                        >
                          {loading ? '...' : otpSent ? (timer > 0 ? `${timer}s` : 'Resend') : 'Verify'}
                        </button>
                      )}
                      {isVerified && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{ padding: '0 12px', height: '48px', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '13px', borderRadius: '12px', border: '1px solid #D1FAE5' }}>
                            <CheckCircle2 size={16} className="mr-1" /> Verified
                          </div>
                          <button type="button" onClick={handleResetVerification} style={{ background: 'none', border: 'none', color: theme.textSec, fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                    <FormError error={errors.email} />

                    <AnimatePresence>
                      {otpSent && !isVerified && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <KeyRound size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '15px' }} />
                            <input 
                              type="text" 
                              placeholder="Enter 6-digit OTP" 
                              value={otp} 
                              onChange={(e) => {
                                setOtp(e.target.value);
                                if (errors.otp) setErrors(prev => ({ ...prev, otp: null }));
                              }} 
                              maxLength={6} 
                              style={{ ...inputStyle, borderColor: errors.otp ? '#E11D48' : theme.accent, borderWidth: '2px' }} 
                            />
                          </div>
                          <button
                            type="button"
                            onClick={verifyOTP}
                            disabled={loading}
                            style={{ padding: '0 20px', backgroundColor: theme.accent, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer' }}
                          >
                            Confirm OTP
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {errors.otp && <FormError error={errors.otp} />}
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleNextFromStep1}
                      disabled={!isVerified}
                      className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                        isVerified
                          ? 'bg-[#2C2C2C] text-white hover:bg-black shadow-md cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Continue to Society Setup</span>
                      <ArrowRight size={16} />
                    </button>
                    {!isVerified && (
                      <p className="text-center text-xs text-slate-400 mt-2">
                        Verify your email address with OTP code above to proceed.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SOCIETY INFRASTRUCTURE */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                  <div>
                    <label className="registry-label">Society Name *</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '15px' }} />
                      <input 
                        type="text" 
                        placeholder="e.g. Grand Horizon Cooperative Housing Society" 
                        value={societyName} 
                        onChange={(e) => {
                          setSocietyName(e.target.value);
                          if (errors.societyName) setErrors(prev => ({ ...prev, societyName: null }));
                        }} 
                        required 
                        style={{ ...inputStyle, borderColor: errors.societyName ? '#E11D48' : theme.border }} 
                      />
                    </div>
                    <FormError error={errors.societyName} />
                  </div>
                  
                  <div>
                    <label className="registry-label">Physical Address *</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '15px' }} />
                      <input 
                        type="text" 
                        placeholder="Plot No., Road, City, Pincode" 
                        value={address} 
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                        }} 
                        required 
                        style={{ ...inputStyle, borderColor: errors.address ? '#E11D48' : theme.border }} 
                      />
                    </div>
                    <FormError error={errors.address} />
                  </div>

                  <div>
                    <label className="registry-label">Registration / Society File No. *</label>
                    <div style={{ position: 'relative' }}>
                      <FileText size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '15px' }} />
                      <input 
                        type="text" 
                        placeholder="e.g. REG-MUM-2024-889" 
                        value={regNumber} 
                        onChange={(e) => {
                          setRegNumber(e.target.value);
                          if (errors.regNumber) setErrors(prev => ({ ...prev, regNumber: null }));
                        }} 
                        required 
                        style={{ ...inputStyle, borderColor: errors.regNumber ? '#E11D48' : theme.border }} 
                      />
                    </div>
                    <FormError error={errors.regNumber} />
                  </div>

                  <div>
                    <label className="registry-label">Select Wings / Blocks *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                      {WING_OPTIONS.map((opt) => (
                        <div
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
                        </div>
                      ))}
                    </div>
                    <FormError error={errors.wings} />
                  </div>

                  <div>
                    <label className="registry-label">Total Floors per Wing *</label>
                    <div style={{ position: 'relative' }}>
                      <Layers size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '15px' }} />
                      <input 
                        type="number" 
                        placeholder="e.g. 14" 
                        value={floors} 
                        onChange={(e) => {
                          setFloors(e.target.value);
                          if (errors.floors) setErrors(prev => ({ ...prev, floors: null }));
                        }} 
                        required 
                        min="1" 
                        style={{ ...inputStyle, borderColor: errors.floors ? '#E11D48' : theme.border }} 
                      />
                    </div>
                    <FormError error={errors.floors} />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-3.5 px-4 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextFromStep2}
                      className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-sm bg-[#2C2C2C] text-white hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Continue to Security</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SECURITY & SUMMARY */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                  {/* Quick Summary Pill */}
                  <div className="bg-[#FAF9F6] border border-[#E8E4D9] p-3.5 rounded-2xl space-y-1.5 text-xs text-slate-700">
                    <div className="font-bold text-slate-900 text-sm">{societyName || 'Your Society'}</div>
                    <div className="flex flex-wrap gap-2 text-slate-500">
                      <span>Admin: <strong className="text-slate-800">{name}</strong> ({email})</span>
                      <span>• Wings: <strong className="text-slate-800">{wings.join(', ')}</strong> ({floors} floors)</span>
                    </div>
                  </div>

                  <div>
                    <label className="registry-label">Create Administrator Password *</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '15px' }} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="At least 8 chars with mixed case & number" 
                        value={password} 
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                        }} 
                        required 
                        style={{ ...inputStyle, paddingRight: '45px', borderColor: errors.password ? '#E11D48' : theme.border }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        style={{ position: 'absolute', right: '14px', top: '15px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        {showPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                      </button>
                    </div>
                    <FormError error={errors.password} />
                  </div>

                  <div>
                    <label className="registry-label">Confirm Password *</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color={theme.textSec} style={{ position: 'absolute', left: '14px', top: '15px' }} />
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Repeat administrator password" 
                        value={confirmPassword} 
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
                        }} 
                        required 
                        style={{ ...inputStyle, paddingRight: '45px', borderColor: errors.confirmPassword ? '#E11D48' : theme.border }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        style={{ position: 'absolute', right: '14px', top: '15px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        {showConfirmPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                      </button>
                    </div>
                    <FormError error={errors.confirmPassword} />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="py-3.5 px-4 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 1, padding: '16px', backgroundColor: theme.accent, color: 'white',
                        border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 4px 16px rgba(217,115,78,0.25)'
                      }}
                    >
                      {loading ? 'Deploying Environment...' : 'Deploy Society Infrastructure'}
                    </button>
                  </div>
                </motion.div>
              )}

            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #F1EFEA' }}>
              <p style={{ fontSize: '13px', color: theme.textSec, margin: 0 }}>
                Already registered?{' '}
                <Link to="/login" style={{ color: theme.accent, fontWeight: '600', textDecoration: 'none' }}>
                  Sign in to Dashboard
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Register;