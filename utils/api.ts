import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, parseJwt } from './auth';

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

// Response interceptor to handle token refresh and unauthorized errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    // Do not attempt token refresh or login redirects on auth and public endpoints
    if (
      url.endsWith('/login') ||
      url.endsWith('/register') ||
      url.endsWith('/verify-otp') ||
      url.endsWith('/resend-verification-otp') ||
      url.endsWith('/forgot-password') ||
      url.endsWith('/reset-password') ||
      url.endsWith('/verify-forgot-otp') ||
      url.includes('/register-step-') ||
      url.includes('/public/')
    ) {
      return Promise.reject(error);
    }
    // If error is 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if the user's access token is actually expired
      const token = getAccessToken();
      let isTokenExpired = false;
      if (token) {
        const decoded = parseJwt(token);
        if (decoded?.exp && decoded.exp * 1000 <= Date.now()) {
          isTokenExpired = true;
        }
      } else {
        isTokenExpired = true;
      }

      // If token is still valid (not expired) and this is not a core auth profile check,
      // it is a resource-level or permission error (e.g. conversation or trader lookup)
      // DO NOT clear tokens and DO NOT log the user out!
      const isCoreAuthEndpoint = url.includes('/api/auth/getMyProfile') || url.includes('/api/auth/me');
      if (!isTokenExpired && !isCoreAuthEndpoint) {
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const cleanBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
          const { data } = await axios.post(`${cleanBaseUrl}/api/auth/refresh`, { refreshToken });
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
