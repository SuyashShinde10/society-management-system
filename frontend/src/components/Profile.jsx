import React, { useState, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        currentPassword,
        newPassword
      });
      
      const updatedUser = { ...user, ...res.data.user, mustChangePassword: false };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ background: theme.surface, border: `3px solid ${theme.border}`, padding: '40px', marginBottom: '40px' }}>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '28px', textTransform: 'uppercase', margin: '0 0 30px 0',
        borderBottom: `2px solid ${theme.border}`, paddingBottom: '15px'
      }}>
        User_Profile
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* User Info Read-Only */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#F9F9F9', padding: '20px', border: `2px solid ${theme.textMain}` }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', opacity: 0.7 }}>LEGAL_NAME</span>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 'bold' }}>{user.name}</div>
          </div>
          <div style={{ background: '#F9F9F9', padding: '20px', border: `2px solid ${theme.textMain}` }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', opacity: 0.7 }}>EMAIL_ADDRESS</span>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '16px' }}>{user.email}</div>
          </div>
          {user.role === 'member' && user.flatDetails && (
            <div style={{ background: '#F9F9F9', padding: '20px', border: `2px solid ${theme.textMain}` }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', opacity: 0.7 }}>FLAT_DETAILS</span>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '16px' }}>
                {user.flatDetails.wing}-{user.flatDetails.flatNumber}
              </div>
            </div>
          )}
        </div>

        {/* Password Change Form */}
        <div>
          <form onSubmit={handlePasswordChange} style={{ background: '#EAEAEA', padding: '30px', border: `2px dashed ${theme.textMain}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: '16px', fontWeight: '700' }}>[ CHANGE_PASSWORD ]</h4>
            
            <div>
              <label className="registry-label">Current_Password</label>
              <input
                type="password"
                placeholder="********"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="registry-input"
              />
            </div>
            
            <div>
              <label className="registry-label">New_Password</label>
              <input
                type="password"
                placeholder="********"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="registry-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '10px', padding: '15px', background: theme.textMain, color: 'white', border: 'none',
                fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px', boxShadow: `4px 4px 0px ${theme.accent}`, transition: 'all 0.1s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '[ UPDATING... ]' : '[ CONFIRM_CHANGE ]'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
