import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Components
import NoticeBoard from '../components/NoticeBoard';
import ComplaintBox from '../components/ComplaintBox';
import ExpenseTracker from '../components/ExpenseTracker';
import UserList from '../components/UserList';
import AddMember from '../components/AddMember';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const theme = {
    bg: '#F2F2F2',      // Cold Bone
    surface: '#FFFFFF', 
    textMain: '#1A1A1A', // Sharp Ink
    textSec: '#4A4A4A',  
    border: '#1A1A1A',   // Thick Brutalist borders
    accent: '#2563EB',   // Electric Cobalt
  };

  if (!user) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono', monospace", backgroundColor: theme.bg }}>
        // INITIALIZING_DASHBOARD...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px 20px', color: theme.textMain }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          .brutal-card {
            background: #fff;
            border: 3px solid #1A1A1A;
            box-shadow: 8px 8px 0px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
          }

          .brutal-card:hover {
            transform: translate(-2px, -2px);
            box-shadow: 12px 12px 0px rgba(0,0,0,0.1);
          }

          .mono-label {
            font-family: 'Space Mono', monospace;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .logout-btn:hover {
            background-color: #ef4444 !important;
            color: white !important;
          }
        `}
      </style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* --- HEADER --- */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '50px', 
          background: theme.surface, 
          padding: '40px', 
          border: `3px solid ${theme.border}`,
          boxShadow: '10px 10px 0px rgba(0,0,0,0.05)'
        }}>
          <div style={{ borderLeft: `10px solid ${theme.textMain}`, paddingLeft: '25px' }}>
            <span className="mono-label" style={{ color: theme.accent }}>// SESSION_ACTIVE</span>
            <h1 style={{ 
              fontFamily: "'Cormorant Garamond', serif", 
              margin: '5px 0', 
              fontSize: '2.8rem', 
              fontWeight: '600', 
              textTransform: 'uppercase',
              lineHeight: 1
            }}>
              {user.societyName || 'SYSTEM_CORE'}
            </h1>
            <p style={{ fontFamily: "'Space Mono', monospace", margin: 0, fontSize: '14px', fontWeight: '700' }}>
              OPERATOR: <span style={{ color: theme.accent }}>{user.name.toUpperCase()}</span>
            </p>
          </div>
          
          <button 
            onClick={() => { logout(); navigate('/'); }} 
            className="logout-btn"
            style={{ 
              background: 'transparent', 
              color: theme.textMain, 
              border: `2px solid ${theme.textMain}`, 
              padding: '12px 30px', 
              fontFamily: "'Space Mono', monospace", 
              fontWeight: '700', 
              cursor: 'pointer',
              transition: '0.2s'
            }}
          >
            [ DISCONNECT ]
          </button>
        </header>

        {/* --- MAIN GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          <div className="brutal-card" style={{ padding: '30px' }}><NoticeBoard /></div>
          <div className="brutal-card" style={{ padding: '30px' }}><ComplaintBox /></div>
          <div className="brutal-card" style={{ padding: '30px' }}><ExpenseTracker /></div>
        </div>

        {/* --- ADMIN SECTION --- */}
        {user.role === 'admin' && (
          <section style={{ 
            padding: '50px', 
            background: theme.surface, 
            border: `3px solid ${theme.border}`,
            boxShadow: '15px 15px 0px rgba(0,0,0,0.05)'
          }}>
            <div style={{ marginBottom: '40px', borderBottom: `2px solid ${theme.textMain}`, paddingBottom: '20px' }}>
              <h2 style={{ 
                margin: 0, 
                fontFamily: "'Cormorant Garamond', serif", 
                fontSize: '2rem', 
                textTransform: 'uppercase' 
              }}>
                MEMBER_OPERATIONS
              </h2>
              <span className="mono-label" style={{ opacity: 0.6 }}>Administrative access granted.</span>
            </div>
            
            <div style={{ display: 'grid', gap: '50px' }}>
              {/* Add New Member Module */}
              <div style={{ background: '#f9f9f9', padding: '30px', border: `1px dashed ${theme.border}` }}>
                <span className="mono-label" style={{ display: 'block', marginBottom: '20px' }}>[01] INTAKE_FORM</span>
                <AddMember />
              </div>

              {/* User List Module */}
              <div>
                <span className="mono-label" style={{ display: 'block', marginBottom: '20px' }}>[02] REGISTRY_DATABASE</span>
                <UserList />
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default Dashboard;