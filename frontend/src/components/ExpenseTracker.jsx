import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const ExpenseTracker = () => {
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Maintenance' });

  const theme = {
    bg: '#F2F2F2',
    surface: '#FFFFFF',
    textMain: '#1A1A1A',
    textSec: '#4A4A4A',
    border: '#1A1A1A',
    accent: '#2563EB', // Cobalt
    danger: '#ef4444'
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (error) {
      console.error("// LEDGER_FETCH_ERROR");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return alert("REQUIRED_FIELDS_EMPTY");
    if (Number(form.amount) <= 0) return alert("AMOUNT_INVALID");
    
    try {
      await api.post('/expenses', form);
      setForm({ title: '', amount: '', category: 'Maintenance' });
      fetchExpenses();
    } catch (error) {
      alert("ENTRY_FAILURE // RE-AUTH_REQUIRED");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("// DELETE_ENTRY: This action cannot be undone.")) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      alert("TERMINATION_FAILED");
    }
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div style={{ background: theme.surface, border: `3px solid ${theme.border}`, height: '100%', position: 'relative' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Space+Mono:wght@400;700&display=swap');
          
          .ledger-input {
            font-family: 'Space Mono', monospace;
            border: 1px solid #1A1A1A;
            background: #F2F2F2;
            padding: 10px;
            outline: none;
            font-size: 13px;
          }

          .ledger-input:focus {
            background: #fff;
            box-shadow: 4px 4px 0px #1A1A1A;
          }

          .expense-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px dashed #1A1A1A;
          }

          .expense-item:last-child {
            border-bottom: none;
          }
        `}
      </style>

      {/* --- HEADER --- */}
      <div style={{ 
        background: theme.textMain, 
        color: 'white', 
        padding: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase', letterSpacing: '2px', fontSize: '18px' }}>
          Financial_Ledger
        </h3>
        <div style={{ fontFamily: "'Space Mono', monospace", textAlign: 'right' }}>
          <span style={{ fontSize: '10px', opacity: 0.7, display: 'block' }}>TOTAL_OUTFLOW</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#fb7185' }}>₹{totalExpense.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* --- ADMIN INPUT SECTION --- */}
        {user && user.role === 'admin' && (
          <form onSubmit={handleSubmit} style={{ 
            display: 'grid', 
            gap: '12px', 
            background: '#F9F9F9', 
            padding: '20px', 
            border: `1px solid ${theme.border}`,
            marginBottom: '30px',
            boxShadow: '6px 6px 0px rgba(0,0,0,0.05)'
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
              />
              <select 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })} 
                className="ledger-input"
              >
                <option>Maintenance</option>
                <option>Repairs</option>
                <option>Salary</option>
                <option>Event</option>
                <option>Other</option>
              </select>
            </div>
            <button type="submit" style={{ 
              background: theme.textMain, 
              color: 'white', 
              padding: '12px', 
              border: 'none', 
              fontFamily: "'Space Mono', monospace", 
              fontWeight: '700', 
              cursor: 'pointer',
              marginTop: '5px'
            }}>
              [+] RECORD_TRANSACTION
            </button>
          </form>
        )}

        {/* --- LIST SECTION --- */}
        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto', 
          border: `1px solid ${theme.border}`,
          fontFamily: "'Space Mono', monospace"
        }}>
          {expenses.length === 0 ? (
            <div style={{ textAlign: 'center', color: theme.textSec, padding: '40px', fontSize: '12px' }}>
              // NO_TRANSACTION_HISTORY_FOUND
            </div>
          ) : (
            expenses.map((exp) => (
              <div key={exp._id} className="expense-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', textTransform: 'uppercase' }}>{exp.title}</div>
                  <div style={{ fontSize: '10px', color: theme.textSec, marginTop: '4px' }}>
                    CAT: {exp.category.toUpperCase()} // DATE: {new Date(exp.date).toLocaleDateString()}
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
        
        <div style={{ 
          marginTop: '15px', 
          fontSize: '10px', 
          fontFamily: "'Space Mono', monospace", 
          textAlign: 'center', 
          opacity: 0.5 
        }}>
          END_OF_REPORT // GENERATED_ON_{new Date().toLocaleDateString().replace(/\//g, '_')}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;