import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { toast } from 'sonner';
import { BarChart3 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, Legend, AreaChart, Area
} from 'recharts';

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');

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
        <img src="/awaastech-logo.png" alt="Loading" className="organic-pulse" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
      </div>
    );
  }

  if (!data) return null;

  const StatBox = ({ title, value, color }) => (
    <div style={{ border: `1px solid ${theme.border}`, padding: '24px', borderRadius: '20px', background: color || 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <h4 style={{ margin: '0 0 10px 0', fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: '600', color: theme.textSec }}>{title}</h4>
      <div style={{ fontSize: '32px', fontWeight: '700', fontFamily: "'Outfit', sans-serif", color: theme.textMain }}>{value}</div>
    </div>
  );

  // Mock data for graphs to visualize trends
  const trendData = [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 5000, expenses: 2800 },
    { name: 'Apr', revenue: 2780, expenses: 3908 },
    { name: 'May', revenue: 6890, expenses: 4800 },
    { name: 'Jun', revenue: 4390, expenses: 3800 },
    { name: 'Jul', revenue: 5490, expenses: 4300 },
  ];

  const memberPaymentData = [
    { name: 'Jan', amount: 1200 },
    { name: 'Feb', amount: 1200 },
    { name: 'Mar', amount: 1500 },
    { name: 'Apr', amount: 1200 },
    { name: 'May', amount: 0 },
    { name: 'Jun', amount: 2400 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <div style={{ background: '#F3E8FF', padding: '10px', borderRadius: '12px' }}>
          <BarChart3 size={24} color="#9333EA" />
        </div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          {user?.role === 'admin' ? 'Society Analytics' : 'My Reports'}
        </h3>
      </div>

      <div style={{ padding: '0', flex: 1, overflowY: 'auto' }}>
        {user?.role === 'admin' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatBox title="Total Members" value={data.totalMembers} color="#f0f8ff" />
              <StatBox title="Pending Bills Count" value={data.pendingBills.count} color="#fff0f0" />
              <StatBox title="Total Pending Amount" value={`₹${data.pendingBills.amount.toLocaleString()}`} color="#fff0f0" />
              <StatBox title="Open Complaints" value={data.complaints.open} color="#fffaf0" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '40px' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", margin: 0, fontSize: '20px', fontWeight: '600', color: theme.textMain }}>Financial Overview</h3>
              <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '4px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                {['weekly', 'monthly', 'annual'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setTimeframe(t)} 
                    style={{
                      border: 'none',
                      borderRadius: '8px',
                      background: timeframe === t ? theme.textMain : 'transparent',
                      color: timeframe === t ? 'white' : theme.textSec,
                      padding: '8px 16px',
                      fontFamily: "'Outfit', sans-serif",
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      fontWeight: '600',
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatBox title={`${timeframe} Revenue`} value={`₹${data.revenue[timeframe].toLocaleString()}`} />
              <StatBox title={`${timeframe} Expenses`} value={`₹${data.expenses[timeframe].toLocaleString()}`} />
              <StatBox 
                title="Net Profit/Loss" 
                value={`₹${(data.revenue[timeframe] - data.expenses[timeframe]).toLocaleString()}`} 
                color={(data.revenue[timeframe] - data.expenses[timeframe]) >= 0 ? '#f0fff0' : '#fff0f0'}
              />
            </div>

            <div style={{ background: 'white', borderRadius: '24px', padding: '30px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: theme.textMain }}>Revenue vs Expenses (Trend)</h3>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4D9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.textSec, fontSize: 13 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.textSec, fontSize: 13 }} dx={-10} />
                    <RechartsTooltip 
                      cursor={{ fill: '#F9F8F3' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="revenue" name="Revenue" fill={theme.accent} radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="expenses" name="Expenses" fill="#6B705C" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatBox title="My Pending Amount" value={`₹${data.pendingAmount.toLocaleString()}`} color="#fff0f0" />
              <StatBox title="Total Paid (All Time)" value={`₹${data.myPayments.total.toLocaleString()}`} color="#f0f8ff" />
              <StatBox title="My Open Complaints" value={data.complaints.open} color="#fffaf0" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '40px' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", margin: 0, fontSize: '20px', fontWeight: '600', color: theme.textMain }}>My Payment Reports</h3>
              <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '4px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                {['weekly', 'monthly', 'annual'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setTimeframe(t)} 
                    style={{
                      border: 'none',
                      borderRadius: '8px',
                      background: timeframe === t ? theme.textMain : 'transparent',
                      color: timeframe === t ? 'white' : theme.textSec,
                      padding: '8px 16px',
                      fontFamily: "'Outfit', sans-serif",
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      fontWeight: '600',
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatBox title={`Paid This ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`} value={`₹${data.myPayments[timeframe].toLocaleString()}`} />
            </div>

            <div style={{ background: 'white', borderRadius: '24px', padding: '30px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: theme.textMain }}>Payment History Trend</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={memberPaymentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.accent} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={theme.accent} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4D9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.textSec, fontSize: 13 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.textSec, fontSize: 13 }} dx={-10} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                    />
                    <Area type="monotone" dataKey="amount" name="Amount Paid" stroke={theme.accent} strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
