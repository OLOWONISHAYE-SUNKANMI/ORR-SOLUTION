"use client";
import clsx from 'clsx';

import React, { useEffect, useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip } from 'recharts';
import { Search, Bell, Calendar, Clock, Headphones, Wallet, TrendingUp, Users, MousePointer, DollarSign, Package, FileText, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMeetingStore } from '@/store/meetingStore';
import { useBillingStore } from '@/store/billingStore';
import { useDocumentStore } from '@/store/documentStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useWalletStore } from '@/store/walletStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { useLanguage } from '@/app/components/LanguageProvider';
import Skeleton from '@/components/ui/Skeleton';
import { DashboardSkeleton } from '@/components/ui/SkeletonPresets';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  loading?: boolean;
  change?: string;
  trend?: 'up' | 'down';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, loading, change, trend, className }) => {
  return (
    <div className={clsx(
      "bg-card backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {change && (
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">{title}</h3>
      {loading ? (
        <Skeleton width={64} height={32} />
      ) : (
        <p className="text-2xl font-black text-white">{value}</p>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { t, interpolate } = useLanguage();
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchMyMeetings, getUpcomingMeetings, meetings, isLoading } = useMeetingStore();
  const { fetchBillingHistory, billingHistory, isLoading: billingLoading } = useBillingStore();
  const { fetchDocuments, documents, isLoading: docsLoading } = useDocumentStore();
  const { fetchNotifications, notifications } = useNotificationStore();
  const {
    walletBalance,
    currency,
    fetchWalletBalance,
    billingHistory: walletBillingHistory,
    fetchBillingHistory: fetchWalletBillingHistory,
    transactions,
    fetchTransactions,
    getDisplayBalance,
    isLoading: walletLoadingStore
  } = useWalletStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMyMeetings();
    fetchBillingHistory();
    fetchDocuments();
    fetchNotifications();
    fetchWalletBalance();
    fetchWalletBillingHistory();
    fetchTransactions();
  }, [fetchMyMeetings, fetchBillingHistory, fetchDocuments, fetchNotifications, fetchWalletBalance, fetchWalletBillingHistory, fetchTransactions]);

  const upcomingMeetings = getUpcomingMeetings();
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.getDate().toString(),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };

  const formatMeetingType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };


  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="min-h-full p-4 md:p-6 bg-background">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{interpolate(t.dashboard.page.title)}</h1>
            <p className="text-foreground opacity-60 mt-1">{interpolate(t.dashboard.page.welcomeBack)}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-3 rounded-lg bg-card border border-secondary hover:bg-secondary transition-colors"
              >
                <Bell className="w-5 h-5 text-foreground" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-primary rounded-full text-[10px] font-bold text-black px-1">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {notifOpen && (
                <div className="absolute right-0 top-14 w-96 max-h-[480px] bg-card border border-secondary rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-secondary">
                    <h4 className="font-semibold text-foreground text-sm">{interpolate(t.dashboard.page.notifications)}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setNotifOpen(false); router.push('/updates'); }}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        {interpolate(t.dashboard.page.viewAll)}
                      </button>
                      <button onClick={() => setNotifOpen(false)} className="text-foreground opacity-60 hover:opacity-100">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-10 text-foreground opacity-50 text-sm">{interpolate(t.dashboard.page.noNotifications)}</div>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-secondary/50 hover:bg-secondary/20 transition-colors cursor-pointer ${!n.is_read ? 'bg-primary/5' : ''}`}
                          onClick={() => {
                            if (!n.is_read) {
                              useNotificationStore.getState().markAsRead(n.id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            {!n.is_read && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>}
                            <div className={`flex-1 ${n.is_read ? 'ml-4' : ''}`}>
                              <p className="text-sm font-medium text-foreground leading-tight">{n.title}</p>
                              <p className="text-xs text-foreground opacity-60 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-foreground opacity-40 mt-1">
                                {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="w-6 h-6 text-white" />}
            title={interpolate(t.dashboard.page.stats.totalMeetings)}
            value={String(Array.isArray(meetings) ? meetings.length : 0)}
            loading={isLoading}
          />
          <StatCard
            icon={<MousePointer className=" w-6 h-6 text-white" />}
            title={interpolate(t.dashboard.page.stats.upcomingMeetings)}
            value={String(upcomingMeetings.length)}
            loading={isLoading}
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-white" />}
            title={interpolate(t.dashboard.page.stats.totalInvoices)}
            value={String(Math.max(
              Array.isArray(billingHistory) ? billingHistory.length : 0,
              (Array.isArray(walletBillingHistory) ? walletBillingHistory.length : 0) + (Array.isArray(transactions) ? transactions.length : 0)
            ))}
            loading={billingLoading || walletLoadingStore}
          />
          <StatCard
            icon={<FileText className="w-6 h-6 text-white" />}
            title={interpolate(t.dashboard.page.stats.documents)}
            value={String(Array.isArray(documents) ? documents.length : 0)}
            loading={docsLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="bg-card border border-secondary rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl">
                  👋
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{interpolate(t.dashboard.page.welcome.morning, { firstname: user?.first_name ? ` ${user.first_name}` : '' })}</h2>
                  <p className="text-foreground opacity-60">{interpolate(t.dashboard.page.welcome.goals)}</p>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-card border border-secondary rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">{interpolate(t.dashboard.page.overview.title)}</h3>
                <div className="flex items-center gap-2 text-sm text-foreground opacity-60">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>{interpolate(t.dashboard.page.overview.pastMonths)}</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(() => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const now = new Date();
                    const chartData = [];
                    for (let i = 5; i >= 0; i--) {
                      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                      const monthIdx = d.getMonth();
                      const year = d.getFullYear();
                      const count = Array.isArray(meetings) ? meetings.filter(m => {
                        const md = new Date(m.requested_datetime);
                        return md.getMonth() === monthIdx && md.getFullYear() === year;
                      }).length : 0;
                      chartData.push({ month: months[monthIdx], meetings: count });
                    }
                    return chartData;
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-secondary)" />
                    <XAxis dataKey="month" stroke="var(--color-foreground)" opacity={0.6} />
                    <YAxis stroke="var(--color-foreground)" opacity={0.6} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-secondary)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar
                      dataKey="meetings"
                      fill="var(--color-primary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial & Activity Trends */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Insights & Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transaction Trends */}
                <div className="bg-card border border-secondary rounded-xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Transaction Trends</h3>
                      <p className="text-xs text-foreground opacity-60">Volume of financial activities</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={(() => {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const now = new Date();
                        const chartData = [];
                        for (let i = 5; i >= 0; i--) {
                          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                          const monthIdx = d.getMonth();
                          const year = d.getFullYear();
                          const amount = Array.isArray(transactions) ? transactions
                            .filter(tx => {
                              const txd = new Date(tx.date);
                              return txd.getMonth() === monthIdx && txd.getFullYear() === year;
                            })
                            .reduce((sum, tx) => sum + tx.amount, 0) : 0;
                          chartData.push({ month: months[monthIdx], amount });
                        }
                        return chartData;
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-secondary)" vertical={false} />
                        <XAxis dataKey="month" stroke="var(--color-foreground)" opacity={0.6} fontSize={10} />
                        <YAxis stroke="var(--color-foreground)" opacity={0.6} fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-secondary)',
                            borderRadius: '8px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="var(--color-primary)"
                          strokeWidth={3}
                          dot={{ fill: 'var(--color-primary)', r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Activity Frequency */}
                <div className="bg-card border border-secondary rounded-xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Activity Frequency</h3>
                      <p className="text-xs text-foreground opacity-60">Daily engagement levels</p>
                    </div>
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(() => {
                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        const now = new Date();
                        const chartData = [];
                        for (let i = 6; i >= 0; i--) {
                          const d = new Date(now);
                          d.setDate(now.getDate() - i);
                          const dayName = days[d.getDay()];
                          
                          // Count notifications for this day
                          const dayStart = new Date(d.setHours(0, 0, 0, 0));
                          const dayEnd = new Date(d.setHours(23, 59, 59, 999));
                          
                          const actualCount = Array.isArray(notifications) ? notifications.filter(n => {
                            const nd = new Date(n.created_at);
                            return nd >= dayStart && nd <= dayEnd;
                          }).length : 0;

                          // If no notifications, use a small mock number to keep the chart "alive" in dev
                          const activityCount = actualCount > 0 ? actualCount : (process.env.NODE_ENV === 'development' ? Math.floor(Math.random() * 5) + 1 : 0);
                          
                          chartData.push({ day: dayName, activities: activityCount });
                        }
                        return chartData;
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-secondary)" vertical={false} />
                        <XAxis dataKey="day" stroke="var(--color-foreground)" opacity={0.6} fontSize={10} />
                        <YAxis stroke="var(--color-foreground)" opacity={0.6} fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-secondary)',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar
                          dataKey="activities"
                          fill="var(--color-primary)"
                          opacity={0.8}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Card */}
            <div className="bg-card border border-secondary rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-foreground">{interpolate(t.dashboard.page.wallet.title)}</h4>
              </div>
              <p className="text-sm text-foreground opacity-60 mb-2">{interpolate(t.dashboard.page.wallet.status)}</p>
              {walletLoadingStore ? (
                <Skeleton width={100} height={40} className="mb-4" />
              ) : (
                <p className="text-2xl font-bold mb-4 text-primary">
                  {currency === 'EUR' ? '€' : '$'} {getDisplayBalance().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
              <button
                onClick={() => router.push('/account/wallet')}
                className="w-full py-3 rounded-lg bg-primary text-black font-medium hover:bg-primary/90 transition-colors"
              >
                {interpolate(t.dashboard.page.wallet.view)}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-secondary rounded-xl p-4 md:p-6">
              <h5 className="font-semibold text-foreground mb-4">{interpolate(t.dashboard.page.quickActions.title)}</h5>
              <div className="space-y-3">
                {[
                  { icon: <Calendar className="w-5 h-5" />, title: interpolate(t.dashboard.page.quickActions.schedule.title), desc: interpolate(t.dashboard.page.quickActions.schedule.desc), path: "/meeting-request" },
                  { icon: <Clock className="w-5 h-5" />, title: interpolate(t.dashboard.page.quickActions.scheduleView.title), desc: interpolate(t.dashboard.page.quickActions.scheduleView.desc), path: "/scheduling" },
                  { icon: <Headphones className="w-5 h-5" />, title: interpolate(t.dashboard.page.quickActions.support.title), desc: interpolate(t.dashboard.page.quickActions.support.desc), path: "/support" },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(action.path)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-primary/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      {action.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">{action.title}</p>
                      <p className="text-xs text-foreground opacity-60">{action.desc}</p>
                    </div>
                    <div className="text-primary group-hover:translate-x-1 transition-transform">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming Consultations */}
            <div className="bg-card border border-secondary rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h6 className="font-semibold text-foreground">{interpolate(t.dashboard.page.upcomingConsultations.title)}</h6>
                {upcomingMeetings.length > 0 && (
                  <button
                    onClick={() => router.push('/consultations/upcoming-consultations')}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {interpolate(t.dashboard.page.viewAll)}
                  </button>
                )}
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : upcomingMeetings.length > 0 ? (
                  upcomingMeetings.map((meeting) => {
                    const { date, day, time } = formatMeetingDate(meeting.requested_datetime);
                    return (
                      <div key={meeting.id} className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                        onClick={() => router.push('/consultations/upcoming-consultations')}>
                        <div className="text-center min-w-[45px] flex-shrink-0">
                          <div className="text-lg font-bold text-primary">{date}</div>
                          <div className="text-xs text-foreground opacity-60">{day}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{formatMeetingType(meeting.meeting_type)}</p>
                          <p className="text-xs text-foreground opacity-60">{time}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-primary capitalize">{meeting.status}</p>
                            {meeting.meeting_link && (
                              meeting.meeting_link === 'pending-google-workspace' ? (
                                <span className="inline-flex items-center px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-medium italic">
                                  Preparing...
                                </span>
                              ) : (
                                <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center px-2 py-1 bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded text-[10px] font-medium transition-colors">
                                  Join Meeting
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-foreground opacity-30 mx-auto mb-3" />
                    <p className="text-foreground opacity-60 text-sm">{interpolate(t.dashboard.page.upcomingConsultations.noMeetings)}</p>
                    <button
                      onClick={() => router.push('/meeting-request')}
                      className="text-xs text-primary hover:text-primary/80 transition-colors mt-2"
                    >
                      {interpolate(t.dashboard.page.upcomingConsultations.scheduleFirst)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
