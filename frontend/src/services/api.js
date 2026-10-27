import axios from 'axios';
import { toast } from 'react-toastify';
import i18n from '../i18n/i18n';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  withCredentials: true, // Crucial for sending/receiving secure HTTP-only cookies
});

// Intercept responses to handle global errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || '';

    // Define routes that shouldn't trigger global error toasts or redirects on 401
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    // Handle 401 Unauthorized errors globally
    if (status === 401) {
      // Skip redirection if we are already on the login page or hitting auth routes
      if (!isAuthRoute && window.location.pathname !== '/login') {
        toast.error(i18n.t('sessionExpired'));
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Show generic error toasts for other errors (skip if it's an expected auth check)
    if (!isAuthRoute) {
      const message = error.response?.data?.message || i18n.t('unexpectedError');
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
