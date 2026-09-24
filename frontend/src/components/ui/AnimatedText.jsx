import React from 'react';
import { motion } from 'framer-motion';
import SparkleDoodle from './SparkleDoodle';

export const AnimatedText = ({ text = '', showSparkle = true }) => {
  const words = String(text).split(' ');
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
      style={{ display: 'inline-flex', flexWrap: 'wrap', position: 'relative' }}
    >
      {showSparkle && <SparkleDoodle />}
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 100 } }
          }}
          style={{ marginRight: '6px', display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default AnimatedText;
