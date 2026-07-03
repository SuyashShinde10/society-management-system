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
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.textMain, width: '100%', overflowX: 'hidden' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          * {
            box-sizing: border-box;
          }

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

          @media (max-width: 900px) {
            .hero-section {
              flex-direction: column !important;
              padding: 60px 30px !important;
            }
            .nav-section {
              padding: 20px 30px !important;
            }
            .hero-content {
              padding: 20px !important;
              border-left: 6px solid #1A1A1A !important;
            }
            h1 {
              font-size: clamp(40px, 10vw, 60px) !important;
            }
            .features-section {
              padding: 60px 30px !important;
            }
            .hero-buttons {
              flex-direction: column !important;
              width: 100%;
            }
            .hero-buttons a {
              text-align: center;
              width: 100%;
              box-sizing: border-box;
            }
            .nav-section {
              flex-direction: column;
              gap: 20px;
              padding: 20px !important;
            }
            .footer-links {
              flex-direction: column !important;
              gap: 15px !important;
              text-align: center;
            }
            .features-grid {
              grid-template-columns: 1fr !important;
            }
            .feature-card {
              padding: 30px !important;
            }
            .walkthrough-container {
              padding: 0 !important;
              margin-top: 20px;
            }
            .walkthrough-step {
              padding: 15px !important;
              flex-direction: column;
              text-align: center;
            }
          }
        `}
      </style>

      {/* --- NAVIGATION --- */}
      <nav className="nav-section" style={{ 
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
          <Link to="/join" className="brutal-btn" style={{ 
            textDecoration: 'none', 
            background: theme.textMain, 
            color: 'white', 
            padding: '12px 24px', 
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: `4px 4px 0px ${theme.accent}`
          }}>
            JOIN_SOCIETY
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="hero-section" style={{ 
        padding: '120px 60px', 
        borderBottom: `3px solid ${theme.border}`,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(90deg, ${theme.bg} 21px, transparent 1%) center, linear-gradient(${theme.bg} 21px, transparent 1%) center, #e5e5e5`,
        backgroundSize: '22px 22px',
        display: 'flex',
        gap: '40px',
        alignItems: 'center'
      }}>
        {/* Left Side: Hero Text */}
        <div className="hero-content" style={{ flex: '1', maxWidth: '800px', borderLeft: `12px solid ${theme.textMain}`, background: theme.bg, padding: '30px 40px', border: `3px solid ${theme.border}`, boxShadow: `8px 8px 0px rgba(0,0,0,0.1)` }}>
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
            lineHeight: '1.5',
            marginBottom: '40px'
          }}>
            Unified protocol for managing housing assets. Digital notice dissemination, financial auditing, and resident verification. Strictly optimized for efficiency.
          </p>
          <div className="hero-buttons" style={{ display: 'flex', gap: '20px' }}>
            <Link to="/register" className="brutal-btn" style={{ 
              textDecoration: 'none', 
              background: theme.accent, 
              color: 'white', 
              padding: '16px 30px', 
              fontWeight: '700',
              fontFamily: "'Space Mono', monospace",
              boxShadow: `6px 6px 0px ${theme.textMain}`
            }}>
              CREATE_SOCIETY
            </Link>
            <Link to="/login" className="brutal-btn" style={{ 
              textDecoration: 'none', 
              background: 'transparent', 
              color: theme.textMain, 
              border: `3px solid ${theme.border}`,
              padding: '16px 30px', 
              fontWeight: '700',
              fontFamily: "'Space Mono', monospace"
            }}>
              MEMBER_AUTH
            </Link>
          </div>
        </div>

        {/* Right Side: Walkthrough Guide */}
        <div className="walkthrough-container" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', width: '100%' }}>
          <div className="walkthrough-step" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: theme.surface, border: `2px solid ${theme.border}`, padding: '20px', boxShadow: `4px 4px 0px ${theme.textMain}` }}>
            <div style={{ background: theme.accent, color: 'white', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: "'Space Mono', monospace", borderRadius: '50%', flexShrink: 0 }}>
              01
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' }}>Initialize Society</h4>
              <p style={{ margin: 0, fontSize: '12px', color: theme.textSec, fontFamily: "'Space Mono', monospace" }}>Admin registers the society and defines infrastructure (Wings & Flats).</p>
            </div>
          </div>
          
          <div className="walkthrough-step" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: theme.surface, border: `2px solid ${theme.border}`, padding: '20px', boxShadow: `4px 4px 0px ${theme.textMain}` }}>
            <div style={{ background: theme.textMain, color: 'white', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: "'Space Mono', monospace", borderRadius: '50%', flexShrink: 0 }}>
              02
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' }}>Onboard Members</h4>
              <p style={{ margin: 0, fontSize: '12px', color: theme.textSec, fontFamily: "'Space Mono', monospace" }}>Admin securely adds residents and provides them with one-time credentials.</p>
            </div>
          </div>
          
          <div className="walkthrough-step" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: theme.surface, border: `2px solid ${theme.border}`, padding: '20px', boxShadow: `4px 4px 0px ${theme.textMain}` }}>
            <div style={{ background: theme.accent, color: 'white', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: "'Space Mono', monospace", borderRadius: '50%', flexShrink: 0 }}>
              03
            </div>
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' }}>Manage Operations</h4>
              <p style={{ margin: 0, fontSize: '12px', color: theme.textSec, fontFamily: "'Space Mono', monospace" }}>Track visitors, generate maintenance bills, and resolve resident complaints.</p>
            </div>
          </div>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section className="features-section" style={{ padding: '80px 60px', display: 'flex', justifyContent: 'center' }}>
        <div className="features-grid" style={{ 
          width: '100%',
          maxWidth: '1200px',
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '30px'
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

      {/* --- FOOTER --- */}
      <footer style={{ 
        borderTop: `3px solid ${theme.border}`, 
        padding: '60px', 
        background: theme.textMain, 
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: '28px', 
          fontWeight: '600', 
          textTransform: 'uppercase' 
        }}>
          AwaasTech.
        </h2>
        <div className="footer-links" style={{ display: 'flex', gap: '30px', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>[ DOCUMENTATION ]</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>[ SYSTEM_STATUS ]</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>[ TERMS_OF_SERVICE ]</a>
        </div>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: theme.textSec, marginTop: '20px' }}>
          © {new Date().getFullYear()} AwaasTech Inc. All Rights Reserved. // SYSTEM_V2.0.26
        </p>
      </footer>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const FeatureCard = ({ id, title, desc }) => (
  <div className="brutal-card feature-card" style={{ 
    padding: '40px', 
    border: '3px solid #1A1A1A', 
    background: '#FFFFFF',
    boxShadow: '8px 8px 0px rgba(0,0,0,0.1)',
    transition: '0.3s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  }}>
    <div style={{ 
      fontFamily: "'Space Mono', monospace", 
      fontSize: '14px', 
      fontWeight: '700', 
      color: '#2563EB',
      marginBottom: '20px' 
    }}>
      [{id}]
    </div>
    <h3 style={{ 
      fontFamily: "'Cormorant Garamond', serif", 
      fontSize: '28px', 
      textTransform: 'uppercase',
      marginBottom: '15px' 
    }}>
      {title}
    </h3>
    <p style={{ 
      fontFamily: "'Space Mono', monospace", 
      fontSize: '14px', 
      lineHeight: '1.6', 
      color: '#4A4A4A',
      margin: 0
    }}>
      {desc}
    </p>
  </div>
);

export default Home;