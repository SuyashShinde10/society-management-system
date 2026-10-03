import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import { Shield, ShieldCheck, Mail, Phone, Calendar, Clock, MapPin, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import api from '../api';
import theme from '../theme';
import AuthContext from '../context/AuthContext';
import FormError from './ui/FormError';

const AddSecurity = ({ onAdd }) => {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Day');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generatedCreds, setGeneratedCreds] = useState(null);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  // Timer Effect
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
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrors((prev) => ({ ...prev, email: 'A valid email address is required to send verification code.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, email: null }));
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { 
        email,
        societyName: user?.societyName,
        adminName: user?.name,
        adminEmail: user?.email
      });
      setOtpSent(true);
      setTimer(120);
      toast.success('OTP sent to the email!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send OTP.';
      setErrors((prev) => ({ ...prev, email: msg }));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.trim().length < 4) {
      setErrors((prev) => ({ ...prev, otp: 'Please enter the full OTP code.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, otp: null }));
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setIsVerified(true);
      setTimer(0);
      toast.success('Email verified successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid OTP.';
      setErrors((prev) => ({ ...prev, otp: msg }));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'A valid email is required.';
    if (!isVerified) newErrors.email = 'Please verify email before adding staff.';
    if (!phone.trim() || !/^\d{10}$/.test(phone)) newErrors.phone = 'Phone number must be exactly 10 digits.';
    if (!age || Number(age) < 18 || Number(age) > 75) newErrors.age = 'Age must be between 18 and 75.';
    if (!address.trim()) newErrors.address = 'Permanent address is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please review the highlighted fields.');
      return;
    }

    setErrors({});
    setLoading(true);
    setGeneratedCreds(null);

    try {
      const response = await api.post('/auth/add-security-staff', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        age: Number(age),
        address: address.trim(),
        joinDate,
        shift
      });
      toast.success('Security Staff added successfully.');
      setGeneratedCreds({ email, password: response.data.generatedPassword });
      if (onAdd) onAdd();
      
      // Reset form
      setName(''); setEmail(''); setPhone('');
      setAge(''); setAddress(''); setJoinDate(new Date().toISOString().split('T')[0]); setShift('Day');
      setIsVerified(false); setOtpSent(false); setOtp(''); setTimer(0);
      setErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add security staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {generatedCreds && (
          <div style={{ background: '#ECFDF5', border: '1px solid #10B981', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ background: '#D1FAE5', padding: '10px', borderRadius: '50%' }}>
              <ShieldCheck size={24} color="#059669" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#065F46', fontSize: '18px' }}>Staff Account Created</h4>
              <p style={{ margin: '0 0 16px 0', color: '#064E3B', fontSize: '14px' }}>
                Share these temporary credentials with the security guard. They will be forced to change the password upon first login.
              </p>
              <div style={{ background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px dashed #34D399', display: 'inline-block' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <Mail size={16} color="#059669" />
                  <strong style={{ color: '#065F46' }}>Email:</strong>
                  <span style={{ color: theme.textMain }}>{generatedCreds.email}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <KeyRound size={16} color="#059669" />
                  <strong style={{ color: '#065F46' }}>Temporary Password:</strong>
                  <span style={{ color: theme.textMain, fontWeight: '600', letterSpacing: '1px' }}>{generatedCreds.password}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color={theme.accent} /> Personal Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Full Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Ramesh Singh" 
                value={name} 
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }} 
                required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${errors.name ? '#E11D48' : theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
              />
              <FormError error={errors.name} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Email Address *</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="email" 
                  placeholder="e.g. ramesh@example.com" 
                  value={email} 
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                  }} 
                  required 
                  disabled={otpSent || isVerified}
                  style={{ flex: 1, padding: '12px 16px', background: 'white', border: `1px solid ${errors.email ? '#E11D48' : theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
                />
                {!isVerified && (
                  <button
                    type="button"
                    onClick={otpSent ? (timer === 0 ? sendOTP : null) : sendOTP}
                    disabled={loading || (otpSent && timer > 0)}
                    style={{
                      padding: '0 20px', borderRadius: '12px', backgroundColor: (otpSent && timer > 0) ? '#E2E8F0' : theme.textMain, color: (otpSent && timer > 0) ? '#64748B' : 'white',
                      border: 'none', fontWeight: '600', fontFamily: "'Outfit', sans-serif", cursor: (loading || (otpSent && timer > 0)) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => !loading && !(otpSent && timer > 0) ? e.target.style.transform = 'translateY(-2px)' : null}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    {loading ? '...' : otpSent ? (timer > 0 ? `Resend (${timer}s)` : 'Resend OTP') : 'Verify'}
                  </button>
                )}
                {isVerified && (
                  <div style={{ padding: '0 20px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', fontFamily: "'Outfit', sans-serif", border: '1px solid #BBF7D0' }}>
                    <CheckCircle2 size={18} /> Verified
                  </div>
                )}
              </div>
              <FormError error={errors.email} />
              
              {otpSent && !isVerified && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Enter OTP" 
                      value={otp} 
                      onChange={(e) => {
                        setOtp(e.target.value);
                        if (errors.otp) setErrors(prev => ({ ...prev, otp: null }));
                      }} 
                      style={{ flex: 1, padding: '12px 16px', background: 'white', border: `2px solid ${errors.otp ? '#E11D48' : theme.accent}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={verifyOTP}
                      disabled={loading}
                      style={{
                        padding: '0 20px', borderRadius: '12px', backgroundColor: theme.accent, color: 'white',
                        border: 'none', fontWeight: '600', fontFamily: "'Outfit', sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
                      }}
                      onMouseOver={(e) => !loading ? e.target.style.transform = 'translateY(-2px)' : null}
                      onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      Confirm
                    </button>
                  </div>
                  <FormError error={errors.otp} />
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Phone Number *</label>
              <input 
                type="tel" 
                placeholder="e.g. 9876543210" 
                value={phone} 
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                }} 
                required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${errors.phone ? '#E11D48' : theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
              />
              <FormError error={errors.phone} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Age *</label>
              <input 
                type="number" 
                placeholder="e.g. 35" 
                value={age} 
                onChange={(e) => {
                  setAge(e.target.value);
                  if (errors.age) setErrors(prev => ({ ...prev, age: null }));
                }} 
                required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${errors.age ? '#E11D48' : theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
              />
              <FormError error={errors.age} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Permanent Address *</label>
              <input 
                type="text" 
                placeholder="Full permanent address" 
                value={address} 
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                }} 
                required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${errors.address ? '#E11D48' : theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
              />
              <FormError error={errors.address} />
            </div>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color={theme.accent} /> Employment Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Duty Shift</label>
              <select value={shift} onChange={(e) => setShift(e.target.value)} required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}>
                <option value="Day">Day</option>
                <option value="Night">Night</option>
                <option value="Rotational">Rotational</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Join Date</label>
              <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isVerified}
          style={{
            background: (!isVerified || loading) ? '#E2E8F0' : theme.textMain, color: (!isVerified || loading) ? '#94A3B8' : 'white', border: 'none', borderRadius: '14px',
            padding: '18px', fontSize: '16px', fontWeight: '600', cursor: (!isVerified || loading) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
            marginTop: '10px', boxShadow: (!isVerified || loading) ? 'none' : '0 8px 24px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? <><Loader2 size={18} className="spin" /> Creating Profile...</> : 'Authorize Security Staff'}
        </button>

      </form>
    </div>
  );
};

export default AddSecurity;
