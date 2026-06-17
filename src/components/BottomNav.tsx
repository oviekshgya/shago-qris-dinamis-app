/* eslint-disable react-refresh/only-export-components */
export type AppTab = 'generate' | 'merchants' | 'transactions' | 'api' | 'about';

interface NavItem {
  id: AppTab;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { id: 'generate', label: 'Generate', icon: 'QR' },
  { id: 'merchants', label: 'Merchants', icon: 'M' },
  { id: 'transactions', label: 'History', icon: 'TX' },
  { id: 'api', label: 'API Docs', icon: 'API' },
  { id: 'about', label: 'About Us', icon: 'US' },
];

export function BottomNav({ activeTab, onChange }: { activeTab: AppTab; onChange: (tab: AppTab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-shago-black/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-2xl backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold transition ${
              activeTab === item.id
                ? 'bg-shago-gradient text-white shadow-red-glow'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => onChange(item.id)}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
