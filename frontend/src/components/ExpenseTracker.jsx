import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { Wallet } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#F9F8F3', padding: '10px', borderRadius: '12px' }}>
            <Wallet size={24} color={theme.accent} />
          </div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
            Financial Ledger
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', background: 'white', padding: '10px 16px', borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', fontWeight: '600', color: theme.textSec }}>Total Outflow</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: '700', color: theme.danger }}>₹{totalExpense.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ padding: '0' }}>
        {/* ADMIN INPUT SECTION */}
        {user && user.role === 'admin' && (
          <form onSubmit={handleSubmit} style={{
            display: 'grid', gap: '16px', background: 'white', padding: '24px', borderRadius: '20px',
            border: `1px solid ${theme.border}`, marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: '600', color: theme.textSec }}>Log New Expenditure</span>
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
              background: theme.textMain, color: 'white', padding: '14px', border: 'none', borderRadius: '12px',
              fontFamily: "'Outfit', sans-serif", fontWeight: '600', fontSize: '15px', cursor: 'pointer', marginTop: '5px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
            }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
              Record Transaction
            </button>
          </form>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="SEARCH TRANSACTIONS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="organic-input" 
            style={{ flex: '1 1 200px', padding: '10px', boxSizing: 'border-box', fontFamily: "'Outfit', sans-serif" }}
          />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="organic-input" style={{ flex: '1 1 150px', padding: '10px', boxSizing: 'border-box', fontFamily: "'Outfit', sans-serif" }}>
            <option value="All">ALL_CATEGORIES</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Repairs">Repairs</option>
            <option value="Salary">Salary</option>
            <option value="Event">Event</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* LIST SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '60vh', paddingRight: '10px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
              <img src="/awaastech-logo.png" alt="Loading" className="organic-pulse" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            </div>
          ) : paginatedExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', color: theme.textSec, padding: '40px', background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}`, fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
              No transaction history found.
            </div>
          ) : (
            paginatedExpenses.map((exp) => (
              <div key={exp._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white',
                padding: '20px 24px', borderRadius: '20px', border: `1px solid ${theme.border}`,
                transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '16px', color: theme.textMain }}>{exp.title}</div>
                  <div style={{ fontSize: '12px', color: theme.textSec, marginTop: '4px' }}>
                    {/* ✅ BUG FIX (Q4): was exp.date — Expense model has no `date` field, only createdAt */}
                    {exp.category} • {new Date(exp.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontWeight: '700', fontSize: '16px', color: theme.danger }}>-₹{Number(exp.amount).toLocaleString()}</span>
                  {user && user.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(exp._id)}
                      style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '12px', padding: '6px 10px', borderRadius: '8px', fontWeight: '600' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <button onClick={() => setPage(page + 1)} style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'white', borderRadius: '12px', border: `1px dashed ${theme.border}`, color: theme.textMain, fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#F9F8F3'} onMouseOut={(e) => e.target.style.background = 'white'}>
            Load More Records
          </button>
        )}

        <div style={{ marginTop: '15px', fontSize: '10px', fontFamily: "'Outfit', sans-serif", textAlign: 'center', opacity: 0.5 }}>
          END_OF_REPORT // GENERATED_ON_{new Date().toLocaleDateString().replace(/\//g, '_')}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;