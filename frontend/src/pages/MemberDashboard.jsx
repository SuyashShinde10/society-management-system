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

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.mustChangePassword ? 'profile' : 'overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", backgroundColor: theme.bg }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '40px', height: '40px', border: `3px solid ${theme.border}`, borderTopColor: theme.accent, borderRadius: '50%' }} />
      </div>
    );
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="dashboard-logo-box">
              <img src="/awaastech-logo.png" alt="Logo" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
            </div>
            <div style={{ zIndex: 10 }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", margin: '0 0 4px 0', fontSize: '32px', fontWeight: '600', color: theme.textMain, lineHeight: 1 }}>
                <AnimatedText text={user.societyName || 'Awaastech Society'} />
              </h1>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '400', color: theme.textSec }}>
                Welcome back, <span style={{ color: theme.accent, fontWeight: '600' }}>{user.name}</span>
                {user.flatDetails && (
                  <span style={{ marginLeft: '10px', fontSize: '13px', background: '#F9F8F3', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
                    Wing {user.flatDetails.wing} • Flat {user.flatDetails.flatNumber}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              style={{
                background: '#F9F8F3',
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.textMain
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { logout(); navigate('/'); }}
              className="dashboard-btn-signout"
            >
              <LogOut size={16} /> Sign Out
            </motion.button>
          </div>
        </header>

        {/* --- MAIN LAYOUT --- */}
        <div className="dashboard-layout">
          
          {/* NAVIGATION SIDEBAR */}
          <div
            className={`sidebar-nav ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
            
            {user?.mustChangePassword && (
              <div className="dashboard-password-warning">
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>You must change your generated password to continue accessing other modules.</span>
              </div>
            )}

            <div className="sidebar-menu">
              <span className="dashboard-menu-heading">Menu</span>
              
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
                    style={{
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.4 : 1
                    }}
                  >
                    <Icon size={18} color={isActive ? 'white' : theme.textSec} style={{ transition: 'color 0.2s' }} />
                    {tab.label}
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
    </div>
  );
};

export default MemberDashboard;
