"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Star, MapPin, Calendar, DollarSign, Shield, ShieldCheck, Mail, Info, AlertTriangle, CheckCircle, Phone, X } from "lucide-react";
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
  jobId?: string;
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
  const job = conversation.job;
  const activeJobId = job?.id || job?._id || conversation.jobId || fallbackJobId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false);
  const [isCloseJobModalOpen, setIsCloseJobModalOpen] = useState(false);
  const [reportType, setReportType] = useState("TRADER_PROFILE");
  const [reportReason, setReportReason] = useState("SPAM");
  const [customReason, setCustomReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const [jobStatus, setJobStatus] = useState<string | null>(job?.status || null);

  useEffect(() => {
    console.log("Conversation", conversation);
  }, [conversation]);

  // Load message history from REST API
  const loadMessageHistory = async () => {
    if (!conversationId) return;
    try {
      setLoadingMessages(true);
      const res = await authApi.getChatMessages(conversationId);
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

  // When activeJobId exists but jobStatus is not populated in the conversation object,
  // fetch the real job status directly from the API
  useEffect(() => {
    if (!activeJobId) return;
    // Only fetch if status is still unknown (null)
    if (jobStatus !== null) return;

    const fetchJobStatus = async () => {
      try {
        const res = await authApi.getCustomerJobById(activeJobId);
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
  }, [activeJobId]);

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
    if (!activeJobId) {
      toast.error("No job is linked to this conversation", { id: "job-action-error" });
      return;
    }

    try {
      setLoadingStartJob(true);
      await authApi.startJob(activeJobId);
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

  // Job Completion Action
  const handleJobComplete = async () => {
    if (!activeJobId) {
      toast.error("No job is linked to this conversation", { id: "job-action-error" });
      return;
    }

    try {
      setLoadingComplete(true);
      await authApi.completeJob(activeJobId);
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
    if (!activeJobId) {
      toast.error("No job is linked to this conversation", { id: "job-action-error" });
      return;
    }

    try {
      setLoadingClose(true);
      await authApi.closeJob(activeJobId, data);
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

  return (
    <>
      <div className="flex-1 flex overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[75vh]">
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
                      alt={partner?.fullName || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    partner?.fullName?.charAt(0) || "U"
                  );
                })()}
                {/* Online Dot overlay */}
                {/* <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isPartnerOnline ? "bg-[#4CAF50]" : "bg-gray-300"
                  }`}
              /> */}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#1C2C1C]">{partner?.fullName}</h3>
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

              {/* Job Actions — only shown when a job is linked to this conversation */}
              {(() => {
                // 🔒 No job linked → no buttons at all
                if (!activeJobId) return null;

                const status = jobStatus?.toUpperCase();
                const isInProgress = status === "IN_PROGRESS" || status === "ASSIGNED";
                const isCompleted = status === "COMPLETED";
                const isClosed = status === "CANCELLED" || status === "CLOSED";

                // Terminal states — show static badge
                if (isCompleted) {
                  return (
                    <span className="px-4 py-1.5 bg-[#6E9625] text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-xs">
                      <CheckCircle size={14} />
                      JOB COMPLETE
                    </span>
                  );
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
                    router.push(`/customer-dashboard/leave-review?jobId=${activeJobId}&traderId=${partnerId}&workCarriedOut=true&hideWorkCarriedOut=true`);
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
                    router.push(`/customer-dashboard/leave-review?jobId=${activeJobId}&traderId=${partnerId}&workCarriedOut=false&hideWorkCarriedOut=true`);
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
    </>

  );
}
