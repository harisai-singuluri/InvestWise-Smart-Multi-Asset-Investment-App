import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Asset, PriceAlert } from '../types';
import { AssetClassBadge } from '../components/common/Badge';
import { OrderModal } from '../components/common/OrderModal';
import { PriceAlertModal } from '../components/common/PriceAlertModal';
import {
  Star,
  Bell,
  Trash2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WatchlistAlertsPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<Asset[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradingAsset, setTradingAsset] = useState<Asset | null>(null);
  const [alertAsset, setAlertAsset] = useState<Asset | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [wlData, alertsData] = await Promise.all([
        api.watchlist.list(),
        api.alerts.list()
      ]);
      setWatchlist(wlData);
      setAlerts(alertsData);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemoveFromWatchlist = async (symbol: string) => {
    try {
      await api.watchlist.remove(symbol);
      loadData();
    } catch (err) {
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await api.alerts.delete(alertId);
      loadData();
    } catch (err) {
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Watchlist & Price Alerts</h1>
        <p className="text-xs text-slate-400 mt-1">Track prioritized assets and configure automated market price thresholds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#243046]">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Watched Instruments</h2>
            </div>
            <Link to="/explore" className="text-xs font-bold text-emerald-400 hover:underline">
              Add More
            </Link>
          </div>

          {watchlist.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <p>Your watchlist is currently empty.</p>
              <Link to="/explore" className="mt-2 inline-block text-emerald-400 font-bold hover:underline">
                Explore assets and click the star icon →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {watchlist.map(asset => {
                const quote = asset.quote;
                const isPositive = (quote?.changePercent24h || 0) >= 0;

                return (
                  <div
                    key={asset.symbol}
                    className="bg-[#0B0E14] border border-[#1E293B] hover:border-[#243046] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#121824] border border-[#243046] flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                        {asset.symbol.substring(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Link to={`/assets/${asset.symbol}`} className="font-extrabold text-white hover:text-emerald-400 transition-colors font-mono">
                            {asset.symbol}
                          </Link>
                          <AssetClassBadge assetClass={asset.assetClass} />
                        </div>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{asset.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      <div className="text-right font-mono">
                        <span className="text-sm font-bold text-white block">${quote?.price.toFixed(2)}</span>
                        <span className={`text-[11px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '+' : ''}{quote?.changePercent24h.toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setTradingAsset(asset)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-all"
                        >
                          Trade
                        </button>
                        <button
                          onClick={() => handleRemoveFromWatchlist(asset.symbol)}
                          title="Remove from watchlist"
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#243046]">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Price Alerts</h2>
            </div>
            <span className="text-xs text-slate-400">{alerts.length}</span>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <p>No price alerts set.</p>
              <p className="text-[11px] text-slate-500 mt-1">Set price above or below triggers on any asset.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => {
                const isTriggered = alert.status === 'TRIGGERED';
                return (
                  <div
                    key={alert.id}
                    className={`bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-3.5 space-y-2 ${
                      isTriggered ? 'border-amber-500/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white font-mono text-xs">{alert.symbol}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isTriggered
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-300 font-mono">
                      <span>Condition: </span>
                      <span className="text-amber-400 font-semibold">{alert.alertCondition.replace('_', ' ')}</span>
                      <span> at </span>
                      <span className="text-white font-bold">${Number(alert.thresholdPrice).toFixed(2)}</span>
                    </div>

                    {alert.triggeredAt && (
                      <p className="text-[10px] text-slate-500">
                        Triggered at: {new Date(alert.triggeredAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {tradingAsset && (
        <OrderModal
          asset={tradingAsset}
          onClose={() => setTradingAsset(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
