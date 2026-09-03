import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';

// Pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const MemberDashboard = React.lazy(() => import('./pages/MemberDashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const SuperAdminDashboard = React.lazy(() => import('./pages/SuperAdminDashboard'));
const SecurityDashboard = React.lazy(() => import('./pages/SecurityDashboard'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const VendorQuoteSubmit = React.lazy(() => import('./pages/VendorQuoteSubmit'));

// Guards
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import RoleRoute from './components/RoleRoute';

// Error Boundary
import ErrorBoundary from './ErrorBoundary';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PageSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F9F8F3', padding: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <Skeleton width={150} height={40} />
      <Skeleton width={200} height={40} />
    </div>
    <Skeleton height={200} style={{ marginBottom: '20px' }} />
    <div style={{ display: 'flex', gap: '20px' }}>
      <Skeleton height={300} style={{ flex: 1 }} />
      <Skeleton height={300} style={{ flex: 1 }} />
      <Skeleton height={300} style={{ flex: 1 }} />
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors closeButton />
        <ErrorBoundary>
          <React.Suspense fallback={<PageSkeleton />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/vendor/quote/:projectId" element={<VendorQuoteSubmit />} />

              {/* Protected: standalone profile for security/superadmin */}
              <Route path="/profile" element={
                <PrivateRoute>
                  <div style={{ backgroundColor: '#F9F8F3', minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
                    <Profile />
                  </div>
                </PrivateRoute>
              } />

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
              <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

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
              <Route path="/member" element={<Navigate to="/resident" replace />} />


              {/* Superadmin dashboard */}
              <Route
                path="/superadmin"
                element={
                  <PrivateRoute>
                    <RoleRoute role="superadmin">
                      <SuperAdminDashboard />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* Security dashboard */}
              <Route
                path="/security"
                element={
                  <PrivateRoute>
                    <RoleRoute role="security">
                      <SecurityDashboard />
                    </RoleRoute>
                  </PrivateRoute>
                }
              />

              {/* Smart redirect after login — handled in PrivateRoute */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
};

export default App;