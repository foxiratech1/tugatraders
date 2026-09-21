"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { authApi } from "@/app/api/authApi";
import {
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Pencil,
  X,
  Loader2,
  Calendar,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";

export const AVAILABILITY_OPTIONS = [
  "Can start immediately",
  "Within 24 hours",
  "Within 3 days",
  "Within 7 days",
  "7days +",
] as const;

/**
 * Quote type mirrors the shape returned by GET /api/quotes/my-quotes
 */
interface Quote {
  id: string;
  status: string;
  price?: number | string;
  createdAt: string;
  updatedAt?: string;
  availability?: string;
  estimatedDays?: number;
  message?: string;
  job?: {
    id: string;
    title: string;
    postcode?: string;
  };
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
    bg: "bg-[#DCEAF7]",
    text: "text-[#156082]",
    dot: "bg-[#156082]",
    icon: <Clock size={12} className="text-[#156082]" />,
  },
  ACCEPTED: {
    label: "Accepted",
    bg: "bg-[#D9F2D0]",
    text: "text-[#1C6D26]",
    dot: "bg-[#1C6D26]",
    icon: <CheckCircle size={12} className="text-[#1C6D26]" />,
  },
  REJECTED: {
    label: "Declined",
    bg: "bg-[#FF9797]",
    text: "text-[#E53935]",
    dot: "bg-[#E53935]",
    icon: <XCircle size={12} className="text-[#E53935]" />,
  },
  DECLINED: {
    label: "Declined",
    bg: "bg-[#FF9797]",
    text: "text-[#E53935]",
    dot: "bg-[#E53935]",
    icon: <XCircle size={12} className="text-[#E53935]" />,
  },
  EXPIRED: {
    label: "Closed",
    bg: "bg-[#A6A6A6]",
    text: "text-[#333333]",
    dot: "bg-[#333333]",
    icon: <XCircle size={12} className="text-[#333333]" />,
  },
  WITHDRAWN: {
    label: "Withdrawn",
    bg: "bg-[#A6A6A6]",
    text: "text-[#333333]",
    dot: "bg-[#333333]",
    icon: <XCircle size={12} className="text-[#333333]" />,
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

function formatPrice(price?: number | string) {
  if (price == null || price === "") return "—";
  const num = typeof price === "number" ? price : parseFloat(String(price));
  if (isNaN(num)) return String(price);
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(num);
}

function QuoteCard({
  quote,
  onEdit,
}: {
  quote: Quote;
  onEdit: (quote: Quote) => void;
}) {
  const jobTitle = quote.job?.title || quote.jobTitle || "Job";

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5 hover:shadow-md hover:border-[#C8D9A8] transition-all duration-200">
      {/* Top section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-[#1C2C1C] truncate mb-1">
            {jobTitle}
          </p>
          {quote.message && (
            <p className="text-[13px] text-gray-500 line-clamp-2 mb-2 font-normal">
              {quote.message}
            </p>
          )}

          {/* Availability & Days info */}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {quote.availability && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F4F6F8] text-[#1C2C1C]">
                <Calendar size={12} className="text-[#6E9625]" />
                <span className="text-gray-500 font-normal">Availability:</span>
                {quote.availability}
              </span>
            )}
            {quote.estimatedDays && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F4F6F8] text-[#1C2C1C]">
                <Clock size={12} className="text-gray-400" />
                {quote.estimatedDays} {quote.estimatedDays === 1 ? "day" : "days"}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p className="text-[18px] font-black text-[#1C2C1C]">
            {formatPrice(quote.price)}
          </p>

          <QuoteStatusBadge status={quote.status ?? "PENDING"} />
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        {/* Date */}
        <span className="text-[11px] text-gray-400">
          {formatDate(quote.createdAt)}
        </span>

        {/* Edit + View Quote */}
        <div className="flex items-center gap-3">
          {/* Edit Quote */}
          <button
            onClick={() => onEdit(quote)}
            title="Edit Quote"
            aria-label="Edit Quote"
            className="flex items-center justify-center w-7 h-7 flex-shrink-0 rounded-md bg-[#F1F5E9] text-[#6E9625] hover:bg-[#E4ECD5] hover:text-[#4A6B0A] transition-colors cursor-pointer"
          >
            <Pencil size={14} strokeWidth={2.2} className="block" />
          </button>

          {/* View Quote */}
          <Link
            href={`/trader/quotes/${quote.id}`}
            className="flex items-center gap-1 text-[12px] font-semibold text-[#6E9625] hover:text-[#4A6B0A] whitespace-nowrap"
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
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("All");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editEstimatedDays, setEditEstimatedDays] = useState("");
  const [editAvailability, setEditAvailability] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleEditClick = (quote: Quote) => {
    setEditingQuote(quote);
    setEditPrice(quote.price ? String(quote.price) : "");
    setEditEstimatedDays(quote.estimatedDays ? String(quote.estimatedDays) : "");
    setEditAvailability(quote.availability || "");
    setEditMessage(quote.message || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        price: parseFloat(editPrice),
        estimatedDays: editEstimatedDays ? parseInt(editEstimatedDays, 10) : undefined,
        availability: editAvailability.trim(),
        message: editMessage.trim(),
      };

      try {
        await authApi.updateQuote(editingQuote.id, payload);
      } catch (patchErr: any) {
        if (patchErr?.response?.data?.message?.toString()?.toLowerCase()?.includes("availability") || patchErr?.response?.status === 400) {
          delete payload.availability;
          await authApi.updateQuote(editingQuote.id, payload);
        } else {
          throw patchErr;
        }
      }

      toast.success("Quote updated successfully!");

      setQuotes((prev) =>
        prev.map((q) =>
          q.id === editingQuote.id
            ? {
              ...q,
              price: parseFloat(editPrice),
              estimatedDays: editEstimatedDays ? parseInt(editEstimatedDays, 10) : q.estimatedDays,
              availability: editAvailability.trim(),
              message: editMessage.trim(),
            }
            : q
        )
      );

      setIsEditModalOpen(false);
      setEditingQuote(null);
    } catch (err: any) {
      console.error("Failed to update quote", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to update quote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuotes = useMemo(() => {
    if (availabilityFilter === "All") return quotes;
    return quotes.filter((q) => {
      const val = (q.availability || "").toLowerCase();
      const target = availabilityFilter.toLowerCase();
      return val === target || val.includes(target);
    });
  }, [quotes, availabilityFilter]);

  return (
    <div className="min-h-screen bg-[#F8F9F5]">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-[2rem] font-bold text-[#1C2C1C]">My Quotes</h1>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Availability Dropdown Option */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-xs">
              <label htmlFor="availability-select" className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                Availability:
              </label>
              <div className="relative">
                <select
                  id="availability-select"
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="appearance-none bg-transparent pl-1 pr-6 py-0.5 text-[13px] font-bold text-[#1C2C1C] focus:outline-none cursor-pointer"
                >
                  <option value="All">All Availabilities</option>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={fetchQuotes}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-[13px] font-semibold text-[#1C2C1C] hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
            <XCircle size={40} className="mx-auto text-red-400 mb-3" />
            <p className="text-[14px] font-semibold text-red-600">{error}</p>
            <button
              onClick={fetchQuotes}
              className="mt-4 px-5 py-2 rounded-full bg-[#1C2C1C] text-white text-[13px] font-bold hover:bg-[#2c3e2c] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-16 text-center">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-[15px] font-semibold text-gray-400">No quotes found.</p>
            <p className="text-[12px] text-gray-400 mt-1">
              {availabilityFilter === "All"
                ? "When traders receive quotes on your jobs they will appear here."
                : `No quotes found with availability "${availabilityFilter}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((q) => (
              <QuoteCard key={q.id} quote={q} onEdit={handleEditClick} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Quote Modal with Availability Dropdown */}
      {isEditModalOpen && editingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => !isSubmitting && setIsEditModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[18px] font-bold text-[#1C2C1C]">Edit Quote</h2>
                <p className="text-[12px] text-gray-400 mt-0.5 truncate max-w-[280px]">
                  {editingQuote.job?.title || editingQuote.jobTitle || "Job Quote"}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateQuote} className="flex flex-col gap-4">
              {/* Price */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Price (£)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[14px] font-medium">£</span>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    required
                    placeholder="e.g. 500"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#C8D9A8] focus:ring-2 focus:ring-[#C8D9A8]/20 transition-all"
                  />
                </div>
              </div>

              {/* Estimated Days */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Estimated Days
                </label>
                <div className="relative">
                  <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    step="1"
                    min={1}
                    required
                    placeholder="e.g. 3"
                    value={editEstimatedDays}
                    onChange={(e) => setEditEstimatedDays(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#C8D9A8] focus:ring-2 focus:ring-[#C8D9A8]/20 transition-all"
                  />
                </div>
              </div>

              {/* Availability Dropdown Option */}
              <div>
                <label htmlFor="modal-availability-select" className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Availability
                </label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    id="modal-availability-select"
                    required
                    value={editAvailability}
                    onChange={(e) => setEditAvailability(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] bg-white focus:outline-none focus:border-[#C8D9A8] focus:ring-2 focus:ring-[#C8D9A8]/20 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Select availability</option>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide details about your quote..."
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#C8D9A8] focus:ring-2 focus:ring-[#C8D9A8]/20 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-[13px] font-bold bg-[#1C2C1C] hover:bg-[#2c3e2c] text-white flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
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
