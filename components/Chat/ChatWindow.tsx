"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Star, MapPin, Calendar, DollarSign, Shield, ShieldCheck, Mail, Info, AlertTriangle, CheckCircle, Phone, X, Briefcase, Plus, Clock, Play, XCircle, Send } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { authApi } from "@/app/api/authApi";
import { useSocket } from "@/hooks/useSocket";
import toast from "react-hot-toast";

interface Message {
  id?: string;
  _id?: string;
  senderId: string;
  sender?: {
    fullName: string;
    profileImage?: string | null;
  };
  message?: string;
  attachment?: string | null;
  attachments?: string[] | null;
  createdAt: string;
}

interface Conversation {
  id: string;
  _id?: string;
  traderId: string;
  customerId?: string;
  customer?: {
    id: string;
    _id?: string;
    fullName: string;
    email: string;
    profileImage?: string | null;
  };
  trader: {
    id: string;
    _id?: string;
    fullName: string;
    email: string;
    profileImage?: string | null;
    rating?: number;
    reviewsCount?: number;
    joinedYear?: string;
    identityVerified?: boolean;
    insuranceUploaded?: boolean;
  };
  jobId?: string | null;
  type?: string;
  job?: {
    id: string;
    _id?: string;
    title: string;
    location?: string;
    startDate?: string;
    budget?: string;
    status?: string;
  };
}

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  onRefreshConversations?: () => void;
  isTraderView?: boolean;
  fallbackJobId?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  let imagePath = path.startsWith('/') ? path : `/${path}`;
  imagePath = imagePath.replace(/\/\//g, '/'); // remove any double slashes inside the path

  return `${baseUrl}${imagePath}`;
}

