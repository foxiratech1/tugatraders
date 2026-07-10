import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});
console.log("NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);
console.log("Axios Base URL =", api.defaults.baseURL);
// Request interceptor to add the access token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    console.log("Token:", token);
    console.log("Request URL:", config.url);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    // Do not attempt token refresh on auth endpoints
    if (
      url.endsWith('/login') ||
      url.endsWith('/register') ||
      url.endsWith('/verify-otp') ||
      url.endsWith('/resend-verification-otp') ||
      url.endsWith('/forgot-password') ||
      url.endsWith('/reset-password') ||
      url.endsWith('/verify-forgot-otp') ||
      url.includes('/register-step-')
    ) {
      return Promise.reject(error);
    }
    // If error is 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, { refreshToken });
          const newAccessToken = data?.accessToken || data?.access_token || data?.token;
          const newRefreshToken = data?.refreshToken || data?.refresh_token || refreshToken;
          if (newAccessToken) {
            setTokens(newAccessToken, newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
