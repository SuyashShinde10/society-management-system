import React from 'react';
import { motion } from 'framer-motion';

/**
 * PulsatingDots component
 * Uses soft scale and opacity changes to show ongoing work without implying a direction.
 * 
 * Props:
 * - className: CSS classes to control width, color, or surrounding layout (e.g. "w-16", "text-amber-600")
 * - dots: Number of pulsating markers (default: 3)
 * - duration: Animation cycle duration in seconds (default: 1.2)
 * - color: Optional explicit color string (defaults to currentColor)
 */
export function PulsatingDots({
  className = "w-16",
  dots = 3,
  duration = 1.2,
  color,
  style = {},
  ...props
}) {
  const dotCount = Math.max(2, Math.min(6, Number(dots) || 3));
  const dotList = Array.from({ length: dotCount });

  return (
    <div
      className={`inline-flex items-center justify-between gap-1.5 ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: color || 'currentColor',
        ...style
      }}
      role="status"
      aria-label="Loading"
      {...props}
    >
      {dotList.map((_, index) => (
        <motion.span
          key={index}
          className="rounded-full bg-current"
          style={{
            width: `${100 / (dotCount * 1.5)}%`,
            aspectRatio: '1 / 1',
            borderRadius: '9999px',
            backgroundColor: 'currentColor',
            display: 'inline-block'
          }}
          animate={{
            scale: [0.6, 1.15, 0.6],
            opacity: [0.35, 1, 0.35]
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (index * duration) / (dotCount * 1.4)
          }}
        />
      ))}
    </div>
  );
}

export default PulsatingDots;
