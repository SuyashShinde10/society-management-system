import React from 'react';

const Footer = () => {
  const theme = {
    bg: '#F8FAFC',
    textMain: '#1e293b',
    textSec: '#64748b',
    border: '#e2e8f0',
    accent: '#D9734E',
  };

  return (
    <footer style={{ 
      background: theme.bg, 
      color: theme.textMain, 
      padding: '80px 60px 40px', 
      borderTop: `1px solid ${theme.border}`,
      marginTop: 'auto'
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          .footer-mono {
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            font-weight: 400;
          }

          .footer-link {
            color: #64748b;
            text-decoration: none;
            transition: all 0.2s;
          }

          .footer-link:hover {
            color: #D9734E;
          }
        `}
      </style>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '60px' 
      }}>
        
        {/* BRAND COLUMN */}
        <div>
          <h3 style={{ 
            fontFamily: "'Cormorant Garamond', serif", 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: '600',
            lineHeight: 1
          }}>
            AwaasTech
          </h3>
          <p className="footer-mono" style={{ marginTop: '16px', color: theme.textSec, lineHeight: '1.5' }}>
            Society infrastructure management protocol. <br />
            Optimized for transparency and resident coordination.
          </p>
        </div>
        
        {/* LOGISTICS/CONTACT COLUMN */}
        <div>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: theme.textMain }}>Support</h4>
          <div className="footer-mono" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ color: theme.textSec }}>Region: Mumbai (APAC)</span>
            <span><a href="mailto:support@awaastech.com" className="footer-link">support@awaastech.com</a></span>
            <span>Uptime: 99.98%</span>
          </div>
        </div>

        {/* METADATA COLUMN */}
        <div>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: theme.textMain }}>Platform Details</h4>
          <div className="footer-mono" style={{ color: theme.textSec, lineHeight: '1.8' }}>
            AwaasTech Systems Inc. <br />
            Version: 3.1.0 Stable <br />
            Auth Level: Secure Core
          </div>
        </div>
      </div>
      
      {/* BOTTOM BAR */}
      <div style={{ 
        marginTop: '60px',
        paddingTop: '30px', 
        borderTop: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <p className="footer-mono" style={{ margin: 0, opacity: 0.8, color: theme.textSec }}>
          © 2026 AwaasTech. All rights reserved.
        </p>
        <div className="footer-mono" style={{ display: 'flex', gap: '24px' }}>
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;