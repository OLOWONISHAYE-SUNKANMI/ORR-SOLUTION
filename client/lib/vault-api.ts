import axiosInstance from './axios';

export interface VaultDocument {
  id: string;
  name: string;
  title?: string;
  type: 'doc' | 'sheet' | 'slide' | 'file' | 'xlsx' | 'pptx' | 'pdf' | 'other' | 'google_doc' | 'google_sheet' | 'google_slide';
  size: string;
  file_size?: string;
  lastModified: string;
  created_at?: string;
  updated_at?: string;
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

function normalizeDocType(d: any): string {
  // Prefer document_source for Google docs/sheets/slides
  const src = d.document_source || '';
  if (src === 'google_sheet') return 'sheet';
  if (src === 'google_slide') return 'slide';
  if (src === 'google_doc') return 'doc';

  let rawType = d.document_type || d.type || '';
  if (!rawType || rawType === 'file') {
    const nameSource = d.title || d.name || d.link || '';
    const match = nameSource.match(/\.([a-z0-9]+)(\?.*)?$/i);
    if (match) rawType = match[1];
  }
  return (rawType || 'doc').toLowerCase().replace(/^\./, '');
}

export const vaultApi = {
  getDocuments: async (): Promise<VaultDocument[]> => {
    const response = await axiosInstance.get('/vault/documents/');
    let data = response.data?.data || response.data;
    // Handle double-nested data from backend wrapper middleware
    if (data && !Array.isArray(data) && Array.isArray(data.data)) {
      data = data.data;
    }
    if (!Array.isArray(data)) return [];
    return data.map((d: any) => {
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
    });
  },

  getDocument: async (id: string): Promise<VaultDocument> => {
    const response = await axiosInstance.get(`/vault/documents/${id}/`);
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

  getFolders: async (): Promise<VaultFolder[]> => {
    const response = await axiosInstance.get('/vault/folders/');
    let data = response.data?.data || response.data;
    if (data && !Array.isArray(data) && Array.isArray(data.data)) {
      data = data.data;
    }
    if (!Array.isArray(data)) return [];
    return data.map((f: any) => ({
      ...f,
      createdAt: f.created_at || f.updated_at
    }));
  },

  /**
   * Create a Google Doc/Sheet/Slide via the shared Google integration endpoint.
   * Works for both admin and client users.
   * client_id is required – the page must pass the authenticated client's ID.
   */
  createGoogleDoc: async (
    title: string,
    clientId: number,
    type: string = 'google_doc',
    folderId?: string | null
  ): Promise<any> => {
    const response = await axiosInstance.post(
      '/admin-portal/v1/vault/documents/create-google-doc/',
      {
        title,
        client_id: clientId,
        type,
        folder_id: folderId || null,
      }
    );
    // views_google.create_google_doc returns data directly (not nested)
    return response.data;
  },

  uploadDocument: async (formData: FormData): Promise<any> => {
    const response = await axiosInstance.post('/vault/documents/', formData);
    return response.data?.data || response.data;
  },

  createFolder: async (name: string, parentId?: string | null, clientId?: number | null): Promise<any> => {
    const response = await axiosInstance.post('/vault/folders/', {
      name,
      parent: parentId || null,
      client: clientId || null,
    });
    return response.data.data || response.data;
  },

  getActivity: async (): Promise<ActivityLogEntry[]> => {
    const response = await axiosInstance.get('/vault/activity/');
    const data = response.data.data || response.data;
    if (!Array.isArray(data)) return [];
    return data;
  },
};
