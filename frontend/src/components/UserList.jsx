import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const UserList = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    wing: '',
    floor: '',
    flatNumber: '',
    residentType: 'Owner'
  });

  const theme = {
    bg: '#F2F2F2',
    surface: '#FFFFFF',
    textMain: '#1A1A1A',
    textSec: '#4A4A4A',
    border: '#1A1A1A',
    accent: '#2563EB',
    fieldBg: '#E8E8E8'
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    if (user && user.role === 'admin') {
      try {
        const { data } = await api.get('/auth/users');
        setUsers(data);
      } catch (error) {
        console.error("// DATABASE_ACCESS_ERROR");
      }
    }
  };

  const handleEditClick = (u) => {
    setEditingId(u._id);
    setEditFormData({
      name: u.name,
      email: u.email,
      wing: u.flatDetails?.wing || '',
      floor: u.flatDetails?.floor || '',
      flatNumber: u.flatDetails?.flatNumber || '',
      residentType: u.flatDetails?.residentType || 'Owner'
    });
  };

  const handleCancel = () => setEditingId(null);

  const handleSave = async (id) => {
    try {
      await api.put(`/auth/user/${id}`, editFormData);
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      alert("UPDATE_FAILURE");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("// PERMANENT_REMOVAL_REQUEST: Proceed?")) {
      try {
        await api.delete(`/auth/user/${id}`);
        setUsers(users.filter((u) => u._id !== id));
      } catch (error) {
        alert("DELETE_FAILURE");
      }
    }
  };

  return (
    <div style={{ marginTop: '40px', fontFamily: "'Space Mono', monospace" }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          .resident-card {
            border: 2px solid #1A1A1A;
            background: #fff;
            transition: all 0.2s;
            position: relative;
          }

          .resident-card:hover {
            box-shadow: 6px 6px 0px #1A1A1A;
            transform: translate(-2px, -2px);
          }

          .brutal-input {
            border: 1px solid #1A1A1A;
            background: #F2F2F2;
            padding: 8px;
            font-family: 'Space Mono', monospace;
            font-size: 12px;
            outline: none;
          }

          .brutal-input:focus {
            background: #fff;
          }
        `}
      </style>

      <h3 style={{ 
        fontFamily: "'Cormorant Garamond', serif", 
        fontSize: '32px', 
        textTransform: 'uppercase',
        marginBottom: '25px',
        borderBottom: `4px solid ${theme.textMain}`,
        display: 'inline-block'
      }}>
        RESIDENT_REGISTRY
      </h3>
      
      {users.length === 0 ? (
        <p style={{ color: theme.textSec }}>// NO_RECORDS_FOUND</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {users.map((u) => (
            <div key={u._id} className="resident-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {editingId === u._id ? (
                /* --- EDIT MODE --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700' }}>// EDITING_RECORD: {u._id.substring(0,8)}</span>
                  <input value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} placeholder="NAME" className="brutal-input" />
                  <input value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} placeholder="EMAIL" className="brutal-input" />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input value={editFormData.wing} onChange={(e) => setEditFormData({...editFormData, wing: e.target.value})} placeholder="WNG" className="brutal-input" style={{ width: '50px' }} />
                    <input value={editFormData.floor} onChange={(e) => setEditFormData({...editFormData, floor: e.target.value})} placeholder="FLR" className="brutal-input" style={{ width: '50px' }} />
                    <input value={editFormData.flatNumber} onChange={(e) => setEditFormData({...editFormData, flatNumber: e.target.value})} placeholder="UNIT" className="brutal-input" style={{ width: '70px' }} />
                  </div>
                  <select value={editFormData.residentType} onChange={(e) => setEditFormData({...editFormData, residentType: e.target.value})} className="brutal-input">
                    <option value="Owner">OWNER</option>
                    <option value="Tenant">TENANT</option>
                  </select>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => handleSave(u._id)} style={actionBtn(theme.accent, 'white')}>[ SAVE ]</button>
                    <button onClick={handleCancel} style={actionBtn('transparent', theme.textMain)}>[ CANCEL ]</button>
                  </div>
                </div>
              ) : (
                /* --- VIEW MODE --- */
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '50px', height: '50px', background: theme.textMain, color: 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px'
                    }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: theme.accent }}>
                      {u.flatDetails?.residentType?.toUpperCase() || 'OWNER'}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ margin: '0', fontSize: '18px', fontWeight: '700', textTransform: 'uppercase' }}>{u.name}</h4>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: theme.textSec }}>
                      LOC: {u.flatDetails ? `WING_${u.flatDetails.wing} // UNIT_${u.flatDetails.flatNumber}` : 'UNASSIGNED'}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: theme.textSec, opacity: 0.7 }}>{u.email.toUpperCase()}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '15px', borderTop: `1px dashed ${theme.border}` }}>
                    <button onClick={() => handleEditClick(u)} style={smallBtn}>MODIFY</button>
                    <button onClick={() => handleDelete(u._id)} style={{ ...smallBtn, color: '#ef4444' }}>TERMINATE</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- TECHNICAL STYLES ---

const actionBtn = (bg, color) => ({
  background: bg,
  color: color,
  border: `1px solid #1A1A1A`,
  padding: '8px 15px',
  fontFamily: "'Space Mono', monospace",
  fontWeight: '700',
  fontSize: '12px',
  cursor: 'pointer',
  flex: 1
});

const smallBtn = {
  background: 'none',
  border: 'none',
  fontFamily: "'Space Mono', monospace",
  fontSize: '11px',
  fontWeight: '700',
  padding: 0,
  cursor: 'pointer',
  textDecoration: 'underline'
};

export default UserList;