import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, X, LayoutDashboard, Users, ReceiptText, Bell, MessageSquareWarning, QrCode, Package, Calendar, Sparkles, Landmark, Leaf, User } from 'lucide-react';
import theme from '../../theme';

/**
 * CommandPalette: Global ⌘K / Ctrl+K Quick Launcher & Search.
 * Empowers committee admins & residents to jump anywhere in 1 keystroke.
 */
const CommandPalette = ({ isOpen, onClose, onNavigate, role = 'member' }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const adminCommands = [
    { id: 'overview', title: 'Executive Overview', category: 'Core Operations', icon: LayoutDashboard },
    { id: 'registry', title: 'Member Registry & Database', category: 'Core Operations', icon: Users },
    { id: 'bills', title: 'Billing System & Invoices', category: 'Finance', icon: ReceiptText },
    { id: 'notices', title: 'Notices & Circulars', category: 'Communication', icon: Bell },
    { id: 'complaints', title: 'Complaints & Helpdesk', category: 'Core Operations', icon: MessageSquareWarning },
    { id: 'visitors', title: 'Visitor Gate Logs', category: 'Security', icon: QrCode },
    { id: 'parcels', title: 'Parcel Gate Locker', category: 'Security', icon: Package },
    { id: 'meetings', title: 'Global Society Meetings', category: 'Communication', icon: Calendar },
    { id: 'accounting', title: 'Tally & Accounting Center', category: 'Finance', icon: Landmark },
    { id: 'sustainability', title: 'Green Sustainability & ESG', category: 'Sustainability', icon: Leaf },
    { id: 'profile', title: 'My Administrator Profile', category: 'Account', icon: User },
  ];

  const residentCommands = [
    { id: 'overview', title: 'Resident Dashboard Overview', category: 'Home', icon: LayoutDashboard },
    { id: 'passes', title: 'Generate Guest Pass (QR)', category: 'Gate & Security', icon: QrCode },
    { id: 'bills', title: 'My Maintenance Bills & Dues', category: 'Finance', icon: ReceiptText },
    { id: 'notices', title: 'Society Notice Board', category: 'Communication', icon: Bell },
    { id: 'complaints', title: 'Submit or Track Complaint', category: 'Support', icon: MessageSquareWarning },
    { id: 'parcels', title: 'Incoming Gate Deliveries', category: 'Gate & Security', icon: Package },
    { id: 'amenities', title: 'Book Clubhouse / Amenities', category: 'Lifestyle', icon: Sparkles },
    { id: 'meetings', title: 'Society General Meetings', category: 'Communication', icon: Calendar },
    { id: 'profile', title: 'My Profile & Flat Details', category: 'Account', icon: User },
  ];

  const commands = role === 'admin' ? adminCommands : residentCommands;

  const filteredCommands = query.trim() === ''
    ? commands
    : commands.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside command palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onNavigate(filteredCommands[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onNavigate, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1200] flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E8E4D9] overflow-hidden flex flex-col z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E8E4D9] bg-[#FDFCF9]">
              <Search size={18} className="text-[#D9734E] shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or jump to module (e.g. Bills, Pass, Notice)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[#2C2C2C] placeholder:text-slate-400 outline-none font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400 font-medium">
                  No matching modules found for "{query}"
                </div>
              ) : (
                filteredCommands.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndex === index;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition-all ${
                        isSelected
                          ? 'bg-[#FFF0EB] text-[#D9734E] font-semibold shadow-sm'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white text-[#D9734E]' : 'bg-slate-100 text-slate-500'}`}>
                          <Icon size={16} />
                        </div>
                        <div className="truncate">
                          <span className="block truncate">{item.title}</span>
                          <span className="text-[11px] text-slate-400 font-normal">{item.category}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-xs text-[#D9734E] shrink-0 font-medium">
                          <span>Open</span>
                          <ArrowRight size={13} />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Hints */}
            <div className="px-4 py-2 border-t border-slate-100 bg-[#FAF9F6] flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Dismiss</span>
              </div>
              <span className="text-[#D9734E]">Awaastech Command ⌘K</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
