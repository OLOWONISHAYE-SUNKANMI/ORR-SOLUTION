import { create } from 'zustand';
import api from '@/lib/axios';
import { useToastStore } from './toastStore';

export type InvoiceStatus = 'draft' | 'issued' | 'pending' | 'paid' | 'overdue';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  paymentDate?: string;
  receiptNumber?: string;
}

export interface InvoiceSettings {
  prefix: string;
  nextNumber: number;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  taxId?: string;
  logoUrl?: string;
}

interface InvoiceState {
  invoices: Invoice[];
  settings: InvoiceSettings;
  isLoading: boolean;
  selectedInvoice: Invoice | null;
  
  // Actions
  fetchInvoices: () => Promise<void>;
  fetchInvoiceById: (id: string) => Promise<Invoice | null>;
  createInvoice: (invoice: Partial<Invoice>) => Promise<Invoice | null>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<boolean>;
  updateSettings: (settings: Partial<InvoiceSettings>) => Promise<boolean>;
  payWithWallet: (invoiceId: string) => Promise<boolean>;
  generateInvoiceNumber: () => string;
}

// Mock Data Removed

const DEFAULT_SETTINGS: InvoiceSettings = {
  prefix: 'ORR-2026-',
  nextNumber: 4,
  companyName: 'ORR Solutions',
  companyAddress: 'Rabat, Malta',
  companyEmail: 'Info@orr.solutions',
  companyPhone: '+356 9935 3618',
  taxId: 'GB123456789',
  logoUrl: '/images/logo.svg'
};

export const useInvoiceStore = create<InvoiceState>()((set, get) => ({
  invoices: [],
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  selectedInvoice: null,

  fetchInvoices: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/payment/v1/billing-history/');
      // Map backend invoice schema to frontend invoice schema
      const mappedInvoices: Invoice[] = response.data.map((inv: any) => ({
        id: inv.id.toString(),
        invoiceNumber: inv.reference_id || `INV-${inv.id}`,
        clientId: inv.client_email || 'unknown',
        clientName: inv.client_name || '',
        clientEmail: inv.client_email || '',
        status: inv.status.toLowerCase() === 'paid' ? 'paid' : 'pending',
        issueDate: inv.transaction_date || new Date().toISOString().split('T')[0],
        dueDate: inv.transaction_date || new Date().toISOString().split('T')[0],
        lineItems: [
          {
            id: '1',
            description: inv.billing_title || inv.plan || 'Service',
            quantity: 1,
            unitPrice: inv.amount,
            amount: inv.amount
          }
        ],
        subtotal: inv.amount,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: inv.amount,
        currency: inv.currency || 'USD',
        paymentDate: inv.status.toLowerCase() === 'paid' ? inv.transaction_date : undefined,
        receiptNumber: inv.reference_id
      }));
      set({ invoices: mappedInvoices, isLoading: false });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      set({ isLoading: false });
      useToastStore.getState().addToast('Failed to load invoices', 'error');
    }
  },

  fetchInvoiceById: async (id: string) => {
    const invoice = get().invoices.find(inv => inv.id === id) || null;
    set({ selectedInvoice: invoice });
    return invoice;
  },

  createInvoice: async (invoiceData: Partial<Invoice>) => {
    set({ isLoading: true });
    const newInvoice: Invoice = {
      id: `inv_${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber: get().generateInvoiceNumber(),
      clientId: invoiceData.clientId || '',
      clientName: invoiceData.clientName || '',
      clientEmail: invoiceData.clientEmail || '',
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || '',
      lineItems: invoiceData.lineItems || [],
      subtotal: invoiceData.subtotal || 0,
      taxRate: invoiceData.taxRate || 0.1,
      taxAmount: invoiceData.taxAmount || 0,
      totalAmount: invoiceData.totalAmount || 0,
      currency: invoiceData.currency || 'USD',
      notes: invoiceData.notes,
    };

    set(state => ({
      invoices: [newInvoice, ...state.invoices],
      settings: { ...state.settings, nextNumber: state.settings.nextNumber + 1 },
      isLoading: false
    }));

    useToastStore.getState().addToast('Invoice created successfully', 'success');
    return newInvoice;
  },

  updateInvoiceStatus: async (id: string, status: InvoiceStatus) => {
    set(state => ({
      invoices: state.invoices.map(inv => 
        inv.id === id ? { ...inv, status } : inv
      )
    }));
    return true;
  },

  updateSettings: async (newSettings: Partial<InvoiceSettings>) => {
    set(state => ({
      settings: { ...state.settings, ...newSettings }
    }));
    useToastStore.getState().addToast('Settings updated successfully', 'success');
    return true;
  },

  generateInvoiceNumber: () => {
    const { prefix, nextNumber } = get().settings;
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  },

  payWithWallet: async (invoiceId: string) => {
    const invoice = get().invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return false;

    set({ isLoading: true });
    try {
      const { settleInvoiceWithWallet } = (await import('./walletStore')).useWalletStore.getState();
      const success = await settleInvoiceWithWallet(invoiceId, invoice.totalAmount);
      
      if (success) {
        set(state => ({
          invoices: state.invoices.map(inv => 
            inv.id === invoiceId ? { 
              ...inv, 
              status: 'paid', 
              paymentDate: new Date().toISOString().split('T')[0],
              receiptNumber: `RCP-${inv.invoiceNumber.split('-').pop()}`
            } : inv
          )
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Wallet payment error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));
