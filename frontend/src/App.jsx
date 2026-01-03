import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages & Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Footer from './components/Footer'; // <--- Import Footer
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        {/* Wrapper to ensure footer stays at the bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route path="/login" element={
              <PublicRoute><Login /></PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute><Register /></PublicRoute>
            } />
            
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
          </Routes>

          <Footer /> {/* <--- Footer is now on all pages */}
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;