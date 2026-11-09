import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RecurringPlan, RecurringFrequency, RecurringStatus, Asset } from '../types';
import { AssetClassBadge } from '../components/common/Badge';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  Clock,
  Sparkles
} from 'lucide-react';

export const RecurringPage: React.FC = () => {
  const [plans, setPlans] = useState<RecurringPlan[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [amount, setAmount] = useState('100');
  const [frequency, setFrequency] = useState<RecurringFrequency>('WEEKLY');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, assetsData] = await Promise.all([
        api.recurring.list(),
        api.assets.list()
      ]);
      setPlans(plansData);
      setAssets(assetsData);
      if (assetsData.length > 0 && !selectedSymbol) {
        setSelectedSymbol(assetsData[0].symbol);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setModalError('Amount must be greater than zero');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.recurring.create({
        symbol: selectedSymbol,
        amount: numAmount,
        frequency,
      });

      setShowModal(false);
      loadData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create recurring plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (planId: number, status: RecurringStatus) => {
    try {
      await api.recurring.updateStatus(planId, status);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Recurring Investing (DCA)</h1>
          <p className="text-xs text-slate-400 mt-1">Dollar-Cost Averaging schedules for automated disciplined simulated accumulation</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Recurring Plan</span>
        </button>
      </div>

      <div className="bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#243046]">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Scheduled Auto-Invest Plans</h2>
            <p className="text-[11px] text-slate-400">Automated execution against simulated demo quotes</p>
          </div>
          <span className="text-xs font-bold text-slate-400">{plans.length} Active Schedules</span>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1A2333] border border-[#243046] flex items-center justify-center mx-auto text-slate-400">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No recurring plans active</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Automate your investments with Dollar-Cost Averaging. Schedule daily, weekly, or monthly buys for any asset class.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              Create First DCA Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(plan => {
              const isActive = plan.status === 'ACTIVE';
              const isPaused = plan.status === 'PAUSED';

              return (
                <div
                  key={plan.id}
                  className="bg-[#0B0E14] border border-[#1E293B] hover:border-[#243046] rounded-2xl p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-extrabold text-base text-white font-mono">{plan.symbol}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isPaused
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {plan.status}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-300 truncate mb-3">{plan.assetName}</p>

                    <div className="bg-[#121824] border border-[#243046] rounded-xl p-3 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Amount:</span>
                        <span className="text-white font-bold">${Number(plan.amount).toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Cadence:</span>
                        <span className="text-emerald-400 font-bold">{plan.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Next Execution:</span>
                        <span className="text-slate-300">{plan.nextExecutionDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
                    {isActive ? (
                      <button
                        onClick={() => handleUpdateStatus(plan.id, 'PAUSED')}
                        className="px-3 py-1.5 rounded-lg bg-[#1A2333] hover:bg-amber-500/20 text-amber-400 border border-[#243046] text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </button>
                    ) : isPaused ? (
                      <button
                        onClick={() => handleUpdateStatus(plan.id, 'ACTIVE')}
                        className="px-3 py-1.5 rounded-lg bg-[#1A2333] hover:bg-emerald-500/20 text-emerald-400 border border-[#243046] text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </button>
                    ) : null}

                    {plan.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleUpdateStatus(plan.id, 'CANCELLED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#121824] border border-[#243046] rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-[#1A2333]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Setup Recurring DCA Plan</h3>
                <p className="text-xs text-slate-400">Automate simulated investments over time</p>
              </div>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Asset</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                >
                  {assets.map(a => (
                    <option key={a.symbol} value={a.symbol}>
                      {a.symbol} — {a.name} ({a.assetClass})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Investment Amount ($ USD per run)</label>
                <input
                  type="number"
                  step="5"
                  min="5"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Schedule Cadence</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'] as RecurringFrequency[]).map(freq => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                        frequency === freq
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-[#243046] text-slate-400 hover:text-white'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {modalError && (
                <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Plan...' : 'Activate DCA Schedule'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
