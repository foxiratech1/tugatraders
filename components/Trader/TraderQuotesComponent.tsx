"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authApi } from "@/app/api/authApi";
import {
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  SquarePen,
  X,
  Trash2,
  Paperclip,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * Quote type mirrors the shape returned by GET /api/quotes/my-quotes
 */
interface Quote {
  id: string;
  status: string;
  price?: number;
  createdAt: string;
  updatedAt?: string;
  job?: {
    id: string;
    title: string;
    postcode?: string;
  };
  // fallback flat fields for older API shapes
  jobId?: string;
  jobTitle?: string;
  jobPostcode?: string;
  // added properties
  estimatedDays?: number;
  message?: string;
  attachments?: string[];
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

function QuoteCard({ quote, onEdit }: { quote: Quote; onEdit: (quote: Quote) => void }) {
  const jobTitle = quote.job?.title || quote.jobTitle || "Job";
  const jobPostcode = quote.job?.postcode || quote.jobPostcode || "";
  const jobId = quote.job?.id || quote.jobId || "";

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5 hover:shadow-md hover:border-[#C8D9A8] transition-all duration-200 group cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        {/* Left – Job info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-[#1C2C1C] truncate">{jobTitle}</p>
          {jobPostcode && (
            <p className="text-[12px] text-gray-500 mt-1 flex items-center gap-1">
              <FileText size={12} /> {jobPostcode}
            </p>
          )}
        </div>
        {/* Right – Price & status */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p className="text-[18px] font-black text-[#1C2C1C]">{formatPrice(quote.price)}</p>
          <QuoteStatusBadge status={quote.status ?? "PENDING"} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 text-[11px] text-gray-500">
        {/* Date */}
        <span>{formatDate(quote.createdAt)}</span>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Edit Quote - only show for pending quotes */}
          {quote.status?.toUpperCase() === "PENDING" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(quote);
              }}
              title="Edit Quote"
              aria-label="Edit Quote"
              className="inline-flex items-center justify-center text-[#6E9625] hover:text-[#4A6B0A] transition-colors"
            >
              <SquarePen size={15} strokeWidth={2} />
            </button>
          )}

          {/* View Quote */}
          <Link
            href={`/trader/quotes/${jobId}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[#6E9625] hover:text-[#4A6B0A] transition-colors"
          >
            View Quote
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TraderQuotesComponent() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit quote states
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [price, setPrice] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [message, setMessage] = useState("");
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const fetchQuotes = async (page = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const res = await authApi.getMyQuotes(page, ITEMS_PER_PAGE);

      console.log("TraderQuotesComponent response", res);

      const possible = res?.data ?? res;

      const arr: Quote[] = Array.isArray(possible)
        ? possible
        : Array.isArray(possible?.quotes)
          ? possible.quotes
          : [];

      setQuotes(arr);

      // Pagination metadata
      const meta = res?.meta ?? possible?.meta;

      if (meta) {
        setCurrentPage(meta.page ?? page);
        setTotalPages(meta.totalPages ?? 1);
        setTotalQuotes(meta.total ?? 0);
      } else {
        // fallback if API doesn't return meta
        setTotalPages(1);
        setTotalQuotes(arr.length);
      }
    } catch (e) {
      console.error("Failed to fetch trader quotes", e);
      setError("Failed to load quotes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (quote: Quote) => {
    setEditingQuote(quote);
    setIsEditModalOpen(true);
    setModalLoading(true);
    setPrice(quote.price ? String(quote.price) : "");
    setEstimatedDays(quote.estimatedDays ? String(quote.estimatedDays) : "");
    setMessage(quote.message || "");
    setExistingAttachments(Array.isArray(quote.attachments) ? quote.attachments : []);
    setNewAttachments([]);

    try {
      const jobId = quote.job?.id || quote.jobId || "";
      if (jobId) {
        const detail = await authApi.getMyQuoteByJobId(jobId);
        const data = detail?.data ?? detail;
        if (data) {
          setPrice(data.price ? String(data.price) : (quote.price ? String(quote.price) : ""));
          setEstimatedDays(data.estimatedDays ? String(data.estimatedDays) : "");
          setMessage(data.message || "");
          setExistingAttachments(Array.isArray(data.attachments) ? data.attachments : []);
        }
      } else {
        console.warn("No jobId found on quote. Fallback to list details.");
      }
    } catch (err) {
      console.error("Failed to load quote details", err);
      if (!quote.estimatedDays) {
        toast.error("Failed to load detailed quote information");
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setNewAttachments((prev) => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  const handleRemoveExistingAttachment = (indexToRemove: number) => {
    setExistingAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveNewAttachment = (indexToRemove: number) => {
    setNewAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const parsedDays = parseFloat(estimatedDays);
    if (isNaN(parsedDays) || parsedDays <= 0) {
      toast.error("Please enter a valid estimated days");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("price", String(parsedPrice));
      formData.append("estimatedDays", String(parsedDays));
      formData.append("message", message.trim());

      existingAttachments.forEach((url) => {
        formData.append("attachments", url);
      });

      newAttachments.forEach((file) => {
        formData.append("attachments", file);
      });

      await authApi.updateQuote(editingQuote.id, formData);
      toast.success("Quote updated successfully!");

      setQuotes((prevQuotes) =>
        prevQuotes.map((q) =>
          q.id === editingQuote.id
            ? { ...q, price: parsedPrice, updatedAt: new Date().toISOString() }
            : q
        )
      );

      setIsEditModalOpen(false);
      setEditingQuote(null);
    } catch (err: any) {
      console.error("Failed to update quote", err);
      toast.error(err?.message || "Failed to update quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchQuotes(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);
    fetchQuotes(page);
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5]">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[2rem] font-bold text-[#1C2C1C]">My Quotes</h1>
          <button
            onClick={() => fetchQuotes(currentPage)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-[13px] font-semibold text-[#1C2C1C] hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
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
            <button onClick={() => fetchQuotes(currentPage)} className="mt-4 px-5 py-2 rounded-full bg-[#1C2C1C] text-white text-[13px] font-bold hover:bg-[#2c3e2c] transition-colors">
              Try Again
            </button>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-16 text-center">
            <FileText size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-[15px] font-semibold text-gray-400">No quotes yet.</p>
            <p className="text-[12px] text-gray-400 mt-1">When traders receive quotes on your jobs they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map(q => (
              <QuoteCard key={q.id} quote={q} onEdit={handleEditClick} />
            ))}
          </div>
        )}
      </div>

      {!loading && quotes.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <p className="text-[12px] text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, totalQuotes)} of {totalQuotes} quotes
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-lg text-[13px] font-semibold transition-colors ${currentPage === page
                    ? "bg-[#1C2C1C] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Edit Quote Modal ──────────────────────────────────────── */}
      {isEditModalOpen && editingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => !isSubmitting && setIsEditModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
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
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            {modalLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 size={32} className="animate-spin text-[#6E9625]" />
                <p className="text-[13px] text-gray-500 font-medium">Loading quote details...</p>
              </div>
            ) : (
              <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
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
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
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
                      step="0.5"
                      min={0.5}
                      required
                      placeholder="e.g. 3"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#C8D9A8] focus:ring-2 focus:ring-[#C8D9A8]/20 transition-all"
                    />
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
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#C8D9A8] focus:ring-2 focus:ring-[#C8D9A8]/20 transition-all resize-none"
                  />
                </div>

                {/* Existing Attachments */}
                {existingAttachments.length > 0 && (
                  <div>
                    <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                      Current Attachments
                    </label>
                    <div className="flex flex-col gap-1.5 max-h-[100px] overflow-y-auto">
                      {existingAttachments.map((url, idx) => {
                        const fileName = url.substring(url.lastIndexOf("/") + 1) || `attachment-${idx + 1}`;
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-[#F9FAFB] rounded-lg px-3 py-1.5 border border-gray-100"
                          >
                            <FileText size={14} className="text-gray-400 flex-shrink-0" />
                            <span className="text-[12px] text-[#1C2C1C] truncate flex-1">
                              {fileName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingAttachment(idx)}
                              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add Attachments */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                    Add New Attachments <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="edit-quote-file-input"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleAttachmentSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("edit-quote-file-input")?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 text-[13px] text-gray-500 hover:border-[#C8D9A8] hover:text-[#6E9625] transition-colors"
                  >
                    <Paperclip size={15} />
                    Add Files
                  </button>

                  {/* New File Previews */}
                  {newAttachments.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5 max-h-[100px] overflow-y-auto">
                      {newAttachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-[#F9FAFB] rounded-lg px-3 py-1.5 border border-gray-100"
                        >
                          <FileText size={14} className="text-gray-400 flex-shrink-0" />
                          <span className="text-[12px] text-[#1C2C1C] truncate flex-1">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {(file.size / 1024).toFixed(0)} KB
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewAttachment(idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 h-[46px] rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-[46px] rounded-xl bg-[#1C2C1C] hover:bg-[#2A412A] text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
