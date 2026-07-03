import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import theme from '../theme';
// Components
import NoticeBoard from '../components/NoticeBoard';
import ComplaintBox from '../components/ComplaintBox';
import ExpenseTracker from '../components/ExpenseTracker';
import MaintenanceBills from '../components/MaintenanceBills';
import DashboardOverview from '../components/DashboardOverview';
import Profile from '../components/Profile';
import Meetings from '../components/Meetings';
import Analytics from '../components/Analytics';

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.mustChangePassword ? 'profile' : 'overview');

  if (!user) return null;

  return (
    <div className="dashboard-container" style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 20px', color: theme.textMain }}>
      <style>
        {`
          @media (max-width: 900px) {
            .dashboard-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 20px;
              padding: 20px !important;
            }
            .dashboard-header-actions {
              width: 100%;
              display: flex;
              flex-direction: column;
              gap: 15px;
            }
            .dashboard-layout {
              flex-direction: column !important;
            }
            .sidebar-nav {
              width: 100% !important;
              border-right: none !important;
              border-bottom: 3px solid ${theme.border} !important;
              padding: 20px !important;
            }
            .sidebar-menu {
              width: 100% !important;
              flex-direction: column !important;
              gap: 10px !important;
            }
            .sidebar-menu button {
              width: 100% !important;
              justify-content: flex-start !important;
              padding: 12px 20px !important;
              font-size: 14px !important;
            }
            .main-content {
              padding-left: 0 !important;
              padding-top: 20px !important;
            }
            .dashboard-container {
              padding: 20px 10px !important;
            }
          }
        `}
      </style>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* --- HEADER --- */}
        <header className="dashboard-header" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '50px', background: theme.surface, padding: '40px',
          border: `3px solid ${theme.border}`, boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
        }}>
          <div style={{ borderLeft: `10px solid ${theme.textMain}`, paddingLeft: '25px', wordBreak: 'break-word' }}>
            <span className="mono-label" style={{ color: theme.accent }}>// MEMBER_SESSION_ACTIVE</span>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif", margin: '5px 0',
              fontSize: 'clamp(24px, 5vw, 2.8rem)', fontWeight: '600', textTransform: 'uppercase', lineHeight: 1
            }}>
              {user.societyName || 'SYSTEM_CORE'}
            </h1>
            <p style={{ fontFamily: "'Space Mono', monospace", margin: 0, fontSize: '14px', fontWeight: '700' }}>
              RESIDENT: <span style={{ color: theme.accent }}>{user.name?.toUpperCase()}</span>
              {user.flatDetails && (
                <span style={{ marginLeft: '15px', color: theme.textSec }}>
                  [ WING {user.flatDetails.wing} / FLAT {user.flatDetails.flatNumber} ]
                </span>
              )}
            </p>
          </div>

          <div className="dashboard-header-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/profile" className="brutal-btn" style={{
              background: theme.textMain, color: 'white', padding: '12px 24px', textDecoration: 'none',
              fontFamily: "'Space Mono', monospace", fontWeight: '700', fontSize: '14px',
              boxShadow: `4px 4px 0px ${theme.accent}`, textAlign: 'center', width: '100%', boxSizing: 'border-box'
            }}>
              PROFILE
            </Link>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="logout-btn brutal-btn"
              style={{
                background: 'transparent', color: theme.textMain, border: `2px solid ${theme.textMain}`,
                padding: '12px 24px', fontFamily: "'Space Mono', monospace", fontWeight: '700',
                cursor: 'pointer', textAlign: 'center', width: '100%', boxSizing: 'border-box'
              }}
            >
              [ DISCONNECT ]
            </button>
          </div>
        </header>

        {/* SIDEBAR NAVIGATION */}
        <div className="dashboard-layout" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        
        {/* Navigation Panel */}
        <div className="sidebar-nav" style={{
          width: '280px', background: theme.surface, borderRight: `3px solid ${theme.border}`,
          padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '40px',
          boxShadow: '5px 0 15px rgba(0,0,0,0.02)'
        }}>
          
          {user?.mustChangePassword && (
            <div style={{ background: theme.danger, color: 'white', padding: '10px', fontSize: '12px', fontFamily: "'Space Mono', monospace", fontWeight: 'bold' }}>
              ⚠️ YOU MUST CHANGE YOUR GENERATED PASSWORD TO CONTINUE.
            </div>
          )}

          <div className="sidebar-menu" style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', opacity: 0.5, width: '100%' }}>// NAVIGATION</span>
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'profile', label: 'My Profile', icon: '👤' },
              { id: 'notices', label: 'Notice Board', icon: '📢' },
              { id: 'meetings', label: 'Global Meetings', icon: '🗓️' },
              { id: 'bills', label: 'My Bills', icon: '🧾' },
              { id: 'complaints', label: 'Complaints', icon: '🗳️' },
              { id: 'expenses', label: 'Society Expenses', icon: '💰' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
            ].map((tab) => {
              const isDisabled = user?.mustChangePassword && tab.id !== 'profile';
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px',
                    background: activeTab === tab.id ? theme.textMain : 'transparent',
                    color: activeTab === tab.id ? 'white' : theme.textMain,
                    border: `2px solid ${activeTab === tab.id ? theme.textMain : 'transparent'}`,
                    fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: '700',
                    cursor: isDisabled ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    opacity: isDisabled ? 0.4 : 1
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== tab.id && !isDisabled) {
                      e.currentTarget.style.border = `2px dashed ${theme.textMain}`;
                      e.currentTarget.style.background = '#f5f5f5';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== tab.id && !isDisabled) {
                      e.currentTarget.style.border = '2px solid transparent';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
          </div>

          {/* MAIN CONTENT PORTAL */}
          <div className="main-content" style={{ flex: 1, minWidth: 0, paddingLeft: '40px' }}>
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'profile' && <Profile />}
            {activeTab === 'notices' && <NoticeBoard />}
            {activeTab === 'meetings' && <Meetings />}
            {activeTab === 'bills' && <MaintenanceBills />}
            {activeTab === 'complaints' && <ComplaintBox />}
            {activeTab === 'expenses' && <ExpenseTracker />}
            {activeTab === 'analytics' && <Analytics />}
          </div>

        </div>

      </div>
    </div>
  );
};

export default MemberDashboard;
