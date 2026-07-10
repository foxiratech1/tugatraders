"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, Lock, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { traderRegisterStep3, authApi, getRegistrationStatus } from "@/app/api/authApi";

interface Price {
    id: string;
    planId: string;
    billingCycle: string; // e.g., "MONTHLY" or "YEARLY"
    amount: string;
    currency: string;
    isActive: boolean;
}

interface Plan {
    id: string;
    name: string;
    description: string;
    maxCategories: number;
    maxPortfolioUploads: number;
    maxQuotesPerDay: number;
    isActive: boolean;
    prices: Price[];
}

export default function Step3Page() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY");

    // Handle payment and final registration step
    const handlePayment = async () => {
        if (!selectedPlanId) return;
        setLoading(true);
        try {
            // Find selected plan and price id for current billing cycle
            const selectedPlan = plans.find(p => p.id === selectedPlanId);
            const price = selectedPlan?.prices.find(p => p.billingCycle === billingCycle);
            if (!price) {
                toast.error("Price not found for selected plan.");
                setLoading(false);
                return;
            }
            await traderRegisterStep3({ planId: selectedPlanId, priceId: price.id });
            toast.success("Registration completed! Redirecting to dashboard...");
            router.push("/trader"); // adjust path as needed
        } catch (err) {
            toast.error("Payment processing failed.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<string>('PENDING');
    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [statusLoading, setStatusLoading] = useState(true);

    // We store the selected plan ID
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await authApi.getPlans();
                // Assuming API returns array of plans
                if (Array.isArray(data)) {
                    setPlans(data.filter((p: Plan) => p.isActive));
                } else if (data?.data && Array.isArray(data.data)) {
                    setPlans(data.data.filter((p: Plan) => p.isActive));
                }
            } catch (error) {
                toast.error("Failed to load membership plans");
            } finally {
                setPlansLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // Fetch verification status for trader profile
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const resData = await getRegistrationStatus();
                const unwrapped = resData?.data || resData;
                // Expect data.verificationStatus or similar
                const status = unwrapped?.verificationStatus ?? unwrapped?.status ?? "PENDING";
                setVerificationStatus(status);

                const reason = unwrapped?.rejectReason || unwrapped?.rejectionReason || unwrapped?.reason || unwrapped?.rejectionMessage || unwrapped?.adminMessage || unwrapped?.adminNotes || unwrapped?.rejectionNote || unwrapped?.message;
                if (reason) {
                    setRejectionReason(reason);
                }
            } catch (err) {
                toast.error("Failed to fetch verification status");
                setVerificationStatus("PENDING");
            } finally {
                setStatusLoading(false);
            }
        };
        fetchStatus();
    }, []);

    // Filter plans that have a price for the currently selected billing cycle
    const visiblePlans = plans.filter(p =>
        p.prices?.some(price => price.billingCycle === billingCycle && price.isActive)
    );

    // Auto-select first plan when switching tabs if none is selected for this tab
    useEffect(() => {
        if (visiblePlans.length > 0 && !visiblePlans.find(p => p.id === selectedPlanId)) {
            setSelectedPlanId(visiblePlans[0].id);
        }
    }, [billingCycle, visiblePlans, selectedPlanId]);

    if (statusLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#F0EDE8]">
                <p className="text-[#1C2C1C]">Loading verification status...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F0EDE8] pt-32 pb-20 px-4 flex justify-center font-sans relative">

            {verificationStatus !== "APPROVED" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#1C2C1C]/30 backdrop-blur-md">
                    <div className="relative w-full max-w-[480px] bg-white rounded-[32px] shadow-[0_32px_80px_rgba(28,44,28,0.15)] border border-[#243A240A] p-10 flex flex-col items-center text-center overflow-hidden">
                        {/* Top decorative gradient */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#6E9625] to-[#4A6B17]" />

                        {/* Icon */}
                        <div className="w-20 h-20 mb-6 rounded-full flex items-center justify-center bg-[#F8F9F5] border-4 border-white shadow-sm relative">
                            {verificationStatus === "PENDING" ? (
                                <>
                                    <div className="absolute inset-0 rounded-full animate-ping bg-[#6E9625]/20 opacity-75" />
                                    <Clock size={36} className="text-[#6E9625] relative z-10" strokeWidth={1.5} />
                                </>
                            ) : (
                                <AlertCircle size={36} className="text-red-500" strokeWidth={1.5} />
                            )}
                        </div>

                        <h2
                            className="text-[28px] font-bold text-[#1C2C1C] mb-3 tracking-tight leading-tight"
                            style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                        >
                            {verificationStatus === "PENDING" ? "Verification Pending" : "Verification Rejected"}
                        </h2>

                        {verificationStatus === "PENDING" && (
                            <div className="flex flex-col items-center w-full">
                                <p className="text-[15px] text-[#1C2C1C]/60 mb-8 leading-relaxed max-w-[340px]">
                                    Your profile is currently under review by our team. This usually takes 24-48 hours. We'll notify you once approved.
                                </p>
                                <button
                                    onClick={() => router.push("/")}
                                    className="w-full bg-[#1C2C1C] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-[#2C4A2C] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    Back to Home Page
                                </button>
                            </div>
                        )}

                        {verificationStatus === "REJECTED" && (
                            <div className="flex flex-col items-center w-full">
                                <p className="text-[15px] text-[#1C2C1C]/60 mb-4 leading-relaxed max-w-[340px]">
                                    Unfortunately, your profile verification was rejected. Please review the reason below and update your details.
                                </p>

                                <div className="w-full bg-red-50/50 border border-red-100 rounded-xl p-4 mb-8 text-left">
                                    <p className="text-[12px] font-extrabold text-red-800 uppercase tracking-wider mb-1">
                                        Reason for rejection
                                    </p>
                                    <p className="text-[14px] text-red-600 font-medium leading-relaxed">
                                        {rejectionReason || "Please contact support for more details about why your verification was rejected."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {verificationStatus === "REJECTED" && (
                            <button
                                onClick={() => router.push("/trader/profile?mode=update")}
                                className="w-full bg-[#1C2C1C] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-[#2C4A2C] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Update Profile
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className={`w-full max-w-[1000px] bg-white rounded-[28px] shadow-[0_12px_48px_rgba(36,58,36,0.07)] border border-[#243A240A] p-8 sm:p-12 relative overflow-hidden flex flex-col items-center transition-all ${verificationStatus !== "APPROVED" ? "pointer-events-none filter blur-[6px] opacity-60 select-none" : ""
                }`}>

                {/* Top Right Decorative Icon */}
                <div className="absolute top-8 right-8 w-12 h-12 bg-[#6E9625]/10 rounded-full flex items-center justify-center">
                    <ShieldCheck className="text-[#6E9625]" size={24} />
                </div>

                {/* Header */}
                <div className="w-full text-left sm:text-center max-w-[600px] mb-8">
                    <h1
                        className="text-[26px] sm:text-[34px] font-bold text-[#1C2C1C] tracking-tight leading-tight mb-4"
                        style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                    >
                        Select Membership Plan
                    </h1>
                    <p className="text-[14px] sm:text-[15px] text-[#1C2C1C]/60 font-medium mb-6">
                        Activate your trader profile to start receiving leads, managing jobs,
                        and connecting with customers.
                    </p>

                    <div className="flex flex-wrap items-center justify-start sm:justify-center gap-4 sm:gap-6 text-[12px] font-bold text-[#6E9625]">
                        <span className="flex items-center gap-1.5"><Check size={14} /> Verified marketplace</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Secure payments</span>
                        <span className="flex items-center gap-1.5"><Check size={14} /> Cancel anytime</span>
                    </div>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center p-1.5 bg-[#F5F5F5] rounded-full mb-12">
                    <button
                        onClick={() => setBillingCycle("MONTHLY")}
                        className={`py-2 px-6 rounded-full text-[13px] font-bold transition-all ${billingCycle === "MONTHLY"
                            ? "bg-white text-[#1C2C1C] shadow-sm"
                            : "text-[#1C2C1C]/50 hover:text-[#1C2C1C]"
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle("YEARLY")}
                        className={`py-2 px-6 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 ${billingCycle === "YEARLY"
                            ? "bg-white text-[#1C2C1C] shadow-sm"
                            : "text-[#1C2C1C]/50 hover:text-[#1C2C1C]"
                            }`}
                    >
                        Annual
                        <span className="bg-[#6E9625] text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Save 20%</span>
                    </button>
                </div>

                {/* Pricing Cards */}
                <div className={`grid grid-cols-1 md:grid-cols-${Math.max(1, Math.min(visiblePlans.length || 1, 3))} gap-6 w-full mb-12 justify-center`}>
                    {plansLoading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C2C1C]" />
                        </div>
                    ) : visiblePlans.length === 0 ? (
                        <div className="col-span-full text-center text-[#1C2C1C]/50 py-12 font-medium">
                            No plans currently available for {billingCycle.toLowerCase()} billing.
                        </div>
                    ) : (
                        visiblePlans.map((plan) => {
                            const isSelected = selectedPlanId === plan.id;
                            const currentPrice = plan.prices.find(p => p.billingCycle === billingCycle);
                            if (!currentPrice) return null;
                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={`rounded-[24px] border-2 p-8 relative cursor-pointer transition-all ${isSelected ? "border-[#6E9625] bg-[#1C2C1C] shadow-[0_12px_32px_rgba(110,150,37,0.2)]" : "border-[#E5E5E5] hover:border-[#1C2C1C]/30 bg-white"
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-6 right-6 bg-[#6E9625] text-[#1C2C1C] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                                            Selected
                                        </div>
                                    )}

                                    <h3 className={`text-[20px] font-bold mb-1 ${isSelected ? 'text-white' : 'text-[#1C2C1C]'}`}>{plan.name}</h3>
                                    <p className={`text-[13px] font-medium mb-6 ${isSelected ? 'text-white/50' : 'text-[#1C2C1C]/50'}`}>{plan.description}</p>

                                    <div className="flex items-end gap-1 mb-8">
                                        <span className={`text-[40px] font-black leading-none ${isSelected ? 'text-white' : 'text-[#1C2C1C]'}`}>€{currentPrice.amount}</span>
                                        <span className={`text-[14px] font-medium pb-1 ${isSelected ? 'text-white/50' : 'text-[#1C2C1C]/50'}`}>/{billingCycle === 'YEARLY' ? 'year' : 'month'}</span>
                                    </div>

                                    <ul className="flex flex-col gap-4 mb-10">
                                        <li className={`flex items-start gap-3 text-[14px] font-medium ${isSelected ? 'text-white/80' : 'text-[#1C2C1C]/70'}`}>
                                            <Check size={18} className="text-[#6E9625] flex-shrink-0 mt-0.5" />
                                            {plan.maxCategories === 9999 ? "Unlimited" : `Up to ${plan.maxCategories}`} Categories
                                        </li>
                                        <li className={`flex items-start gap-3 text-[14px] font-medium ${isSelected ? 'text-white/80' : 'text-[#1C2C1C]/70'}`}>
                                            <Check size={18} className="text-[#6E9625] flex-shrink-0 mt-0.5" />
                                            {plan.maxPortfolioUploads} Portfolio Uploads
                                        </li>
                                        <li className={`flex items-start gap-3 text-[14px] font-medium ${isSelected ? 'text-white/80' : 'text-[#1C2C1C]/70'}`}>
                                            <Check size={18} className="text-[#6E9625] flex-shrink-0 mt-0.5" />
                                            {plan.maxQuotesPerDay === 9999 ? "Unlimited" : `${plan.maxQuotesPerDay}`} Quotes per Day
                                        </li>
                                    </ul>

                                    <div className="mt-auto pt-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPlanId(plan.id);
                                            }}
                                            className={`w-full py-4 rounded-full text-[14px] font-bold transition-all shadow-sm ${isSelected
                                                ? "bg-[#6E9625] text-white hover:bg-[#5C7D1F]"
                                                : "bg-[#F5F5F5] text-[#1C2C1C] hover:bg-[#E5E5E5]"
                                                }`}
                                        >
                                            {isSelected ? 'Selected Plan' : 'Select Plan'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer info */}
                <div className="w-full flex flex-col items-center border-t border-[#1C2C1C]/10 pt-8 mt-4">
                    <div className="w-full flex justify-between items-center mb-8 px-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[14px] font-bold text-blue-600 tracking-tighter">stripe</span>
                            <div className="flex">
                                <div className="w-4 h-4 rounded-full bg-red-500 opacity-80 mix-blend-multiply"></div>
                                <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-80 mix-blend-multiply -ml-2"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#1C2C1C]/40 text-[10px] font-bold tracking-widest uppercase">
                            <Lock size={12} />
                            256-BIT SSL SECURE CHECKOUT
                        </div>
                    </div>

                    <p className="text-[13px] text-[#1C2C1C]/50 font-medium mb-6 text-center">
                        Your profile will go live immediately after successful payment.
                    </p>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePayment}
                            disabled={loading || !selectedPlanId}
                            className="bg-[#1C2C1C] text-white text-[14px] font-bold py-3.5 px-8 rounded-full hover:bg-[#2C4A2C] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing..." : "Continue to Payment"}
                        </button>
                        <button
                            onClick={() => router.push("/auth/trader-signup/step-2")}
                            className="text-[#1C2C1C] text-[14px] font-bold py-3.5 px-6 rounded-full hover:bg-[#F5F5F5] transition-colors"
                        >
                            Back to Profile Setup
                        </button>
                    </div>
                </div>

            </div>
        </main>
    );
}
