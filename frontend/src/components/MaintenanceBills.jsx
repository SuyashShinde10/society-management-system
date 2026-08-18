import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { jsPDF } from 'jspdf';
import { FileText, Download } from 'lucide-react';

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
  const [expandedGroup, setExpandedGroup] = useState(null);
  const limit = 10;

  const isNew = (dateString) => {
    if (!dateString) return false;
    const diffTime = Math.abs(new Date() - new Date(dateString));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

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

  const groupedBills = {};
  if (user?.role === 'admin') {
    filteredBills.forEach(b => {
      const key = `${b.title.trim()}_${new Date(b.dueDate).toLocaleDateString()}`;
      if (!groupedBills[key]) {
        groupedBills[key] = {
          id: key,
          title: b.title,
          dueDate: b.dueDate,
          amount: b.amount,
          createdAt: b.createdAt,
          total: 0,
          paid: 0,
          pending: 0,
          verifying: 0,
          totalAmount: 0,
          collectedAmount: 0,
          bills: []
        };
      }
      groupedBills[key].total += 1;
      groupedBills[key].totalAmount += Number(b.amount);
      groupedBills[key].bills.push(b);
      if (b.status === 'Paid') {
        groupedBills[key].paid += 1;
        groupedBills[key].collectedAmount += Number(b.amount);
      }
      else if (b.status === 'Under Verification') groupedBills[key].verifying += 1;
      else groupedBills[key].pending += 1;
    });
  }
  const adminGroupList = Object.values(groupedBills);

  // Pagination Logic
  const paginatedBills = filteredBills.slice(0, page * limit);
  const hasMoreBills = paginatedBills.length < filteredBills.length;
  
  const paginatedGroups = adminGroupList.slice(0, page * limit);
  const hasMoreGroups = paginatedGroups.length < adminGroupList.length;

  const renderBillCard = (b, isNested = false) => (
    <div key={b._id} style={{
      background: 'white', border: `1px solid ${theme.border}`, padding: isNested ? '16px' : '24px', borderRadius: '20px',
      borderLeft: `6px solid ${b.status === 'Paid' ? theme.resolved : b.status === 'Pending' ? theme.pending : theme.declined}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s',
      marginBottom: isNested ? '12px' : '0'
    }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ margin: '0 0 5px 0', fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
            {b.title}
            {!isNested && isNew(b.createdAt) && (
              <span style={{
                fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: '700',
                background: '#10B981', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '10px'
              }}>NEW</span>
            )}
          </h4>
          {user?.role === 'admin' && (
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontFamily: "'Outfit', sans-serif", color: theme.textSec }}>
              TO: {b.userId?.name} (W_{b.userId?.flatDetails?.wing} F_{b.userId?.flatDetails?.flatNumber})
            </p>
          )}
          <span style={{ fontSize: '12px', fontFamily: "'Outfit', sans-serif", color: theme.textSec }}>
            DUE: {new Date(b.dueDate).toLocaleDateString()}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'Outfit', sans-serif", color: theme.textMain }}>
            ₹{b.amount.toLocaleString()}
          </div>
          <span style={{
            fontSize: '11px', fontWeight: '600', fontFamily: "'Outfit', sans-serif", padding: '4px 8px', borderRadius: '20px',
            background: b.status === 'Paid' ? '#DCFCE7' : (b.status === 'Pending' || b.status === 'Overdue' ? '#FEF9C3' : '#FFEDD5'),
            color: b.status === 'Paid' ? '#166534' : (b.status === 'Pending' || b.status === 'Overdue' ? '#854D0E' : '#C2410C')
          }}>
            {b.status || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '20px', borderTop: `1px dashed ${theme.border}`, paddingTop: '15px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        
        {/* Admin Verification Options */}
        {b.status === 'Under Verification' && user?.role === 'admin' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => {
              if (window.confirm(`Are you sure you want to VERIFY and approve this payment of ₹${b.amount}?`)) {
                handleMarkPaid(b._id, b.paymentMode, 'approve');
              }
            }} style={{
              background: theme.resolved, color: 'white', padding: '10px 16px', border: 'none', borderRadius: '10px',
              fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '13px'
            }}>
              Verify Payment
            </button>
            <button onClick={() => {
              if (window.confirm('Are you sure you want to REJECT this payment? The member will have to submit their payment details again.')) {
                handleMarkPaid(b._id, null, 'reject');
              }
            }} style={{
              background: theme.declined, color: 'white', padding: '10px 16px', border: 'none', borderRadius: '10px',
              fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '13px'
            }}>
              Reject
            </button>
          </div>
        )}

        {/* Member Payment Options */}
        {(b.status === 'Pending' || b.status === 'Overdue') && payingBillId !== b._id && (
          <button onClick={() => setPayingBillId(b._id)} style={{
            background: theme.textMain, color: 'white', padding: '10px 16px', border: 'none', borderRadius: '10px',
            fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '13px'
          }}>
            {user?.role === 'admin' ? 'Mark As Paid' : 'Pay Bill'}
          </button>
        )}
        
        {(b.status === 'Pending' || b.status === 'Overdue') && payingBillId === b._id && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', background: '#F9F8F3', padding: '8px 12px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: '12px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', marginRight: '5px' }}>Pay via:</span>
            <button onClick={() => handleMarkPaid(b._id, 'UPI')} style={{ background: '#0070BA', color: 'white', padding: '8px 14px', border: 'none', borderRadius: '8px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>UPI</button>
            <button onClick={() => handleMarkPaid(b._id, 'Net Banking')} style={{ background: '#E35205', color: 'white', padding: '8px 14px', border: 'none', borderRadius: '8px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>Net Bank</button>
            <button onClick={() => handleMarkPaid(b._id, 'Cash')} style={{ background: '#28A745', color: 'white', padding: '8px 14px', border: 'none', borderRadius: '8px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>Cash</button>
            <button onClick={() => setPayingBillId(null)} style={{ background: 'transparent', color: theme.textSec, border: 'none', fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '12px', padding: '8px' }}>Cancel</button>
          </div>
        )}
        
        <button onClick={() => handleDownloadInvoice(b)} style={{
          background: 'transparent', color: theme.textMain, padding: '10px 16px', border: `1px solid ${theme.border}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s'
        }} onMouseOver={(e) => e.target.style.background = '#F9F8F3'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
          <Download size={16} />
          {b.status === 'Paid' ? 'Receipt' : 'Invoice'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#EFF6FF', padding: '10px', borderRadius: '12px' }}>
            <FileText size={24} color="#3B82F6" />
          </div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
            Maintenance Bills
          </h3>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowGenerateForm(!showGenerateForm)} style={{
            background: showGenerateForm ? '#FEE2E2' : theme.accent, color: showGenerateForm ? '#DC2626' : 'white', border: 'none', padding: '10px 16px', borderRadius: '10px',
            fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s', boxShadow: showGenerateForm ? 'none' : '0 4px 12px rgba(217,115,78,0.2)'
          }}>
            {showGenerateForm ? 'Cancel' : 'Generate Bills'}
          </button>
        )}
      </div>

      {showGenerateForm && (
        <form onSubmit={handleGenerateBills} style={{ padding: '24px', background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', margin: '0 10px' }}>
          <div>
            <label className="registry-label">Target Audience</label>
            <select value={generateData.targetType} onChange={e => setGenerateData({...generateData, targetType: e.target.value})} className="organic-input">
              <option value="All">All Members</option>
              <option value="Specific">Particular Member</option>
            </select>
          </div>
          {generateData.targetType === 'Specific' && (
            <div>
              <label className="registry-label">Select Member</label>
              <select value={generateData.targetUserId} onChange={e => setGenerateData({...generateData, targetUserId: e.target.value})} className="organic-input" required>
                <option value="">-- Choose Member --</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} (Flat {u.flatDetails?.wing}-{u.flatDetails?.flatNumber})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="registry-label">Reason / Title</label>
            <input type="text" placeholder="e.g. Monthly Maintenance" value={generateData.title} onChange={e => setGenerateData({...generateData, title: e.target.value})} className="organic-input" required />
          </div>
          <div>
            <label className="registry-label">Amount (₹)</label>
            <input type="number" min="0" value={generateData.amount} onChange={e => setGenerateData({...generateData, amount: e.target.value})} className="organic-input" required />
          </div>
          <div>
            <label className="registry-label">Due Date</label>
            <input type="date" value={generateData.dueDate} onChange={e => setGenerateData({...generateData, dueDate: e.target.value})} className="organic-input" required />
          </div>
          <button type="submit" disabled={loading} style={{
            background: theme.textMain, color: 'white', padding: '12px 24px', border: 'none', height: '42px', borderRadius: '12px',
            fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
          }} onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')} onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}>
            {loading ? 'Generating...' : 'Confirm'}
          </button>
        </form>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '0 10px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="SEARCH BILLS..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="organic-input" 
            style={{ flex: 2, padding: '10px', fontFamily: "'Outfit', sans-serif", minWidth: '200px' }}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="organic-input" style={{ flex: 1, padding: '10px', fontFamily: "'Outfit', sans-serif", minWidth: '150px' }}>
            <option value="All">STATUS: ALL</option>
            <option value="Pending">STATUS: PENDING</option>
            <option value="Under Verification">STATUS: VERIFYING</option>
            <option value="Paid">STATUS: PAID</option>
            <option value="Overdue">STATUS: OVERDUE</option>
          </select>
          </div>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '60vh', padding: '0 10px 20px 10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <img src="/awaastech-logo.png" alt="Loading" className="organic-pulse" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            </div>
          ) : user?.role === 'admin' ? (
            paginatedGroups.length === 0 ? (
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', textAlign: 'center', color: theme.textSec, background: 'white', padding: '40px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>No bill batches found.</p>
            ) : (
              paginatedGroups.map(group => (
                <div key={group.id} style={{ background: 'white', border: `1px solid ${theme.border}`, padding: '24px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 8px 0', fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', color: theme.textMain }}>
                        {group.title}
                        {isNew(group.createdAt) && (
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: '700', background: '#10B981', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '10px' }}>NEW BATCH</span>
                        )}
                      </h4>
                      <div style={{ fontSize: '13px', fontFamily: "'Outfit', sans-serif", color: theme.textSec }}>
                        Generated for {group.total} members • Due: {new Date(group.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'Outfit', sans-serif", color: theme.textMain }}>
                        ₹{group.collectedAmount.toLocaleString()} / ₹{group.totalAmount.toLocaleString()} Collected
                      </div>
                      <div style={{ fontSize: '12px', fontFamily: "'Outfit', sans-serif", color: theme.textSec, marginTop: '4px' }}>
                        {group.paid} Paid • {group.verifying} Verifying • {group.pending} Pending
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', marginTop: '16px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${(group.paid / group.total) * 100}%`, background: theme.resolved, height: '100%' }}></div>
                    <div style={{ width: `${(group.verifying / group.total) * 100}%`, background: '#F59E0B', height: '100%' }}></div>
                  </div>

                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                     <button onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)} style={{ background: 'none', border: 'none', color: theme.accent, fontFamily: "'Outfit', sans-serif", fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                       {expandedGroup === group.id ? 'Hide Details ▲' : 'View Details ▼'}
                     </button>
                  </div>

                  {expandedGroup === group.id && (
                    <div style={{ marginTop: '20px', borderTop: `1px solid ${theme.border}`, paddingTop: '20px' }}>
                      {group.bills.map(b => renderBillCard(b, true))}
                    </div>
                  )}
                </div>
              ))
            )
          ) : (
            paginatedBills.length === 0 ? (
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', textAlign: 'center', color: theme.textSec, background: 'white', padding: '40px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>No bills found.</p>
            ) : (
              paginatedBills.map(b => renderBillCard(b))
            )
          )}
        </div>

        {(user?.role === 'admin' ? hasMoreGroups : hasMoreBills) && (
          <button onClick={() => setPage(page + 1)} style={{
            width: '100%', marginTop: '20px', padding: '12px', background: 'white', borderRadius: '12px', border: `1px dashed ${theme.border}`, color: theme.textMain,
            fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s'
          }} onMouseOver={(e) => e.target.style.background = '#F9F8F3'} onMouseOut={(e) => e.target.style.background = 'white'}>
            Load More Records
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintenanceBills;
