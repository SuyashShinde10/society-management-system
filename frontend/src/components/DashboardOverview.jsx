import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { motion } from 'framer-motion';
import { Bell, AlertCircle, Users, UserMinus, Receipt, Wallet, Activity } from 'lucide-react';

const DashboardOverview = ({ onNavigate }) => {
  const { user } = useContext(AuthContext);
  
  const [stats, setStats] = useState({
    notices: 0,
    complaints: 0,
    expenses: 0,
    bills: 0,
    totalMembers: 0,
    pastMembers: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const requests = [
          api.get('/notices'),
          api.get('/complaints'),
          api.get('/bills'),
          api.get('/analytics')
        ];
        if (user?.role === 'admin') {
          requests.splice(2, 0, api.get('/expenses'));
        } else {
          requests.splice(2, 0, Promise.resolve({ data: [] }));
        }
        const [noticesRes, complaintsRes, expensesRes, billsRes, analyticsRes] = await Promise.all(requests);

        setStats({
          notices: noticesRes.data.length,
          complaints: complaintsRes.data.filter(c => c.status === 'Pending').length,
          expenses: expensesRes.data.reduce((acc, curr) => acc + Number(curr.amount), 0),
          bills: billsRes.data.filter(b => !b.isPaid).length,
          totalMembers: analyticsRes.data.totalMembers || 0,
          pastMembers: analyticsRes.data.pastMembers || 0
        });
      } catch (error) {
        console.error('// STATS_FETCH_ERROR');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', fontFamily: "'Outfit', sans-serif", background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, gap: '20px' }}>
        <img src="/awaastech-logo.png" alt="Loading Logo" className="organic-pulse" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
        <span style={{ color: theme.textSec, fontWeight: '500' }}>Loading Metrics...</span>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <div style={{ background: '#F9F8F3', padding: '10px', borderRadius: '12px' }}>
          <Activity size={24} color={theme.accent} />
        </div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          System Overview
        </h3>
      </div>

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}
      >
        
        {/* Active Notices */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.04)' }}
          onClick={() => onNavigate && onNavigate('notices')}
          style={{ background: 'white', borderRadius: '24px', padding: '24px', border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'box-shadow 0.2s' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: '500', color: theme.textSec }}>Active Notices</span>
            <div style={{ background: '#F9F8F3', padding: '8px', borderRadius: '10px' }}>
              <Bell size={18} color={theme.accent} />
            </div>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: '600', color: theme.textMain, lineHeight: 1 }}>{stats.notices}</div>
        </motion.div>

        {/* Pending Incidents */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.04)' }}
          onClick={() => onNavigate && onNavigate('complaints')}
          style={{ background: stats.complaints > 0 ? '#FEF2F2' : 'white', borderRadius: '24px', padding: '24px', border: `1px solid ${stats.complaints > 0 ? '#FEE2E2' : theme.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'box-shadow 0.2s' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: '500', color: stats.complaints > 0 ? '#B91C1C' : theme.textSec }}>Pending Incidents</span>
            <div style={{ background: stats.complaints > 0 ? '#FEE2E2' : '#F9F8F3', padding: '8px', borderRadius: '10px' }}>
              <AlertCircle size={18} color={stats.complaints > 0 ? '#DC2626' : theme.textMain} />
            </div>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: '600', color: stats.complaints > 0 ? '#991B1B' : theme.textMain, lineHeight: 1 }}>{stats.complaints}</div>
        </motion.div>

        {user?.role === 'admin' && (
          <>
            {/* Total Members */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.04)' }}
              onClick={() => onNavigate && onNavigate('registry')}
              style={{ background: 'white', borderRadius: '24px', padding: '24px', border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'box-shadow 0.2s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: '500', color: theme.textSec }}>Total Members</span>
                <div style={{ background: '#F9F8F3', padding: '8px', borderRadius: '10px' }}>
                  <Users size={18} color={theme.accent} />
                </div>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: '600', color: theme.textMain, lineHeight: 1 }}>{stats.totalMembers}</div>
            </motion.div>

            {/* Past Members */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.04)' }}
              onClick={() => onNavigate && onNavigate('registry')}
              style={{ background: 'white', borderRadius: '24px', padding: '24px', border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'box-shadow 0.2s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: '500', color: theme.textSec }}>Past Members</span>
                <div style={{ background: '#F9F8F3', padding: '8px', borderRadius: '10px' }}>
                  <UserMinus size={18} color={theme.textMain} />
                </div>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: '600', color: theme.textMain, lineHeight: 1 }}>{stats.pastMembers}</div>
            </motion.div>
          </>
        )}

        {/* Pending Dues */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.04)' }}
          onClick={() => onNavigate && onNavigate('bills')}
          style={{ background: stats.bills > 0 ? '#FEF2F2' : 'white', borderRadius: '24px', padding: '24px', border: `1px solid ${stats.bills > 0 ? '#FEE2E2' : theme.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'box-shadow 0.2s' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: '500', color: stats.bills > 0 ? '#B91C1C' : theme.textSec }}>
              {user?.role === 'admin' ? 'Pending Dues' : 'My Pending Bills'}
            </span>
            <div style={{ background: stats.bills > 0 ? '#FEE2E2' : '#F9F8F3', padding: '8px', borderRadius: '10px' }}>
              <Receipt size={18} color={stats.bills > 0 ? '#DC2626' : theme.accent} />
            </div>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: '600', color: stats.bills > 0 ? '#991B1B' : theme.textMain, lineHeight: 1 }}>{stats.bills}</div>
        </motion.div>

        {/* Total Outflow */}
        {user?.role === 'admin' && (
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.04)' }}
            onClick={() => onNavigate && onNavigate('expenses')}
            style={{ background: '#F9F8F3', borderRadius: '24px', padding: '24px', border: `1px solid ${theme.border}`, gridColumn: '1 / -1', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'box-shadow 0.2s' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: '500', color: theme.textSec }}>Total Outflow</span>
              <div style={{ background: 'white', padding: '8px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <Wallet size={18} color={theme.accent} />
              </div>
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '36px', fontWeight: '600', color: theme.textMain, lineHeight: 1 }}>
              ₹{stats.expenses.toLocaleString()}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
};

export default DashboardOverview;
