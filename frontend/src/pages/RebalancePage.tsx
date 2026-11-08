import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PortfolioSummary, RebalanceAnalysisResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { Scale, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp, Sliders, PlayCircle, Download } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const RebalancePage: React.FC = () => {
  const { refreshAccount } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [analysis, setAnalysis] = useState<RebalanceAnalysisResponse | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [targets, setTargets] = useState<Record<string, number>>({
    STOCKS: 40,
    CRYPTO: 20,
    ETFS: 20,
    GOLD: 10,
    CASH: 10,
  });

  const totalTargetSum = Object.values(targets).reduce((a, b) => a + b, 0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const summary = await api.portfolio.getSummary();
      setPortfolio(summary);

      const initialTargets: Record<string, number> = {
        STOCKS: 35,
        CRYPTO: 20,
        ETFS: 20,
        GOLD: 15,
        CASH: 10,
      };

      if (summary.allocation && summary.allocation.length > 0) {
        summary.allocation.forEach((item) => {
          const cat = item.category.toUpperCase();
          if (cat in initialTargets) {
            initialTargets[cat] = Math.round(item.percentage);
          }
        });
      }
      setTargets(initialTargets);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load portfolio' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSliderChange = (category: string, value: number) => {
    setTargets((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const applyPreset = (preset: Record<string, number>) => {
    setTargets(preset);
  };

  const handleAnalyze = async () => {
    setMessage(null);
    if (Math.abs(totalTargetSum - 100) > 1) {
      setMessage({ type: 'error', text: `Target percentages must total 100%. Current sum: ${totalTargetSum}%` });
      return;
    }

    try {
      setIsAnalyzing(true);
      const result = await api.portfolio.analyzeRebalance(targets);
      setAnalysis(result);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Rebalance analysis failed' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecute = async () => {
    setMessage(null);
    try {
      setIsExecuting(true);
      const res = await api.portfolio.executeRebalance(targets);
      setAnalysis(res);
      await refreshAccount();
      await fetchData();
      setMessage({
        type: 'success',
        text: 'Automated rebalancing orders executed successfully across asset classes!',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to execute rebalancing' });
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Portfolio Rebalancing Engine</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Maintain your target asset allocation, minimize portfolio drift, and automate multi-asset adjustments.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => api.portfolio.downloadStatementCsv()}
            className="flex items-center space-x-2 bg-[#1A2333] hover:bg-[#243046] text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold border border-[#243046] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Statement CSV</span>
          </button>
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 bg-[#1A2333] hover:bg-[#243046] text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#243046] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-3 text-sm border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#121824] border border-[#243046] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Target Allocations</span>
            </h2>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                totalTargetSum === 100
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {totalTargetSum}% / 100%
            </span>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-2 font-medium">Quick Preset Models:</label>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset({ STOCKS: 50, ETFS: 20, CRYPTO: 15, GOLD: 10, CASH: 5 })}
                className="text-left text-xs bg-[#0B0E14] hover:bg-[#1A2333] border border-[#1E293B] p-2.5 rounded-xl transition-all text-slate-300"
              >
                <div className="font-semibold text-white">Aggressive Growth</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">50% Stocks • 20% ETFs • 15% Crypto • 10% Gold • 5% Cash</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset({ STOCKS: 30, ETFS: 25, GOLD: 20, MUTUAL_FUNDS: 15, CASH: 10 })}
                className="text-left text-xs bg-[#0B0E14] hover:bg-[#1A2333] border border-[#1E293B] p-2.5 rounded-xl transition-all text-slate-300"
              >
                <div className="font-semibold text-white">Conservative Multi-Asset</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">30% Stocks • 25% ETFs • 20% Gold • 15% Funds • 10% Cash</div>
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-[#1E293B]">
            {Object.entries(targets).map(([cat, val]) => (
              <div key={cat} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">{cat}</span>
                  <span className="font-mono font-bold text-emerald-400">{val}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={val}
                  onChange={(e) => handleSliderChange(cat, parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 bg-[#0B0E14] rounded-lg h-2 cursor-pointer"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || totalTargetSum !== 100}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            <span>Calculate Drift & Analysis</span>
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121824] border border-[#243046] rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Portfolio Capital</span>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  ${portfolio?.totalPortfolioValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} USD
                </div>
              </div>
              <div>
                {analysis ? (
                  <Badge variant={analysis.balanced ? 'success' : 'warning'}>
                    {analysis.balanced ? 'Optimal Balance' : 'Allocation Drift Detected'}
                  </Badge>
                ) : (
                  <Badge variant="neutral">Ready to Analyze</Badge>
                )}
              </div>
            </div>

            {analysis ? (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-4">Recommended Allocation Adjustments</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-400 border-b border-[#1E293B]">
                        <tr>
                          <th className="pb-3 font-semibold">Asset Class</th>
                          <th className="pb-3 font-semibold">Current</th>
                          <th className="pb-3 font-semibold">Target</th>
                          <th className="pb-3 font-semibold">Drift Delta</th>
                          <th className="pb-3 font-semibold">Action</th>
                          <th className="pb-3 font-semibold">Adjustment ($)</th>
                          <th className="pb-3 font-semibold">Order Suggestion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]">
                        {analysis.recommendations.map((rec) => (
                          <tr key={rec.category} className="hover:bg-[#1A2333]/40">
                            <td className="py-3 font-bold text-white">{rec.category}</td>
                            <td className="py-3 font-mono text-slate-300">{Number(rec.currentPercentage).toFixed(1)}%</td>
                            <td className="py-3 font-mono text-emerald-400">{Number(rec.targetPercentage).toFixed(1)}%</td>
                            <td className="py-3 font-mono">
                              <span
                                className={
                                  rec.deltaPercentage > 0
                                    ? 'text-emerald-400 font-bold'
                                    : rec.deltaPercentage < 0
                                    ? 'text-rose-400 font-bold'
                                    : 'text-slate-400'
                                }
                              >
                                {rec.deltaPercentage > 0 ? `+${Number(rec.deltaPercentage).toFixed(1)}%` : `${Number(rec.deltaPercentage).toFixed(1)}%`}
                              </span>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  rec.action === 'BUY'
                                    ? 'success'
                                    : rec.action === 'SELL'
                                    ? 'danger'
                                    : 'neutral'
                                }
                              >
                                {rec.action}
                              </Badge>
                            </td>
                            <td className="py-3 font-mono text-white font-semibold">
                              ${Number(rec.adjustmentAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 font-mono text-slate-400">
                              {rec.suggestedSymbol && rec.suggestedQuantity > 0 ? (
                                <span className="text-slate-200">
                                  {rec.action} {Number(rec.suggestedQuantity).toFixed(4)} {rec.suggestedSymbol}
                                </span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {!analysis.balanced && (
                  <div className="pt-4 border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-slate-400 max-w-md">
                      Executing will place automated simulated orders across your accounts to bring each asset class in line with your targets.
                    </p>
                    <button
                      onClick={handleExecute}
                      disabled={isExecuting}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
                    >
                      {isExecuting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <PlayCircle className="w-4 h-4" />
                      )}
                      <span>Execute Auto-Rebalance</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select your target allocations on the left and click "Calculate Drift & Analysis" to view recommended portfolio rebalancing orders.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
