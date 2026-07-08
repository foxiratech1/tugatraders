import api from '@/utils/api';
import { getAccessToken, getRefreshToken, setTokens } from '@/utils/auth';

/**
 * Authenticated fetch with automatic token refresh.
 * - Attaches the current access token.
 * - On 401, attempts ONE token refresh then retries.
 * - On any failure, throws an Error — callers handle UX (no redirect here).
 */
async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const buildHeaders = (): Record<string, string> => {
    const token = getAccessToken();
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  // ── First attempt ────────────────────────────────────────────────────────
  let response = await fetch(url, { ...options, headers: buildHeaders() });

  // ── On 401 try token refresh ─────────────────────────────────────────────
  if (response.status === 401) {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      let newAccess: string | undefined;
      try {
        const refreshRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ refreshToken }),
          }
        );
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          newAccess =
            refreshData?.accessToken ||
            refreshData?.access_token ||
            refreshData?.token ||
            refreshData?.data?.accessToken;
          const newRefresh =
            refreshData?.refreshToken ||
            refreshData?.refresh_token ||
            refreshData?.data?.refreshToken ||
            refreshToken;
          if (newAccess) {
            setTokens(newAccess, newRefresh);
          }
        }
      } catch {
        // refresh request itself failed — fall through to throw below
      }

      if (newAccess) {
        // Retry original request with the new token
        const retryHeaders = buildHeaders();
        retryHeaders.Authorization = `Bearer ${newAccess}`;
        response = await fetch(url, { ...options, headers: retryHeaders });
      }
    }

    // If still 401 after refresh attempt (or no refresh token), throw — do NOT redirect
    if (response.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
  }

  // ── Parse response ───────────────────────────────────────────────────────
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }
  return data;
}


