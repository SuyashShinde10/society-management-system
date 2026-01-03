import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const ComplaintBox = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });

  const fetchComplaints = useCallback(async () => {
    try {
      const { data } = await api.get('/complaints');
      setComplaints(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return alert("Please fill in all fields");
    try {
      await api.post('/complaints', form);
      setForm({ title: '', description: '' });
      fetchComplaints();
    } catch (error) {
      alert("Failed to post complaint");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/complaints/status/${id}`, { status: newStatus });
      fetchComplaints();
    } catch (error) {
      alert("Error updating status");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={wideContainerStyle}>
      <h2 style={wideHeaderStyle}>🗳️ Complaint Box</h2>

      {/* Member Form Section */}
      {user && user.role !== 'admin' && (
        <form onSubmit={handlePost} style={formContainerStyle}>
          <input 
            placeholder="Issue Title (e.g., Water Leakage)" 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })} 
            style={inputStyle} 
          />
          <textarea 
            placeholder="Describe the issue in detail..." 
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} 
          />
          <button type="submit" style={buttonStyle}>Raise Complaint</button>
        </form>
      )}

      <div style={listScrollStyle}>
        {complaints.length === 0 ? (
          <div style={emptyStyle}>No complaints raised yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {complaints.map((c) => (
              <li key={c._id} style={{ 
                ...wideCardStyle, 
                borderLeft: c.status === 'Resolved' ? '8px solid #10b981' : 
                            c.status === 'Declined' ? '8px solid #ef4444' : '8px solid #f59e0b' 
              }}>
                
                {/* Header: Title + Status */}
                <div style={cardHeaderRow}>
                  <h4 style={titleStyle}>{c.title}</h4>
                  <span style={badgeStyle(c.status)}>{c.status}</span>
                </div>

                {/* --- NEW: RAISED BY SECTION --- */}
                <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '5px', fontWeight: '500' }}>
                   👤 <strong>From: </strong>
                   {c.user ? c.user.name : 'Unknown Member'}
                   
                   {/* Show Flat Details if available */}
                   {c.user && c.user.flatDetails && (
                     <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                       {` (Wing ${c.user.flatDetails.wing} - ${c.user.flatDetails.flatNumber})`}
                     </span>
                   )}
                </div>

                {/* Time Info */}
                <div style={timeInfoStyle}>
                  🕒 {formatDate(c.createdAt)}
                  {c.status !== 'Pending' && (
                    <span style={{ marginLeft: '15px', color: c.status === 'Resolved' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                      ● {c.status} on: {formatDate(c.updatedAt)}
                    </span>
                  )}
                </div>

                <p style={descStyle}>{c.description}</p>

                {/* Admin Actions */}
                {user && user.role === 'admin' && c.status === 'Pending' && (
                  <div style={adminActionsRow}>
                    <button onClick={() => handleStatusUpdate(c._id, 'Resolved')} style={resolveBtn}>
                      Approve & Resolve
                    </button>
                    <button onClick={() => handleStatusUpdate(c._id, 'Declined')} style={declineBtn}>
                      Decline Issue
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// --- STYLES ---
const wideContainerStyle = { background: 'white', padding: '30px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' };
const wideHeaderStyle = { fontSize: '1.6rem', fontWeight: '800', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '25px', color: '#0f172a' };
const formContainerStyle = { background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid #e2e8f0' };
const inputStyle = { padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const buttonStyle = { background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', width: '100%' };
const listScrollStyle = { maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' };
const wideCardStyle = { background: '#fff', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const cardHeaderRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' };
const titleStyle = { margin: 0, fontSize: '1.2rem', color: '#1e293b' };
const timeInfoStyle = { fontSize: '0.85rem', color: '#94a3b8', marginBottom: '15px' };
const descStyle = { color: '#475569', lineHeight: '1.7', fontSize: '1rem', marginBottom: '20px' };
const adminActionsRow = { display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' };

const badgeStyle = (status) => ({
  padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
  background: status === 'Resolved' ? '#d1fae5' : status === 'Declined' ? '#fee2e2' : '#fef3c7',
  color: status === 'Resolved' ? '#065f46' : status === 'Declined' ? '#991b1b' : '#92400e'
});

const resolveBtn = { background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const declineBtn = { background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const emptyStyle = { textAlign: 'center', color: '#94a3b8', padding: '40px', fontStyle: 'italic' };

export default ComplaintBox;