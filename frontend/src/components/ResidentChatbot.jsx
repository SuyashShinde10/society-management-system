import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import theme from '../theme';
import { Send, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

const ResidentChatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your AI Society Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chatbot/query', { message: userMessage });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the network right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px', background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
        <div style={{ background: '#EEF2FF', padding: '10px', borderRadius: '12px' }}>
          <Bot size={24} color="#4F46E5" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: '600', color: theme.textMain }}>
            AI Society Assistant
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: theme.textSec }}>Online | Powered by Gemini</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              maxWidth: '75%', 
              padding: '14px 18px', 
              borderRadius: '20px', 
              borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '20px',
              borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px',
              background: msg.sender === 'user' ? theme.accent : '#F1F5F9',
              color: msg.sender === 'user' ? 'white' : theme.textMain,
              fontSize: '15px',
              lineHeight: '1.5',
              fontFamily: "'Outfit', sans-serif"
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#F1F5F9', padding: '14px 18px', borderRadius: '20px', borderBottomLeftRadius: '4px', display: 'flex', gap: '5px' }}>
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: '8px', height: '8px', background: '#94A3B8', borderRadius: '50%' }} />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: '8px', height: '8px', background: '#94A3B8', borderRadius: '50%' }} />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: '8px', height: '8px', background: '#94A3B8', borderRadius: '50%' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '20px', borderTop: `1px solid ${theme.border}` }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{ flex: 1, padding: '16px', borderRadius: '16px', border: `1px solid ${theme.border}`, background: '#F8FAFC', outline: 'none', fontFamily: "'Outfit', sans-serif", fontSize: '15px' }}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            style={{ padding: '0 20px', background: theme.textMain, color: 'white', border: 'none', borderRadius: '16px', cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: (isLoading || !input.trim()) ? 0.6 : 1 }}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResidentChatbot;
