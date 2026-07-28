"use client";
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CloudUpload, Zap, ArrowRight, Trash2, ChevronDown, X, Megaphone } from 'lucide-react';
import { authApi } from '@/app/api/authApi';
import api from '@/utils/api';
import { getAccessToken } from '@/utils/auth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  options: { id: string; name: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.id === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`h-[48px] w-full rounded-[12px] border ${isOpen ? "border-[#6E9625]" : "border-[#E5E7EB]"
          } bg-[#F7F5F04D]/30 px-4 flex items-center justify-between transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
      >
        {selectedOption ? (
          <div className="flex items-center gap-1.5 bg-[#F3F8EC] rounded-md px-2.5 py-1">
            <span className="text-[13px] font-bold text-[#6E9625]">
              {selectedOption.name}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onChange("");
              }}
              className="text-[#6E9625] hover:text-red-500 cursor-pointer text-[14px] leading-none"
            >
              ×
            </span>
          </div>
        ) : (
          <span className="text-[14px] text-[#555555]">{placeholder}</span>
        )}
        <ChevronDown size={18} className="text-[#9CA3AF]" />
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-h-[260px] overflow-y-auto z-50 py-2 custom-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
              >
                <div
                  className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${isSelected
                    ? "bg-[#111827] border-[#111827]"
                    : "border-[#D1D5DB] bg-white"
                    }`}
                >
                  {isSelected && (
                    <svg
                      viewBox="0 0 14 14"
                      fill="none"
                      className="w-3 h-3 text-white"
                    >
                      <path
                        d="M2.5 7.5L5.5 10.5L11.5 3.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-[14px] ${isSelected ? "text-[#111827] font-medium" : "text-[#4B5563]"
                    }`}
                >
                  {opt.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function PostJobPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories data state
  const [categories, setCategories] = useState<any[]>([]);
  const [skillServices, setSkillServices] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  // Form state
  const [categoryId, setCategoryId] = useState("");
  const [skillServiceId, setSkillServiceId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [postcode, setPostcode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timescale, setTimescale] = useState("FLEXIBLE");
  const [budgetRange, setBudgetRange] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load from sessionStorage if exists
  useEffect(() => {
    const savedData = sessionStorage.getItem('pendingJobPost');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.categoryId) setCategoryId(parsed.categoryId);
        if (parsed.skillServiceId) setSkillServiceId(parsed.skillServiceId);
        if (parsed.subCategoryId) setSubCategoryId(parsed.subCategoryId);
        if (parsed.postcode) setPostcode(parsed.postcode);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.timescale) setTimescale(parsed.timescale);
        if (parsed.budgetRange) setBudgetRange(parsed.budgetRange);
        if (parsed.emergency !== undefined) setEmergency(parsed.emergency);
      } catch (e) {
        console.error('Failed to parse pending job post data', e);
      }
    }
  }, []);

  useEffect(() => {
    authApi.getCategories().then(res => {
      setCategories(res?.data || res || []);
    }).catch(err => console.error("Failed to fetch categories", err));
  }, []);

  const handleCategoryChange = async (catId: string) => {
    setCategoryId(catId);
    setSkillServiceId("");
    setSubCategoryId("");
    setSkillServices([]);
    setSubCategories([]);
    if (catId) {
      try {
        const res = await authApi.getSkillServices(catId);
        setSkillServices(res?.data || res || []);
      } catch (err) {
        console.error("Failed to fetch skills", err);
      }
    }
  };

  const handleSkillChange = async (skillId: string) => {
    setSkillServiceId(skillId);
    setSubCategoryId("");
    setSubCategories([]);
    if (skillId) {
      try {
        const res = await authApi.getSubCategories(skillId);
        setSubCategories(res?.data || res || []);
      } catch (err) {
        console.error("Failed to fetch sub categories", err);
      }
    }
  };

  // Keep skill and subcategories synced when loaded from sessionStorage
  useEffect(() => {
    if (categoryId && skillServices.length === 0) {
      authApi.getSkillServices(categoryId).then(res => setSkillServices(res?.data || res || []));
    }
  }, [categoryId]);

  useEffect(() => {
    if (skillServiceId && subCategories.length === 0) {
      authApi.getSubCategories(skillServiceId).then(res => setSubCategories(res?.data || res || []));
    }
  }, [skillServiceId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB

      selectedFiles.forEach(file => {
        if (file.size >= MAX_SIZE) {
          toast.error(`${file.name} is 5MB or larger. Please upload a smaller file.`);
        } else {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    if (!categoryId) {
      toast.error("Please select a Category.");
      return;
    }

    if (!skillServiceId) {
      toast.error("Please select a Service Type.");
      return;
    }

    if (!subCategoryId) {
      toast.error("Please select a Sub Category.");
      return;
    }

    if (!postcode.trim()) {
      toast.error("Please enter a Location or Postcode.");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a Job Title.");
      return;
    }

    if (title.trim().length < 5) {
      toast.error("Job title must be at least 5 characters long.");
      return;
    }

    if (!description.trim() || !timescale) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('skillServiceId', skillServiceId);
      if (subCategoryId) formData.append('subCategoryId', subCategoryId);
      if (postcode) formData.append('postcode', postcode);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('timescale', timescale);
      formData.append('latitude', 22.5630.toString());
      formData.append('longitude', 75.7669.toString());
      // formData.append('radiusKm', '9');
      if (budgetRange) formData.append('budgetRange', budgetRange);
      formData.append('emergency', String(emergency));

      files.forEach(file => {
        formData.append('files', file);
      });

      await authApi.postJob(formData);

      sessionStorage.removeItem('pendingJobPost'); // Clear after success
      toast.success("Job posted successfully!");
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Failed to post job", error);
      toast.error(error?.response?.data?.message || "Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[24px] p-10 max-w-[400px] w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mb-6">
              <Megaphone className="text-[#32C850]" size={36} fill="#32C850" />
            </div>
            <h2 className="text-[22px] font-bold text-[#1C2C1C] mb-3">
              Job Posted Successfully
            </h2>
            <p className="text-[#6B7280] text-[15px] mb-8">
              Traders in your area have been notified.
            </p>
            <button
              onClick={() => router.push('/customer-dashboard/jobs')}
              className="w-full bg-[#0A2B14] hover:bg-[#144221] text-white font-bold py-3.5 rounded-[12px] transition-colors text-[15px]"
            >
              View Job
            </button>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-xl flex flex-col items-center text-center relative">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#555555] hover:text-[#243A24]"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-[#F0F5E8] rounded-full flex items-center justify-center mb-4">
              <Zap className="text-[#6E9625]" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#243A24] mb-2" style={{ fontFamily: 'var(--font-bricolage)' }}>
              Login Required
            </h2>
            <p className="text-[#555555] mb-6">
              First you need to login, then you can post a job and find the perfect match for your project.
            </p>
            <div className="flex gap-4 w-full">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('pendingJobPost', JSON.stringify({
                    categoryId, skillServiceId, subCategoryId, postcode, title, description, timescale, budgetRange, emergency
                  }));
                  router.push('/auth/login?redirect=/post-job');
                }}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#6E9625] text-white font-bold text-base hover:bg-[#5c801e] transition-all shadow-sm"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('pendingJobPost', JSON.stringify({
                    categoryId, skillServiceId, subCategoryId, postcode, title, description, timescale, budgetRange, emergency
                  }));
                  router.push('/auth/signup?redirect=/post-job');
                }}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#C00000] text-white font-bold text-base hover:bg-[#a60000] transition-all shadow-sm"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="min-h-screen bg-[#F8F9F5] pt-40 pb-20 px-4 sm:px-6">
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            margin: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #9CA3AF;
            border-radius: 10px;
            border: 2px solid white;
          }
        `}</style>
        <div className="max-w-[800px] mx-auto bg-white rounded-[24px] shadow-sm border border-[#243A240A] p-6 sm:p-10">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[28px] sm:text-[32px] font-bold text-[#243A24] mb-2" style={{ fontFamily: 'var(--font-bricolage)' }}>
              Post Your Job Details
            </h1>
            <p className="text-[#243A2499]/60 text-[14px] font-medium">
              Tell us what you need and we'll find the perfect match.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Row 1: Category & Service Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#243A24]">Category *</label>
                <CustomDropdown
                  options={categories.map(c => ({ id: c.id || c._id, name: c.name }))}
                  value={categoryId}
                  onChange={handleCategoryChange}
                  placeholder="Categories.."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#243A24]">Service Type *</label>
                <CustomDropdown
                  options={skillServices.map(s => ({ id: s.id || s._id, name: s.name }))}
                  value={skillServiceId}
                  onChange={handleSkillChange}
                  placeholder="Service Type.."
                  disabled={!categoryId}
                />
              </div>
            </div>

            {/* Row 2: Sub Category & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#243A24]">Sub Category *</label>
                <CustomDropdown
                  options={subCategories.map(s => ({ id: s.id || s._id, name: s.name }))}
                  value={subCategoryId}
                  onChange={setSubCategoryId}
                  placeholder="Sub Categories.."
                  disabled={!skillServiceId}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#243A24]">Location / Postcode *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-[#6E9625]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="e.g. DD4 X2K7"
                    className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F7F5F04D]/30 pl-10 pr-4 text-[14px] text-[#555555] outline-none focus:border-[#6E9625] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Job Title */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#243A24]">Job Title *</label>
              <input
                type="text"
                required
                minLength={5}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Bedroom Fitted Wardrobes"
                className="h-[48px] w-full md:w-[calc(50%-12px)] rounded-[12px] border border-[#E5E7EB] bg-[#F7F5F04D]/30 px-4 text-[14px] text-[#555555] outline-none focus:border-[#6E9625] transition-all"
              />
            </div>

            {/* Row 4: Project Description */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <label className="text-[12px] font-bold text-[#243A24]">Project Description *</label>
                <span className="text-[11px] text-[#555555]/60 font-medium">{description.length} / 2000 characters</span>
              </div>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                placeholder="Describe the project in detail, including measurements and specific material preferences..."
                className="w-full rounded-[12px] border border-[#E5E7EB] bg-[#F7F5F04D]/30 p-4 text-[14px] text-[#555555] outline-none focus:border-[#6E9625] transition-all min-h-[160px] resize-none"
              ></textarea>
            </div>

            {/* Row 5: Timescale & Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#243A24]">Project Timescale</label>
                <CustomDropdown
                  options={[
                    { id: "FLEXIBLE", name: "Flexible / Planning stage" },
                    { id: "URGENT", name: "Urgent" },
                    { id: "WITHIN_3_DAYS", name: "Within 3 days" },
                    { id: "WITHIN_1_WEEK", name: "Within 1 week" },
                    { id: "WITHIN_1_MONTH", name: "Within 1 month" }
                  ]}
                  value={timescale}
                  onChange={setTimescale}
                  placeholder="Select Timescale"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#243A24]">Project Budget</label>
                <CustomDropdown
                  options={[
                    { id: "UNDER_100", name: "Under €100" },
                    { id: "UNDER_250", name: "Under €250" },
                    { id: "UNDER_500", name: "Under €500" },
                    { id: "UNDER_1000", name: "Under €1,000" },
                    { id: "UNDER_2000", name: "Under €2,000" },
                    { id: "UNDER_4000", name: "Under €4,000" },
                    { id: "UNDER_8000", name: "Under €8,000" },
                    { id: "BETWEEN_10000_20000", name: "€10,000 - €20,000" },
                    { id: "BETWEEN_20000_30000", name: "€20,000 - €30,000" },
                    { id: "ABOVE_30000", name: "Above €30,000" }
                  ]}
                  value={budgetRange}
                  onChange={setBudgetRange}
                  placeholder="Select Budget"
                />
              </div>
            </div>

            {/* Emergency Toggle */}
            <div className="bg-[#FAFAF9] border border-[#243A240A] rounded-[16px] p-4 flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Zap size={18} className="text-red-500 fill-red-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#243A24]">Is this an emergency?</span>
                  <span className="text-[12px] text-[#555555] font-medium">Check this if you need help immediately</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={emergency}
                  onChange={(e) => setEmergency(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6E9625]"></div>
              </label>
            </div>

            {/* File Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#6E96254D]/30 bg-[#6E96250D]/5 rounded-[16px] p-8 flex flex-col items-center justify-center text-center mt-2 cursor-pointer transition-colors hover:bg-[#6E96250D]/10"
            >
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,application/pdf"
              />
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                <CloudUpload size={20} className="text-[#6E9625]" />
              </div>
              <h3 className="text-[15px] font-bold text-[#243A24] mb-1">
                Upload project photos or plans
              </h3>
              <p className="text-[13px] text-[#555555] font-medium mb-3">
                Click to browse files
              </p>
              <p className="text-[10px] text-[#555555]/60 font-bold tracking-wider uppercase mb-2">
                MAX FILE SIZE 5MB • JPEG, PNG, PDF
              </p>
              {files.length > 0 && (
                <div
                  className="mt-4 flex flex-wrap gap-3 justify-center w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  {files.map((f, i) => (
                    <div key={i} className="relative group w-16 h-16 rounded-md overflow-hidden border border-[#E5E7EB] bg-white shadow-sm flex-shrink-0">
                      {f.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#555555] bg-gray-50">
                          <span className="text-[10px] font-bold uppercase truncate px-1 max-w-full">{f.name.split('.').pop()}</span>
                        </div>
                      )}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles(prev => prev.filter((_, idx) => idx !== i));
                        }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 size={20} className="text-white hover:text-red-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Note */}
            <div className="bg-[#6E962533] rounded-[12px] p-5 flex items-start gap-4 mt-4">
              <div className="w-6 h-6 rounded-full bg-[#6E9625] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <span className="text-white text-[14px] font-bold leading-none">!</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#111111] mb-1">Note:</span>
                <p className="text-[13px] text-[#555555] font-medium leading-relaxed">
                  We recommend confirming all details, pricing, and terms directly with the trader before proceeding.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#243A24] hover:bg-[#1a2b1a] text-white font-bold py-3.5 px-12 cursor-pointer rounded-[10px] text-[14px] transition-all flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post your job'} <ArrowRight size={16} />
              </button>
            </div>

          </form>
        </div>
      </main>
    </>
  );
}
