import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InvestmentGoal, RiskProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Target,
  Plus,
  Calendar,
  Shield,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { account, refreshAccount } = useAuth();
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<number | null>(null);
  const [contributeAmount, setContributeAmount] = useState<string>('500');
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialContribution, setInitialContribution] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('MODERATE');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await api.goals.list();
      setGoals(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const target = Number(targetAmount);
    if (!target || target <= 0) {
      setModalError('Target amount must be greater than zero');
      return;
    }

    if (!targetDate) {
      setModalError('Target date is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.goals.create({
        title,
        targetAmount: target,
        targetDate,
        initialContribution: initialContribution ? Number(initialContribution) : 0,
        riskProfile,
      });

      await refreshAccount();
      setShowCreateModal(false);
      setTitle('');
      setTargetAmount('');
      setInitialContribution('');
      setTargetDate('');
      loadGoals();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContribute = async (goalId: number) => {
    const amount = Number(contributeAmount);
    if (!amount || amount <= 0) return;

    try {
      await api.goals.contribute(goalId, amount);
      await refreshAccount();
      setContributeGoalId(null);
      loadGoals();
    } catch (err: any) {
      alert(err.message || 'Contribution failed');
    }
  };

  const handleCancelGoal = async (goalId: number) => {
    if (!confirm('Are you sure you want to cancel this goal? Any saved funds will be refunded to your available balance.')) return;
    try {
      await api.goals.cancel(goalId);
      await refreshAccount();
      loadGoals();
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Financial Investment Goals</h1>
          <p className="text-xs text-slate-400 mt-1">Plan multi-year milestones, set risk preferences, and track progress</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Investment Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const isAchieved = goal.status === 'ACHIEVED';
          const isCancelled = goal.status === 'CANCELLED';

          return (
            <div
              key={goal.id}
              className={`bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl flex flex-col justify-between ${
                isAchieved ? 'border-emerald-500/40' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#0B0E14] border border-[#243046] text-slate-400">
                      {goal.riskProfile} Risk
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isAchieved
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isCancelled
                        ? 'bg-slate-500/20 text-slate-400'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  {!isCancelled && !isAchieved && (
                    <button
                      onClick={() => handleCancelGoal(goal.id)}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      Cancel & Refund
                    </button>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-1">{goal.title}</h3>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-4">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Target Date: {goal.targetDate}</span>
                </div>

                <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-4 mb-4 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400 font-medium">Progress</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">{goal.progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#1A2333] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white font-bold">${Number(goal.currentAmount).toLocaleString()}</span>
                    <span className="text-slate-500">Goal: ${Number(goal.targetAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!isCancelled && !isAchieved && (
                <div>
                  {contributeGoalId === goal.id ? (
                    <div className="flex items-center space-x-2 pt-2 border-t border-[#1E293B]">
                      <input
                        type="number"
                        min="1"
                        value={contributeAmount}
                        onChange={(e) => setContributeAmount(e.target.value)}
                        className="w-28 bg-[#0B0E14] border border-[#243046] rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                        placeholder="Amount"
                      />
                      <button
                        onClick={() => handleContribute(goal.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setContributeGoalId(null)}
                        className="p-1.5 text-slate-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setContributeGoalId(goal.id)}
                      className="w-full py-2.5 rounded-xl bg-[#1A2333] hover:bg-emerald-500 hover:text-black border border-[#243046] text-xs font-bold text-white transition-all flex items-center justify-center space-x-1.5"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Contribute Demo Cash</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#121824] border border-[#243046] rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-[#1A2333]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">New Investment Goal</h3>
                <p className="text-xs text-slate-400">Plan a milestone and track simulated progress</p>
              </div>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House Down Payment, Tech Portfolio Seed"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Amount ($ USD)</label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  required
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Initial Contribution from Cash ($)</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  placeholder="Optional, e.g. 5000"
                  value={initialContribution}
                  onChange={(e) => setInitialContribution(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Horizon Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Risk Profile</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'] as RiskProfile[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRiskProfile(r)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold ${
                        riskProfile === r
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-[#243046] text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
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
                {isSubmitting ? 'Creating Goal...' : 'Set Financial Goal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
