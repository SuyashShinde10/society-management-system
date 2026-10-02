import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { Eye, EyeOff, User, Mail, Phone, Car, ParkingSquare, Shield, KeyRound, Save, Loader2, CheckCircle2 } from 'lucide-react';
import theme from '../theme';
import { getErrorMessage } from '../utils/errorHandler';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);

  // Form states for profile and vehicle details
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [parkingSlot, setParkingSlot] = useState(user?.parkingSlot || '');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber || '');
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Form states for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setParkingSlot(user.parkingSlot || '');
      setVehicleNumber(user.vehicleNumber || '');
    }
  }, [user]);

  const handleDetailsUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Legal name cannot be empty.');
      return;
    }

    setDetailsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        parkingSlot: parkingSlot.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase()
      };

      const res = await api.put('/auth/profile', payload);
      const updatedUser = { ...user, ...res.data.user };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

      toast.success('Profile and vehicle details saved successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update profile details'));
    } finally {
      setDetailsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPassword.test(newPassword)) {
      toast.error('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.');
      return;
    }
    setPasswordLoading(true);
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
      toast.error(getErrorMessage(error, 'Failed to update password'));
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${theme.border}`, padding: 'clamp(20px, 5vw, 40px)', marginBottom: '40px' }}>
      <style>
        {`
          .profile-grid {
            display: grid;
            grid-template-columns: 1.15fr 0.85fr;
            gap: 36px;
          }
          .profile-input-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .profile-input {
            border-radius: 12px;
            padding: 12px 14px;
            border: 1px solid #E2E8F0;
            background: white;
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            color: #1E293B;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .profile-input:focus {
            border-color: #C07858;
            box-shadow: 0 0 0 3px rgba(192, 120, 88, 0.12);
          }
          .profile-input:disabled {
            background: #F8FAFC;
            color: #64748B;
            cursor: not-allowed;
          }
          @media (max-width: 900px) {
            .profile-grid {
              grid-template-columns: 1fr;
              gap: 24px;
            }
          }
        `}
      </style>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '20px', borderBottom: `1px solid ${theme.border}` }}>
        <div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: '600', margin: 0, color: theme.textMain
          }}>
            Resident Profile & Settings
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: theme.textSec, fontFamily: "'Outfit', sans-serif" }}>
            Manage your personal identity, contact details, registered vehicles, and account security.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '6px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <Shield size={15} color={theme.accent} />
          <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme.textMain }}>
            Role: {user.role || 'Member'}
          </span>
        </div>
      </div>

      <div className="profile-grid">
        
        {/* LEFT COLUMN: Identity, Unit & Vehicle Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <form onSubmit={handleDetailsUpdate} style={{ background: '#FAF8F5', padding: '28px', borderRadius: '20px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '14px', borderBottom: `1px solid #EAE6DC` }}>
              <User size={18} color={theme.accent} />
              <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: '600', color: theme.textMain }}>
                Personal & Residence Information
              </h4>
            </div>

            {/* Read-only Flat details if present */}
            {user.flatDetails && (
              <div style={{ background: 'white', padding: '16px', borderRadius: '14px', border: '1px solid #EAE6DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '11px', color: theme.textSec, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                    Assigned Unit
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: theme.textMain }}>
                    Wing {user.flatDetails.wing || 'A'} • Unit {user.flatDetails.flatNumber || '101'}
                  </span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', background: '#F0FDF4', color: '#166534', padding: '4px 10px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                  {user.flatDetails.residentType || 'Resident'}
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="profile-input-group">
                <label style={{ fontSize: '12px', fontWeight: '600', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={13} color={theme.textSec} /> Legal Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="profile-input"
                />
              </div>

              <div className="profile-input-group">
                <label style={{ fontSize: '12px', fontWeight: '600', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} color={theme.textSec} /> Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  title="Email cannot be modified directly"
                  className="profile-input"
                />
              </div>
            </div>

            <div className="profile-input-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={13} color={theme.textSec} /> Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="profile-input"
              />
              <span style={{ fontSize: '11px', color: theme.textSec }}>
                Used by security guards for gate intercom verification and delivery alerts.
              </span>
            </div>

            {/* VEHICLE & PARKING ALLOCATION SECTION */}
            <div style={{ marginTop: '8px', background: 'white', padding: '18px', borderRadius: '16px', border: `1px solid #EAE6DC`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Car size={16} color={theme.accent} />
                <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme.textMain }}>
                  Vehicle & Parking Details
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="profile-input-group">
                  <label style={{ fontSize: '12px', fontWeight: '600', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ParkingSquare size={13} color={theme.textSec} /> Allocated Parking Slot
                  </label>
                  <input
                    type="text"
                    value={parkingSlot}
                    onChange={(e) => setParkingSlot(e.target.value)}
                    placeholder="e.g. Slot P-101"
                    className="profile-input"
                  />
                  <span style={{ fontSize: '11px', color: theme.textSec }}>
                    Your assigned parking bay.
                  </span>
                </div>

                <div className="profile-input-group">
                  <label style={{ fontSize: '12px', fontWeight: '600', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Car size={13} color={theme.textSec} /> Registered Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. MH-12-AB-1234"
                    className="profile-input"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}
                  />
                  <span style={{ fontSize: '11px', color: theme.textSec }}>
                    Shows on Overview & auto-scanned at gate.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={detailsLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '14px 20px', borderRadius: '12px', background: theme.accent, color: 'white', border: 'none',
                fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: detailsLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px', boxShadow: '0 4px 14px rgba(192, 120, 88, 0.25)', transition: 'all 0.2s',
                opacity: detailsLoading ? 0.7 : 1,
              }}
              onMouseOver={(e) => !detailsLoading ? e.currentTarget.style.transform = 'translateY(-1px)' : null}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {detailsLoading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Saving Details...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Profile & Vehicle Details
                </>
              )}
            </button>
          </form>

        </div>

        {/* RIGHT COLUMN: Password & Security */}
        <div>
          <form onSubmit={handlePasswordChange} style={{ background: '#F8FAFC', padding: '28px', borderRadius: '20px', border: `1px solid #E2E8F0`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '14px', borderBottom: `1px solid #E2E8F0` }}>
              <KeyRound size={18} color="#475569" />
              <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: '600', color: theme.textMain }}>
                Security & Password
              </h4>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: theme.textSec }}>
              Update your account password to ensure your society resident account stays protected.
            </p>
            
            <div className="profile-input-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: theme.textMain }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="profile-input"
                  style={{ width: '100%', paddingRight: '45px', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showCurrentPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                </button>
              </div>
            </div>
            
            <div className="profile-input-group">
              <label style={{ fontSize: '12px', fontWeight: '600', color: theme.textMain }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password (min. 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="profile-input"
                  style={{ width: '100%', paddingRight: '45px', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showNewPassword ? <EyeOff size={18} color={theme.textSec} /> : <Eye size={18} color={theme.textSec} />}
                </button>
              </div>
              <span style={{ fontSize: '11px', color: theme.textSec, marginTop: '2px' }}>
                Must be at least 8 characters with at least one uppercase, one lowercase, and one number.
              </span>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              style={{
                marginTop: '8px', padding: '14px 20px', borderRadius: '12px', background: theme.textMain, color: 'white', border: 'none',
                fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: passwordLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s',
                opacity: passwordLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
              onMouseOver={(e) => !passwordLoading ? e.currentTarget.style.transform = 'translateY(-1px)' : null}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {passwordLoading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Updating Password...
                </>
              ) : (
                'Confirm Password Change'
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
