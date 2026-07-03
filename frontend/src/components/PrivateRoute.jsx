import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * PrivateRoute — guards dashboard-level routes.
 *
 * Fix (C3): Previously only checked if a token STRING existed in localStorage,
 * which could be bypassed by setting localStorage.token = 'fake'.
 * Now uses the AuthContext `user` state, which is only populated after a
 * successful API call on mount, making it impossible to spoof.
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // While AuthContext is hydrating from localStorage, show nothing
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Space Mono', monospace",
        backgroundColor: '#F2F2F2',
        fontSize: '12px',
        color: '#4A4A4A',
      }}>
        // AUTHENTICATING...
      </div>
    );
  }

  if (!user) {
    console.warn('// SECURITY: Unauthorized access attempt. Redirecting to AUTH_GATE.');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;