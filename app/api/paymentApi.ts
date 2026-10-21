import api from '@/utils/api';

// Stripe payment endpoints — see STRIPE_FRONTEND_INTEGRATION_GUIDE.md (section 2).
// Uses the shared axios client so JWT attachment + token refresh behave like the rest of the app.

export interface StripeConfigResponse {
  publishableKey: string;
}

export interface SubscriptionPrice {
  id: string;
  planId?: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  amount: number | string;
  currency: string;
  isActive: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  maxTrades: number;
  unlimitedTrades?: boolean;
  maxQuotesPerDay: number;
  trialEnabled?: boolean;
  trialDays?: number;
  isActive?: boolean;
  prices: SubscriptionPrice[];
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  publishableKey?: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  payment: {
    id: string;
    amount: string;
    currency: string;
    status: string;
    transactionId: string;
    paidAt: string;
  };
  subscription: {
    id: string;
    planId: string;
    status: string;
    nextBillingDate: string;
    billingCycle?: string;
  };
  paymentIntentId?: string;
}

export interface PaymentHistoryItem {
  id: string;
  subscriptionId?: string;
  amount: string | number;
  currency: string;
  status: string;
  paymentProvider: string;
  transactionId: string;
  paidAt: string | null;
  failureReason?: string | null;
  createdAt: string;
}

export interface ChangePlanData {
  currentPlan?: { id: string; name: string };
  targetPlan?: { id: string; name: string };
  pendingPlan?: { id: string; name: string } | null;
  planId?: string;
  priceId?: string;
  billingCycle?: 'MONTHLY' | 'YEARLY';
  proratedAmount?: number;
  currency?: string;
  trial?: boolean;
  effectiveDate?: string;
}

export interface ChangePlanResponse {
  success: boolean;
  requiresPayment: boolean;
  message: string;
  data: ChangePlanData;
}

// Backend responses are sometimes wrapped in { data: ... } — unwrap defensively.
const unwrap = <T,>(res: any): T => (res && res.data !== undefined && !Array.isArray(res) && !res.clientSecret && !res.success ? res.data : res);

export const paymentApi = {
  // 1. Stripe publishable key (public)
  getStripeConfig: async (): Promise<StripeConfigResponse> => {
    const { data } = await api.get('/api/payments/config');
    return unwrap<StripeConfigResponse>(data);
  },

  // 2. Subscription plans + prices
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const { data } = await api.get('/api/admin-plan');
    return unwrap<SubscriptionPlan[]>(data) || [];
  },

  // 3. Create PaymentIntent (supports amount for prorated upgrades)
  createPaymentIntent: async (params: {
    planId?: string;
    priceId?: string;
    amount?: number;
    currency?: string;
  }): Promise<CreatePaymentIntentResponse> => {
    const { data } = await api.post('/api/payments/create-intent', params);
    return unwrap<CreatePaymentIntentResponse>(data);
  },

  // 4. Confirm payment & activate subscription
  confirmPayment: async (params: {
    paymentIntentId: string;
    planId?: string;
    priceId?: string;
  }): Promise<ConfirmPaymentResponse> => {
    const { data } = await api.post('/api/payments/confirm', params);
    return data;
  },

  // 5. Payment history
  getPaymentHistory: async (): Promise<PaymentHistoryItem[]> => {
    const { data } = await api.get('/api/payments/history');
    const list = unwrap<PaymentHistoryItem[]>(data);
    return Array.isArray(list) ? list : [];
  },

  // 6. Current subscription
  getMySubscription: async () => {
    const { data } = await api.get('/api/subscriptions/my-subscription');
    return data;
  },

  // 7. Change Plan / Upgrade / Downgrade (Endpoint 7 from guide)
  changePlan: async (params: {
    planId: string;
    billingCycle?: 'MONTHLY' | 'YEARLY';
    paymentIntentId?: string;
  }): Promise<ChangePlanResponse> => {
    const { data } = await api.patch('/api/subscriptions/change-plan', params);
    return data;
  },

  // 8. Cancel pending scheduled subscription downgrade
  cancelPendingDowngrade: async () => {
    const { data } = await api.delete('/api/subscriptions/cancel-pending-downgrade');
    return data;
  },
};

