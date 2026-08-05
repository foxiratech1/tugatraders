"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/app/api/authApi";
import { FileText, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function BillingPage() {
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Switch Plan states
  const [isSwitchPlanModalOpen, setIsSwitchPlanModalOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await authApi.getPlans();
      const activePlans = (res?.data || res || []).filter((p: any) => p.isActive);
      setPlans(activePlans);
      // Set the currently active plan as default selection
      const currentPlanId = subscriptionData?.currentPlan?.id || subscriptionData?.planId;
      if (currentPlanId) {
        setSelectedPlanId(currentPlanId);
      }
      if (subscriptionData?.billingCycle) {
        setBillingCycle(subscriptionData.billingCycle);
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
      toast.error("Failed to load subscription plans.");
    } finally {
      setPlansLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId) {
      toast.error("Please select a plan.");
      return;
    }
    setIsChangingPlan(true);
    try {
      await authApi.changePlan({ planId: selectedPlanId, billingCycle });
      toast.success("Plan updated successfully!");
      setIsSwitchPlanModalOpen(false);
      // Refresh subscription
      setLoading(true);
      const res = await authApi.getMySubscription();
      setSubscriptionData(res?.data || res);
    } catch (error: any) {
      console.error("Failed to change plan", error);
      toast.error(error?.response?.data?.message || "Failed to change plan.");
    } finally {
      setIsChangingPlan(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await authApi.getMySubscription();
        setSubscriptionData(res?.data || res);
      } catch (error) {
        console.error("Failed to load subscription data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F5] pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1280px] mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#1C2C1C]">Subscription & Billing</h1>
          <p className="text-gray-500 mt-1">Manage your subscription plan and payment history.</p>
        </div>

        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-40 bg-gray-200 rounded-xl"></div>
              <div className="h-60 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column (Plan & Billing History) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Active Plan Card */}
              <div className="bg-[#2A3B2A] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold uppercase">
                      {subscriptionData?.currentPlan?.name ? `${subscriptionData.currentPlan.name} ${subscriptionData?.billingCycle || ''}` : "Pro Trader Monthly"}
                    </h2>
                    <p className="text-white/70 mt-1 text-sm">
                      {subscriptionData?.currentPeriodEnd ? `Renews on ${new Date(subscriptionData.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : "Renews on Oct 12, 2024"}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold">
                      €{subscriptionData?.nextBillingAmount || "29.99"} <span className="text-sm font-normal text-white/70">/{subscriptionData?.billingCycle === 'YEARLY' ? 'year' : 'mo'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-6 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#6E9625]" />
                    Unlimited Leads
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#6E9625]" />
                    Verified Badge
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#6E9625]" />
                    Priority Support
                  </div>
                </div>
              </div>

              {/* Billing History Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-[#1C2C1C]">Billing History</h3>
                  <button className="text-sm font-semibold text-[#1C2C1C] underline">View All</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Description</th>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {subscriptionData?.history && subscriptionData.history.length > 0 ? (
                        subscriptionData.history.map((item: any, index: number) => (
                          <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 text-[#1C2C1C]">
                              {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                            </td>
                            <td className="py-4 text-gray-600">{item.description || item.desc || "Subscription"}</td>
                            <td className="py-4 font-medium text-[#1C2C1C]">€{item.amount || "0.00"}</td>
                            <td className="py-4">
                              <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-semibold uppercase">
                                {item.status || "Paid"}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button className="text-[#1C2C1C] hover:text-[#6E9625] transition-colors">
                                <FileText size={18} className="ml-auto" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            No billing history available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column (Payment Methods & Upgrade) */}
            <div className="space-y-6">

              {/* Payment Methods Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#1C2C1C] mb-4">Payment Methods</h3>

                <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-[#1434CB] rounded px-1 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold italic">VISA</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1C2C1C]">•••• 4242</div>
                      <div className="text-xs text-gray-400">Expires 12/25</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Default</span>
                </div>

                <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-[#1C2C1C] hover:border-[#6E9625] hover:text-[#6E9625] transition-colors flex items-center justify-center gap-2">
                  <span>+ Add New Method</span>
                </button>
              </div>

              {/* Upgrade Card */}
              <div className="bg-[#2A3B2A] rounded-2xl p-6 text-white relative overflow-hidden">
                <h3 className="text-lg font-bold mb-2">Upgrade to Yearly</h3>
                <p className="text-sm text-white/70 mb-6 leading-relaxed">
                  Save 20% on your membership by switching to annual billing.
                </p>

                <div className="bg-black/20 rounded-xl p-4 mb-6">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-white/70 mb-1">Annual Deal</div>
                  <div className="text-2xl font-bold flex items-baseline gap-1">
                    €288 <span className="text-sm font-normal text-white/70">/year</span>
                  </div>
                  <div className="text-xs text-white/70 mt-1">Equivalent to €24/mo</div>
                </div>

                <button
                  onClick={() => {
                    setIsSwitchPlanModalOpen(true);
                    fetchPlans();
                  }}
                  className="w-full block text-center bg-white text-[#1C2C1C] font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Switch Plan
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Switch Plan Modal */}
      {isSwitchPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C2C1C]/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-[900px] bg-white rounded-[24px] shadow-2xl p-6 sm:p-10 my-8">
            <button
              onClick={() => setIsSwitchPlanModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <h2 className="text-2xl font-bold text-[#1C2C1C] mb-2 text-center">Change Subscription Plan</h2>
            <p className="text-gray-500 text-sm text-center mb-8">Select a new plan to upgrade or downgrade your account.</p>

            <div className="flex items-center justify-center p-1.5 bg-[#F5F5F5] rounded-full mb-8 max-w-[280px] mx-auto">
              <button
                onClick={() => setBillingCycle("MONTHLY")}
                className={`py-2 px-6 rounded-full text-[13px] font-bold transition-all w-1/2 ${billingCycle === "MONTHLY"
                  ? "bg-white text-[#1C2C1C] shadow-sm"
                  : "text-[#1C2C1C]/50 hover:text-[#1C2C1C]"
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("YEARLY")}
                className={`py-2 px-6 rounded-full text-[13px] font-bold transition-all w-1/2 ${billingCycle === "YEARLY"
                  ? "bg-white text-[#1C2C1C] shadow-sm"
                  : "text-[#1C2C1C]/50 hover:text-[#1C2C1C]"
                  }`}
              >
                Annual
              </button>
            </div>

            {plansLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C2C1C]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {plans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isCurrent = (subscriptionData?.currentPlan?.id || subscriptionData?.planId) === plan.id;
                  const currentPrice = plan.prices?.find((p: any) => p.billingCycle === billingCycle);
                  if (!currentPrice) return null;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`rounded-[20px] border-2 p-6 relative cursor-pointer transition-all ${isSelected ? "border-[#6E9625] bg-[#FAFAFA]" : "border-[#E5E5E5] hover:border-[#1C2C1C]/30 bg-white"
                        }`}
                    >
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1C2C1C] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                          Current Plan
                        </div>
                      )}
                      <h3 className={`text-[18px] font-bold mb-1 mt-2 text-[#1C2C1C]`}>{plan.name}</h3>
                      <p className={`text-[12px] font-medium mb-4 text-[#1C2C1C]/50`}>{plan.description}</p>
                      <div className="flex items-end gap-1 mb-6">
                        <span className={`text-[32px] font-black leading-none text-[#1C2C1C]`}>€{currentPrice.amount}</span>
                        <span className={`text-[12px] font-medium pb-1 text-[#1C2C1C]/50`}>/{billingCycle === 'YEARLY' ? 'year' : 'month'}</span>
                      </div>
                      <ul className="flex flex-col gap-3 mb-6">
                        <li className={`flex items-start gap-2 text-[13px] font-medium text-[#1C2C1C]/70`}>
                          <CheckCircle2 size={16} className="text-[#6E9625] flex-shrink-0" />
                          {plan.unlimitedTrades ? "Unlimited" : `Up to ${plan.maxTrades}`} Categories
                        </li>
                        <li className={`flex items-start gap-2 text-[13px] font-medium text-[#1C2C1C]/70`}>
                          <CheckCircle2 size={16} className="text-[#6E9625] flex-shrink-0" />
                          {plan.maxPortfolioUploads} Portfolio Uploads
                        </li>
                        <li className={`flex items-start gap-2 text-[13px] font-medium text-[#1C2C1C]/70`}>
                          <CheckCircle2 size={16} className="text-[#6E9625] flex-shrink-0" />
                          {plan.maxQuotesPerDay === 9999 ? "Unlimited" : `${plan.maxQuotesPerDay}`} Quotes per Day
                        </li>
                      </ul>
                      <div className="mt-auto">
                        <div className={`w-full py-3 rounded-xl text-[13px] font-bold transition-all text-center ${isSelected
                          ? "bg-[#6E9625] text-white"
                          : "bg-[#F5F5F5] text-[#1C2C1C]"
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
              <button
                onClick={() => setIsSwitchPlanModalOpen(false)}
                className="px-6 py-3 rounded-xl text-[14px] font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                disabled={isChangingPlan || !selectedPlanId || (subscriptionData?.planId === selectedPlanId && subscriptionData?.billingCycle === billingCycle)}
                className="bg-[#1C2C1C] text-white px-8 py-3 rounded-xl text-[14px] font-bold hover:bg-[#2C4A2C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isChangingPlan ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Processing...
                  </>
                ) : "Change Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
