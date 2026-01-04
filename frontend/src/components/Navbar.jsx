import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const theme = {
    bg: '#FFFFFF',
    textMain: '#1A1A1A',
    textSec: '#4A4A4A',
    border: '#1A1A1A',
    accent: '#2563EB',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ 
      padding: '0 40px', 
      background: theme.bg, 
      color: theme.textMain, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: `4px solid ${theme.border}`,
      height: '80px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          .nav-link {
            font-family: 'Space Mono', monospace;
            text-transform: uppercase;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            color: #1A1A1A;
            transition: all 0.2s;
            padding: 8px 16px;
          }

          .nav-link:hover {
            background: #1A1A1A;
            color: #FFFFFF !important;
          }

          .system-status {
            font-family: 'Space Mono', monospace;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 8px;
            background: #F2F2F2;
            padding: 4px 12px;
            border: 1px solid #1A1A1A;
          }

          .logout-trigger {
            font-family: 'Space Mono', monospace;
            font-size: 12px;
            font-weight: 700;
            background: #1A1A1A;
            color: #FFFFFF;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            box-shadow: 4px 4px 0px #2563EB;
            transition: all 0.1s;
          }

          .logout-trigger:active {
            transform: translate(2px, 2px);
            box-shadow: 0px 0px 0px #2563EB;
          }
        `}
      </style>

      {/* --- BRAND --- */}
      <Link to="/" style={{ textDecoration: 'none', color: theme.textMain }}>
        <h2 style={{ 
          margin: 0, 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: '28px', 
          fontWeight: '600',
          letterSpacing: '1px'
        }}>
          AWAAS_TECH.
        </h2>
      </Link>

      {/* --- USER ACTIONS --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {user ? (
          <>
            <div className="system-status">
              <span style={{ 
                height: '8px', width: '8px', background: theme.accent, borderRadius: '0' 
              }}></span>
              <span>STATE: <span style={{fontWeight: '700'}}>{user.role.toUpperCase()}</span></span>
            </div>
            
            <span style={{ 
              fontFamily: "'Space Mono', monospace", 
              fontSize: '13px', 
              fontWeight: '400',
              borderLeft: `1px solid ${theme.border}`,
              paddingLeft: '24px'
            }}>
              ID: <span style={{fontWeight: '700'}}>{user.name.toUpperCase()}</span>
            </span>

            <button onClick={handleLogout} className="logout-trigger">
              [ TERMINATE_SESSION ]
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="nav-link">[ LOGIN ]</Link>
            <Link to="/register" className="nav-link" style={{ background: theme.accent, color: '#fff' }}>[ JOIN_CORE ]</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;