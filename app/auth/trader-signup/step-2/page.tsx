"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IdCard, Image as ImageIcon, ChevronRight, Lock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { traderRegisterStep2, authApi } from "@/app/api/authApi";

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
      className={`mt-[2px] w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-all border ${
        checked
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

export default function Step2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyType: "",
    registrationNumber: "",
    skillServiceId: "",
    subCategoryId: "",
    location: "",
    about: "",
    expMin1Year: false,
    authorized: false,
    vettingTerms: false,
    traderAgreement: false,
    privacyCookies: false,
  });

  const [idFile, setIdFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [skillServices, setSkillServices] = useState<Array<{ id: string; name: string }>>([]);
  const [subCategories, setSubCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catId = params.get("categoryId");
    if (catId) {
      setCategoryId(catId);
      authApi.getSkillServices(catId).then(data => {
        if (Array.isArray(data)) setSkillServices(data);
        else if (data?.data && Array.isArray(data.data)) setSkillServices(data.data);
        else setSkillServices([]);
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (formData.skillServiceId) {
      authApi.getSubCategories(formData.skillServiceId).then(data => {
        if (Array.isArray(data)) setSubCategories(data);
        else if (data?.data && Array.isArray(data.data)) setSubCategories(data.data);
        else setSubCategories([]);
      }).catch(console.error);
    } else {
      setSubCategories([]);
    }
  }, [formData.skillServiceId]);

  const field = (key: keyof typeof formData, value: string | boolean) => {
    setFormData((p) => ({ ...p, [key]: value }));
  };

  const inputCls =
    "h-[44px] w-full rounded-[12px] border bg-white px-4 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/40 outline-none transition-all font-medium border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]";

  const handleSubmit = async () => {
    // Check required checkboxes
    if (!formData.traderAgreement || !formData.privacyCookies) {
      toast.error("Please agree to the terms and privacy policy.");
      return;
    }

    if (!idFile || !logoFile) {
      toast.error("Please upload both proof of identity and profile logo.");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("companyName", formData.companyName);
      payload.append("companyType", formData.companyType);
      payload.append("registrationNumber", formData.registrationNumber);
      
      
      if (formData.skillServiceId.trim()) {
        payload.append("skillServiceIds", formData.skillServiceId.trim());
      }
      if (formData.subCategoryId.trim()) {
        payload.append("subCategoryIds", formData.subCategoryId.trim());
      }
      
      payload.append("about", formData.about);
      payload.append("location", formData.location);
      payload.append("minimumExperience", String(formData.expMin1Year));
      payload.append("authorisedBusiness", String(formData.authorized));
      payload.append("understandVettingPolicy", String(formData.vettingTerms));
      payload.append("acceptedPrivacyPolicy", String(formData.privacyCookies));
      
      payload.append("logo", logoFile);
      payload.append("document", idFile);

      await traderRegisterStep2(payload);
      toast.success("Business verification submitted!");
      router.push("/auth/trader-signup/step-3");
    } catch (err: any) {
      const msg =
        err.response?.data?.message?.[0] ||
        err.response?.data?.error ||
        err.message ||
        "An unexpected error occurred";
      toast.error(msg);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {/* Proof of Identity */}
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
              <p className="text-[10px] text-[#6E9625] mt-3 font-bold truncate max-w-full">
                {idFile.name}
              </p>
            )}
          </div>

          {/* Profile / Logo */}
          <div className="border border-dashed border-[#1C2C1C]/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-[#6E9625] hover:bg-[#6E9625]/5 transition-all bg-[#FAFAFA]">
            <div className="w-10 h-10 bg-[#6E9625] rounded-full flex items-center justify-center text-white mb-4">
              <ImageIcon size={18} />
            </div>
            <h3 className="text-[13px] font-bold text-[#1C2C1C] mb-1">Profile / Logo</h3>
            <p className="text-[10px] text-[#1C2C1C]/40 mb-5 max-w-[200px]">
              (A high-quality business image for your public profile)
            </p>
            <label className="bg-[#1C2C1C] text-white text-[11px] font-bold py-2.5 px-6 rounded-full cursor-pointer hover:bg-[#2C4A2C] transition-colors shadow-sm">
              {logoFile ? "Change File" : "Upload Profile"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </label>
            {logoFile && (
              <p className="text-[10px] text-[#6E9625] mt-3 font-bold truncate max-w-full">
                {logoFile.name}
              </p>
            )}
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
            placeholder="Registered Company Name"
            value={formData.companyName}
            onChange={(e) => field("companyName", e.target.value)}
            className={inputCls}
          />
          <div className="relative">
            <select
              value={formData.companyType}
              onChange={(e) => field("companyType", e.target.value)}
              className={`${inputCls} appearance-none pr-10 cursor-pointer bg-white ${
                !formData.companyType ? "text-[#1C2C1C]/40" : "text-[#1C2C1C]"
              }`}
            >
              <option value="" disabled>
                Company Type
              </option>
              <option value="Sole Trader">Sole Trader</option>
              <option value="Limited Company">Limited Company</option>
              <option value="Partnership">Partnership</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
          <input
            type="text"
            placeholder="NIF / Registration Number"
            value={formData.registrationNumber}
            onChange={(e) => field("registrationNumber", e.target.value)}
            className={inputCls}
          />
          <div className="relative">
            <select
              value={formData.skillServiceId}
              onChange={(e) => {
                field("skillServiceId", e.target.value);
                field("subCategoryId", "");
              }}
              className={`${inputCls} appearance-none pr-10 cursor-pointer bg-white ${
                !formData.skillServiceId ? "text-[#1C2C1C]/40" : "text-[#1C2C1C]"
              }`}
            >
              <option value="" disabled>Select Skill Service</option>
              {skillServices.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40">
              <ChevronDown />
            </span>
          </div>
          <div className="relative">
            <select
              value={formData.subCategoryId}
              onChange={(e) => field("subCategoryId", e.target.value)}
              disabled={!formData.skillServiceId}
              className={`${inputCls} appearance-none pr-10 cursor-pointer bg-white ${
                !formData.subCategoryId ? "text-[#1C2C1C]/40" : "text-[#1C2C1C]"
              } disabled:opacity-50`}
            >
              <option value="" disabled>Select Sub Category</option>
              {subCategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40">
              <ChevronDown />
            </span>
          </div>
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => field("location", e.target.value)}
            className={inputCls}
          />
          <textarea
            placeholder="About your business"
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
