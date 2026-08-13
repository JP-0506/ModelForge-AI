/* ============================================================
   Axios Instance — API Service
   Handles: base URL, auth headers, token refresh, errors
   ============================================================ */

import axios from 'axios';
import { storage } from '../utils/storage';
import { API_BASE_URL } from '../constants/apiEndpoints';

// ── Create Axios Instance ──
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach JWT ──
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // On 401 — clear auth and redirect to login
    if (error.response?.status === 401) {
      storage.clearAuth();
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }

    // Format error message for components
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;
