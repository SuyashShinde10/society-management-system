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

  if (user.role !== role) {
    // Send to correct dashboard
    const correctPath = user.role === 'admin' ? '/dashboard' : '/resident';
    return <Navigate to={correctPath} replace />;
  }

  return children;
};

export default RoleRoute;
