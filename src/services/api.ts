import axios from "axios";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const baseURL =
  import.meta.env?.VITE_API_URL ||
  (isLocal ? "http://localhost:3000/api" : "https://45.91.134.134.nip.io/api");

// Create axios instance with default config
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (status === 403) {
        console.error("Access forbidden");
      } else if (status === 404) {
        console.error("Resource not found");
      } else if (status >= 500) {
        console.error("Server error:", data.message || "Something went wrong");
      }
    } else if (error.request) {
      // Request made but no response
      console.error("Network error: No response from server");
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
