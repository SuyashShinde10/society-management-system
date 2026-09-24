import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundBlobs = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(217,115,78,0.03) 0%, rgba(249,248,243,0) 70%)',
        borderRadius: '50%'
      }}
    />
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(46,76,56,0.02) 0%, rgba(249,248,243,0) 70%)',
        borderRadius: '50%'
      }}
    />
  </div>
);

export default BackgroundBlobs;
