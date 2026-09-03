import React from 'react';
import theme from '../../theme';
import BillCard from './BillCard';

export const BillBatchCard = ({
  group,
  user,
  isExpanded,
  onToggleExpand,
  onVerify,
  onReject,
  onDownloadInvoice,
}) => {
  const collectionPercent = group.totalAmount > 0 
    ? Math.round((group.collectedAmount / group.totalAmount) * 100) 
    : 0;

  return (
    <div
      style={{
        background: 'white',
        border: `1px solid ${theme.border}`,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        transition: 'all 0.2s',
      }}
    >
      {/* Group Header Card */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: '700', color: theme.textMain }}>
              {group.title}
            </h3>
            <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: theme.textSec, fontFamily: "'Outfit', sans-serif" }}>
              DUE DATE: {new Date(group.dueDate).toLocaleDateString()}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '12px', background: '#F3F4F6', color: theme.textMain }}>
                Total: {group.total}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '12px', background: '#DCFCE7', color: '#166534' }}>
                Paid: {group.paid}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '12px', background: '#FFEDD5', color: '#C2410C' }}>
                Verifying: {group.verifying}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '12px', background: '#FEF9C3', color: '#854D0E' }}>
                Pending: {group.pending}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: theme.textMain, fontFamily: "'Outfit', sans-serif" }}>
              ₹{group.collectedAmount.toLocaleString()} <span style={{ fontSize: '14px', color: theme.textSec }}>/ ₹{group.totalAmount.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: theme.accent, marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
              {collectionPercent}% Collected
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', marginTop: '20px' }}>
          <div
            style={{
              width: `${collectionPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10B981, #059669)',
              borderRadius: '4px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onToggleExpand}
            style={{
              background: 'transparent',
              color: theme.textMain,
              border: `1px solid ${theme.border}`,
              padding: '6px 14px',
              borderRadius: '8px',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {isExpanded ? '▲ Hide Individual Bills' : `▼ View ${group.bills.length} Individual Bills`}
          </button>
        </div>
      </div>

      {/* Expanded Inner Member Bills */}
      {isExpanded && (
        <div style={{ background: '#F9F8F3', padding: '20px', borderTop: `1px solid ${theme.border}` }}>
          {group.bills.map((b) => (
            <BillCard
              key={b._id}
              bill={b}
              user={user}
              isNested={true}
              onVerify={onVerify}
              onReject={onReject}
              onDownloadInvoice={onDownloadInvoice}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BillBatchCard;
