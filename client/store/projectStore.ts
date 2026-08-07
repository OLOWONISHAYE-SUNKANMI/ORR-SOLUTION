import { create } from 'zustand';
import api from '@/lib/axios';

export interface ProjectDocument {
  id: number;
  document_type: string;
  file_name: string;
  file: string;
  uploaded_at: string;
}

export interface ClientProject {
  id: number;
  project_id: string;
  title: string;
  service_category: string;
  service_category_display: string;
  status: string;
  status_display: string;
  client_objective?: string;
  proposed_scope?: string;
  expected_deliverable?: any[];
  target_deadline?: string;
  created_at: string;
  documents?: ProjectDocument[];
}

interface ProjectState {
  projects: ClientProject[];
  currentProject: ClientProject | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProjectById: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/projects/');
      if (response.data.success) {
        set({ projects: response.data.data, isLoading: false });
      } else {
        set({ error: response.data.message || 'Failed to fetch projects', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'An error occurred', isLoading: false });
    }
  },

  fetchProjectById: async (id: number) => {
    set({ isLoading: true, error: null, currentProject: null });
    try {
      const response = await api.get(`/projects/${id}/`);
      if (response.data.success) {
        set({ currentProject: response.data.data, isLoading: false });
      } else {
        set({ error: response.data.message || 'Failed to fetch project details', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'An error occurred', isLoading: false });
    }
  },
}));
