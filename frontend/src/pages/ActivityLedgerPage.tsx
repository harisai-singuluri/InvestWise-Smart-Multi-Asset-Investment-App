import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Order, TransactionRecord, LedgerEntry } from '../types';
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const ActivityLedgerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions' | 'ledger'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [oData, tData, lData] = await Promise.all([
        api.orders.list(),
        api.ledger.getTransactions(),
        api.ledger.getEntries()
      ]);
      setOrders(oData);
      setTransactions(tData);
      setLedgerEntries(lData);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this open limit order?')) return;
    try {
      await api.orders.cancel(orderId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Order cancellation failed');
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['Transaction ID', 'Order ID', 'Asset Symbol', 'Side', 'Quantity', 'Execution Price', 'Total Amount (USD)', 'Fee', 'Timestamp'];
    const rows = transactions.map(t => [
      t.id,
      t.orderId,
      t.assetSymbol,
      t.side,
      t.quantity,
      t.executionPrice,
      t.totalAmount,
      t.fee,
      t.timestamp
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `InvestWise_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Ledger & Activity</h1>
          <p className="text-xs text-slate-400 mt-1">Audit-proof double-entry accounting journals, executed trades, and order lifecycles</p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="px-4 py-2.5 bg-[#121824] hover:bg-[#1A2333] border border-[#243046] hover:border-emerald-500/40 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2 self-start sm:self-auto shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'orders'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Order Lifecycle ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'transactions'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Executed Trades ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'ledger'
              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Double-Entry Ledger Journals ({ledgerEntries.length})
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-500 text-[10px] uppercase tracking-wider font-sans">
                  <th className="pb-3 pl-2">Order ID</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Asset</th>
                  <th className="pb-3">Side</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-right">Quantity</th>
                  <th className="pb-3 text-right">Limit Price</th>
                  <th className="pb-3 text-right">Filled Price</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {orders.map(order => {
                  const isBuy = order.side === 'BUY';
                  const isFilled = order.status === 'FILLED';
                  const isOpen = order.status === 'OPEN';

                  return (
                    <tr key={order.id} className="hover:bg-[#1A2333]/40 transition-colors">
                      <td className="py-3.5 pl-2 text-slate-400">#{order.id}</td>
                      <td className="py-3.5 text-slate-400 text-[11px] font-sans">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 font-bold text-white">{order.symbol}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {order.side}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-300 font-sans">{order.type}</td>
                      <td className="py-3.5 text-right font-bold text-white">
                        {Number(order.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </td>
                      <td className="py-3.5 text-right text-slate-400">
                        {order.limitPrice ? `$${Number(order.limitPrice).toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3.5 text-right font-bold text-emerald-400">
                        {order.filledPrice ? `$${Number(order.filledPrice).toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3.5 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isFilled
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isOpen
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right font-sans">
                        {isOpen ? (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[10px] font-bold transition-colors"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px]">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-500 text-[10px] uppercase tracking-wider font-sans">
                  <th className="pb-3 pl-2">TX ID</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Asset</th>
                  <th className="pb-3">Side</th>
                  <th className="pb-3 text-right">Quantity</th>
                  <th className="pb-3 text-right">Execution Price</th>
                  <th className="pb-3 text-right">Total Settlement</th>
                  <th className="pb-3 text-right pr-2">Simulated Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-[#1A2333]/40 transition-colors">
                    <td className="py-3.5 pl-2 text-slate-400">#{tx.id}</td>
                    <td className="py-3.5 text-slate-400 text-[11px] font-sans">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 font-bold text-white">{tx.assetSymbol}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {tx.side}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold text-white">
                      {Number(tx.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </td>
                    <td className="py-3.5 text-right font-bold text-white">
                      ${Number(tx.executionPrice).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right font-extrabold text-white">
                      ${Number(tx.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 pr-2 text-right text-emerald-400 font-sans">
                      $0.00
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="bg-[#121824] border border-[#243046] rounded-3xl p-6 shadow-xl overflow-hidden space-y-4">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Double-Entry Financial Journal Architecture</p>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Every trade creates equal and opposite debit and credit entries. Cash debits equal asset acquisition credits for buys; asset disposal debits equal cash credits for sells.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-500 text-[10px] uppercase tracking-wider font-sans">
                  <th className="pb-3 pl-2">Journal Entry ID</th>
                  <th className="pb-3">Transaction</th>
                  <th className="pb-3">Entry Type</th>
                  <th className="pb-3 text-right">Debit ($)</th>
                  <th className="pb-3 text-right">Credit ($)</th>
                  <th className="pb-3">Asset Leg</th>
                  <th className="pb-3 text-right">Cash Balance After</th>
                  <th className="pb-3 pr-2 text-right">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {ledgerEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-[#1A2333]/40 transition-colors">
                    <td className="py-3.5 pl-2 text-slate-400">#{entry.id}</td>
                    <td className="py-3.5 text-slate-400">TX #{entry.transactionId}</td>
                    <td className="py-3.5 font-bold font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        entry.entryType.includes('DEBIT') ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {entry.entryType}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold text-white">
                      {Number(entry.debitAmount) > 0 ? `$${Number(entry.debitAmount).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3.5 text-right font-bold text-white">
                      {Number(entry.creditAmount) > 0 ? `$${Number(entry.creditAmount).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3.5 text-slate-300 font-sans">
                      {entry.assetSymbol ? `${entry.assetSymbol} (${Number(entry.assetQuantity).toFixed(4)})` : '—'}
                    </td>
                    <td className="py-3.5 text-right font-extrabold text-emerald-400">
                      ${Number(entry.balanceAfter).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 pr-2 text-right text-slate-500 text-[10px] font-sans">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
