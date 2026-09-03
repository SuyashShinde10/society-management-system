import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import theme from '../theme';
import { X, Send, Bot, User } from 'lucide-react';
import { toast } from 'sonner';

const AIDisputeModal = ({ bill, onClose, onResolved }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [disputeId, setDisputeId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initiateDispute();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initiateDispute = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/disputes/initiate', { maintenanceBillId: bill._id });
      setDisputeId(data.dispute._id);
      
      // Load history or initial message
      if (data.dispute.chatHistory && data.dispute.chatHistory.length > 0) {
        setMessages(data.dispute.chatHistory);
      } else {
        setMessages([{
          role: 'agent',
          content: `Hello! I'm the AI Assistant. I see you have a dispute regarding the bill "${bill.title}" (Amount: ₹${bill.amount}). How can I help you today? If you've already paid, please provide the UTR or reference number.`
        }]);
      }
    } catch (err) {
      toast.error('Failed to initiate dispute');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !disputeId) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await api.post('/disputes/message', {
        disputeId,
        message: userMessage
      });
      
      setMessages(prev => [...prev, { role: 'agent', content: data.aiMessage }]);
      
      if (data.dispute.status === 'Resolved') {
        toast.success('Dispute resolved automatically!');
        onResolved(); // Refresh the bill list
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        background: 'white', width: '100%', maxWidth: '500px', height: '80vh',
        borderRadius: '20px', display: 'flex', flexDirection: 'column',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          padding: '20px', borderBottom: `1px solid ${theme.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '18px', color: theme.textMain }}>
              AI Support
            </h3>
            <span style={{ fontSize: '12px', color: theme.textSec, fontFamily: "'Outfit', sans-serif" }}>
              Disputing: {bill.title}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: theme.textSec
          }}>
            <X size={20} />
          </button>
        </div>

        <div style={{
          flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', background: '#F9F8F3'
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                background: msg.role === 'user' ? theme.textMain : 'white',
                color: msg.role === 'user' ? 'white' : theme.textMain,
                padding: '12px 16px', borderRadius: '15px',
                border: msg.role === 'agent' ? `1px solid ${theme.border}` : 'none',
                maxWidth: '75%', fontFamily: "'Outfit', sans-serif", fontSize: '14px', lineHeight: '1.5'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'white', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
                <span className="organic-pulse" style={{ fontSize: '12px', color: theme.textSec }}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} style={{
          padding: '15px 20px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: '10px'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message or UTR number..."
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`,
              fontFamily: "'Outfit', sans-serif", outline: 'none'
            }}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} style={{
            background: theme.accent, color: 'white', border: 'none', borderRadius: '12px',
            padding: '0 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIDisputeModal;
