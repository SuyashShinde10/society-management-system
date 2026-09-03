import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, User, Bell, Calendar, ReceiptText, MessageSquareWarning, Wallet, PieChart, LogOut, ShieldAlert, Bot, Tag } from 'lucide-react';
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

// --- DOODLES & ANIMATIONS ---
const SparkleDoodle = () => (
  <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: '-10px', left: '-15px' }}>
    <motion.path d="M15 0L17 12L30 15L17 17L15 30L12 17L0 15L12 12L15 0Z" fill="#D9734E" 
      initial={{ scale: 0, rotate: 45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, delay: 0.5 }} />
  </svg>
);

const AnimatedText = ({ text }) => {
  const words = text.split(" ");
  return (
    <motion.span initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }} style={{ display: "inline-flex", flexWrap: "wrap", position: 'relative' }}>
      <SparkleDoodle />
      {words.map((word, index) => (
        <motion.span key={index} variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 100 } } }} style={{ marginRight: "6px" }}>
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

const BackgroundBlobs = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
    <motion.div animate={{ rotate: -360 }} transition={{ duration: 65, repeat: Infinity, ease: "linear" }}
      style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(107,112,92,0.04) 0%, rgba(249,248,243,0) 70%)', borderRadius: '50%' }} />
  </div>
);

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.mustChangePassword ? 'profile' : 'overview');

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
    { id: 'notices', label: 'Notice Board', icon: Bell },
    { id: 'meetings', label: 'Global Meetings', icon: Calendar },
    { id: 'bills', label: 'My Bills', icon: ReceiptText },
    { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
    { id: 'expenses', label: 'Society Expenses', icon: Wallet },
    { id: 'offers', label: 'Local Offers', icon: Tag },
    { id: 'chatbot', label: 'AI Assistant', icon: Bot },
    { id: 'analytics', label: 'Analytics Reports', icon: PieChart },
  ];

  return (
    <div className="dashboard-container" style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '30px', color: theme.textMain, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: "'Outfit', sans-serif" }}>
      <BackgroundBlobs />
      <style>
        {`
          @media (max-width: 900px) {
            .dashboard-header { flex-direction: column !important; align-items: flex-start !important; gap: 20px; padding: 25px !important; }
            .dashboard-layout { flex-direction: column !important; gap: 20px !important; }
            .sidebar-nav { width: 100% !important; padding: 20px !important; }
            .sidebar-menu { flex-direction: row !important; flex-wrap: wrap; gap: 10px !important; }
            .sidebar-menu button { flex: 1 1 calc(50% - 10px); justify-content: center; padding: 12px !important; font-size: 13px !important; }
            .main-content { padding-left: 0 !important; }
            .dashboard-container { padding: 15px !important; }
          }
          .nav-btn:hover { background-color: #F9F8F3 !important; transform: translateY(-2px); }
          .nav-btn-active:hover { transform: translateY(-2px); }
        `}
      </style>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%', gap: '30px' }}>

        {/* --- HEADER --- */}
        <header
          className="dashboard-header" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'white', padding: '30px 40px', borderRadius: '24px',
            border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '50px', height: '50px', background: '#F9F8F3', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
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

          <motion.button whileHover={{ scale: 1.02, backgroundColor: '#F9F8F3' }} whileTap={{ scale: 0.98 }}
            onClick={() => { logout(); navigate('/'); }}
            style={{
              background: 'white', color: theme.textMain, border: `1px solid ${theme.border}`, borderRadius: '12px',
              padding: '12px 20px', fontFamily: "'Outfit', sans-serif", fontWeight: '500', fontSize: '14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={16} /> Sign Out
          </motion.button>
        </header>

        {/* --- MAIN LAYOUT --- */}
        <div className="dashboard-layout" style={{ display: 'flex', flex: 1, minHeight: 0, gap: '30px' }}>
          
          {/* NAVIGATION SIDEBAR */}
          <div
            className="sidebar-nav" style={{
            width: '280px', background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`,
            padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)', height: 'fit-content'
          }}>
            
            {user?.mustChangePassword && (
              <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '15px', borderRadius: '12px', fontSize: '13px', fontWeight: '500', display: 'flex', gap: '10px', alignItems: 'flex-start', border: '1px solid #FEE2E2', marginBottom: '10px' }}>
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>You must change your generated password to continue accessing other modules.</span>
              </div>
            )}

            <div className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '10px' }}>Menu</span>
              
              {navItems.map((tab) => {
                const isDisabled = user?.mustChangePassword && tab.id !== 'profile';
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    disabled={isDisabled}
                    className={isActive ? "nav-btn-active" : "nav-btn"}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                      background: isActive ? theme.accent : 'transparent',
                      color: isActive ? 'white' : theme.textMain,
                      border: 'none', borderRadius: '14px',
                      fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: isActive ? '600' : '500',
                      cursor: isDisabled ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                      opacity: isDisabled ? 0.4 : 1,
                      boxShadow: isActive ? '0 4px 12px rgba(217,115,78,0.2)' : 'none'
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
            {activeTab === 'notices' && <div className="p-5 md:p-[40px]" style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', flex: 1 }}><NoticeBoard /></div>}
            {activeTab === 'meetings' && <div className="p-5 md:p-[40px]" style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', flex: 1 }}><Meetings /></div>}
            {activeTab === 'bills' && <div className="p-5 md:p-[40px]" style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', flex: 1 }}><MaintenanceBills /></div>}
            {activeTab === 'complaints' && <div className="p-5 md:p-[40px]" style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', flex: 1 }}><ComplaintBox /></div>}
            {activeTab === 'expenses' && <div className="p-5 md:p-[40px]" style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', flex: 1 }}><ExpenseTracker /></div>}
            {activeTab === 'offers' && <div className="p-5 md:p-[40px]" style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', flex: 1 }}><LocalOffers /></div>}
            {activeTab === 'chatbot' && <div className="p-5 md:p-[40px]" style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', flex: 1 }}><ResidentChatbot /></div>}
            {activeTab === 'analytics' && <div className="p-5 md:p-[40px]" style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', flex: 1 }}><Analytics /></div>}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
