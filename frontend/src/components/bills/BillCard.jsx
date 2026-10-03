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
  const padding = isNested ? 'p-3.5 sm:p-4' : 'p-4 sm:p-6';

  return (
    <div
      className={[
        'bg-white rounded-[18px] border border-gray-200 border-l-[6px]',
        leftBorder,
        padding,
        'shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        isNested ? 'mb-3' : '',
      ].join(' ')}
    >
      {/* ── Header: Responsive layout for mobile & desktop ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="m-0 font-outfit text-base sm:text-lg font-semibold text-gray-900 leading-snug">
              {bill.title}
            </h4>
            {!isNested && isNew && (
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full shrink-0">
                NEW
              </span>
            )}
          </div>

          {user?.role === 'admin' && (
            <p className="mt-1 text-xs text-gray-600 font-outfit font-medium">
              TO:&nbsp;{bill.userId?.name || 'Resident'}
              {bill.userId?.flatDetails?.wing
                ? ` (Wing ${bill.userId.flatDetails.wing} – Flat ${bill.userId.flatDetails.flatNumber || ''})`
                : ''}
            </p>
          )}

          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 font-outfit">
            <span>DUE:&nbsp;<strong className="text-gray-700">{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A'}</strong></span>
          </div>
        </div>

        {/* Amount & Status: Clean row on mobile, stacked on desktop */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t border-gray-100 sm:border-0 shrink-0">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 font-outfit tabular-nums">
            ₹{Number(bill.amount || 0).toLocaleString()}
          </div>
          <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClass}`}>
            {bill.status || 'Pending'}
          </span>
        </div>
      </div>

      {/* ── Action Toolbar: Full-width touch targets on mobile ── */}
      <div className="mt-3.5 pt-3 border-t border-dashed border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          {/* Admin — Verify / Reject */}
          {bill.status === 'Under Verification' && user?.role === 'admin' && (
            <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => onVerify?.(bill)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <CheckCircle size={14} /> Verify
              </button>
              <button
                onClick={() => onReject?.(bill)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          )}

          {/* Pay / Record Payment */}
          {(bill.status === 'Pending' || bill.status === 'Overdue') && (
            <button
              onClick={() => onPayClick?.(bill)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 active:scale-[0.98] transition-all text-center justify-center shadow-sm"
            >
              {user?.role === 'admin' ? 'Record Payment' : 'Pay Now'}
            </button>
          )}

          {/* Invoice download — paid bills */}
          {bill.status === 'Paid' && (
            <button
              onClick={() => onDownloadInvoice?.(bill)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              <Download size={14} /> Download Receipt
            </button>
          )}
        </div>

        {/* Dispute with AI — members only, unpaid bills */}
        {user?.role === 'member' && bill.status !== 'Paid' && (
          <button
            onClick={() => onOpenDispute?.(bill)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 border border-rose-200 bg-rose-50/50 hover:bg-rose-100 transition-colors"
          >
            <MessageSquareWarning size={13} /> Dispute with AI
          </button>
        )}
      </div>
    </div>
  );
};

export default BillCard;
