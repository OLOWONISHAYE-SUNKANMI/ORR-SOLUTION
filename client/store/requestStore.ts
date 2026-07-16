import { create } from "zustand";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { useToastStore } from "./toastStore";

// ── Types matching the backend ClientRequest model ──

export type RequestStatus =
  | "draft"
  | "submitted"
  | "pending_orr_review"
  | "clarification_requested"
  | "approved_for_meeting"
  | "approved_for_pm_assignment"
  | "converted_to_project"
  | "rejected"
  | "closed"
  | "archived";

export interface ClientRequestDocument {
  id: number;
  file: string;
  file_name: string;
  file_size: number | null;
  description: string;
  uploaded_by: number | null;
  vault_document: number | null;
  created_at: string;
}

export interface ClientRequestData {
  id: number;
  request_id: string;
  client: number;
  client_name: string;
  submitted_by: number;
  submitted_by_name: string;
  submission_date: string | null;

  // Request basics
  request_title: string;
  main_request_type: string;
  orr_service_area: string;

  // Problem detail
  short_description: string;
  desired_outcome: string;
  background_context: string;
  main_question: string;
  current_challenge: string;
  actions_taken: string;
  decision_needed: string;

  // Scope & expectations
  expected_support: string[];
  expected_deliverable: string[];
  urgency: string;
  target_date: string | null;
  budget_expectation: string;

  // Sector / domain
  sector: string[];
  jurisdiction: string;
  location: string;

  // Documents
  has_documents: boolean;

  // Confidentiality
  sensitivity_level: string;
  confidentiality_agreed: boolean;

  // Communication
  preferred_next_step: string;
  preferred_contact_method: string[];
  preferred_meeting_language: string[];

  // Compliance
  confirm_accuracy: boolean;
  confirm_authority: boolean;
  confirm_no_emergency: boolean;
  ai_processing_notice: boolean;

  // Status
  status: RequestStatus;

  // Internal review
  admin_classification: string;
  admin_review_notes: string;
  assigned_pm: number | null;
  assigned_pm_name: string | null;
  converted_project: number | null;

  // Audit
  last_updated_by: number | null;
  created_at: string;
  updated_at: string;

  // Nested
  documents_list: ClientRequestDocument[];
}

export interface CreateRequestPayload {
  request_title: string;
  main_request_type: string;
  orr_service_area?: string;
  short_description: string;
  desired_outcome: string;
  background_context?: string;
  main_question?: string;
  current_challenge?: string;
  actions_taken?: string;
  decision_needed?: string;
  expected_support?: string[];
  expected_deliverable?: string[];
  urgency?: string;
  target_date?: string | null;
  budget_expectation?: string;
  sector?: string[];
  jurisdiction?: string;
  location?: string;
  has_documents?: boolean;
  sensitivity_level?: string;
  confidentiality_agreed?: boolean;
  preferred_next_step?: string;
  preferred_contact_method?: string[];
  preferred_meeting_language?: string[];
  confirm_accuracy?: boolean;
  confirm_authority?: boolean;
  confirm_no_emergency?: boolean;
  ai_processing_notice?: boolean;
}

interface RequestState {
  requests: ClientRequestData[];
  currentRequest: ClientRequestData | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchRequests: () => Promise<void>;
  fetchRequestDetail: (id: number) => Promise<ClientRequestData | null>;
  createRequest: (data: CreateRequestPayload) => Promise<ClientRequestData | null>;
  updateRequest: (id: number, data: Partial<CreateRequestPayload>) => Promise<ClientRequestData | null>;
  submitRequest: (id: number) => Promise<ClientRequestData | null>;
  uploadDocuments: (id: number, files: File[], descriptions: string[]) => Promise<void>;
  clearCurrentRequest: () => void;
  clearError: () => void;
}

function extractErrorMessage(error: unknown): string {
  const err = error as AxiosError;
  const errorData = err.response?.data as Record<string, unknown> | undefined;

  if (errorData && typeof errorData === "object") {
    if ("message" in errorData && typeof errorData.message === "string") {
      return errorData.message;
    }
    if ("detail" in errorData && typeof errorData.detail === "string") {
      return errorData.detail;
    }
    return Object.entries(errorData)
      .map(([key, value]) => {
        const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
        return `${key}: ${displayValue}`;
      })
      .join(" | ");
  }
  return err.message || "An error occurred";
}

export const useRequestStore = create<RequestState>()((set, get) => ({
  requests: [],
  currentRequest: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/requests/");
      const data = response.data?.data || response.data?.results || response.data || [];
      set({ requests: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      console.error("Failed to fetch requests:", error);
    }
  },

  fetchRequestDetail: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/requests/${id}/`);
      const data = response.data?.data || response.data;
      set({ currentRequest: data, isLoading: false });
      return data;
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isLoading: false });
      console.error("Failed to fetch request detail:", error);
      return null;
    }
  },

  createRequest: async (payload: CreateRequestPayload) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await api.post("/requests/", payload);
      const data = response.data?.data || response.data;
      set((state) => ({
        requests: [data, ...state.requests],
        currentRequest: data,
        isSubmitting: false,
      }));
      useToastStore.getState().addToast("Request saved as draft.", "success");
      return data;
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isSubmitting: false });
      useToastStore.getState().addToast(msg, "error");
      console.error("Failed to create request:", error);
      return null;
    }
  },

  updateRequest: async (id: number, payload: Partial<CreateRequestPayload>) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await api.patch(`/requests/${id}/`, payload);
      const data = response.data?.data || response.data;
      set((state) => ({
        requests: state.requests.map((r) => (r.id === id ? data : r)),
        currentRequest: data,
        isSubmitting: false,
      }));
      useToastStore.getState().addToast("Request updated.", "success");
      return data;
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isSubmitting: false });
      useToastStore.getState().addToast(msg, "error");
      console.error("Failed to update request:", error);
      return null;
    }
  },

  submitRequest: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await api.post(`/requests/${id}/submit/`);
      const data = response.data?.data || response.data;
      set((state) => ({
        requests: state.requests.map((r) => (r.id === id ? data : r)),
        currentRequest: data,
        isSubmitting: false,
      }));
      useToastStore.getState().addToast("Request submitted successfully!", "success");
      return data;
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isSubmitting: false });
      useToastStore.getState().addToast(msg, "error");
      console.error("Failed to submit request:", error);
      return null;
    }
  },

  uploadDocuments: async (id: number, files: File[], descriptions: string[]) => {
    set({ isSubmitting: true, error: null });
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      descriptions.forEach((desc) => formData.append("descriptions", desc));

      await api.post(`/requests/${id}/documents/`, formData);
      set({ isSubmitting: false });
      useToastStore.getState().addToast("Documents uploaded.", "success");

      // Refresh the request detail to get updated documents list
      const currentRequest = get().currentRequest;
      if (currentRequest && currentRequest.id === id) {
        get().fetchRequestDetail(id);
      }
    } catch (error) {
      const msg = extractErrorMessage(error);
      set({ error: msg, isSubmitting: false });
      useToastStore.getState().addToast(msg, "error");
      console.error("Failed to upload documents:", error);
    }
  },

  clearCurrentRequest: () => set({ currentRequest: null }),
  clearError: () => set({ error: null }),
}));
