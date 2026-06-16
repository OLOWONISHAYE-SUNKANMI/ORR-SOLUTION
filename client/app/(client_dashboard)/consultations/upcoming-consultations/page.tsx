"use client";

import React, { useEffect, useState } from "react";
import GoogleCalendarView from "@/app/components/ui/GoogleCalendarView";
import { format } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { CalendarCog, Search } from "lucide-react";
import { useMeetingStore } from "@/store/meetingStore";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";

type EventItem = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: { color: string; meetingLink?: string };
};

function EventSidebar({ items, isLoading }: { items: EventItem[]; isLoading: boolean }) {
  const { t, language } = useLanguage();
  return (
    <div className="h-full">
      <div className="bg-card rounded-xl p-4 h-full flex flex-col border border-white/5">
        <div className="flex-shrink-0 mb-4">
          <h3 className="text-xl text-lemon font-semibold mb-1">{interpolate(t.dashboard.consultations.upcoming.detailsDay)}</h3>
          <p className="text-sm text-foreground/70">{interpolate(t.dashboard.consultations.upcoming.dontMiss)}</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
          {isLoading ? (
            <div className="text-center py-8 text-foreground/70">
              {interpolate(t.dashboard.common.loading)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-foreground/70">
              {interpolate(t.dashboard.consultations.upcoming.noMeetings)}
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-background/40 backdrop-blur-sm rounded-lg p-3 flex gap-3 items-start border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-[10px] text-foreground/50 uppercase tracking-wider mt-1">{interpolate(t.dashboard.consultations.upcoming.onlineMeeting)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-foreground/70">
                    <div className="flex items-center gap-1">
                      <CalendarCog size={12} className="text-primary"/>
                      {format(item.start, "MMM d, yyyy", { locale: language === 'it' ? it : enUS })}
                    </div>
                    <div className="bg-white/5 px-2 py-0.5 rounded">
                      {format(item.start, "HH:mm")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function SchedulingPage() {
  const { t, language } = useLanguage();
  const { meetings, isLoading, fetchMyMeetings, getUpcomingMeetings } = useMeetingStore();
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    fetchMyMeetings();
  }, [fetchMyMeetings]);

  const upcomingMeetings = getUpcomingMeetings();

  // Convert meetings to calendar events
  const events: EventItem[] = upcomingMeetings.map(meeting => {
    const startDate = new Date(meeting.requested_datetime);
    const endDate = new Date(startDate.getTime() + 60 * 60000); // Default 1 hour duration
    
    return {
      id: meeting.id,
      title: `${meeting.meeting_type.replace('_', ' ')} - ${meeting.agenda?.substring(0, 30) || 'Meeting'}...`,
      start: startDate,
      end: endDate,
      resource: { color: "#0ec277", meetingLink: meeting.meeting_link }
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-10 lg:p-14 star">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{interpolate(t.dashboard.consultations.upcoming.title)}</h1>
            <p className="text-gray-400 text-sm">Your Google Workspace scheduled sessions</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                placeholder={interpolate(t.dashboard.common.search)}
                className="w-full rounded-full py-2.5 pl-10 pr-4 bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <a 
              href={`/consultations/meeting/instant-session`}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
              Quick Meeting
            </a>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:h-[calc(100vh-250px)]">
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 h-full">
            <EventSidebar items={events} isLoading={isLoading} />
          </aside>

          <main className="flex-1 h-full min-h-[400px] md:min-h-[600px]">
            <GoogleCalendarView 
              events={events} 
              onSelectEvent={(event: any) => setSelectedEvent(event as EventItem)}
            />
          </main>
        </div>
      </div>

      {/* Floating Join Button if an event is selected */}
      {selectedEvent && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white/10 backdrop-blur-xl border border-primary/30 p-4 rounded-2xl shadow-2xl flex items-center gap-6 pr-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {selectedEvent.title.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{selectedEvent.title}</h4>
              <p className="text-xs text-gray-400">Starting at {format(selectedEvent.start, "HH:mm")}</p>
            </div>
            {selectedEvent.resource?.meetingLink && selectedEvent.resource.meetingLink !== 'pending-google-workspace' ? (
              <a 
                href={selectedEvent.resource.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20"
              >
                Join Meet
              </a>
            ) : (
              <a 
                href={`/consultations/meeting/${selectedEvent.id}`}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20"
              >
                Join Meet
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

