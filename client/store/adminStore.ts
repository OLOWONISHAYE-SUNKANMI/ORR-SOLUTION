import { create } from 'zustand';
import api from '@/lib/axios';
import { useToastStore } from './toastStore';

interface Meeting {
  id: number;
  meeting_type: string;
  requested_datetime: string;
  status: string;
  agenda: string;
  duration_minutes: number;
  client_name?: string;
  client_email?: string;
}

interface AdminState {
  isLoading: boolean;
  meetings: Meeting[];
  error: string | null;
  fetchAllMeetings: () => Promise<void>;
  updateMeetingStatus: (meetingId: number, status: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>()((set) => ({
  isLoading: false,
  meetings: [],
  error: null,

  fetchAllMeetings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/admin-portal/v1/meetings/');
      const meetings = response.data?.results || response.data?.data || response.data || [];
      set({ meetings: Array.isArray(meetings) ? meetings : [], isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch meetings';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateMeetingStatus: async (meetingId: number, status: string) => {
    set({ isLoading: true });
    try {
      // Map 'confirmed' to action 'confirm' etc if needed
      const actionMap: Record<string, string> = {
        'confirmed': 'confirm',
        'cancelled': 'cancel',
        'declined': 'decline',
        'completed': 'complete'
      };
      const action = actionMap[status] || status;
      
      await api.post(`/admin-portal/v1/meetings/${meetingId}/actions/`, { action });
      useToastStore.getState().addToast('Meeting status updated successfully', 'success');
      
      // Refresh meetings list
      const response = await api.get('/admin-portal/v1/meetings/');
      const meetings = response.data?.results || response.data?.data || response.data || [];
      set({ meetings: Array.isArray(meetings) ? meetings : [], isLoading: false });
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update meeting status';
      set({ error: errorMessage, isLoading: false });
      useToastStore.getState().addToast(errorMessage, 'error');
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
