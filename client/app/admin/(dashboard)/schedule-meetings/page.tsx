"use client";

import { useState, useEffect } from "react";
import GoogleCalendarView from "@/app/components/ui/GoogleCalendarView";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MoreVertical } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  clientName: string;
  meetingType: string;
  resource: { color: string };
}

function page() {
  const { meetings, isLoading, fetchAllMeetings } = useAdminStore();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchAllMeetings();
  }, [fetchAllMeetings]);

  // Map backend meetings to Event interface
  const events: Event[] = meetings.map(m => ({
    id: m.id,
    title: `${m.meeting_type.replace('_', ' ')} - ${m.client_name || 'Client'}`,
    start: new Date(m.requested_datetime),
    end: new Date(new Date(m.requested_datetime).getTime() + m.duration_minutes * 60000),
    status: m.status,
    clientName: m.client_name || m.client_email || 'Unknown',
    meetingType: m.meeting_type,
    resource: { 
      color: m.status === 'confirmed' ? '#13BE77' : 
             m.status === 'requested' ? '#3B82F6' : '#EF4444' 
    },
  }));


  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 sm:p-8 flex flex-col gap-6 sm:gap-8 border border-white/10 shadow-2xl">
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-4xl font-bold text-white">
              Meeting Workspace
            </h1>
            <p className="text-gray-400 text-sm mt-2">Manage and track all your Google Workspace interactions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            {/* Left Sidebar - Meeting Requests List */}
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-b from-white/15 to-white/5 p-4 rounded-xl flex flex-col gap-3 border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">Upcoming Events</h3>
                  <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Live</span>
                </div>
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedEvent?.id === event.id
                        ? "bg-primary/20 border border-primary shadow-lg"
                        : "hover:bg-white/15 border border-white/5"
                      }`}
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <CalendarIcon size={12} className="text-primary" />
                        <span>{format(event.start, "MMM d, HH:mm")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Event Details Panel */}
              {selectedEvent && (
                <div className="p-5 bg-white/5 rounded-xl border border-white/10 shadow-lg animate-fade-in">
                  <h3 className="font-semibold text-white text-sm mb-3">Event Details</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Client:</span>
                      <span className="text-white">{selectedEvent.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`px-2 py-0.5 rounded ${selectedEvent.status === 'New' ? 'bg-blue-500/20 text-blue-400' :
                          selectedEvent.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>{selectedEvent.status}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <button className="w-full bg-primary py-2 rounded-lg text-xs font-medium hover:bg-primary/80 transition-colors">Launch Meet</button>
                    <button className="w-full bg-white/5 py-2 rounded-lg text-xs font-medium hover:bg-white/10 border border-white/10 transition-colors">Reschedule</button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Google Calendar View */}
            <div className="h-[800px]">
              <GoogleCalendarView
                events={events}
                onSelectEvent={(event: any) => setSelectedEvent(event as Event)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;

