"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/app/api/authApi";
import {
  FileText,
  Calendar,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuoteTrader {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string;
}

interface QuoteJob {
  id: string;
  title: string;
  postcode: string;
  status: string;
}

interface Quote {
  id: string;
  status: string;
  message?: string;
  price?: number;
  createdAt: string;
  updatedAt?: string;
  trader?: QuoteTrader;
  job?: QuoteJob;
  // fallback flat fields
  jobId?: string;
  traderId?: string;
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

const formatPrice = (price?: number) => {
  if (price == null) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price);
};

// ─── Status Config ────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    icon: <Clock size={12} />,
  },
  ACCEPTED: {
    label: "Accepted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    icon: <CheckCircle size={12} />,
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
    icon: <XCircle size={12} />,
  },
  EXPIRED: {
    label: "Expired",
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
    icon: <AlertCircle size={12} />,
  },
  OPEN: {
    label: "Open",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    icon: <FileText size={12} />,
  },
};

function QuoteStatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status?.toUpperCase()] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Quote Card ───────────────────────────────────────────────────────────────

function QuoteCard({ quote }: { quote: Quote }) {
  const traderName = quote.trader?.fullName || (quote as any).traderName || (quote as any).fullName || "Unknown Trader";
  const traderInitial = traderName.charAt(0).toUpperCase();
  const jobTitle = quote.job?.title || (quote as any).jobTitle || (quote as any).title || "Job";
  const jobPostcode = quote.job?.postcode || (quote as any).postcode || (quote as any).postCode || "";
  const profileImage = quote.trader?.profileImage || (quote as any).profileImage || (quote as any).avatar;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5 hover:shadow-md hover:border-[#C8D9A8] transition-all duration-200 group cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Trader avatar + info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={traderName}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#E8E8E8]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6E9625] to-[#4A6B0A] flex items-center justify-center text-white text-[16px] font-bold flex-shrink-0 border-2 border-[#C8D9A8]">
                {traderInitial}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[14px] font-bold text-[#1C2C1C] truncate">
                {traderName}
              </p>
              <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                <Star size={10} fill="#F59E0B" className="text-[#F59E0B]" />
                <span className="font-semibold text-[#1C2C1C]">—</span>
              </span>
            </div>

            <p className="text-[12px] text-gray-500 mt-0.5 truncate">
              <span className="font-medium text-[#1C2C1C]">{jobTitle}</span>
              {jobPostcode && (
                <span className="ml-2 inline-flex items-center gap-0.5 text-gray-400">
                  <MapPin size={10} />
                  {jobPostcode}
                </span>
              )}
            </p>

            {quote.message && (
              <p className="text-[12px] text-gray-500 mt-2 leading-relaxed line-clamp-2 italic">
                "{quote.message}"
              </p>
            )}

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <Calendar size={11} />
                {formatDate(quote.createdAt)}
              </div>
              <QuoteStatusBadge status={quote.status ?? "PENDING"} />
            </div>
          </div>
        </div>

        {/* Right: Price + action */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <p className="text-[18px] font-black text-[#1C2C1C]">
            {formatPrice(quote.price)}
          </p>
          <button className="flex items-center gap-1 text-[12px] font-semibold text-[#6E9625] hover:text-[#4A6B0A] transition-colors group-hover:gap-2 duration-200">
            View Details
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function QuoteCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-2/3 mt-2" />
          <div className="flex gap-3 mt-3">
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-16" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const STATUS_FILTERS = ["All", "Pending", "Accepted", "Rejected", "Expired"];

export default function CustomerQuotesDashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.getMyQuotes();
      console.log('fetchQuotes response', res);
      // The API may return data directly, or wrapped in a { data: [...] } object.
      const possibleData = res?.data ?? res;
      const arr: Quote[] = Array.isArray(possibleData)
        ? possibleData
        : Array.isArray(possibleData?.quotes)
          ? possibleData.quotes
          : Array.isArray(possibleData?.data)
            ? possibleData.data
            : [];
      setQuotes(arr);
    } catch (e) {
      console.error('Failed to fetch quotes', e);
      setError('Failed to load quotes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // ── Filter + search ──────────────────────────────────────────────
  const filtered = quotes.filter((q) => {
    const matchesStatus =
      activeFilter === "All" ||
      q.status?.toUpperCase() === activeFilter.toUpperCase();

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      q.trader?.fullName?.toLowerCase().includes(query) ||
      q.job?.title?.toLowerCase().includes(query) ||
      q.job?.postcode?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: quotes.length,
    pending: quotes.filter((q) => q.status?.toUpperCase() === "PENDING").length,
    accepted: quotes.filter((q) => q.status?.toUpperCase() === "ACCEPTED").length,
    rejected: quotes.filter((q) => q.status?.toUpperCase() === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5]">
      <div className="max-w-[1100px] mx-auto px-6 py-8">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[2rem] font-bold text-[#1C2C1C] leading-tight">
              My Quotes
            </h1>
            <p className="text-[13px] text-gray-500 mt-1">
              All quotes received from traders for your jobs
            </p>
          </div>
          <button
            onClick={fetchQuotes}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-[13px] font-semibold text-[#1C2C1C] hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── Stats Row ───────────────────────────────────────────── */}
        {!loading && quotes.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Quotes", value: stats.total, color: "text-[#1C2C1C]", bg: "bg-white" },
              { label: "Pending", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Accepted", value: stats.accepted, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Rejected", value: stats.rejected, color: "text-red-500", bg: "bg-red-50" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-2xl border border-[#E8E8E8] p-4 shadow-sm`}>
                <p className="text-[12px] font-medium text-gray-500">{stat.label}</p>
                <p className={`text-[28px] font-black mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Search + Filter ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by trader or job…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full border border-[#E8E8E8] bg-white text-[13px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#8BC34A] transition-colors"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white rounded-full p-1 border border-[#E8E8E8]">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${activeFilter === f
                  ? "bg-[#1C2C1C] text-white shadow-sm"
                  : "text-[#1C2C1C]/60 hover:text-[#1C2C1C]"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <QuoteCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
            <XCircle size={40} className="mx-auto text-red-400 mb-3" />
            <p className="text-[14px] font-semibold text-red-600">{error}</p>
            <button
              onClick={fetchQuotes}
              className="mt-4 px-5 py-2 rounded-full bg-[#1C2C1C] text-white text-[13px] font-bold hover:bg-[#2c3e2c] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-16 text-center">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-[15px] font-semibold text-gray-400">
              {quotes.length === 0 ? "No quotes yet." : "No quotes match your filters."}
            </p>
            <p className="text-[12px] text-gray-400 mt-1">
              {quotes.length === 0
                ? "Once traders quote on your jobs, they'll appear here."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
