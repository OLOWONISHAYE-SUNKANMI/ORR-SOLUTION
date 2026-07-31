"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ChevronDown, Wallet, CreditCard as CreditCardIcon } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { useToastStore } from "@/store/toastStore";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";
import PaymentMethodModal from "@/components/wallet/PaymentMethodModal";
import PaymentCardModal from "@/components/wallet/PaymentCardModal";
import { motion } from "framer-motion";
import WalletDashboard from "./WalletDashboard";
import Skeleton from "@/components/ui/Skeleton";

export default function PlansBillingPage() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'billing'>('wallet');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const {
    pricingPlans,
    paymentMethods,
    billingHistory,
    selectedPlan,
    subscriptionStatus,
    isLoading,
    walletBalance,
    currency,
    fetchPricingPlans,
    fetchPaymentMethods,
    fetchBillingHistory,
    fetchSubscriptionStatus,
    setSelectedPlan
  } = useWalletStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchPricingPlans();
    fetchPaymentMethods();
    fetchBillingHistory();
    fetchSubscriptionStatus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPlanDropdownOpen) {
        setIsPlanDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isPlanDropdownOpen]);

  const pricingParams = {
    currency: t.dashboard.pricing.currency,
    meetingPrice: t.dashboard.pricing.meetingPrice,
    reportPrice: t.dashboard.pricing.reportPrice,
    hrs: t.dashboard.pricing.hrs,
    proData: t.dashboard.pricing.proData
  };

  const getLocalizedPlanInfo = (plan: any) => {
    // Determine which localization key to use based on the plan amount or identifier
    if (plan.amount === 45 || plan.name?.toLowerCase().includes('meeting')) {
      return {
        name: interpolate(t.dashboard.pricing.meetings),
        description: interpolate(t.midClientJourney.steps.s1.sub, pricingParams)
      };
    }
    if (plan.amount === 220 || plan.name?.toLowerCase().includes('report')) {
      return {
        name: interpolate(t.dashboard.pricing.reportFee),
        description: interpolate(t.dashboard.pricing.feeDepends)
      };
    }
    return { name: plan.name, description: plan.description };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm text-foreground/50 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-[#22C55E] mb-6">{interpolate(t.dashboard.page.wallet.title)}</h1>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-10 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'wallet' ? 'text-[#22C55E]' : 'text-gray-400 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2">
              <Wallet size={18} />
              {interpolate(t.dashboard.account.wallet.title)}
            </div>
            {activeTab === 'wallet' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-[#22C55E]" />}
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'billing' ? 'text-[#22C55E]' : 'text-gray-400 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2">
              <CreditCardIcon size={18} />
              {interpolate(t.dashboard.billing.title)}
            </div>
            {activeTab === 'billing' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-[#22C55E]" />}
          </button>
        </div>

        {activeTab === 'wallet' ? (
          <WalletDashboard />
        ) : (
          <>
            {/* Two Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Existing Plans and Payment Methods content... */}

              <div className="bg-card border border-[var(--color-border)] rounded-xl p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton width={200} height={28} className="mb-2" />
                    <Skeleton width="100%" height={16} />
                    <Skeleton width="75%" height={16} />
                    <div className="flex -space-x-2 my-6">
                      {[...Array(5)].map((_, i) => <Skeleton key={i} variant="circle" width={32} height={32} />)}
                    </div>
                    <Skeleton width={120} height={40} />
                    <Skeleton width="100%" height={48} className="mt-6" />
                  </div>
                ) : (
                  <>
                    {(() => {
                      const localized = selectedPlan ? getLocalizedPlanInfo(selectedPlan) : {
                        name: interpolate(t.dashboard.billing.basicPlan.title),
                        description: interpolate(t.dashboard.billing.basicPlan.desc)
                      };
                      return (
                        <>
                          <h3 className="text-xl font-semibold text-[#22C55E] mb-2">{localized.name}</h3>
                          <p className="text-sm text-gray-300 mb-6">{localized.description}</p>
                        </>
                      );
                    })()}

                    {/* Avatars */}
                    <div className="flex -space-x-2 mb-6">
                      <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-400"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-500"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                    </div>

                    <div className="flex items-end justify-between">
                      {selectedPlan?.amount === 45 ? (
                        <div className="flex flex-col">
                          <p className="text-3xl font-bold text-[#22C55E]">
                            {currency} {Number(selectedPlan?.amount || 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-300">
                            {interpolate(t.dashboard.pricing.perHour)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-3xl font-bold text-[#22C55E]">
                          {currency} {Number(selectedPlan?.amount || 20).toFixed(2)}
                          <span className="text-sm text-gray-300"> {interpolate(t.dashboard.billing.basicPlan.price, { amount: '', period: selectedPlan?.billing_type === 'monthly' ? interpolate(t.dashboard.billing.perMonth) : selectedPlan?.billing_type || interpolate(t.dashboard.billing.perMonth) })}</span>
                        </p>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPlanDropdownOpen(!isPlanDropdownOpen);
                          }}
                          className="text-[#22C55E] text-sm flex items-center gap-1 hover:text-[#22C55E]/80"
                        >
                          {interpolate(t.dashboard.common.edit)} <ChevronDown className="w-4 h-4" />
                        </button>

                        {isPlanDropdownOpen && (
                          <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-10">
                            {pricingPlans.map((plan) => (
                              <button
                                key={plan.id}
                                onClick={() => {
                                  const isReportPlan = plan.amount === 220;
                                  if (!isReportPlan || !subscriptionStatus?.is_subscribed) {
                                    setSelectedPlan(plan);
                                    setIsPlanDropdownOpen(false);
                                  }
                                }}
                                disabled={plan.amount === 220 && subscriptionStatus?.is_subscribed}
                                className={`w-full text-left p-3 hover:bg-[var(--color-input-bg)] first:rounded-t-lg last:rounded-b-lg ${plan.amount === 220 && subscriptionStatus?.is_subscribed ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    {(() => {
                                      const localized = getLocalizedPlanInfo(plan);
                                      if (plan.amount === 45) {
                                        return (
                                          <>
                                            <div className="font-medium text-[#22C55E]">{localized.name}</div>
                                            <div className="text-xs text-gray-400 my-1">{localized.description}</div>
                                            <div className="text-sm text-white font-bold">
                                              {currency}{plan.amount} {interpolate(t.dashboard.pricing.perHour)}
                                            </div>
                                          </>
                                        );
                                      }
                                      return (
                                        <>
                                          <div className="font-medium text-[#22C55E]">{localized.name}</div>
                                          <div className="text-sm text-gray-300">
                                            {currency}{plan.amount}/{plan.billing_type === 'monthly' ? interpolate(t.dashboard.billing.perMonth) : plan.billing_type}
                                          </div>
                                          <div className="text-xs text-gray-400">{localized.description}</div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                  {plan.amount === 220 && subscriptionStatus?.is_subscribed && (
                                    <span className="text-xs bg-[#22C55E] text-black px-2 py-1 rounded">{interpolate(t.dashboard.billing.subscribed)}</span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => {
                          if (!selectedPlan) return;
                          const isReportPlan = (selectedPlan.name?.toLowerCase().includes('report')) || (selectedPlan.amount === 220);
                          if (isReportPlan && subscriptionStatus?.is_subscribed) {
                            addToast('You are already subscribed to the report plan', 'info');
                            return;
                          }
                          if (paymentMethods.length === 0) {
                            addToast('Please add a payment method first', 'error');
                            return;
                          }
                          setIsCardModalOpen(true);
                        }}
                        disabled={(((selectedPlan?.name?.toLowerCase().includes('report')) || (selectedPlan?.amount === 220)) && subscriptionStatus?.is_subscribed) || checkoutLoading}
                        className={`w-full py-3 rounded-lg font-semibold transition-colors ${(((selectedPlan?.name?.toLowerCase().includes('report')) || (selectedPlan?.amount === 220)) && subscriptionStatus?.is_subscribed)
                          ? 'bg-[#1E3A4B] text-black cursor-not-allowed border border-gray-700 opacity-60'
                          : 'bg-[#22C55E] text-black hover:bg-[#22C55E]/90'
                          }`}
                      >
                        {(((selectedPlan?.name?.toLowerCase().includes('report')) || (selectedPlan?.amount === 220)) && subscriptionStatus?.is_subscribed)
                          ? interpolate(t.dashboard.billing.subscribed)
                          : checkoutLoading
                            ? interpolate(t.dashboard.billing.processing)
                            : interpolate(t.dashboard.billing.checkout, { amount: String(selectedPlan?.amount || 20) })
                        }
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Payment Method Card */}
              <div className="bg-card border border-[var(--color-border)] rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#22C55E] mb-1">{interpolate(t.dashboard.pricing.payment)}</h3>
                    <p className="text-sm text-gray-300">{interpolate(t.dashboard.account.personalization.desc)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await fetchPaymentMethods();
                          addToast('Payment methods refreshed', 'success');
                        } catch (error) {
                          addToast('Failed to refresh payment methods', 'error');
                        }
                      }}
                      className="text-[#22C55E] text-sm hover:text-[#22C55E]/80"
                    >
                      🔄 {interpolate(t.dashboard.billing.paymentMethod.refresh)}
                    </button>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-[#22C55E] text-sm hover:text-[#22C55E]/80"
                    >
                      + {interpolate(t.dashboard.billing.paymentMethod.addCard)}
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} width="100%" height={80} />
                    ))}
                  </div>
                ) : paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const getCardIcon = (brand: string) => {
                        switch (brand.toLowerCase()) {
                          case 'visa': return '💳';
                          case 'mastercard': return '💳';
                          case 'amex': return '💳';
                          case 'discover': return '💳';
                          default: return '💳';
                        }
                      };

                      const getCardColor = (brand: string) => {
                        switch (brand.toLowerCase()) {
                          case 'visa': return 'text-blue-600';
                          case 'mastercard': return 'text-red-600';
                          case 'amex': return 'text-green-600';
                          case 'discover': return 'text-orange-600';
                          default: return 'text-black';
                        }
                      };

                      return (
                        <div key={method.id} className="bg-white text-black rounded-lg p-4 flex items-center justify-between shadow">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getCardIcon(method.brand)}</span>
                              <span className={`text-xl font-bold ${getCardColor(method.brand)}`}>{method.brand.toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{interpolate(t.dashboard.billing.paymentMethod.endingIn, { brand: method.brand, digits: method.last4 })}</p>
                              <span className="text-xs text-black">{interpolate(t.dashboard.billing.paymentMethod.expiry, { date: `${method.exp_month.toString().padStart(2, '0')}/${method.exp_year}` })}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#22C55E] text-black font-semibold px-6 py-2 rounded-md text-sm hover:bg-[#22C55E]/90"
                          >
                            {interpolate(t.dashboard.common.edit)}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">{interpolate(t.dashboard.billing.paymentMethod.none)}</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-[#22C55E] text-black font-semibold px-6 py-2 rounded-md text-sm hover:bg-[#22C55E]/90"
                    >
                      {interpolate(t.dashboard.billing.paymentMethod.add)}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-card border border-[var(--color-border)] rounded-xl p-6 mb-20">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#22C55E] mb-1">{interpolate(t.dashboard.billing.history.title)}</h3>
                  <p className="text-sm text-gray-300">{interpolate(t.dashboard.billing.history.desc)}</p>
                </div>
                <button className="bg-[#22C55E] text-black font-semibold px-6 py-2 rounded-md text-sm">{interpolate(t.dashboard.billing.history.downloadAll)}</button>
              </div>

              {/* Billing Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-300 border-b border-[var(--color-border)]">
                      <th className="py-3">{interpolate(t.dashboard.billing.history.table.billing)}</th>
                      <th>{interpolate(t.dashboard.billing.history.table.date)}</th>
                      <th>{interpolate(t.dashboard.billing.history.table.amount)}</th>
                      <th>{interpolate(t.dashboard.billing.history.table.plan)}</th>
                      <th>{interpolate(t.dashboard.billing.history.table.users)}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="border-b border-[#1E3A4B]">
                          <td className="py-4"><Skeleton width={200} height={20} /></td>
                          <td><Skeleton width={100} height={16} /></td>
                          <td><Skeleton width={80} height={16} /></td>
                          <td><Skeleton width={80} height={16} /></td>
                          <td><Skeleton width={40} height={16} /></td>
                          <td><Skeleton width={100} height={36} /></td>
                        </tr>
                      ))
                    ) : billingHistory.length > 0 ? (
                      billingHistory.map((bill) => (
                        <tr key={bill.id} className="border-b border-[var(--color-border)] text-foreground text-nowrap">
                          <td className="py-4 flex items-center gap-3">
                            <div className={`w-4 h-4 border rounded-sm ${bill.status.toLowerCase() === 'paid'
                              ? 'border-[#22C55E] bg-[#22C55E]'
                              : 'border-yellow-500 bg-yellow-500'
                              }`}></div>
                            <span className="text-[#22C55E]">{bill.billing_title}</span>
                            <span className="text-gray-400">{bill.status.toLowerCase() === 'paid' ? interpolate(t.dashboard.billing.history.item.paid) : interpolate(t.dashboard.billing.history.item.pending)}</span>
                          </td>
                          <td>
                            <div>{new Date(bill.transaction_date).toLocaleDateString()}</div>
                            <div className="text-[10px] text-gray-500">{new Date(bill.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td>{bill.currency} {Number(Math.abs(parseFloat(bill.amount))).toFixed(2)}</td>
                          <td>{bill.plan}</td>
                          <td>{interpolate(t.dashboard.billing.history.item.users, { count: String(bill.users) })}</td>
                          <td>
                            {bill.hosted_invoice_url && (
                              <a
                                href={bill.hosted_invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#22C55E] text-black font-semibold px-4 py-2 rounded-md text-sm hover:bg-[#22C55E]/90"
                              >
                                Download
                              </a>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          {interpolate(t.dashboard.billing.history.noHistory)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <PaymentMethodModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchPaymentMethods();
        }}
        mode="add"
      />

      <PaymentCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        paymentMethods={paymentMethods}
        isLoading={checkoutLoading}
        walletBalance={walletBalance}
        currency={currency}
        onSelectCard={async (paymentMethodId) => {
          if (!selectedPlan) return;

          setCheckoutLoading(true);
          try {
            if (paymentMethodId === 'wallet') {
              const { settleInvoiceWithWallet, fetchWalletBalance } = useWalletStore.getState();
              // Use settleInvoiceWithWallet which calls /wallet/pay-invoice/
              const success = await settleInvoiceWithWallet(String(selectedPlan.id), selectedPlan.amount);
              if (success) {
                await Promise.all([
                  fetchSubscriptionStatus(),
                  fetchWalletBalance(),
                  fetchBillingHistory()
                ]);
                addToast('Plan activated using wallet balance!', 'success');
              }
            } else {
              const { createCheckoutSession } = useWalletStore.getState();
              const checkoutUrl = await createCheckoutSession(
                selectedPlan.stripe_price_id,
                paymentMethodId
              );

              if (checkoutUrl) {
                window.location.href = checkoutUrl;
              } else {
                await fetchSubscriptionStatus();
              }
            }
          } catch (error) {
            console.error('Checkout error:', error);
          } finally {
            setCheckoutLoading(false);
            setIsCardModalOpen(false);
          }
        }}
      />
    </div>
  );
}