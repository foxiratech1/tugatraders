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
const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  OPEN: { label: "Live", bg: "bg-[#FDE2D6]", text: "text-[#D32F2F]", dot: "bg-[#D32F2F]" },
  POSTED: { label: "Live", bg: "bg-[#FDE2D6]", text: "text-[#D32F2F]", dot: "bg-[#D32F2F]" },
  QUOTE_RECEIVED: {
    label: "Quote Received",
    bg: "bg-[#FFF8E1]",
    text: "text-[#F57C00]",
    dot: "bg-[#F57C00]",
  },
  IN_PROGRESS: {
    label: "IN PROGRESS",
    bg: "bg-[#E3F2FD]",
    text: "text-[#1565C0]",
    dot: "bg-[#1565C0]",
  },

  ASSIGNED: { label: "Contacted", bg: "bg-[#8EAADB]", text: "text-[#1F3F73]", dot: "bg-[#1F3F73]" },
  COMPLETED: { label: "Completed", bg: "bg-[#1E5624]", text: "text-white", dot: "bg-white" },
  CANCELLED: { label: "Closed", bg: "bg-[#A5A5A5]", text: "text-[#515151]", dot: "bg-[#515151]" },
  CLOSED: { label: "Closed", bg: "bg-[#A5A5A5]", text: "text-[#515151]", dot: "bg-[#515151]" },
  EXPIRED: { label: "Expired", bg: "bg-[#A5A5A5]", text: "text-[#515151]", dot: "bg-[#515151]" },
  ACTIVE: { label: "Live", bg: "bg-[#FDE2D6]", text: "text-[#D32F2F]", dot: "bg-[#D32F2F]" },
};

function SidebarStatusBadge({ status }: { status: string }) {
  const upper = status?.toUpperCase();
  if (upper === "COMPLETED") {
    return (
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#4E7B24]">
        <span className="w-2 h-2 rounded-full bg-[#4E7B24]" />
        Completed
      </div>
    );
  }
  if (upper === "CLOSED" || upper === "CANCELLED" || upper === "EXPIRED") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E2E8F0] text-[#475569] text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
        Closed
      </div>
    );
  }
  if (upper === "ASSIGNED") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B6D5F4] text-[#1565C0] text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
        Contacted
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FDE2D6] text-[#D32F2F] text-[11px] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F]" />
      Live
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const upper = status?.toUpperCase();
  if (upper === "COMPLETED") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#D8F3D7] text-[#2E7D32] text-[11px] font-bold tracking-wide">
        COMPLETED
      </span>
    );
  }
  if (upper === "CLOSED" || upper === "CANCELLED" || upper === "EXPIRED") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E2E8F0] text-[#475569] text-[11px] font-bold tracking-wide">
        CLOSED
      </span>
    );
  }
  if (upper === "ASSIGNED") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#B6D5F4] text-[#1565C0] text-[11px] font-bold tracking-wide">
        CONTACTED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FDE2D6] text-[#D32F2F] text-[11px] font-bold tracking-wide">
      LIVE
    </span>
  );
}

