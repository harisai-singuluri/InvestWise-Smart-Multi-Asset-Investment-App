import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Asset, AssetClass } from '../types';
import { AssetClassBadge } from '../components/common/Badge';
import { OrderModal } from '../components/common/OrderModal';
import { PriceAlertModal } from '../components/common/PriceAlertModal';
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Check,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ASSET_TABS: { label: string; value?: AssetClass }[] = [
  { label: 'All Instruments' },
  { label: 'US Stocks', value: 'STOCKS' },
  { label: 'ETFs', value: 'ETFS' },
  { label: 'Cryptocurrency', value: 'CRYPTO' },
  { label: 'Mutual Funds', value: 'MUTUAL_FUNDS' },
  { label: 'Digital Gold', value: 'GOLD' },
];

export const ExplorePage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedClass, setSelectedClass] = useState<AssetClass | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'gainers' | 'losers' | 'price_desc' | 'alphabetical'>('gainers');
  const [loading, setLoading] = useState(true);
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set());
  const [tradingAsset, setTradingAsset] = useState<Asset | null>(null);
  const [alertAsset, setAlertAsset] = useState<Asset | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetsData, watchlistData] = await Promise.all([
        api.assets.list({ assetClass: selectedClass, search }),
        api.watchlist.list()
      ]);
      setAssets(assetsData);
      setWatchlistSymbols(new Set(watchlistData.map(w => w.symbol)));
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass, search]);

  const handleToggleWatchlist = async (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (watchlistSymbols.has(symbol)) {
        await api.watchlist.remove(symbol);
        setWatchlistSymbols(prev => {
          const next = new Set(prev);
          next.delete(symbol);
          return next;
        });
      } else {
        await api.watchlist.add(symbol);
        setWatchlistSymbols(prev => new Set(prev).add(symbol));
      }
    } catch (err) {
    }
  };

  const sortedAssets = [...assets].sort((a, b) => {
    const quoteA = a.quote;
    const quoteB = b.quote;
    if (sortBy === 'gainers') {
      return (quoteB?.changePercent24h || 0) - (quoteA?.changePercent24h || 0);
    } else if (sortBy === 'losers') {
      return (quoteA?.changePercent24h || 0) - (quoteB?.changePercent24h || 0);
    } else if (sortBy === 'price_desc') {
      return (quoteB?.price || 0) - (quoteA?.price || 0);
    } else {
      return a.symbol.localeCompare(b.symbol);
    }
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Explore Markets</h1>
          <p className="text-xs text-slate-400 mt-1">Discover, track, and trade simulated instruments across multi-asset classes</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search symbol or name (e.g. AAPL, BTC, Vanguard, Gold)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121824] border border-[#243046] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#121824] border border-[#243046] rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="gainers">Top Gainers 24h</option>
            <option value="losers">Top Losers 24h</option>
            <option value="price_desc">Highest Price</option>
            <option value="alphabetical">Symbol (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {ASSET_TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setSelectedClass(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedClass === tab.value
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-[#121824] text-slate-400 hover:text-white border border-[#243046]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAssets.map(asset => {
          const quote = asset.quote;
          const isPositive = (quote?.changePercent24h || 0) >= 0;
          const isInWatchlist = watchlistSymbols.has(asset.symbol);

          return (
            <div
              key={asset.symbol}
              className="bg-[#121824] border border-[#243046] hover:border-emerald-500/40 rounded-3xl p-5 transition-all shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0B0E14] border border-[#243046] flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                      {asset.symbol.substring(0, 3)}
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-white font-mono">{asset.symbol}</span>
                      <p className="text-[10px] text-slate-400">{asset.exchange}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleToggleWatchlist(asset.symbol, e)}
                      title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isInWatchlist
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'border-[#243046] text-slate-500 hover:text-white'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isInWatchlist ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => setAlertAsset(asset)}
                      title="Set Price Alert"
                      className="p-1.5 rounded-lg border border-[#243046] text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-300 truncate mb-1">{asset.name}</p>
                <div className="mb-4">
                  <AssetClassBadge assetClass={asset.assetClass} />
                </div>

                <div className="flex items-baseline justify-between mb-4 bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Current Quote</span>
                    <span className="text-lg font-black text-white font-mono">${quote?.price.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-flex items-center space-x-0.5 ${
                      isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>{isPositive ? '+' : ''}{quote?.changePercent24h.toFixed(2)}%</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Vol: ${(Number(quote?.volume24h || 0) / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E293B]">
                <Link
                  to={`/assets/${asset.symbol}`}
                  className="py-2.5 px-3 rounded-xl bg-[#1A2333] hover:bg-[#243046] text-slate-200 text-xs font-bold text-center transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </Link>
                <button
                  onClick={() => setTradingAsset(asset)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  Trade Demo
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {tradingAsset && (
        <OrderModal
          asset={tradingAsset}
          onClose={() => setTradingAsset(null)}
          onSuccess={loadData}
        />
      )}

      {alertAsset && (
        <PriceAlertModal
          asset={alertAsset}
          onClose={() => setAlertAsset(null)}
        />
      )}
    </div>
  );
};
