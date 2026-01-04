import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const NoticeBoard = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const theme = {
    bg: '#F2F2F2',
    surface: '#FFFFFF',
    textMain: '#1A1A1A',
    textSec: '#4A4A4A',
    border: '#1A1A1A',
    accent: '#2563EB',
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/notices');
      setNotices(data);
    } catch (error) {
      console.error("// DISPATCH_FETCH_ERROR");
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert("All fields required.");
    try {
      await api.post('/notices', { title, content });
      setTitle('');
      setContent('');
      fetchNotices();
    } catch (error) {
      alert("BROADCAST_FAILURE");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("// DELETE_NOTICE: Proceed?")) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (error) {
      alert("TERMINATION_FAILED");
    }
  };

  return (
    <div style={{ background: theme.surface, height: '100%', border: `3px solid ${theme.border}`, padding: '0' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          .dispatch-input {
            font-family: 'Space Mono', monospace;
            border: 1px solid #1A1A1A;
            background: #F2F2F2;
            padding: 10px;
            outline: none;
            font-size: 13px;
          }

          .dispatch-input:focus {
            background: #fff;
            box-shadow: 4px 4px 0px #1A1A1A;
          }

          .notice-item {
            border-bottom: 1px solid #1A1A1A;
            padding: 20px;
            transition: background 0.2s;
          }

          .notice-item:hover {
            background: #F9F9F9;
          }
        `}
      </style>

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
            />
            <textarea 
              placeholder="BODY_CONTENT" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="dispatch-input"
              style={{ minHeight: '80px' }}
            />
            <button type="submit" style={{ 
              background: theme.accent, 
              color: 'white', 
              border: 'none', 
              padding: '12px', 
              fontFamily: "'Space Mono', monospace", 
              fontWeight: '700', 
              cursor: 'pointer',
              boxShadow: '4px 4px 0px #1A1A1A'
            }}>
              EXECUTE_POST
            </button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '500px', overflowY: 'auto', border: `1px solid ${theme.border}` }}>
          {notices.length === 0 ? (
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', padding: '20px', textAlign: 'center' }}>// NO_DATA_AVAILABLE</p>
          ) : (
            notices.map((n) => (
              <div key={n._id} className="notice-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', textTransform: 'uppercase', color: theme.textMain }}>
                    {n.title}
                  </h4>
                  {user.role === 'admin' && (
                    <button onClick={() => handleDelete(n._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: '#ef4444' }}>[X]</button>
                  )}
                </div>
                <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: '13px', color: theme.textSec, lineHeight: '1.4' }}>
                  {n.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', fontWeight: '700', background: '#E8E8E8', padding: '2px 6px' }}>
                    DATE: {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", opacity: 0.4 }}>ID: {n._id.substring(0,8)}</span>
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