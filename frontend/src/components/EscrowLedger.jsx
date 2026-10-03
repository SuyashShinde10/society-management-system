import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import theme from '../theme';
import { ShieldCheck, MapPin, CheckCircle, Clock } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import EmptyState from './ui/EmptyState';
import { TableSkeleton } from './ui/DashboardSkeleton';

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

      {loading ? (
        <TableSkeleton rows={4} cols={6} />
      ) : escrows.length === 0 ? (
        <EmptyState
          type="bills"
          title="No Active Escrow Contracts"
          description="Capital projects with geofenced vendor milestone escrows will be displayed here."
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block" style={{ background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}`, overflowX: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', margin: '0 10px' }}>
            <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontFamily: "'Outfit', sans-serif" }}>
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
                {escrows.map((esc) => (
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Stack View */}
          <div className="md:hidden flex flex-col gap-3 px-2.5">
            {escrows.map((esc) => (
              <div
                key={esc._id}
                className="bg-white p-4 rounded-2xl border border-[#E8E4D9] shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm m-0">
                      {esc.projectId?.title || 'Unknown Project'}
                    </h4>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">
                      Vendor: <span className="text-slate-700 font-medium">{esc.vendorQuoteId?.vendorName || 'Unknown'}</span>
                    </p>
                  </div>
                  <div>{getStatusBadge(esc.status)}</div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="font-bold text-base text-slate-900 font-outfit tabular-nums">
                    ₹{esc.amount?.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                      {esc.geofenceVerified ? (
                        <span className="text-emerald-600 flex items-center gap-1"><MapPin size={13} /> Geofence</span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1"><Clock size={13} /> Geofence</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                      {esc.residentVerified ? (
                        <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={13} /> Approved</span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1"><Clock size={13} /> Approval</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EscrowLedger;
