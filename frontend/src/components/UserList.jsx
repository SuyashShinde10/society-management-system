import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { Users, Search, Edit2, Trash2 } from 'lucide-react';

const UserList = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '', email: '', wing: '', floor: '', flatNumber: '', residentType: 'Owner', phone: '', parkingSlot: '', vehicleNumber: ''
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get(`/auth/users?_t=${Date.now()}`);
      setUsers(data);
    } catch (error) {
      console.error('// DATABASE_ACCESS_ERROR');
    }
  };



  const handleEditClick = (u) => {
    setEditingId(u._id);
    setEditFormData({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      parkingSlot: u.parkingSlot || '',
      vehicleNumber: u.vehicleNumber || '',
      wing: u.flatDetails?.wing || '',
      floor: u.flatDetails?.floor || '',
      flatNumber: u.flatDetails?.flatNumber || '',
      residentType: u.flatDetails?.residentType || 'Owner',
    });
  };

  const handleCancel = () => setEditingId(null);

  const handleSave = async (id) => {
    try {
      await api.put(`/auth/user/${id}`, editFormData);
      setEditingId(null);
      fetchUsers();
      toast.success('Member record updated.');
    } catch (error) {
      toast.error('Failed to update member. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    toast('Permanently remove this resident?', {
      action: {
        label: 'Confirm',
        onClick: async () => {
          try {
            await api.delete(`/auth/user/${id}`);
            setUsers(users.filter((u) => u._id !== id));
            toast.success('Resident removed from registry.');
          } catch (error) {
            toast.error('Failed to delete member.');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  const displayedUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.flatDetails?.flatNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ marginTop: '40px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#FFF7ED', padding: '12px', borderRadius: '16px' }}>
            <Users size={28} color="#EA580C" />
          </div>
          <div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '600', margin: 0, color: theme.textMain
            }}>
              Resident Registry
            </h3>
            <p style={{ margin: '4px 0 0 0', color: theme.textSec, fontSize: '14px' }}>Manage all {users.length} active members</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color={theme.textSec} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="organic-input" 
              style={{ width: '240px', padding: '10px 12px 10px 38px', borderRadius: '12px' }} 
            />
          </div>
        </div>
      </div>

      {displayedUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
          <p style={{ color: theme.textSec, fontSize: '16px' }}>No records found matching your search.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', maxHeight: '60vh', overflowY: 'auto', padding: '10px', paddingRight: '20px' }}>
          {displayedUsers.map((u) => (
            <div
              key={u._id}
              style={{
                border: `1px solid ${theme.border}`, background: 'white', borderRadius: '20px',
                padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
                transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}
              onMouseOver={(e) => { if(editingId !== u._id) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; } }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}
            >
              {editingId === u._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textMain, marginBottom: '4px' }}>Editing Record</div>
                  <input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} placeholder="Full Name" className="organic-input" style={{ borderRadius: '8px' }} />
                  <input value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} placeholder="Email Address" className="organic-input" style={{ borderRadius: '8px' }} />
                  <input value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} placeholder="Phone Number" className="organic-input" style={{ borderRadius: '8px' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input value={editFormData.wing} onChange={(e) => setEditFormData({ ...editFormData, wing: e.target.value })} placeholder="Wing" className="organic-input" style={{ width: '100%', borderRadius: '8px' }} />
                    <input value={editFormData.floor} onChange={(e) => setEditFormData({ ...editFormData, floor: e.target.value })} placeholder="Floor" className="organic-input" style={{ width: '100%', borderRadius: '8px' }} />
                    <input value={editFormData.flatNumber} onChange={(e) => setEditFormData({ ...editFormData, flatNumber: e.target.value })} placeholder="Unit" className="organic-input" style={{ width: '100%', borderRadius: '8px' }} />
                  </div>
                  <select value={editFormData.residentType} onChange={(e) => setEditFormData({ ...editFormData, residentType: e.target.value })} className="organic-input" style={{ borderRadius: '8px' }}>
                    <option value="Owner">Owner</option>
                    <option value="Tenant">Tenant</option>
                  </select>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button onClick={() => handleSave(u._id)} style={actionBtn(theme.textMain, 'white')}>Save Changes</button>
                    <button onClick={handleCancel} style={actionBtn('#F1F5F9', '#475569', 'none')}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F8FAFC', color: theme.textMain, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '22px' }}>
                      {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: theme.accent, background: '#FFF1F2', padding: '4px 10px', borderRadius: '12px' }}>
                      {u.flatDetails?.residentType || 'Owner'}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '600', color: theme.textMain }}>{u.name}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: theme.textSec, fontWeight: '500' }}>
                        {u.flatDetails ? `Wing ${u.flatDetails.wing} • Unit ${u.flatDetails.flatNumber}` : 'Unassigned'}
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', color: theme.textSec }}>{u.email}</p>
                      {u.phone && <p style={{ margin: 0, fontSize: '13px', color: theme.textSec }}>{u.phone}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${theme.border}` }}>
                    <button onClick={() => handleEditClick(u)} style={smallBtn('#F8FAFC', '#475569')} onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'} onMouseOut={(e) => e.currentTarget.style.background = '#F8FAFC'}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(u._id)} style={smallBtn('#FEF2F2', '#DC2626')} onMouseOver={(e) => e.currentTarget.style.background = '#FEE2E2'} onMouseOut={(e) => e.currentTarget.style.background = '#FEF2F2'}>
                      <Trash2 size={14} /> Remove
                    </button>
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

const actionBtn = (bg, color, border = 'none') => ({
  background: bg, color, border: border, padding: '10px 16px', borderRadius: '12px',
  fontFamily: "'Outfit', sans-serif", fontWeight: '600', fontSize: '14px',
  cursor: 'pointer', flex: 1, transition: 'transform 0.2s'
});

const smallBtn = (bg, color) => ({
  background: bg, color, border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: '600', padding: '8px', cursor: 'pointer', flex: 1, transition: 'background 0.2s',
});

export default UserList;