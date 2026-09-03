import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import theme from '../../theme';
import AuthContext from '../../context/AuthContext';
import { Landmark, FileSpreadsheet, FileCode, Receipt, TrendingUp, AlertTriangle, Plus, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const AccountingCenter = () => {
  const { user } = useContext(AuthContext);
  const [taxSummary, setTaxSummary] = useState(null);
  const [sinkingData, setSinkingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddFdModal, setShowAddFdModal] = useState(false);

  // Form State
  const [bankName, setBankName] = useState('HDFC Bank');
  const [fdNumber, setFdNumber] = useState('');
  const [principalAmount, setPrincipalAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(7.25);
  const [tenureMonths, setTenureMonths] = useState(12);
  const [purpose, setPurpose] = useState('General Reserve');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taxRes, sinkingRes] = await Promise.all([
        api.get('/accounting/tax-summary'),
        api.get('/accounting/sinking-funds')
      ]);
      setTaxSummary(taxRes.data);
      setSinkingData(sinkingRes.data);
    } catch (err) {
      toast.error('Failed to load accounting details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadTally = async () => {
    try {
      const response = await api.get('/accounting/export/tally', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tally_vouchers.xml');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Tally Prime XML exported successfully!');
    } catch (err) {
      toast.error('Failed to export Tally XML');
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await api.get('/accounting/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'society_ledger.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Double-entry CSV exported successfully!');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const handleCreateFD = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounting/sinking-funds', {
        bankName,
        fdNumber,
        principalAmount,
        interestRate,
        tenureMonths,
        startDate: new Date(),
        purpose
      });
      toast.success('Sinking Fund FD recorded!');
      setShowAddFdModal(false);
      setFdNumber('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record FD');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
            Enterprise Accounting & Tally Sync
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSec }}>
            Double-entry ledger exports for Tally / QuickBooks, GST reconciliation, and Sinking Fund tracking
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadTally}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', background: '#0F172A', color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            <FileCode size={16} /> Export Tally XML
          </button>

          <button
            onClick={handleDownloadCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', background: 'white', color: theme.textMain,
              border: `1px solid ${theme.border}`, borderRadius: '12px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={16} /> Export General Ledger CSV
          </button>
        </div>
      </div>

      {/* Tax & GST Reconciliation Banner */}
      {taxSummary && (
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '24px 30px',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <span style={{ fontSize: '12px', color: theme.textSec, textTransform: 'uppercase', fontWeight: '700' }}>
              Maintenance Revenue
            </span>
            <div style={{ fontSize: '22px', fontWeight: '700', color: theme.textMain, marginTop: '4px' }}>
              ₹{taxSummary.totalRevenue.toLocaleString()}
            </div>
            <span style={{ fontSize: '12px', color: '#059669' }}>Total Billed this Term</span>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: theme.textSec, textTransform: 'uppercase', fontWeight: '700' }}>
              Output GST (18%)
            </span>
            <div style={{ fontSize: '22px', fontWeight: '700', color: theme.accent, marginTop: '4px' }}>
              ₹{taxSummary.gstOutputCollected.toLocaleString()}
            </div>
            <span style={{ fontSize: '12px', color: theme.textSec }}>Collected on Bills</span>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: theme.textSec, textTransform: 'uppercase', fontWeight: '700' }}>
              Input Tax Credit (ITC)
            </span>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#10B981', marginTop: '4px' }}>
              ₹{taxSummary.gstInputCreditAvailable.toLocaleString()}
            </div>
            <span style={{ fontSize: '12px', color: '#10B981' }}>Available against expenses</span>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: theme.textSec, textTransform: 'uppercase', fontWeight: '700' }}>
              Net GST Payable
            </span>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#DC2626', marginTop: '4px' }}>
              ₹{taxSummary.netGstPayable.toLocaleString()}
            </div>
            <span style={{ fontSize: '12px', color: '#DC2626' }}>TDS Est: ₹{taxSummary.estimatedTdsWithheld.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Sinking Fund & Fixed Deposit Reserves */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
              Sinking Funds & Fixed Deposit Reserves
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: theme.textSec }}>
              Long-term capital reserves for lift replacements, structural painting, and major overhauls
            </p>
          </div>

          {(user.role === 'admin' || user.role === 'superadmin') && (
            <button
              onClick={() => setShowAddFdModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', background: theme.accent, color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Record Bank FD
            </button>
          )}
        </div>

        {/* Reserves Overview Cards */}
        {sinkingData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
            <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '18px', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '12px', color: theme.textSec, textTransform: 'uppercase', fontWeight: '700' }}>Total Principal Invested</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.textMain, marginTop: '6px' }}>
                ₹{sinkingData.totalPrincipal.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#ECFDF5', padding: '20px', borderRadius: '18px', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: '12px', color: '#047857', textTransform: 'uppercase', fontWeight: '700' }}>Projected Maturity Value</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#065F46', marginTop: '6px' }}>
                ₹{sinkingData.totalExpectedMaturity.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#FFF7ED', padding: '20px', borderRadius: '18px', border: '1px solid #FED7AA' }}>
              <div style={{ fontSize: '12px', color: '#C2410C', textTransform: 'uppercase', fontWeight: '700' }}>Upcoming Maturities (90 Days)</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#9A3412', marginTop: '6px' }}>
                {sinkingData.upcomingMaturityCount} Active FD(s)
              </div>
            </div>
          </div>
        )}

        {/* FD List */}
        {sinkingData?.funds?.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '15px' }}>
            {sinkingData.funds.map((fd) => (
              <div
                key={fd._id}
                style={{
                  background: 'white',
                  borderRadius: '18px',
                  padding: '20px',
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '12px', background: '#F1F5F9', color: '#334155' }}>
                    {fd.purpose}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>
                    {fd.interestRate}% p.a.
                  </span>
                </div>

                <div>
                  <h5 style={{ margin: '0 0 2px 0', fontSize: '18px', color: theme.textMain }}>
                    {fd.bankName} • #{fd.fdNumber}
                  </h5>
                  <p style={{ margin: 0, fontSize: '13px', color: theme.textSec }}>
                    Principal: <strong>₹{fd.principalAmount.toLocaleString()}</strong> • Tenure: {fd.tenureMonths} mos
                  </p>
                </div>

                <div style={{
                  background: '#F9F8F3',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px'
                }}>
                  <span style={{ color: theme.textSec }}>Maturity Date:</span>
                  <strong>{new Date(fd.maturityDate).toLocaleDateString()}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: '600' }}>
                  <span style={{ color: theme.textSec }}>Expected Maturity:</span>
                  <span style={{ color: theme.accent, fontSize: '16px' }}>₹{fd.maturityAmount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add FD Modal */}
      <AnimatePresence>
        {showAddFdModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '450px', width: '100%', border: `1px solid ${theme.border}` }}>
              <h3 style={{ margin: '0 0 20px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
                Record Sinking Fund FD
              </h3>
              <form onSubmit={handleCreateFD} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Bank Name</label>
                  <input type="text" placeholder="e.g. HDFC Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>FD Account / Receipt No.</label>
                  <input type="text" placeholder="e.g. FD-88992200" value={fdNumber} onChange={(e) => setFdNumber(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Principal (₹)</label>
                    <input type="number" min={1000} value={principalAmount} onChange={(e) => setPrincipalAmount(Number(e.target.value))} required
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Interest Rate (% p.a.)</label>
                    <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} required
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Tenure (Months)</label>
                    <input type="number" min={1} max={120} value={tenureMonths} onChange={(e) => setTenureMonths(Number(e.target.value))} required
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Allocated Purpose</label>
                    <select value={purpose} onChange={(e) => setPurpose(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }}>
                      <option value="General Reserve">General Reserve</option>
                      <option value="Lift Replacement">Lift Replacement</option>
                      <option value="Building Painting">Building Painting</option>
                      <option value="Roof Waterproofing">Roof Waterproofing</option>
                      <option value="Security Infrastructure">Security Infrastructure</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddFdModal(false)}
                    style={{ flex: 1, padding: '12px', background: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ flex: 1, padding: '12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Save FD Record
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

export default AccountingCenter;
