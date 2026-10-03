import React from 'react';
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
  const collectionPercent =
    group.totalAmount > 0
      ? Math.round((group.collectedAmount / group.totalAmount) * 100)
      : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-sm transition-all duration-200">
      {/* ── Group Header ── */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          {/* Left — title + meta */}
          <div className="flex-1 min-w-0">
            <h3 className="m-0 mb-1 font-outfit text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              {group.title}
            </h3>
            <p className="m-0 mb-1.5 text-xs text-gray-500 font-outfit">
              DUE DATE: <strong className="text-gray-700">{new Date(group.dueDate).toLocaleDateString()}</strong>
            </p>

            {/* Status badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                Total: {group.total}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                Paid: {group.paid}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                Verifying: {group.verifying}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                Pending: {group.pending}
              </span>
            </div>
          </div>

          {/* Right — amounts */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 pt-2 sm:pt-0 border-t border-gray-100 sm:border-0 shrink-0">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 font-outfit">
              ₹{group.collectedAmount.toLocaleString()}
              <span className="text-xs sm:text-sm text-gray-400 font-normal">
                &nbsp;/&nbsp;₹{group.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 font-outfit">
              {collectionPercent}% Collected
            </div>
          </div>
        </div>

        {/* Collection progress bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-[width] duration-500"
            style={{ width: `${collectionPercent}%` }}
          />
        </div>

        {/* Toggle expand */}
        <div className="flex justify-end mt-3.5">
          <button
            onClick={onToggleExpand}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 border border-gray-200 bg-transparent hover:bg-gray-50 active:scale-[0.98] transition-all font-outfit text-center"
          >
            {isExpanded
              ? '▲ Hide Individual Bills'
              : `▼ View ${group.bills.length} Individual Bills`}
          </button>
        </div>
      </div>

      {/* ── Expanded Member Bills ── */}
      {isExpanded && (
        <div className="bg-gray-50/80 p-3 sm:p-5 border-t border-gray-200 space-y-3">
          {group.bills.map((b) => (
            <BillCard
              key={b._id}
              bill={b}
              user={user}
              isNested
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
