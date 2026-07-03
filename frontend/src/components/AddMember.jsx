import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';

const AddMember = () => {
  const { user } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wing, setWing] = useState('');
  const [floor, setFloor] = useState('0');
  const [flatNumber, setFlatNumber] = useState('');
  const [residentType, setResidentType] = useState('Owner');
  const [loading, setLoading] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);

  const [limits, setLimits] = useState({ wings: [], floors: 0, flatsPerFloor: 0 });

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const { data } = await api.get('/auth/society-limits');
        setLimits({
          wings: data.wings || [],
          floors: parseInt(data.floors) || 0,
          flatsPerFloor: parseInt(data.flatsPerFloor) || 0,
        });
        if (data.wings && data.wings.length > 0) setWing(data.wings[0]);
      } catch (error) {
        console.error('// ERR_INTAKE_LIMITS_FETCH_FAILED');
      }
    };
    if (user?.role === 'admin') fetchLimits();
  }, [user]);

  const getFlatOptions = () => {
    const options = [];
    const count = limits.flatsPerFloor;
    const currentFloor = parseInt(floor);
    for (let i = 1; i <= count; i++) {
      const flatNo = currentFloor === 0 ? i : currentFloor * 100 + i;
      options.push(flatNo.toString());
    }
    return options;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!name || !email || !wing || !floor || !flatNumber) {
      toast.error('Please fill all required fields.');
      return;
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }
    setLoading(true);
    setGeneratedCreds(null);
    try {
      const response = await api.post('/auth/add-member', {
        name, email, phone,
        wing, floor, flatNumber, residentType,
      });
      toast.success('Resident added to registry successfully.');
      setGeneratedCreds({ email, password: response.data.generatedPassword });
      setName(''); setEmail(''); setPhone('');
      setFloor('0'); setFlatNumber(''); setResidentType('Owner');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: theme.surface, border: `3px solid ${theme.border}`, padding: 'clamp(15px, 5vw, 40px)', marginBottom: '40px' }}>
      <style>
        {`
          .add-member-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .add-member-grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            padding: 20px;
            background: #F9F9F9;
            border: 1px solid ${theme.border};
          }
          .add-member-creds {
            display: flex;
            gap: 20px;
            align-items: stretch;
          }
          @media (max-width: 800px) {
            .add-member-grid-2, .add-member-grid-3 {
              grid-template-columns: 1fr !important;
            }
            .add-member-creds {
              flex-direction: column !important;
            }
          }
        `}
      </style>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(18px, 6vw, 28px)', textTransform: 'uppercase', margin: '0 0 30px 0',
        borderBottom: `2px solid ${theme.border}`, paddingBottom: '15px', wordBreak: 'break-all'
      }}>
        Resident_Intake_Form
      </h3>

      <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

        {/* Read-Only Society Name */}
        <div style={{ background: '#EAEAEA', padding: '15px', border: `1px dashed ${theme.border}` }}>
          <label className="registry-label">Assigned_Asset</label>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: '700' }}>
            {user?.societyName?.toUpperCase() || 'CORE_SYSTEM'}
          </div>
        </div>

        <div className="add-member-grid-2">
          <div>
            <label className="registry-label">Legal_Name</label>
            <input placeholder="F_NAME L_NAME" value={name} onChange={(e) => setName(e.target.value)} required className="registry-input" />
          </div>
        </div>

        <div className="add-member-grid-2">
          <div>
            <label className="registry-label">Communication_Email</label>
            <input type="email" placeholder="ADDR@DOMAIN.COM" value={email} onChange={(e) => setEmail(e.target.value)} required className="registry-input" />
          </div>
          <div>
            <label className="registry-label">Phone_Number</label>
            <input type="text" placeholder="1234567890" value={phone} onChange={(e) => setPhone(e.target.value)} className="registry-input" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div>
            <label className="registry-label">Occupancy_Status</label>
            <select value={residentType} onChange={(e) => setResidentType(e.target.value)} className="registry-input" style={{ height: '43px' }}>
              <option value="Owner">OWNER</option>
              <option value="Tenant">TENANT</option>
            </select>
          </div>
        </div>

        <div className="add-member-grid-3">
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
                <option key={f} value={f}>{f === 0 ? '00_GROUND' : f.toString().padStart(2, '0')}</option>
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

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '18px', background: theme.textMain, color: 'white', border: 'none',
            fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px', boxShadow: `6px 6px 0px ${theme.accent}`, transition: 'all 0.1s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '[ PROCESSING... ]' : '[ AUTHORIZE_NEW_RESIDENT ]'}
        </button>
      </form>

      {generatedCreds && (
        <div style={{ marginTop: '30px', padding: '20px', background: theme.fieldBg, border: `2px dashed ${theme.textMain}` }}>
          <h4 style={{ fontFamily: "'Space Mono', monospace", margin: '0 0 10px 0', color: theme.textMain }}>// TEMPORARY_CREDENTIALS_GENERATED</h4>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', marginBottom: '15px' }}>
            Please securely share these credentials with the resident. They are only displayed once.
          </p>
          <div className="add-member-creds">
            <div style={{ background: 'white', padding: '15px', border: `2px solid ${theme.border}`, flex: 1, fontFamily: "'Space Mono', monospace", fontSize: '14px' }}>
              <div><strong style={{ opacity: 0.7 }}>EMAIL:</strong> {generatedCreds.email}</div>
              <div style={{ marginTop: '5px' }}><strong style={{ opacity: 0.7 }}>PASSWORD:</strong> <span style={{ color: theme.danger, fontWeight: 'bold' }}>{generatedCreds.password}</span></div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Society Portal Access:\n\nEmail: ${generatedCreds.email}\nTemporary Password: ${generatedCreds.password}\n\nPlease login and you will be required to change this password immediately.`);
                toast.success('Copied to clipboard!');
              }}
              style={{
                padding: '0 20px', background: theme.accent, color: 'white', border: 'none',
                cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontWeight: '700',
                boxShadow: `4px 4px 0px ${theme.border}`
              }}
            >
              [ COPY_TO_CLIPBOARD ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMember;