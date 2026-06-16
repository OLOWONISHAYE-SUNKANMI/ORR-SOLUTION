import { create } from 'zustand';
import api from '@/lib/axios';
import { useToastStore } from './toastStore';

interface ProfileData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  country: string;
  city: string;
  zip_code: string;
  bio_text: string;
  bio_attachment: string;
  timezone: string;
  profile_pic: string;
  phone_number: string;
}

interface ProfileState {
  profile: ProfileData;
  isLoading: boolean;
  isEditing: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileData, profilePicFile?: File) => Promise<void>;
  setEditing: (editing: boolean) => void;
  setProfile: (profile: Partial<ProfileData>) => void;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
  profile: {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    country: '',
    city: '',
    zip_code: '',
    bio_text: '',
    bio_attachment: '',
    timezone: '',
    profile_pic: '',
    phone_number: '',
  },
  isLoading: false,
  isEditing: false,
  error: null,

  fetchProfile: async (force = false) => {
    const state = get();
    if (!force && state.profile.username && state.profile.first_name) {
      return;
    }

    // Prevent duplicate concurrent requests
    if (state.isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/account/settings/');
      const apiData = response.data?.data || response.data || {};
      
      // Map API response to form fields
      const profileData = {
        first_name: apiData.user?.first_name || '',
        last_name: apiData.user?.last_name || '',
        username: apiData.user?.username || '',
        email: '', // Will be set from authStore
        country: apiData.profile?.country || '',
        city: apiData.profile?.city || '',
        zip_code: apiData.profile?.zip_code || '',
        bio_text: apiData.profile?.bio || '',
        bio_attachment: apiData.profile?.bio_attachment || '',
        timezone: apiData.profile?.timezone || '',
        profile_pic: apiData.profile?.profile_pic || '',
        phone_number: apiData.profile?.phone_number || '',
      };
      
      set({ profile: profileData, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
      set({ error: errorMessage, isLoading: false });
      useToastStore.getState().addToast(errorMessage, 'error');
    }
  },

  updateProfile: async (data: ProfileData, profilePicFile?: File) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      
      // Add text fields (exclude profile_pic from data)
      const { profile_pic, bio_attachment, ...textData } = data;
      Object.entries(textData).forEach(([key, value]) => {
        formData.append(key, value || '');
      });
      
      // Add file if provided
      if (profilePicFile) {
        formData.append('profile_pic', profilePicFile);
      }
      
      const response = await api.patch('/account/settings/', formData);
      set({ profile: data, isLoading: false, isEditing: false });
      useToastStore.getState().addToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      let errorMessage = 'Profile update failed';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      set({ error: errorMessage, isLoading: false });
      useToastStore.getState().addToast(errorMessage, 'error');
    }
  },

  setEditing: (editing: boolean) => {
    set({ isEditing: editing });
  },

  setProfile: (profile: Partial<ProfileData>) => {
    set((state) => ({ profile: { ...state.profile, ...profile } }));
  },

  clearError: () => {
    set({ error: null });
  },
}));