"use client";

import { Fragment, useEffect, useState } from "react";
import { authApi } from "@/app/api/authApi";
import { useSocket } from "@/hooks/useSocket";
import {
  MapPin,
  Calendar,
  Clock,
  Zap,
  Search,
  ChevronDown,
  ChevronUp,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Eye,
  MessageSquare,
  CheckCircle,
  PlusCircle,
  ExternalLink,
  ArrowUpDown,
  X,
  Table as TableIcon,
  LayoutGrid,
  ArrowLeftRight,
  Euro,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

const getAttachmentUrl = (path: string | null | undefined) => {
  if (!path) return "";
  let cleanPath = path;
  if (cleanPath.startsWith("undefined")) {
    cleanPath = cleanPath.replace("undefined", "");
  }
  if (cleanPath.startsWith("http")) return cleanPath;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  return `${baseUrl}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
};

interface Attachment {
  id: string;
  jobId: string;
  file: string;
  createdAt: string;
  url: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
}

interface SkillService {
  id: string;
  name: string;
  image: string;
}

interface SubCategory {
  id: string;
  name: string;
  image: string;
}

interface SelectedTrader {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
  traderProfile?: {
    companyName?: string | null;
  } | null;
  traderMetrics?: {
    averageRating: number;
    totalReviews: number;
  } | null;
}

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  postcode: string;
  latitude: string;
  longitude: string;
  timescale: string;
  emergency: boolean;
  budgetRange: string;
  quotesReceived: number;
  quotesCount: number;
  currentRadiusKm: number;
  createdAt: string;
  attachments: Attachment[];
  category?: Category;
  skillService?: SkillService;
  subCategory?: SubCategory;
  // Arrays returned by the API (multi-select support)
  categories?: Category[];
  skillServices?: SkillService[];
  subCategories?: SubCategory[];
  selectedTrader?: SelectedTrader;
  quotes?: any[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatBudget = (b: string) =>
  b?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—";

const timeAgo = (iso: string) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

// ─── Status Config ────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  OPEN: { label: "Job Posted", bg: "bg-[#F1AA69]", text: "text-[#9C410F]", border: "border-[#DDA066]" },
  POSTED: { label: "Job Posted", bg: "bg-[#F1AA69]", text: "text-[#9C410F]", border: "border-[#DDA066]" },
  ACTIVE: { label: "Job Posted", bg: "bg-[#F1AA69]", text: "text-[#9C410F]", border: "border-[#DDA066]" },
  JOB_POSTED: { label: "Job Posted", bg: "bg-[#F1AA69]", text: "text-[#9C410F]", border: "border-[#DDA066]" },
  QUOTE_RECEIVED: { label: "Quote Received", bg: "bg-[#DCEAF7]", text: "text-[#156082]", border: "border-[#C2D9EE]" },
  QUOTES_RECIEVED: { label: "Quote Received", bg: "bg-[#DCEAF7]", text: "text-[#156082]", border: "border-[#C2D9EE]" },
  QUOTES_RECEIVED: { label: "Quote Received", bg: "bg-[#DCEAF7]", text: "text-[#156082]", border: "border-[#C2D9EE]" },
  CONTACTED: { label: "Contacted", bg: "bg-[#7DB0E3]", text: "text-[#103270]", border: "border-[#679FD8]" },
  ASSIGNED: { label: "Contacted", bg: "bg-[#7DB0E3]", text: "text-[#103270]", border: "border-[#679FD8]" },
  QUOTE_ACCEPTED: { label: "Quote Accepted", bg: "bg-[#D9F2D0]", text: "text-[#1C6D26]", border: "border-[#C2E2B8]" },
  ACCEPTED: { label: "Quote Accepted", bg: "bg-[#D9F2D0]", text: "text-[#1C6D26]", border: "border-[#C2E2B8]" },
  QUOTE_DECLINED: { label: "Quote Declined", bg: "bg-[#FF9797]", text: "text-[#E53935]", border: "border-[#F08282]" },
  DECLINED: { label: "Quote Declined", bg: "bg-[#FF9797]", text: "text-[#E53935]", border: "border-[#F08282]" },
  REJECTED: { label: "Quote Declined", bg: "bg-[#FF9797]", text: "text-[#E53935]", border: "border-[#F08282]" },
  IN_PROGRESS: { label: "In Progress", bg: "bg-[#EFDB4B]", text: "text-[#8A5C05]", border: "border-[#DFC736]" },
  COMPLETED: { label: "Completed", bg: "bg-[#13501B]", text: "text-white", border: "border-[#0E3F15]" },
  CLOSED: { label: "Closed", bg: "bg-[#A6A6A6]", text: "text-[#333333]", border: "border-[#8E8E8E]" },
  CANCELLED: { label: "Closed", bg: "bg-[#A6A6A6]", text: "text-[#333333]", border: "border-[#8E8E8E]" },
  EXPIRED: { label: "Closed", bg: "bg-[#A6A6A6]", text: "text-[#333333]", border: "border-[#8E8E8E]" },
};

const isJobPostedStatus = (status: string) => {
  const s = status?.toUpperCase();
  return s === "OPEN" || s === "POSTED" || s === "ACTIVE" || s === "ASSIGNED" || s === "JOB_POSTED";
};

const isClosedStatus = (status: string) => {
  const s = status?.toUpperCase();
  return s === "CLOSED" || s === "CANCELLED" || s === "EXPIRED";
};

const FILTER_TABS = [
  { key: "JOB_POSTED", label: "Jobs Posted" },
  { key: "QUOTE_RECEIVED", label: "Quotes Received" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CLOSED", label: "Closed" },
];

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status, job }: { status: string; job?: Job }) {
  let s = status?.toUpperCase() || "";
  const quotes = job ? (job.quotesReceived ?? job.quotesCount ?? (job as any)._count?.quotes ?? (Array.isArray(job.quotes) ? job.quotes.length : 0)) : 0;
  if (
    s === "QUOTE_RECEIVED" ||
    s === "QUOTES_RECEIVED" ||
    s === "QUOTED" ||
    s === "QUOTE_SENT" ||
    ((s === "OPEN" || s === "POSTED" || s === "ACTIVE") && quotes > 0)
  ) {
    s = "QUOTE_RECEIVED";
  }

  const cfg = statusConfig[s] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-300",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold border min-w-[85px] sm:min-w-[95px] rounded ${cfg.bg} ${cfg.text} ${cfg.border || "border-gray-300"}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Expanded Row Detail Content ──────────────────────────────────────────────

function JobExpandedContent({
  job,
  onViewDashboard,
}: {
  job: Job;
  onViewDashboard: () => void;
}) {
  const trader = (job as any).assignedTrader || job.selectedTrader;
  const quote = trader?.quote || (job as any).selectedQuote || (job as any).quote;

  return (
    <div className="bg-[#FAFBF8] border-t border-b border-[#E8ECE0] px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Left Section (Job Description & Trader) */}
        <div className="flex-1 space-y-6">
          {/* Job Description */}
          <div>
            <h4 className="text-[11px] font-bold text-[#9DA39E] uppercase tracking-wider mb-2">
              Job Description
            </h4>
            <p className="text-[13px] text-[#69746A] leading-relaxed max-w-[800px] break-words">
              {job.description || "No description provided."}
            </p>
          </div>

          {/* Assigned Trader Card */}
          {trader && (
            <div className="flex flex-wrap items-center gap-6 bg-white border border-[#4A6B0A] rounded-xl p-3 max-w-fit">
              {/* Trader Info */}
              <div className="flex items-center gap-3 pr-2">
                {trader.profileImage ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-emerald-100">
                    <img
                      src={getAttachmentUrl(trader.profileImage)}
                      alt={trader.fullName || "Trader"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0">
                    {trader.fullName?.[0]?.toUpperCase() ?? "T"}
                  </div>
                )}
                <div className="flex flex-col">
                  <Link href={`/customer-dashboard/trader-profile/${trader.id}`}>
                    <p className="text-[14px] font-bold text-[#1C2C1C] hover:underline cursor-pointer truncate">
                      {trader.fullName}
                    </p>
                  </Link>
                  <p className="text-[11px] text-gray-400 font-medium">Assigned Trader</p>
                </div>
              </div>

              {/* Separator / Additional Details */}
              {quote && (
                <>
                  <div className="w-[1px] h-8 bg-gray-200 hidden sm:block"></div>

                  {/* Price */}
                  <div className="flex flex-col pr-2">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price</p>
                    <p className="text-[14px] font-bold text-[#1C2C1C]">
                      €{quote.price}
                    </p>
                  </div>

                  {/* Estimated Duration */}
                  <div className="flex flex-col">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Estimated Duration</p>
                    <p className="text-[14px] font-bold text-[#1C2C1C]">
                      {quote.estimatedDays} {quote.estimatedDays === 1 ? "day" : "days"}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Attachments (Optional, below description if any) */}
          {job.attachments?.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Attachments ({job.attachments.length})
              </h4>
              <div className="flex gap-2 flex-wrap">
                {job.attachments.slice(0, 4).map((att) => (
                  <div
                    key={att.id}
                    className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    <img
                      src={getAttachmentUrl(att.url || att.file)}
                      alt="Attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {job.attachments.length > 4 && (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-[12px] font-bold text-gray-500">
                    +{job.attachments.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section (Stats Cards & CTA) */}
        <div className="flex flex-col justify-between gap-6 md:w-[360px] flex-shrink-0">
          {/* Top: Info Chips Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] rounded-xl px-4 py-3.5 flex flex-col justify-center">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Budget</p>
              <div className="flex items-center gap-1.5">
                <Euro size={13} className="text-[#6E9625]" />
                <p className="text-[13px] font-bold text-[#1C2C1C] truncate">
                  {formatBudget(job.budgetRange)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] rounded-xl px-4 py-3.5 flex flex-col justify-center">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Timescale</p>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#6E9625]" />
                <p className="text-[13px] font-bold text-[#1C2C1C] truncate">
                  {job.timescale?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom: Action Button */}
          <div className="mt-auto flex justify-end">
            <button
              onClick={onViewDashboard}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1C2C1C] text-white rounded-xl text-[13px] font-bold hover:bg-[#2c3e2c] transition-colors cursor-pointer shadow-sm w-full md:w-auto"
            >
              <ExternalLink size={14} />
              Open in Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Expanded Row Detail (Table View) ────────────────────────────────────────

function ExpandedDetail({
  job,
  onViewDashboard,
}: {
  job: Job;
  onViewDashboard: () => void;
}) {
  return (
    <tr>
      <td colSpan={7} className="px-0 py-0">
        <JobExpandedContent job={job} onViewDashboard={onViewDashboard} />
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerJobHistory() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("JOB_POSTED");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"date" | "title" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [mobileView, setMobileView] = useState<"table" | "card">("card");

  useSocket({
    onJobUpdated: (updatedJob) => {
      if (!updatedJob || !updatedJob.id) return;
      setJobs((prev) =>
        prev.map((j) => (j.id === updatedJob.id ? { ...j, ...updatedJob } : j))
      );
    },
  });

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await authApi.getMyJobs();
        const arr: Job[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];
        setJobs(arr);
      } catch (e) {
        console.error("Failed to fetch customer jobs", e);
        toast.error("Failed to load job history");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) {
        const upper = tab.toUpperCase();
        if (upper === "JOB_POSTED" || upper === "JOB POSTED" || upper === "POSTED" || upper === "ASSIGNED" || upper === "ALL") {
          setActiveFilter("JOB_POSTED");
        } else if (upper === "QUOTE_RECEIVED" || upper === "QUOTES RECEIVED" || upper === "QUOTES_RECEIVED") {
          setActiveFilter("QUOTE_RECEIVED");
        } else if (upper === "COMPLETED") {
          setActiveFilter("COMPLETED");
        } else if (upper === "CLOSED") {
          setActiveFilter("CLOSED");
        }
      }
    }
  }, []);

  // Filter + search
  const filteredJobs = jobs
    .filter((j) => {
      if (activeFilter === "JOB_POSTED" || activeFilter === "ALL") return true;
      if (activeFilter === "QUOTE_RECEIVED") {
        const qCount = j.quotesReceived ?? j.quotesCount ?? (j as any)._count?.quotes ?? (Array.isArray(j.quotes) ? j.quotes.length : 0);
        return qCount > 0 || j.status?.toUpperCase() === "QUOTE_RECEIVED" || j.status?.toUpperCase() === "QUOTED";
      }
      if (activeFilter === "COMPLETED") {
        return j.status?.toUpperCase() === "COMPLETED";
      }
      if (activeFilter === "CLOSED") {
        return isClosedStatus(j.status);
      }
      return j.status === activeFilter;
    })
    .filter(
      (j) =>
        !searchQuery ||
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.postcode?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "title") {
        cmp = a.title.localeCompare(b.title);
      } else if (sortField === "status") {
        cmp = a.status.localeCompare(b.status);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  // Count per status
  const statusCounts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] || 0) + 1;
    return acc;
  }, {});

  const toggleSort = (field: "date" | "title" | "status") => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: "date" | "title" | "status" }) => (
    <ArrowUpDown
      size={12}
      className={`ml-1 inline-block transition-colors ${sortField === field ? "text-[#6E9625]" : "text-gray-300"
        }`}
    />
  );

  return (
    <div className="min-h-screen bg-[#F8F9F5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-[1.75rem] font-bold text-[#1C2C1C] leading-tight">
              Job History
            </h1>
            <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">
              View and manage all your posted jobs
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link href="/customer-dashboard/jobs" className="flex-1 sm:flex-none">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-[12px] border border-gray-200 cursor-pointer bg-white text-[13px] sm:text-[14px] font-bold text-[#1C2C1C] hover:bg-gray-50 transition-colors shadow-sm">
                <Briefcase size={16} />
                <span>Job Dashboard</span>
              </button>
            </Link>
            <Link href="/customer-dashboard/post-job" className="flex-1 sm:flex-none">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-[12px] bg-[#6E9625] cursor-pointer text-white text-[13px] sm:text-[14px] font-bold hover:bg-[#58791C] transition-colors shadow-sm">
                <PlusCircle size={17} strokeWidth={2} />
                <span>Post a Job</span>
              </button>
            </Link>
          </div>
        </div>

        {/* ── Stats Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:px-5 sm:py-4 shadow-sm flex sm:flex-col justify-between sm:justify-start items-center sm:items-start">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Jobs Posted
            </p>
            <p className="text-[24px] sm:text-[28px] font-extrabold text-[#C45E20] sm:mt-1 leading-none">
              {jobs.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:px-5 sm:py-4 shadow-sm flex sm:flex-col justify-between sm:justify-start items-center sm:items-start">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Completed
            </p>
            <p className="text-[24px] sm:text-[28px] font-extrabold text-[#1E5624] sm:mt-1 leading-none">
              {jobs.filter((j) => j.status?.toUpperCase() === "COMPLETED").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:px-5 sm:py-4 shadow-sm flex sm:flex-col justify-between sm:justify-start items-center sm:items-start">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Quotes
            </p>
            <p className="text-[24px] sm:text-[28px] font-extrabold text-[#6E9625] sm:mt-1 leading-none">
              {jobs.reduce(
                (sum, j) => sum + (j.quotesReceived ?? j.quotesCount ?? 0),
                0
              )}
            </p>
          </div>
        </div>

        {/* ── Filter Tabs + Search ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-5">
          {/* Tabs */}
          <div className="w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-start bg-white rounded-full p-1 border border-gray-200 shadow-xs">
              {FILTER_TABS.map((tab) => {
                const count =
                  tab.key === "JOB_POSTED" || tab.key === "ALL"
                    ? jobs.length
                    : tab.key === "COMPLETED"
                      ? jobs.filter((j) => j.status?.toUpperCase() === "COMPLETED").length
                      : tab.key === "CLOSED"
                        ? jobs.filter((j) => isClosedStatus(j.status)).length
                        : statusCounts[tab.key] || 0;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${activeFilter === tab.key
                      ? "bg-[#1C2C1C] text-white shadow-sm"
                      : "text-gray-500 hover:text-[#1C2C1C] hover:bg-gray-50"
                      }`}
                  >
                    {tab.label}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${activeFilter === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-[220px] md:w-[250px] lg:w-[280px]">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile View Switcher (Table vs Cards) */}
        {!loading && filteredJobs.length > 0 && (
          <div className="flex items-center justify-between gap-2 mb-3 md:hidden">
            <span className="text-[12px] font-semibold text-gray-500">
              Showing {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
            </span>
            <div className="inline-flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
              <button
                type="button"
                onClick={() => setMobileView("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${mobileView === "table"
                  ? "bg-[#1C2C1C] text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                <TableIcon size={12} />
                Table View
              </button>
              <button
                type="button"
                onClick={() => setMobileView("card")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${mobileView === "card"
                  ? "bg-[#1C2C1C] text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                <LayoutGrid size={12} />
                Cards
              </button>
            </div>
          </div>
        )}

        {/* ── Data Container ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 sm:p-8 space-y-3 sm:space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-[52px] sm:h-[56px] rounded-xl bg-gray-50 animate-pulse"
                />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Briefcase size={26} className="text-gray-300" />
              </div>
              <p className="text-[14px] sm:text-[15px] font-semibold text-gray-500 mb-1">
                {searchQuery || (activeFilter !== "JOB_POSTED" && activeFilter !== "ALL")
                  ? "No jobs match your filters"
                  : "No jobs posted yet"}
              </p>
              <p className="text-[12px] sm:text-[13px] text-gray-400 mb-5">
                {searchQuery || (activeFilter !== "JOB_POSTED" && activeFilter !== "ALL")
                  ? "Try adjusting your search or filter criteria"
                  : "Post your first job to get started"}
              </p>
              {!searchQuery && (activeFilter === "JOB_POSTED" || activeFilter === "ALL") && (
                <Link href="/customer-dashboard/post-job">
                  <button className="px-5 py-2.5 bg-[#6E9625] text-white rounded-xl text-[13px] font-bold hover:bg-[#58791C] transition-colors cursor-pointer shadow-sm">
                    + Post a Job
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Swipe Notice (Only shown on mobile when in Table view) */}
              {mobileView === "table" && (
                <div className="md:hidden flex items-center justify-between px-4 py-2 bg-[#FAFBF8] border-b border-gray-100 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ArrowLeftRight size={12} className="text-[#6E9625]" />
                    Swipe horizontally to view all columns
                  </span>
                  <span className="font-bold text-[10px] bg-[#6E9625]/10 text-[#6E9625] px-1.5 py-0.5 rounded">
                    7 columns
                  </span>
                </div>
              )}

              {/* Mobile Structured Card List (shown when mobileView === "card" on mobile) */}
              {mobileView === "card" && (
                <div className="block md:hidden divide-y divide-gray-100">
                  {filteredJobs.map((job) => {
                    const isExpanded = expandedJobId === job.id;
                    const quotesCount =
                      job.quotesReceived ?? job.quotesCount ?? 0;
                    const cats = (job as any).categories?.length
                      ? (job as any).categories
                      : job.category ? [job.category] : [];

                    return (
                      <div key={job.id} className="transition-colors">
                        <div className="p-4 hover:bg-gray-50/70 transition-colors">
                          {/* Top: Title & Status */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-bold text-[#1C2C1C] leading-snug">
                                {job.title}
                              </p>
                              {job.emergency && (
                                <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[9px] font-bold border border-red-100">
                                  <Zap size={8} fill="#DC2626" />
                                  Emergency
                                </span>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <StatusBadge status={job.status} job={job} />
                            </div>
                          </div>

                          {/* Table Data Grid (2x2 key-value layout) */}
                          <div className="grid grid-cols-2 gap-2 bg-gray-50/80 rounded-xl p-2.5 mb-3 border border-gray-100 text-[12px]">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Date Posted</span>
                              <span className="font-semibold text-[#1C2C1C] flex items-center gap-1 mt-0.5">
                                <Calendar size={11} className="text-gray-400 flex-shrink-0" />
                                <span>{formatDate(job.createdAt)}</span>
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Location</span>
                              <span className="font-semibold text-[#1C2C1C] flex items-center gap-1 mt-0.5">
                                <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{job.postcode || "—"}</span>
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Category</span>
                              <span className="font-semibold text-[#1C2C1C] flex items-center gap-1 mt-0.5">
                                <Briefcase size={11} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{cats[0]?.name || "—"}</span>
                                {cats.length > 1 && (
                                  <span className="text-[9px] text-gray-500 bg-white px-1 py-0.2 rounded border border-gray-200 flex-shrink-0">
                                    +{cats.length - 1}
                                  </span>
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Quotes</span>
                              <span className="font-semibold text-[#1C2C1C] flex items-center gap-1 mt-0.5">
                                {quotesCount > 0 ? (
                                  <span className="text-[#6E9625] font-bold flex items-center gap-1">
                                    <MessageSquare size={11} />
                                    {quotesCount} {quotesCount === 1 ? "Quote" : "Quotes"}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">0 Quotes</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Bottom row: Time ago + Expand CTA */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[12px]">
                            <span className="text-[11px] text-gray-400">
                              Posted {timeAgo(job.createdAt)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                              className="flex items-center gap-1 text-[12px] font-bold text-[#6E9625] hover:text-[#58791C] transition-colors cursor-pointer"
                            >
                              <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Mobile Expanded Detail */}
                        {isExpanded && (
                          <div className="border-t border-gray-100">
                            <JobExpandedContent
                              job={job}
                              onViewDashboard={() =>
                                router.push(`/customer-dashboard/jobs?jobId=${job.id}`)
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table View (Displayed on mobile when mobileView === "table", always on md+) */}
              <div className={`${mobileView === "table" ? "block" : "hidden md:block"} overflow-x-auto custom-scrollbar`}>
                <table className="w-full min-w-[660px] text-left border-collapse">
                  {/* Table Head */}
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#FAFBF8]">
                      <th className="text-left px-3.5 lg:px-6 py-3.5">
                        <button
                          onClick={() => toggleSort("title")}
                          className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors cursor-pointer"
                        >
                          Job Title
                          <SortIcon field="title" />
                        </button>
                      </th>
                      <th className="text-left px-2.5 lg:px-4 py-3.5">
                        <button
                          onClick={() => toggleSort("status")}
                          className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors cursor-pointer"
                        >
                          Status
                          <SortIcon field="status" />
                        </button>
                      </th>
                      <th className="text-left px-2.5 lg:px-4 py-3.5">
                        <button
                          onClick={() => toggleSort("date")}
                          className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Date Posted
                          <SortIcon field="date" />
                        </button>
                      </th>
                      <th className="text-left px-2.5 lg:px-4 py-3.5">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Location
                        </span>
                      </th>
                      <th className="text-left px-2.5 lg:px-4 py-3.5">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Category
                        </span>
                      </th>
                      <th className="text-center px-2 lg:px-3 py-3.5">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Quotes
                        </span>
                      </th>
                      <th className="text-right px-3.5 lg:px-6 py-3.5">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {filteredJobs.map((job, idx) => {
                      const isExpanded = expandedJobId === job.id;
                      const quotesCount =
                        job.quotesReceived ?? job.quotesCount ?? 0;
                      const isLast = idx === filteredJobs.length - 1;

                      return (
                        <Fragment key={job.id}>
                          <tr
                            onClick={() =>
                              setExpandedJobId(isExpanded ? null : job.id)
                            }
                            className={`group cursor-pointer transition-colors ${isExpanded
                              ? "bg-[#FAFBF8]"
                              : "hover:bg-gray-50/60"
                              } ${!isLast && !isExpanded ? "border-b border-gray-100" : ""}`}
                          >
                            {/* Job Title + emergency */}
                            <td className="px-3.5 lg:px-6 py-3.5 lg:py-4">
                              <div className="flex items-center gap-1.5 lg:gap-2">
                                <p className="text-[13px] font-bold text-[#1C2C1C] group-hover:text-[#4A6B0A] transition-colors truncate max-w-[130px] md:max-w-[160px] lg:max-w-[220px] xl:max-w-[280px]">
                                  {job.title}
                                </p>
                                {job.emergency && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[9px] font-bold border border-red-100 flex-shrink-0">
                                    <Zap size={8} fill="#DC2626" />
                                    <span className="hidden xl:inline">Emergency</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-2.5 lg:px-4 py-3.5 lg:py-4 whitespace-nowrap">
                              <StatusBadge status={job.status} job={job} />
                            </td>

                            {/* Date */}
                            <td className="px-2.5 lg:px-4 py-3.5 lg:py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                                <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                                <span>{formatDate(job.createdAt)}</span>
                              </div>
                            </td>

                            {/* Location */}
                            <td className="px-2.5 lg:px-4 py-3.5 lg:py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                                <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate max-w-[80px] lg:max-w-none">{job.postcode || "—"}</span>
                              </div>
                            </td>

                            {/* Category — show primary with +N count badge if multiple */}
                            <td className="px-2.5 lg:px-4 py-3.5 lg:py-4">
                              {(() => {
                                const cats = (job as any).categories?.length
                                  ? (job as any).categories
                                  : job.category ? [job.category] : [];
                                if (cats.length === 0) {
                                  return <span className="text-[12px] text-gray-300">—</span>;
                                }
                                return (
                                  <div className="flex items-center gap-1">
                                    <span className="inline-flex items-center gap-1 text-[12px] text-gray-600 truncate max-w-[100px] lg:max-w-[150px]">
                                      <Briefcase size={12} className="text-gray-400 flex-shrink-0" />
                                      <span className="truncate">{cats[0].name}</span>
                                    </span>
                                    {cats.length > 1 && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500 flex-shrink-0">
                                        +{cats.length - 1}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Quotes */}
                            <td className="px-2 lg:px-3 py-3.5 lg:py-4 text-center whitespace-nowrap">
                              {quotesCount > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0F5E8] text-[#6E9625] text-[11px] font-bold">
                                  <MessageSquare size={11} />
                                  {quotesCount}
                                </span>
                              ) : (
                                <span className="text-[12px] text-gray-300">0</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-3.5 lg:px-6 py-3.5 lg:py-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                                <span className="text-[10px] text-gray-400 whitespace-nowrap mr-1 hidden xl:block">
                                  {timeAgo(job.createdAt)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedJobId(
                                      isExpanded ? null : job.id
                                    );
                                  }}
                                  aria-label={isExpanded ? "Collapse job details" : "Expand job details"}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${isExpanded
                                    ? "bg-[#6E9625] text-white shadow-xs"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                    }`}
                                >
                                  {isExpanded ? (
                                    <ChevronUp size={14} />
                                  ) : (
                                    <ChevronDown size={14} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Detail Row */}
                          {isExpanded && (
                            <ExpandedDetail
                              key={`detail-${job.id}`}
                              job={job}
                              onViewDashboard={() =>
                                router.push(`/customer-dashboard/jobs?jobId=${job.id}`)
                              }
                            />
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Results count */}
        {!loading && filteredJobs.length > 0 && (
          <p className="text-center text-[12px] text-gray-400 mt-4 sm:mt-5">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        )}
      </div>
    </div>
  );
}
