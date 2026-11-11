import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Insight } from '../types';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
  Info,
  CheckCircle2
} from 'lucide-react';

export const AiInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await api.insights.list();
      setInsights(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">AI & Algorithmic Portfolio Insights</h1>
            <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase">
              Financial Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated concentration analysis, risk diversification scores, and educational portfolio diagnostics
          </p>
        </div>

        <button
          onClick={loadInsights}
          className="px-4 py-2 bg-[#121824] hover:bg-[#1A2333] border border-[#243046] text-white text-xs font-bold rounded-xl transition-all self-start sm:self-auto"
        >
          Refresh Analysis
        </button>
      </div>

      <div className="bg-gradient-to-r from-purple-500/10 via-emerald-500/10 to-transparent border border-purple-500/20 rounded-3xl p-6">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Ethical & Transparent Financial AI Architecture</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              InvestWise operates on a deterministic financial heuristic engine with clean LLM interface abstractions.
              We never fabricate returns, simulate false exchange liquidity, or present speculative advice as financial guarantees.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map(insight => {
          const isWarning = insight.insightType === 'PORTFOLIO_CONCENTRATION' || insight.insightType === 'VOLATILITY_WARNING';

          return (
            <div
              key={insight.id}
              className="bg-[#121824] border border-[#243046] hover:border-[#334155] rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isWarning
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {insight.insightType.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Confidence: {(Number(insight.confidenceScore) * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{insight.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{insight.summary}</p>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-500">
                <span>Engine: {insight.provider}</span>
                <span>Evaluated at {new Date(insight.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
