import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, ShieldAlert } from 'lucide-react';
import theme from '../../theme';

/**
 * MobileDrawer: Modern slide-over navigation drawer for mobile screens.
 * Organizes all secondary modules into 4 distinct, human-centric category hubs.
 */
const MobileDrawer = ({
  isOpen,
  onClose,
  user,
  navItems = [],
  hubs,
  activeTab,
  onSelectTab,
  onLogout,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] md:hidden">
          {/* Backdrop with smooth blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Drawer Panel (slides in from right with natural spring) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-[86%] max-w-[340px] bg-white flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#FDFCF9]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] border border-[#FFDEC2] flex items-center justify-center text-[#D9734E] font-bold text-lg shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {user?.name || 'User'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {user?.flatDetails
                      ? `Wing ${user.flatDetails.wing} • Flat ${user.flatDetails.flatNumber}`
                      : user?.role === 'admin'
                      ? 'Society Administrator'
                      : 'Resident Member'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Password Warning if required */}
            {user?.mustChangePassword && (
              <div className="m-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>Please change your temporary password in Profile.</span>
              </div>
            )}

            {/* Hub-based Categorized Menu Items */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {hubs && hubs.length > 0 ? (
                hubs.map((hub) => (
                  <div key={hub.category} className="space-y-1">
                    <div className="flex items-center justify-between px-2 pb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {hub.category}
                      </span>
                      {hub.tag && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {hub.tag}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {hub.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        const isDisabled = user?.mustChangePassword && item.id !== 'profile';

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (!isDisabled) {
                                onSelectTab(item.id);
                                onClose();
                              }
                            }}
                            disabled={isDisabled}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                              isActive
                                ? 'bg-[#D9734E] text-white shadow-md shadow-[#D9734E]/20 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                            } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <Icon
                              size={17}
                              className={isActive ? 'text-white' : 'text-slate-500 shrink-0'}
                            />
                            <span className="flex-1 truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isDisabled = user?.mustChangePassword && item.id !== 'profile';

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (!isDisabled) {
                            onSelectTab(item.id);
                            onClose();
                          }
                        }}
                        disabled={isDisabled}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                          isActive
                            ? 'bg-[#D9734E] text-white shadow-md shadow-[#D9734E]/20 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                        } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <Icon
                          size={17}
                          className={isActive ? 'text-white' : 'text-slate-500 shrink-0'}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with Sign Out */}
            <div className="p-3 border-t border-slate-100 bg-[#FAF9F6] pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
