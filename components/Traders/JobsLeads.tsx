"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { authApi } from "@/app/api/authApi";
import { Search, MapPin, Tag, MoreHorizontal, Calendar, Star, Send, MessageCircle, ArrowRight, X, Euro, Clock, FileText, Paperclip, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Type definitions based on typical job structures and screenshot
interface JobLead {
  id: string;
  jobId: string;
  title: string;
  location: string;
  tag: string;
  status: "New" | "Contacted" | "Completed" | "Closed" | string;
  rawStatus?: string;
  matchStatus?: string;
  timeAgo: string;
  postedDate: string;
  description: string;
  hasQuoted?: boolean;
  isQuoteAccepted?: boolean;
  timescale?: string;
  budgetRange?: string;
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

function getUIStatus(item: any): string {
  if (item.status === "COMPLETED") return "Completed";
  if (item.status === "CANCELLED" || item.status === "CLOSED" || item.status === "EXPIRED") return "Closed";
  if (item.matchStatus === "REJECTED") return "Closed";
  if (item.status === "ASSIGNED" || item.status === "QUOTE_RECEIVED" || item.matchStatus === "ACCEPTED" || item.matchStatus === "QUOTED") {
    return "Contacted";
  }
  if (item.status === "OPEN" || item.status === "POSTED" || item.status === "ACTIVE") return "Live";
  return "New";
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
  const [quoteForm, setQuoteForm] = useState({
    price: "",
    estimatedDays: "",
    message: "",
  });
  const [quoteAttachments, setQuoteAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openQuoteModal = () => {
    if (!selectedJob) return;
    const isClosedOrComplete =
      selectedJob.status === "Closed" ||
      selectedJob.status === "Completed" ||
      selectedJob.rawStatus === "CLOSED" ||
      selectedJob.rawStatus === "COMPLETED" ||
      selectedJob.rawStatus === "CANCELLED" ||
      selectedJob.rawStatus === "EXPIRED";
    if (selectedJob.hasQuoted || selectedJob.isQuoteAccepted || isClosedOrComplete) {
      return;
    }
    setQuoteForm({ price: "", estimatedDays: "", message: "" });
    setQuoteAttachments([]);
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

      const formData = new FormData();
      formData.append("price", quoteForm.price);
      formData.append("estimatedDays", quoteForm.estimatedDays);
      formData.append("message", quoteForm.message);
      quoteAttachments.forEach((file) => {
        formData.append("attachments", file);
      });

      await authApi.sendJobQuote(selectedJob.id, formData);
      // toast.success("Job quote sent successfully!");
      setIsQuoteModalOpen(false);
      setShowSuccessModal(true);
      setJobs((prevJobs) =>
        prevJobs.map((j) =>
          j.id === selectedJob.id ? { ...j, hasQuoted: true, status: "Contacted" } : j
        )
      );
      setSelectedJob((prev) => (prev ? { ...prev, hasQuoted: true, status: "Contacted" } : null));
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
          const mappedJobs: JobLead[] = res.data.map((item: any) => ({
            id: item.id,
            jobId: item.id?.substring(0, 8).toUpperCase() || "",
            title: item.title || "",
            location: item.postcode || "No Location",
            tag: item.category?.name || "General",
            status: getUIStatus(item),
            rawStatus: item.status,
            matchStatus: item.matchStatus,
            timeAgo: formatTimeAgo(item.createdAt),
            postedDate: formatPostedDate(item.createdAt),
            description: item.description || "",
            timescale: item.timescale ? item.timescale.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Flexible",
            budgetRange: item.budgetRange ? item.budgetRange.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Under €500",
            hasQuoted: Boolean(
              item.hasQuoted ||
              item.isQuoted ||
              item.matchStatus === "QUOTED" ||
              item.matchStatus === "ACCEPTED" ||
              (Array.isArray(item.quotes) && item.quotes.length > 0) ||
              item.hasSentQuote
            ),
            isQuoteAccepted: Boolean(
              item.isQuoteAccepted ||
              item.matchStatus === "ACCEPTED" ||
              item.status === "ASSIGNED"
            ),
            customer: {
              id: item.customerId || item.customer?.id || item.customer?._id || "",
              name: item.customer?.fullName || "Valued Customer",
              avatar: item.customer?.profileImage || undefined,
              rating: item.customer?.rating ?? 10.0,
              reviewsCount: item.customer?.reviewsCount ?? 2,
              jobsPosted: item.customer?.jobsPosted ?? 1,
            },
          }));
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
      result = result.filter((j) => j.status === activeTab);
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

  const tabs = ["All", "New", "Contacted", "Completed", "Closed"];

  // Helper to count jobs for tabs
  const getTabCount = (tab: string) => {
    if (tab === "All") return jobs.length;
    return jobs.filter((j) => j.status === tab).length;
  };

  const renderStatusBadge = (status: string) => {
    if (status === "New") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#1B5E20] text-white text-[11px] font-bold">
          New
        </div>
      );
    }
    if (status === "Live") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#FDE2D6] text-[#D32F2F] text-[11px] font-bold">
          Live
        </div>
      );
    }
    if (status === "Contacted") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#E3F2FD] text-[#1565C0] text-[11px] font-bold">
          Contacted
        </div>
      );
    }
    if (status === "Completed") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] text-[11px] font-bold">
          Completed
        </div>
      );
    }
    if (status === "Closed") {
      return (
        <div className="flex items-center px-3 py-1 rounded-[4px] bg-[#EEEEEE] text-[#424242] text-[11px] font-bold">
          Closed
        </div>
      );
    }
    // Default fallback
    return (
      <div className="flex items-center px-3 py-1 rounded-[4px] bg-gray-150 text-gray-600 text-[11px] font-bold">
        {status}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-[#F8F9F5] py-8 font-sans text-[#1C2C1C]">
        <div className="max-w-[1320px] mx-auto px-6">

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-6 items-start">

            {/* Left Column */}
            <div className="flex flex-col">

              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-[32px] font-extrabold text-[#1C2C1C] tracking-tight">Jobs & Leads</h1>

                <div className="relative w-full sm:w-[320px]">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-[42px] pl-10 pr-4 rounded-xl border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1C2C1C]/10 transition-shadow bg-white"
                  />
                </div>
              </div>

              {/* Tabs Section */}
              <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => {
                  const count = getTabCount(tab);
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        // Ensure we don't keep selection on a filtered out job
                        const firstOfTab = jobs.find(j => tab === "All" || j.status === tab);
                        if (firstOfTab) setSelectedJob(firstOfTab);
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${isActive
                        ? "bg-[#1C2C1C] text-white border border-[#1C2C1C]"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      {tab} <span className={isActive ? "text-white/70" : "text-gray-400"}>({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Left Column: Job List */}
              <div className="flex flex-col gap-3">
                {loading ? (
                  <div className="text-center py-10 text-gray-500 text-[14px]">Loading jobs...</div>
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-[14px]">No jobs found.</div>
                ) : (
                  filteredJobs.map((job, idx) => {
                    const isSelected = selectedJob?.id === job.id;
                    return (
                      <div
                        key={`${job.id}-${idx}`}
                        onClick={() => setSelectedJob(job)}
                        className={`cursor-pointer rounded-[20px] p-5 transition-all duration-200 border-2 flex flex-col gap-3.5 shadow-sm ${job.status === "Closed" ? "bg-[#F0F0F0]" : "bg-white"} ${isSelected
                          ? "border-[#6E9625]"
                          : "border-transparent hover:border-gray-200"
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          {renderStatusBadge(job.status)}
                          <span className="text-[12px] text-gray-400 font-medium">{job.timeAgo}</span>
                        </div>

                        <div>
                          <h3 className="text-[18px] font-bold mb-2.5 text-[#1C2C1C] leading-snug">{job.title}</h3>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-gray-500 font-medium mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} className="text-gray-400" />
                              {job.location}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                              <Tag size={14} className="text-gray-400" />
                              {job.tag}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} className="text-gray-400" />
                              {job.timescale || "Flexible"}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                              <Euro size={14} className="text-gray-400" />
                              {job.budgetRange || "Under €500"}
                            </span>
                          </div>

                          <p className="text-[13px] text-gray-600 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                        </div>

                        {/* Card Footer Divider & Actions */}
                        <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between mt-auto">
                          <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                            <Calendar size={13} />
                            Posted {job.postedDate}
                          </span>
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5F7F2] text-[#6E9625] text-[12px] font-bold hover:bg-[#EAEFD9] transition-colors">
                            View Details <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Job Details */}
            {selectedJob ? (
              <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#E5E5E5] sticky top-[100px]">

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block bg-[#EAF3DE] text-[#557A18] font-bold text-[11px] px-3 py-1 rounded-full mb-2 tracking-wide">
                      JOB-{selectedJob.jobId}
                    </span>
                    <h2 className="text-[24px] font-bold text-[#1C2C1C] leading-tight mb-2.5">
                      {selectedJob.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      {renderStatusBadge(selectedJob.status)}
                      <span className="text-[12px] text-gray-400 font-medium flex items-center gap-1">
                        <Clock size={13} /> Posted {selectedJob.timeAgo}
                      </span>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* Info Grid - 2x2 grid to prevent truncation */}
                <div className="grid grid-cols-2 gap-3.5 mb-8">
                  <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                      <MapPin size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5">
                        LOCATION
                      </span>
                      <span className="text-[13px] font-bold text-[#1C2C1C] leading-none">{selectedJob.location}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                      <Tag size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5">
                        CATEGORY
                      </span>
                      <span className="text-[13px] font-bold text-[#1C2C1C] leading-none">{selectedJob.tag}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                      <Clock size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5">
                        TIMESCALE
                      </span>
                      <span className="text-[13px] font-bold text-[#1C2C1C] leading-none">{selectedJob.timescale || "Flexible"}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                      <Euro size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5">
                        BUDGET
                      </span>
                      <span className="text-[13px] font-bold text-[#1C2C1C] leading-none">{selectedJob.budgetRange || "Under €500"}</span>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <div className="mb-8">
                  <span className="text-[12px] font-bold text-[#1C2C1C] uppercase tracking-wider mb-3 block">
                    Job Description
                  </span>
                  <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <p className="text-[14px] leading-relaxed text-gray-600 mb-4">
                      {selectedJob.description}
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          toast.loading("Loading job details...", { id: "jobDetails" });
                          const data = await authApi.getCustomerJobById(selectedJob.id);
                          setFullJobData(data?.data || data);
                          setIsDetailsModalOpen(true);
                          toast.success("Job details loaded", { id: "jobDetails" });
                        } catch (error) {
                          console.error(error);
                          toast.error("Failed to load full details", { id: "jobDetails" });
                        }
                      }}
                      className="text-[13px] font-bold text-[#6E9625] hover:text-[#58791C] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      View full details <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Attachments Section Trigger (Mocked representation as in figma mockup screenshot) */}
                {/* Attachments */}
                {fullJobData?.attachments && fullJobData.attachments.length > 0 && (
                  <div className="mb-8">
                    <span className="text-[12px] font-bold text-[#1C2C1C] uppercase tracking-wider mb-3 block">
                      Attachments ({fullJobData.attachments.length})
                    </span>

                    <div className="flex flex-wrap gap-3">
                      {fullJobData.attachments.map((att: any, idx: number) => {
                        let cleanPath = att.url || att.file || att.path || "";

                        if (cleanPath.startsWith("undefined")) {
                          cleanPath = cleanPath.replace("undefined", "");
                        }

                        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

                        const fullUrl = cleanPath.startsWith("http")
                          ? cleanPath
                          : `${baseUrl}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;

                        const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(cleanPath);

                        return (
                          <a
                            key={idx}
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block w-[110px] rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-[#6E9625] transition-colors"
                          >
                            {isImage ? (
                              <img
                                src={fullUrl}
                                alt={att.filename || "Attachment"}
                                className="w-full h-[75px] object-cover"
                              />
                            ) : (
                              <div className="w-full h-[75px] bg-gray-100 flex items-center justify-center">
                                <FileText size={24} className="text-gray-400" />
                              </div>
                            )}

                            <div className="px-2 py-1.5">
                              <p className="text-[10px] text-[#1C2C1C] font-medium truncate">
                                {att.filename ||
                                  cleanPath.split("/").pop() ||
                                  "Attachment"}
                              </p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Customer Details */}
                <div className="mb-8">
                  <span className="text-[12px] font-bold text-[#1C2C1C] uppercase tracking-wider mb-3 block">
                    CUSTOMER
                  </span>
                  <div className="p-5 rounded-2xl border border-gray-100 flex items-center justify-between bg-white shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600 text-lg">
                        {selectedJob.customer?.avatar ? (
                          <img
                            src={getImageUrl(selectedJob.customer.avatar)}
                            alt={selectedJob.customer?.name ?? ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>
                            {selectedJob.customer?.name ? selectedJob.customer.name.charAt(0) : ''}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-[#1C2C1C] mb-0.5">
                          {selectedJob.customer?.name ?? ''}
                        </h4>
                        <div className="text-[12px] font-medium text-[#1C2C1C] space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Star size={13} className="text-[#F5A623] fill-[#F5A623] shrink-0" />
                            <span>
                              {selectedJob.customer?.rating !== undefined ? selectedJob.customer.rating.toFixed(1) : '0.0'}{' '}
                              <span className="text-gray-400 font-normal">({selectedJob.customer?.reviewsCount ?? 0} Reviews)</span>
                            </span>
                          </div>
                          <div className="text-gray-400 font-normal">
                            {selectedJob.customer?.jobsPosted ?? 0} Job Posted
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedJob.customer?.id) {
                          router.push(`/trader/customer-profile/${selectedJob.customer.id}`);
                        }
                      }}
                      className="px-4 py-2 border border-gray-200 text-[#6E9625] rounded-xl text-[12px] font-bold hover:bg-gray-50 transition-colors shrink-0 cursor-pointer"
                    >
                      View Profile
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  {(() => {
                    const isClosed =
                      selectedJob.status === "Closed" ||
                      selectedJob.rawStatus === "CLOSED" ||
                      selectedJob.rawStatus === "CANCELLED" ||
                      selectedJob.rawStatus === "EXPIRED" ||
                      selectedJob.matchStatus === "REJECTED";
                    const isCompleted =
                      selectedJob.status === "Completed" ||
                      selectedJob.rawStatus === "COMPLETED";
                    const isAccepted =
                      selectedJob.isQuoteAccepted ||
                      selectedJob.matchStatus === "ACCEPTED" ||
                      selectedJob.rawStatus === "ASSIGNED";
                    const hasQuoted = selectedJob.hasQuoted;

                    const isSendDisabled = isClosed || isCompleted || isAccepted || hasQuoted;

                    let buttonText = "Send Job Quote";
                    if (isAccepted) buttonText = "Quote Accepted";
                    else if (hasQuoted) buttonText = "Quote Sent";
                    else if (isCompleted) buttonText = "Job Completed";
                    else if (isClosed) buttonText = "Job Closed";

                    return (
                      <button
                        onClick={openQuoteModal}
                        disabled={isSendDisabled}
                        className={`w-full h-[48px] rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-colors ${isSendDisabled
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300"
                          : "bg-[#1C2C1C] hover:bg-[#2A412A] text-white cursor-pointer"
                          }`}
                      >
                        <Send size={16} />
                        {buttonText}
                      </button>
                    );
                  })()}
                  <button
                    onClick={async () => {
                      if (!selectedJob?.customer?.id) {
                        toast.error("Could not find customer contact details.");
                        return;
                      }

                      try {
                        toast.loading("Opening conversation...", {
                          id: "openConversation",
                        });

                        const res = await authApi.getOrCreateConversation(
                          selectedJob.customer.id,
                          selectedJob.id
                        );

                        const conversation = res?.data || res;

                        const conversationId =
                          conversation?.id || conversation?._id;

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
                          `/trader/inbox?conversationId=${conversationId}&customerId=${selectedJob.customer.id}&jobId=${selectedJob.id}`
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
                    className="w-full h-[48px] rounded-xl bg-white border border-[#E5E5E5] hover:bg-gray-50 text-[#1C2C1C] text-[14px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageCircle size={16} />
                    Contact Customer
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-[24px] p-8 text-center text-gray-500 border border-gray-100 flex items-center justify-center h-[300px]">
                Select a job to view details
              </div>
            )}

          </div>
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
                  <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    step="0.5"
                    min={0.5}
                    required
                    placeholder="e.g. 0.5 or 3"
                    value={quoteForm.estimatedDays}
                    onChange={(e) => setQuoteForm((f) => ({ ...f, estimatedDays: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-[#1C2C1C] placeholder:text-gray-400 focus:outline-none focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/20 transition-all"
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

      {/* 📄 Full Details Modal 📄 */}
      {isDetailsModalOpen && fullJobData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)} />
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-[18px] font-bold text-[#1C2C1C]">Job Details</h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">

              {/* Customer Info Section */}
              {fullJobData.customer && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-[#E6F5E9] flex items-center justify-center text-[#32C850] font-bold text-[18px]">
                    {fullJobData.customer.fullName?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#1C2C1C]">Posted by {fullJobData.customer.fullName}</h4>
                    <span className="text-[12px] text-gray-500">
                      Member since {new Date(fullJobData.customer.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-[20px] font-bold text-[#1C2C1C] mb-2">{fullJobData.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-gray-400" />
                    {fullJobData.postcode || selectedJob?.location}
                  </div>
                  {fullJobData.category?.name && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <div className="flex items-center gap-1.5 text-[#6E9625] font-medium bg-[#F3F8EC] px-2 py-0.5 rounded-md">
                        {fullJobData.category.name}
                      </div>
                    </>
                  )}
                  {fullJobData.subCategory?.name && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <div className="flex items-center gap-1.5 text-[#6E9625] font-medium bg-[#F3F8EC] px-2 py-0.5 rounded-md">
                        {fullJobData.subCategory.name}
                      </div>
                    </>
                  )}
                  {fullJobData.skillService?.name && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <div className="flex items-center gap-1.5 text-[#6E9625] font-medium bg-[#F3F8EC] px-2 py-0.5 rounded-md">
                        {fullJobData.skillService.name}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Status</span>
                  <span className="text-[13px] font-bold text-[#1C2C1C]">{fullJobData.status}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Budget</span>
                  <span className="text-[13px] font-bold text-[#1C2C1C]">
                    {fullJobData.budgetRange?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "—"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Timescale</span>
                  <span className="text-[13px] font-bold text-[#1C2C1C]">
                    {fullJobData.timescale?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "—"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Emergency</span>
                  <span className="text-[13px] font-bold text-[#1C2C1C]">{fullJobData.emergency ? "Yes" : "No"}</span>
                </div>

                {/* Additional Metadata */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Quotes Received</span>
                  <span className="text-[13px] font-bold text-[#1C2C1C]">{fullJobData.quotesReceived || fullJobData._count?.quotes || 0}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Posted</span>
                  <span className="text-[13px] font-bold text-[#1C2C1C]">
                    {fullJobData.createdAt ? new Date(fullJobData.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 md:col-span-2">
                  <span className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Expires</span>
                  <span className="text-[13px] font-bold text-[#1C2C1C]">
                    {fullJobData.expiresAt ? new Date(fullJobData.expiresAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[12px] font-bold text-[#1C2C1C] uppercase tracking-wider mb-3">
                  Description
                </span>
                <p className="text-[14px] leading-relaxed text-gray-600 whitespace-pre-wrap">
                  {fullJobData.description}
                </p>
              </div>

              {fullJobData.attachments && fullJobData.attachments.length > 0 && (
                <div>
                  <span className="block text-[12px] font-bold text-[#1C2C1C] uppercase tracking-wider mb-3">
                    Attachments ({fullJobData.attachments.length})
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {fullJobData.attachments.map((att: any, idx: number) => {
                      let cleanPath = att.url || att.file || "";
                      if (cleanPath.startsWith("undefined")) {
                        cleanPath = cleanPath.replace("undefined", "");
                      }
                      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
                      const fullUrl = cleanPath.startsWith("http") ? cleanPath : `${baseUrl}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;

                      const isImage = cleanPath.match(/\.(jpeg|jpg|gif|png)$/i);

                      return (
                        <a
                          key={idx}
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-[#6E9625] transition-colors max-w-full"
                        >
                          {isImage ? (
                            <img src={fullUrl} alt="attachment" className="w-10 h-10 object-cover rounded-md" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                              <FileText size={16} className="text-gray-400" />
                            </div>
                          )}
                          <span className="text-[12px] text-[#1C2C1C] truncate max-w-[150px] font-medium">
                            {att.filename || cleanPath.split('/').pop() || 'Attachment'}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
