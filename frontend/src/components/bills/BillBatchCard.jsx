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
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left — title + meta */}
          <div className="flex-1 min-w-0">
            <h3 className="m-0 mb-1.5 font-outfit text-xl font-bold text-gray-900 truncate">
              {group.title}
            </h3>
            <p className="m-0 mb-1.5 text-xs text-gray-500 font-outfit">
              DUE DATE: {new Date(group.dueDate).toLocaleDateString()}
            </p>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                Total: {group.total}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                Paid: {group.paid}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                Verifying: {group.verifying}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                Pending: {group.pending}
              </span>
            </div>
          </div>

          {/* Right — amounts */}
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-gray-900 font-outfit">
              ₹{group.collectedAmount.toLocaleString()}
              <span className="text-sm text-gray-400 font-normal">
                &nbsp;/&nbsp;₹{group.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 mt-1 font-outfit">
              {collectionPercent}% Collected
            </div>
          </div>
        </div>

        {/* Collection progress bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-[width] duration-500"
            style={{ width: `${collectionPercent}%` }}
          />
        </div>

        {/* Toggle expand */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onToggleExpand}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 border border-gray-200 bg-transparent hover:bg-gray-50 transition-colors font-outfit"
          >
            {isExpanded
              ? '▲ Hide Individual Bills'
              : `▼ View ${group.bills.length} Individual Bills`}
          </button>
        </div>
      </div>

      {/* ── Expanded Member Bills ── */}
      {isExpanded && (
        <div className="bg-gray-50 p-5 border-t border-gray-200 space-y-3">
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
