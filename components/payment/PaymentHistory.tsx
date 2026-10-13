'use client';

import React, { useEffect, useState } from 'react';
import { paymentApi, PaymentHistoryItem } from '@/app/api/paymentApi';
import { FileText, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

export const PaymentHistory: React.FC = () => {
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentApi.getPaymentHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load payment history:', err);
      setError('Could not retrieve payment history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'SUCCESS' || s === 'PAID' || s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#6E9625]/10 text-[#2E4A14] border border-[#6E9625]/20 px-2.5 py-1 rounded-full text-xs font-bold">
          <CheckCircle2 size={12} className="text-[#6E9625]" />
          Paid
        </span>
      );
    }
    if (s === 'FAILED' || s === 'REJECTED' || s === 'DECLINED') {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-bold">
          <XCircle size={12} className="text-red-500" />
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
        <Clock size={12} className="text-amber-500" />
        {status || 'Pending'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#1C2C1C]">Billing & Payment History</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified Stripe transaction records for your trader membership.
          </p>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-[#1C2C1C] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh payment history"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C2C1C] mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading billing records...</p>
        </div>
      ) : error ? (
        <div className="py-8 px-6 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={loadHistory}
            className="text-xs font-bold text-[#1C2C1C] underline hover:text-[#6E9625]"
          >
            Click here to retry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead className="bg-[#F8F9F5] text-xs font-bold text-[#1C2C1C]/60 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Provider</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Transaction ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((tx) => {
                  const dateStr = tx.paidAt || tx.createdAt;
                  const dateObj = dateStr ? new Date(dateStr) : null;
                  const displayDate = dateObj
                    ? dateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A';
                  const amountNum = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount || '0');

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 text-[#1C2C1C] font-medium">{displayDate}</td>
                      <td className="px-6 py-4 font-bold text-[#1C2C1C]">
                        €{amountNum.toFixed(2)}{' '}
                        <span className="text-xs font-normal text-gray-500">
                          {(tx.currency || 'EUR').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {tx.paymentProvider || 'STRIPE'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {tx.transactionId || tx.id}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
