import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are currently no items to display in this section.',
  actionLabel,
  onAction,
  className = '',
  style = {}
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`empty-state-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        background: '#FAF9F6',
        borderRadius: '20px',
        border: '1px dashed #E5E0D8',
        margin: '20px 0',
        ...style
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(217, 115, 78, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'var(--accent-color, #D9734E)'
        }}
      >
        <Icon size={28} />
      </div>

      <h3
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '22px',
          fontWeight: '600',
          color: '#2C2A29',
          margin: '0 0 8px 0'
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '14px',
          color: '#6B6864',
          maxWidth: '420px',
          margin: '0 0 20px 0',
          lineHeight: 1.5,
          fontFamily: "'Outfit', sans-serif"
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          style={{
            background: 'var(--accent-color, #D9734E)',
            color: 'white',
            border: 'none',
            padding: '10px 22px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(217, 115, 78, 0.25)',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
