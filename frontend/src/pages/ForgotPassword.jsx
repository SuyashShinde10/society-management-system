import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';
import api from '../api';
import { ArrowLeft, KeyRound, Mail, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Verification code sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please enter both OTP and new password.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
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
          `}
        </style>
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8 }}
          style={{ zIndex: 10, marginBottom: 'auto' }}
        >
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: theme.textSec, fontWeight: '500', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = theme.accent} onMouseOut={e => e.target.style.color = theme.textSec}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ zIndex: 10, maxWidth: '500px', marginBottom: 'auto' }}
        >
          <div style={{ width: '50px', height: '50px', background: theme.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', border: `1px solid ${theme.border}` }}>
            <KeyRound size={24} color={theme.accent} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '54px', fontWeight: '500', lineHeight: '1.1', color: theme.textMain, margin: '0 0 20px 0' }}>
            Account Recovery
          </h1>
          <p style={{ fontSize: '18px', color: theme.textSec, lineHeight: '1.6', fontWeight: '300' }}>
            Regain access to your community dashboard securely. We'll send a verification code to your registered email.
          </p>
        </motion.div>

        {/* Decorative Blobs */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', right: '-20%', bottom: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(217,115,78,0.04) 0%, rgba(255,253,249,0) 70%)', borderRadius: '50%', zIndex: 0 }}
        />
      </div>

      {/* Right Side - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          style={{ width: '100%', maxWidth: '440px', background: 'white', padding: '50px', borderRadius: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.04)', border: `1px solid ${theme.border}` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ background: '#F9F8F3', padding: '12px', borderRadius: '14px', color: theme.accent }}>
              {step === 1 ? <Mail size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <div>
              <h2 style={{ margin: '0', fontSize: '24px', fontWeight: '600', color: theme.textMain }}>
                {step === 1 ? 'Forgot Password' : 'Reset Password'}
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSec }}>
                {step === 1 ? 'Enter your email to receive a code' : 'Enter the code and your new password'}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOTP} 
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
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
                      borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.background = '#FFFFFF'; }}
                    onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.background = '#F9F8F3'; }}
                  />
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
                  {loading ? 'Sending...' : 'Send Recovery Code'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword} 
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Verification Code (OTP)</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    placeholder="123456"
                    style={{ 
                      width: '100%', padding: '16px', background: '#F9F8F3', border: `1px solid ${theme.border}`, 
                      borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', letterSpacing: '2px'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.background = '#FFFFFF'; }}
                    onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.background = '#F9F8F3'; }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{ 
                        width: '100%', padding: '16px', paddingRight: '45px', background: '#F9F8F3', border: `1px solid ${theme.border}`, 
                        borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.background = '#FFFFFF'; }}
                      onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.background = '#F9F8F3'; }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {showPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: theme.textSec, marginTop: '8px', lineHeight: '1.4' }}>
                    Must be at least 8 characters, include an uppercase letter, a lowercase letter, and a number.
                  </p>
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
                  {loading ? 'Resetting...' : 'Update Password'}
                </motion.button>

                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    style={{ background: 'none', border: 'none', color: theme.textSec, fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Use a different email
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

        </motion.div>
      </div>

    </div>
  );
};

export default ForgotPassword;
