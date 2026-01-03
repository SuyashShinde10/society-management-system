import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- VALIDATION ---
    if (!email.includes('@')) {
      return alert("Please enter a valid email address.");
    }
    if (!password) {
      return alert("Please enter your password.");
    }
    // ------------------

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      alert('Invalid Email or Password');
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1.8rem' }}>Welcome Back</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Enter your credentials to access your account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Email Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="name@example.com"
              style={inputStyle}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" style={buttonStyle}>
            Sign In
          </button>
        </form>

        {/* Footer Link */}
        <p style={{ marginTop: '25px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={linkStyle}>Register here</Link>
        </p>

      </div>
    </div>
  );
};

// --- STYLES ---

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f1f5f9', // Light gray background
  fontFamily: 'sans-serif'
};

const cardStyle = {
  background: 'white',
  padding: '40px',
  borderRadius: '12px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '400px',
  border: '1px solid #e2e8f0'
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  color: '#334155',
  fontSize: '0.9rem'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '1rem',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border 0.2s',
  color: '#1e293b'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background 0.2s'
};

const linkStyle = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '600'
};

export default Login;