import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../api';
import theme from '../theme';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [societyName, setSocietyName] = useState('');
  const [address, setAddress] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [wings, setWings] = useState([]);
  const [floors, setFloors] = useState('');
  const [flatsPerFloor, setFlatsPerFloor] = useState('');

  const WING_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handleCheckboxChange = (opt) =>
    wings.includes(opt) ? setWings(wings.filter((i) => i !== opt)) : setWings([...wings, opt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (wings.length === 0) {
      toast.error('Please select at least one Wing.');
      return;
    }

    const payload = {
      name,
      email,
      password,
      role: 'admin',
      societyName,
      address,
      regNumber,
      wings,
      floors: Number(floors),
      flatsPerFloor: Number(flatsPerFloor),
    };

    setLoading(true);
    try {
      await api.post('/auth/register', payload);
      toast.success('Society registered successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, padding: '40px 20px' }}>
      <div style={{ background: theme.surface, padding: '60px', border: `3px solid ${theme.border}`, boxShadow: '12px 12px 0px rgba(0,0,0,0.1)', width: '100%', maxWidth: '580px' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', textDecoration: 'none', color: theme.textMain }}>
          ← BACK_TO_HOME
        </Link>
        <header style={{ marginBottom: '40px', borderLeft: `8px solid ${theme.textMain}`, paddingLeft: '20px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: '600', margin: 0, lineHeight: '0.9', textTransform: 'uppercase' }}>
            Society <br /> Deployment.
          </h2>
          <p style={{ margin: '15px 0 0 0', color: theme.textSec, fontSize: '10px', fontFamily: "'Space Mono', monospace" }}>
            VER: 2.0.26 // PORT: 443
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700', marginBottom: '10px' }}>
              SECTION_01: ADMIN_CREDENTIALS
            </label>
            <div style={{ display: 'grid', gap: '10px' }}>
              <input placeholder="FULL_NAME" value={name} onChange={(e) => setName(e.target.value)} required className="brutal-input" />
              <input type="email" placeholder="EMAIL_ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)} required className="brutal-input" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} required className="brutal-input" />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700', marginBottom: '10px' }}>
              SECTION_02: SOCIETY_MANIFEST
            </label>
            <div style={{ display: 'grid', gap: '10px' }}>
              <input placeholder="SOCIETY_NAME" value={societyName} onChange={(e) => setSocietyName(e.target.value)} required className="brutal-input" />
              <input placeholder="PHYSICAL_ADDRESS" value={address} onChange={(e) => setAddress(e.target.value)} required className="brutal-input" />
              <input
                placeholder="REGISTRATION_NO (e.g. REG-12345)"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                required
                className="brutal-input"
              />

              <div style={{ marginTop: '5px' }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', display: 'block', marginBottom: '8px' }}>WING_CONFIGURATION:</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px' }}>
                  {WING_OPTIONS.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => handleCheckboxChange(opt)}
                      style={{
                        border: `1px solid ${theme.textMain}`, padding: '10px', cursor: 'pointer',
                        fontFamily: "'Space Mono', monospace", fontSize: '12px', textAlign: 'center',
                        transition: '0.2s',
                        backgroundColor: wings.includes(opt) ? theme.textMain : theme.fieldBg,
                        color: wings.includes(opt) ? 'white' : theme.textMain,
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="number" placeholder="TOTAL_FLOORS" value={floors} onChange={(e) => setFloors(e.target.value)} required className="brutal-input" min="1" />
                <input type="number" placeholder="FLATS/FLOOR" value={flatsPerFloor} onChange={(e) => setFlatsPerFloor(e.target.value)} required className="brutal-input" min="1" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '20px', backgroundColor: theme.textMain, color: 'white',
              border: 'none', fontSize: '16px', fontWeight: '700', fontFamily: "'Space Mono', monospace",
              cursor: loading ? 'not-allowed' : 'pointer', boxShadow: `6px 6px 0px ${theme.accent}`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'DEPLOYING...' : 'INITIALIZE_DEPLOYMENT'}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center', borderTop: `1px dashed ${theme.border}`, paddingTop: '20px' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: theme.textSec, margin: 0 }}>
            ALREADY_REGISTERED?{' '}
            <Link to="/login" style={{ color: theme.accent, fontWeight: '700', textDecoration: 'none' }}>
              LOGIN_SYSTEM
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;