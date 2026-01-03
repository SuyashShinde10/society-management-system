import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const ExpenseTracker = () => {
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Maintenance' });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (error) {
      console.error("Failed to fetch expenses");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return alert("Please fill details");
    if (Number(form.amount) <= 0) return alert("Amount must be greater than 0"); // Fix for 0 values
    
    try {
      await api.post('/expenses', form);
      setForm({ title: '', amount: '', category: 'Maintenance' });
      fetchExpenses();
    } catch (error) {
      alert("Failed to add expense. Please re-login.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      alert("Failed to delete expense");
    }
  };

  // Calculate Total
  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2563eb', paddingBottom: '10px', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>💰 Expenses</h2>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>
          Total: ₹{totalExpense}
        </span>
      </div>

      {/* --- ADD EXPENSE FORM (ADMIN ONLY) --- */}
      {user && user.role === 'admin' && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <input placeholder="Expense Title (e.g. Lift Repair)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="number" 
              min="1" // Prevents 0 or negative
              placeholder="Amount (₹)" 
              value={form.amount} 
              onChange={(e) => setForm({ ...form, amount: e.target.value })} 
              style={inputStyle} 
            />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
              <option>Maintenance</option>
              <option>Repairs</option>
              <option>Salary</option>
              <option>Event</option>
              <option>Other</option>
            </select>
          </div>
          <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Add Expense
          </button>
        </form>
      )}

      {/* --- EXPENSE LIST --- */}
      <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
        {expenses.length === 0 ? (
          <li style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No expenses recorded yet. Total: ₹0</li>
        ) : expenses.map((exp) => (
          <li key={exp._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#334155' }}>{exp.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(exp.date).toLocaleDateString()} • {exp.category}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#ef4444' }}>-₹{exp.amount}</span>
              {user && user.role === 'admin' && (
                <button onClick={() => handleDelete(exp._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 };

export default ExpenseTracker;