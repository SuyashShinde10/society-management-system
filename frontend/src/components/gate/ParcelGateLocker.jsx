import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import theme from '../../theme';
import AuthContext from '../../context/AuthContext';
import { Package, CheckCircle2, Clock, ShieldCheck, Plus, Search, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ParcelGateLocker = () => {
  const { user } = useContext(AuthContext);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Guard form state
  const [showLogModal, setShowLogModal] = useState(false);
  const [carrier, setCarrier] = useState('Amazon');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [wing, setWing] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Claim modal state
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [claimOtp, setClaimOtp] = useState('');
  const [claiming, setClaiming] = useState(false);

  const fetchParcels = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/gate/parcels');
      setParcels(data);
    } catch (err) {
      toast.error('Failed to load parcel records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const handleLogParcel = async (e) => {
    e.preventDefault();
    if (!wing || !flatNumber) {
      return toast.error('Wing and Flat number are required');
    }
    try {
      const { data } = await api.post('/gate/parcels', {
        carrier,
        trackingNumber,
        wing,
        flatNumber,
        notes
      });
      toast.success(`Parcel logged! Claim OTP: ${data.parcel.claimOtp}`);
      setShowLogModal(false);
      setWing('');
      setFlatNumber('');
      setTrackingNumber('');
      setNotes('');
      fetchParcels();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log parcel');
    }
  };

  const handleClaimParcel = async (e) => {
    e.preventDefault();
    if (!claimOtp || !selectedParcel) return;
    setClaiming(true);
    try {
      await api.post('/gate/parcels/claim', {
        parcelId: selectedParcel._id,
        claimOtp
      });
      toast.success('Parcel claimed successfully! Handover verified.');
      setSelectedParcel(null);
      setClaimOtp('');
      fetchParcels();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP code');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
            Gate Parcel Locker
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSec }}>
            Secure package intake with 4-digit resident claim OTPs
          </p>
        </div>

        {(user.role === 'admin' || user.role === 'security' || user.role === 'superadmin') && (
          <button
            onClick={() => setShowLogModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', background: theme.accent, color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(217,115,78,0.25)'
            }}
          >
            <Plus size={18} /> Log Inbound Parcel
          </button>
        )}
      </div>

      {/* Grid of Parcels */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: theme.textSec }}>Loading parcels...</div>
      ) : parcels.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
          <Package size={48} color={theme.accent} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: theme.textMain }}>No active parcels</h4>
          <p style={{ margin: 0, fontSize: '14px', color: theme.textSec }}>There are currently no packages waiting at the gate.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {parcels.map((parcel) => (
            <motion.div
              key={parcel._id}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px',
                    background: parcel.status === 'Claimed' ? '#ECFDF5' : '#FFF7ED',
                    color: parcel.status === 'Claimed' ? '#059669' : '#EA580C'
                  }}>
                    {parcel.status === 'Claimed' ? 'Delivered' : 'Waiting at Gate'}
                  </span>
                  <span style={{ fontSize: '12px', color: theme.textSec, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {new Date(parcel.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: theme.textMain }}>
                  {parcel.carrier} {parcel.trackingNumber ? `• #${parcel.trackingNumber}` : ''}
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: theme.textSec }}>
                  Recipient Flat: <strong>{parcel.wing}-{parcel.flatNumber}</strong>
                </p>

                {parcel.notes && (
                  <p style={{ margin: 0, fontSize: '13px', background: '#F9F8F3', padding: '8px 12px', borderRadius: '8px', color: theme.textSec }}>
                    Note: {parcel.notes}
                  </p>
                )}
              </div>

              {/* OTP section */}
              <div style={{
                background: parcel.status === 'Claimed' ? '#F3F4F6' : '#EFF6FF',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={18} color={parcel.status === 'Claimed' ? '#6B7280' : '#2563EB'} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: parcel.status === 'Claimed' ? '#6B7280' : '#1E40AF' }}>
                    Claim OTP:
                  </span>
                </div>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  color: parcel.status === 'Claimed' ? '#6B7280' : '#1E40AF'
                }}>
                  {parcel.claimOtp}
                </span>
              </div>

              {parcel.status === 'At Gate' && (user.role === 'security' || user.role === 'admin' || user.role === 'superadmin') && (
                <button
                  onClick={() => { setSelectedParcel(parcel); setClaimOtp(''); }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#0F172A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Verify OTP & Release Package
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Log Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '450px', width: '100%', border: `1px solid ${theme.border}` }}>
              <h3 style={{ margin: '0 0 20px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
                Log Inbound Parcel
              </h3>
              <form onSubmit={handleLogParcel} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Carrier / Courier</label>
                  <select value={carrier} onChange={(e) => setCarrier(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }}>
                    <option value="Amazon">Amazon</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="DTDC">DTDC</option>
                    <option value="Swiggy/Zomato">Swiggy / Zomato</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Wing</label>
                    <input type="text" placeholder="e.g. A" value={wing} onChange={(e) => setWing(e.target.value)} required
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Flat No.</label>
                    <input type="text" placeholder="e.g. 402" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} required
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Tracking / Waybill No.</label>
                  <input type="text" placeholder="Optional" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Notes (Optional)</label>
                  <input type="text" placeholder="e.g. 2 boxes, fragile" value={notes} onChange={(e) => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowLogModal(false)}
                    style={{ flex: 1, padding: '12px', background: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ flex: 1, padding: '12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Log & Issue OTP
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Claim Modal */}
      <AnimatePresence>
        {selectedParcel && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '400px', width: '100%', border: `1px solid ${theme.border}` }}>
              <h3 style={{ margin: '0 0 10px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
                Verify Resident Claim OTP
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: theme.textSec }}>
                Enter the 4-digit code shown on resident's portal for Flat {selectedParcel.wing}-{selectedParcel.flatNumber}.
              </p>

              <form onSubmit={handleClaimParcel} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4829"
                  value={claimOtp}
                  onChange={(e) => setClaimOtp(e.target.value)}
                  autoFocus
                  style={{
                    padding: '14px',
                    fontSize: '24px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    letterSpacing: '8px',
                    borderRadius: '12px',
                    border: `2px solid ${theme.accent}`,
                    fontWeight: '700'
                  }}
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setSelectedParcel(null)}
                    style={{ flex: 1, padding: '12px', background: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={claiming || claimOtp.length < 4}
                    style={{ flex: 1, padding: '12px', background: '#0F172A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    {claiming ? 'Verifying...' : 'Confirm Delivery'}
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

export default ParcelGateLocker;
