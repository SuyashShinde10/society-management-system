import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Building2 } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: "'Outfit', sans-serif",
        background: 'linear-gradient(135deg, #F9F8F3 0%, #F0EDE4 100%)',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      {/* Animated 404 Number */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        style={{
          fontSize: 'clamp(80px, 20vw, 160px)',
          fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #D9734E, #c45c38)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-4px',
          userSelect: 'none',
        }}
      >
        404
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(217, 115, 78, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '16px auto',
        }}
      >
        <Building2 size={36} color="#D9734E" />
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2C2C2C', margin: '0 0 12px' }}
      >
        Page Not Found
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ fontSize: '1rem', color: '#6B7280', maxWidth: '400px', margin: '0 0 36px', lineHeight: 1.6 }}
      >
        This page doesn't exist or has been moved. Check the URL or navigate back to your dashboard.
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back to previous page"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '10px',
            border: '1.5px solid #D9734E',
            background: 'transparent',
            color: '#D9734E',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,115,78,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <ArrowLeft size={16} />
          Go Back
        </button>

        <Link
          to="/"
          aria-label="Go to home page"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #D9734E, #c45c38)',
            color: '#fff',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: '0.95rem',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          <Home size={16} />
          Home
        </Link>
      </motion.div>

      {/* Subtle background blob */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,115,78,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default NotFound;
