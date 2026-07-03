import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import theme from '../theme';

// Components
import NoticeBoard from '../components/NoticeBoard';
import ComplaintBox from '../components/ComplaintBox';
import ExpenseTracker from '../components/ExpenseTracker';

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

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
            <span className="mono-label" style={{ color: theme.accent }}>// MEMBER_SESSION_ACTIVE</span>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif", margin: '5px 0',
              fontSize: '2.8rem', fontWeight: '600', textTransform: 'uppercase', lineHeight: 1
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

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/profile" className="brutal-btn" style={{
              background: theme.textMain, color: 'white', padding: '12px 24px', textDecoration: 'none',
              fontFamily: "'Space Mono', monospace", fontWeight: '700', fontSize: '14px',
              boxShadow: `4px 4px 0px ${theme.accent}`
            }}>
              PROFILE
            </Link>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="logout-btn"
              style={{
                background: 'transparent', color: theme.textMain, border: `2px solid ${theme.textMain}`,
                padding: '12px 24px', fontFamily: "'Space Mono', monospace", fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              [ DISCONNECT ]
            </button>
          </div>
        </header>

        {/* --- MAIN GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          <div className="brutal-card" style={{ padding: '30px' }}><NoticeBoard /></div>
          <div className="brutal-card" style={{ padding: '30px' }}><ComplaintBox /></div>
          <div className="brutal-card" style={{ padding: '30px' }}><ExpenseTracker /></div>
        </div>

      </div>
    </div>
  );
};

export default MemberDashboard;
