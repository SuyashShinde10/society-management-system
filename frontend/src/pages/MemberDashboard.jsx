import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ShieldAlert, Menu, Search, ChevronDown } from 'lucide-react';
import theme from '../theme';

// Navigation Architecture
import { MEMBER_HUBS } from '../config/navigationHubs';

// Components
import NoticeBoard from '../components/NoticeBoard';
import ComplaintBox from '../components/ComplaintBox';
import ExpenseTracker from '../components/ExpenseTracker';
import MaintenanceBills from '../components/MaintenanceBills';
import DashboardOverview from '../components/DashboardOverview';
import Profile from '../components/Profile';
import Meetings from '../components/Meetings';
import Analytics from '../components/Analytics';
import ResidentChatbot from '../components/ResidentChatbot';
import LocalOffers from '../components/LocalOffers';

// Expansion Components
import ParcelGateLocker from '../components/gate/ParcelGateLocker';
import GuestPassManager from '../components/gate/GuestPassManager';
import StaffDirectory from '../components/gate/StaffDirectory';
import GuardIntercom from '../components/gate/GuardIntercom';
import AmenityBooking from '../components/lifestyle/AmenityBooking';
import CommunityClassifieds from '../components/lifestyle/CommunityClassifieds';
import DigitalAGM from '../components/lifestyle/DigitalAGM';
import WhatsAppSimulator from '../components/omnichannel/WhatsAppSimulator';

