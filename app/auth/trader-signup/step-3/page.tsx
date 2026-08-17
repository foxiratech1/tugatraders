"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Check, ShieldCheck, Lock, Clock, AlertCircle, X, ChevronDown, Plus, Search, Edit2 } from "lucide-react";
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
    maxTrades: number;
    unlimitedTrades: boolean;
    maxPortfolioUploads: number;
    maxQuotesPerDay: number;
    isActive: boolean;
    prices: Price[];
}

interface CategoryGroup {
    id: string; // unique local ID for the UI
    categoryId: string;
    selectedSkillServices: string[];
    selectedSubCategories: string[];
    isCollapsed?: boolean;
}

// Multi-Select Dropdown Component
interface MultiSelectProps {
    options: Array<{ id: string; name: string }>;
    selectedIds: string[];
    onChange: (selectedIds: string[]) => void;
    placeholder: string;
    disabled?: boolean;
}

const MultiSelect = ({
    options,
    selectedIds,
    onChange,
    placeholder,
    disabled = false,
}: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedIds.includes(opt.id)
    );

    const toggleOption = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`min-h-[44px] w-full rounded-[12px] border bg-white px-4 py-2 text-[14px] font-medium transition-all flex items-center justify-between
                    ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 border-[#243A241F]" : "cursor-pointer border-[#243A241F] focus-within:border-[#6E9625] focus-within:ring-1 focus-within:ring-[#6E9625]"}
                `}
            >
                <div className="flex flex-wrap gap-1.5 flex-1">
                    {selectedIds.length === 0 ? (
                        <span className="text-[#1C2C1C]/40 py-0.5">{placeholder}</span>
                    ) : (
                        selectedIds.map(id => {
                            const option = options.find(o => o.id === id);
                            return option ? (
                                <span
                                    key={id}
                                    className="bg-[#6E9625]/10 text-[#6E9625] px-2 py-0.5 rounded-md text-[12px] flex items-center gap-1 font-bold"
                                >
                                    {option.name}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOption(id);
                                        }}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                </span>
                            ) : null;
                        })
                    )}
                    {selectedIds.length > 0 && !disabled && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                            className="bg-transparent border border-dashed border-[#1C2C1C]/30 text-[#1C2C1C]/60 px-2 py-0.5 rounded-md text-[12px] flex items-center gap-1 font-bold hover:bg-[#F5F5F5] hover:text-[#1C2C1C] transition-colors cursor-pointer"
                        >
                            <Plus size={12} strokeWidth={2.5} /> Add More
                        </button>
                    )}
                </div>
                <ChevronDown size={16} className={`text-[#1C2C1C]/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-[#243A240A] rounded-[16px] shadow-[0_12px_48px_rgba(36,58,36,0.12)] overflow-hidden">
                    <div className="p-3 border-b border-[#243A240A]">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full pl-9 pr-4 py-2 bg-[#F5F5F5] rounded-lg text-[13px] outline-none placeholder-[#1C2C1C]/40 text-[#1C2C1C]"
                            />
                        </div>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#6E9625]/20 scrollbar-track-transparent">
                        {filteredOptions.length === 0 ? (
                            <div className="py-4 text-center text-[13px] text-[#1C2C1C]/40 font-medium">
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map(option => (
                                <div
                                    key={option.id}
                                    onClick={() => toggleOption(option.id)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${selectedIds.includes(option.id) ? "bg-[#6E9625]/10" : "hover:bg-[#F5F5F5]"
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${selectedIds.includes(option.id) ? "bg-[#6E9625] border-[#6E9625]" : "border-[#1C2C1C]/20"
                                        }`}>
                                        {selectedIds.includes(option.id) && <Check size={12} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <span className={`text-[13px] ${selectedIds.includes(option.id) ? "font-bold text-[#6E9625]" : "font-medium text-[#1C2C1C]"}`}>
                                        {option.name}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Step3Page() {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY");

    // Guard to prevent non-traders, unverified users, or incomplete step-2 traders from accessing step-3
    useEffect(() => {
        const checkStep3Guard = async () => {
            const { getUserRole, getAccessToken, parseJwt, getUser } = await import("@/utils/auth");
            const role = getUserRole();
            if (role === "customer") {
                router.replace("/customer-dashboard/jobs");
                return;
            } else if (!role) {
                router.replace("/");
                return;
            }

            const token = getAccessToken();
            if (token) {
                const decoded = parseJwt(token);
                const user = getUser();
                const isEmailVerified = decoded?.isEmailVerified ?? decoded?.user?.isEmailVerified ?? user?.isEmailVerified;
                if (isEmailVerified === false) {
                    router.replace("/auth/verify-otp");
                    return;
                }
            }

            try {
                const statusRes = await getRegistrationStatus();
                const data = statusRes?.data || statusRes;
                const vStatus = data?.verificationStatus ?? data?.status;
                const isStep2Done = data?.step2Completed === true || data?.currentStep >= 3 || !!data?.traderData?.companyName;

                if (data?.isRegistrationCompleted && vStatus === "APPROVED") {
                    router.replace("/trader");
                } else if (!isStep2Done) {
                    const catId = data?.selectedCategories?.[0]?.id;
                    router.replace(catId ? `/auth/trader-signup/step-2?categoryId=${catId}` : "/auth/trader-signup/step-2");
                }
            } catch (err) {
                console.error("Step3 guard check failed", err);
            }
        };

        checkStep3Guard();

        const handlePageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                checkStep3Guard();
            }
        };
        window.addEventListener("pageshow", handlePageShow);
        return () => window.removeEventListener("pageshow", handlePageShow);
    }, [router, pathname]);

    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<string>('PENDING');
    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [statusLoading, setStatusLoading] = useState(true);

    // We store the selected plan ID
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");

    // UI Phase State
    const [phase, setPhase] = useState<'PLAN' | 'CATEGORIES'>('PLAN');

    // --- Category Selection State ---
    const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
    const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);
    const [skillServicesMap, setSkillServicesMap] = useState<Record<string, { id: string; name: string }[]>>({});
    const [subCategoriesMap, setSubCategoriesMap] = useState<Record<string, { id: string; name: string }[]>>({});

    // Fetch categories on mount
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await authApi.getCategories();
                if (res?.data) {
                    setAllCategories(res.data);
                }
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCats();
    }, []);

    // Helper functions for category groups
    const addCategoryGroup = () => {
        setCategoryGroups(prev => [
            ...prev.map(g => ({ ...g, isCollapsed: true })),
            {
                id: Date.now().toString() + Math.random().toString(),
                categoryId: "",
                selectedSkillServices: [],
                selectedSubCategories: [],
                isCollapsed: false
            }
        ]);
    };

    const removeCategoryGroup = (id: string) => {
        setCategoryGroups(prev => prev.filter(g => g.id !== id));
    };

    const handleCategoryGroupChange = (id: string, field: keyof CategoryGroup, value: any) => {
        setCategoryGroups(prev => prev.map(g => {
            if (g.id !== id) return g;

            if (field === 'categoryId') {
                if (value && !skillServicesMap[value]) {
                    authApi.getSkillServices(value).then(res => {
                        const skillsArray = Array.isArray(res) ? res : res?.data || res?.services || [];
                        setSkillServicesMap(prevMap => ({ ...prevMap, [value]: skillsArray }));
                    }).catch(err => console.error(err));
                }
                return { ...g, categoryId: value, selectedSkillServices: [], selectedSubCategories: [] };
            }

            if (field === 'selectedSkillServices') {
                const newSkills = value as string[];
                const addedSkills = newSkills.filter(s => !g.selectedSkillServices.includes(s));
                const removedSkills = g.selectedSkillServices.filter(s => !newSkills.includes(s));

                addedSkills.forEach(skillId => {
                    if (!subCategoriesMap[skillId]) {
                        authApi.getSubCategories(skillId).then(res => {
                            const subArray = Array.isArray(res) ? res : res?.data || res?.subCategories || [];
                            setSubCategoriesMap(prevMap => ({ ...prevMap, [skillId]: subArray }));
                        }).catch(err => console.error(err));
                    }
                });

                let newSubCats = [...g.selectedSubCategories];
                removedSkills.forEach(skillId => {
                    const subsToRemove = (subCategoriesMap[skillId] || []).map(sub => sub.id);
                    newSubCats = newSubCats.filter(id => !subsToRemove.includes(id));
                });

                return { ...g, selectedSkillServices: newSkills, selectedSubCategories: newSubCats };
            }

            return { ...g, [field]: value };
        }));
    };

    // Handle payment and final registration step
    const handlePayment = async () => {
        if (!selectedPlanId) return;

        // Validation for Categories
        const selectedPlan = plans.find(p => p.id === selectedPlanId);
        if (!selectedPlan) return;

        if (categoryGroups.length === 0) {
            toast.error("Please add at least one Trade Category.");
            return;
        }

        const validGroups = categoryGroups.filter(g => g.categoryId && g.selectedSkillServices.length > 0 && g.selectedSubCategories.length > 0);
        if (validGroups.length !== categoryGroups.length || categoryGroups.length === 0) {
            toast.error("Please completely fill out all added Trade Categories (Category, Skill Services, and Sub Categories).");
            return;
        }

        setLoading(true);
        try {
            // Find price id for current billing cycle
            const price = selectedPlan.prices.find(p => p.billingCycle === billingCycle);
            if (!price) {
                toast.error("Selected billing cycle is not available for this plan.");
                setLoading(false);
                return;
            }

            // 1. First register step 3 (creates the subscription)
            const registerRes = await traderRegisterStep3({
                planId: selectedPlan.id,
                priceId: price.id,
            });

            // 2. Then save categories (requires the subscription to exist)
            const tradeCategories = validGroups.map(g => g.categoryId);
            const skillServiceIds = validGroups.flatMap(g => g.selectedSkillServices);
            const subCategoryIds = validGroups.flatMap(g => g.selectedSubCategories);

            await authApi.saveTraderCategories({
                tradeCategories,
                skillServiceIds,
                subCategoryIds
            });

            // 3. Finally, redirect to checkout if applicable
            const checkoutUrl = registerRes?.data?.url || registerRes?.url;
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                toast.success("Registration completed successfully!");
                router.replace("/trader/profile"); // or whatever the dashboard route is
            }
        } catch (err: any) {
            toast.error("Payment processing failed.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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
                toast.error("Failed to load membership plans", { id: "fetch-plans-error" });
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
                toast.error("Failed to fetch verification status", { id: "fetch-verification-status-error" });
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



    if (statusLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#F0EDE8]">
                <p className="text-[#1C2C1C]">Loading verification status...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F0EDE8] pt-32 pb-20 px-4 flex justify-center font-sans relative">

            {verificationStatus !== "APPROVED" ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C2C1C]/30 backdrop-blur-md">
                    <div className="relative w-full max-w-[480px] bg-white rounded-[32px] shadow-[0_32px_80px_rgba(28,44,28,0.15)] border border-[#243A240A] p-10 flex flex-col items-center text-center overflow-hidden">
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
                            {verificationStatus === "PENDING"
                                ? "Verification Pending"
                                : verificationStatus === "MANUAL_CHECK"
                                    ? "Verification"
                                    : "Verification Rejected"}
                        </h2>

                        {verificationStatus === "PENDING" && (
                            <div className="flex flex-col items-center w-full">
                                <p className="text-[15px] text-[#1C2C1C]/60 mb-8 leading-relaxed max-w-[340px]">
                                    Your profile is currently under review by our team. This usually takes 24-48 hours. We'll notify you once approved.
                                </p>
                                <button
                                    onClick={() => authApi.handleLogout(router)}
                                    className="w-full bg-[#1C2C1C] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-[#2C4A2C] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    Log out
                                </button>
                            </div>
                        )}

                        {verificationStatus === "MANUAL_CHECK" && (
                            <div className="flex flex-col items-center w-full">
                                <p className="text-[15px] text-[#1C2C1C]/60 mb-4 leading-relaxed max-w-[340px]">
                                    Your profile requires additional updates for verification. Please review any details below and update your profile information.
                                </p>

                                {rejectionReason && (
                                    <div className="w-full bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 mb-6 text-left">
                                        <p className="text-center text-[12px] font-extrabold text-amber-800 uppercase tracking-wider mb-1">
                                            Verification Note
                                        </p>
                                        <p className="text-center text-[14px] text-amber-900 font-medium leading-relaxed">
                                            {rejectionReason}
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => router.push("/trader/profile?mode=update")}
                                    className="w-full bg-[#1C2C1C] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-[#2C4A2C] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                                >
                                    Update profile
                                </button>
                            </div>
                        )}

                        {verificationStatus === "REJECTED" && (
                            <div className="flex flex-col items-center w-full">
                                <p className="text-[15px] text-[#1C2C1C]/60 mb-4 leading-relaxed max-w-[340px]">
                                    Unfortunately, your profile verification was rejected. Please review the reason below.
                                </p>

                                <div className="w-full bg-red-50/50 border border-red-100 rounded-xl p-4 mb-6 text-center">
                                    <p className="text-center text-[12px] font-extrabold text-red-800 uppercase tracking-wider mb-1">
                                        Reason for rejection
                                    </p>
                                    <p className="text-center text-[14px] text-red-600 font-medium leading-relaxed">
                                        {rejectionReason || "Please contact support for more details about why your verification was rejected."}
                                    </p>
                                </div>

                                <button
                                    onClick={() => authApi.handleLogout(router)}
                                    className="w-full bg-[#1C2C1C] text-white font-bold py-3.5 px-6 rounded-xl hover:bg-[#2C4A2C] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                                >
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className={`w-full max-w-[1000px] bg-white rounded-[28px] shadow-[0_12px_48px_rgba(36,58,36,0.07)] border border-[#243A240A] p-8 sm:p-12 relative overflow-hidden flex flex-col items-center transition-all`}>

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
                            {phase === 'PLAN' ? "Select Membership Plan" : "Select Trade Categories"}
                        </h1>
                        <p className="text-[14px] sm:text-[15px] text-[#1C2C1C]/60 font-medium mb-6">
                            {phase === 'PLAN'
                                ? "Activate your trader profile to start receiving leads, managing jobs, and connecting with customers."
                                : "Define your trade categories, skill services, and sub-categories so customers can find you."
                            }
                        </p>

                        <div className="flex flex-wrap items-center justify-start sm:justify-center gap-4 sm:gap-6 text-[12px] font-bold text-[#6E9625]">
                            <span className="flex items-center gap-1.5"><Check size={14} /> Verified marketplace</span>
                            <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Secure payments</span>
                            <span className="flex items-center gap-1.5"><Check size={14} /> Cancel anytime</span>
                        </div>
                    </div>

                    {/* PLAN PHASE */}
                    {phase === 'PLAN' && (
                        <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
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
                                                        {plan.unlimitedTrades ? "Unlimited" : `Up to ${plan.maxTrades}`} Categories
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
                        </div>
                    )}

                    {/* CATEGORIES PHASE */}
                    {phase === 'CATEGORIES' && selectedPlanId && (
                        <div className="w-full mt-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-center mb-8 relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#1C2C1C]/10"></div>
                                </div>
                                <span className="relative bg-white px-4 text-[10px] font-extrabold text-[#6E9625] tracking-widest uppercase">
                                    Trade Categories
                                </span>
                            </div>

                            <div className="bg-[#FAFAFA] border border-[#1C2C1C]/10 rounded-[20px] p-6 sm:p-8 mb-6">
                                <h4 className="text-[14px] font-bold text-[#1C2C1C] mb-4">Select Trade Categories</h4>
                                <MultiSelect
                                    options={allCategories}
                                    selectedIds={categoryGroups.map(g => g.categoryId).filter(Boolean)}
                                    onChange={(ids) => {
                                        const selectedPlan = plans.find(p => p.id === selectedPlanId);
                                        const maxCats = selectedPlan?.unlimitedTrades ? 9999 : (selectedPlan?.maxTrades || 1);
                                        if (ids.length > maxCats) {
                                            toast.error(`Your plan allows a maximum of ${maxCats === 9999 ? 'Unlimited' : maxCats} Categories.`, { id: "max-cats-error" });
                                            return;
                                        }

                                        setCategoryGroups(prev => {
                                            const next = prev.filter(g => ids.includes(g.categoryId));

                                            ids.forEach(id => {
                                                if (!next.find(g => g.categoryId === id)) {
                                                    next.push({
                                                        id: Date.now().toString() + Math.random().toString(),
                                                        categoryId: id,
                                                        selectedSkillServices: [],
                                                        selectedSubCategories: [],
                                                        isCollapsed: false
                                                    });

                                                    if (!skillServicesMap[id]) {
                                                        authApi.getSkillServices(id).then(res => {
                                                            const skillsArray = Array.isArray(res) ? res : res?.data || res?.services || [];
                                                            setSkillServicesMap(m => ({ ...m, [id]: skillsArray }));
                                                        }).catch(err => console.error(err));
                                                    }
                                                }
                                            });
                                            return next;
                                        });
                                    }}
                                    placeholder="Select Categories *"
                                />
                            </div>

                            <div className="flex flex-col gap-6">
                                {categoryGroups.map((group, index) => {
                                    const categoryName = allCategories.find(c => c.id === group.categoryId)?.name || "Category";
                                    const skillServices = skillServicesMap[group.categoryId] || [];
                                    const subCategories = group.selectedSkillServices.flatMap(skillId => subCategoriesMap[skillId] || []);

                                    return (
                                        <div key={group.id} className="relative bg-white border border-[#1C2C1C]/10 rounded-[20px] p-6 sm:p-8 shadow-sm">
                                            <div className="flex justify-between items-center mb-6 border-b border-[#1C2C1C]/10 pb-4">
                                                <h4 className="text-[16px] font-bold text-[#1C2C1C]">{categoryName} Services</h4>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label className="block text-[12px] font-bold text-[#1C2C1C]/60 mb-2 uppercase tracking-wide">
                                                        Select {categoryName} Skill Services *
                                                    </label>
                                                    <MultiSelect
                                                        options={skillServices}
                                                        selectedIds={group.selectedSkillServices}
                                                        onChange={(ids) => handleCategoryGroupChange(group.id, 'selectedSkillServices', ids)}
                                                        placeholder="Choose Skill Services..."
                                                    />
                                                </div>

                                                {group.selectedSkillServices.length === 0 ? (
                                                    <div>
                                                        <label className="block text-[12px] font-bold text-[#1C2C1C]/60 mb-2 uppercase tracking-wide">
                                                            Select Sub Categories *
                                                        </label>
                                                        <MultiSelect
                                                            options={[]}
                                                            selectedIds={[]}
                                                            onChange={() => { }}
                                                            placeholder="Choose Sub Categories..."
                                                            disabled={true}
                                                        />
                                                    </div>
                                                ) : (
                                                    group.selectedSkillServices.map(skillId => {
                                                        const skillName = skillServices.find(s => s.id === skillId)?.name || "Skill Service";
                                                        const skillSubCats = subCategoriesMap[skillId] || [];

                                                        if (skillSubCats.length === 0) return null;

                                                        return (
                                                            <div key={skillId}>
                                                                <label className="block text-[12px] font-bold text-[#1C2C1C]/60 mb-2 uppercase tracking-wide">
                                                                    Select {skillName} Sub Categories *
                                                                </label>
                                                                <MultiSelect
                                                                    options={skillSubCats}
                                                                    selectedIds={group.selectedSubCategories}
                                                                    onChange={(ids) => handleCategoryGroupChange(group.id, 'selectedSubCategories', ids)}
                                                                    placeholder="Choose Sub Categories..."
                                                                />
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
                            {phase === 'PLAN' ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setPhase('CATEGORIES');
                                            if (categoryGroups.length === 0) {
                                                addCategoryGroup();
                                            }
                                        }}
                                        disabled={!selectedPlanId}
                                        className="bg-[#1C2C1C] text-white text-[14px] font-bold py-3.5 px-8 rounded-full hover:bg-[#2C4A2C] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        Continue to Categories
                                    </button>
                                    <button
                                        onClick={() => router.push("/trader/profile")}
                                        className="text-[#1C2C1C] text-[14px] font-bold py-3.5 px-6 rounded-full hover:bg-[#F5F5F5] transition-colors"
                                    >
                                        Back to Profile Setup
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handlePayment}
                                        disabled={loading}
                                        className="bg-[#1C2C1C] text-white text-[14px] font-bold py-3.5 px-8 rounded-full hover:bg-[#2C4A2C] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Processing..." : "Complete & Pay"}
                                    </button>
                                    <button
                                        onClick={() => setPhase('PLAN')}
                                        className="text-[#1C2C1C] text-[14px] font-bold py-3.5 px-6 rounded-full hover:bg-[#F5F5F5] transition-colors"
                                    >
                                        Back to Plans
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </main>
    );
}
