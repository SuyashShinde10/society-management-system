import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const NoticeBoard = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // <--- Using 'content'

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
    if (!title || !content) return alert("Fill all fields");

    try {
      // Sending 'content' key to match backend
      await api.post('/notices', { title, content });
      setTitle('');
      setContent('');
      fetchNotices();
    } catch (error) {
      alert("Failed to post notice");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>📢 Notice Board</h3>

      {user && user.role === 'admin' && (
        <form onSubmit={handlePost} style={formStyle}>
          <input 
            placeholder="Notice Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={inputStyle} 
          />
          <textarea 
            placeholder="Write notice details..." 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            style={{...inputStyle, minHeight: '60px'}} 
          />
          <button type="submit" style={buttonStyle}>Post Notice</button>
        </form>
      )}

      <div style={listStyle}>
        {notices.length === 0 ? <p style={{color: '#94a3b8', textAlign:'center'}}>No notices yet.</p> : (
          notices.map((n) => (
            <div key={n._id} style={cardStyle}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <h4 style={{margin:'0 0 5px 0', color: '#1e293b'}}>{n.title}</h4>
                {user.role === 'admin' && (
                  <button onClick={() => handleDelete(n._id)} style={deleteBtn}>×</button>
                )}
              </div>
              <p style={{margin:0, color: '#64748b', fontSize:'0.9rem'}}>{n.content}</p>
              <span style={{fontSize:'0.75rem', color:'#cbd5e1', marginTop:'8px', display:'block'}}>
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%', border: '1px solid #e2e8f0' };
const headerStyle = { margin: '0 0 20px 0', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' };
const buttonStyle = { padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const listStyle = { display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto' };
const cardStyle = { background: '#f8fafc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' };
const deleteBtn = { background: 'transparent', border: 'none', color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer', lineHeight: '0.5' };

export default NoticeBoard;