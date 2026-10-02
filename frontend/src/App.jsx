import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Guards
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import RoleRoute from './components/RoleRoute';

// Error Boundary
import ErrorBoundary from './ErrorBoundary';
import LandingPageLoader from './components/loading-ui/LandingPageLoader';
import { DashboardPageSkeleton } from './components/ui/DashboardSkeleton';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
        <Toaster position="top-right" richColors closeButton />
        <ErrorBoundary>
          <Routes>
            {/* Public Landing Page with PulsatingDots loader (skeleton removed) */}
            <Route
              path="/"
              element={
                <React.Suspense fallback={<LandingPageLoader />}>
                  <Home />
                </React.Suspense>
              }
            />
            <Route
              path="/login"
              element={
                <React.Suspense fallback={<LandingPageLoader />}>
                  <PublicRoute><Login /></PublicRoute>
                </React.Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <React.Suspense fallback={<LandingPageLoader />}>
                  <PublicRoute><Register /></PublicRoute>
                </React.Suspense>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <React.Suspense fallback={<LandingPageLoader />}>
                  <PublicRoute><ForgotPassword /></PublicRoute>
                </React.Suspense>
              }
            />
            <Route
              path="/vendor/quote/:projectId"
              element={
                <React.Suspense fallback={<LandingPageLoader />}>
                  <VendorQuoteSubmit />
                </React.Suspense>
              }
            />

            {/* Protected: standalone profile for security/superadmin */}
            <Route path="/profile" element={
              <PrivateRoute>
                <React.Suspense fallback={<DashboardPageSkeleton />}>
                  <div style={{ backgroundColor: '#F9F8F3', minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
                    <Profile />
                  </div>
                </React.Suspense>
              </PrivateRoute>
            } />

            {/* Admin dashboard with matching UI skeleton */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <RoleRoute role="admin">
                    <React.Suspense fallback={<DashboardPageSkeleton />}>
                      <AdminDashboard />
                    </React.Suspense>
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

            {/* Member dashboard with matching UI skeleton */}
            <Route
              path="/resident"
              element={
                <PrivateRoute>
                  <RoleRoute role="member">
                    <React.Suspense fallback={<DashboardPageSkeleton />}>
                      <MemberDashboard />
                    </React.Suspense>
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route path="/member" element={<Navigate to="/resident" replace />} />

            {/* Superadmin dashboard with matching UI skeleton */}
            <Route
              path="/superadmin"
              element={
                <PrivateRoute>
                  <RoleRoute role="superadmin">
                    <React.Suspense fallback={<DashboardPageSkeleton />}>
                      <SuperAdminDashboard />
                    </React.Suspense>
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            {/* Security dashboard with matching UI skeleton */}
            <Route
              path="/security"
              element={
                <PrivateRoute>
                  <RoleRoute role="security">
                    <React.Suspense fallback={<DashboardPageSkeleton />}>
                      <SecurityDashboard />
                    </React.Suspense>
                  </RoleRoute>
                </PrivateRoute>
              }
            />

            {/* 404 — shows a proper error page instead of silently redirecting */}
            <Route path="*" element={<React.Suspense fallback={<LandingPageLoader />}><NotFound /></React.Suspense>} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;