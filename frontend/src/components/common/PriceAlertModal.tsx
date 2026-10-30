import React, { useState } from 'react';
import { Asset, AlertCondition } from '../../types';
import { api } from '../../services/api';
import { X, Bell, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PriceAlertModalProps {
  asset: Asset;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({ asset, onClose, onSuccess }) => {
  const [condition, setCondition] = useState<AlertCondition>('PRICE_ABOVE');
  const [threshold, setThreshold] = useState<string>(asset.quote?.price.toString() || '100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const price = Number(threshold);
    if (price <= 0) {
      setError('Please enter a valid price threshold');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.alerts.create({
        symbol: asset.symbol,
        alertCondition: condition,
        thresholdPrice: price,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to create alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#121824] border border-[#243046] rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-[#1A2333]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create Price Alert</h3>
            <p className="text-xs text-slate-400">{asset.name} ({asset.symbol}) • Current: <span className="font-mono text-emerald-400 font-bold">${asset.quote?.price.toFixed(2)}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Trigger Condition</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('PRICE_ABOVE')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                  condition === 'PRICE_ABOVE'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-[#243046] text-slate-400 hover:text-white'
                }`}
              >
                Price Goes Above (▲)
              </button>
              <button
                type="button"
                onClick={() => setCondition('PRICE_BELOW')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                  condition === 'PRICE_BELOW'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                    : 'border-[#243046] text-slate-400 hover:text-white'
                }`}
              >
                Price Drops Below (▼)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Price ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Alert successfully created!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Saving Alert...' : 'Set Price Alert'}
          </button>
        </form>
      </div>
    </div>
  );
};
