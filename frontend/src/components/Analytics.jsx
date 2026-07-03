import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { toast } from 'sonner';

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/analytics');
      setData(res.data);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <span className="spinner"></span>
      </div>
    );
  }

  if (!data) return null;

  const StatBox = ({ title, value, color }) => (
    <div style={{ border: `3px solid ${theme.border}`, padding: '20px', background: color || '#FFF', boxShadow: `4px 4px 0px ${theme.border}` }}>
      <h4 style={{ margin: '0 0 10px 0', fontFamily: "'Space Mono', monospace", fontSize: '12px', textTransform: 'uppercase', color: theme.textSec }}>{title}</h4>
      <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'Space Mono', monospace" }}>{value}</div>
    </div>
  );

  return (
    <div style={{ background: theme.surface, height: '100%', border: `3px solid ${theme.border}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: theme.textMain, color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>📊</span>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', letterSpacing: '2px', fontSize: '18px' }}>
          {user?.role === 'admin' ? 'SOCIETY_ANALYTICS' : 'MY_REPORTS'}
        </h3>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {user?.role === 'admin' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatBox title="Total Members" value={data.totalMembers} color="#f0f8ff" />
              <StatBox title="Pending Bills Count" value={data.pendingBills.count} color="#fff0f0" />
              <StatBox title="Total Pending Amount" value={`₹${data.pendingBills.amount.toLocaleString()}`} color="#fff0f0" />
              <StatBox title="Open Complaints" value={data.complaints.open} color="#fffaf0" />
            </div>

            <h3 style={{ fontFamily: "'Space Mono', monospace", marginBottom: '15px', borderBottom: `2px dashed ${theme.border}`, paddingBottom: '10px' }}>REVENUE (BILLS PAID)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatBox title="Weekly Revenue" value={`₹${data.revenue.weekly.toLocaleString()}`} />
              <StatBox title="Monthly Revenue" value={`₹${data.revenue.monthly.toLocaleString()}`} />
              <StatBox title="Annual Revenue" value={`₹${data.revenue.annual.toLocaleString()}`} />
            </div>

            <h3 style={{ fontFamily: "'Space Mono', monospace", marginBottom: '15px', borderBottom: `2px dashed ${theme.border}`, paddingBottom: '10px' }}>EXPENSES</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatBox title="Weekly Expenses" value={`₹${data.expenses.weekly.toLocaleString()}`} />
              <StatBox title="Monthly Expenses" value={`₹${data.expenses.monthly.toLocaleString()}`} />
              <StatBox title="Annual Expenses" value={`₹${data.expenses.annual.toLocaleString()}`} />
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatBox title="My Pending Amount" value={`₹${data.pendingAmount.toLocaleString()}`} color="#fff0f0" />
              <StatBox title="Total Paid (All Time)" value={`₹${data.myPayments.total.toLocaleString()}`} color="#f0f8ff" />
              <StatBox title="My Open Complaints" value={data.complaints.open} color="#fffaf0" />
            </div>

            <h3 style={{ fontFamily: "'Space Mono', monospace", marginBottom: '15px', borderBottom: `2px dashed ${theme.border}`, paddingBottom: '10px' }}>MY PAYMENT REPORTS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatBox title="Paid This Week" value={`₹${data.myPayments.weekly.toLocaleString()}`} />
              <StatBox title="Paid This Month" value={`₹${data.myPayments.monthly.toLocaleString()}`} />
              <StatBox title="Paid This Year" value={`₹${data.myPayments.annual.toLocaleString()}`} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
