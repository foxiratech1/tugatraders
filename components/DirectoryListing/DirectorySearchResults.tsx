"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { authApi } from '@/app/api/authApi';
import {
  Star, MapPin, Phone, ShieldCheck, BadgeCheck, Building,
  Wrench, List, ChevronDown, Check, ChevronRight, Filter, Search,
  CheckCircle, Heart, Award, Briefcase, MessageSquare, Camera, LogIn, X, Target, Layers
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAccessToken, getUserRole, parseJwt, clearTokens } from '@/utils/auth';
import { Role } from '@/utils/role';

const FilterDropdown = ({ value, onChange, options, disabled, placeholder, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o: any) => o.id === value) || null;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none z-10"><Icon size={16} /></div>
      <div
        className={`w-full bg-[#F3F4F6] text-[14px] font-medium rounded-xl py-3 pl-10 pr-10 outline-none flex items-center justify-between transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#E5E7EB]'} ${selectedOption ? 'text-[#243A24]' : 'text-[#4B5563]'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption ? selectedOption.name : placeholder}</span>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"><ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} /></div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-[0_15px_60px_rgba(0,0,0,0.12)] border border-gray-100 z-50 max-h-[250px] overflow-y-auto py-2 text-left [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <div
            className="px-4 py-2.5 hover:bg-[#F4F7F1] text-[13px] font-semibold text-[#6B7280] cursor-pointer transition-colors"
            onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false); }}
          >
            {placeholder}
          </div>
          {options.map((opt: any) => (
            <div
              key={opt.id}
              className={`px-4 py-2.5 hover:bg-[#F4F7F1] text-[13px] cursor-pointer transition-colors flex items-center justify-between ${value === opt.id ? 'bg-[#F4F7F1] text-[#6E9625] font-bold' : 'text-[#243A24] font-medium'}`}
              onClick={(e) => { e.stopPropagation(); onChange(opt.id); setIsOpen(false); }}
            >
              <span className="truncate">{opt.name}</span>
              {value === opt.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#6E9625] flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Define the shape of the trader data returned by the API.
interface Trader {
  id: string;
  fullName: string;
  profileImage?: string | null;
  isVerified?: boolean;
  companyName?: string;
  location?: string;
  phone?: string;
  logo?: string;
  averageRating?: number;
  totalReviews?: number;
  workRadius?: number;
  subscriptionTier?: string;
  portfolio?: string[];
  tradeCategories?: any[];
  skillsServices?: any[];
  subCategories?: any[];
  tradeCategoryName?: string;
  tradeCategoryNames?: string[];
  skillServiceName?: string;
  skillServiceNames?: string[];
  subCategoryName?: string;
  subCategoryNames?: string[];
  about?: string;
  aboutUs?: string;
  completedJobs?: number;
  minimumExperience?: boolean;
  isSaved?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getImageUrl = (path?: any) => {
  if (!path) return "/avt.png";

  let p = typeof path === 'string' ? path : (path?.fileUrl || path?.url || path?.path || path?.src);
  if (!p || typeof p !== 'string') return "/placeholder.png";

  if (p.startsWith("http")) return p;

  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const imagePath = p.startsWith('/') ? p : `/${p}`;

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
  action: "leave-review" | "view-profile" | "contact-trader" | "save-trader";
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
      : action === "save-trader"
        ? "Login to save trader"
        : "Login to view profile";
  const desc = action === "leave-review"
    ? "Please log in to share your experience with this trader."
    : action === "contact-trader"
      ? "Please log in to view contact info and chat with this trader."
      : action === "save-trader"
        ? "Please log in to save this professional to your list."
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
  const initialSkillId = searchParams?.get('skillService') || '';
  const initialSubCategoryId = searchParams?.get('subCategory') || '';
  const initialLocation = searchParams?.get('location') || '';

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [loading, setLoading] = useState(false);

  const [skillServices, setSkillServices] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(initialSkillId);

  const [subCategories, setSubCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingSub, setLoadingSub] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialSubCategoryId);

  // Search Input for location
  const [searchTerm, setSearchTerm] = useState(initialLocation);

  // Work radius state
  const [workRadius, setWorkRadius] = useState(20);

  // Rating filter state
  const [minRating, setMinRating] = useState<number | null>(null);
  const [appliedMinRating, setAppliedMinRating] = useState<number | null>(null);

  // Search results state
  const [traderResults, setTraderResults] = useState<Trader[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Pagination state – show first 15 items, load more on demand
  const [displayCount, setDisplayCount] = useState(15);

  // Sort state
  const [sortOption, setSortOption] = useState("Highest Review");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Login-prompt modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTraderId, setPendingTraderId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"leave-review" | "view-profile" | "contact-trader" | "save-trader">("leave-review");

  // Track expanded skills state per trader card
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});
  const toggleSkills = (traderId: string) => {
    setExpandedSkills(prev => ({ ...prev, [traderId]: !prev[traderId] }));
  };

  // Image gallery states per trader card
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});
  const [expandedGallery, setExpandedGallery] = useState<Record<string, boolean>>({});

  // Track revealed phone numbers per trader card
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});
  const togglePhone = (traderId: string) => {
    setRevealedPhones(prev => ({ ...prev, [traderId]: true }));
  };

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    if (!pendingTraderId) return;

    if (pendingAction === "save-trader") {
      const id = pendingTraderId;
      setPendingTraderId(null);
      setTraderResults(prev => prev.map(t => t.id === id ? { ...t, isSaved: true } : t));
      try {
        await authApi.toggleSaveTrader(id);
      } catch (err) {
        console.error("Failed to toggle save after login", err);
        setTraderResults(prev => prev.map(t => t.id === id ? { ...t, isSaved: false } : t));
      }
      return;
    }

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
    setDisplayCount((prev) => Math.min(prev + 15, traderResults.length));
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
  const fetchTraders = async (clearAll = false) => {
    setSearchLoading(true);
    setSearchError('');
    try {
      const params: Record<string, any> = {};
      if (!clearAll) {
        if (selectedCategory) params.categoryId = selectedCategory;
        if (selectedSkill) params.skillService = selectedSkill;
        if (selectedSubCategory) params.subCategory = selectedSubCategory;
        if (workRadius > 0) params.radius = workRadius;
      }

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

  // Trigger search on mount only (Apply Filters button handles manual searches)
  useEffect(() => {
    fetchTraders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredResults = traderResults
    .filter(t => appliedMinRating === null || (t.averageRating || 0) >= appliedMinRating)
    .sort((a, b) => {
      if (sortOption === "Highest Review") return (b.averageRating || 0) - (a.averageRating || 0);
      if (sortOption === "Lowest Review") return (a.averageRating || 0) - (b.averageRating || 0);
      return 0;
    });

  const handleToggleSave = async (traderId: string) => {
    const token = getAccessToken();
    if (!token) {
      setPendingTraderId(traderId);
      setPendingAction("save-trader");
      setShowLoginModal(true);
      return;
    }

    setTraderResults(prev => prev.map(t => t.id === traderId ? { ...t, isSaved: !t.isSaved } : t));
    try {
      await authApi.toggleSaveTrader(traderId);
    } catch (err) {
      console.error('Failed to toggle save', err);
      setTraderResults(prev => prev.map(t => t.id === traderId ? { ...t, isSaved: !t.isSaved } : t));
    }
  };

  return (
    <>
      <section className="bg-[#F8F9F7] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 xl:px-20">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-[20px] sm:text-[24px] font-extrabold text-[#1C2C1C]">
              {filteredResults.length} Professional{filteredResults.length !== 1 && 's'} found in Manchester
            </h2>
            <div className="flex items-center gap-3 mt-4 sm:mt-0 text-[14px]">
              <span className="text-[#4B5563] font-medium hidden sm:inline">Sort by:</span>
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="bg-white border border-gray-200 hover:border-[#6E9625] px-4 py-2.5 rounded-xl font-bold text-[#243A24] flex items-center justify-between gap-3 min-w-[200px] shadow-sm transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#6E9625]/20"
                >
                  <span className="truncate">{sortOption}</span>
                  <ChevronDown size={16} className={`text-[#9CA3AF] transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSortDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-[0_15px_60px_rgba(0,0,0,0.12)] border border-gray-100 z-50 py-2">
                    {["Highest Review", "Lowest Review"].map(option => (
                      <div
                        key={option}
                        onClick={() => {
                          setSortOption(option);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`px-4 py-2.5 text-[13px] cursor-pointer transition-colors ${sortOption === option ? "bg-[#F4F7F1] text-[#6E9625] font-bold" : "text-[#4B5563] font-medium hover:bg-[#F4F7F1]"
                          }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>


          <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">
            {/* Left Sidebar (Filters) */}
            <div className="w-full lg:w-[260px] xl:w-[320px] shrink-0">
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#F3F4F6] mb-6">
                <h3 className="text-[20px] font-bold text-[#243A24] mb-6">Filters</h3>
                <div className="flex flex-col gap-5">
                  {/* Category */}
                  <div>
                    <label className="block text-[14px] font-medium text-[#4B5563] mb-2">Category</label>
                    <FilterDropdown
                      icon={Wrench}
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      disabled={loading}
                      placeholder="All Categories"
                      options={categories.map((cat) => ({ id: cat.id, name: cat.name }))}
                    />
                  </div>
                  {/* Skills / Services */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#4B5563] mb-2">Skills / Services</label>
                    <FilterDropdown
                      icon={List}
                      value={selectedSkill}
                      onChange={setSelectedSkill}
                      disabled={loadingSkills}
                      placeholder="Select Service"
                      options={skillServices.map((svc) => ({ id: svc.id, name: svc.name }))}
                    />
                  </div>
                  {/* Sub‑category */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#4B5563] mb-2">Sub‑category</label>
                    <FilterDropdown
                      icon={Layers}
                      value={selectedSubCategory}
                      onChange={setSelectedSubCategory}
                      disabled={loadingSub}
                      placeholder="Select Sub‑category"
                      options={subCategories.map((sub) => ({ id: sub.id, name: sub.name }))}
                    />
                  </div>
                  {/* Location */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#4B5563] mb-2">Location</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"><MapPin size={16} /></div>
                      <input type="text" placeholder="Enter Location" className="w-full bg-[#F3F4F6] text-[#4B5563] text-[14px] font-medium rounded-xl py-3 pl-10 pr-10 outline-none placeholder-[#9CA3AF]" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] cursor-pointer"><Target size={16} /></div>
                    </div>
                  </div>
                  {/* Work Radius */}
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[13px] font-medium text-[#4B5563]">Work Radius</label>
                      <span className="text-[12px] text-[#4B5563]">{workRadius} KM</span>
                    </div>
                    <style>
                      {`
                      .radius-slider {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 100%;
                        height: 6px;
                        border-radius: 8px;
                        background: linear-gradient(to right, #A1B072 0%, #A1B072 ${workRadius}%, #F4F7F1 ${workRadius}%, #F4F7F1 100%);
                        outline: none;
                      }
                      .radius-slider::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background: #ffffff;
                        border: 2px solid #A1B072;
                        cursor: pointer;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                      }
                      .radius-slider::-moz-range-thumb {
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background: #ffffff;
                        border: 2px solid #A1B072;
                        cursor: pointer;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                      }
                    `}
                    </style>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={workRadius}
                      onChange={(e) => setWorkRadius(Number(e.target.value))}
                      className="radius-slider"
                    />
                  </div>
                  {/* Rating */}
                  <div className="mt-2">
                    <label className="block text-[13px] font-medium text-[#4B5563] mb-4">Rating</label>
                    <div className="flex flex-col gap-3.5">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={minRating === 5}
                          onChange={() => setMinRating(minRating === 5 ? null : 5)}
                          className="w-4 h-4 rounded border-gray-300 text-[#243A24] focus:ring-[#243A24]"
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#9CA3AF" className="text-[#9CA3AF]" />)}
                        </div>
                        <span className="text-[13px] font-medium text-[#4B5563] ml-1">5.0</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={minRating === 4}
                          onChange={() => setMinRating(minRating === 4 ? null : 4)}
                          className="w-4 h-4 rounded border-gray-300 text-[#243A24] focus:ring-[#243A24]"
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(4)].map((_, i) => <Star key={i} size={14} fill="#9CA3AF" className="text-[#9CA3AF]" />)}
                          <Star size={14} className="text-[#D1D5DB]" />
                        </div>
                        <span className="text-[13px] font-medium text-[#4B5563] ml-1">& up 4.0</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={minRating === 3}
                          onChange={() => setMinRating(minRating === 3 ? null : 3)}
                          className="w-4 h-4 rounded border-gray-300 text-[#243A24] focus:ring-[#243A24]"
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(3)].map((_, i) => <Star key={i} size={14} fill="#9CA3AF" className="text-[#9CA3AF]" />)}
                          {[...Array(2)].map((_, i) => <Star key={i} size={14} className="text-[#D1D5DB]" />)}
                        </div>
                        <span className="text-[13px] font-medium text-[#4B5563] ml-1">& up 3.0</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={minRating === 2}
                          onChange={() => setMinRating(minRating === 2 ? null : 2)}
                          className="w-4 h-4 rounded border-gray-300 text-[#243A24] focus:ring-[#243A24]"
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(2)].map((_, i) => <Star key={i} size={14} fill="#9CA3AF" className="text-[#9CA3AF]" />)}
                          {[...Array(3)].map((_, i) => <Star key={i} size={14} className="text-[#D1D5DB]" />)}
                        </div>
                        <span className="text-[13px] font-medium text-[#4B5563] ml-1">& up 2.0</span>
                      </label>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 mt-4">
                    <button
                      onClick={() => {
                        setAppliedMinRating(minRating);
                        fetchTraders();
                      }}
                      className="w-full bg-[#243A24] text-white font-bold text-[14px] py-3.5 rounded-xl hover:bg-[#1A301A] transition-colors cursor-pointer"
                    >
                      Apply Filters
                    </button>
                    <button onClick={() => {
                      setSelectedCategory('');
                      setSelectedSkill('');
                      setSelectedSubCategory('');
                      setWorkRadius(20);
                      setMinRating(null);
                      setAppliedMinRating(null);
                      fetchTraders(true);
                    }} className="w-full bg-white text-[#4B5563] font-bold text-[14px] py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">Clear Filters</button>
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-[#6B7280] leading-relaxed px-2">
                TradeTrust is a platform connecting customers with independent traders. Any services agreed are provided by the trader, not TradeTrust.
              </p>
            </div>
            {/* Right Content (Results) */}
            <div className="flex-1">

              {/* List of Traders */}
              {searchLoading ? (
                <p>Loading traders...</p>
              ) : searchError ? (
                <p className="text-red-600">{searchError}</p>
              ) : filteredResults.length === 0 && !searchLoading ? (
                <div className="bg-white rounded-[24px] p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Search size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1C2C1C] mb-2">No professionals found</h3>
                  <p className="text-[#4B5563] text-[14px] max-w-md mx-auto">
                    Try adjusting your filters, expanding your work radius, or searching in a different category to find what you&apos;re looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedSkill('');
                      setSelectedSubCategory('');
                      setWorkRadius(20);
                      setMinRating(null);
                      setAppliedMinRating(null);
                      fetchTraders(true);
                    }}
                    className="mt-8 bg-white border border-[#243A24] text-[#243A24] px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {filteredResults.slice(0, displayCount).map((trader) => (
                    <div
                      key={trader.id}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB] flex flex-col md:flex-row gap-6"
                    >
                      {/* ── Left: Image Gallery ── */}
                      <div className="w-full md:w-[280px] shrink-0 flex flex-col gap-2">
                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative bg-gray-100">
                          <Image
                            src={
                              trader.portfolio && trader.portfolio.length > 0
                                ? getImageUrl(trader.portfolio[activeImageIndex[trader.id] || 0])
                                : getImageUrl(trader.profileImage || trader.logo)
                            }
                            alt={trader.fullName || 'Trader'}
                            fill
                            sizes="(max-width: 768px) 100vw, 320px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        {trader.portfolio && trader.portfolio.length > 1 && (
                          <div className="grid grid-cols-4 gap-2">
                            {trader.portfolio.slice(0, expandedGallery[trader.id] ? undefined : 4).map((img: any, actualIndex: number) => {
                              const isLastThumb = !expandedGallery[trader.id] && actualIndex === 3 && trader.portfolio!.length > 4;
                              const isActive = (activeImageIndex[trader.id] || 0) === actualIndex;

                              return (
                                <div
                                  key={actualIndex}
                                  className={`aspect-[4/3] rounded-xl overflow-hidden relative bg-gray-100 cursor-pointer transition-all ${isActive ? 'ring-2 ring-[#6E9625] ring-offset-1 opacity-100' : 'opacity-70 hover:opacity-100'}`}
                                  onClick={() => {
                                    if (isLastThumb) {
                                      setExpandedGallery(prev => ({ ...prev, [trader.id]: true }));
                                    }
                                    setActiveImageIndex(prev => ({ ...prev, [trader.id]: actualIndex }));
                                  }}
                                >
                                  <Image src={getImageUrl(img)} alt="" fill sizes="(max-width: 768px) 25vw, 80px" className="object-cover" unoptimized />
                                  {isLastThumb && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-[15px]">
                                      +{trader.portfolio!.length - 3}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {expandedGallery[trader.id] && trader.portfolio && trader.portfolio.length > 4 && (
                          <button
                            onClick={() => setExpandedGallery(prev => ({ ...prev, [trader.id]: false }))}
                            className="text-[#6E9625] text-[12px] font-bold hover:underline mt-1 text-center w-full"
                          >
                            Show less photos
                          </button>
                        )}
                        <div className="text-center text-gray-500 text-[13px] font-medium mt-1 flex justify-center items-center gap-1.5">
                          <Camera size={14} /> {trader.portfolio?.length || 0} Photos
                        </div>
                      </div>

                      {/* ── Middle: Info ── */}
                      <div className="flex-1 min-w-0 flex flex-col relative">

                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-[22px] font-bold text-[#1C2C1C]">{trader.fullName}</h3>
                              {trader.isVerified && (
                                <span className="flex items-center gap-1 text-[#6E9625] bg-[#F4F7F1] border border-[#6E9625]/20 px-3 py-1 rounded-full text-[12px] font-bold">
                                  <CheckCircle size={14} /> Vetted Trader
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 mb-4">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={16} fill={i < Math.round(trader.averageRating || 0) ? '#F59E0B' : 'none'} className={i < Math.round(trader.averageRating || 0) ? 'text-[#F59E0B]' : 'text-gray-200'} />
                                ))}
                              </div>
                              <span className="font-bold text-[#1C2C1C] text-[14px]">{trader.averageRating?.toFixed(1) || '0.0'}</span>
                              <span className="text-gray-400 text-[13px] font-medium">({trader.totalReviews || 0} reviews)</span>
                            </div>

                          </div>
                        </div>

                        {/* Checks */}
                        <div className="flex flex-wrap gap-4 sm:gap-6 mb-5">
                          <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500"><CheckCircle size={16} className="text-[#6E9625]" /> ID Check</span>
                          <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500"><CheckCircle size={16} className="text-[#6E9625]" /> Trade Check</span>
                          <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500"><CheckCircle size={16} className="text-[#6E9625]" /> Insurance Verified</span>
                        </div>

                        {/* Categories / Skills */}
                        <div className="flex flex-col gap-2 mb-5">
                          <div className="flex flex-wrap gap-2">
                            {trader.tradeCategories?.map((cat: any, i: number) => (
                              <span key={`cat-${i}`} className="bg-[#F4F7F1] text-[#6E9625] px-3.5 py-1.5 rounded-full text-[12px] font-bold">{cat.name}</span>
                            ))}
                          </div>
                          {(() => {
                            const combinedSkills = [...(trader.skillsServices || []), ...(trader.subCategories || [])];
                            const isExpanded = expandedSkills[trader.id];
                            const visibleSkills = isExpanded ? combinedSkills : combinedSkills.slice(0, 4);

                            return (
                              <div className="flex flex-wrap gap-2">
                                {visibleSkills.map((item: any, i: number) => (
                                  <span key={`skill-sub-${i}`} className="bg-[#F3F4F6] text-[#4B5563] px-3.5 py-1.5 rounded-full text-[12px] font-bold">{item.name}</span>
                                ))}
                                {!isExpanded && combinedSkills.length > 4 && (
                                  <button
                                    onClick={(e) => { e.preventDefault(); toggleSkills(trader.id); }}
                                    className="bg-[#F4F7F1] text-[#6E9625] px-3.5 py-1.5 rounded-full text-[12px] font-bold cursor-pointer hover:bg-[#E5F0DA] transition-colors"
                                  >
                                    +{combinedSkills.length - 4} more
                                  </button>
                                )}
                                {isExpanded && combinedSkills.length > 4 && (
                                  <button
                                    onClick={(e) => { e.preventDefault(); toggleSkills(trader.id); }}
                                    className="bg-[#F4F7F1] text-[#6E9625] px-3.5 py-1.5 rounded-full text-[12px] font-bold cursor-pointer hover:bg-[#E5F0DA] transition-colors"
                                  >
                                    Show less
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </div>


                        {/* Bio */}
                        <p className="text-[#4B5563] text-[13px] leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6">
                          {trader.about || trader.aboutUs || "No description provided."}
                        </p>

                        {/* <div className="mt-auto">
                       
                        <div className="flex items-center justify-start gap-4 sm:gap-8 lg:gap-12 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
                          {trader.minimumExperience && (
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center shrink-0">
                                <Award size={24} className="text-[#6E9625]" />
                              </div>
                              <div>
                                <div className="font-extrabold text-[#1C2C1C] text-[15px]">1+</div>
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Years Experience</div>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center shrink-0">
                              <Briefcase size={24} className="text-[#6E9625]" />
                            </div>
                            <div>
                              <div className="font-extrabold text-[#1C2C1C] text-[15px]">{trader.completedJobs || 0}</div>
                              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jobs Completed</div>
                            </div>
                          </div>
                        </div>

                       
                        <div className="flex items-center gap-3 text-[13px] font-semibold text-gray-500">
                          <span className="flex items-center gap-1.5 text-[#1C2C1C]"><MapPin size={15} className="text-gray-400" /> {trader.location || "Unknown"}</span>
                          <span className="text-gray-300">•</span>
                          <span>Working within {trader.workRadius || 0} miles</span>
                        </div>
                      </div> */}
                      </div>

                      {/* ── Right: Action Buttons ── */}
                      <div className="w-full md:w-[200px] shrink-0 flex flex-col justify-start gap-3 pt-6 md:pt-0 md:pl-6 md:border-l border-gray-100">

                        {/* Save Button */}
                        <div className="flex justify-end mb-2">
                          <button
                            onClick={() => handleToggleSave(trader.id)}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-[#6E9625] transition-colors font-medium text-[14px] cursor-pointer"
                          >
                            <Heart size={18} className={trader.isSaved ? "fill-[#6E9625] text-[#6E9625]" : ""} />
                            <span>Save</span>
                          </button>
                        </div>

                        {/* Click to view (Phone) */}
                        {!revealedPhones[trader.id] ? (
                          <button
                            onClick={() => togglePhone(trader.id)}
                            className="flex items-center justify-center gap-2 w-full bg-white border border-[#E0E0E0] rounded-xl py-3 text-[#4B5563] text-[14px] font-bold hover:bg-gray-50 transition-colors"
                          >
                            <Phone size={16} fill="currentColor" className="text-[#4B5563] shrink-0" />
                            <span>Click to view</span>
                          </button>
                        ) : (
                          <a
                            href={`tel:${trader.phone || ""}`}
                            className="flex items-center justify-center gap-2 w-full bg-[#F4F7F1] border border-[#6E9625] rounded-xl py-3 px-2 text-[#6E9625] text-[13px] font-bold hover:bg-[#E5F0DA] transition-colors"
                          >
                            <Phone size={15} fill="currentColor" className="text-[#6E9625] shrink-0" />
                            <span className="whitespace-nowrap">{trader.phone || "No phone"}</span>
                          </a>
                        )}

                        <Link href={`/profile/${trader.id}`} className="w-full text-center bg-[#1C2C1C] text-white py-3.5 rounded-xl font-bold text-[14px] hover:bg-black transition-colors block">
                          View Profile
                        </Link>

                        <button
                          onClick={(e) => {
                            const btn = e.currentTarget;
                            if (btn.disabled) return;
                            btn.disabled = true;

                            const storedUser = localStorage.getItem('user');
                            if (!storedUser) {
                              setPendingTraderId(trader.id);
                              setPendingAction("contact-trader");
                              setShowLoginModal(true);
                              btn.disabled = false;
                            } else {
                              router.push(`/customer-dashboard/inbox?traderId=${trader.id}`);
                              setTimeout(() => { btn.disabled = false; }, 2000);
                            }
                          }}
                          className="w-full bg-[#B91C1C] text-white py-3.5 rounded-xl font-bold text-[14px] hover:bg-[#991B1B] transition-colors cursor-pointer block disabled:opacity-70"
                        >
                          Send Message
                        </button>

                        {/* Leave a Review */}
                        <div className="mt-2 text-center">
                          <button
                            onClick={() => {
                              const storedUser = localStorage.getItem('user');
                              if (!storedUser) {
                                setPendingTraderId(trader.id);
                                setPendingAction("leave-review");
                                setShowLoginModal(true);
                              } else {
                                router.push(`/profile/${trader.id}?review=true`);
                              }
                            }}
                            className="text-gray-500 text-[14px] font-semibold underline underline-offset-4 hover:text-gray-700 transition-colors cursor-pointer"
                          >
                            Leave a review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Load More Button */}
              {displayCount < filteredResults.length && (
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
