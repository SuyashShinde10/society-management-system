import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { Bell } from 'lucide-react';

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

  const isNew = (dateString) => {
    if (!dateString) return false;
    const diffTime = Math.abs(new Date() - new Date(dateString));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <div style={{ background: '#F9F8F3', padding: '10px', borderRadius: '12px' }}>
          <Bell size={24} color={theme.accent} />
        </div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          Notice Board
        </h3>
      </div>

      <div style={{ padding: '0' }}>
        {user && user.role === 'admin' && (
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px', background: 'white', padding: '24px', borderRadius: '20px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: '600', color: theme.textSec }}>Compose New Broadcast</span>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <select 
                value={targetType} 
                onChange={e => setTargetType(e.target.value)} 
                className="dispatch-input"
                style={{ flex: 1, fontFamily: "'Outfit', sans-serif", border: `1px solid ${theme.border}`, background: theme.fieldBg, padding: '10px', outline: 'none', fontSize: '13px' }}
              >
                <option value="All">TARGET: ALL MEMBERS</option>
                <option value="Specific">TARGET: SPECIFIC MEMBER</option>
              </select>

              {targetType === 'Specific' && (
                <select 
                  value={targetUserId} 
                  onChange={e => setTargetUserId(e.target.value)} 
                  className="dispatch-input"
                  style={{ flex: 1, fontFamily: "'Outfit', sans-serif", border: `1px solid ${theme.border}`, background: theme.fieldBg, padding: '10px', outline: 'none', fontSize: '13px' }}
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
              style={{ fontFamily: "'Outfit', sans-serif", border: `1px solid ${theme.border}`, background: theme.fieldBg, padding: '10px', outline: 'none', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="BODY_CONTENT"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ fontFamily: "'Outfit', sans-serif", border: `1px solid ${theme.border}`, background: theme.fieldBg, padding: '10px', outline: 'none', fontSize: '13px', minHeight: '80px', width: '100%', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{
              background: theme.accent, color: 'white', border: 'none', padding: '14px', borderRadius: '12px',
              fontFamily: "'Outfit', sans-serif", fontWeight: '600', fontSize: '15px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(217,115,78,0.2)', transition: 'transform 0.2s'
            }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
              Post Notice
            </button>
          </form>
        )}

        <input 
          type="text" 
          placeholder="SEARCH NOTICES..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="organic-input" 
          style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box', fontFamily: "'Outfit', sans-serif" }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <img src="/awaastech-logo.png" alt="Loading" className="organic-pulse" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            </div>
          ) : paginatedNotices.length === 0 ? (
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', padding: '40px', textAlign: 'center', background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}`, color: theme.textSec }}>
              No notices available.
            </p>
          ) : (
            paginatedNotices.map((n) => (
              <div key={n._id} style={{ background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain, fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                    {n.title}
                    {isNew(n.createdAt) && (
                      <span style={{
                        fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: '700',
                        background: '#10B981', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '10px'
                      }}>NEW</span>
                    )}
                  </h4>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(n._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: '#ef4444' }}>
                      [X]
                    </button>
                  )}
                </div>
                <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: theme.textSec, lineHeight: '1.4' }}>
                  {n.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: '700', background: '#E8E8E8', padding: '2px 6px' }}>
                    DATE: {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: "'Outfit', sans-serif", opacity: 0.4 }}>
                    ID: {n._id.substring(0, 8)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        {hasMore && (
          <button onClick={() => setPage(page + 1)} style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'white', borderRadius: '12px', border: `1px dashed ${theme.border}`, color: theme.textMain, fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#F9F8F3'} onMouseOut={(e) => e.target.style.background = 'white'}>
            Load More Records
          </button>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;