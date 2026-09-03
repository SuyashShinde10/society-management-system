import React from 'react';
import theme from '../../theme';
import { FileText, Download, MessageSquareWarning, CheckCircle, XCircle } from 'lucide-react';

export const BillCard = ({
  bill,
  user,
  isNested = false,
  isNew = false,
  onPayClick,
  onVerify,
  onReject,
  onDownloadInvoice,
  onOpenDispute,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' };
      case 'Under Verification':
        return { bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA' };
      case 'Overdue':
        return { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' };
      default:
        return { bg: '#FEF9C3', color: '#854D0E', border: '#FEF08A' };
    }
  };

  const badge = getStatusBadge(bill.status);

  return (
    <div
      style={{
        background: 'white',
        border: `1px solid ${theme.border}`,
        padding: isNested ? '16px' : '24px',
        borderRadius: '18px',
        borderLeft: `6px solid ${
          bill.status === 'Paid'
            ? theme.resolved
            : bill.status === 'Pending'
            ? theme.pending
            : theme.declined
        }`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        marginBottom: isNested ? '12px' : '0',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4
            style={{
              margin: '0 0 6px 0',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '18px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {bill.title}
            {!isNested && isNew && (
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '10px',
                  fontWeight: '700',
                  background: '#10B981',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  marginLeft: '10px',
                }}
              >
                NEW
              </span>
            )}
          </h4>
          {user?.role === 'admin' && (
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontFamily: "'Outfit', sans-serif", color: theme.textSec }}>
              TO: {bill.userId?.name || 'Resident'} {bill.userId?.flatDetails?.wing ? `(Wing ${bill.userId.flatDetails.wing} - Flat ${bill.userId.flatDetails.flatNumber || ''})` : ''}
            </p>
          )}
          <span style={{ fontSize: '12px', fontFamily: "'Outfit', sans-serif", color: theme.textSec }}>
            DUE: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A'}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'Outfit', sans-serif", color: theme.textMain }}>
            ₹{Number(bill.amount || 0).toLocaleString()}
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              fontFamily: "'Outfit', sans-serif",
              padding: '4px 10px',
              borderRadius: '20px',
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
              display: 'inline-block',
              marginTop: '4px',
            }}
          >
            {bill.status || 'Pending'}
          </span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div
        style={{
          marginTop: '18px',
          borderTop: `1px dashed ${theme.border}`,
          paddingTop: '14px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Admin Verification */}
          {bill.status === 'Under Verification' && user?.role === 'admin' && (
            <>
              <button
                onClick={() => onVerify && onVerify(bill)}
                style={{
                  background: theme.resolved,
                  color: 'white',
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle size={14} /> Verify Payment
              </button>
              <button
                onClick={() => onReject && onReject(bill)}
                style={{
                  background: theme.declined,
                  color: 'white',
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <XCircle size={14} /> Reject
              </button>
            </>
          )}

          {/* Member Pay Button */}
          {(bill.status === 'Pending' || bill.status === 'Overdue') && (
            <button
              onClick={() => onPayClick && onPayClick(bill)}
              style={{
                background: theme.textMain,
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {user?.role === 'admin' ? 'Record Payment' : 'Pay Now'}
            </button>
          )}

          {/* Receipt Download for Verified Paid Bills */}
          {bill.status === 'Paid' && (
            <button
              onClick={() => onDownloadInvoice && onDownloadInvoice(bill)}
              style={{
                background: '#F3F4F6',
                color: theme.textMain,
                padding: '8px 14px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={14} /> Invoice / Receipt
            </button>
          )}
        </div>

        {/* Dispute Resolution (Members) */}
        {user?.role === 'member' && bill.status !== 'Paid' && (
          <button
            onClick={() => onOpenDispute && onOpenDispute(bill)}
            style={{
              background: 'transparent',
              color: theme.declined,
              border: `1px solid ${theme.declined}`,
              padding: '6px 12px',
              borderRadius: '8px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MessageSquareWarning size={13} /> Dispute with AI
          </button>
        )}
      </div>
    </div>
  );
};

export default BillCard;
