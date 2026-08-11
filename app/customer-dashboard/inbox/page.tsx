"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MessageSquare, Plus, Check } from "lucide-react";
import { authApi } from "@/app/api/authApi";
import ChatWindow from "@/components/Chat/ChatWindow";
import CustomerChatSidebar from "@/components/Chat/CustomerChatSidebar";
import { useSocket } from "@/hooks/useSocket";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  let imagePath = path.startsWith('/') ? path : `/${path}`;
  imagePath = imagePath.replace(/\/\//g, '/'); // remove any double slashes inside the path

  return `${baseUrl}${imagePath}`;
}

interface Conversation {
  id: string;
  _id?: string;
  traderId: string;
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
  lastMessage?: {
    message?: string;
    text?: string;
    content?: string;
    attachment?: string;
    attachments?: any[];
    createdAt: string;
    senderId: string;
  };
  unreadCount?: number;
}

function ChatDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get("conversationId");
  const fallbackJobId = searchParams.get("jobId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Load conversations and profile
  const loadData = async () => {
    try {
      setLoading(true);

      // 0. If traderId is passed, ensure a conversation exists
      const traderIdParam = searchParams.get("traderId");
      if (traderIdParam && !activeConversationId) {
        try {
          const newOrExisting = await authApi.getOrCreateConversation(traderIdParam, fallbackJobId || undefined);
          const convId = newOrExisting?.data?.id || newOrExisting?.data?._id || newOrExisting?.id || newOrExisting?._id;
          if (convId) {
            router.replace(`/customer-dashboard/inbox?conversationId=${convId}${fallbackJobId ? `&jobId=${fallbackJobId}` : ''}`);
          }
        } catch (e) {
          console.error("Failed to get/create conversation for trader", e);
        }
      }

      // 1. Get profile to identify current customer ID
      const profileRes = await authApi.getMyProfile();
      const profile = profileRes?.data || profileRes;
      if (profile?.id || profile?._id) {
        setCurrentUserId(profile.id || profile._id);
      }

      // 2. Get active chats
      const convsRes = await authApi.getConversations();
      const list = convsRes?.data || convsRes || [];
      if (Array.isArray(list)) {
        // Map to ensure conversation object is clean
        const mappedList = list.map((c: any) => ({
          ...c,
          id: c.id || c._id,
        }));
        setConversations(mappedList);
      }
    } catch (error) {
      console.error("Failed to load dashboard chat data:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializingRef = React.useRef(false);

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    loadData();
  }, []);

  // Set up root socket listeners for the sidebar changes (like other users coming online/offline)
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
      // Update the last message preview in the sidebar conversations list dynamically
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
    // Clear unread count locally when selecting
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
    let url = `/customer-dashboard/inbox?conversationId=${id}`;
    if (fallbackJobId && id === activeConversationId) {
      url += `&jobId=${fallbackJobId}`;
    }
    router.push(url);
  };

  // Filter conversations based on search text
  const filteredConversations = conversations.filter((c) =>
    c.trader?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="flex-1 flex bg-[#F9FAFB] p-6 mt-[60px] h-[calc(100vh-60px)] overflow-hidden">
      <div className="flex-1 flex gap-6 max-w-7xl mx-auto w-full h-full overflow-hidden">

        {/* Sidebar - Recent Chats */}
        <div className="w-[340px] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full flex-shrink-0">

          {/* Sidebar Header & Search */}
          <div className="p-5 pb-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-[#1C2C1C]">Recent Chats</h2>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isConnected ? "bg-emerald-50 text-emerald-700" : "bg-gray-150 text-gray-500"}`}>
                  {isConnected ? "Connected" : "Reconnecting"}
                </span>
              </div>
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

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {loading ? (
              <div className="py-8 text-center text-[13px] text-gray-400 animate-pulse">
                Loading chats...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-12 text-center text-gray-400 p-4">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30 text-gray-400" />
                <p className="text-[13px]">No active conversations found</p>
                <p className="text-[11px] text-gray-400 mt-1">Start chatting by selecting a trader from your quotes</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredConversations.map((c) => {
                  const isSelected = c.id === activeConversationId;
                  const isOnline = onlineUsers.has(c.trader?.id || "") || onlineUsers.has(c.trader?._id || "");

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectConversation(c.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${isSelected
                        ? "bg-[#6E9625] text-white shadow-sm"
                        : "hover:bg-[#F9FAFB] border border-transparent text-[#1C2C1C]"
                        }`}
                    >
                      {/* Avatar */}
                      <div className="relative w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-[14px] overflow-hidden flex-shrink-0">
                        {(() => {
                          const imgPath = c.trader?.profileImage || (c.trader as any)?.avatar || (c.trader as any)?.logo || (c.trader as any)?.traderProfile?.logo || (c.trader as any)?.traderProfile?.profileImage || (c.trader as any)?.traderProfile?.document || null;
                          const finalImgUrl = getImageUrl(imgPath);
                          return finalImgUrl ? (
                            <img
                              src={finalImgUrl}
                              alt={c.trader?.fullName || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            c.trader?.fullName?.charAt(0) || "U"
                          );
                        })()}
                        {/* Online Indicator */}
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#4CAF50] border-2 border-white rounded-full" />
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-[13px] font-bold truncate ${isSelected ? "text-white" : "text-[#1C2C1C]"}`}>
                            {c.trader?.fullName}
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

                      {/* Badges (Unread counts) */}
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

        {/* Main Content Area */}
        <div className="flex-1 h-full overflow-hidden flex flex-col">
          {selectedConversation ? (
            <div className="flex-1 flex gap-6 h-full overflow-hidden">
              <div className="flex-1 h-full overflow-hidden flex flex-col">
                <ChatWindow
                  conversation={selectedConversation}
                  currentUserId={currentUserId}
                  onRefreshConversations={loadData}
                  fallbackJobId={fallbackJobId || undefined}
                />
              </div>
              <CustomerChatSidebar
                jobId={selectedConversation.jobId || fallbackJobId || undefined}
                traderId={selectedConversation.traderId || selectedConversation.trader?.id}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm h-full">
              <div className="w-20 h-20 bg-[#F0F9F1] rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={32} className="text-[#6E9625]" />
              </div>
              <h3 className="text-[20px] font-bold text-[#1C2C1C] mb-2">Select a Conversation</h3>
              <p className="text-gray-500 text-[13px] max-w-sm">
                Choose a conversation from the sidebar to view quotes, send messages, and finalize your agreements.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function CustomerInboxPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <p className="text-gray-400 animate-pulse text-[14px]">Loading messages workspace...</p>
      </div>
    }>
      <ChatDashboardContent />
    </Suspense>
  );
}
