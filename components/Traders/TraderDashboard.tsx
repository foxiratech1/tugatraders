"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi, getRegistrationStatus } from "@/app/api/authApi";
import { useSocket } from "@/hooks/useSocket";
import {
  Luggage,
  MessageSquare,
  Star,
  ShieldCheck,
  Headphones,
  ChevronRight,
  Eye,
  Send,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Compass,
  BellRing,
  ClipboardCheck,
  ChevronDown,
  Loader2,
  Check,
  Flame,
  Euro,
  Clock,
  Calendar,
  Paperclip,
  Trash2,
  X
} from "lucide-react";

interface JobItem {
  id: string;
  jobId?: string;
  title?: string;
  description?: string;
  location?: string;
  postcode?: string;
  distanceText?: string;
  distance?: string;
  postedAgo?: string;
  updatedText?: string;
  updatedAt?: string;
  tags?: string[];
  imageUrl?: string | null;
  category?: { id?: string; name?: string; image?: string | null };
  categoryName?: string;
  attachments?: Array<{ url?: string; file?: string }>;
  quotesCount?: number;
  budget?: string | number;
  budgetRange?: string;
  emergency?: boolean;
  isEmergency?: boolean;
  timescale?: string;
}

interface TraderDashboardData {
  welcome?: {
    fullName?: string;
    companyName?: string;
    displayName?: string;
  };
  actionRequired?: {
    newJobsCount?: number;
    quotesAwaitingResponseCount?: number;
    inProgressJobsCount?: number;
    newReviewsCount?: number;
    profileCompleteness?: {
      isCompleted?: boolean;
      nextStep?: string;
    };
  };
  status?: {
    profileCompletenessPercentage?: number;
    profileCompletenessNextStep?: string;
    subscription?: {
      tierName?: string;
      activeUntil?: string;
    };
  };
  newJobs?: JobItem[];
  openJobs?: JobItem[];
  inProgressJobs?: JobItem[];
  jobsWorkingOn?: JobItem[];
  performance?: {
    jobsViewed?: { value?: number; trendPercentage?: number };
    quotesSent?: { value?: number; trendPercentage?: number };
    quoteAcceptanceRate?: { value?: number; trendPercentage?: number };
    profileViews?: { value?: number; trendPercentage?: number };
    averageRating?: { value?: number; trendChange?: number };
    responseRate?: { value?: number; trendPercentage?: number };
  };
  data?: TraderDashboardData;
}