export default function ChatWindow({
  conversation,
  currentUserId,
  onRefreshConversations,
  isTraderView = false,
  fallbackJobId,
}: ChatWindowProps) {
  const router = useRouter();
  const conversationId = conversation.id || conversation._id || "";
  let partner: any = isTraderView ? (conversation.customer || conversation.trader) : conversation.trader;
  if (conversation.customer && (conversation.customer.id === currentUserId || conversation.customer._id === currentUserId)) {
    partner = conversation.trader;
  } else if (conversation.trader && (conversation.trader.id === currentUserId || conversation.trader._id === currentUserId)) {
    partner = conversation.customer;
  }
  const partnerId = partner?.id || partner?._id || "";
  const partnerName =
    partner?.fullName ||
    (partner as any)?.companyName ||
    (partner as any)?.traderProfile?.companyName ||
    (partner as any)?.traderProfile?.displayName ||
    (isTraderView ? "Customer" : "Tradesperson");
  const job = conversation.job;
  const isDirectOrNoJob =
    conversation.type === "DIRECT" ||
    conversation.jobId === null ||
    conversation.jobId === "null" ||
    (!conversation.jobId && !job?.id && !job?._id);
  const activeJobId = isDirectOrNoJob ? null : (job?.id || job?._id || conversation.jobId || fallbackJobId);
  const [linkedJobId, setLinkedJobId] = useState<string | null>(null);
  const effectiveJobId = isDirectOrNoJob ? null : (activeJobId || linkedJobId);

  const traderId = conversation.traderId || conversation.trader?.id || (conversation.trader as any)?._id;
  const [actualUserId, setActualUserId] = useState<string | null>(currentUserId || null);

  useEffect(() => {
    // Check trader identity explicitly
    const fetchProfile = async () => {
      try {
        const res = await authApi.getMyProfile();
        const pData = res?.data || res;
        if (pData?.id || pData?._id) {
          setActualUserId(pData.id || pData._id);
        }
      } catch (err) {
        console.error("Failed to fetch profile in ChatWindow", err);
      }
    };
    if (!currentUserId) {
      fetchProfile();
    }
  }, [currentUserId]);

  const isActualTrader = actualUserId && traderId && (actualUserId === traderId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false);
  const [isCloseJobModalOpen, setIsCloseJobModalOpen] = useState(false);
  const [isStartJobModalOpen, setIsStartJobModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"select" | "create">("select");
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loadingMyJobs, setLoadingMyJobs] = useState(false);
  const [selectedJobIdToStart, setSelectedJobIdToStart] = useState<string>("");
  const [startingJob, setStartingJob] = useState(false);

  // Quick create fields
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDescription, setQuickDescription] = useState("");
  const [quickLocation, setQuickLocation] = useState("");
  const [quickBudget, setQuickBudget] = useState("");

  const [reportType, setReportType] = useState("TRADER_PROFILE");
  const [reportReason, setReportReason] = useState("SPAM");
  const [customReason, setCustomReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [isReported, setIsReported] = useState(false);

  // Direct Job states
  const [directJob, setDirectJob] = useState<any | null>(null);
  const [loadingDirectJob, setLoadingDirectJob] = useState(false);
  const [showDirectStartModal, setShowDirectStartModal] = useState(false);
  const [directJobTitle, setDirectJobTitle] = useState("");
  const [directJobPrice, setDirectJobPrice] = useState("");
  const [directJobNotes, setDirectJobNotes] = useState("");
  const [isSubmittingDirectJob, setIsSubmittingDirectJob] = useState(false);

  // Review Modal state (for direct job review)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [jobStatus, setJobStatus] = useState<string | null>(job?.status || null);

  useEffect(() => {
    console.log("Conversation", conversation);
  }, [conversation]);

  // Load message history from REST API
  const loadMessageHistory = async () => {
    if (!conversationId || typeof conversationId !== "string" || conversationId === "undefined" || conversationId === "null") return;
    try {
      setLoadingMessages(true);
      const res = await authApi.getChatMessages(conversationId).catch(() => null);
      const msgList = res?.data || res || [];
      if (Array.isArray(msgList)) {
        setMessages(msgList);
      }
    } catch (error) {
      console.error("Failed to load message history:", error);
      toast.error("Failed to load chat history");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadMessageHistory();
    setIsPartnerTyping(false);
  }, [conversationId]);

  // Sync job status when conversation/job prop changes
  useEffect(() => {
    if (job?.status) {
      setJobStatus(job.status);
    } else if (!job && !conversation.jobId && !fallbackJobId) {
      // No job linked at all — clear any stale status
      setJobStatus(null);
    }
  }, [job?.status, job, conversation.jobId, fallbackJobId]);

  // Fetch the real, latest job status directly from the API whenever effectiveJobId is available
  useEffect(() => {
    if (!effectiveJobId || typeof effectiveJobId !== "string" || effectiveJobId === "undefined" || effectiveJobId === "null") return;

    const fetchJobStatus = async () => {
      try {
        const res = await authApi.getCustomerJobById(effectiveJobId).catch(() => null);
        const jobData = res?.data || res;
        if (jobData?.status) {
          setJobStatus(jobData.status);
        }
      } catch (err) {
        // Silently fail — status buttons will default to "Start Job"
        console.warn("Could not fetch job status for conversation:", err);
      }
    };
    fetchJobStatus();
  }, [effectiveJobId]);

  // Fetch Direct Job if no regular job is linked
  useEffect(() => {
    if (isDirectOrNoJob && conversationId) {
      const fetchDirectJob = async () => {
        try {
          setLoadingDirectJob(true);
          const res = await authApi.getDirectJobForConversation(conversationId).catch(() => null);
          const jobData = res?.data || res;
          setDirectJob(jobData || null);
        } catch (err) {
          console.warn("Could not fetch direct job for conversation:", err);
        } finally {
          setLoadingDirectJob(false);
        }
      };
      fetchDirectJob();
    }
  }, [isDirectOrNoJob, conversationId]);

  // Load customer jobs when Start Job modal opens
  const loadCustomerJobs = async () => {
    try {
      setLoadingMyJobs(true);
      const res = await authApi.getMyJobs(1, 20);
      const jobsList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.jobs) ? res.jobs : [];
      const available = jobsList.filter((j: any) => {
        const st = j.status?.toUpperCase();
        return st !== "COMPLETED" && st !== "CANCELLED" && st !== "CLOSED";
      });
      setMyJobs(available);
      if (available.length > 0) {
        setSelectedJobIdToStart(available[0].id || available[0]._id);
        setModalTab("select");
      } else {
        setModalTab("create");
      }
    } catch (err) {
      console.error("Failed to load customer jobs", err);
    } finally {
      setLoadingMyJobs(false);
    }
  };

  useEffect(() => {
    if (isStartJobModalOpen) {
      loadCustomerJobs();
    }
  }, [isStartJobModalOpen]);

  // Connect to socket and hook up listeners
  const {
    sendMessage: emitSocketMessage,
    startTyping: emitSocketTyping,
    stopTyping: emitSocketStopTyping,
    markAsRead: emitSocketRead,
  } = useSocket({
    conversationId,
    onNewMessage: (message: any) => {
      // Append if it belongs to active conversation
      if (message.conversationId === conversationId || message.conversation === conversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some((m) => (m.id && m.id === message.id) || (m._id && m._id === message._id));
          if (exists) return prev;
          return [...prev, message];
        });
        // Send read acknowledgement
        emitSocketRead(conversationId);
      }
    },
    onUserOnline: (data) => {
      if (data.userId === partnerId) {
        setIsPartnerOnline(true);
      }
    },
    onUserOffline: (data) => {
      if (data.userId === partnerId) {
        setIsPartnerOnline(false);
      }
    },
    onTyping: (data) => {
      if (data.userId === partnerId) {
        setIsPartnerTyping(true);
      }
    },
    onStopTyping: () => {
      setIsPartnerTyping(false);
    },
    onMessagesRead: (data) => {
      if (data.userId === partnerId) {
        console.log("Messages marked as read by partner");
      }
    },
    onJobUpdated: (payload: any) => {
      const updatedJob = payload?.job || payload?.data || payload;
      const targetId = effectiveJobId || conversation?.job?.id || conversation?.job?._id || conversation?.jobId;
      if (updatedJob && (updatedJob.id === targetId || updatedJob._id === targetId)) {
        if (updatedJob.status) {
          setJobStatus(updatedJob.status);
        }
      }
    },
  });

  // Mark active messages as read on load
  useEffect(() => {
    if (conversationId) {
      emitSocketRead(conversationId);
    }
  }, [conversationId, emitSocketRead]);

  // Send message REST handler
  const handleSendMessage = async (text: string, file: File | null) => {
    try {
      const formData = new FormData();
      formData.append("conversationId", conversationId);
      if (text) formData.append("message", text);
      if (file) formData.append("attachments", file); // key is 'attachments' in backend API

      const res = await authApi.sendChatMessage(formData);
      const newMessage = res?.data || res;

      if (newMessage) {
        // 1. Update local list
        setMessages((prev) => {
          // Double check to ensure the REST response isn't already added via socket
          const exists = prev.some((m) => (m.id && m.id === newMessage.id) || (m._id && m._id === newMessage._id));
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // 2. Trigger conversation list update in parent sidebar
        if (onRefreshConversations) onRefreshConversations();
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(error?.message || "Failed to send message");
    }
  };

  const getErrorMessage = (error: any, fallback: string) => {
    if (!error) return fallback;
    const data = error.response?.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    if (data?.error) return typeof data.error === "string" ? data.error : fallback;
    if (error.message && typeof error.message === "string") return error.message;
    return fallback;
  };

  const [loadingComplete, setLoadingComplete] = useState(false);
  const [loadingClose, setLoadingClose] = useState(false);
  const [loadingStartJob, setLoadingStartJob] = useState(false);

  // Job Start Action
  const handleStartJob = async () => {
    const targetJobId = effectiveJobId;
    if (!targetJobId || targetJobId === "null" || targetJobId === "undefined" || isDirectOrNoJob) {
      return;
    }

    try {
      setLoadingStartJob(true);
      await authApi.startJob(targetJobId);
      setJobStatus("IN_PROGRESS");
      toast.success("Job started successfully!", { id: "job-action-success" });
      if (onRefreshConversations) onRefreshConversations();
    } catch (error: any) {
      console.error("Failed to start job:", error);
      const errMsg = getErrorMessage(error, "Failed to start job");
      toast.error(errMsg, { id: "job-action-error" });
    } finally {
      setLoadingStartJob(false);
    }
  };

  // Start an existing job from the modal
  const handleStartExistingJob = async () => {
    if (!selectedJobIdToStart) {
      toast.error("Please select a job to start");
      return;
    }

    try {
      setStartingJob(true);
      toast.loading("Starting job...", { id: "directStartJob" });
      if (partnerId) {
        try {
          await authApi.getOrCreateConversation(partnerId, selectedJobIdToStart);
        } catch (e) {
          console.warn("Could not link job to conversation via API", e);
        }
      }
      await authApi.startJob(selectedJobIdToStart);
      setLinkedJobId(selectedJobIdToStart);
      setJobStatus("IN_PROGRESS");
      toast.success("Job started successfully!", { id: "directStartJob" });
      setIsStartJobModalOpen(false);
      if (onRefreshConversations) onRefreshConversations();
    } catch (err: any) {
      console.error("Failed to start job:", err);
      const msg = getErrorMessage(err, "Failed to start job");
      toast.error(msg, { id: "directStartJob" });
    } finally {
      setStartingJob(false);
    }
  };

  // Quick create and start a job from the modal
  const handleQuickCreateAndStartJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickDescription.trim()) {
      toast.error("Please enter a job title and description");
      return;
    }

    try {
      setStartingJob(true);
      toast.loading("Creating and starting job...", { id: "directStartJob" });
      const formData = new FormData();
      formData.append("title", quickTitle);
      formData.append("description", quickDescription);
      if (quickLocation) formData.append("location", quickLocation);
      if (quickBudget) formData.append("budget", quickBudget);
      formData.append("timescale", "Immediately");
      formData.append("latitude", "22.5630");
      formData.append("longitude", "75.7669");

      const res = await authApi.postJob(formData);
      const created = res?.data || res;
      const newJobId = created?.id || created?._id;

      if (newJobId) {
        if (partnerId) {
          try {
            await authApi.getOrCreateConversation(partnerId, newJobId);
          } catch (e) {
            console.warn("Could not link new job to conversation", e);
          }
        }
        await authApi.startJob(newJobId);
        setLinkedJobId(newJobId);
        setJobStatus("IN_PROGRESS");
        toast.success("Job created and started successfully!", { id: "directStartJob" });
        setIsStartJobModalOpen(false);
        if (onRefreshConversations) onRefreshConversations();
      } else {
        toast.error("Failed to retrieve created job ID", { id: "directStartJob" });
      }
    } catch (err: any) {
      console.error("Failed to create and start job:", err);
      const msg = getErrorMessage(err, "Failed to create and start job");
      toast.error(msg, { id: "directStartJob" });
    } finally {
      setStartingJob(false);
    }
  };

  // Job Completion Action
  const handleJobComplete = async () => {
    const targetJobId = effectiveJobId;
    if (!targetJobId) {
      toast.error("No job is linked to this conversation", { id: "job-action-error" });
      return;
    }

    try {
      setLoadingComplete(true);
      await authApi.completeJob(targetJobId);
      setJobStatus("COMPLETED");
      toast.success("Job marked as complete successfully!", { id: "job-action-success" });
      if (onRefreshConversations) onRefreshConversations();
    } catch (error: any) {
      console.error("Failed to mark job complete:", error);
      const errMsg = getErrorMessage(error, "Failed to mark job complete");
      toast.error(errMsg, { id: "job-action-error" });
    } finally {
      setLoadingComplete(false);
    }
  };

  // Job Close / Cancel Action
  const handleCloseJobSubmit = async (data: { isWorkCarriedOut: boolean; cancelReason?: string } = { isWorkCarriedOut: true }) => {
    const targetJobId = effectiveJobId;
    if (!targetJobId) {
      toast.error("No job is linked to this conversation", { id: "job-action-error" });
      return;
    }

    try {
      setLoadingClose(true);
      await authApi.closeJob(targetJobId, data);
      setJobStatus("CANCELLED");
      toast.success("Job closed successfully!", { id: "job-action-success" });
      if (onRefreshConversations) onRefreshConversations();
    } catch (error: any) {
      console.error("Failed to close job:", error);
      const errMsg = getErrorMessage(error, "Failed to close job");
      toast.error(errMsg, { id: "job-action-error" });
    } finally {
      setLoadingClose(false);
    }
  };

  // Report submission handler
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for the report");
      return;
    }

    try {
      setSubmittingReport(true);
      await authApi.report({
        reportType,
        targetId: partnerId,
        reason: reportReason,
        customReason: reportReason === "OTHER"
          ? customReason
          : "",
      });
      toast.success("Report submitted successfully to administration.");

      setIsReported(true);

      setShowReportModal(false);
      setReportReason("SPAM");
      setCustomReason("");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message;

      if (message === "You already reported this item") {
        setIsReported(true);
        setShowReportModal(false);
        toast.error("You have already reported this trader.");
        return;
      }

      toast.error(message || "Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleDirectJobStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directJobTitle.trim()) {
      toast.error("Please enter a job title");
      return;
    }
    try {
      setIsSubmittingDirectJob(true);
      const res = await authApi.startDirectJob({
        conversationId,
        title: directJobTitle,
        agreedPrice: directJobPrice ? Number(directJobPrice) : undefined,
        description: directJobNotes,
      });
      setDirectJob(res?.data || res);
      setShowDirectStartModal(false);
      toast.success("Job started successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to start job");
    } finally {
      setIsSubmittingDirectJob(false);
    }
  };

  const handleDirectJobClose = async () => {
    if (!confirm("Are you sure you want to mark this job as completed? The customer will be asked to confirm.")) return;
    try {
      setIsSubmittingDirectJob(true);
      const res = await authApi.closeDirectJob(directJob.id || directJob._id);
      setDirectJob(res?.data || res);
      toast.success("Job marked as completed");
    } catch (error: any) {
      toast.error(error?.message || "Failed to close job");
    } finally {
      setIsSubmittingDirectJob(false);
    }
  };

  const handleDirectJobRemind = async () => {
    try {
      setIsSubmittingDirectJob(true);
      const res = await authApi.remindCustomerDirectJob(directJob.id || directJob._id);
      toast.success("Reminder sent to customer");
      setDirectJob(res?.data || res);
    } catch (error: any) {
      toast.error(error?.message || "Failed to send reminder");
    } finally {
      setIsSubmittingDirectJob(false);
    }
  };

  const handleDirectJobConfirm = async () => {
    try {
      setIsSubmittingDirectJob(true);
      const res = await authApi.confirmDirectJob(directJob.id || directJob._id);
      setDirectJob(res?.data || res);
      toast.success("Job completion confirmed! You can now leave a review.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to confirm completion");
    } finally {
      setIsSubmittingDirectJob(false);
    }
  };

  const handleDirectJobReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    try {
      setIsSubmittingReview(true);
      const formData = new FormData();
      formData.append('directJobId', directJob.id || directJob._id);
      formData.append('traderId', directJob.traderId);
      formData.append('reviewType', 'DIRECTORY');
      formData.append('wasWorkCompleted', 'true');
      formData.append('rating', String(reviewRating));
      formData.append('title', reviewTitle);
      formData.append('review', reviewComment);

      // Use existing postReview which accepts FormData
      const res = await authApi.postReview(formData);

      setDirectJob((prev: any) => ({
        ...prev,
        reviews: [res?.data || res]
      }));
      setShowReviewModal(false);
      toast.success("Review submitted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <>
      <div className="flex-1 flex overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[75vh] max-h-[75vh]">
        {/* Central Chat Panel */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-50">
          {/* Chat Header */}
          <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 font-bold overflow-hidden flex-shrink-0">
                {(() => {
                  const imgPath = partner?.profileImage || (partner as any)?.avatar || (partner as any)?.logo || (partner as any)?.traderProfile?.logo || (partner as any)?.traderProfile?.profileImage || (partner as any)?.traderProfile?.document || null;
                  const finalImgUrl = getImageUrl(imgPath);
                  return finalImgUrl ? (
                    <img
                      src={finalImgUrl}
                      alt={partnerName || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    partnerName?.charAt(0)?.toUpperCase() || "T"
                  );
                })()}
                {/* Online Dot overlay */}
                {/* <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isPartnerOnline ? "bg-[#4CAF50]" : "bg-gray-300"
                  }`}
              /> */}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#1C2C1C]">{partnerName}</h3>
                {/* <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isPartnerOnline ? "bg-[#4CAF50]" : "bg-gray-300"}`} />
                {isPartnerOnline ? "Online" : "Offline"}
              </p> */}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReportModal(true)}
                disabled={isReported}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold border transition-all flex items-center gap-1 ${isReported
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-red-500 border-red-200 hover:bg-red-50"
                  }`}
              >
                <AlertTriangle size={14} />
                {isReported ? "Reported" : "Report"}
              </button>

              {/* Job Actions — only shown in customer view, hidden in trader view */}
              {!isTraderView && (() => {
                // When jobId is null or no job is linked (e.g. DIRECT chat), do not show Start Job button
                if (!effectiveJobId || effectiveJobId === "null" || effectiveJobId === "undefined" || isDirectOrNoJob) {
                  return null;
                }

                const status = jobStatus?.toUpperCase();
                const isCompleted = status === "COMPLETED";
                const isClosed = status === "CANCELLED" || status === "CLOSED";
                const isInProgress = (status === "IN_PROGRESS" || status === "ASSIGNED") && !isCompleted && !isClosed;

                // When the job is completed, do not show the Job Complete button
                if (isCompleted) {
                  return null;
                }

                if (isClosed) {
                  return (
                    <span className="px-4 py-1.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl text-[12px] font-bold flex items-center gap-1">
                      Job Closed
                    </span>
                  );
                }

                // Active job — show Complete + Close Job
                if (isInProgress) {
                  return (
                    <>
                      <button
                        onClick={handleJobComplete}
                        disabled={loadingComplete || loadingClose || loadingStartJob}
                        className="px-4 py-1.5 bg-[#6E9625] hover:bg-[#5C7F1F] text-white rounded-xl text-[12px] font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={14} />
                        {loadingComplete ? "Completing..." : "Job Complete"}
                      </button>

                      <button
                        onClick={() => setIsCloseJobModalOpen(true)}
                        disabled={loadingComplete || loadingClose || loadingStartJob}
                        className="px-4 py-1.5 bg-[#1C2C1C] hover:bg-[#2C422C] text-white rounded-xl text-[12px] font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingClose ? "Closing..." : "Close Job"}
                      </button>
                    </>
                  );
                }

                // Job linked but not yet started (PENDING / CONTRACTED / ASSIGNED / null)
                return (
                  <button
                    onClick={handleStartJob}
                    disabled={loadingStartJob}
                    className="px-4 py-1.5 bg-[#6E9625] hover:bg-[#5C7F1F] text-white rounded-xl text-[12px] font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingStartJob ? "Starting..." : "Start Job"}
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Direct Job Banner */}
          {isDirectOrNoJob && !loadingDirectJob && (
            <div className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0 ${directJob?.status === 'IN_PROGRESS' ? 'bg-[#FFFBEB] border-amber-200' :
              directJob?.status === 'AWAITING_CONFIRMATION' ? 'bg-[#EFF6FF] border-blue-200' :
                directJob?.status === 'COMPLETED' ? 'bg-[#F0FDF4] border-green-200' :
                  'bg-[#FEFCE8] border-yellow-200'
              }`}>
              <div className="flex items-center gap-3">
                {directJob?.status === 'COMPLETED' ? (
                  <CheckCircle className="text-[#16A34A]" size={20} />
                ) : directJob?.status === 'IN_PROGRESS' ? (
                  <Clock className="text-[#F59E0B]" size={20} />
                ) : directJob?.status === 'AWAITING_CONFIRMATION' ? (
                  <Clock className="text-[#3B82F6]" size={20} />
                ) : (
                  <Info className="text-[#F59E0B]" size={20} />
                )}
                <div>
                  <p className="text-[14px] font-bold text-gray-800">
                    {directJob?.status === 'COMPLETED' ? 'Job Completed' :
                      directJob?.status === 'AWAITING_CONFIRMATION' ? 'Job is Completed' :
                        directJob?.status === 'IN_PROGRESS' ? 'Job in Progress' :
                          'No job started from this conversation.'}
                  </p>
                  <p className="text-[12px] text-gray-600 mt-0.5">
                    {directJob?.status === 'COMPLETED' ? `Completed on ${new Date(directJob.confirmedAt || directJob.completedAt).toLocaleDateString()}` :
                      directJob?.status === 'AWAITING_CONFIRMATION' ? 'Trader marked this job as complete. Awaiting customer confirmation.' :
                        directJob?.status === 'IN_PROGRESS' ? `Started on ${new Date(directJob.startedAt).toLocaleDateString()}` :
                          'You can start a job to track progress, get a review and add it to the trader\'s profile.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(!directJob?.status || directJob.status === 'CANCELLED') && isActualTrader && (
                  <button
                    onClick={() => setShowDirectStartModal(true)}
                    className="px-4 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-[12px] font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Play size={14} fill="currentColor" />
                    Start Job
                  </button>
                )}

                {directJob?.status === 'IN_PROGRESS' && isActualTrader && (
                  <button
                    onClick={handleDirectJobClose}
                    disabled={isSubmittingDirectJob}
                    className="px-4 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-[12px] font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <XCircle size={14} />
                    Close Job
                  </button>
                )}

                {directJob?.status === 'AWAITING_CONFIRMATION' && (
                  isActualTrader ? (
                    <button
                      onClick={handleDirectJobRemind}
                      disabled={isSubmittingDirectJob}
                      className="px-4 py-1.5 border border-[#3B82F6] text-[#3B82F6] hover:bg-blue-50 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5"
                    >
                      <Send size={14} />
                      Remind Customer
                    </button>
                  ) : (
                    <button
                      onClick={handleDirectJobConfirm}
                      disabled={isSubmittingDirectJob}
                      className="px-4 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-[12px] font-bold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} />
                      Confirm Completion
                    </button>
                  )
                )}

                {/* {directJob?.status === 'COMPLETED' && !isActualTrader && (
                  (!directJob.reviews || directJob.reviews.length === 0) ? (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="px-4 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-[12px] font-bold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Star size={14} fill="currentColor" />
                      Leave a Review
                    </button>
                  ) : (
                    <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-xl text-[12px] font-bold flex items-center gap-1.5">
                      <Star size={14} fill="currentColor" />
                      Reviewed
                    </span>
                  )
                )} */}
              </div>
            </div>
          )}

          {/* Message feed */}
          {loadingMessages ? (
            <div className="flex-1 flex items-center justify-center py-10 bg-[#F9FAFB]">
              <p className="text-[13px] text-gray-400 animate-pulse">Loading message history...</p>
            </div>
          ) : (
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              isTyping={isPartnerTyping}
              traderName={partner?.fullName}
            />
          )}

          {/* Input Bar */}
          <ChatInput
            onSendMessage={handleSendMessage}
            onTyping={() => emitSocketTyping(conversationId)}
            onStopTyping={() => emitSocketStopTyping(conversationId)}
          />
        </div>

      </div>

      {/* Report Modal */}
      {
        showReportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-gray-150 p-6 max-w-md w-full shadow-xl">
              <h3 className="text-[18px] font-bold text-[#1C2C1C] mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                Report {isTraderView ? "Customer" : "Trader"}
              </h3>

              <form onSubmit={handleReportSubmit}>
                <div className="mb-4">
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-[#1C2C1C] outline-none focus:border-[#6E9625]"
                  >
                    <option value="USER">User</option>
                    <option value="REVIEW">Review</option>
                    <option value="JOB">Job</option>
                    <option value="MESSAGE">Message</option>
                    <option value="TRADER_PROFILE">Trader Profile</option>
                  </select>
                </div>

                <div className="mb-5">
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Report Reason
                  </label>

                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2.5"
                  >
                    <option value="SPAM">Spam</option>
                    <option value="FAKE">Fake</option>
                    <option value="ABUSIVE">Abusive</option>
                    <option value="HARASSMENT">Harassment</option>
                    <option value="INAPPROPRIATE_CONTENT">
                      Inappropriate Content
                    </option>
                    <option value="SCAM">Scam</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {reportReason === "OTHER" && (
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Enter your reason..."
                      rows={4}
                      className="w-full mt-3 bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3"
                    />
                  )}
                </div>

                <div className="flex items-center justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason("");
                    }}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-[12px] font-semibold transition-colors"
                    disabled={submittingReport}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-[12px] font-bold transition-all shadow-sm"
                    disabled={submittingReport}
                  >
                    {submittingReport ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

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
                  if (!isTraderView) {
                    router.push(`/customer-dashboard/leave-review?jobId=${effectiveJobId || ''}&traderId=${partnerId}&workCarriedOut=true&hideWorkCarriedOut=true`);
                  }
                }}
                className="w-full py-3 bg-[#4CAF50] text-white rounded-xl font-bold hover:bg-[#43A047] transition-colors cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={async () => {
                  setIsCloseJobModalOpen(false);
                  await handleCloseJobSubmit({ isWorkCarriedOut: false });
                  if (!isTraderView) {
                    router.push(`/customer-dashboard/leave-review?jobId=${effectiveJobId || ''}&traderId=${partnerId}&workCarriedOut=false&hideWorkCarriedOut=true`);
                  }
                }}
                className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Start Job Modal (when contacting trader via directory) */}
      {isStartJobModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setIsStartJobModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F7F1] text-[#6E9625] flex items-center justify-center">
                <Briefcase size={20} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[#1C2C1C]">
                  Start Job with {partner?.fullName || "Trader"}
                </h2>
                <p className="text-[12px] text-gray-500 font-medium">
                  Link an existing job or quickly create a new project
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-150 mb-5">
              <button
                type="button"
                onClick={() => setModalTab("select")}
                className={`py-2.5 px-4 text-[13px] font-bold border-b-2 transition-all cursor-pointer ${modalTab === "select"
                  ? "border-[#6E9625] text-[#6E9625]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
              >
                Select Existing Job {myJobs.length > 0 && `(${myJobs.length})`}
              </button>
              <button
                type="button"
                onClick={() => setModalTab("create")}
                className={`py-2.5 px-4 text-[13px] font-bold border-b-2 transition-all cursor-pointer ${modalTab === "create"
                  ? "border-[#6E9625] text-[#6E9625]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
              >
                Quick Create Job
              </button>
            </div>

            {/* Tab 1: Select Existing Job */}
            {modalTab === "select" && (
              <div>
                {loadingMyJobs ? (
                  <div className="py-10 text-center text-[13px] text-gray-400 animate-pulse">
                    Loading your posted jobs...
                  </div>
                ) : myJobs.length === 0 ? (
                  <div className="py-8 text-center bg-[#F9FAFB] rounded-2xl p-5 border border-dashed border-gray-200">
                    <p className="text-[14px] font-bold text-[#1C2C1C] mb-1">No open jobs found</p>
                    <p className="text-[12px] text-gray-500 mb-4">
                      You don&apos;t have any active jobs posted yet. You can create one quickly below.
                    </p>
                    <button
                      type="button"
                      onClick={() => setModalTab("create")}
                      className="px-4 py-2 bg-[#6E9625] text-white rounded-xl text-[12px] font-bold hover:bg-[#5C7F1F] transition-colors cursor-pointer"
                    >
                      Create a Job Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Choose from your open jobs
                      </label>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {myJobs.map((j: any) => {
                          const jId = j.id || j._id;
                          const isSel = selectedJobIdToStart === jId;
                          return (
                            <div
                              key={jId}
                              onClick={() => setSelectedJobIdToStart(jId)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${isSel
                                ? "border-[#6E9625] bg-[#F4F7F1]/60 shadow-xs"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-[14px] font-bold text-[#1C2C1C] truncate">{j.title}</p>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  {j.status || "POSTED"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500">
                                {j.location && <span>📍 {j.location}</span>}
                                {j.budget && <span>💰 {j.budget}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => router.push("/customer-dashboard/post-job")}
                        className="text-[12px] font-bold text-[#6E9625] hover:underline"
                      >
                        + Post a full job with photos
                      </button>

                      <button
                        type="button"
                        onClick={handleStartExistingJob}
                        disabled={startingJob || !selectedJobIdToStart}
                        className="px-5 py-2.5 bg-[#6E9625] text-white rounded-xl text-[13px] font-bold hover:bg-[#5C7F1F] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {startingJob ? "Starting..." : "Start This Job"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Quick Create Job */}
            {modalTab === "create" && (
              <form onSubmit={handleQuickCreateAndStartJob} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bathroom Tiling Repair"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-[#1C2C1C] outline-none focus:border-[#6E9625] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Brief description of the work needed..."
                    value={quickDescription}
                    onChange={(e) => setQuickDescription(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-[#1C2C1C] outline-none focus:border-[#6E9625] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Location / Postcode
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lisbon / London"
                      value={quickLocation}
                      onChange={(e) => setQuickLocation(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-[#1C2C1C] outline-none focus:border-[#6E9625] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Estimated Budget
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. £250 or €300"
                      value={quickBudget}
                      onChange={(e) => setQuickBudget(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-[#1C2C1C] outline-none focus:border-[#6E9625] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/customer-dashboard/post-job")}
                    className="text-[12px] font-bold text-[#6E9625] hover:underline"
                  >
                    Post full job with photos →
                  </button>

                  <button
                    type="submit"
                    disabled={startingJob}
                    className="px-5 py-2.5 bg-[#6E9625] text-white rounded-xl text-[13px] font-bold hover:bg-[#5C7F1F] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {startingJob ? "Creating..." : "Create & Start Job"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {showDirectStartModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[18px] font-bold text-[#1C2C1C]">Start Direct Job</h3>
              <button onClick={() => setShowDirectStartModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleDirectJobStart} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kitchen Tap Repair"
                  value={directJobTitle}
                  onChange={(e) => setDirectJobTitle(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] focus:border-[#F59E0B] outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1">Agreed Price (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={directJobPrice}
                  onChange={(e) => setDirectJobPrice(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] focus:border-[#F59E0B] outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1">Notes / Scope (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Additional details..."
                  value={directJobNotes}
                  onChange={(e) => setDirectJobNotes(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] focus:border-[#F59E0B] outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingDirectJob}
                className="w-full py-3 bg-[#F59E0B] text-white rounded-xl font-bold hover:bg-[#D97706] transition-colors disabled:opacity-50"
              >
                {isSubmittingDirectJob ? "Starting..." : "Start Job"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[18px] font-bold text-[#1C2C1C]">Leave a Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleDirectJobReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-2 text-center">Rating</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={32}
                      className={`cursor-pointer ${reviewRating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      onClick={() => setReviewRating(star)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1">Review Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Excellent service"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] focus:border-[#16A34A] outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1">Comment</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] focus:border-[#16A34A] outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors disabled:opacity-50"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
