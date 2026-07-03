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
  const [generateData, setGenerateData] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), dueDate: '' });
  const limit = 10;

  useEffect(() => {
    fetchBills();
    
    // Vercel-compatible real-time fallback (Short Polling)
    const interval = setInterval(() => {
      fetchBills(false);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchBills = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const { data } = await api.get('/bills');
      setBills(data);
    } catch (error) {
      console.error('// BILLS_FETCH_ERROR');
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const handleGenerateBills = async (e) => {
    e.preventDefault();
    if (!generateData.month || !generateData.year || !generateData.dueDate) {
      toast.error('Please select month, year, and due date.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/bills/generate', {
        month: generateData.month,
        year: generateData.year,
        dueDate: generateData.dueDate
      });
      toast.success('Bills generated for all active residents.');
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
      <div style={{ background: theme.textMain, color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🧾</span>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', letterSpacing: '2px', fontSize: '18px' }}>
            Maintenance_Dues
          </h3>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowGenerateForm(!showGenerateForm)} style={{
            background: theme.accent, color: 'white', border: 'none', padding: '6px 12px',
            fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '12px'
          }}>
            {showGenerateForm ? '[-] CANCEL' : '[+] GEN_ALL_BILLS'}
          </button>
        )}
      </div>

      {showGenerateForm && (
        <form onSubmit={handleGenerateBills} style={{ padding: '20px', background: theme.fieldBg, borderBottom: `2px dashed ${theme.border}`, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="registry-label">Month (1-12)</label>
            <input type="number" min="1" max="12" value={generateData.month} onChange={e => setGenerateData({...generateData, month: e.target.value})} className="registry-input" required />
          </div>
          <div>
            <label className="registry-label">Year</label>
            <input type="number" value={generateData.year} onChange={e => setGenerateData({...generateData, year: e.target.value})} className="registry-input" required />
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
                    <h4 style={{ margin: '0 0 5px 0', fontFamily: "'Space Mono', monospace", fontSize: '16px' }}>{b.month} {b.year}</h4>
                    {user?.role === 'admin' && (
                      <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontFamily: "'Space Mono', monospace" }}>
                        TO: {b.user?.name} (W_{b.user?.flatDetails?.wing} F_{b.user?.flatDetails?.flatNumber})
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
                {b.status !== 'Paid' && (
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
