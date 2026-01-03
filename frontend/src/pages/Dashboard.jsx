import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Components
import NoticeBoard from '../components/NoticeBoard';
import ComplaintBox from '../components/ComplaintBox';
import ExpenseTracker from '../components/ExpenseTracker';
import UserList from '../components/UserList';
import AddMember from '../components/AddMember'; // <--- IMPORTED HERE

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div style={dashboardWrapper}>
      <div style={containerStyle}>
        
        {/* HEADER */}
        <header style={headerStyle}>
          <div>
            <h1 style={titleStyle}>
              {user.societyName ? `Welcome to ${user.societyName}` : 'Society Dashboard'}
            </h1>
            <p>Hello, <b>{user.name}</b></p>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={logoutButtonStyle}>Logout</button>
        </header>

        {/* CONTENT */}
        <div style={mainGrid}>
          <div style={columnStyle}><NoticeBoard /></div>
          <div style={columnStyle}><ComplaintBox /></div>
          <div style={columnStyle}><ExpenseTracker /></div>
        </div>

        {/* ADMIN SECTION */}
        {user.role === 'admin' && (
          <div style={adminSection}>
            <div style={adminHeader}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                👥 Member Management
              </h2>
            </div>
            
            {/* --- ADD NEW RESIDENT FORM --- */}
            <AddMember />

            {/* --- EXISTING USER LIST --- */}
            <UserList />
          </div>
        )}

      </div>
    </div>
  );
};

// --- STYLES ---
const dashboardWrapper = { background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' };
const containerStyle = { maxWidth: '1400px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' };
const titleStyle = { margin: '5px 0', fontSize: '2rem', fontWeight: '800', color: '#0f172a' };
const logoutButtonStyle = { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' };
const mainGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '50px' };
const columnStyle = { display: 'flex', flexDirection: 'column', gap: '30px' };
const adminSection = { padding: '30px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' };
const adminHeader = { borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' };

export default Dashboard;