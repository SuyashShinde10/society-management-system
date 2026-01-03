import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  
  // Basic User Info
  const [role, setRole] = useState('member');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');

  // Admin Data
  const [societyName, setSocietyName] = useState('');
  const [address, setAddress] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [adminWings, setAdminWings] = useState([]);
  const [floors, setFloors] = useState('');
  const [flatsPerFloor, setFlatsPerFloor] = useState('');

  // Member Data
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState('');
  const [memberWings, setMemberWings] = useState([]);
  const [floor, setFloor] = useState('');
  const [flatNumber, setFlatNumber] = useState('');

  const WING_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const { data } = await api.get('/auth/societies');
        setSocieties(data);
      } catch (error) {
        console.error("Failed to load societies");
      }
    };
    fetchSocieties();
  }, []);

  const handleCheckboxChange = (option, currentList, setList) => {
    if (currentList.includes(option)) {
      setList(currentList.filter(item => item !== option));
    } else {
      setList([...currentList, option]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!name || !email || !password) return alert("Fill all basic fields");
    if (password.length < 6) return alert("Password must be 6+ chars");

    if (role === 'admin') {
      // Check for empty strings specifically so '0' is allowed
      if (!societyName || !address || !regNumber || adminWings.length === 0 || floors === '' || flatsPerFloor === '') {
        return alert("Fill all Building Details and select at least one Wing.");
      }
    } else {
      if (!selectedSociety) return alert("Select a Society");
      // Check for empty strings specifically so '0' floor is allowed
      if (memberWings.length === 0 || floor === '' || !flatNumber) return alert("Select your Wing and Flat details.");
    }

    const payload = {
      name, email, password, role, secretCode,
      ...(role === 'admin' ? {
        societyName, address, regNumber, 
        wings: adminWings.join(','),
        floors, flatsPerFloor
      } : {
        societyId: selectedSociety,
        flatDetails: { 
          wing: memberWings.join(','),
          floor, flatNumber 
        }
      })
    };

    try {
      await api.post('/auth/register', payload);
      alert('Registration Successful! Please Login.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration Failed');
    }
  };

  // Theme Colors based on Role
  const themeColor = role === 'admin' ? '#2563eb' : '#db2777'; 

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Create Account</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Join your society digital platform</p>
        </div>

        {/* ROLE TOGGLE TABS */}
        <div style={tabContainerStyle}>
          <button 
            type="button"
            onClick={() => setRole('member')}
            style={{ ...tabStyle, background: role === 'member' ? '#db2777' : 'transparent', color: role === 'member' ? 'white' : '#64748b' }}
          >
            Society Member
          </button>
          <button 
            type="button"
            onClick={() => setRole('admin')}
            style={{ ...tabStyle, background: role === 'admin' ? '#2563eb' : 'transparent', color: role === 'admin' ? 'white' : '#64748b' }}
          >
            Society Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Common Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            
            {role === 'admin' && (
              <input type="text" placeholder="Admin Secret Code" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} required style={inputStyle} />
            )}
          </div>

          <div style={{ width: '100%', height: '1px', background: '#e2e8f0', margin: '20px 0' }}></div>

          {/* --- ADMIN SECTION --- */}
          {role === 'admin' && (
            <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <h4 style={{ marginTop: 0, color: '#1e3a8a' }}>🏢 Building Details</h4>
              
              <div style={{ display: 'grid', gap: '10px' }}>
                <input placeholder="Society Name" value={societyName} onChange={(e) => setSocietyName(e.target.value)} required style={inputStyle} />
                <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
                <input placeholder="Reg. Number" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} required style={inputStyle} />
              </div>

              {/* Wing Selection Chips */}
              <div style={{ margin: '15px 0' }}>
                <label style={labelStyle}>Select Wings:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {WING_OPTIONS.map((w) => (
                    <div 
                      key={w} 
                      onClick={() => handleCheckboxChange(w, adminWings, setAdminWings)}
                      style={{
                        ...wingChipStyle,
                        background: adminWings.includes(w) ? themeColor : 'white',
                        color: adminWings.includes(w) ? 'white' : '#64748b',
                        borderColor: adminWings.includes(w) ? themeColor : '#cbd5e1'
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
                  min="0" // Allow 0
                  placeholder="Total Floors" 
                  value={floors} 
                  onChange={(e) => setFloors(e.target.value)} 
                  required 
                  style={inputStyle} 
                />
                <input 
                  type="number" 
                  min="0" // Allow 0
                  placeholder="Flats/Floor" 
                  value={flatsPerFloor} 
                  onChange={(e) => setFlatsPerFloor(e.target.value)} 
                  required 
                  style={inputStyle} 
                />
              </div>
            </div>
          )}

          {/* --- MEMBER SECTION --- */}
          {role === 'member' && (
            <div style={{ background: '#fdf2f8', padding: '20px', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
              <h4 style={{ marginTop: 0, color: '#831843' }}>🏠 Flat Details</h4>
              
              <select value={selectedSociety} onChange={(e) => setSelectedSociety(e.target.value)} required style={{ ...inputStyle, background: 'white', marginBottom: '15px' }}>
                <option value="">-- Select Society --</option>
                {societies.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.address})</option>
                ))}
              </select>

              {/* Wing Selection Chips */}
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Select Your Wing:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {WING_OPTIONS.map((w) => (
                    <div 
                      key={w} 
                      onClick={() => handleCheckboxChange(w, memberWings, setMemberWings)}
                      style={{
                        ...wingChipStyle,
                        background: memberWings.includes(w) ? themeColor : 'white',
                        color: memberWings.includes(w) ? 'white' : '#64748b',
                        borderColor: memberWings.includes(w) ? themeColor : '#cbd5e1'
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
                  min="0" // Allow 0 (Ground Floor)
                  placeholder="Floor (0=Ground)" 
                  value={floor} 
                  onChange={(e) => setFloor(e.target.value)} 
                  required 
                  style={inputStyle} 
                />
                <input placeholder="Flat No" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} required style={inputStyle} />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            style={{ 
              ...buttonStyle, 
              background: themeColor,
              marginTop: '25px'
            }}
          >
            {role === 'admin' ? 'Register Society' : 'Join Society'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: themeColor, fontWeight: 'bold', textDecoration: 'none' }}>Login</Link>
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
  background: '#f1f5f9',
  fontFamily: 'sans-serif',
  padding: '20px'
};

const cardStyle = {
  background: 'white',
  padding: '40px',
  borderRadius: '12px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '550px',
  border: '1px solid #e2e8f0'
};

const tabContainerStyle = {
  display: 'flex',
  background: '#f1f5f9',
  borderRadius: '8px',
  padding: '4px',
  marginBottom: '25px'
};

const tabStyle = {
  flex: 1,
  padding: '10px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'all 0.2s'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  outline: 'none'
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  color: '#475569',
  fontSize: '0.9rem'
};

const wingChipStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'all 0.2s',
  userSelect: 'none'
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

export default Register;