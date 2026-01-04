import React from 'react';

const Footer = () => {
  const theme = {
    bg: '#F2F2F2',       // Cold Bone
    textMain: '#1A1A1A',  // Sharp Ink
    textSec: '#4A4A4A',  
    border: '#1A1A1A',   
    accent: '#2563EB',   // Electric Cobalt
  };

  return (
    <footer style={{ 
      background: theme.bg, 
      color: theme.textMain, 
      padding: '80px 60px 40px', 
      borderTop: `4px solid ${theme.border}`,
      marginTop: 'auto'
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          .footer-mono {
            font-family: 'Space Mono', monospace;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .footer-link {
            color: #1A1A1A;
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: all 0.2s;
          }

          .footer-link:hover {
            border-bottom: 1px solid #1A1A1A;
            color: #2563EB;
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
        <div style={{ borderLeft: `8px solid ${theme.textMain}`, paddingLeft: '24px' }}>
          <h3 style={{ 
            fontFamily: "'Cormorant Garamond', serif", 
            margin: 0, 
            fontSize: '2rem', 
            textTransform: 'uppercase',
            lineHeight: 1
          }}>
            AwaasTech.
          </h3>
          <p className="footer-mono" style={{ marginTop: '16px', color: theme.textSec, lineHeight: '1.5' }}>
            Society infrastructure management protocol. <br />
            Optimized for transparency and resident coordination.
          </p>
        </div>
        
        {/* LOGISTICS/CONTACT COLUMN */}
        <div>
          <h4 className="footer-mono" style={{ marginBottom: '20px', color: theme.accent }}>[ SYSTEM_SUPPORT ]</h4>
          <div className="footer-mono" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span>NODE_LOC: MUMBAI_REGION_01</span>
            <span>EMAIL: <a href="mailto:support@awaastech.com" className="footer-link">SUPPORT@AWAASTECH.COM</a></span>
            <span>Uptime: 99.98%</span>
          </div>
        </div>

        {/* METADATA COLUMN */}
        <div>
          <h4 className="footer-mono" style={{ marginBottom: '20px' }}>[ REGISTRY_DETAILS ]</h4>
          <div className="footer-mono" style={{ color: theme.textSec, lineHeight: '1.8' }}>
            AwaasTech. Industrial Systems Inc. <br />
            Version: 2.0.26_STABLE <br />
            Auth_Level: SECURE_CORE
          </div>
        </div>
      </div>
      
      {/* BOTTOM BAR */}
      <div style={{ 
        marginTop: '60px',
        paddingTop: '30px', 
        borderTop: `1px dashed ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <p className="footer-mono" style={{ margin: 0, opacity: 0.6 }}>
          © 2026 AwaasTech. All rights reserved.
        </p>
        <div className="footer-mono" style={{ display: 'flex', gap: '24px' }}>
          <a href="#" className="footer-link">PRIVACY_PROTOCOL</a>
          <a href="#" className="footer-link">TERMS_OF_SERVICE</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;