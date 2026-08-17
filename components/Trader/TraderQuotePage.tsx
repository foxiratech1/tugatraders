"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authApi } from "@/app/api/authApi";
import { FileText, RefreshCw, CheckCircle, XCircle, Clock, ArrowRight, Pencil } from "lucide-react";

/**
 * Quote type mirrors the shape returned by GET /api/quotes/my-quotes
 */
interface Quote {
  id: string;
  status: string;
  price?: number;
  createdAt: string;
  job?: {
    id: string;
    title: string;
    postcode?: string;
  };
  // fallback flat fields for older API shapes
  jobId?: string;
  jobTitle?: string;
  jobPostcode?: string;
}

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
    icon: <XCircle size={12} />,
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

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatPrice(price?: number) {
  if (price == null) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(price);
}

function QuoteCard({ quote }: { quote: Quote }) {
  const jobTitle = quote.job?.title || quote.jobTitle || "Job";

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5 hover:shadow-md hover:border-[#C8D9A8] transition-all duration-200">
      {/* Top section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-[#1C2C1C] truncate">
            {jobTitle}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p className="text-[18px] font-black text-[#1C2C1C]">
            {formatPrice(quote.price)}
          </p>

          <QuoteStatusBadge
            status={quote.status ?? "PENDING"}
          />
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between mt-3">
        {/* Date */}
        <span className="text-[11px] text-gray-500">
          {formatDate(quote.createdAt)}
        </span>

        {/* Edit + View Quote */}
        {/* Edit + View Quote */}
        <div className="flex items-center gap-3">

          {/* Edit Quote */}
          <Link
            href={`/trader/quotes/${quote.id}/edit`}
            title="Edit Quote"
            aria-label="Edit Quote"
            className="flex items-center justify-center w-7 h-7 flex-shrink-0 rounded-md bg-[#F1F5E9] text-[#6E9625] hover:bg-[#E4ECD5] hover:text-[#4A6B0A] transition-colors"
          >
            <Pencil
              size={15}
              strokeWidth={2.5}
              className="block"
            />
          </Link>

          {/* View Quote */}
          <Link
            href={`/trader/quotes/${quote.id}`}
            className="flex items-center gap-1 text-[11px] text-[#6E9625] hover:text-[#4A6B0A] whitespace-nowrap"
          >
            View Quote
            <ArrowRight size={12} />
          </Link>

        </div>
      </div>
    </div>
  );
}

export default function TraderQuotePage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.getMyQuotes();
      const possible = res?.data ?? res;
      const arr: Quote[] = Array.isArray(possible)
        ? possible
        : Array.isArray(possible?.quotes)
          ? possible?.quotes
          : [];
      setQuotes(arr);
    } catch (e) {
      console.error("Failed to fetch trader quotes", e);
      setError("Failed to load quotes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9F5]">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[2rem] font-bold text-[#1C2C1C]">My Quotes</h1>
          <button
            onClick={fetchQuotes}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-[13px] font-semibold text-[#1C2C1C] hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
            <XCircle size={40} className="mx-auto text-red-400 mb-3" />
            <p className="text-[14px] font-semibold text-red-600">{error}</p>
            <button onClick={fetchQuotes} className="mt-4 px-5 py-2 rounded-full bg-[#1C2C1C] text-white text-[13px] font-bold hover:bg-[#2c3e2c] transition-colors">
              Try Again
            </button>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-16 text-center">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-[15px] font-semibold text-gray-400">No quotes yet.</p>
            <p className="text-[12px] text-gray-400 mt-1">
              When traders receive quotes on your jobs they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map(q => (
              <QuoteCard key={q.id} quote={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
