"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MessageSquare, Star, ArrowRight, ShieldCheck } from "lucide-react";
import { authApi } from "@/app/api/authApi";
import ChatWindow from "@/components/Chat/ChatWindow";
import { useSocket } from "@/hooks/useSocket";

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
  type?: string;
  lastMessage?: {
    message?: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount?: number;
  messages?: any[];
}

function TraderInboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [traderProfile, setTraderProfile] = useState<any>(null);

  // Load conversations and profile
  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Get profile to identify current trader ID & sidebar scores
      const profileRes = await authApi.getMyProfile();
      const profile = profileRes?.data || profileRes;
      if (profile?.id || profile?._id) {
        setCurrentUserId(profile.id || profile._id);
        setTraderProfile(profile);
      }

      // 2. Get active chats
      const convsRes = await authApi.getConversations();
      const list = convsRes?.data || convsRes || [];
      if (Array.isArray(list)) {
        const mappedList = list.map((c: any) => {
          // Derive lastMessage from the messages array if not already present
          const latestMsg = c.messages?.[0];
          return {
            ...c,
            id: c.id || c._id,
            lastMessage: c.lastMessage || (latestMsg ? {
              message: latestMsg.message,
              createdAt: latestMsg.createdAt,
              senderId: latestMsg.senderId,
            } : undefined),
          };
        });
        setConversations(mappedList);
      }
    } catch (error) {
      console.error("Failed to load trader inbox data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Connect to global socket events for list changes
  const { isConnected } = useSocket({
    onUserOnline: (data) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.add(data.userId);
        return next;
      });
    },
    onUserOffline: (data) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    },
    onNewMessage: (message) => {
      // Update dynamic last messages
      setConversations((prev) => {
        return prev.map((c) => {
          const match = c.id === message.conversationId || c.id === message.conversation;
          if (match) {
            return {
              ...c,
              lastMessage: {
                message: message.message,
                createdAt: message.createdAt,
                senderId: message.senderId,
              },
              unreadCount: activeConversationId === c.id ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        });
      });
    },
  });

  const handleSelectConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
    router.push(`/trader/inbox?conversationId=${id}`);
  };

  // Filter list by partner's name (which is the customer for traders)
  const filteredConversations = conversations.filter((c) => {
    const partnerName = c.customer?.fullName || c.trader?.fullName || "";
    return partnerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return date.toLocaleDateString([], { day: "numeric", month: "short" });
    } catch (e) {
      return "";
    }
  };

  // Helper to build a proper image URL, avoiding double-slash issues
  const getImageUrl = (path?: string | null): string | null => {
    if (!path) return "/avt.png";
    if (path.startsWith("http")) return path;
    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");
    return `${base}/${cleanPath}`;
  };

  return (
    <div className="flex-1 flex bg-[#F8F9F5] p-4 sm:p-6 h-[calc(100vh-60px)] overflow-hidden">
      <div className="flex-1 flex gap-6 max-w-[1400px] mx-auto w-full h-full overflow-hidden">

        {/* Left Sidebar Layout */}
        <div className="w-[340px] flex flex-col gap-5 h-full flex-shrink-0">

          {/* Sidebar - Recent Chats */}
          <div className="flex-1 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-0">
            {/* Sidebar Header */}
            <div className="p-5 pb-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold text-[#1C2C1C]">Recent Chats</h2>
                {/* <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isConnected ? "bg-emerald-50 text-emerald-700" : "bg-gray-150 text-gray-500"}`}>
                  {isConnected ? "Connected" : "Reconnecting"}
                </span> */}
              </div>

              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-[13px] text-[#1C2C1C] outline-none focus:border-[#6E9625] transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {loading ? (
                <div className="py-8 text-center text-[13px] text-gray-400 animate-pulse">
                  Loading chats...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-gray-400 p-4">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-30 text-gray-400" />
                  <p className="text-[13px]">No active conversations found</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredConversations.map((c) => {
                    const isSelected = c.id === activeConversationId;
                    let partner: any = c.customer || c.trader;
                    if (c.customer && (c.customer.id === currentUserId || c.customer._id === currentUserId)) {
                      partner = c.trader;
                    } else if (c.trader && (c.trader.id === currentUserId || c.trader._id === currentUserId)) {
                      partner = c.customer;
                    }
                    const partnerId = partner?.id || partner?._id || "";
                    const isOnline = onlineUsers.has(partnerId);

                    return (
                      <div
                        key={c.id}
                        onClick={() => handleSelectConversation(c.id)}
                        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${isSelected
                          ? "bg-[#6E9625] text-white shadow-sm"
                          : "hover:bg-[#F9FAFB] border border-transparent text-[#1C2C1C]"
                          }`}
                      >
                        {/* Partner Avatar */}
                        <div className="relative w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-[14px] overflow-hidden flex-shrink-0">
                          {getImageUrl(partner?.profileImage) ? (
                            <img
                              src={getImageUrl(partner?.profileImage)!}
                              alt={partner?.fullName || ""}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            partner?.fullName?.charAt(0) || "U"
                          )}
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#4CAF50] border-2 border-white rounded-full" />
                          )}
                        </div>

                        {/* Snippets */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-[13px] font-bold truncate ${isSelected ? "text-white" : "text-[#1C2C1C]"}`}>
                              {partner?.fullName}
                            </p>
                            <span className={`text-[10px] ${isSelected ? "text-emerald-100" : "text-gray-400"}`}>
                              {formatMessageTime(c.lastMessage?.createdAt)}
                            </span>
                          </div>
                          <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-emerald-50" : "text-gray-500"}`}>
                            {(() => {
                              const lm = c.lastMessage || (c as any).latestMessage || (c as any).recentMessage || (c as any).messages?.[0] || (c as any).message;
                              if (!lm) return "";
                              if (typeof lm === 'string') return lm;
                              return lm.message || lm.text || lm.content || (lm.attachment || lm.attachments?.length ? "Sent an attachment" : "Sent a message");
                            })()}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {(c.unreadCount || 0) > 0 && !isSelected && (
                          <span className="w-5 h-5 bg-[#6E9625] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Profile score card (matches the figma design layout at bottom left) */}
          <div className="bg-[#1C2C1C] text-white rounded-3xl p-4.5 border border-gray-900 shadow-sm flex-shrink-0 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#6E9625] tracking-wider block mb-1">profile score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-extrabold leading-none">156</span>
                <span className="text-[12px] text-gray-400 font-semibold">/ 18%</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 bg-black/10 px-2 py-0.5 rounded-full border border-white/5 w-fit">
                <Star size={10} fill="#F59E0B" className="text-[#F59E0B]" />
                <span className="text-[11px] font-bold">4.8</span>
                <span className="text-[10px] text-gray-400">12 reviews</span>
              </div>
            </div>

            {/* Micro circle animation visualization */}
            <div className="relative w-14 h-14 rounded-full border-4 border-gray-800 flex items-center justify-center">
              <svg className="absolute -rotate-90 w-full h-full">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#6E9625"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="125"
                  strokeDashoffset="25"
                  className="translate-x-[2px] translate-y-[2px]"
                />
              </svg>
              <span className="text-[11px] font-bold">18%</span>
            </div>
          </div>

        </div>

        {/* Chat window workspace */}
        <div className="flex-1 h-full overflow-hidden flex flex-col">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={currentUserId}
              onRefreshConversations={loadData}
              isTraderView={true}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm h-full">
              <div className="w-20 h-20 bg-[#F0F9F1] rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={32} className="text-[#6E9625]" />
              </div>
              <h3 className="text-[20px] font-bold text-[#1C2C1C] mb-2">Select a Conversation</h3>
              <p className="text-gray-500 text-[13px] max-w-sm">
                Choose a conversation from your list to message customers, coordinate services, and finalize job requirements.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function TraderInboxPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F0EDE8]">
        <p className="text-gray-400 animate-pulse text-[14px]">Loading messages...</p>
      </div>
    }>
      <TraderInboxContent />
    </Suspense>
  );
}
