import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";



// =========================================================
// AXIOS INSTANCE
// =========================================================


const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// PREVENT MULTIPLE 401 REDIRECTS
// =========================================================

let handlingUnauthorized = false;

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    // -----------------------------------------------------
    // ADD JWT TOKEN
    // -----------------------------------------------------

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;

    const requestUrl = error.config?.url || "";

    // =====================================================
    // CHECK WHETHER REQUEST IS AN AUTH REQUEST
    // =====================================================
    //
    // Login can also return 401 when credentials
    // are incorrect.
    //
    // In that case we should NOT automatically
    // redirect again.
    //

    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    // =====================================================
    // HANDLE UNAUTHORIZED SESSION
    // =====================================================

    if (status === 401 && !isAuthRequest) {
      // ---------------------------------------------------
      // Prevent multiple simultaneous polling requests
      // from triggering repeated redirects
      // ---------------------------------------------------

      if (!handlingUnauthorized) {
        handlingUnauthorized = true;

        console.warn("Session expired or authentication is invalid.");

        // -------------------------------------------------
        // CLEAR STORED AUTHENTICATION
        // -------------------------------------------------

        localStorage.removeItem("access_token");

        localStorage.removeItem("user");

        // -------------------------------------------------
        // OPTIONAL SESSION EXPIRED FLAG
        // -------------------------------------------------

        sessionStorage.setItem("session_expired", "true");

        // -------------------------------------------------
        // REDIRECT USER TO LOGIN
        // -------------------------------------------------

        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        } else {
          handlingUnauthorized = false;
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
