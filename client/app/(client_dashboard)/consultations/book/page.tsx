"use client";
import { Loader2 } from "lucide-react";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMeetingStore } from "@/store/meetingStore";
import { useToastStore } from "@/store/toastStore";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";

interface EventType {
  uri: string;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  status: string;
  scheduling_url: string;
}

export default function MeetingRequestPage() {
  const { t, language: currentLang } = useLanguage();

  const meetingTypes = [
    { id: "first_meeting", label: interpolate(t.dashboard.consultations.types.first_meeting) },
    { id: "discovery", label: interpolate(t.dashboard.consultations.types.discovery) },
    { id: "follow_up", label: interpolate(t.dashboard.consultations.types.follow_up) },
    { id: "report_review", label: interpolate(t.dashboard.consultations.types.report_review) },
  ];

  const meetingOverviews = t.dashboard.consultations.typeDetails;

  const [selectedType, setSelectedType] = useState<keyof typeof meetingOverviews>("discovery");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [agenda, setAgenda] = useState(meetingOverviews["discovery"].agenda);
  const [basicContext, setBasicContext] = useState("");
  const [goals, setGoals] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [meetingSlots, setMeetingSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createMeeting, isLoading: storeIsLoading } = useMeetingStore();
  const { addToast } = useToastStore();
  const router = useRouter();

  useEffect(() => {
    setAgenda(meetingOverviews[selectedType].agenda);
  }, [selectedType, currentLang]);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  useEffect(() => {
    if (eventTypes.length > 0) {
      fetchMeetingSlots();
    }
  }, [eventTypes]);

  const fetchEventTypes = async () => {
    try {
      const response = await axios.get('/event-type/');
      setEventTypes(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch event types:', error);
    }
  };

  const fetchMeetingSlots = async () => {
    setLoadingSlots(true);
    try {
      const eventTypeUri = eventTypes.length > 0 ? encodeURIComponent(eventTypes[0].uri) : 'google-meet';
      const response = await axios.get(`/meeting-slots/?event_type_uri=${eventTypeUri}`);

      const slots = response.data?.data?.collection || response.data?.collection || response.data || [];
      setMeetingSlots(Array.isArray(slots) ? slots : []);
    } catch (error) {
      console.error('Failed to fetch meeting slots:', error);
      setMeetingSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const getAvailableDates = () => {
    const dates = new Set<string>();
    if (meetingSlots.length > 0) {
      meetingSlots.forEach(slot => {
        if (slot.status === 'available') {
          const date = new Date(slot.start_time).toDateString();
          dates.add(date);
        }
      });
    }
    return Array.from(dates);
  };

  const getTimeSlotsForDate = (date: Date) => {
    const dateString = date.toDateString();
    const existingSlots = meetingSlots.filter(slot => {
      const slotDate = new Date(slot.start_time).toDateString();
      return slotDate === dateString && slot.status === 'available';
    });

    // If no slots found (or Calendly down), generate manual hourly slots for Google Meet
    if (existingSlots.length === 0) {
      const slots = [];
      const now = new Date();
      const targetDate = new Date(date);

      for (let hour = 9; hour <= 17; hour++) {
        const slotDate = new Date(targetDate);
        slotDate.setHours(hour, 0, 0, 0);

        if (slotDate > now) {
          slots.push({
            start_time: slotDate.toISOString(),
            end_time: new Date(slotDate.getTime() + 60 * 60 * 1000).toISOString(),
            status: 'available',
            scheduling_url: 'https://meet.google.com/google-meet'
          });
        }
      }
      return slots;
    }
    return existingSlots;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(currentLang === 'it' ? 'it-IT' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString(currentLang === 'it' ? 'it-IT' : 'en-US', { month: 'long', year: 'numeric' });
  };

  const formatSelectedDate = (date: Date | null) => {
    if (!date) return interpolate(t.dashboard.consultations.book.selectDate);
    return date.toLocaleDateString(currentLang === 'it' ? 'it-IT' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleSubmit = async () => {
    if (!selectedTimeSlot || !agenda.trim() || !basicContext.trim() || !goals.trim() || !painPoints.trim()) {
      addToast('Please fill all required fields and select a time slot', 'error');
      return;
    }

    setIsSubmitting(true);

    const baseMeetingData = {
      meeting_type: selectedType as 'discovery' | 'first_meeting' | 'follow_up' | 'report_review',
      requested_datetime: selectedTimeSlot.start_time,
      agenda: agenda.trim(),
      scheduling_url: eventTypes[0]?.uri || selectedTimeSlot.scheduling_url,
    };

    try {
      const response = await axios.post('/create-meeting/', baseMeetingData);

      if (response.data?.success || response.status === 200 || response.status === 201) {
        const meetingId = response.data?.data?.meeting_id ||
          response.data?.meeting_id ||
          response.data?.data?.id ||
          response.data?.id ||
          response.data?.meeting?.id;

        if (meetingId) {
          try {
            await axios.patch(`/meeting-preform/${meetingId}`, {
              basic_context: basicContext.trim(),
              goals: goals.trim(),
              pain_points: painPoints.trim(),
            });
          } catch (patchErr) {
            console.error('Error submitting pre-meeting data:', patchErr);
          }
        }

        const realMeetingLink = response.data?.redirect_url || response.data?.data?.redirect_url || selectedTimeSlot.scheduling_url;
        addToast('Meeting created successfully! Redirecting to Google Meet...', 'success');

        // Clear form fields
        setSelectedType("discovery");
        setSelectedDate(null);
        setSelectedTimeSlot(null);
        setAgenda(meetingOverviews["discovery"].agenda);
        setBasicContext("");
        setGoals("");
        setPainPoints("");

        // Open the REAL Google Meet link in new tab
        setTimeout(() => {
          window.open(realMeetingLink, '_blank');
        }, 1500);
      } else {
        const errorMessage = response.data?.message || 'Failed to create meeting. Please try again.';
        addToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create meeting. Please try again.';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen w-full bg-background text-foreground px-4 py-8 md:px-10">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-xl font-semibold text-lemon">
          {interpolate(t.dashboard.consultations.book.title)}
        </h1>

        {/* Search Box */}
        {/* <div className="flex items-center bg-card px-5 py-2 rounded-full w-[320px] gap-3 border border-secondary">
          <input
            type="text"
            placeholder={interpolate(t.dashboard.common.search)}
            className="bg-transparent outline-none text-sm w-full"
          />
          <svg
            className="w-4 h-4 text-foreground opacity-70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div> */}
      </div>

      {/* MAIN CARD */}
      <div className="max-w-6xl mx-auto bg-card rounded-3xl px-6 py-10 shadow-xl border border-secondary">

        {/* SECTION TITLE */}
        <p className="text-sm opacity-80 mb-2">{interpolate(t.dashboard.consultations.book.subtitle)}</p>

        <p className="text-lg font-semibold text-lemon">
          {interpolate(t.dashboard.consultations.book.chooseType)}
        </p>

        {/* MEETING TYPE STEPS */}
        <div className="flex items-center gap-2 sm:gap-4 mt-6 flex-wrap">

          {meetingTypes.map((type, idx) => (
            <div key={idx} className="flex items-center gap-4">

              <button
                onClick={() => {
                  setSelectedType(type.id as keyof typeof meetingOverviews);
                  setAgenda(meetingOverviews[type.id as keyof typeof meetingOverviews].agenda);
                }}
                className={`px-3 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all
                  ${selectedType === type.id
                    ? "bg-lemon text-background"
                    : "bg-secondary text-foreground"
                  }
                `}
              >
                {type.label}
              </button>

              {idx !== meetingTypes.length - 1 && (
                <div className="relative flex items-center">
                  <div className="w-12 h-[2px] bg-lemon"></div>
                  <div className="w-3 h-3 rounded-full bg-lemon absolute left-1/2 -translate-x-1/2"></div>
                </div>
              )}

            </div>
          ))}

        </div>

        {/* MEETING OVERVIEW */}
        <div className="mt-8 p-6 bg-secondary/30 rounded-xl border border-secondary">
          <h3 className="text-lg font-semibold text-lemon mb-3">{meetingTypes.find(t => t.id === selectedType)?.label} {interpolate(t.dashboard.consultations.book.overview)}</h3>
          <p className="text-foreground opacity-80 leading-relaxed">
            {meetingOverviews[selectedType].overview}
          </p>
        </div>

        {/* DATE + TIME SECTION */}
        <div className="mt-10 mb-6 flex flex-col items-center">
          <p className="text-xl font-bold text-white">
            {interpolate(t.dashboard.consultations.book.dateTime)}
          </p>
          <div className="h-1 w-12 bg-primary rounded-full mt-2" />
        </div>

        <div className="w-full bg-white/5 p-8 rounded-3xl flex flex-col md:flex-row gap-8 justify-center border border-white/10 backdrop-blur-sm">

          {/* CALENDAR */}
          <div className="w-full lg:w-1/2">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-primary hover:text-white transition-all border border-white/10"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-center">
                <h3 className="text-lg font-bold text-white">{formatMonthYear(currentMonth)}</h3>
                <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold">Select Date</p>
              </div>

              <button
                onClick={() => navigateMonth('next')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-primary hover:text-white transition-all border border-white/10"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-3 text-center text-sm">
              {getDaysInMonth(currentMonth).map((date, index) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = date ? date < today : false;
                const isSelected = isDateSelected(date);
                const isToday = date && date.toDateString() === today.toDateString();
                const hasPrefetchedSlots = date && getAvailableDates().includes(date.toDateString());

                return (
                  <button
                    key={index}
                    onClick={() => date && !isPast && setSelectedDate(date)}
                    disabled={!date || isPast}
                    className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all relative group
                      ${!date
                        ? "invisible"
                        : isPast
                          ? "text-white/20 cursor-not-allowed"
                          : isSelected
                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                            : "bg-white/5 text-white hover:bg-white/10 border border-white/5"
                      }
                    `}
                  >
                    {date?.getDate()}
                    {isToday && !isSelected && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                    {(hasPrefetchedSlots || !isPast) && !isSelected && (
                      <div className="absolute bottom-1 w-1 h-1 bg-primary/40 rounded-full group-hover:bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TIME SELECTION */}
          <div className="w-full md:w-1/2 pl-0 md:pl-8 border-t md:border-t-0 md:border-l border-white/10 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white">{formatSelectedDate(selectedDate)}</h3>
              <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold">Select Time</p>
            </div>

            {loadingSlots ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
                <p className="text-xs text-gray-400">Fetching available slots...</p>
              </div>
            ) : selectedDate ? (
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {getTimeSlotsForDate(selectedDate).map((slot) => {
                  const isSelected = selectedTimeSlot?.start_time === slot.start_time;
                  return (
                    <button
                      key={slot.start_time}
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`px-6 py-4 rounded-xl text-left transition-all border group
                        ${isSelected
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                          {formatTime(slot.start_time)}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${isSelected ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                          60 MIN
                        </span>
                      </div>
                    </button>
                  );
                })}
                {getTimeSlotsForDate(selectedDate).length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-2">
                      <ChevronRight size={24} />
                    </div>
                    <p className="text-sm text-gray-400">{interpolate(t.dashboard.consultations.book.noSlots)}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-sm text-gray-500 max-w-[200px]">
                  {interpolate(t.dashboard.consultations.book.selectToSeeSlots)}
                </p>
              </div>
            )}
          </div>
        </div>


        {/* MEETING AGENDA */}
        <p className="text-center text-base sm:text-lg font-semibold mt-8 sm:mt-10 mb-3">{interpolate(t.dashboard.consultations.book.agenda)}</p>
        <p className="text-center text-sm opacity-70 mb-4">{interpolate(t.dashboard.consultations.book.agendaDesc)}</p>

        <textarea
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          placeholder={interpolate(t.dashboard.consultations.book.agenda)}
          className="w-full h-40 bg-secondary rounded-xl p-4 outline-none text-sm text-foreground placeholder-foreground/50 whitespace-pre-line"
        />

        {/* BASIC CONTEXT */}
        <p className="text-center text-base sm:text-lg font-semibold mt-8 mb-3">{interpolate(t.dashboard.consultations.book.context)}</p>
        <p className="text-center text-sm opacity-70 mb-4">{interpolate(t.dashboard.consultations.book.contextDesc)}</p>

        <textarea
          value={basicContext}
          onChange={(e) => setBasicContext(e.target.value)}
          placeholder={interpolate(t.dashboard.consultations.book.contextDesc)}
          className="w-full h-32 bg-secondary rounded-xl p-4 outline-none text-sm text-foreground placeholder-foreground/50"
        />

        {/* GOALS */}
        <p className="text-center text-base sm:text-lg font-semibold mt-8 mb-3">{interpolate(t.dashboard.consultations.book.goals)}</p>
        <p className="text-center text-sm opacity-70 mb-4">{interpolate(t.dashboard.consultations.book.goalsDesc)}</p>

        <textarea
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder={interpolate(t.dashboard.consultations.book.goalsDesc)}
          className="w-full h-32 bg-secondary rounded-xl p-4 outline-none text-sm text-foreground placeholder-foreground/50"
        />

        {/* PAIN POINTS */}
        <p className="text-center text-base sm:text-lg font-semibold mt-8 mb-3">{interpolate(t.dashboard.consultations.book.painPoints)}</p>
        <p className="text-center text-sm opacity-70 mb-4">{interpolate(t.dashboard.consultations.book.painPointsDesc)}</p>

        <textarea
          value={painPoints}
          onChange={(e) => setPainPoints(e.target.value)}
          placeholder={interpolate(t.dashboard.consultations.book.painPointsDesc)}
          className="w-full h-32 bg-secondary rounded-xl p-4 outline-none text-sm text-foreground placeholder-foreground/50"
        />

        {/* SUBMIT BUTTON */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedTimeSlot}
            className=" cursor-pointer px-10 py-2 bg-lemon text-background rounded-full font-semibold text-sm disabled:opacity-50"
          >
            {isSubmitting ? interpolate(t.dashboard.consultations.book.submitting) : interpolate(t.dashboard.consultations.book.submit)}
          </button>
        </div>

      </div>
    </div>
  );
}
