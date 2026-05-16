import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const getCSRFToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrftoken") {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const publicEndpoints = [
      "/api/auth/login/",
      "/client/register/",
      "/api/auth/forget-password/",
      "/api/auth/verify-reset-password/",
      "/api/auth/verify-email/",
      "/api/auth/google-login/",
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));

    // Check for accessToken (only in browser)
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken && !isPublicEndpoint) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // Add CSRF token for state-changing requests (only in browser)
    if (
      typeof window !== 'undefined' &&
      ["post", "put", "patch", "delete"].includes(
        config.method?.toLowerCase() || "",
      )
    ) {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers["X-CSRFToken"] = csrfToken;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      const baseURL = config.baseURL || "";
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const errorData = error.response?.data;
      
      const isLoginEndpoint = url.includes("/auth/login/") || url.includes("/login/");
      const isTokenInvalid =
        errorData?.data?.code === "token_not_valid" ||
        errorData?.code === "token_not_valid" ||
        errorData?.detail === "Given token not valid for any token type" ||
        (typeof errorData?.detail === "string" && errorData.detail.toLowerCase().includes("token"));

      if (!isLoginEndpoint && isTokenInvalid) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          
          // Only redirect if not already on an auth page
          if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
            window.location.href = "/login/";
          }
        }
        return Promise.reject(error);
      }
    } else if (error.response?.status && error.response.status >= 500) {
      // Endpoints that are known to fail due to backend config (handled gracefully by the store)
      const suppressedEndpoints = ['/user/payment-methods/'];
      const isSuppressed = suppressedEndpoints.some(ep => error.config?.url?.includes(ep));
      if (!isSuppressed && process.env.NODE_ENV === 'development') {
        console.error(`🚨 API ${error.response.status} — ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response.data);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
