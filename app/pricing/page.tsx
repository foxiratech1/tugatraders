'use client';

import React, { useEffect, useState } from 'react';
import { paymentApi, SubscriptionPlan } from '@/app/api/paymentApi';
import { SubscriptionCheckout } from '@/components/payment/SubscriptionCheckout';
import { CheckCircle2, ShieldCheck, Zap, Star } from 'lucide-react';

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string | undefined>(undefined);
  const [checkoutAmount, setCheckoutAmount] = useState<number | undefined>(undefined);
  const [checkoutCurrency, setCheckoutCurrency] = useState<string | undefined>(undefined);
  const [isUpgrade, setIsUpgrade] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    paymentApi
      .getPlans()
      .then((data) => {
        const activePlans = Array.isArray(data) ? data.filter((p) => p.isActive !== false) : [];
        setPlans(activePlans);
      })
      .catch((err) => console.error('Failed to load plans:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    const priceObj = plan.prices?.find((p) => p.billingCycle === billingCycle);
    if (!priceObj) {
      alert(`No ${billingCycle.toLowerCase()} price available for this plan.`);
      return;
    }

    try {
      // Check if logged-in trader already has a subscription and should use Endpoint 7 (change-plan)
      const changeRes = await paymentApi.changePlan({
        planId: plan.id,
        billingCycle,
      });

      if (changeRes?.requiresPayment) {
        // Scenario A: Upgrade with prorated charge
        setSelectedPlanId(changeRes.data?.planId || plan.id);
        setSelectedPriceId(changeRes.data?.priceId || priceObj.id);
        setSelectedPlanName(changeRes.data?.targetPlan?.name || plan.name);
        setCheckoutAmount(changeRes.data?.proratedAmount);
        setCheckoutCurrency(changeRes.data?.currency || 'EUR');
        setIsUpgrade(true);
        setIsModalOpen(true);
        return;
      }

      if (changeRes?.requiresPayment === false) {
        // Scenario B or C: Instant trial switch or scheduled downgrade
        setSuccessBanner(
          changeRes.message || 'Subscription updated successfully!'
        );
        return;
      }
    } catch (_) {
      // Fresh subscription or unauthenticated user
    }

    setSelectedPlanId(plan.id);
    setSelectedPriceId(priceObj.id);
    setSelectedPlanName(plan.name);
    setCheckoutAmount(undefined);
    setCheckoutCurrency(undefined);
    setIsUpgrade(false);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black tracking-widest text-[#6E9625] uppercase bg-[#6E9625]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Simple, Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1C2C1C] tracking-tight">
            Upgrade Your TugaTrades Subscription
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#1C2C1C]/60">
            Unlock more quotes per day, showcase your full portfolio, and receive direct customer leads across Portugal.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-8 flex justify-center">
            <div className="bg-[#EBECE6] p-1.5 rounded-full flex items-center shadow-inner">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-[#1C2C1C] text-white shadow-md'
                    : 'text-[#1C2C1C]/60 hover:text-[#1C2C1C]'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  billingCycle === 'YEARLY'
                    ? 'bg-[#1C2C1C] text-white shadow-md'
                    : 'text-[#1C2C1C]/60 hover:text-[#1C2C1C]'
                }`}
              >
                <span>Yearly Billing</span>
                <span className="bg-[#6E9625] text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="mb-8 p-4 bg-[#6E9625]/15 border border-[#6E9625]/30 text-[#2E4A14] rounded-2xl text-center font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={18} className="text-[#6E9625]" />
            <span>🎉 {successBanner}</span>
          </div>
        )}

        {/* Pricing Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C1C]" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium">No subscription plans available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-12">
            {plans.map((plan) => {
              const priceObj = plan.prices?.find((p) => p.billingCycle === billingCycle);
              const price = priceObj ? Number(priceObj.amount) : 0;
              const isPopular = plan.name.toUpperCase().includes('SILVER') || plan.name.toUpperCase().includes('PRO');

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-[24px] p-8 border-2 transition-all flex flex-col justify-between relative shadow-sm hover:shadow-xl ${
                    isPopular
                      ? 'border-[#6E9625] shadow-[0_12px_48px_rgba(110,150,37,0.12)]'
                      : 'border-gray-200 hover:border-[#1C2C1C]/30'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6E9625] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap shadow-sm flex items-center gap-1">
                      <Star size={11} fill="white" /> Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-2xl font-black text-[#1C2C1C]">{plan.name}</h3>
                    <p className="text-xs text-[#1C2C1C]/60 mt-2 min-h-[36px]">
                      {plan.description || 'Professional trade package designed for expanding businesses.'}
                    </p>

                    <div className="mt-6 mb-8 flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-[#1C2C1C]">
                        €{price.toFixed(2)}
                      </span>
                      <span className="text-[#1C2C1C]/50 text-sm font-semibold">
                        /{billingCycle === 'YEARLY' ? 'year' : 'month'}
                      </span>
                    </div>

                    <ul className="space-y-3.5 text-sm text-[#1C2C1C]/80 border-t border-gray-100 pt-6">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-[#6E9625] flex-shrink-0" />
                        <span>Up to <strong>{plan.maxQuotesPerDay}</strong> quotes per day</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-[#6E9625] flex-shrink-0" />
                        <span>
                          <strong>{plan.unlimitedTrades ? 'Unlimited' : plan.maxTrades}</strong> trade categories
                        </span>
                      </li>
                      {plan.trialEnabled && (
                        <li className="flex items-center gap-2.5 text-[#2E4A14] font-bold">
                          <Zap size={16} className="text-[#6E9625] flex-shrink-0" />
                          <span>Includes {plan.trialDays}-day free trial</span>
                        </li>
                      )}
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-[#6E9625] flex-shrink-0" />
                        <span>Instant notification for matching leads</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-[#6E9625] flex-shrink-0" />
                        <span>Customer reviews & verified badge</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`mt-8 w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                      isPopular
                        ? 'bg-[#6E9625] text-white hover:bg-[#5C7E1F]'
                        : 'bg-[#1C2C1C] text-white hover:bg-[#2C4A2C]'
                    }`}
                  >
                    Choose {plan.name}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust & Guarantee Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#6E9625]/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={24} className="text-[#6E9625]" />
            </div>
            <div>
              <h4 className="font-bold text-[#1C2C1C]">Secure Stripe Payments & Cancel Anytime</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                All transactions are encrypted with 256-bit SSL. You can cancel or switch plans at any time from your billing dashboard.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <span>✓ No Hidden Fees</span>
            <span>✓ Instant Activation</span>
          </div>
        </div>

        {/* Subscription Checkout Modal */}
        {selectedPlanId && selectedPriceId && (
          <SubscriptionCheckout
            planId={selectedPlanId}
            priceId={selectedPriceId}
            planName={selectedPlanName}
            amount={checkoutAmount}
            currency={checkoutCurrency}
            isUpgrade={isUpgrade}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onPaymentSuccess={async (res) => {
              if (isUpgrade) {
                const targetPaymentIntentId = (res as any)?.paymentIntentId || (res as any)?.payment?.transactionId;
                try {
                  await paymentApi.changePlan({
                    planId: selectedPlanId,
                    billingCycle,
                    ...(targetPaymentIntentId ? { paymentIntentId: targetPaymentIntentId } : {}),
                  });
                } catch (_) {
                  try {
                    await paymentApi.changePlan({
                      planId: selectedPlanId,
                      billingCycle,
                    });
                  } catch (e) {}
                }
              }
              setSuccessBanner(
                `Your ${res.subscription?.status || 'ACTIVE'} subscription has been activated successfully!`
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
