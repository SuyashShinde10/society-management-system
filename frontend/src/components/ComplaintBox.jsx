import React, { useState, useContext } from 'react';
import { toast } from 'sonner';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { AlertCircle } from 'lucide-react';

const ComplaintBox = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ title: '', description: '', attachment: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const queryClient = useQueryClient();

  const isNew = (dateString) => {
    if (!dateString) return false;
    const diffTime = Math.abs(new Date() - new Date(dateString));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['complaints'],
    queryFn: async ({ pageParam = null }) => {
      const url = pageParam ? `/complaints?cursor=${pageParam}` : '/complaints';
      const response = await api.get(url);
      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    refetchInterval: 30000, // Background polling
  });

  const complaintsList = data ? data.pages.flatMap(page => page.complaints || page) : [];

  const postMutation = useMutation({
    mutationFn: (newComplaint) => api.post('/complaints', newComplaint),
    onSuccess: () => {
      setForm({ title: '', description: '', attachment: '' });
      queryClient.invalidateQueries(['complaints']);
      toast.success('Incident report filed successfully.');
    },
    onError: () => toast.error('Failed to submit report. Please try again.'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/complaints/status/${id}`, { status }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['complaints']);
      toast.success(`Complaint marked as ${variables.status}.`);
    },
    onError: () => toast.error('Failed to update status.'),
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) { // 3MB limit
      toast.error('File size must be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, attachment: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (form.title.trim().length < 5) {
      toast.error('Title must be at least 5 characters long.');
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters long.');
      return;
    }
    postMutation.mutate(form);
  };

  const handleStatusUpdate = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).replace(',', ' //');
  };

  const filteredComplaints = complaintsList.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <div style={{ background: '#FEE2E2', padding: '10px', borderRadius: '12px' }}>
          <AlertCircle size={24} color="#DC2626" />
        </div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          Incident Logs
        </h3>
      </div>

      <div style={{ padding: '0' }}>
        {/* MEMBER INPUT SECTION */}
        {user && user.role !== 'admin' && (
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px', background: 'white', padding: '24px', borderRadius: '20px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: '600', color: theme.textSec }}>File New Incident</span>
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{
                flex: 1, padding: '12px', background: '#F9F8F3', border: `1px dashed ${theme.border}`, 
                borderRadius: '12px', textAlign: 'center', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: theme.textMain
              }}>
                📄 Upload File (Max 3MB)
                <input type="file" accept="*/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              <label style={{
                flex: 1, padding: '12px', background: '#F9F8F3', border: `1px dashed ${theme.border}`, 
                borderRadius: '12px', textAlign: 'center', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: theme.textMain
              }}>
                📷 Take Photo / Video
                <input type="file" accept="image/*,video/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
            
            {form.attachment && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#EEF2FF', borderRadius: '8px', border: '1px solid #C7D2FE' }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: '#4F46E5', fontWeight: '600' }}>
                  ✓ EVIDENCE ATTACHED
                </span>
                <button type="button" onClick={() => setForm({ ...form, attachment: '' })} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                  Remove
                </button>
              </div>
            )}
            <button type="submit" style={{
              background: theme.textMain, color: 'white', border: 'none', padding: '14px', borderRadius: '12px',
              fontFamily: "'Outfit', sans-serif", fontWeight: '600', fontSize: '15px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
            }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
              File Incident Report
            </button>
          </form>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="SEARCH INCIDENTS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="organic-input" 
            style={{ flex: 1, padding: '10px', boxSizing: 'border-box', fontFamily: "'Outfit', sans-serif" }}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="organic-input" style={{ padding: '10px', fontFamily: "'Outfit', sans-serif" }}>
            <option value="All">STATUS: ALL</option>
            <option value="Pending">STATUS: PENDING</option>
            <option value="Resolved">STATUS: RESOLVED</option>
            <option value="Declined">STATUS: DECLINED</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '60vh', paddingRight: '10px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <img src="/awaastech-logo.png" alt="Loading" className="organic-pulse" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', color: theme.textSec, padding: '40px', background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}`, fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
              No incidents on record.
            </div>
          ) : (
            filteredComplaints.map((c) => (
              <div
                key={c._id}
                style={{
                  background: 'white', borderRadius: '20px', padding: '24px',
                  border: `1px solid ${theme.border}`, transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  borderLeft: `6px solid ${c.status === 'Resolved' ? theme.resolved : c.status === 'Declined' ? theme.declined : theme.pending}`
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain, fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                    {c.title}
                    {isNew(c.createdAt) && (
                      <span style={{
                        fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: '700',
                        background: '#10B981', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '10px'
                      }}>NEW</span>
                    )}
                  </h4>
                  <span style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: '700',
                    padding: '4px 10px', border: `1px solid ${theme.textMain}`, textTransform: 'uppercase',
                    background: c.status === 'Resolved' ? theme.resolved : c.status === 'Declined' ? theme.declined : theme.pending,
                    color: c.status === 'Pending' ? theme.textMain : 'white'
                  }}>
                    {c.status}
                  </span>
                </div>

                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', marginBottom: '15px' }}>
                  <div style={{ color: theme.textMain, fontWeight: '700' }}>
                    [ ORIGIN: {c.user?.name?.toUpperCase() || 'UNKNOWN'} ]
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
                  fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: theme.textSec,
                  lineHeight: '1.6', background: '#F5F5F4', padding: '15px', border: '1px solid #E7E5E4'
                }}>
                  {c.description}
                </p>

                {c.attachment && (
                  <div style={{ marginTop: '15px' }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', fontWeight: '700', color: theme.textMain }}>
                      // EVIDENCE_ATTACHED:
                    </span>
                    <div style={{ marginTop: '10px' }}>
                      {c.attachment.startsWith('data:image') ? (
                        <img src={c.attachment} alt="Evidence" style={{ maxWidth: '100%', maxHeight: '300px', border: `1px solid ${theme.border}` }} />
                      ) : (
                        <a href={c.attachment} download="evidence_file" style={{ color: theme.accent, textDecoration: 'underline', fontFamily: "'Outfit', sans-serif", fontSize: '13px' }}>
                          [ DOWNLOAD_ATTACHED_FILE ]
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                {user && user.role === 'admin' && c.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button
                      onClick={() => handleStatusUpdate(c._id, 'Resolved')}
                      style={{ flex: 1, padding: '12px', background: theme.resolved, color: 'white', border: 'none', borderRadius: '10px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onMouseOver={(e) => e.target.style.opacity = '0.9'} onMouseOut={(e) => e.target.style.opacity = '1'}
                    >
                      Approve & Resolve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(c._id, 'Declined')}
                      style={{ flex: 1, padding: '12px', background: theme.declined, color: 'white', border: 'none', borderRadius: '10px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onMouseOver={(e) => e.target.style.opacity = '0.9'} onMouseOut={(e) => e.target.style.opacity = '1'}
                    >
                      Decline Issue
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {hasNextPage && (
          <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'white', borderRadius: '12px', border: `1px dashed ${theme.border}`, color: theme.textMain, fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: isFetchingNextPage ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: isFetchingNextPage ? 0.6 : 1 }} onMouseOver={(e) => !isFetchingNextPage && (e.target.style.background = '#F9F8F3')} onMouseOut={(e) => !isFetchingNextPage && (e.target.style.background = 'white')}>
            {isFetchingNextPage ? 'Loading more...' : 'Load More Records'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ComplaintBox;