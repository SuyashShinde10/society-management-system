import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', fontFamily: "'Space Mono', monospace",
        backgroundColor: '#F2F2F2', fontSize: '12px', color: '#4A4A4A', gap: '20px'
      }}>
        <img src="/awaastech-logo.png" alt="Awaastech Logo" className="brutal-pulse" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
        // AUTHENTICATING_SESSION...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.mustChangePassword && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default PrivateRoute;