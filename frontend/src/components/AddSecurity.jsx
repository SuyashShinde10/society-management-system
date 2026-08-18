import React, { useState } from 'react';
import { toast } from 'sonner';
import { Shield, ShieldCheck, Mail, Phone, Calendar, Clock, MapPin, Loader2, KeyRound } from 'lucide-react';
import api from '../api';
import theme from '../theme';

const AddSecurity = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Day');
  const [loading, setLoading] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedCreds(null);

    try {
      const response = await api.post('/auth/add-security-staff', {
        name, email, phone, age, address, joinDate, shift
      });
      toast.success('Security Staff added successfully.');
      setGeneratedCreds({ email, password: response.data.generatedPassword });
      
      // Reset form
      setName(''); setEmail(''); setPhone('');
      setAge(''); setAddress(''); setJoinDate(new Date().toISOString().split('T')[0]); setShift('Day');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add security staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {generatedCreds && (
          <div style={{ background: '#ECFDF5', border: '1px solid #10B981', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ background: '#D1FAE5', padding: '10px', borderRadius: '50%' }}>
              <ShieldCheck size={24} color="#059669" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#065F46', fontSize: '18px' }}>Staff Account Created</h4>
              <p style={{ margin: '0 0 16px 0', color: '#064E3B', fontSize: '14px' }}>
                Share these temporary credentials with the security guard. They will be forced to change the password upon first login.
              </p>
              <div style={{ background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px dashed #34D399', display: 'inline-block' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <Mail size={16} color="#059669" />
                  <strong style={{ color: '#065F46' }}>Email:</strong>
                  <span style={{ color: theme.textMain }}>{generatedCreds.email}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <KeyRound size={16} color="#059669" />
                  <strong style={{ color: '#065F46' }}>Temporary Password:</strong>
                  <span style={{ color: theme.textMain, fontWeight: '600', letterSpacing: '1px' }}>{generatedCreds.password}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color={theme.accent} /> Personal Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Full Name</label>
              <input type="text" placeholder="e.g. Ramesh Singh" value={name} onChange={(e) => setName(e.target.value)} required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Email Address</label>
              <input type="email" placeholder="e.g. ramesh@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Phone Number</label>
              <input type="tel" placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Age</label>
              <input type="number" placeholder="e.g. 35" value={age} onChange={(e) => setAge(e.target.value)} required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Permanent Address</label>
              <input type="text" placeholder="Full permanent address" value={address} onChange={(e) => setAddress(e.target.value)} required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color={theme.accent} /> Employment Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Duty Shift</label>
              <select value={shift} onChange={(e) => setShift(e.target.value)} required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}>
                <option value="Day">Day</option>
                <option value="Night">Night</option>
                <option value="Rotational">Rotational</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: theme.textSec, marginBottom: '8px' }}>Join Date</label>
              <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} required 
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '15px', color: theme.textMain, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: theme.textMain, color: 'white', border: 'none', borderRadius: '14px',
            padding: '18px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'all 0.2s ease',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
            marginTop: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? <><Loader2 size={18} className="spin" /> Creating Profile...</> : 'Authorize Security Staff'}
        </button>

      </form>
    </div>
  );
};

export default AddSecurity;
