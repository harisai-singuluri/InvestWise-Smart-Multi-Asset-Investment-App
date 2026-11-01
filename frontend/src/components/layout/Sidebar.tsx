import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  PieChart,
  Scale,
  Target,
  Repeat,
  Star,
  FileText,
  Sparkles,
  Settings,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/explore', label: 'Explore Markets', icon: Compass },
  { path: '/portfolio', label: 'Portfolio', icon: PieChart },
  { path: '/rebalance', label: 'Rebalance Engine', icon: Scale },
  { path: '/goals', label: 'Financial Goals', icon: Target },
  { path: '/recurring', label: 'Recurring (DCA)', icon: Repeat },
  { path: '/watchlist', label: 'Watchlist & Alerts', icon: Star },
  { path: '/activity', label: 'Ledger & Activity', icon: FileText },
  { path: '/insights', label: 'AI Risk Insights', icon: Sparkles },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0B0E14] border-r border-[#1E293B] flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
          Fintech Workspace
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-[#121824]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3.5 bg-[#121824] border border-[#243046] rounded-2xl">
        <div className="flex items-center space-x-2 text-emerald-400 mb-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold">Ledger Integrity</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Double-entry immutable journals enforce balanced credits & debits across multi-asset simulated executions.
        </p>
      </div>
    </aside>
  );
};
