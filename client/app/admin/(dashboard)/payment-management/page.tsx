"use client";
import { ArrowDown, ArrowUp, DollarSign, Wallet } from "lucide-react";
import { useState } from "react";

// No billing/transactions endpoint is wired into this embedded admin view yet,
// so balances and the transactions table render empty states rather than the
// fabricated figures and transactions they previously hardcoded. Wire to the
// admin billing / wallet-logs / invoicing endpoints when connecting this view.

const navCategories = ["All", "Savings", "Income", "Expenses"];

const balanceCards = [
  { label: "Balances", icon: DollarSign },
  { label: "Savings", icon: Wallet },
  { label: "Incomes", icon: ArrowDown },
  { label: "Expenses", icon: ArrowUp },
];

function page() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-8">
            <h1 className="text-4xl font-bold text-white">
              Transactions History
            </h1>
            <div className="flex items-center justify-between gap-3">
              <div className="text-white bg-primary p-3 rounded-xl">
                Select date range
              </div>
              <div className="flex items-center gap-3">
                <button className="text-white bg-primary p-3 rounded-xl">
                  Export CSV
                </button>
                <button className="text-white bg-primary p-3 rounded-xl">
                  Download Invoices
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              {balanceCards.map(({ label, icon: Icon }) => (
                <div key={label} className="bg-white/10 rounded-lg p-4 w-full">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 w-10 h-10 rounded-full">
                      <Icon className="w-6 h-6 text-primary m-2" />
                    </div>
                    <div>
                      <p>{label}</p>
                      <p className="font-bold text-3xl">&mdash;</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white/10 rounded-lg">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center">
                  {navCategories.map((category, index) => (
                    <div
                      onClick={() => setSelectedCategory(category)}
                      key={index}
                      className={`px-4 py-3 text-lg cursor-pointer ${
                        selectedCategory === category
                          ? "text-primary border-b-2 border-primary font-bold"
                          : ""
                      }`}
                    >
                      {category}
                    </div>
                  ))}
                </div>

                <div className="text-lg">Status: All</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr>
                      <th className="text-left p-3">Ref ID</th>
                      <th className="text-left p-3">Transaction Date</th>
                      <th className="text-left p-3">From</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={7} className="py-10 px-4 text-center text-gray-300 text-sm">
                        No transactions to show yet.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
