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

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('registry');

  if (!user) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono', monospace", backgroundColor: theme.bg }}>
        // INITIALIZING_DASHBOARD...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 20px', color: theme.textMain }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* --- HEADER --- */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '50px', background: theme.surface, padding: '40px',
          border: `3px solid ${theme.border}`, boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
        }}>
          <div style={{ borderLeft: `10px solid ${theme.textMain}`, paddingLeft: '25px' }}>
            <span className="mono-label" style={{ color: theme.accent }}>// SESSION_ACTIVE</span>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif", margin: '5px 0',
              fontSize: '2.8rem', fontWeight: '600', textTransform: 'uppercase', lineHeight: 1
            }}>
              {user.societyName || 'SYSTEM_CORE'}
            </h1>
            <p style={{ fontFamily: "'Space Mono', monospace", margin: 0, fontSize: '14px', fontWeight: '700' }}>
              OPERATOR: <span style={{ color: theme.accent }}>{user.name?.toUpperCase()}</span>
            </p>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="logout-btn"
            style={{
              background: 'transparent', color: theme.textMain, border: `2px solid ${theme.textMain}`,
              padding: '12px 30px', fontFamily: "'Space Mono', monospace", fontWeight: '700',
              cursor: 'pointer', transition: '0.2s'
            }}
          >
            [ DISCONNECT ]
          </button>
        </header>

        </header>

        {/* --- MAIN CONTENT AREA WITH SIDEBAR --- */}
        <div style={{ display: 'flex', gap: '40px', minHeight: '600px', marginBottom: '60px' }}>
          
          {/* SIDEBAR */}
          <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', opacity: 0.5 }}>// NAVIGATION</span>
            {[
              { id: 'registry', label: 'Member Registry', icon: '👥' },
              { id: 'notices', label: 'Notice Board', icon: '📢' },
              { id: 'bills', label: 'Billing System', icon: '🧾' },
              { id: 'visitors', label: 'Visitor Logs', icon: '🛡️' },
              { id: 'complaints', label: 'Complaints', icon: '🗳️' },
              { id: 'expenses', label: 'Society Expenses', icon: '💰' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 20px',
                  background: activeTab === tab.id ? theme.textMain : theme.surface,
                  color: activeTab === tab.id ? 'white' : theme.textMain,
                  border: `3px solid ${theme.border}`,
                  fontFamily: "'Space Mono', monospace", fontWeight: '700', fontSize: '14px',
                  cursor: 'pointer', textAlign: 'left',
                  boxShadow: activeTab === tab.id ? `4px 4px 0px ${theme.accent}` : 'none',
                  transition: 'all 0.1s'
                }}
              >
                <span>{tab.icon}</span>
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* MAIN CONTENT PORTAL */}
          <div style={{ flex: 1, minWidth: 0 }}>
            
            {activeTab === 'registry' && (
              <section style={{
                padding: '40px', background: theme.surface,
                border: `3px solid ${theme.border}`, boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
              }}>
                <div style={{ marginBottom: '30px', borderBottom: `2px solid ${theme.textMain}`, paddingBottom: '15px' }}>
                  <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', textTransform: 'uppercase' }}>
                    MEMBER_OPERATIONS
                  </h2>
                </div>
                <div style={{ display: 'grid', gap: '40px' }}>
                  <div style={{ background: '#f9f9f9', padding: '20px', border: `1px dashed ${theme.border}` }}>
                    <span className="mono-label" style={{ display: 'block', marginBottom: '15px' }}>[01] INTAKE_FORM</span>
                    <AddMember />
                  </div>
                  <div>
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