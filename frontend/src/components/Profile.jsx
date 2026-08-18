import React, { useState, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import theme from '../theme';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
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
    <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${theme.border}`, padding: 'clamp(20px, 5vw, 40px)', marginBottom: '40px' }}>
      <style>
        {`
          .profile-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .registry-input {
            border-radius: 12px !important;
            padding: 12px 16px !important;
          }
          @media (max-width: 800px) {
            .profile-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
          }
        `}
      </style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '20px', borderBottom: `1px solid ${theme.border}` }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '600', margin: 0, color: theme.textMain
        }}>
          User Profile
        </h3>
      </div>

      <div className="profile-grid">
        
        {/* User Info Read-Only */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: `1px solid #E2E8F0` }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '8px' }}>Legal Name</span>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>{user.name}</div>
          </div>
          <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: `1px solid #E2E8F0` }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '8px' }}>Email Address</span>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: '500', color: theme.textMain }}>{user.email}</div>
          </div>
          {user.role === 'member' && user.flatDetails && (
            <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: `1px solid #E2E8F0` }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: '600', color: '#64748B', display: 'block', marginBottom: '8px' }}>Flat Details</span>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: '500', color: theme.textMain }}>
                Wing {user.flatDetails.wing} • Unit {user.flatDetails.flatNumber}
              </div>
            </div>
          )}
        </div>

        {/* Password Change Form */}
        <div>
          <form onSubmit={handlePasswordChange} style={{ background: '#F9F8F3', padding: '32px', borderRadius: '20px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: '600', color: theme.textMain }}>Change Password</h4>
            
            <div>
              <label className="registry-label" style={{ marginBottom: '8px', display: 'block' }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="********"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="registry-input"
                  style={{ width: '100%', paddingRight: '45px', boxSizing: 'border-box', background: 'white' }}
                />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showCurrentPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="registry-label" style={{ marginBottom: '8px', display: 'block' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="********"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="registry-input"
                  style={{ width: '100%', paddingRight: '45px', boxSizing: 'border-box', background: 'white' }}
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showNewPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '16px', padding: '16px', borderRadius: '12px', background: theme.textMain, color: 'white', border: 'none',
                fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseOver={(e) => !loading ? e.target.style.transform = 'translateY(-2px)' : null}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {loading ? 'Updating...' : 'Confirm Change'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
