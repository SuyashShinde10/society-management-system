import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';

const ExpenseTracker = () => {
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Maintenance' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    fetchExpenses();
    
    // Vercel-compatible real-time fallback (Short Polling)
    const interval = setInterval(() => {
      fetchExpenses(false);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchExpenses = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (error) {
      console.error('// LEDGER_FETCH_ERROR');
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) {
      toast.error('Please fill in title and amount.');
      return;
    }
    if (Number(form.amount) <= 0) {
      toast.error('Amount must be greater than zero.');
      return;
    }
    try {
      await api.post('/expenses', form);
      setForm({ title: '', amount: '', category: 'Maintenance' });
      fetchExpenses();
      toast.success('Expense recorded.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record expense.');
    }
  };

  const handleDelete = async (id) => {
    toast('Delete this expense entry?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            setExpenses(prev => prev.filter(e => e._id !== id));
            await api.delete(`/expenses/${id}`);
            fetchExpenses();
            toast.success('Expense removed.');
          } catch (error) {
            fetchExpenses();
            toast.error('Failed to remove expense.');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const paginatedExpenses = filteredExpenses.slice(0, page * limit);
  const hasMore = paginatedExpenses.length < filteredExpenses.length;

  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div style={{ background: theme.surface, border: `3px solid ${theme.border}`, height: '100%', position: 'relative' }}>
      {/* HEADER */}
      <div style={{
        background: theme.textMain, color: 'white', padding: '20px',
        display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h3 style={{ flex: '1 1 100px', margin: 0, fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', letterSpacing: '2px', fontSize: '18px', wordBreak: 'break-all' }}>
          Financial_Ledger
        </h3>
        <div style={{ flex: '0 0 auto', fontFamily: "'Space Mono', monospace", textAlign: 'right' }}>
          <span style={{ fontSize: '10px', opacity: 0.7, display: 'block' }}>TOTAL_OUTFLOW</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#fb7185' }}>₹{totalExpense.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* ADMIN INPUT SECTION */}
        {user && user.role === 'admin' && (
          <form onSubmit={handleSubmit} style={{
            display: 'grid', gap: '12px', background: '#F9F9F9', padding: '20px',
            border: `1px solid ${theme.border}`, marginBottom: '30px', boxShadow: '6px 6px 0px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: '700' }}>// LOG_NEW_EXPENDITURE</span>
            <input
              placeholder="DESCRIPTION (e.g. LIFT_MAINTENANCE)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="ledger-input"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="number"
                placeholder="VAL_INR"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="ledger-input"
                min="0.01"
              />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="ledger-input">
                <option>Maintenance</option>
                <option>Repairs</option>
                <option>Salary</option>
                <option>Event</option>
                <option>Other</option>
              </select>
            </div>
            <button type="submit" style={{
              background: theme.textMain, color: 'white', padding: '12px', border: 'none',
              fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer', marginTop: '5px'
            }}>
              [+] RECORD_TRANSACTION
            </button>
          </form>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="SEARCH TRANSACTIONS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="brutal-input" 
            style={{ flex: '1 1 200px', padding: '10px', boxSizing: 'border-box', fontFamily: "'Space Mono', monospace" }}
          />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="brutal-input" style={{ flex: '1 1 150px', padding: '10px', boxSizing: 'border-box', fontFamily: "'Space Mono', monospace" }}>
            <option value="All">ALL_CATEGORIES</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Repairs">Repairs</option>
            <option value="Salary">Salary</option>
            <option value="Event">Event</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* LIST SECTION */}
        <div style={{ overflowY: 'auto', maxHeight: '60vh', border: `1px solid ${theme.border}`, fontFamily: "'Space Mono', monospace" }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <span className="spinner"></span>
            </div>
          ) : paginatedExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', color: theme.textSec, padding: '40px', fontSize: '12px' }}>
              // NO_TRANSACTION_HISTORY_FOUND
            </div>
          ) : (
            paginatedExpenses.map((exp) => (
              <div key={exp._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '15px 20px', borderBottom: `1px dashed ${theme.textMain}`
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', textTransform: 'uppercase' }}>{exp.title}</div>
                  <div style={{ fontSize: '10px', color: theme.textSec, marginTop: '4px' }}>
                    {/* ✅ BUG FIX (Q4): was exp.date — Expense model has no `date` field, only createdAt */}
                    CAT: {exp.category?.toUpperCase() || 'UNKNOWN'} // DATE: {new Date(exp.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontWeight: '700', color: theme.danger }}>-₹{Number(exp.amount).toLocaleString()}</span>
                  {user && user.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(exp._id)}
                      style={{ background: 'none', border: 'none', color: theme.textSec, cursor: 'pointer', fontSize: '14px', padding: '5px' }}
                    >
                      [X]
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <button onClick={() => setPage(page + 1)} style={{ width: '100%', marginTop: '20px', padding: '10px', background: 'transparent', border: `2px dashed ${theme.border}`, fontFamily: "'Space Mono', monospace", fontWeight: '700', cursor: 'pointer' }}>
            LOAD_MORE_RECORDS
          </button>
        )}

        <div style={{ marginTop: '15px', fontSize: '10px', fontFamily: "'Space Mono', monospace", textAlign: 'center', opacity: 0.5 }}>
          END_OF_REPORT // GENERATED_ON_{new Date().toLocaleDateString().replace(/\//g, '_')}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;