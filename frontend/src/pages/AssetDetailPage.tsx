import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Asset, PriceHistoryPoint, OrderSide, OrderType } from '../types';
import { AssetClassBadge } from '../components/common/Badge';
import { PriceAlertModal } from '../components/common/PriceAlertModal';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Bell,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const AssetDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { account, refreshAccount } = useAuth();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [timeframe, setTimeframe] = useState<string>('1M');
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [side, setSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState<string>('1');
  const [limitPrice, setLimitPrice] = useState<string>('0');
  const [orderSubmitting, setOrderSubmitting] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const loadAssetDetails = async () => {
    if (!symbol) return;
    try {
      const [assetData, historyData, watchlistData] = await Promise.all([
        api.assets.get(symbol),
        api.assets.getHistory(symbol, timeframe),
        api.watchlist.list()
      ]);
      setAsset(assetData);
      setHistory(historyData);
      setInWatchlist(watchlistData.some(w => w.symbol.toUpperCase() === symbol.toUpperCase()));
      setLimitPrice(assetData.quote?.price.toString() || '0');
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssetDetails();
  }, [symbol, timeframe]);

  const handleWatchlistToggle = async () => {
    if (!symbol) return;
    try {
      if (inWatchlist) {
        await api.watchlist.remove(symbol);
        setInWatchlist(false);
      } else {
        await api.watchlist.add(symbol);
        setInWatchlist(true);
      }
    } catch (err) {
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    setOrderSuccess(null);

    const numQty = Number(quantity);
    if (!numQty || numQty <= 0) {
      setOrderError('Quantity must be greater than zero');
      return;
    }

    try {
      setOrderSubmitting(true);
      const res = await api.orders.submit({
        symbol: symbol!,
        side,
        type: orderType,
        quantity: numQty,
        limitPrice: orderType === 'LIMIT' ? Number(limitPrice) : undefined,
        idempotencyKey: `ord-${symbol}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      });

      await refreshAccount();
      setOrderSuccess(`Simulated ${side} order placed! Status: ${res.status}`);
      loadAssetDetails();
    } catch (err: any) {
      setOrderError(err.message || 'Order failed');
    } finally {
      setOrderSubmitting(false);
    }
  };

  if (!asset) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Loading asset information...</p>
      </div>
    );
  }

  const quote = asset.quote;
  const isPositive = (quote?.changePercent24h || 0) >= 0;
  const currentPrice = quote?.price || 0;
  const effectivePrice = orderType === 'MARKET' ? currentPrice : Number(limitPrice) || 0;
  const numQty = Number(quantity) || 0;
  const orderTotal = effectivePrice * numQty;

  const chartData = history.map(h => ({
    time: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
    price: Number(h.price)
  }));

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <Link
        to="/explore"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Markets</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E293B] gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E293B] to-[#121824] border border-[#243046] flex items-center justify-center font-mono font-black text-emerald-400 text-base">
            {asset.symbol.substring(0, 3)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white font-mono">{asset.symbol}</h1>
              <AssetClassBadge assetClass={asset.assetClass} />
              <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded bg-[#121824] border border-[#243046]">{asset.exchange}</span>
            </div>
            <p className="text-xs text-slate-400">{asset.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleWatchlistToggle}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              inWatchlist
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-[#121824] border-[#243046] text-slate-300 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-amber-400' : ''}`} />
            <span>{inWatchlist ? 'Saved in Watchlist' : 'Add to Watchlist'}</span>
          </button>

          <button
            onClick={() => setShowAlertModal(true)}
            className="px-3.5 py-2 bg-[#121824] border border-[#243046] hover:border-amber-500/40 text-slate-300 hover:text-amber-400 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Set Alert</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 gap-2">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Latest Simulated Quote</span>
                <div className="flex items-baseline space-x-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono">${quote?.price.toFixed(2)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-flex items-center space-x-0.5 ${
                    isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>{isPositive ? '+' : ''}{quote?.changePercent24h.toFixed(2)}% (${quote?.change24h.toFixed(2)})</span>
                  </span>
                </div>
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

            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} domain={['auto', 'auto']} tickFormatter={v => `$${v.toFixed(0)}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121824', borderColor: '#243046', borderRadius: '12px' }}
                    labelStyle={{ color: '#94A3B8', fontSize: '11px' }}
                    formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Quote']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? '#10B981' : '#EF4444'}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#priceGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Instrument Key Statistics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-3.5">
                <span className="text-[10px] text-slate-500 font-sans block">24h High</span>
                <span className="text-sm font-bold text-white mt-1 block">${quote?.high24h.toFixed(2)}</span>
              </div>
              <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-3.5">
                <span className="text-[10px] text-slate-500 font-sans block">24h Low</span>
                <span className="text-sm font-bold text-white mt-1 block">${quote?.low24h.toFixed(2)}</span>
              </div>
              <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-3.5">
                <span className="text-[10px] text-slate-500 font-sans block">24h Volume</span>
                <span className="text-sm font-bold text-white mt-1 block">${(Number(quote?.volume24h || 0) / 1000000).toFixed(2)}M</span>
              </div>
              <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-3.5">
                <span className="text-[10px] text-slate-500 font-sans block">Settlement Currency</span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block">{asset.currency} (USD)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl h-fit">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Simulated Order Ticket</h2>
          <p className="text-[11px] text-slate-400 mb-4">Execute instant market order or set limit target</p>

          <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0E14] rounded-2xl mb-5 border border-[#1E293B]">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                side === 'BUY'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>BUY</span>
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                side === 'SELL'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>SELL</span>
            </button>
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Order Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('MARKET')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                    orderType === 'MARKET'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-[#243046] text-slate-400 hover:text-white'
                  }`}
                >
                  Market
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('LIMIT')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                    orderType === 'LIMIT'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-[#243046] text-slate-400 hover:text-white'
                  }`}
                >
                  Limit
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Quantity (Units)</label>
              <input
                type="number"
                step="any"
                min="0.000001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {orderType === 'LIMIT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Limit Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            )}

            <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Unit Price</span>
                <span className="text-white font-mono">${effectivePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Available Cash</span>
                <span className="text-emerald-400 font-mono">${account?.availableCash.toLocaleString()}</span>
              </div>
              <div className="border-t border-[#1E293B] pt-2 flex justify-between font-bold">
                <span className="text-white">Estimated Value</span>
                <span className="text-white font-mono text-sm">${orderTotal.toFixed(2)} USD</span>
              </div>
            </div>

            {orderError && (
              <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            {orderSuccess && (
              <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{orderSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={orderSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                side === 'BUY'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
              } disabled:opacity-50`}
            >
              {orderSubmitting ? 'Submitting...' : `Submit Simulated ${side} Order`}
            </button>
          </form>
        </div>
      </div>

      {showAlertModal && (
        <PriceAlertModal
          asset={asset}
          onClose={() => setShowAlertModal(false)}
        />
      )}
    </div>
  );
};
