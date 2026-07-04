import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';

const DashboardOverview = () => {
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
        const [noticesRes, complaintsRes, expensesRes, billsRes, analyticsRes] = await Promise.all([
          api.get('/notices'),
          api.get('/complaints'),
          api.get('/expenses'),
          api.get('/bills'),
          api.get('/analytics')
        ]);

        setStats({
          notices: noticesRes.data.length,
          complaints: complaintsRes.data.filter(c => c.status === 'Pending').length,
          expenses: expensesRes.data.reduce((acc, curr) => acc + Number(curr.amount), 0),
          bills: billsRes.data.filter(b => b.status === 'Pending').length,
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
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div style={{ fontFamily: "'Space Mono', monospace", padding: '40px' }}>// CALCULATING_METRICS...</div>;
  }

  return (
    <div style={{ background: theme.surface, height: '100%', border: `3px solid ${theme.border}`, padding: '0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: theme.textMain, color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>📊</span>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', letterSpacing: '2px', fontSize: '18px' }}>
          System_Overview
        </h3>
      </div>

      <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        <div style={{ border: `2px solid ${theme.textMain}`, padding: '20px', background: '#F9F9F9' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', opacity: 0.7 }}>ACTIVE_NOTICES</span>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', lineHeight: 1, marginTop: '10px' }}>{stats.notices}</div>
        </div>

        <div style={{ border: `2px solid ${theme.textMain}`, padding: '20px', background: stats.complaints > 0 ? '#FEF2F2' : '#F9F9F9', borderLeft: `8px solid ${stats.complaints > 0 ? theme.danger : theme.textMain}` }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', opacity: 0.7 }}>PENDING_INCIDENTS</span>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', lineHeight: 1, marginTop: '10px' }}>{stats.complaints}</div>
        </div>

        <div style={{ border: `2px solid ${theme.textMain}`, padding: '20px', background: '#F9F9F9' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', opacity: 0.7 }}>TOTAL_MEMBERS</span>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', lineHeight: 1, marginTop: '10px' }}>{stats.totalMembers}</div>
        </div>

        <div style={{ border: `2px solid ${theme.textMain}`, padding: '20px', background: '#F9F9F9' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', opacity: 0.7 }}>PAST_MEMBERS</span>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', lineHeight: 1, marginTop: '10px' }}>{stats.pastMembers}</div>
        </div>


        <div style={{ border: `2px solid ${theme.textMain}`, padding: '20px', background: stats.bills > 0 ? '#FEF2F2' : '#F9F9F9', borderLeft: `8px solid ${stats.bills > 0 ? theme.danger : theme.textMain}` }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', opacity: 0.7 }}>{user?.role === 'admin' ? 'PENDING_DUES_COUNT' : 'MY_PENDING_BILLS'}</span>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', lineHeight: 1, marginTop: '10px' }}>{stats.bills}</div>
        </div>

        {user?.role === 'admin' && (
          <div style={{ border: `2px solid ${theme.textMain}`, padding: '20px', background: '#F9F9F9', gridColumn: '1 / -1' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', fontWeight: '700', opacity: 0.7 }}>TOTAL_OUTFLOW</span>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '36px', fontWeight: '700', lineHeight: 1, marginTop: '10px', color: theme.danger }}>
              ₹{stats.expenses.toLocaleString()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardOverview;
