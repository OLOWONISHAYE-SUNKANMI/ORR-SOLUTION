"use client";

import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import React from "react";

// This dashboard has no analytics/SEO backend endpoint yet. Rather than ship
// fabricated visitor counts, sales figures, chart series, and team members,
// every data region renders an explicit "not available" state so the page
// never implies data it doesn't have. Wire these regions to a real analytics
// endpoint (e.g. /admin-portal/v1/analytics/) when one is available.

function EmptyPanel({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="p-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-dashed border-white/15 shadow-lg text-center flex flex-col items-center justify-center min-h-[30vh]">
      <Icon className="w-10 h-10 text-white/30 mb-4" />
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-400 max-w-md mx-auto">{body}</p>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">SEO and Analytics</h1>
          <p className="text-gray-400 text-sm">Track your performance metrics and analytics</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col basis-full lg:basis-[70%] gap-6">
            {/* KPI tiles — no analytics source yet, so values render as unavailable. */}
            <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4">
              {["Visitors", "Followers", "Sales"].map((label) => (
                <div
                  key={label}
                  className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl p-6 w-full border border-white/10 shadow-lg"
                >
                  <p className="font-bold text-3xl text-white">&mdash;</p>
                  <p className="text-gray-400 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>

            <EmptyPanel
              icon={BarChart3}
              title="Sales statistics unavailable"
              body="Traffic and sales trends will appear here once an analytics endpoint is connected."
            />

            <EmptyPanel
              icon={BarChart3}
              title="No records to display"
              body="Tracked services and orders will be listed here when analytics data is available."
            />
          </div>

          <div className="basis-full lg:basis-[30%] flex flex-col gap-6">
            <EmptyPanel
              icon={PieChartIcon}
              title="Sales report unavailable"
              body="A breakdown of sales will render here once data is connected."
            />

            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
              <div className="flex items-center justify-center py-6">
                <p className="text-gray-400 text-sm">No team members to show</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-lg">
              <h2 className="text-lg font-semibold text-white text-center mb-4">Assistants</h2>
              <div className="flex items-center justify-center py-6">
                <p className="text-gray-400 text-sm">No assistants assigned</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
