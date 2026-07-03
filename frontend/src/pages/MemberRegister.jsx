import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../api';
import theme from '../theme';

const MemberRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [societies, setSocieties] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', societyId: '',
    wing: '', floor: '', flatNumber: '', residentType: 'Owner', phone: ''
  });

  useEffect(() => {
    // Fetch available societies for dropdown
    const fetchSocieties = async () => {
      try {
        const { data } = await api.get('/auth/societies');
        setSocieties(data);
      } catch (error) {
        toast.error('Failed to load societies list');
      }
    };
    fetchSocieties();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/member-register', formData);
      toast.success('Registration successful! Please wait for admin approval before logging in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, padding: '40px 20px' }}>
      <div style={{ background: theme.surface, padding: 'clamp(20px, 5vw, 50px)', border: `3px solid ${theme.border}`, boxShadow: '12px 12px 0px rgba(0,0,0,0.1)', width: '100%', maxWidth: '600px' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', textDecoration: 'none', color: theme.textMain }}>
          ← BACK_TO_HOME
        </Link>
        <header style={{ marginBottom: '40px', borderLeft: `8px solid ${theme.textMain}`, paddingLeft: '20px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 8vw, 36px)', textTransform: 'uppercase', margin: 0, lineHeight: '1' }}>
            Resident<br/>Intake.
          </h2>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', marginTop: '10px', color: theme.textSec }}>
            AWAITING ADMIN APPROVAL AFTER SUBMISSION
          </p>
        </header>

        <style>
          {`
            .register-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            @media (max-width: 800px) {
              .register-grid {
                grid-template-columns: 1fr;
              }
            }
          `}
        </style>
        <form onSubmit={handleSubmit} className="register-grid">
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="mono-label">SELECT_SOCIETY</label>
            <select name="societyId" value={formData.societyId} onChange={handleChange} required className="brutal-input" style={{ width: '100%', padding: '12px', background: theme.fieldBg }}>
              <option value="">-- Choose Society --</option>
              {societies.map(soc => (
                <option key={soc._id} value={soc._id}>{soc.name} ({soc.city})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mono-label">FULL_NAME</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="brutal-input" style={{ width: '100%', padding: '12px', background: theme.fieldBg }} />
          </div>

          <div>
            <label className="mono-label">EMAIL_ADDRESS</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="brutal-input" style={{ width: '100%', padding: '12px', background: theme.fieldBg }} />
          </div>

          <div>
            <label className="mono-label">PASSWORD</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="brutal-input" style={{ width: '100%', padding: '12px', background: theme.fieldBg }} />
          </div>

          <div>
            <label className="mono-label">PHONE_NUMBER</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="brutal-input" style={{ width: '100%', padding: '12px', background: theme.fieldBg }} />
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: `1px dashed ${theme.border}`, margin: '10px 0' }}></div>

          <div>
            <label className="mono-label">WING/BLOCK</label>
            <input type="text" name="wing" value={formData.wing} onChange={handleChange} className="brutal-input" style={{ width: '100%', padding: '12px', background: theme.fieldBg }} />
          </div>

          <div>
            <label className="mono-label">FLOOR</label>
            <input type="number" name="floor" value={formData.floor} onChange={handleChange} className="brutal-input" style={{ width: '100%', padding: '12px', background: theme.fieldBg }} />
          </div>

          <div>
            <label className="mono-label">FLAT_NUMBER</label>
            <input type="text" name="flatNumber" value={formData.flatNumber} onChange={handleChange} required className="brutal-input" style={{ width: '100%', padding: '12px', background: theme.fieldBg }} />
          </div>

          <div>
            <label className="mono-label">RESIDENT_TYPE</label>
            <select name="residentType" value={formData.residentType} onChange={handleChange} className="brutal-input" style={{ width: '100%', padding: '12px', background: theme.fieldBg }}>
              <option value="Owner">Owner</option>
              <option value="Tenant">Tenant</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '16px', background: theme.textMain, color: 'white', border: 'none',
              fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `6px 6px 0px ${theme.accent}`, opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'SUBMITTING...' : 'REQUEST_ACCESS'}
            </button>
          </div>
        </form>

        <footer style={{ marginTop: '30px', textAlign: 'center', borderTop: `1px dashed ${theme.border}`, paddingTop: '20px' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: theme.textSec }}>
            ALREADY_HAVE_ACCESS? <Link to="/login" style={{ color: theme.accent, fontWeight: '700', textDecoration: 'none' }}>LOGIN</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MemberRegister;
