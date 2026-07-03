import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import Profile from './pages/Profile';

// Guards
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import RoleRoute from './components/RoleRoute';

// Error Boundary
import ErrorBoundary from './ErrorBoundary';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors closeButton />
        <ErrorBoundary>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected: both roles */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Admin dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <RoleRoute role="admin">
                    <AdminDashboard />
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            {/* Member dashboard */}
            <Route
              path="/resident"
              element={
                <PrivateRoute>
                  <RoleRoute role="member">
                    <MemberDashboard />
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            {/* Smart redirect after login — handled in PrivateRoute */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
};

export default App;