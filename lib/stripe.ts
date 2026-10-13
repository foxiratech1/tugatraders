import { loadStripe, Stripe } from '@stripe/stripe-js';
import { paymentApi } from '@/app/api/paymentApi';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Initializes and returns the Stripe JS instance using a singleton pattern.
 * Attempts to retrieve the publishable key dynamically from the backend endpoint
 * GET /api/payments/config, falling back to NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
 */
export const getStripe = async (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = (async () => {
      try {
        // Option A: Fetch publishable key from backend endpoint
        const config = await paymentApi.getStripeConfig();
        const key = config?.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!key) {
          throw new Error('Stripe Publishable Key not available from config or env');
        }
        return await loadStripe(key);
      } catch (err) {
        // Option B: Fallback to environment variable
        const fallbackKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
        if (fallbackKey) {
          return await loadStripe(fallbackKey);
        }
        console.warn('Stripe publishable key missing from both backend and environment variables.');
        return null;
      }
    })();
  }
  return stripePromise;
};

/**
 * Reset singleton instance (useful during testing or key change)
 */
export const resetStripe = () => {
  stripePromise = null;
};
