import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import theme from '../theme';
import { ShieldCheck, MapPin, CheckCircle, Clock } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const EscrowLedger = () => {
  const { user } = useContext(AuthContext);
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/escrow');
      setEscrows(data);
    } catch (err) {
      toast.error('Failed to fetch escrow records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Released':
        return <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>RELEASED</span>;
      case 'Disputed':
        return <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>DISPUTED</span>;
      default:
        return <span style={{ background: '#FEF9C3', color: '#854D0E', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>HELD</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <div style={{ background: '#EFF6FF', padding: '10px', borderRadius: '12px' }}>
          <ShieldCheck size={24} color="#3B82F6" />
        </div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          Escrow Ledger & Auto-Payouts
        </h3>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', margin: '0 10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: "'Outfit', sans-serif" }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${theme.border}`, fontSize: '13px', color: theme.textSec }}>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>Project</th>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>Vendor</th>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>Amount</th>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>Geofence</th>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>Resident</th>
              <th style={{ padding: '16px 20px', fontWeight: '600' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: theme.textSec }}>Loading ledger...</td>
              </tr>
            ) : escrows.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: theme.textSec }}>No active escrow transactions found.</td>
              </tr>
            ) : (
              escrows.map((esc) => (
                <tr key={esc._id} style={{ borderBottom: `1px solid ${theme.border}`, fontSize: '14px', color: theme.textMain }}>
                  <td style={{ padding: '16px 20px' }}>{esc.projectId?.title || 'Unknown Project'}</td>
                  <td style={{ padding: '16px 20px' }}>{esc.vendorQuoteId?.vendorName || 'Unknown Vendor'}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>₹{esc.amount?.toLocaleString()}</td>
                  <td style={{ padding: '16px 20px' }}>
                    {esc.geofenceVerified ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}><MapPin size={16} /> Verified</span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}><Clock size={16} /> Pending</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {esc.residentVerified ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}><CheckCircle size={16} /> Approved</span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}><Clock size={16} /> Pending</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>{getStatusBadge(esc.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EscrowLedger;
