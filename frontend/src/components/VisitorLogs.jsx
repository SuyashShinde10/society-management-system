import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api';
import theme from '../theme';

const VisitorLogs = () => {
  const { data: visitors = [], isLoading: loading, isError } = useQuery({
    queryKey: ['visitors'],
    queryFn: async () => {
      const { data } = await api.get('/visitors/all');
      return data;
    },
    onError: () => {
      toast.error('Failed to load visitor logs');
    }
  });

  const insideCount = visitors.filter(v => v.status === 'Inside').length;

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '20px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ background: '#EEF2FF', padding: '12px', borderRadius: '16px' }}>
          <ShieldCheck size={28} color="#4F46E5" />
        </div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '600', margin: 0, color: theme.textMain }}>
          Security & Visitor Logs
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Users size={20} color="#64748B" />
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>Total Entries</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1E293B' }}>{visitors.length}</h2>
        </div>
        <div style={{ background: '#FEF2F2', padding: '20px', borderRadius: '16px', border: '1px solid #FCA5A5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Clock size={20} color="#EF4444" />
            <span style={{ fontSize: '14px', color: '#B91C1C', fontWeight: '500' }}>Currently Inside</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#B91C1C' }}>{insideCount}</h2>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748B' }}>Loading visitor logs...</p>
      ) : isError ? (
        <p style={{ textAlign: 'center', color: '#EF4444' }}>Failed to load visitors.</p>
      ) : visitors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '16px', border: `1px dashed ${theme.border}` }}>
          <p style={{ color: '#64748B', margin: 0 }}>No visitors recorded yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                <th style={{ padding: '16px', color: theme.textSec, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Visitor</th>
                <th style={{ padding: '16px', color: theme.textSec, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Purpose</th>
                <th style={{ padding: '16px', color: theme.textSec, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Destination</th>
                <th style={{ padding: '16px', color: theme.textSec, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Time In/Out</th>
                <th style={{ padding: '16px', color: theme.textSec, fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr key={visitor._id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '500', color: theme.textMain }}>{visitor.name}</div>
                    <div style={{ fontSize: '13px', color: theme.textSec }}>{visitor.phone}</div>
                  </td>
                  <td style={{ padding: '16px', color: theme.textMain }}>{visitor.purpose}</td>
                  <td style={{ padding: '16px', color: theme.textMain }}>
                    Flat {visitor.wing}-{visitor.flatNumber}
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: theme.textSec }}>
                    <div>In: {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    {visitor.checkOutTime && (
                      <div>Out: {new Date(visitor.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      background: visitor.status === 'Inside' ? '#FEF2F2' : '#F0FDF4',
                      color: visitor.status === 'Inside' ? '#EF4444' : '#16A34A'
                    }}>
                      {visitor.status === 'Inside' ? 'INSIDE' : 'CHECKED OUT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VisitorLogs;
