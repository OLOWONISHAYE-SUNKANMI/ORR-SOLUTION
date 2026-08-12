"use client";

import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";
import Skeleton from "@/components/ui/Skeleton";
import { SkeletonList } from "@/components/ui/SkeletonPresets";

export default function NotificationPage() {
  const { t, language: currentLang } = useLanguage();
  const { notifications, isLoading, fetchNotifications, markAsRead } = useNotificationStore();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      markAsRead(id);
    }
    setExpandedIds(newExpanded);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground font-poppins px-6 md:px-20 pt-10">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="w-[90%] mx-auto mt-6 rounded-[40px] border-[6px] border-secondary bg-card p-10">
          <Skeleton className="h-6 w-48 mb-6" />
          <SkeletonList rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-poppins relative overflow-x-hidden">

      {/* Search bar & header */}
      <div className="w-full flex flex-col items-center pt-10 relative z-10">
        <h1 className="text-[28px] font-semibold text-lemon mr-auto ml-20">
          {interpolate(t.dashboard.notifications.title)}
        </h1>

        <div className="w-[380px] h-[48px] mt-4 bg-card rounded-full px-6 flex items-center border border-secondary">
          <input
            type="text"
            placeholder={interpolate(t.dashboard.common.search)}
            className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-foreground/50"
          />
<Search size={16}/>
        </div>
      </div>

      {/* Main curved container */}
      
      <div
        className="
        w-[90%] mx-auto mt-12
        rounded-[40px]
        border-[6px]
        border-secondary
        bg-card
        backdrop-blur-md
        p-10
        relative
        shadow-[0_0_40px_rgba(0,255,180,0.15)]
        "
      >
        <h2 className="text-[22px] font-semibold text-lemon mb-6">
          {interpolate(t.dashboard.notifications.alertTitle)}
        </h2>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="text-center py-8 text-foreground/70">
              {interpolate(t.dashboard.common.loading)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-foreground/70">
              {interpolate(t.dashboard.notifications.noNotifications)}
            </div>
          ) : (
            notifications.map((notification) => {
              const isExpanded = expandedIds.has(notification.id);
              return (
                <div
                  key={notification.id}
                  className={`${notification.is_read ? 'bg-card/50' : 'bg-lemon'} flex flex-col px-5 py-3 rounded-lg shadow-[0_0_12px_theme(colors.lemon/25)] border border-secondary/30`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className={`text-[14px] ${notification.is_read ? 'text-foreground/70' : 'text-foreground'} font-medium`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-foreground/50 mt-1">
                        {new Date(notification.created_at).toLocaleDateString(currentLang === 'it' ? 'it-IT' : 'en-US')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                      <button
                        onClick={() => toggleExpanded(notification.id)}
                        className="cursor-pointer hover:bg-foreground/10 p-1 rounded"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-foreground/20">
                      <p className="text-[13px] text-foreground/80">
                        {notification.message}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
