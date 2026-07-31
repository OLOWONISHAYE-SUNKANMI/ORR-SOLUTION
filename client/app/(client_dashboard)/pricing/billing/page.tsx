import { Loader2 } from "lucide-react";
"use client";

import React, { useEffect } from "react";
import { useBillingStore } from "@/store/billingStore";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";

export default function PlansBillingPage() {
  const { t, language: currentLang } = useLanguage();
  const { billingHistory, isLoading, fetchBillingHistory } = useBillingStore();

  useEffect(() => {
    fetchBillingHistory();
  }, [fetchBillingHistory]);


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
      <div className="w-full ">
        <div className="flex justify-baseline">

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-[#22C55E] mb-6 text-nowrap">{interpolate(t.dashboard.billing.title)}</h1>

        {/* Search Bar */}
        <div className="w-full flex justify-center mb-10">
          <div className="w-full max-w-xl relative">
            <input
              type="text"
              placeholder={interpolate(t.dashboard.common.search)}
              className="w-full bg-[#071626] border border-[#1E3A4B] rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#22C55E] text-lg">🔍</button>
          </div>
        </div>
              </div>

        {/* Two Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          {/* Basic Plan Card */}
          <div className="bg-card border border-[#1E3A4B] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#22C55E] mb-2">{interpolate(t.dashboard.billing.basicPlan.title)}</h3>
            <p className="text-sm text-gray-300 mb-6">{interpolate(t.dashboard.billing.basicPlan.desc)}</p>

            {/* Avatars */}
            <div className="flex -space-x-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
              <div className="w-8 h-8 rounded-full bg-gray-400"></div>
              <div className="w-8 h-8 rounded-full bg-gray-500"></div>
              <div className="w-8 h-8 rounded-full bg-gray-600"></div>
              <div className="w-8 h-8 rounded-full bg-gray-700"></div>
            </div>

            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-[#22C55E]">{interpolate(t.dashboard.billing.basicPlan.price, { amount: '$20' })}</p>
              <button className="text-[#22C55E] text-sm">{interpolate(t.dashboard.billing.basicPlan.upgrade)} ⌄</button>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-card border border-[#1E3A4B] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#22C55E] mb-4">{interpolate(t.dashboard.billing.paymentMethod.title)}</h3>
            <p className="text-sm text-gray-300 mb-4">{interpolate(t.dashboard.billing.paymentMethod.desc)}</p>

            <div className="bg-white text-black rounded-lg p-4 flex items-center justify-between shadow">
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-blue-600">VISA</span>
                <div>
                  <p className="font-semibold text-sm">{interpolate(t.dashboard.billing.paymentMethod.endingIn, { brand: 'Visa', digits: '6789' })}</p>
                  <span className="text-xs text-black">{interpolate(t.dashboard.billing.paymentMethod.expiry, { date: '01/2023' })}</span>
                </div>
              </div>
              <button className="bg-[#22C55E] text-black font-semibold px-6 py-2 rounded-md text-sm">Edit</button>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-card border border-[#1E3A4B] rounded-xl p-6 mb-20">
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
                <tr className="text-gray-300 border-b border-[#1E3A4B]">
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
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      {interpolate(t.dashboard.billing.history.loading)}
                    </td>
                  </tr>
                ) : billingHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      {interpolate(t.dashboard.billing.history.noHistory)}
                    </td>
                  </tr>
                ) : (
                  (Array.isArray(billingHistory) ? billingHistory : []).map((bill) => (
                    <tr key={bill.id} className="border-b border-[#1E3A4B] text-gray-200">
                      <td className="py-4 flex items-center gap-3">
                        <div className="w-4 h-4 border border-[#22C55E] bg-[#22C55E] rounded-sm"></div>
                        <span className="text-[#22C55E]">{interpolate(t.dashboard.billing.history.item.id, { id: bill.id })}</span>
                        <span className="text-gray-400">{bill.status}</span>
                      </td>

                      <td>{new Date(bill.billing_date).toLocaleDateString(currentLang === 'it' ? 'it-IT' : 'en-US')}</td>
                      <td>{bill.amount}</td>
                      <td>{bill.plan}</td>
                      <td>{interpolate(t.dashboard.billing.history.item.users, { count: bill.users })}</td>

                      <td>
                        <button className="bg-[#22C55E] text-black font-semibold px-4 py-2 rounded-md text-sm">{interpolate(t.dashboard.billing.history.item.download)}</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}