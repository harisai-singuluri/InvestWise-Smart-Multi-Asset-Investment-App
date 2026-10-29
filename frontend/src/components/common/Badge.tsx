import React from 'react';
import { AssetClass } from '../../types';

interface AssetClassBadgeProps {
  assetClass: AssetClass;
}

export const AssetClassBadge: React.FC<AssetClassBadgeProps> = ({ assetClass }) => {
  const styles: Record<AssetClass, { bg: string; text: string; label: string; border: string }> = {
    STOCKS: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'US Stocks' },
    ETFS: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', label: 'ETFs' },
    CRYPTO: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', label: 'Crypto' },
    MUTUAL_FUNDS: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Mutual Funds' },
    GOLD: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Digital Gold' },
  };

  const current = styles[assetClass] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: assetClass };

  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md border ${current.bg} ${current.text} ${current.border}`}>
      {current.label}
    </span>
  );
};

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };

  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
