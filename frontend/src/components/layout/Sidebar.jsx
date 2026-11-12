import React from 'react';
import { LayoutDashboard, Users, UserPlus, Activity, Clock } from 'lucide-react';

export function Sidebar({ currentTab, onSelectTab, onOpenAddMember, expiringCount = 0 }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'members',
      label: 'Gym Members',
      icon: Users,
      badge: null
    },
    {
      id: 'expiring',
      label: 'Expiring Soon',
      icon: Clock,
      badge: expiringCount > 0 ? expiringCount : null
    }
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 bg-obsidian-900 border-r border-borderDark-hairline p-4 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Quick Action Button */}
        <button
          onClick={onOpenAddMember}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigoVolt to-indigoVolt-hover hover:from-indigoVolt-hover hover:to-indigoVolt text-white font-medium text-sm shadow-glow-indigo transition-all duration-200 group active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>Register Member</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            Operations
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigoVolt/15 text-indigo-300 border border-indigoVolt/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigoVolt' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-amberAlert/20 text-amber-300 border border-amberAlert/30 font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Telemetry */}
      <div className="mt-8 pt-4 border-t border-borderDark-hairline/80 px-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Engine Online</span>
        </div>
        <p className="text-[10px] font-mono text-slate-500 mt-1">
          1-Month Auto-Expiry Engine: Active
        </p>
      </div>
    </aside>
  );
}
