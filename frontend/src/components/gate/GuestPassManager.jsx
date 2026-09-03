import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import theme from '../../theme';
import AuthContext from '../../context/AuthContext';
import { QrCode, Plus, Share2, CheckCircle2, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const GuestPassManager = () => {
  const { user } = useContext(AuthContext);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [purpose, setPurpose] = useState('Personal Guest');

  // Guard verification state
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchPasses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/gate/passes');
      setPasses(data);
    } catch (err) {
      toast.error('Failed to load guest passes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  const handleCreatePass = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/gate/passes', {
        guestName,
        guestPhone,
        purpose
      });
      toast.success(`Guest pass generated! Code: ${data.pass.passCode}`);
      setShowCreateModal(false);
      setGuestName('');
      setGuestPhone('');
      fetchPasses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create pass');
    }
  };

  const handleVerifyPass = async (e) => {
    e.preventDefault();
    if (!verifyCode) return;
    setVerifying(true);
    try {
      const { data } = await api.post('/gate/passes/verify', { passCode: verifyCode });
      toast.success(`Access Granted! ${data.pass.guestName} verified.`);
      setVerifyCode('');
      fetchPasses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired pass code');
    } finally {
      setVerifying(false);
    }
  };

  const handleShareWhatsApp = (pass) => {
    const text = `Hi ${pass.guestName}! Here is your digital entry pass for Flat ${user.wing || 'Wing'}-${user.flatNumber || 'Flat'}.\nEntry Code: *${pass.passCode}*\nShow this code to security at the gate for seamless entry.`;
    const url = `https://wa.me/${pass.guestPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
            Pre-Approved Guest Passes
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSec }}>
            Generate 1-click digital gate passes with instant WhatsApp sharing
          </p>
        </div>

        {user.role === 'member' && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', background: theme.accent, color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(217,115,78,0.25)'
            }}
          >
            <Plus size={18} /> Invite New Guest
          </button>
        )}
      </div>

      {/* Guard Quick Verification Box */}
      {(user.role === 'security' || user.role === 'admin' || user.role === 'superadmin') && (
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: 'white',
          borderRadius: '20px',
          padding: '24px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '600' }}>
              Quick Gate Pass Verification
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
              Enter the 6-digit digital pass presented by the visitor.
            </p>
          </div>

          <form onSubmit={handleVerifyPass} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 592810"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid #334155',
                background: '#020617',
                color: 'white',
                fontSize: '16px',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                width: '150px',
                textAlign: 'center'
              }}
            />
            <button
              type="submit"
              disabled={verifying || verifyCode.length < 6}
              style={{
                padding: '10px 20px',
                background: theme.accent,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {verifying ? 'Checking...' : 'Verify Entry'}
            </button>
          </form>
        </div>
      )}

      {/* Passes Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: theme.textSec }}>Loading guest passes...</div>
      ) : passes.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
          <QrCode size={48} color={theme.accent} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: theme.textMain }}>No active guest passes</h4>
          <p style={{ margin: 0, fontSize: '14px', color: theme.textSec }}>Generate a pass ahead of time so your friends or family can enter without waiting.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {passes.map((pass) => (
            <motion.div
              key={pass._id}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px',
                    background: pass.status === 'Used' ? '#ECFDF5' : pass.status === 'Active' ? '#EFF6FF' : '#FEF2F2',
                    color: pass.status === 'Used' ? '#059669' : pass.status === 'Active' ? '#2563EB' : '#DC2626'
                  }}>
                    {pass.status === 'Used' ? 'Entered' : pass.status}
                  </span>
                  <span style={{ fontSize: '12px', color: theme.textSec, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> Valid: {new Date(pass.validDate).toLocaleDateString()}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: theme.textMain }}>
                  {pass.guestName}
                </h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: theme.textSec }}>
                  Purpose: <strong>{pass.purpose}</strong> • Tel: {pass.guestPhone}
                </p>

                {pass.residentId?.name && (
                  <p style={{ margin: 0, fontSize: '12px', color: theme.textSec }}>
                    Invited by: {pass.residentId.name} ({pass.residentId.wing}-{pass.residentId.flatNumber})
                  </p>
                )}
              </div>

              {/* Digital Pass Box */}
              <div style={{
                background: '#F9F8F3',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: `1px dashed ${theme.border}`
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: theme.textSec, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                    Pass Code
                  </span>
                  <div style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: '700', letterSpacing: '3px', color: theme.accent }}>
                    {pass.passCode}
                  </div>
                </div>

                <button
                  onClick={() => handleShareWhatsApp(pass)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px',
                    background: '#25D366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <Share2 size={14} /> WhatsApp
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '420px', width: '100%', border: `1px solid ${theme.border}` }}>
              <h3 style={{ margin: '0 0 20px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
                Generate Pre-Approved Pass
              </h3>
              <form onSubmit={handleCreatePass} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Guest Name</label>
                  <input type="text" placeholder="e.g. Ananya Sen" value={guestName} onChange={(e) => setGuestName(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Guest WhatsApp / Mobile</label>
                  <input type="tel" placeholder="10-digit mobile" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Purpose of Visit</label>
                  <select value={purpose} onChange={(e) => setPurpose(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }}>
                    <option value="Personal Guest">Personal Guest / Family</option>
                    <option value="Delivery Agent">Delivery Agent</option>
                    <option value="Home Repair / Service">Home Repair / Service</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)}
                    style={{ flex: 1, padding: '12px', background: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ flex: 1, padding: '12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Create Pass
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

export default GuestPassManager;
