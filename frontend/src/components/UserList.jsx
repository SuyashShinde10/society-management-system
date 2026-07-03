import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';

const UserList = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [users, setUsers] = useState([]);

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
      const { data } = await api.get('/auth/users');
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

  const displayedUsers = users;

  return (
    <div style={{ marginTop: '40px', fontFamily: "'Space Mono', monospace" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px', borderBottom: `4px solid ${theme.textMain}`, paddingBottom: '10px' }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(22px, 6vw, 32px)', textTransform: 'uppercase', margin: 0, wordBreak: 'break-all'
        }}>
          RESIDENT_REGISTRY
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ ...tabBtn, background: theme.textMain, color: 'white' }}>
            ACTIVE ({users.length})
          </div>
        </div>
      </div>

      {displayedUsers.length === 0 ? (
        <p style={{ color: theme.textSec }}>// NO_RECORDS_FOUND</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {displayedUsers.map((u) => (
            <div
              key={u._id}
              style={{
                border: `2px solid ${theme.textMain}`, background: '#fff',
                padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px',
                transition: 'all 0.2s', position: 'relative'
              }}
            >
              {editingId === u._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700' }}>// EDITING_RECORD: {u._id.substring(0, 8)}</span>
                  <input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} placeholder="NAME" className="brutal-input" />
                  <input value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} placeholder="EMAIL" className="brutal-input" />
                  <input value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} placeholder="PHONE" className="brutal-input" />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input value={editFormData.wing} onChange={(e) => setEditFormData({ ...editFormData, wing: e.target.value })} placeholder="WNG" className="brutal-input" style={{ width: '50px' }} />
                    <input value={editFormData.floor} onChange={(e) => setEditFormData({ ...editFormData, floor: e.target.value })} placeholder="FLR" className="brutal-input" style={{ width: '50px' }} />
                    <input value={editFormData.flatNumber} onChange={(e) => setEditFormData({ ...editFormData, flatNumber: e.target.value })} placeholder="UNIT" className="brutal-input" style={{ width: '70px' }} />
                  </div>
                  <select value={editFormData.residentType} onChange={(e) => setEditFormData({ ...editFormData, residentType: e.target.value })} className="brutal-input">
                    <option value="Owner">OWNER</option>
                    <option value="Tenant">TENANT</option>
                  </select>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => handleSave(u._id)} style={actionBtn(theme.accent, 'white')}>[ SAVE ]</button>
                    <button onClick={handleCancel} style={actionBtn('transparent', theme.textMain)}>[ CANCEL ]</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '50px', height: '50px', background: theme.textMain, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px' }}>
                      {u.name ? u.name.charAt(0).toUpperCase() : '?'}
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
                    <p style={{ margin: 0, fontSize: '11px', color: theme.textSec, opacity: 0.7 }}>{u.email?.toUpperCase() || 'NO_EMAIL'}</p>
                    {u.phone && <p style={{ margin: 0, fontSize: '11px', color: theme.textSec, opacity: 0.7 }}>PH: {u.phone}</p>}
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

const tabBtn = {
  border: `2px solid ${theme.textMain}`, padding: '8px 16px',
  fontFamily: "'Space Mono', monospace", fontWeight: '700', fontSize: '12px',
  cursor: 'pointer'
};

const actionBtn = (bg, color) => ({
  background: bg, color, border: '1px solid #1A1A1A', padding: '8px 15px',
  fontFamily: "'Space Mono', monospace", fontWeight: '700', fontSize: '12px',
  cursor: 'pointer', flex: 1,
});

const smallBtn = {
  background: 'none', border: 'none', fontFamily: "'Space Mono', monospace",
  fontSize: '11px', fontWeight: '700', padding: 0, cursor: 'pointer', textDecoration: 'underline',
};

export default UserList;