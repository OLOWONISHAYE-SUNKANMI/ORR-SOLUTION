"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useLanguage, interpolate } from '@/lib/i18n/LanguageContext';
import {
  ArrowLeft,
  Wallet,
  CheckCircle,
  Share2,
  Printer,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInvoiceStore } from '@/store/invoiceStore';
import { useWalletStore } from '@/store/walletStore';
import { useToastStore } from '@/store/toastStore';
import InvoiceDocument from '@/components/billing/InvoiceDocument';
import ReceiptDocument from '@/components/billing/ReceiptDocument';
import Skeleton from '@/components/ui/Skeleton';
import { SkeletonTable } from '@/components/ui/SkeletonPresets';

interface InvoiceDetailClientProps {
  id: string;
}

export default function InvoiceDetailClient({ id }: InvoiceDetailClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { fetchInvoiceById, selectedInvoice: invoice, settings, payWithWallet } = useInvoiceStore();
  const { fetchBillingHistory } = useWalletStore();
  const { addToast } = useToastStore();
  const [isPaying, setIsPaying] = useState(false);
  const [view, setView] = useState<'invoice' | 'receipt'>('invoice');
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) fetchInvoiceById(id);
  }, [id, fetchInvoiceById]);

  useEffect(() => {
    if (invoice?.status === 'paid') {
      setView('receipt');
    }
  }, [invoice?.status]);

  if (!invoice) return (
    <div className="min-h-screen p-4 md:p-8 bg-[#020810]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <Skeleton className="h-5 w-40" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-[#0A1A2F] border border-slate-200 dark:border-white/5 rounded-3xl p-4 md:p-12">
          <div className="space-y-6">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
            <SkeletonTable rows={5} cols={4} />
          </div>
        </div>
      </div>
    </div>
  );

  const handlePayNow = async () => {
    // Check balance first (optional optimization)
    const { walletBalance } = useWalletStore.getState();
    if (walletBalance < invoice.totalAmount) {
      addToast(interpolate(t.dashboard.account.wallet.settlement.insufficientFunds), 'error');
      return;
    }

    if (!confirm(interpolate(t.dashboard.account.wallet.settlement.confirmPayment, { amount: `${invoice.currency} ${interpolate(t.dashboard.pricing.currency)}${invoice.totalAmount}` }))) {
      return;
    }

    setIsPaying(true);
    const success = await payWithWallet(invoice.id);
    if (success) {
      await fetchBillingHistory();
      addToast(interpolate(t.dashboard.account.wallet.settlement.success), 'success');
      setView('receipt');
    }
    setIsPaying(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#020810]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-foreground/60 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Invoices
            </button>

            {invoice.status === 'paid' && (
              <div className="flex bg-white/5 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setView('invoice')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'invoice' ? 'bg-primary text-white shadow-lg' : 'text-foreground/40 hover:text-white'}`}
                >
                  Invoice View
                </button>
                <button
                  onClick={() => setView('receipt')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'receipt' ? 'bg-[#22C55E] text-black shadow-lg' : 'text-foreground/40 hover:text-white'}`}
                >
                  Receipt View
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 font-bold"
            >
              <Printer className="w-4 h-4" /> {view === 'invoice' ? interpolate(t.dashboard.common.print) : interpolate(t.dashboard.account.wallet.transactions.download)}
            </button>
            <button className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10">
              <Share2 className="w-4 h-4" />
            </button>

            {invoice.status !== 'paid' ? (
              <button
                onClick={handlePayNow}
                disabled={isPaying}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-[#22C55E] hover:bg-[#22C55E]/90 text-black rounded-xl font-black transition-all shadow-lg shadow-[#22C55E]/20"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {interpolate(t.dashboard.account.wallet.modals.topUp.processing)}
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" /> {interpolate(t.dashboard.account.wallet.settlement.payWithWallet)}
                  </>
                )}
              </button>
            ) : (
              <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-[#22C55E]/10 text-[#22C55E] rounded-xl font-black border border-[#22C55E]/20">
                <CheckCircle className="w-4 h-4" /> PAID
              </div>
            )}
          </div>
        </div>

        {/* Visualization Area */}
        <div id="printable-document-wrapper" className="bg-slate-50 dark:bg-[#0A1A2F] border border-slate-200 dark:border-white/5 rounded-3xl p-4 md:p-12 shadow-2xl relative overflow-hidden print:overflow-visible print:p-0 print:border-0 print:bg-white print:rounded-none transition-colors duration-300">
          <div id="printable-document" className="print:block">
            {view === 'invoice' ? (
              <InvoiceDocument invoice={invoice} settings={settings} />
            ) : (
              <ReceiptDocument invoice={invoice} settings={settings} />
            )}
          </div>
        </div>

        {/* Mobile Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:hidden">
          <div className="bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Need Assistance?</h3>
            <p className="text-sm text-foreground/60 leading-relaxed text-wrap">
              If you discover any discrepancy in the line items or have questions about tax configurations, please do not hesitate to contact our billing support team.
            </p>
            <button className="text-primary text-sm font-bold hover:underline">Open Support Ticket →</button>
          </div>

          <div className="bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#22C55E]">Feature Unlocked!</h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#22C55E]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-[#22C55E]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white font-bold">Document Vault Access Granted</p>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  This payment has successfully unlocked restricted items in your <span className="text-[#22C55E] font-bold">Document Vault</span>. You can now access professional templates and strategy reports.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/document/reports')}
              className="w-full py-2 bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] text-xs font-bold rounded-lg transition-all"
            >
              Go to Document Vault →
            </button>
          </div>
        </div>
      </div>

      {/* Global CSS for printing */}
      <style jsx global>{`
        @media print {
          /* 1. Hide non-essential UI elements */
          .print\\:hidden, 
          button, 
          header, 
          footer,
          .no-print,
          #dashboard-sidebar {
            display: none !important;
          }

          /* 2. Preserve Visuals (Forces background colors/gradients to print) */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 3. Reset high-level layout containers to allow content flow without clipping */
          html, body {
            background: #020810 !important;
            color: #F5F5F5 !important;
            height: 100% !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          main, 
          div, 
          section {
            overflow: visible !important;
            height: auto !important;
            position: static !important;
            background: transparent !important;
          }

          /* 4. Single Page Fit & Scaling */
          #printable-document {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important; /* Reduced padding for single page fit */
            background: #020810 !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          @page {
            size: A4;
            margin: 0.5cm; /* Small margin for professional look */
          }
        }
      `}</style>
    </div>
  );
}
