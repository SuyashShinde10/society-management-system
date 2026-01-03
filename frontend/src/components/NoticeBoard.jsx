import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const NoticeBoard = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', type: 'General' });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/notices');
      setNotices(data);
    } catch (error) {
      console.error("Failed to fetch notices");
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return alert("Please fill in all fields");

    try {
      await api.post('/notices', form);
      setForm({ title: '', description: '', type: 'General' });
      fetchNotices();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to post notice";
      alert(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (error) {
      alert("Failed to delete notice");
    }
  };

  // Helper to format Date & Time
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>📢 Notice Board</h2>

      {/* --- ADD NOTICE FORM (ADMIN ONLY) --- */}
      {user && user.role === 'admin' && (
        <form onSubmit={handlePost} style={formContainerStyle}>
          <input 
            placeholder="Notice Title" 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })} 
            style={inputStyle} 
          />
          <textarea 
            placeholder="Write your notice details here..." 
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} 
          />
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <select 
              value={form.type} 
              onChange={(e) => setForm({ ...form, type: e.target.value })} 
              style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}
            >
              <option>General</option>
              <option>Meeting</option>
              <option>Event</option>
              <option>Maintenance</option>
              <option>Urgent</option>
            </select>
            
            <button type="submit" style={buttonStyle}>
              Post Notice
            </button>
          </div>
        </form>
      )}

      {/* --- NOTICE LIST --- */}
      <div style={listContainerStyle}>
        {notices.length === 0 ? (
          <div style={emptyStateStyle}>No notices posted yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {notices.map((notice) => (
              <li key={notice._id} style={{ ...noticeCardStyle, borderLeft: `6px solid ${getColor(notice.type)}` }}>
                
                {/* Header: Title + Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem', fontWeight: '700' }}>{notice.title}</h4>
                  <span style={badgeStyle(notice.type)}>
                    {notice.type}
                  </span>
                </div>

                {/* Date/Time Row */}
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px', fontWeight: '500' }}>
                  🕒 {formatDate(notice.createdAt)}
                </div>
                
                {/* Description */}
                <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {notice.description}
                </p>
                
                {user && user.role === 'admin' && (
                  <div style={{ textAlign: 'right', marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button 
                      onClick={() => handleDelete(notice._id)} 
                      style={deleteButtonStyle}
                    >
                      Delete Notice
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

// --- STYLES & HELPERS ---

const getColor = (type) => {
  switch(type) {
    case 'Urgent': return '#ef4444';
    case 'Meeting': return '#8b5cf6';
    case 'Event': return '#10b981';
    case 'Maintenance': return '#f59e0b';
    default: return '#3b82f6';
  }
};

const containerStyle = {
  background: 'white',
  padding: '25px', 
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #e2e8f0',
  boxSizing: 'border-box'
};

const headerStyle = {
  borderBottom: '2px solid #e2e8f0',
  paddingBottom: '20px',
  marginBottom: '20px',
  color: '#1e293b',
  marginTop: 0,
  fontSize: '1.5rem', 
  fontWeight: '800',
  letterSpacing: '-0.5px'
};

const formContainerStyle = {
  background: '#f8fafc',
  padding: '20px', 
  borderRadius: '10px',
  marginBottom: '25px',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  border: '1px solid #e2e8f0'
};

const inputStyle = {
  padding: '12px 15px', 
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '1rem',
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const buttonStyle = {
  background: '#2563eb',
  color: 'white',
  border: 'none',
  padding: '12px 25px', 
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '1rem',
  whiteSpace: 'nowrap',
  transition: 'background 0.2s'
};

const listContainerStyle = {
  flex: 1,
  overflowY: 'auto',
  maxHeight: '500px', 
  paddingRight: '10px'
};

const emptyStateStyle = {
  textAlign: 'center',
  color: '#94a3b8',
  padding: '40px',
  fontSize: '1rem',
  fontStyle: 'italic',
  background: '#f8fafc',
  borderRadius: '8px'
};

const noticeCardStyle = {
  background: 'white',
  marginBottom: '20px', 
  padding: '20px',      
  borderRadius: '10px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  border: '1px solid #f1f5f9'
};

const badgeStyle = (type) => ({
  fontSize: '0.8rem',
  background: getColor(type) + '15',
  color: getColor(type),
  padding: '6px 12px', 
  borderRadius: '20px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
});

const deleteButtonStyle = {
  background: 'transparent',
  color: '#ef4444',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '600',
  padding: '5px 10px',
  borderRadius: '6px',
  transition: 'background 0.2s',
  textDecoration: 'underline'
};

export default NoticeBoard;