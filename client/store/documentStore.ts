import { create } from 'zustand';
import api from '@/lib/axios';
import { useToastStore } from './toastStore';

interface Document {
  id: string;
  name: string;
  title: string;
  type: string;
  size: string;
  lastModified: string;
  link: string;
  document_type?: string;
  file_size?: string;
  description?: string;
}

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  toggleFavorite: (documentId: any) => Promise<void>;
  downloadDocument: (documentId: any) => Promise<void>;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentState>()((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/vault/documents/');
      let rawData = response.data?.data || response.data || [];
      if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }
      const documentsData = Array.isArray(rawData) ? rawData.map((d: any) => ({
        ...d,
        id: d.id.toString(),
        name: d.title || d.name || 'Untitled',
        title: d.title || d.name || 'Untitled',
        type: d.document_type || d.type || 'doc',
        size: d.file_size || '0 KB',
        lastModified: d.updated_at || d.created_at || new Date().toISOString(),
        link: d.link || ''
      })) : [];
      set({ documents: documentsData, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch documents';
      set({ error: errorMessage, isLoading: false, documents: [] });
      useToastStore.getState().addToast(errorMessage, 'error');
    }
  },

  toggleFavorite: async (documentId: any) => {
    try {
      await api.post(`/favourite/${documentId}/toggle/`);
      useToastStore.getState().addToast('Favorite updated', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to toggle favorite';
      useToastStore.getState().addToast(errorMessage, 'error');
    }
  },

  downloadDocument: async (documentId: any) => {
    try {
      const response = await api.get(`/client/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document-${documentId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      useToastStore.getState().addToast('Download started', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to download document';
      useToastStore.getState().addToast(errorMessage, 'error');
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));