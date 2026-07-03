import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';

const NoticeBoard = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/notices');
      setNotices(data);
    } catch (error) {
      console.error('// DISPATCH_FETCH_ERROR');
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Please fill in all fields.');
      return;
    }
    try {
      await api.post('/notices', { title, content });
      setTitle('');
      setContent('');
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
            <input
              placeholder="TITLE"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="dispatch-input"
              style={{ fontFamily: "'Space Mono', monospace", border: `1px solid ${theme.border}`, background: theme.fieldBg, padding: '10px', outline: 'none', fontSize: '13px', width: '100%' }}
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

        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '500px', overflowY: 'auto', border: `1px solid ${theme.border}` }}>
          {notices.length === 0 ? (
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', padding: '20px', textAlign: 'center' }}>
              // NO_DATA_AVAILABLE
            </p>
          ) : (
            notices.map((n) => (
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
      </div>
    </div>
  );
};

export default NoticeBoard;