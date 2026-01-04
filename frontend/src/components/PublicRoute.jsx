import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ACCESS_CONTROL_PROTOCOL: PUBLIC_ROUTE
 * Purpose: Prevents authenticated operators from accessing entry-level pages (Login/Register).
 */
const PublicRoute = ({ children }) => {
  // Check for active AUTH_TOKEN in local storage
  const token = localStorage.getItem('token');

  // If token exists, system state is AUTHENTICATED. Redirect to PROTECTED_DASHBOARD.
  if (token) {
    console.log("// SESSION_ALREADY_ACTIVE: Redirecting to Core Dashboard.");
    return <Navigate to="/dashboard" replace />;
  }

  // If no token, allow access to PUBLIC_ASSETS (Login/Register).
  return children;
};

export default PublicRoute;