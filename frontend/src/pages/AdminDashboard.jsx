import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
// Components
import NoticeBoard from '../components/NoticeBoard';
import ComplaintBox from '../components/ComplaintBox';
import ExpenseTracker from '../components/ExpenseTracker';
import UserList from '../components/UserList';
import AddMember from '../components/AddMember';
import MaintenanceBills from '../components/MaintenanceBills';
import VisitorLog from '../components/VisitorLog';
import DashboardOverview from '../components/DashboardOverview';
import Profile from '../components/Profile';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.mustChangePassword ? 'profile' : 'overview');

  if (!user) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono', monospace", backgroundColor: theme.bg }}>
        // INITIALIZING_DASHBOARD...
      </div>
    );
  }

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
              flex-direction: row !important;
              flex-wrap: wrap;
              gap: 10px !important;
            }
            .sidebar-menu button {
              flex: 1 1 calc(50% - 10px);
              justify-content: center;
              padding: 10px !important;
              font-size: 12px !important;
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
            <span className="mono-label" style={{ color: theme.accent }}>// SESSION_ACTIVE</span>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif", margin: '5px 0',
              fontSize: 'clamp(24px, 5vw, 2.8rem)', fontWeight: '600', textTransform: 'uppercase', lineHeight: 1
            }}>
              {user.societyName || 'SYSTEM_CORE'}
            </h1>
            <p style={{ fontFamily: "'Space Mono', monospace", margin: 0, fontSize: '14px', fontWeight: '700' }}>
              OPERATOR: <span style={{ color: theme.accent }}>{user.name?.toUpperCase()}</span>
            </p>
          </div>

          <div className="dashboard-header-actions" style={{ display: 'flex' }}>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="logout-btn brutal-btn"
              style={{
                background: 'transparent', color: theme.textMain, border: `2px solid ${theme.textMain}`,
                padding: '12px 30px', fontFamily: "'Space Mono', monospace", fontWeight: '700',
                cursor: 'pointer', transition: '0.2s', width: '100%'
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
              { id: 'registry', label: 'Member Registry', icon: '👥' },
              { id: 'notices', label: 'Notice Board', icon: '📢' },
              { id: 'bills', label: 'Billing System', icon: '🧾' },
              { id: 'visitors', label: 'Visitor Logs', icon: '🛡️' },
              { id: 'complaints', label: 'Complaints', icon: '🗳️' },
              { id: 'expenses', label: 'Society Expenses', icon: '💰' },
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
            {activeTab === 'registry' && (
              <section style={{
                padding: 'clamp(15px, 5vw, 40px)', background: theme.surface,
                border: `3px solid ${theme.border}`, boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
              }}>
                <div style={{ marginBottom: '30px', borderBottom: `2px solid ${theme.textMain}`, paddingBottom: '15px' }}>
                  <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(20px, 6vw, 1.8rem)', textTransform: 'uppercase' }}>
                    MEMBER_OPERATIONS
                  </h2>
                </div>
                <div style={{ display: 'grid', gap: 'clamp(20px, 5vw, 40px)' }}>
                  <div style={{ background: '#f9f9f9', padding: 'clamp(15px, 4vw, 20px)', border: `1px dashed ${theme.border}`, minWidth: 0 }}>
                    <span className="mono-label" style={{ display: 'block', marginBottom: '15px' }}>[01] INTAKE_FORM</span>
                    <AddMember />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span className="mono-label" style={{ display: 'block', marginBottom: '15px' }}>[02] REGISTRY_DATABASE</span>
                    <UserList />
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'notices' && <NoticeBoard />}
            {activeTab === 'bills' && <MaintenanceBills />}
            {activeTab === 'visitors' && <VisitorLog />}
            {activeTab === 'complaints' && <ComplaintBox />}
            {activeTab === 'expenses' && <ExpenseTracker />}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;