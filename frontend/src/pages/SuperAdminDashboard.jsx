import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { Server, Trash2, Power, Send, AlertCircle, X, Download, UserCircle, Shield, Clock, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Broadcast State
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  // Enterprise Feature States
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [impersonateEmail, setImpersonateEmail] = useState('');
  
  // Chart State
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'

  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const res = await api.get('/superadmin/dashboard');
      setData(res.data);
      const logsRes = await api.get('/superadmin/logs');
      setLogs(logsRes.data.logs);
      setAlerts(logsRes.data.alerts);
    } catch (error) {
      toast.error('Failed to load superadmin data');
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (e) => {
    e.preventDefault();
    if (!impersonateEmail) return toast.error('Enter email to impersonate');
    try {
      const res = await api.post('/superadmin/impersonate', { email: impersonateEmail });
      localStorage.setItem('token', res.data.token);
      toast.success(`Impersonating ${res.data.user.name}... Redirecting!`);
      setTimeout(() => window.location.href = '/', 1500); // hard refresh to reset context
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impersonation failed');
    }
  };

  const handleBackup = async () => {
    try {
      const res = await api.get('/superadmin/backup');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", "system_backup_" + new Date().toISOString() + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success('Backup downloaded successfully!');
      fetchData(); // refresh logs
    } catch (error) {
      toast.error('Backup failed');
    }
  };

  const handleUpdatePlan = async (id, currentPlan) => {
    const newPlan = window.prompt(`Enter new plan for society (Trial, Pro, Premium):\nCurrent: ${currentPlan}`, currentPlan);
    if (!newPlan || !['Trial', 'Pro', 'Premium'].includes(newPlan)) return;
    try {
      await api.patch(`/superadmin/society/${id}/plan`, { planType: newPlan });
      toast.success('Plan updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  const handleSuspend = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this society?`)) return;
    try {
      await api.patch(`/superadmin/society/${id}/suspend`);
      toast.success(`Society ${currentStatus ? 'suspended' : 'activated'} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update society status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: This will permanently delete the society and ALL its users, expenses, and data. Are you sure?')) return;
    try {
      await api.delete(`/superadmin/society/${id}`);
      toast.success('Society permanently deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete society');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastContent) return toast.error('Fill all fields');
    setBroadcasting(true);
    try {
      await api.post('/superadmin/broadcast', { title: broadcastTitle, content: broadcastContent });
      toast.success('Global Notice Broadcasted to all societies!');
      setShowBroadcast(false);
      setBroadcastTitle('');
      setBroadcastContent('');
    } catch (error) {
      toast.error('Failed to broadcast notice');
    } finally {
      setBroadcasting(false);
    }
  };

  const getChartData = () => {
    if (!data) return [];
    if (timeRange === 'week') return data.growthDataWeek;
    if (timeRange === 'month') return data.growthDataMonth;
    if (timeRange === 'year') return data.growthDataYear;
    return [];
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, fontFamily: "'Outfit', sans-serif" }}>INITIALIZING SYSTEM...</div>;
  }

  const inputStyle = { width: '100%', padding: '12px 16px', border: `1px solid ${theme.border}`, borderRadius: '8px', fontSize: '15px', fontFamily: "'Outfit', sans-serif", outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, fontFamily: "'Outfit', sans-serif" }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: 'white', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: theme.accent, padding: '8px', borderRadius: '8px', color: 'white' }}>
            <Server size={20} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: theme.textMain }}>AWAASTECH CORE</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: theme.textSec }}>Developer Mode Active</span>
          <button onClick={logout} style={{ background: '#F9F8F3', border: `1px solid ${theme.border}`, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: theme.textMain }}>Exit</button>
        </div>
      </nav>

      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', color: theme.textMain, margin: 0 }}>
            Developer Dashboard
          </h1>
          <button onClick={() => setShowBroadcast(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: theme.textMain, color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>
            <Send size={18} /> Broadcast Global Notice
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: theme.textSec, fontSize: '14px', textTransform: 'uppercase' }}>Active Societies</h3>
            <div style={{ fontSize: '36px', fontWeight: '700', color: theme.textMain }}>{data?.stats?.totalSocieties || 0}</div>
          </div>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: theme.textSec, fontSize: '14px', textTransform: 'uppercase' }}>Total Admins</h3>
            <div style={{ fontSize: '36px', fontWeight: '700', color: theme.textMain }}>{data?.stats?.totalAdmins || 0}</div>
          </div>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: theme.textSec, fontSize: '14px', textTransform: 'uppercase' }}>Platform Users</h3>
            <div style={{ fontSize: '36px', fontWeight: '700', color: theme.textMain }}>{data?.stats?.totalMembers || 0}</div>
          </div>
        </div>

        {/* Growth Chart */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: theme.textMain }}>Platform Growth</h2>
            <div style={{ display: 'flex', background: '#F9F8F3', borderRadius: '8px', padding: '4px' }}>
              <button onClick={() => setTimeRange('week')} style={{ background: timeRange === 'week' ? 'white' : 'transparent', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: timeRange === 'week' ? theme.textMain : theme.textSec, boxShadow: timeRange === 'week' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}>Week</button>
              <button onClick={() => setTimeRange('month')} style={{ background: timeRange === 'month' ? 'white' : 'transparent', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: timeRange === 'month' ? theme.textMain : theme.textSec, boxShadow: timeRange === 'month' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}>Month</button>
              <button onClick={() => setTimeRange('year')} style={{ background: timeRange === 'year' ? 'white' : 'transparent', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: timeRange === 'year' ? theme.textMain : theme.textSec, boxShadow: timeRange === 'year' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}>Year</button>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.border} />
                <XAxis dataKey="label" stroke={theme.textSec} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme.textSec} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} />
                <Line type="monotone" dataKey="societies" stroke={theme.accent} strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="New Societies" />
                <Line type="monotone" dataKey="members" stroke={theme.textMain} strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="New Members" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: theme.textMain }}>Deployed Societies Management</h2>
          {data?.societies?.length === 0 ? (
            <p style={{ color: theme.textSec }}>No societies deployed yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '15px', color: theme.textSec, fontSize: '14px' }}>Society Name</th>
                    <th style={{ padding: '15px', color: theme.textSec, fontSize: '14px' }}>Admin Contact</th>
                    <th style={{ padding: '15px', color: theme.textSec, fontSize: '14px' }}>License Plan</th>
                    <th style={{ padding: '15px', color: theme.textSec, fontSize: '14px' }}>Status</th>
                    <th style={{ padding: '15px', color: theme.textSec, fontSize: '14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.societies?.map(soc => (
                    <tr key={soc._id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '15px', fontWeight: '600', color: theme.textMain }}>{soc.name}</td>
                      <td style={{ padding: '15px', color: theme.textSec }}>{soc.createdBy?.name} <br/><span style={{fontSize: '12px'}}>{soc.createdBy?.email}</span></td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', background: soc.planType === 'Premium' ? '#E3F2FD' : '#F9F8F3', color: soc.planType === 'Premium' ? '#1565C0' : theme.textSec }}>
                            {soc.planType || 'Trial'}
                          </span>
                          <button onClick={() => handleUpdatePlan(soc._id, soc.planType)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.accent, padding: 0 }} title="Edit Plan"><Edit2 size={14} /></button>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', background: soc.isActive ? '#E8F5E9' : '#FFEBEE', color: soc.isActive ? '#2E7D32' : '#C62828' }}>
                          {soc.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button onClick={() => handleSuspend(soc._id, soc.isActive)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: soc.isActive ? '#F57C00' : '#2E7D32' }} title={soc.isActive ? "Suspend" : "Activate"}>
                          <Power size={18} />
                        </button>
                        <button onClick={() => handleDelete(soc._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: '#D32F2F', marginLeft: '5px' }} title="Permanently Delete">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Enterprise Operations */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '40px' }}>
          
          {/* Impersonation Panel */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}><UserCircle size={20} /> Impersonation Mode</h2>
            <p style={{ margin: '0 0 20px 0', color: theme.textSec, fontSize: '13px', lineHeight: '1.5' }}>Temporarily log in as any user to troubleshoot issues. All actions will be logged.</p>
            <form onSubmit={handleImpersonate} style={{ display: 'flex', gap: '10px' }}>
              <input type="email" placeholder="user@email.com" value={impersonateEmail} onChange={e => setImpersonateEmail(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
              <button type="submit" style={{ background: theme.accent, color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Login</button>
            </form>
          </div>

          {/* Backup Panel */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={20} /> Disaster Recovery</h2>
            <p style={{ margin: '0 0 20px 0', color: theme.textSec, fontSize: '13px', lineHeight: '1.5' }}>Generate an encrypted JSON backup of the entire platform database. Passwords are excluded.</p>
            <button onClick={handleBackup} style={{ width: '100%', padding: '12px', background: theme.textMain, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Download size={18} /> Generate Database Backup
            </button>
          </div>
          
        </div>

        {/* Audit Logs */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginTop: '40px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={20} /> Platform Audit Trail</h2>
          <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                  <th style={{ padding: '12px', color: theme.textSec }}>Timestamp</th>
                  <th style={{ padding: '12px', color: theme.textSec }}>Action</th>
                  <th style={{ padding: '12px', color: theme.textSec }}>Performed By</th>
                  <th style={{ padding: '12px', color: theme.textSec }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? <tr><td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: theme.textSec }}>No logs recorded yet.</td></tr> : null}
                {logs.map(log => (
                  <tr key={log._id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: '12px', color: theme.textSec }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '12px', fontWeight: '600', color: theme.textMain }}>{log.action}</td>
                    <td style={{ padding: '12px', color: theme.textSec }}>{log.performedBy ? `${log.performedBy.name} (${log.performedBy.role})` : 'SYSTEM'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: log.status === 'Success' ? '#E8F5E9' : '#FFF3E0', color: log.status === 'Success' ? '#2E7D32' : '#E65100' }}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <AnimatePresence>
        {showBroadcast && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={20} color={theme.accent} /> Global Broadcast
                </h2>
                <button onClick={() => setShowBroadcast(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.textSec }}><X size={20} /></button>
              </div>
              <p style={{ margin: '0 0 20px 0', color: theme.textSec, fontSize: '14px', lineHeight: '1.5' }}>
                This notice will be sent to <strong>ALL societies</strong> on the platform simultaneously. Use this for critical platform updates, maintenance, or global alerts.
              </p>
              <form onSubmit={handleBroadcast}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: theme.textMain }}>Notice Title</label>
                  <input type="text" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} required style={inputStyle} placeholder="e.g. Scheduled Platform Maintenance" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: theme.textMain }}>Message Content</label>
                  <textarea value={broadcastContent} onChange={(e) => setBroadcastContent(e.target.value)} required style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} placeholder="Enter notice details..." />
                </div>
                <button type="submit" disabled={broadcasting} style={{ width: '100%', padding: '14px', background: theme.textMain, color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: broadcasting ? 'not-allowed' : 'pointer', opacity: broadcasting ? 0.7 : 1 }}>
                  {broadcasting ? 'Broadcasting...' : 'Send Global Notice'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminDashboard;
