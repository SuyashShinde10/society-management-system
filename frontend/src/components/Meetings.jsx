import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';

const Meetings = () => {
  const { user } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', targetType: 'All', targetUserId: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMeetings();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/meetings');
      setMeetings(data);
    } catch (error) {
      console.error('// FETCH_ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (form.targetType === 'Specific' && !form.targetUserId) {
      toast.error('Please select a specific member.');
      return;
    }
    try {
      await api.post('/meetings', form);
      toast.success('Meeting scheduled successfully.');
      setForm({ title: '', description: '', date: '', location: '', targetType: 'All', targetUserId: '' });
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to schedule meeting.');
    }
  };

  const handleDelete = async (id) => {
    toast('Cancel this meeting globally?', {
      action: {
        label: 'Confirm',
        onClick: async () => {
          try {
            await api.delete(`/meetings/${id}`);
            toast.success('Meeting cancelled.');
            fetchMeetings();
          } catch (error) {
            toast.error('Failed to cancel meeting.');
          }
        },
      },
      cancel: { label: 'Go Back', onClick: () => {} },
    });
  };

  return (
    <div style={{ background: theme.surface, height: '100%', border: `3px solid ${theme.border}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: theme.textMain, color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>🗓️</span>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', letterSpacing: '2px', fontSize: '18px' }}>
          SOCIETY_MEETINGS
        </h3>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        
        {user?.role === 'admin' && (
          <form onSubmit={handleCreateMeeting} style={{ background: '#F9F9F9', padding: '15px', border: `1px dashed ${theme.border}`, marginBottom: '30px', display: 'grid', gap: '15px' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700', opacity: 0.8 }}>// SCHEDULE_NEW_MEETING</span>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                  value={form.targetType} 
                  onChange={e => setForm({...form, targetType: e.target.value})} 
                  className="brutal-input"
                  style={{ flex: 1 }}
                >
                  <option value="All">TARGET: ALL MEMBERS</option>
                  <option value="Specific">TARGET: SPECIFIC MEMBER</option>
                </select>

                {form.targetType === 'Specific' && (
                  <select 
                    value={form.targetUserId} 
                    onChange={e => setForm({...form, targetUserId: e.target.value})} 
                    className="brutal-input"
                    style={{ flex: 1 }}
                    required
                  >
                    <option value="">-- Choose Member --</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} (Flat {u.flatDetails?.wing}-{u.flatDetails?.flatNumber})</option>
                    ))}
                  </select>
                )}
              </div>

              <input placeholder="MEETING_TITLE" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="brutal-input" />
              <textarea placeholder="DESCRIPTION_AGENDA" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required className="brutal-input" style={{ minHeight: '80px', resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="brutal-input" />
                <input placeholder="LOCATION_OR_MEET_LINK" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required className="brutal-input" />
              </div>
            </div>
            <button type="submit" style={{ background: theme.textMain, color: 'white', border: 'none', padding: '12px', fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
              SCHEDULE_MEETING
            </button>
          </form>
        )}

        <input 
          type="text" 
          placeholder="SEARCH MEETINGS..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="brutal-input" 
          style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box', fontFamily: "'Space Mono', monospace" }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '5px' }}>
          {isLoading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}><span className="spinner"></span></div>
          ) : meetings.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', fontFamily: "'Space Mono', monospace", fontSize: '12px', color: theme.textSec, textAlign: 'center' }}>// NO_UPCOMING_MEETINGS</div>
          ) : (
            meetings.filter(m => 
              (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
              (m.description || '').toLowerCase().includes(searchQuery.toLowerCase())
            ).map(meet => {
              const meetingDate = new Date(meet.date);
              const isPast = meetingDate < new Date();
              return (
                <div key={meet._id} style={{ border: `2px solid ${theme.border}`, padding: '15px', background: isPast ? '#F0F0F0' : '#fff', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', textTransform: 'uppercase' }}>
                      {meet.title}
                    </h4>
                    {isPast && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', background: theme.border, color: '#fff', padding: '2px 5px' }}>PAST</span>}
                  </div>
                  <p style={{ margin: '0 0 15px 0', fontFamily: "'Space Mono', monospace", fontSize: '13px', color: theme.textSec, whiteSpace: 'pre-wrap' }}>
                    {meet.description}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px', background: '#F9F9F9', border: `1px dashed ${theme.border}`, fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>
                    <div><span style={{ fontWeight: '700' }}>DATE:</span> {meetingDate.toLocaleDateString()} {meetingDate.toLocaleTimeString()}</div>
                    <div><span style={{ fontWeight: '700' }}>LOC:</span> {meet.location}</div>
                  </div>

                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(meet._id)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontWeight: '700', color: theme.danger, textDecoration: 'underline', fontSize: '10px' }}>
                      CANCEL
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Meetings;
