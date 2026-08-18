import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { Calendar } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <div style={{ background: '#F0FDF4', padding: '10px', borderRadius: '12px' }}>
          <Calendar size={24} color="#16A34A" />
        </div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          Society Meetings
        </h3>
      </div>

      <div style={{ padding: '0', flex: 1, overflowY: 'auto' }}>
        
        {user?.role === 'admin' && (
          <form onSubmit={handleCreateMeeting} style={{ background: 'white', padding: '24px', borderRadius: '20px', border: `1px solid ${theme.border}`, marginBottom: '30px', display: 'grid', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: '600', color: theme.textSec }}>Schedule New Meeting</span>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                  value={form.targetType} 
                  onChange={e => setForm({...form, targetType: e.target.value})} 
                  className="organic-input"
                  style={{ flex: 1 }}
                >
                  <option value="All">TARGET: ALL MEMBERS</option>
                  <option value="Specific">TARGET: SPECIFIC MEMBER</option>
                </select>

                {form.targetType === 'Specific' && (
                  <select 
                    value={form.targetUserId} 
                    onChange={e => setForm({...form, targetUserId: e.target.value})} 
                    className="organic-input"
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

              <input placeholder="MEETING_TITLE" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="organic-input" />
              <textarea placeholder="DESCRIPTION_AGENDA" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required className="organic-input" style={{ minHeight: '80px', resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="organic-input" />
                <input placeholder="LOCATION_OR_MEET_LINK" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required className="organic-input" />
              </div>
            </div>
            <button type="submit" style={{ background: theme.textMain, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
              Schedule Meeting
            </button>
          </form>
        )}

        <input 
          type="text" 
          placeholder="SEARCH MEETINGS..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="organic-input" 
          style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box', fontFamily: "'Outfit', sans-serif" }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px', paddingBottom: '20px' }}>
          {isLoading ? (
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}` }}><img src="/awaastech-logo.png" alt="Loading" className="organic-pulse" style={{ width: '40px', height: '40px', objectFit: 'contain' }} /></div>
          ) : meetings.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: theme.textSec, textAlign: 'center', background: 'white', padding: '40px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>No upcoming meetings.</div>
          ) : (
            meetings.filter(m => 
              (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
              (m.description || '').toLowerCase().includes(searchQuery.toLowerCase())
            ).map(meet => {
              const meetingDate = new Date(meet.date);
              const isPast = meetingDate < new Date();
              return (
                <div key={meet._id} style={{ border: `1px solid ${theme.border}`, padding: '24px', borderRadius: '20px', background: 'white', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s', opacity: isPast ? 0.7 : 1 }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: '600', color: theme.textMain }}>
                      {meet.title}
                    </h4>
                    {isPast && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', fontWeight: '600', background: '#F1F5F9', color: '#64748B', padding: '4px 8px', borderRadius: '12px' }}>Past</span>}
                  </div>
                  <p style={{ margin: '0 0 20px 0', fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: theme.textSec, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {meet.description}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: '#F9F8F3', borderRadius: '12px', fontFamily: "'Outfit', sans-serif", fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={14} color={theme.textSec} /> <span style={{ fontWeight: '600', color: theme.textMain }}>{meetingDate.toLocaleDateString()} {meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: theme.textSec, fontWeight: '600' }}>Loc:</span> <span style={{ fontWeight: '500', color: theme.textMain }}>{meet.location}</span></div>
                  </div>

                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(meet._id)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#FEE2E2', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: '600', color: '#DC2626', fontSize: '12px', padding: '6px 12px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#FECACA'} onMouseOut={(e) => e.target.style.background = '#FEE2E2'}>
                      Cancel
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
