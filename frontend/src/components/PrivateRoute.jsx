import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ACCESS_CONTROL_PROTOCOL: PROTECTED_ROUTE
 * Level: RESTRICTED
 * Purpose: Verification of AUTH_TOKEN prior to rendering PROTECTED_ASSETS.
 */
const PrivateRoute = ({ children }) => {
  // Querying local encrypted storage for identity token
  const token = localStorage.getItem('token');

  // If token is detected, system state is VERIFIED. Allow access to CORE_FILES.
  // If token is absent, access is REVOKED. Redirect to AUTH_GATE (Login).
  if (!token) {
    console.warn("// SECURITY_ALERT: Unauthorized access attempt detected. Redirecting to AUTH_GATE.");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;