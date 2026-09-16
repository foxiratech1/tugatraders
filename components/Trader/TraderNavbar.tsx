"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Briefcase,
  Star,
  User,
  CreditCard,
  Bell,
  ChevronDown,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  BarChart3,
} from "lucide-react";
import { authApi, getRegistrationStatus } from "@/app/api/authApi";
import toast from "react-hot-toast";
import { clearTokens } from "@/utils/auth";
import { useSocket } from "@/hooks/useSocket";

// Nav links shown in desktop navbar
const desktopNavLinks = [
  { label: "Dashboard", href: "/trader", icon: LayoutDashboard },
  { label: "Inbox", href: "/trader/inbox", icon: Mail },
  { label: "Jobs & Leads", href: "/trader/jobs", icon: Briefcase },
  { label: "Quotes", href: "/trader/quote", icon: FileText },
  { label: "Reviews", href: "/trader/reviews", icon: Star },
  // { label: "Reports", href: "/trader/reports", icon: BarChart3 },
  { label: "Subscription & Billing", href: "/trader/billing", icon: CreditCard },
];

// All nav links shown in responsive mobile drawer
const mobileNavLinks = [
  { label: "Dashboard", href: "/trader", icon: LayoutDashboard },
  { label: "Inbox", href: "/trader/inbox", icon: Mail },
  { label: "Jobs & Leads", href: "/trader/jobs", icon: Briefcase },
  { label: "Quotes", href: "/trader/quote", icon: FileText },
  { label: "Reviews", href: "/trader/reviews", icon: Star },
  // { label: "Reports", href: "/trader/reports", icon: BarChart3 },
  { label: "Profile", href: "/trader/profile", icon: User },
  { label: "Subscription & Billing", href: "/trader/billing", icon: CreditCard },
  { label: "Settings", href: "/trader/settings", icon: Settings },
];

