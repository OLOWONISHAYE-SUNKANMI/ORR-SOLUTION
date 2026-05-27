import axiosInstance from './axios';
import { VaultDocument } from './vault-api';

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
  }
};
