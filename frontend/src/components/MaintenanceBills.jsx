import React, { useState, useContext } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { handleDownloadInvoice } from '../utils/pdfGenerator';
import getErrorMessage from '../utils/errorHandler';

// Decomposed Subcomponents
import BillCard from './bills/BillCard';
import BillBatchCard from './bills/BillBatchCard';
import BillFilters from './bills/BillFilters';
import GenerateBillModal from './bills/GenerateBillModal';
import SplitPaymentModal from './bills/SplitPaymentModal';
import AIDisputeModal from './AIDisputeModal';

const MaintenanceBills = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // State
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGroupedView, setIsGroupedView] = useState(user?.role === 'admin');
  const [page, setPage] = useState(1);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [payingBill, setPayingBill] = useState(null);
  const [disputeBill, setDisputeBill] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const limit = 10;

  const isNew = (dateString) => {
    if (!dateString) return false;
    const diffTime = Math.abs(new Date() - new Date(dateString));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

  // React Query for Bills
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const { data } = await api.get('/bills');
      const billList = data.data?.bills || data.bills || data.data || data;
      return Array.isArray(billList) ? billList : [];
    },
    select: (data) =>
      data.map((b) => {
        let computedStatus = b.status;
        if (!b.isPaid && b.status === 'Pending' && b.dueDate && new Date(b.dueDate) < new Date()) {
          computedStatus = 'Overdue';
        }
        return { ...b, status: computedStatus };
      }),
    refetchInterval: 30000,
  });

  // React Query for Users (Admin only)
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/auth/users');
      return data.data || data;
    },
    enabled: user?.role === 'admin',
  });

  // Mutations
  const generateBillsMutation = useMutation({
    mutationFn: (payload) => api.post('/bills/generate', payload),
    onSuccess: (data, variables) => {
      toast.success(
        variables.targetType === 'All'
          ? 'Bills generated for all residents.'
          : 'Bill generated successfully.'
      );
      setShowGenerateModal(false);
      queryClient.invalidateQueries(['bills']);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to generate bills.'));
    },
  });

  const payBillMutation = useMutation({
    mutationFn: ({ id, method, action }) =>
      api.put(`/bills/${id}/pay`, { paymentMode: method, action }),
    onSuccess: (data, variables) => {
      toast.success(
        variables.action === 'reject'
          ? 'Payment rejected.'
          : `Payment recorded via ${variables.method}.`
      );
      setPayingBill(null);
      queryClient.invalidateQueries(['bills']);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Payment update failed.'));
      queryClient.invalidateQueries(['bills']);
    },
  });

  const handleMarkPaid = (id, method = 'UPI', action = 'approve') => {
    // Optimistic cache update
    queryClient.setQueryData(['bills'], (old) => {
      if (!old) return old;
      return old.map((b) => {
        if (b._id === id) {
          if (action === 'reject') return { ...b, status: 'Pending', paymentMode: null };
          if (user?.role === 'admin') return { ...b, status: 'Paid', paymentMode: method };
          return { ...b, status: 'Under Verification', paymentMode: method };
        }
        return b;
      });
    });

    payBillMutation.mutate({ id, method, action });
  };

  const handleVerify = (b) => {
    if (window.confirm(`Are you sure you want to VERIFY payment of ₹${b.amount}?`)) {
      handleMarkPaid(b._id, b.paymentMode, 'approve');
    }
  };

  const handleReject = (b) => {
    if (window.confirm('Are you sure you want to REJECT this payment?')) {
      handleMarkPaid(b._id, null, 'reject');
    }
  };

  const handleDownload = (b) => {
    handleDownloadInvoice(b, user);
  };

  // Filtering
  const filteredBills = bills.filter((b) => {
    if (filterStatus !== 'All' && b.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (b.title || '').toLowerCase().includes(q) ||
        (b.userId?.name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Admin Batch Grouping
  const groupedBills = {};
  if (user?.role === 'admin') {
    filteredBills.forEach((b) => {
      const dateKey = b.dueDate ? new Date(b.dueDate).toLocaleDateString() : 'NoDueDate';
      const key = `${(b.title || '').trim()}_${dateKey}`;
      if (!groupedBills[key]) {
        groupedBills[key] = {
          id: key,
          title: b.title,
          dueDate: b.dueDate,
          amount: b.amount,
          createdAt: b.createdAt,
          total: 0,
          paid: 0,
          pending: 0,
          verifying: 0,
          totalAmount: 0,
          collectedAmount: 0,
          bills: [],
        };
      }
      groupedBills[key].total += 1;
      groupedBills[key].totalAmount += Number(b.amount || 0);
      groupedBills[key].bills.push(b);
      if (b.status === 'Paid') {
        groupedBills[key].paid += 1;
        groupedBills[key].collectedAmount += Number(b.amount || 0);
      } else if (b.status === 'Under Verification') {
        groupedBills[key].verifying += 1;
      } else {
        groupedBills[key].pending += 1;
      }
    });
  }

  const adminGroupList = Object.values(groupedBills);
  const paginatedBills = filteredBills.slice(0, page * limit);
  const hasMoreBills = paginatedBills.length < filteredBills.length;
  const paginatedGroups = adminGroupList.slice(0, page * limit);
  const hasMoreGroups = paginatedGroups.length < adminGroupList.length;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: '700', color: theme.textMain }}>
            Maintenance & Utilities
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: theme.textSec, fontFamily: "'Outfit', sans-serif" }}>
            {user?.role === 'admin'
              ? 'Issue, track collections, and verify payments for society flats'
              : 'View dues, settle via split payments, and download official receipts'}
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setShowGenerateModal(true)}
            style={{
              background: theme.accent,
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(217, 115, 78, 0.25)',
            }}
          >
            + Generate Bills
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <BillFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        isGroupedView={isGroupedView}
        onToggleGroupedView={setIsGroupedView}
        showBatchToggle={user?.role === 'admin'}
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ padding: '40px', textAlign: 'center', color: theme.textSec, fontFamily: "'Outfit', sans-serif" }}>
          Loading maintenance bills...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredBills.length === 0 && (
        <div style={{ background: 'white', border: `1px solid ${theme.border}`, padding: '40px', borderRadius: '18px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '16px', color: theme.textSec, fontFamily: "'Outfit', sans-serif" }}>
            No maintenance records found for the selected filter.
          </p>
        </div>
      )}

      {/* Bills Content */}
      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {user?.role === 'admin' && isGroupedView ? (
            paginatedGroups.map((group) => (
              <BillBatchCard
                key={group.id}
                group={group}
                user={user}
                isExpanded={!!expandedGroups[group.id]}
                onToggleExpand={() =>
                  setExpandedGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
                }
                onVerify={handleVerify}
                onReject={handleReject}
                onDownloadInvoice={handleDownload}
              />
            ))
          ) : (
            paginatedBills.map((b) => (
              <BillCard
                key={b._id}
                bill={b}
                user={user}
                isNew={isNew(b.createdAt)}
                onPayClick={() => setPayingBill(b)}
                onVerify={handleVerify}
                onReject={handleReject}
                onDownloadInvoice={handleDownload}
                onOpenDispute={() => setDisputeBill(b)}
              />
            ))
          )}
        </div>
      )}

      {/* Load More Pagination */}
      {((user?.role === 'admin' && isGroupedView && hasMoreGroups) ||
        ((!isGroupedView || user?.role !== 'admin') && hasMoreBills)) && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={() => setPage((p) => p + 1)}
            style={{
              background: 'white',
              border: `1px solid ${theme.border}`,
              color: theme.textMain,
              padding: '10px 24px',
              borderRadius: '12px',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Load More Records
          </button>
        </div>
      )}

      {/* Generate Bill Modal */}
      <GenerateBillModal
        users={users}
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSubmit={(data) => generateBillsMutation.mutate(data)}
        isSubmitting={generateBillsMutation.isPending}
      />

      {/* Split Payment Modal */}
      <SplitPaymentModal
        bill={payingBill}
        user={user}
        isOpen={!!payingBill}
        onClose={() => setPayingBill(null)}
        onSubmit={({ id, method, action }) => handleMarkPaid(id, method, action)}
        isSubmitting={payBillMutation.isPending}
      />

      {/* AI Dispute Modal */}
      {disputeBill && (
        <AIDisputeModal
          bill={disputeBill}
          onClose={() => setDisputeBill(null)}
          onResolved={() => {
            setDisputeBill(null);
            queryClient.invalidateQueries(['bills']);
          }}
        />
      )}
    </div>
  );
};

export default MaintenanceBills;
