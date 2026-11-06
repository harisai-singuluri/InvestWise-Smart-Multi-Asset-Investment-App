import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  PortfolioSummary,
  PerformancePoint,
  Asset,
  TransactionRecord,
  InvestmentGoal
} from '../types';
import { StatCard } from '../components/common/StatCard';
import { AssetClassBadge } from '../components/common/Badge';
import { OrderModal } from '../components/common/OrderModal';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Percent,
  PlusCircle,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
  Target
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const ALLOCATION_COLORS: Record<string, string> = {
  CASH: '#3B82F6',
  STOCKS: '#10B981',
  ETFS: '#8B5CF6',
  CRYPTO: '#F59E0B',
  MUTUAL_FUNDS: '#06B6D4',
  GOLD: '#EAB308',
};

export const DashboardPage: React.FC = () => {
  const { user, account, refreshAccount } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);
  const [timeframe, setTimeframe] = useState<string>('1M');
  const [topAssets, setTopAssets] = useState<Asset[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionRecord[]>([]);
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetForTrade, setSelectedAssetForTrade] = useState<Asset | null>(null);

  const loadDashboardData = async () => {
    try {
      const [pSummary, pPerf, assetsData, txData, goalsData] = await Promise.all([
        api.portfolio.getSummary(),
        api.portfolio.getPerformance(timeframe),
        api.assets.list(),
        api.ledger.getTransactions(),
        api.goals.list()
      ]);

      setPortfolio(pSummary);
      setPerformance(pPerf);
      setTopAssets(assetsData.slice(0, 6));
      setRecentTransactions(txData.slice(0, 5));
      setGoals(goalsData.slice(0, 3));
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const totalValue = portfolio?.totalPortfolioValue || 100000;
  const cashBalance = portfolio?.availableCash || 100000;
  const totalPnL = portfolio?.totalUnrealizedPnL || 0;
  const returnPercent = portfolio?.totalReturnPercent || 0;
  const isGain = totalPnL >= 0;

  const chartData = performance.map(p => ({
    time: new Date(p.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    value: Number(p.portfolioValue)
  }));

  const pieData = portfolio?.allocation?.map(a => ({
    name: a.category,
    value: Number(a.percentage),
    amount: Number(a.totalValue)
  })) || [{ name: 'CASH', value: 100, amount: 100000 }];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Investment Overview</h1>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
              Demo Environment
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, {user?.fullName}. Real-time valuation across 5 multi-asset classes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/explore"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Markets</span>
          </Link>
          <Link
            to="/goals"
            className="px-4 py-2.5 bg-[#121824] hover:bg-[#1A2333] border border-[#243046] text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>New Goal</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          value={`$${Number(totalValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`${isGain ? '+' : ''}${returnPercent.toFixed(2)}%`}
          isPositive={isGain}
          subValue="Simulated equity"
          icon={Wallet}
        />
        <StatCard
          title="Available Cash"
          value={`$${Number(cashBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subValue="Instant purchasing power"
          icon={DollarSign}
        />
        <StatCard
          title="Unrealized P&L"
          value={`${isGain ? '+$' : '-$'}${Math.abs(Number(totalPnL)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`${isGain ? '+' : ''}${returnPercent.toFixed(2)}%`}
          isPositive={isGain}
          subValue="Active holdings"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Positions"
          value={String(portfolio?.holdings?.length || 0)}
          subValue={`Across ${new Set(portfolio?.holdings?.map(h => h.assetClass)).size} asset classes`}
          icon={PieIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#121824] border border-[#243046] rounded-3xl p-5 lg:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#243046] gap-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Portfolio Performance Curve</h2>
              <p className="text-[11px] text-slate-400">Deterministic portfolio historical trajectory</p>
            </div>
            <div className="flex items-center space-x-1 bg-[#0B0E14] p-1 rounded-xl border border-[#1E293B]">
              {['1D', '1W', '1M', '1Y', 'ALL'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    timeframe === tf
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121824', borderColor: '#243046', borderRadius: '12px' }}
                  labelStyle={{ color: '#94A3B8', fontSize: '11px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#121824] border border-[#243046] rounded-3xl p-5 lg:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Asset Allocation</h2>
            <p className="text-[11px] text-slate-400 mb-4">Diversification across asset classes</p>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[entry.name] || '#38BDF8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121824', borderColor: '#243046', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Allocation']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-2 pt-3 border-t border-[#1E293B]">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: ALLOCATION_COLORS[item.name] || '#38BDF8' }}
                  />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-white font-bold">{item.value.toFixed(1)}%</span>
                  <span className="text-slate-500 text-[10px] ml-1.5">(${item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#121824] border border-[#243046] rounded-3xl p-5 lg:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#243046]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Top Market Movers</h2>
              <p className="text-[11px] text-slate-400">Live prices across multi-asset instruments</p>
            </div>
            <Link to="/explore" className="text-xs font-bold text-emerald-400 hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {topAssets.map(asset => {
              const quote = asset.quote;
              const isChangePositive = (quote?.changePercent24h || 0) >= 0;
              return (
                <div
                  key={asset.symbol}
                  className="bg-[#0B0E14] border border-[#1E293B] hover:border-emerald-500/40 rounded-2xl p-4 transition-all group cursor-pointer"
                  onClick={() => setSelectedAssetForTrade(asset)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-white font-mono group-hover:text-emerald-400 transition-colors">{asset.symbol}</span>
                    <AssetClassBadge assetClass={asset.assetClass} />
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mb-3">{asset.name}</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-white font-mono">${quote?.price.toFixed(2)}</span>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      isChangePositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {isChangePositive ? '+' : ''}{quote?.changePercent24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#121824] border border-[#243046] rounded-3xl p-5 lg:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#243046]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Financial Goals</h2>
              <p className="text-[11px] text-slate-400">Track target horizons</p>
            </div>
            <Link to="/goals" className="text-xs font-bold text-emerald-400 hover:underline">
              Manage
            </Link>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p>No active investment goals yet.</p>
              <Link to="/goals" className="mt-2 inline-block text-emerald-400 font-bold hover:underline">
                Create your first goal →
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {goals.map(g => (
                <div key={g.id} className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-3.5 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">{g.title}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{g.progressPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-[#1A2333] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>${Number(g.currentAmount).toLocaleString()}</span>
                    <span>Target: ${Number(g.targetAmount).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedAssetForTrade && (
        <OrderModal
          asset={selectedAssetForTrade}
          onClose={() => setSelectedAssetForTrade(null)}
          onSuccess={() => {
            loadDashboardData();
            refreshAccount();
          }}
        />
      )}
    </div>
  );
};
