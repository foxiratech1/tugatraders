"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { authApi } from '@/app/api/authApi';
import {
  Star, MapPin, Phone, ShieldCheck, BadgeCheck, Building,
  Wrench, List, ChevronDown, Check, ChevronRight, ChevronLeft, Filter, Search,
  CheckCircle, Heart, Award, Briefcase, MessageSquare, Camera, LogIn, X, Target, Layers
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
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
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none z-10"><Icon size={14} /></div>
      <div
        className={`w-full bg-[#F3F4F6] text-[13px] font-medium rounded-xl h-[38px] pl-9 pr-8 outline-none flex items-center justify-between transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#E5E7EB]'} ${selectedOption ? 'text-[#1C2C1C] font-semibold' : 'text-[#4B5563]'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption ? selectedOption.name : placeholder}</span>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"><ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} /></div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-[0_15px_60px_rgba(0,0,0,0.12)] border border-gray-100 z-50 max-h-[220px] overflow-y-auto py-1.5 text-left [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <div
            className="px-3.5 py-2 hover:bg-[#F4F7F1] text-[12px] font-semibold text-[#6B7280] cursor-pointer transition-colors"
            onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false); }}
          >
            {placeholder}
          </div>
          {options.map((opt: any) => (
            <div
              key={opt.id}
              className={`px-3.5 py-2 hover:bg-[#F4F7F1] text-[12.5px] cursor-pointer transition-colors flex items-center justify-between ${value === opt.id ? 'bg-[#F4F7F1] text-[#6E9625] font-bold' : 'text-[#1C2C1C] font-medium'}`}
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

  const [searchName, setSearchName] = useState('');

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
  const [sortOption, setSortOption] = useState("Highest rated");
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
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
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

  // Full-screen image lightbox modal
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    traderName: string;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    traderName: '',
  });

  const openLightbox = (images: string[], index: number, traderName: string) => {
    if (!images || images.length === 0) return;
    setLightbox({
      isOpen: true,
      images,
      currentIndex: Math.max(0, Math.min(index, images.length - 1)),
      traderName,
    });
  };

  const closeLightbox = () => {
    setLightbox(prev => ({ ...prev, isOpen: false }));
  };

  const nextLightboxImage = () => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const prevLightboxImage = () => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  };

  useEffect(() => {
    if (!lightbox.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        prevLightboxImage();
      } else if (e.key === 'ArrowRight') {
        nextLightboxImage();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox.isOpen, lightbox.images.length]);

  // Track revealed phone numbers per trader card
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});
  const togglePhone = (traderId: string) => {
    setRevealedPhones(prev => ({ ...prev, [traderId]: true }));
  };

  const handleSendMessage = async (traderId: string) => {
    const token = getAccessToken();
    if (!token) {
      setPendingTraderId(traderId);
      setPendingAction("contact-trader");
      setShowLoginModal(true);
      return;
    }

    try {
      toast.loading("Opening conversation...", { id: "openChat" });
      const res = await authApi.getOrCreateConversation(traderId);
      const conversation = res?.data || res;
      const conversationId = conversation?.id || conversation?._id;
      if (conversationId) {
        toast.success("Conversation opened", { id: "openChat" });
        router.push(`/customer-dashboard/inbox?conversationId=${conversationId}&traderId=${traderId}`);
      } else {
        toast.dismiss("openChat");
        router.push(`/customer-dashboard/inbox?traderId=${traderId}`);
      }
    } catch (error: any) {
      console.error("Failed to open conversation:", error);
      toast.dismiss("openChat");
      router.push(`/customer-dashboard/inbox?traderId=${traderId}`);
    }
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
      handleSendMessage(id);
      return;
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
      handleSendMessage(traderId);
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
    .filter(t => !searchName || (t.fullName || '').toLowerCase().includes(searchName.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === "Highest rated") return (b.averageRating || 0) - (a.averageRating || 0);
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
      <section className="bg-[#F8F9F7] pt-3 sm:pt-5 pb-14 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-[18px] sm:text-[22px] font-extrabold text-[#1C2C1C]">
              {filteredResults.length} Professional{filteredResults.length !== 1 && 's'} found
            </h2>
            <div className="flex items-center gap-3 mt-2 sm:mt-0 text-[14px] w-full sm:w-auto">
              <span className="text-[#4B5563] font-medium hidden sm:inline">Sort by:</span>
              <div className="relative w-full sm:w-auto" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="bg-white border border-gray-200 hover:border-[#6E9625] px-3.5 py-2 rounded-xl font-bold text-[#243A24] flex items-center justify-between gap-3 min-w-[180px] w-full sm:w-auto shadow-xs transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#6E9625]/20 text-[13px]"
                >
                  <span className="truncate">{sortOption}</span>
                  <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSortDropdownOpen && (
                  <div className="absolute right-0 sm:right-0 left-0 sm:left-auto top-full mt-1.5 w-full sm:w-48 bg-white rounded-xl shadow-[0_15px_60px_rgba(0,0,0,0.12)] border border-gray-100 z-50 py-1.5">
                    {["Highest rated", "Most Relevant"].map(option => (
                      <div
                        key={option}
                        onClick={() => {
                          setSortOption(option);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`px-3.5 py-2 text-[12.5px] cursor-pointer transition-colors ${sortOption === option ? "bg-[#F4F7F1] text-[#6E9625] font-bold" : "text-[#4B5563] font-medium hover:bg-[#F4F7F1]"
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


          <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
            {/* Left Sidebar (Filters) */}
            <div className="w-full lg:w-[270px] xl:w-[300px] shrink-0 lg:sticky lg:top-[85px]">
              <div className="lg:hidden mb-3">
                <button
                  onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-2xl py-3 px-4 flex items-center justify-between text-[#1C2C1C] font-bold shadow-xs cursor-pointer text-[14px]"
                >
                  <span className="flex items-center gap-2"><Filter size={16} /> Filters & Search</span>
                  <ChevronDown size={16} className={`transition-transform ${showFiltersMobile ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className={`bg-white rounded-[22px] p-4 sm:p-5 shadow-xs border border-gray-100 mb-3 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
                {/* Header with Reset */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <h3 className="text-[16px] font-extrabold text-[#1C2C1C] flex items-center gap-2">
                    <Filter size={15} className="text-[#6E9625]" /> Filters
                  </h3>
                  <button
                    onClick={() => {
                      setSearchName('');
                      setSelectedCategory('');
                      setSelectedSkill('');
                      setSelectedSubCategory('');
                      setWorkRadius(20);
                      setMinRating(null);
                      setAppliedMinRating(null);
                      fetchTraders(true);
                    }}
                    className="text-[11.5px] font-bold text-gray-400 hover:text-[#6E9625] transition-colors cursor-pointer"
                  >
                    Reset all
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Search by Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Search by Name</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"><Search size={14} /></div>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full bg-[#F3F4F6] text-[#1C2C1C] text-[13px] font-medium rounded-xl h-[38px] pl-9 pr-3 outline-none placeholder-[#9CA3AF] focus:ring-1 focus:ring-[#6E9625] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
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
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Skills / Services</label>
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
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sub‑category</label>
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
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"><MapPin size={14} /></div>
                      <input
                        type="text"
                        placeholder="Enter Location"
                        className="w-full bg-[#F3F4F6] text-[#1C2C1C] text-[13px] font-medium rounded-xl h-[38px] pl-9 pr-8 outline-none placeholder-[#9CA3AF] focus:ring-1 focus:ring-[#6E9625] focus:bg-white transition-all"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] cursor-pointer hover:text-[#6E9625] transition-colors"><Target size={14} /></div>
                    </div>
                  </div>

                  {/* Work Radius */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Work Radius</label>
                      <span className="text-[11.5px] font-extrabold text-[#1C2C1C] bg-gray-100 px-2 py-0.5 rounded-md">{workRadius} KM</span>
                    </div>
                    <style>
                      {`
                      .radius-slider {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 100%;
                        height: 5px;
                        border-radius: 8px;
                        background: linear-gradient(to right, #6E9625 0%, #6E9625 ${workRadius}%, #E5E7EB ${workRadius}%, #E5E7EB 100%);
                        outline: none;
                      }
                      .radius-slider::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 14px;
                        height: 14px;
                        border-radius: 50%;
                        background: #ffffff;
                        border: 2px solid #6E9625;
                        cursor: pointer;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                      }
                      .radius-slider::-moz-range-thumb {
                        width: 14px;
                        height: 14px;
                        border-radius: 50%;
                        background: #ffffff;
                        border: 2px solid #6E9625;
                        cursor: pointer;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
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

                  {/* Action Button */}
                  <div className="pt-1.5">
                    <button
                      onClick={() => {
                        setAppliedMinRating(minRating);
                        fetchTraders();
                      }}
                      className="w-full h-[40px] bg-[#1C2C1C] hover:bg-[#2A412A] text-white font-bold text-[13px] rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
              <p className={`text-[11px] text-[#6B7280] leading-relaxed px-1 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
                TugaTrades connects customers with independent tradespeople. Services are provided directly by the tradesperson, not TugaTrades.
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
                      className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB] flex flex-col md:flex-row gap-5 xl:gap-6"
                    >
                      {/* ── Left: Image Gallery ── */}
                      <div className="w-full md:w-[180px] lg:w-[220px] xl:w-[280px] shrink-0 flex flex-col gap-2">
                        <div
                          className="w-full aspect-[4/3] rounded-xl overflow-hidden relative bg-gray-100 cursor-pointer group"
                          onClick={() => {
                            const portfolioUrls = (trader.portfolio && trader.portfolio.length > 0)
                              ? trader.portfolio.map((img: any) => getImageUrl(img))
                              : [getImageUrl(trader.profileImage || trader.logo)];
                            const currentIdx = activeImageIndex[trader.id] || 0;
                            openLightbox(portfolioUrls, currentIdx, trader.fullName || 'Trader');
                          }}
                          title="Click to view full image"
                        >
                          <Image
                            src={
                              activeImageIndex[trader.id] !== undefined && trader.portfolio && trader.portfolio.length > 0
                                ? getImageUrl(trader.portfolio[activeImageIndex[trader.id]])
                                : getImageUrl(trader.profileImage || trader.logo || (trader.portfolio && trader.portfolio.length > 0 ? trader.portfolio[0] : null))
                            }
                            alt={trader.fullName || 'Trader'}
                            fill
                            sizes="(max-width: 768px) 100vw, 320px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#1C2C1C] shadow-md">
                              <Camera size={18} />
                            </div>
                          </div>
                        </div>

                        {trader.portfolio && trader.portfolio.length > 0 && (
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
                                    const portfolioUrls = trader.portfolio!.map((item: any) => getImageUrl(item));
                                    openLightbox(portfolioUrls, actualIndex, trader.fullName || 'Trader');
                                  }}
                                  title="Click to view full image"
                                >
                                  <Image src={getImageUrl(img)} alt="" fill sizes="(max-width: 768px) 25vw, 80px" className="object-cover hover:scale-105 transition-transform" unoptimized />
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
                        <button
                          type="button"
                          onClick={() => {
                            if (trader.portfolio && trader.portfolio.length > 0) {
                              const portfolioUrls = trader.portfolio.map((img: any) => getImageUrl(img));
                              openLightbox(portfolioUrls, activeImageIndex[trader.id] || 0, trader.fullName || 'Trader');
                            }
                          }}
                          className="text-center text-gray-500 text-[13px] font-medium mt-1 flex justify-center items-center gap-1.5 hover:text-[#6E9625] transition-colors cursor-pointer w-full"
                        >
                          <Camera size={14} /> {trader.portfolio?.length || 0} Photos
                        </button>
                      </div>

                      {/* ── Middle: Info ── */}
                      <div className="flex-1 min-w-0 flex flex-col relative">

                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-[18px] lg:text-[20px] xl:text-[22px] font-bold text-[#1C2C1C] leading-tight">{trader.fullName}</h3>
                              {trader.isVerified && (
                                <span className="flex items-center gap-1 text-[#6E9625] bg-[#F4F7F1] border border-[#6E9625]/20 px-3 py-1 rounded-full text-[11px] xl:text-[12px] font-bold w-fit">
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
                        <div className="flex flex-wrap gap-2 lg:gap-4 xl:gap-6 mb-4 xl:mb-5">
                          <span className="flex items-center gap-1 text-[12px] xl:text-[13px] font-medium text-gray-500"><CheckCircle size={14} className="text-[#6E9625]" /> ID Check</span>
                          <span className="flex items-center gap-1 text-[12px] xl:text-[13px] font-medium text-gray-500"><CheckCircle size={14} className="text-[#6E9625]" /> Trade Check</span>
                          <span className="flex items-center gap-1 text-[12px] xl:text-[13px] font-medium text-gray-500"><CheckCircle size={14} className="text-[#6E9625]" /> Insurance Verified</span>
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
                        <p className="text-[#4B5563] text-[13px] leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4">
                          {trader.about || trader.aboutUs || "No description provided."}
                        </p>

                        {/* Location */}
                        {trader.location && (
                          <div className="flex items-center gap-2 text-[13px] font-medium text-[#4B5563] mt-auto">
                            <MapPin size={15} className="text-[#6E9625] shrink-0" />
                            <span className="truncate">{trader.location}</span>
                          </div>
                        )}

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
                      <div className="w-full md:w-[150px] lg:w-[180px] xl:w-[200px] shrink-0 flex flex-col justify-start gap-3 pt-5 md:pt-0 md:pl-4 xl:pl-6 border-t md:border-t-0 md:border-l border-gray-100 mt-2 md:mt-0">

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

                        <a href={`/profile/${trader.id}`} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-[#1C2C1C] text-white py-3.5 rounded-xl font-bold text-[14px] hover:bg-black transition-colors block">
                          View Profile
                        </a>

                        <button
                          onClick={() => handleSendMessage(trader.id)}
                          className="w-full bg-[#B91C1C] text-white py-3.5 rounded-xl font-bold text-[14px] hover:bg-[#991B1B] transition-colors cursor-pointer block"
                        >
                          Send Message
                        </button>

                        {/* Leave a Review */}
                        <div className="mt-1 xl:mt-2 text-center">
                          <button
                            onClick={(e) => handleProtectedAction(e, trader.id, "leave-review")}
                            className="text-gray-500 text-[13px] xl:text-[14px] font-semibold underline underline-offset-4 hover:text-gray-700 transition-colors cursor-pointer"
                          >
                            Leave a review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Pagination Buttons */}
              <div className="mt-8 flex justify-center gap-4">
                {displayCount > 3 && (
                  <button
                    onClick={() => setDisplayCount(3)}
                    className="w-full sm:w-auto bg-white text-[#243A24] font-bold py-3 px-8 rounded-xl border-2 border-[#243A24] hover:bg-gray-50 transition-colors text-[14px] cursor-pointer transform hover:scale-105"
                  >
                    Show Less
                  </button>
                )}
                {displayCount < filteredResults.length && (
                  <button
                    onClick={handleLoadMore}
                    className="w-full sm:w-auto bg-white text-[#243A24] font-bold py-3 px-8 rounded-xl border-2 border-[#243A24] hover:bg-gray-50 transition-colors text-[14px] cursor-pointer transform hover:scale-105"
                  >
                    Load More Professionals
                  </button>
                )}
              </div>
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

      {/* ── Fullscreen Lightbox Modal with Transparent Background ── */}
      {lightbox.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Top Bar: Trader Name, Counter, Close Button */}
          <div
            className="w-full max-w-5xl flex items-center justify-between py-3 px-4 text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-[16px] sm:text-[18px] text-white tracking-wide">
                {lightbox.traderName}
              </span>
              {lightbox.images.length > 1 && (
                <span className="text-[12px] sm:text-[13px] text-white/70 bg-white/10 px-2.5 py-1 rounded-full font-medium">
                  {lightbox.currentIndex + 1} / {lightbox.images.length}
                </span>
              )}
            </div>

            <button
              onClick={closeLightbox}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close image viewer"
            >
              <X size={22} />
            </button>
          </div>

          {/* Main Content Area with Navigation Arrows & Image */}
          <div
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Arrow */}
            {lightbox.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightboxImage();
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-110 z-30 border border-white/20 cursor-pointer shadow-xl"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Displayed Image */}
            <div className="relative max-h-[70vh] sm:max-h-[75vh] w-full h-full flex items-center justify-center">
              <img
                key={lightbox.currentIndex}
                src={lightbox.images[lightbox.currentIndex]}
                alt={`${lightbox.traderName} photo ${lightbox.currentIndex + 1}`}
                className="max-h-[70vh] sm:max-h-[75vh] max-w-full object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-200"
              />
            </div>

            {/* Right Arrow */}
            {lightbox.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightboxImage();
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-110 z-30 border border-white/20 cursor-pointer shadow-xl"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {lightbox.images.length > 1 && (
            <div
              className="flex items-center gap-2.5 max-w-full overflow-x-auto py-2 px-3 rounded-2xl bg-white/10 backdrop-blur-md z-20 scrollbar-thin scrollbar-thumb-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightbox(prev => ({ ...prev, currentIndex: idx }))}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${lightbox.currentIndex === idx
                    ? 'border-[#6E9625] scale-105 shadow-md opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DirectorySearchResults;
