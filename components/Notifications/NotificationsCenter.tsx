"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/app/api/authApi";
import { Bell, MessageSquare, AlertCircle, MoreVertical } from "lucide-react";

function NotificationsCenterContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchNotifications = async () => {
    try {
      const res = await authApi.getMyNotifications();
      const notifList = res?.data || res || [];
      if (Array.isArray(notifList)) {
        setNotifications(notifList);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (highlightId && notifications.length > 0) {
      const index = notifications.findIndex((n) => String(n.id) === highlightId);
      if (index !== -1) {
        const page = Math.floor(index / ITEMS_PER_PAGE) + 1;
        setCurrentPage(page);

        // Also mark it as read automatically if it's highlighted
        if (!notifications[index].isRead && !notifications[index].read) {
          toggleReadStatus(notifications[index].id, true);
        }
      }
    }
  }, [highlightId, notifications]);

  const handleMarkAllRead = async () => {
    try {
      await authApi.markNotificationsReadAll();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const toggleReadStatus = (id: string | number, currentIsUnread: boolean) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: currentIsUnread, read: currentIsUnread } : n
      )
    );
  };

  const getIconAndColors = (title: string, type: string) => {
    const t = (title || "").toLowerCase();
    const typeStr = (type || "").toLowerCase();
    if (t.includes("quote") || typeStr.includes("quote")) {
      return {
        icon: <span className="font-bold text-[#6E9625]">$</span>,
        bg: "bg-[#6E9625]/10",
        text: "text-[#6E9625]",
      };
    } else if (t.includes("message") || typeStr.includes("message")) {
      return {
        icon: <MessageSquare size={16} className="text-gray-500" />,
        bg: "bg-gray-100",
        text: "text-gray-500",
      };
    } else if (t.includes("expir") || t.includes("alert") || typeStr.includes("alert")) {
      return {
        icon: <AlertCircle size={16} className="text-red-600" />,
        bg: "bg-red-50",
        text: "text-red-600",
      };
    }
    return {
      icon: <Bell size={16} className="text-[#6E9625]" />,
      bg: "bg-[#6E9625]/10",
      text: "text-[#6E9625]",
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6E9625]"></div>
      </div>
    );
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead && !n.read;
    return true;
  });

  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full max-w-[1280px] mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1C2C1C]">Notifications Center</h1>
          <p className="text-gray-500 mt-1">Stay updated with your latest business activity.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="text-[#6E9625] font-semibold hover:underline self-start sm:self-auto"
        >
          Mark all as read
        </button>
      </div>

      <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        <button
          onClick={() => { setFilter("ALL"); setCurrentPage(1); }}
          className={`pb-3 text-[14px] font-semibold border-b-2 transition-colors ${filter === "ALL" ? "border-[#6E9625] text-[#1C2C1C]" : "border-transparent text-gray-400 hover:text-[#1C2C1C]"
            }`}
        >
          All
        </button>
        <button
          onClick={() => { setFilter("UNREAD"); setCurrentPage(1); }}
          className={`pb-3 text-[14px] font-semibold border-b-2 transition-colors ${filter === "UNREAD" ? "border-[#6E9625] text-[#1C2C1C]" : "border-transparent text-gray-400 hover:text-[#1C2C1C]"
            }`}
        >
          Unread
        </button>
      </div>

      <div className="space-y-4">
        {paginatedNotifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No notifications found.</div>
        ) : (
          paginatedNotifications.map((n) => {
            const isUnread = !n.isRead && !n.read;
            const { icon, bg } = getIconAndColors(n.title, n.type);
            const isHighlighted = highlightId === String(n.id);

            return (
              <div
                key={n.id}
                id={`notification-${n.id}`}
                onClick={() => toggleReadStatus(n.id, isUnread)}
                className={`cursor-pointer relative flex items-start gap-4 p-5 rounded-2xl border transition-all ${isHighlighted ? "border-[#6E9625] shadow-md bg-white scale-[1.01]" : "border-gray-100 bg-white"
                  } ${isUnread && !isHighlighted ? "border-l-4 border-l-[#6E9625]" : "hover:border-gray-300"}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#1C2C1C] text-lg truncate">
                    {n.title || "Notification"}
                  </h3>
                  <p className="text-gray-600 mt-1 leading-relaxed">
                    {n.message || n.content || n.body}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(n.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    - {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Right Actions */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0 ml-4">
                  {isUnread ? (
                    <span className="text-xs font-bold text-[#6E9625]">Unread</span>
                  ) : (
                    <span className="text-xs text-gray-400">Read</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 0 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-[#1C2C1C] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-[#1C2C1C] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function NotificationsCenter() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-[#6E9625] rounded-full"></div></div>}>
      <NotificationsCenterContent />
    </Suspense>
  );
}
