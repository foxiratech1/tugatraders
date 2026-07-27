"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { IdCard, Image as ImageIcon, ChevronRight, Lock, ShieldCheck, X, Search, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { traderRegisterStep2, authApi, getRegistrationStatus } from "@/app/api/authApi";

// ─── ChevronDown Icon ─────────────────────────────────────────────────────────
const ChevronDown = () => (
    <svg
        className="w-4 h-4 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

// Helper Checkbox Component
const Checkbox = ({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: () => void;
    label: React.ReactNode;
}) => (
    <div className="flex items-start gap-3 cursor-pointer group select-none" onClick={onChange}>
        <div
            className={`mt-[2px] w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-all border ${checked
                ? "bg-[#1C2C1C] border-[#1C2C1C]"
                : "bg-white border-[#243A2429] group-hover:border-[#1C2C1C]/50"
                }`}
        >
            {checked && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
        <p className="text-[13px] text-[#1C2C1C]/70 font-medium leading-snug">{label}</p>
    </div>
);

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
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((i) => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const removeOption = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedIds.filter((i) => i !== id));
    };

    const filteredOptions = options.filter(
        (opt) => !selectedIds.includes(opt.id) && opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedLabels = options.filter((opt) => selectedIds.includes(opt.id));

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`min-h-[44px] w-full rounded-[12px] border bg-white px-3 py-1.5 flex items-center justify-between gap-2 cursor-pointer transition-all border-[#243A241F] ${isOpen ? "border-[#6E9625] ring-1 ring-[#6E9625]" : ""
                    } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:border-[#1C2C1C]/30"}`}
            >
                <div className="flex flex-wrap items-center gap-1 flex-1 max-h-[110px] overflow-y-auto">
                    {selectedLabels.length === 0 ? (
                        <span className="text-[14px] text-[#1C2C1C]/40 font-medium select-none px-1">
                            {placeholder}
                        </span>
                    ) : (
                        selectedLabels.map((item) => (
                            <span
                                key={item.id}
                                className="inline-flex items-center gap-1 bg-[#6E9625]/12 border border-[#6E9625]/25 text-[#1C2C1C] text-[11px] font-semibold pl-2 pr-1 py-0.5 rounded-md transition-all hover:bg-[#6E9625]/20 group/tag"
                            >
                                <span>{item.name}</span>
                                <button
                                    type="button"
                                    onClick={(e) => removeOption(item.id, e)}
                                    className="p-0.5 text-[#1C2C1C]/40 group-hover/tag:text-red-600 hover:bg-black/10 rounded-full transition-colors flex items-center justify-center ml-0.5"
                                >
                                    <X size={10} strokeWidth={2.5} />
                                </button>
                            </span>
                        ))
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 text-[#1C2C1C]/40 self-center">
                    {selectedIds.length > 0 && (
                        <span className="text-[10px] font-bold bg-[#6E9625] text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                            {selectedIds.length}
                        </span>
                    )}
                    <ChevronDown />
                </div>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-[#243A241F] rounded-[16px] shadow-[0_16px_40px_rgba(28,44,28,0.12)] max-h-[260px] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
                    <div className="p-2 border-b border-[#243A240A] bg-[#F9FAF8] relative">
                        <Search size={14} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full h-8 pl-8 pr-3 text-[12px] rounded-lg border border-[#243A241A] bg-white outline-none focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] transition-all"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="overflow-y-auto p-1.5 space-y-0.5 flex-1">
                        {options.length > 0 && searchTerm === "" && (
                            <div
                                onClick={() => {
                                    if (selectedIds.length === options.length) {
                                        onChange([]);
                                    } else {
                                        onChange(options.map(opt => opt.id));
                                    }
                                }}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-150 mb-1 ${selectedIds.length === options.length ? "text-[#1C2C1C] bg-[#6E9625]/10 hover:bg-[#6E9625]/20" : "text-[#1C2C1C] bg-[#6E9625]/10 hover:bg-[#6E9625]/20"}`}
                            >
                                <span>{selectedIds.length === options.length ? "Clear All" : "Select All"}</span>
                                {selectedIds.length === options.length ? (
                                    <X size={14} className="text-[#1C2C1C]" />
                                ) : (
                                    <Plus size={14} className="text-[#6E9625]" />
                                )}
                            </div>
                        )}
                        {filteredOptions.length === 0 && selectedIds.length < options.length ? (
                            <div className="p-3 text-[12px] text-center text-[#1C2C1C]/40 font-medium">
                                {options.length === 0
                                    ? "No options available"
                                    : "No results found"}
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.id}
                                    onClick={() => toggleOption(opt.id)}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium text-[#1C2C1C]/80 hover:bg-[#6E9625]/10 hover:text-[#1C2C1C] cursor-pointer transition-all duration-150 group"
                                >
                                    <span>{opt.name}</span>
                                    <Plus size={14} className="text-[#6E9625] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Step2Page() {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    // Guard to prevent non-traders, unverified users, or completed step-2 traders from accessing step-2
    useEffect(() => {
        const checkStep2Guard = async () => {
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
                if (isEmailVerified !== true) {
                    router.replace("/auth/verify-otp");
                    return;
                }
            }

            try {
                const statusRes = await getRegistrationStatus();
                const data = statusRes?.data || statusRes;
                const vStatus = data?.verificationStatus ?? data?.status;
                const isStep2Done = data?.step2Completed === true || data?.currentStep === 3 || vStatus === "MANUAL_CHECK";

                if (data?.isRegistrationCompleted && vStatus === "APPROVED") {
                    router.replace("/trader");
                } else if (isStep2Done) {
                    router.replace("/auth/trader-signup/step-3");
                }
            } catch (err) {
                console.error("Step2 guard check failed", err);
            }
        };

        checkStep2Guard();

        const handlePageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                checkStep2Guard();
            }
        };
        window.addEventListener("pageshow", handlePageShow);
        return () => window.removeEventListener("pageshow", handlePageShow);
    }, [router, pathname]);

    // Lock browser back button on Step 2 page
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.history.pushState(null, "", window.location.href);

            const handlePopState = (e: PopStateEvent) => {
                e.preventDefault();
                window.history.pushState(null, "", window.location.href);
            };

            window.addEventListener("popstate", handlePopState);
            return () => {
                window.removeEventListener("popstate", handlePopState);
            };
        }
    }, []);

    const [formData, setFormData] = useState({
        companyName: "",
        companyType: "",
        registrationNumber: "",
        // location: "",
        about: "",
        expMin1Year: false,
        authorized: false,
        vettingTerms: false,
        traderAgreement: false,
        privacyCookies: false,
    });

    // const [selectedSkillServices, setSelectedSkillServices] = useState<string[]>([]);
    // const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);

    const [idFile, setIdFile] = useState<File | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    // const [categoryId, setCategoryId] = useState<string | null>(null);
    // const [skillServices, setSkillServices] = useState<Array<{ id: string; name: string }>>([]);
    // const [subCategories, setSubCategories] = useState<Array<{ id: string; name: string }>>([]);

    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [traderStatus, setTraderStatus] = useState<string>("PENDING");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("mode") === "update") {
            setIsUpdateMode(true);
        }

        getRegistrationStatus().then(res => {
            const unwrapped = res?.data || res;
            setTraderStatus(unwrapped?.verificationStatus ?? unwrapped?.status ?? "PENDING");

            if (unwrapped?.traderData) {
                setFormData(prev => ({
                    ...prev,
                    companyName: unwrapped.traderData.companyName || "",
                    companyType: unwrapped.traderData.companyType || "",
                    registrationNumber: unwrapped.traderData.registrationNumber || "",
                    // location: unwrapped.traderData.location || "",
                    about: unwrapped.traderData.about || "",
                    expMin1Year: true,
                    authorized: true,
                    vettingTerms: true,
                    traderAgreement: true,
                    privacyCookies: true,
                }));

                // const skillList = unwrapped.selectedSkillServices || unwrapped.traderData.selectedSkillServices || unwrapped.traderData.skillServices || [];
                // const subCatList = unwrapped.selectedSubCategories || unwrapped.traderData.selectedSubCategories || unwrapped.traderData.subCategories || [];

                // const skillIds = skillList.map((s: any) => typeof s === 'object' ? s.id : s).filter(Boolean);
                // const subCatIds = subCatList.map((s: any) => typeof s === 'object' ? s.id : s).filter(Boolean);

                // if (skillIds.length > 0) setSelectedSkillServices(skillIds);
                // if (subCatIds.length > 0) setSelectedSubCategories(subCatIds);
            }
        }).catch(console.error);

        // const catId = params.get("categoryId");
        // if (catId) {
        //     setCategoryId(catId);
        //     authApi.getSkillServices(catId).then(data => {
        //         if (Array.isArray(data)) setSkillServices(data);
        //         else if (data?.data && Array.isArray(data.data)) setSkillServices(data.data);
        //         else setSkillServices([]);
        //     }).catch(console.error);
        // }
    }, []);

    // useEffect(() => {
    //     if (selectedSkillServices.length === 0) {
    //         setSubCategories([]);
    //         setSelectedSubCategories([]);
    //         return;
    //     }

    //     Promise.all(
    //         selectedSkillServices.map(id => authApi.getSubCategories(id))
    //     ).then((results) => {
    //         const allSubs = results.flatMap((res: any) => Array.isArray(res) ? res : res?.data || []);
    //         const uniqueSubs = Array.from(new Map(allSubs.map((s: any) => [s.id, s])).values()) as Array<{ id: string; name: string }>;
    //         setSubCategories(uniqueSubs);

    //         const validIds = new Set(uniqueSubs.map(s => s.id));
    //         setSelectedSubCategories(prev => prev.filter(id => validIds.has(id)));
    //     }).catch(console.error);
    // }, [selectedSkillServices]);

    const field = (key: keyof typeof formData, value: string | boolean) => {
        setFormData((p) => ({ ...p, [key]: value }));
    };

    const showProofOfIdentity = !(isUpdateMode && traderStatus === "APPROVED");

    const inputCls =
        "h-[44px] w-full rounded-[12px] border bg-white px-4 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/40 outline-none transition-all font-medium border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]";

    const handleSubmit = async () => {
        // 1. File Upload Validation
        if (showProofOfIdentity && !idFile && !isUpdateMode) {
            toast.error("Please upload Proof of Identity document.", { id: "step2-validation-error" });
            return;
        }

        if (!logoFile && !isUpdateMode) {
            toast.error("Please upload Profile / Logo image.", { id: "step2-validation-error" });
            return;
        }

        // 2. Business Details Validation
        if (!formData.companyName.trim()) {
            toast.error("Please enter Registered Company Name.", { id: "step2-validation-error" });
            return;
        }

        if (!formData.companyType.trim()) {
            toast.error("Please select Company Type.", { id: "step2-validation-error" });
            return;
        }

        if (!formData.registrationNumber.trim()) {
            toast.error("Please enter NIF / Registration Number.", { id: "step2-validation-error" });
            return;
        }

        // if (selectedSkillServices.length === 0) {
        //     toast.error("Please select at least one Skill Service.", { id: "step2-validation-error" });
        //     return;
        // }

        // if (selectedSubCategories.length === 0) {
        //     toast.error("Please select at least one Sub Category.", { id: "step2-validation-error" });
        //     return;
        // }

        // if (!formData.location.trim()) {
        //     toast.error("Please enter Business Location.", { id: "step2-validation-error" });
        //     return;
        // }

        // if (!formData.about.trim()) {
        //     toast.error("Please provide information about your business.", { id: "step2-validation-error" });
        //     return;
        // }

        // 3. Confirmations & Terms Checkboxes Validation
        if (!formData.expMin1Year) {
            toast.error("Please confirm minimum 1-year experience in trade.", { id: "step2-validation-error" });
            return;
        }

        if (!formData.authorized) {
            toast.error("Please confirm you are authorized to operate this business.", { id: "step2-validation-error" });
            return;
        }

        if (!formData.vettingTerms) {
            toast.error("Please accept the vetting policy terms.", { id: "step2-validation-error" });
            return;
        }

        if (!formData.traderAgreement) {
            toast.error("Please agree to the Terms & Conditions and Trader Agreement.", { id: "step2-validation-error" });
            return;
        }

        if (!formData.privacyCookies) {
            toast.error("Please agree to the Privacy & Cookies policy.", { id: "step2-validation-error" });
            return;
        }

        setLoading(true);
        try {
            const payload = new FormData();
            payload.append("companyName", formData.companyName);
            payload.append("companyType", formData.companyType);
            payload.append("registrationNumber", formData.registrationNumber);

            // selectedSkillServices.forEach(id => payload.append("skillServiceIds", id));
            // selectedSubCategories.forEach(id => payload.append("subCategoryIds", id));

            payload.append("about", formData.about);
            // payload.append("location", formData.location);
            payload.append("minimumExperience", String(formData.expMin1Year));
            payload.append("authorisedBusiness", String(formData.authorized));
            payload.append("understandVettingPolicy", String(formData.vettingTerms));
            payload.append("acceptedPrivacyPolicy", String(formData.privacyCookies));

            if (logoFile) payload.append("logo", logoFile);
            if (idFile && showProofOfIdentity) payload.append("document", idFile);

            await traderRegisterStep2(payload);
            toast.success("Business verification submitted!");
            router.replace("/auth/trader-signup/step-3");
        } catch (err: any) {
            const msg =
                err.response?.data?.message?.[0] ||
                err.response?.data?.error ||
                err.message ||
                "An unexpected error occurred";
            toast.error(msg, { id: "step2-api-error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F0EDE8] pt-32 pb-20 px-4 flex justify-center font-sans">
            <div className="w-full max-w-[760px] bg-white rounded-[28px] shadow-[0_12px_48px_rgba(36,58,36,0.07)] border border-[#243A240A] p-8 sm:p-12 relative overflow-hidden">

                {/* Top Right Decorative Icon */}
                <div className="absolute top-8 right-8 w-12 h-12 bg-[#6E9625]/10 rounded-full flex items-center justify-center">
                    <ShieldCheck className="text-[#6E9625]" size={24} />
                </div>

                {/* Header */}
                <h1
                    className="text-[26px] sm:text-[30px] font-bold text-[#1C2C1C] tracking-tight leading-tight mb-2"
                    style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                    Business Verification
                </h1>
                <p className="text-[14px] text-[#1C2C1C]/55 font-medium mb-10">
                    Provide your credentials to unlock the full marketplace access.
                </p>

                {/* File Uploads */}
                <div className={`grid grid-cols-1 gap-6 mb-10 ${showProofOfIdentity ? 'sm:grid-cols-2' : ''}`}>
                    {/* Proof of Identity */}
                    {showProofOfIdentity && (
                        <div className="border border-dashed border-[#1C2C1C]/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-[#6E9625] hover:bg-[#6E9625]/5 transition-all bg-[#FAFAFA]">
                            <div className="w-10 h-10 bg-[#6E9625] rounded-full flex items-center justify-center text-white mb-4">
                                <IdCard size={18} />
                            </div>
                            <h3 className="text-[13px] font-bold text-[#1C2C1C] mb-1">Proof of Identity</h3>
                            <p className="text-[10px] text-[#1C2C1C]/40 mb-5 max-w-[200px]">
                                (Upload a valid ID/Passport. Formats .PDF, .JPG)
                            </p>
                            <label className="bg-[#1C2C1C] text-white text-[11px] font-bold py-2.5 px-6 rounded-full cursor-pointer hover:bg-[#2C4A2C] transition-colors shadow-sm">
                                {idFile ? "Change File" : "Choose File"}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                                />
                            </label>
                            {idFile && (
                                <div className="mt-3 inline-flex items-center gap-1.5 bg-[#6E9625]/12 border border-[#6E9625]/25 text-[#1C2C1C] text-[11px] font-semibold px-3 py-1 rounded-full max-w-full shadow-2xs">
                                    <span className="truncate max-w-[160px]">{idFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIdFile(null);
                                        }}
                                        className="p-0.5 text-[#1C2C1C]/50 hover:text-red-600 hover:bg-black/10 rounded-full transition-colors flex items-center justify-center"
                                        title="Remove file"
                                    >
                                        <X size={12} strokeWidth={2.5} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile / Logo */}
                    <div className="border border-dashed border-[#1C2C1C]/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-[#6E9625] hover:bg-[#6E9625]/5 transition-all bg-[#FAFAFA]">
                        {logoFile ? (
                            <div className="relative w-20 h-20 mb-3">
                                <img
                                    src={URL.createObjectURL(logoFile)}
                                    alt="Profile preview"
                                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-[#6E9625]"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLogoFile(null);
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors flex items-center justify-center"
                                    title="Remove image"
                                >
                                    <X size={12} strokeWidth={2.5} />
                                </button>
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-[#6E9625] rounded-full flex items-center justify-center text-white mb-4">
                                <ImageIcon size={18} />
                            </div>
                        )}
                        <h3 className="text-[13px] font-bold text-[#1C2C1C] mb-1">Profile / Logo</h3>
                        <p className="text-[10px] text-[#1C2C1C]/40 mb-4 max-w-[200px]">
                            (A high-quality business image for your public profile)
                        </p>
                        <label className="bg-[#1C2C1C] text-white text-[11px] font-bold py-2.5 px-6 rounded-full cursor-pointer hover:bg-[#2C4A2C] transition-colors shadow-sm">
                            {logoFile ? "Change Image" : "Upload Profile"}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                            />
                        </label>
                    </div>
                </div>

                {/* Business Details Divider */}
                <div className="flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#1C2C1C]/10"></div>
                    </div>
                    <span className="relative bg-white px-4 text-[10px] font-extrabold text-[#6E9625] tracking-widest uppercase">
                        Business Details
                    </span>
                </div>

                {/* Business Details Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="Registered Company Name *"
                        value={formData.companyName}
                        onChange={(e) => field("companyName", e.target.value)}
                        className={inputCls}
                    />
                    <div className="relative">
                        <select
                            value={formData.companyType}
                            onChange={(e) => field("companyType", e.target.value)}
                            className={`${inputCls} appearance-none pr-10 cursor-pointer bg-white ${!formData.companyType ? "text-[#1C2C1C]/40" : "text-[#1C2C1C]"
                                }`}
                        >
                            <option value="" disabled>
                                Company Type *
                            </option>
                            <option value="Sole Trader">Sole Trader</option>
                            <option value="Limited Company">Limited Company</option>
                            <option value="Partnership">Limited Liability Partnership</option>
                        </select>
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </span>
                    </div>
                    <input
                        type="text"
                        placeholder="NIF / Registration Number *"
                        value={formData.registrationNumber}
                        onChange={(e) => field("registrationNumber", e.target.value)}
                        className={inputCls}
                    />
                    {/* <MultiSelect
                        options={skillServices}
                        selectedIds={selectedSkillServices}
                        onChange={setSelectedSkillServices}
                        placeholder="Select Skill Services *"
                    />
                    <MultiSelect
                        options={subCategories}
                        selectedIds={selectedSubCategories}
                        onChange={setSelectedSubCategories}
                        placeholder="Select Sub Categories *"
                        disabled={selectedSkillServices.length === 0}
                    /> */}
                    {/* <input
                        type="text"
                        placeholder="Location *"
                        value={formData.location}
                        onChange={(e) => field("location", e.target.value)}
                        className={inputCls}
                    /> */}
                    <textarea
                        placeholder="About your business "
                        value={formData.about}
                        onChange={(e) => field("about", e.target.value)}
                        className={`${inputCls} sm:col-span-2 min-h-[80px] py-3 resize-none`}
                    />
                </div>

                {/* First Checkbox Group */}
                <div className="flex flex-col gap-3.5 mb-8">
                    <Checkbox
                        checked={formData.expMin1Year}
                        onChange={() => field("expMin1Year", !formData.expMin1Year)}
                        label="Minimum 1-year experience in trade."
                    />
                    <Checkbox
                        checked={formData.authorized}
                        onChange={() => field("authorized", !formData.authorized)}
                        label="I confirm I am authorized to operate this business."
                    />
                    <Checkbox
                        checked={formData.vettingTerms}
                        onChange={() => field("vettingTerms", !formData.vettingTerms)}
                        label="I understand that vetting is based on the information I provide and does not guarantee approval, profile visibility, or job leads."
                    />
                </div>

                {/* Second Checkbox Group */}
                <div className="mb-10">
                    <h4 className="text-[13px] font-extrabold text-[#1C2C1C] mb-4">Agree to:</h4>
                    <div className="flex flex-col gap-3.5">
                        <Checkbox
                            checked={formData.traderAgreement}
                            onChange={() => field("traderAgreement", !formData.traderAgreement)}
                            label="Terms & Conditions and Trader Agreement"
                        />
                        <Checkbox
                            checked={formData.privacyCookies}
                            onChange={() => field("privacyCookies", !formData.privacyCookies)}
                            label="Privacy & Cookies"
                        />
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#1C2C1C]/10 pt-8 gap-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-[18px] h-[18px] bg-[#6E9625] rounded-full flex items-center justify-center flex-shrink-0">
                            <Lock size={10} className="text-white" />
                        </div>
                        <p className="text-[11px] text-[#1C2C1C]/50 font-medium leading-tight">
                            All information is processed securely <br className="hidden sm:block" /> under GDPR regulations.
                        </p>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#1C2C1C] text-white text-[14px] font-bold py-3.5 px-8 rounded-[12px] flex items-center justify-center gap-2 hover:bg-[#2C4A2C] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Processing..." : "Save and Next"}
                        {!loading && <ChevronRight size={16} />}
                    </button>
                </div>

            </div>
        </main>
    );
}
