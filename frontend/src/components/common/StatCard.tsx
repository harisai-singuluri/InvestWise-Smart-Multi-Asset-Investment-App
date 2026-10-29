import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  change,
  isPositive,
  icon: Icon,
  badge
}) => {
  return (
    <div className="bg-[#121824] border border-[#243046] rounded-2xl p-5 hover:border-slate-700 transition-colors relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-[#1A2333] border border-[#243046] flex items-center justify-center text-slate-300">
          <Icon className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <h3 className="text-2xl font-black text-white tracking-tight font-mono">{value}</h3>
        {badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {badge}
          </span>
        )}
      </div>
      {(change || subValue) && (
        <div className="flex items-center space-x-2 mt-2">
          {change && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {isPositive ? '+' : ''}{change}
            </span>
          )}
          {subValue && (
            <span className="text-xs text-slate-400 font-medium">{subValue}</span>
          )}
        </div>
      )}
    </div>
  );
};
