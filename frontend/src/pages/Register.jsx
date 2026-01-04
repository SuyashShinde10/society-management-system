import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [societyName, setSocietyName] = useState('');
  const [address, setAddress] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [wings, setWings] = useState([]);
  const [floors, setFloors] = useState('');
  const [flatsPerFloor, setFlatsPerFloor] = useState('');

  const WING_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const theme = { bg: '#F2F2F2', surface: '#FFFFFF', textMain: '#1A1A1A', textSec: '#4A4A4A', border: '#1A1A1A', accent: '#2563EB', fieldBg: '#E8E8E8' };

  const handleCheckboxChange = (opt) => wings.includes(opt) ? setWings(wings.filter(i => i !== opt)) : setWings([...wings, opt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (wings.length === 0) return alert("VALIDATION_ERROR: Select at least one Wing.");

    const payload = {
      name, email, password, secretCode, role: 'admin',
      societyName, address, regNumber,
      wings: wings, // Sending as array for backend compatibility
      floors: Number(floors),
      flatsPerFloor: Number(flatsPerFloor)
    };

    try {
      await api.post('/auth/register', payload);
      alert('REGISTRY_SUCCESS: Society Deployed.');
      navigate('/login');
    } catch (error) {
      if (!error.response) {
        alert("PROTOCOL_ERROR: Server unreachable. Check your Vercel logs.");
      } else {
        alert(`REGISTRATION_REJECTED: ${error.response.data.message || "Unknown Error"}`);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, padding: '40px 20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
        .brutal-input { font-family: 'Space Mono', monospace; transition: 0.2s; border: 1px solid #1A1A1A; width: 100%; padding: 15px; box-sizing: border-box; background: #E8E8E8; outline: none; }
        .brutal-input:focus { background: #fff; transform: translate(-2px, -2px); box-shadow: 4px 4px 0px #1A1A1A; }
        .wing-btn { border: 1px solid #1A1A1A; padding: 10px; cursor: pointer; font-family: 'Space Mono', monospace; font-size: 12px; text-align: center; transition: 0.2s; }
      `}</style>

      <div style={{ background: theme.surface, padding: '60px', border: `3px solid ${theme.border}`, boxShadow: '12px 12px 0px rgba(0,0,0,0.1)', width: '100%', maxWidth: '580px' }}>
        <header style={{ marginBottom: '50px', borderLeft: `8px solid ${theme.textMain}`, paddingLeft: '20px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: '600', margin: 0, lineHeight: '0.9', textTransform: 'uppercase' }}>Society <br/> Deployment.</h2>
          <p style={{ margin: '15px 0 0 0', color: theme.textSec, fontSize: '12px', fontFamily: "'Space Mono', monospace", fontWeight: '700' }}>VERSION: 2.0.26 // STATUS: PENDING_AUTH</p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* SECTION 01: ADMIN */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700', marginBottom: '10px' }}>SECTION_01: ADMIN_ID</label>
            <div style={{ display: 'grid', gap: '10px' }}>
              <input placeholder="FULL_NAME" value={name} onChange={(e) => setName(e.target.value)} required className="brutal-input" />
              <input type="email" placeholder="EMAIL_ADDR" value={email} onChange={(e) => setEmail(e.target.value)} required className="brutal-input" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="password" placeholder="PASS_KEY" value={password} onChange={(e) => setPassword(e.target.value)} required className="brutal-input" />
                <input type="text" placeholder="SEC_CODE" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} required className="brutal-input" />
              </div>
            </div>
          </div>

          {/* SECTION 02: STRUCTURE */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700', marginBottom: '10px' }}>SECTION_02: STRUCTURE</label>
            <div style={{ display: 'grid', gap: '10px' }}>
              <input placeholder="SOCIETY_NAME" value={societyName} onChange={(e) => setSocietyName(e.target.value)} required className="brutal-input" />
              <input placeholder="ADDRESS" value={address} onChange={(e) => setAddress(e.target.value)} required className="brutal-input" />
              
              {/* WING SELECTION */}
              <div style={{ marginTop: '5px' }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', display: 'block', marginBottom: '8px' }}>SELECT_WINGS:</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px' }}>
                  {WING_OPTIONS.map(opt => (
                    <div 
                      key={opt}
                      onClick={() => handleCheckboxChange(opt)}
                      className="wing-btn"
                      style={{ 
                        backgroundColor: wings.includes(opt) ? theme.textMain : theme.fieldBg,
                        color: wings.includes(opt) ? 'white' : theme.textMain
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="number" placeholder="FLOORS" value={floors} onChange={(e) => setFloors(e.target.value)} required className="brutal-input" />
                <input type="number" placeholder="FLATS_PER_FL" value={flatsPerFloor} onChange={(e) => setFlatsPerFloor(e.target.value)} required className="brutal-input" />
              </div>
            </div>
          </div>

          <button type="submit" style={{ width: '100%', padding: '20px', backgroundColor: theme.textMain, color: 'white', border: 'none', fontSize: '16px', fontWeight: '700', fontFamily: "'Space Mono', monospace", cursor: 'pointer', boxShadow: `6px 6px 0px ${theme.accent}` }}>
            INITIALIZE_SYSTEM
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;