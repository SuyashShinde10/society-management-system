import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  QrCode, 
  ReceiptText, 
  Bell, 
  Menu, 
  Users 
} from 'lucide-react';

/**
 * MobileBottomNav: Persistent mobile navigation bar anchored to the bottom of the screen.
 * Optimized for one-thumb reachability, clean iconography, and instant module switching.
 */
const MobileBottomNav = ({ role, activeTab, onSelectTab, onOpenMenu, unreadCounts = {} }) => {
  // Navigation tabs for Resident vs Admin
  const residentTabs = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'passes', label: 'Gate Pass', icon: QrCode },
    { id: 'bills', label: 'Bills', icon: ReceiptText, badge: unreadCounts.bills },
    { id: 'notices', label: 'Notices', icon: Bell, badge: unreadCounts.notices },
  ];

  const adminTabs = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'registry', label: 'Registry', icon: Users },
    { id: 'bills', label: 'Billing', icon: ReceiptText, badge: unreadCounts.bills },
    { id: 'notices', label: 'Notices', icon: Bell, badge: unreadCounts.notices },
  ];

  const tabs = role === 'admin' ? adminTabs : residentTabs;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[990] md:hidden bg-white/95 backdrop-blur-md border-t border-[#E8E4D9] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,8px)]"
      style={{
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 relative touch-manipulation group"
              style={{ minHeight: '48px' }}
            >
              <div 
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-[#FFF0EB] text-[#D9734E]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />

                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D9734E] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>

              <span 
                className={`text-[11px] font-medium mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'text-[#D9734E] font-semibold' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-1 w-1 h-1 bg-[#D9734E] rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}

        {/* More / Menu Button triggers the Drawer */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex-1 flex flex-col items-center justify-center py-1 relative touch-manipulation group"
          style={{ minHeight: '48px' }}
        >
          <div className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-colors">
            <Menu size={20} strokeWidth={1.8} />
          </div>
          <span className="text-[11px] font-medium mt-0.5 text-slate-500 tracking-tight">
            Menu
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
