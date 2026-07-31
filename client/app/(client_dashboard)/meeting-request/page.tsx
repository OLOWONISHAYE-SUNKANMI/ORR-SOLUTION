"use client";
import { Loader2 } from "lucide-react";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMeetingStore } from "@/store/meetingStore";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/store/toastStore";
import axios from "@/lib/axios";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";

export default function MeetingRequestPage() {
  const { t, language: currentLang } = useLanguage();
  
  const meetingTypes = [
    { id: "first_meeting", label: interpolate(t.dashboard.consultations.types.first_meeting) },
    { id: "discovery", label: interpolate(t.dashboard.consultations.types.discovery) },
    { id: "follow_up", label: interpolate(t.dashboard.consultations.types.follow_up) },
    { id: "report_review", label: interpolate(t.dashboard.consultations.types.report_review) },
  ];

  const meetingOverviews = t.dashboard.consultations.typeDetails;

  const allTimes = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM"
  ];

  const [selectedType, setSelectedType] = useState<keyof typeof meetingOverviews>("discovery");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [agenda, setAgenda] = useState(meetingOverviews["discovery"].agenda);
  const [notes, setNotes] = useState("");
  const [schedulingUrl, setSchedulingUrl] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadingEventType, setLoadingEventType] = useState(true);
  const { createMeeting, isLoading } = useMeetingStore();
  const { addToast } = useToastStore();
  const router = useRouter();

  // Sync agenda when language changes if it hasn't been manually edited? 
  // For now, just reset if type changes or on first load.
  useEffect(() => {
    setAgenda(meetingOverviews[selectedType].agenda);
  }, [selectedType, currentLang]);

  useEffect(() => {
    const fetchEventType = async () => {
      try {
        const response = await axios.get('/event-type/');
        if (response.data?.url) {
          setSchedulingUrl(response.data.url);
        }
      } catch (error) {
        console.error('Failed to fetch event type:', error);
      } finally {
        setLoadingEventType(false);
      }
    };

    fetchEventType();
  }, []);

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
    if (!selectedDate || !selectedTime || !agenda.trim()) {
      addToast(interpolate(t.dashboard.consultations.book.validation.fillAll), 'error');
      return;
    }

    if (!selectedDate) {
      addToast(interpolate(t.dashboard.consultations.book.validation.selectDate), 'error');
      return;
    }

    const [hours, minutes] = selectedTime.includes('PM') && !selectedTime.startsWith('12') 
      ? [parseInt(selectedTime.split(':')[0]) + 12, parseInt(selectedTime.split(':')[1])]
      : selectedTime.startsWith('12') && selectedTime.includes('AM')
      ? [0, parseInt(selectedTime.split(':')[1])]
      : [parseInt(selectedTime.split(':')[0]), parseInt(selectedTime.split(':')[1])];
    
    const datetime = new Date(selectedDate);
    datetime.setHours(hours, minutes, 0, 0);
    
    const meetingData = {
      meeting_type: selectedType as 'discovery' | 'first_meeting' | 'follow_up' | 'report_review',
      requested_datetime: datetime.toISOString(),
      agenda: agenda.trim(),
      notes: notes.trim(),
      scheduling_url: schedulingUrl.trim(),
    };

    try {
      const meetingId = await createMeeting(meetingData);
      console.log('Meeting ID returned:', meetingId);
      
      if (meetingId) {
        // Clear form fields after successful submission
        setSelectedType("discovery");
        setSelectedDate(null);
        setSelectedTime(null);
        setAgenda(meetingOverviews["discovery"].agenda);
        setNotes("");
        // Navigate to pre-meeting page with meeting ID
        router.push(`/pre-meeting?meetingId=${meetingId}`);
      } else {
        console.log('No meeting ID returned, submission may have failed');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
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
        <div className="flex items-center bg-card px-5 py-2 rounded-full w-[320px] gap-3 border border-secondary">
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
        </div>
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
                  ${
                    selectedType === type.id
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
        <p className="text-center text-base sm:text-lg font-semibold mt-8 sm:mt-10 mb-6">
          {interpolate(t.dashboard.consultations.book.dateTime)}
        </p>

        <div className="w-full bg-background p-8 rounded-3xl flex flex-col md:flex-row gap-8 justify-center border border-secondary">

          {/* CALENDAR */}
          <div className="w-full lg:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-full bg-card hover:bg-lemon hover:text-background transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              <h3 className="text-lg font-semibold">{formatMonthYear(currentMonth)}</h3>

              <button 
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-full bg-card hover:bg-lemon hover:text-background transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm opacity-70 mb-4">
              <div>{interpolate(t.dashboard.consultations.book.days.sun)}</div>
              <div>{interpolate(t.dashboard.consultations.book.days.mon)}</div>
              <div>{interpolate(t.dashboard.consultations.book.days.tue)}</div>
              <div>{interpolate(t.dashboard.consultations.book.days.wed)}</div>
              <div>{interpolate(t.dashboard.consultations.book.days.thu)}</div>
              <div>{interpolate(t.dashboard.consultations.book.days.fri)}</div>
              <div>{interpolate(t.dashboard.consultations.book.days.sat)}</div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {getDaysInMonth(currentMonth).map((date, index) => {
                const isWeekend = date ? date.getDay() === 0 || date.getDay() === 6 : false;
                const isPast = date ? date < new Date(new Date().setHours(0,0,0,0)) : false;
                const isDisabled = !date || isWeekend || isPast;
                return (
                  <button
                    key={index}
                    onClick={() => date && !isDisabled && setSelectedDate(date)}
                    disabled={isDisabled}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all
                      ${
                        !date
                          ? "invisible"
                          : isDisabled
                          ? "text-foreground/20 cursor-not-allowed"
                          : isDateSelected(date)
                          ? "bg-lemon text-background font-semibold"
                          : "bg-secondary text-foreground hover:bg-lemon/20"
                      }
                    `}
                  >
                    {date?.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TIME SELECTION */}
          <div className="w-full md:w-1/2 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-secondary">
            <h3 className="text-lg font-semibold mb-2">{formatSelectedDate(selectedDate)}</h3>
            <p className="text-xs text-foreground opacity-50 mb-4">{interpolate(t.dashboard.consultations.book.availableHours)}</p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 max-h-[320px] overflow-y-auto pr-1">
              {(() => {
                // Filter slots: only weekdays (Mon-Fri), 9AM - 7PM
                const isWeekday = selectedDate ? selectedDate.getDay() >= 1 && selectedDate.getDay() <= 5 : true;
                if (selectedDate && !isWeekday) {
                  return <p className="col-span-2 text-center text-sm text-foreground opacity-60 py-4">{interpolate(t.dashboard.consultations.book.noSlots)}</p>;
                }
                return allTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-center text-sm font-semibold transition-all
                      ${
                        selectedTime === time
                          ? "bg-lemon text-background"
                          : "bg-lemon/30 text-foreground"
                      }
                    `}
                  >
                    {time}
                  </button>
                ));
              })()}
            </div>
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

        {/* ADDITIONAL NOTES */}
        <p className="text-center text-base sm:text-lg font-semibold mt-8 mb-3">{interpolate(t.dashboard.account.settings.bio)}</p>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={interpolate(t.dashboard.account.settings.placeholders.bio)}
          className="w-full h-32 bg-secondary rounded-xl p-4 outline-none text-sm text-foreground placeholder-foreground/50"
        />



        {/* SUBMIT BUTTON */}
        <div className="flex justify-center mt-8">
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-10 py-2 bg-lemon text-background rounded-full font-semibold text-sm disabled:opacity-50"
          >
            {isLoading ? interpolate(t.dashboard.consultations.book.submitting) : interpolate(t.dashboard.consultations.book.submit)}
          </button>
        </div>

      </div>
    </div>
  );
}
