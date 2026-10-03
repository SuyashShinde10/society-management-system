import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import theme from '../../theme';

/**
 * BottomSheet: Adaptive action drawer.
 * On Mobile (< 768px): Anchors to bottom with drag handle pill, native iOS/Android sheet ergonomics.
 * On Desktop (>= 768px): Centers as an elegant floating dialog.
 */
export const BottomSheet = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '540px',
  showHandle = true,
  className = '',
  bodyClassName = '',
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1200] flex items-end md:items-center justify-center">
          {/* Backdrop with smooth blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Drawer / Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`
              relative w-full z-10 bg-white shadow-2xl flex flex-col overflow-hidden
              rounded-t-[28px] md:rounded-2xl
              max-h-[90vh] md:max-h-[85vh]
              border-t md:border border-[#E8E4D9]
              ${className}
            `}
            style={{
              maxWidth: typeof window !== 'undefined' && window.innerWidth >= 768 ? maxWidth : '100%',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Native Mobile Drag Handle Pill */}
            {showHandle && (
              <div className="md:hidden pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 rounded-full bg-slate-300" />
              </div>
            )}

            {/* Header */}
            {(title || subtitle) && (
              <div className="px-5 pt-3 pb-3 md:px-6 md:py-4 border-b border-[#F0ECE1] flex items-start justify-between bg-[#FDFCF9]">
                <div>
                  {title && (
                    <h3
                      className="text-lg md:text-xl font-bold text-slate-900 leading-tight"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {subtitle}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 -mr-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div
              className={`flex-1 overflow-y-auto px-5 py-4 md:px-6 md:py-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] md:pb-6 ${bodyClassName}`}
              style={{
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
