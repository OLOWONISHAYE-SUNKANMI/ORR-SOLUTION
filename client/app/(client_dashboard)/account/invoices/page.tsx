"use client";

import React, { useState, useEffect } from 'react';
import { Loader2,
  FileText,
  Search,
  Printer,
  Download,
  Wallet,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  CreditCard,
  Calendar,
  Hash,
  User as UserIcon
} from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import WalletReceiptDocument from '@/components/wallet/WalletReceiptDocument';
import Skeleton from '@/components/ui/Skeleton';
import Link from 'next/link';

interface UnifiedInvoice {
  id: string | number;
  title: string;
  amount: number;
  date: string;
  status: string;
  source: 'billing' | 'wallet';
  reference: string;
  method: string;
  currency: string;
  invoice_pdf?: string;
  receipt_url?: string;
  raw: any;
}

export default function ClientInvoicesPage() {
  const { t, interpolate } = useLanguage();
  const {
    walletBalance,
    currency,
    fetchWalletBalance,
    billingHistory,
    fetchBillingHistory,
    transactions,
    fetchTransactions,
    isLoading: walletLoading
  } = useWalletStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<UnifiedInvoice | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<UnifiedInvoice | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchWalletBalance();
    fetchBillingHistory();
    fetchTransactions();
  }, [fetchWalletBalance, fetchBillingHistory, fetchTransactions]);

  // Combine and unify data from both billing history and wallet transactions
  const combinedInvoices: UnifiedInvoice[] = [
    ...billingHistory.map(bh => ({
      id: bh.id,
      title: bh.billing_title,
      amount: Math.abs(parseFloat(bh.amount)),
      date: bh.transaction_date,
      status: bh.status || 'paid',
      source: 'billing' as const,
      reference: bh.reference_id,
      method: bh.payment_method,
      currency: bh.currency,
      invoice_pdf: bh.invoice_pdf,
      receipt_url: undefined,
      raw: bh
    })),
    ...transactions.map(tx => ({
      id: tx.id,
      title: tx.description,
      amount: Math.abs(tx.amount),
      date: tx.date,
      status: tx.status,
      source: 'wallet' as const,
      reference: tx.reference_id || String(tx.id).slice(0, 8).toUpperCase(),
      method: 'Wallet',
      currency: tx.currency,
      receipt_url: tx.receipt_url,
      invoice_pdf: undefined,
      raw: tx
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredInvoices = combinedInvoices.filter(inv =>
    inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = (invoice: UnifiedInvoice) => {
    if (invoice.invoice_pdf) {
      window.open(invoice.invoice_pdf, '_blank');
      return;
    }

    setPrintingInvoice(invoice);
    // Need a small timeout to let React render the print content
    setTimeout(() => {
      window.print();
      setPrintingInvoice(null);
    }, 100);
  };

  return (
    <div className="min-h-screen text-foreground p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              {interpolate(t.dashboard.account.invoices.title)}
            </h1>
            <p className="text-foreground/60 max-w-xl text-lg">
              {interpolate(t.dashboard.account.invoices.description)}
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-6 shadow-2xl">
            <div className="bg-[#22C55E]/20 p-4 rounded-2xl">
              <Wallet className="w-8 h-8 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-1">
                {interpolate(t.dashboard.account.invoices.availableBalance)}
              </p>
              <p className="text-3xl font-black text-[#22C55E]">
                {currency === 'EUR' ? '€' : '$'} {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/30 backdrop-blur-md p-4 rounded-3xl border border-white/5 shadow-inner">
          <div className="relative w-full md:w-full max-w-lg">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={interpolate(t.dashboard.account.invoices.searchPlaceholder)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50 focus:border-[#22C55E] transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-4 text-sm font-bold bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all">
              {interpolate(t.dashboard.account.invoices.last6Months)}
            </button>
            <button className="flex-1 md:flex-none px-6 py-4 text-sm font-bold bg-[#22C55E] text-black rounded-2xl hover:bg-[#22C55E]/90 transition-all shadow-lg shadow-[#22C55E]/20">
              {interpolate(t.dashboard.account.invoices.allInvoices)}
            </button>
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {walletLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-card/20 border border-white/5 p-6 rounded-3xl animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-5 bg-white/10 w-48 rounded" />
                    <div className="h-3 bg-white/5 w-32 rounded" />
                  </div>
                </div>
                <div className="h-8 bg-white/10 w-24 rounded-full" />
              </div>
            ))
          ) : filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <div
                key={`${invoice.source}-${invoice.id}`}
                onClick={() => {
                  setSelectedInvoice(invoice);
                  setIsDrawerOpen(true);
                }}
                className="group relative bg-card/40 hover:bg-card/60 backdrop-blur-sm border border-white/5 hover:border-[#22C55E]/30 p-6 rounded-3xl transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer overflow-hidden shadow-xl"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-[#22C55E] transition-all" />

                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="p-4 rounded-2xl flex flex-col items-center justify-center gap-1 bg-[#22C55E]/10">
                    <FileText className="w-6 h-6 text-[#22C55E]" />
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                      {invoice.source === 'billing' ? 'PLAN' : 'TXN'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#22C55E] transition-colors">
                      {invoice.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-foreground/40 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(invoice.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="flex items-center gap-1.5 uppercase">
                        <Hash className="w-3.5 h-3.5" />
                        {invoice.reference}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end w-full md:w-auto">
                  <span className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em] mb-1">Total Amount</span>
                  <p className="text-3xl font-black text-white">
                    {invoice.currency === 'EUR' ? '€' : '$'} {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrint(invoice);
                    }}
                    className="p-3 bg-white/5 hover:bg-[#22C55E]/20 text-foreground/60 hover:text-[#22C55E] rounded-2xl transition-all"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  {(invoice.invoice_pdf || invoice.receipt_url) && (
                    <a
                      href={invoice.invoice_pdf || invoice.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-3 bg-white/5 hover:bg-[#22C55E]/20 text-foreground/60 hover:text-[#22C55E] rounded-2xl transition-all"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                  <div className="p-3 bg-white/5 group-hover:bg-[#22C55E] text-foreground/20 group-hover:text-black rounded-2xl transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-card/20 rounded-[3rem] border-2 border-dashed border-white/5">
              <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FileText className="w-12 h-12 text-foreground/20" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{interpolate(t.dashboard.account.invoices.noInvoicesTitle)}</h2>
              <p className="text-foreground/40 max-w-xs mx-auto text-lg">
                {interpolate(t.dashboard.account.invoices.noInvoicesDesc)}
              </p>
            </div>
          )}
        </div>

        {/* Support Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#22C55E]/20 via-[#22C55E]/5 to-transparent border border-white/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#22C55E]/10 rounded-full blur-[100px]" />
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <h3 className="text-3xl font-extrabold text-white">{interpolate(t.dashboard.account.invoices.contactSupport)}</h3>
            <p className="text-foreground/60 text-lg max-w-md">
              {interpolate(t.dashboard.account.invoices.contactSupportDesc)}
            </p>
          </div>
          <Link href="/support" className="relative z-10 bg-white text-black cursor-pointer hover:bg-[#22C55E] hover:text-black whitespace-nowrap px-10 py-4 rounded-2xl font-black transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl">
            {interpolate(t.dashboard.account.invoices.contactSupportBtn)}
          </Link>
        </div>
      </div>

      {/* Details Drawer */}
      <div className={`fixed inset-0 z-[100] transition-visibility duration-500 ${isDrawerOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsDrawerOpen(false)}
        />

        <div className={`absolute top-0 right-0 bottom-0 w-full max-w-lg bg-card/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl transition-transform duration-500 transform ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>

          {/* Drawer Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div>
              <h2 className="text-2xl font-black text-white">{interpolate(t.dashboard.account.invoices.detailsTitle)}</h2>
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">
                {interpolate(t.dashboard.account.invoices.detailsDesc)}
              </p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {selectedInvoice && (
              <>
                {/* Preview Section */}
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#22C55E]/20 to-[#22C55E]/5 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden transform group-hover:scale-[1.01] transition duration-500 border border-white/10 scale-[0.8] origin-top -mb-20">
                    <div className="pointer-events-none select-none">
                      <WalletReceiptDocument
                        transaction={{
                          id: String(selectedInvoice.id),
                          amount: selectedInvoice.amount,
                          currency: selectedInvoice.currency,
                          date: selectedInvoice.date,
                          reference_id: selectedInvoice.reference,
                          description: selectedInvoice.title
                        }}
                        user={{
                          name: user?.username || 'Client',
                          email: user?.email || ''
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60"></div>
                  </div>
                </div>

                {/* Detail Groups */}
                <div className="grid grid-cols-1 gap-6">
                  <DetailItem
                    icon={<FileText className="w-5 h-5" />}
                    label={interpolate(t.dashboard.account.invoices.type)}
                    value={selectedInvoice.source === 'billing' ? 'Plan Subscription' : 'Wallet Transaction'}
                  />
                  <DetailItem
                    icon={<ArrowRight className="w-5 h-5" />}
                    label={interpolate(t.dashboard.account.invoices.source)}
                    value={selectedInvoice.source === 'billing' ? 'System Billing' : 'External Top-up'}
                  />
                  <DetailItem
                    icon={<Hash className="w-5 h-5" />}
                    label={interpolate(t.dashboard.account.invoices.reference)}
                    value={selectedInvoice.reference}
                  />
                  <DetailItem
                    icon={<Calendar className="w-5 h-5" />}
                    label={interpolate(t.dashboard.account.invoices.date)}
                    value={new Date(selectedInvoice.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  />
                  <DetailItem
                    icon={<CreditCard className="w-5 h-5" />}
                    label={interpolate(t.dashboard.account.invoices.method)}
                    value={selectedInvoice.method}
                  />
                  <DetailItem
                    icon={<UserIcon className="w-5 h-5" />}
                    label="Account"
                    value={user?.email || 'N/A'}
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <button
                    onClick={() => handlePrint(selectedInvoice)}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5"
                  >
                    <Printer className="w-5 h-5" />
                    {interpolate(t.dashboard.account.invoices.print)}
                  </button>
                  {selectedInvoice.invoice_pdf || selectedInvoice.receipt_url ? (
                    <a
                      href={selectedInvoice.invoice_pdf || selectedInvoice.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-[#22C55E] hover:bg-[#22C55E]/90 text-black font-extrabold rounded-2xl transition-all shadow-xl shadow-[#22C55E]/20"
                    >
                      <Download className="w-5 h-5" />
                      {interpolate(t.dashboard.account.invoices.download)}
                    </a>
                  ) : (
                    <button
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 text-white/20 font-bold rounded-2xl cursor-not-allowed border border-white/5"
                    >
                      <Download className="w-5 h-5" />
                      {interpolate(t.dashboard.account.invoices.download)}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-8 border-t border-white/5 bg-white/5">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-full py-4 text-center text-foreground/40 hover:text-white font-bold transition-colors"
            >
              {interpolate(t.dashboard.account.invoices.close)}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Print Section */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        {printingInvoice && (
          <WalletReceiptDocument
            transaction={{
              id: String(printingInvoice.id),
              amount: printingInvoice.amount,
              currency: printingInvoice.currency,
              date: printingInvoice.date,
              reference_id: printingInvoice.reference,
              description: printingInvoice.title
            }}
            user={{
              name: user?.username || 'Client',
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
        }
      `}</style>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {


  return (
    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all duration-300">
      <div className="p-2.5 bg-white/5 rounded-xl text-foreground/40 group-hover:text-[#22C55E] transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-0.5">{label}</p>
        <p className="text-sm font-bold text-white leading-relaxed">{value}</p>
      </div>
    </div>
  );
}
