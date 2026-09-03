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
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by bill title or resident name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            flex: '1',
            minWidth: '240px',
            padding: '12px 18px',
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
            background: 'white',
            outline: 'none',
          }}
        />

        {showBatchToggle && (
          <div style={{ display: 'flex', gap: '8px', background: '#F3F4F6', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => onToggleGroupedView(true)}
              style={{
                background: isGroupedView ? 'white' : 'transparent',
                color: isGroupedView ? theme.textMain : theme.textSec,
                border: 'none',
                padding: '6px 14px',
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
                padding: '6px 14px',
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
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
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
