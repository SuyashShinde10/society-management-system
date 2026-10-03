import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import theme from '../theme';
import { Briefcase, CheckCircle, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const VendorQuoteSubmit = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    quoteAmount: '',
    timeline: '',
    notes: ''
  });

  const fetchProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/vendors/projects/${projectId}/public`);
      setProject(data);
    } catch {
      // Fallback if public endpoint not yet exposed
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const [attempted, setAttempted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    
    // Simple frontend validation check for required fields
    if (!formData.vendorName || !formData.vendorEmail || !formData.vendorPhone || !formData.quoteAmount || !formData.timeline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/vendors/projects/${projectId}/quote`, formData);
      setSubmitted(true);
      toast.success('Quote submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  const getBorder = (val) => (attempted && !val) ? `1px solid ${theme.danger || '#EF4444'}` : `1px solid ${theme.border}`;

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F8F3', padding: '20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
          <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 20px auto' }} />
          <h2 style={{ margin: '0 0 10px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: theme.textMain }}>Quote Received</h2>
          <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", color: theme.textSec }}>
            Thank you for your submission. The society committee will review your proposal and get back to you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F8F3', padding: '40px 20px', fontFamily: "'Outfit', sans-serif" }}>
      <Toaster position="top-right" richColors />
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '15px' }}>
            <Briefcase size={28} color="#3B82F6" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', color: theme.textMain }}>Submit Proposal</h1>
            <p style={{ margin: '5px 0 0 0', color: theme.textSec, fontSize: '14px' }}>
              {project ? `For: ${project.title}` : 'Vendor RFQ Submission'}
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '10px', color: theme.textSec }}>
            <Loader2 className="animate-spin" size={24} />
            <span>Loading project RFQ details...</span>
          </div>
        ) : (
          project && (
            <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Project Specifications</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#475569', whiteSpace: 'pre-wrap' }}>{project.specs}</p>
            </div>
          )
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="registry-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: (attempted && !formData.vendorName) ? theme.danger : theme.textSec }}>Company/Vendor Name *</label>
              <input type="text" value={formData.vendorName} onChange={e => setFormData({...formData, vendorName: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: getBorder(formData.vendorName), fontFamily: "'Outfit', sans-serif" }} />
            </div>
            <div>
              <label className="registry-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: (attempted && !formData.vendorEmail) ? theme.danger : theme.textSec }}>Contact Email *</label>
              <input type="email" value={formData.vendorEmail} onChange={e => setFormData({...formData, vendorEmail: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: getBorder(formData.vendorEmail), fontFamily: "'Outfit', sans-serif" }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="registry-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: (attempted && !formData.vendorPhone) ? theme.danger : theme.textSec }}>Phone Number *</label>
              <input type="text" value={formData.vendorPhone} onChange={e => setFormData({...formData, vendorPhone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: getBorder(formData.vendorPhone), fontFamily: "'Outfit', sans-serif" }} />
            </div>
            <div>
              <label className="registry-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: (attempted && !formData.quoteAmount) ? theme.danger : theme.textSec }}>Quote Amount (₹) *</label>
              <input type="number" min="0" value={formData.quoteAmount} onChange={e => setFormData({...formData, quoteAmount: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: getBorder(formData.quoteAmount), fontFamily: "'Outfit', sans-serif" }} />
            </div>
          </div>

          <div>
            <label className="registry-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: (attempted && !formData.timeline) ? theme.danger : theme.textSec }}>Estimated Timeline (e.g., "3 weeks") *</label>
            <input type="text" value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: getBorder(formData.timeline), fontFamily: "'Outfit', sans-serif" }} />
          </div>

          <div>
            <label className="registry-label" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '700', color: theme.textSec }}>Additional Notes / Conditions</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${theme.border}`, fontFamily: "'Outfit', sans-serif", minHeight: '100px', resize: 'vertical' }} />
          </div>

          <button type="submit" disabled={submitting} style={{
            background: theme.textMain, color: 'white', padding: '16px', borderRadius: '12px', border: 'none',
            fontFamily: "'Outfit', sans-serif", fontWeight: '700', fontSize: '16px', cursor: 'pointer', marginTop: '10px'
          }}>
            {submitting ? 'Submitting...' : 'Submit Final Quote'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorQuoteSubmit;
