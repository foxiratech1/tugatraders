"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/app/api/authApi";
import { useSocket } from "@/hooks/useSocket";
import {
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Bookmark,
  FileText,
  Clock,
  Zap,
  Users,
  Edit2,
  Download,
  Briefcase,
  ArrowRight,
  Star,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Eye,
  DollarSign,
  Euro,
  Tag,
  MessageSquare,
  MoreVertical,
  PlusCircle,
  Paperclip,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ShareReviewModal from "@/components/modal/ShareReviewModal";

// ─── Types ────────────────────────────────────────────────────────────────────

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
    displayName?: string | null;
    companyName?: string | null;
  } | null;
  traderMetrics?: {
    averageRating: number;
    totalReviews: number;
  } | null;
}

interface Quote {
  id: string;
  jobId: string;
  traderId: string;
  price: string;
  estimatedDays: number;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  trader: SelectedTrader;
  attachments?: {
    id: string;
    url: string;
    file: string;
    filename: string;
    mimeType: string;
    size: number;
  }[];
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
  hasReviewed?: boolean;
  location?: string;
  quotes?: Quote[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const formatDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTimescale = (t: string) =>
  t?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—";

const formatBudget = (b: string) =>
  b?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—";

// Status badge config
const normalizeStatus = (status: string) =>
  (status || "").toUpperCase().trim().replace(/[-_ ]+/g, "_");

const isInProgressStatus = (norm: string) =>
  norm === "IN_PROGRESS" ||
  norm === "STARTED" ||
  norm === "INPROGRESS" ||
  norm.includes("PROGRESS");

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  OPEN: { label: "Job Posted", bg: "bg-[#F1AA69]", text: "text-[#9C410F]", dot: "bg-[#9C410F]" },
  POSTED: { label: "Job Posted", bg: "bg-[#F1AA69]", text: "text-[#9C410F]", dot: "bg-[#9C410F]" },
  QUOTE_RECEIVED: {
    label: "Quote Received",
    bg: "bg-[#DCEAF7]",
    text: "text-[#156082]",
    dot: "bg-[#156082]",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-[#EFDB4B]",
    text: "text-[#8A5C05]",
    dot: "bg-[#8A5C05]",
  },
  "IN PROGRESS": {
    label: "In Progress",
    bg: "bg-[#EFDB4B]",
    text: "text-[#8A5C05]",
    dot: "bg-[#8A5C05]",
  },
  "IN-PROGRESS": {
    label: "In Progress",
    bg: "bg-[#EFDB4B]",
    text: "text-[#8A5C05]",
    dot: "bg-[#8A5C05]",
  },
  INPROGRESS: {
    label: "In Progress",
    bg: "bg-[#EFDB4B]",
    text: "text-[#8A5C05]",
    dot: "bg-[#8A5C05]",
  },
  STARTED: {
    label: "In Progress",
    bg: "bg-[#EFDB4B]",
    text: "text-[#8A5C05]",
    dot: "bg-[#8A5C05]",
  },

  ASSIGNED: { label: "Contacted", bg: "bg-[#7DB0E3]", text: "text-[#103270]", dot: "bg-[#103270]" },
  CONTACTED: { label: "Contacted", bg: "bg-[#7DB0E3]", text: "text-[#103270]", dot: "bg-[#103270]" },
  QUOTE_ACCEPTED: { label: "Quote Accepted", bg: "bg-[#D9F2D0]", text: "text-[#1C6D26]", dot: "bg-[#1C6D26]" },
  QUOTE_DECLINED: { label: "Quote Declined", bg: "bg-[#FF9797]", text: "text-[#E53935]", dot: "bg-[#E53935]" },
  DECLINED: { label: "Quote Declined", bg: "bg-[#FF9797]", text: "text-[#E53935]", dot: "bg-[#E53935]" },
  COMPLETED: { label: "Completed", bg: "bg-[#13501B]", text: "text-white", dot: "bg-white" },
  CANCELLED: { label: "Closed", bg: "bg-[#A6A6A6]", text: "text-[#333333]", dot: "bg-[#333333]" },
  CLOSED: { label: "Closed", bg: "bg-[#A6A6A6]", text: "text-[#333333]", dot: "bg-[#333333]" },
  EXPIRED: { label: "Closed", bg: "bg-[#A6A6A6]", text: "text-[#333333]", dot: "bg-[#333333]" },
  ACTIVE: { label: "Job Posted", bg: "bg-[#F1AA69]", text: "text-[#9C410F]", dot: "bg-[#9C410F]" },
};

function SidebarStatusBadge({ status, job }: { status: string; job?: Job }) {
  const norm = normalizeStatus(status);
  if (norm === "COMPLETED") {
    return (
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#4E7B24]">
        <span className="w-2 h-2 rounded-full bg-[#4E7B24]" />
        Completed
      </div>
    );
  }
  if (norm === "CLOSED" || norm === "CANCELLED" || norm === "EXPIRED") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#E2E8F0] text-[#475569] text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
        Closed
      </div>
    );
  }
  if (isInProgressStatus(norm)) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#FFE699] text-[#C59B11] text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C59B11]" />
        In Progress
      </div>
    );
  }
  if (norm === "ASSIGNED" || norm === "CONTACTED" || norm === "ACCEPTED" || norm === "QUOTE_ACCEPTED") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#B6D5F4] text-[#1565C0] text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
        Contacted
      </div>
    );
  }
  const hasAcceptedQuote = job && Array.isArray(job.quotes) && job.quotes.some((q: any) => q.status?.toUpperCase() === "ACCEPTED");
  if (hasAcceptedQuote) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#B6D5F4] text-[#1565C0] text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
        Contacted
      </div>
    );
  }
  const quotes = job ? (job.quotesReceived ?? job.quotesCount ?? (job as any)._count?.quotes ?? (Array.isArray(job.quotes) ? job.quotes.length : 0)) : 0;
  if (
    norm === "QUOTE_RECEIVED" ||
    norm === "QUOTES_RECEIVED" ||
    norm === "QUOTED" ||
    norm === "QUOTE_SENT" ||
    ((norm === "OPEN" || norm === "POSTED" || norm === "ACTIVE") && quotes > 0)
  ) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#FFF8E1] text-[#F57C00] text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F57C00]" />
        Quote Received
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#FDE2D6] text-[#D32F2F] text-[11px] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F]" />
      Job Posted
    </div>
  );
}

function StatusBadge({ status, job, quotesCount }: { status: string; job?: Job; quotesCount?: number }) {
  const norm = normalizeStatus(status);
  if (norm === "COMPLETED") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-sm bg-[#D8F3D7] text-[#2E7D32] text-[11px] font-bold tracking-wide">
        COMPLETED
      </span>
    );
  }
  if (norm === "CLOSED" || norm === "CANCELLED" || norm === "EXPIRED") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-sm bg-[#E2E8F0] text-[#475569] text-[11px] font-bold tracking-wide">
        CLOSED
      </span>
    );
  }
  if (isInProgressStatus(norm)) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-sm bg-[#FFE699] text-[#C59B11] text-[11px] font-bold tracking-wide">
        IN PROGRESS
      </span>
    );
  }
  if (norm === "ASSIGNED" || norm === "CONTACTED" || norm === "ACCEPTED") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-sm bg-[#B6D5F4] text-[#1565C0] text-[11px] font-bold tracking-wide">
        CONTACTED
      </span>
    );
  }
  const hasAcceptedQuote = job && Array.isArray(job.quotes) && job.quotes.some((q: any) => q.status?.toUpperCase() === "ACCEPTED");
  if (hasAcceptedQuote) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-sm bg-[#B6D5F4] text-[#1565C0] text-[11px] font-bold tracking-wide">
        CONTACTED
      </span>
    );
  }
  const quotes = quotesCount ?? (job ? (job.quotesReceived ?? job.quotesCount ?? (job as any)._count?.quotes ?? (Array.isArray(job.quotes) ? job.quotes.length : 0)) : 0);
  if (
    norm === "QUOTE_RECEIVED" ||
    norm === "QUOTES_RECEIVED" ||
    norm === "QUOTED" ||
    norm === "QUOTE_SENT" ||
    ((norm === "OPEN" || norm === "POSTED" || norm === "ACTIVE") && quotes > 0)
  ) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-sm bg-[#FFF8E1] text-[#F57C00] text-[11px] font-bold tracking-wide">
        QUOTE RECEIVED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-sm bg-[#FDE2D6] text-[#D32F2F] text-[11px] font-bold tracking-wide">
      JOB POSTED
    </span>
  );
}

