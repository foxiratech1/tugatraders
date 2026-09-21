"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Inbox,
  Briefcase,
  Heart,
  User,
  Star,
  Settings,
  Bell,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { authApi } from "@/app/api/authApi";
import { clearTokens, getUser, getAccessToken, parseJwt } from "@/utils/auth";
import { useSocket } from "@/hooks/useSocket";

export default function CustomerNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [inboxUnread, setInboxUnread] = useState(0);
  const [jobsUnread, setJobsUnread] = useState(0);
  const [actionRequiredData, setActionRequiredData] = useState<any>(null);
  const [inboxTotalUnread, setInboxTotalUnread] = useState(0);

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const processInboxData = (convos: any[]) => {
    let unreadMsgs = 0;
    convos.forEach((c) => {
      unreadMsgs += c.unreadCount || 0;
    });
    setInboxTotalUnread(unreadMsgs);
    setInboxUnread(unreadMsgs);
  };

  const processJobsData = (actionRequired: any) => {
    if (!actionRequired) return;
    setActionRequiredData(actionRequired);
    const { activeJobsCount = 0, quotesAwaitingResponseCount = 0, unreviewedJobsCount = 0 } = actionRequired;
    const total = activeJobsCount + quotesAwaitingResponseCount + unreviewedJobsCount;

    let seenState: any = {};
    if (typeof window !== "undefined") {
      try {
        seenState = JSON.parse(localStorage.getItem("customer_seen_jobs_state") || "{}");
      } catch (e) { }
    }

    let hasNew = false;
    const newSeenState = { ...seenState };

    if (activeJobsCount > (seenState.activeJobsCount || 0)) hasNew = true;
    else newSeenState.activeJobsCount = activeJobsCount;

    if (quotesAwaitingResponseCount > (seenState.quotesAwaitingResponseCount || 0)) hasNew = true;
    else newSeenState.quotesAwaitingResponseCount = quotesAwaitingResponseCount;

    if (unreviewedJobsCount > (seenState.unreviewedJobsCount || 0)) hasNew = true;
    else newSeenState.unreviewedJobsCount = unreviewedJobsCount;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("customer_seen_jobs_state", JSON.stringify(newSeenState));
      } catch (e) { }
    }

    if (hasNew) {
      setJobsUnread(total);
    } else {
      setJobsUnread(0);
    }
  };

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
        processJobsData(dashData.actionRequired);
      }
      const convos = convRes?.data || convRes || [];
      if (Array.isArray(convos)) {
        processInboxData(convos);
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
        processJobsData(data.actionRequired);
      }
    },
    onNewMessage: (message: any) => {
      const myId = getMyUserId();
      const senderId =
        message?.senderId ||
        message?.sender?.id ||
        message?.sender?._id ||
        message?.userId;

      if (myId && senderId && String(myId) === String(senderId)) {
        return;
      }
      if (message?.senderRole === "CUSTOMER" || message?.role === "CUSTOMER") {
        return;
      }

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

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout API error", err);
    }
    localStorage.removeItem("user");
    clearTokens();
    window.location.replace("/");
  };

  // Navigation items mapping
  const navLinks = [
    { name: "Dashboard", href: "/customer-dashboard/jobs", icon: LayoutDashboard },
    { name: "Inbox", href: "/customer-dashboard/inbox", icon: Inbox },
    { name: "Jobs", href: "/customer-dashboard/job-history", icon: Briefcase },
    { name: "Saved", href: "/customer-dashboard/saved", icon: Heart },
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
      } catch (e) { }

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
    setMobileOpen(false);

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
    } catch (e) { }

    authApi.markNotificationRead(n.id).catch(() => { });

    const targetUrl = n.actionUrl || n.link || n.url;
    if (targetUrl) {
      router.push(targetUrl);
    } else {
      router.push(`/customer-dashboard/notifications?id=${n.id}`);
    }
  };

  const handleNavClick = (linkName: string) => {
    setMobileOpen(false);
    if (linkName === "Inbox") {
      // Unread count is handled by the server state now. 
      // We don't reset it to 0 just by clicking the link, it resets when messages are actually read.
    }
    if (linkName === "Jobs") {
      setJobsUnread(0);
      if (actionRequiredData && typeof window !== "undefined") {
        try {
          const { activeJobsCount = 0, quotesAwaitingResponseCount = 0, unreviewedJobsCount = 0 } = actionRequiredData;
          const seenState = { activeJobsCount, quotesAwaitingResponseCount, unreviewedJobsCount };
          localStorage.setItem("customer_seen_jobs_state", JSON.stringify(seenState));
        } catch (e) { }
      }
    }
  };

  const isLinkActive = (href: string) => {
    if (pathname === href) return true;
    if (href === "/customer-dashboard/jobs") {
      return pathname === "/customer-dashboard/jobs" || pathname === "/customer-dashboard";
    }
    return pathname?.startsWith(href) ?? false;
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
      if (
        mobileOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest(".mobile-menu-toggle")
      ) {
        setMobileOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNotifDropdown(false);
        setShowDropdown(false);
        setMobileOpen(false);
      }
    };

    const handleUnreadUpdate = (e: any) => {
      if (typeof e?.detail === "number") {
        setInboxUnread(e.detail);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("inbox_unread_updated", handleUnreadUpdate);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("inbox_unread_updated", handleUnreadUpdate);
    };
  }, [mobileOpen]);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setShowDropdown(false);
    setShowNotifDropdown(false);
    if (!pathname?.includes("/inbox")) {
      fetchBadges();
    }
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "Customer")}&background=1d3321&color=fff&bold=true`;
  const imageUrl = profile?.profileImage
    ? new URL(
      profile.profileImage,
      process.env.NEXT_PUBLIC_API_URL
    ).toString()
    : fallbackAvatar;

  const totalBadges = inboxUnread + jobsUnread;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 font-sans">
      <div className="bg-white border-b border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-2 sm:gap-4">

          {/* Left: Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 self-center mr-1 sm:mr-4">
            <div className="relative h-9 w-[130px] sm:h-11 sm:w-[180px] md:h-12 md:w-[200px] overflow-hidden">
              <Image
                src="/TugaLogo.png"
                alt="TugaTrades Customer Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Middle: Desktop Navigation (hidden on mobile/tablet, visible on lg+) */}
          <nav className="hidden lg:flex items-stretch h-[60px] flex-1 justify-center gap-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => handleNavClick(link.name)}
                  className={`
                  relative flex items-center gap-1.5 px-3.5 text-[13px] font-semibold
                  transition-all duration-200 whitespace-nowrap h-full group
                  ${active ? "text-[#1C2C1C]" : "text-[#1C2C1C]/60 hover:text-[#1C2C1C] hover:scale-[1.02]"}
                `}
                >
                  <Icon
                    size={14}
                    className={`transition-all duration-200 ${active ? "text-[#6E9625] scale-110" : "text-current group-hover:text-[#6E9625]"}`}
                  />
                  <div className="flex items-center gap-1.5 relative">
                    {link.name}
                    {link.name === "Inbox" && inboxUnread > 0 && !active && (
                      <span className="flex items-center justify-center min-w-[15px] h-[15px] px-1 bg-[#E53935] rounded-full text-[9px] font-bold text-white shadow-sm">
                        {inboxUnread > 99 ? "99+" : inboxUnread}
                      </span>
                    )}
                    {link.name === "Jobs" && jobsUnread > 0 && !active && (
                      <span className="flex items-center justify-center min-w-[15px] h-[15px] px-1 bg-[#E53935] rounded-full text-[9px] font-bold text-white shadow-sm">
                        {jobsUnread > 99 ? "99+" : jobsUnread}
                      </span>
                    )}
                  </div>
                  {/* Active underline */}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-[3px] rounded-t-full bg-[#6E9625] shadow-[0_-2px_8px_rgba(110,150,37,0.4)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions & User Profile */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-3 flex-shrink-0">

            {/* Notification Bell with Responsive Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => {
                  const nextState = !showNotifDropdown;
                  setShowNotifDropdown(nextState);
                  if (nextState && unreadCount > 0) {
                    handleMarkAllRead();
                  }
                }}
                className="relative p-2 rounded-full flex items-center justify-center text-[#555555] hover:text-[#1C2C1C] hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={21} strokeWidth={2.3} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#F43F5E] flex items-center justify-center text-[10px] text-white font-bold leading-none animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="fixed sm:absolute right-2 sm:right-0 top-[62px] sm:top-full mt-1 sm:mt-2 w-[calc(100vw-16px)] sm:w-96 max-w-[380px] bg-white border border-gray-200 rounded-2xl shadow-2xl py-3 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 pb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#1C2C1C]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-[#6E9625]/10 text-[#6E9625] text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[12px] font-semibold text-[#6E9625] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[320px] sm:max-h-[380px] overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-gray-400 text-[13px]">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`cursor-pointer px-4 py-3 hover:bg-gray-50 transition-colors ${
                            !n.isRead && !n.read ? "bg-[#6E9625]/5" : ""
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
            <div className="w-[1px] h-6 sm:h-8 bg-[#E5E5E5] hidden sm:block" />

            {/* User Profile Dropdown Button */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 sm:px-2 rounded-lg hover:bg-gray-100 transition-colors group"
                aria-label="User menu"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-gray-200 border border-gray-200 flex-shrink-0">
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={profile?.fullName || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[12px] sm:text-[13px] font-bold text-[#1C2C1C] leading-tight line-clamp-1 max-w-[110px] md:max-w-[140px]">
                    {profile?.fullName || "Customer"}
                  </span>
                  <span className="text-[11px] font-medium text-[#1C2C1C]/50 capitalize leading-tight">
                    {profile?.role?.toLowerCase() || "customer"}
                  </span>
                </div>

                <ChevronDown
                  size={15}
                  className={`text-[#1C2C1C]/60 transition-transform duration-200 hidden sm:block ${
                    showDropdown ? "rotate-180 text-[#6E9625]" : ""
                  }`}
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                    <p className="font-bold text-[13px] text-[#1C2C1C] truncate">
                      {profile?.fullName || "Customer"}
                    </p>
                    <p className="text-[11px] text-gray-500 capitalize">
                      {profile?.role?.toLowerCase() || "customer"}
                    </p>
                  </div>

                  <Link
                    href="/customer-dashboard/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#1C2C1C] hover:bg-[#6E9625]/10 hover:text-[#6E9625] transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User size={15} />
                    Profile
                  </Link>

                  <Link
                    href="/customer-dashboard/account"
                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#1C2C1C] hover:bg-[#6E9625]/10 hover:text-[#6E9625] transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings size={15} />
                    Settings
                  </Link>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile / Tablet Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-menu-toggle lg:hidden relative p-2 rounded-lg text-[#1C2C1C] hover:bg-gray-100 transition-colors flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}

              {/* Red indicator on hamburger if unread inbox or jobs exist */}
              {!mobileOpen && totalBadges > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#E53935] ring-2 ring-white animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Menu (Overlay + Menu) */}
        {mobileOpen && (
          <div className="lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 top-[60px] bg-black/40 backdrop-blur-xs z-40 transition-opacity"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer Container */}
            <div
              ref={mobileMenuRef}
              className="fixed top-[60px] left-0 right-0 max-h-[calc(100vh-60px)] bg-white border-b border-gray-200 shadow-2xl z-50 overflow-y-auto transition-all animate-in slide-in-from-top duration-200 flex flex-col"
            >
              {/* User Profile Header in Mobile Drawer */}
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 border-2 border-[#6E9625] flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={profile?.fullName || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-bold text-[#1C2C1C] truncate">
                      {profile?.fullName || "Customer"}
                    </span>
                    <span className="text-[12px] text-gray-500 truncate">
                      {profile?.email || (profile?.role ? profile.role.toLowerCase() : "Customer")}
                    </span>
                  </div>
                </div>

                <Link
                  href="/customer-dashboard/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-[12px] font-semibold text-[#6E9625] bg-[#6E9625]/10 hover:bg-[#6E9625]/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  View Profile
                </Link>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="p-3 space-y-1">
                {navLinks.map((link) => {
                  const active = isLinkActive(link.href);
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => handleNavClick(link.name)}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-medium transition-all
                        ${active
                          ? "bg-[#6E9625]/10 text-[#6E9625] font-semibold shadow-xs"
                          : "text-gray-700 hover:bg-gray-50 hover:text-[#1C2C1C]"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={active ? "text-[#6E9625]" : "text-gray-500"}
                        />
                        <span>{link.name}</span>
                      </div>

                      {/* Unread Badges in Mobile Menu */}
                      {link.name === "Inbox" && inboxUnread > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[#E53935] rounded-full text-[11px] font-bold text-white shadow-xs">
                          {inboxUnread > 99 ? "99+" : inboxUnread}
                        </span>
                      )}
                      {link.name === "Jobs" && jobsUnread > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[#E53935] rounded-full text-[11px] font-bold text-white shadow-xs">
                          {jobsUnread > 99 ? "99+" : jobsUnread}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Footer with Logout */}
              <div className="p-3 mt-auto border-t border-gray-100 bg-gray-50/60">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

