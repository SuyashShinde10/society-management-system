import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: "'Space Mono', monospace",
        backgroundColor: '#F2F2F2', fontSize: '12px', color: '#4A4A4A',
      }}>
        // AUTHENTICATING...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default PrivateRoute;