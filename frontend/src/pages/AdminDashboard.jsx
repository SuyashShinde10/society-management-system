import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, User, Users, Bell, Calendar, ReceiptText, MessageSquareWarning, Wallet, PieChart, LogOut, ShieldAlert, Briefcase, ShieldCheck, MapPin, Cpu, Palette, Package, Landmark, Leaf, Sparkles, Vote, MessageCircle, Menu, X } from 'lucide-react';
import theme from '../theme';

// Components
import NoticeBoard from '../components/NoticeBoard';
import ComplaintBox from '../components/ComplaintBox';
import ExpenseTracker from '../components/ExpenseTracker';
import UserList from '../components/UserList';
import AddMember from '../components/AddMember';
import MaintenanceBills from '../components/MaintenanceBills';
import DashboardOverview from '../components/DashboardOverview';
import Profile from '../components/Profile';
import Meetings from '../components/Meetings';
import Analytics from '../components/Analytics';
import VisitorLogs from '../components/VisitorLogs';
import SecurityStaff from '../components/SecurityStaff';
import VendorProjects from '../components/VendorProjects';
import EscrowLedger from '../components/EscrowLedger';
import SmartParking from '../components/SmartParking';
import EmergencyProtocol from '../components/EmergencyProtocol';
import IoTMetering from '../components/IoTMetering';
import ThemeSettings from '../components/ThemeSettings';

// New Expansion Components
import ParcelGateLocker from '../components/gate/ParcelGateLocker';
import StaffDirectory from '../components/gate/StaffDirectory';
import AmenityBooking from '../components/lifestyle/AmenityBooking';
import DigitalAGM from '../components/lifestyle/DigitalAGM';
import AccountingCenter from '../components/finance/AccountingCenter';
import GreenSustainability from '../components/sustainability/GreenSustainability';
import WhatsAppSimulator from '../components/omnichannel/WhatsAppSimulator';

// Shared UI Atoms
import AnimatedText from '../components/ui/AnimatedText';
import BackgroundBlobs from '../components/ui/BackgroundBlobs';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.mustChangePassword ? 'profile' : 'overview');
  const [registryRefresh, setRegistryRefresh] = useState(0);
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
    { id: 'registry', label: 'Member Registry', icon: Users },
    { id: 'notices', label: 'Notice Board', icon: Bell },
    { id: 'meetings', label: 'Global Meetings', icon: Calendar },
    { id: 'bills', label: 'Billing System', icon: ReceiptText },
    { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
    { id: 'parcels', label: 'Parcel Gate Locker', icon: Package },
    { id: 'staff-dir', label: 'Domestic Staff Directory', icon: Users },
    { id: 'amenities', label: 'Facility Bookings', icon: Sparkles },
    { id: 'agm', label: 'Digital AGM & Voting', icon: Vote },
    { id: 'accounting', label: 'Tally & Accounting', icon: Landmark },
    { id: 'sustainability', label: 'Green Sustainability', icon: Leaf },
    { id: 'whatsapp', label: 'WhatsApp Bot Simulator', icon: MessageCircle },
    { id: 'theme', label: 'White-Label Theme', icon: Palette },
    { id: 'analytics', label: 'Analytics Reports', icon: PieChart },
  ];

  return (
    <div className="dashboard-container" style={{ backgroundColor: theme.bg, color: theme.textMain, fontFamily: "'Outfit', sans-serif" }}>
      <BackgroundBlobs />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%', gap: '30px' }}>

        {/* --- HEADER --- */}
        <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
          className="dashboard-header">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="dashboard-logo-box">
              <img src="/awaastech-logo.png" alt="Logo" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
            </div>
            <div style={{ zIndex: 10 }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", margin: '0 0 4px 0', fontSize: '32px', fontWeight: '600', color: theme.textMain, lineHeight: 1 }}>
                <AnimatedText text={user.societyName || 'Awaastech Administration'} />
              </h1>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '400', color: theme.textSec }}>
                Welcome back, <span style={{ color: theme.accent, fontWeight: '600' }}>{user.name}</span> (Administrator)
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
        </motion.header>

        {/* --- MAIN LAYOUT --- */}
        <div className="dashboard-layout">
          
          {/* NAVIGATION SIDEBAR */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
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
          </motion.div>

          {/* CONTENT PORTAL */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="main-content" style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            
            {activeTab === 'overview' && <DashboardOverview onNavigate={setActiveTab} />}
            {activeTab === 'profile' && <Profile />}
            
            {activeTab === 'registry' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="dashboard-portal-card">
                  <h2 className="dashboard-title-h2">Onboard New Resident</h2>
                  <AddMember onAdd={() => setRegistryRefresh(prev => prev + 1)} />
                </div>
                <div className="dashboard-portal-card">
                  <h2 className="dashboard-title-h2">Registry Database</h2>
                  <UserList refreshTrigger={registryRefresh} />
                </div>
              </div>
            )}

            {activeTab === 'notices' && <div className="dashboard-portal-card flex-1"><NoticeBoard /></div>}
            {activeTab === 'meetings' && <div className="dashboard-portal-card flex-1"><Meetings /></div>}
            {activeTab === 'bills' && <div className="dashboard-portal-card flex-1"><MaintenanceBills /></div>}
            {activeTab === 'complaints' && <div className="dashboard-portal-card flex-1"><ComplaintBox /></div>}
            {activeTab === 'visitors' && <div className="dashboard-portal-card flex-1"><VisitorLogs /></div>}
            {activeTab === 'security-staff' && <div style={{ flex: 1 }}><SecurityStaff /></div>}
            {activeTab === 'expenses' && <div className="dashboard-portal-card flex-1"><ExpenseTracker /></div>}
            {activeTab === 'vendors' && <div className="dashboard-portal-card flex-1"><VendorProjects /></div>}
            {activeTab === 'escrow' && <div className="dashboard-portal-card flex-1"><EscrowLedger /></div>}
            {activeTab === 'parking' && <div className="dashboard-portal-card flex-1"><SmartParking /></div>}
            {activeTab === 'emergency' && <div className="dashboard-portal-card flex-1"><EmergencyProtocol /></div>}
            {activeTab === 'iot' && <div className="dashboard-portal-card flex-1"><IoTMetering /></div>}
            {activeTab === 'theme' && <div className="dashboard-portal-card flex-1"><ThemeSettings /></div>}
            {activeTab === 'analytics' && <div className="dashboard-portal-card flex-1"><Analytics /></div>}
            {activeTab === 'parcels' && <div className="dashboard-portal-card flex-1"><ParcelGateLocker /></div>}
            {activeTab === 'staff-dir' && <div className="dashboard-portal-card flex-1"><StaffDirectory /></div>}
            {activeTab === 'amenities' && <div className="dashboard-portal-card flex-1"><AmenityBooking /></div>}
            {activeTab === 'agm' && <div className="dashboard-portal-card flex-1"><DigitalAGM /></div>}
            {activeTab === 'accounting' && <div className="dashboard-portal-card flex-1"><AccountingCenter /></div>}
            {activeTab === 'sustainability' && <div className="dashboard-portal-card flex-1"><GreenSustainability /></div>}
            {activeTab === 'whatsapp' && <div className="dashboard-portal-card flex-1"><WhatsAppSimulator /></div>}

            
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;