"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/app/api/authApi";
import { FileText, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BillingPage() {
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-[#F9F9F9] pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
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

                {/* 
                <Link href="/auth/trader-signup/step-3?mode=change_plan" className="w-full block text-center bg-white text-[#1C2C1C] font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors">
                  Switch Plan
                </Link>
                */}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
