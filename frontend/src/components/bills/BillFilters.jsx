import React from 'react';
import theme from '../../theme';

export const BillFilters = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  isGroupedView,
  onToggleGroupedView,
  showBatchToggle = false,
}) => {
  const statuses = ['All', 'Pending', 'Paid', 'Overdue'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
      {/* Top Search and Toggle Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <input
          type="text"
          placeholder="Search by bill title or resident name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:flex-1 p-3 sm:py-3 sm:px-4 rounded-xl border border-[#E8E4D9] font-outfit text-sm bg-white outline-none focus:border-[#D9734E] shadow-sm transition-colors"
        />

        {showBatchToggle && (
          <div className="flex gap-1.5 bg-[#F3F4F6] p-1 rounded-xl self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => onToggleGroupedView(true)}
              style={{
                background: isGroupedView ? 'white' : 'transparent',
                color: isGroupedView ? theme.textMain : theme.textSec,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: isGroupedView ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              Batch View
            </button>
            <button
              type="button"
              onClick={() => onToggleGroupedView(false)}
              style={{
                background: !isGroupedView ? 'white' : 'transparent',
                color: !isGroupedView ? theme.textMain : theme.textSec,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: !isGroupedView ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              Flat View
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar touch-pan-x">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => onFilterChange(st)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: `1px solid ${filterStatus === st ? theme.accent : theme.border}`,
              background: filterStatus === st ? theme.accent : 'white',
              color: filterStatus === st ? 'white' : theme.textMain,
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {st}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BillFilters;
