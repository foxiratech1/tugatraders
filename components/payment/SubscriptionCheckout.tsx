'use client';

import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { getStripe } from '@/lib/stripe';
import { paymentApi, ConfirmPaymentResponse } from '@/app/api/paymentApi';
import { CheckoutForm } from './CheckoutForm';
import { X, AlertCircle } from 'lucide-react';

export interface SubscriptionCheckoutProps {
  planId: string;
  priceId: string;
  planName?: string;
  amount?: number;
  currency?: string;
  isUpgrade?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (res: ConfirmPaymentResponse) => void;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  planId,
  priceId,
  planName,
  amount: propAmount,
  currency: propCurrency,
  isUpgrade = false,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [amount, setAmount] = useState<number>(propAmount || 0);
  const [currency, setCurrency] = useState<string>(propCurrency || 'EUR');
  const [loading, setLoading] = useState<boolean>(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !planId || !priceId) return;

    let isMounted = true;

    async function initCheckout() {
      setLoading(true);
      setInitError(null);

      try {
        // 1. Initialize Stripe JS SDK instance
        const stripe = await getStripe();
        if (isMounted) setStripeInstance(stripe);

        if (!stripe) {
          throw new Error('Could not initialize Stripe. Please verify your Stripe publishable key.');
        }

        // 2. Request PaymentIntent from backend (pass prorated amount if upgrading)
        const intentData = await paymentApi.createPaymentIntent({
          planId,
          priceId,
          amount: propAmount,
          currency: propCurrency,
        });

        if (isMounted) {
          if (!intentData?.clientSecret) {
            throw new Error('Payment initialization response was missing clientSecret.');
          }
          setClientSecret(intentData.clientSecret);
          setPaymentIntentId(intentData.paymentIntentId);
          setAmount(Number(intentData.amount) || propAmount || 0);
          setCurrency(intentData.currency || propCurrency || 'EUR');
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          const msg =
            err.response?.data?.message || err.message || 'Failed to initialize payment session.';
          setInitError(msg);
          setLoading(false);
        }
      }
    }

    initCheckout();

    return () => {
      isMounted = false;
    };
  }, [isOpen, planId, priceId, propAmount, propCurrency]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C2C1C]/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-[540px] bg-white rounded-[24px] shadow-2xl p-6 sm:p-8 my-8 border border-[#243A240A]">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close checkout"
          className="absolute top-5 right-5 text-gray-400 hover:text-[#1C2C1C] p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#6E9625] uppercase tracking-wider block mb-1">
            Secure Subscription Checkout
          </span>
          <h2 className="text-2xl font-bold text-[#1C2C1C]">
            {planName ? `Subscribe to ${planName}` : 'Subscribe to Plan'}
          </h2>
          <p className="text-sm text-[#1C2C1C]/60 mt-1">
            Complete your payment details to activate your trader membership.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1C2C1C] mb-4"></div>
            <p className="text-sm font-medium text-gray-600">Preparing secure Stripe checkout session...</p>
            <p className="text-xs text-gray-400 mt-1">Generating payment intent</p>
          </div>
        )}

        {/* Error State */}
        {initError && (
          <div className="p-5 bg-red-50 text-red-700 rounded-2xl border border-red-200 mb-2">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm mb-1">Payment Initialization Failed</p>
                <p className="text-xs text-red-600 leading-relaxed mb-4">{initError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setInitError(null);
                      setLoading(true);
                      // Trigger re-init
                      getStripe()
                        .then((s) => {
                          setStripeInstance(s);
                          return paymentApi.createPaymentIntent({ planId, priceId });
                        })
                        .then((res) => {
                          setClientSecret(res.clientSecret);
                          setPaymentIntentId(res.paymentIntentId);
                          setAmount(Number(res.amount) || 0);
                          setCurrency(res.currency || 'EUR');
                          setLoading(false);
                        })
                        .catch((e) => {
                          setInitError(e.response?.data?.message || e.message);
                          setLoading(false);
                        });
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Retry
                  </button>
                  <button
                    onClick={onClose}
                    className="px-3.5 py-1.5 text-xs font-bold bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form when ready */}
        {!loading && !initError && clientSecret && stripeInstance && (
          <Elements
            stripe={stripeInstance}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#1C2C1C',
                  colorBackground: '#ffffff',
                  colorText: '#1C2C1C',
                  borderRadius: '12px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                },
              },
            }}
          >
            <CheckoutForm
              paymentIntentId={paymentIntentId}
              planId={planId}
              priceId={priceId}
              planName={planName}
              amount={amount}
              currency={currency}
              isUpgrade={isUpgrade}
              onSuccess={(res) => {
                onPaymentSuccess({
                  ...res,
                  paymentIntentId: (res as any)?.paymentIntentId || paymentIntentId,
                });
                onClose();
              }}
              onError={(err) => console.error('Payment Error:', err)}
              onCancel={onClose}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
