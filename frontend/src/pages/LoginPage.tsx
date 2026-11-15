import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TrendingUp, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoUser = async () => {
    setError(null);
    setLoading(true);
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
      } catch (err: any) {
        setError(err.message || 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black text-white">Invest<span className="text-emerald-400">Wise</span></span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to your demo account</h2>
        <p className="mt-2 text-xs text-slate-400">
          Simulated trading, multi-asset portfolio, and double-entry ledger
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#121824] border border-[#243046] py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          <button
            type="button"
            onClick={handleQuickDemoUser}
            disabled={loading}
            className="w-full mb-6 py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-xs font-bold text-emerald-400 flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>1-Click Instant Demo Login ($100k Balance)</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1E293B]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#121824] text-slate-500 uppercase tracking-wider font-semibold">Or enter credentials</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="alex@investwise.app"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 uppercase tracking-wider disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-400 hover:underline">
              Create account with $100k demo cash
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
