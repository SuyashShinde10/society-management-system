import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    parkingSlot: user.parkingSlot || '',
    vehicleNumber: user.vehicleNumber || '',
    currentPassword: '',
    newPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Only send password fields if user is trying to change password
      const payload = {
        name: formData.name,
        phone: formData.phone,
        parkingSlot: formData.parkingSlot,
        vehicleNumber: formData.vehicleNumber
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      await api.put('/auth/profile', payload);
      toast.success('Profile updated successfully');
      
      if (formData.newPassword) {
        setFormData({ ...formData, currentPassword: '', newPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontWeight: '700', marginBottom: '30px' }}>
          ← BACK_TO_DASHBOARD
        </button>

        <div className="brutal-card" style={{ padding: '40px' }}>
          <header style={{ borderBottom: `2px solid ${theme.textMain}`, paddingBottom: '20px', marginBottom: '30px' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', margin: 0, textTransform: 'uppercase' }}>
              OPERATOR_PROFILE
            </h2>
            <p className="mono-label" style={{ opacity: 0.6, marginTop: '10px' }}>
              ID: {user.id} | ROLE: {user.role.toUpperCase()}
            </p>
          </header>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '25px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="mono-label">FULL_NAME</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="brutal-input" style={{ width: '100%', padding: '12px' }} />
              </div>
              <div>
                <label className="mono-label">PHONE_NUMBER</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="brutal-input" style={{ width: '100%', padding: '12px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="mono-label">PARKING_SLOT</label>
                <input type="text" name="parkingSlot" value={formData.parkingSlot} onChange={handleChange} className="brutal-input" style={{ width: '100%', padding: '12px' }} />
              </div>
              <div>
                <label className="mono-label">VEHICLE_NUMBER</label>
                <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} className="brutal-input" style={{ width: '100%', padding: '12px' }} />
              </div>
            </div>

            <div style={{ borderTop: `1px dashed ${theme.border}`, marginTop: '10px', paddingTop: '20px' }}>
              <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', marginBottom: '20px' }}>// SECURITY_CREDENTIALS</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="mono-label">CURRENT_PASSWORD</label>
                  <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="Required to change password" className="brutal-input" style={{ width: '100%', padding: '12px' }} />
                </div>
                <div>
                  <label className="mono-label">NEW_PASSWORD</label>
                  <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Leave blank to keep current" className="brutal-input" style={{ width: '100%', padding: '12px' }} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '16px', background: theme.textMain, color: 'white', border: 'none',
              fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `6px 6px 0px ${theme.accent}`, marginTop: '10px', width: '100%', opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'SAVING_CHANGES...' : 'UPDATE_PROFILE'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
