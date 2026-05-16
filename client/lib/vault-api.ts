import axiosInstance from './axios';

export interface VaultDocument {
  id: string;
  name: string;
  title?: string;
  type: 'doc' | 'sheet' | 'file' | 'xlsx' | 'pptx' | 'pdf' | 'other';
  size: string;
  file_size?: string;
  lastModified: string;
  created_at?: string;
  link: string;
  document_type?: string;
  document_source?: string;
  google_drive_id?: string;
  project?: string;
  category?: string;
  folder?: string;
  folder_id?: string;
}

export interface VaultFolder {
  id: string;
  name: string;
  parent: string | null;
  doc_count: number;
}

export interface ActivityLogEntry {
  id: number;
  user: string;
  action: string;
  item: string;
  description: string;
  timestamp: string;
  time: string;
  model: string;
}

export const vaultApi = {
  getDocuments: async (): Promise<VaultDocument[]> => {
    const response = await axiosInstance.get('/vault/documents/');
    const data = response.data.data;
    return data.map((d: any) => {
      let rawType = d.document_type || d.type;
      if (!rawType || rawType === 'file') {
        const nameSource = d.title || d.name || d.link || '';
        const match = nameSource.match(/\.([a-z0-9]+)(\?.*)?$/i);
        if (match) rawType = match[1];
      }
      
      return {
        ...d,
        name: d.title || d.name,
        lastModified: d.updated_at || d.created_at,
        size: d.file_size || '0 KB',
        type: (rawType || 'pdf').toLowerCase().replace(/^\./, '')
      };
    });
  },

  getDocument: async (id: string): Promise<VaultDocument> => {
    const response = await axiosInstance.get(`/vault/documents/${id}/`);
    const d = response.data.data;
    
    let rawType = d.document_type || d.type;
    if (!rawType || rawType === 'file') {
      const nameSource = d.title || d.name || d.link || '';
      const match = nameSource.match(/\.([a-z0-9]+)(\?.*)?$/i);
      if (match) rawType = match[1];
    }

    return {
      ...d,
      name: d.title || d.name,
      lastModified: d.updated_at || d.created_at,
      size: d.file_size || '0 KB',
      type: (rawType || 'pdf').toLowerCase().replace(/^\./, '')
    };
  },

  getFolders: async (): Promise<VaultFolder[]> => {
    const response = await axiosInstance.get('/vault/folders/');
    return response.data.data.map((f: any) => ({
      ...f,
      createdAt: f.created_at || f.updated_at
    }));
  },
  
  createGoogleDoc: async (title: string, clientId: number, type: string = 'google_doc', folderId?: string | null): Promise<any> => {
    const response = await axiosInstance.post('/admin-portal/v1/vault/documents/create-google-doc/', {
      title,
      client_id: clientId,
      type,
      folder_id: folderId
    });
    return response.data.data;
  },

  getActivity: async (): Promise<ActivityLogEntry[]> => {
    const response = await axiosInstance.get('/api/client/v1/vault/activity/');
    return response.data.data;
  },
};