// Active badge – outline style used in the job detail header
function ActiveBadge({ status }: { status: string }) {
  if (status === "ASSIGNED" || status === "OPEN") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] border border-[#4CAF50] text-[11px] font-bold text-[#4CAF50] tracking-wide">
        {status === "ASSIGNED" ? "CONTACTED" : "ACTIVE"}
      </span>
    );
  }
  const cfg = statusConfig[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-600" };
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
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[17px] font-bold text-[#1C2C1C]">Trader Quotes</h2>
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
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
          {quotes.length === 0 ? (
            <p className="text-center text-[13px] text-gray-400 py-8">No quotes available.</p>
          ) : (
            quotes.map((quote) => (
              <div
                key={quote.id}
                className={`border border-gray-200 rounded-xl p-4 transition-all ${quote.status?.toUpperCase() === "REJECTED" || quote.status?.toUpperCase() === "DECLINED"
                  ? "bg-gray-50"
                  : "bg-white hover:border-[#8BC34A]/60 hover:shadow-sm"
                  }`}
              >
                {/* Trader row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 overflow-hidden">
                      {quote.trader?.profileImage ? (
                        <img src={getAttachmentUrl(quote.trader.profileImage)} alt={quote.trader.fullName} className="w-full h-full object-cover" />
                      ) : (
                        quote.trader?.fullName?.[0]?.toUpperCase() ?? "T"
                      )}
                    </div>
                    <div>
                      <Link href={`/customer-dashboard/trader-profile/${quote.trader?.id}`}>
                        <p className="text-[13px] font-bold text-[#1C2C1C] hover:underline cursor-pointer">{quote.trader?.traderProfile?.displayName || quote.trader?.traderProfile?.companyName || quote.trader?.fullName || "Unknown"}</p>
                      </Link>
                    </div>
                  </div>

                  {/* Status badge */}
                  {quote.status?.toUpperCase() === "ACCEPTED" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                      <CheckCircle size={11} />
                      Accepted
                    </span>
                  ) : quote.status?.toUpperCase() === "REJECTED" || quote.status?.toUpperCase() === "DECLINED" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold border border-red-100">
                      <XCircle size={11} />
                      Declined
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-100">
                      {quote.status?.toUpperCase() === "PENDING" ? "Pending" : quote.status ?? "Pending"}
                    </span>
                  )}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 bg-[#F8F9F5] rounded-lg p-2.5">
                    <DollarSign size={14} className="text-[#6E9625] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Price</p>
                      <p className="text-[13px] font-bold text-[#1C2C1C]">{formatPrice(quote.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F8F9F5] rounded-lg p-2.5">
                    <Clock size={14} className="text-[#6E9625] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Est. Days</p>
                      <p className="text-[13px] font-bold text-[#1C2C1C]">{quote.estimatedDays} day{quote.estimatedDays !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 mb-3">
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
                {quote.status?.toUpperCase() === "ACCEPTED" ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <CheckCircle size={12} />
                    Quote Accepted
                  </div>
                ) : quote.status?.toUpperCase() === "REJECTED" || quote.status?.toUpperCase() === "DECLINED" ? (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#FF3B30] bg-[#FF3B30]/5 px-3 py-1.5 rounded-full border border-[#FF3B30]/30 w-fit">
                      <Ban size={14} className="text-[#FF3B30]" />
                      Quote Declined
                    </div>
                    <div>
                      <button
                        onClick={() => onSendMessage(quote.trader?.id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 border border-[#1565C0] cursor-pointer text-[#1565C0] hover:bg-blue-50 rounded-lg text-[12px] font-semibold transition-colors"
                      >
                        <MessageSquare size={13} />
                        Send Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleAccept(quote.id)}
                      disabled={accepting === quote.id || declining === quote.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-[12px] font-bold transition-colors disabled:opacity-50 min-w-[110px]"
                    >
                      <CheckCircle size={13} />
                      {accepting === quote.id ? "Accepting..." : "Accept Quote"}
                    </button>
                    <button
                      onClick={() => onSendMessage(quote.trader?.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 border border-[#1565C0] cursor-pointer text-[#1565C0] hover:bg-blue-50 rounded-lg text-[12px] font-semibold transition-colors"
                    >
                      <MessageSquare size={13} />
                      Send Message
                    </button>
                    <button
                      onClick={() => handleDecline(quote.id)}
                      disabled={accepting === quote.id || declining === quote.id}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 border border-red-300 cursor-pointer text-red-600 hover:bg-red-50 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50"
                    >
                      <X size={13} />
                      {declining === quote.id ? "Declining..." : "Decline"}
                    </button>
                  </div>
                )}
              </div>
            ))
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
}) {
  const [accepting, setAccepting] = useState<boolean>(false);
  const [declining, setDeclining] = useState<boolean>(false);

  const formatPrice = (p?: string) =>
    p ? (isNaN(Number(p)) ? p : `£${Number(p).toLocaleString()}`) : "—";

  return (
    <div className={`border border-gray-200 rounded-xl p-4 mb-3 last:mb-0 transition-all ${quoteStatus?.toUpperCase() === "REJECTED" || quoteStatus?.toUpperCase() === "DECLINED"
      ? "bg-gray-50"
      : "bg-white hover:border-[#8BC34A]/60 hover:shadow-sm"
      }`}>
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="relative w-11 h-11 rounded-full bg-[#7CB342] flex items-center justify-center text-white text-[16px] font-bold flex-shrink-0 mt-0.5 overflow-hidden">
            {trader?.profileImage ? (
              <img src={getAttachmentUrl(trader.profileImage)} alt={trader.fullName} className="w-full h-full object-cover" />
            ) : (
              trader?.fullName?.[0]?.toUpperCase() ?? "T"
            )}
          </div>
          <div>
            <Link href={`/customer-dashboard/trader-profile/${trader.id}`}>
              <p className="text-[14px] font-bold text-[#1C2C1C] hover:underline cursor-pointer">
                {trader.traderProfile?.displayName || trader.traderProfile?.companyName || trader.fullName || 'Unknown Trader'}
              </p>
            </Link>
            <div className="flex items-center gap-1.5 mt-1">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6E9625] text-white text-[11px] font-bold hover:bg-[#58791C] transition-colors"
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
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr] gap-3 mb-4">
            <div className="flex flex-col gap-1 bg-[#F9F9F9] rounded-xl p-3 border border-gray-100/50">
              <div className="flex items-center gap-1.5 text-gray-400">
                <DollarSign size={13} className="text-[#4CAF50]" />
                <span className="text-[11px] font-semibold">Price</span>
              </div>
              <span className="text-[14px] font-bold text-[#1C2C1C] pl-5">{formatPrice(quote.price)}</span>
            </div>

            <div className="flex flex-col gap-1 bg-[#F9F9F9] rounded-xl p-3 border border-gray-100/50">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock size={13} className="text-[#8BC34A]" />
                <span className="text-[11px] font-semibold">Est. Days</span>
              </div>
              <span className="text-[14px] font-bold text-[#1C2C1C] pl-5">{quote.estimatedDays} day{quote.estimatedDays !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex flex-col gap-1 bg-[#F9F9F9] rounded-xl p-3 border border-gray-100/50">
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
              <p className="text-[13px] font-semibold text-[#888888] mb-2.5 flex items-center gap-1.5">
                <Paperclip size={14} className="text-[#999999]" />
                Attachments
              </p>
              <div className="flex flex-wrap gap-2.5">
                {quote.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={getAttachmentUrl(att.url || att.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2 hover:border-[#8BC34A] transition-colors shadow-sm max-w-full"
                    title={att.filename}
                  >
                    {att.mimeType?.startsWith("image/") ? (
                      <ImageIcon size={15} className="text-[#6E9625] flex-shrink-0" />
                    ) : (
                      <FileText size={15} className="text-gray-400 flex-shrink-0" />
                    )}
                    <span className="text-[13px] text-[#444444] font-medium truncate max-w-[160px]">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          {quote ? (
            <p className="text-[11px] text-gray-400 font-medium">Received: {formatDate(quote.createdAt)}</p>
          ) : (
            <p className="text-[11px] text-gray-400 font-medium">Trader details</p>
          )}

          {/* Moved badges to bottom */}
          {quoteStatus?.toUpperCase() === "ACCEPTED" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[11px] font-bold border border-[#C8E6C9]">
              <CheckCircle size={12} />
              Quote Accepted
            </span>
          ) : quoteStatus?.toUpperCase() === "REJECTED" || quoteStatus?.toUpperCase() === "DECLINED" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF3B30]/5 text-[#FF3B30] text-[12px] font-bold border border-[#FF3B30]/30">
              <Ban size={14} className="text-[#FF3B30]" />
              Quote Declined
            </span>
          ) : quoteStatus ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E1] text-[#F57C00] text-[11px] font-bold border border-[#FFECB3]">
              {quoteStatus?.toUpperCase() === "PENDING" ? "Quote Received" : quoteStatus ?? "Quote Received"}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {quote && quoteStatus?.toUpperCase() === "PENDING" && quoteId && onAccept && onDecline && !["CLOSED", "COMPLETED", "CANCELLED", "EXPIRED"].includes(jobStatus?.toUpperCase() || "") ? (
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
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-[12px] font-bold transition-colors disabled:opacity-50 min-w-[110px]"
              >
                <CheckCircle size={13} />
                {accepting ? "Accepting..." : "Accept Quote"}
              </button>
              <button
                onClick={() => onOpenChat && onOpenChat(trader.id)}
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 border border-[#1565C0] cursor-pointer text-[#1565C0] hover:bg-blue-50 rounded-lg text-[12px] font-semibold transition-colors bg-white"
              >
                <MessageSquare size={13} />
                Send Message
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
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 border border-red-300 cursor-pointer text-red-600 hover:bg-red-50 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50"
              >
                <X size={13} />
                {declining ? "Declining..." : "Decline"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenChat && onOpenChat(trader.id)}
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 border border-[#1565C0] cursor-pointer text-[#1565C0] hover:bg-blue-50 rounded-lg text-[12px] font-semibold transition-colors bg-white"
              >
                <MessageSquare size={13} />
                Send Message
              </button>

              {isAssigned && (jobStatus === "COMPLETED") && !hasReviewed && onLeaveReview && (
                <button
                  onClick={onLeaveReview}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-white bg-[#6E9625] hover:bg-[#58791C] rounded-lg text-[12px] font-bold transition-colors shadow-sm cursor-pointer"
                >
                  <Star size={12} className="fill-white" />
                  Leave a Review
                </button>
              )}
            </>
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
  const [savingJobIds, setSavingJobIds] = useState<Set<string>>(new Set());
  const [jobReviews, setJobReviews] = useState<Record<string, any>>({});
  const [reviewedJobIds, setReviewedJobIds] = useState<Set<string>>(new Set());
  const [dashboardDetails, setDashboardDetails] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Share Your Review popup states
  const [shareReviewModalJob, setShareReviewModalJob] = useState<Job | null>(null);
  const [shareReviewTrader, setShareReviewTrader] = useState<SelectedTrader | null>(null);
  const [isShareReviewModalOpen, setIsShareReviewModalOpen] = useState(false);

  const JOBS_PER_PAGE = 5;

  useSocket({
    onJobUpdated: (updatedJob) => {
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
              const currentReceived = j.quotesReceived || j.quotesCount || 0;
              return {
                ...j,
                quotesReceived: currentReceived + 1,
                quotesCount: currentReceived + 1,
              };
            }
            return j;
          })
        );
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

  const handleOpenChat = async (traderId: string, jobId?: string) => {
    try {
      const res = await authApi.getOrCreateConversation(traderId, jobId);
      const conversation = res?.data || res;
      if (conversation?.id || conversation?._id) {
        let url = `/customer-dashboard/inbox?conversationId=${conversation.id || conversation._id}`;
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

  // const handleStartJob = async () => {
  //   if (!selectedJob) return;
  //   try {
  //     await authApi.startJob(selectedJob.id);
  //     toast.success("Job started successfully!");
  //     const res = await authApi.getMyJobs();
  //     const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
  //     setJobs(arr);
  //     const updatedJob = arr.find((j: Job) => j.id === selectedJob.id);
  //     if (updatedJob) setSelectedJob(updatedJob);
  //   } catch (error: any) {
  //     toast.error(error?.response?.data?.message || "Failed to start job");
  //   }
  // };

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

        setJobs(arr);

        const meta = jobsRes?.meta;

        setTotalJobs(meta?.total ?? arr.length);
        setTotalPages(meta?.totalPages ?? 1);
        if (arr.length > 0) setSelectedJob(arr[0]);

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
        // NOTE: only mark a job as reviewed if there is an actual review returned from the API.
        // Do NOT use j.hasReviewed here — the backend may set that flag for reasons unrelated
        // to the customer having actually submitted a review.
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
        console.log("Quotes API Response:", res);
        const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setQuotes(arr);
      } catch (e) {
        console.error("Failed to fetch quotes", e);
      } finally {
        setQuotesLoading(false);
      }
    }
    fetchQuotes();
  }, [selectedJob]);

  const quotesCount = selectedJob?.quotesReceived ?? selectedJob?.quotesCount ?? 0;

  return (
    <div className="min-h-screen bg-[#F8F9F5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <h1 className="text-[2rem] font-bold text-[#1C2C1C] leading-tight">
            Dashboard
          </h1>
          <div className="flex items-center gap-3 pt-1">
            {/* Email notice */}
            {/* <span className="flex items-center gap-1.5 text-[12px] text-[#6E9625] font-medium">
              <AlertCircle size={13} />
              To post a job — an email address is required
            </span> */}
            <Link href="/directory-listing/search">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] border border-gray-200 cursor-pointer bg-white text-[14px] font-bold text-[#1C2C1C] hover:bg-gray-50 transition-colors shadow-sm">
                <Users size={16} />
                Find a Trader
              </button>
            </Link>
            {selectedJob &&
              !reviewedJobIds.has(selectedJob.id) &&
              selectedJob.status !== "EXPIRED" && (
                <button
                  onClick={() => handleNavigateToReview(selectedJob, selectedJob.selectedTrader)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] border border-gray-200 bg-white cursor-pointer text-[14px] font-bold text-[#1C2C1C] hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Star size={16} className={selectedJob.status === "COMPLETED" ? "text-[#6E9625] fill-[#6E9625]" : ""} />

                  {selectedJob.status === "COMPLETED"
                    ? "Leave a Review"
                    : selectedJob.status === "CLOSED" || selectedJob.status === "CANCELLED"
                      ? "Share Your Experience"
                      : "Leave a Review"}
                </button>
              )}
            <Link href="/customer-dashboard/post-job">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[#6E9625] text-white text-[14px] cursor-pointer font-bold hover:bg-[#58791C] transition-colors shadow-sm">
                <PlusCircle size={18} strokeWidth={2} />
                Post a Job
              </button>
            </Link>
          </div>
        </div>

        {/* ── Main Grid: left (300px) + right (1fr) ────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start relative">

          {/* ── Left: Job History (White Background Container) ──────── */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2EED2] flex flex-col gap-3 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
            <div className="mb-1">
              <h2 className="text-[18px] font-extrabold text-[#1C2C1C]">Job History</h2>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[75px] rounded-xl bg-gray-50 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-[13px] text-gray-400 px-2 py-4 text-center">No jobs posted yet.</p>
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
                      onClick={() => setSelectedJob(job)}
                      className={`w-full p-4 rounded-2xl transition-all text-left flex flex-col gap-2 ${isClosed
                        ? isSelected
                          ? "border-2 border-gray-300 bg-[#EFF2F5] shadow-xs"
                          : "border border-transparent bg-[#EFF2F5] hover:border-gray-200"
                        : isCompleted
                          ? isSelected
                            ? "border-2 border-[#8BC34A] bg-[#F2F7EB] shadow-xs ring-2 ring-[#8BC34A]/20"
                            : "border border-transparent bg-[#F2F7EB] hover:border-[#D4E8C2]"
                          : isSelected
                            ? "border-2 border-[#8BC34A] bg-white shadow-xs ring-2 ring-[#8BC34A]/20"
                            : "border border-transparent bg-white hover:border-gray-200"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <SidebarStatusBadge status={job.status} />
                      </div>
                      <p className="text-[13px] font-bold text-[#1C2C1C] leading-snug line-clamp-2">
                        {job.title}
                      </p>
                      {(job.category?.name || job.location || job.postcode) && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                          <MapPin size={12} className="text-gray-400 shrink-0" />
                          <span>{job.category?.name || job.location || job.postcode}</span>
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
          </div>

          {/* ── Right: Selected Job Detail & Dashboard ──────── */}
          <div className="flex flex-col gap-6 w-full">

            {/* Action Required Dashboard Box */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-red-600/0 ring-1 ring-[#D81B60]/0 hover:ring-[#E2EED2] hover:border-[#E2EED2] transition-all border-[#E2EED2] overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100/60">
                <Zap size={18} className="text-[#6E9625]" fill="#6E9625" />
                <h3 className="text-[15px] font-bold text-[#1C2C1C]">Action Required</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100/60 p-2">

                {/* Card 1 */}
                <div
                  onClick={() => router.push('/customer-dashboard/job-history')}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-[#F2F7EB] flex items-center justify-center flex-shrink-0">
                    <Briefcase size={22} className="text-[#6E9625]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[20px] font-extrabold text-[#1C2C1C] leading-none mb-1">
                      {dashboardDetails?.actionRequired?.activeJobsCount ?? 0}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium mb-1.5">New jobs available</p>
                    <button className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline">
                      View jobs <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  onClick={() => router.push('/customer-dashboard/job-history')}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={22} className="text-[#E65100]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[20px] font-extrabold text-[#1C2C1C] leading-none mb-1">
                      {dashboardDetails?.actionRequired?.quotesAwaitingResponseCount ?? 0}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium mb-1.5">Quotes awaiting response</p>
                    <button className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline">
                      View quotes <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Card 3 */}
                <div
                  onClick={() => router.push('/customer-dashboard/reviews')}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                    <Star size={22} className="text-[#1565C0]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[20px] font-extrabold text-[#1C2C1C] leading-none mb-1">
                      {dashboardDetails?.actionRequired?.unreviewedJobsCount ?? 0}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium mb-1.5">Reviews Outstanding</p>
                    <button className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline">
                      Leave review <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {selectedJob ? (
              <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200/80 flex flex-col gap-6">
                {/* Header Pill & Title */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block bg-[#EAF3DE] text-[#557A18] font-bold text-[11px] px-3 py-1 rounded-full mb-2 tracking-wide">
                      JOB-{selectedJob.id?.substring(0, 8).toUpperCase()}
                    </span>
                    <h2 className="text-[22px] font-extrabold text-[#1C2C1C] leading-tight mb-2">
                      {selectedJob.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={selectedJob.status} />
                      <span className="text-[12px] text-gray-400 font-medium flex items-center gap-1">
                        <Clock size={13} /> Posted {formatDate(selectedJob.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* More Options / Actions Dropdown */}
                  <div className="relative flex items-center gap-1">
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
                      <div className="absolute right-0 top-full mt-1 w-[150px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100 p-3.5 z-10 flex flex-col gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteJob();
                            setJobMenuOpen(false);
                          }}
                          className="w-full text-center py-2.5 px-3 text-[14px] rounded-xl bg-[#B2D8B2] hover:bg-[#a1cca1] cursor-pointer transition-colors text-[#001D3D]"
                        >
                          Job complete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCloseJobModalOpen(true);
                            setJobMenuOpen(false);
                          }}
                          className="w-full text-center py-2.5 px-3 text-[14px] bg-[#E8E8E8] rounded-xl hover:bg-[#d6d6d6] cursor-pointer transition-colors text-[#001D3D]"
                        >
                          Close job
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5 Block Info Grid matching mockup */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                      LOCATION
                    </span>
                    <div className="flex items-center gap-1 text-[13px] font-bold text-[#1C2C1C] truncate">
                      <MapPin size={13} className="text-[#6E9625] shrink-0" />
                      <span className="truncate">{selectedJob.postcode || "—"}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                      CATEGORY
                    </span>
                    <div className="flex items-center gap-1 text-[13px] font-bold text-[#1C2C1C] truncate">
                      <Tag size={13} className="text-[#6E9625] shrink-0" />
                      <span className="truncate">{selectedJob.category?.name || "General"}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                      TIMESCALE
                    </span>
                    <div className="flex items-center gap-1 text-[13px] font-bold text-[#1C2C1C] truncate">
                      <Clock size={13} className="text-[#6E9625] shrink-0" />
                      <span className="truncate">{formatTimescale(selectedJob.timescale)}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                      BUDGET
                    </span>
                    <div className={`flex items-center gap-1 text-[13px] font-bold truncate ${["CLOSED", "COMPLETED", "CANCELLED", "EXPIRED"].includes(selectedJob.status) ? "text-gray-400" : "text-[#1C2C1C]"}`}>
                      <Euro size={13} className={`shrink-0 ${["CLOSED", "COMPLETED", "CANCELLED", "EXPIRED"].includes(selectedJob.status) ? "text-gray-400" : "text-[#6E9625]"}`} />
                      <span className="truncate">{formatBudget(selectedJob.budgetRange)}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                      QUOTES RECEIVED
                    </span>
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#1C2C1C]">
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
                  <p className="text-[14px] leading-relaxed text-gray-600 line-clamp-3">
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
                      <Paperclip size={14} className="text-gray-400" />
                      Attachments ({selectedJob.attachments.length})
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {selectedJob.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={getAttachmentUrl(att.url || att.file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 hover:border-[#6E9625] transition-colors"
                        >
                          <img
                            src={getAttachmentUrl(att.url || att.file)}
                            alt="attachment"
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quotes Row */}
                <div className="grid grid-cols-1 gap-5">

                  {/* Trader Quotes Card */}
                  <div className="rounded-2xl border border-gray-200/80 p-5 bg-white shadow-sm min-w-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[15px] font-bold text-[#223321]">
                        Quotes ({quotesLoading ? "..." : Math.max(quotes.length, quotesCount)})
                      </h3>
                    </div>

                    {quotesLoading ? (
                      <p className="text-center text-[13px] text-gray-400 py-6 animate-pulse">
                        Loading quotes...
                      </p>
                    ) : quotes.length > 0 ? (
                      <div className="space-y-4">
                        {quotes.map((quote) => (
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
                            // onStartJob={handleStartJob}
                            onCompleteJob={handleCompleteJob}
                            onCancelJob={handleCancelJob}
                            onOpenChat={(traderId) => handleOpenChat(traderId, selectedJob?.id)}
                            hasReviewed={selectedJob ? (reviewedJobIds.has(selectedJob.id) || selectedJob.hasReviewed) : false}
                            onLeaveReview={() => handleNavigateToReview(selectedJob, quote.trader || quote)}
                          />
                        ))}
                      </div>
                    ) : selectedJob.selectedTrader ? (
                      <TraderQuoteCard
                        trader={selectedJob.selectedTrader}
                        isAssigned
                        jobStatus={selectedJob?.status}
                        // onStartJob={handleStartJob}
                        onCompleteJob={handleCompleteJob}
                        onCancelJob={handleCancelJob}
                        onOpenChat={(traderId) => handleOpenChat(traderId, selectedJob?.id)}
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
              <div className="bg-white rounded-2xl border border-gray-200 flex items-center justify-center p-16 text-[14px] text-gray-400">
                No jobs to display yet.
              </div>
            ) : null}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#E2EED2]">
              <button
                onClick={() => {
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                  setSelectedJob(null);
                }}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
                className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quotes Modal */}

      {/* Close Job Modal */}
      {isCloseJobModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsCloseJobModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-[#1C2C1C] mb-4">
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
                className="w-full py-3 bg-[#4CAF50] text-white rounded-xl font-bold hover:bg-[#43A047] transition-colors cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={async () => {
                  setIsCloseJobModalOpen(false);
                  const traderId = selectedJob?.selectedTrader?.id || '';
                  router.push(`/customer-dashboard/leave-review?jobId=${selectedJob?.id}&traderId=${traderId}&workCarriedOut=false&hideWorkCarriedOut=true`);
                }}
                className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
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
