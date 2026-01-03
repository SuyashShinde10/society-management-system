import React, { useState, useEffect, useContext } from 'react';
import api from '../api'; 
import AuthContext from '../context/AuthContext';

const UserList = () => {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', wing: '', floor: '', flatNumber: ''
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchMembers();
    }
  }, [user]);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    // --- VALIDATION ---
    const { name, email, password, wing, floor, flatNumber } = formData;
    
    if (!name || !email || !password || !wing || floor === '' || !flatNumber) {
      return alert("Please fill in all fields.");
    }
    
    // UPDATE: Allow 0 (Ground Floor), but stop negatives
    if (Number(floor) < 0) {
      return alert("Floor number cannot be negative.");
    }

    if (password.length < 6) {
      return alert("Password is too short (min 6 chars)");
    }
    // ------------------

    try {
      await api.post('/auth/add-member', formData);
      alert('Member Added Successfully!');
      setFormData({ name: '', email: '', password: '', wing: '', floor: '', flatNumber: '' }); // Reset form
      fetchMembers(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.delete(`/auth/users/${id}`);
      fetchMembers(); 
    } catch (error) {
      alert('Failed to delete member');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div style={{ marginTop: '20px' }}>
      
      {/* --- ADD MEMBER FORM --- */}
      <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bae6fd' }}>
        <h3 style={{ marginTop: 0, color: '#0369a1' }}>➕ Add New Member</h3>
        <form onSubmit={handleAddMember} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <input placeholder="Full Name" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} required style={inputStyle} />
          <input placeholder="Email" type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} required style={inputStyle} />
          <input placeholder="Password" type="text" value={formData.password} onChange={(e)=>setFormData({...formData, password: e.target.value})} required style={inputStyle} />
          
          <div style={{ display: 'flex', gap: '5px' }}>
            <input placeholder="Wing" value={formData.wing} onChange={(e)=>setFormData({...formData, wing: e.target.value})} style={inputStyle} />
            
            {/* UPDATED FLOOR INPUT: Starts from 0 */}
            <input 
              placeholder="Floor (0 for Ground)" 
              type="number" 
              min="0" // <--- Starts from 0 now
              value={formData.floor} 
              onChange={(e)=>setFormData({...formData, floor: e.target.value})} 
              style={inputStyle} 
            />
            
            <input placeholder="Flat No" value={formData.flatNumber} onChange={(e)=>setFormData({...formData, flatNumber: e.target.value})} required style={inputStyle} />
          </div>

          <button type="submit" style={{ background: '#0284c7', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Add Member
          </button>
        </form>
      </div>

      {/* --- MEMBER LIST TABLE --- */}
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ borderBottom: '2px solid #8b5cf6', paddingBottom: '10px' }}>👥 Society Members ({members.length})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Location</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No members yet.</td></tr>
            ) : members.map((m) => (
              <tr key={m._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{m.name}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: '#ede9fe', padding: '4px 8px', borderRadius: '4px', color: '#8b5cf6', fontWeight: 'bold' }}>
                    {m.flatDetails?.wing || '-'} - {m.flatDetails?.flatNumber}
                  </span>
                </td>
                <td style={{ padding: '12px', color: '#666' }}>{m.email}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => handleDelete(m._id)} style={{ background: '#ef4444', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' };

export default UserList;