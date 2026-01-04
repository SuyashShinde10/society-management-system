import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const ComplaintBox = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });

  const theme = {
    bg: '#F2F2F2',
    surface: '#FFFFFF',
    textMain: '#1A1A1A',
    textSec: '#4A4A4A',
    border: '#1A1A1A',
    accent: '#2563EB',
    resolved: '#10b981',
    declined: '#ef4444',
    pending: '#f59e0b'
  };

  const fetchComplaints = useCallback(async () => {
    try {
      const { data } = await api.get('/complaints');
      setComplaints(data);
    } catch (error) {
      console.error("// INCIDENT_FETCH_ERROR");
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return alert("REQUIRED_FIELDS_MISSING");
    try {
      await api.post('/complaints', form);
      setForm({ title: '', description: '' });
      fetchComplaints();
    } catch (error) {
      alert("SUBMISSION_FAILED");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/complaints/status/${id}`, { status: newStatus });
      fetchComplaints();
    } catch (error) {
      alert("STATUS_UPDATE_REJECTED");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).replace(',', ' //');
  };

  return (
    <div style={{ background: theme.surface, border: `3px solid ${theme.border}`, height: '100%', position: 'relative' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          .incident-input {
            font-family: 'Space Mono', monospace;
            border: 1px solid #1A1A1A;
            background: #F2F2F2;
            padding: 12px;
            outline: none;
            font-size: 13px;
          }

          .incident-input:focus {
            background: #fff;
            box-shadow: 4px 4px 0px #1A1A1A;
          }

          .incident-card {
            border-bottom: 2px solid #1A1A1A;
            padding: 25px;
            transition: all 0.2s;
          }

          .incident-card:hover {
            background: #FAFAFA;
          }

          .status-flag {
            font-family: 'Space Mono', monospace;
            font-size: 10px;
            font-weight: 700;
            padding: 4px 10px;
            border: 1px solid #1A1A1A;
            text-transform: uppercase;
          }
        `}
      </style>

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
              background: theme.textMain, 
              color: 'white', 
              border: 'none', 
              padding: '14px', 
              fontFamily: "'Space Mono', monospace", 
              fontWeight: '700', 
              cursor: 'pointer',
              boxShadow: `6px 6px 0px ${theme.accent}`
            }}>
              FILE_INCIDENT_REPORT
            </button>
          </form>
        )}

        <div style={{ maxHeight: '600px', overflowY: 'auto', border: `1px solid ${theme.border}` }}>
          {complaints.length === 0 ? (
            <div style={{ textAlign: 'center', color: theme.textSec, padding: '40px', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>
              // NO_INCIDENTS_ON_RECORD
            </div>
          ) : (
            complaints.map((c) => (
              <div key={c._id} className="incident-card" style={{ 
                borderLeft: `12px solid ${
                  c.status === 'Resolved' ? theme.resolved : 
                  c.status === 'Declined' ? theme.declined : theme.pending
                }` 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain, textTransform: 'uppercase' }}>
                    {c.title}
                  </h4>
                  <span className="status-flag" style={{ 
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
                  fontFamily: "'Space Mono', monospace", 
                  fontSize: '13px', 
                  color: theme.textSec, 
                  lineHeight: '1.6',
                  background: '#F5F5F4',
                  padding: '15px',
                  border: '1px solid #E7E5E4'
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
      </div>
    </div>
  );
};

export default ComplaintBox;