// Active badge – outline style used in the job detail header
function ActiveBadge({ status }: { status: string }) {
  const norm = normalizeStatus(status);
  if (isInProgressStatus(norm)) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] bg-[#FFE699] text-[#C59B11] text-[11px] font-bold tracking-wide">
        IN PROGRESS
      </span>
    );
  }
  if (norm === "ASSIGNED" || norm === "OPEN") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] border border-[#4CAF50] text-[11px] font-bold text-[#4CAF50] tracking-wide">
        {norm === "ASSIGNED" ? "CONTACTED" : "ACTIVE"}
      </span>
    );
  }
  const cfg = statusConfig[norm] ?? statusConfig[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
      {cfg.label.toUpperCase()}
    </span>
  );
}

// ─── Accordion Row ────────────────────────────────────────────────────────────

function AccordionRow({
  icon,
  label,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="flex items-center gap-3 text-[13px] font-semibold text-[#1C2C1C]">
          {icon}
          {label}
        </span>
        {open ? (
          <ChevronUp size={15} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

// ─── Quotes Modal ────────────────────────────────────────────────────────────

function QuotesModal({
  quotes,
  onClose,
  onAccept,
  onSendMessage,
  onDecline,
}: {
  quotes: Quote[];
  onClose: () => void;
  onAccept: (quoteId: string) => void;
  onSendMessage: (traderId: string) => void;
  onDecline: (quoteId: string) => void;
}) {
  const [accepting, setAccepting] = useState<string | null>(null);
  const [declining, setDeclining] = useState<string | null>(null);

  const handleAccept = async (quoteId: string) => {
    setAccepting(quoteId);
    try {
      await onAccept(quoteId);
    } finally {
      setAccepting(null);
    }
  };

  const handleDecline = async (quoteId: string) => {
    setDeclining(quoteId);
    try {
      await onDecline(quoteId);
    } finally {
      setDeclining(null);
    }
  };

  const formatPrice = (p: string) =>
    isNaN(Number(p)) ? p : `£${Number(p).toLocaleString()}`;

  const getQuoteAttachmentUrl = (url: string | undefined, file: string) => {
    if (url && !url.startsWith("undefined")) return url;
    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/+$/, "");
    const cleanPath = file.replace(/^\/+/, "");
    return `${base}/${cleanPath}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg mx-3 sm:mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[16px] sm:text-[17px] font-bold text-[#1C2C1C]">Trader Quotes</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{quotes.length} quote{quotes.length !== 1 ? 's' : ''} received</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        {/* Quote list */}
        <div className="overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {quotes.length === 0 ? (
            <p className="text-center text-[13px] text-gray-400 py-8">No quotes available.</p>
          ) : (
            (() => {
              const hasAnyAccepted = quotes.some((q) => q.status?.toUpperCase() === "ACCEPTED");
              return quotes.map((quote) => {
                const isThisAccepted = quote.status?.toUpperCase() === "ACCEPTED";
                const effectiveStatus = hasAnyAccepted && !isThisAccepted ? "REJECTED" : quote.status;

                return (
                  <div
                    key={quote.id}
                    className={`border border-gray-200 rounded-xl p-3.5 sm:p-4 transition-all ${effectiveStatus?.toUpperCase() === "REJECTED" || effectiveStatus?.toUpperCase() === "DECLINED"
                      ? "bg-gray-50"
                      : "bg-white hover:border-[#8BC34A]/60 hover:shadow-sm"
                      }`}
                  >
                    {/* Trader row */}
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 overflow-hidden">
                          {quote.trader?.profileImage ? (
                            <img src={getAttachmentUrl(quote.trader.profileImage)} alt={quote.trader.fullName} className="w-full h-full object-cover" />
                          ) : (
                            quote.trader?.fullName?.[0]?.toUpperCase() ?? "T"
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/customer-dashboard/trader-profile/${quote.trader?.id}`}>
                            <p className="text-[13px] font-bold text-[#1C2C1C] hover:underline cursor-pointer truncate">
                              {quote.trader?.traderProfile?.displayName || quote.trader?.traderProfile?.companyName || quote.trader?.fullName || "Unknown"}
                            </p>
                          </Link>
                        </div>
                      </div>

                      {/* Status badge */}
                      {isThisAccepted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100 flex-shrink-0">
                          <CheckCircle size={11} />
                          Accepted
                        </span>
                      ) : effectiveStatus?.toUpperCase() === "REJECTED" || effectiveStatus?.toUpperCase() === "DECLINED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold border border-red-100 flex-shrink-0">
                          <XCircle size={11} />
                          {hasAnyAccepted && !isThisAccepted ? "Rejected" : "Declined"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-100 flex-shrink-0">
                          {effectiveStatus?.toUpperCase() === "PENDING" ? "Pending" : effectiveStatus ?? "Pending"}
                        </span>
                      )}
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3">
                      <div className="flex items-center gap-2 bg-[#F8F9F5] rounded-lg p-2 sm:p-2.5">
                        <DollarSign size={14} className="text-[#6E9625] flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Price</p>
                          <p className="text-[12px] sm:text-[13px] font-bold text-[#1C2C1C]">{formatPrice(quote.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-[#F8F9F5] rounded-lg p-2 sm:p-2.5">
                        <Clock size={14} className="text-[#6E9625] flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Est. Days</p>
                          <p className="text-[12px] sm:text-[13px] font-bold text-[#1C2C1C]">{quote.estimatedDays} day{quote.estimatedDays !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-2.5 sm:p-3 mb-3">
                      <MessageSquare size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-[12px] text-gray-600 leading-relaxed">{quote.message}</p>
                    </div>

                    {/* Attachments */}
                    {quote.attachments && quote.attachments.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[11px] font-semibold text-gray-500 mb-2 flex items-center gap-1">
                          <Paperclip size={12} />
                          Attachments
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {quote.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={getQuoteAttachmentUrl(att.url, att.file)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-[#8BC34A] transition-colors max-w-full"
                              title={att.filename}
                            >
                              {att.mimeType?.startsWith("image/") ? (
                                <ImageIcon size={13} className="text-[#6E9625] flex-shrink-0" />
                              ) : (
                                <FileText size={13} className="text-gray-400 flex-shrink-0" />
                              )}
                              <span className="text-[11px] text-[#1C2C1C] truncate max-w-[120px]">
                                {att.filename}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-[10px] text-gray-400 mb-3">Received: {formatDate(quote.createdAt)}</p>

                    {/* Actions */}
                    {isThisAccepted ? (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <CheckCircle size={12} />
                        Quote Accepted
                      </div>
                    ) : effectiveStatus?.toUpperCase() === "REJECTED" || effectiveStatus?.toUpperCase() === "DECLINED" ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF3B30] bg-[#FF3B30]/5 px-3 py-1 rounded-full border border-[#FF3B30]/30 w-fit">
                          <Ban size={12} className="text-[#FF3B30]" />
                          {hasAnyAccepted && !isThisAccepted ? "Quote Rejected" : "Quote Declined"}
                        </div>
                        <button
                          onClick={() => onSendMessage(quote.trader?.id)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 border border-[#1565C0] cursor-pointer text-[#1565C0] hover:bg-blue-50 rounded-lg text-[12px] font-semibold transition-colors"
                        >
                          <MessageSquare size={13} />
                          Send Message
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-stretch sm:items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleAccept(quote.id)}
                          disabled={accepting === quote.id || declining === quote.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-[12px] font-bold transition-colors disabled:opacity-50 min-w-[100px]"
                        >
                          <CheckCircle size={13} />
                          {accepting === quote.id ? "Accepting..." : "Accept Quote"}
                        </button>
                        <button
                          onClick={() => onSendMessage(quote.trader?.id)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 border border-[#1565C0] cursor-pointer text-[#1565C0] hover:bg-blue-50 rounded-lg text-[12px] font-semibold transition-colors"
                        >
                          <MessageSquare size={13} />
                          Send Message
                        </button>
                        <button
                          onClick={() => handleDecline(quote.id)}
                          disabled={accepting === quote.id || declining === quote.id}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 border border-red-300 cursor-pointer text-red-600 hover:bg-red-50 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50"
                        >
                          <X size={13} />
                          {declining === quote.id ? "Declining..." : "Decline"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              });
            })()
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Trader Quote Card ────────────────────────────────────────────────────────

function TraderQuoteCard({
  trader,
  isAssigned,
  quoteId,
  onAccept,
  quoteStatus,
  jobStatus,
  onStartJob,
  onCompleteJob,
  onCancelJob,
  onOpenChat,
  hasReviewed,
  onLeaveReview,
  quote,
  onDecline,
  hasAnyAcceptedQuote,
}: {
  trader: SelectedTrader;
  isAssigned: boolean;
  quoteId?: string;
  onAccept?: (quoteId: string) => void;
  quoteStatus?: string;
  jobStatus?: string;
  onStartJob?: () => void;
  onCompleteJob?: () => void;
  onCancelJob?: () => void;
  onOpenChat?: (traderId: string) => void;
  hasReviewed?: boolean;
  onLeaveReview?: () => void;
  quote?: Quote;
  onDecline?: (quoteId: string) => void;
  hasAnyAcceptedQuote?: boolean;
}) {
  const [accepting, setAccepting] = useState<boolean>(false);
  const [declining, setDeclining] = useState<boolean>(false);
  const [openingChat, setOpeningChat] = useState<boolean>(false);

  const isAcceptedQuote = quoteStatus?.toUpperCase() === "ACCEPTED";
  const effectiveQuoteStatus = hasAnyAcceptedQuote && !isAcceptedQuote ? "REJECTED" : quoteStatus;

  const targetTraderId =
    (trader && trader !== (quote as any) && trader.id ? trader.id : "") ||
    quote?.traderId ||
    quote?.trader?.id ||
    (quote?.trader as any)?.traderId ||
    trader?.id ||
    (trader as any)?.traderId ||
    (trader as any)?.userId ||
    "";

  const formatPrice = (p?: string) =>
    p ? (isNaN(Number(p)) ? p : `£${Number(p).toLocaleString()}`) : "—";

  return (
    <div className={`border border-gray-200 rounded-xl p-3.5 sm:p-4 mb-3 last:mb-0 transition-all ${effectiveQuoteStatus?.toUpperCase() === "REJECTED" || effectiveQuoteStatus?.toUpperCase() === "DECLINED"
      ? "bg-gray-50"
      : "bg-white hover:border-[#8BC34A]/60 hover:shadow-sm"
      }`}>
      {/* Header Row */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#7CB342] flex items-center justify-center text-white text-[15px] sm:text-[16px] font-bold flex-shrink-0 mt-0.5 overflow-hidden">
            {trader?.profileImage ? (
              <img src={getAttachmentUrl(trader.profileImage)} alt={trader.fullName} className="w-full h-full object-cover" />
            ) : (
              trader?.fullName?.[0]?.toUpperCase() ?? "T"
            )}
          </div>
          <div className="min-w-0">
            <Link href={`/customer-dashboard/trader-profile/${trader.id}`}>
              <p className="text-[13px] sm:text-[14px] font-bold text-[#1C2C1C] hover:underline cursor-pointer truncate">
                {trader.traderProfile?.displayName || trader.traderProfile?.companyName || trader.fullName || 'Unknown Trader'}
              </p>
            </Link>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <div className="flex text-[#FFB300]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i <= Math.round(trader.traderMetrics?.averageRating || 0) ? "fill-current" : "text-gray-200"}
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-gray-700">{(trader.traderMetrics?.averageRating || 0).toFixed(1)}</span>
              <span className="text-[11px] text-gray-400">({trader.traderMetrics?.totalReviews || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Top Right Action */}
        {quoteStatus?.toUpperCase() === "ACCEPTED" ? (
          !hasReviewed && (
            <button
              onClick={() => onLeaveReview && onLeaveReview()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6E9625] text-white text-[11px] font-bold hover:bg-[#58791C] transition-colors flex-shrink-0"
            >
              <Star size={12} className="fill-current" />
              Leave a review
            </button>
          )
        ) : null}
      </div>

      {/* Quote Details (Only show if a quote is provided) */}
      {quote && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr] gap-2.5 sm:gap-3 mb-4">
            <div className="flex flex-col gap-1 bg-[#F9F9F9] rounded-xl p-2.5 sm:p-3 border border-gray-100/50">
              <div className="flex items-center gap-1.5 text-gray-400">
                <DollarSign size={13} className="text-[#4CAF50]" />
                <span className="text-[11px] font-semibold">Price</span>
              </div>
              <span className="text-[13px] sm:text-[14px] font-bold text-[#1C2C1C] pl-5">{formatPrice(quote.price)}</span>
            </div>

            <div className="flex flex-col gap-1 bg-[#F9F9F9] rounded-xl p-2.5 sm:p-3 border border-gray-100/50">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock size={13} className="text-[#8BC34A]" />
                <span className="text-[11px] font-semibold">Est. Days</span>
              </div>
              <span className="text-[13px] sm:text-[14px] font-bold text-[#1C2C1C] pl-5">{quote.estimatedDays} day{quote.estimatedDays !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex flex-col gap-1 bg-[#F9F9F9] rounded-xl p-2.5 sm:p-3 border border-gray-100/50">
              <div className="flex items-center gap-1.5 text-gray-400">
                <MessageSquare size={13} className="text-gray-400" />
                <span className="text-[11px] font-semibold">Message</span>
              </div>
              <span className="text-[12px] font-medium text-[#1C2C1C] pl-5 break-words line-clamp-3">{quote.message}</span>
            </div>
          </div>

          {/* Attachments */}
          {quote.attachments && quote.attachments.length > 0 && (
            <div className="mb-4">
              <p className="text-[12px] sm:text-[13px] font-semibold text-[#888888] mb-2 flex items-center gap-1.5">
                <Paperclip size={13} className="text-[#999999]" />
                Attachments
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {quote.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={getAttachmentUrl(att.url || att.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 hover:border-[#8BC34A] transition-colors shadow-xs max-w-full"
                    title={att.filename}
                  >
                    {att.mimeType?.startsWith("image/") ? (
                      <ImageIcon size={14} className="text-[#6E9625] flex-shrink-0" />
                    ) : (
                      <FileText size={14} className="text-gray-400 flex-shrink-0" />
                    )}
                    <span className="text-[12px] text-[#444444] font-medium truncate max-w-[140px]">
                      {att.filename}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {quote ? (
            <p className="text-[11px] text-gray-400 font-medium">Received: {formatDate(quote.createdAt)}</p>
          ) : (
            <p className="text-[11px] text-gray-400 font-medium">Trader details</p>
          )}

          {/* Badges */}
          {effectiveQuoteStatus?.toUpperCase() === "ACCEPTED" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[11px] font-bold border border-[#C8E6C9]">
              <CheckCircle size={11} />
              Quote Accepted
            </span>
          ) : effectiveQuoteStatus?.toUpperCase() === "REJECTED" || effectiveQuoteStatus?.toUpperCase() === "DECLINED" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF3B30]/5 text-[#FF3B30] text-[11px] font-bold border border-[#FF3B30]/30">
              <Ban size={11} className="text-[#FF3B30]" />
              {hasAnyAcceptedQuote && !isAcceptedQuote ? "Quote Rejected" : "Quote Declined"}
            </span>
          ) : effectiveQuoteStatus ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF8E1] text-[#F57C00] text-[11px] font-bold border border-[#FFECB3]">
              {effectiveQuoteStatus?.toUpperCase() === "PENDING" ? "Quote Received" : effectiveQuoteStatus ?? "Quote Received"}
            </span>
          ) : null}
        </div>

        <div className="flex items-stretch sm:items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          {quote && effectiveQuoteStatus?.toUpperCase() === "PENDING" && !hasAnyAcceptedQuote && quoteId && onAccept && onDecline && !["CLOSED", "COMPLETED", "CANCELLED", "EXPIRED", "IN_PROGRESS", "ASSIGNED"].includes(jobStatus?.toUpperCase() || "") ? (
            <>
              <button
                onClick={async () => {
                  setAccepting(true);
                  try {
                    await onAccept(quoteId);
                  } finally {
                    setAccepting(false);
                  }
                }}
                disabled={accepting || declining}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-1.5 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-[12px] font-bold transition-colors disabled:opacity-50 min-w-[100px]"
              >
                <CheckCircle size={13} />
                {accepting ? "Accepting..." : "Accept Quote"}
              </button>
              <button
                onClick={async () => {
                  if (!onOpenChat) return;
                  setOpeningChat(true);
                  try {
                    await onOpenChat(targetTraderId);
                  } finally {
                    setOpeningChat(false);
                  }
                }}
                disabled={openingChat}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-1.5 border border-[#1565C0] cursor-pointer text-[#1565C0] hover:bg-blue-50 rounded-lg text-[12px] font-semibold transition-colors bg-white disabled:opacity-60"
              >
                <MessageSquare size={13} />
                {openingChat ? "Opening..." : "Send Message"}
              </button>
              <button
                onClick={async () => {
                  setDeclining(true);
                  try {
                    await onDecline(quoteId);
                  } finally {
                    setDeclining(false);
                  }
                }}
                disabled={accepting || declining}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-1.5 border border-red-300 cursor-pointer text-red-600 hover:bg-red-50 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50"
              >
                <X size={13} />
                {declining ? "Declining..." : "Decline"}
              </button>
            </>
          ) : (
            <button
              onClick={async () => {
                if (!onOpenChat) return;
                setOpeningChat(true);
                try {
                  await onOpenChat(targetTraderId);
                } finally {
                  setOpeningChat(false);
                }
              }}
              disabled={openingChat}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-1.5 border border-[#1565C0] cursor-pointer text-[#1565C0] hover:bg-blue-50 rounded-lg text-[12px] font-semibold transition-colors bg-white disabled:opacity-60"
            >
              <MessageSquare size={13} />
              {openingChat ? "Opening..." : "Send Message"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerJobDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [savedTraders, setSavedTraders] = useState<any[]>([]);
  const [savedTradersLoading, setSavedTradersLoading] = useState(true);
  const [quotesModalOpen, setQuotesModalOpen] = useState(false);
  const [jobMenuOpen, setJobMenuOpen] = useState(false);
  const [isCloseJobModalOpen, setIsCloseJobModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"detail" | "history">("detail");
  const [savingJobIds, setSavingJobIds] = useState<Set<string>>(new Set());
  const [jobReviews, setJobReviews] = useState<Record<string, any>>({});
  const [reviewedJobIds, setReviewedJobIds] = useState<Set<string>>(new Set());
  const [dashboardDetails, setDashboardDetails] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [customerName, setCustomerName] = useState<string>("Hannah");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.fullName) {
          setCustomerName(u.fullName.split(" ")[0]);
        } else if (u?.name) {
          setCustomerName(u.name.split(" ")[0]);
        }
      }
    } catch (e) { }

    authApi.getMyProfile().then((res: any) => {
      const profile = res?.data || res;
      if (profile?.fullName) {
        setCustomerName(profile.fullName.split(" ")[0]);
      } else if (profile?.name) {
        setCustomerName(profile.name.split(" ")[0]);
      }
    }).catch(() => { });
  }, []);

  // Share Your Review popup states
  const [shareReviewModalJob, setShareReviewModalJob] = useState<Job | null>(null);
  const [shareReviewTrader, setShareReviewTrader] = useState<SelectedTrader | null>(null);
  const [isShareReviewModalOpen, setIsShareReviewModalOpen] = useState(false);

  const JOBS_PER_PAGE = 5;

  useSocket({
    onJobUpdated: (payload) => {
      const updatedJob = payload?.job || payload?.data || payload;
      if (!updatedJob || !updatedJob.id) return;
      setJobs((prev) =>
        prev.map((j) => (j.id === updatedJob.id ? { ...j, ...updatedJob } : j))
      );
      setSelectedJob((prev) => {
        if (prev && prev.id === updatedJob.id) {
          return { ...prev, ...updatedJob };
        }
        return prev;
      });
    },
    onNewQuote: (quote) => {
      if (!quote) return;
      const quoteJobId = quote.jobId || quote.job?.id;
      if (quoteJobId) {
        setJobs((prev) =>
          prev.map((j) => {
            if (j.id === quoteJobId) {
              const currentReceived = j.quotesReceived || j.quotesCount || (j.quotes?.length ?? 0) || 0;
              return {
                ...j,
                quotesReceived: currentReceived + 1,
                quotesCount: currentReceived + 1,
                quotes: j.quotes ? [quote, ...j.quotes] : [quote],
              };
            }
            return j;
          })
        );
        setSelectedJob((prev) => {
          if (prev && prev.id === quoteJobId) {
            const currentReceived = prev.quotesReceived || prev.quotesCount || (prev.quotes?.length ?? 0) || 0;
            return {
              ...prev,
              quotesReceived: currentReceived + 1,
              quotesCount: currentReceived + 1,
              quotes: prev.quotes ? [quote, ...prev.quotes] : [quote],
            };
          }
          return prev;
        });
      }
      if (selectedJob && (quoteJobId === selectedJob.id || quote.id)) {
        setQuotes((prev) => {
          if (prev.some((q) => q.id === quote.id)) return prev;
          return [quote, ...prev];
        });
      }
    },
    onCustomerDashboardUpdate: (data) => {
      if (data) {
        setDashboardDetails(data);
      }
    },
  });

  const handleDismissReviewModal = (jobId?: string) => {
    setIsShareReviewModalOpen(false);
    const targetId = jobId || shareReviewModalJob?.id;
    if (targetId) {
      try {
        sessionStorage.setItem(`dismissedReviewPopup_${targetId}`, "true");
      } catch (e) {
        console.error("Failed to store dismissed review popup in sessionStorage", e);
      }
    }
  };

  const handleNavigateToReview = (job?: Job | null, trader?: SelectedTrader | null) => {
    const targetJob = job || shareReviewModalJob || selectedJob;
    if (!targetJob) return;
    const targetTraderId =
      trader?.id ||
      targetJob.selectedTrader?.id ||
      (quotes.length > 0 && quotes[0].trader?.id) ||
      "";
    setIsShareReviewModalOpen(false);
    const hideWork = targetJob.status === "CANCELLED" || targetJob.status === "CLOSED" ? "&hideWorkCarriedOut=false" : "&workCarriedOut=true";
    router.push(
      `/customer-dashboard/leave-review?jobId=${targetJob.id}${targetTraderId ? `&traderId=${targetTraderId}` : ""
      }&reviewType=JOB${hideWork}`
    );
  };

  const handleActionRequiredLeaveReview = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await authApi.getUnreviewedCompletedJobs();
    } catch (err) {
      console.error("Failed to fetch unreviewed completed jobs:", err);
    } finally {
      router.push('/customer-dashboard/reviews?tab=pending');
    }
  };

  const handleOpenChat = async (traderId: string, jobId?: string) => {
    try {
      if (!traderId) {
        toast.error("Trader information not found");
        return;
      }
      const res = await authApi.getOrCreateConversation(traderId, jobId);
      const conversation = res?.data || res;
      const convId = conversation?.id || conversation?._id;
      if (convId) {
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("activeConversation", JSON.stringify({ ...conversation, id: convId }));
          } catch (e) { }
        }
        let url = `/customer-dashboard/inbox?conversationId=${convId}&traderId=${traderId}`;
        if (jobId) url += `&jobId=${jobId}`;
        router.push(url);
      } else {
        toast.error("Failed to start conversation");
      }
    } catch (error: any) {
      console.error("Failed to open chat:", error);
      toast.error(error?.message || "Failed to open conversation");
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await authApi.acceptQuote(quoteId);

      // If customer accepts only one quote, reject all other remaining pending quotes
      if (selectedJob && quotes.length > 0) {
        const otherPendingQuotes = quotes.filter(
          (q: any) => q.id !== quoteId && q.status?.toUpperCase() === "PENDING"
        );
        if (otherPendingQuotes.length > 0) {
          await Promise.allSettled(
            otherPendingQuotes.map((q: any) => authApi.rejectQuote(q.id))
          );
        }
      }

      // Removed automatic startJob: The job should now be manually started by the trader.
      if (selectedJob) {
        toast.success("Quote accepted!");
        // Refresh quotes
        const res = await authApi.getJobQuotes(selectedJob.id);
        const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setQuotes(arr);
        // Refresh jobs to reflect IN_PROGRESS status
        const jobsRes = await authApi.getMyJobs();
        const jobsArr = Array.isArray(jobsRes) ? jobsRes : Array.isArray(jobsRes?.data) ? jobsRes.data : [];
        setJobs(jobsArr);
        const updatedJob = jobsArr.find((j: Job) => j.id === selectedJob.id);
        if (updatedJob) setSelectedJob(updatedJob);
      } else {
        toast.success("Quote accepted successfully!");
      }
    } catch (error: any) {
      console.error("Failed to accept quote", error);
      toast.error(error?.response?.data?.message || "Failed to accept quote");
    }
  };

  const handleDeclineQuote = async (quoteId: string) => {
    try {
      await authApi.rejectQuote(quoteId);
      toast.success("Quote declined successfully!");
      if (selectedJob) {
        // Refresh quotes
        const res = await authApi.getJobQuotes(selectedJob.id);
        const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setQuotes(arr);
      }
    } catch (error: any) {
      console.error("Failed to decline quote", error);
      toast.error(error?.response?.data?.message || "Failed to decline quote");
    }
  };

  const handleCompleteJob = async () => {
    if (!selectedJob) return;
    try {
      await authApi.completeJob(selectedJob.id);
      toast.success("Job completed successfully!");
      const res = await authApi.getMyJobs(currentPage, JOBS_PER_PAGE);
      const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setJobs(arr);
      const updatedJob = arr.find((j: Job) => j.id === selectedJob.id) || {
        ...selectedJob,
        status: "COMPLETED",
      };
      setSelectedJob(updatedJob);

      // Automatically show the "Share Your Review" pop-up for the trader who completed the job
      if (!reviewedJobIds.has(updatedJob.id) && !updatedJob.hasReviewed) {
        setShareReviewModalJob(updatedJob);
        setShareReviewTrader(updatedJob.selectedTrader || null);
        setIsShareReviewModalOpen(true);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to complete job");
    }
  };

  const handleCancelJob = async () => {
    if (!selectedJob) return;
    try {
      await authApi.cancelJob(selectedJob.id);
      toast.success("Job cancelled successfully!");
      const res = await authApi.getMyJobs();
      const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setJobs(arr);
      const updatedJob = arr.find((j: Job) => j.id === selectedJob.id);
      if (updatedJob) setSelectedJob(updatedJob);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel job");
    }
  };

  const handleCloseJobSubmit = async (data: { isWorkCarriedOut: boolean; cancelReason?: string } = { isWorkCarriedOut: true }) => {
    if (!selectedJob) return;
    try {
      await authApi.closeJob(selectedJob.id, data);
      toast.success("Job closed successfully!");
      const res = await authApi.getMyJobs();
      const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setJobs(arr);
      const updatedJob = arr.find((j: Job) => j.id === selectedJob.id);
      if (updatedJob) setSelectedJob(updatedJob);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to close job");
    }
  };

  useEffect(() => {
    async function fetchJobsAndReviews() {
      try {
        const [jobsRes, reviewsRes, dashRes] = await Promise.all([
          authApi.getMyJobs(currentPage, JOBS_PER_PAGE),
          authApi.getMyReviews().catch((e) => {
            console.error("Failed to fetch reviews", e);
            return [];
          }),
          authApi.getCustomerDashboard().catch((e) => {
            console.error("Failed to fetch dashboard", e);
            return null;
          })
        ]);

        if (dashRes) {
          setDashboardDetails(dashRes.data || dashRes);
        }

        const arr: Job[] = Array.isArray(jobsRes)
          ? jobsRes
          : Array.isArray(jobsRes?.data)
            ? jobsRes.data
            : [];

        // Check if jobs already have quote counts. If not, fetch quote counts for open/posted/active jobs
        const enhancedJobs = await Promise.all(
          arr.map(async (job) => {
            const rawCount = job.quotesReceived ?? job.quotesCount ?? (job as any)._count?.quotes ?? (Array.isArray(job.quotes) ? job.quotes.length : 0);
            if (rawCount > 0) {
              return { ...job, quotesReceived: rawCount, quotesCount: rawCount };
            }
            const norm = normalizeStatus(job.status);
            if (norm === "OPEN" || norm === "POSTED" || norm === "ACTIVE") {
              try {
                const qRes = await authApi.getJobQuotes(job.id);
                const qArr = Array.isArray(qRes) ? qRes : Array.isArray(qRes?.data) ? qRes.data : [];
                return {
                  ...job,
                  quotes: qArr,
                  quotesReceived: qArr.length,
                  quotesCount: qArr.length,
                };
              } catch {
                return job;
              }
            }
            return job;
          })
        );

        setJobs(enhancedJobs);

        const meta = jobsRes?.meta;

        setTotalJobs(meta?.total ?? enhancedJobs.length);
        setTotalPages(meta?.totalPages ?? 1);
        if (enhancedJobs.length > 0) {
          let targetJobId = null;
          if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            targetJobId = searchParams.get('jobId');
          }
          if (targetJobId) {
            const match = enhancedJobs.find((j: Job) => j.id === targetJobId);
            setSelectedJob(match || enhancedJobs[0]);
          } else {
            setSelectedJob(enhancedJobs[0]);
          }
        }

        const reviewsArr = Array.isArray(reviewsRes)
          ? reviewsRes
          : Array.isArray(reviewsRes?.data)
            ? reviewsRes.data
            : Array.isArray(reviewsRes?.content)
              ? reviewsRes.content
              : Array.isArray(reviewsRes?.data?.content)
                ? reviewsRes.data.content
                : [];

        const reviewedIds = new Set<string>();
        const reviewsMap: Record<string, any> = {};

        reviewsArr.forEach((r: any) => {
          if (r.jobId) {
            reviewedIds.add(r.jobId);
            reviewsMap[r.jobId] = r;
          }
          if (r.job?.id) {
            reviewedIds.add(r.job?.id);
            reviewsMap[r.job?.id] = r;
          }
        });
        setReviewedJobIds(reviewedIds);
        setJobReviews(reviewsMap);

        // Auto-detect completed jobs awaiting review that haven't been dismissed in this session
        const unreviewedCompletedJob = arr.find((j: Job) => {
          if (j.status !== "COMPLETED") return false;
          if (reviewedIds.has(j.id) || j.hasReviewed) return false;
          try {
            if (sessionStorage.getItem(`dismissedReviewPopup_${j.id}`) === "true") {
              return false;
            }
          } catch { }
          return true;
        });

        if (unreviewedCompletedJob) {
          setShareReviewModalJob(unreviewedCompletedJob);
          setShareReviewTrader(unreviewedCompletedJob.selectedTrader || null);
          setIsShareReviewModalOpen(true);
        }
      } catch (e) {
        console.error("Failed to fetch customer jobs", e);
      } finally {
        setLoading(false);
      }
    }
    fetchJobsAndReviews();
  }, [currentPage]);

  useEffect(() => {
    async function fetchSavedTraders() {
      try {
        const res = await authApi.getSavedTraders();
        const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setSavedTraders(arr);
      } catch (e) {
        console.error("Failed to fetch saved traders", e);
      } finally {
        setSavedTradersLoading(false);
      }
    }
    fetchSavedTraders();
  }, []);

  useEffect(() => {
    async function fetchQuotes() {
      if (!selectedJob) {
        setQuotes([]);
        return;
      }
      setQuotesLoading(true);
      try {
        const res = await authApi.getJobQuotes(selectedJob.id);
        const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setQuotes(arr);
        if (arr.length > 0) {
          setSelectedJob((prev) => (prev && prev.id === selectedJob.id ? {
            ...prev,
            quotes: arr,
            quotesReceived: Math.max(prev.quotesReceived || 0, arr.length),
            quotesCount: Math.max(prev.quotesCount || 0, arr.length),
          } : prev));
          setJobs((prev) =>
            prev.map((j) => (j.id === selectedJob.id ? {
              ...j,
              quotes: arr,
              quotesReceived: Math.max(j.quotesReceived || 0, arr.length),
              quotesCount: Math.max(j.quotesCount || 0, arr.length),
            } : j))
          );
        }
      } catch (e) {
        console.error("Failed to fetch quotes", e);
      } finally {
        setQuotesLoading(false);
      }
    }
    fetchQuotes();
  }, [selectedJob?.id]);

  const quotesCount = Math.max(quotes.length, selectedJob?.quotesReceived ?? 0, selectedJob?.quotesCount ?? 0);

  const renderJobHistory = () => (
    <div
      className={`${mobileTab === "history" ? "flex" : "hidden"
        } lg:flex bg-white rounded-2xl p-4 border border-[#E2EED2] flex-col gap-3 lg:sticky lg:top-8 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar`}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[17px] sm:text-[18px] font-extrabold text-[#1C2C1C]">Job History</h2>
        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {totalJobs || jobs.length}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[75px] rounded-xl bg-gray-50 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-[13px] text-gray-400 px-2 py-6 text-center">No jobs posted yet.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const isSelected = selectedJob?.id === job.id;
            const isClosed =
              job.status === "CLOSED" || job.status === "CANCELLED" || job.status === "EXPIRED";
            const isCompleted = job.status === "COMPLETED";

            return (
              <button
                key={job.id}
                onClick={() => {
                  setSelectedJob(job);
                  setMobileTab("detail");
                }}
                className={`w-full p-3.5 sm:p-4 rounded-2xl transition-all text-left flex flex-col gap-2 ${isClosed
                  ? isSelected
                    ? "border-2 border-gray-300 bg-[#EFF2F5] shadow-xs"
                    : "border border-transparent bg-[#EFF2F5] hover:border-gray-200"
                  : isCompleted
                    ? isSelected
                      ? "border-2 border-[#6E9625] bg-[#F2F7EB] shadow-xs ring-2 ring-[#6E9625]/20"
                      : "border border-transparent bg-[#F2F7EB] hover:border-[#D4E8C2]"
                    : isSelected
                      ? "border-2 border-[#6E9625] bg-white shadow-xs ring-2 ring-[#6E9625]/20"
                      : "border border-transparent bg-white hover:border-gray-200"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <SidebarStatusBadge status={job.status} job={job} />
                </div>
                <p className="text-[13px] font-bold text-[#1C2C1C] leading-snug line-clamp-2">
                  {job.title}
                </p>
                {(job.category?.name || job.location || job.postcode) && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                    <MapPin size={12} className="text-gray-400 shrink-0" />
                    <span className="truncate">{job.category?.name || job.location || job.postcode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium pt-1">
                  <div className="flex items-center gap-1 font-bold text-gray-400 uppercase">
                    <span>€</span>
                    {job.budgetRange && <span>{formatBudget(job.budgetRange)}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar size={11} />
                    {formatDate(job.createdAt)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-[#E2EED2]">
          <button
            onClick={() => {
              setCurrentPage((prev) => Math.max(prev - 1, 1));
              setSelectedJob(null);
            }}
            disabled={currentPage === 1}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-[11px] font-semibold text-gray-500">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => {
              setCurrentPage((prev) => Math.min(prev + 1, totalPages));
              setSelectedJob(null);
            }}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9F5]">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">

        {/* ── Page Header (Welcome Banner & Actions matching UI) ────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 sm:mb-8">
          {/* Welcome Banner */}
          <div className="bg-[#EFF5EB] rounded-[18px] border border-[#DFEBDD] px-5 sm:px-7 py-3.5 sm:py-4.5 flex items-center gap-3">
            <div>
              <h1 className="text-[20px] sm:text-[23px] font-black text-[#1C2C1C] flex items-center gap-2">
                Hello, {customerName} <span className="select-none">👋</span>
              </h1>
              <p className="text-[13px] sm:text-[14px] text-[#556958] mt-0.5 font-medium">
                Here&apos;s your latest activity and updates.
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link href="/directory-listing/search">
              <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-[12px] border border-gray-200 cursor-pointer bg-white text-[13px] sm:text-[14px] font-bold text-[#1C2C1C] hover:bg-gray-50 transition-colors shadow-xs">
                <Users size={16} />
                Find a Trader
              </button>
            </Link>
            <button
              onClick={() => {
                if (selectedJob && !reviewedJobIds.has(selectedJob.id) && selectedJob.status !== "EXPIRED") {
                  handleNavigateToReview(selectedJob, selectedJob.selectedTrader);
                } else {
                  handleActionRequiredLeaveReview();
                }
              }}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-[12px] border border-gray-200 bg-white cursor-pointer text-[13px] sm:text-[14px] font-bold text-[#1C2C1C] hover:bg-gray-50 transition-colors shadow-xs"
            >
              <Star size={16} className={selectedJob?.status === "COMPLETED" ? "text-[#6E9625] fill-[#6E9625]" : ""} />
              Leave Review
            </button>
            <Link href="/customer-dashboard/post-job">
              <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-[12px] bg-[#6E9625] text-white text-[13px] sm:text-[14px] cursor-pointer font-bold hover:bg-[#58791C] transition-colors shadow-xs">
                <PlusCircle size={16} strokeWidth={2.2} />
                Post a Job
              </button>
            </Link>
          </div>
        </div>

        {/* ── View Switcher for Mobile & Tablet (Visible only on < lg screens) ────────────────── */}
        <div className="lg:hidden flex items-center p-1 bg-gray-200/70 rounded-xl mb-5 max-w-md">
          <button
            onClick={() => setMobileTab("detail")}
            className={`flex-1 py-2 px-3 text-[13px] sm:text-[14px] font-bold rounded-lg transition-all ${mobileTab === "detail"
              ? "bg-white text-[#1C2C1C] shadow-xs"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Job Details
          </button>
          <button
            onClick={() => setMobileTab("history")}
            className={`flex-1 py-2 px-3 text-[13px] sm:text-[14px] font-bold rounded-lg transition-all ${mobileTab === "history"
              ? "bg-white text-[#1C2C1C] shadow-xs"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Job History ({totalJobs || jobs.length})
          </button>
        </div>

        {/* ── Main Grid: left (1fr on lg+) + right (320px/360px on lg+) ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 items-start relative">

          {/* ── Left: Selected Job Detail & Dashboard (Hidden on mobile/tablet if viewing 'history' tab) ──────── */}
          <div
            className={`${mobileTab === "detail" ? "flex" : "hidden"
              } lg:flex flex-col gap-5 sm:gap-6 w-full min-w-0`}
          >

            {/* Action Required Dashboard Box */}
            <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E2EED2] overflow-hidden">
              <div className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100/60">
                <Zap size={17} className="text-[#6E9625]" fill="#6E9625" />
                <h3 className="text-[14px] sm:text-[15px] font-bold text-[#1C2C1C]">Action Required</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100/60 p-2">

                {/* Card 1 */}
                <div
                  onClick={() => router.push('/customer-dashboard/job-history?tab=JOB_POSTED')}
                  className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] md:w-[52px] md:h-[52px] rounded-full bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} className="text-[#E65100]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[18px] sm:text-[20px] font-extrabold text-[#1C2C1C] leading-none mb-1">
                      {dashboardDetails?.actionRequired?.activeJobsCount ?? jobs.filter(j => ["OPEN", "POSTED", "ACTIVE", "ASSIGNED", "IN_PROGRESS", "STARTED"].includes(j.status?.toUpperCase())).length}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium mb-1">Jobs Posted</p>
                    <button className="text-[12px] font-bold text-[#E65100] flex items-center gap-1 hover:underline">
                      View jobs <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  onClick={() => router.push('/customer-dashboard/job-history?tab=QUOTE_RECEIVED')}
                  className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] md:w-[52px] md:h-[52px] rounded-full bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={20} className="text-[#1565C0]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[18px] sm:text-[20px] font-extrabold text-[#1C2C1C] leading-none mb-1">
                      {dashboardDetails?.actionRequired?.quotesAwaitingResponseCount ?? 0}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium mb-1">Quotes Received</p>
                    <button className="text-[12px] font-bold text-[#1565C0] flex items-center gap-1 hover:underline">
                      View quotes <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Card 3 */}
                <div
                  onClick={handleActionRequiredLeaveReview}
                  className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] md:w-[52px] md:h-[52px] rounded-full bg-[#F2F7EB] flex items-center justify-center flex-shrink-0">
                    <Star size={20} className="text-[#6E9625]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[18px] sm:text-[20px] font-extrabold text-[#1C2C1C] leading-none mb-1">
                      {dashboardDetails?.actionRequired?.unreviewedJobsCount ?? 0}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium mb-1">Reviews Outstanding</p>
                    <button
                      onClick={handleActionRequiredLeaveReview}
                      className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      Leave review <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick-Job Switcher on Mobile & Tablet */}
            {jobs.length > 1 && (
              <div className="lg:hidden flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] sm:text-[12px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Quick Switch Job
                  </span>
                  <button
                    onClick={() => setMobileTab("history")}
                    className="text-[11px] sm:text-[12px] font-bold text-[#6E9625] hover:underline"
                  >
                    View All History ({totalJobs || jobs.length})
                  </button>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
                  {jobs.map((job) => {
                    const isSelected = selectedJob?.id === job.id;
                    return (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border text-left shrink-0 transition-all ${isSelected
                          ? "border-[#8BC34A] bg-[#F2F7EB] ring-1 sm:ring-2 ring-[#8BC34A]/30 shadow-xs"
                          : "border-gray-200 bg-white hover:bg-gray-50 shadow-xs"
                          }`}
                      >
                        <SidebarStatusBadge status={job.status} job={job} />
                        <span className="text-[12px] sm:text-[13px] font-bold text-[#1C2C1C] max-w-[130px] sm:max-w-[200px] truncate">
                          {job.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedJob ? (
              <div className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200/80 flex flex-col gap-5 sm:gap-6">
                {/* Header Pill & Title */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[18px] sm:text-[22px] font-extrabold text-[#1C2C1C] leading-snug sm:leading-tight mb-2 break-words">
                      {selectedJob.title}
                    </h2>
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                      <StatusBadge status={selectedJob.status} job={selectedJob} quotesCount={Math.max(quotes.length, quotesCount)} />
                      <span className="text-[11px] sm:text-[12px] text-gray-400 font-medium flex items-center gap-1">
                        <Clock size={12} /> Posted {formatDate(selectedJob.createdAt)}
                      </span>
                      <span className="text-gray-300 text-[10px]">•</span>
                      <span className="text-[11px] sm:text-[12px] text-gray-400 font-medium">
                        JOB-{selectedJob.id?.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* More Options / Actions Dropdown */}
                  <div className="relative flex items-center gap-1 flex-shrink-0">
                    {(() => {
                      const createdAt = new Date(selectedJob.createdAt).getTime();
                      const now = new Date().getTime();
                      const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
                      if (hoursDiff <= 48 && selectedJob.status !== "CLOSED" && selectedJob.status !== "CANCELLED" && selectedJob.status !== "COMPLETED" && !selectedJob.quotesReceived && !selectedJob.quotesCount) {
                        return (
                          <button
                            onClick={() => {
                              sessionStorage.setItem('editJobData', JSON.stringify(selectedJob));
                              router.push(`/post-job?edit=true&jobId=${selectedJob.id}`);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-[#223321] hover:bg-gray-100 rounded-full transition-colors"
                            title="Edit Job"
                          >
                            <Edit2 size={16} />
                          </button>
                        );
                      }
                      return null;
                    })()}

                    {selectedJob.status !== "CLOSED" && selectedJob.status !== "COMPLETED" && selectedJob.status !== "CANCELLED" && selectedJob.status !== "EXPIRED" && (
                      <button
                        onClick={() => setJobMenuOpen(!jobMenuOpen)}
                        onBlur={() => setTimeout(() => setJobMenuOpen(false), 200)}
                        className="w-8 h-8 flex items-center justify-center text-[#223321] hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>
                    )}

                    {jobMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-[150px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100 p-3 z-20 flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteJob();
                            setJobMenuOpen(false);
                          }}
                          className="w-full text-center py-2 px-3 text-[13px] font-semibold rounded-lg bg-[#B2D8B2] hover:bg-[#a1cca1] cursor-pointer transition-colors text-[#001D3D]"
                        >
                          Job complete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCloseJobModalOpen(true);
                            setJobMenuOpen(false);
                          }}
                          className="w-full text-center py-2 px-3 text-[13px] font-semibold bg-[#E8E8E8] rounded-lg hover:bg-[#d6d6d6] cursor-pointer transition-colors text-[#001D3D]"
                        >
                          Close job
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5 Block Info Grid matching mockup */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#F8F9FA] border border-gray-100 min-w-0">
                    <span className="text-[9.5px] sm:text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
                      LOCATION
                    </span>
                    <div className="flex items-center gap-1 text-[12px] sm:text-[13px] font-bold text-[#1C2C1C] truncate">
                      <MapPin size={13} className="text-[#6E9625] shrink-0" />
                      <span className="truncate">{selectedJob.postcode || "—"}</span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#F8F9FA] border border-gray-100 min-w-0">
                    <span className="text-[9.5px] sm:text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
                      CATEGORY
                    </span>
                    <div className="flex items-center gap-1 text-[12px] sm:text-[13px] font-bold text-[#1C2C1C] truncate">
                      <Tag size={13} className="text-[#6E9625] shrink-0" />
                      <span className="truncate">{selectedJob.category?.name || "General"}</span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#F8F9FA] border border-gray-100 min-w-0">
                    <span className="text-[9.5px] sm:text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
                      TIMESCALE
                    </span>
                    <div className="flex items-center gap-1 text-[12px] sm:text-[13px] font-bold text-[#1C2C1C] truncate">
                      <Clock size={13} className="text-[#6E9625] shrink-0" />
                      <span className="truncate uppercase">{formatTimescale(selectedJob.timescale)}</span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#F8F9FA] border border-gray-100 min-w-0">
                    <span className="text-[9.5px] sm:text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
                      BUDGET
                    </span>
                    <div className={`flex items-center gap-1 text-[12px] sm:text-[13px] font-bold truncate ${["CLOSED", "COMPLETED", "CANCELLED", "EXPIRED"].includes(selectedJob.status) ? "text-gray-400" : "text-[#1C2C1C]"}`}>
                      <Euro size={13} className={`shrink-0 ${["CLOSED", "COMPLETED", "CANCELLED", "EXPIRED"].includes(selectedJob.status) ? "text-gray-400" : "text-[#6E9625]"}`} />
                      <span className="truncate uppercase">{formatBudget(selectedJob.budgetRange)}</span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#F8F9FA] border border-gray-100 col-span-2 sm:col-span-1 md:col-span-1 min-w-0">
                    <span className="text-[9.5px] sm:text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
                      QUOTES RECEIVED
                    </span>
                    <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-bold text-[#1C2C1C]">
                      <MessageSquare size={13} className="text-[#6E9625] shrink-0" />
                      <span>{Math.max(quotes.length, quotesCount)}</span>
                    </div>
                  </div>
                </div>

                {/* JOB DESCRIPTION */}
                <div>
                  <span className="text-[11px] font-extrabold text-[#1C2C1C] uppercase tracking-wider mb-2 block">
                    JOB DESCRIPTION
                  </span>
                  <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-600 line-clamp-3 break-words">
                    {selectedJob.description}
                  </p>
                  {selectedJob.description && selectedJob.description.length > 150 && (
                    <Link
                      href="/customer-dashboard/job-history"
                      className="text-[12px] font-bold text-[#6E9625] hover:underline mt-1 inline-block"
                    >
                      Read More
                    </Link>
                  )}
                </div>

                {/* Attachments Section */}
                {selectedJob.attachments && selectedJob.attachments.length > 0 && (
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-[12px] font-bold text-gray-700 mb-3 bg-gray-50">
                      <Paperclip size={13} className="text-gray-400" />
                      Attachments ({selectedJob.attachments.length})
                    </div>
                    <div className="flex flex-wrap gap-2.5 sm:gap-3">
                      {selectedJob.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={getAttachmentUrl(att.url || att.file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl border border-gray-200 hover:border-[#6E9625] transition-colors bg-white"
                        >
                          <img
                            src={getAttachmentUrl(att.url || att.file)}
                            alt="attachment"
                            className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quotes Section */}
                <div className="grid grid-cols-1 gap-5">
                  <div className="rounded-2xl border border-gray-200/80 p-4 sm:p-5 bg-white shadow-xs min-w-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[14px] sm:text-[15px] font-bold text-[#223321]">
                        Quotes ({quotesLoading ? "..." : Math.max(quotes.length, quotesCount)})
                      </h3>
                    </div>

                    {quotesLoading ? (
                      <p className="text-center text-[13px] text-gray-400 py-6 animate-pulse">
                        Loading quotes...
                      </p>
                    ) : quotes.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {(() => {
                          const hasAnyAcceptedQuote = quotes.some((q) => q.status?.toUpperCase() === "ACCEPTED") || Boolean(selectedJob?.selectedTrader);
                          return quotes.map((quote) => (
                            <TraderQuoteCard
                              key={quote.id}
                              trader={quote.trader || quote}
                              quote={quote}
                              isAssigned={selectedJob?.selectedTrader?.id === (quote.trader?.id || quote.id)}
                              quoteId={quote.id}
                              onAccept={handleAcceptQuote}
                              onDecline={handleDeclineQuote}
                              quoteStatus={quote.status}
                              jobStatus={selectedJob?.status}
                              hasAnyAcceptedQuote={hasAnyAcceptedQuote}
                              onCompleteJob={handleCompleteJob}
                              onCancelJob={handleCancelJob}
                              onOpenChat={(traderId) => handleOpenChat(traderId || quote.traderId || quote.trader?.id, selectedJob?.id)}
                              hasReviewed={selectedJob ? (reviewedJobIds.has(selectedJob.id) || selectedJob.hasReviewed) : false}
                              onLeaveReview={() => handleNavigateToReview(selectedJob, quote.trader || quote)}
                            />
                          ));
                        })()}
                      </div>
                    ) : selectedJob.selectedTrader ? (
                      <TraderQuoteCard
                        trader={selectedJob.selectedTrader}
                        isAssigned
                        jobStatus={selectedJob?.status}
                        onCompleteJob={handleCompleteJob}
                        onCancelJob={handleCancelJob}
                        onOpenChat={(traderId) => handleOpenChat(traderId || selectedJob.selectedTrader?.id || (selectedJob.selectedTrader as any)?.traderId, selectedJob?.id)}
                        hasReviewed={reviewedJobIds.has(selectedJob.id) || selectedJob.hasReviewed}
                        onLeaveReview={() => handleNavigateToReview(selectedJob, selectedJob.selectedTrader)}
                      />
                    ) : (
                      <p className="text-center text-[13px] text-gray-400 py-6">
                        No quotes received yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : !loading ? (
              <div className="bg-white rounded-2xl border border-gray-200 flex items-center justify-center p-12 sm:p-16 text-[14px] text-gray-400">
                No jobs to display yet.
              </div>
            ) : null}
          </div>

          {/* ── Right: Job History ──────── */}
          {renderJobHistory()}
        </div>
      </div>

      {/* Close Job Modal */}
      {isCloseJobModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsCloseJobModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg sm:text-xl font-bold text-[#1C2C1C] mb-4">
              Was any work carried out?
            </h2>

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={async () => {
                  setIsCloseJobModalOpen(false);
                  await handleCloseJobSubmit({ isWorkCarriedOut: true });
                  const traderId = selectedJob?.selectedTrader?.id || '';
                  router.push(`/customer-dashboard/leave-review?jobId=${selectedJob?.id}&traderId=${traderId}&workCarriedOut=true&hideWorkCarriedOut=true`);
                }}
                className="w-full py-2.5 sm:py-3 bg-[#4CAF50] text-white rounded-xl font-bold hover:bg-[#43A047] transition-colors cursor-pointer text-[14px]"
              >
                Yes
              </button>
              <button
                onClick={async () => {
                  setIsCloseJobModalOpen(false);
                  await handleCloseJobSubmit({ isWorkCarriedOut: false });
                  const traderId = selectedJob?.selectedTrader?.id || '';
                  router.push(`/customer-dashboard/leave-review?jobId=${selectedJob?.id}&traderId=${traderId}&workCarriedOut=false&hideWorkCarriedOut=true`);
                }}
                className="w-full py-2.5 sm:py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors cursor-pointer text-[14px]"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotes Modal */}
      {quotesModalOpen && (
        <QuotesModal
          quotes={quotes}
          onClose={() => setQuotesModalOpen(false)}
          onAccept={async (quoteId) => {
            await handleAcceptQuote(quoteId);
            setQuotesModalOpen(false);
          }}
          onSendMessage={(traderId) => {
            setQuotesModalOpen(false);
            handleOpenChat(traderId, selectedJob?.id);
          }}
          onDecline={async (quoteId) => {
            await handleDeclineQuote(quoteId);
          }}
        />
      )}

      {/* Share Your Review Modal for Completed Jobs */}
      <ShareReviewModal
        isOpen={isShareReviewModalOpen}
        onClose={() => handleDismissReviewModal()}
        onLeaveReview={() => handleNavigateToReview()}
        job={shareReviewModalJob}
        trader={shareReviewTrader}
      />
    </div>
  );
}
