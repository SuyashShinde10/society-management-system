import React, { useState, useEffect, useContext, useRef } from 'react';
import { LogOut, UserPlus, LogIn, LogOut as CheckOutIcon, Clock, Users, Building, ShieldCheck, Camera, PenTool, X } from 'lucide-react';
import Webcam from 'react-webcam';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';
import theme from '../theme';

const SecurityDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Visitor Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('Delivery');
  const [wing, setWing] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  
  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);
  const sigCanvasRef = useRef(null);
  
  const [limits, setLimits] = useState({ wings: [] });

  useEffect(() => {
    fetchVisitors();
    fetchSocietyLimits();
  }, []);

  const fetchVisitors = async () => {
    try {
      const { data } = await api.get('/visitors/today');
      setVisitors(data);
    } catch (error) {
      toast.error('Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  const fetchSocietyLimits = async () => {
    try {
      const { data } = await api.get('/auth/society-limits');
      setLimits({ wings: data.wings || [] });
      if (data.wings && data.wings.length > 0) setWing(data.wings[0]);
    } catch (error) {
      console.error('Failed to fetch society wings');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!name || !phone || !purpose || !flatNumber) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      const { data } = await api.post('/visitors/check-in', {
        name, phone, purpose, wing, flatNumber, photo, signature
      });
      toast.success('Visitor Checked In');
      setVisitors([data.visitor, ...visitors]);
      
      // Reset form
      setName('');
      setPhone('');
      setPurpose('Delivery');
      setFlatNumber('');
      setPhoto(null);
      setSignature(null);
      if (sigCanvasRef.current) sigCanvasRef.current.clear();
      setShowCamera(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      const { data } = await api.put(`/visitors/check-out/${id}`);
      toast.success('Visitor Checked Out');
      setVisitors(visitors.map(v => v._id === id ? data.visitor : v));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const insideCount = visitors.filter(v => v.status === 'Inside').length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ 
        background: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', 
        alignItems: 'center', borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#1E293B', padding: '10px', borderRadius: '12px' }}>
            <ShieldCheck size={24} color="#F8FAFC" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1E293B' }}>Security Desk</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{user?.societyName}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '10px 16px', 
            borderRadius: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
          }}
        >
          <LogOut size={18} /> <span className="hide-mobile">Logout</span>
        </button>
      </div>

      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ background: '#EEF2FF', padding: '8px', borderRadius: '8px' }}>
                <Users size={20} color="#4F46E5" />
              </div>
              <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>Total Today</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1E293B' }}>{visitors.length}</h2>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ background: '#FEF2F2', padding: '8px', borderRadius: '8px' }}>
                <Building size={20} color="#EF4444" />
              </div>
              <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>Inside Society</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#EF4444' }}>{insideCount}</h2>
          </div>
        </div>

        {/* Check In Form */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: `1px solid ${theme.border}`, marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
            <UserPlus size={20} color={theme.accent} /> New Visitor Entry
          </h3>
          <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input type="text" placeholder="Visitor Name" required value={name} onChange={e => setName(e.target.value)} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, fontSize: '15px' }} />
              <input type="tel" placeholder="Phone Number" required value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, fontSize: '15px' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <select value={purpose} onChange={e => setPurpose(e.target.value)} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, fontSize: '15px', background: 'white' }}>
                <option value="Delivery">Delivery (Amazon, Zomato, etc)</option>
                <option value="Guest">Guest / Relative</option>
                <option value="Maid/Helper">Maid / Helper</option>
                <option value="Maintenance">Maintenance / Plumber</option>
                <option value="Other">Other</option>
              </select>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {limits.wings.length > 0 && (
                  <select value={wing} onChange={e => setWing(e.target.value)} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, fontSize: '15px', background: 'white', width: '80px' }}>
                    {limits.wings.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                )}
                <input type="text" placeholder="Flat No (e.g. 101)" required value={flatNumber} onChange={e => setFlatNumber(e.target.value)} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, fontSize: '15px', flex: 1 }} />
              </div>
            </div>

            {/* Biometrics Capture */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Photo Capture */}
              <div style={{ border: `1px solid ${theme.border}`, padding: '16px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textMain }}>Visitor Photo</span>
                  {!photo && (
                    <button type="button" onClick={() => setShowCamera(!showCamera)} style={{ padding: '6px 12px', background: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Camera size={14} /> {showCamera ? 'Close' : 'Open Camera'}
                    </button>
                  )}
                </div>
                
                {photo ? (
                  <div style={{ position: 'relative' }}>
                    <img src={photo} alt="Visitor" style={{ width: '100%', borderRadius: '8px' }} />
                    <button type="button" onClick={() => setPhoto(null)} style={{ position: 'absolute', top: '8px', right: '8px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                ) : showCamera ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                    <button type="button" onClick={() => setPhoto(webcamRef.current.getScreenshot())} style={{ padding: '10px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Capture Photo</button>
                  </div>
                ) : (
                  <div style={{ height: '150px', background: '#F8FAFC', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px' }}>
                    Camera off
                  </div>
                )}
              </div>

              {/* Signature Pad */}
              <div style={{ border: `1px solid ${theme.border}`, padding: '16px', borderRadius: '10px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textMain }}>Digital Signature</span>
                  <button type="button" onClick={() => { sigCanvasRef.current?.clear(); setSignature(null); }} style={{ padding: '6px 12px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PenTool size={14} /> Clear
                  </button>
                </div>
                <div style={{ border: '1px dashed #CBD5E1', borderRadius: '8px', background: 'white' }}>
                  <SignatureCanvas
                    ref={sigCanvasRef}
                    penColor="black"
                    canvasProps={{ width: 300, height: 150, className: 'sigCanvas', style: { width: '100%', height: '150px' } }}
                    onEnd={() => setSignature(sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png'))}
                  />
                </div>
              </div>
              
            </div>

            <button type="submit" style={{ padding: '16px', background: theme.textMain, color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <LogIn size={20} /> CHECK IN VISITOR
            </button>
          </form>
        </div>

        {/* Visitor List */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
            <Clock size={20} color="#64748B" /> Recent Entries
          </h3>
          
          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748B' }}>Loading entries...</p>
          ) : visitors.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>No visitors recorded today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {visitors.map(visitor => (
                <div key={visitor._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: `1px solid ${theme.border}`, borderRadius: '12px', background: visitor.status === 'Inside' ? '#F8FAFC' : 'white' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {visitor.name}
                      {visitor.status === 'Inside' && <span style={{ padding: '2px 8px', background: '#FEF2F2', color: '#EF4444', borderRadius: '12px', fontSize: '10px', fontWeight: '700' }}>INSIDE</span>}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                      {visitor.purpose} • Flat {visitor.wing}-{visitor.flatNumber} • {visitor.phone}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                      In: {new Date(visitor.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {visitor.checkOutTime && ` • Out: ${new Date(visitor.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                    </p>
                  </div>
                  
                  {visitor.status === 'Inside' && (
                    <button 
                      onClick={() => handleCheckOut(visitor._id)}
                      style={{ padding: '10px 16px', background: '#F1F5F9', color: '#1E293B', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckOutIcon size={16} /> Mark Out
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      
      <style>
        {`
          @media (max-width: 600px) {
            .hide-mobile { display: none; }
            div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SecurityDashboard;
