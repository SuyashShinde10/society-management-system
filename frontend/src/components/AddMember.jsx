import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const AddMember = () => {
  const { user } = useContext(AuthContext);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wing, setWing] = useState('');
  const [floor, setFloor] = useState('0'); 
  const [flatNumber, setFlatNumber] = useState('');
  const [residentType, setResidentType] = useState('Owner');

  // Limits State (Fetched from Admin's Society Settings)
  const [limits, setLimits] = useState({
    wings: [],
    floors: 0,
    flatsPerFloor: 0
  });

  // 1. Fetch Society Limits on Load
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const { data } = await api.get('/auth/society-limits');
        setLimits({
          wings: data.wings || [],
          floors: parseInt(data.floors) || 0,
          flatsPerFloor: parseInt(data.flatsPerFloor) || 0
        });
        // Auto-select first wing if available
        if (data.wings && data.wings.length > 0) setWing(data.wings[0]);
      } catch (error) {
        console.error("Failed to load building details");
      }
    };
    if (user?.role === 'admin') fetchLimits();
  }, [user]);

  // 2. Auto-Generate Flat Number Dropdown based on Floor & Limit
  const getFlatOptions = () => {
    const options = [];
    const count = limits.flatsPerFloor;
    const currentFloor = parseInt(floor);

    for (let i = 1; i <= count; i++) {
      // Logic: If Floor 0 -> 1, 2, 3. If Floor 5 -> 501, 502, 503
      const flatNo = currentFloor === 0 ? i : (currentFloor * 100) + i;
      options.push(flatNo.toString());
    }
    return options;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!user || !user.societyId) return alert("Error: You are not linked to a society.");

    const payload = {
      name, email, password, role: 'member', 
      societyId: user.societyId, 
      flatDetails: { wing, floor, flatNumber, residentType }
    };

    try {
      await api.post('/auth/register', payload);
      alert('Resident Added Successfully!');
      // Reset Form
      setName(''); setEmail(''); setPassword(''); 
      setFloor('0'); setFlatNumber(''); setResidentType('Owner');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add resident');
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>➕ Add New Resident</h3>
      <form onSubmit={handleAddMember} style={formStyle}>
        
        {/* Read-Only Building Name */}
        <div style={fullRowStyle}>
          <label style={labelStyle}>Building / Society Name</label>
          <input 
            value={user.societyName || 'Your Society'} 
            disabled 
            style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} 
          />
        </div>

        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input placeholder="Ex: Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input placeholder="Ex: rahul@gmail.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </div>
        </div>

        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>Set Password</label>
            <input placeholder="Create a password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Resident Status</label>
            <select value={residentType} onChange={(e) => setResidentType(e.target.value)} style={inputStyle}>
              <option value="Owner">Owner</option>
              <option value="Tenant">Rented / Tenant</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          
          {/* --- WING DROPDOWN (Restricted) --- */}
          <div>
            <label style={labelStyle}>Wing</label>
            <select value={wing} onChange={(e) => setWing(e.target.value)} required style={inputStyle}>
              <option value="">Select</option>
              {limits.wings.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* --- FLOOR DROPDOWN (Restricted 0 to Max) --- */}
          <div>
            <label style={labelStyle}>Floor</label>
            <select value={floor} onChange={(e) => setFloor(e.target.value)} required style={inputStyle}>
              {/* Generate 0 to limits.floors options */}
              {[...Array(limits.floors + 1).keys()].map((f) => (
                <option key={f} value={f}>{f === 0 ? "0 (Ground)" : f}</option>
              ))}
            </select>
          </div>

          {/* --- FLAT DROPDOWN (Restricted) --- */}
          <div>
            <label style={labelStyle}>Flat No</label>
            <select value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} required style={inputStyle}>
              <option value="">Select Flat</option>
              {getFlatOptions().map((flat) => (
                <option key={flat} value={flat}>{flat}</option>
              ))}
            </select>
          </div>

        </div>

        <button type="submit" style={buttonStyle}>Register Resident</button>
      </form>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };
const headerStyle = { margin: '0 0 25px 0', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const fullRowStyle = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '5px', display: 'block' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' };
const buttonStyle = { padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' };

export default AddMember;