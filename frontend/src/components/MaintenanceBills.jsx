import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';

const MaintenanceBills = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter state
  const [filterStatus, setFilterStatus] = useState('All'); // All, Pending, Paid, Overdue
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [generateData, setGenerateData] = useState({ title: '', description: '', amount: '', dueDate: '', targetType: 'All', targetUserId: '' });
  const limit = 10;

  useEffect(() => {
    fetchBills();
    if (user?.role === 'admin') {
      fetchUsers();
    }
    
    // Vercel-compatible real-time fallback (Short Polling)
    const interval = setInterval(() => {
      fetchBills(false);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchBills = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const { data } = await api.get('/bills');
      const mappedData = data.map(b => {
        let status = 'Pending';
        if (b.isPaid) status = 'Paid';
        else if (new Date(b.dueDate) < new Date()) status = 'Overdue';
        return { ...b, status };
      });
      setBills(mappedData);
    } catch (error) {
      console.error('// BILLS_FETCH_ERROR');
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const handleGenerateBills = async (e) => {
    e.preventDefault();
    if (!generateData.title || !generateData.amount || !generateData.dueDate) {
      toast.error('Please enter title, amount, and due date.');
      return;
    }
    if (generateData.targetType === 'Specific' && !generateData.targetUserId) {
      toast.error('Please select a specific member.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/bills/generate', {
        title: generateData.title,
        description: generateData.description,
        amount: generateData.amount,
        dueDate: generateData.dueDate,
        targetType: generateData.targetType,
        targetUserId: generateData.targetUserId
      });
      toast.success(generateData.targetType === 'All' ? 'Bills generated for all residents.' : 'Bill generated successfully.');
      setShowGenerateForm(false);
      fetchBills();
    } catch (error) {
      toast.error('Failed to generate bills.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      setBills(prev => prev.map(b => b._id === id ? { ...b, status: 'Paid' } : b));
      await api.put(`/bills/${id}/pay`, { paymentMode: 'UPI' });
      toast.success('Payment recorded successfully.');
      fetchBills();
    } catch (error) {
      fetchBills();
      toast.error('Payment update failed.');
    }
  };

  // Filter Logic
  const filteredBills = bills.filter(b => {
    if (filterStatus === 'All') return true;
    return b.status === filterStatus;
  });

  // Pagination Logic
  const paginatedBills = filteredBills.slice(0, page * limit);
  const hasMore = paginatedBills.length < filteredBills.length;

  return (
    <div style={{ background: theme.surface, height: '100%', border: `3px solid ${theme.border}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: theme.textMain, color: 'white', padding: '15px 20px', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: '1 1 100px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🧾</span>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', letterSpacing: '2px', fontSize: '18px', wordBreak: 'break-all' }}>
            Maintenance_Dues
          </h3>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowGenerateForm(!showGenerateForm)} style={{
            flex: '0 0 auto', background: theme.accent, color: 'white', border: 'none', padding: '6px 12px',
            fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '12px'
          }}>
            {showGenerateForm ? '[-] CANCEL' : '[+] GEN_ALL_BILLS'}
          </button>
        )}
      </div>

      {showGenerateForm && (
        <form onSubmit={handleGenerateBills} style={{ padding: '20px', background: theme.fieldBg, borderBottom: `2px dashed ${theme.border}`, display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="registry-label">Target Audience</label>
            <select value={generateData.targetType} onChange={e => setGenerateData({...generateData, targetType: e.target.value})} className="registry-input">
              <option value="All">All Members</option>
              <option value="Specific">Particular Member</option>
            </select>
          </div>
          {generateData.targetType === 'Specific' && (
            <div>
              <label className="registry-label">Select Member</label>
              <select value={generateData.targetUserId} onChange={e => setGenerateData({...generateData, targetUserId: e.target.value})} className="registry-input" required>
                <option value="">-- Choose Member --</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} (Flat {u.flatDetails?.wing}-{u.flatDetails?.flatNumber})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="registry-label">Reason / Title</label>
            <input type="text" placeholder="e.g. Monthly Maintenance" value={generateData.title} onChange={e => setGenerateData({...generateData, title: e.target.value})} className="registry-input" required />
          </div>
          <div>
            <label className="registry-label">Amount (₹)</label>
            <input type="number" min="0" value={generateData.amount} onChange={e => setGenerateData({...generateData, amount: e.target.value})} className="registry-input" required />
          </div>
          <div>
            <label className="registry-label">Due Date</label>
            <input type="date" value={generateData.dueDate} onChange={e => setGenerateData({...generateData, dueDate: e.target.value})} className="registry-input" required />
          </div>
          <button type="submit" disabled={loading} style={{
            background: theme.textMain, color: 'white', padding: '12px 20px', border: 'none', height: '42px',
            fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '12px', boxShadow: `4px 4px 0px ${theme.border}`
          }}>
            {loading ? 'GENERATING...' : 'CONFIRM GENERATION'}
          </button>
        </form>
      )}

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="brutal-input" style={{ flex: 1, padding: '10px', fontFamily: "'Space Mono', monospace" }}>
            <option value="All">STATUS: ALL</option>
            <option value="Pending">STATUS: PENDING</option>
            <option value="Paid">STATUS: PAID</option>
            <option value="Overdue">STATUS: OVERDUE</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <span className="spinner"></span>
            </div>
          ) : paginatedBills.length === 0 ? (
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', textAlign: 'center', color: theme.textSec }}>// NO_BILLS_FOUND</p>
          ) : (
            paginatedBills.map(b => (
              <div key={b._id} style={{
                border: `2px solid ${theme.textMain}`, padding: '15px',
                borderLeft: `8px solid ${b.status === 'Paid' ? theme.resolved : b.status === 'Pending' ? theme.pending : theme.declined}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontFamily: "'Space Mono', monospace", fontSize: '16px' }}>{b.title}</h4>
                    {user?.role === 'admin' && (
                      <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontFamily: "'Space Mono', monospace" }}>
                        TO: {b.userId?.name} (W_{b.userId?.flatDetails?.wing} F_{b.userId?.flatDetails?.flatNumber})
                      </p>
                    )}
                    <span style={{ fontSize: '12px', fontFamily: "'Space Mono', monospace", color: theme.textSec }}>
                      DUE: {new Date(b.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: "'Space Mono', monospace", color: theme.textMain }}>
                      ₹{b.amount.toLocaleString()}
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', fontFamily: "'Space Mono', monospace", padding: '2px 6px',
                      background: b.status === 'Paid' ? theme.resolved : b.status === 'Pending' ? theme.pending : theme.declined,
                      color: 'white'
                    }}>
                      {b.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                {/* Member Payment Actions */}
                {b.status !== 'Paid' && user?.role === 'admin' && (
                  <div style={{ marginTop: '15px', borderTop: `1px dashed ${theme.border}`, paddingTop: '10px' }}>
                    <button onClick={() => handleMarkPaid(b._id)} style={{
                      background: theme.textMain, color: 'white', padding: '8px 16px', border: 'none',
                      fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '12px'
                    }}>
                      [ MARK_AS_PAID ]
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <button onClick={() => setPage(page + 1)} style={{
            width: '100%', marginTop: '20px', padding: '10px', background: 'transparent', border: `2px dashed ${theme.border}`,
            fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer'
          }}>
            LOAD_MORE_RECORDS
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintenanceBills;
