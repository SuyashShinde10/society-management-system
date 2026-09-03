import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { Briefcase, Plus, Users, Cpu, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const VendorProjects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', specs: '', budget: '', deadline: '' });
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/vendors/projects');
      setProjects(data);
    } catch (err) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (projectId) => {
    try {
      const { data } = await api.get(`/vendors/projects/${projectId}`);
      setSelectedProject(data.project);
      setQuotes(data.quotes);
    } catch (err) {
      toast.error('Failed to fetch project details');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/vendors/projects', newProject);
      toast.success('Project RFQ created successfully');
      setShowCreateForm(false);
      setNewProject({ title: '', description: '', specs: '', budget: '', deadline: '' });
      fetchProjects();
    } catch (err) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (projectId) => {
    try {
      setLoading(true);
      toast.info('AI is analyzing quotes... this may take a moment.');
      const { data } = await api.post(`/vendors/projects/${projectId}/analyze`);
      toast.success('Analysis complete!');
      setSelectedProject(data.project);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const copyVendorLink = (projectId) => {
    const link = `${window.location.origin}/vendor/quote/${projectId}`;
    navigator.clipboard.writeText(link);
    toast.success('Vendor submission link copied to clipboard!');
  };

  if (selectedProject) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setSelectedProject(null)} style={{
            background: 'transparent', border: `1px solid ${theme.border}`, padding: '8px 16px', borderRadius: '10px',
            fontFamily: "'Outfit', sans-serif", cursor: 'pointer', color: theme.textMain
          }}>
            ← Back to Projects
          </button>
          <button onClick={() => copyVendorLink(selectedProject._id)} style={{
            background: theme.textMain, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px',
            fontFamily: "'Outfit', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Copy size={16} /> Copy RFQ Link
          </button>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
          <h2 style={{ margin: '0 0 10px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: theme.textMain }}>
            {selectedProject.title}
          </h2>
          <p style={{ margin: '0 0 20px 0', fontFamily: "'Outfit', sans-serif", color: theme.textSec }}>
            {selectedProject.description} • Budget: ₹{selectedProject.budget || 'N/A'} • Deadline: {new Date(selectedProject.deadline).toLocaleDateString()}
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span style={{ background: '#EFF6FF', color: '#3B82F6', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              {quotes.length} Quotes Received
            </span>
            <span style={{ background: selectedProject.status === 'Open' ? '#FEF9C3' : '#DCFCE7', color: selectedProject.status === 'Open' ? '#854D0E' : '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              Status: {selectedProject.status}
            </span>
          </div>
        </div>

        {selectedProject.aiAnalysis ? (
          <div style={{ background: '#F0F9FF', padding: '24px', borderRadius: '20px', border: '1px solid #BAE6FD' }}>
            <h3 style={{ margin: '0 0 15px 0', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '10px', color: '#0369A1' }}>
              <Cpu size={24} /> AI Recommendation Matrix
            </h3>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', lineHeight: '1.6', color: '#0C4A6E' }}>
              <ReactMarkdown>{selectedProject.aiAnalysis}</ReactMarkdown>
            </div>
          </div>
        ) : (
          quotes.length > 0 && (
            <button onClick={() => handleAnalyze(selectedProject._id)} disabled={loading} style={{
              background: '#0369A1', color: 'white', padding: '16px', borderRadius: '15px', border: 'none',
              fontFamily: "'Outfit', sans-serif", fontWeight: '600', fontSize: '16px', cursor: 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
            }}>
              <Cpu size={20} /> {loading ? 'Analyzing Quotes...' : 'Run AI Quote Analysis'}
            </button>
          )
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {quotes.map(q => (
            <div key={q._id} style={{ background: 'white', padding: '20px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
              <h4 style={{ margin: '0 0 5px 0', fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>{q.vendorName}</h4>
              <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: theme.textSec }}>{q.vendorEmail} • {q.vendorPhone || 'No Phone'}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: theme.textSec }}>Quote Amount</span>
                <span style={{ fontWeight: '700' }}>₹{q.quoteAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: theme.textSec }}>Timeline</span>
                <span style={{ fontWeight: '600' }}>{q.timeline}</span>
              </div>
              {q.notes && (
                <div style={{ background: '#F9F8F3', padding: '10px', borderRadius: '10px', fontSize: '13px', fontStyle: 'italic', marginTop: '10px' }}>
                  "{q.notes}"
                </div>
              )}
            </div>
          ))}
          {quotes.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: theme.textSec, background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              No quotes received yet. Share the RFQ link with vendors.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#EFF6FF', padding: '10px', borderRadius: '12px' }}>
            <Briefcase size={24} color="#3B82F6" />
          </div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
            Vendor Marketplace
          </h3>
        </div>
        <button onClick={() => setShowCreateForm(!showCreateForm)} style={{
          background: showCreateForm ? '#FEE2E2' : theme.accent, color: showCreateForm ? '#DC2626' : 'white', border: 'none', padding: '10px 16px', borderRadius: '10px',
          fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '14px'
        }}>
          {showCreateForm ? 'Cancel' : 'Create New RFQ'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} style={{ padding: '24px', background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '15px', margin: '0 10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label className="registry-label">Project Title</label>
              <input type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="organic-input" required />
            </div>
            <div>
              <label className="registry-label">Budget (Optional, ₹)</label>
              <input type="number" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: e.target.value})} className="organic-input" />
            </div>
          </div>
          <div>
            <label className="registry-label">Short Description</label>
            <input type="text" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="organic-input" required />
          </div>
          <div>
            <label className="registry-label">Detailed Specifications (Material, Scope, etc.)</label>
            <textarea value={newProject.specs} onChange={e => setNewProject({...newProject, specs: e.target.value})} className="organic-input" style={{ minHeight: '100px', resize: 'vertical' }} required />
          </div>
          <div>
            <label className="registry-label">Quote Submission Deadline</label>
            <input type="date" value={newProject.deadline} onChange={e => setNewProject({...newProject, deadline: e.target.value})} className="organic-input" required />
          </div>
          <button type="submit" disabled={loading} style={{
            background: theme.textMain, color: 'white', padding: '12px 24px', border: 'none', borderRadius: '12px',
            fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start'
          }}>
            {loading ? 'Publishing...' : 'Publish Project RFQ'}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', padding: '0 10px' }}>
        {projects.map(p => (
          <div key={p._id} style={{
            background: 'white', border: `1px solid ${theme.border}`, padding: '24px', borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '15px',
            transition: 'transform 0.2s', cursor: 'pointer'
          }} onClick={() => fetchDetails(p._id)} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fetchDetails(p._id); } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: '700', color: theme.textMain }}>{p.title}</h4>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: p.status === 'Open' ? '#FEF9C3' : (p.status === 'Analysis_Complete' ? '#DCFCE7' : '#F1F5F9'), color: p.status === 'Open' ? '#854D0E' : (p.status === 'Analysis_Complete' ? '#166534' : '#475569') }}>
                {p.status}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: theme.textSec, flex: 1 }}>{p.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: theme.textSec, borderTop: `1px dashed ${theme.border}`, paddingTop: '15px' }}>
              <span>Deadline: {new Date(p.deadline).toLocaleDateString()}</span>
              <span style={{ fontWeight: '600', color: theme.accent }}>View Quotes →</span>
            </div>
          </div>
        ))}
        {projects.length === 0 && !loading && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: theme.textSec, background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
            No projects found. Create an RFQ to start inviting vendors.
          </p>
        )}
      </div>
    </div>
  );
};

export default VendorProjects;
