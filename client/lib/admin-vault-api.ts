import axiosInstance from './axios';
import { VaultDocument, normalizeDocType } from './vault-api';

export interface Client {
  id: number;
  full_name: string;
  company: string;
}

export const adminVaultApi = {
  getClients: async (): Promise<Client[]> => {
    const response = await axiosInstance.get('/admin-portal/v1/clients/');
    return response.data.data || response.data.results || response.data;
  },

  getAllDocuments: async (clientId?: number): Promise<VaultDocument[]> => {
    const url = clientId 
      ? `/admin-portal/v1/vault/documents/?client_id=${clientId}`
      : '/admin-portal/v1/vault/documents/';
    const response = await axiosInstance.get(url);
    let data = response.data?.data || response.data;
    if (data && !Array.isArray(data) && Array.isArray(data.data)) {
      data = data.data;
    }
    return Array.isArray(data) ? data : [];
  },

  getDocument: async (id: string): Promise<VaultDocument> => {
    const response = await axiosInstance.get(`/admin-portal/v1/vault/documents/${id}/`);
    const d = response.data.data || response.data;
    let formattedDate = 'Unknown Date';
    try {
      const rawDate = d.updated_at || d.created_at;
      if (rawDate) {
        formattedDate = new Date(rawDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
    } catch (e) {}

    return {
      ...d,
      name: d.title || d.name || 'Untitled',
      lastModified: formattedDate,
      size: d.file_size || '0 KB',
      type: normalizeDocType(d),
    };
  },

  askAIAssistant: async (message: string, context?: string, history?: any[]) => {
    const response = await axiosInstance.post('/admin-portal/v1/ai/chat/', {
        message,
        context,
        conversation_history: history || [],
    });
    return response.data?.reply || response.data?.data?.reply || 'No response from AI.';
  },
  
  summarizeDocument: async (text: string, title?: string, documentId?: string) => {
    const response = await axiosInstance.post('/admin-portal/v1/ai/document-summary/', {
        text,
        title: title || 'Untitled',
        document_id: documentId,
    });
    return response.data?.summary || response.data?.data?.summary || 'No summary generated.';
  }
};
