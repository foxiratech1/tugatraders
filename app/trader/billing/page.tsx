"use client";

import { useEffect, useState, useRef } from "react";
import { authApi } from "@/app/api/authApi";
import { FileText, CheckCircle2, Check, X, ChevronDown, Search } from "lucide-react";
import toast from "react-hot-toast";

// ─── MultiSelect Component ────────────────────────────────────────────────────
interface MultiSelectProps {
  options: Array<{ id: string; name: string }>;
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}

const MultiSelect = ({ options, selectedIds, onChange, placeholder, disabled = false }: MultiSelectProps) => {
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
                <span key={id} className="bg-[#6E9625]/10 text-[#6E9625] px-2 py-0.5 rounded-md text-[12px] flex items-center gap-1 font-bold">
                  {option.name}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleOption(id); }}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </span>
              ) : null;
            })
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
          <div className="max-h-[240px] overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-[13px] text-[#1C2C1C]/40 font-medium">No results found</div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${selectedIds.includes(option.id) ? "bg-[#6E9625]/10" : "hover:bg-[#F5F5F5]"}`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${selectedIds.includes(option.id) ? "bg-[#6E9625] border-[#6E9625]" : "border-[#1C2C1C]/20"}`}>
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
};

// ─── CategoryGroup Interface ──────────────────────────────────────────────────
interface CategoryGroup {
  id: string;
  categoryId: string;
  selectedSkillServices: string[];
  selectedSubCategories: string[];
}

