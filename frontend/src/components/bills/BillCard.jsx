import React from 'react';
import { FileText, Download, MessageSquareWarning, CheckCircle, XCircle } from 'lucide-react';

// ── Status badge helpers ──────────────────────────────────────────────────────

const STATUS_CLASSES = {
  Paid:               'bg-green-100 text-green-800 border border-green-200',
  'Under Verification':'bg-orange-100 text-orange-700 border border-orange-200',
  Overdue:            'bg-red-100 text-red-800 border border-red-200',
};
const DEFAULT_STATUS_CLASS = 'bg-yellow-100 text-yellow-800 border border-yellow-200';

const LEFT_BORDER = {
  Paid:    'border-l-green-500',
  Pending: 'border-l-yellow-400',
};
const DEFAULT_LEFT_BORDER = 'border-l-red-400';

// ── Component ────────────────────────────────────────────────────────────────

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
  const statusClass   = STATUS_CLASSES[bill.status] ?? DEFAULT_STATUS_CLASS;
  const leftBorder    = LEFT_BORDER[bill.status] ?? DEFAULT_LEFT_BORDER;
  const padding       = isNested ? 'p-4' : 'p-6';

  return (
    <div
      className={[
        'bg-white rounded-[18px] border border-gray-200 border-l-[6px]',
        leftBorder,
        padding,
        'shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md',
        isNested ? 'mb-3' : '',
      ].join(' ')}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="flex items-center gap-2 m-0 font-outfit text-lg font-semibold text-gray-900 truncate">
            {bill.title}
            {!isNested && isNew && (
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full shrink-0">
                NEW
              </span>
            )}
          </h4>

          {user?.role === 'admin' && (
            <p className="mt-1 text-xs text-gray-500 font-outfit">
              TO:&nbsp;{bill.userId?.name || 'Resident'}
              {bill.userId?.flatDetails?.wing
                ? ` (Wing ${bill.userId.flatDetails.wing} – Flat ${bill.userId.flatDetails.flatNumber || ''})`
                : ''}
            </p>
          )}

          <span className="text-xs text-gray-400 font-outfit">
            DUE:&nbsp;{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A'}
          </span>
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-gray-900 font-outfit">
            ₹{Number(bill.amount || 0).toLocaleString()}
          </div>
          <span className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusClass}`}>
            {bill.status || 'Pending'}
          </span>
        </div>
      </div>

      {/* ── Action Toolbar ── */}
      <div className="mt-4 pt-3.5 border-t border-dashed border-gray-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {/* Admin — Verify / Reject */}
          {bill.status === 'Under Verification' && user?.role === 'admin' && (
            <>
              <button
                onClick={() => onVerify?.(bill)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                <CheckCircle size={14} /> Verify Payment
              </button>
              <button
                onClick={() => onReject?.(bill)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                <XCircle size={14} /> Reject
              </button>
            </>
          )}

          {/* Pay / Record Payment */}
          {(bill.status === 'Pending' || bill.status === 'Overdue') && (
            <button
              onClick={() => onPayClick?.(bill)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-colors"
            >
              {user?.role === 'admin' ? 'Record Payment' : 'Pay Now'}
            </button>
          )}

          {/* Invoice download — paid bills */}
          {bill.status === 'Paid' && (
            <button
              onClick={() => onDownloadInvoice?.(bill)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors"
            >
              <Download size={14} /> Invoice / Receipt
            </button>
          )}
        </div>

        {/* Dispute with AI — members only, unpaid bills */}
        {user?.role === 'member' && bill.status !== 'Paid' && (
          <button
            onClick={() => onOpenDispute?.(bill)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 border border-red-300 bg-transparent hover:bg-red-50 transition-colors"
          >
            <MessageSquareWarning size={13} /> Dispute with AI
          </button>
        )}
      </div>
    </div>
  );
};

export default BillCard;
