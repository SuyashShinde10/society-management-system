import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import theme from '../../theme';
import AuthContext from '../../context/AuthContext';
import { Users, ShieldCheck, Star, LogIn, LogOut, Plus, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const StaffDirectory = () => {
  const { user } = useContext(AuthContext);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Maid');
  const [policeVerified, setPoliceVerified] = useState(true);
  const [assignedWing, setAssignedWing] = useState('');
  const [assignedFlat, setAssignedFlat] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/gate/staff');
      setStaffList(data);
    } catch (err) {
      toast.error('Failed to load domestic staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleAttendance = async (staff) => {
    try {
      if (staff.isCurrentlyInside) {
        await api.post(`/gate/staff/${staff._id}/checkout`);
        toast.success(`${staff.name} checked out of premises`);
      } else {
        await api.post(`/gate/staff/${staff._id}/checkin`);
        toast.success(`${staff.name} checked in (Inside premises)`);
      }
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Attendance update failed');
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const flatsAssigned = assignedWing && assignedFlat ? [{ wing: assignedWing, flatNumber: assignedFlat }] : [];
      await api.post('/gate/staff', {
        name,
        phone,
        role,
        policeVerified,
        flatsAssigned
      });
      toast.success('Domestic staff profile created!');
      setShowAddModal(false);
      setName('');
      setPhone('');
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add staff');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
            Domestic Staff & Daily Pass
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSec }}>
            Maids, cooks, drivers directory with police verification and gate attendance
          </p>
        </div>

        {(user.role === 'admin' || user.role === 'superadmin') && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', background: theme.accent, color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(217,115,78,0.25)'
            }}
          >
            <Plus size={18} /> Register New Staff
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: theme.textSec }}>Loading staff directory...</div>
      ) : staffList.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
          <Users size={48} color={theme.accent} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: theme.textMain }}>No domestic staff recorded</h4>
          <p style={{ margin: 0, fontSize: '14px', color: theme.textSec }}>Register verified maids, cooks, and drivers to monitor gate entry.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {staffList.map((staff) => (
            <motion.div
              key={staff._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                border: `1px solid ${theme.border}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px',
                    background: staff.isCurrentlyInside ? '#ECFDF5' : '#F3F4F6',
                    color: staff.isCurrentlyInside ? '#059669' : '#6B7280'
                  }}>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: staff.isCurrentlyInside ? '#10B981' : '#9CA3AF'
                    }} />
                    {staff.isCurrentlyInside ? 'Inside Premises' : 'Outside'}
                  </span>

                  {staff.policeVerified && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#059669', fontWeight: '600', background: '#F0FDF4', padding: '4px 10px', borderRadius: '12px' }}>
                      <ShieldCheck size={14} /> Police Verified
                    </span>
                  )}
                </div>

                <h4 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '600', color: theme.textMain }}>
                  {staff.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ background: '#FFF7ED', color: '#EA580C', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '8px' }}>
                    {staff.role}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#F59E0B', fontWeight: '600' }}>
                    <Star size={14} fill="#F59E0B" /> {staff.rating.toFixed(1)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: theme.textSec, marginBottom: '8px' }}>
                  <Phone size={14} /> {staff.phone}
                </div>

                {staff.flatsAssigned?.length > 0 && (
                  <div style={{ fontSize: '12px', color: theme.textSec }}>
                    Works in: {staff.flatsAssigned.map(f => `${f.wing}-${f.flatNumber}`).join(', ')}
                  </div>
                )}
              </div>

              {(user.role === 'security' || user.role === 'admin' || user.role === 'superadmin') && (
                <button
                  onClick={() => handleToggleAttendance(staff)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%',
                    padding: '10px',
                    background: staff.isCurrentlyInside ? '#FEF2F2' : '#F0FDF4',
                    color: staff.isCurrentlyInside ? '#DC2626' : '#16A34A',
                    border: `1px solid ${staff.isCurrentlyInside ? '#FCA5A5' : '#86EFAC'}`,
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {staff.isCurrentlyInside ? (
                    <><LogOut size={16} /> Check-Out of Gate</>
                  ) : (
                    <><LogIn size={16} /> Check-In at Gate</>
                  )}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '450px', width: '100%', border: `1px solid ${theme.border}` }}>
              <h3 style={{ margin: '0 0 20px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
                Register Domestic Staff
              </h3>
              <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Full Name</label>
                  <input type="text" placeholder="e.g. Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Phone Number</label>
                  <input type="tel" placeholder="10-digit mobile" value={phone} onChange={(e) => setPhone(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Role / Service</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }}>
                    <option value="Maid">Maid / Housekeeping</option>
                    <option value="Cook">Cook / Chef</option>
                    <option value="Driver">Personal Driver</option>
                    <option value="Gardener">Gardener</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Primary Wing</label>
                    <input type="text" placeholder="e.g. A" value={assignedWing} onChange={(e) => setAssignedWing(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Flat No.</label>
                    <input type="text" placeholder="e.g. 102" value={assignedFlat} onChange={(e) => setAssignedFlat(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                  <input type="checkbox" id="policeVer" checked={policeVerified} onChange={(e) => setPoliceVerified(e.target.checked)} />
                  <label htmlFor="policeVer" style={{ fontSize: '13px', fontWeight: '600', color: theme.textMain }}>
                    Police Verification Completed
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)}
                    style={{ flex: 1, padding: '12px', background: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ flex: 1, padding: '12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Register Staff
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffDirectory;