// Shared UI Atoms
import AnimatedText from '../components/ui/AnimatedText';
import BackgroundBlobs from '../components/ui/BackgroundBlobs';
import { DashboardPageSkeleton } from '../components/ui/DashboardSkeleton';
import MobileBottomNav from '../components/ui/MobileBottomNav';
import MobileDrawer from '../components/ui/MobileDrawer';
import CommandPalette from '../components/ui/CommandPalette';
import ResidentOnboardingModal from '../components/ui/ResidentOnboardingModal';
import { Sparkles } from 'lucide-react';

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.mustChangePassword ? 'profile' : 'overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('member_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    if (typeof window === 'undefined' || !user?._id) return false;
    return !localStorage.getItem(`awaastech_resident_onboarded_v1_${user._id}`);
  });

  const activeTabItem = MEMBER_HUBS.flatMap(h => h.items).find(i => i.id === activeTab);
  const activeTabLabel = activeTabItem?.label || (activeTab === 'overview' ? 'Overview' : activeTab === 'profile' ? 'Profile' : 'Resident Portal');

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('member_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Dynamic Page Title
  useEffect(() => {
    const soc = (user?.societyName && user?.societyName !== 'UNLINKED' ? user.societyName : '') || user?.societyId?.name || 'Awaastech';
    document.title = `${activeTabLabel} — ${soc} | Awaastech`;
  }, [activeTabLabel, user]);

  // Global ⌘K / Ctrl+K launcher shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!user) {
    return <DashboardPageSkeleton />;
  }

  return (
    <div className="dashboard-container" style={{ backgroundColor: theme.bg, color: theme.textMain, fontFamily: "'Outfit', sans-serif" }}>
      <BackgroundBlobs />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%', gap: '24px' }}>

        {/* --- HEADER --- */}
        <header className="dashboard-header">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
            <div className="dashboard-logo-box shrink-0">
              <img src="/awaastech-logo.png" alt="Logo" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
            </div>
            <div style={{ zIndex: 10, minWidth: 0, flex: 1 }}>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight truncate" style={{ fontFamily: "'Cormorant Garamond', serif", margin: '0 0 4px 0', color: theme.textMain }}>
                <AnimatedText text={(user?.societyName && user?.societyName !== 'UNLINKED' ? user.societyName : '') || user?.societyId?.name || 'Awaastech Society'} />
              </h1>
              
              {/* Interactive Resident Action Pill & Mobile Breadcrumb */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F4F1EA] hover:bg-[#EBE7DC] border border-[#E0DBCF] transition-all cursor-pointer group max-w-full"
                  title="View Profile & Flat Settings"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="text-slate-800 font-semibold truncate max-w-[85px] sm:max-w-none">{user?.name}</span>
                  {user.flatDetails && (
                    <span className="text-slate-500 font-normal shrink-0">
                      • Wing {user.flatDetails.wing}-{user.flatDetails.flatNumber}
                    </span>
                  )}
                  <ChevronDown size={13} className="text-slate-400 group-hover:text-slate-700 transition-colors ml-0.5 shrink-0" />
                </button>

                {/* Mobile Active Tab Breadcrumb */}
                <div className="md:hidden flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D9734E]/10 text-[#D9734E] border border-[#D9734E]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D9734E]"></span>
                    {activeTabLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Resident Guided Tour Launcher */}
            <button
              type="button"
              onClick={() => setOnboardingOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4EFE6] hover:bg-[#EBE5DA] border border-[#E4DACD] text-xs font-semibold text-[#8C5E43] transition-all cursor-pointer shadow-2xs"
              title="Resident Guided Tour"
            >
              <Sparkles size={14} className="text-[#D9734E]" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* Quick Command Launcher Pill */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F4F1EA] hover:bg-[#EBE7DC] border border-[#E0DBCF] text-slate-600 hover:text-slate-900 text-xs font-medium transition-all"
              title="Quick Jump (⌘K / Ctrl+K)"
            >
              <Search size={14} className="text-[#D9734E]" />
              <span>Jump to...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-mono shadow-2xs">
                ⌘K
              </kbd>
            </button>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { logout(); navigate('/'); }}
              className="dashboard-btn-signout"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Sign Out</span>
            </motion.button>
          </div>
        </header>

        {/* --- MAIN LAYOUT --- */}
        <div className="dashboard-layout">
          
          {/* NAVIGATION SIDEBAR (Desktop: 4-Hub Clustered Architecture) */}
          <div className={`sidebar-nav ${sidebarCollapsed ? 'collapsed' : ''} hidden md:flex`}>
            
            {user?.mustChangePassword && (
              <div className="dashboard-password-warning">
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                {!sidebarCollapsed && <span>You must change your generated password to continue accessing other modules.</span>}
              </div>
            )}

            <div className="sidebar-menu">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', padding: sidebarCollapsed ? '0' : '0 8px 6px 10px' }}>
                {!sidebarCollapsed && <span className="dashboard-menu-heading" style={{ margin: 0, padding: 0 }}>Resident Hubs</span>}
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="hide-on-mobile"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.textSec,
                    padding: '4px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.color = theme.accent}
                  onMouseOut={e => e.currentTarget.style.color = theme.textSec}
                  title={sidebarCollapsed ? "Expand sidebar menu" : "Collapse sidebar menu"}
                  aria-label={sidebarCollapsed ? "Expand sidebar menu" : "Collapse sidebar menu"}
                >
                  <Menu size={16} />
                </button>
              </div>

              {/* 4 Categorized Resident Hubs */}
              {MEMBER_HUBS.map((hub) => (
                <div key={hub.category} className="mb-2">
                  {!sidebarCollapsed ? (
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center justify-between">
                      <span>{hub.category}</span>
                      {hub.tag && <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1 rounded">{hub.tag}</span>}
                    </div>
                  ) : (
                    <div className="w-5 h-[1px] bg-slate-200 mx-auto my-2" />
                  )}

                  <div className="space-y-0.5">
                    {hub.items.map((tab) => {
                      const isDisabled = user?.mustChangePassword && tab.id !== 'profile';
                      const isActive = activeTab === tab.id;
                      const Icon = tab.icon;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            if (!isDisabled) {
                              setActiveTab(tab.id);
                              setMobileMenuOpen(false);
                            }
                          }}
                          disabled={isDisabled}
                          className={isActive ? "nav-btn-active" : "nav-btn"}
                          title={tab.label}
                          style={{
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.4 : 1
                          }}
                        >
                          <Icon size={17} color={isActive ? 'white' : theme.textSec} style={{ transition: 'color 0.2s', flexShrink: 0 }} />
                          {!sidebarCollapsed && <span className="truncate">{tab.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTENT PORTAL */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="main-content" style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            
            {activeTab === 'overview' && <DashboardOverview onNavigate={setActiveTab} />}
            {activeTab === 'profile' && <Profile />}
            {activeTab === 'passes' && <div className="dashboard-portal-card flex-1"><GuestPassManager /></div>}
            {activeTab === 'parcels' && <div className="dashboard-portal-card flex-1"><ParcelGateLocker /></div>}
            {activeTab === 'staff' && <div className="dashboard-portal-card flex-1"><StaffDirectory /></div>}
            {activeTab === 'intercom' && <div className="dashboard-portal-card flex-1"><GuardIntercom /></div>}
            {activeTab === 'amenities' && <div className="dashboard-portal-card flex-1"><AmenityBooking /></div>}
            {activeTab === 'classifieds' && <div className="dashboard-portal-card flex-1"><CommunityClassifieds /></div>}
            {activeTab === 'agm' && <div className="dashboard-portal-card flex-1"><DigitalAGM /></div>}
            {activeTab === 'whatsapp' && <div className="dashboard-portal-card flex-1"><WhatsAppSimulator /></div>}
            {activeTab === 'bills' && <div className="dashboard-portal-card flex-1"><MaintenanceBills /></div>}
            {activeTab === 'notices' && <div className="dashboard-portal-card flex-1"><NoticeBoard /></div>}
            {activeTab === 'meetings' && <div className="dashboard-portal-card flex-1"><Meetings /></div>}
            {activeTab === 'complaints' && <div className="dashboard-portal-card flex-1"><ComplaintBox /></div>}
            {activeTab === 'expenses' && <div className="dashboard-portal-card flex-1"><ExpenseTracker /></div>}
            {activeTab === 'offers' && <div className="dashboard-portal-card flex-1"><LocalOffers /></div>}
            {activeTab === 'chatbot' && <div className="dashboard-portal-card flex-1"><ResidentChatbot /></div>}
            {activeTab === 'analytics' && <div className="dashboard-portal-card flex-1"><Analytics /></div>}
          </motion.div>

        </div>
      </div>

      {/* Resident First-Run Guided Tour */}
      <ResidentOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        user={user}
      />

      {/* Global Command Bar (⌘K / Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        role="member"
      />

      {/* Mobile Drawer (4-Hub Categorized Module List) */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        hubs={MEMBER_HUBS}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={() => { logout(); navigate('/'); }}
      />

      {/* Persistent Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        role="member"
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMenu={() => setMobileMenuOpen(true)}
      />
    </div>
  );
};

export default MemberDashboard;
