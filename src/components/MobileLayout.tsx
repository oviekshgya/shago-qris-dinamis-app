import type { AppTab } from './BottomNav';
import { BottomNav, navItems } from './BottomNav';
import type { ReactNode } from 'react';

interface MobileLayoutProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: ReactNode;
}

export function MobileLayout({ activeTab, onTabChange, children }: MobileLayoutProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-shago-black/80 p-4 lg:block">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold transition ${
                activeTab === item.id
                  ? 'bg-shago-gradient text-white shadow-red-glow'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="w-7 text-center text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </aside>
      <div className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</div>
      <BottomNav activeTab={activeTab} onChange={onTabChange} />
    </>
  );
}
