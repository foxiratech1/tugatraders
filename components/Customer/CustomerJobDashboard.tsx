"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/app/api/authApi";
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
  Star,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  OPEN: { label: "Open", bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", dot: "bg-[#2E7D32]" },
  QUOTE_RECEIVED: {
    label: "Quote Received",
    bg: "bg-[#FFF8E1]",
    text: "text-[#F57C00]",
    dot: "bg-[#F57C00]",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-[#E3F2FD]",
    text: "text-[#1565C0]",
    dot: "bg-[#1565C0]",
  },

  ASSIGNED: { label: "Contacted", bg: "bg-[#E3F2FD]", text: "text-[#1565C0]", dot: "bg-[#1565C0]" },
  COMPLETED: { label: "Completed", bg: "bg-[#F3E5F5]", text: "text-[#6A1B9A]", dot: "bg-[#6A1B9A]" },
  CANCELLED: { label: "Cancelled", bg: "bg-[#F5F5F5]", text: "text-gray-500", dot: "bg-gray-400" },
  EXPIRED: { label: "Expired", bg: "bg-[#F5F5F5]", text: "text-gray-500", dot: "bg-gray-400" },
  ACTIVE: { label: "Active", bg: "bg-transparent border border-[#4CAF50]", text: "text-[#4CAF50]", dot: "bg-[#4CAF50]" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// Active badge – outline style used in the job detail header
function ActiveBadge({ status }: { status: string }) {
  if (status === "ASSIGNED" || status === "OPEN") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#4CAF50] text-[11px] font-bold text-[#4CAF50] tracking-wide">
        {status === "ASSIGNED" ? "CONTACTED" : "ACTIVE"}
      </span>
    );
  }
  const cfg = statusConfig[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
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
}: {
  quotes: Quote[];
  onClose: () => void;
  onAccept: (quoteId: string) => void;
}) {
  const [accepting, setAccepting] = useState<string | null>(null);

  const handleAccept = async (quoteId: string) => {
    setAccepting(quoteId);
    await onAccept(quoteId);
    setAccepting(null);
  };

  const formatPrice = (p: string) =>
    isNaN(Number(p)) ? p : `£${Number(p).toLocaleString()}`;

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
                className="border border-gray-200 rounded-xl p-4 hover:border-[#8BC34A]/60 hover:shadow-sm transition-all"
              >
                {/* Trader row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                      {quote.trader?.fullName?.[0]?.toUpperCase() ?? "T"}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#1C2C1C]">{quote.trader?.fullName ?? "Unknown"}</p>
                      <p className="text-[11px] text-gray-400">{quote.trader?.email}</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  {quote.status?.toUpperCase() === "ACCEPTED" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                      <CheckCircle size={11} />
                      Accepted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-100">
                      {quote.status ?? "Pending"}
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

                {/* Date */}
                <p className="text-[10px] text-gray-400 mb-3">Received: {formatDate(quote.createdAt)}</p>

                {/* Actions */}
                {quote.status?.toUpperCase() !== "ACCEPTED" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(quote.id)}
                      disabled={accepting === quote.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-[12px] font-bold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={13} />
                      {accepting === quote.id ? "Accepting..." : "Accept Quote"}
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg text-[12px] font-semibold transition-colors"
                    >
                      Dismiss
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
}) {

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-3 last:mb-0">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#1C2C1C]">{trader.fullName}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                <Star size={10} fill="#F59E0B" className="text-[#F59E0B]" />
                <span className="font-semibold text-[#1C2C1C]">10.0</span>
                <span className="text-gray-400">(2 reviews)</span>
              </span>
              <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                <MapPin size={10} />
                2.4 miles away
              </span>
            </div>
          </div>
        </div>

        {/* Status or MoreHorizontal menu */}
        {quoteStatus?.toUpperCase() === "ACCEPTED" ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
            <CheckCircle size={12} />
            Accepted
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => onOpenChat && onOpenChat(trader.id)}
          className="flex items-center gap-1.5 text-[12px] text-[#4CAF50] hover:text-[#43A047] font-semibold cursor-pointer border-0 bg-transparent py-1 transition-colors"
        >
          <MessageSquare size={14} />
          View your conversation with tradesperson
        </button>
        {isAssigned && jobStatus === "ASSIGNED" && quoteStatus?.toUpperCase() === "ACCEPTED" ? (
          <div className="flex items-center gap-2">
            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes startWorkPulse {
                0% {
                  transform: scale(1);
                  box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.6);
                }
                50% {
                  transform: scale(1.04);
                  box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
                }
                100% {
                  transform: scale(1);
                  box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
                }
              }
              .btn-start-work-pulse {
                animation: startWorkPulse 2s infinite ease-in-out;
              }
            `}} />
            <button
              onClick={onStartJob}
              className="px-4 py-1.5 bg-[#4CAF50] text-white rounded-lg text-[12px] font-bold hover:bg-[#43A047] transition-all btn-start-work-pulse hover:scale-105 active:scale-95"
            >
              Start Work
            </button>
          </div>
        ) : isAssigned && jobStatus === "ACTIVE" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancelJob}
              className="px-3.5 py-1.5 border border-red-200 text-red-600 rounded-lg text-[12px] font-semibold hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onCompleteJob}
              className="px-3.5 py-1.5 bg-[#1C2C1C] text-white rounded-lg text-[12px] font-bold hover:bg-[#2c3e2c] transition-colors"
            >
              Complete
            </button>
          </div>
        ) : isAssigned ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
              {jobStatus}
            </span>
          </div>
        ) : null}
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
      toast.success("Quote accepted successfully!");
      // Refresh quotes after accepting
      if (selectedJob) {
        const res = await authApi.getJobQuotes(selectedJob.id);
        const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setQuotes(arr);
        // Also refresh jobs to get updated status
        const jobsRes = await authApi.getMyJobs();
        const jobsArr = Array.isArray(jobsRes) ? jobsRes : Array.isArray(jobsRes?.data) ? jobsRes.data : [];
        setJobs(jobsArr);
        const updatedJob = jobsArr.find((j: Job) => j.id === selectedJob.id);
        if (updatedJob) setSelectedJob(updatedJob);
      }
    } catch (error: any) {
      console.error("Failed to accept quote", error);
      toast.error(error?.response?.data?.message || "Failed to accept quote");
    }
  };

  const handleStartJob = async () => {
    if (!selectedJob) return;
    try {
      await authApi.startJob(selectedJob.id);
      toast.success("Job started successfully!");
      const res = await authApi.getMyJobs();
      const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setJobs(arr);
      const updatedJob = arr.find((j: Job) => j.id === selectedJob.id);
      if (updatedJob) setSelectedJob(updatedJob);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to start job");
    }
  };

  const handleCompleteJob = async () => {
    if (!selectedJob) return;
    try {
      await authApi.completeJob(selectedJob.id);
      toast.success("Job completed successfully!");
      const res = await authApi.getMyJobs();
      const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setJobs(arr);
      const updatedJob = arr.find((j: Job) => j.id === selectedJob.id);
      if (updatedJob) setSelectedJob(updatedJob);
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

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await authApi.getMyJobs();
        console.log(jobs);
        const arr: Job[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];
        setJobs(arr);
        if (arr.length > 0) setSelectedJob(arr[0]);
      } catch (e) {
        console.error("Failed to fetch customer jobs", e);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

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
      <div className="max-w-[1320px] mx-auto px-6 py-8">

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <h1 className="text-[2rem] font-bold text-[#1C2C1C] leading-tight">
            Customer Job dashboard
          </h1>
          <div className="flex items-center gap-3 pt-1">
            {/* Email notice */}
            <span className="flex items-center gap-1.5 text-[12px] text-[#6E9625] font-medium">
              <AlertCircle size={13} />
              To post a job — an email address is required
            </span>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-[13px] font-semibold text-[#1C2C1C] hover:bg-gray-50 transition-colors">
              <Users size={14} />
              Find a Trader
            </button>
            <Link
              href={`/customer-dashboard/leave-review${selectedJob
                ? `?jobId=${selectedJob.id}${selectedJob.selectedTrader ? `&traderId=${selectedJob.selectedTrader.id}` : ''}`
                : ''
                }`}
            >
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-[13px] font-semibold text-[#1C2C1C] hover:bg-gray-50 transition-colors">
                <Star size={14} />
                Leave a Review
              </button>
            </Link>
            <Link href="/post-job">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6E9625] text-white text-[13px] font-bold hover:bg-[#58791C] transition-colors">
                + Post a Job
              </button>
            </Link>
          </div>
        </div>

        {/* ── Main Grid: left (180px) + right (1fr) ────────────────────── */}
        <div className="grid grid-cols-[240px_1fr] gap-6">

          {/* ── Left: Job History ────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold text-[#1C2C1C]">Job History</h2>
              <button className="text-[12px] font-semibold text-[#6E9625] hover:underline">
                View All
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[60px] rounded-lg bg-white animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-[13px] text-gray-400 px-2">No jobs posted yet.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  return (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full p-4 rounded-xl border transition-all
${isSelected
                          ? "border-[#8BC34A] bg-white"
                          : "border-transparent bg-white hover:border-gray-200"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <p className="text-[12px] font-semibold text-[#1C2C1C] leading-snug line-clamp-2">
                          {job.title}
                        </p>
                      </div>
                      <StatusBadge status={job.status} />
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
                        <Calendar size={9} />
                        {formatDate(job.createdAt)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right: Selected Job Detail ────────────────────────────── */}
          {selectedJob ? (
            <div className="flex flex-col gap-5 min-h-[265px]">

              {/* Top Card: Job Header + Trader Quotes */}
              <div className="space-y-4">

                {/* Header Card */}

                <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-[20px] font-bold text-[#223321]">
                          {selectedJob.title}
                        </h2>

                        <ActiveBadge status={selectedJob.status} />
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-[12px] text-[#8A8A8A]">
                        <Calendar size={12} />
                        Job posted {formatDate(selectedJob.createdAt)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-full border border-[#DCDCDC] flex items-center justify-center">
                        <Edit2 size={14} />
                      </button>

                      <button className="w-8 h-8 rounded-full border border-[#DCDCDC] flex items-center justify-center">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trader Quotes Card */}

                <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[15px] font-bold text-[#223321]">
                      Trader Quotes ({quotesLoading ? "..." : Math.max(quotes.length, quotesCount)})
                    </h3>

                    <div className="flex items-center gap-3">
                      {/* View Quotes button – shown when quotes are available */}
                      {quotes.length > 0 && (
                        <button
                          onClick={() => setQuotesModalOpen(true)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6E9625] hover:bg-[#58791C] text-white rounded-lg text-[12px] font-bold transition-colors shadow-sm"
                        >
                          <Eye size={13} />
                          View Quotes
                        </button>
                      )}
                      <div className="text-[12px] text-[#7D7D7D]">
                        Sort by:
                        <span className="ml-1 font-semibold text-[#223321]">Highest Rated</span>
                      </div>
                    </div>
                  </div>

                  {quotesLoading ? (
                    <p className="text-center text-[13px] text-gray-400 py-8 animate-pulse">
                      Loading quotes...
                    </p>
                  ) : quotes.length > 0 ? (
                    <div className="space-y-4">
                      {quotes.map((quote) => (
                        <TraderQuoteCard
                          key={quote.id}
                          trader={quote.trader || quote}
                          isAssigned={selectedJob?.selectedTrader?.id === (quote.trader?.id || quote.id)}
                          quoteId={quote.id}
                          onAccept={handleAcceptQuote}
                          quoteStatus={quote.status}
                          jobStatus={selectedJob?.status}
                          onStartJob={handleStartJob}
                          onCompleteJob={handleCompleteJob}
                          onCancelJob={handleCancelJob}
                          onOpenChat={(traderId) => handleOpenChat(traderId, selectedJob?.id)}
                        />
                      ))}
                    </div>
                  ) : selectedJob.selectedTrader ? (
                    <>
                      <TraderQuoteCard
                        trader={selectedJob.selectedTrader}
                        isAssigned
                        jobStatus={selectedJob?.status}
                        onStartJob={handleStartJob}
                        onCompleteJob={handleCompleteJob}
                        onCancelJob={handleCancelJob}
                        onOpenChat={(traderId) => handleOpenChat(traderId, selectedJob?.id)}
                      />

                      {quotesCount <= 1 && (
                        <p className="text-center text-[12px] text-gray-400 pt-4">
                          No other trader quotes yet.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-center text-[13px] text-gray-400 py-8">
                      No trader quotes yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Row: Job Details + Saved Traders */}
              <div className="grid grid-cols-[3fr_1.4fr] gap-5">

                {/* Job Details Accordion Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5">
                  <h3 className="text-[14px] font-bold text-[#1C2C1C] py-4 border-b border-gray-100">
                    Job Details
                  </h3>

                  {/* Location */}
                  <AccordionRow
                    icon={<MapPin size={15} className="text-[#4CAF50]" />}
                    label="Location & Address"
                  >
                    <p className="text-[13px] text-gray-600">
                      Postcode:{" "}
                      <strong className="text-[#1C2C1C]">{selectedJob.postcode}</strong>
                    </p>
                    {selectedJob.latitude && selectedJob.longitude && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        {selectedJob.latitude}, {selectedJob.longitude}
                      </p>
                    )}
                  </AccordionRow>

                  {/* Description & Timeline */}
                  <AccordionRow
                    defaultOpen
                    icon={<FileText size={15} className="text-[#4CAF50]" />}
                    label="Description & Timeline"
                  >
                    <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                      {selectedJob.description}
                    </p>
                    <div className="flex items-start gap-0 divide-x divide-gray-200">
                      <div className="pr-5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                          Start Date
                        </p>
                        <p className="text-[13px] font-semibold text-[#1C2C1C]">
                          {formatTimescale(selectedJob.timescale)}
                        </p>
                      </div>
                      <div className="pl-5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                          Budget
                        </p>
                        <p className="text-[13px] font-semibold text-[#1C2C1C]">
                          {formatBudget(selectedJob.budgetRange)}
                        </p>
                      </div>
                    </div>
                    {selectedJob.emergency && (
                      <div className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-[#E53935]">
                        <Zap size={12} fill="#E53935" />
                        Emergency Job
                      </div>
                    )}
                    {(selectedJob.category || selectedJob.skillService || selectedJob.subCategory) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {selectedJob.category && (
                          <span className="px-2.5 py-1 rounded-full bg-[#F0F5E8] text-[#4A6B0A] text-[11px] font-medium">
                            {selectedJob.category.name}
                          </span>
                        )}
                        {selectedJob.skillService && (
                          <span className="px-2.5 py-1 rounded-full bg-[#F0F5E8] text-[#4A6B0A] text-[11px] font-medium">
                            {selectedJob.skillService.name}
                          </span>
                        )}
                        {selectedJob.subCategory && (
                          <span className="px-2.5 py-1 rounded-full bg-[#F0F5E8] text-[#4A6B0A] text-[11px] font-medium">
                            {selectedJob.subCategory.name}
                          </span>
                        )}
                      </div>
                    )}
                  </AccordionRow>

                  {/* Uploaded Images */}
                  <AccordionRow
                    icon={<ImageIcon size={15} className="text-[#4CAF50]" />}
                    label={`Uploaded Images (${selectedJob.attachments?.length ?? 0})`}
                  >
                    {selectedJob.attachments?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0"
                          >
                            <img
                              src={att.url?.startsWith("undefined") ? `/${att.file}` : att.url}
                              alt="Job attachment"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12px] text-gray-400">No images uploaded.</p>
                    )}
                  </AccordionRow>
                </div>

                {/* Saved Traders Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 h-fit">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bookmark size={14} className="text-[#4CAF50]" />
                      <h3 className="text-[13px] font-bold text-[#1C2C1C]">Saved Traders</h3>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500">
                      {savedTradersLoading ? "..." : savedTraders.length}
                    </span>
                  </div>

                  {savedTradersLoading ? (
                    <p className="text-center text-[13px] text-gray-400 py-4 animate-pulse">
                      Loading...
                    </p>
                  ) : savedTraders.length > 0 ? (
                    <div className="flex flex-col divide-y divide-gray-100">
                      {savedTraders.map((item) => {
                        const t = item.trader || item;
                        return (
                          <div
                            key={t.id || t._id || Math.random()}
                            className="flex items-center gap-2.5 py-3 cursor-pointer group"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                              {t.fullName ? t.fullName[0].toUpperCase() : "T"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-[#1C2C1C] truncate">
                                {t.fullName || "Unknown Trader"}
                              </p>
                              <p className="text-[10px] text-gray-400">Saved Trader</p>
                            </div>
                            <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-[13px] text-gray-400 py-4">
                      No saved traders.
                    </p>
                  )}

                  <Link href="/customer-dashboard/saved">
                    <button className="mt-3 w-full text-center text-[12px] font-semibold text-[#6E9625] hover:underline">
                      View all saved
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ) : !loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 flex items-center justify-center p-16 text-[14px] text-gray-400">
              No jobs to display yet.
            </div>
          ) : null}
        </div>
      </div>

      {/* Quotes Modal */}
      {quotesModalOpen && (
        <QuotesModal
          quotes={quotes}
          onClose={() => setQuotesModalOpen(false)}
          onAccept={async (quoteId) => {
            await handleAcceptQuote(quoteId);
            setQuotesModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
