import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { useToastStore } from "./toastStore";
import { useOnboardingStore } from "./onboardingStore";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  role_name?: string;
  role_display?: string;
  permissions: Record<string, boolean>;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: (credential: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (
    uid: string,
    token: string,
    newPassword: string,
  ) => Promise<boolean>;
  verifyEmail: (uid: string, token: string, email: string) => Promise<boolean>;
  validateToken: () => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken:
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null,
      refreshToken:
        typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null,
      isLoading: false,
      error: null,

      register: async (
        email: string,
        password: string,
        firstName: string,
        lastName: string,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/client/register/", {
            username: firstName.toLowerCase() + lastName.toLowerCase(),
            email,
            password,
            first_name: firstName,
            last_name: lastName,
          });

          const data = response.data.data;
          const user = data.user;
          const accessToken = data.access || data.accessToken;
          localStorage.setItem("accessToken", accessToken);
          set({ user, accessToken, isLoading: false });

          useToastStore
            .getState()
            .addToast(
              "Registration successful! Please check your email for confirmation.",
              "success",
            );
          return true;
        } catch (error: unknown) {
          const err = error as AxiosError;
          const errorData = err.response?.data as
            | Record<string, unknown>
            | string
            | undefined;
          let errorMessage = "Registration failed";

          if (errorData) {
            if (typeof errorData === "string") {
              errorMessage = errorData;
            } else if (
              typeof errorData === "object" &&
              errorData !== null &&
              "message" in errorData &&
              typeof (errorData as Record<string, unknown>).message === "string"
            ) {
              errorMessage = (errorData as Record<string, unknown>)
                .message as string;
            } else if (
              typeof errorData === "object" &&
              errorData !== null &&
              "errors" in errorData &&
              typeof (errorData as Record<string, unknown>).errors === "object"
            ) {
              const errors = (errorData as Record<string, unknown>).errors;
              if (errors && typeof errors === "object") {
                errorMessage = Object.values(errors)
                  .flat()
                  .map((val) => String(val))
                  .join(", ");
              }
            } else if (typeof errorData === "object" && errorData !== null) {
              // Handle Django/Rest-style field errors: {"email": ["..."], "username": ["..."]}
              errorMessage = Object.entries(
                errorData as Record<string, unknown>,
              )
                .map(([key, value]) => {
                  const displayValue = Array.isArray(value)
                    ? value.join(", ")
                    : String(value);
                  return `${key}: ${displayValue}`;
                })
                .join(" | ");
            }
          } else if (err.message) {
            errorMessage = err.message;
          }

          console.error("Registration error detail:", errorData || err);
          set({ error: errorMessage, isLoading: false });
          useToastStore.getState().addToast(errorMessage, "error");
          throw error;
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/api/auth/login/", {
            email,
            password,
          });

          if (response.status === 200 || response.status === 201) {
            const data = response.data.data;
            const user = data.user;
            const accessToken = data.access || data.accessToken;
            const refreshToken = data.refresh || data.refreshToken;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            // Also sync user_data for AuthService (used by CMS LoginModal)
            localStorage.setItem("user_data", JSON.stringify(user));
            set({
              user,
              accessToken,
              refreshToken,
              isLoading: false,
              error: null,
            });

            useToastStore
              .getState()
              .addToast(
                `Welcome back, ${user?.first_name || "User"}!`,
                "success",
              );

            // Check onboarding status
            await useOnboardingStore.getState().checkOnboardingStatus();

            return true;
          } else {
            throw new Error("Login failed");
          }
        } catch (error: unknown) {
          const err = error as AxiosError;
          const errorData = err.response?.data as
            | Record<string, unknown>
            | undefined;
          let errorMessage =
            errorData &&
            typeof errorData === "object" &&
            "message" in errorData &&
            typeof errorData.message === "string"
              ? errorData.message
              : err.message || "Login failed";

          if (
            errorData &&
            typeof errorData === "object" &&
            !("message" in errorData)
          ) {
            errorMessage = Object.entries(errorData as Record<string, unknown>)
              .map(([key, value]) => {
                const displayValue = Array.isArray(value)
                  ? value.join(", ")
                  : String(value);
                return `${key}: ${displayValue}`;
              })
              .join(" | ");
          }

          if (err.message === "Network Error") {
            errorMessage = "Network Error: Could not reach the server. Please check if the backend is running.";
          }

          console.error("Login Error Details:", {
            message: err.message,
            url: err.config?.url,
            baseURL: err.config?.baseURL,
            status: err.response?.status,
            data: errorData,
          });

          set({ error: errorMessage, isLoading: false });
          useToastStore.getState().addToast(errorMessage, "error");
          throw error;
        }
      },

      googleLogin: async (credential: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/api/auth/google-login/", {
            credential,
          });

          if (response.status === 200 || response.status === 201) {
            const data = response.data.data;
            const user = data.user;
            const accessToken = data.access || data.accessToken;
            const refreshToken = data.refresh || data.refreshToken;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            // Also sync user_data for AuthService (used by CMS LoginModal)
            localStorage.setItem("user_data", JSON.stringify(user));
            set({
              user,
              accessToken,
              refreshToken,
              isLoading: false,
              error: null,
            });

            useToastStore
              .getState()
              .addToast(
                `Welcome back, ${user?.first_name || "User"}!`,
                "success",
              );

            // Check onboarding status
            await useOnboardingStore.getState().checkOnboardingStatus();

            return true;
          } else {
            throw new Error("Google login failed");
          }
        } catch (error: unknown) {
          const err = error as AxiosError;
          const errorData = err.response?.data as Record<string, unknown> | undefined;
          
          let errorMessage = "Google login failed";
          
          if (errorData && typeof errorData === "object") {
            if ("message" in errorData && typeof errorData.message === "string") {
              errorMessage = errorData.message;
            } else {
               errorMessage = Object.entries(errorData)
                .map(([key, value]) => {
                  const displayValue = Array.isArray(value)
                    ? value.join(", ")
                    : String(value);
                  return `${key}: ${displayValue}`;
                })
                .join(" | ");
            }
          } else {
            errorMessage = err.message || "Google login failed";
          }

          set({ error: errorMessage, isLoading: false });
          useToastStore.getState().addToast(errorMessage, "error");
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/api/auth/forget-password/", { email });
          useToastStore
            .getState()
            .addToast("Password reset email sent!", "success");
          set({ isLoading: false });
          return true;
        } catch (error: unknown) {
          const err = error as AxiosError;
          const errorData = err.response?.data as
            | Record<string, unknown>
            | undefined;
          let errorMessage =
            errorData &&
            typeof errorData === "object" &&
            "message" in errorData &&
            typeof errorData.message === "string"
              ? errorData.message
              : "Failed to send reset email";

          if (
            errorData &&
            typeof errorData === "object" &&
            !("message" in errorData)
          ) {
            errorMessage = Object.entries(errorData as Record<string, unknown>)
              .map(([key, value]) => {
                const displayValue = Array.isArray(value)
                  ? value.join(", ")
                  : String(value);
                return `${key}: ${displayValue}`;
              })
              .join(" | ");
          }

          set({ error: errorMessage, isLoading: false });
          useToastStore.getState().addToast(errorMessage, "error");
          throw error;
        }
      },

      resetPassword: async (
        uid: string,
        token: string,
        newPassword: string,
      ) => {
        set({ isLoading: true, error: null });
        try {
          await api.post(`/api/auth/verify-reset-password/${uid}/${token}/`, {
            uid,
            token,
            new_password: newPassword,
          });
          useToastStore
            .getState()
            .addToast("Password reset successful!", "success");
          set({ isLoading: false });
          return true;
        } catch (error: unknown) {
          const err = error as AxiosError;
          const errorData = err.response?.data as
            | Record<string, unknown>
            | undefined;
          let errorMessage =
            errorData &&
            typeof errorData === "object" &&
            "message" in errorData &&
            typeof errorData.message === "string"
              ? errorData.message
              : "Password reset failed";

          if (
            errorData &&
            typeof errorData === "object" &&
            !("message" in errorData)
          ) {
            errorMessage = Object.entries(errorData as Record<string, unknown>)
              .map(([key, value]) => {
                const displayValue = Array.isArray(value)
                  ? value.join(", ")
                  : String(value);
                return `${key}: ${displayValue}`;
              })
              .join(" | ");
          }

          set({ error: errorMessage, isLoading: false });
          useToastStore.getState().addToast(errorMessage, "error");
          throw error;
        }
      },

      verifyEmail: async (uid: string, token: string, email: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/api/auth/verify-email/", { uid, token, email });
          useToastStore
            .getState()
            .addToast("Email verified successfully!", "success");
          set({ isLoading: false });
          return true;
        } catch (error: unknown) {
          const err = error as AxiosError;
          const errorData = err.response?.data as
            | Record<string, unknown>
            | undefined;
          let errorMessage =
            errorData &&
            typeof errorData === "object" &&
            "message" in errorData &&
            typeof errorData.message === "string"
              ? errorData.message
              : "Email verification failed";

          if (
            errorData &&
            typeof errorData === "object" &&
            !("message" in errorData)
          ) {
            errorMessage = Object.entries(errorData as Record<string, unknown>)
              .map(([key, value]) => {
                const displayValue = Array.isArray(value)
                  ? value.join(", ")
                  : String(value);
                return `${key}: ${displayValue}`;
              })
              .join(" | ");
          }

          set({ error: errorMessage, isLoading: false });
          useToastStore.getState().addToast(errorMessage, "error");
          throw error;
        }
      },

      validateToken: async () => {
        const accessToken =
          get().accessToken || localStorage.getItem("accessToken");
        if (!accessToken) {
          return false;
        }

        try {
          await api.get("/account/settings/");
          return true;
        } catch (error: unknown) {
          const err = error as AxiosError;
          if (err.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            set({ user: null, accessToken: null, refreshToken: null });
            return false;
          }
          return true;
        }
      },

      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user_data"); // Sync with AuthService
        set({ user: null, accessToken: null, refreshToken: null });
        useToastStore.getState().addToast("Logged out successfully", "info");
        
        window.location.href = "/login/";
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined") {
          const accessToken = localStorage.getItem("accessToken");
          const refreshToken = localStorage.getItem("refreshToken");
          if (accessToken && !state.accessToken) {
            state.accessToken = accessToken;
          }
          if (refreshToken && !state.refreshToken) {
            state.refreshToken = refreshToken;
          }
        }
      },
    },
  ),
);
