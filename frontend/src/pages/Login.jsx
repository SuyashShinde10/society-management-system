import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useContext(AuthContext); 
  const navigate = useNavigate();

  // Guard: If context is not yet ready, show nothing or a technical loader
  if (!auth) return null;
  const { login } = auth;

  const theme = {
    bg: '#F2F2F2',
    surface: '#FFFFFF', 
    textMain: '#1A1A1A',
    textSec: '#4A4A4A',  
    border: '#1A1A1A',
    accent: '#2563EB',
    fieldBg: '#E8E8E8'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      alert(`ACCESS_DENIED: ${result.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, padding: '20px' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          .brutal-input { font-family: 'Space Mono', monospace; transition: all 0.2s; border: 1px solid #1A1A1A; outline: none; }
          .brutal-input:focus { background: #fff !important; transform: translate(-2px, -2px); box-shadow: 4px 4px 0px #1A1A1A; }
          .auth-link:hover { color: #1A1A1A !important; text-decoration: underline !important; }
        `}
      </style>

      <div style={{ 
        background: theme.surface, padding: '60px', border: `3px solid ${theme.border}`,
        boxShadow: '12px 12px 0px rgba(0,0,0,0.1)', width: '100%', maxWidth: '440px' 
      }}>
        <header style={{ marginBottom: '40px', borderLeft: `8px solid ${theme.textMain}`, paddingLeft: '20px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', textTransform: 'uppercase', margin: 0, lineHeight: '0.9' }}>
            Secure <br /> Portal.
          </h2>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700', marginTop: '12px', color: theme.textSec }}>
            STATUS: RESTRICTED // LOGIN_REQUIRED
          </p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>USER_IDENTIFIER</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ADDR@DOMAIN.COM" className="brutal-input" style={{ width: '100%', padding: '14px', background: theme.fieldBg, boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>ACCESS_KEY</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="brutal-input" style={{ width: '100%', padding: '14px', background: theme.fieldBg, boxSizing: 'border-box' }} />
          </div>

          <button type="submit" style={{ 
            padding: '18px', background: theme.textMain, color: 'white', border: 'none', 
            fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer',
            boxShadow: `6px 6px 0px ${theme.accent}`, marginTop: '10px'
          }}>
            AUTHORIZE_SESSION
          </button>
        </form>

        <footer style={{ marginTop: '35px', textAlign: 'center', borderTop: `1px dashed ${theme.border}`, paddingTop: '20px' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: theme.textSec, margin: 0 }}>
            NEW_STAKEHOLDER? <Link to="/register" className="auth-link" style={{ color: theme.accent, fontWeight: '700', textDecoration: 'none' }}>REGISTER_SYSTEM</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;