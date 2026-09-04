"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Inbox, Briefcase, Heart, User, Star, Settings, Bell, FileText, Mail, LayoutDashboard } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { authApi } from "@/app/api/authApi";
import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearTokens, getUser, getAccessToken, parseJwt } from "@/utils/auth";
import { useSocket } from "@/hooks/useSocket";

export default function CustomerNavbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [inboxUnread, setInboxUnread] = useState(0);
  const [jobsUnread, setJobsUnread] = useState(0);

  const getMyUserId = () => {
    if (profile?.id) return String(profile.id);
    if (profile?._id) return String(profile._id);
    const u = getUser();
    if (u?.id) return String(u.id);
    if (u?._id) return String(u._id);
    const token = getAccessToken();
    if (token) {
      const decoded = parseJwt(token);
      if (decoded?.id) return String(decoded.id);
      if (decoded?.userId) return String(decoded.userId);
      if (decoded?.user?.id) return String(decoded.user.id);
      if (decoded?._id) return String(decoded._id);
    }
    return null;
  };

  const fetchBadges = async () => {
    try {
      const [dashRes, convRes] = await Promise.all([
        authApi.getCustomerDashboard().catch(() => null),
        authApi.getConversations().catch(() => null),
      ]);
      const dashData = dashRes?.data || dashRes;
      if (dashData?.actionRequired) {
        const { activeJobsCount = 0, quotesAwaitingResponseCount = 0, unreviewedJobsCount = 0 } = dashData.actionRequired;
        setJobsUnread(activeJobsCount + quotesAwaitingResponseCount + unreviewedJobsCount);
      }
      const convos = convRes?.data || convRes || [];
      if (Array.isArray(convos)) {
        let activeConvId: string | null = null;
        if (typeof window !== "undefined" && window.location.pathname.includes("/inbox")) {
          const urlParams = new URLSearchParams(window.location.search);
          activeConvId = urlParams.get("conversationId");
        }
        const unreadMsgs = convos.reduce((acc: number, c: any) => {
          const cid = String(c.id || c._id);
          if (activeConvId && cid === String(activeConvId)) return acc;
          return acc + (c.unreadCount || 0);
        }, 0);
        setInboxUnread(unreadMsgs);
      }
    } catch (err) {
      console.error("Failed to fetch badges", err);
    }
  };

  // Hook up socket for new notifications
  useSocket({
    onNewNotification: (notif) => {
      const myId = getMyUserId();
      const senderId = notif?.senderId || notif?.sender?.id || notif?.sender?._id || notif?.actorId;
      if (myId && senderId && String(myId) === String(senderId)) {
        return;
      }
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    },
    onCustomerDashboardUpdate: (data) => {
      if (data?.actionRequired) {
        const { activeJobsCount = 0, quotesAwaitingResponseCount = 0, unreviewedJobsCount = 0 } = data.actionRequired;
        setJobsUnread(activeJobsCount + quotesAwaitingResponseCount + unreviewedJobsCount);
      }
    },
    onNewMessage: (message: any) => {
      const myId = getMyUserId();
      const senderId =
        message?.senderId ||
        message?.sender?.id ||
        message?.sender?._id ||
        message?.userId;

      // When the customer sends a message, DO NOT count it in inbox unread!
      if (myId && senderId && String(myId) === String(senderId)) {
        return;
      }
      if (message?.senderRole === "CUSTOMER" || message?.role === "CUSTOMER") {
        return;
      }

      // If user is currently looking at this conversation in /inbox, don't increment unread count
      if (typeof window !== "undefined" && window.location.pathname.includes("/inbox")) {
        const urlParams = new URLSearchParams(window.location.search);
        const activeConvId = urlParams.get("conversationId");
        const msgConvId = message?.conversationId || message?.conversation;
        if (activeConvId && msgConvId && String(activeConvId) === String(msgConvId)) {
          return;
        }
      }

      fetchBadges();
    },
  });

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout API error', err);
    }
    localStorage.removeItem('user');
    clearTokens();
    window.location.replace('/');
  };

  // Navigation items mapping
  const navLinks = [
    { name: "Dashboard", href: "/customer-dashboard/jobs", icon: LayoutDashboard },
    { name: "Inbox", href: "/customer-dashboard/inbox", icon: Inbox },
    { name: "Jobs", href: "/customer-dashboard/job-history", icon: Briefcase },
    // { name: "Quotes", href: "/customer-dashboard/quotes", icon: FileText },
    { name: "Saved", href: "/customer-dashboard/saved", icon: Heart },
    // { name: "Profile", href: "/customer-dashboard/profile", icon: User },
    { name: "Reviews", href: "/customer-dashboard/reviews", icon: Star },
    { name: "Setting", href: "/customer-dashboard/account", icon: Settings },
  ];
  const NOTIF_STORAGE_KEY = "customer_read_notifications";

  const isNotificationRead = (n: any, readIdSet: Set<string>) => {
    if (readIdSet.has(String(n.id))) return true;
    if (n.isRead === true || n.read === true || n.is_read === true || n.seen === true || n.isSeen === true) return true;
    if (typeof n.status === "string" && n.status.toUpperCase() === "READ") return true;
    if (n.readAt || n.read_at) return true;
    return false;
  };

  const fetchNotifications = async () => {
    try {
      const res = await authApi.getMyNotifications();
      const notifList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.notifications)
          ? res.data.notifications
          : Array.isArray(res?.data?.content)
            ? res.data.content
            : Array.isArray(res?.notifications)
              ? res.notifications
              : Array.isArray(res)
                ? res
                : [];

      let readIdSet = new Set<string>();
      try {
        const stored = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || "[]");
        if (Array.isArray(stored)) {
          readIdSet = new Set(stored.map(String));
        }
      } catch (e) {}

      setNotifications(
        notifList.map((n: any) => {
          const isRead = isNotificationRead(n, readIdSet);
          return { ...n, isRead, read: isRead };
        })
      );

      const unread = notifList.filter((n: any) => !isNotificationRead(n, readIdSet)).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, read: true, is_read: true }))
    );
    setUnreadCount(0);

    try {
      const stored = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || "[]");
      const currentIds = notifications.map((n: any) => String(n.id));
      const merged = Array.from(new Set([...(Array.isArray(stored) ? stored : []), ...currentIds]));
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.error("Failed to save read notifications to localStorage", e);
    }

    try {
      await authApi.markNotificationsReadAll();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNotificationClick = async (n: any) => {
    setShowNotifDropdown(false);

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === n.id ? { ...item, isRead: true, read: true, is_read: true } : item
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const stored = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || "[]");
      const list = Array.isArray(stored) ? stored : [];
      if (!list.includes(String(n.id))) {
        list.push(String(n.id));
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list));
      }
    } catch (e) {}

    authApi.markNotificationRead(n.id).catch(() => {});

    const targetUrl = n.actionUrl || n.link || n.url;
    if (targetUrl) {
      router.push(targetUrl);
    } else {
      router.push(`/customer-dashboard/notifications?id=${n.id}`);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authApi.getMyProfile();
        setProfile(res?.data || res);
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };

    loadProfile();
    fetchNotifications();
    fetchBadges();

    const handleOutsideClick = (e: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    const handleUnreadUpdate = (e: any) => {
      if (typeof e?.detail === "number") {
        setInboxUnread(e.detail);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("inbox_unread_updated", handleUnreadUpdate);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("inbox_unread_updated", handleUnreadUpdate);
    };
  }, []);

  useEffect(() => {
    if (!pathname?.includes("/inbox")) {
      fetchBadges();
    }
  }, [pathname]);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "Customer")}&background=1d3321&color=fff&bold=true`;
  const imageUrl = profile?.profileImage
    ? new URL(
      profile.profileImage,
      process.env.NEXT_PUBLIC_API_URL
    ).toString()
    : fallbackAvatar;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 font-sans">
      <div className="bg-white border-b border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-stretch gap-4">

          {/* Left: Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 self-center mr-4">
            <div className="relative h-12 w-[200px] sm:h-[50px] sm:w-[220px] overflow-hidden">
              <Image
                src="/TugaLogo.png"
                alt="TugaTrades Customer Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Middle: Navigation */}
          <nav className="hidden lg:flex items-stretch h-full flex-1 justify-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    if (link.name === "Inbox") setInboxUnread(0);
                    if (link.name === "Jobs") setJobsUnread(0);
                  }}
                  className={`
                  relative flex items-center gap-1.5 px-4 text-[13px] font-semibold
                  transition-all duration-200 whitespace-nowrap h-full group
                  ${isActive ? "text-[#1C2C1C]" : "text-[#1C2C1C]/60 hover:text-[#1C2C1C] hover:scale-[1.02]"}
                `}
                >
                  <Icon size={14} className={`transition-all duration-200 ${isActive ? "text-[#6E9625] scale-110" : "text-current group-hover:text-[#6E9625]"}`} />
                  <div className="flex items-center gap-1.5 relative">
                    {link.name}
                    {link.name === "Inbox" && inboxUnread > 0 && !isActive && (
                      <span className="flex items-center justify-center min-w-[15px] h-[15px] px-1 bg-[#E53935] rounded-full text-[9px] font-bold text-white shadow-sm">
                        {inboxUnread > 99 ? "99+" : inboxUnread}
                      </span>
                    )}
                    {link.name === "Jobs" && jobsUnread > 0 && !isActive && (
                      <span className="flex items-center justify-center min-w-[15px] h-[15px] px-1 bg-[#E53935] rounded-full text-[9px] font-bold text-white shadow-sm">
                        {jobsUnread > 99 ? "99+" : jobsUnread}
                      </span>
                    )}
                  </div>
                  {/* Active underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[3px] rounded-t-full bg-[#6E9625] shadow-[0_-2px_8px_rgba(110,150,37,0.4)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions & User Profile */}
          <div className="ml-auto flex items-center gap-4 self-center">

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => {
                  const nextState = !showNotifDropdown;
                  setShowNotifDropdown(nextState);
                  if (nextState && unreadCount > 0) {
                    handleMarkAllRead();
                  }
                }}
                className="relative p-2 flex items-center justify-center text-[#555555] hover:text-[#1C2C1C] transition-colors"
              >
                <Bell size={22} strokeWidth={2.5} />
                {/* Notification Dot */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F43F5E] flex items-center justify-center text-[10px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl py-3 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                    <span className="font-bold text-[14px] text-[#1C2C1C]">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[12px] font-semibold text-[#6E9625] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-[13px]">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`cursor-pointer px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!n.isRead && !n.read ? "bg-[#6E9625]/5" : ""
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-[13px] text-[#1C2C1C] break-words">
                              {n.title || "Notification"}
                            </span>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                          <p className="text-[12px] text-gray-600 mt-1 leading-relaxed break-words">
                            {n.message || n.content || n.body}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="w-[1px] h-8 bg-[#E5E5E5] hidden sm:block" />

            {/* User Profile Info */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={profile?.fullName || "User"}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <div className="hidden sm:flex flex-col">
                  <span className="text-[13px] font-black text-[#1C2C1C] leading-tight">
                    {profile?.fullName?.toUpperCase() || "CUSTOMER"}
                  </span>

                  <span className="text-[12px] font-medium text-[#1C2C1C]/50 mt-0.5">
                    {profile?.role || "Customer"}
                  </span>
                </div>

                <ChevronDown size={16} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                  <Link
                    href="/customer-dashboard/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
