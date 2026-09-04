"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { authApi } from "@/app/api/authApi";
import { Search, MapPin, Tag, MoreHorizontal, Calendar, Star, Send, MessageCircle, ArrowRight, X, Euro, Clock, FileText, Paperclip, Trash2, Play, User, Phone, Mail, Briefcase, Shield, CheckCircle, ChevronDown, Ban, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSocket } from "@/hooks/useSocket";

// Type definitions based on typical job structures and screenshot
interface JobLead {
  id: string;
  jobId: string;
  title: string;
  location: string;
  tag: string;
  status: "Posted" | "Contacted" | "In Progress" | "Completed" | "Closed" | "Rejected" | "Declined";
  rawStatus?: string;
  matchStatus?: string;
  timeAgo: string;
  postedDate: string;
  description: string;
  hasQuoted?: boolean;
  isQuoteAccepted?: boolean;
  timescale?: string;
  budgetRange?: string;
  selectedTraderId?: string;
  selectedTrader?: any;
  quotes?: any[];
  matches?: any[];
  customer: {
    id?: string;
    name: string;
    avatar?: string;
    rating: number;
    reviewsCount: number;
    jobsPosted: number;
  };
}

const formatTimeAgo = (iso: string) => {
  if (!iso) return "—";
  const now = new Date();
  const past = new Date(iso);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const formatBudget = (budget?: string) => {
  if (!budget) return "Under €500";
  if (budget.includes("UNDER_")) return "Under €500";
  if (budget.includes("OVER_")) return "Over €50,000";
  if (budget.startsWith("BETWEEN_")) {
    const parts = budget.replace("BETWEEN_", "").split("_");
    if (parts.length === 2) {
      const p1 = Number(parts[0]).toLocaleString();
      const p2 = Number(parts[1]).toLocaleString();
      return `€${p1} - €${p2}`;
    }
  }
  return budget;
};

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/avt.png";
  if (path.startsWith('http')) return path;

  const rawBase = process.env.NEXT_PUBLIC_API_URL || '';
  const baseUrl = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  const imagePath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${imagePath}`;
};

const formatPostedDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function getUIStatus(item: any): "Posted" | "Contacted" | "In Progress" | "Completed" | "Closed" | "Rejected" | "Declined" {
  const matchStatus = (
    item.matchStatus ||
    item.match?.status ||
    item.myMatch?.status ||
    item.jobMatch?.status ||
    (Array.isArray(item.matches) ? item.matches.find((m: any) => m.traderId === item.traderId || m.isQuoteSubmitted || m.isSelected !== undefined)?.status || item.matches[0]?.status : undefined) ||
    item.quoteDetails?.status ||
    item.myQuote?.status
  )?.toUpperCase();

  const isRejected =
    matchStatus === "REJECTED" ||
    matchStatus === "DECLINED" ||
    item.status === "REJECTED" ||
    item.rawStatus === "REJECTED" ||
    item.status === "DECLINED" ||
    item.rawStatus === "DECLINED" ||
    (Array.isArray(item.matches) && item.matches.some((m: any) => m.status?.toUpperCase() === "REJECTED" || m.status?.toUpperCase() === "DECLINED" || (m.isSelected === false && (item.status === "IN_PROGRESS" || item.status === "ASSIGNED"))));

  // Check if this trader's quote is the one accepted
  const isAccepted = Boolean(
    (item.isQuoteAccepted ||
      matchStatus === "ACCEPTED" ||
      (Array.isArray(item.quotes) && item.quotes.some((q: any) => q.status?.toUpperCase() === "ACCEPTED" && (q.traderId === item.traderId || q.isMyQuote)))) &&
    !isRejected
  );

  // If quote or match is rejected:
  // Return the specific status backend provided: Declined or Rejected
  if (isRejected) {
    if (matchStatus === "DECLINED" || item.status === "DECLINED" || item.rawStatus === "DECLINED") {
      return "Declined";
    }
    return "Rejected";
  }

  if (item.status === "COMPLETED" || item.rawStatus === "COMPLETED") return "Completed";

  if (item.status === "IN_PROGRESS" || item.rawStatus === "IN_PROGRESS") {
    // Only "In Progress" for the trader who was accepted
    if (isAccepted) {
      return "In Progress";
    }
    // If the job is in progress with someone else, it is Rejected to this trader
    return "Rejected";
  }

  if (
    item.status === "CANCELLED" ||
    item.status === "CLOSED" ||
    item.status === "EXPIRED" ||
    item.rawStatus === "CANCELLED" ||
    item.rawStatus === "CLOSED" ||
    item.rawStatus === "EXPIRED"
  ) {
    return "Closed";
  }

  if (
    item.status === "ASSIGNED" ||
    item.status === "QUOTE_RECEIVED" ||
    matchStatus === "ACCEPTED" ||
    matchStatus === "QUOTED" ||
    item.hasQuoted ||
    item.isQuoteAccepted
  ) {
    return "Contacted";
  }

  return "Posted";
}

export default function JobsLeads() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedJob, setSelectedJob] = useState<JobLead | null>(null);
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [fullJobData, setFullJobData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isStartingJob, setIsStartingJob] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    price: "",
    estimatedDays: "",
    message: "",
    availability: "",
  });
  const [quoteAttachments, setQuoteAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Customer profile modal state
  const [isCustomerProfileModalOpen, setIsCustomerProfileModalOpen] = useState(false);
  const [customerProfileData, setCustomerProfileData] = useState<any>(null);
  const [isLoadingCustomerProfile, setIsLoadingCustomerProfile] = useState(false);

  const mapJobLeadItem = (item: any): JobLead => {
    const extractedMatchStatus = (
      item.matchStatus ||
      item.match?.status ||
      item.myMatch?.status ||
      item.jobMatch?.status ||
      (Array.isArray(item.matches)
        ? item.matches.find((m: any) => m.traderId === item.traderId || m.isQuoteSubmitted || m.isSelected !== undefined)?.status || item.matches[0]?.status
        : undefined) ||
      item.myQuote?.status ||
      (Array.isArray(item.quotes) ? item.quotes[0]?.status : undefined)
    );

    const isRejectedMatch = Boolean(
      extractedMatchStatus?.toUpperCase() === "REJECTED" ||
      extractedMatchStatus?.toUpperCase() === "DECLINED" ||
      item.status === "REJECTED" ||
      item.status === "DECLINED" ||
      (Array.isArray(item.matches) && item.matches.some((m: any) => m.status?.toUpperCase() === "REJECTED" || m.status?.toUpperCase() === "DECLINED" || (m.isSelected === false && (item.status === "IN_PROGRESS" || item.status === "ASSIGNED"))))
    );

    const isDeclined = Boolean(
      extractedMatchStatus?.toUpperCase() === "DECLINED" ||
      item.status === "DECLINED" ||
      (Array.isArray(item.matches) && item.matches.some((m: any) => m.status?.toUpperCase() === "DECLINED"))
    );

    const effectiveMatchStatus = isRejectedMatch ? (isDeclined ? "DECLINED" : "REJECTED") : extractedMatchStatus;

    return {
      id: item.id,
      jobId: item.id?.substring(0, 8).toUpperCase() || "",
      title: item.title || "",
      location: item.postcode || "No Location",
      tag: item.category?.name || "General",
      status: getUIStatus({ ...item, matchStatus: effectiveMatchStatus }),
      rawStatus: item.status,
      matchStatus: effectiveMatchStatus,
      timeAgo: formatTimeAgo(item.createdAt),
      postedDate: formatPostedDate(item.createdAt),
      description: item.description || "",
      timescale: item.timescale ? item.timescale.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Flexible",
      budgetRange: item.budgetRange || "Under €500",
      selectedTraderId: item.selectedTraderId || item.selectedTrader?.id,
      selectedTrader: item.selectedTrader,
      quotes: item.quotes,
      matches: item.matches,
      hasQuoted: Boolean(
        item.hasQuoted ||
        item.isQuoted ||
        effectiveMatchStatus === "QUOTED" ||
        effectiveMatchStatus === "ACCEPTED" ||
        effectiveMatchStatus === "REJECTED" ||
        effectiveMatchStatus === "DECLINED" ||
        (Array.isArray(item.quotes) && item.quotes.length > 0) ||
        item.hasSentQuote
      ),
      isQuoteAccepted: Boolean(
        (item.isQuoteAccepted ||
          effectiveMatchStatus === "ACCEPTED" ||
          (Array.isArray(item.quotes) && item.quotes.some((q: any) => q.status?.toUpperCase() === "ACCEPTED" && (q.traderId === item.traderId || q.isMyQuote)))) &&
        !isRejectedMatch
      ),
      customer: {
        id: item.customerId || item.customer?.id || item.customer?._id || "",
        name: item.customer?.fullName || item.customer?.firstName || item.customer?.name || "Valued Customer",
        avatar: item.customer?.profileImage || item.customer?.avatar || undefined,
        rating: item.customer?.rating ?? 10.0,
        reviewsCount: item.customer?.reviewsCount ?? 2,
        jobsPosted: item.customer?.jobsPosted ?? 1,
      },
    };
  };

  useSocket({
    onNewJob: (job) => {
      if (!job || !job.id) return;
      const mapped = mapJobLeadItem(job);
      setJobs((prev) => {
        if (prev.some((j) => j.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });
      setSelectedJob((prev) => prev || mapped);
    },
    onQuoteUpdated: (quote) => {
      if (!quote) return;
      const quoteJobId = quote.jobId || quote.job?.id;
      const statusUpper = quote.status?.toUpperCase();
      const isAccepted = statusUpper === "ACCEPTED";
      const isRejected = statusUpper === "REJECTED" || statusUpper === "DECLINED";

      if (isAccepted && quoteJobId) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === quoteJobId
              ? { ...j, isQuoteAccepted: true, matchStatus: "ACCEPTED", status: "Contacted" }
              : j
          )
        );
        setSelectedJob((prev) => {
          if (prev && prev.id === quoteJobId) {
            return { ...prev, isQuoteAccepted: true, matchStatus: "ACCEPTED", status: "Contacted" };
          }
          return prev;
        });
        setQuoteDetails((prev: any) => {
          if (prev && (prev.id === quote.id || prev.jobId === quoteJobId)) {
            return { ...prev, ...quote, status: "ACCEPTED" };
          }
          return { ...quote, status: "ACCEPTED" };
        });
      } else if (isRejected && quoteJobId) {
        const rejStatus = statusUpper === "DECLINED" ? "Declined" : "Rejected";
        setJobs((prev) =>
          prev.map((j) =>
            j.id === quoteJobId
              ? { ...j, isQuoteAccepted: false, matchStatus: statusUpper, status: rejStatus }
              : j
          )
        );
        setSelectedJob((prev) => {
          if (prev && prev.id === quoteJobId) {
            return { ...prev, isQuoteAccepted: false, matchStatus: statusUpper, status: rejStatus };
          }
          return prev;
        });
        setQuoteDetails((prev: any) => {
          if (prev && (prev.id === quote.id || prev.jobId === quoteJobId)) {
            return { ...prev, ...quote, status: statusUpper };
          }
          return { ...quote, status: statusUpper };
        });
      }
    },
    onTraderDashboardUpdate: () => {
      if (selectedJob?.id) {
        authApi.getMyQuoteByJobId(selectedJob.id).then((res) => {
          const q = res?.data || res;
          if (q) {
            setQuoteDetails(q);
            const statusUpper = q.status?.toUpperCase();
            if (statusUpper === "ACCEPTED") {
              setSelectedJob((prev) => prev ? { ...prev, isQuoteAccepted: true, matchStatus: "ACCEPTED" } : null);
              setJobs((prev) => prev.map((j) => j.id === selectedJob.id ? { ...j, isQuoteAccepted: true, matchStatus: "ACCEPTED" } : j));
            } else if (statusUpper === "REJECTED" || statusUpper === "DECLINED") {
              const rejStatus = statusUpper === "DECLINED" ? "Declined" : "Rejected";
              setSelectedJob((prev) => prev ? { ...prev, isQuoteAccepted: false, matchStatus: statusUpper, status: rejStatus } : null);
              setJobs((prev) => prev.map((j) => j.id === selectedJob.id ? { ...j, isQuoteAccepted: false, matchStatus: statusUpper, status: rejStatus } : j));
            }
          }
        }).catch(() => { });
      }
    },
    onNewNotification: (notif) => {
      const text = (notif?.message || notif?.title || notif?.content || "").toLowerCase();
      if (text.includes("accepted") || text.includes("quote") || text.includes("job") || text.includes("declined") || text.includes("rejected")) {
        if (selectedJob?.id) {
          authApi.getMyQuoteByJobId(selectedJob.id).then((res) => {
            const q = res?.data || res;
            if (q) {
              setQuoteDetails(q);
              const statusUpper = q.status?.toUpperCase();
              if (statusUpper === "ACCEPTED") {
                setSelectedJob((prev) => prev ? { ...prev, isQuoteAccepted: true, matchStatus: "ACCEPTED" } : null);
                setJobs((prev) => prev.map((j) => j.id === selectedJob.id ? { ...j, isQuoteAccepted: true, matchStatus: "ACCEPTED" } : j));
              } else if (statusUpper === "REJECTED" || statusUpper === "DECLINED") {
                const rejStatus = statusUpper === "DECLINED" ? "Declined" : "Rejected";
                setSelectedJob((prev) => prev ? { ...prev, isQuoteAccepted: false, matchStatus: statusUpper, status: rejStatus } : null);
                setJobs((prev) => prev.map((j) => j.id === selectedJob.id ? { ...j, isQuoteAccepted: false, matchStatus: statusUpper, status: rejStatus } : j));
              }
            }
          }).catch(() => { });
        }
      }
    },
    onJobUpdated: (updated) => {
      if (!updated || !updated.id) return;
      const isAccepted = Boolean(
        (updated.isQuoteAccepted || updated.matchStatus === "ACCEPTED") &&
        updated.matchStatus !== "REJECTED"
      );
      setJobs((prev) =>
        prev.map((j) => {
          if (j.id === updated.id) {
            const rawStatus = updated.status ?? j.rawStatus;
            const matchStatus = updated.matchStatus ?? j.matchStatus;
            const quoteAccepted = isAccepted || j.isQuoteAccepted;
            const merged = {
              ...j,
              ...updated,
              rawStatus,
              matchStatus,
              isQuoteAccepted: quoteAccepted,
              status: getUIStatus({ ...j, ...updated, status: rawStatus, matchStatus }),
            };
            return merged;
          }
          return j;
        })
      );
      setSelectedJob((prev) => {
        if (prev && prev.id === updated.id) {
          const rawStatus = updated.status ?? prev.rawStatus;
          const matchStatus = updated.matchStatus ?? prev.matchStatus;
          const quoteAccepted = isAccepted || prev.isQuoteAccepted;
          return {
            ...prev,
            ...updated,
            rawStatus,
            matchStatus,
            isQuoteAccepted: quoteAccepted,
            status: getUIStatus({ ...prev, ...updated, status: rawStatus, matchStatus }),
          };
        }
        return prev;
      });
    },
  });

  useEffect(() => {
    if (selectedJob && (selectedJob.hasQuoted || selectedJob.isQuoteAccepted)) {
      authApi.getMyQuoteByJobId(selectedJob.id).then((res) => {
        const q = res?.data || res;
        setQuoteDetails(q);
        const statusUpper = q?.status?.toUpperCase();
        if (statusUpper === "ACCEPTED") {
          setSelectedJob((prev) => prev ? { ...prev, isQuoteAccepted: true, matchStatus: "ACCEPTED" } : null);
          setJobs((prev) => prev.map((j) => j.id === selectedJob.id ? { ...j, isQuoteAccepted: true, matchStatus: "ACCEPTED" } : j));
        } else if (statusUpper === "REJECTED" || statusUpper === "DECLINED") {
          const rejectedStatus = getUIStatus({ ...selectedJob, matchStatus: statusUpper, rawStatus: selectedJob.rawStatus });
          setSelectedJob((prev) => prev ? { ...prev, isQuoteAccepted: false, matchStatus: statusUpper, status: rejectedStatus } : null);
          setJobs((prev) => prev.map((j) => j.id === selectedJob.id ? { ...j, isQuoteAccepted: false, matchStatus: statusUpper, status: rejectedStatus } : j));
        }
      }).catch((err) => {
        console.error("Failed to fetch quote details for selected job", err);
        setQuoteDetails(null);
      });
    } else {
      setQuoteDetails(null);
    }
  }, [selectedJob?.id, selectedJob?.hasQuoted, selectedJob?.isQuoteAccepted]);

  // Periodic poll for accepted status while viewing a quoted job so Start Job appears without refresh
  useEffect(() => {
    if (!selectedJob?.id || !selectedJob.hasQuoted || selectedJob.isQuoteAccepted) return;
    const interval = setInterval(async () => {
      try {
        const res = await authApi.getMyQuoteByJobId(selectedJob.id);
        const q = res?.data || res;
        const statusUpper = q?.status?.toUpperCase();
        if (statusUpper === "ACCEPTED") {
          setQuoteDetails(q);
          setSelectedJob((prev) => prev ? { ...prev, isQuoteAccepted: true, matchStatus: "ACCEPTED" } : null);
          setJobs((prev) => prev.map((j) => j.id === selectedJob.id ? { ...j, isQuoteAccepted: true, matchStatus: "ACCEPTED" } : j));
        } else if (statusUpper === "REJECTED" || statusUpper === "DECLINED") {
          setQuoteDetails(q);
          const rejectedStatus = getUIStatus({ ...selectedJob, matchStatus: statusUpper, rawStatus: selectedJob.rawStatus });
          setSelectedJob((prev) => prev ? { ...prev, isQuoteAccepted: false, matchStatus: statusUpper, status: rejectedStatus } : null);
          setJobs((prev) => prev.map((j) => j.id === selectedJob.id ? { ...j, isQuoteAccepted: false, matchStatus: statusUpper, status: rejectedStatus } : j));
        }
      } catch (e) { }
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedJob?.id, selectedJob?.hasQuoted, selectedJob?.isQuoteAccepted]);

  useEffect(() => {
    if (isDetailsModalOpen || isQuoteModalOpen || showSuccessModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDetailsModalOpen, isQuoteModalOpen, showSuccessModal]);

  const openQuoteModal = async () => {
    if (!selectedJob) return;
    const isRejected = Boolean(
      selectedJob.matchStatus === "REJECTED" ||
      quoteDetails?.status?.toUpperCase() === "REJECTED" ||
      quoteDetails?.status?.toUpperCase() === "DECLINED"
    );
    const isClosedOrComplete =
      selectedJob.status === "Closed" ||
      selectedJob.status === "Completed" ||
      selectedJob.rawStatus === "CLOSED" ||
      selectedJob.rawStatus === "COMPLETED" ||
      selectedJob.rawStatus === "CANCELLED" ||
      selectedJob.rawStatus === "EXPIRED";

    if (isClosedOrComplete || selectedJob.isQuoteAccepted || isRejected || selectedJob.hasQuoted) {
      return;
    }

    setQuoteForm({ price: "", estimatedDays: "", message: "", availability: "" });
    setQuoteAttachments([]);
    setEditingQuoteId(null);

    if (isRejected) {
      try {
        toast.loading("Loading your previous quote...", { id: "loadQuote" });
        const res = await authApi.getMyQuoteByJobId(selectedJob.id);
        if (res && res.data) {
          const quote = res.data;
          setEditingQuoteId(quote.id);
          const getAvailabilityFromDays = (days: number) => {
            if (days <= 1) return "Within 24 hours";
            if (days <= 3) return "Within 3 days";
            if (days <= 7) return "Within 7 days";
            return "7days +";
          };

          setQuoteForm({
            price: quote.price?.toString() || "",
            estimatedDays: quote.estimatedDays?.toString() || "",
            message: quote.message || "",
            availability: quote.estimatedDays ? getAvailabilityFromDays(quote.estimatedDays) : "",
          });
        }
        toast.dismiss("loadQuote");
      } catch (error) {
        toast.dismiss("loadQuote");
        console.error("Failed to load previous quote", error);
      }
    }

    setIsQuoteModalOpen(true);
  };

  // Revoke Quote: loads the previously declined quote so the trader can revise and resubmit
  const openRevokeQuoteModal = async () => {
    if (!selectedJob) return;

    setQuoteForm({ price: "", estimatedDays: "", message: "", availability: "" });
    setQuoteAttachments([]);
    setEditingQuoteId(null);

    try {
      toast.loading("Loading your previous quote...", { id: "loadQuote" });
      const res = await authApi.getMyQuoteByJobId(selectedJob.id);
      if (res && res.data) {
        const quote = res.data;
        setEditingQuoteId(quote.id);
        const getAvailabilityFromDays = (days: number) => {
          if (days <= 1) return "Within 24 hours";
          if (days <= 3) return "Within 3 days";
          if (days <= 7) return "Within 7 days";
          return "7days +";
        };

        setQuoteForm({
          price: quote.price?.toString() || "",
          estimatedDays: quote.estimatedDays?.toString() || "",
          message: quote.message || "",
          availability: quote.estimatedDays ? getAvailabilityFromDays(quote.estimatedDays) : "",
        });
      }
      toast.dismiss("loadQuote");
    } catch (error) {
      toast.dismiss("loadQuote");
      console.error("Failed to load previous quote", error);
    }

    setIsQuoteModalOpen(true);
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setQuoteAttachments((prev) => [...prev, ...newFiles]);
    }
    // Clear the input value so the same file can be selected again
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setQuoteAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    try {
      setIsSendingQuote(true);

      const mapAvailabilityToDays = (availability: string) => {
        switch (availability) {
          case "Can start immediately": return 1;
          case "Within 24 hours": return 1;
          case "Within 3 days": return 3;
          case "Within 7 days": return 7;
          case "7days +": return 14;
          default: return 1;
        }
      };

      const mappedDays = mapAvailabilityToDays(quoteForm.availability);

      if (editingQuoteId) {
        // Send JSON payload for updates (without attachments to avoid validation error)
        const payload = {
          price: Number(quoteForm.price),
          estimatedDays: mappedDays,
          message: quoteForm.message,
        };
        await authApi.updateQuote(editingQuoteId, payload);
      } else {
        // Send FormData for new quotes
        const formData = new FormData();
        formData.append("price", quoteForm.price);
        formData.append("estimatedDays", String(mappedDays));
        formData.append("message", quoteForm.message);

        quoteAttachments.forEach((file) => {
          formData.append("attachments", file);
        });
        await authApi.sendJobQuote(selectedJob.id, formData);
      }
      // toast.success("Job quote sent successfully!");
      setIsQuoteModalOpen(false);
      setShowSuccessModal(true);
      setJobs((prevJobs) =>
        prevJobs.map((j) =>
          j.id === selectedJob.id ? { ...j, hasQuoted: true, status: "Contacted", matchStatus: "QUOTED" } : j
        )
      );
      setSelectedJob((prev) => (prev ? { ...prev, hasQuoted: true, status: "Contacted", matchStatus: "QUOTED" } : null));
    } catch (error: any) {
      console.error("Failed to send quote", error);
      toast.error(error?.response?.data?.message || "Failed to send job quote");
    } finally {
      setIsSendingQuote(false);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await authApi.getMatchedJobs();
        console.log("Matched Jobs Response:", res);
        if (res && res.data && res.data.length > 0) {
          const mappedJobs: JobLead[] = res.data.map((item: any) => mapJobLeadItem(item));
          setJobs(mappedJobs);
          setSelectedJob(mappedJobs[0]);
        } else {
          setJobs([]);
          setSelectedJob(null);
        }
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        setJobs([]);
        setSelectedJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJob?.id) return;

    const loadJobDetails = async () => {
      try {
        const data = await authApi.getCustomerJobById(selectedJob.id);
        setFullJobData(data?.data || data);
      } catch (error) {
        console.error("Failed to load job details", error);
      }
    };

    loadJobDetails();
  }, [selectedJob?.id]);

  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (activeTab !== "All") {
      if (activeTab === "Closed") {
        result = result.filter((j) => j.status === "Closed" || j.status === "Rejected" || j.status === "Declined");
      } else {
        result = result.filter((j) => j.status === activeTab);
      }
    }
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(lower) ||
          j.location.toLowerCase().includes(lower) ||
          j.tag.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [jobs, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const tabs = ["All", "Posted", "Contacted", "In Progress", "Completed", "Closed"];

  // Helper to count jobs for tabs
  const getTabCount = (tab: string) => {
    if (tab === "All") return jobs.length;
    if (tab === "Closed") return jobs.filter((j) => j.status === "Closed" || j.status === "Rejected" || j.status === "Declined").length;
    return jobs.filter((j) => j.status === tab).length;
  };

  const renderStatusBadge = (status: string) => {
    console.log("ststus", status)
    const s = status?.toUpperCase();
    if (s === "REJECTED" || status === "Rejected") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#FDE2D6] border border-[#F5C2C7] text-[#D32F2F] text-[11px] font-bold">
          Rejected
        </div>
      );
    }
    if (s === "DECLINED" || status === "Declined") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#FDE2D6] border border-[#F5C2C7] text-[#D32F2F] text-[11px] font-bold">
          Declined
        </div>
      );
    }
    if (status === "Posted" || s === "POSTED" || s === "LIVE" || s === "OPEN") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#D4EDDA] border border-[#A9D18E] text-[#1E6B24] text-[11px] font-bold">
          Posted
        </div>
      );
    }
    if (status === "Contacted" || s === "CONTACTED" || s === "QUOTED" || s === "QUOTE_RECEIVED") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#72A8E5] border border-[#5B9BD5] text-[#103B75] text-[11px] font-bold">
          Contacted
        </div>
      );
    }
    if (status === "In Progress" || s === "IN_PROGRESS" || s === "IN PROGRESS") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#F4D03F] border border-[#D8BA28] text-[#9A5B13] text-[11px] font-bold">
          In Progress
        </div>
      );
    }
    if (status === "Completed" || s === "COMPLETED") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#144A20] border border-[#0E3816] text-white text-[11px] font-bold">
          Completed
        </div>
      );
    }
    if (status === "Closed" || s === "CLOSED" || s === "CANCELLED" || s === "EXPIRED") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#A8A8A8] border border-[#8C8C8C] text-[#3D3D3D] text-[11px] font-bold">
          Closed
        </div>
      );
    }
    // Default fallback
    return (
      <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#D4EDDA] border border-[#A9D18E] text-[#1E6B24] text-[11px] font-bold">
        {status || "Posted"}
      </div>
    );
  };

  return (
    <>
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-sans text-[#1C2C1C]">
        {/* Full-width Header: Title + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#1C2C1C] tracking-tight">Jobs & Leads</h1>
            <p className="text-[13px] text-gray-500 font-medium">Browse and manage matched job requests from customers</p>
          </div>

          <div className="relative w-full sm:w-[320px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[42px] pl-10 pr-4 rounded-xl border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6E9625]/20 focus:border-[#6E9625] transition-all bg-white shadow-xs"
            />
          </div>
        </div>

        {/* Full-width Tabs Bar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => {
            const count = getTabCount(tab);
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                  const firstOfTab = jobs.find(j => tab === "All" || (tab === "Closed" ? (j.status === "Closed" || j.status === "Rejected" || j.status === "Declined") : j.status === tab));
                  if (firstOfTab) setSelectedJob(firstOfTab);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${isActive
                  ? "bg-[#1C2C1C] text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {tab} <span className={isActive ? "text-white/70" : "text-gray-400"}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Grid: Left list (340-360px) + Right details (1fr) */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[360px_1fr] gap-6 items-start">

          {/* Left Column: Tighter & Smaller Job List */}
          <div className="flex flex-col gap-3 min-w-0">
            {loading ? (
              <div className="text-center py-10 text-gray-500 text-[14px] bg-white rounded-2xl border border-gray-100">
                Loading jobs...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-[14px] bg-white rounded-2xl border border-gray-100">
                No jobs found.
              </div>
            ) : (
              paginatedJobs.map((job, idx) => {
                const isSelected = selectedJob?.id === job.id;
                const isJobClosed =
                  (job.rawStatus || job.status)?.toUpperCase() === "CLOSED" ||
                  (job.rawStatus || job.status)?.toUpperCase() === "CANCELLED" ||
                  (job.rawStatus || job.status)?.toUpperCase() === "EXPIRED";
                return (
                  <div
                    key={`${job.id}-${idx}`}
                    onClick={() => setSelectedJob(job)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border-2 flex flex-col gap-2.5 shadow-xs ${isJobClosed ? "bg-[#F5F5F5]" : "bg-white"
                      } ${isSelected
                        ? "border-[#6E9625] bg-white ring-2 ring-[#6E9625]/20 shadow-sm"
                        : "border-transparent hover:border-gray-200"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      {renderStatusBadge(job.rawStatus || job.status)}
                      <span className="text-[12px] text-gray-400 font-medium">{job.timeAgo}</span>
                    </div>

                    <h3 className="text-[15px] font-bold text-[#1C2C1C] leading-snug line-clamp-2">
                      {job.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                      <span className="text-gray-300">•</span>
                      <Tag size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">{job.tag}</span>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 text-[12px] font-bold text-[#1C2C1C]">
                        <Euro size={13} className="text-[#6E9625]" />
                        <span>{formatBudget(job.budgetRange)}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                        <Calendar size={12} />
                        {job.postedDate}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination */}
            {!loading && filteredJobs.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${currentPage === page
                        ? "bg-[#1C2C1C] text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Expansive Job Details with ALL info directly visible on page */}
          {filteredJobs.length > 0 && (
            selectedJob ? (
              <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-200/80 sticky top-[100px] max-h-[calc(100vh-115px)] flex flex-col overflow-hidden">

                {/* Scrollable details container */}
                <div className="p-6 sm:p-7 overflow-y-auto flex-1 flex flex-col gap-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200">

                  {/* Header Row: Badges & Timestamps */}
                  <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block bg-[#EAF3DE] text-[#557A18] font-bold text-[11px] px-3 py-1 rounded-full tracking-wide">
                        JOB-{selectedJob.jobId}
                      </span>
                      {(() => {
                        const quoteStatusUpper = quoteDetails?.status?.toUpperCase();
                        const matchStatusUpper = selectedJob.matchStatus?.toUpperCase();
                        const isQuoteOrMatchRejected = Boolean(
                          quoteStatusUpper === "REJECTED" ||
                          quoteStatusUpper === "DECLINED" ||
                          matchStatusUpper === "REJECTED" ||
                          matchStatusUpper === "DECLINED" ||
                          selectedJob.status === "Rejected" ||
                          selectedJob.status === "Declined"
                        );

                        const jobRawUpper = (fullJobData?.status || selectedJob.rawStatus || "").toUpperCase();
                        const hasOtherTraderAccepted = Boolean(
                          ((jobRawUpper === "IN_PROGRESS" || jobRawUpper === "ASSIGNED" || jobRawUpper === "COMPLETED") && !selectedJob.isQuoteAccepted) ||
                          (fullJobData?.selectedTraderId && !selectedJob.isQuoteAccepted) ||
                          (selectedJob.selectedTraderId && !selectedJob.isQuoteAccepted) ||
                          (Array.isArray(fullJobData?.quotes) && fullJobData.quotes.some((q: any) => q.status?.toUpperCase() === "ACCEPTED" && q.id !== quoteDetails?.id)) ||
                          (Array.isArray(selectedJob.quotes) && selectedJob.quotes.some((q: any) => q.status?.toUpperCase() === "ACCEPTED" && q.id !== quoteDetails?.id))
                        );

                        if (isQuoteOrMatchRejected) {
                          if (quoteStatusUpper === "DECLINED" || matchStatusUpper === "DECLINED" || selectedJob.status === "Declined") {
                            return renderStatusBadge("Declined");
                          }
                          return renderStatusBadge("Rejected");
                        }
                        if (selectedJob.status === "Completed" || selectedJob.rawStatus === "COMPLETED" || jobRawUpper === "COMPLETED") {
                          return renderStatusBadge("Completed");
                        }
                        if ((selectedJob.status === "In Progress" || selectedJob.rawStatus === "IN_PROGRESS" || jobRawUpper === "IN_PROGRESS") && selectedJob.isQuoteAccepted) {
                          return renderStatusBadge("In Progress");
                        }
                        if (
                          selectedJob.status === "Closed" ||
                          selectedJob.rawStatus === "CLOSED" ||
                          selectedJob.rawStatus === "CANCELLED" ||
                          selectedJob.rawStatus === "EXPIRED" ||
                          ((jobRawUpper === "IN_PROGRESS" || jobRawUpper === "ASSIGNED") && !selectedJob.isQuoteAccepted)
                        ) {
                          return renderStatusBadge(hasOtherTraderAccepted ? "Rejected" : "Closed");
                        }
                        if (selectedJob.isQuoteAccepted || selectedJob.hasQuoted) {
                          return renderStatusBadge("Contacted");
                        }
                        return renderStatusBadge(selectedJob.status);
                      })()}
                      {fullJobData?.emergency && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-bold">
                          Emergency
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-[12px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> Posted {selectedJob.timeAgo}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} /> {selectedJob.postedDate}
                      </span>
                    </div>
                  </div>

                  {/* Title & Service Category Tags */}
                  <div>
                    <h2 className="text-[22px] sm:text-[25px] font-extrabold text-[#1C2C1C] leading-tight mb-2.5">
                      {selectedJob.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F4F7EE] text-[#557A18] text-[12px] font-semibold">
                        <Tag size={12} /> {fullJobData?.category?.name || selectedJob.tag}
                      </span>
                      {fullJobData?.subCategory?.name && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[12px] font-medium">
                          {fullJobData.subCategory.name}
                        </span>
                      )}
                      {fullJobData?.skillService?.name && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[12px] font-medium">
                          {fullJobData.skillService.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Block Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                        LOCATION
                      </span>
                      <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#1C2C1C] truncate">
                        <MapPin size={14} className="text-[#6E9625] shrink-0" />
                        <span className="truncate">{fullJobData?.postcode || selectedJob.location}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                        BUDGET
                      </span>
                      <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#1C2C1C] truncate">
                        <Euro size={14} className="text-[#6E9625] shrink-0" />
                        <span className="truncate">{formatBudget(selectedJob.budgetRange)}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                        TIMESCALE
                      </span>
                      <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#1C2C1C] truncate">
                        <Clock size={14} className="text-[#6E9625] shrink-0" />
                        <span className="truncate">{fullJobData?.timescale?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()) || selectedJob.timescale || "Flexible"}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                        QUOTES
                      </span>
                      <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#1C2C1C] truncate">
                        <span className="w-2 h-2 rounded-full bg-[#6E9625]" />
                        <span>{fullJobData?.quotesReceived ?? fullJobData?.quotesCount ?? (selectedJob.hasQuoted ? 1 : 0)} received</span>
                      </div>
                    </div>
                  </div>

                  {/* Full Job Description - No View Full Details Needed */}
                  <div>
                    <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                      JOB DESCRIPTION
                    </span>
                    <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-100 text-[13.5px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {fullJobData?.description || selectedJob.description}
                    </div>
                  </div>

                  {/* Direct Attachments Previews */}
                  {fullJobData?.attachments && fullJobData.attachments.length > 0 && (
                    <div>
                      <span className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                        ATTACHMENTS ({fullJobData.attachments.length})
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {fullJobData.attachments.map((att: any, idx: number) => {
                          let cleanPath = att.url || att.file || att.path || "";
                          if (cleanPath.startsWith("undefined")) cleanPath = cleanPath.replace("undefined", "");
                          const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
                          const fullUrl = cleanPath.startsWith("http") ? cleanPath : `${baseUrl}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
                          const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(cleanPath);

                          return (
                            <a
                              key={idx}
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 bg-white hover:border-[#6E9625] transition-all shadow-xs"
                            >
                              {isImage ? (
                                <img src={fullUrl} alt={att.filename || "Attachment"} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#6E9625] transition-colors">
                                  <FileText size={18} />
                                </div>
                              )}
                              <div className="min-w-0 pr-1">
                                <p className="text-[12px] font-bold text-[#1C2C1C] truncate max-w-[140px]">
                                  {att.filename || cleanPath.split("/").pop() || "Attachment"}
                                </p>
                                <span className="text-[11px] text-[#6E9625] font-semibold group-hover:underline">
                                  Open file ↗
                                </span>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Customer Information Bar */}
                  <div className="p-3.5 rounded-2xl border border-gray-100 bg-[#F8F9FA] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center font-bold text-gray-600 text-sm shadow-xs">
                        {fullJobData?.customer?.profileImage || selectedJob.customer?.avatar ? (
                          <img
                            src={getImageUrl(fullJobData?.customer?.profileImage || selectedJob.customer?.avatar)}
                            alt={fullJobData?.customer?.fullName || selectedJob.customer?.name || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>
                            {(fullJobData?.customer?.fullName || selectedJob.customer?.name) ? (fullJobData?.customer?.fullName || selectedJob.customer?.name).charAt(0).toUpperCase() : 'C'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5">
                          POSTED BY
                        </span>
                        <h4 className="text-[14px] font-bold text-[#1C2C1C] truncate">
                          {fullJobData?.customer?.fullName || selectedJob.customer?.name || 'Customer'}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        const customerId = selectedJob.customer?.id;
                        if (!customerId) {
                          toast.error("Customer ID not available");
                          return;
                        }
                        try {
                          setIsLoadingCustomerProfile(true);
                          setIsCustomerProfileModalOpen(true);
                          setCustomerProfileData(null);
                          const res = await authApi.getCustomerProfileForTrader(customerId);
                          setCustomerProfileData(res?.data || res);
                        } catch (err: any) {
                          console.error("Failed to load customer profile", err);
                          toast.error(err?.response?.data?.message || "Failed to load customer profile");
                          setIsCustomerProfileModalOpen(false);
                        } finally {
                          setIsLoadingCustomerProfile(false);
                        }
                      }}
                      className="px-4 py-2 border border-gray-200 bg-white text-[#6E9625] rounded-xl text-[12px] font-bold hover:bg-gray-50 transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      View Profile
                    </button>
                  </div>

                  {/* Quote Sent Info Card (if already quoted) */}
                  {selectedJob.hasQuoted && quoteDetails && (() => {
                    const isQuoteRejected = quoteDetails?.status?.toUpperCase() === "REJECTED" || quoteDetails?.status?.toUpperCase() === "DECLINED" || selectedJob.matchStatus === "REJECTED";
                    const rawUpper = (selectedJob.rawStatus || "").toUpperCase();
                    const isAutoRejected = isQuoteRejected && (rawUpper === "IN_PROGRESS" || rawUpper === "ASSIGNED" || rawUpper === "COMPLETED");
                    const isManualDecline = isQuoteRejected && !isAutoRejected;

                    return (
                      <div className={`p-3.5 rounded-2xl border ${isAutoRejected
                        ? "border-red-200 bg-red-50/40"
                        : isManualDecline
                          ? "border-amber-200 bg-amber-50/40"
                          : (quoteDetails?.status?.toUpperCase() === "ACCEPTED" || selectedJob.isQuoteAccepted)
                            ? "border-emerald-200 bg-emerald-50/40"
                            : "border-[#D5E8B5] bg-[#F7FAF2]"
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                          {isAutoRejected ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/30 text-[11px] font-bold uppercase tracking-wide">
                              <Ban size={12} className="text-[#FF3B30]" /> Quote Rejected
                            </span>
                          ) : isManualDecline ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold uppercase tracking-wide">
                              <RefreshCw size={12} /> Quote Declined
                            </span>
                          ) : quoteDetails?.status?.toUpperCase() === "ACCEPTED" || selectedJob.isQuoteAccepted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wide">
                              <CheckCircle size={12} /> Quote Accepted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E4F2CC] text-[#4E7519] text-[11px] font-bold uppercase tracking-wide">
                              <CheckCircle size={12} /> Your Quote Sent
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[13px] pt-1">
                          <div>
                            <span className="text-[10.5px] font-bold text-gray-400 uppercase block">Price</span>
                            <span className="text-[16px] font-extrabold text-[#1C2C1C]">€{quoteDetails.price}</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] font-bold text-gray-400 uppercase block">Estimated Duration</span>
                            <span className="text-[16px] font-extrabold text-[#1C2C1C]">{quoteDetails.estimatedDays} {quoteDetails.estimatedDays === 1 ? 'day' : 'days'}</span>
                          </div>
                        </div>
                        {quoteDetails.message && (
                          <div className="mt-2 pt-2 border-t border-[#E2EED2] text-[12.5px] text-gray-600">
                            <span className="font-semibold text-gray-500">Message: </span>{quoteDetails.message}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Sticky Pinned Action Bar at the Bottom: 100% visible always */}
                <div className="p-4 sm:px-6 bg-white/95 backdrop-blur-xs border-t border-gray-100 shrink-0">
                  {(() => {
                    const quoteStatusUpper = quoteDetails?.status?.toUpperCase();
                    const matchStatusUpper = selectedJob.matchStatus?.toUpperCase();
                    const isRejected = Boolean(
                      quoteStatusUpper === "REJECTED" ||
                      quoteStatusUpper === "DECLINED" ||
                      matchStatusUpper === "REJECTED" ||
                      matchStatusUpper === "DECLINED" ||
                      selectedJob.status === "Rejected" ||
                      selectedJob.status === "Declined"
                    );

                    // Check if another trader was accepted for this job
                    const jobRawUpper = (fullJobData?.status || selectedJob.rawStatus || "").toUpperCase();
                    const hasOtherTraderAccepted = Boolean(
                      ((jobRawUpper === "IN_PROGRESS" || jobRawUpper === "ASSIGNED" || jobRawUpper === "COMPLETED") && !selectedJob.isQuoteAccepted) ||
                      (fullJobData?.selectedTraderId && !selectedJob.isQuoteAccepted) ||
                      (selectedJob.selectedTraderId && !selectedJob.isQuoteAccepted) ||
                      (Array.isArray(fullJobData?.quotes) && fullJobData.quotes.some((q: any) => q.status?.toUpperCase() === "ACCEPTED" && q.id !== quoteDetails?.id)) ||
                      (Array.isArray(selectedJob.quotes) && selectedJob.quotes.some((q: any) => q.status?.toUpperCase() === "ACCEPTED" && q.id !== quoteDetails?.id))
                    );

                    // Case 1 (Auto-rejected): customer accepted another trader's quote, so all remaining quotes are rejected
                    const isAutoRejected = isRejected && hasOtherTraderAccepted;

                    // Case 2 (Manual decline): customer manually clicked Decline on this quote while the job is still open without an accepted trader
                    const isManualDecline = isRejected && !hasOtherTraderAccepted;

                    const isClosed =
                      (!isRejected && selectedJob.status === "Closed") ||
                      selectedJob.rawStatus === "CLOSED" ||
                      selectedJob.rawStatus === "CANCELLED" ||
                      selectedJob.rawStatus === "EXPIRED";
                    const isCompleted =
                      selectedJob.status === "Completed" ||
                      selectedJob.rawStatus === "COMPLETED" ||
                      jobRawUpper === "COMPLETED";
                    const isAccepted = !isRejected && Boolean(
                      quoteStatusUpper === "ACCEPTED" ||
                      matchStatusUpper === "ACCEPTED" ||
                      (selectedJob.isQuoteAccepted && !quoteDetails)
                    );
                    const hasQuoted = selectedJob.hasQuoted;

                    // Manual decline allows Revoke Quote (clickable), auto-reject is disabled
                    const isSendDisabled = isClosed || isCompleted || isAccepted || isAutoRejected || (!isManualDecline && hasQuoted);

                    let buttonText = "Send Job Quote";
                    if (isAccepted) buttonText = "Quote Accepted";
                    else if (isAutoRejected) buttonText = "Quote Rejected";
                    else if (isManualDecline) buttonText = "Revoke Quote";
                    else if (hasQuoted) buttonText = "Quote Sent";
                    else if (isCompleted) buttonText = "Job Completed";
                    else if (isClosed) buttonText = "Job Closed";

                    const showStartJob = isAccepted && !isCompleted && !isClosed;

                    return (
                      <div className={`grid gap-3 ${showStartJob ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
                        {/* Send / Status Quote Button */}
                        <button
                          onClick={isManualDecline ? openRevokeQuoteModal : openQuoteModal}
                          disabled={isSendDisabled}
                          className={`w-full h-[46px] rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all ${isAutoRejected
                            ? "bg-red-50 text-[#FF3B30] border border-[#FF3B30]/30 cursor-not-allowed"
                            : isManualDecline
                              ? "bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 cursor-pointer active:scale-[0.99]"
                              : isSendDisabled
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                : "bg-[#1C2C1C] hover:bg-[#2A412A] text-white shadow-sm cursor-pointer active:scale-[0.99]"
                            }`}
                        >
                          {isAutoRejected ? (
                            <Ban size={16} className="text-[#FF3B30]" />
                          ) : isManualDecline ? (
                            <RefreshCw size={16} className="text-amber-700" />
                          ) : isAccepted ? (
                            <CheckCircle size={16} className="text-emerald-600" />
                          ) : (
                            <Send size={16} />
                          )}
                          {buttonText}
                        </button>

                        {/* Start Job Button (if accepted) */}
                        {showStartJob && (
                          <button
                            disabled={isStartingJob || selectedJob.rawStatus === "IN_PROGRESS"}
                            onClick={async () => {
                              try {
                                setIsStartingJob(true);
                                toast.loading("Starting job...", { id: "startJob" });
                                await authApi.startJob(selectedJob.id);
                                toast.success("Job started successfully!", { id: "startJob" });

                                setJobs((prevJobs) =>
                                  prevJobs.map((j) =>
                                    j.id === selectedJob.id ? { ...j, status: "In Progress", rawStatus: "IN_PROGRESS" } : j
                                  )
                                );
                                setSelectedJob((prev) => (prev ? { ...prev, status: "In Progress", rawStatus: "IN_PROGRESS" } : null));
                              } catch (error: any) {
                                console.error("Failed to start job", error);
                                toast.error(error?.response?.data?.message || "Failed to start job", { id: "startJob" });
                              } finally {
                                setIsStartingJob(false);
                              }
                            }}
                            className={`w-full h-[46px] rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 transition-all ${isStartingJob || selectedJob.rawStatus === "IN_PROGRESS"
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300"
                              : "bg-gradient-to-r from-[#6E9625] to-[#8BC34A] hover:from-[#58791C] hover:to-[#6E9625] text-white shadow-[0_4px_12px_rgba(110,150,37,0.3)] hover:shadow-[0_6px_16px_rgba(110,150,37,0.4)] cursor-pointer active:scale-[0.99]"
                              }`}
                          >
                            {selectedJob.rawStatus === "IN_PROGRESS" ? (
                              "Job Started"
                            ) : isStartingJob ? (
                              "Starting..."
                            ) : (
                              <>
                                <Play size={17} className="fill-current" />
                                Start Job
                              </>
                            )}
                          </button>
                        )}

                        {/* Contact Customer Button */}
                        <button
                          onClick={async () => {
                            const targetCustomerId = fullJobData?.customer?.id || fullJobData?.customer?._id || fullJobData?.customerId || selectedJob?.customer?.id;

                            if (!targetCustomerId) {
                              toast.error("Could not find customer contact details.");
                              return;
                            }

                            try {
                              toast.loading("Opening conversation...", {
                                id: "openConversation",
                              });

                              const res = await authApi.getOrCreateTraderConversation(
                                targetCustomerId,
                                selectedJob.id
                              );

                              const conversation = res?.data || res;
                              const conversationId = conversation?.id || conversation?._id;

                              if (!conversationId) {
                                toast.error("Failed to create conversation.", {
                                  id: "openConversation",
                                });
                                return;
                              }

                              toast.success("Conversation opened", {
                                id: "openConversation",
                              });

                              router.push(
                                `/trader/inbox?conversationId=${conversationId}&customerId=${targetCustomerId}&jobId=${selectedJob.id}`
                              );
                            } catch (error: any) {
                              console.error("Failed to open customer conversation:", error);
                              toast.error(
                                error?.response?.data?.message ||
                                error?.message ||
                                "Failed to open conversation.",
                                {
                                  id: "openConversation",
                                }
                              );
                            }
                          }}
                          className="w-full h-[46px] rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#1C2C1C] text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                        >
                          <MessageCircle size={16} className="text-[#6E9625]" />
                          Contact Customer
                        </button>
                      </div>
                    );
                  })()}
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-[24px] p-8 text-center text-gray-500 border border-gray-100 flex items-center justify-center h-[300px]">
                Select a job to view details
              </div>
            ))}

        </div>
      </div>

      {/* ── Send Quote Modal ──────────────────────────────────────── */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsQuoteModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[18px] font-bold text-[#1C2C1C]">Send Quote</h2>
                <p className="text-[12px] text-gray-400 mt-0.5 truncate max-w-[280px]">
                  {selectedJob?.title}
                </p>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendQuote} className="flex flex-col gap-4">
              {/* Price */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Price (€)
                </label>
                <div className="relative">
                  <Euro size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    placeholder="e.g. 5000"
                    value={quoteForm.price}
                    onChange={(e) => setQuoteForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 transition-all"
                  />
                </div>
              </div>

              {/* Estimated Days */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Estimated Days
                </label>
                <div className="relative">
                  <select
                    required
                    value={quoteForm.estimatedDays}
                    onChange={(e) => setQuoteForm((f) => ({ ...f, estimatedDays: e.target.value }))}
                    className="w-full px-4 py-2.5 pl-9 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] bg-white focus:outline-none focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select estimated time</option>
                    <option value="Under 1 day">Under 1 day</option>
                    <option value="1 - 3 days">1 - 3 days</option>
                    <option value="Under 7 days">Under 7 days</option>
                    <option value="1 - 2 weeks">1 - 2 weeks</option>
                    <option value="2 - 4 weeks">2 - 4 weeks</option>
                    <option value="Over 1 month">Over 1 month</option>
                  </select>
                  <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Availability
                </label>
                <div className="relative">
                  <select
                    required
                    value={quoteForm.availability}
                    onChange={(e) => setQuoteForm((f) => ({ ...f, availability: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] bg-white focus:outline-none focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select your availability</option>
                    <option value="Can start immediately">Can start immediately</option>
                    <option value="Within 24 hours">Within 24 hours</option>
                    <option value="Within 3 days">Within 3 days</option>
                    <option value="Within 7 days">Within 7 days</option>
                    <option value="7days +">7days +</option>
                  </select>
                  <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
                  placeholder="e.g. I can complete this work quickly"
                  value={quoteForm.message}
                  onChange={(e) => setQuoteForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 transition-all resize-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-[12px] font-semibold text-[#1C2C1C] mb-1.5">
                  Attachments <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleAttachmentSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 text-[13px] text-gray-500 hover:border-[#8BC34A] hover:text-[#6E9625] transition-colors"
                >
                  <Paperclip size={15} />
                  Add Files
                </button>

                {/* File previews */}
                {quoteAttachments.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5 max-h-[120px] overflow-y-auto">
                    {quoteAttachments.map((file, idx) => (
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
                          onClick={() => removeAttachment(idx)}
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
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="flex-1 h-[46px] rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingQuote}
                  className="flex-1 h-[46px] rounded-xl bg-[#1C2C1C] hover:bg-[#2A412A] text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={15} />
                  {isSendingQuote ? "Sending..." : "Submit Quote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🎉 Success Modal 🎉 */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
          <div className="bg-white rounded-3xl p-8 w-full max-w-[400px] relative flex flex-col items-center text-center z-10 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#E6F5E9] flex items-center justify-center mb-6">
              <FileText size={28} className="text-[#32C850]" />
            </div>
            <h2 className="text-[20px] font-extrabold text-[#002E1B] mb-2">Thank you for submitting your quote request.
            </h2>
            <p className="text-[14px] text-gray-500 mb-8">
              It has been forwarded to the customer for review.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/trader/quote");
              }}
              className="w-full h-[48px] rounded-xl border border-gray-200 bg-[#F9FAFB] hover:bg-gray-100 text-[#1C2C1C] text-[14px] font-bold flex items-center justify-center transition-colors cursor-pointer"
            >
              View Submitted Quotes
            </button>
          </div>
        </div>
      )}



      {/* ── Customer Profile Modal ─────────────────────────── */}
      {isCustomerProfileModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setIsCustomerProfileModalOpen(false)}
        >
          <div
            className="bg-white rounded-[24px] w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-[18px] font-extrabold text-[#1C2C1C]">Customer Profile</h2>
              <button
                onClick={() => setIsCustomerProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {isLoadingCustomerProfile ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6E9625]" />
                  <p className="text-[13px] text-gray-500">Loading customer profile...</p>
                </div>
              ) : customerProfileData ? (
                <div className="flex flex-col gap-6">

                  {/* Avatar + Name */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-600 text-xl flex-shrink-0">
                      {customerProfileData.profileImage ? (
                        <img
                          src={getImageUrl(customerProfileData.profileImage)}
                          alt={customerProfileData.fullName || "Customer"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={28} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[20px] font-extrabold text-[#1C2C1C] leading-tight">
                        {customerProfileData.fullName || "Customer"}
                      </h3>
                      <p className="text-[13px] text-gray-500 mt-0.5">
                        Member since{" "}
                        {customerProfileData.createdAt
                          ? new Date(customerProfileData.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info & Stats */}
                  <div className="bg-[#F8F9F5] rounded-2xl p-4 flex flex-col gap-3">
                    <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Details</h4>

                    {/* Email hidden
                    {customerProfileData.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <Mail size={14} className="text-[#6E9625]" />
                        </div>
                        <span className="text-[13px] font-semibold text-[#1C2C1C]">{customerProfileData.email}</span>
                      </div>
                    )} */}

                    {/* Phone hidden
                    {customerProfileData.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <Phone size={14} className="text-[#6E9625]" />
                        </div>
                        <span className="text-[13px] font-semibold text-[#1C2C1C]">
                          {customerProfileData.phone}
                        </span>
                      </div>
                    )} */}

                    <div className="flex items-center gap-3 mt-2 border-t border-gray-200 pt-3">
                      <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
                        <Briefcase size={16} className="text-[#6E9625]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black text-[#1C2C1C] leading-none">
                          {customerProfileData.totalJobsPosted ?? 0}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">Total Jobs Posted</span>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 text-[13px]">
                  No customer profile data available.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setIsCustomerProfileModalOpen(false)}
                className="w-full h-[44px] bg-[#1C2C1C] text-white rounded-xl text-[14px] font-bold hover:bg-[#2A412A] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
