import React from 'react';
import { motion } from 'framer-motion';
import { 
  Inbox, 
  MessageSquareCheck, 
  Receipt, 
  Bell, 
  ShieldCheck, 
  CalendarDays, 
  PackageCheck, 
  Sparkles, 
  Users, 
  SearchX,
  Store
} from 'lucide-react';
import theme from '../../theme';

// Bespoke Organic Minimalist illustrations tailored for housing society domains
const EmptyIllustrations = {
  complaints: () => (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gentle background glow */}
      <circle cx="70" cy="55" r="45" fill="#F4EFE6" />
      {/* Peaceful society cottage outline */}
      <path d="M42 68V48L70 28L98 48V68C98 71.3 95.3 74 92 74H48C44.7 74 42 71.3 42 68Z" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="2" strokeLinejoin="round" />
      {/* Warm door & chimney */}
      <rect x="63" y="56" width="14" height="18" rx="2" fill="#D9734E" fillOpacity="0.2" stroke="#D9734E" strokeWidth="1.5" />
      <rect x="83" y="32" width="7" height="12" rx="1" fill="#E8E2D5" stroke="#C5BCAE" strokeWidth="1.5" />
      {/* Tree foliage */}
      <circle cx="34" cy="62" r="12" fill="#E2EBE0" stroke="#8DA385" strokeWidth="1.5" />
      <path d="M34 68V74" stroke="#8DA385" strokeWidth="2" strokeLinecap="round" />
      <circle cx="106" cy="60" r="10" fill="#E2EBE0" stroke="#8DA385" strokeWidth="1.5" />
      <path d="M106 66V74" stroke="#8DA385" strokeWidth="2" strokeLinecap="round" />
      {/* Floating tranquil checkmark badge */}
      <g filter="drop-shadow(0px 3px 6px rgba(16, 185, 129, 0.25))">
        <circle cx="88" cy="30" r="13" fill="#10B981" />
        <path d="M83 30L87 34L94 27" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  ),

  bills: () => (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="55" r="45" fill="#F4EFE6" />
      {/* Ledger sheet */}
      <rect x="46" y="24" width="48" height="62" rx="6" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="2" />
      <line x1="56" y1="36" x2="84" y2="36" stroke="#D9734E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="56" y1="46" x2="84" y2="46" stroke="#E5E0D6" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="56" x2="76" y2="56" stroke="#E5E0D6" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="66" x2="80" y2="66" stroke="#E5E0D6" strokeWidth="2" strokeLinecap="round" />
      {/* Gold coin / settled badge */}
      <g filter="drop-shadow(0px 4px 8px rgba(217, 115, 78, 0.25))">
        <circle cx="92" cy="72" r="16" fill="#D9734E" />
        <path d="M86 72C86 68.7 88.7 66 92 66C95.3 66 98 68.7 98 72C98 75.3 95.3 78 92 78" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="92" y1="64" x2="92" y2="80" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  ),

  notices: () => (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="55" r="45" fill="#F4EFE6" />
      {/* Bulletin Board Parchment */}
      <rect x="45" y="26" width="50" height="58" rx="4" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="2" />
      <circle cx="70" cy="20" r="5" fill="#D9734E" stroke="#FFFDF9" strokeWidth="1.5" />
      <line x1="55" y1="38" x2="85" y2="38" stroke="#D3CBBF" strokeWidth="2" strokeLinecap="round" />
      <line x1="55" y1="48" x2="85" y2="48" stroke="#E5DFD4" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="55" y1="58" x2="75" y2="58" stroke="#E5DFD4" strokeWidth="1.8" strokeLinecap="round" />
      {/* Wax Seal */}
      <circle cx="80" cy="70" r="10" fill="#D9734E" fillOpacity="0.85" />
      <path d="M77 70L79 72L83 68" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  visitors: () => (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="55" r="45" fill="#F4EFE6" />
      {/* Gatehouse Arch */}
      <path d="M46 76V48C46 36.95 56.74 28 70 28C83.26 28 94 36.95 94 48V76" stroke="#D3CBBF" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 76V52C56 44.26 62.26 38 70 38C77.74 38 84 44.26 84 52V76" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="1.5" />
      {/* Barrier gate bar */}
      <line x1="42" y1="62" x2="98" y2="62" stroke="#D9734E" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4" />
      {/* Shield check */}
      <g filter="drop-shadow(0px 3px 6px rgba(16, 185, 129, 0.2))">
        <path d="M70 42L78 45V53C78 57.5 74.5 61 70 63C65.5 61 62 57.5 62 53V45L70 42Z" fill="#10B981" />
        <path d="M67 52L69 54L73 50" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  ),

  meetings: () => (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="55" r="45" fill="#F4EFE6" />
      {/* Round Conference Table */}
      <ellipse cx="70" cy="58" rx="34" ry="20" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="2" />
      {/* Chairs around table */}
      <circle cx="70" cy="30" r="7" fill="#EAE5DC" stroke="#D3CBBF" strokeWidth="1.5" />
      <circle cx="38" cy="46" r="7" fill="#EAE5DC" stroke="#D3CBBF" strokeWidth="1.5" />
      <circle cx="102" cy="46" r="7" fill="#EAE5DC" stroke="#D3CBBF" strokeWidth="1.5" />
      <circle cx="50" cy="74" r="7" fill="#EAE5DC" stroke="#D3CBBF" strokeWidth="1.5" />
      <circle cx="90" cy="74" r="7" fill="#EAE5DC" stroke="#D3CBBF" strokeWidth="1.5" />
      {/* Coffee/Tea cup in center */}
      <circle cx="70" cy="58" r="5" fill="#D9734E" fillOpacity="0.4" stroke="#D9734E" strokeWidth="1.5" />
    </svg>
  ),

  parcels: () => (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="55" r="45" fill="#F4EFE6" />
      {/* Parcel Box */}
      <rect x="46" y="40" width="48" height="38" rx="4" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="2" />
      <path d="M46 50L70 60L94 50" stroke="#D3CBBF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="60" x2="70" y2="78" stroke="#D3CBBF" strokeWidth="1.5" />
      {/* Ribbon */}
      <rect x="64" y="40" width="12" height="38" fill="#D9734E" fillOpacity="0.15" />
      {/* Green Check */}
      <circle cx="86" cy="36" r="11" fill="#10B981" />
      <path d="M82 36L85 39L90 34" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  amenities: () => (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="55" r="45" fill="#F4EFE6" />
      {/* Clubhouse / Pool waves */}
      <path d="M40 68C48 65 54 71 62 68C70 65 76 71 84 68C92 65 96 69 100 68" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M44 76C52 73 58 79 66 76C74 73 80 79 88 76C94 73 98 76 100 75" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.6" />
      {/* Lounger / Umbrella */}
      <path d="M52 52L80 34" stroke="#D9734E" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 48L72 58" stroke="#D3CBBF" strokeWidth="2" strokeLinecap="round" />
      <circle cx="88" cy="34" r="8" fill="#F59E0B" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="1.5" />
    </svg>
  ),

  members: () => (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="55" r="45" fill="#F4EFE6" />
      {/* Two member avatars */}
      <circle cx="56" cy="48" r="14" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="2" />
      <path d="M40 76C40 67 47 62 56 62C65 62 72 67 72 76" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="2" strokeLinecap="round" />
      <circle cx="84" cy="44" r="12" fill="#FFFDF9" stroke="#D9734E" strokeWidth="1.8" />
      <path d="M72 74C72 66 78 61 85 61C92 61 98 66 98 74" fill="#FFFDF9" stroke="#D9734E" strokeWidth="1.8" strokeLinecap="round" />
      {/* Friendly sparkle */}
      <circle cx="70" cy="28" r="3" fill="#D9734E" />
    </svg>
  ),

  search: () => (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="55" r="45" fill="#F4EFE6" />
      {/* Magnifier */}
      <circle cx="65" cy="50" r="18" fill="#FFFDF9" stroke="#D9734E" strokeWidth="2.5" />
      <line x1="78" y1="63" x2="94" y2="79" stroke="#D9734E" strokeWidth="3" strokeLinecap="round" />
      {/* Question or cross mark */}
      <line x1="59" y1="44" x2="71" y2="56" stroke="#D3CBBF" strokeWidth="2" strokeLinecap="round" />
      <line x1="71" y1="44" x2="59" y2="56" stroke="#D3CBBF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  default: () => (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="55" r="45" fill="#F4EFE6" />
      <rect x="46" y="38" width="48" height="38" rx="6" fill="#FFFDF9" stroke="#D3CBBF" strokeWidth="2" />
      <path d="M46 54H94" stroke="#D3CBBF" strokeWidth="1.5" />
      <path d="M60 54V60C60 62.2 61.8 64 64 64H76C78.2 64 80 62.2 80 60V54" fill="#F4EFE6" stroke="#D3CBBF" strokeWidth="1.5" />
      <circle cx="70" cy="28" r="4" fill="#D9734E" />
    </svg>
  )
};

const PresetMetadata = {
  complaints: {
    badge: 'ALL RESOLVED',
    defaultTitle: 'No incidents reported',
    defaultDesc: 'No complaints or grievances have been filed. The community is running peacefully!',
    icon: MessageSquareCheck,
  },
  bills: {
    badge: 'FINANCES BALANCED',
    defaultTitle: 'Zero pending invoices',
    defaultDesc: 'All maintenance dues and financial statements are currently up to date.',
    icon: Receipt,
  },
  notices: {
    badge: 'BOARD IS QUIET',
    defaultTitle: 'No notices broadcasted',
    defaultDesc: 'There are currently no active announcements or circulars on the society notice board.',
    icon: Bell,
  },
  visitors: {
    badge: 'GATE IS CLEAR',
    defaultTitle: 'No visitors recorded',
    defaultDesc: 'There are currently no visitor check-ins recorded at the gate.',
    icon: ShieldCheck,
  },
  meetings: {
    badge: 'CALENDAR OPEN',
    defaultTitle: 'No upcoming meetings',
    defaultDesc: 'No general body or committee meetings are currently scheduled.',
    icon: CalendarDays,
  },
  parcels: {
    badge: 'LOCKER CLEAR',
    defaultTitle: 'No packages in locker',
    defaultDesc: 'All delivered packages have been collected by residents.',
    icon: PackageCheck,
  },
  amenities: {
    badge: 'OPEN FOR BOOKING',
    defaultTitle: 'No active reservations',
    defaultDesc: 'Society amenities and clubhouse facilities are open for resident booking.',
    icon: Sparkles,
  },
  members: {
    badge: 'DIRECTORY READY',
    defaultTitle: 'No residents listed',
    defaultDesc: 'Add your society residents to establish the directory and allocate flats.',
    icon: Users,
  },
  classifieds: {
    badge: 'COMMUNITY BOARD',
    defaultTitle: 'No active classifieds',
    defaultDesc: 'Be the first resident to post a neighborhood listing, offer, or carpool.',
    icon: Store,
  },
  search: {
    badge: 'ZERO MATCHES',
    defaultTitle: 'No results found',
    defaultDesc: 'We couldn’t find anything matching your search. Try adjusting keywords.',
    icon: SearchX,
  }
};

/**
 * Enhanced EmptyState Component
 * Displays curated Organic Minimalist illustrations, contextual badges, and smooth entrance.
 */
export const EmptyState = ({
  type = null,
  icon: PropIcon = null,
  title = null,
  description = null,
  actionLabel,
  onAction,
  badge = null,
  className = '',
  style = {}
}) => {
  // Infer preset metadata if available
  const preset = type && PresetMetadata[type] ? PresetMetadata[type] : null;

  const displayTitle = title || (preset ? preset.defaultTitle : 'No records found');
  const displayDescription = description || (preset ? preset.defaultDesc : 'There are currently no items to display in this section.');
  const displayBadge = badge || (preset ? preset.badge : null);

  // If a specific SVG illustration exists for this type, use it; else fallback to Icon
  const IllustrationComponent = type && EmptyIllustrations[type]
    ? EmptyIllustrations[type]
    : (!PropIcon && EmptyIllustrations.default ? EmptyIllustrations.default : null);

  const EffectiveIcon = PropIcon || (preset ? preset.icon : Inbox);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`empty-state-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px',
        background: '#FAF9F6',
        borderRadius: '24px',
        border: '1px dashed #E5E0D8',
        margin: '20px 0',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Optional Contextual Pill Badge */}
      {displayBadge && (
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#8C5E43',
            background: '#F3ECE3',
            padding: '4px 12px',
            borderRadius: '9999px',
            marginBottom: '16px',
            border: '1px solid #E4DACD'
          }}
        >
          {displayBadge}
        </span>
      )}

      {/* Centerpiece: Either Rich Vector Illustration OR Icon Circle */}
      {IllustrationComponent ? (
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ marginBottom: '16px' }}
        >
          <IllustrationComponent />
        </motion.div>
      ) : (
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
          <EffectiveIcon size={28} />
        </div>
      )}

      <h3
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '24px',
          fontWeight: '600',
          color: '#2C2A29',
          margin: '0 0 8px 0',
          lineHeight: 1.25
        }}
      >
        {displayTitle}
      </h3>

      <p
        style={{
          fontSize: '14px',
          color: '#5C5854',
          maxWidth: '440px',
          margin: '0 0 20px 0',
          lineHeight: 1.55,
          fontFamily: "'Outfit', sans-serif"
        }}
      >
        {displayDescription}
      </p>

      {actionLabel && onAction && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          style={{
            background: 'var(--accent-color, #D9734E)',
            color: 'white',
            border: 'none',
            padding: '11px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(217, 115, 78, 0.22)',
            fontFamily: "'Outfit', sans-serif",
            transition: 'background 0.2s'
          }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
