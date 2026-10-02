import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import theme from '../theme';
import { Send, Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ResidentChatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your AI Society Assistant. How can I help you today? You can ask about maintenance bills, guest passes, logging complaints, gate deliveries, or booking amenities.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    'How do I pay maintenance bills?',
    'How do I collect gate parcels?',
    'How can I create a guest pass?',
    'How do I report a maintenance issue?',
    'How do I reserve the clubhouse?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chatbot/query', { message: query });
      const reply = res.data?.response || res.data?.message || 'I received your query. Please check the relevant dashboard module.';
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the society service right now. Please try again in a moment.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '640px', background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#EEF2FF', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={24} color="#4F46E5" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: '600', color: theme.textMain }}>
              AI Society Assistant
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#16A34A', borderRadius: '50%', display: 'inline-block' }}></span>
              Online | Powered by Gemini
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ padding: '12px 20px', background: '#FDFBF7', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: '12px', color: theme.textSec, display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '4px' }}>
          <Sparkles size={14} color={theme.accent} /> Suggestions:
        </span>
        {suggestions.map((sugg, i) => (
          <button
            key={i}
            onClick={() => sendMessage(sugg)}
            disabled={isLoading}
            style={{
              background: 'white',
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              color: theme.textMain,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = '#FFF8F0'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'white'; }}
          >
            {sugg}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              maxWidth: '80%', 
              padding: '14px 18px', 
              borderRadius: '20px', 
              borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '20px',
              borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px',
              background: msg.sender === 'user' ? theme.accent : '#F1F5F9',
              color: msg.sender === 'user' ? 'white' : theme.textMain,
              fontSize: '14.5px',
              lineHeight: '1.55',
              fontFamily: "'Outfit', sans-serif",
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#F1F5F9', padding: '14px 18px', borderRadius: '20px', borderBottomLeftRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: '8px', height: '8px', background: '#94A3B8', borderRadius: '50%' }} />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: '8px', height: '8px', background: '#94A3B8', borderRadius: '50%' }} />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: '8px', height: '8px', background: '#94A3B8', borderRadius: '50%' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${theme.border}`, background: '#FFFFFF' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about bills, gate parcels, guest passes, or complaints..."
            disabled={isLoading}
            style={{ flex: 1, padding: '14px 18px', borderRadius: '16px', border: `1px solid ${theme.border}`, background: '#F8FAFC', outline: 'none', fontFamily: "'Outfit', sans-serif", fontSize: '14.5px' }}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            style={{ padding: '0 22px', background: theme.textMain, color: 'white', border: 'none', borderRadius: '16px', cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: (isLoading || !input.trim()) ? 0.6 : 1 }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResidentChatbot;
