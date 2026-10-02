import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { motion } from 'framer-motion';
import {
  Bell,
  AlertCircle,
  Users,
  UserMinus,
  Receipt,
  Wallet,
  Activity,
  QrCode,
  Package,
  Wrench,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
  Car,
  Home,
  Clock,
  CreditCard,
  CheckCircle2,
  Bot,
  ExternalLink
} from 'lucide-react';
import { OverviewSkeleton } from './ui/DashboardSkeleton';

const DashboardOverview = ({ onNavigate }) => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    notices: 0,
    complaints: 0,
    expenses: 0,
    bills: 0,
    totalBillsAmount: 0,
    parcels: 0,
    totalMembers: 0,
    pastMembers: 0
  });

  const [recentNotices, setRecentNotices] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentParcels, setRecentParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        const [
          noticesRes,
          complaintsRes,
          billsRes,
          expensesRes,
          parcelsRes,
          analyticsRes
        ] = await Promise.allSettled([
          api.get('/notices'),
          api.get('/complaints'),
          api.get('/bills'),
          api.get('/expenses'),
          api.get('/parcels'),
          user?.role === 'admin' ? api.get('/analytics') : Promise.resolve({ data: {} })
        ]);

        if (!isMounted) return;

        const noticesData = noticesRes.status === 'fulfilled' ? (noticesRes.value.data || []) : [];
        const complaintsRaw = complaintsRes.status === 'fulfilled' ? complaintsRes.value.data : [];
        const complaintsData = Array.isArray(complaintsRaw) ? complaintsRaw : (complaintsRaw.complaints || []);
        const billsData = billsRes.status === 'fulfilled' ? (billsRes.value.data || []) : [];
        const expensesData = expensesRes.status === 'fulfilled' ? (expensesRes.value.data || []) : [];
        const parcelsData = parcelsRes.status === 'fulfilled' ? (parcelsRes.value.data || []) : [];
        const analyticsData = analyticsRes.status === 'fulfilled' ? (analyticsRes.value.data || {}) : {};

        const pendingBills = billsData.filter(b => !b.isPaid);
        const totalPendingAmount = pendingBills.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const pendingComplaints = complaintsData.filter(c => c.status === 'Pending' || c.status === 'In Progress');
        const awaitingParcels = parcelsData.filter(p => p.status !== 'Claimed');
        const totalExpenseSum = expensesData.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

        setStats({
          notices: noticesData.length,
          complaints: pendingComplaints.length,
          expenses: totalExpenseSum,
          bills: pendingBills.length,
          totalBillsAmount: totalPendingAmount,
          parcels: awaitingParcels.length,
          totalMembers: analyticsData.totalMembers || 0,
          pastMembers: analyticsData.pastMembers || 0
        });

        setRecentNotices(noticesData.slice(0, 3));
        setRecentComplaints(complaintsData.slice(0, 3));
        setRecentParcels(awaitingParcels.slice(0, 3));
      } catch (error) {
        console.error('// DASHBOARD_FETCH_ERROR', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();

    const interval = setInterval(fetchAllData, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  if (loading) {
    return <OverviewSkeleton isAdmin={user?.role === 'admin'} />;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  const quickActions = [
    {
      id: 'passes',
      title: 'Guest Pass',
      desc: 'Instant QR code for visitor entry',
      icon: QrCode,
      color: '#4F46E5',
      bgColor: '#EEF2FF'
    },
    {
      id: 'bills',
      title: 'Pay Bills',
      desc: stats.bills > 0 ? `${stats.bills} pending dues (₹${stats.totalBillsAmount.toLocaleString()})` : 'All society dues settled',
      icon: CreditCard,
      color: stats.bills > 0 ? '#DC2626' : '#16A34A',
      bgColor: stats.bills > 0 ? '#FEF2F2' : '#F0FDF4'
    },
    {
      id: 'parcels',
      title: 'Gate Parcels',
      desc: stats.parcels > 0 ? `${stats.parcels} package(s) at main gate` : 'Locker & courier check',
      icon: Package,
      color: '#D97706',
      bgColor: '#FFFBEB'
    },
    {
      id: 'complaints',
      title: 'Raise Ticket',
      desc: 'Plumbing, electrical, or lift issues',
      icon: Wrench,
      color: '#0284C7',
      bgColor: '#F0F9FF'
    },
    {
      id: 'amenities',
      title: 'Book Amenity',
      desc: 'Clubhouse, pool, or gym slots',
      icon: Sparkles,
      color: '#9333EA',
      bgColor: '#FAF5FF'
    },
    {
      id: 'intercom',
      title: 'Guard Intercom',
      desc: 'Direct line to gate security',
      icon: PhoneCall,
      color: '#0D9488',
      bgColor: '#F0FDFA'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* ── 1. WELCOME BANNER ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
          borderRadius: '24px',
          border: `1px solid ${theme.border}`,
          padding: '24px 30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.accent }}>
              {getTimeGreeting()}
            </span>
            <span style={{ color: theme.border }}>•</span>
            <span style={{ fontSize: '13px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
              <ShieldCheck size={14} color="#16A34A" /> Resident Portal Active
            </span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: '600', color: theme.textMain, margin: 0, lineHeight: 1.15 }}>
            {user?.name || 'Resident'}
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: theme.textSec }}>
            Welcome to {(user?.societyName && user?.societyName !== 'UNLINKED' ? user.societyName : '') || user?.societyId?.name || 'Greenland Residency'}. Everything you need to manage your residence in one place.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {user?.flatDetails && (
            <div style={{ background: '#F8FAFC', padding: '10px 16px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Home size={16} color={theme.accent} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textMain }}>
                Wing {user.flatDetails.wing} • Unit {user.flatDetails.flatNumber}
              </span>
            </div>
          )}
          {user?.parkingSlot && (
            <div style={{ background: '#F8FAFC', padding: '10px 16px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Car size={16} color="#4F46E5" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textMain }}>
                Parking: {user.parkingSlot}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── 2. METRICS ROW ─────────────────────────────────────────────────── */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}
      >
        {/* Active Notices */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.04)' }}
          onClick={() => onNavigate && onNavigate('notices')}
          style={{ background: 'white', borderRadius: '20px', padding: '20px', border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: theme.textSec }}>Active Notices</span>
            <div style={{ background: '#F9F8F3', padding: '8px', borderRadius: '10px' }}>
              <Bell size={18} color={theme.accent} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: '600', color: theme.textMain, lineHeight: 1 }}>{stats.notices}</span>
            <span style={{ fontSize: '12px', color: theme.accent, fontWeight: '500' }}>Bulletins →</span>
          </div>
        </motion.div>

        {/* Pending Incidents */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.04)' }}
          onClick={() => onNavigate && onNavigate('complaints')}
          style={{ background: stats.complaints > 0 ? '#FEF2F2' : 'white', borderRadius: '20px', padding: '20px', border: `1px solid ${stats.complaints > 0 ? '#FEE2E2' : theme.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: stats.complaints > 0 ? '#B91C1C' : theme.textSec }}>Pending Issues</span>
            <div style={{ background: stats.complaints > 0 ? '#FEE2E2' : '#F9F8F3', padding: '8px', borderRadius: '10px' }}>
              <AlertCircle size={18} color={stats.complaints > 0 ? '#DC2626' : theme.textMain} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: '600', color: stats.complaints > 0 ? '#991B1B' : theme.textMain, lineHeight: 1 }}>{stats.complaints}</span>
            <span style={{ fontSize: '12px', color: stats.complaints > 0 ? '#DC2626' : theme.textSec, fontWeight: '500' }}>Tickets →</span>
          </div>
        </motion.div>

        {/* Pending Dues */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.04)' }}
          onClick={() => onNavigate && onNavigate('bills')}
          style={{ background: stats.bills > 0 ? '#FEF2F2' : 'white', borderRadius: '20px', padding: '20px', border: `1px solid ${stats.bills > 0 ? '#FEE2E2' : theme.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: stats.bills > 0 ? '#B91C1C' : theme.textSec }}>
              {user?.role === 'admin' ? 'Pending Dues' : 'My Pending Bills'}
            </span>
            <div style={{ background: stats.bills > 0 ? '#FEE2E2' : '#F9F8F3', padding: '8px', borderRadius: '10px' }}>
              <Receipt size={18} color={stats.bills > 0 ? '#DC2626' : theme.accent} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: '600', color: stats.bills > 0 ? '#991B1B' : theme.textMain, lineHeight: 1 }}>{stats.bills}</span>
            <span style={{ fontSize: '12px', color: stats.bills > 0 ? '#DC2626' : '#16A34A', fontWeight: '600' }}>
              {stats.bills > 0 ? `₹${stats.totalBillsAmount.toLocaleString()}` : 'Settled'}
            </span>
          </div>
        </motion.div>

        {/* Gate Deliveries */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.04)' }}
          onClick={() => onNavigate && onNavigate('parcels')}
          style={{ background: 'white', borderRadius: '20px', padding: '20px', border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: theme.textSec }}>Gate Deliveries</span>
            <div style={{ background: '#FFFBEB', padding: '8px', borderRadius: '10px' }}>
              <Package size={18} color="#D97706" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: '600', color: theme.textMain, lineHeight: 1 }}>{stats.parcels}</span>
            <span style={{ fontSize: '12px', color: '#D97706', fontWeight: '500' }}>Awaiting Pickup →</span>
          </div>
        </motion.div>

        {/* Admin only stats */}
        {user?.role === 'admin' && (
          <>
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.04)' }}
              onClick={() => onNavigate && onNavigate('registry')}
              style={{ background: 'white', borderRadius: '20px', padding: '20px', border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.2s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: theme.textSec }}>Total Members</span>
                <div style={{ background: '#F9F8F3', padding: '8px', borderRadius: '10px' }}>
                  <Users size={18} color={theme.accent} />
                </div>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: '600', color: theme.textMain, lineHeight: 1 }}>{stats.totalMembers}</div>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.04)' }}
              onClick={() => onNavigate && onNavigate('registry')}
              style={{ background: 'white', borderRadius: '20px', padding: '20px', border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.2s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: theme.textSec }}>Past Members</span>
                <div style={{ background: '#F9F8F3', padding: '8px', borderRadius: '10px' }}>
                  <UserMinus size={18} color={theme.textMain} />
                </div>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: '600', color: theme.textMain, lineHeight: 1 }}>{stats.pastMembers}</div>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* ── 3. QUICK ACTIONS HUB ────────────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: '600', color: theme.textMain }}>
            Quick Resident Actions
          </h3>
          <span style={{ fontSize: '13px', color: theme.textSec }}>One-click shortcuts</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {quickActions.map(action => {
            const ActionIcon = action.icon;
            return (
              <motion.div
                key={action.id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate && onNavigate(action.id)}
                style={{
                  background: 'white',
                  borderRadius: '18px',
                  padding: '18px',
                  border: `1px solid ${theme.border}`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  transition: 'border-color 0.2s'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: action.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ActionIcon size={20} color={action.color} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: theme.textMain, marginBottom: '2px' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.textSec, lineHeight: '1.4' }}>
                    {action.desc}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── 4. TWO-COLUMN DASHBOARD FEEDS ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* LEFT COLUMN: ACTIVITY & ANNOUNCEMENTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* NOTICE BOARD SNIPPET */}
          <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: `1px solid #F1F5F9` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#FFF8F0', padding: '8px', borderRadius: '10px' }}>
                  <Bell size={18} color={theme.accent} />
                </div>
                <h4 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: '600', color: theme.textMain }}>
                  Recent Notices & Bulletins
                </h4>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('notices')}
                style={{ background: 'none', border: 'none', color: theme.accent, fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            {recentNotices.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: theme.textSec, fontSize: '14px', background: '#FAF9F6', borderRadius: '16px' }}>
                No active announcements right now. All caught up!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentNotices.map((notice, idx) => (
                  <div
                    key={notice._id || idx}
                    onClick={() => onNavigate && onNavigate('notices')}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = '#FFFDF9'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.accent, background: '#FFF0E5', padding: '2px 8px', borderRadius: '6px' }}>
                        {notice.category || 'Announcement'}
                      </span>
                      <span style={{ fontSize: '11px', color: theme.textSec }}>
                        {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textMain }}>
                      {notice.title}
                    </div>
                    {notice.content && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: theme.textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notice.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT GATE PARCELS */}
          <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: `1px solid #F1F5F9` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#FFFBEB', padding: '8px', borderRadius: '10px' }}>
                  <Package size={18} color="#D97706" />
                </div>
                <h4 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: '600', color: theme.textMain }}>
                  Deliveries Awaiting Pickup
                </h4>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('parcels')}
                style={{ background: 'none', border: 'none', color: '#D97706', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Locker <ArrowRight size={14} />
              </button>
            </div>

            {recentParcels.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: theme.textSec, fontSize: '14px', background: '#FAF9F6', borderRadius: '16px' }}>
                No packages currently waiting at the security gate.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentParcels.map((parcel, idx) => (
                  <div
                    key={parcel._id || idx}
                    onClick={() => onNavigate && onNavigate('parcels')}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      background: '#FFFDF5',
                      border: '1px solid #FEF3C7',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textMain }}>
                        {parcel.carrier || 'Courier Delivery'}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.textSec }}>
                        Logged {parcel.createdAt ? new Date(parcel.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', background: '#FDE68A', color: '#92400E', padding: '4px 10px', borderRadius: '20px' }}>
                      At Gate
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVE SERVICE TICKETS */}
          <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: `1px solid #F1F5F9` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#F0F9FF', padding: '8px', borderRadius: '10px' }}>
                  <Wrench size={18} color="#0284C7" />
                </div>
                <h4 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: '600', color: theme.textMain }}>
                  Recent Complaints & Tickets
                </h4>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('complaints')}
                style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Complaints <ArrowRight size={14} />
              </button>
            </div>

            {recentComplaints.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: theme.textSec, fontSize: '14px', background: '#FAF9F6', borderRadius: '16px' }}>
                No recent complaints filed for your unit.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentComplaints.map((ticket, idx) => (
                  <div
                    key={ticket._id || idx}
                    onClick={() => onNavigate && onNavigate('complaints')}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textMain }}>
                        {ticket.title}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.textSec }}>
                        {ticket.category || 'General Maintenance'}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: ticket.status === 'Resolved' ? '#DCFCE7' : ticket.status === 'In Progress' ? '#DBEAFE' : '#FEF3C7',
                      color: ticket.status === 'Resolved' ? '#166534' : ticket.status === 'In Progress' ? '#1E40AF' : '#92400E'
                    }}>
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: UTILITY PASSPORT, FINANCIAL HEALTH, EMERGENCY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* RESIDENT UNIT PASSPORT */}
          <div style={{ background: '#FAF8F5', borderRadius: '24px', border: `1px solid ${theme.border}`, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.accent }}>
                Resident Unit Profile
              </span>
              <button
                onClick={() => onNavigate && onNavigate('profile')}
                style={{ background: 'none', border: 'none', color: theme.textMain, fontSize: '12px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Manage Profile
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ background: 'white', padding: '14px', borderRadius: '14px', border: `1px solid #EAE6DC` }}>
                <span style={{ fontSize: '11px', color: theme.textSec, display: 'block', marginBottom: '4px' }}>Flat Details</span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: theme.textMain }}>
                  {user?.flatDetails?.wing && user?.flatDetails?.flatNumber
                    ? `Wing ${user.flatDetails.wing} • Unit ${user.flatDetails.flatNumber}`
                    : (user?.flatDetails?.flatNumber ? `Unit ${user.flatDetails.flatNumber}` : 'Not Assigned')}
                </span>
              </div>
              <div style={{ background: 'white', padding: '14px', borderRadius: '14px', border: `1px solid #EAE6DC` }}>
                <span style={{ fontSize: '11px', color: theme.textSec, display: 'block', marginBottom: '4px' }}>Tenure Type</span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: theme.textMain }}>
                  {user?.flatDetails?.residentType || 'Resident'}
                </span>
              </div>
              <div style={{ background: 'white', padding: '14px', borderRadius: '14px', border: `1px solid #EAE6DC` }}>
                <span style={{ fontSize: '11px', color: theme.textSec, display: 'block', marginBottom: '4px' }}>Allocated Parking</span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: user?.parkingSlot ? theme.textMain : theme.textSec }}>
                  {user?.parkingSlot || 'Not Allocated'}
                </span>
              </div>
              <div style={{ background: 'white', padding: '14px', borderRadius: '14px', border: `1px solid #EAE6DC` }}>
                <span style={{ fontSize: '11px', color: theme.textSec, display: 'block', marginBottom: '4px' }}>Registered Vehicle</span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: user?.vehicleNumber ? theme.textMain : theme.textSec }}>
                  {user?.vehicleNumber || 'Not Registered'}
                </span>
              </div>
            </div>
          </div>

          {/* SOCIETY FINANCIAL TRANSPARENCY (LEDGER PREVIEW) */}
          <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#F9F8F3', padding: '6px', borderRadius: '8px' }}>
                  <Wallet size={16} color={theme.accent} />
                </div>
                <h4 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: '600', color: theme.textMain }}>
                  Society Financial Health
                </h4>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '600', background: '#F0FDF4', color: '#166534', padding: '2px 8px', borderRadius: '6px' }}>
                Transparent
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #E2E8F0' }}>
              <span style={{ fontSize: '13px', color: theme.textSec }}>Total Operational Outflow</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: '700', color: theme.textMain }}>
                ₹{stats.expenses.toLocaleString()}
              </span>
            </div>

            <p style={{ fontSize: '12.5px', color: theme.textSec, lineHeight: '1.45', margin: '12px 0 16px 0' }}>
              All residents have transparent real-time visibility into maintenance funds, vendor payouts, and society infrastructure investments.
            </p>

            <button
              onClick={() => onNavigate && onNavigate('expenses')}
              style={{
                width: '100%',
                padding: '12px',
                background: '#FAF8F5',
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                color: theme.textMain,
                fontFamily: "'Outfit', sans-serif",
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = theme.textMain; e.currentTarget.style.color = 'white'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#FAF8F5'; e.currentTarget.style.color = theme.textMain; }}
            >
              Open Society Financial Ledger <ExternalLink size={14} />
            </button>
          </div>

          {/* EMERGENCY & GATE HOTLINES */}
          <div style={{ background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ background: '#FEF2F2', padding: '6px', borderRadius: '8px' }}>
                <PhoneCall size={16} color="#DC2626" />
              </div>
              <h4 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: '600', color: theme.textMain }}>
                Security Gate & Emergency Hotlines
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                onClick={() => onNavigate && onNavigate('intercom')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: '#F0FDFA',
                  border: '1px solid #CCFBF1',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#0F766E' }}>Main Gate Security Intercom</div>
                  <div style={{ fontSize: '11px', color: '#115E59' }}>Station 1 • 24x7 Guard Station</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F766E', background: 'white', padding: '4px 10px', borderRadius: '8px' }}>
                  Ext 101
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textMain }}>Society Management Desk</div>
                  <div style={{ fontSize: '11px', color: theme.textSec }}>Office Hours: 9:00 AM – 6:00 PM</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: theme.textSec }}>Ext 100</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#991B1B' }}>National Emergency Services</div>
                  <div style={{ fontSize: '11px', color: '#B91C1C' }}>Police • Fire • Medical</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#991B1B' }}>Dial 112</span>
              </div>
            </div>
          </div>

          {/* AI ASSISTANT PROMPT BANNER */}
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
            borderRadius: '24px',
            padding: '24px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>
                <Bot size={18} color="white" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#C7D2FE' }}>
                AI Society Concierge
              </span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: '600', lineHeight: 1.2 }}>
              Have questions about bylaws, maintenance, or booking amenities?
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#E0E7FF', lineHeight: 1.4 }}>
              Our Gemini-powered AI assistant answers queries about your unit, billing, and society operations in real-time.
            </p>
            <button
              onClick={() => onNavigate && onNavigate('chatbot')}
              style={{
                alignSelf: 'flex-start',
                marginTop: '4px',
                padding: '10px 18px',
                background: 'white',
                color: '#4F46E5',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              Ask AI Assistant <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;
