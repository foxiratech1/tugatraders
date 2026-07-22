"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { authApi } from '@/app/api/authApi';
import {
  Star, MapPin, Phone, ShieldCheck, BadgeCheck, Building,
  Wrench, List, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAccessToken, getUserRole, parseJwt, clearTokens } from '@/utils/auth';
import { Role } from '@/utils/role';
import { LogIn, X } from 'lucide-react';

// Define the shape of the trader data returned by the API.
interface Trader {
  id: string;
  fullName: string;
  profileImage?: string | null;
  isVerified?: boolean;
  companyName?: string;
  location?: string;
  logo?: string;
  ratingAvg?: number;
  reviewCount?: number;
  workRadius?: number;
  subscriptionTier?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getImageUrl = (path?: string | null) => {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;

  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const imagePath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${imagePath}`;
};

const LoginModal = ({
  isOpen,
  onClose,
  onSuccess,
  action
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  action: "leave-review" | "view-profile" | "contact-trader";
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const accessToken = data?.accessToken || data?.access_token || data?.token;
      const refreshToken = data?.refreshToken || data?.refresh_token;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        onSuccess();
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const title = action === "leave-review"
    ? "Login to leave a review"
    : action === "contact-trader"
      ? "Login to contact trader"
      : "Login to view profile";
  const desc = action === "leave-review"
    ? "Please log in to share your experience with this trader."
    : action === "contact-trader"
      ? "Please log in to view contact info and chat with this trader."
      : "Please log in to view this trader's full profile.";
  const btnText = loading ? 'Logging in…' : 'Log In & Continue';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[420px] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#1C2C1C]/40 hover:bg-gray-100 hover:text-[#1C2C1C] transition-colors cursor-pointer text-lg"
        >
          ✕
        </button>

        <div className="w-12 h-12 rounded-full bg-[#F3F8EC] flex items-center justify-center mb-4">
          <LogIn size={22} className="text-[#6E9625]" />
        </div>

        <h3 className="text-[22px] font-bold text-[#1C2C1C] mb-1" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
          {title}
        </h3>
        <p className="text-[13px] text-[#1C2C1C]/55 font-medium mb-6">
          {desc}
        </p>

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-extrabold text-[#1C2C1C] uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] outline-none text-[14px] font-medium focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-[#1C2C1C] uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 rounded-xl border border-[#E5E5E5] outline-none text-[14px] font-medium focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 hover:text-[#1C2C1C] transition-colors cursor-pointer"
              >
                {showPw ? (
                  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3 bg-[#1C2C1C] text-white rounded-xl font-bold text-[14px] hover:bg-[#121E12] transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {btnText}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#1C2C1C]/50 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[#6E9625] font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

const DirectorySearchResults = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategoryId = searchParams?.get('categoryId') || '';

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [loading, setLoading] = useState(false);

  const [skillServices, setSkillServices] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');

  const [subCategories, setSubCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingSub, setLoadingSub] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  // Search results state
  const [traderResults, setTraderResults] = useState<Trader[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Pagination state – show first 3 items, load more on demand
  const [displayCount, setDisplayCount] = useState(3);

  // Login-prompt modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTraderId, setPendingTraderId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"leave-review" | "view-profile" | "contact-trader">("leave-review");

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    if (!pendingTraderId) return;

    if (pendingAction === "contact-trader") {
      const id = pendingTraderId;
      setPendingTraderId(null);
      try {
        await authApi.getTraderProfileById(id);
      } catch (err) {
        console.error("Failed to fetch trader profile by ID after login", err);
      }
      router.push(`/customer-dashboard/inbox?traderId=${id}`);
    } else if (pendingAction === "view-profile") {
      const id = pendingTraderId;
      setPendingTraderId(null);
      router.push(`/profile/${id}`);
    } else {
      const id = pendingTraderId;
      setPendingTraderId(null);
      const role = getUserRole();
      if (role === Role.Customer) {
        router.push(`/customer-dashboard/leave-review?traderId=${id}&reviewType=DIRECTORY`);
      } else {
        router.push(`/common/leave-review?traderId=${id}&reviewType=DIRECTORY`);
      }
    }
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 3, traderResults.length));
  };

  const handleProtectedAction = async (e: React.MouseEvent, traderId: string, actionType: "leave-review" | "view-profile" | "contact-trader") => {
    e.preventDefault();
    const token = getAccessToken();
    let isValid = false;
    if (token) {
      try {
        const decoded = parseJwt(token);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          isValid = true;
        }
      } catch (err) {
        console.error("Token verification failed", err);
      }
    }

    if (!isValid) {
      clearTokens();
      // Not logged in — show the login prompt modal instead of navigating
      setPendingTraderId(traderId);
      setPendingAction(actionType);
      setShowLoginModal(true);
      return;
    }

    if (actionType === "contact-trader") {
      try {
        await authApi.getTraderProfileById(traderId);
      } catch (err) {
        console.error("Failed to fetch trader profile by ID", err);
      }
      router.push(`/customer-dashboard/inbox?traderId=${traderId}`);
      return;
    }

    if (actionType === "view-profile") {
      router.push(`/profile/${traderId}`);
      return;
    }

    const role = getUserRole();
    if (role === Role.Customer) {
      router.push(`/customer-dashboard/leave-review?traderId=${traderId}&reviewType=DIRECTORY`);
    } else {
      router.push(`/common/leave-review?traderId=${traderId}&reviewType=DIRECTORY`);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const categoriesData = await authApi.getCategories();
        const categoriesArray = Array.isArray(categoriesData)
          ? categoriesData
          : Array.isArray(categoriesData?.data)
            ? categoriesData.data
            : Array.isArray(categoriesData?.categories)
              ? categoriesData.categories
              : [];
        setCategories([...categoriesArray].sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")));

        const categoryName = searchParams?.get('categoryName');
        if (!initialCategoryId && categoryName && categoriesArray.length > 0) {
          const matched = categoriesArray.find((c: any) => c.name?.toLowerCase() === categoryName.toLowerCase());
          if (matched) {
            setSelectedCategory(matched.id || matched._id);
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch skill/services when a category is selected
  useEffect(() => {
    if (!selectedCategory) {
      setSkillServices([]);
      return;
    }
    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const skillsData = await authApi.getSkillServices(selectedCategory);
        const servicesArray = Array.isArray(skillsData)
          ? skillsData
          : Array.isArray(skillsData?.data)
            ? skillsData.data
            : Array.isArray(skillsData?.services)
              ? skillsData.services
              : [];
        setSkillServices([...servicesArray].sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")));
      } catch (err) {
        console.error('Failed to load skill services', err);
        setSkillServices([]);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, [selectedCategory]);

  // Fetch sub‑categories when a skill service is selected
  useEffect(() => {
    if (!selectedSkill) {
      setSubCategories([]);
      setSelectedSubCategory('');
      return;
    }
    const fetchSubCategories = async () => {
      setLoadingSub(true);
      try {
        const subData = await authApi.getSubCategories(selectedSkill);
        const subArray = Array.isArray(subData)
          ? subData
          : Array.isArray(subData?.data)
            ? subData.data
            : Array.isArray(subData?.subCategories)
              ? subData.subCategories
              : [];
        setSubCategories([...subArray].sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")));
      } catch (err) {
        console.error('Failed to load sub‑categories', err);
        setSubCategories([]);
      } finally {
        setLoadingSub(false);
      }
    };
    fetchSubCategories();
  }, [selectedSkill]);

  // Fetch traders based on filter criteria
  const fetchTraders = async () => {
    setSearchLoading(true);
    setSearchError('');
    try {
      const params: Record<string, any> = {};
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedSkill) params.skillService = selectedSkill;
      if (selectedSubCategory) params.subCategory = selectedSubCategory;

      const data = await authApi.searchTraders(params);
      console.log("Search Traders API Response:", data);
      const results = Array.isArray(data) ? data : data?.data || [];
      console.log("Search Traders API Response:", data);
      setTraderResults(results);
      // Reset pagination when new results arrive
      setDisplayCount(3);
    } catch (err: any) {
      console.error('Search traders error', err);
      setSearchError(err?.message || 'Failed to load traders');
    } finally {
      setSearchLoading(false);
    }
  };

  // Trigger search on mount and when filters change
  useEffect(() => {
    fetchTraders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedSkill, selectedSubCategory]);

  return (
    <>
      <section className="bg-[#F8F9F7] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 xl:px-20">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 xl:gap-8">
          {/* Left Sidebar (Filters) */}
          <div className="w-full lg:w-[260px] xl:w-[320px] shrink-0">
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#F3F4F6] mb-6">
              <h3 className="text-[20px] font-bold text-[#243A24] mb-6">Filters</h3>
              <div className="flex flex-col gap-5">
                {/* Category */}
                <div>
                  <label className="block text-[14px] font-medium text-[#4B5563] mb-2">Category</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"><Wrench size={16} /></div>
                    <select
                      className="w-full bg-[#F3F4F6] text-[#243A24] text-[14px] font-medium rounded-xl py-3 pl-10 pr-10 appearance-none outline-none"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"><ChevronDown size={16} /></div>
                  </div>
                </div>
                {/* Skills / Services */}
                <div>
                  <label className="block text-[13px] font-medium text-[#4B5563] mb-2">Skills / Services</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"><List size={16} /></div>
                    <select
                      className="w-full bg-[#F3F4F6] text-[#4B5563] text-[14px] font-medium rounded-xl py-3 pl-10 pr-4 appearance-none outline-none"
                      disabled={loadingSkills}
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                    >
                      <option value="">Select Service</option>
                      {skillServices.map((svc) => (
                        <option key={svc.id} value={svc.id}>{svc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Sub‑category */}
                <div>
                  <label className="block text-[13px] font-medium text-[#4B5563] mb-2">Sub‑category</label>
                  <div className="relative">
                    <select
                      className="w-full bg-[#F3F4F6] text-[#4B5563] text-[14px] font-medium rounded-xl py-3 px-4 pr-10 appearance-none outline-none"
                      disabled={loadingSub}
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                    >
                      <option value="">Select Sub‑category</option>
                      {subCategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"><ChevronDown size={16} /></div>
                  </div>
                </div>
                {/* Location */}
                <div>
                  <label className="block text-[13px] font-medium text-[#4B5563] mb-2">Location</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"><MapPin size={16} /></div>
                    <input type="text" placeholder="Enter Postcode" className="w-full bg-[#F3F4F6] text-[#4B5563] text-[14px] font-medium rounded-xl py-3 pl-10 pr-4 outline-none placeholder-[#9CA3AF]" />
                  </div>
                </div>
                {/* Min Rating */}
                <div>
                  <label className="block text-[13px] font-medium text-[#4B5563] mb-2">Min. Rating</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-1">
                      {[...Array(4)].map((_, i) => <Star key={i} size={14} className="text-[#EAB308]" fill="currentColor" />)}
                      <Star size={14} className="text-[#D1D5DB]" />
                    </div>
                    <select className="w-full bg-[#F3F4F6] text-transparent text-[14px] font-medium rounded-xl py-3 pl-24 pr-10 appearance-none outline-none">
                      <option>4 Stars</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"><ChevronDown size={16} /></div>
                  </div>
                </div>
                {/* Search Button */}
                <button className="w-full bg-[#243A24] text-white font-bold py-3.5 rounded-xl hover:bg-[#1A301A] transition-colors mt-2">Search</button>
              </div>
            </div>
            <p className="text-[12px] text-[#6B7280] leading-relaxed px-2">
              TradeTrust is a platform connecting customers with independent traders. Any services agreed are provided by the trader, not TradeTrust.
            </p>
          </div>
          {/* Right Content (Results) */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
              <h2 className="text-[20px] sm:text-[24px] font-bold text-[#243A24] leading-tight" style={{ fontFamily: 'var(--font-bricolage)' }}>
                {traderResults.length} Professionals found in Manchester
              </h2>
              <div className="flex items-center gap-2 mt-4 sm:mt-0 text-[14px]">
                <span className="text-[#4B5563]">Sort by:</span>
                <button className="font-bold text-[#243A24] flex items-center gap-1">
                  Highest Rated <ChevronDown size={16} className="text-[#243A24]" />
                </button>
              </div>
            </div>
            {/* List of Traders */}
            {searchLoading ? (
              <p>Loading traders...</p>
            ) : searchError ? (
              <p className="text-red-600">{searchError}</p>
            ) : traderResults.length === 0 ? (
              <p>No traders found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {traderResults.slice(0, displayCount).map((trader) => (

                  <div
                    key={trader.id}
                    className="bg-white rounded-[12px] p-5 shadow-sm border border-[#E5E7EB] flex flex-col sm:flex-row gap-4"
                  >
                    {/* ── Left: Profile Image ── */}
                    <div className="w-full h-[180px] sm:w-[110px] sm:h-[110px] rounded-[10px] overflow-hidden shrink-0 relative bg-[#F3F4F6]">

                      <Image
                        src={
                          trader.profileImage
                            ? getImageUrl(trader.profileImage)
                            : getImageUrl(trader.logo)
                        }

                        alt={trader.fullName || 'Trader'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* ── Middle: Info ── */}
                    <div className="flex-1 min-w-0">
                      {/* Name + Vetted badge */}
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="text-[17px] font-bold text-[#1F2937]">{trader.fullName}</h3>
                        {trader.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6E9625] bg-[#F0F9F1] border border-[#c6e29c] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                            <BadgeCheck size={12} /> Vetted Trader
                          </span>
                        )}
                      </div>

                      {/* Specialty / company */}
                      <p className="text-[#6E9625] text-[13px] font-semibold mb-2">{trader.companyName}</p>

                      {/* Subscription tier (optional badge) */}
                      {trader.subscriptionTier && (
                        <span className="inline-block bg-[#E0F2FE] text-[#0369A1] text-[10px] font-medium px-2 py-0.5 rounded mb-2">
                          {trader.subscriptionTier}
                        </span>
                      )}

                      {/* Description placeholder */}
                      <p className="text-[#6B7280] text-[13px] leading-relaxed mb-3">
                        {/* Description field not supplied – can be added later */}
                      </p>

                      {/* Badges row: Insurance, ID Check, Trade Check */}
                      <div className="flex flex-wrap items-center gap-3 mb-3 text-[12px] text-[#4B5563]">
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={13} className="text-[#6E9625]" /> Insurance
                        </span>
                        <span className="flex items-center gap-1">
                          <BadgeCheck size={13} className="text-[#6E9625]" /> ID Check
                        </span>
                        <span className="flex items-center gap-1">
                          <Wrench size={13} className="text-[#6E9625]" /> Trade Check
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-[#6B7280] text-[12px]">
                        <MapPin size={13} className="text-[#6B7280]" />
                        {trader.location}
                        {trader.workRadius ? ` (Work radius: ${trader.workRadius} miles)` : ''}
                      </div>
                    </div>

                    {/* ── Right: Actions panel ── */}
                    <div className="flex flex-col items-stretch sm:items-end justify-between sm:min-w-[170px] border-t sm:border-t-0 sm:border-l border-[#F3F4F6] pt-3 sm:pt-0 sm:pl-5">
                      {/* Top: Leave a Review + stars + phone */}
                      <div className="flex flex-col items-start sm:items-end gap-1 mb-3">
                        <a
                          href="#"
                          onClick={(e) => handleProtectedAction(e, String(trader.id), "leave-review")}
                          className="text-[#6E9625] text-[12px] font-semibold hover:underline"
                        >
                          Leave a Review
                        </a>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              fill={i < Math.round(trader.ratingAvg ?? 0) ? '#FACC15' : 'none'}
                              className={i < Math.round(trader.ratingAvg ?? 0) ? 'text-[#FACC15]' : 'text-[#D1D5DB]'}
                            />
                          ))}
                          <span className="font-bold text-[#1F2937] text-[13px] ml-1">
                            {trader.ratingAvg?.toFixed(1) || '0.0'}
                          </span>
                          <span className="text-[#6B7280] text-[12px]">({trader.reviewCount || 0})</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleProtectedAction(e, String(trader.id), "contact-trader")}
                          className="flex items-center gap-1.5 text-[#4B5563] text-[12px] hover:text-[#6E9625] cursor-pointer transition-colors"
                        >
                          <Phone size={13} className="text-[#4B5563]" /> Click to view
                        </button>
                      </div>

                      {/* Bottom: action buttons */}
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <Link
                          href={`/profile/${trader.id}`}
                          className="w-full text-center border border-[#243A24] text-[#243A24] text-[13px] font-semibold py-2.5 px-5 rounded-[8px] hover:bg-[#f5f7f5] transition-colors"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Load More Button */}
            {displayCount < traderResults.length && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="w-full sm:w-auto bg-white text-[#243A24] font-bold py-3 px-8 rounded-xl border-2 border-[#243A24] hover:bg-gray-50 transition-colors text-[14px] cursor-pointer transform hover:scale-105"
                >
                  Load More Professionals
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => { setShowLoginModal(false); setPendingTraderId(null); }}
        onSuccess={handleLoginSuccess}
        action={pendingAction}
      />
    </>
  );
};

export default DirectorySearchResults;
