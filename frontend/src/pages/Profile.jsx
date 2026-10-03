import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import theme from '../theme';
import { getErrorMessage } from '../utils/errorHandler';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    parkingSlot: user?.parkingSlot || '',
    vehicleNumber: user?.vehicleNumber || '',
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        parkingSlot: user.parkingSlot || '',
        vehicleNumber: user.vehicleNumber || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast.error('Current password is required to change password.');
        return;
      }
      if (formData.newPassword.length < 8) {
        toast.error('New password must be at least 8 characters long.');
        return;
      }
      const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!strongPassword.test(formData.newPassword)) {
        toast.error('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.');
        return;
      }
    }

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
      toast.error(getErrorMessage(error, 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div className="organic-card p-5 md:p-[40px]">
          <header style={{ borderBottom: `2px solid ${theme.textMain}`, paddingBottom: '20px', marginBottom: '30px' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', margin: 0, textTransform: 'uppercase' }}>
              OPERATOR_PROFILE
            </h2>
            <p className="mono-label" style={{ opacity: 0.6, marginTop: '10px' }}>
              ID: {user?.id || user?._id || 'N/A'} | ROLE: {user?.role?.toUpperCase() || 'USER'}
            </p>
          </header>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '25px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="mono-label">FULL_NAME</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="organic-input" style={{ width: '100%', padding: '12px' }} />
              </div>
              <div>
                <label className="mono-label">PHONE_NUMBER</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="organic-input" style={{ width: '100%', padding: '12px' }} />
              </div>
            </div>

            {user?.role !== 'security' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mono-label">PARKING_SLOT</label>
                  <input type="text" name="parkingSlot" placeholder="e.g. Slot P-101" value={formData.parkingSlot} onChange={handleChange} className="organic-input" style={{ width: '100%', padding: '12px' }} />
                </div>
                <div>
                  <label className="mono-label">VEHICLE_NUMBER</label>
                  <input type="text" name="vehicleNumber" placeholder="e.g. MH-12-AB-1234" value={formData.vehicleNumber} onChange={handleChange} className="organic-input" style={{ width: '100%', padding: '12px', textTransform: 'uppercase' }} />
                </div>
              </div>
            )}

            <div style={{ borderTop: `1px dashed ${theme.border}`, marginTop: '10px', paddingTop: '20px' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', marginBottom: '20px' }}>// SECURITY_CREDENTIALS</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
