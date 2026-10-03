import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, ShieldAlert } from 'lucide-react';
import theme from '../../theme';

/**
 * MobileDrawer: Modern slide-over navigation drawer for mobile screens.
 * Organizes all secondary modules into clear, categorized sections.
 */
const MobileDrawer = ({
  isOpen,
  onClose,
  user,
  navItems,
  activeTab,
  onSelectTab,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] md:hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Drawer Panel (slides in from right) */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-white flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FDFCF9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] border border-[#FFDEC2] flex items-center justify-center text-[#D9734E] font-bold text-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {user?.name || 'User'}
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {user?.flatDetails
                    ? `Wing ${user.flatDetails.wing} • Flat ${user.flatDetails.flatNumber}`
                    : user?.role === 'admin'
                    ? 'Society Administrator'
                    : 'Resident Member'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Password Warning if required */}
          {user?.mustChangePassword && (
            <div className="m-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>Please change your temporary password in Profile.</span>
            </div>
          )}

          {/* Menu Items List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              All Modules & Services
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDisabled = user?.mustChangePassword && item.id !== 'profile';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!isDisabled) {
                      onSelectTab(item.id);
                      onClose();
                    }
                  }}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'bg-[#D9734E] text-white shadow-md shadow-[#D9734E]/20 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                  } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Icon
                    size={19}
                    className={isActive ? 'text-white' : 'text-slate-500'}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Footer with Sign Out */}
          <div className="p-4 border-t border-slate-100 bg-[#FAF9F6]">
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MobileDrawer;
