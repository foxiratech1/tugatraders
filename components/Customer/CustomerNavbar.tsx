"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Inbox, Briefcase, Heart, User, Star, Settings, Bell, FileText, Mail, LayoutDashboard } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { authApi } from "@/app/api/authApi";
import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/utils/auth";
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

  // Hook up socket for new notifications
  useSocket({
    onNewNotification: (notif) => {
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
    onNewMessage: () => {
      setInboxUnread((prev) => prev + 1);
    }
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
  const fetchNotifications = async () => {
    try {
      const res = await authApi.getMyNotifications();
      const notifList = res?.data || res || [];
      if (Array.isArray(notifList)) {
        setNotifications(notifList);
        const unread = notifList.filter((n: any) => !n.isRead && !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await authApi.markNotificationsReadAll();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
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

    const fetchBadges = async () => {
      try {
        const [dashRes, convRes] = await Promise.all([
          authApi.getCustomerDashboard(),
          authApi.getConversations()
        ]);
        const dashData = dashRes?.data || dashRes;
        if (dashData?.actionRequired) {
          const { activeJobsCount = 0, quotesAwaitingResponseCount = 0, unreviewedJobsCount = 0 } = dashData.actionRequired;
          setJobsUnread(activeJobsCount + quotesAwaitingResponseCount + unreviewedJobsCount);
        }
        const convos = convRes?.data || convRes || [];
        const unreadMsgs = convos.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
        setInboxUnread(unreadMsgs);
      } catch (err) {
        console.error("Failed to fetch badges", err);
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

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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
                  className={`
                  relative flex items-center gap-1.5 px-4 text-[13px] font-semibold
                  transition-all duration-200 whitespace-nowrap h-full group
                  ${isActive ? "text-[#1C2C1C]" : "text-[#1C2C1C]/60 hover:text-[#1C2C1C] hover:scale-[1.02]"}
                `}
                >
                  <Icon size={14} className={`transition-all duration-200 ${isActive ? "text-[#6E9625] scale-110" : "text-current group-hover:text-[#6E9625]"}`} />
                  <div className="flex items-center gap-1.5 relative">
                    {link.name}
                    {link.name === "Inbox" && inboxUnread > 0 && (
                      <span className="flex items-center justify-center min-w-[15px] h-[15px] px-1 bg-[#E53935] rounded-full text-[9px] font-bold text-white shadow-sm">
                        {inboxUnread > 99 ? "99+" : inboxUnread}
                      </span>
                    )}
                    {link.name === "Jobs" && jobsUnread > 0 && (
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
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
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
                          onClick={() => {
                            setShowNotifDropdown(false);
                            router.push(`/customer-dashboard/notifications?id=${n.id}`);
                          }}
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
