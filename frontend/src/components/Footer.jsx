import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={columnStyle}>
          <h3 style={brandStyle}>AwaasTech.</h3>
          <p style={textStyle}>Making society management smarter, faster, and more transparent for every resident.</p>
        </div>
        
        {/* <div style={columnStyle}>
          <h4 style={headingStyle}>Quick Links</h4>
          <ul style={listStyle}>
            <li><a href="/" style={linkStyle}>Home</a></li>
            <li><a href="/login" style={linkStyle}>Member Login</a></li>
            <li><a href="/register" style={linkStyle}>Join Society</a></li>
          </ul>
        </div> */}

        <div style={columnStyle}>
          <h4 style={headingStyle}>Contact Us</h4>
           
          <p style={textStyle}>📧 support@awaastech.com</p>
        </div>
      </div>
      
      <div style={bottomBarStyle}>
        <p style={{ margin: 0 }}>© 2026 AwaasTech. Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

// --- STYLES ---
const footerStyle = {
  background: '#0f172a',
  color: '#94a3b8',
  padding: '60px 20px 20px 20px',
  marginTop: 'auto', // Pushes footer to bottom if page content is short
  fontFamily: 'sans-serif',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '40px',
  paddingBottom: '40px',
};

const columnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

const brandStyle = { color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '800' };
const headingStyle = { color: 'white', margin: 0, fontSize: '1.1rem' };
const textStyle = { margin: 0, fontSize: '0.9rem', lineHeight: '1.6' };
const listStyle = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' };
const linkStyle = { color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' };

const bottomBarStyle = {
  borderTop: '1px solid #1e293b',
  paddingTop: '20px',
  textAlign: 'center',
  fontSize: '0.8rem',
};

export default Footer;