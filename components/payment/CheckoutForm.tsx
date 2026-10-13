'use client';

import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { paymentApi, ConfirmPaymentResponse } from '@/app/api/paymentApi';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export interface CheckoutFormProps {
  paymentIntentId: string;
  planId: string;
  priceId: string;
  amount: number;
  currency: string;
  planName?: string;
  isUpgrade?: boolean;
  onSuccess: (data: ConfirmPaymentResponse) => void;
  onError: (errorMessage: string) => void;
  onCancel: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  paymentIntentId,
  planId,
  priceId,
  amount,
  currency,
  planName,
  isUpgrade = false,
  onSuccess,
  onError,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe has not finished loading
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Confirm payment with Stripe Elements
      // Note: redirect: 'if_required' allows resolving in-page if 3DS/SCA challenge is handled inline
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/subscription/success`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        const msg = result.error.message || 'Payment processing failed';
        setErrorMessage(msg);
        onError(msg);
        setIsProcessing(false);
        return;
      }

      // 2. Check if PaymentIntent succeeded
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // 3. Notify backend to activate / upgrade subscription in database
        const confirmRes = await paymentApi.confirmPayment({
          paymentIntentId: result.paymentIntent.id,
          planId,
          priceId,
        });

        setIsProcessing(false);
        onSuccess({
          ...confirmRes,
          paymentIntentId: result.paymentIntent.id,
        });
      } else {
        // Status might be 'processing' or 'requires_action'
        setErrorMessage('Payment is still processing or requires additional verification.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || 'An unexpected error occurred during payment.';
      setErrorMessage(msg);
      onError(msg);
      setIsProcessing(false);
    }
  };

  const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : Number(amount || 0).toFixed(2);
  const displayCurrency = (currency || 'EUR').toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {/* Payment Summary Box */}
      <div className="bg-[#F8F9F5] border border-[#243A2414] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#1C2C1C]/60 uppercase tracking-wider block">
            {planName
              ? isUpgrade
                ? `${planName} Upgrade (Prorated)`
                : `${planName} Subscription`
              : 'Total Due Today'}
          </span>
          <span className="text-2xl font-black text-[#1C2C1C]">
            €{formattedAmount} <span className="text-xs font-medium text-gray-500">{displayCurrency}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6E9625] bg-[#6E9625]/10 px-3 py-1.5 rounded-full text-xs font-bold">
          <ShieldCheck size={14} />
          <span>Encrypted</span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="py-2">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-start gap-2.5">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-600" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* Trust & Security Badge */}
      <div className="flex items-center justify-between text-[11px] text-[#1C2C1C]/50 px-1 pt-1">
        <span className="flex items-center gap-1">
          <Lock size={12} /> 256-Bit SSL Encrypted Checkout
        </span>
        <span className="font-semibold text-blue-600">Powered by Stripe</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-1/3 py-3 px-4 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 py-3 px-6 rounded-xl text-sm font-bold text-white bg-[#1C2C1C] hover:bg-[#2C4A2C] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Processing Payment...</span>
            </>
          ) : (
            <span>
              {isUpgrade
                ? `Pay Prorated (€${formattedAmount})`
                : `Pay & Activate (€${formattedAmount})`}
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
