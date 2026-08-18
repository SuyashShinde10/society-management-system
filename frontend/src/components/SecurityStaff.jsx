import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Shield, ShieldAlert, Calendar, User, MapPin, Edit2, UserMinus, X, Check } from 'lucide-react';
import api from '../api';
import theme from '../theme';

import AddSecurity from './AddSecurity';

const SecurityStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/auth/security-staff');
      setStaff(data);
    } catch (error) {
      console.error('Failed to fetch security staff', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleTerminate = async (id) => {
    if (!window.confirm('Are you sure you want to terminate this staff member? They will lose access to the system immediately.')) return;
    try {
      await api.put(`/auth/security-staff/${id}/terminate`);
      toast.success('Staff terminated successfully.');
      setStaff(staff.map(g => g._id === id ? { ...g, status: 'Left', leaveDate: new Date(), isActive: false } : g));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to terminate staff.');
    }
  };

  const handleEdit = (guard) => {
    setEditingId(guard._id);
    setEditForm({
      name: guard.name,
      phone: guard.phone || '',
      age: guard.age || '',
      address: guard.address || '',
      shift: guard.shift || 'Day'
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await api.put(`/auth/security-staff/${id}`, editForm);
      toast.success('Staff details updated.');
      setStaff(staff.map(g => g._id === id ? response.data.staff : g));
      setEditingId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff details.');
    }
  };

  if (loading) return <div style={{ padding: '20px', fontFamily: "'Outfit', sans-serif" }}>Loading Security Roster...</div>;

  return (
    <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${theme.border}`, padding: 'clamp(20px, 5vw, 40px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '20px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ background: '#FFF7ED', padding: '12px', borderRadius: '16px' }}>
          <Shield size={28} color="#EA580C" />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '600', margin: 0, color: theme.textMain }}>
            Security Staff Roster
          </h3>
          <p style={{ margin: '4px 0 0 0', color: theme.textSec, fontSize: '14px', fontFamily: "'Outfit', sans-serif" }}>Manage and view historical logs of all watchmen</p>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <AddSecurity onAdd={fetchStaff} />
      </div>

      {staff.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: '16px', border: `1px dashed ${theme.border}` }}>
          <ShieldAlert size={48} color="#94A3B8" style={{ marginBottom: '16px' }} />
          <h4 style={{ margin: '0 0 8px 0', color: theme.textMain, fontSize: '20px', fontFamily: "'Cormorant Garamond', serif" }}>No Security Personnel Found</h4>
          <p style={{ margin: 0, color: theme.textSec, fontSize: '15px', fontFamily: "'Outfit', sans-serif" }}>Add a watchman from the Resident Intake form by selecting 'Security Guard'.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {staff.map((guard) => {
            const isLeft = guard.status === 'Left';
            return (
              <div key={guard._id} style={{ 
                border: `1px solid ${theme.border}`, 
                borderRadius: '16px', 
                padding: '24px',
                background: isLeft ? '#F8FAFC' : 'white',
                opacity: isLeft ? 0.8 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {isLeft && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#FEE2E2', color: '#991B1B', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', fontFamily: "'Outfit', sans-serif" }}>
                    FORMER STAFF
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ width: '50px', height: '50px', background: isLeft ? '#E2E8F0' : '#FFEDD5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={24} color={isLeft ? '#64748B' : '#EA580C'} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.textMain, fontFamily: "'Outfit', sans-serif" }}>{guard.name}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: theme.textSec, fontFamily: "'Outfit', sans-serif" }}>Shift: {guard.shift || 'Day'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
                  
                  {editingId === guard._id ? (
                    <>
                      <div>
                        <label style={{ fontSize: '12px', color: theme.textSec }}>Name</label>
                        <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '14px', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: theme.textSec }}>Phone</label>
                        <input value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '14px', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: theme.textSec }}>Age</label>
                        <input type="number" value={editForm.age} onChange={(e) => setEditForm({...editForm, age: e.target.value})} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '14px', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: theme.textSec }}>Shift</label>
                        <select value={editForm.shift} onChange={(e) => setEditForm({...editForm, shift: e.target.value})} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '14px', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }}>
                          <option value="Day">Day</option>
                          <option value="Night">Night</option>
                          <option value="Rotational">Rotational</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: theme.textSec }}>Address</label>
                        <input value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '14px', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ color: theme.textSec }}>Phone</span>
                        <span style={{ fontWeight: '500', color: theme.textMain }}>{guard.phone || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ color: theme.textSec }}>Age</span>
                        <span style={{ fontWeight: '500', color: theme.textMain }}>{guard.age || 'N/A'} yrs</span>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: `1px solid ${theme.border}` }}>
                    <span style={{ color: theme.textSec }}><Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Joined</span>
                    <span style={{ fontWeight: '500', color: theme.textMain }}>
                      {guard.joinDate ? new Date(guard.joinDate).toLocaleDateString() : new Date(guard.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {isLeft && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: `1px solid ${theme.border}` }}>
                      <span style={{ color: theme.textSec }}>Left On</span>
                      <span style={{ fontWeight: '500', color: '#991B1B' }}>
                        {guard.leaveDate ? new Date(guard.leaveDate).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  )}
                  {editingId !== guard._id && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <span style={{ color: theme.textSec }}><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Address</span>
                      <span style={{ fontWeight: '500', color: theme.textMain, lineHeight: '1.4' }}>{guard.address || 'Address not provided'}</span>
                    </div>
                  )}
                </div>

                {!isLeft && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${theme.border}` }}>
                    <button
                      onClick={() => editingId === guard._id ? handleSaveEdit(guard._id) : handleEdit(guard)}
                      style={{ flex: 1, padding: '8px', background: editingId === guard._id ? theme.accent : '#F8FAFC', color: editingId === guard._id ? 'white' : theme.textMain, border: `1px solid ${editingId === guard._id ? theme.accent : theme.border}`, borderRadius: '8px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      {editingId === guard._id ? <><Check size={14}/> Save</> : <><Edit2 size={14}/> Edit</>}
                    </button>
                    {editingId === guard._id ? (
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ flex: 1, padding: '8px', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <X size={14}/> Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTerminate(guard._id)}
                        style={{ flex: 1, padding: '8px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <UserMinus size={14}/> Terminate
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SecurityStaff;
