import { create } from 'zustand';
import api from '@/lib/axios';
import { useToastStore } from './toastStore';

interface MeetingData {
  meeting_type: 'discovery' | 'first_meeting' | 'follow_up' | 'report_review';
  requested_datetime: string;
  agenda: string;
  scheduling_url: string;
}

interface Meeting {
  id: number;
  meeting_type: string;
  requested_datetime: string;
  status: string;
  agenda: string;
  duration_minutes: number;
  meeting_link?: string;
  calendar_event_id?: string;
}

interface MeetingState {
  isLoading: boolean;
  meetings: Meeting[];
  error: string | null;
  createMeeting: (data: MeetingData) => Promise<number | null>;
  fetchMyMeetings: () => Promise<void>;
  fetchMeetings: () => Promise<void>; // Alias for scheduling page
  getUpcomingMeetings: () => Meeting[];
  clearError: () => void;
}

export const useMeetingStore = create<MeetingState>()((set, get) => ({
  isLoading: false,
  meetings: [],
  error: null,

  createMeeting: async (data: MeetingData): Promise<number | null> => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/create-meeting/', data);
      console.log('API Response:', response.data);
      
      const meetingId = response.data?.data?.meeting_id || 
                       response.data?.meeting_id ||
                       response.data?.data?.id || 
                       response.data?.id || 
                       response.data?.meeting?.id;
      
      console.log('Extracted meeting ID:', meetingId);
      
      useToastStore.getState().addToast('Meeting request submitted successfully!', 'success');
      set({ isLoading: false });
      return meetingId;
    } catch (error: any) {
      console.error('Meeting creation error:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to create meeting. Please try again.';
      
      console.log('error message: ', errorMessage)
      set({ error: errorMessage, isLoading: false });
      useToastStore.getState().addToast(errorMessage, 'error');
      return null;
    }
  },

  fetchMyMeetings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/mymeetings');
      const meetings = response.data?.data || response.data || [];
      set({ meetings: Array.isArray(meetings) ? meetings : [], isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch meetings';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchMeetings: async () => {
    const { fetchMyMeetings } = get();
    return fetchMyMeetings();
  },

  getUpcomingMeetings: () => {
    const { meetings } = get();
    const now = new Date();
    if (!Array.isArray(meetings)) {
      return [];
    }
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.requested_datetime);
      return meetingDate > now && meeting.status !== 'cancelled';
    }).sort((a, b) => new Date(a.requested_datetime).getTime() - new Date(b.requested_datetime).getTime());
  },

  clearError: () => {
    set({ error: null });
  },
}));