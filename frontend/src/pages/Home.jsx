import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const theme = {
    bg: '#F2F2F2',      // Cold Bone
    surface: '#FFFFFF', 
    textMain: '#1A1A1A', // Sharp Ink
    textSec: '#4A4A4A',  
    border: '#1A1A1A',   // Brutalist thick borders
    accent: '#2563EB',   // Electric Cobalt
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.textMain }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          .brutal-btn {
            font-family: 'Space Mono', monospace;
            transition: all 0.2s ease;
          }

          .brutal-btn:hover {
            transform: translate(-3px, -3px);
            box-shadow: 8px 8px 0px #1A1A1A !important;
          }

          .brutal-card:hover {
            background-color: #fff !important;
            transform: translateY(-5px);
            box-shadow: 12px 12px 0px rgba(0,0,0,0.1);
          }
        `}
      </style>

      {/* --- NAVIGATION --- */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '30px 60px', 
        borderBottom: `3px solid ${theme.border}`, 
        background: theme.surface 
      }}>
        <h2 style={{ 
          margin: 0, 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: '32px', 
          fontWeight: '600', 
          textTransform: 'uppercase' 
        }}>
          AwaasTech.
        </h2>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center', fontFamily: "'Space Mono', monospace" }}>
          <Link to="/login" style={{ textDecoration: 'none', color: theme.textMain, fontWeight: '700', fontSize: '14px' }}>[ LOGIN ]</Link>
          <Link to="/register" className="brutal-btn" style={{ 
            textDecoration: 'none', 
            background: theme.textMain, 
            color: 'white', 
            padding: '12px 24px', 
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: `4px 4px 0px ${theme.accent}`
          }}>
            INITIALIZE_SYSTEM
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{ 
        padding: '120px 60px', 
        borderBottom: `3px solid ${theme.border}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', borderLeft: `12px solid ${theme.textMain}`, paddingLeft: '40px' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontWeight: '700', fontSize: '14px', color: theme.accent, marginBottom: '20px' }}>
            // INFRASTRUCTURE_MANAGEMENT_V2.0
          </p>
          <h1 style={{ 
            fontFamily: "'Cormorant Garamond', serif", 
            fontSize: 'clamp(50px, 8vw, 90px)', 
            fontWeight: '600', 
            lineHeight: '0.85', 
            textTransform: 'uppercase',
            margin: '0 0 30px 0' 
          }}>
            Society <br /> Living. <br /> <span style={{ color: theme.accent }}>Coded.</span>
          </h1>
          <p style={{ 
            fontFamily: "'Space Mono', monospace", 
            fontSize: '16px', 
            color: theme.textSec, 
            maxWidth: '550px', 
            lineHeight: '1.5',
            marginBottom: '50px'
          }}>
            Unified protocol for managing housing assets. Digital notice dissemination, financial auditing, and resident verification. Strictly optimized for efficiency.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/register" className="brutal-btn" style={{ 
              textDecoration: 'none', 
              background: theme.accent, 
              color: 'white', 
              padding: '20px 40px', 
              fontWeight: '700',
              fontFamily: "'Space Mono', monospace",
              boxShadow: `6px 6px 0px ${theme.textMain}`
            }}>
              CREATE_ADMIN_ID
            </Link>
            <Link to="/login" className="brutal-btn" style={{ 
              textDecoration: 'none', 
              background: 'transparent', 
              color: theme.textMain, 
              border: `3px solid ${theme.border}`,
              padding: '20px 40px', 
              fontWeight: '700',
              fontFamily: "'Space Mono', monospace"
            }}>
              MEMBER_AUTH
            </Link>
          </div>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section style={{ padding: '100px 60px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '0px', // No gap, borders will touch
          border: `3px solid ${theme.border}`
        }}>
          
          <FeatureCard 
            id="01"
            title="Notice_Protocol" 
            desc="Zero-latency dissemination of critical society updates, meeting minutes, and maintenance schedules." 
          />
          <FeatureCard 
            id="02"
            title="Financial_Ledger" 
            desc="Automated audit trails for society spending. Real-time transparency for all verified stakeholders." 
          />
          <FeatureCard 
            id="03"
            title="Security_Firewall" 
            desc="Restricted access environment. Modern encryption standards to secure resident metadata." 
          />

        </div>
      </section>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const FeatureCard = ({ id, title, desc }) => (
  <div className="brutal-card" style={{ 
    padding: '50px', 
    border: '1px solid #1A1A1A', 
    background: '#EAEAEA',
    transition: '0.3s'
  }}>
    <div style={{ 
      fontFamily: "'Space Mono', monospace", 
      fontSize: '14px', 
      fontWeight: '700', 
      color: '#2563EB',
      marginBottom: '40px' 
    }}>
      [{id}]
    </div>
    <h3 style={{ 
      fontFamily: "'Cormorant Garamond', serif", 
      fontSize: '32px', 
      textTransform: 'uppercase',
      marginBottom: '20px' 
    }}>
      {title}
    </h3>
    <p style={{ 
      fontFamily: "'Space Mono', monospace", 
      fontSize: '14px', 
      lineHeight: '1.6', 
      color: '#4A4A4A' 
    }}>
      {desc}
    </p>
  </div>
);

export default Home;