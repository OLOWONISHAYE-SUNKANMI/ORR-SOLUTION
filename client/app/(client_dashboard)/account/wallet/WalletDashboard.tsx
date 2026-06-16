"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Filter, Download, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { useLanguage, interpolate } from '@/lib/i18n/LanguageContext';
import Skeleton from '@/components/ui/Skeleton';
import TopUpModal from '@/components/wallet/TopUpModal';
import WalletReceiptDocument from '@/components/wallet/WalletReceiptDocument';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { motion } from 'framer-motion';
import CurrencySelectionModal from '@/components/wallet/CurrencySelectionModal';

export default function WalletDashboard() {
  const { t } = useLanguage();
  const {
    walletBalance,
    currency,
    transactions,
    fetchWalletBalance,
    fetchTransactions,
    fetchPaymentMethods,
    updateCurrency,
    getDisplayBalance,
    formatAmount,
    isLoading
  } = useWalletStore();

  const { onboardingStatus, checkOnboardingStatus } = useOnboardingStore();

  const { user } = useAuthStore();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [printingTransaction, setPrintingTransaction] = useState<any>(null);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isCurrencyUpdating, setIsCurrencyUpdating] = useState(false);

  useEffect(() => {
    fetchWalletBalance();
    fetchTransactions();
    fetchPaymentMethods();
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    // Show currency selection modal if user is onboarded but currency preference is missing
    // We only show it if the currency from wallet balance is the default 'USD' 
    // AND onboarding status confirms it hasn't been set specifically yet.
    if (onboardingStatus && onboardingStatus.is_completed && !onboardingStatus.currency) {
      // Check if we already showed it to avoid being too intrusive
      const hasPrompted = localStorage.getItem('orr-currency-dismissed');
      if (!hasPrompted) {
        setIsCurrencyModalOpen(true);
      }
    }
  }, [onboardingStatus]);

  const handlePrint = (tx: any) => {
    setPrintingTransaction(tx);
    // Need a small timeout to let React render the print content
    setTimeout(() => {
      window.print();
      setPrintingTransaction(null);
    }, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'top_up': return <ArrowUpRight className="text-green-400" />;
      case 'payment': return <ArrowDownLeft className="text-red-400" />;
      case 'deduction': return <ArrowDownLeft className="text-red-400" />;
      case 'refund': return <ArrowUpRight className="text-blue-400" />;
      default: return <Clock className="text-gray-400" />;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchesType && matchesStatus;
  });

  return (
    <div className="w-full max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[var(--color-card)] to-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 md:p-8 relative overflow-hidden group shadow-2xl">
          {/* Decorative background element */}
          <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-[#22C55E]/10 blur-[100px] rounded-full group-hover:bg-[#22C55E]/20 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                <Wallet size={16} />
                <span>{interpolate(t.dashboard.account.wallet.balance)}</span>
              </div>
              <div className="text-5xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                {isLoading ? (
                  <Skeleton width={120} height={40} className="mt-1" />
                ) : (
                  <>
                    <span className="text-3xl text-[#22C55E] opacity-80">
                      {currency === 'EUR' ? '€' : '$'}
                    </span>
                    {getDisplayBalance().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 pt-2">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                Real-time synchronized with Stripe
              </p>
            </div>

            <button
              onClick={() => setIsTopUpOpen(true)}
              className="bg-[#22C55E] text-black font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#16A34A] transition-all transform hover:scale-105 active:scale-95 shadow-[0_10px_30px_-10px_rgba(34,197,94,0.5)]"
            >
              <Plus size={20} />
              {interpolate(t.dashboard.account.wallet.topUp)}
            </button>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 md:p-8 flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-16 h-16 bg-[#1E3A4B] rounded-2xl flex items-center justify-center mb-2">
            <Clock className="w-8 h-8 text-[#22C55E]" />
          </div>
          <h4 className="text-lg font-bold text-white">Upcoming Payments</h4>
          <p className="text-sm text-gray-400">Next scheduled deduction in 12 days for "Service Retainer"</p>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-card/30 backdrop-blur-md border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            {interpolate(t.dashboard.account.wallet.transactions.title)}
            <span className="text-xs bg-[#1E3A4B] px-2 py-1 rounded-lg text-gray-400 font-normal">
              {transactions.length} Total
            </span>
          </h3>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl">
              <Filter size={16} className="text-[#22C55E]" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent border-none text-sm text-white outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="top_up">Top Up</option>
                <option value="payment">Payment</option>
                <option value="deduction">Deduction</option>
              </select>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm text-foreground outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-[var(--color-border)]">
                <th className="px-8 py-4">{interpolate(t.dashboard.account.wallet.transactions.date)}</th>
                <th className="px-8 py-4">{interpolate(t.dashboard.account.wallet.transactions.type)}</th>
                <th className="px-8 py-4">Description</th>
                <th className="px-8 py-4 text-right">{interpolate(t.dashboard.account.wallet.transactions.amount)}</th>
                <th className="px-8 py-4 text-center">{interpolate(t.dashboard.account.wallet.transactions.status)}</th>
                <th className="px-8 py-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A4B]">
              {isLoading ? (
                // Skeleton Rows
                [...Array(5)].map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td className="px-8 py-5">
                      <Skeleton width={100} height={16} className="mb-1" />
                      <Skeleton width={60} height={10} />
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <Skeleton variant="circle" width={32} height={32} />
                        <Skeleton width={80} height={16} />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Skeleton width={200} height={16} />
                    </td>
                    <td className="px-8 py-5">
                      <Skeleton width={80} height={16} className="ml-auto" />
                    </td>
                    <td className="px-8 py-5">
                      <Skeleton width={70} height={24} className="mx-auto rounded-full" />
                    </td>
                    <td className="px-8 py-5 text-center">
                      <Skeleton width={32} height={32} className="mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5 text-sm text-gray-300">
                      <div className="font-bold">{new Date(tx.date).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-500 uppercase">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-card)] flex items-center justify-center">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <span className="text-sm font-semibold text-white capitalize">
                          {interpolate(t.dashboard.account.wallet.transactions.types[tx.type] || tx.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-400">
                      <div className="line-clamp-1">{tx.description}</div>
                      {(tx.reference_id || tx.id) && <span className="block text-[10px] opacity-50 font-mono mt-1">Ref: {tx.reference_id || tx.id}</span>}
                    </td>
                    <td className={`px-8 py-5 text-sm font-bold text-right ${tx.type === 'top_up' || tx.type === 'refund' ? 'text-green-400' : 'text-white'}`}>
                      {tx.type === 'top_up' || tx.type === 'refund' ? '+' : '-'} {formatAmount(tx.amount)}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button
                        onClick={() => handlePrint(tx)}
                        className="p-2 text-gray-400 hover:text-[#22C55E] transition-colors bg-[#1E3A4B]/50 rounded-lg group-hover:bg-[#22C55E]/10"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                      <Wallet size={48} />
                      <p className="text-sm">No transactions found for the selected filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 md:p-8 border-t border-[var(--color-border)] flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">
            Showing {filteredTransactions.length} results
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl text-gray-500 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              <button className="w-10 h-10 rounded-xl bg-[#22C55E] text-black font-bold text-sm">1</button>
              <button className="w-10 h-10 rounded-xl hover:bg-[var(--color-card)] text-foreground text-sm transition-colors">2</button>
            </div>
            <button className="p-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl text-gray-500 hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
      />

      <CurrencySelectionModal
        isOpen={isCurrencyModalOpen}
        onClose={() => {
          setIsCurrencyModalOpen(false);
          localStorage.setItem('orr-currency-dismissed', 'true');
        }}
        isLoading={isCurrencyUpdating}
        onSelect={async (newCurrency) => {
          setIsCurrencyUpdating(true);
          const success = await updateCurrency(newCurrency);
          if (success) {
            setIsCurrencyModalOpen(false);
            localStorage.setItem('orr-currency-dismissed', 'true');
          }
          setIsCurrencyUpdating(false);
        }}
      />

      {/* Hidden Print Section */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        {printingTransaction && (
          <WalletReceiptDocument
            transaction={printingTransaction}
            user={{
              name: `${user?.username || 'Client'}`,
              email: user?.email || ''
            }}
          />
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\:block, .print\:block * {
            visibility: visible;
          }
          .print\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