interface TraderProfileData {
  fullName?: string;
  name?: string;
  subscriptionTier?: string;
  traderProfile?: {
    subscriptionTier?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface RegistrationData {
  profileCompletionPercentage?: number;
  profileStrength?: number;
  [key: string]: unknown;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getImageUrl = (
  path?: string | { fileUrl?: string; url?: string; file?: string; path?: string; src?: string } | null
) => {
  if (!path) return "/before.jfif";

  const p =
    typeof path === "string"
      ? path
      : path?.fileUrl || path?.url || path?.file || path?.path || path?.src;
  if (!p || typeof p !== "string") return "/before.jfif";

  if (p.startsWith("http")) return p;

  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const imagePath = p.startsWith("/") ? p : `/${p}`;

  return `${baseUrl}${imagePath}`;
};

export default function TraderDashboard() {
  const [dashboardDetails, setDashboardDetails] = useState<TraderDashboardData | null>(null);
  const [profileData, setProfileData] = useState<TraderProfileData | null>(null);
  const [regData, setRegData] = useState<RegistrationData | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Filters state (Emergency | Category | Timescale)
  const [selectedEmergency, setSelectedEmergency] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTimescale, setSelectedTimescale] = useState<string>("ALL");

  const [emergencyDropdownOpen, setEmergencyDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [timescaleDropdownOpen, setTimescaleDropdownOpen] = useState(false);

  const emergencyRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const timescaleRef = useRef<HTMLDivElement>(null);

  const [categoriesList, setCategoriesList] = useState<Array<{ id: string; name: string }>>([]);

  // Send Quote Modal state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedQuoteJob, setSelectedQuoteJob] = useState<JobItem | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    price: "",
    estimatedDays: "",
    availability: "",
    message: "",
  });
  const [quoteAttachments, setQuoteAttachments] = useState<File[]>([]);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const quoteFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emergencyRef.current && !emergencyRef.current.contains(event.target as Node)) {
        setEmergencyDropdownOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (timescaleRef.current && !timescaleRef.current.contains(event.target as Node)) {
        setTimescaleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    authApi
      .getCategories()
      .then((res) => {
        const arr = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.categories)
          ? res.categories
          : [];
        if (arr.length > 0) setCategoriesList(arr);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isQuoteModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmittingQuote) {
        setIsQuoteModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuoteModalOpen, isSubmittingQuote]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, myProfileRes, regRes, matchedJobsRes] = await Promise.all([
          authApi.getTraderDashboard().catch(() => null),
          authApi.getMyProfile().catch(() => null),
          getRegistrationStatus().catch(() => null),
          authApi.getMatchedJobs().catch(() => null),
        ]);
        setDashboardDetails(dashRes?.data || dashRes || {});
        setProfileData(myProfileRes?.data || myProfileRes || null);
        setRegData(regRes?.data || regRes || null);
        const mJobs = Array.isArray(matchedJobsRes?.data)
          ? matchedJobsRes.data
          : Array.isArray(matchedJobsRes)
          ? matchedJobsRes
          : [];
        setMatchedJobs(mJobs);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Real-time dashboard update via socket
  useSocket({
    onTraderDashboardUpdate: (data) => {
      if (data) {
        setDashboardDetails(data?.data || data);
        authApi.getMyProfile().then((res) => setProfileData(res?.data || res)).catch(() => { });
        getRegistrationStatus().then((res) => setRegData(res?.data || res)).catch(() => { });
        authApi.getMatchedJobs().then((res) => {
          const mJobs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          setMatchedJobs(mJobs);
        }).catch(() => { });
      }
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-[#2B5921]" size={40} />
      </div>
    );
  }

  // Exact data resolution based on API payload
  const rawData = dashboardDetails?.data || dashboardDetails || {};
  const welcome = rawData?.welcome || {};
  const actionRequired = rawData?.actionRequired || {};
  const status = rawData?.status || {};
  const performance = rawData?.performance || {};
  const tp: TraderProfileData = (profileData?.traderProfile || profileData || {}) as TraderProfileData;
  const reg: RegistrationData = (regData || {}) as RegistrationData;

  // Trader display name
  const traderName =
    welcome?.fullName ||
    welcome?.displayName ||
    profileData?.fullName ||
    profileData?.name ||
    "Jay Santos";

  // Subscription Details
  const subscriptionTier =
    status?.subscription?.tierName ||
    (tp?.subscriptionTier
      ? `${tp.subscriptionTier.charAt(0).toUpperCase()}${tp.subscriptionTier.slice(1).toLowerCase()} Member`
      : "Silver Member");

  const activeUntilDate = status?.subscription?.activeUntil
    ? new Date(status.subscription.activeUntil).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
    : "10/18/2026";

  // Profile Strength (Percentage)
  const displayPercentage =
    typeof status?.profileCompletenessPercentage === "number"
      ? status.profileCompletenessPercentage
      : typeof reg?.profileCompletionPercentage === "number"
        ? reg.profileCompletionPercentage
        : typeof reg?.profileStrength === "number"
          ? reg.profileStrength
          : 90;

  const nextStepText =
    status?.profileCompletenessNextStep ||
    actionRequired?.profileCompleteness?.nextStep ||
    (displayPercentage >= 90 ? "Great! Your profile looks complete." : "Complete dashboard requirements");

  const nextStepUrl = "/trader/profile";

  // Circular gauge calculations (r = 25 -> C ~ 157)
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  // New Jobs List (Fallback to mockup data if empty)
  /*
  const defaultNewJobs: JobItem[] = [
    {
      id: "63d71eba-1a48-4b86-a4ab-346fda469260",
      title: "Outer building",
      description:
        "Exterior building work required. Repointing and repair of exterior wall and small roof section.",
      location: "Albufeira",
      postcode: "8200-112",
      distanceText: "2.3 km",
      postedAgo: "16 min ago",
      category: { name: "Builder" },
      budgetRange: "UNDER_2000",
      emergency: false,
      timescale: "WITHIN_1_WEEK",
      imageUrl: "/Homepageimage.png",
      quotesCount: 0,
    },
    {
      id: "3899a8dd-98e7-4a21-bca1-62f5f918b405",
      title: "Bathroom renovation",
      description:
        "Full bathroom renovation. New tiles, plumbing and fitting of shower and toilet.",
      location: "Armação de Pêra",
      postcode: "8365-184",
      distanceText: "5.8 km",
      postedAgo: "42 min ago",
      category: { name: "Plumber" },
      budgetRange: "UNDER_4000",
      emergency: true,
      timescale: "URGENT",
      imageUrl: "/before.jfif",
      quotesCount: 1,
    },
    {
      id: "8b41a03c-db2f-4d51-b8e6-9c4967a5e773",
      title: "Driveway paving",
      description:
        "Need new driveway paving and edging. Approx 40m². Looking for quotes ASAP.",
      location: "Vilamoura",
      postcode: "8125-001",
      distanceText: "7.4 km",
      postedAgo: "1 hr ago",
      category: { name: "Builder" },
      budgetRange: "UNDER_1000",
      emergency: false,
      timescale: "WITHIN_3_DAYS",
      imageUrl: "/Container.png",
      quotesCount: 1,
    },
  ];
  */

  const rawNewJobs: JobItem[] = Array.isArray(rawData?.newJobs) && rawData.newJobs.length > 0
    ? rawData.newJobs
    : [];

  // Derive in-progress jobs from matchedJobs if not returned in dashboard payload
  const inProgressFromMatchedJobs: JobItem[] =
    Array.isArray(matchedJobs) && matchedJobs.length > 0
      ? matchedJobs
          .filter((item: any) => {
            const rawStatus = (item.rawStatus || item.status || "").toUpperCase();
            const matchStatus = (
              item.matchStatus ||
              item.match?.status ||
              item.myMatch?.status ||
              item.jobMatch?.status ||
              (Array.isArray(item.matches)
                ? item.matches.find(
                    (m: any) =>
                      m.traderId === item.traderId ||
                      m.isQuoteSubmitted ||
                      m.isSelected !== undefined
                  )?.status || item.matches[0]?.status
                : undefined) ||
              item.quoteDetails?.status ||
              item.myQuote?.status
            )?.toUpperCase();

            const isThisTraderRejected =
              matchStatus === "REJECTED" ||
              matchStatus === "DECLINED" ||
              item.status === "REJECTED" ||
              item.rawStatus === "REJECTED" ||
              item.status === "DECLINED" ||
              item.rawStatus === "DECLINED";

            const isAccepted = Boolean(
              (item.isQuoteAccepted ||
                matchStatus === "ACCEPTED" ||
                (Array.isArray(item.quotes) &&
                  item.quotes.some(
                    (q: any) =>
                      q.status?.toUpperCase() === "ACCEPTED" &&
                      (q.traderId === item.traderId || q.isMyQuote)
                  ))) &&
                !isThisTraderRejected
            );

            return (
              isAccepted ||
              rawStatus === "IN_PROGRESS" ||
              rawStatus === "ASSIGNED" ||
              item.status === "In Progress"
            );
          })
          .map(
            (item: any): JobItem => ({
              id: item.id || item.jobId,
              title: item.title || "Job",
              description:
                item.description ||
                item.projectDescription ||
                item.details ||
                "",
              location: item.location || item.postcode || "Albufeira",
              postcode: item.postcode || "",
              imageUrl:
                item.imageUrl ||
                item.attachments?.[0]?.url ||
                item.category?.image,
              quotesCount: item.quotes?.length || item.quotesCount || 0,
            })
          )
      : [];

  // Working on / In progress jobs (Real API data only - no static data)
  const rawWorkingOn: JobItem[] =
    Array.isArray(rawData?.jobsWorkingOn) && rawData.jobsWorkingOn.length > 0
      ? rawData.jobsWorkingOn
      : Array.isArray(rawData?.inProgressJobs) && rawData.inProgressJobs.length > 0
        ? rawData.inProgressJobs
        : inProgressFromMatchedJobs;

  // Helpers
  const formatBudget = (budget?: string | number) => {
    if (!budget) return "Under €500";
    const b = String(budget);
    if (b.startsWith("UNDER_")) return `Under €${b.replace("UNDER_", "").replace(/,/g, "")}`;
    if (b.startsWith("OVER_") || b.startsWith("ABOVE_")) return `Above €${b.replace(/(OVER_|ABOVE_)/, "")}`;
    if (b.startsWith("BETWEEN_")) {
      const parts = b.replace("BETWEEN_", "").split("_");
      if (parts.length === 2) {
        return `€${Number(parts[0]).toLocaleString()} - €${Number(parts[1]).toLocaleString()}`;
      }
    }
    if (!isNaN(Number(b))) return `€${Number(b).toLocaleString()}`;
    return b;
  };

  const formatTimescale = (t?: string) => {
    if (!t) return "Flexible";
    const upper = t.toUpperCase().replace(/[-\s]+/g, "_");
    if (upper === "FLEXIBLE") return "Flexible";
    if (upper === "URGENT") return "Urgent";
    if (upper === "WITHIN_3_DAYS") return "Within 3 days";
    if (upper === "WITHIN_1_WEEK") return "Within 1 week";
    if (upper === "WITHIN_1_MONTH") return "Within 1 month";
    return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Filter new jobs based on Emergency, Category, and Timescale
  const filteredJobs = rawNewJobs.filter((job: JobItem) => {
    // 1. Emergency Filter
    if (selectedEmergency === "EMERGENCY") {
      const isEmerg = Boolean(
        job.emergency ||
        job.isEmergency ||
        job.tags?.some((t: string) => t.toLowerCase().includes("emergency"))
      );
      if (!isEmerg) return false;
    } else if (selectedEmergency === "STANDARD") {
      const isEmerg = Boolean(
        job.emergency ||
        job.isEmergency ||
        job.tags?.some((t: string) => t.toLowerCase().includes("emergency"))
      );
      if (isEmerg) return false;
    }

    // 2. Category Filter
    if (selectedCategory !== "ALL") {
      const jobCategory = (
        job.category?.name ||
        job.categoryName ||
        (job.tags && job.tags[0]) ||
        ""
      ).toLowerCase();
      if (jobCategory !== selectedCategory.toLowerCase()) return false;
    }

    // 3. Timescale Filter
    if (selectedTimescale !== "ALL") {
      const jobTs = (job.timescale || "").toUpperCase().replace(/[-\s]+/g, "_");
      const filterTs = selectedTimescale.toUpperCase().replace(/[-\s]+/g, "_");
      if (jobTs !== filterTs && !jobTs.includes(filterTs) && !filterTs.includes(jobTs)) {
        return false;
      }
    }

    return true;
  });

  // Filter options
  const emergencyOptions = [
    { id: "ALL", name: "All (Emergency & Standard)" },
    { id: "EMERGENCY", name: "Emergency Only 🚨" },
    { id: "STANDARD", name: "Standard Only" },
  ];

  const timescaleOptions = [
    { id: "ALL", name: "All Timescales" },
    { id: "URGENT", name: "Urgent" },
    { id: "WITHIN_3_DAYS", name: "Within 3 days" },
    { id: "WITHIN_1_WEEK", name: "Within 1 week" },
    { id: "WITHIN_1_MONTH", name: "Within 1 month" },
    { id: "FLEXIBLE", name: "Flexible / Planning" },
  ];

  const allCategoryNames = Array.from(
    new Set([
      ...categoriesList.map((c) => c.name),
      ...rawNewJobs.map((j) => j.category?.name || j.categoryName || (j.tags && j.tags[0])).filter(Boolean),
    ])
  ).filter(Boolean) as string[];

  // Quote form submission handler
  const handleOpenSendQuote = (job: JobItem) => {
    setSelectedQuoteJob(job);
    setQuoteForm({
      price: "",
      estimatedDays: "",
      availability: "",
      message: "",
    });
    setQuoteAttachments([]);
    setIsQuoteModalOpen(true);
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setQuoteAttachments((prev) => [...prev, ...selected]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setQuoteAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuoteJob) return;
    try {
      setIsSubmittingQuote(true);
      const mapAvailabilityToDays = (availability: string) => {
        switch (availability) {
          case "Can start immediately":
            return 1;
          case "Within 24 hours":
            return 1;
          case "Within 3 days":
            return 3;
          case "Within 7 days":
            return 7;
          case "7days +":
            return 14;
          default:
            return 1;
        }
      };
      const mappedDays =
        Number(quoteForm.estimatedDays) > 0
          ? Number(quoteForm.estimatedDays)
          : mapAvailabilityToDays(quoteForm.availability);

      const formData = new FormData();
      formData.append("price", quoteForm.price);
      formData.append("estimatedDays", String(mappedDays));
      formData.append("message", quoteForm.message);
      if (quoteForm.availability?.trim()) {
        formData.append("availability", quoteForm.availability.trim());
      }
      quoteAttachments.forEach((file) => {
        formData.append("attachments", file);
      });

      await authApi.sendJobQuote(selectedQuoteJob.id, formData);
      toast.success("Quote sent successfully!");
      setIsQuoteModalOpen(false);
      setQuoteForm({ price: "", estimatedDays: "", availability: "", message: "" });
      setQuoteAttachments([]);
    } catch (err: any) {
      console.error("Failed to send quote", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to send quote. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-[#F7F9F5] min-h-screen font-sans">
      {/* ── TOP WELCOME BAR ─────────────────────────────────── */}
      <div className="bg-[#EFF5EB] rounded-[22px] border border-[#DFEBDD] overflow-hidden mb-7 flex flex-col lg:flex-row items-stretch justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        {/* Left: Greeting */}
        <div className="p-5 sm:p-6 lg:py-6 lg:px-8 flex items-center gap-4 flex-1">
          <span className="text-[34px] leading-none select-none">👋</span>
          <div>
            <h1 className="text-[22px] sm:text-[26px] font-black text-[#143118] leading-tight">
              Hello, {traderName}
            </h1>
            <p className="text-[13.5px] text-[#556958] mt-1 font-medium">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>
        </div>

        {/* Right: Quick stat mini-cards inside white box */}
        <div className="bg-white px-6 sm:px-8 lg:px-10 py-5 sm:py-6 flex items-center justify-between sm:justify-end gap-6 sm:gap-10 lg:gap-12 shrink-0 border-t lg:border-t-0 lg:border-l border-[#DFEBDD] overflow-x-auto">
          {/* Card 1: In progress jobs */}
          <div
            onClick={() => router.push("/trader/jobs?tab=In Progress")}
            className="flex flex-col cursor-pointer group shrink-0"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#FFF4E6] text-[#EA580C] flex items-center justify-center shrink-0">
                <Luggage size={18} strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-[20px] font-black text-[#143118] leading-tight block">
                  {actionRequired?.inProgressJobsCount ?? rawWorkingOn.length}
                </span>
                <span className="text-[11.5px] text-[#768779] font-medium whitespace-nowrap block mt-0.5">
                  In progress job
                </span>
              </div>
            </div>
            <span className="text-[11.5px] font-bold text-[#44762A] flex items-center gap-1 group-hover:underline mt-2">
              View jobs <ArrowRight size={11} strokeWidth={2.5} />
            </span>
          </div>

          {/* Card 2: Quotes awaiting response */}
          <div
            onClick={() => router.push("/trader/quote")}
            className="flex flex-col cursor-pointer group shrink-0"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <MessageSquare size={18} strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-[20px] font-black text-[#143118] leading-tight block">
                  {actionRequired?.quotesAwaitingResponseCount ?? 0}
                </span>
                <span className="text-[11.5px] text-[#768779] font-medium whitespace-nowrap block mt-0.5">
                  Quotes awaiting response
                </span>
              </div>
            </div>
            <span className="text-[11.5px] font-bold text-[#44762A] flex items-center gap-1 group-hover:underline mt-2">
              View quotes <ArrowRight size={11} strokeWidth={2.5} />
            </span>
          </div>

          {/* Card 3: Pending reviews */}
          <div
            onClick={() => router.push("/trader/reviews")}
            className="flex flex-col cursor-pointer group shrink-0"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EBF4E7] text-[#2E7D32] flex items-center justify-center shrink-0">
                <Star size={18} strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-[20px] font-black text-[#143118] leading-tight block">
                  {actionRequired?.newReviewsCount ?? 0}
                </span>
                <span className="text-[11.5px] text-[#768779] font-medium whitespace-nowrap block mt-0.5">
                  Pending Reviews
                </span>
              </div>
            </div>
            <span className="text-[11.5px] font-bold text-[#44762A] flex items-center gap-1 group-hover:underline mt-2">
              View review <ArrowRight size={11} strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN LAYOUT ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-7 items-start">
        {/* ── LEFT COLUMN ───────────────────────────────────── */}
        <div className="flex flex-col gap-7 min-w-0 ">
          {/* Section 1: New Jobs */}
          <div className="bg-white rounded-[22px] shadow-xs border border-[#DFEBDD] overflow-hidden">
            {/* Header + Filter Bar */}
            <div className="bg-white p-5 sm:p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EEF3ED]">
              <div className="flex items-center gap-2.5">
                <BellRing size={22} className="text-[#2B5921] shrink-0" />
                <h2 className="text-[20px] sm:text-[22px] font-black text-[#1B311E] flex items-center gap-2">
                  <span className="text-[#2B5921]">{filteredJobs.length}</span>
                  <span>New Jobs</span>
                </h2>
              </div>

              {/* Filters row: Emergency | Category | Timescale */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Emergency Filter */}
                <div className="relative" ref={emergencyRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmergencyDropdownOpen(!emergencyDropdownOpen);
                      setCategoryDropdownOpen(false);
                      setTimescaleDropdownOpen(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-bold transition-colors cursor-pointer bg-white ${
                      selectedEmergency !== "ALL"
                        ? "border-[#2B5921] text-[#2B5921] bg-[#EFF5EB]"
                        : "border-[#CFDCD0] text-[#1B311E] hover:bg-[#F4F8F3]"
                    }`}
                  >
                    <Flame
                      size={13}
                      className={
                        selectedEmergency === "EMERGENCY"
                          ? "text-red-500 fill-red-500"
                          : "text-[#5A6E5E]"
                      }
                    />
                    <span>
                      {selectedEmergency === "EMERGENCY"
                        ? "Emergency Only"
                        : selectedEmergency === "STANDARD"
                        ? "Standard Only"
                        : "Emergency: All"}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-[#768779] transition-transform ${
                        emergencyDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {emergencyDropdownOpen && (
                    <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-[#DFEBDD] z-30 py-1">
                      {emergencyOptions.map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setSelectedEmergency(opt.id);
                            setEmergencyDropdownOpen(false);
                          }}
                          className={`px-3 py-2 text-[12px] cursor-pointer flex items-center justify-between hover:bg-[#F4F8F3] ${
                            selectedEmergency === opt.id
                              ? "text-[#2B5921] font-bold bg-[#EFF5EB]"
                              : "text-[#1B311E]"
                          }`}
                        >
                          <span>{opt.name}</span>
                          {selectedEmergency === opt.id && <Check size={12} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div className="relative" ref={categoryRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryDropdownOpen(!categoryDropdownOpen);
                      setEmergencyDropdownOpen(false);
                      setTimescaleDropdownOpen(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-bold transition-colors cursor-pointer bg-white ${
                      selectedCategory !== "ALL"
                        ? "border-[#2B5921] text-[#2B5921] bg-[#EFF5EB]"
                        : "border-[#CFDCD0] text-[#1B311E] hover:bg-[#F4F8F3]"
                    }`}
                  >
                    <span>{selectedCategory === "ALL" ? "All Categories" : selectedCategory}</span>
                    <ChevronDown
                      size={13}
                      className={`text-[#768779] transition-transform ${
                        categoryDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {categoryDropdownOpen && (
                    <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-48 max-h-60 overflow-y-auto bg-white rounded-xl shadow-lg border border-[#DFEBDD] z-30 py-1">
                      <div
                        onClick={() => {
                          setSelectedCategory("ALL");
                          setCategoryDropdownOpen(false);
                        }}
                        className={`px-3 py-2 text-[12px] cursor-pointer flex items-center justify-between hover:bg-[#F4F8F3] ${
                          selectedCategory === "ALL"
                            ? "text-[#2B5921] font-bold bg-[#EFF5EB]"
                            : "text-[#1B311E]"
                        }`}
                      >
                        <span>All Categories</span>
                        {selectedCategory === "ALL" && <Check size={12} />}
                      </div>
                      {allCategoryNames.map((catName) => (
                        <div
                          key={catName}
                          onClick={() => {
                            setSelectedCategory(catName);
                            setCategoryDropdownOpen(false);
                          }}
                          className={`px-3 py-2 text-[12px] cursor-pointer flex items-center justify-between hover:bg-[#F4F8F3] ${
                            selectedCategory.toLowerCase() === catName.toLowerCase()
                              ? "text-[#2B5921] font-bold bg-[#EFF5EB]"
                              : "text-[#1B311E]"
                          }`}
                        >
                          <span>{catName}</span>
                          {selectedCategory.toLowerCase() === catName.toLowerCase() && (
                            <Check size={12} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timescale Filter */}
                <div className="relative" ref={timescaleRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setTimescaleDropdownOpen(!timescaleDropdownOpen);
                      setEmergencyDropdownOpen(false);
                      setCategoryDropdownOpen(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-bold transition-colors cursor-pointer bg-white ${
                      selectedTimescale !== "ALL"
                        ? "border-[#2B5921] text-[#2B5921] bg-[#EFF5EB]"
                        : "border-[#CFDCD0] text-[#1B311E] hover:bg-[#F4F8F3]"
                    }`}
                  >
                    <span>
                      {selectedTimescale === "ALL"
                        ? "All Timescales"
                        : formatTimescale(selectedTimescale)}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-[#768779] transition-transform ${
                        timescaleDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {timescaleDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-[#DFEBDD] z-30 py-1">
                      {timescaleOptions.map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setSelectedTimescale(opt.id);
                            setTimescaleDropdownOpen(false);
                          }}
                          className={`px-3 py-2 text-[12px] cursor-pointer flex items-center justify-between hover:bg-[#F4F8F3] ${
                            selectedTimescale === opt.id
                              ? "text-[#2B5921] font-bold bg-[#EFF5EB]"
                              : "text-[#1B311E]"
                          }`}
                        >
                          <span>{opt.name}</span>
                          {selectedTimescale === opt.id && <Check size={12} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset Filters button if any active */}
                {(selectedEmergency !== "ALL" ||
                  selectedCategory !== "ALL" ||
                  selectedTimescale !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmergency("ALL");
                      setSelectedCategory("ALL");
                      setSelectedTimescale("ALL");
                    }}
                    className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* List of New Jobs */}
            <div className="divide-y divide-[#EEF3ED]">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job: JobItem) => {
                  const locationString = (job.location || "Albufeira").trim();
                  const postcodeString =
                    job.postcode &&
                    !locationString.toLowerCase().includes(job.postcode.toLowerCase())
                      ? ` • ${job.postcode.trim()}`
                      : "";
                  const distanceString = job.distanceText || job.distance || "1.5 km";
                  const categoryName =
                    job.category?.name || job.categoryName || (job.tags && job.tags[0]);
                  const budgetFormatted = formatBudget(job.budgetRange || job.budget);

                  return (
                    <div
                      key={job.id}
                      className="p-5 sm:p-6 flex flex-col md:flex-row items-start justify-between gap-5 hover:bg-[#F9FAF8] transition-colors"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-4 flex-1 min-w-0">
                        {/* Smaller Thumbnail */}
                        <div className="w-20 h-16 sm:w-[84px] sm:h-[66px] rounded-xl overflow-hidden relative shrink-0 border border-[#E2EAE1] bg-[#EFF3EE]">
                          <Image
                            src={
                              imageErrors[job.id]
                                ? "/Homepageimage.png"
                                : getImageUrl(job.imageUrl || job.category?.image)
                            }
                            alt={job.title || "Job"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 80px, 84px"
                            onError={() => setImageErrors((prev) => ({ ...prev, [job.id]: true }))}
                            unoptimized
                          />
                        </div>

                        {/* Text info */}
                        <div className="flex-1 min-w-0">
                          {/* Badge + Posted time */}
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="bg-[#D9F2D0] text-[#1C6D26] border border-[#C2E2B8] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider leading-none">
                              NEW
                            </span>
                            {(job.emergency || job.isEmergency) && (
                              <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider leading-none flex items-center gap-1">
                                <Flame size={11} className="text-red-500 fill-red-500" />
                                Emergency
                              </span>
                            )}
                            <span className="text-[12px] text-[#768779] font-medium">
                              {job.postedAgo || "16 min ago"}
                            </span>
                          </div>

                          {/* Title */}
                          <h3
                            onClick={() => router.push(`/trader/jobs?jobId=${job.id}`)}
                            className="text-[16px] sm:text-[17px] font-black text-[#1B311E] leading-snug hover:text-[#2B5921] cursor-pointer transition-colors mb-1.5"
                          >
                            {job.title}
                          </h3>

                          {/* Location & distance (cleaned to avoid repetition) */}
                          <div className="flex items-center gap-2 text-[12px] text-[#768779] font-medium mb-2 flex-wrap">
                            <span className="flex items-center gap-1 text-[#5A6E5E]">
                              <MapPin size={13} className="text-[#768779] shrink-0" />
                              {locationString}
                              {postcodeString}
                            </span>
                            <span className="text-[#768779]">•</span>
                            <span className="flex items-center gap-1 text-[#5A6E5E]">
                              <Compass size={13} className="text-[#768779] shrink-0" />
                              {distanceString}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-[12px] text-[#5A6E5E] line-clamp-2 leading-relaxed mb-3 font-normal max-w-xl">
                            {job.description}
                          </p>

                          {/* Category & Budget only (services removed) */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {categoryName && (
                              <span className="bg-[#EFF5EB] text-[#2B5921] text-[11px] font-bold px-3 py-1 rounded-full leading-none border border-[#DFEBDD]">
                                {categoryName}
                              </span>
                            )}
                            <span className="bg-[#F8FAF7] text-[#1B311E] text-[11px] font-bold px-3 py-1 rounded-full leading-none border border-[#CFDCD0] flex items-center gap-1">
                              <Euro size={12} className="text-[#2B5921]" />
                              <span>Budget: {budgetFormatted}</span>
                            </span>
                            {job.timescale && (
                              <span className="bg-gray-50 text-[#556958] text-[11px] font-medium px-2.5 py-1 rounded-full leading-none border border-gray-200 flex items-center gap-1">
                                <Clock size={11} className="text-[#768779]" />
                                <span>{formatTimescale(job.timescale)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex sm:flex-row md:flex-col items-center gap-2.5 w-full md:w-[145px] shrink-0 self-end md:self-center pt-2 md:pt-0">
                        <button
                          type="button"
                          onClick={() => router.push(`/trader/jobs?jobId=${job.id}`)}
                          className="w-full py-2.5 px-4 rounded-xl border border-[#CFDCD0] text-[#1B311E] text-[12.5px] font-bold hover:bg-[#F4F8F3] transition-colors text-center cursor-pointer bg-white"
                        >
                          View Job
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenSendQuote(job)}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#2B5921] hover:bg-[#204418] text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-98"
                        >
                          <span>Send Quote</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-[#5A6E5E] text-[13px]">
                  No new jobs matching your current filter.
                </div>
              )}
            </div>

            {/* View all new jobs footer */}
            <div className="p-4 sm:p-5 pt-3 border-t border-[#EEF3ED] bg-white">
              <Link
                href="/trader/jobs"
                className="text-[12.5px] font-bold text-[#2B5921] hover:underline inline-flex items-center gap-1"
              >
                <span>View all {filteredJobs.length} new jobs</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Section 2: Jobs You're Working On */}
          <div className="bg-white rounded-[22px] shadow-xs border border-[#DFEBDD] overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-[#EEF3ED]">
              <div className="flex items-center gap-3">
                <ClipboardCheck size={22} className="text-[#204E1D]" strokeWidth={2.2} />
                <h3 className="text-[19px] sm:text-[20px] font-black text-[#143118]">
                  Jobs You&apos;re Working On
                </h3>
              </div>
              <Link
                href="/trader/jobs?tab=In Progress"
                className="text-[13.5px] font-bold text-[#2B5921] hover:underline flex items-center gap-1.5"
              >
                <span>View all jobs</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>

            {/* List */}
            <div className="divide-y divide-[#EEF3ED]">
              {rawWorkingOn && rawWorkingOn.length > 0 ? (
                rawWorkingOn.slice(0, 3).map((job: JobItem, index: number) => {
                  const loc = (job.location || "Albufeira").trim();
                  const pc = (job.postcode || "").trim();
                  const locationText =
                    pc && !loc.toLowerCase().includes(pc.toLowerCase())
                      ? `${loc} • ${pc}`
                      : loc;

                  return (
                    <div
                      key={job.id || index}
                      className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-6 hover:bg-[#FBFDFB] transition-colors"
                    >
                      {/* Col 1: Thumbnail & Title + Location */}
                      <div className="flex items-center gap-3.5 min-w-0 md:w-[210px] lg:w-[230px] xl:w-[240px] shrink-0">
                        <div className="w-[64px] h-[48px] rounded-xl overflow-hidden relative bg-[#EFF3EE] shrink-0 border border-[#E2EAE1]">
                          <Image
                            src={
                              imageErrors[job.id || String(index)]
                                ? "/before.jfif"
                                : getImageUrl(job.imageUrl || job.attachments?.[0]?.url)
                            }
                            alt={job.title || "Job"}
                            fill
                            className="object-cover"
                            onError={() =>
                              setImageErrors((prev) => ({
                                ...prev,
                                [job.id || String(index)]: true,
                              }))
                            }
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() =>
                              router.push(
                                `/trader/jobs?jobId=${job.id || job.jobId}&tab=In Progress`
                              )
                            }
                            className="text-[15.5px] font-extrabold text-[#143118] truncate hover:text-[#2B5921] cursor-pointer"
                          >
                            {job.title}
                          </h4>
                          <p className="text-[12.5px] text-[#768779] truncate mt-0.5 font-medium">
                            {locationText}
                          </p>
                        </div>
                      </div>

                      {/* Col 2: Job Description */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#8A978E] uppercase tracking-wider block mb-1.5">
                          JOB DESCRIPTION
                        </span>
                        <div className="bg-[#F8FAF8] rounded-xl px-4 py-2.5 text-[12.5px] text-[#4A5568] leading-relaxed line-clamp-2">
                          {job.description || "No description provided."}
                        </div>
                      </div>

                      {/* Col 3: Status */}
                      <div className="shrink-0 flex flex-col items-start md:items-center">
                        <span className="bg-[#F1F4F1] text-[#7C8B7F] text-[9.5px] font-bold px-2 py-0.5 rounded tracking-wider uppercase mb-1.5">
                          STATUS
                        </span>
                        <span className="bg-[#DE9B52] text-[#5A2C00] font-bold text-[13px] px-5 py-2 rounded-xl whitespace-nowrap shadow-2xs inline-block text-center">
                          In Progress
                        </span>
                      </div>

                      {/* Col 4: View Job Button */}
                      <div className="shrink-0 flex items-center md:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/trader/jobs?jobId=${job.id || job.jobId}&tab=In Progress`
                            )
                          }
                          className="px-6 py-2 rounded-xl border border-[#D5DDD4] bg-white hover:bg-gray-50 text-[#1B311E] text-[13px] font-bold transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          View Job
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-[#768779] text-[13px] font-medium">
                  You have no jobs in progress at the moment.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (SIDEBAR WIDGETS) ────────────────── */}
        <div className="flex flex-col gap-6 w-full">
          {/* 1. Profile Strength Widget */}
          <div className="bg-white rounded-[22px] shadow-xs border border-[#DFEBDD] p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {/* Circular Gauge */}
              <div className="relative w-[60px] h-[60px] flex items-center justify-center shrink-0">
                <svg className="w-[60px] h-[60px] -rotate-90" viewBox="0 0 60 60">
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    className="text-[#E3EDE0]"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    className="text-[#2B5921]"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>
                <span className="absolute text-[13px] font-black text-[#1B311E]">
                  {displayPercentage}%
                </span>
              </div>

              {/* Text & horizontal bar */}
              <div className="flex-1 min-w-0">
                <h4 className="text-[14.5px] font-black text-[#1B311E]">Profile Strength</h4>
                <p className="text-[11.5px] text-[#5A6E5E] truncate mb-2 mt-0.5">
                  {displayPercentage >= 90
                    ? "Great! Your profile looks complete."
                    : nextStepText}
                </p>
                <div className="h-1.5 w-full bg-[#E3EDE0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2B5921] rounded-full transition-all duration-500"
                    style={{ width: `${displayPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => router.push(nextStepUrl)}
              className="w-full py-2.5 rounded-xl border border-[#D8E6D6] bg-[#EFF5EB] text-[#2B5921] text-[12.5px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#E4EFE2] transition-colors cursor-pointer"
            >
              <span>Complete your profile</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* 2. Subscription Widget */}
          <div className="bg-white rounded-[22px] shadow-xs border border-[#DFEBDD] p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#EFF5EB] flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-[#2B5921]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[15px] font-black text-[#1B311E] leading-tight">
                  {subscriptionTier}
                </h4>
                <p className="text-[11.5px] text-[#768779] mt-0.5">
                  Active until {activeUntilDate}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/trader/billing")}
              className="text-[12.5px] font-bold text-[#2B5921] hover:underline flex items-center gap-1 cursor-pointer w-fit"
            >
              <span>Manage subscription</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* 3. Need Help? Widget */}
          <div className="bg-white rounded-[22px] shadow-xs border border-[#DFEBDD] p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#EFF5EB] flex items-center justify-center shrink-0">
                <Headphones size={20} className="text-[#2B5921]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[15px] font-black text-[#1B311E] leading-tight">
                  Need help?
                </h4>
                <p className="text-[11.5px] text-[#5A6E5E] mt-0.5">
                  Our support team is here to help you.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/contact")}
              className="w-full py-2.5 rounded-xl border border-[#CFDCD0] text-[#1B311E] text-[12.5px] font-bold hover:bg-[#F4F8F3] transition-colors cursor-pointer bg-white"
            >
              Contact Support
            </button>
          </div>

          {/* 4. Your Performance Widget */}
          <div className="bg-white rounded-[22px] shadow-xs border border-[#DFEBDD] p-5 sm:p-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <h4 className="text-[15px] font-black text-[#1B311E]">Your Performance</h4>
              <span className="text-[11.5px] text-[#768779] font-medium">• Last 30 days</span>
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Metric 1: Profile views */}
              <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#DFEBDD] flex flex-col gap-1.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#EFF5EB] flex items-center justify-center text-[#2B5921]">
                  <Eye size={15} />
                </div>
                <div>
                  <span className="text-[18px] font-black text-[#1B311E] leading-none block">
                    {performance?.profileViews?.value ?? 12}
                  </span>
                  <span className="text-[10.5px] text-[#5A6E5E] font-medium block mt-0.5">
                    Profile views
                  </span>
                  <span className="text-[10px] font-bold text-[#22781E] block mt-1">
                    ↑ {performance?.profileViews?.trendPercentage ?? 15}%{" "}
                    <span className="text-[#768779] font-normal">vs last 30 days</span>
                  </span>
                </div>
              </div>

              {/* Metric 2: Average Rating */}
              <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#DFEBDD] flex flex-col gap-1.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#EFF5EB] flex items-center justify-center text-[#2B5921]">
                  <Star size={15} />
                </div>
                <div>
                  <span className="text-[18px] font-black text-[#1B311E] leading-none block">
                    {performance?.averageRating?.value ?? 4}
                  </span>
                  <span className="text-[10.5px] text-[#5A6E5E] font-medium block mt-0.5">
                    Average Rating
                  </span>
                  <span className="text-[10px] font-bold text-[#22781E] block mt-1">
                    ↑ {performance?.averageRating?.trendChange ?? 0.2}{" "}
                    <span className="text-[#768779] font-normal">vs last 30 days</span>
                  </span>
                </div>
              </div>

              {/* Metric 3: Response Rate */}
              <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#DFEBDD] flex flex-col gap-1.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#EFF5EB] flex items-center justify-center text-[#2B5921]">
                  <MessageSquare size={14} />
                </div>
                <div>
                  <span className="text-[18px] font-black text-[#1B311E] leading-none block">
                    {performance?.responseRate?.value ?? 38}%
                  </span>
                  <span className="text-[10.5px] text-[#5A6E5E] font-medium block mt-0.5">
                    Response Rate
                  </span>
                  <span className="text-[10px] font-bold text-[#22781E] block mt-1">
                    ↑ {performance?.responseRate?.trendPercentage ?? 7}%{" "}
                    <span className="text-[#768779] font-normal">vs last 30 days</span>
                  </span>
                </div>
              </div>

              {/* Metric 4: Quote Acceptance Rate */}
              <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#DFEBDD] flex flex-col gap-1.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#EFF5EB] flex items-center justify-center text-[#2B5921]">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <span className="text-[18px] font-black text-[#1B311E] leading-none block">
                    {performance?.quoteAcceptanceRate?.value ?? 70}%
                  </span>
                  <span className="text-[10.5px] text-[#5A6E5E] font-medium block mt-0.5">
                    Quote Acceptance Rate
                  </span>
                  <span className="text-[10px] font-bold text-[#22781E] block mt-1">
                    ↑ {performance?.quoteAcceptanceRate?.trendPercentage ?? 70}%{" "}
                    <span className="text-[#768779] font-normal">vs last 30 days</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Link */}
            <button
              type="button"
              onClick={() => router.push("/trader/reports")}
              className="text-[12px] font-bold text-[#2B5921] hover:underline flex items-center gap-1 cursor-pointer pt-1"
            >
              <span>View full performance</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── SEND QUOTE MODAL (like TraderQuotesComponent / JobsLeads) ── */}
      {isQuoteModalOpen && selectedQuoteJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmittingQuote && setIsQuoteModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px] font-bold text-[#1C2C1C]">Send Quote</h2>
                <p className="text-[12px] text-gray-500 mt-0.5 truncate max-w-[280px]">
                  {selectedQuoteJob.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                disabled={isSubmittingQuote}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick job details banner */}
            <div className="bg-[#F8F9F5] border border-[#DFEBDD] rounded-xl p-3 mb-4 flex items-center justify-between text-[12px]">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                  Location
                </span>
                <span className="font-semibold text-[#1C2C1C] truncate">
                  {selectedQuoteJob.location || "Albufeira"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                  Budget
                </span>
                <span className="font-semibold text-[#2B5921]">
                  {formatBudget(selectedQuoteJob.budgetRange || selectedQuoteJob.budget)}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSendQuoteSubmit} className="flex flex-col gap-4">
              {/* Price */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Price (€) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[14px] font-medium">
                    €
                  </span>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    required
                    placeholder="e.g. 500"
                    value={quoteForm.price}
                    onChange={(e) => setQuoteForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#6E9625] focus:ring-2 focus:ring-[#6E9625]/20 transition-all"
                  />
                </div>
              </div>

              {/* Estimated Days */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Estimated Days <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="number"
                    step="1"
                    min={1}
                    required
                    placeholder="e.g. 3"
                    value={quoteForm.estimatedDays}
                    onChange={(e) =>
                      setQuoteForm((f) => ({ ...f, estimatedDays: e.target.value }))
                    }
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#6E9625] focus:ring-2 focus:ring-[#6E9625]/20 transition-all"
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label
                  htmlFor="quote-availability"
                  className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5"
                >
                  Availability <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <select
                    id="quote-availability"
                    required
                    value={quoteForm.availability}
                    onChange={(e) =>
                      setQuoteForm((f) => ({ ...f, availability: e.target.value }))
                    }
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] bg-white focus:outline-none focus:border-[#6E9625] focus:ring-2 focus:ring-[#6E9625]/20 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Select availability</option>
                    <option value="Can start immediately">Can start immediately</option>
                    <option value="Within 24 hours">Within 24 hours</option>
                    <option value="Within 3 days">Within 3 days</option>
                    <option value="Within 7 days">Within 7 days</option>
                    <option value="7days +">7days +</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide details about your quote..."
                  value={quoteForm.message}
                  onChange={(e) => setQuoteForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#6E9625] focus:ring-2 focus:ring-[#6E9625]/20 transition-all resize-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Attachments <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  ref={quoteFileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleAttachmentSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => quoteFileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 text-[13px] text-gray-500 hover:border-[#6E9625] hover:text-[#6E9625] transition-colors cursor-pointer"
                >
                  <Paperclip size={15} />
                  Add Files
                </button>

                {/* Previews */}
                {quoteAttachments.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5 max-h-[100px] overflow-y-auto">
                    {quoteAttachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-[#F9FAFB] rounded-lg px-3 py-1.5 border border-gray-100"
                      >
                        <span className="text-[12px] text-[#1C2C1C] truncate flex-1">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingQuote}
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-[#1C2C1C] text-[13px] font-bold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#2B5921] hover:bg-[#204418] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isSubmittingQuote ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Quote</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
