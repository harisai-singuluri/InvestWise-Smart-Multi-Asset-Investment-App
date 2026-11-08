import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PortfolioSummary, Holding, Asset } from '../types';
import { AssetClassBadge } from '../components/common/Badge';
import { OrderModal } from '../components/common/OrderModal';
import { useAuth } from '../context/AuthContext';
import {
  PieChart as PieIcon,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Sparkles,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PortfolioPage: React.FC = () => {
  const { account, refreshAccount } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssetForTrade, setSelectedAssetForTrade] = useState<Asset | null>(null);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await api.portfolio.getSummary();
      setPortfolio(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const totalValue = portfolio?.totalPortfolioValue || 100000;
  const totalInvested = portfolio?.totalInvested || 0;
  const totalPnL = portfolio?.totalUnrealizedPnL || 0;
  const totalReturnPercent = portfolio?.totalReturnPercent || 0;
  const isGain = totalPnL >= 0;

  const handleOpenTrade = async (holding: Holding) => {
    try {
      const fullAsset = await api.assets.get(holding.symbol);
      setSelectedAssetForTrade(fullAsset);
    } catch (err) {
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Portfolio & Holdings</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-asset positions, weighted cost basis, and calculated unrealized P&L</p>
        </div>
        <Link
          to="/explore"
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Position</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121824] border border-[#243046] rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Total Equity</span>
          <span className="text-2xl font-black text-white font-mono">${Number(totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">Cash: ${Number(portfolio?.availableCash || 0).toLocaleString()}</p>
        </div>

        <div className="bg-[#121824] border border-[#243046] rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Total Cost Basis</span>
          <span className="text-2xl font-black text-white font-mono">${Number(totalInvested).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <p className="text-[11px] text-slate-500 mt-1">Net capital deployed</p>
        </div>

        <div className="bg-[#121824] border border-[#243046] rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Unrealized P&L</span>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-black font-mono ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isGain ? '+$' : '-$'}{Math.abs(Number(totalPnL)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isGain ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {isGain ? '+' : ''}{totalReturnPercent.toFixed(2)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on demo quotes</p>
        </div>

        <div className="bg-[#121824] border border-[#243046] rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Available Demo Cash</span>
          <span className="text-2xl font-black text-white font-mono">${Number(account?.availableCash || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <p className="text-[11px] text-slate-500 mt-1">Unreserved cash balance</p>
        </div>
      </div>

      <div className="bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#243046]">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Asset Holdings</h2>
            <p className="text-[11px] text-slate-400">Transaction-backed positions with real-time mark-to-market valuation</p>
          </div>
          <span className="text-xs font-bold text-slate-400">{portfolio?.holdings?.length || 0} Assets</span>
        </div>

        {portfolio?.holdings?.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1A2333] border border-[#243046] flex items-center justify-center mx-auto text-slate-400">
              <PieIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No active investment positions</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have 100% demo cash available. Head over to the Explore page to buy stocks, ETFs, crypto, or gold.
            </p>
            <Link
              to="/explore"
              className="inline-block px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              Browse Instruments
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Asset</th>
                  <th className="pb-3">Class</th>
                  <th className="pb-3 text-right">Quantity</th>
                  <th className="pb-3 text-right">Avg Cost</th>
                  <th className="pb-3 text-right">Current Price</th>
                  <th className="pb-3 text-right">Market Value</th>
                  <th className="pb-3 text-right">Unrealized P&L</th>
                  <th className="pb-3 text-right">Allocation</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {portfolio?.holdings?.map(h => {
                  const isHoldingGain = h.unrealizedPnL >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-[#1A2333]/40 transition-colors font-mono">
                      <td className="py-3.5 pl-2">
                        <Link to={`/assets/${h.symbol}`} className="flex items-center space-x-2.5 group">
                          <div className="w-8 h-8 rounded-lg bg-[#0B0E14] border border-[#243046] flex items-center justify-center font-bold text-emerald-400 text-xs">
                            {h.symbol.substring(0, 3)}
                          </div>
                          <div>
                            <span className="font-bold text-white group-hover:text-emerald-400 transition-colors font-sans">{h.symbol}</span>
                            <p className="text-[10px] text-slate-400 font-sans truncate max-w-[120px]">{h.assetName}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3.5 font-sans">
                        <AssetClassBadge assetClass={h.assetClass} />
                      </td>
                      <td className="py-3.5 text-right font-bold text-white">
                        {Number(h.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </td>
                      <td className="py-3.5 text-right text-slate-300">
                        ${Number(h.averageCost).toFixed(2)}
                      </td>
                      <td className="py-3.5 text-right text-white font-bold">
                        ${Number(h.currentPrice).toFixed(2)}
                      </td>
                      <td className="py-3.5 text-right text-white font-extrabold">
                        ${Number(h.currentValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-right font-bold">
                        <span className={isHoldingGain ? 'text-emerald-400' : 'text-rose-400'}>
                          {isHoldingGain ? '+$' : '-$'}{Math.abs(Number(h.unrealizedPnL)).toFixed(2)}
                        </span>
                        <span className={`text-[10px] ml-1.5 px-1 py-0.2 rounded ${
                          isHoldingGain ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {isHoldingGain ? '+' : ''}{h.unrealizedPnLPercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-slate-300">
                        {h.allocationPercent.toFixed(1)}%
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <button
                          onClick={() => handleOpenTrade(h)}
                          className="px-3 py-1.5 bg-[#1A2333] hover:bg-emerald-500 hover:text-black border border-[#243046] rounded-lg text-[11px] font-bold text-white transition-all font-sans"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAssetForTrade && (
        <OrderModal
          asset={selectedAssetForTrade}
          onClose={() => setSelectedAssetForTrade(null)}
          onSuccess={() => {
            loadPortfolio();
            refreshAccount();
          }}
        />
      )}
    </div>
  );
};
