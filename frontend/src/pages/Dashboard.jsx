import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NoticeBoard from '../components/NoticeBoard';
import ComplaintBox from '../components/ComplaintBox';
import ExpenseTracker from '../components/ExpenseTracker';
import UserList from '../components/UserList';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="loader">Loading your workspace...</div>
      </div>
    );
  }

  return (
    <div style={dashboardWrapper}>
      <div style={containerStyle}>
        
        {/* --- HEADER SECTION --- */}
        <header style={headerStyle}>
          <div>
            <span style={welcomeBadge}>{user.role.toUpperCase()} PANEL</span>
            <h1 style={titleStyle}>
              {user.societyName ? `Welcome to ${user.societyName}` : 'GalaxyHeights Dashboard'}
            </h1>
            <p style={subtitleStyle}>
              Hello, <span style={{ color: '#0f172a', fontWeight: '700' }}>{user.name}</span>. Here is what's happening today.
            </p>
          </div>
          
          <button 
            onClick={() => { logout(); navigate('/'); }}
            style={logoutButtonStyle}
          >
            Logout
          </button>
        </header>

       {/* --- STAT CARDS --- */}
<div style={statsGrid}>
  
  {/* Unified Role Card for both Admin and Member */}
  <div style={statCard}>
    <span style={{ fontSize: '1.5rem' }}>👤</span>
    <div>
      <div style={statLabel}>User Role</div>
      <div style={statValue}>
        {user.role === 'admin' ? 'Society Administrator' : 'Society Member'}
      </div>
    </div>
  </div>

  <div style={statCard}>
    <span style={{ fontSize: '1.5rem' }}>📧</span>
    <div>
      <div style={statLabel}>Registered Email</div>
      <div style={statValue}>{user.email}</div>
    </div>
  </div>

  <div style={statCard}>
    <span style={{ fontSize: '1.5rem' }}>🛡️</span>
    <div>
      <div style={statLabel}>System Status</div>
      <div style={{ ...statValue, color: '#10b981' }}>Secure & Online</div>
    </div>
  </div>
</div>

        {/* --- MAIN CONTENT GRID --- */}
        <div style={mainGrid}>
          
          {/* Column 1: Notices */}
          <div style={columnStyle}>
            <NoticeBoard />
          </div>

          {/* Column 2: Complaints */}
          <div style={columnStyle}>
            <ComplaintBox />
          </div>

          {/* Column 3: Expenses */}
          <div style={columnStyle}>
            <ExpenseTracker /> 
          </div>

        </div>

        {/* --- ADMIN EXCLUSIVE SECTION --- */}
        {user.role === 'admin' && (
          <div style={adminSection}>
            <div style={adminHeader}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>👥 Member Management</h2>
              <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>View, add, or remove residents from the society database.</p>
            </div>
            <UserList />
          </div>
        )}
      </div>
    </div>
  );
};

// --- STYLES ---

const dashboardWrapper = {
  background: '#f8fafc', // Light slate background
  minHeight: '100vh',
  padding: '40px 20px',
  fontFamily: '"Inter", sans-serif'
};

const containerStyle = {
  maxWidth: '1400px', // Extra wide for the 3-column layout
  margin: '0 auto',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '40px',
  background: 'white',
  padding: '30px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e2e8f0'
};

const titleStyle = {
  margin: '5px 0',
  color: '#0f172a',
  fontSize: '2rem',
  fontWeight: '800',
  letterSpacing: '-1px'
};

const subtitleStyle = {
  margin: 0,
  color: '#64748b',
  fontSize: '1rem'
};

const welcomeBadge = {
  background: '#e0e7ff',
  color: '#4338ca',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: '800',
  letterSpacing: '1px'
};

const logoutButtonStyle = {
  background: '#fee2e2',
  color: '#ef4444',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '700',
  transition: '0.3s'
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  marginBottom: '40px'
};

const statCard = {
  background: 'white',
  padding: '20px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const statLabel = { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' };
const statValue = { fontSize: '1rem', color: '#1e293b', fontWeight: '700' };

const mainGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '30px',
  alignItems: 'start'
};

const columnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '30px',
  minWidth: '0' // Prevents grid blowout
};

const adminSection = {
  marginTop: '50px',
  padding: '30px',
  background: '#fff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
};

const adminHeader = {
  borderBottom: '2px solid #f1f5f9',
  paddingBottom: '20px',
  marginBottom: '20px'
};

export default Dashboard;