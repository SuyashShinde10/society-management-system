import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const AddMember = () => {
  const { user } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wing, setWing] = useState('');
  const [floor, setFloor] = useState('0'); 
  const [flatNumber, setFlatNumber] = useState('');
  const [residentType, setResidentType] = useState('Owner');

  const [limits, setLimits] = useState({
    wings: [],
    floors: 0,
    flatsPerFloor: 0
  });

  const theme = {
    bg: '#F2F2F2',
    surface: '#FFFFFF',
    textMain: '#1A1A1A',
    textSec: '#4A4A4A',
    border: '#1A1A1A',
    accent: '#2563EB',
  };

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const { data } = await api.get('/auth/society-limits');
        setLimits({
          wings: data.wings || [],
          floors: parseInt(data.floors) || 0,
          flatsPerFloor: parseInt(data.flatsPerFloor) || 0
        });
        if (data.wings && data.wings.length > 0) setWing(data.wings[0]);
      } catch (error) {
        console.error("// ERR_INTAKE_LIMITS_FETCH_FAILED");
      }
    };
    if (user?.role === 'admin') fetchLimits();
  }, [user]);

  const getFlatOptions = () => {
    const options = [];
    const count = limits.flatsPerFloor;
    const currentFloor = parseInt(floor);
    for (let i = 1; i <= count; i++) {
      const flatNo = currentFloor === 0 ? i : (currentFloor * 100) + i;
      options.push(flatNo.toString());
    }
    return options;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const payload = {
      name, email, password, role: 'member', 
      societyId: user.societyId, 
      flatDetails: { wing, floor, flatNumber, residentType }
    };
    try {
      await api.post('/auth/register', payload);
      alert('IDENT_CREATED: Resident added to registry.');
      setName(''); setEmail(''); setPassword(''); 
      setFloor('0'); setFlatNumber(''); setResidentType('Owner');
    } catch (error) {
      alert(error.response?.data?.message || 'REGISTRATION_FAILED');
    }
  };

  return (
    <div style={{ background: theme.surface, border: `3px solid ${theme.border}`, padding: '40px', marginBottom: '40px' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          .registry-input {
            font-family: 'Space Mono', monospace;
            border: 1px solid #1A1A1A;
            background: #F2F2F2;
            padding: 12px;
            outline: none;
            font-size: 13px;
            width: 100%;
            box-sizing: border-box;
          }

          .registry-input:focus {
            background: #fff;
            box-shadow: 4px 4px 0px #1A1A1A;
          }

          .registry-label {
            font-family: 'Space Mono', monospace;
            font-size: 11px;
            font-weight: 700;
            color: #1A1A1A;
            text-transform: uppercase;
            display: block;
            margin-bottom: 8px;
          }
        `}
      </style>

      <h3 style={{ 
        fontFamily: "'Cormorant Garamond', serif", 
        fontSize: '28px', 
        textTransform: 'uppercase', 
        margin: '0 0 30px 0', 
        borderBottom: `2px solid ${theme.border}`, 
        paddingBottom: '15px' 
      }}>
        Resident_Intake_Form
      </h3>

      <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* Read-Only Asset Name */}
        <div style={{ background: '#EAEAEA', padding: '15px', border: '1px dashed #1A1A1A' }}>
          <label className="registry-label">Assigned_Asset</label>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: '700' }}>
            {user.societyName?.toUpperCase() || 'CORE_SYSTEM'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label className="registry-label">Legal_Name</label>
            <input placeholder="F_NAME L_NAME" value={name} onChange={(e) => setName(e.target.value)} required className="registry-input" />
          </div>
          <div>
            <label className="registry-label">Communication_Email</label>
            <input type="email" placeholder="ADDR@DOMAIN.COM" value={email} onChange={(e) => setEmail(e.target.value)} required className="registry-input" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label className="registry-label">Access_Credential</label>
            <input placeholder="SET_PASSKEY" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required className="registry-input" />
          </div>
          <div>
            <label className="registry-label">Occupancy_Status</label>
            <select value={residentType} onChange={(e) => setResidentType(e.target.value)} className="registry-input" style={{ height: '43px' }}>
              <option value="Owner">OWNER</option>
              <option value="Tenant">TENANT</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', padding: '20px', background: '#F9F9F9', border: '1px solid #1A1A1A' }}>
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
                <option key={f} value={f}>{f === 0 ? "00_GROUND" : f.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="registry-label">Unit_Number</label>
            <select value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} required className="registry-input">
              <option value="">SELECT</option>
              {getFlatOptions().map((flat) => (
                <option key={flat} value={flat}>{flat}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" style={{ 
          padding: '18px', 
          background: theme.textMain, 
          color: 'white', 
          border: 'none', 
          fontFamily: "'Space Mono', monospace", 
          fontWeight: '700', 
          cursor: 'pointer', 
          fontSize: '14px',
          boxShadow: `6px 6px 0px ${theme.accent}`,
          transition: 'all 0.1s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'translate(-2px, -2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translate(0, 0)'}
        >
          [ AUTHORIZE_NEW_RESIDENT ]
        </button>
      </form>
    </div>
  );
};

export default AddMember;