// ─── BillingPage ──────────────────────────────────────────────────────────────
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

  // Category selection states (phase 2 of modal)
  const [modalPhase, setModalPhase] = useState<"PLAN" | "CATEGORIES">("PLAN");
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);
  const [skillServicesMap, setSkillServicesMap] = useState<Record<string, { id: string; name: string }[]>>({});
  const [subCategoriesMap, setSubCategoriesMap] = useState<Record<string, { id: string; name: string }[]>>({});
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [traderId, setTraderId] = useState<string>("");

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await authApi.getPlans();
      const activePlans = (res?.data || res || []).filter((p: any) => p.isActive);
      setPlans(activePlans);
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

  const fetchCategories = async () => {
    try {
      const res = await authApi.getCategories();
      if (res?.data) {
        setAllCategories(res.data);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const fetchTraderId = async () => {
    try {
      // The backend expects the trader PROFILE id, not the user id
      const resData = await authApi.getMyProfile();
      const unwrapped = resData?.data || resData;
      console.log("unwrapped", unwrapped);
      const tpId = unwrapped?.traderProfile?.id || " ";
      if (tpId) {
        setTraderId(tpId);
        return;
      }
      // Fallback: try from localStorage user's traderProfile
      const { getUser } = await import("@/utils/auth");
      const localUser = getUser();
      const fallbackId = localUser?.traderProfile?.id || localUser?.traderProfileId || localUser?.traderId;
      if (fallbackId) {
        setTraderId(fallbackId);
        return;
      }
      console.warn("Could not resolve trader profile ID");
    } catch (err) {
      console.error("Failed to fetch trader id", err);
    }
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

        let newSubCats = [...g.selectedSubCategories];

        // Remove sub-categories of removed skill services
        removedSkills.forEach(skillId => {
          const subsToRemove = (subCategoriesMap[skillId] || []).map(sub => sub.id);
          newSubCats = newSubCats.filter(sc => !subsToRemove.includes(sc));
        });

        // Add sub-categories from already cached skill services
        addedSkills.forEach(skillId => {
          if (subCategoriesMap[skillId]) {
            const subsToAdd = subCategoriesMap[skillId].map(sub => sub.id);
            newSubCats = Array.from(new Set([...newSubCats, ...subsToAdd]));
          }
        });

        // Automatically fetch and add all associated sub-categories in the background
        addedSkills.forEach(skillId => {
          if (!subCategoriesMap[skillId]) {
            authApi.getSubCategories(skillId).then(res => {
              const subArray = Array.isArray(res) ? res : res?.data || res?.subCategories || [];
              setSubCategoriesMap(prevMap => ({ ...prevMap, [skillId]: subArray }));
              const subIds = subArray.map((s: any) => s.id);
              if (subIds.length > 0) {
                setCategoryGroups(prevGroups => prevGroups.map(grp => {
                  if (grp.id !== id) return grp;
                  return {
                    ...grp,
                    selectedSubCategories: Array.from(new Set([...grp.selectedSubCategories, ...subIds]))
                  };
                }));
              }
            }).catch(err => console.error(err));
          }
        });

        return { ...g, selectedSkillServices: newSkills, selectedSubCategories: newSubCats };
      }

      return { ...g, [field]: value };
    }));
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId) {
      toast.error("Please select a plan.");
      return;
    }
    setIsChangingPlan(true);
    try {
      await authApi.changePlan({ planId: selectedPlanId, billingCycle });
      toast.success("Plan updated successfully! Now select your categories.");

      // Refresh subscription
      const res = await authApi.getMySubscription();
      setSubscriptionData(res?.data || res);

      // Fetch categories and trader ID, then transition to category selection phase
      await Promise.all([fetchCategories(), fetchTraderId()]);

      // Reset category groups
      setCategoryGroups([]);
      setModalPhase("CATEGORIES");
    } catch (error: any) {
      console.error("Failed to change plan", error);
      toast.error(error?.response?.data?.message || "Failed to change plan.");
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleSaveCategories = async () => {
    const validGroups = categoryGroups.filter(g => g.categoryId);
    if (validGroups.length === 0) {
      toast.error("Please select at least one category.");
      return;
    }

    setIsSavingCategories(true);
    try {
      const skillsServices = validGroups.flatMap(g => g.selectedSkillServices);

      // Automatically resolve all associated sub-categories in the background
      const subCatPromises = skillsServices.map(async (skillId) => {
        if (subCategoriesMap[skillId]) {
          return subCategoriesMap[skillId].map(s => s.id);
        }
        try {
          const res = await authApi.getSubCategories(skillId);
          const subArray = Array.isArray(res) ? res : res?.data || res?.subCategories || [];
          return subArray.map((s: any) => s.id);
        } catch (e) {
          return [];
        }
      });
      const resolvedSubCatArrays = await Promise.all(subCatPromises);
      const allSubCategoryIds = Array.from(new Set([
        ...validGroups.flatMap(g => g.selectedSubCategories),
        ...resolvedSubCatArrays.flat(),
      ]));

      await authApi.updateSubscriptionCategories({
        traderId,
        planId: selectedPlanId,
        tradeCategories: validGroups.map(g => g.categoryId),
        skillsServices,
        subCategories: allSubCategoryIds,
      });
      toast.success("Categories updated successfully!");
      setIsSwitchPlanModalOpen(false);
      setModalPhase("PLAN");
    } catch (error: any) {
      console.error("Failed to save categories", error);
      toast.error(error?.response?.data?.message || "Failed to update categories.");
    } finally {
      setIsSavingCategories(false);
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

  // Get the selected plan object for max categories
  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const maxCats = selectedPlan?.unlimitedTrades ? 9999 : (selectedPlan?.maxTrades || 1);

  return (
    <div className="min-h-screen bg-[#F8F9F5] font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

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
                    setModalPhase("PLAN");
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
              onClick={() => { setIsSwitchPlanModalOpen(false); setModalPhase("PLAN"); }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            {/* ── Phase 1: Plan Selection ── */}
            {modalPhase === "PLAN" && (
              <>
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
              </>
            )}

            {/* ── Phase 2: Category Selection ── */}
            {modalPhase === "CATEGORIES" && (
              <>
                <h2 className="text-2xl font-bold text-[#1C2C1C] mb-2 text-center">Select Your Categories</h2>
                <p className="text-gray-500 text-sm text-center mb-2">
                  Your plan allows up to <span className="font-bold text-[#1C2C1C]">{maxCats === 9999 ? 'Unlimited' : maxCats}</span> {maxCats === 1 ? 'category' : 'categories'}.
                </p>
                <p className="text-gray-400 text-xs text-center mb-8">Select categories and skill services for your profile.</p>

                <div className="space-y-6 mb-8 max-h-[50vh] overflow-y-auto pr-2">
                  {/* Category Multi-Select */}
                  <div>
                    <label className="block text-[13px] font-bold text-[#1C2C1C] mb-2">Trade Categories</label>
                    <MultiSelect
                      options={allCategories}
                      selectedIds={categoryGroups.map(g => g.categoryId).filter(Boolean)}
                      onChange={(ids) => {
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
                              });
                              // Fetch skill services for this category
                              if (!skillServicesMap[id]) {
                                authApi.getSkillServices(id).then(res => {
                                  const skillsArray = Array.isArray(res) ? res : res?.data || res?.services || [];
                                  setSkillServicesMap(prevMap => ({ ...prevMap, [id]: skillsArray }));
                                }).catch(err => console.error(err));
                              }
                            }
                          });
                          return next;
                        });
                      }}
                      placeholder="Select trade categories..."
                    />
                  </div>

                  {/* Per-category skill services & sub-categories */}
                  {categoryGroups.filter(g => g.categoryId).map((group) => {
                    const catName = allCategories.find(c => c.id === group.categoryId)?.name || "Category";
                    const skills = skillServicesMap[group.categoryId] || [];
                    const allSubCats = group.selectedSkillServices.flatMap(skillId => subCategoriesMap[skillId] || []);

                    return (
                      <div key={group.id} className="bg-[#F9FAFB] rounded-2xl p-5 border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[14px] font-bold text-[#1C2C1C]">{catName}</h4>
                          <button
                            onClick={() => setCategoryGroups(prev => prev.filter(g => g.id !== group.id))}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {skills.length > 0 && (
                          <div>
                            <label className="block text-[12px] font-semibold text-[#1C2C1C]/60 mb-1.5">Skill Services</label>
                            <MultiSelect
                              options={skills}
                              selectedIds={group.selectedSkillServices}
                              onChange={(ids) => handleCategoryGroupChange(group.id, 'selectedSkillServices', ids)}
                              placeholder="Select skill services..."
                            />
                          </div>
                        )}

                        {/* Sub Categories commented out - automatically counted and selected in the background */}
                        {/* {allSubCats.length > 0 && (
                          <div>
                            <label className="block text-[12px] font-semibold text-[#1C2C1C]/60 mb-1.5">Sub Categories</label>
                            <MultiSelect
                              options={allSubCats}
                              selectedIds={group.selectedSubCategories}
                              onChange={(ids) => handleCategoryGroupChange(group.id, 'selectedSubCategories', ids)}
                              placeholder="Select sub-categories..."
                            />
                          </div>
                        )} */}
                      </div>
                    );
                  })}

                  {categoryGroups.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                      <p className="text-[14px] font-medium">No categories selected yet.</p>
                      <p className="text-[12px] mt-1">Use the dropdown above to add categories.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
                  <button
                    onClick={() => { setIsSwitchPlanModalOpen(false); setModalPhase("PLAN"); }}
                    className="px-6 py-3 rounded-xl text-[14px] font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Skip for Now
                  </button>
                  <button
                    onClick={handleSaveCategories}
                    disabled={isSavingCategories || categoryGroups.filter(g => g.categoryId).length === 0}
                    className="bg-[#1C2C1C] text-white px-8 py-3 rounded-xl text-[14px] font-bold hover:bg-[#2C4A2C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSavingCategories ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Saving...
                      </>
                    ) : "Confirm Categories"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
