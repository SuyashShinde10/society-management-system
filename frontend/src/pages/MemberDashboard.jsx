import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, User, Bell, Calendar, ReceiptText, MessageSquareWarning, Wallet, PieChart, LogOut, ShieldAlert, Bot, Tag, Package, QrCode, Users, Radio, Sparkles, Vote, MessageCircle, Menu, X } from 'lucide-react';
import theme from '../theme';

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

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.mustChangePassword ? 'profile' : 'overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) {
    return <DashboardPageSkeleton />;
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'parcels', label: 'Gate Parcels', icon: Package },
    { id: 'passes', label: 'Guest Passes', icon: QrCode },
    { id: 'staff', label: 'Domestic Staff', icon: Users },
    { id: 'intercom', label: 'Guard Intercom', icon: Radio },
    { id: 'amenities', label: 'Facility Bookings', icon: Sparkles },
    { id: 'classifieds', label: 'Classifieds & Carpool', icon: Tag },
    { id: 'agm', label: 'Digital AGM Voting', icon: Vote },
    { id: 'whatsapp', label: 'WhatsApp Bot', icon: MessageCircle },
    { id: 'bills', label: 'My Bills', icon: ReceiptText },
    { id: 'notices', label: 'Notice Board', icon: Bell },
    { id: 'meetings', label: 'Global Meetings', icon: Calendar },
    { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
    { id: 'expenses', label: 'Society Expenses', icon: Wallet },
    { id: 'offers', label: 'Local Offers', icon: Tag },
    { id: 'chatbot', label: 'AI Assistant', icon: Bot },
    { id: 'analytics', label: 'Analytics Reports', icon: PieChart },
  ];

  return (
    <div className="dashboard-container" style={{ backgroundColor: theme.bg, color: theme.textMain, fontFamily: "'Outfit', sans-serif" }}>
      <BackgroundBlobs />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%', gap: '30px' }}>

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
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm" style={{ color: theme.textSec }}>
                <span>Welcome back, <strong style={{ color: theme.accent, fontWeight: '600' }}>{user?.name}</strong></span>
                {user.flatDetails && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium" style={{ background: '#F9F8F3', border: `1px solid ${theme.border}` }}>
                    Wing {user.flatDetails.wing} • Flat {user.flatDetails.flatNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
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
          
          {/* NAVIGATION SIDEBAR (Desktop) */}
          <div
            className={`sidebar-nav ${sidebarCollapsed ? 'collapsed' : ''} hidden md:flex`}>
            
            {user?.mustChangePassword && (
              <div className="dashboard-password-warning">
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                {!sidebarCollapsed && <span>You must change your generated password to continue accessing other modules.</span>}
              </div>
            )}

            <div className="sidebar-menu">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', padding: sidebarCollapsed ? '0' : '0 8px 4px 10px' }}>
                {!sidebarCollapsed && <span className="dashboard-menu-heading" style={{ margin: 0, padding: 0 }}>Menu</span>}
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(prev => !prev)}
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
              
              {navItems.map((tab) => {
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
                    <Icon size={18} color={isActive ? 'white' : theme.textSec} style={{ transition: 'color 0.2s', flexShrink: 0 }} />
                    {!sidebarCollapsed && <span>{tab.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTENT PORTAL */}
          <div
            className="main-content" style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            
            {activeTab === 'overview' && <DashboardOverview onNavigate={setActiveTab} />}
            {activeTab === 'profile' && <Profile />}
            {activeTab === 'parcels' && <div className="dashboard-portal-card flex-1"><ParcelGateLocker /></div>}
            {activeTab === 'passes' && <div className="dashboard-portal-card flex-1"><GuestPassManager /></div>}
            {activeTab === 'staff' && <div className="dashboard-portal-card flex-1"><StaffDirectory /></div>}
            {activeTab === 'intercom' && <div className="dashboard-portal-card flex-1"><GuardIntercom /></div>}
            {activeTab === 'amenities' && <div className="dashboard-portal-card flex-1"><AmenityBooking /></div>}
            {activeTab === 'classifieds' && <div className="dashboard-portal-card flex-1"><CommunityClassifieds /></div>}
            {activeTab === 'agm' && <div className="dashboard-portal-card flex-1"><DigitalAGM /></div>}
            {activeTab === 'whatsapp' && <div className="dashboard-portal-card flex-1"><WhatsAppSimulator /></div>}
            {activeTab === 'notices' && <div className="dashboard-portal-card flex-1"><NoticeBoard /></div>}
            {activeTab === 'meetings' && <div className="dashboard-portal-card flex-1"><Meetings /></div>}
            {activeTab === 'bills' && <div className="dashboard-portal-card flex-1"><MaintenanceBills /></div>}
            {activeTab === 'complaints' && <div className="dashboard-portal-card flex-1"><ComplaintBox /></div>}
            {activeTab === 'expenses' && <div className="dashboard-portal-card flex-1"><ExpenseTracker /></div>}
            {activeTab === 'offers' && <div className="dashboard-portal-card flex-1"><LocalOffers /></div>}
            {activeTab === 'chatbot' && <div className="dashboard-portal-card flex-1"><ResidentChatbot /></div>}
            {activeTab === 'analytics' && <div className="dashboard-portal-card flex-1"><Analytics /></div>}
          </div>

        </div>
      </div>

      {/* Mobile Drawer (Full Categorized Module List) */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        navItems={navItems}
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
