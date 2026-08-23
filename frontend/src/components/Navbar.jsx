import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const theme = {
    bg: '#FFFFFF',
    textMain: '#1e293b',
    textSec: '#64748b',
    border: '#f1f5f9',
    accent: '#D9734E',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="px-6 md:px-[40px] flex justify-between items-center sticky top-0 z-[1000]" style={{ 
      background: theme.bg, 
      color: theme.textMain, 
      borderBottom: `1px solid ${theme.border}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      height: '80px',
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          .nav-link {
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            color: #1e293b;
            transition: all 0.2s;
            padding: 8px 16px;
            border-radius: 8px;
          }

          .nav-link:hover {
            background: #f8fafc;
            color: #D9734E !important;
          }

          .system-status {
            font-family: 'Outfit', sans-serif;
            font-size: 12px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f8fafc;
            padding: 6px 14px;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            color: #64748b;
          }

          .logout-trigger {
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            font-weight: 600;
            background: #fff0eb;
            color: #D9734E;
            border: 1px solid #ffdec2;
            padding: 10px 20px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .logout-trigger:hover {
            background: #ffe3d3;
            transform: translateY(-2px);
          }
          .logout-trigger:active {
            transform: translateY(0);
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
          letterSpacing: '0.5px',
          color: theme.textMain
        }}>
          AwaasTech
        </h2>
      </Link>

      {/* --- USER ACTIONS --- */}
      <div className="flex items-center gap-4 md:gap-6">
        {user ? (
          <>
            <div className="system-status hidden md:flex">
              <span style={{ 
                height: '8px', width: '8px', background: '#22c55e', borderRadius: '50%' 
              }}></span>
              <span>Role: <span style={{fontWeight: '600', color: theme.textMain}}>{user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}</span></span>
            </div>
            
            <span className="hidden md:inline" style={{ 
              fontFamily: "'Outfit', sans-serif", 
              fontSize: '14px', 
              fontWeight: '500',
              borderLeft: `1px solid #e2e8f0`,
              paddingLeft: '24px',
              color: theme.textSec
            }}>
              Welcome, <span style={{fontWeight: '600', color: theme.textMain}}>{user.name || 'Resident'}</span>
            </span>

            <button onClick={handleLogout} className="logout-trigger">
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link" style={{ background: theme.accent, color: '#fff' }}>Join Now</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;