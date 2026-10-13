'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentApi, ConfirmPaymentResponse } from '@/app/api/paymentApi';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentIntentId = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<ConfirmPaymentResponse | null>(null);

  useEffect(() => {
    async function verifyAndConfirm() {
      if (!paymentIntentId) {
        setErrorMessage('No payment intent was found in the return URL.');
        setLoading(false);
        return;
      }

      if (redirectStatus && redirectStatus !== 'succeeded') {
        setErrorMessage(`Payment returned with status: ${redirectStatus}`);
        setLoading(false);
        return;
      }

      try {
        // Confirm payment with backend to activate subscription
        const res = await paymentApi.confirmPayment({
          paymentIntentId,
        });

        setConfirmData(res);
        setSuccess(true);
      } catch (err: any) {
        console.error('Confirmation error:', err);
        // If it was already confirmed via webhook, fetch current subscription
        try {
          const subRes = await paymentApi.getMySubscription();
          const subData = subRes?.data || subRes;
          if (subData?.status === 'ACTIVE') {
            setSuccess(true);
            return;
          }
        } catch (_) {}

        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            'Failed to confirm your subscription activation.'
        );
      } finally {
        setLoading(false);
      }
    }

    verifyAndConfirm();
  }, [paymentIntentId, redirectStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9F5] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-[24px] p-8 max-w-md w-full text-center shadow-lg border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C1C] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1C2C1C] mb-2">Verifying Payment...</h2>
          <p className="text-sm text-gray-500">
            Please wait while we confirm your Stripe payment and activate your subscription.
          </p>
        </div>
      </div>
    );
  }

  if (!success) {
    return (
      <div className="min-h-screen bg-[#F8F9F5] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-[24px] p-8 max-w-md w-full text-center shadow-lg border border-red-100">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-2xl font-bold text-[#1C2C1C] mb-2">Payment Verification Issue</h2>
          <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>

          <div className="space-y-3">
            <Link
              href="/trader/billing"
              className="block w-full py-3 px-4 bg-[#1C2C1C] text-white font-bold text-sm rounded-xl hover:bg-[#2C4A2C] transition-colors"
            >
              Return to Billing
            </Link>
            <Link
              href="/pricing"
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
            >
              Back to Pricing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9F5] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-[28px] p-8 sm:p-10 max-w-lg w-full text-center shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-[#6E9625]/15 text-[#6E9625] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={36} />
        </div>

        <span className="text-[11px] font-black uppercase tracking-widest text-[#6E9625] block mb-1">
          Payment Confirmed
        </span>
        <h1 className="text-3xl font-extrabold text-[#1C2C1C] mb-3">Subscription Activated!</h1>
        <p className="text-sm text-[#1C2C1C]/60 mb-8 leading-relaxed">
          Your payment was processed successfully with Stripe. Your trader account features and lead access are now unlocked.
        </p>

        {confirmData?.payment && (
          <div className="bg-[#F8F9F5] rounded-2xl p-4 mb-8 text-left border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction ID:</span>
              <span className="font-mono font-medium text-[#1C2C1C]">
                {confirmData.payment.transactionId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Charged:</span>
              <span className="font-bold text-[#1C2C1C]">
                €{Number(confirmData.payment.amount).toFixed(2)} {confirmData.payment.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subscription Status:</span>
              <span className="font-bold text-[#6E9625]">
                {confirmData.subscription?.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/trader/dashboard')}
            className="flex-1 py-3.5 px-6 bg-[#1C2C1C] text-white font-bold text-sm rounded-xl hover:bg-[#2C4A2C] transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Go to Dashboard</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => router.push('/trader/billing')}
            className="py-3.5 px-6 bg-gray-100 text-[#1C2C1C] font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
          >
            View Billing
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9F5] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C2C1C]" />
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
