import React, { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { socket } from '../socket';

const ComplaintBox = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchComplaints = useCallback(async () => {
    try {
      const { data } = await api.get('/complaints');
      setComplaints(data);
    } catch (error) {
      console.error('// INCIDENT_FETCH_ERROR');
    }
  }, []);

  useEffect(() => {
    fetchComplaints();

    const handleNewComplaint = (complaint) => {
      setComplaints((prev) => [complaint, ...prev]);
    };

    const handleUpdateComplaint = (updatedComplaint) => {
      setComplaints((prev) => prev.map(c => c._id === updatedComplaint._id ? updatedComplaint : c));
    };

    const handleDeleteComplaint = (id) => {
      setComplaints((prev) => prev.filter(c => c._id !== id));
    };

    socket.on('new_complaint', handleNewComplaint);
    socket.on('update_complaint', handleUpdateComplaint);
    socket.on('delete_complaint', handleDeleteComplaint);

    return () => {
      socket.off('new_complaint', handleNewComplaint);
      socket.off('update_complaint', handleUpdateComplaint);
      socket.off('delete_complaint', handleDeleteComplaint);
    };
  }, [fetchComplaints]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error('Please fill in all required fields.');
      return;
    }
    try {
      await api.post('/complaints', form);
      setForm({ title: '', description: '' });
      fetchComplaints();
      toast.success('Incident report filed successfully.');
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/complaints/status/${id}`, { status: newStatus });
      fetchComplaints();
      toast.success(`Complaint marked as ${newStatus}.`);
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).replace(',', ' //');
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const paginatedComplaints = filteredComplaints.slice(0, page * limit);
  const hasMore = paginatedComplaints.length < filteredComplaints.length;

  return (
    <div style={{ background: theme.surface, border: `3px solid ${theme.border}`, height: '100%', position: 'relative' }}>
      {/* HEADER */}
      <div style={{ background: theme.textMain, color: 'white', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>🗳️</span>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', letterSpacing: '2px', fontSize: '18px' }}>
          Incident_Logs
        </h3>
      </div>

      <div style={{ padding: '25px' }}>
        {/* MEMBER INPUT SECTION */}
        {user && user.role !== 'admin' && (
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px', background: '#F9F9F9', padding: '20px', border: `1px dashed ${theme.border}` }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700' }}>// INITIALIZE_NEW_REPORT</span>
            <input
              placeholder="INCIDENT_TITLE"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="incident-input"
            />
            <textarea
              placeholder="DETAILED_DESCRIPTION"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="incident-input"
              style={{ minHeight: '80px' }}
            />
            <button type="submit" style={{
              background: theme.textMain, color: 'white', border: 'none', padding: '14px',
              fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer',
              boxShadow: `6px 6px 0px ${theme.accent}`
            }}>
              FILE_INCIDENT_REPORT
            </button>
          </form>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="SEARCH INCIDENTS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="brutal-input" 
            style={{ flex: 1, padding: '10px', boxSizing: 'border-box', fontFamily: "'Space Mono', monospace" }}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="brutal-input" style={{ padding: '10px', fontFamily: "'Space Mono', monospace" }}>
            <option value="All">STATUS: ALL</option>
            <option value="Pending">STATUS: PENDING</option>
            <option value="Resolved">STATUS: RESOLVED</option>
            <option value="Declined">STATUS: DECLINED</option>
          </select>
        </div>

        <div style={{ overflowY: 'auto', border: `1px solid ${theme.border}` }}>
          {paginatedComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', color: theme.textSec, padding: '40px', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>
              // NO_INCIDENTS_ON_RECORD
            </div>
          ) : (
            paginatedComplaints.map((c) => (
              <div
                key={c._id}
                style={{
                  borderBottom: `2px solid ${theme.textMain}`, padding: '25px', transition: 'all 0.2s',
                  borderLeft: `12px solid ${c.status === 'Resolved' ? theme.resolved : c.status === 'Declined' ? theme.declined : theme.pending}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain, textTransform: 'uppercase' }}>
                    {c.title}
                  </h4>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: '10px', fontWeight: '700',
                    padding: '4px 10px', border: `1px solid ${theme.textMain}`, textTransform: 'uppercase',
                    background: c.status === 'Resolved' ? theme.resolved : c.status === 'Declined' ? theme.declined : theme.pending,
                    color: c.status === 'Pending' ? theme.textMain : 'white'
                  }}>
                    {c.status}
                  </span>
                </div>

                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', marginBottom: '15px' }}>
                  <div style={{ color: theme.textMain, fontWeight: '700' }}>
                    [ ORIGIN: {c.user ? c.user.name.toUpperCase() : 'UNKNOWN'} ]
                  </div>
                  {c.user?.flatDetails && (
                    <div style={{ color: theme.textSec, marginTop: '4px' }}>
                      LOCATION: WNG_{c.user.flatDetails.wing} // UNIT_{c.user.flatDetails.flatNumber}
                    </div>
                  )}
                  <div style={{ color: theme.accent, marginTop: '8px', fontSize: '11px' }}>
                    TIMESTAMP: {formatDate(c.createdAt)}
                  </div>
                </div>

                <p style={{
                  fontFamily: "'Space Mono', monospace", fontSize: '13px', color: theme.textSec,
                  lineHeight: '1.6', background: '#F5F5F4', padding: '15px', border: '1px solid #E7E5E4'
                }}>
                  {c.description}
                </p>

                {/* Admin Actions */}
                {user && user.role === 'admin' && c.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button
                      onClick={() => handleStatusUpdate(c._id, 'Resolved')}
                      style={{ flex: 1, padding: '10px', background: theme.resolved, color: 'white', border: 'none', fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer' }}
                    >
                      [ APPROVE_RESOLVE ]
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(c._id, 'Declined')}
                      style={{ flex: 1, padding: '10px', background: theme.declined, color: 'white', border: 'none', fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer' }}
                    >
                      [ DECLINE_ISSUE ]
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <button onClick={() => setPage(page + 1)} style={{ width: '100%', marginTop: '20px', padding: '10px', background: 'transparent', border: `2px dashed ${theme.border}`, fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer' }}>
            LOAD_MORE_RECORDS
          </button>
        )}
      </div>
    </div>
  );
};

export default ComplaintBox;