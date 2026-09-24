import React from 'react';
import { motion } from 'framer-motion';

export const SparkleDoodle = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', top: '-10px', left: '-15px', pointerEvents: 'none' }}
  >
    <motion.path
      d="M15 0L17 12L30 15L17 17L15 30L12 17L0 15L12 12L15 0Z"
      fill="var(--accent-color, #D9734E)"
      initial={{ scale: 0, rotate: 45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
    />
  </svg>
);

export default SparkleDoodle;
