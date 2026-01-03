import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const UserList = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  
  // State for Editing
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    wing: '',
    floor: '',
    flatNumber: '',
    residentType: 'Owner'
  });

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    if (user && user.role === 'admin') {
      try {
        const { data } = await api.get('/auth/users');
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users");
      }
    }
  };

  // Start Editing
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

  // Cancel Editing
  const handleCancel = () => {
    setEditingId(null);
  };

  // Save Changes
  const handleSave = async (id) => {
    try {
      await api.put(`/auth/user/${id}`, editFormData);
      alert("User Updated Successfully");
      setEditingId(null);
      fetchUsers(); // Refresh list
    } catch (error) {
      alert("Failed to update user");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await api.delete(`/auth/user/${id}`);
        setUsers(users.filter((u) => u._id !== id));
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  return (
    <div style={listContainer}>
      <h3 style={{ margin: '0 0 15px 0', color: '#334155' }}>Current Residents</h3>
      
      {users.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No members found.</p>
      ) : (
        <div style={gridStyle}>
          {users.map((u) => (
            <div key={u._id} style={userCard}>
              
              {/* --- EDIT MODE --- */}
              {editingId === u._id ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input 
                    value={editFormData.name} 
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} 
                    placeholder="Name"
                    style={editInput}
                  />
                  <input 
                    value={editFormData.email} 
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} 
                    placeholder="Email"
                    style={editInput}
                  />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input 
                      value={editFormData.wing} 
                      onChange={(e) => setEditFormData({...editFormData, wing: e.target.value})} 
                      placeholder="Wing" style={{...editInput, width: '40px'}} 
                    />
                    <input 
                      value={editFormData.floor} 
                      onChange={(e) => setEditFormData({...editFormData, floor: e.target.value})} 
                      placeholder="Flr" style={{...editInput, width: '40px'}} 
                    />
                    <input 
                      value={editFormData.flatNumber} 
                      onChange={(e) => setEditFormData({...editFormData, flatNumber: e.target.value})} 
                      placeholder="Flat" style={{...editInput, width: '60px'}} 
                    />
                  </div>
                  <select 
                    value={editFormData.residentType}
                    onChange={(e) => setEditFormData({...editFormData, residentType: e.target.value})}
                    style={editInput}
                  >
                    <option value="Owner">Owner</option>
                    <option value="Tenant">Tenant</option>
                  </select>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button onClick={() => handleSave(u._id)} style={saveBtn}>Save</button>
                    <button onClick={handleCancel} style={cancelBtn}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* --- VIEW MODE --- */
                <>
                  <div style={avatarCircle}>{u.name.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{u.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      {u.flatDetails ? `${u.flatDetails.wing}-${u.flatDetails.flatNumber} (${u.flatDetails.residentType || 'Owner'})` : 'No Flat Info'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{u.email}</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button onClick={() => handleEditClick(u)} style={editBtn}>Edit</button>
                    <button onClick={() => handleDelete(u._id)} style={deleteBtn}>Remove</button>
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

// --- STYLES ---
const listContainer = { marginTop: '20px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' };
const userCard = { background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '100px' };
const avatarCircle = { width: '40px', height: '40px', background: '#3b82f6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0 };
const editInput = { padding: '5px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem' };

// Buttons
const editBtn = { background: '#f59e0b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };
const deleteBtn = { background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };
const saveBtn = { background: '#10b981', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', flex: 1 };
const cancelBtn = { background: '#64748b', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', flex: 1 };

export default UserList;