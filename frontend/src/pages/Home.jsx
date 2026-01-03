import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#1e293b' }}>
      
      {/* --- NAVBAR --- */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
        <h2 style={{ margin: 0, color: '#2563eb', fontWeight: '800', letterSpacing: '-1px' }}>
          AwaasTech.
        </h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/login" style={navLinkStyle}>Login</Link>
          <Link to="/register" style={primaryButtonStyle}>Get Started</Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{ textAlign: 'center', padding: '100px 20px', background: 'linear-gradient(to bottom, #f8fafc, #fff)' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', color: '#0f172a' }}>
          Modern Living, <span style={{ color: '#2563eb' }}>Simplified.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          The all-in-one platform to manage your housing society. 
          Track expenses, post notices, and connect with neighbors—effortlessly.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <Link to="/register" style={{ ...primaryButtonStyle, padding: '15px 35px', fontSize: '1.1rem' }}>
            Create Account
          </Link>
          <Link to="/login" style={{ ...secondaryButtonStyle, padding: '15px 35px', fontSize: '1.1rem' }}>
            Member Login
          </Link>
        </div>
      </header>

      {/* --- ABOUT / FEATURES SECTION --- */}
      <section style={{ padding: '80px 50px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          
          <FeatureCard 
            icon="📢" 
            title="Digital Notice Board" 
            desc="Never miss an update. View urgent meetings, events, and maintenance alerts instantly from your dashboard." 
          />
          <FeatureCard 
            icon="💰" 
            title="Expense Tracking" 
            desc="Transparent financial management. Admins can log expenses, and members can view society spending in real-time." 
          />
          <FeatureCard 
            icon="🛡️" 
            title="Secure & Private" 
            desc="Your data is safe with us. Built with modern security standards to ensure only verified members access details." 
          />

        </div>
      </section>

      
      {/* <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '50px 20px', textAlign: 'center' }}>
        <h3 style={{ color: 'white', marginBottom: '10px' }}>AwaasTech.</h3>
        <p style={{ marginBottom: '30px' }}>Making society management smarter, faster, and better.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.9rem' }}>
          <span>© 2026 AwaasTech. Inc.</span>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </footer> */}
    </div>
  );
};

// --- SUB-COMPONENTS & STYLES ---

const FeatureCard = ({ icon, title, desc }) => (
  <div style={{ padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', transition: '0.3s' }}>
    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{icon}</div>
    <h3 style={{ marginBottom: '10px', color: '#1e293b' }}>{title}</h3>
    <p style={{ color: '#64748b', lineHeight: '1.6' }}>{desc}</p>
  </div>
);

const navLinkStyle = {
  textDecoration: 'none',
  color: '#475569',
  fontWeight: '600',
  padding: '10px 15px'
};

const primaryButtonStyle = {
  textDecoration: 'none',
  background: '#2563eb',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: '600',
  transition: '0.2s'
};

const secondaryButtonStyle = {
  textDecoration: 'none',
  background: 'white',
  color: '#2563eb',
  border: '1px solid #e2e8f0',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: '600',
  transition: '0.2s'
};

export default Home;