export const authApi = {
  // Fetch main categories
  getCategories: async () => {
    const { data } = await api.get("/api/master/categories");
    return data;
  },

  // Fetch skill/services for a given category ID
  getSkillServices: async (categoryId: string) => {
    const { data } = await api.get(
      `/api/master/skill-services/${categoryId}`
    );
    return data;
  },

  // Fetch sub-categories for a given skill/service ID
  getSubCategories: async (skillServiceId: string) => {
    const { data } = await api.get(
      `/api/master/sub-categories/${skillServiceId}`
    );
    return data;
  },

  // Fetch sub-sub-categories for a given sub-category ID
  getSubSubCategories: async (subCategoryId: string) => {
    const { data } = await api.get(
      `/api/master/sub-sub-categories/${subCategoryId}`
    );
    return data;
  },

  // Fetch subscription plans
  getPlans: async () => {
    const { data } = await api.get("/api/admin-plan");
    return data;
  },

  // Authentication – forgot password
  forgotPassword: async (payload: { email: string }) => {
    const { data } = await api.post('/api/auth/forgot-password', payload);
    return data;
  },

  // Authentication – login
  login: async (payload: {
    email: string; password: string, latitude?: number;
    longitude?: number;
  }) => {
    const { data } = await api.post('/api/auth/login', payload);
    return data;
  },

  // Authentication – register customer
  register: async (payload: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    confirmPassword?: string;
    isCheckedTermsCondition?: boolean;
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    const { data } = await api.post('/api/auth/customer/register', payload);
    return data;
  },

  // Logout handler – clear client storage and call server logout
  handleLogout: async (router: any) => {
    try {
      // Invalidate server session (if any)
      await authApi.logout();
    } catch (err) {
      console.error('Logout API error', err);
    }
    // Remove client‑side tokens & redirect
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/auth/login');
  },

  verifyForgotOtp: async (payload: { email: string; otp: string; password?: string }) => {
    const { data } = await api.post('/api/auth/verify-forgot-otp', payload);
    return data;
  },

  resetPassword: async (payload: { resetToken: string; password: string; confirmPassword: string }) => {
    const { data } = await api.post('/api/auth/reset-password', payload);
    return data;
  },
  resendForgotOtp: async (payload: { email: string }) => {
    const { data } = await api.post('/api/auth/resend-forgot-otp', payload);
    return data;
  },

  // Authentication – change password
  changePassword: async (
    payload: {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    }
  ) => {
    console.log("Base URL:", api.defaults.baseURL);
    console.log("Payload:", payload);

    const response = await api.post(
      "/api/auth/change-password",
      payload
    );

    console.log("Response:", response);

    return response.data;
  },

  // Fetch current trader profile (includes verification status, subscription, etc.)
  getMyProfile: async () => {
    const { data } = await api.get("/api/auth/getMyProfile");
    return data;
  },

  // Fetch jobs posted by the current customer
  getMyJobs: async () => {
    const { data } = await api.get("/api/jobs/my-jobs");
    return data;
  },

  // Post a new job
  postJob: async (formData: FormData) => {
    const { data } = await api.post("/api/jobs", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Fetch matched jobs for the trader
  getMatchedJobs: async () => {
    const { data } = await api.get("/api/jobs/matched-jobs");
    return data;
  },

  // Search traders – uses fetchWithAuth for token refresh support
  searchTraders: async (params?: Record<string, any>) => {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}api/customer/search-traders`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    return fetchWithAuth(url.toString());
  },

  // Toggle save/bookmark trader
  toggleSaveTrader: async (traderId: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}api/customer/${traderId}/toggle-save`;
    return fetchWithAuth(url, { method: 'POST' });
  },

  // Get all saved/bookmarked traders
  getSavedTraders: async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}api/customer/get-save-traders`;
    return fetchWithAuth(url);
  },

  // Send a job quote
  sendJobQuote: async (jobId: string, payload: { price: number; estimatedDays: number; message: string }) => {
    const { data } = await api.post(`/api/quotes/${jobId}`, payload);
    return data;
  },

  // Fetch quotes for a specific job
  getJobQuotes: async (jobId: string) => {
    const { data } = await api.get(`/api/quotes/job/${jobId}`);
    return data;
  },

  // Accept a quote
  acceptQuote: async (quoteId: string) => {
    const { data } = await api.post(`/api/quotes/accept/${quoteId}`);
    return data;
  },

  // Job actions
  startJob: async (jobId: string) => {
    const { data } = await api.patch(`/api/jobs/${jobId}/start`);
    return data;
  },
  completeJob: async (jobId: string) => {
    const { data } = await api.patch(`/api/jobs/${jobId}/complete`);
    return data;
  },
  cancelJob: async (jobId: string) => {
    const { data } = await api.patch(`/api/jobs/${jobId}/cancel`);
    return data;
  },

  // Fetch all quotes for the current customer
  getMyQuotes: async () => {
    const { data } = await api.get('/api/quotes/my-quotes');
    return data;
  },

  getMyQuoteByJobId: async (jobId: string) => {
    const { data } = await api.get(`/api/quotes/my-quote/${jobId}`);
    return data;
  },

  // -----------------------------------------------------------------
  // Fetch a single quote by its ID
  getQuoteDetail: async (quoteId: string) => {
    const { data } = await api.get(`/api/quotes/${quoteId}`);
    return data;
  },

  // -----------------------------------------------------------------
  // NEW – log out the current trader (invalidate server‑side session / token)
  // -----------------------------------------------------------------
  logout: async () => {
    const { data } = await api.post('/api/auth/logout');
    return data;
  },
  // Submit contact form
  submitContactForm: async (formData: FormData) => {
    const { data } = await api.post("/api/contact", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Get customer contact submissions
  getContactSubmissions: async () => {
    const { data } = await api.get("/api/contact");
    return data;
  },

  // Submit a review – uses fetchWithAuth for automatic token refresh
  postReview: async (payload: any) => {
    return fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Fetch reviews written by the current customer
  getMyReviews: async () => {
    const { data } = await api.get("api/reviews/my-reviews");
    return data;
  },

  // Update a review – uses fetchWithAuth for automatic token refresh
  updateReview: async (reviewId: string, payload: any) => {
    return fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteReview: async (reviewId: string) => {
    const { data } = await api.delete(`/api/reviews/${reviewId}`);
    return data;
  },

  // -----------------------------------------------------------------
  // Reviews (Trader & General)
  // -----------------------------------------------------------------
  getReviewById: async (reviewId: string) => {
    const { data } = await api.get(`/api/reviews/${reviewId}`);
    return data;
  },

  getTraderReviews: async (traderId: string) => {
    const { data } = await api.get(`/api/reviews/trader/${traderId}`);
    return data;
  },

  getOwnReviews: async (page = 1, limit = 10) => {
    const { data } = await api.get(`/api/reviews/own/my-reviews?page=${page}&limit=${limit}`);
    return data;
  },

  getTraderReviewSummary: async (traderId: string) => {
    const { data } = await api.get(`/api/reviews/trader/${traderId}/summary`);
    return data;
  },

  replyToReview: async (reviewId: string, reply: string) => {
    const { data } = await api.post(`/api/reviews/${reviewId}/reply`, { reply });
    return data;
  },

  getPublicFaqs: async () => {
    const { data } = await api.get('/api/faq/public');
    return data;
  },

  getMyNotifications: async () => {
    const { data } = await api.get('/api/notification/my-notifications');
    return data;
  },

  markNotificationsReadAll: async () => {
    const { data } = await api.patch('/api/notification/read-all');
    return data;
  },

  // Update customer profile – supports multipart (profile image upload)
  updateProfile: async (payload: FormData | Record<string, any>) => {
    if (payload instanceof FormData) {
      const { data } = await api.put('/api/auth/updateProfile', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    const { data } = await api.put('/api/auth/updateProfile', payload);
    return data;
  },

  report: async (payload: {
    reportType: string;
    targetId: string;
    reason: string;
    customReason?: string;
  }) => {
    const { data } = await api.post("/api/report", payload);
    return data;
  },

  getMyReports: async (page = 1, limit = 10) => {
    const { data } = await api.get(`/api/report/my?page=${page}&limit=${limit}`);
    return data;
  },

  getConversations: async () => {
    const { data } = await api.get("/api/conversations");
    return data;
  },

  getOrCreateConversation: async (traderId: string, jobId?: string) => {
    const { data } = await api.post(`/api/conversations/${traderId}`, jobId ? { jobId } : undefined);
    return data;
  },

  getChatMessages: async (conversationId: string) => {
    const { data } = await api.get(`/api/chat/${conversationId}/messages`);
    return data;
  },

  sendChatMessage: async (formData: FormData) => {
    const { data } = await api.post("/api/chat/send-message", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

// ─── Trader registration API ────────────────────────────────────────────────
export const traderRegister = async (payload: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  tradeCategories: string[];
  workRadius: number;
  latitude: number;
  longitude: number;
  isCheckedTermsCondition: boolean;
  contactNumber: string;
}) => {
  const { data } = await api.post('/api/auth/trader/register-step-1', payload);
  return data;
};

export const verifyOtp = async (payload: { otp: string }) => {
  const { data } = await api.post('/api/auth/verify-otp', payload);
  return data;
};

export const resendOtp = async (payload: { email: string }) => {
  const { data } = await api.post('/api/auth/resend-verification-otp', payload);
  return data;
};

export const traderRegisterStep2 = async (payload: FormData) => {
  const { data } = await api.put('/api/auth/trader/register-step-2', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const traderRegisterStep3 = async (payload: { planId: string; priceId: string }) => {
  const { data } = await api.put('/api/auth/trader/register-step-3', payload);
  return data;
};

export const getRegistrationStatus = async () => {
  const { data } = await api.get('/api/auth/trader/registration-status');
  return data;
};
