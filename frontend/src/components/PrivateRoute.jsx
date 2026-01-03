import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check if a token exists in Local Storage
  const token = localStorage.getItem('token');

  // If token exists, show the protected page (children)
  // If not, redirect to the Login page
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;