import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export const ComponentError = ({
  title = 'Failed to load content',
  message = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
  style = {}
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`component-error-boundary ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '36px 24px',
        background: '#FFF5F5',
        borderRadius: '16px',
        border: '1px solid #FED7D7',
        margin: '16px 0',
        ...style
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px',
          color: '#DC2626'
        }}
      >
        <AlertTriangle size={24} />
      </div>

      <h4
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#991B1B',
          margin: '0 0 6px 0',
          fontFamily: "'Outfit', sans-serif"
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: '14px',
          color: '#7F1D1D',
          maxWidth: '400px',
          margin: '0 0 16px 0',
          lineHeight: 1.5,
          fontFamily: "'Outfit', sans-serif"
        }}
      >
        {message}
      </p>

      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#DC2626',
            color: 'white',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          <RotateCcw size={14} /> Retry
        </motion.button>
      )}
    </motion.div>
  );
};

export default ComponentError;
