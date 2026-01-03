import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  
  // Basic User Info (Always Admin)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');

  // Society Data
  const [societyName, setSocietyName] = useState('');
  const [address, setAddress] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [wings, setWings] = useState([]);
  const [floors, setFloors] = useState('');
  const [flatsPerFloor, setFlatsPerFloor] = useState('');

  const WING_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

  const handleCheckboxChange = (option) => {
    if (wings.includes(option)) {
      setWings(wings.filter(item => item !== option));
    } else {
      setWings([...wings, option]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!name || !email || !password || !secretCode || !societyName || !address || !regNumber || wings.length === 0 || !floors || !flatsPerFloor) {
      return alert("Please fill all fields and select at least one Wing.");
    }
    if (password.length < 6) return alert("Password must be 6+ chars");

    const payload = {
      name, email, password, secretCode,
      role: 'admin', // Hardcoded to admin
      societyName, address, regNumber,
      wings: wings.join(','),
      floors, flatsPerFloor
    };

    try {
      await api.post('/auth/register', payload);
      alert('Society Registered Successfully! Please Login.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration Failed');
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Register New Society</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            Create a digital space for your building management
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Admin Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            <h4 style={sectionHeader}>👤 Admin Details</h4>
            <input type="text" placeholder="Admin Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            <input type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            <input type="text" placeholder="Secret Code (for recovery)" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ width: '100%', height: '1px', background: '#e2e8f0', margin: '20px 0' }}></div>

          {/* Society Details */}
          <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ ...sectionHeader, color: '#1e3a8a', marginTop: 0 }}>🏢 Building Details</h4>
            
            <div style={{ display: 'grid', gap: '10px' }}>
              <input placeholder="Society Name" value={societyName} onChange={(e) => setSocietyName(e.target.value)} required style={inputStyle} />
              <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
              <input placeholder="Registration Number" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} required style={inputStyle} />
            </div>

            {/* Wing Selection */}
            <div style={{ margin: '15px 0' }}>
              <label style={labelStyle}>Select Wings:</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {WING_OPTIONS.map((w) => (
                  <div 
                    key={w} 
                    onClick={() => handleCheckboxChange(w)}
                    style={{
                      ...wingChipStyle,
                      background: wings.includes(w) ? '#2563eb' : 'white',
                      color: wings.includes(w) ? 'white' : '#64748b',
                      borderColor: wings.includes(w) ? '#2563eb' : '#cbd5e1'
                    }}
                  >
                    {w}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input 
                type="number" 
                min="0" 
                placeholder="Total Floors" 
                value={floors} 
                onChange={(e) => setFloors(e.target.value)} 
                required 
                style={inputStyle} 
              />
              <input 
                type="number" 
                min="0" 
                placeholder="Flats per Floor" 
                value={flatsPerFloor} 
                onChange={(e) => setFlatsPerFloor(e.target.value)} 
                required 
                style={inputStyle} 
              />
            </div>
          </div>

          <button type="submit" style={buttonStyle}>Register Society</button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

// --- STYLES ---
const pageStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'sans-serif', padding: '20px' };
const cardStyle = { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '500px', border: '1px solid #e2e8f0' };
const sectionHeader = { margin: '0 0 10px 0', fontSize: '1rem', color: '#334155' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' };
const wingChipStyle = { width: '40px', height: '40px', borderRadius: '50%', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', userSelect: 'none' };
const buttonStyle = { width: '100%', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '25px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' };

export default Register;