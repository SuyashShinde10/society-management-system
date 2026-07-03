import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';

const NoticeBoard = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('All');
  const [targetUserId, setTargetUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    fetchNotices();
    if (user?.role === 'admin') {
      fetchUsers();
    }
    
    // Vercel-compatible real-time fallback (Short Polling)
    const interval = setInterval(() => {
      fetchNotices(false);
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

  const fetchNotices = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const { data } = await api.get('/notices');
      setNotices(data);
    } catch (error) {
      console.error('// DISPATCH_FETCH_ERROR');
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (title.trim().length < 5) {
      toast.error('Title must be at least 5 characters long.');
      return;
    }
    if (targetType === 'Specific' && !targetUserId) {
      toast.error('Please select a specific member.');
      return;
    }
    try {
      await api.post('/notices', { title, content, targetType, targetUserId });
      setTitle('');
      setContent('');
      setTargetType('All');
      setTargetUserId('');
      fetchNotices();
      toast.success('Notice posted successfully.');
    } catch (error) {
      toast.error('Failed to post notice. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    toast('Delete this notice?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await api.delete(`/notices/${id}`);
            fetchNotices();
            toast.success('Notice removed.');
          } catch (error) {
            toast.error('Failed to delete notice.');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const paginatedNotices = filteredNotices.slice(0, page * limit);
  const hasMore = paginatedNotices.length < filteredNotices.length;

  return (
    <div style={{ background: theme.surface, height: '100%', border: `3px solid ${theme.border}`, padding: '0' }}>
      {/* HEADER */}
      <div style={{ background: theme.textMain, color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>📢</span>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', letterSpacing: '2px', fontSize: '18px' }}>
          Official_Dispatches
        </h3>
      </div>

      <div style={{ padding: '20px' }}>
        {user && user.role === 'admin' && (
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', borderBottom: `4px double ${theme.border}`, paddingBottom: '30px' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700' }}>// COMPOSE_NEW_BROADCAST</span>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <select 
                value={targetType} 
                onChange={e => setTargetType(e.target.value)} 
                className="dispatch-input"
                style={{ flex: 1, fontFamily: "'Space Mono', monospace", border: `1px solid ${theme.border}`, background: theme.fieldBg, padding: '10px', outline: 'none', fontSize: '13px' }}
              >
                <option value="All">TARGET: ALL MEMBERS</option>
                <option value="Specific">TARGET: SPECIFIC MEMBER</option>
              </select>

              {targetType === 'Specific' && (
                <select 
                  value={targetUserId} 
                  onChange={e => setTargetUserId(e.target.value)} 
                  className="dispatch-input"
                  style={{ flex: 1, fontFamily: "'Space Mono', monospace", border: `1px solid ${theme.border}`, background: theme.fieldBg, padding: '10px', outline: 'none', fontSize: '13px' }}
                  required
                >
                  <option value="">-- Choose Member --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} (Flat {u.flatDetails?.wing}-{u.flatDetails?.flatNumber})</option>
                  ))}
                </select>
              )}
            </div>

            <input
              placeholder="TITLE"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="dispatch-input"
              style={{ fontFamily: "'Space Mono', monospace", border: `1px solid ${theme.border}`, background: theme.fieldBg, padding: '10px', outline: 'none', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="BODY_CONTENT"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ fontFamily: "'Space Mono', monospace", border: `1px solid ${theme.border}`, background: theme.fieldBg, padding: '10px', outline: 'none', fontSize: '13px', minHeight: '80px', width: '100%', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{
              background: theme.accent, color: 'white', border: 'none', padding: '12px',
              fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer',
              boxShadow: `4px 4px 0px ${theme.textMain}`
            }}>
              EXECUTE_POST
            </button>
          </form>
        )}

        <input 
          type="text" 
          placeholder="SEARCH NOTICES..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="brutal-input" 
          style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box', fontFamily: "'Space Mono', monospace" }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '60vh', overflowY: 'auto', border: `1px solid ${theme.border}`, paddingRight: '5px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <span className="spinner"></span>
            </div>
          ) : paginatedNotices.length === 0 ? (
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', padding: '20px', textAlign: 'center' }}>
              // NO_DATA_AVAILABLE
            </p>
          ) : (
            paginatedNotices.map((n) => (
              <div key={n._id} style={{ borderBottom: `1px solid ${theme.textMain}`, padding: '20px', transition: 'background 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', textTransform: 'uppercase', color: theme.textMain }}>
                    {n.title}
                  </h4>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(n._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: '#ef4444' }}>
                      [X]
                    </button>
                  )}
                </div>
                <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: '13px', color: theme.textSec, lineHeight: '1.4' }}>
                  {n.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', fontWeight: '700', background: '#E8E8E8', padding: '2px 6px' }}>
                    DATE: {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", opacity: 0.4 }}>
                    ID: {n._id.substring(0, 8)}
                  </span>
                </div>
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

export default NoticeBoard;