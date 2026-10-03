import React, { useState, useContext } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { handleDownloadInvoice } from '../utils/pdfGenerator';
import getErrorMessage from '../utils/errorHandler';

import { ReceiptText } from 'lucide-react';
import EmptyState from './ui/EmptyState';
import ComponentError from './ui/ComponentError';
import { TableSkeleton } from './ui/DashboardSkeleton';

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
    <div className="max-w-[1000px] mx-auto p-0 sm:p-2.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="m-0 mb-1 font-outfit text-2xl sm:text-3xl font-bold text-gray-900">
            Maintenance & Utilities
          </h2>
          <p className="m-0 text-xs sm:text-sm text-gray-500 font-outfit">
            {user?.role === 'admin'
              ? 'Issue, track collections, and verify payments for society flats'
              : 'View dues, settle via split payments, and download official receipts'}
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setShowGenerateModal(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-outfit font-semibold text-sm text-white bg-[#D9734E] hover:bg-[#c4633f] active:scale-[0.98] transition-all shadow-md shadow-[#D9734E]/20 text-center"
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
        <TableSkeleton rows={5} cols={5} />
      )}

      {/* Empty State */}
      {!isLoading && filteredBills.length === 0 && (
        <EmptyState
          type="bills"
          icon={ReceiptText}
          title="Zero Outstanding Invoices"
          description="All maintenance dues, statements, and community ledger entries are fully reconciled."
          actionLabel={user?.role === 'admin' ? "Generate Maintenance Bill" : undefined}
          onAction={user?.role === 'admin' ? () => setShowGenerateModal(true) : undefined}
        />
      )}

      {/* Bills Content */}
      {!isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {((user?.role === 'admin' && isGroupedView && paginatedGroups.length === 0) ||
            ((!isGroupedView || user?.role !== 'admin') && paginatedBills.length === 0)) ? (
            <EmptyState
              icon={ReceiptText}
              title="No maintenance bills found"
              description={
                user?.role === 'admin'
                  ? "No bills match your current filters. Click 'Generate Invoices' to issue maintenance dues to members."
                  : "You have no outstanding or pending maintenance invoices at this time."
              }
              actionLabel={user?.role === 'admin' ? 'Generate Invoices' : undefined}
              onAction={user?.role === 'admin' ? () => setShowGenerateModal(true) : undefined}
            />
          ) : user?.role === 'admin' && isGroupedView ? (
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
