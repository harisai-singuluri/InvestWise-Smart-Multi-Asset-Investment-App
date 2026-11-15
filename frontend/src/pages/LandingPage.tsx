import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  TrendingUp,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Cpu,
  Coins,
  Globe2,
  Lock
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async () => {
    try {
      await login('alex@investwise.app', 'InvestWise123!');
      navigate('/dashboard');
    } catch {
      try {
        await api.auth.register({
          fullName: 'Alex Morgan',
          email: 'alex@investwise.app',
          password: 'InvestWise123!'
        });
        await login('alex@investwise.app', 'InvestWise123!');
        navigate('/dashboard');
      } catch {
        navigate('/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white">
      <nav className="border-b border-[#1E293B] px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight">Invest<span className="text-emerald-400">Wise</span></span>
            <span className="text-[10px] ml-2 font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">Fintech Prototype</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={handleQuickDemo}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
              >
                <span>Launch Demo ($100k)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </nav>

      <section className="px-6 lg:px-12 py-20 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-Grade Architecture for Multi-Asset Investing</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Smart Multi-Asset Investing, Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Absolute Integrity.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Explore US Stocks, ETFs, Cryptocurrencies, Mutual Funds, and Digital Gold. Built with Java 21, Spring Boot 3, immutable double-entry accounting journals, and high-concurrency order workflows.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleQuickDemo}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <span>Start Simulated Investing with $100,000 Cash</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-4 bg-[#121824] hover:bg-[#1A2333] border border-[#243046] text-white font-bold text-sm rounded-2xl transition-all"
          >
            Create New Account
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-[#121824] border border-[#243046] rounded-2xl p-4 text-left">
            <span className="text-2xl font-black text-emerald-400 font-mono">5</span>
            <p className="text-xs font-bold text-white mt-1">Multi-Asset Classes</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Stocks, ETFs, Crypto, Funds, Gold</p>
          </div>
          <div className="bg-[#121824] border border-[#243046] rounded-2xl p-4 text-left">
            <span className="text-2xl font-black text-white font-mono">100%</span>
            <p className="text-xs font-bold text-white mt-1">Balanced Double-Entry</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Immutable financial ledger</p>
          </div>
          <div className="bg-[#121824] border border-[#243046] rounded-2xl p-4 text-left">
            <span className="text-2xl font-black text-emerald-400 font-mono">0ms</span>
            <p className="text-xs font-bold text-white mt-1">Idempotency Guard</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero duplicate transaction risk</p>
          </div>
          <div className="bg-[#121824] border border-[#243046] rounded-2xl p-4 text-left">
            <span className="text-2xl font-black text-white font-mono">$100k</span>
            <p className="text-xs font-bold text-white mt-1">Simulated Balance</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero-risk portfolio testing</p>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-16 bg-[#121824]/50 border-t border-[#1E293B]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Fintech Excellence</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every workflow from order ticket to ledger entry enforces mathematical and transactional consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121824] border border-[#243046] rounded-2xl p-6 hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Double-Entry Accounting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every trade creates linked debit and credit ledger legs that balance to zero. Historical records are strictly immutable and auditable.
              </p>
            </div>

            <div className="bg-[#121824] border border-[#243046] rounded-2xl p-6 hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Order State Machine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic lifecycle management for Market and Limit orders with optimistic concurrency locking and idempotency key enforcement.
              </p>
            </div>

            <div className="bg-[#121824] border border-[#243046] rounded-2xl p-6 hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Dollar-Cost Averaging & Goals</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulated recurring investments across weekly/monthly schedules and goal tracking with automated progress projections.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1E293B] px-6 lg:px-12 py-8 text-center text-xs text-slate-500">
        <p>InvestWise is an educational prototype built for SDE portfolio demonstration. All balances, market data, and orders are simulated.</p>
      </footer>
    </div>
  );
};
