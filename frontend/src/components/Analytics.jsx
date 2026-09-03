import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { toast } from 'sonner';
import { BarChart3 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, Legend, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [predictive, setPredictive] = useState(null);
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
      if (user?.role === 'admin') {
        const sen = await api.get('/analytics/sentiment');
        setSentiment(sen.data);
        const pre = await api.get('/analytics/predictive-maintenance');
        setPredictive(pre.data);
      }
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'pulse 1.5s infinite ease-in-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
          <div style={{ background: '#E5E7EB', width: '44px', height: '44px', borderRadius: '12px' }}></div>
          <div style={{ background: '#E5E7EB', width: '200px', height: '32px', borderRadius: '8px' }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ border: `1px solid ${theme.border}`, padding: '24px', borderRadius: '20px', background: 'white', height: '100px' }}>
               <div style={{ background: '#E5E7EB', width: '100px', height: '16px', borderRadius: '4px', marginBottom: '10px' }}></div>
               <div style={{ background: '#E5E7EB', width: '60px', height: '32px', borderRadius: '8px' }}></div>
            </div>
          ))}
        </div>
        <div style={{ background: '#E5E7EB', height: '300px', borderRadius: '20px', width: '100%' }}></div>
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
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

  const trendData = data.trendData || [];
  const memberPaymentData = data.memberPaymentData || [];

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

            {sentiment && (
              <div style={{ background: 'white', borderRadius: '24px', padding: '30px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '30px' }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 15px 0', fontSize: '20px', fontWeight: '600', color: theme.textMain }}>AI Community Sentiment</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ flexShrink: 0, width: '100px', height: '100px', borderRadius: '50%', background: sentiment.score > 70 ? '#f0fff0' : sentiment.score > 40 ? '#fffaf0' : '#fff0f0', border: `4px solid ${sentiment.score > 70 ? '#4ade80' : sentiment.score > 40 ? '#facc15' : '#f87171'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '700', color: theme.textMain }}>
                    {sentiment.score}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', color: theme.textSec, lineHeight: 1.6 }}>{sentiment.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            {predictive && (
              <div style={{ background: 'white', borderRadius: '24px', padding: '30px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '30px' }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 15px 0', fontSize: '20px', fontWeight: '600', color: theme.textMain }}>Predictive Maintenance (AI Insights)</h3>
                <div style={{ background: '#F9F8F3', padding: '20px', borderRadius: '12px', fontSize: '15px', color: theme.textSec, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {predictive.analysis}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '20px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
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

              {data.complaintsByCategory && data.complaintsByCategory.length > 0 && (
                <div style={{ background: 'white', borderRadius: '24px', padding: '30px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: theme.textMain }}>Complaints by Category</h3>
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.complaintsByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.complaintsByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#9333EA', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'][index % 6]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                        <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
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
