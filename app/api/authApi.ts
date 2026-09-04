import api from '@/utils/api';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/utils/auth';

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

  // Fetch my subscription
  getMySubscription: async () => {
    const { data } = await api.get("/api/subscriptions/my-subscription");
    return data;
  },

  // Change subscription plan
  changePlan: async (payload: { planId: string; billingCycle?: string }) => {
    const { data } = await api.patch("/api/subscriptions/change-plan", payload);
    return data;
  },

  // Save trader's selected categories, skill services, and sub-categories
  saveTraderCategories: async (payload: {
    tradeCategories: string[];
    skillServiceIds: string[];
    subCategoryIds: string[];
  }) => {
    const { data } = await api.put("/api/auth/trader/categories", payload);
    return data;
  },

  // Update category selection for an existing subscription
  updateSubscriptionCategories: async (payload: {
    traderId: string;
    planId: string;
    tradeCategories: string[];
    skillsServices: string[];
    subCategories: string[];
  }) => {
    const { data } = await api.put("/api/subscriptions/category-selection", payload);
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
    localStorage.removeItem('user');
    clearTokens();
    if (router && typeof router.replace === "function") {
      router.replace('/auth/login');
    } else {
      window.location.replace('/auth/login');
    }
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

  // Update trader assets (portfolio, certificates, etc.)
  updateTraderAssets: async (formData: FormData) => {
    const { data } = await api.put("/api/auth/update-trader-assets", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Fetch a specific trader profile by ID (Customer side)
  getTraderProfileById: async (traderId: string) => {
    const { data } = await api.get(`/api/customer/traders/${traderId}`);
    return data;
  },

  // Fetch public trader profile by ID (Public API with latitude and longitude)
  getPublicTraderProfileById: async (traderId: string, latitude: number = 22.5530, longitude: number = 75.7569) => {
    const { data } = await api.get(`/api/customer/public/traders/${traderId}?latitude=${latitude}&longitude=${longitude}`);
    return data;
  },

  // Fetch customer dashboard details
  getCustomerDashboard: async () => {
    const { data } = await api.get('/api/customer/dashboard');
    return data;
  },

  // Fetch trader dashboard details
  getTraderDashboard: async () => {
    const { data } = await api.get('/api/trader/dashboard');
    return data;
  },

  // Fetch customer profile as seen by a trader
  getCustomerProfileForTrader: async (customerId: string) => {
    const { data } = await api.get(`/api/trader/dashboard/customer/${customerId}`);
    return data;
  },

  // Fetch jobs posted by the current customer
  getMyJobs: async (page = 1, limit = 5) => {
    const response = await api.get(`/api/jobs/my-jobs?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Fetch full details of a specific job by ID
  getCustomerJobById: async (jobId: string) => {
    const { data } = await api.get(`/api/customer/jobs/${jobId}`);
    return data;
  },

  // Fetch unreviewed completed jobs for customer
  getUnreviewedCompletedJobs: async () => {
    const { data } = await api.get('/api/customer/unreviewed-completed-jobs');
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

  // Update an existing job
  updateJob: async (jobId: string, formData: FormData) => {
    const { data } = await api.patch(`/api/jobs/${jobId}`, formData, {
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

  getInteractedTraders: async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}api/customer/interacted-traders`;
    return fetchWithAuth(url);
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
  sendJobQuote: async (jobId: string, payload: FormData | { price: number; estimatedDays: number; message: string }) => {
    if (payload instanceof FormData) {
      const { data } = await api.post(`/api/quotes/${jobId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
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

  // Reject/Decline a quote
  rejectQuote: async (quoteId: string) => {
    const { data } = await api.post(`/api/quotes/reject/${quoteId}`);
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

  closeJob: async (jobId: string, data?: any) => {
    const response = await api.post(`/api/jobs/${jobId}/close`, data);
    return response.data;
  },

  // Fetch all quotes for the current customer
  getMyQuotes: async (page = 1, limit = 10) => {
    const response = await api.get("/api/quotes/my-quotes", {
      params: {
        page,
        limit,
      },
    });

    return response.data;
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

  updateQuote: async (
    quoteId: string,
    payload: FormData | { price: number; estimatedDays: number; message: string; attachments?: string[] }
  ) => {
    if (payload instanceof FormData) {
      const { data } = await api.patch(`/api/quotes/${quoteId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    const { data } = await api.patch(`/api/quotes/${quoteId}`, payload);
    return data;
  },

  // Withdraw (delete) a quote
  withdrawQuote: async (quoteId: string) => {
    const { data } = await api.delete(`/api/quotes/${quoteId}`);
    return data;
  },

  // -----------------------------------------------------------------
  // NEW – log out the current trader (invalidate server‑side session / token)
  // -----------------------------------------------------------------
  logout: async () => {
    const { data } = await api.post('/api/auth/logout');
    return data;
  },

  deactivateAccount: async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}api/auth/deactivate`;
    return fetchWithAuth(url, { method: 'POST' });
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

  // Submit a review – supports FormData
  postReview: async (payload: any) => {
    if (payload instanceof FormData) {
      const { data } = await api.post('/api/reviews', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    const { data } = await api.post('/api/reviews', payload);
    return data;
  },

  // Fetch reviews written by the current customer
  getMyReviews: async () => {
    const { data } = await api.get("api/reviews/my-reviews");
    return data;
  },

  // Update a review – supports FormData
  updateReview: async (reviewId: string, payload: any) => {
    if (payload instanceof FormData) {
      const { data } = await api.put(`/api/reviews/${reviewId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    const { data } = await api.put(`/api/reviews/${reviewId}`, payload);
    return data;
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

  getPublicReviews: async (page = 1, limit = 10) => {
    const { data } = await api.get(`/api/reviews/all/public?page=${page}&limit=${limit}`);
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
    try {
      const { data } = await api.patch('/api/notification/read-all');
      return data;
    } catch (e) {
      try {
        const { data } = await api.put('/api/notification/read-all');
        return data;
      } catch (e2) {
        try {
          const { data } = await api.post('/api/notification/read-all');
          return data;
        } catch (e3) {
          const { data } = await api.patch('/api/notifications/read-all');
          return data;
        }
      }
    }
  },

  markNotificationRead: async (id: string | number) => {
    try {
      const { data } = await api.patch(`/api/notification/${id}/read`);
      return data;
    } catch (e) {
      try {
        const { data } = await api.put(`/api/notification/${id}/read`);
        return data;
      } catch (e2) {
        try {
          const { data } = await api.patch(`/api/notification/${id}`, { isRead: true });
          return data;
        } catch (e3) {
          return null;
        }
      }
    }
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

  getOrCreateTraderConversation: async (customerId: string, jobId?: string) => {
    console.log("customerId", customerId);
    console.log("jobId", jobId);
    const { data } = await api.post(`/api/conversations/trader/${customerId}`, jobId ? { jobId } : undefined);
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
  // tradeCategories: string[];
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
  const { data } = await api.get(`/api/auth/trader/registration-status?t=${Date.now()}`);
  return data;
};
