import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Receipt, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  QrCode,
  CreditCard,
  Building2,
  Command
} from 'lucide-react';
import theme from '../../theme';

const ONBOARDING_STEPS = [
  {
    badge: 'GATE & SECURITY',
    title: 'Digital Gate Passes & Instant Entry',
    description: 'Pre-authorize visitors, food deliveries, and cabs in seconds. Share an instant QR code pass so your guests can enter the society gates without buzzer delays.',
    icon: QrCode,
    illustration: () => (
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="45" r="38" fill="#F4EFE6" />
        <rect x="36" y="22" width="48" height="46" rx="8" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="2" />
        {/* QR Code pattern simulation */}
        <rect x="42" y="28" width="12" height="12" rx="2" fill="#D9734E" />
        <rect x="44" y="30" width="8" height="8" rx="1" fill="#FFFDF9" />
        <rect x="46" y="32" width="4" height="4" fill="#D9734E" />
        
        <rect x="66" y="28" width="12" height="12" rx="2" fill="#2C2A29" />
        <rect x="42" y="50" width="12" height="12" rx="2" fill="#2C2A29" />
        
        <circle cx="72" cy="56" r="3" fill="#D9734E" />
        <rect x="62" y="46" width="6" height="6" fill="#D9734E" rx="1" />
        
        <g filter="drop-shadow(0px 3px 6px rgba(16, 185, 129, 0.25))">
          <circle cx="86" cy="62" r="11" fill="#10B981" />
          <path d="M82 62L85 65L90 60" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    ),
    tip: 'Tip: Tap "Passes" in bottom navigation or press Ctrl+K to issue a guest pass.'
  },
  {
    badge: 'FINANCIAL TRANSPARENCY',
    title: 'Maintenance Dues & 1-Tap Receipts',
    description: 'Track monthly society maintenance dues with absolute transparency. Pay via UPI or Net Banking, split payments across modes, and request AI resolution for any billing dispute.',
    icon: CreditCard,
    illustration: () => (
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="45" r="38" fill="#F4EFE6" />
        <rect x="34" y="24" width="52" height="44" rx="8" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="2" />
        <rect x="34" y="34" width="52" height="8" fill="#D9734E" fillOpacity="0.15" />
        <circle cx="45" cy="54" r="5" fill="#D9734E" fillOpacity="0.8" />
        <circle cx="53" cy="54" r="5" fill="#C88D34" fillOpacity="0.8" />
        <line x1="64" y1="54" x2="78" y2="54" stroke="#D3CBBF" strokeWidth="2" strokeLinecap="round" />
        
        <g filter="drop-shadow(0px 3px 6px rgba(217, 115, 78, 0.25))">
          <circle cx="84" cy="24" r="11" fill="#D9734E" />
          <path d="M80 24C80 21.5 82 20 84 20C86 20 88 21.5 88 24C88 26.5 86 28 84 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="84" y1="18" x2="84" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    ),
    tip: 'Instant PDF invoices are generated with one tap for your tax and accounting records.'
  },
  {
    badge: 'COMMUNITY LIVING',
    title: 'Clubhouse, AGMs & Society Circle',
    description: 'Book swimming pool and tennis court slots, vote on critical society resolutions in digital AGMs, and stay connected with circulars broadcasted on your digital notice board.',
    icon: Building2,
    illustration: () => (
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="45" r="38" fill="#F4EFE6" />
        <path d="M38 66V44L60 26L82 44V66H38Z" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="2" strokeLinejoin="round" />
        <rect x="54" y="48" width="12" height="18" rx="2" fill="#D9734E" fillOpacity="0.2" stroke="#D9734E" strokeWidth="1.5" />
        <circle cx="60" cy="38" r="4" fill="#E8E2D5" stroke="#C5BCAE" strokeWidth="1.2" />
        
        <circle cx="92" cy="52" r="12" fill="#E2EBE0" stroke="#8DA385" strokeWidth="1.5" />
        <circle cx="28" cy="56" r="9" fill="#E2EBE0" stroke="#8DA385" strokeWidth="1.5" />
        
        <g filter="drop-shadow(0px 3px 6px rgba(59, 130, 246, 0.25))">
          <circle cx="76" cy="30" r="10" fill="#3B82F6" />
          <path d="M73 30L75 32L79 28" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    ),
    tip: 'Everything is at your fingertips. Press Ctrl+K anytime for fast one-stroke navigation.'
  }
];

export const ResidentOnboardingModal = ({
  isOpen,
  onClose,
  user,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = ONBOARDING_STEPS[currentStep];
  const isLast = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (user?._id) {
      try {
        localStorage.setItem(`awaastech_resident_onboarded_v1_${user._id}`, 'true');
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleComplete}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Onboarding Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-[480px] bg-[#FFFDF9] rounded-3xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-8 flex flex-col z-10 overflow-hidden"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C5E43] bg-[#F4EFE6] px-3 py-1 rounded-full border border-[#E4DACD]">
              {step.badge}
            </span>

            <button
              type="button"
              onClick={handleComplete}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Skip Tour"
              title="Skip Tour"
            >
              <X size={18} />
            </button>
          </div>

          {/* Animated Illustration Centerpiece */}
          <div className="flex justify-center my-3">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {step.illustration()}
            </motion.div>
          </div>

          {/* Step Title & Subtitle */}
          <div className="text-center my-2">
            <h3
              className="text-2xl font-bold text-slate-900 m-0 leading-snug"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {step.title}
            </h3>
            <p className="text-sm text-slate-600 mt-2 mb-0 leading-relaxed max-w-[400px] mx-auto">
              {step.description}
            </p>
          </div>

          {/* Contextual Pro Tip Box */}
          <div className="my-4 p-3 rounded-xl bg-[#F8F5EE] border border-[#EAE3D5] text-xs text-[#5C5549] text-center flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-[#D9734E] shrink-0" />
            <span>{step.tip}</span>
          </div>

          {/* Stepper Dots & Navigation Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#F0ECE1] mt-2">
            {/* Step Indicator Dots */}
            <div className="flex items-center gap-1.5">
              {ONBOARDING_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentStep === idx
                      ? 'w-6 bg-[#D9734E]'
                      : 'w-2 bg-[#D3CBBF] hover:bg-slate-400'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#D9734E] hover:bg-[#c6633e] active:scale-[0.98] transition-all shadow-md shadow-[#D9734E]/25 flex items-center gap-1.5 cursor-pointer"
              >
                {isLast ? (
                  <>
                    <span>Enter Portal</span>
                    <Check size={14} />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResidentOnboardingModal;
