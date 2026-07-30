"use client";

import { Fragment, useEffect, useState } from "react";
import { authApi } from "@/app/api/authApi";
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
  X,
  ArrowUpDown,
  ExternalLink,
  MoreHorizontal,
  PlusCircle,
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
  selectedTrader?: SelectedTrader;
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
  { label: string; bg: string; text: string; dot: string }
> = {
  OPEN: {
    label: "Open",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  POSTED: {
    label: "Posted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  QUOTE_RECEIVED: {
    label: "Quote Received",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  ASSIGNED: {
    label: "Contacted",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  ACTIVE: {
    label: "Active",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
  EXPIRED: {
    label: "Expired",
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
  },
};

const FILTER_TABS = [
  { key: "ALL", label: "All Jobs" },
  { key: "ASSIGNED", label: "Contacted" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Expanded Row Detail ──────────────────────────────────────────────────────

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
        <div className="bg-[#FAFBF8] border-t border-b border-[#E8ECE0] px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Left: Description + Info */}
            <div className="space-y-5">
              {/* Description */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Job Description
                </h4>
                <p className="text-[13px] text-gray-600 leading-relaxed max-w-[600px]">
                  {job.description || "No description provided."}
                </p>
              </div>

              {/* Info Chips */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3.5 py-2.5">
                  <Clock size={13} className="text-[#6E9625]" />
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Timescale</p>
                    <p className="text-[12px] font-semibold text-[#1C2C1C]">
                      {job.timescale?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3.5 py-2.5">
                  <FileText size={13} className="text-[#6E9625]" />
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Budget</p>
                    <p className="text-[12px] font-semibold text-[#1C2C1C]">
                      {formatBudget(job.budgetRange)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3.5 py-2.5">
                  <MapPin size={13} className="text-[#6E9625]" />
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Radius</p>
                    <p className="text-[12px] font-semibold text-[#1C2C1C]">
                      {job.currentRadiusKm} km
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {(job.category || job.skillService || job.subCategory) && (
                <div className="flex flex-wrap gap-1.5">
                  {job.category && (
                    <span className="px-2.5 py-1 rounded-full bg-[#EDF3E1] text-[#4A6B0A] text-[11px] font-medium">
                      {job.category.name}
                    </span>
                  )}
                  {job.skillService && (
                    <span className="px-2.5 py-1 rounded-full bg-[#EDF3E1] text-[#4A6B0A] text-[11px] font-medium">
                      {job.skillService.name}
                    </span>
                  )}
                  {job.subCategory && (
                    <span className="px-2.5 py-1 rounded-full bg-[#EDF3E1] text-[#4A6B0A] text-[11px] font-medium">
                      {job.subCategory.name}
                    </span>
                  )}
                </div>
              )}

              {/* Assigned Trader */}
              {job.selectedTrader && (
                <div className="flex items-center gap-3 bg-white border border-emerald-200 rounded-xl p-3 max-w-[400px]">
                  <div className="w-9 h-9 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                    {job.selectedTrader.fullName?.[0]?.toUpperCase() ?? "T"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/customer-dashboard/trader-profile/${job.selectedTrader.id}`}>
                      <p className="text-[13px] font-bold text-[#1C2C1C] hover:underline cursor-pointer truncate">
                        {job.selectedTrader.fullName}
                      </p>
                    </Link>
                    <p className="text-[11px] text-gray-500">Assigned Trader</p>
                  </div>
                  <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                </div>
              )}
            </div>

            {/* Right: Attachments + Action */}
            <div className="flex flex-col gap-4">
              {/* Attachments */}
              {job.attachments?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Attachments ({job.attachments.length})
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {job.attachments.slice(0, 4).map((att) => (
                      <div
                        key={att.id}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                      >
                        <img
                          src={getAttachmentUrl(att.url || att.file)}
                          alt="Attachment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {job.attachments.length > 4 && (
                      <div className="aspect-square rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-[12px] font-bold text-gray-500">
                        +{job.attachments.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action */}
              <button
                onClick={onViewDashboard}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#1C2C1C] text-white rounded-xl text-[12px] font-bold hover:bg-[#2c3e2c] transition-colors mt-auto"
              >
                <ExternalLink size={13} />
                Open in Dashboard
              </button>
            </div>
          </div>
        </div>
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
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"date" | "title" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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

  // Filter + search
  const filteredJobs = jobs
    .filter((j) => activeFilter === "ALL" || j.status === activeFilter)
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
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[1.75rem] font-bold text-[#1C2C1C] leading-tight">
              Job History
            </h1>
            <p className="text-[13px] text-gray-500 mt-1">
              View and manage all your posted jobs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/customer-dashboard/jobs">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] border border-gray-200 cursor-pointer bg-white text-[14px] font-bold text-[#1C2C1C] hover:bg-gray-50 transition-colors shadow-sm">
                <Briefcase size={16} />
                Job Dashboard
              </button>
            </Link>
            <Link href="/customer-dashboard/post-job">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[#6E9625] cursor-pointer text-white text-[14px] font-bold hover:bg-[#58791C] transition-colors shadow-sm">
                <PlusCircle size={18} strokeWidth={2} />
                Post a Job
              </button>
            </Link>
          </div>
        </div>

        {/* ── Stats Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Jobs
            </p>
            <p className="text-[28px] font-extrabold text-[#1C2C1C] mt-1 leading-none">
              {jobs.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Active
            </p>
            <p className="text-[28px] font-extrabold text-emerald-600 mt-1 leading-none">
              {(statusCounts["OPEN"] || 0) +
                (statusCounts["ASSIGNED"] || 0) +
                (statusCounts["ACTIVE"] || 0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Completed
            </p>
            <p className="text-[28px] font-extrabold text-purple-600 mt-1 leading-none">
              {statusCounts["COMPLETED"] || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Quotes
            </p>
            <p className="text-[28px] font-extrabold text-[#6E9625] mt-1 leading-none">
              {jobs.reduce(
                (sum, j) => sum + (j.quotesReceived ?? j.quotesCount ?? 0),
                0
              )}
            </p>
          </div>
        </div>

        {/* ── Filter Tabs + Search ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          {/* Tabs */}
          <div className="flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-sm overflow-x-auto">
            {FILTER_TABS.map((tab) => {
              const count =
                tab.key === "ALL" ? jobs.length : statusCounts[tab.key] || 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${activeFilter === tab.key
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

          {/* Search */}
          <div className="relative w-full sm:w-[280px]">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Data Table ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-[56px] rounded-xl bg-gray-50 animate-pulse"
                />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Briefcase size={28} className="text-gray-300" />
              </div>
              <p className="text-[15px] font-semibold text-gray-500 mb-1">
                {searchQuery || activeFilter !== "ALL"
                  ? "No jobs match your filters"
                  : "No jobs posted yet"}
              </p>
              <p className="text-[13px] text-gray-400 mb-5">
                {searchQuery || activeFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "Post your first job to get started"}
              </p>
              {!searchQuery && activeFilter === "ALL" && (
                <Link href="/customer-dashboard/post-job">
                  <button className="px-5 py-2.5 bg-[#6E9625] text-white rounded-xl text-[13px] font-bold hover:bg-[#58791C] transition-colors">
                    + Post a Job
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              {/* Table Head */}
              <thead>
                <tr className="border-b border-gray-100 bg-[#FAFBF8]">
                  <th className="text-left px-6 py-3.5">
                    <button
                      onClick={() => toggleSort("title")}
                      className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                    >
                      Job Title
                      <SortIcon field="title" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3.5">
                    <button
                      onClick={() => toggleSort("status")}
                      className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                    >
                      Status
                      <SortIcon field="status" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3.5">
                    <button
                      onClick={() => toggleSort("date")}
                      className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                    >
                      Date Posted
                      <SortIcon field="date" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Location
                    </span>
                  </th>
                  <th className="text-left px-4 py-3.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Category
                    </span>
                  </th>
                  <th className="text-center px-4 py-3.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Quotes
                    </span>
                  </th>
                  <th className="text-right px-6 py-3.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
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
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-bold text-[#1C2C1C] group-hover:text-[#4A6B0A] transition-colors truncate max-w-[260px]">
                              {job.title}
                            </p>
                            {job.emergency && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[9px] font-bold border border-red-100 flex-shrink-0">
                                <Zap size={8} fill="#DC2626" />
                                Emergency
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusBadge status={job.status} />
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                            <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                            {formatDate(job.createdAt)}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                            <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                            {job.postcode || "—"}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          {job.category ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-600">
                              <Briefcase size={12} className="text-gray-400 flex-shrink-0" />
                              {job.category.name}
                            </span>
                          ) : (
                            <span className="text-[12px] text-gray-300">—</span>
                          )}
                        </td>

                        {/* Quotes */}
                        <td className="px-4 py-4 text-center">
                          {quotesCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#F0F5E8] text-[#6E9625] text-[11px] font-bold">
                              <MessageSquare size={11} />
                              {quotesCount}
                            </span>
                          ) : (
                            <span className="text-[12px] text-gray-300">0</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[10px] text-gray-400 whitespace-nowrap mr-1 hidden lg:block">
                              {timeAgo(job.createdAt)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedJobId(
                                  isExpanded ? null : job.id
                                );
                              }}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isExpanded
                                ? "bg-[#6E9625] text-white"
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
                            router.push("/customer-dashboard/jobs")
                          }
                        />
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Results count */}
        {!loading && filteredJobs.length > 0 && (
          <p className="text-center text-[12px] text-gray-400 mt-5">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        )}
      </div>
    </div>
  );
}
