import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import theme from '../../theme';
import AuthContext from '../../context/AuthContext';
import { Vote, CheckCircle2, Clock, Plus, BarChart3, Users, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const DigitalAGM = () => {
  const { user } = useContext(AuthContext);
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State (Admin)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [quorumPercent, setQuorumPercent] = useState(50);
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [optionInputs, setOptionInputs] = useState(['Approve', 'Reject', 'Abstain']);

  const fetchResolutions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/lifestyle/resolutions');
      setResolutions(data);
    } catch (err) {
      toast.error('Failed to load AGM resolutions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResolutions();
  }, []);

  const handleVote = async (resolutionId, optionIndex) => {
    try {
      await api.post(`/lifestyle/resolutions/${resolutionId}/vote`, { optionIndex });
      toast.success('Your vote has been recorded confidentially!');
      fetchResolutions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cast vote');
    }
  };

  const handleCreateResolution = async (e) => {
    e.preventDefault();
    try {
      const deadline = new Date(Date.now() + deadlineDays * 24 * 3600 * 1000);
      await api.post('/lifestyle/resolutions', {
        title,
        description,
        category,
        quorumPercent,
        deadline,
        options: optionInputs.filter(o => o.trim().length > 0)
      });
      toast.success('Resolution tabled for AGM e-voting!');
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      fetchResolutions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create resolution');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
            Digital AGM & E-Voting Resolutions
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSec }}>
            Formal society resolutions, quorum tracking, and confidential electronic ballots
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
            <Plus size={18} /> Propose Resolution
          </button>
        )}
      </div>

      {/* Resolutions List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: theme.textSec }}>Loading resolutions...</div>
      ) : resolutions.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
          <Vote size={48} color={theme.accent} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: theme.textMain }}>No active resolutions</h4>
          <p style={{ margin: 0, fontSize: '14px', color: theme.textSec }}>There are currently no open AGM ballots or pending voting items.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {resolutions.map((res) => {
            const hasVoted = res.voters?.some(v => v.residentId === user._id || v.residentId?._id === user._id);
            const totalVotes = res.options.reduce((sum, o) => sum + (o.votesCount || 0), 0);

            return (
              <motion.div
                key={res._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '30px',
                  border: `1px solid ${theme.border}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '8px', background: '#F9F8F3', color: theme.textSec }}>
                        {res.category}
                      </span>
                      <span style={{
                        fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '8px',
                        background: res.status === 'Passed' ? '#ECFDF5' : res.status === 'Open' ? '#EFF6FF' : '#FEF2F2',
                        color: res.status === 'Passed' ? '#059669' : res.status === 'Open' ? '#2563EB' : '#DC2626'
                      }}>
                        {res.status}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '600', color: theme.textMain }}>
                      {res.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '14px', color: theme.textSec, lineHeight: '1.6' }}>
                      {res.description}
                    </p>
                  </div>

                  <div style={{ fontSize: '13px', color: theme.textSec, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} /> Deadline: {new Date(res.deadline).toLocaleDateString()}
                  </div>
                </div>

                {/* Quorum Progress Bar */}
                <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                    <span style={{ color: theme.textMain, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={16} color={theme.accent} /> Quorum Progress
                    </span>
                    <span style={{ color: res.currentQuorumAchieved >= res.quorumPercent ? '#059669' : '#EA580C' }}>
                      {res.currentQuorumAchieved}% achieved (Target: {res.quorumPercent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, (res.currentQuorumAchieved / res.quorumPercent) * 100)}%`,
                      height: '100%',
                      background: res.currentQuorumAchieved >= res.quorumPercent ? '#10B981' : theme.accent,
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>

                {/* Voting Options */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {res.options.map((opt, idx) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0;

                    return (
                      <div
                        key={idx}
                        style={{
                          border: `1px solid ${theme.border}`,
                          borderRadius: '16px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px',
                          background: '#FFFFFF'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '16px', color: theme.textMain }}>{opt.text}</strong>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: theme.accent }}>{pct}%</span>
                          </div>
                          <span style={{ fontSize: '12px', color: theme.textSec }}>{opt.votesCount} votes</span>
                        </div>

                        {res.status === 'Open' && !hasVoted && user.role === 'member' && (
                          <button
                            onClick={() => handleVote(res._id, idx)}
                            style={{
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
                            Vote: {opt.text}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {hasVoted && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#059669', fontWeight: '600' }}>
                    <CheckCircle2 size={16} /> You have securely cast your ballot on this resolution.
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Resolution Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '500px', width: '100%', border: `1px solid ${theme.border}` }}>
              <h3 style={{ margin: '0 0 20px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
                Table New AGM Resolution
              </h3>
              <form onSubmit={handleCreateResolution} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Resolution Title</label>
                  <input type="text" placeholder="e.g. Common Area Solar Installation" value={title} onChange={(e) => setTitle(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Detailed Description & Impact</label>
                  <textarea rows={3} placeholder="Financial quotes, bylaws affected, voting requirement..." value={description} onChange={(e) => setDescription(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }}>
                      <option value="Finance">Finance & CapEx</option>
                      <option value="Maintenance">Maintenance & Vendors</option>
                      <option value="Rule Change">Society Rule Change</option>
                      <option value="Election">Committee Election</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Quorum Required (%)</label>
                    <input type="number" min={10} max={100} value={quorumPercent} onChange={(e) => setQuorumPercent(Number(e.target.value))} required
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Voting Window (Days)</label>
                  <input type="number" min={1} max={30} value={deadlineDays} onChange={(e) => setDeadlineDays(Number(e.target.value))} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)}
                    style={{ flex: 1, padding: '12px', background: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ flex: 1, padding: '12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Publish Resolution
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

export default DigitalAGM;