export default function TraderNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Profile state from API
  const [userName, setUserName] = useState("Loading...");
  const [userRole, setUserRole] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [traderStatus, setTraderStatus] = useState("PENDING");

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Hook up socket for new notifications
  useSocket({
    onNewNotification: (notif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    },
  });

  const NOTIF_STORAGE_KEY = "trader_read_notifications";

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
    setNotifOpen(false);

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
      router.push(`/trader/notifications?id=${n.id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    clearTokens();
    window.location.replace("/auth/login");
  };

  // Fetch profile & notifications on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getMyProfile();
        const profile = res?.data || res;

        setUserName(profile?.fullName || profile?.name || "Trader");

        // Show subscription tier as role badge
        const tier =
          profile?.traderProfile?.subscriptionTier ||
          profile?.subscriptionTier;

        setUserRole(
          tier
            ? `${tier.charAt(0)}${tier.slice(1).toLowerCase()} Member`
            : "Member"
        );

        // Avatar – use trader logo or profile image
        const avatar =
          profile?.traderProfile?.logo ||
          profile?.logo ||
          profile?.avatar ||
          profile?.profileImage;

        if (avatar) {
          const getImageUrl = (path: string) => {
            if (path.startsWith("http")) return path;

            const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
            const cleanPath = path.replace(/^\/+/, "");

            return `${base}/${cleanPath}`;
          };

          const imageUrl = getImageUrl(avatar);
          setUserAvatar(imageUrl);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setUserName("Trader");
      }
    };

    const fetchStatus = async () => {
      try {
        const res = await getRegistrationStatus();
        const unwrapped = res?.data || res;
        setTraderStatus(unwrapped?.verificationStatus ?? unwrapped?.status ?? "PENDING");
      } catch (e) {
        console.error("Failed to fetch status", e);
      }
    };

    fetchProfile();
    fetchStatus();
    fetchNotifications();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
    setNotifOpen(false);
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

  // Close dropdowns & mobile menu when clicking outside or pressing Escape
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (
        mobileOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest(".trader-mobile-toggle")
      ) {
        setMobileOpen(false);
      }
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setNotifOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    window.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/trader") return pathname === "/trader";
    return pathname.startsWith(href);
  };

  const isApproved = traderStatus === "APPROVED";

  const handleRestrictedNav = (e: React.MouseEvent, label: string) => {
    if (!isApproved && label !== "Profile") {
      e.preventDefault();
      toast.error("Complete your verification to access this feature.", {
        id: "trader-restricted-feature",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 font-sans">
      {/* ── Main navbar ─────────────────────────────────── */}
      <div className="bg-white border-b border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-2 sm:gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 self-center mr-1 sm:mr-4">
            <div className="relative h-9 w-[130px] sm:h-11 sm:w-[180px] md:h-12 md:w-[200px] overflow-hidden">
              <Image
                src="/TugaLogo.png"
                alt="TugaTrades Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop nav links (visible on xl and wider screens) */}
          <nav className="hidden xl:flex items-stretch h-full flex-1 gap-1 justify-center">
            {desktopNavLinks.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              const restricted = !isApproved && label !== "Profile";
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={(e) => handleRestrictedNav(e, label)}
                  className={`
                    relative flex items-center gap-1.5 px-3 text-[13px] font-semibold
                    transition-all duration-200 whitespace-nowrap h-full group
                    ${active ? "text-[#1C2C1C]" : "text-[#1C2C1C]/60 hover:text-[#1C2C1C] hover:scale-[1.02]"}
                    ${restricted ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                >
                  <Icon size={14} className={`transition-all duration-200 ${active ? "text-[#6E9625] scale-110" : "text-current group-hover:text-[#6E9625]"}`} />
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-[3px] rounded-t-full bg-[#6E9625] shadow-[0_-2px_8px_rgba(110,150,37,0.4)] animate-fade-in-up" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side controls */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Notification bell */}
            {isApproved && (
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => {
                    const nextState = !notifOpen;
                    setNotifOpen(nextState);
                    if (nextState && unreadCount > 0) {
                      handleMarkAllRead();
                    }
                  }}
                  className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#1C2C1C]/60 hover:bg-[#F5F5F5] hover:text-[#1C2C1C] transition-all hover:scale-105 active:scale-95"
                  aria-label="Notifications"
                >
                  <Bell size={22} className="sm:w-[24px] sm:h-[24px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] sm:text-[10px] text-white font-bold animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="fixed sm:absolute right-2 sm:right-0 top-[62px] sm:top-full mt-1 sm:mt-2 w-[calc(100vw-16px)] sm:w-96 max-w-[380px] bg-white/95 backdrop-blur-md border border-[#E5E5E5] rounded-2xl shadow-2xl py-3 z-50 overflow-hidden animate-fade-in-up">
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
                            className={`cursor-pointer px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-[#F5F5F5] transition-colors text-left ${!n.isRead && !n.read ? "bg-red-50" : ""
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
            )}

            {/* User info + avatar dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2.5 py-1 px-1.5 sm:px-2 rounded-lg hover:bg-[#F5F5F5] transition-all hover:scale-[1.01]"
                aria-label="User profile menu"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[12px] font-bold text-[#1C2C1C] leading-tight tracking-wide uppercase max-w-[120px] truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-[#6E9625] font-semibold leading-tight flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6E9625] animate-pulse" />
                    {userRole}
                  </p>
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#6E9625] flex-shrink-0 bg-[#1C2C1C] flex items-center justify-center shadow-sm hover:rotate-6 transition-transform">
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt={userName}
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-white font-bold text-[13px] sm:text-[14px]">
                      {userName.charAt(0)}
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-[#1C2C1C]/50 transition-transform duration-300 ${dropdownOpen ? "rotate-180 text-[#6E9625]" : ""}`}
                />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 sm:w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#E5E5E5] overflow-hidden z-50 py-1.5 animate-fade-in-up">
                  <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                    <p className="font-bold text-[13px] text-[#1C2C1C] truncate uppercase">
                      {userName}
                    </p>
                    <p className="text-[11px] text-[#6E9625] font-semibold">
                      {userRole}
                    </p>
                  </div>

                  <Link
                    href="/trader/profile"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#1C2C1C] hover:bg-[#F5F5F5] transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={14} className="text-[#6E9625]" />
                    My Profile
                  </Link>
                  {isApproved && (
                    <>
                      <Link
                        href="/trader/settings"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#1C2C1C] hover:bg-[#F5F5F5] transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings size={14} className="text-[#6E9625]" />
                        Settings
                      </Link>
                      <Link
                        href="/trader/billing"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#1C2C1C] hover:bg-[#F5F5F5] transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <CreditCard size={14} className="text-[#6E9625]" />
                        Subscription & Billing
                      </Link>
                    </>
                  )}
                  <div className="border-t border-[#E5E5E5] my-1" />
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile / Responsive hamburger toggle button (visible below xl breakpoint) */}
            <button
              className="trader-mobile-toggle xl:hidden relative p-1.5 sm:p-2 rounded-lg text-[#1C2C1C] hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Responsive Mobile Navigation Drawer (Overlay + Menu) ── */}
      {mobileOpen && (
        <div className="xl:hidden">
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 top-[60px] bg-black/40 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Container (Scrollable on small mobile heights) */}
          <div
            ref={mobileMenuRef}
            className="fixed top-[60px] left-0 right-0 max-h-[calc(100vh-60px)] bg-white border-b border-[#E5E5E5] shadow-2xl z-50 overflow-y-auto transition-all animate-in slide-in-from-top duration-200 flex flex-col"
          >
            {/* User Profile Header in Mobile Drawer */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#6E9625] flex-shrink-0 bg-[#1C2C1C] flex items-center justify-center shadow-sm">
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt={userName}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-white font-bold text-[14px]">
                      {userName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-bold text-[#1C2C1C] truncate uppercase">
                    {userName}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[#6E9625] font-semibold truncate">
                      {userRole}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isApproved
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {traderStatus}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/trader/profile"
                onClick={() => setMobileOpen(false)}
                className="text-[12px] font-semibold text-[#6E9625] bg-[#6E9625]/10 hover:bg-[#6E9625]/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
              >
                View Profile
              </Link>
            </div>

            {/* All Menus in Mobile Navigation Links */}
            <nav className="p-3 space-y-1">
              {mobileNavLinks.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                const restricted = !isApproved && label !== "Profile";
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={(e) => {
                      handleRestrictedNav(e, label);
                      if (isApproved || label === "Profile") {
                        setMobileOpen(false);
                      }
                    }}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-medium transition-all
                      ${active
                        ? "bg-[#6E9625]/10 text-[#6E9625] font-semibold shadow-xs"
                        : "text-[#1C2C1C]/80 hover:bg-gray-50 hover:text-[#1C2C1C]"
                      }
                      ${restricted ? "opacity-60 cursor-not-allowed" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={active ? "text-[#6E9625]" : "text-gray-500"}
                      />
                      <span>{label}</span>
                    </div>

                    {restricted && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
                        Pending
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Drawer Footer with Logout */}
            <div className="p-3 mt-auto border-t border-gray-100 bg-gray-50/60">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
