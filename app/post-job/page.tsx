"use client";
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CloudUpload, Zap, ArrowRight, Trash2 } from 'lucide-react';
import { authApi } from '@/app/api/authApi';
import api from '@/utils/api';
import { getAccessToken } from '@/utils/auth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setShowAuthModal(true);
    }

    authApi.getCategories().then(res => {
      setCategories(res?.data || res || []);
    }).catch(err => console.error("Failed to fetch categories", err));
  }, []);

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
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

  const handleSkillChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skillId = e.target.value;
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

    if (!categoryId || !skillServiceId || !title || !description || !timescale) {
      toast.error("Please fill in all required fields (Category, Service Type, Title, Description, Timescale)");
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
      formData.append('latitude', 51.507351.toString());
      formData.append('longitude', (-0.127758).toString());
      // formData.append('radiusKm', '9');
      if (budgetRange) formData.append('budgetRange', budgetRange);
      formData.append('emergency', String(emergency));

      files.forEach(file => {
        formData.append('files', file);
      });

      await authApi.postJob(formData);

      toast.success("Job posted successfully!");
      router.push('/customer-dashboard/jobs');
    } catch (error: any) {
      console.error("Failed to post job", error);
      toast.error(error?.response?.data?.message || "Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-xl flex flex-col items-center text-center">
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
                onClick={() => router.push('/')}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E5E7EB] text-[#555555] font-semibold hover:bg-gray-50 transition-all"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => router.push('/auth/login?redirect=/customer-dashboard/post-job')}
                className="flex-1 py-3 px-4 rounded-xl bg-[#6E9625] text-white font-bold hover:bg-[#58791C] transition-all"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="min-h-screen bg-[#F8F9F5] pt-40 pb-20 px-4 sm:px-6">
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
                <select
                  value={categoryId}
                  onChange={handleCategoryChange}
                  required
                  className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F7F5F04D]/30 px-4 text-[14px] text-[#555555] outline-none transition-all appearance-none"
                >
                  <option value="">Categories..</option>
                  {categories.map((c: any) => (
                    <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#243A24]">Service Type *</label>
                <select
                  value={skillServiceId}
                  onChange={handleSkillChange}
                  required
                  disabled={!categoryId}
                  className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F7F5F04D]/30 px-4 text-[14px] text-[#555555] outline-none transition-all appearance-none disabled:opacity-50"
                >
                  <option value="">Service Type..</option>
                  {skillServices.map((s: any) => (
                    <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Sub Category & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#243A24]">Sub Category</label>
                <select
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  disabled={!skillServiceId}
                  className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F7F5F04D]/30 px-4 text-[14px] text-[#555555] outline-none focus:border-[#6E9625] transition-all appearance-none disabled:opacity-50"
                >
                  <option value="">Sub Categories..</option>
                  {subCategories.map((s: any) => (
                    <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#243A24]">Location / Postcode</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-[#6E9625]" />
                  </div>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="e.g. DD4 X2K7"
                    className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F7F5F04D]/30 pl-10 pr-4 text-[14px] text-[#555555] outline-none  transition-all"
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Bedroom Fitted Wardrobes"
                className="h-[48px] w-full md:w-[calc(50%-12px)] rounded-[12px] border border-[#E5E7EB] bg-[#F7F5F04D]/30 px-4 text-[14px] text-[#555555] outline-none  transition-all"
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
                className="w-full rounded-[12px] border border-[#E5E7EB] bg-[#F7F5F04D]/30 p-4 text-[14px] text-[#555555] outline-none  transition-all min-h-[160px] resize-none"
              ></textarea>
            </div>

            {/* Row 5: Timescale & Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#243A24]">Project Timescale</label>
                <select
                  value={timescale}
                  onChange={(e) => setTimescale(e.target.value)}
                  className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F7F5F04D]/30 px-4 text-[14px] text-[#555555] outline-none  transition-all appearance-none"
                >
                  <option value="FLEXIBLE">Flexible / Planning stage</option>
                  <option value="URGENT">Urgent</option>
                  <option value="WITHIN_3_DAYS">Within 3 days</option>
                  <option value="WITHIN_1_WEEK">Within 1 week</option>
                  <option value="WITHIN_1_MONTH">Within 1 month</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#243A24]">Project Budget</label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F7F5F04D]/30 px-4 text-[14px] text-[#555555] outline-none  transition-all appearance-none"
                >
                  <option value="">Select Budget</option>
                  <option value="UNDER_100">Under €100</option>
                  <option value="UNDER_250">Under €250</option>
                  <option value="UNDER_500">Under €500</option>
                  <option value="UNDER_1000">Under €1,000</option>
                  <option value="UNDER_2000">Under €2,000</option>
                  <option value="UNDER_4000">Under €4,000</option>
                  <option value="UNDER_8000">Under €8,000</option>
                  <option value="BETWEEN_10000_20000">€10,000 - €20,000</option>
                  <option value="BETWEEN_20000_30000">€20,000 - €30,000</option>
                  <option value="ABOVE_30000">Above €30,000</option>
                </select>
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
