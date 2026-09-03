import React, { useState } from 'react';
import theme from '../../theme';

export const SplitPaymentModal = ({
  bill,
  user,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [splitPayments, setSplitPayments] = useState({ upi: '', cash: '', bank: '' });
  const [error, setError] = useState(null);

  if (!isOpen || !bill) return null;

  const totalAmount = Number(bill.amount || 0);
  const upiVal = Number(splitPayments.upi) || 0;
  const cashVal = Number(splitPayments.cash) || 0;
  const bankVal = Number(splitPayments.bank) || 0;
  const enteredTotal = upiVal + cashVal + bankVal;
  const remaining = totalAmount - enteredTotal;

  const handleFillAll = (mode) => {
    setSplitPayments({
      upi: mode === 'upi' ? totalAmount.toString() : '',
      cash: mode === 'cash' ? totalAmount.toString() : '',
      bank: mode === 'bank' ? totalAmount.toString() : '',
    });
    setError(null);
  };

  const handleConfirm = () => {
    if (enteredTotal <= 0) {
      setError('Please enter payment amounts.');
      return;
    }

    if (Math.abs(remaining) > 0.01) {
      setError(`Payment total must equal exact bill amount of ₹${totalAmount.toLocaleString()} (Difference: ₹${Math.abs(remaining).toLocaleString()}).`);
      return;
    }

    // Build breakdown string
    const modes = [];
    if (upiVal > 0) modes.push(`UPI (₹${upiVal})`);
    if (cashVal > 0) modes.push(`Cash (₹${cashVal})`);
    if (bankVal > 0) modes.push(`Net Banking (₹${bankVal})`);

    const paymentMethodString = modes.join(' + ');
    onSubmit({ id: bill._id, method: paymentMethodString, action: 'approve' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          border: `1px solid ${theme.border}`,
        }}
      >
        <h3
          style={{
            margin: '0 0 6px 0',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '20px',
            fontWeight: '700',
            color: theme.textMain,
          }}
        >
          {user?.role === 'admin' ? 'Record Maintenance Payment' : 'Pay Maintenance Bill'}
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: theme.textSec, fontFamily: "'Outfit', sans-serif" }}>
          Bill: <strong>{bill.title}</strong> — Total Due: <strong style={{ color: theme.accent }}>₹{totalAmount.toLocaleString()}</strong>
        </p>

        {/* Fast Select Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => handleFillAll('upi')}
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: '#F9F8F3',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            100% UPI
          </button>
          <button
            type="button"
            onClick={() => handleFillAll('cash')}
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: '#F9F8F3',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            100% Cash
          </button>
          <button
            type="button"
            onClick={() => handleFillAll('bank')}
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              background: '#F9F8F3',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            100% Bank
          </button>
        </div>

        {/* Input fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', marginBottom: '4px', color: theme.textMain }}>
              UPI Amount (₹)
            </label>
            <input
              type="number"
              placeholder="0"
              value={splitPayments.upi}
              onChange={(e) => {
                setSplitPayments((prev) => ({ ...prev, upi: e.target.value }));
                setError(null);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                fontFamily: "'Outfit', sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', marginBottom: '4px', color: theme.textMain }}>
              Cash Amount (₹)
            </label>
            <input
              type="number"
              placeholder="0"
              value={splitPayments.cash}
              onChange={(e) => {
                setSplitPayments((prev) => ({ ...prev, cash: e.target.value }));
                setError(null);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                fontFamily: "'Outfit', sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', marginBottom: '4px', color: theme.textMain }}>
              Net Banking / Cheque Amount (₹)
            </label>
            <input
              type="number"
              placeholder="0"
              value={splitPayments.bank}
              onChange={(e) => {
                setSplitPayments((prev) => ({ ...prev, bank: e.target.value }));
                setError(null);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                fontFamily: "'Outfit', sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Tally Box */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '10px',
            background: remaining === 0 ? '#DCFCE7' : '#FEF3C7',
            border: `1px solid ${remaining === 0 ? '#86EFAC' : '#FDE68A'}`,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: '600',
            color: remaining === 0 ? '#166534' : '#92400E',
          }}
        >
          <span>Entered: ₹{enteredTotal.toLocaleString()}</span>
          <span>
            {remaining === 0
              ? '✓ Balanced'
              : remaining > 0
              ? `Remaining: ₹${remaining.toLocaleString()}`
              : `Overpaid by ₹${Math.abs(remaining).toLocaleString()}`}
          </span>
        </div>

        {error && (
          <p style={{ color: theme.declined, fontSize: '12px', margin: '8px 0 0 0', fontFamily: "'Outfit', sans-serif" }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#F3F4F6',
              color: theme.textMain,
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || remaining !== 0}
            style={{
              background: theme.textMain,
              color: 'white',
              border: 'none',
              padding: '9px 20px',
              borderRadius: '8px',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: '600',
              cursor: isSubmitting || remaining !== 0 ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || remaining !== 0 ? 0.6 : 1,
            }}
          >
            {isSubmitting
              ? 'Processing...'
              : user?.role === 'admin'
              ? 'Confirm Settlement'
              : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitPaymentModal;
