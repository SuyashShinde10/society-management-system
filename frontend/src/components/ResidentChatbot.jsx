import React, { useState, useRef, useEffect, useContext } from 'react';
import api from '../api';
import theme from '../theme';
import AuthContext from '../context/AuthContext';
import { Send, Bot, Sparkles, User, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResidentChatbot = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your AI Society Concierge. How can I assist you today? You can ask me about maintenance bills, gate deliveries, guest passes, logging complaints, or amenities.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
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
  }, [messages, isLoading]);

  const sendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: query, timestamp: userTime }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chatbot/query', { message: query });
      const reply = res.data?.response || res.data?.message || 'I received your query. Please check the relevant dashboard module.';
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: reply, timestamp: botTime }]);
    } catch (error) {
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting to the society service right now. Please try again in a moment.',
        timestamp: botTime
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[600px] sm:h-[660px] bg-white rounded-3xl border border-[#E8E4D9] shadow-sm overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Concierge Header */}
      <div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-[#E8E4D9] flex items-center justify-between bg-[#FDFBF7]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#D9734E] shadow-xs">
              <Bot size={22} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="text-xl font-bold m-0 text-slate-900 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              AI Society Concierge
            </h3>
            <p className="text-xs text-emerald-700 m-0 font-medium flex items-center gap-1.5 mt-0.5">
              <span>Always Available</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-normal">Gemini 2.5 Flash</span>
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#D9734E] font-semibold bg-[#FFF7ED] px-3 py-1 rounded-full border border-[#FED7AA]">
          <Sparkles size={13} />
          Smart Assistant
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2.5 sm:px-5 bg-[#FAF9F5] border-b border-[#E8E4D9] flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles size={12} className="text-[#D9734E]" /> Quick:
        </span>
        <div className="flex gap-2">
          {suggestions.map((sugg, i) => (
            <button
              key={i}
              onClick={() => sendMessage(sugg)}
              disabled={isLoading}
              className="text-xs font-medium text-slate-700 bg-white hover:bg-[#FFF7ED] hover:text-[#D9734E] hover:border-[#D9734E] border border-[#E8E4D9] rounded-full px-3 py-1 transition-all shrink-0 active:scale-95 disabled:opacity-50"
            >
              {sugg}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#FDFCFA]">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 items-end ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {/* Bot Avatar */}
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-[#D9734E] flex items-center justify-center shrink-0 mb-1">
                    <Bot size={16} />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isBot
                        ? 'bg-white text-slate-800 border border-[#E8E4D9] rounded-2xl rounded-bl-sm'
                        : 'bg-[#D9734E] text-white rounded-2xl rounded-br-sm'
                    }`}
                  >
                    <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Timestamp & Sender Label */}
                  <span className={`text-[10px] text-slate-400 mt-1 px-1 tabular-nums ${isBot ? 'text-left' : 'text-right'}`}>
                    {isBot ? 'Concierge' : (user?.name || 'You')} • {msg.timestamp}
                  </span>
                </div>

                {/* User Avatar */}
                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-[#2C2C2C] text-white flex items-center justify-center text-xs font-bold shrink-0 mb-1">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Animated Typing Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-end justify-start"
          >
            <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-[#D9734E] flex items-center justify-center shrink-0 mb-1">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-[#E8E4D9] px-4 py-3 rounded-2xl rounded-bl-sm shadow-xs flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium mr-1.5">Thinking</span>
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                className="w-1.5 h-1.5 bg-[#D9734E] rounded-full inline-block"
              />
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                className="w-1.5 h-1.5 bg-[#D9734E] rounded-full inline-block"
              />
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                className="w-1.5 h-1.5 bg-[#D9734E] rounded-full inline-block"
              />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="p-3 sm:p-4 border-t border-[#E8E4D9] bg-white">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about bills, gate parcels, guest passes, or complaints..."
            disabled={isLoading}
            className="organic-input flex-1 px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#2C2C2C] hover:bg-black text-white p-2.5 sm:px-4 sm:py-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 active:scale-95 shrink-0"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResidentChatbot;

