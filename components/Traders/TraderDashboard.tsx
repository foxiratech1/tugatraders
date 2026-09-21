"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  SlidersHorizontal,
  BellRing,
  ClipboardCheck,
  ChevronDown,
  Loader2,
  Check
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
  category?: { name?: string; image?: string | null };
  attachments?: Array<{ url?: string; file?: string }>;
  quotesCount?: number;
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Filters state
  const [selectedService, setSelectedService] = useState<string>("All Services");
  const [selectedDistance, setSelectedDistance] = useState<string>("Within 10 km");
  const [selectedSort, setSelectedSort] = useState<string>("All");

  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [distanceDropdownOpen, setDistanceDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const serviceRef = useRef<HTMLDivElement>(null);
  const distanceRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
        setServiceDropdownOpen(false);
      }
      if (distanceRef.current && !distanceRef.current.contains(event.target as Node)) {
        setDistanceDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, myProfileRes, regRes] = await Promise.all([
          authApi.getTraderDashboard().catch(() => null),
          authApi.getMyProfile().catch(() => null),
          getRegistrationStatus().catch(() => null),
        ]);
        setDashboardDetails(dashRes?.data || dashRes || {});
        setProfileData(myProfileRes?.data || myProfileRes || null);
        setRegData(regRes?.data || regRes || null);
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
  const defaultNewJobs = [
    {
      id: "63d71eba-1a48-4b86-a4ab-346fda469260",
      title: "Outer building",
      description:
        "Exterior building work required. Repointing and repair of exterior wall and small roof section.",
      location: "Albufeira",
      postcode: "8200-112",
      distanceText: "2.3 km",
      postedAgo: "16 min ago",
      tags: ["Builder", "Exterior", "Local"],
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
      tags: ["Plumber", "Tiling", "Interior"],
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
      tags: ["Builder", "Landscaping", "Exterior"],
      imageUrl: "/Container.png",
      quotesCount: 1,
    },
  ];

  const rawNewJobs = Array.isArray(rawData?.newJobs) && rawData.newJobs.length > 0
    ? rawData.newJobs
    : defaultNewJobs;

  // Working on / In progress jobs (Fallback to mockup data if empty)
  const defaultWorkingOn = [
    {
      id: "fe87ea9b-0946-4bfc-9d8c-aec44b409eaa",
      title: "Kitchen fitting",
      location: "Albufeira • 8200-112",
      quotesCount: 2,
      updatedText: "Updated 2 days ago",
      imageUrl: "/before.jfif",
    },
    {
      id: "fe87ea9b-0946-4bfc-9d8c-sample-2",
      title: "Plumbing repair",
      location: "Lagoa • 8400-312",
      quotesCount: 1,
      updatedText: "Updated 3 days ago",
      imageUrl: "/before.jfif",
    },
  ];

  const rawWorkingOn =
    Array.isArray(rawData?.jobsWorkingOn) && rawData.jobsWorkingOn.length > 0
      ? rawData.jobsWorkingOn
      : Array.isArray(rawData?.inProgressJobs) && rawData.inProgressJobs.length > 0
        ? rawData.inProgressJobs
        : defaultWorkingOn;

  // Filter new jobs based on dropdown selections
  const filteredJobs = rawNewJobs.filter((job: JobItem) => {
    if (selectedService !== "All Services") {
      const match =
        job.tags?.some((t: string) => t.toLowerCase() === selectedService.toLowerCase()) ||
        job.category?.name?.toLowerCase() === selectedService.toLowerCase();
      if (!match) return false;
    }
    return true;
  });

  // Services list for dropdown
  const availableServices = [
    "All Services",
    "Builder",
    "Plumber",
    "Electrician",
    "Leak Repairs",
    "Tiling",
  ];

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
            onClick={() => router.push("/trader/jobs")}
            className="flex flex-col cursor-pointer group shrink-0"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#EBF4E7] text-[#2B5921] flex items-center justify-center shrink-0">
                <Luggage size={18} strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-[20px] font-black text-[#143118] leading-tight block">
                  {actionRequired?.inProgressJobsCount ?? rawWorkingOn.length ?? 1}
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
              <div className="w-11 h-11 rounded-full bg-[#FFF1E2] text-[#E07A28] flex items-center justify-center shrink-0">
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
              <div className="w-11 h-11 rounded-full bg-[#EAF2FC] text-[#3B82F6] flex items-center justify-center shrink-0">
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

              {/* Filters row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter button */}
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CFDCD0] text-[#1B311E] text-[12px] font-bold hover:bg-[#F4F8F3] transition-colors cursor-pointer bg-white"
                >
                  <SlidersHorizontal size={13} className="text-[#5A6E5E]" />
                  <span>Filters</span>
                </button>

                {/* All Services Dropdown */}
                <div className="relative" ref={serviceRef}>
                  <button
                    type="button"
                    onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CFDCD0] text-[#1B311E] text-[12px] font-bold hover:bg-[#F4F8F3] transition-colors cursor-pointer bg-white"
                  >
                    <span>{selectedService}</span>
                    <ChevronDown size={13} className="text-[#768779]" />
                  </button>

                  {serviceDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-[#DFEBDD] z-30 py-1">
                      {availableServices.map((service) => (
                        <div
                          key={service}
                          onClick={() => {
                            setSelectedService(service);
                            setServiceDropdownOpen(false);
                          }}
                          className={`px-3 py-1.5 text-[12px] cursor-pointer flex items-center justify-between hover:bg-[#F4F8F3] ${selectedService === service
                            ? "text-[#2B5921] font-bold bg-[#EFF5EB]"
                            : "text-[#1B311E]"
                            }`}
                        >
                          <span>{service}</span>
                          {selectedService === service && <Check size={12} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Within 10 km Dropdown */}
                <div className="relative" ref={distanceRef}>
                  <button
                    type="button"
                    onClick={() => setDistanceDropdownOpen(!distanceDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CFDCD0] text-[#1B311E] text-[12px] font-bold hover:bg-[#F4F8F3] transition-colors cursor-pointer bg-white"
                  >
                    <span>{selectedDistance}</span>
                    <ChevronDown size={13} className="text-[#768779]" />
                  </button>

                  {distanceDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-[#DFEBDD] z-30 py-1">
                      {["Within 5 km", "Within 10 km", "Within 25 km", "Within 50 km"].map(
                        (dist) => (
                          <div
                            key={dist}
                            onClick={() => {
                              setSelectedDistance(dist);
                              setDistanceDropdownOpen(false);
                            }}
                            className={`px-3 py-1.5 text-[12px] cursor-pointer flex items-center justify-between hover:bg-[#F4F8F3] ${selectedDistance === dist
                              ? "text-[#2B5921] font-bold bg-[#EFF5EB]"
                              : "text-[#1B311E]"
                              }`}
                          >
                            <span>{dist}</span>
                            {selectedDistance === dist && <Check size={12} />}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* All Sort Dropdown */}
                <div className="relative" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CFDCD0] text-[#1B311E] text-[12px] font-bold hover:bg-[#F4F8F3] transition-colors cursor-pointer bg-white"
                  >
                    <span>{selectedSort}</span>
                    <ChevronDown size={13} className="text-[#768779]" />
                  </button>

                  {sortDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-32 bg-white rounded-xl shadow-lg border border-[#DFEBDD] z-30 py-1">
                      {["All", "Most Recent", "Urgent"].map((s) => (
                        <div
                          key={s}
                          onClick={() => {
                            setSelectedSort(s);
                            setSortDropdownOpen(false);
                          }}
                          className={`px-3 py-1.5 text-[12px] cursor-pointer flex items-center justify-between hover:bg-[#F4F8F3] ${selectedSort === s
                            ? "text-[#2B5921] font-bold bg-[#EFF5EB]"
                            : "text-[#1B311E]"
                            }`}
                        >
                          <span>{s}</span>
                          {selectedSort === s && <Check size={12} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* List of New Jobs */}
            <div className="divide-y divide-[#EEF3ED]">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job: JobItem) => {
                  const locationString = job.location || "Albufeira";
                  const postcodeString = job.postcode ? ` • ${job.postcode}` : "";
                  const distanceString = job.distanceText || job.distance || "1.5 km";

                  return (
                    <div
                      key={job.id}
                      className="p-5 sm:p-6 flex flex-col md:flex-row items-start justify-between gap-5 hover:bg-[#F9FAF8] transition-colors"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 flex-1 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-full sm:w-[130px] h-[95px] rounded-xl overflow-hidden relative shrink-0">
                          <Image
                            src={imageErrors[job.id] ? "/Homepageimage.png" : getImageUrl(job.imageUrl || job.category?.image)}
                            alt={job.title || "Job"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 130px"
                            onError={() => setImageErrors((prev) => ({ ...prev, [job.id]: true }))}
                            unoptimized
                          />
                        </div>

                        {/* Text info */}
                        <div className="flex-1 min-w-0">
                          {/* Badge + Posted time */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-[#D9F2D0] text-[#1C6D26] border border-[#C2E2B8] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider leading-none">
                              NEW
                            </span>
                            <span className="text-[12px] text-[#768779] font-medium">
                              {job.postedAgo || "16 min ago"}
                            </span>
                          </div>

                          {/* Title */}
                          <h3
                            onClick={() => router.push(`/trader/jobs?jobId=${job.id}`)}
                            className="text-[17px] font-black text-[#1B311E] leading-snug hover:text-[#2B5921] cursor-pointer transition-colors mb-1.5"
                          >
                            {job.title}
                          </h3>

                          {/* Location & distance */}
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

                          {/* Tags */}
                          {job.tags && job.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {job.tags.map((tag: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="bg-[#EFF3EE] text-[#4D6050] text-[11px] font-bold px-3 py-1 rounded-full leading-none border border-[#E2EAE1]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
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
                          onClick={() => router.push(`/trader/jobs?jobId=${job.id}&action=quote`)}
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
              <div className="flex items-center gap-2.5">
                <ClipboardCheck size={20} className="text-[#2B5921]" />
                <h3 className="text-[17px] font-black text-[#1B311E]">
                  Jobs You&apos;re Working On
                </h3>
              </div>
              <Link
                href="/trader/jobs"
                className="text-[12px] font-bold text-[#2B5921] hover:underline flex items-center gap-1"
              >
                <span>View all jobs</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* List */}
            <div className="divide-y divide-[#EEF3ED] p-2 sm:p-3">
              {rawWorkingOn.slice(0, 2).map((job: JobItem, index: number) => (
                <div
                  key={job.id || index}
                  onClick={() => router.push(`/trader/jobs?jobId=${job.id || job.jobId}`)}
                  className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#F9FAF8] rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-[52px] h-[40px] rounded-lg overflow-hidden relative bg-[#EFF3EE] shrink-0 border border-[#E2EAE1]">
                      <Image
                        src={imageErrors[job.id || String(index)] ? "/before.jfif" : getImageUrl(job.imageUrl || job.attachments?.[0]?.url)}
                        alt={job.title || "Job"}
                        fill
                        className="object-cover"
                        onError={() => setImageErrors((prev) => ({ ...prev, [job.id || String(index)]: true }))}
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[13.5px] font-bold text-[#1B311E] truncate">
                        {job.title}
                      </h4>
                      <p className="text-[11px] text-[#768779] truncate">
                        {job.location} {job.postcode ? `• ${job.postcode}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                    <span className="bg-[#EFDB4B] text-[#8A5C05] border border-[#DFC736] font-extrabold text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wider leading-none">
                      In Progress
                    </span>
                    <div className="hidden sm:flex items-center gap-1 text-[12px] text-[#5A6E5E] font-medium">
                      <MessageSquare size={13} className="text-[#F59E0B]" />
                      <span>{job.quotesCount ?? 2} quotes</span>
                    </div>
                    <span className="hidden md:inline text-[11px] text-[#768779]">
                      {job.updatedText || (job.updatedAt ? `Updated ${job.postedAgo || '2 days ago'}` : "Updated 2 days ago")}
                    </span>
                    <ChevronRight size={16} className="text-[#A3B2A5]" />
                  </div>
                </div>
              ))}
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

              {/* Metric 2: Quotes sent */}
              <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#DFEBDD] flex flex-col gap-1.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#EFF5EB] flex items-center justify-center text-[#2B5921]">
                  <Send size={14} />
                </div>
                <div>
                  <span className="text-[18px] font-black text-[#1B311E] leading-none block">
                    {performance?.quotesSent?.value ?? 4}
                  </span>
                  <span className="text-[10.5px] text-[#5A6E5E] font-medium block mt-0.5">
                    Quotes sent
                  </span>
                  <span className="text-[10px] font-bold text-[#22781E] block mt-1">
                    ↑ {performance?.quotesSent?.trendPercentage ?? 33}%{" "}
                    <span className="text-[#768779] font-normal">vs last 30 days</span>
                  </span>
                </div>
              </div>

              {/* Metric 3: Quote acceptance rate */}
              <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#DFEBDD] flex flex-col gap-1.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#EFF5EB] flex items-center justify-center text-[#2B5921]">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <span className="text-[18px] font-black text-[#1B311E] leading-none block">
                    {performance?.quoteAcceptanceRate?.value ?? 50}%
                  </span>
                  <span className="text-[10.5px] text-[#5A6E5E] font-medium block mt-0.5">
                    Quote acceptance rate
                  </span>
                  <span className="text-[10px] font-bold text-[#22781E] block mt-1">
                    ↑ {performance?.quoteAcceptanceRate?.trendPercentage ?? 10}%{" "}
                    <span className="text-[#768779] font-normal">vs last 30 days</span>
                  </span>
                </div>
              </div>

              {/* Metric 4: Reviews */}
              <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#DFEBDD] flex flex-col gap-1.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#EFF5EB] flex items-center justify-center text-[#2B5921]">
                  <Star size={15} />
                </div>
                <div>
                  <span className="text-[18px] font-black text-[#1B311E] leading-none block">
                    {performance?.averageRating?.value ?? 3}
                  </span>
                  <span className="text-[10.5px] text-[#5A6E5E] font-medium block mt-0.5">
                    Reviews
                  </span>
                  <span className="text-[10px] font-bold text-[#22781E] block mt-1">
                    ↑ {performance?.averageRating?.trendChange ? (performance.averageRating.trendChange * 100).toFixed(0) : 100}%{" "}
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
    </div>
  );
}
