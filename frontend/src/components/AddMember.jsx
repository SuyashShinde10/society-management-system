import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { UserPlus, Building, Copy, CheckCircle2 } from 'lucide-react';

const AddMember = () => {
  const { user } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wing, setWing] = useState('');
  const [floor, setFloor] = useState('0');
  const [flatNumber, setFlatNumber] = useState('');
  const [residentType, setResidentType] = useState('Owner');
  const [role, setRole] = useState('member');
  const [limits, setLimits] = useState({ wings: [], floors: 0 });

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const { data } = await api.get('/auth/society-limits');
        setLimits({
          wings: data.wings || [],
          floors: parseInt(data.floors) || 0,
        });
        if (data.wings && data.wings.length > 0) setWing(data.wings[0]);
      } catch (error) {
        console.error('// ERR_INTAKE_LIMITS_FETCH_FAILED');
      }
    };
    if (user?.role === 'admin') fetchLimits();
  }, [user]);

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
    if (!email) {
      toast.error('Please enter an email address first.');
      return;
    }
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
      toast.success('Email verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error('Please verify the email first.');
      return;
    }
    if (role === 'member' && (!wing || !floor || !flatNumber)) {
      toast.error('Please fill all required fields.');
      return;
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }
    setLoading(true);
    setGeneratedCreds(null);
    try {
      const response = await api.post('/auth/add-member', {
        name, email, phone,
        wing, 
        floor, 
        flatNumber, 
        residentType, 
        role: 'member'
      });
      toast.success('Resident added to registry successfully.');
      setGeneratedCreds({ email, password: response.data.generatedPassword });
      
      // Reset form (keeping OTP verified false for next entry)
      setName(''); setEmail(''); setPhone('');
      setFloor('0'); setFlatNumber(''); setResidentType('Owner');
      setIsVerified(false); setOtpSent(false); setOtp(''); setTimer(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${theme.border}`, padding: 'clamp(20px, 5vw, 40px)', marginBottom: '40px' }}>
      <style>
        {`
          .add-member-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .add-member-grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            padding: 24px;
            background: #F9F8F3;
            border-radius: 16px;
            border: 1px solid ${theme.border};
          }
          .add-member-creds {
            display: flex;
            gap: 20px;
            align-items: stretch;
          }
          .registry-input {
            border-radius: 12px !important;
            padding: 12px 16px !important;
          }
          @media (max-width: 800px) {
            .add-member-grid-2, .add-member-grid-3 {
              grid-template-columns: 1fr !important;
            }
            .add-member-creds {
              flex-direction: column !important;
            }
          }
        `}
      </style>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '20px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ background: '#EEF2FF', padding: '12px', borderRadius: '16px' }}>
          <UserPlus size={28} color="#4F46E5" />
        </div>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '600', margin: 0, color: theme.textMain
        }}>
          Resident Intake Form
        </h3>
      </div>

      <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {/* Read-Only Society Name */}
        <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: `1px solid #E2E8F0`, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Building size={20} color="#64748B" />
          <div>
            <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '4px' }}>Assigned Asset</label>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: '600', color: theme.textMain }}>
              {user?.societyName || 'Core System'}
            </div>
          </div>
        </div>

        <div className="add-member-grid-2">
          <div>
            <label className="registry-label">Legal_Name</label>
            <input placeholder="F_NAME L_NAME" value={name} onChange={(e) => setName(e.target.value)} required className="registry-input" />
          </div>
        </div>

        <div className="add-member-grid-2">
          <div>
            <label className="registry-label">Communication_Email</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="email" 
                placeholder="ADDR@DOMAIN.COM" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="registry-input" 
                style={{ flex: 1 }}
                disabled={otpSent || isVerified} 
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

            {otpSent && !isVerified && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Enter OTP" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  className="registry-input" 
                  style={{ flex: 1, borderColor: theme.accent, borderWidth: '2px' }}
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
            )}
          </div>
          <div>
            <label className="registry-label">Phone_Number</label>
            <input type="text" placeholder="1234567890" value={phone} onChange={(e) => setPhone(e.target.value)} className="registry-input" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', opacity: isVerified ? 1 : 0.4, pointerEvents: isVerified ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}>
              <div>
                <label className="registry-label">Occupancy_Status</label>
                <select value={residentType} onChange={(e) => setResidentType(e.target.value)} className="registry-input" style={{ height: '43px' }}>
                  <option value="Owner">OWNER</option>
                  <option value="Tenant">TENANT</option>
                </select>
              </div>

              <div className="add-member-grid-3">
                <div>
                  <label className="registry-label">Structure_Wing</label>
                  <select value={wing} onChange={(e) => setWing(e.target.value)} required className="registry-input">
                    <option value="">N/A</option>
                    {limits.wings.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="registry-label">Floor_Level</label>
                  <select value={floor} onChange={(e) => setFloor(e.target.value)} required className="registry-input">
                    {[...Array(limits.floors + 1).keys()].map((f) => (
                      <option key={f} value={f}>{f === 0 ? '00_GROUND' : f.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="registry-label">Unit_Number</label>
                  <input 
                    type="text" 
                    placeholder="E.g. 101A, G-4" 
                    value={flatNumber} 
                    onChange={(e) => setFlatNumber(e.target.value)} 
                    required 
                    className="registry-input" 
                  />
                </div>
              </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isVerified}
          style={{
            padding: '18px', borderRadius: '16px', backgroundColor: (!isVerified || loading) ? '#E2E8F0' : theme.textMain, color: (!isVerified || loading) ? '#94A3B8' : 'white', border: 'none',
            fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: (!isVerified || loading) ? 'not-allowed' : 'pointer',
            fontSize: '16px', boxShadow: (!isVerified || loading) ? 'none' : '0 8px 20px rgba(0,0,0,0.1)', transition: 'all 0.2s', marginTop: '10px'
          }}
          onMouseOver={(e) => !loading && isVerified ? e.target.style.transform = 'translateY(-2px)' : null}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {loading ? 'Processing...' : 'Authorize New Resident'}
        </button>
      </form>

      {generatedCreds && (
        <div style={{ marginTop: '30px', padding: '24px', background: '#F0FDF4', borderRadius: '16px', border: `1px solid #BBF7D0` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <CheckCircle2 size={24} color="#16A34A" />
            <h4 style={{ fontFamily: "'Outfit', sans-serif", margin: 0, color: '#166534', fontSize: '18px', fontWeight: '600' }}>Temporary Credentials Generated</h4>
          </div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', marginBottom: '20px', color: '#14532D' }}>
            Please securely share these credentials with the resident. They will only be displayed this one time.
          </p>
          <div className="add-member-creds">
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: `1px solid #BBF7D0`, flex: 1, fontFamily: "'Outfit', sans-serif", fontSize: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: theme.textSec, fontWeight: '600' }}>EMAIL</span>
                <span style={{ fontWeight: '500', color: theme.textMain }}>{generatedCreds.email}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px' }}>
                <span style={{ fontSize: '12px', color: theme.textSec, fontWeight: '600' }}>TEMPORARY PASSWORD</span>
                <span style={{ fontWeight: '600', color: theme.danger, letterSpacing: '1px' }}>{generatedCreds.password}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Society Portal Access:\n\nEmail: ${generatedCreds.email}\nTemporary Password: ${generatedCreds.password}\n\nPlease login and you will be required to change this password immediately.`);
                  toast.success('Copied to clipboard!');
                }}
                style={{
                  padding: '14px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '12px',
                  cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flex: 1, transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Copy size={18} /> Copy to Clipboard
              </button>
              <button
                onClick={() => setGeneratedCreds(null)}
                style={{
                  padding: '14px 20px', background: 'transparent', color: theme.textMain, border: `1px solid ${theme.border}`, borderRadius: '12px',
                  cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: '600',
                  flex: 1, transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMember;