import React, { useState, useContext, useRef, useEffect } from 'react';
import api from '../../api';
import theme from '../../theme';
import AuthContext from '../../context/AuthContext';
import { Send, Bot, CheckCheck, Smartphone, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const WhatsAppSimulator = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `👋 Hello ${user?.name || 'Resident'}! I am your Awaas Smart Society WhatsApp Assistant.\n\nYou can chat with me naturally or use keywords:\n• *STATUS* - Check pending dues\n• *VISITOR <Name> <Phone>* - Create instant gate pass\n• *APPROVE* - Grant gate entry to waiting visitor\n• *COMPLAINT <Issue>* - Register maintenance ticket`,
      time: '10:00 AM'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call backend webhook endpoint
      const { data } = await api.post('/webhooks/whatsapp', {
        From: user.phone || '9999999999',
        Body: text
      });

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: data.reply || 'Message received.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 600);
    } catch (err) {
      setIsTyping(false);
      toast.error('Failed to communicate with WhatsApp webhook');
    }
  };

  const quickPrompts = [
    'STATUS',
    'VISITOR Rahul Verma 9820112233',
    'APPROVE',
    'COMPLAINT Tap leaking in kitchen'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '650px', margin: '0 auto', width: '100%' }}>
      <div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          WhatsApp Business Bot Simulator
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSec }}>
          Test the webhook integration providing zero-app onboarding for residents
        </p>
      </div>

      {/* Quick Prompts */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {quickPrompts.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleSend(cmd)}
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: `1px solid ${theme.border}`,
              background: 'white',
              color: theme.textMain,
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ⚡ {cmd}
          </button>
        ))}
      </div>

      {/* WhatsApp Mock Window */}
      <div style={{
        background: '#ECE5DD',
        borderRadius: '24px',
        overflow: 'hidden',
        border: `1px solid ${theme.border}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '520px'
      }}>
        {/* WhatsApp Header */}
        <div style={{
          background: '#075E54',
          color: 'white',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700'
          }}>
            <Bot size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>Awaas Society Bot</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>Online • Verified Business Account</div>
          </div>
        </div>

        {/* Message Log */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: m.sender === 'user' ? '#DCF8C6' : '#FFFFFF',
                padding: '10px 14px',
                borderRadius: '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: 'pre-line',
                position: 'relative',
                color: '#111827'
              }}
            >
              {m.text}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px',
                fontSize: '11px',
                color: '#6B7280',
                marginTop: '4px'
              }}>
                {m.time}
                {m.sender === 'user' && <CheckCheck size={14} color="#34B7F1" />}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{
              alignSelf: 'flex-start',
              background: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#6B7280',
              fontStyle: 'italic'
            }}>
              Bot is typing...
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{
            background: '#F0F2F5',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <input
            type="text"
            placeholder="Type a WhatsApp message or keyword..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '24px',
              border: 'none',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#075E54',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppSimulator;
