import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * ACCESS_CONTROL_PROTOCOL: PUBLIC_ROUTE
 * Purpose: Prevents authenticated operators from accessing entry-level pages (Login/Register).
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  // If user exists, system state is AUTHENTICATED. Redirect to their dashboard.
  if (user) {
    console.log("// SESSION_ALREADY_ACTIVE: Redirecting to Core Dashboard.");
    const correctPath = user.role === 'admin' ? '/dashboard' : '/resident';
    return <Navigate to={correctPath} replace />;
  }

  // If no user, allow access to PUBLIC_ASSETS (Login/Register).
  return children;
};

export default PublicRoute;