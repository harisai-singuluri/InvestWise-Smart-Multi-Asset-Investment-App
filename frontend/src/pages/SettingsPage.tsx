import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  RefreshCw,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, account, resetDemoAccount, refreshAccount } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetBalance = async () => {
    if (!confirm('This will reset your demo cash balance back to $100,000.00 USD. Continue?')) return;
    try {
      setResetting(true);
      await resetDemoAccount();
      await refreshAccount();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Account & Platform Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage user credentials, simulated trading balance, and system specifications</p>
      </div>

      <div className="bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#243046]">
            User Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-4">
              <span className="text-slate-500 font-semibold block mb-1">Full Name</span>
              <span className="text-sm font-bold text-white">{user?.fullName}</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-4">
              <span className="text-slate-500 font-semibold block mb-1">Email Address</span>
              <span className="text-sm font-bold text-white font-mono">{user?.email}</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-4">
              <span className="text-slate-500 font-semibold block mb-1">Role & Permissions</span>
              <span className="text-xs font-bold text-emerald-400">{user?.role}</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-4">
              <span className="text-slate-500 font-semibold block mb-1">Account Created</span>
              <span className="text-xs text-slate-300 font-mono">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#243046]">
            Demo Balance Management
          </h2>
          <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white">Reset Demo Trading Balance</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-md">
                Sets your demo cash balance back to the initial $100,000.00 USD allocation and unreserves any open cash legs.
              </p>
            </div>
            <button
              onClick={handleResetBalance}
              disabled={resetting}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset to $100,000'}</span>
            </button>
          </div>

          {resetSuccess && (
            <div className="mt-3 flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Demo balance successfully reset to $100,000.00 USD!</span>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#243046]">
            System Architecture & Standards
          </h2>
          <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-5 text-xs text-slate-300 space-y-2 leading-relaxed">
            <p><strong className="text-white">Platform Core:</strong> High-Throughput Multi-Asset Investment Platform (Equities, ETFs, Digital Assets, Commodities)</p>
            <p><strong className="text-white">Backend Architecture:</strong> Java 21, Spring Boot 3.2, Spring Security with stateless JWT, Spring Data JPA, Hibernate, PostgreSQL, H2 fallback, Redis, Apache Kafka, Flyway migrations.</p>
            <p><strong className="text-white">Financial Correctness:</strong> Arbitrary-precision calculations with <code className="text-emerald-400 font-mono">BigDecimal</code>, optimistic concurrency locking (<code className="text-emerald-400 font-mono">@Version</code>), double-entry immutable ledger accounting, and idempotency key verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
