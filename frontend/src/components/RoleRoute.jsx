import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * RoleRoute — redirects to the correct dashboard based on user role.
 * If a member tries to access /dashboard, they go to /resident and vice versa.
 */
const RoleRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role || 'member';

  if (userRole !== role) {
    // Send to correct dashboard
    let correctPath = '/resident';
    if (userRole === 'admin') correctPath = '/dashboard';
    if (userRole === 'superadmin') correctPath = '/superadmin';
    if (userRole === 'security') correctPath = '/security';
    return <Navigate to={correctPath} replace />;
  }

  return children;
};

export default RoleRoute;
