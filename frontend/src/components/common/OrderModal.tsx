import React, { useState } from 'react';
import { Asset, OrderSide, OrderType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { X, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OrderModalProps {
  asset: Asset;
  onClose: () => void;
  onSuccess: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ asset, onClose, onSuccess }) => {
  const { account, refreshAccount } = useAuth();
  const [side, setSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState<string>('1');
  const [limitPrice, setLimitPrice] = useState<string>(asset.quote?.price.toString() || '0');
  const [triggerPrice, setTriggerPrice] = useState<string>(asset.quote?.price.toString() || '0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentPrice = asset.quote?.price || 0;
  const effectivePrice = orderType === 'LIMIT' ? Number(limitPrice) || 0 : (orderType === 'STOP_LOSS' || orderType === 'TAKE_PROFIT' ? Number(triggerPrice) || 0 : currentPrice);
  const numQuantity = Number(quantity) || 0;
  const grossTotal = effectivePrice * numQuantity;

  let feeRate = 0;
  let flatFee = 0;
  if (asset.assetClass === 'CRYPTO') feeRate = 0.001;
  else if (asset.assetClass === 'GOLD') feeRate = 0.0015;
  else if (asset.assetClass === 'MUTUAL_FUNDS') flatFee = 1.50;

  const estimatedFee = Number((grossTotal * feeRate + flatFee).toFixed(2));
  const totalEstimated = side === 'BUY' ? grossTotal + estimatedFee : grossTotal - estimatedFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (numQuantity <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    if (orderType === 'LIMIT' && Number(limitPrice) <= 0) {
      setError('Please provide a valid limit price');
      return;
    }

    if ((orderType === 'STOP_LOSS' || orderType === 'TAKE_PROFIT') && Number(triggerPrice) <= 0) {
      setError('Please provide a valid trigger price');
      return;
    }

    if (side === 'BUY' && account && totalEstimated > account.availableCash) {
      setError(`Insufficient available cash. Needed: $${totalEstimated.toFixed(2)}, Available: $${account.availableCash.toFixed(2)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.orders.submit({
        symbol: asset.symbol,
        side,
        type: orderType,
        quantity: numQuantity,
        limitPrice: orderType === 'LIMIT' ? Number(limitPrice) : undefined,
        triggerPrice: orderType === 'STOP_LOSS' || orderType === 'TAKE_PROFIT' ? Number(triggerPrice) : undefined,
        idempotencyKey: `ord-${asset.symbol}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      });

      await refreshAccount();
      setSuccessMsg(`Simulated ${side} order placed successfully! Status: ${res.status}`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to submit order');
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
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 font-mono">
            {asset.symbol.substring(0, 3)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{asset.name}</h3>
            <p className="text-xs text-slate-400">{asset.symbol} • {asset.exchange} • Live Demo: <span className="text-emerald-400 font-mono font-bold">${currentPrice.toFixed(2)}</span></p>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Order Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  orderType === 'MARKET'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-[#243046] text-slate-400 hover:text-white'
                }`}
              >
                Market (Instant)
              </button>
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  orderType === 'LIMIT'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-[#243046] text-slate-400 hover:text-white'
                }`}
              >
                Limit (Target)
              </button>
              <button
                type="button"
                onClick={() => setOrderType('STOP_LOSS')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  orderType === 'STOP_LOSS'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-[#243046] text-slate-400 hover:text-white'
                }`}
              >
                Stop-Loss
              </button>
              <button
                type="button"
                onClick={() => setOrderType('TAKE_PROFIT')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  orderType === 'TAKE_PROFIT'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-[#243046] text-slate-400 hover:text-white'
                }`}
              >
                Take-Profit
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Quantity (Units / Shares)</label>
            <input
              type="number"
              step="any"
              min="0.000001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 5"
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
                placeholder="e.g. 185.00"
                required
              />
            </div>
          )}

          {(orderType === 'STOP_LOSS' || orderType === 'TAKE_PROFIT') && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {orderType === 'STOP_LOSS' ? 'Stop Trigger Price ($ USD)' : 'Take-Profit Trigger Price ($ USD)'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#243046] rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                placeholder="e.g. 195.00"
                required
              />
            </div>
          )}

          <div className="bg-[#0B0E14] border border-[#1E293B] rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Estimated Execution Price</span>
              <span className="text-white font-mono font-semibold">${effectivePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Simulated Fee & Spread</span>
              <span className="text-slate-300 font-mono font-semibold">${estimatedFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-[#1E293B] pt-2 flex justify-between font-bold">
              <span className="text-white">Estimated Total</span>
              <span className="text-emerald-400 font-mono text-sm">${totalEstimated.toFixed(2)} USD</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
              side === 'BUY'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
            } disabled:opacity-50`}
          >
            {isSubmitting ? 'Processing Execution...' : `Confirm Simulated ${side} Order`}
          </button>
        </form>
      </div>
    </div>
  );
};
