import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { socket } from '../socket';

const VisitorLog = () => {
  const { user } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;
  
  // Admin form
  const [form, setForm] = useState({ name: '', phone: '', vehicleNumber: '', hostWing: '', hostFlatNumber: '' });

  useEffect(() => {
    fetchVisitors();

    const handleNewVisitor = (visitor) => {
      setVisitors((prev) => [visitor, ...prev]);
    };

    const handleUpdateVisitor = (updatedVisitor) => {
      setVisitors((prev) => prev.map(v => v._id === updatedVisitor._id ? updatedVisitor : v));
    };

    const handleDeleteVisitor = (id) => {
      setVisitors((prev) => prev.filter(v => v._id !== id));
    };

    socket.on('new_visitor', handleNewVisitor);
    socket.on('update_visitor', handleUpdateVisitor);
    socket.on('delete_visitor', handleDeleteVisitor);

    return () => {
      socket.off('new_visitor', handleNewVisitor);
      socket.off('update_visitor', handleUpdateVisitor);
      socket.off('delete_visitor', handleDeleteVisitor);
    };
  }, [user]);

  const fetchVisitors = async () => {
    try {
      const { data } = await api.get('/visitors');
      setVisitors(data);
    } catch (error) {
      console.error('// VISITOR_FETCH_ERROR');
    }
  };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/visitors', form);
      toast.success('Visitor entry logged.');
      setForm({ name: '', phone: '', vehicleNumber: '', hostWing: '', hostFlatNumber: '' });
      fetchVisitors();
    } catch (error) {
      toast.error('Failed to log visitor.');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await api.put(`/visitors/${id}/checkout`);
      toast.success('Visitor checked out.');
      fetchVisitors();
    } catch (error) {
      toast.error('Checkout failed.');
    }
  };

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedVisitors = filteredVisitors.slice(0, page * limit);
  const hasMore = paginatedVisitors.length < filteredVisitors.length;

  return (
    <div style={{ background: theme.surface, height: '100%', border: `3px solid ${theme.border}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: theme.textMain, color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>🛡️</span>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', letterSpacing: '2px', fontSize: '18px' }}>
          Visitor_Logs
        </h3>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        
        {user?.role === 'admin' && (
          <form onSubmit={handleAddVisitor} style={{ background: '#F9F9F9', padding: '15px', border: `1px dashed ${theme.border}`, marginBottom: '20px', display: 'grid', gap: '10px' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700' }}>// LOG_ENTRY</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input placeholder="VISITOR_NAME" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="brutal-input" style={{ padding: '8px' }} />
              <input placeholder="PHONE" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="brutal-input" style={{ padding: '8px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <input placeholder="HOST_WING (eg A)" value={form.hostWing} onChange={e => setForm({...form, hostWing: e.target.value})} required className="brutal-input" style={{ padding: '8px' }} />
              <input placeholder="HOST_FLAT (eg 101)" value={form.hostFlatNumber} onChange={e => setForm({...form, hostFlatNumber: e.target.value})} required className="brutal-input" style={{ padding: '8px' }} />
              <input placeholder="VEHICLE (OPTIONAL)" value={form.vehicleNumber} onChange={e => setForm({...form, vehicleNumber: e.target.value})} className="brutal-input" style={{ padding: '8px' }} />
            </div>
            <button type="submit" style={{ background: theme.textMain, color: 'white', border: 'none', padding: '8px', fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer' }}>
              GRANT_ENTRY
            </button>
          </form>
        )}

        <input 
          type="text" 
          placeholder="SEARCH VISITORS/VEHICLES..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="brutal-input" 
          style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box', fontFamily: "'Space Mono', monospace" }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {paginatedVisitors.length === 0 ? (
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', textAlign: 'center', color: theme.textSec }}>// NO_VISITORS_FOUND</p>
          ) : (
            paginatedVisitors.map(v => (
              <div key={v._id} style={{ border: `1px solid ${theme.border}`, padding: '15px', background: v.checkOutTime ? '#F5F5F4' : '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontFamily: "'Space Mono', monospace", fontSize: '14px', textTransform: 'uppercase' }}>
                      {v.name} <span style={{ opacity: 0.5, fontSize: '10px' }}>{v.phone}</span>
                    </h4>
                    <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: '12px', color: theme.textSec }}>
                      VISITING: W_{v.hostWing} F_{v.hostFlatNumber}
                    </p>
                    {v.vehicleNumber && <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: '10px', color: theme.accent }}>VEHICLE: {v.vehicleNumber}</p>}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}>
                    <div style={{ color: theme.pending, fontWeight: '700' }}>IN: {new Date(v.checkInTime).toLocaleTimeString()}</div>
                    {v.checkOutTime ? (
                      <div style={{ color: theme.textSec }}>OUT: {new Date(v.checkOutTime).toLocaleTimeString()}</div>
                    ) : (
                      user?.role === 'admin' && (
                        <button onClick={() => handleCheckOut(v._id)} style={{ marginTop: '5px', background: theme.textMain, color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', fontWeight: '700' }}>
                          CHECK_OUT
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <button onClick={() => setPage(page + 1)} style={{ width: '100%', marginTop: '20px', padding: '10px', background: 'transparent', border: `2px dashed ${theme.border}`, fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer' }}>
            LOAD_MORE
          </button>
        )}
      </div>
    </div>
  );
};

export default VisitorLog;
