import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import AuthContext from '../context/AuthContext';
import { useContext } from 'react';
import theme from '../theme';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      if (result.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/resident');
      }
    } else {
      toast.error(`Access denied: ${result.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, padding: '20px' }}>
      <div style={{
        background: theme.surface, padding: '60px', border: `3px solid ${theme.border}`,
        boxShadow: '12px 12px 0px rgba(0,0,0,0.1)', width: '100%', maxWidth: '440px'
      }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', textDecoration: 'none', color: theme.textMain }}>
          ← BACK_TO_HOME
        </Link>
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
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ADDR@DOMAIN.COM"
              className="brutal-input"
              style={{ width: '100%', padding: '14px', background: theme.fieldBg, boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>ACCESS_KEY</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="brutal-input"
              style={{ width: '100%', padding: '14px', background: theme.fieldBg, boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '18px', background: theme.textMain, color: 'white', border: 'none',
              fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `6px 6px 0px ${theme.accent}`, marginTop: '10px', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'AUTHENTICATING...' : 'AUTHORIZE_SESSION'}
          </button>
        </form>

        <footer style={{ marginTop: '35px', textAlign: 'center', borderTop: `1px dashed ${theme.border}`, paddingTop: '20px' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: theme.textSec, margin: 0 }}>
            NEW_STAKEHOLDER?{' '}
            <Link to="/register" style={{ color: theme.accent, fontWeight: '700', textDecoration: 'none' }}>
              REGISTER_SYSTEM
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;