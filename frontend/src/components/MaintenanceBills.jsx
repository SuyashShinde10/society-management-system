import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { jsPDF } from 'jspdf';

const MaintenanceBills = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter state
  const [filterStatus, setFilterStatus] = useState('All'); // All, Pending, Paid, Overdue
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [generateData, setGenerateData] = useState({ title: '', description: '', amount: '', dueDate: '', targetType: 'All', targetUserId: '' });
  const [payingBillId, setPayingBillId] = useState(null);
  const limit = 10;

  useEffect(() => {
    fetchBills();
    if (user?.role === 'admin') {
      fetchUsers();
    }
    
    // Vercel-compatible real-time fallback (Short Polling)
    const interval = setInterval(() => {
      fetchBills(false);
    }, 30000); // 30 seconds

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
        let computedStatus = b.status; // Trust backend
        if (!b.isPaid && b.status === 'Pending' && b.dueDate && new Date(b.dueDate) < new Date()) {
          computedStatus = 'Overdue';
        }
        return { ...b, status: computedStatus };
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

  const handleMarkPaid = async (id, method = 'UPI', action = 'approve') => {
    try {
      if (action === 'reject') {
        setBills(prev => prev.map(b => b._id === id ? { ...b, status: 'Pending', paymentMode: null } : b));
      } else if (user?.role === 'admin') {
        setBills(prev => prev.map(b => b._id === id ? { ...b, status: 'Paid', paymentMode: method } : b));
      } else {
        setBills(prev => prev.map(b => b._id === id ? { ...b, status: 'Under Verification', paymentMode: method } : b));
      }
      setPayingBillId(null);
      await api.put(`/bills/${id}/pay`, { paymentMode: method, action });
      toast.success(action === 'reject' ? 'Payment rejected.' : `Payment recorded via ${method}.`);
      fetchBills();
    } catch (error) {
      fetchBills();
      toast.error('Payment update failed.');
    }
  };

  const handleDownloadInvoice = (bill) => {
    try {
      const doc = new jsPDF();
      const isPaid = bill.status === 'Paid';
      const docTitle = isPaid ? 'PAYMENT RECEIPT' : 'MAINTENANCE BILL';
      
      // Header Section
      doc.setFont('courier', 'bold');
      doc.setFontSize(22);
      doc.text(docTitle, 105, 20, null, null, 'center');
      
      doc.setFontSize(14);
      const societyName = user?.societyName || 'Awaastech Society';
      doc.text(societyName.toUpperCase(), 105, 30, null, null, 'center');
      
      doc.setFontSize(10);
      doc.setFont('courier', 'normal');
      const locationText = user?.societyCity ? `Location: ${user.societyCity}` : 'Authorized Society Document';
      doc.text(locationText, 105, 36, null, null, 'center');
      
      doc.line(20, 42, 190, 42);
      
      // Bill Information
      doc.setFont('courier', 'bold');
      doc.setFontSize(12);
      doc.text(`Bill ID: ${bill._id}`, 20, 52);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 52);
      
      // Resident Information
      doc.setFont('courier', 'normal');
      doc.text('Billed To:', 20, 67);
      doc.text(`${bill.userId?.name || 'Resident'}`, 20, 75);
      if (bill.userId?.flatDetails) {
        doc.text(`Wing: ${bill.userId.flatDetails.wing} | Flat: ${bill.userId.flatDetails.flatNumber}`, 20, 83);
      }

      // Bill Details
      doc.text(`Title: ${bill.title}`, 20, 97);
      doc.text(`Description: ${bill.description || 'N/A'}`, 20, 105);
      doc.text(`Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`, 20, 113);
      
      // Financials
      doc.setFont('courier', 'bold');
      doc.setFontSize(14);
      doc.text(`Amount Due: Rs. ${bill.amount.toLocaleString()}`, 20, 127);
      
      doc.setFontSize(12);
      doc.text(`Status: ${bill.status.toUpperCase()}`, 140, 127);

      // Status Stamp
      if (isPaid) {
        doc.setTextColor(0, 128, 0); // Green
        doc.text('PAID IN FULL', 105, 147, null, null, 'center');
      } else {
        doc.setTextColor(255, 0, 0); // Red
        doc.text('PAYMENT PENDING', 105, 147, null, null, 'center');
      }

      // Footer
      doc.setTextColor(0, 0, 0);
      doc.setFont('courier', 'normal');
      doc.setFontSize(10);
      doc.line(20, 270, 190, 270);
      doc.text(isPaid ? 'Thank you for your prompt payment!' : 'Please clear your dues before the due date.', 105, 280, null, null, 'center');

      doc.save(`${isPaid ? 'Receipt' : 'Bill'}_${bill.title.replace(/\s+/g, '_')}_${bill._id.slice(-6)}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Failed to generate PDF');
    }
  };

  // Filter Logic
  const filteredBills = bills.filter(b => {
    if (filterStatus !== 'All' && b.status !== filterStatus) return false;
    if (searchQuery) {
      return (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
             (b.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Pagination Logic
  const paginatedBills = filteredBills.slice(0, page * limit);
  const hasMore = paginatedBills.length < filteredBills.length;

  return (
    <div style={{ background: theme.surface, border: `3px solid ${theme.border}`, display: 'flex', flexDirection: 'column' }}>
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '20px 20px 0 20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="SEARCH BILLS..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="brutal-input" 
            style={{ flex: 2, padding: '10px', fontFamily: "'Space Mono', monospace", minWidth: '200px' }}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="brutal-input" style={{ flex: 1, padding: '10px', fontFamily: "'Space Mono', monospace", minWidth: '150px' }}>
            <option value="All">STATUS: ALL</option>
            <option value="Pending">STATUS: PENDING</option>
            <option value="Under Verification">STATUS: VERIFYING</option>
            <option value="Paid">STATUS: PAID</option>
            <option value="Overdue">STATUS: OVERDUE</option>
          </select>
          </div>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '60vh', padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <img src="/awaastech-logo.png" alt="Loading" className="brutal-pulse" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
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
                      background: b.status === 'Paid' ? theme.resolved : (b.status === 'Pending' || b.status === 'Overdue' ? theme.pending : '#E35205'),
                      color: 'white'
                    }}>
                      {b.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ marginTop: '15px', borderTop: `1px dashed ${theme.border}`, paddingTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  
                  {/* Admin Verification Options */}
                  {b.status === 'Under Verification' && user?.role === 'admin' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => {
                        if (window.confirm(`Are you sure you want to VERIFY and approve this payment of ₹${b.amount}?`)) {
                          handleMarkPaid(b._id, b.paymentMode, 'approve');
                        }
                      }} style={{
                        background: theme.resolved, color: 'white', padding: '8px 16px', border: 'none',
                        fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '12px'
                      }}>
                        [ VERIFY_PAYMENT ]
                      </button>
                      <button onClick={() => {
                        if (window.confirm('Are you sure you want to REJECT this payment? The member will have to submit their payment details again.')) {
                          handleMarkPaid(b._id, null, 'reject');
                        }
                      }} style={{
                        background: theme.declined, color: 'white', padding: '8px 16px', border: 'none',
                        fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '12px'
                      }}>
                        [ REJECT ]
                      </button>
                    </div>
                  )}

                  {/* Member Payment Options */}
                  {(b.status === 'Pending' || b.status === 'Overdue') && payingBillId !== b._id && (
                    <button onClick={() => setPayingBillId(b._id)} style={{
                      background: theme.textMain, color: 'white', padding: '8px 16px', border: 'none',
                      fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '12px'
                    }}>
                      {user?.role === 'admin' ? '[ MARK_AS_PAID ]' : '[ PAY_BILL ]'}
                    </button>
                  )}
                  
                  {(b.status === 'Pending' || b.status === 'Overdue') && payingBillId === b._id && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background: theme.fieldBg, padding: '5px 10px', border: `1px dashed ${theme.textMain}` }}>
                      <span style={{ fontSize: '12px', fontFamily: "'Space Mono', monospace", fontWeight: 'bold' }}>PAY_VIA:</span>
                      <button onClick={() => handleMarkPaid(b._id, 'UPI')} style={{ background: '#0070BA', color: 'white', padding: '6px 12px', border: 'none', fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '11px' }}>[ UPI ]</button>
                      <button onClick={() => handleMarkPaid(b._id, 'Net Banking')} style={{ background: '#E35205', color: 'white', padding: '6px 12px', border: 'none', fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '11px' }}>[ NET_BANK ]</button>
                      <button onClick={() => handleMarkPaid(b._id, 'Cash')} style={{ background: '#28A745', color: 'white', padding: '6px 12px', border: 'none', fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '11px' }}>[ CASH ]</button>
                      <button onClick={() => setPayingBillId(null)} style={{ background: 'transparent', color: theme.textMain, border: 'none', fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}>CANCEL</button>
                    </div>
                  )}
                  
                  <button onClick={() => handleDownloadInvoice(b)} style={{
                    background: 'transparent', color: theme.textMain, padding: '8px 16px', border: `2px solid ${theme.textMain}`,
                    fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', fontSize: '12px'
                  }}>
                    {b.status === 'Paid' ? '[ DOWNLOAD_RECEIPT ]' : '[ DOWNLOAD_BILL ]'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <button onClick={() => setPage(page + 1)} style={{
            width: '100%', marginTop: '20px', padding: '10px', background: 'transparent', border: `2px dashed ${theme.border}`,
            fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', flexShrink: 0
          }}>
            LOAD_MORE_RECORDS
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintenanceBills;
