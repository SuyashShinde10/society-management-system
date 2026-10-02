import React from 'react';
import PulsatingDots from './pulsating-dots';

export const LandingPageLoader = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F9F8F3',
        color: '#2C2C2C',
        fontFamily: "'Outfit', sans-serif",
        gap: '20px'
      }}
      role="status"
      aria-label="Loading landing page"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src="/awaastech-logo.png"
          alt="Awaastech"
          style={{ width: '36px', height: '36px', objectFit: 'contain' }}
        />
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '28px',
            fontWeight: 600,
            letterSpacing: '1px',
            color: '#2C2C2C'
          }}
        >
          Awaastech
        </span>
      </div>

      {/* Pulsating Dots Loader */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <PulsatingDots className="w-16" color="#D9734E" dots={3} duration={1.2} />
        <span style={{ fontSize: '13px', color: '#6B705C', fontWeight: 500, letterSpacing: '0.5px' }}>
          Preparing living spaces...
        </span>
      </div>
    </div>
  );
};

export default LandingPageLoader;
