import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import theme from '../theme';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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

      const { data } = await api.put('/auth/profile', payload);
      toast.success('Profile updated successfully');
      
      if (data.user) {
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      }
      
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
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: '700', marginBottom: '30px' }}>
          ← BACK_TO_DASHBOARD
        </button>

        <div className="organic-card" style={{ padding: '40px' }}>
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
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="organic-input" style={{ width: '100%', padding: '12px' }} />
              </div>
              <div>
                <label className="mono-label">PHONE_NUMBER</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="organic-input" style={{ width: '100%', padding: '12px' }} />
              </div>
            </div>

            {user.role !== 'security' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="mono-label">PARKING_SLOT</label>
                  <input type="text" name="parkingSlot" value={formData.parkingSlot} onChange={handleChange} className="organic-input" style={{ width: '100%', padding: '12px' }} />
                </div>
                <div>
                  <label className="mono-label">VEHICLE_NUMBER</label>
                  <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} className="organic-input" style={{ width: '100%', padding: '12px' }} />
                </div>
              </div>
            )}

            <div style={{ borderTop: `1px dashed ${theme.border}`, marginTop: '10px', paddingTop: '20px' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', marginBottom: '20px' }}>// SECURITY_CREDENTIALS</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="mono-label">CURRENT_PASSWORD</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showCurrentPassword ? "text" : "password"} name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="Required to change password" className="organic-input" style={{ width: '100%', padding: '12px', paddingRight: '45px', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showCurrentPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mono-label">NEW_PASSWORD</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showNewPassword ? "text" : "password"} name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Leave blank to keep current" className="organic-input" style={{ width: '100%', padding: '12px', paddingRight: '45px', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showNewPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '16px', background: theme.textMain, color: 'white', border: 'none',
              fontFamily: "'Outfit', sans-serif", fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: '10px', width: '100%', opacity: loading ? 0.7 : 1
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
